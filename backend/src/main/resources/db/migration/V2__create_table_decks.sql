-- V2__create_table_decks.sql
CREATE TABLE decks (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(100) NOT NULL,
    description TEXT,
    language VARCHAR(50) NOT NULL,

    -- Correção: author_id deve ser UUID para referenciar users(id)
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
