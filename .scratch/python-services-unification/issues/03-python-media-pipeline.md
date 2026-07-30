# 03 — Python: Media fetching (Pexels + TTS) + temporary serving

**What to build:** Extend the `/generate` flow to fetch images from Pexels (via `buscador_imagens.py`) and generate TTS audio (via `gerador_audio.py`) for each card. Serve the files via a FastAPI `StaticFiles` mount and return temporary URLs in the response.

The `llm_agent.py` already produces `termo_busca_imagem_en` per card — this is passed to `buscador_imagens.py`. For audio, the `target_word` and `target_sentence` text is passed to `gerador_audio.py` using the appropriate voice from `language_config.py`.

**Blocked by:** 01 — Python unified text-only generation via llm_agent

**Status:** ready-for-agent

- [ ] Integrate `buscador_imagens.py` into the `/generate` flow: for each card, search Pexels using the image term, download the image bytes
- [ ] Integrate `gerador_audio.py` into the `/generate` flow: for each card, generate TTS for the target word and example sentence
- [ ] Save media files to a temporary directory with UUID filenames
- [ ] Mount `StaticFiles` at `/media` to serve the temporary directory
- [ ] Set `image_url`, `audio_word_url`, `audio_sentence_url` on each card response
- [ ] Write Python tests for media paths (mock Pexels and TTS)
