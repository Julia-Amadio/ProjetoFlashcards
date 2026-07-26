package com.projflashcards.backend.dto;

import jakarta.validation.constraints.Size;

public record FlashcardUpdateDTO(
        @Size(max = 100) String targetWord,
        @Size(max = 100) String phoneticReading,
        @Size(max = 255) String nativeTranslation,
        @Size(max = 50) String partOfSpeech,
        String targetSentence,
        String sentencePhonetic,
        String sentenceTranslation
) {}
