# 02 — Java: Adapt DTOs/service for new Python schema

**What to build:** Update `PythonDeckResponse` and `GenerateService` so Java can consume the new unified response from Python. The text fields map 1:1; the new media URL fields (`image_url`, `audio_word_url`, `audio_sentence_url`) are added to the DTO but remain null until the media pipeline lands (ticket 04).

**Blocked by:** 01 — Python unified text-only generation via llm_agent

**Status:** ready-for-agent

- [ ] Add `imageUrl`, `audioWordUrl`, `audioSentenceUrl` (all `String`/`@JsonProperty`) to `PythonDeckResponse.PythonCardResponse`
- [ ] Verify `GenerateService` deserializes the new response correctly (text fields populated, URL fields null)
- [ ] Update the 7-arg `Flashcard` constructor call to include the new fields (pass `null` for now)
- [ ] Smoke-test: `POST /decks/generate` through Java saves richer cards from llm_agent
