# Karta

A language-learning flashcard system. Admins generate decks of flashcards via AI (OpenAI), enriched with images (Pexels) and pronunciation audio (Edge-TTS). Students study decks, track progress, and save favorites.

## Language

**Deck**:
A named collection of flashcards on a single topic, in a specific language and difficulty level.
_Avoid_: Baralho, set, pack

**Flashcard**:
A single learning item: a target word/phrase with its translation, pronunciation, example sentence, and optional image + audio.
_Avoid_: Card, cartão

**User**:
A person with an account. Has one of two roles.
_Avoid_: Person, account, member

**Student**:
A User with `ROLE_USER`. Browses decks, studies flashcards, tracks progress, saves favorites.
_Avoid_: Learner, Player

**Admin**:
A User with `ROLE_ADMIN`. Creates decks, generates flashcards via AI, manages users.
_Avoid_: Manager, Editor

**Generate**:
The AI process: the Java backend sends a topic/language/difficulty to the Python service, which calls OpenAI, fetches images, and synthesizes audio.
_Avoid_: Create (that is a separate manual CRUD flow)

**Media**:
Binary image (`bytea`) and audio (`bytea`) attached to a Flashcard. Images are sourced from Pexels; audio is synthesized via Edge-TTS. Served through dedicated Spring Boot endpoints.
_Avoid_: File, attachment, asset

**Study Progress**:
Per-user, per-deck record of a Student's review activity (cards studied, last studied date).
_Avoid_: Stats, score

**Favorite**:
A Student's bookmark of a Deck for quick access.
_Avoid_: Bookmark, saved deck
