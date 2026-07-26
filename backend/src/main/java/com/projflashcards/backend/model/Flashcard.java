package com.projflashcards.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "flashcards")
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    private Deck deck;

    @Column(name = "target_word", nullable = false, length = 100)
    private String targetWord;

    @Column(name = "phonetic_reading", length = 100)
    private String phoneticReading;

    @Column(name = "native_translation", nullable = false, length = 255)
    private String nativeTranslation;

    @Column(name = "part_of_speech", length = 50)
    private String partOfSpeech;

    @Column(name = "target_sentence", columnDefinition = "TEXT")
    private String targetSentence;

    @Column(name = "sentence_phonetic", columnDefinition = "TEXT")
    private String sentencePhonetic;

    @Column(name = "sentence_translation", columnDefinition = "TEXT")
    private String sentenceTranslation;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "audio_word_url", length = 255)
    private String audioWordUrl;

    @Column(name = "audio_sentence_url", length = 255)
    private String audioSentenceUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Flashcard() {}

    public Flashcard(Deck deck, String targetWord, String phoneticReading, String nativeTranslation,
                     String partOfSpeech, String targetSentence, String sentencePhonetic,
                     String sentenceTranslation) {
        this.deck = deck;
        this.targetWord = targetWord;
        this.phoneticReading = phoneticReading;
        this.nativeTranslation = nativeTranslation;
        this.partOfSpeech = partOfSpeech;
        this.targetSentence = targetSentence;
        this.sentencePhonetic = sentencePhonetic;
        this.sentenceTranslation = sentenceTranslation;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = OffsetDateTime.now();
        }
    }

    public Long getId() { return id; }
    public Deck getDeck() { return deck; }
    public String getTargetWord() { return targetWord; }
    public String getPhoneticReading() { return phoneticReading; }
    public String getNativeTranslation() { return nativeTranslation; }
    public String getPartOfSpeech() { return partOfSpeech; }
    public String getTargetSentence() { return targetSentence; }
    public String getSentencePhonetic() { return sentencePhonetic; }
    public String getSentenceTranslation() { return sentenceTranslation; }
    public String getImageUrl() { return imageUrl; }
    public String getAudioWordUrl() { return audioWordUrl; }
    public String getAudioSentenceUrl() { return audioSentenceUrl; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setTargetWord(String targetWord) { this.targetWord = targetWord; }
    public void setPhoneticReading(String phoneticReading) { this.phoneticReading = phoneticReading; }
    public void setNativeTranslation(String nativeTranslation) { this.nativeTranslation = nativeTranslation; }
    public void setPartOfSpeech(String partOfSpeech) { this.partOfSpeech = partOfSpeech; }
    public void setTargetSentence(String targetSentence) { this.targetSentence = targetSentence; }
    public void setSentencePhonetic(String sentencePhonetic) { this.sentencePhonetic = sentencePhonetic; }
    public void setSentenceTranslation(String sentenceTranslation) { this.sentenceTranslation = sentenceTranslation; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setAudioWordUrl(String audioWordUrl) { this.audioWordUrl = audioWordUrl; }
    public void setAudioSentenceUrl(String audioSentenceUrl) { this.audioSentenceUrl = audioSentenceUrl; }
}
