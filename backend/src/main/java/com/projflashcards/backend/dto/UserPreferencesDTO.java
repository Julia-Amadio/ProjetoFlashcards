package com.projflashcards.backend.dto;

public record UserPreferencesDTO(
        int dailyGoal,
        boolean autoplayAudio,
        boolean confirmExit
) {}
