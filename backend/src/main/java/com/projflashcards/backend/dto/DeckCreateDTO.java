package com.projflashcards.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeckCreateDTO(
        @NotBlank @Size(max = 100) String title,
        String description,
        @NotBlank @Size(max = 50) String language,
        @Size(max = 50) String difficultyLevel
) {}
