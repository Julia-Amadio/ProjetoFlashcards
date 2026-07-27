package com.projflashcards.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StudyProgressSaveDTO(
        @Min(0) int index,
        boolean revealed,
        boolean completed,
        @NotNull @Valid StudyResultsDTO results
) {}
