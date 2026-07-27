package com.projflashcards.backend.dto;

import java.time.OffsetDateTime;

public record StudyProgressDTO(
        Long deckId,
        int index,
        boolean revealed,
        boolean completed,
        StudyResultsDTO results,
        OffsetDateTime updatedAt
) {}
