package com.projflashcards.backend.dto;

public record FlashcardDTO(
        Long id,
        String targetWord,
        String phoneticReading,
        String nativeTranslation,
        String partOfSpeech,
        String targetSentence,
        String sentencePhonetic,
        String sentenceTranslation
) {}
