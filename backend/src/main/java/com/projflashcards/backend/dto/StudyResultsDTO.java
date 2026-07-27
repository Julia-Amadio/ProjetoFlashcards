package com.projflashcards.backend.dto;

import jakarta.validation.constraints.Min;

public record StudyResultsDTO(
        @Min(0) int again,
        @Min(0) int almost,
        @Min(0) int easy
) {}
