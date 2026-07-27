-- V6__create_table_study_progress.sql

CREATE TABLE study_progress (
    user_id UUID NOT NULL,
    deck_id BIGINT NOT NULL,

    -- Em que cartão o usuário parou e se a resposta dele já está revelada na tela
    card_index INT NOT NULL DEFAULT 0,
    revealed BOOLEAN NOT NULL DEFAULT FALSE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,

    -- Contadores de "Ainda não" / "Quase" / "Fácil" da sessão atual
    again_count INT NOT NULL DEFAULT 0,
    almost_count INT NOT NULL DEFAULT 0,
    easy_count INT NOT NULL DEFAULT 0,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Chave Primária Composta: um único registro de progresso por usuário+deck
    PRIMARY KEY (user_id, deck_id),

    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_deck FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

-- Index de performance para listar todo o progresso de um usuário (uso futuro, ex.: "continue de onde parou")
CREATE INDEX idx_progress_user ON study_progress(user_id);
