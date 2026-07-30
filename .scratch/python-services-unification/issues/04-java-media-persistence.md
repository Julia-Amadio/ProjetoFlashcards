# 04 — Java: bytea persistence + media-serving endpoints

**What to build:** Persist media bytes in PostgreSQL and serve them to the frontend. This is the final slice that makes the full pipeline work end-to-end.

**Blocked by:** 02 — Java: Adapt DTOs/service for new Python schema, 03 — Python: Media fetching (Pexels + TTS) + temporary serving

**Status:** ready-for-agent

- [ ] Create Flyway migration to:
  - Replace `image_url` (varchar) → `image_data` (bytea)
  - Replace `audio_word_url` (varchar) → `audio_word_data` (bytea)
  - Replace `audio_sentence_url` (varchar) → `audio_sentence_data` (bytea)
  - Add `image_mime_type` (varchar)
- [ ] Update `Flashcard` entity with new fields
- [ ] Update `GenerateService` to HTTP-GET each media URL and store the raw bytes
- [ ] Create `GET /flashcards/{id}/image` — serves `image_data` with `image_mime_type`
- [ ] Create `GET /flashcards/{id}/audio/word` — serves `audio_word_data` as `audio/mpeg`
- [ ] Create `GET /flashcards/{id}/audio/sentence` — serves `audio_sentence_data` as `audio/mpeg`
- [ ] End-to-end test: generate a deck, verify media bytes in DB, verify they're served by the new endpoints
