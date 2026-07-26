package com.projflashcards.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeckGenerateDTO(
        @NotBlank @Size(max = 200) String topic,
        @NotBlank @Size(max = 50) String language,
        @Size(max = 50) String difficultyLevel
) {}
