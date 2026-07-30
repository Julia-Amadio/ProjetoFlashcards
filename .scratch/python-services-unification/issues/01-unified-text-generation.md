# 01 — Python: Unified text-only generation via llm_agent

**What to build:** Adapt the `/generate` endpoint so it uses `llm_agent.py` for card generation instead of the current inline prompt, and returns cards in the new unified schema (text fields only, no media yet). The language-specific fields from `llm_agent.py` (hanzi/pinyin, palavra_en/ipa, etc.) get mapped into a single `CardResponse` shape.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Define new unified `CardResponse` model (current fields + `image_url`, `audio_word_url`, `audio_sentence_url` — all `str | None`)
- [ ] Replace `/generate` inline LLM call with `llm_agent.gerar_flashcards_json()`
- [ ] Map language-specific fields (Mandarin → hanzi/pinyin, English → palavra_en/ipa, etc.) into the unified schema
- [ ] Handle the `language` parameter routing: `mandarin`, `english`, `french`, `japanese`
- [ ] Unify the OpenAI call — `llm_agent.py` uses `client.beta.chat.completions.parse` with `gpt-5`, `main.py` uses `openai.chat.completions.create` with `gpt-4o-mini`. Decide which client to keep and align both
- [ ] Write Python tests (FastAPI TestClient, mock OpenAI response)
