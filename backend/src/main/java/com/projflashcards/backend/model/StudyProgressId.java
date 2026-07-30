package com.projflashcards.backend.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/* Classe auxiliar que representa a chave composta (userId + deckId) do StudyProgress.
 * É exigida pelo JPA quando usamos @IdClass na entidade: precisa ter os mesmos nomes de
 * campo que estão anotados com @Id lá, implementar Serializable e ter equals/hashCode. */
public class StudyProgressId implements Serializable {

    private UUID userId;
    private Long deckId;

    public StudyProgressId() { }

    public StudyProgressId(UUID userId, Long deckId) {
        this.userId = userId;
        this.deckId = deckId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StudyProgressId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(deckId, that.deckId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, deckId);
    }
}
