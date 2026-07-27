package com.projflashcards.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

/* Preferências de estudo do usuário (item 4 da lista do frontend).
 * Relação 1-para-1 com users: o próprio user_id é a chave primária (e também FK). */
@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "daily_goal", nullable = false)
    private int dailyGoal = 10;

    @Column(name = "autoplay_audio", nullable = false)
    private boolean autoplayAudio = false;

    @Column(name = "confirm_exit", nullable = false)
    private boolean confirmExit = true;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public UserPreferences() { }

    public UserPreferences(UUID userId) {
        this.userId = userId;
    }

    @PrePersist
    @PreUpdate
    protected void touch() {
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public int getDailyGoal() { return dailyGoal; }
    public void setDailyGoal(int dailyGoal) { this.dailyGoal = dailyGoal; }

    public boolean isAutoplayAudio() { return autoplayAudio; }
    public void setAutoplayAudio(boolean autoplayAudio) { this.autoplayAudio = autoplayAudio; }

    public boolean isConfirmExit() { return confirmExit; }
    public void setConfirmExit(boolean confirmExit) { this.confirmExit = confirmExit; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
