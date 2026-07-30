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

---

## Ticket 4 — Java: Media persistence and serving endpoints

### What was built

Persists media bytes in PostgreSQL and serves them via dedicated endpoints — the final slice making the full pipeline work end-to-end.

The `GenerateService` now HTTP-GETs each `image_url`, `audio_word_url`, and `audio_sentence_url` from the Python service and stores the raw bytes as `byte[]` in the `Flashcard` entity. Three new endpoints serve the stored bytes with correct Content-Type headers.

### Files changed

| File | Change |
|------|--------|
| `backend/src/main/resources/db/migration/V8__add_media_data_columns.sql` | New — drops `image_url`, `audio_word_url`, `audio_sentence_url` (varchar); adds `image_data`, `audio_word_data`, `audio_sentence_data` (bytea) + `image_mime_type` (varchar) |
| `backend/src/main/java/.../model/Flashcard.java` | Replaced `String imageUrl`/`audioWordUrl`/`audioSentenceUrl` → `byte[] imageData`/`audioWordData`/`audioSentenceData` + `String imageMimeType`; updated getters/setters |
| `backend/src/main/java/.../service/GenerateService.java` | Changed from storing URL strings to HTTP-GETting media bytes; added `downloadMedia()` and `detectImageMimeType()` helpers; added logger |
| `backend/src/main/java/.../controller/FlashcardController.java` | Injected `FlashcardRepository`; added `GET /flashcards/{id}/image`, `GET /flashcards/{id}/audio/word`, `GET /flashcards/{id}/audio/sentence` |

### Key decisions

- **Media download failures are non-fatal**: If fetching an image or audio file fails (network error, Python 404, etc.), `downloadMedia` returns `null` and the card is persisted without that media. A warning is logged. This matches how the Python side handles Pexels/TTS failures — the card is still saved.
- **MIME type from URL extension**: The `detectImageMimeType` helper maps `.jpg`/`.jpeg` → `image/jpeg`, `.png` → `image/png`, etc. Audio is hardcoded as `audio/mpeg` (Edge-TTS output). Using the response Content-Type header would be more robust but requires a full `ResponseEntity<byte[]>` download; extension-based is simpler for a POC.
- **Repository injected into controller**: The three media endpoints bypass `FlashcardService` and call `FlashcardRepository.findById()` directly. This avoids adding entity-returning methods to the service layer. A minor layering trade-off (see code review below).
- **Flyway migration is destructive**: The old `image_url`/`audio_word_url`/`audio_sentence_url` columns are dropped (they contained nulls in all existing rows). If data preservation were needed, a multi-step migration would be required.

### Code review findings

Two-axis review against `HEAD` (pre-ticket-4 state) was run after implementation.

**Standards** (baseline smells, no repo-specific coding standards documented):

| Smell | Location | Detail |
|-------|----------|--------|
| Duplicated Code | `FlashcardController.java:55–99` | Three media endpoints are nearly identical — same find-by-id + null-check + build-response pattern. Extract into a single `getMedia(id, fieldExtractor, contentType)` helper. |
| Speculative Generality | `GenerateService.java:86–93` | `downloadMedia` catches `Exception` broadly and silently returns null on any failure. Transient network errors and genuine missing URLs both collapse into the same silent path. Consider catching specific exceptions (`HttpClientErrorException`, `ResourceAccessException`) separately. |
| Primitive Obsession | `GenerateService.java:96–104` | MIME type detection is an if-cascade on file-extension strings. Extract to a `Map<String, String>` lookup or a dedicated utility class. |

**Spec** (against `.scratch/python-services-unification/issues/04-java-media-persistence.md`):

| Finding | Detail |
|---------|--------|
| ✅ All requirements implemented | Flyway migration, entity changes, GenerateService media download, and three media-serving endpoints — all present. |
| ⚠️ Layering inconsistency | The new endpoints inject `FlashcardRepository` directly instead of delegating to `FlashcardService`. The existing pattern in this controller delegates to the service layer; the new endpoints break that convention. Not a spec defect (the spec only asked for endpoints), but a codebase consistency concern. |

### Verification

- `mvn compile` — passed
- `mvn test` — passed (Flyway V8 migrated successfully on live Neon DB, context loads)
- Flyway validated new entity mapping against the database schema
