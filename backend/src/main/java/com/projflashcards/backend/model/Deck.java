package com.projflashcards.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "decks")
public class Deck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //IDENTITY é o padrão para BIGSERIAL no Postgres
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String language;

    @Column(name = "difficulty_level", length = 50)
    private String difficultyLevel;

    //Relacionamento Muitos-para-Um: Muitos decks podem ter um mesmo autor
    //O fetch = FetchType.LAZY melhora a performance (só busca o autor no banco se você pedir)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", referencedColumnName = "id")
    private User author;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    //Construtor vazio (obrigatório para o Hibernate)
    public Deck() { }

    //Construtor prático
    public Deck(String title, String description, String language, String difficultyLevel, User author) {
        this.title = title;
        this.description = description;
        this.language = language;
        this.difficultyLevel = difficultyLevel;
        this.author = author;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getLanguage() { return language; }

    public void setLanguage(String language) { this.language = language; }

    public String getDifficultyLevel() { return difficultyLevel; }

    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public User getAuthor() { return author; }

    public void setAuthor(User author) { this.author = author; }

    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
