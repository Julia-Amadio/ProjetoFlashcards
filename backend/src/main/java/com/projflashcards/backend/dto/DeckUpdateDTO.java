package com.projflashcards.backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DeckUpdateDTO(
        @Size(max = 100)
        @Pattern(regexp = ".*\\S.*", message = "não pode estar em branco")
        String title,
        String description,
        @Size(max = 50)
        @Pattern(regexp = ".*\\S.*", message = "não pode estar em branco")
        String language,
        @Size(max = 50) String difficultyLevel
) {}
