package com.projflashcards.backend.dto;

import jakarta.validation.constraints.NotNull;

public record UserPreferencesSaveDTO(
        @NotNull Integer dailyGoal,
        @NotNull Boolean autoplayAudio,
        @NotNull Boolean confirmExit
) {}
