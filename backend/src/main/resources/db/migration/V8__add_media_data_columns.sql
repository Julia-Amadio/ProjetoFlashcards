ALTER TABLE flashcards
    DROP COLUMN IF EXISTS image_url,
    DROP COLUMN IF EXISTS audio_word_url,
    DROP COLUMN IF EXISTS audio_sentence_url,
    ADD COLUMN image_data BYTEA,
    ADD COLUMN audio_word_data BYTEA,
    ADD COLUMN audio_sentence_data BYTEA,
    ADD COLUMN image_mime_type VARCHAR(50);
