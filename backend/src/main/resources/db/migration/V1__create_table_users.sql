-- V1__create_table_users.sql

CREATE TABLE users (
    -- Usamos gen_random_uuid() que é nativo do Postgres 13+
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Nomeamos a constraint de unique para facilitar logs de erro
    name VARCHAR(100) NOT NULL UNIQUE,
    CONSTRAINT unique_username UNIQUE (name),

    email VARCHAR(100) NOT NULL,
    CONSTRAINT unique_users_email UNIQUE (email),

    password_hash VARCHAR(255) NOT NULL,

    -- Definimos um check para garantir que só existam roles válidas
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    CONSTRAINT ck_users_role CHECK (role IN ('ROLE_USER', 'ROLE_ADMIN')),

    -- TIMESTAMPTZ como discutido, para consistência global
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexa e-mail
CREATE INDEX idx_users_email ON users(email);
