# Store flashcard media as bytea in PostgreSQL

Python generates audio (Edge-TTS) and fetches images (Pexels) during flashcard generation via FastAPI. The Java backend downloads these files from temporary URLs served by Python and stores the raw bytes directly in the `flashcards` table as `bytea` columns, replacing the previous unused `varchar` URL columns.

**Considered options:**
- **File paths on shared Docker volume** — requires volume mounting + a separate static file server; Python writes, Java serves. Viable but adds infra for a POC.
- **Return base64 in JSON** — avoid extra HTTP round-trips, but bloats the payload and adds serialization overhead.
- **URLs pointing to Python** — Python serves files via FastAPI; Java stores the URL string. Fragile: Python container restarts lose the files.

**Why bytea won:** The project is a POC targeting at most a few dozen decks, making Neon storage costs irrelevant. It also keeps the deployment zero-infra — a single `docker compose up` is all that's needed, no volumes, no file servers, no external storage.

**Frontend impact:** New Spring Boot endpoints (`GET /flashcards/{id}/image`, `GET /flashcards/{id}/audio/word`, `GET /flashcards/{id}/audio/sentence`) will serve the binary data. Frontend changes are out of scope but noted.
