Status: ready-for-agent

# Python-Services Unification: Adapt llm_agent pipeline to FastAPI

## Problem Statement

The Python service has two disconnected code paths for flashcard generation:
- `main.py` — a simple FastAPI endpoint with a generic card schema, used by the Java backend
- `llm_agent.py` + `buscador_imagens.py` + `gerador_audio.py` + `gerador_apkg.py` — an older, richer pipeline with language-specific models, Pexels image search, TTS audio, and Anki `.apkg` export

Only the simple `main.py` path is wired to the Java backend. The richer pipeline is stranded — it produces `.apkg` files offline but is never called during the web flow. As a result, media (images, audio) are never generated for web flashcards, and the `image_url`, `audio_word_url`, `audio_sentence_url` columns in the database remain null.

## Solution

Adapt the `llm_agent.py` pipeline to work through the FastAPI `/generate` endpoint, replacing the current simple `CardResponse` with an enriched unified schema. The Python service will generate cards via LLM, fetch a representative image from Pexels, and synthesize TTS audio for both word and sentence — all during a single call. It returns text fields plus temporary media URLs; the Java backend downloads the media bytes and persists them directly in PostgreSQL.

## User Stories

1. As an admin generating a deck, I want the resulting flashcards to include an image representative of each word, so that visual learners can associate meaning with imagery.
2. As an admin generating a deck, I want the resulting flashcards to include pronunciation audio for both the target word and the example sentence, so that students can hear correct pronunciation.
3. As an admin generating a deck, I want the cards to use language-appropriate fields (e.g. pinyin for Mandarin, IPA for English) through a single unified response schema, so that no matter the language the data arrives in a predictable shape.
4. As a Java backend developer, I want the Python `/generate` endpoint to return temporary media URLs that I can download and persist, so that media is durably stored in PostgreSQL rather than depending on a running Python container.

## Implementation Decisions

### Python side (`python-services/`)

**Unified response schema** — a single `CardResponse` model replaces the current generic model and is used for all languages. Fields:

```
target_word: str              # hanzi for Mandarin, palavra for English/French, kanji for Japanese
phonetic_reading: str | null  # pinyin for Mandarin, IPA for English/French, kana+romaji for Japanese
native_translation: str       # Portuguese translation
part_of_speech: str | null    # grammatical class abbreviation (v., n., adj., etc.)
target_sentence: str | null   # example sentence in target language
sentence_phonetic: str | null # sentence-level reading (only expected for Mandarin)
sentence_translation: str | null
image_url: str | null         # temporary URL served by FastAPI for Java to download
audio_word_url: str | null
audio_sentence_url: str | null
```

The `tags` and `termo_busca_imagem_en` fields from `llm_agent.py` are dropped from the response — they are used internally by Python and not persisted.

**Flow within `/generate`:**
1. Receive `topic`, `language`, `difficultyLevel` from Java
2. Call `llm_agent.gerar_flashcards_json()` to get rich card data from OpenAI
3. For each card:
   a. Map language-specific fields into the unified schema
   b. Call `buscador_imagens.py` with the image search term to fetch a Pexels URL → download the image bytes
   c. Call `gerador_audio.py` to generate TTS for the target word and the example sentence
4. Save media files to a temporary directory served by FastAPI's `StaticFiles` mount
5. Return JSON with text fields + temporary `http://python-services:8000/media/<uuid>.png` URLs

**New dependency:** The `llm_agent.py` module currently uses `client.beta.chat.completions.parse` with model `gpt-5`. The existing `main.py` uses `openai.chat.completions.create` with model `gpt-4o-mini` and `response_format={"type": "json_object"}`. These should be unified during the refactor.

**FastAPI file serving:** Mount a `StaticFiles` handler at `/media` pointing at a temporary media directory inside the container. Media files are cleaned up after a TTL or on restart (acceptable for a POC).

### Java side (`backend/`) — downstream consequences

**Entity changes (`Flashcard.java`):**
- Replace `image_url` (varchar) → `image_data` (bytea)
- Replace `audio_word_url` (varchar) → `audio_word_data` (bytea)
- Replace `audio_sentence_url` (varchar) → `audio_sentence_data` (bytea)
- Add `image_mime_type` (varchar)

**Flyway migration** to apply the new columns.

**`GenerateService.java`:**
- After receiving the Python response, for each card:
  - HTTP-GET `image_url` → store raw bytes in `image_data`
  - HTTP-GET `audio_word_url` → store raw bytes in `audio_word_data`
  - HTTP-GET `audio_sentence_url` → store raw bytes in `audio_sentence_data`

**New endpoints:**
- `GET /flashcards/{id}/image` — serves `image_data` with `image_mime_type`
- `GET /flashcards/{id}/audio/word` — serves `audio_word_data` as `audio/mpeg`
- `GET /flashcards/{id}/audio/sentence` — serves `audio_sentence_data` as `audio/mpeg`

### `PythonDeckResponse.java` changes

Update the DTO to match the new Python response schema, adding the three URL fields.

## Testing Decisions

Focus on Python-side testing:

- **Test the FastAPI `/generate` endpoint** using FastAPI's `TestClient`
  - Mock the OpenAI call (return a fixed JSON response matching the llm_agent schema)
  - Mock Pexels image download
  - Mock Edge-TTS audio generation
  - Verify the response JSON matches the new unified schema
- **Test the field mapping logic** — verify that Mandarin data (hanzi, pinyin) and English data (palavra_en, ipa_pronuncia) correctly map to `target_word`, `phonetic_reading`, etc.
- **Test error paths** — what happens when the LLM returns malformed JSON, Pexels is down, or TTS fails

No testing on the Java side for this phase.

## Out of Scope

- Frontend changes to consume the new media endpoints
- `.env`/`.env.example` for `python-services` (tracked separately in TODO.md)
- Shared secret between Java and Python
- `/health` endpoint for python-services
- Removing the old `gerador_apkg.py` Anki export pipeline — it can coexist until the team decides to deprecate it
- Exposing the `python-services` port to the public internet

## Further Notes

- The `llm_agent.py` models (`MandarinFlashcard`, `EnglishFlashcard`, etc.) and their Pydantic validation should be retained internally — they are the contract between the LLM and Python. Only the FastAPI response to Java uses the unified schema.
- The existing `card.model_dump()` call in `llm_agent.py:178` returns dicts. The field mapping (e.g. `hanzi` → `target_word`) happens in the new endpoint handler, not inside `llm_agent.py`.
- ADR-0001 (`docs/adr/0001-media-storage.md`) documents the bytea storage decision and its rationale.
