package com.projflashcards.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

/* Guarda em que ponto de um deck o usuário parou de estudar (item 4 da lista do frontend).
 * Um registro por (usuário, deck) — chave composta via @IdClass. */
@Entity
@Table(name = "study_progress")
@IdClass(StudyProgressId.class)
public class StudyProgress {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "deck_id")
    private Long deckId;

    @Column(name = "card_index", nullable = false)
    private int cardIndex;

    @Column(nullable = false)
    private boolean revealed;

    @Column(nullable = false)
    private boolean completed;

    @Column(name = "again_count", nullable = false)
    private int againCount;

    @Column(name = "almost_count", nullable = false)
    private int almostCount;

    @Column(name = "easy_count", nullable = false)
    private int easyCount;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public StudyProgress() { }

    public StudyProgress(UUID userId, Long deckId) {
        this.userId = userId;
        this.deckId = deckId;
    }

    //Atualiza o timestamp toda vez que o registro é criado OU alterado (upsert)
    @PrePersist
    @PreUpdate
    protected void touch() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public Long getDeckId() { return deckId; }
    public void setDeckId(Long deckId) { this.deckId = deckId; }

    public int getCardIndex() { return cardIndex; }
    public void setCardIndex(int cardIndex) { this.cardIndex = cardIndex; }

    public boolean isRevealed() { return revealed; }
    public void setRevealed(boolean revealed) { this.revealed = revealed; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public int getAgainCount() { return againCount; }
    public void setAgainCount(int againCount) { this.againCount = againCount; }

    public int getAlmostCount() { return almostCount; }
    public void setAlmostCount(int almostCount) { this.almostCount = almostCount; }

    public int getEasyCount() { return easyCount; }
    public void setEasyCount(int easyCount) { this.easyCount = easyCount; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
