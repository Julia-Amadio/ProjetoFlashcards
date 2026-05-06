-- 1. Adiciona a coluna de dificuldade
ALTER TABLE decks ADD COLUMN difficulty_level VARCHAR(50);

-- 2. Renomeia a constraint automática para o nosso padrão (opcional, mas recomendado)
-- Primeiro removemos a que o Postgres criou na V2 e criamos a nossa com nome explícito
ALTER TABLE decks DROP CONSTRAINT IF EXISTS decks_author_id_fkey;
ALTER TABLE decks
    ADD CONSTRAINT fk_decks_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Index de performance para buscas por autor
CREATE INDEX IF NOT EXISTS idx_decks_author ON decks(author_id);

-- 4. Index para buscas por título (ignora maiúsculas/minúsculas se usar ILIKE no futuro)
CREATE INDEX IF NOT EXISTS idx_decks_title ON decks(title);

-- 5. Index para filtros por idioma
CREATE INDEX IF NOT EXISTS idx_decks_language ON decks(language);
