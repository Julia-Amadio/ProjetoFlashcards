CREATE TABLE user_favorite_decks (
    user_id UUID NOT NULL,
    deck_id BIGINT NOT NULL,
    favorited_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Chave Primária Composta
    PRIMARY KEY (user_id, deck_id),

    -- Constraints explícitas apontando para UUID e BIGINT respectivamente
    CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fav_deck FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

-- Index de performance para saber quais usuários favoritaram um deck específico
CREATE INDEX idx_fav_deck ON user_favorite_decks(deck_id);
