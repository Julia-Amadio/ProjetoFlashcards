CREATE TABLE flashcards (
    id BIGSERIAL PRIMARY KEY,
    deck_id BIGINT NOT NULL,

    -- Campos específicos para aprendizado de idiomas
    target_word VARCHAR(100) NOT NULL,
    phonetic_reading VARCHAR(100),
    native_translation VARCHAR(255) NOT NULL,
    part_of_speech VARCHAR(50),
    target_sentence TEXT,
    sentence_phonetic TEXT,
    sentence_translation TEXT,
    image_url VARCHAR(255),
    audio_word_url VARCHAR(255),
    audio_sentence_url VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraint explícita: se o deck sumir, os flashcards vão junto
    CONSTRAINT fk_flashcards_deck FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

-- Index essencial: toda vez que o app abrir um Deck, ele vai buscar por essa coluna
CREATE INDEX idx_flashcards_deck ON flashcards(deck_id);
