# Python-Services Unification Progress

## Overview

Adapt the `llm_agent.py` pipeline to work through the FastAPI `/generate` endpoint, replacing the inline OpenAI call with a unified schema that supports all languages.

## Tickets

| # | Title | Status | Notes |
|---|-------|--------|-------|
| 1 | Python: Unified text-only generation via llm_agent | ✅ Done | Text fields mapped, llm_agent integrated, tests passing |
| 2 | Java: Adapt DTOs for new Python response schema | ✅ Done | Added `imageUrl`, `audioWordUrl`, `audioSentenceUrl` to `PythonCardResponse` record; wired them via setters in `GenerateService` |
| 3 | Python: Media pipeline (images + audio) | ✅ Done | Pexels image download + Edge-TTS audio integrated; StaticFiles mount for serving; tests passing |
| 4 | Java: Media persistence and serving endpoints | ✅ Done | Flyway V8 migration; entity fields replaced with byte[]; GenerateService downloads media from Python URLs; 3 media-serving endpoints added; compilation and context-load test passing |

---

## Ticket 1 — Unified text-only generation

### What was built

The `/generate` endpoint now delegates card generation to `llm_agent.gerar_flashcards_json()` instead of using an inline prompt with `openai.chat.completions.create`. Language-specific fields from `llm_agent.py`'s Pydantic models (hanzi/pinyin, palavra_en/ipa, etc.) are mapped into a single unified `CardResponse` schema.

### Files changed

| File | Change |
|------|--------|
| `python-services/modulos/llm_agent.py` | Added `mode` ("words"/"topic") and `difficulty_level` params to `gerar_flashcards_json()` |
| `python-services/main.py` | Replaced inline OpenAI call; added `_map_card_to_unified()`; added `image_url`, `audio_word_url`, `audio_sentence_url` to `CardResponse` (all `None` for now) |
| `python-services/tests/test_main.py` | New — 10 tests covering all 4 languages, error path, and mock fallback |

### Key decisions

- **`llm_agent.py` mode parameter**: The existing function expected comma-separated words. A new `mode="topic"` path skips per-word validation and changes the user prompt to `"Gere flashcards de vocabulário sobre o tópico: {topic}"`. The original `mode="words"` behavior is preserved.
- **OpenAI client unified**: Both `main.py` and `llm_agent.py` now use `client.beta.chat.completions.parse` (structured outputs). The old `openai.chat.completions.create` with `response_format={"type": "json_object"}` was removed.
- **Field mapping lives in `main.py`**: `_map_card_to_unified()` handles the language-specific dict → unified `CardResponse` conversion. The internal Pydantic models in `llm_agent.py` remain unchanged.
- **Japanese phonetic_reading**: Combined as `"{kana} ({romaji})"` per spec.

### Field mapping

| Unified field | Mandarin | English | French | Japanese |
|---------------|----------|---------|--------|----------|
| `target_word` | `hanzi` | `palavra_en` | `palavra_fr` | `kanji` |
| `phonetic_reading` | `pinyin` | `ipa_pronuncia` | `ipa_pronuncia` | `kana (romaji)` |
| `native_translation` | `traducao_pt` | `traducao_pt` | `traducao_pt` | `traducao_pt` |
| `part_of_speech` | `classe_gramatical` | `classe_gramatical` | `classe_gramatical` | `classe_gramatical` |
| `target_sentence` | `frase_exemplo_hanzi` | `frase_exemplo_en` | `frase_exemplo_fr` | `frase_exemplo_jp` |
| `sentence_phonetic` | `frase_exemplo_pinyin` | `None` | `None` | `None` |
| `sentence_translation` | `frase_exemplo_traducao` | `frase_exemplo_traducao` | `frase_exemplo_traducao` | `frase_exemplo_traducao` |

### Test results

```
tests/test_main.py ..........
10 passed in 0.89s
```

### Dependencies added

- `pytest` and `httpx` (test deps, installed into `.venv`)

---

## Ticket 2 — Java: Adapt DTOs/service for new Python schema

### What was built

Updated the Java DTO and service to consume the three new media URL fields (`image_url`, `audio_word_url`, `audio_sentence_url`) that the Python `/generate` endpoint will return once ticket 03 lands. The text fields from ticket 01 map 1:1 with no changes needed.

### Files changed

| File | Change |
|------|--------|
| `backend/src/main/java/com/projflashcards/backend/dto/PythonDeckResponse.java` | Added `imageUrl`, `audioWordUrl`, `audioSentenceUrl` (all `String`) to the `PythonCardResponse` record with `@JsonProperty` snake-case mappings |
| `backend/src/main/java/com/projflashcards/backend/service/GenerateService.java` | After constructing the `Flashcard` entity, now calls `setImageUrl(c.imageUrl())`, `setAudioWordUrl(c.audioWordUrl())`, `setAudioSentenceUrl(c.audioSentenceUrl())` before persisting |

### Key decisions

- **Setters over constructor change**: The `Flashcard` entity already had `imageUrl`, `audioWordUrl`, `audioSentenceUrl` fields with setters but no constructor parameters. Rather than changing the constructor signature (which would require updating a second call site in `FlashcardService.java`), the three fields are set via setters after construction. This keeps the change minimal and avoids touching the `FlashcardService` flow.
- **Forward-compatible**: The new `PythonCardResponse` fields default to `null` coming from Python until the media pipeline is wired (ticket 03). The setters will silently set `null`, which is already the default column value. Once Python returns real URLs (ticket 04), the same code path will pass them through automatically.
- **No new constructor or overload**: The existing 8-arg constructor (`Deck` + 7 text fields) remains unchanged. The `imageUrl`/`audioWordUrl`/`audioSentenceUrl` columns in the entity are populated purely through setters, following the existing pattern used elsewhere in the codebase.

### Smoke test results

The full end-to-end flow was exercised against the live Neon database and a built Docker stack:

1. **Backend built** via `docker build -t backend-flashcards ./backend` — multi-stage Maven build succeeded
2. **Python service built** via `docker build -t python-services-flashcards ./python-services` — pip install + uvicorn startup succeeded
3. **Both containers started** on a shared Docker network (`karta-network`), backend at `:8080`, python at `:8000`
4. **Admin user seeded** via `POST /users` + `psql` role upgrade to `ROLE_ADMIN`
5. **Smoke test**: `POST /decks/generate` with `{"topic":"animals","language":"english","difficultyLevel":"BEGINNER"}`

**Result:** ✅ HTTP 201 — 25 flashcards persisted with all text fields populated (target word, IPA, translation, part of speech, example sentence, sentence translation). Verified via `GET /decks/3/flashcards`:

```json
[
  {"id":4,"targetWord":"cat","phoneticReading":"/kæt/","nativeTranslation":"gato","partOfSpeech":"n.","targetSentence":"The cat sleeps on the sofa","sentenceTranslation":"O gato dorme no sofá"},
  {"id":5,"targetWord":"dog","phoneticReading":"/dɔɡ/","nativeTranslation":"cachorro","partOfSpeech":"n.","targetSentence":"The dog runs in the park","sentenceTranslation":"O cachorro corre no parque"},
  ...
]
```

`image_url`, `audio_word_url`, `audio_sentence_url` confirmed `null` in the database (expected — Python media pipeline not yet wired):

```
 id | target_word | image_url | audio_word_url | audio_sentence_url
----+-------------+-----------+----------------+--------------------
  4 | cat         |           |                |
  5 | dog         |           |                |
  6 | bird        |           |                |
```

**Note:** The Python `/generate` endpoint expects language names in Portuguese (`english`, `mandarin`, `french`) rather than ISO codes (`en`). The first attempt with `"language":"en"` returned a 502 from Python; switching to `"language":"english"` resolved it.

---

## Ticket 3 — Python: Media pipeline (images + audio)

### What was built

Extended the `/generate` flow to fetch images from Pexels and generate TTS audio via Edge-TTS for each card. Media files are saved to a temporary directory served by FastAPI's `StaticFiles` mount at `/media`. The response now includes `image_url`, `audio_word_url`, and `audio_sentence_url` as absolute URLs pointing to the temporary media files.

### Files changed

| File | Change |
|------|--------|
| `python-services/modulos/buscador_imagens.py` | Added `baixar_imagem_para_arquivo()` — searches Pexels, downloads first image bytes to the specified path, returns `True`/`False` |
| `python-services/modulos/gerador_audio.py` | Added optional `diretorio` parameter to `gerar_audio_local()` (defaults to `"media_temp"` for backward compat); creates dir if missing |
| `python-services/main.py` | Mounted `StaticFiles` at `/media` on a `tempfile.mkdtemp()` dir; added `_attach_media()` to orchestrate per-card image/audio generation using UUID filenames; accepts `Request` to construct absolute media URLs |
| `python-services/tests/test_main.py` | Added `@patch` mocks for `baixar_imagem_para_arquivo` and `gerar_audio_local` on all existing tests; added 4 new tests: media success, image failure, audio failure, and `termo_busca_imagem_en` fallback to `target_word` |

### Key decisions

- **`baixar_imagem_para_arquivo` as a new function**: Rather than modifying the existing `buscar_url_imagem` (which returns an `<img>` HTML tag for Anki export), a parallel function downloads raw bytes to a file. The old function is untouched.
- **`gerador_audio.py` optional `diretorio`**: The `media_temp` default keeps the Anki `.apkg` flow working without changes.
- **`tempfile.mkdtemp` for media dir**: Auto-cleaned on container restart; no cleanup logic needed for a POC. Matches the spec ("acceptable for a POC").
- **Absolute URLs via `request.base_url`**: The returned URLs (e.g. `http://python-services:8000/media/<uuid>.jpg`) work from the Docker network without configuration.

### Test results

```
tests/test_main.py ..............
14 passed in 0.85s
```
