package com.projflashcards.backend.dto;

//DTO simples apenas para devolver as informações essenciais do Deck
//Não queremos devolver a data de criação, o autor inteiro, etc.
public record DeckSummaryDTO(
        Long id,
        String title,
        String language,
        String difficultyLevel
) {}
