-- V7__create_table_user_preferences.sql

CREATE TABLE user_preferences (
    -- Chave primária = também é FK para users: no máximo uma linha de preferências por usuário
    user_id UUID PRIMARY KEY,

    daily_goal INT NOT NULL DEFAULT 10,
    CONSTRAINT ck_preferences_daily_goal CHECK (daily_goal IN (5, 10, 15, 20, 30)),

    autoplay_audio BOOLEAN NOT NULL DEFAULT FALSE,
    confirm_exit BOOLEAN NOT NULL DEFAULT TRUE,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_preferences_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
