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

    @Column(name = "image_data")
    private byte[] imageData;

    @Column(name = "audio_word_data")
    private byte[] audioWordData;

    @Column(name = "audio_sentence_data")
    private byte[] audioSentenceData;

    @Column(name = "image_mime_type", length = 50)
    private String imageMimeType;

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
    public byte[] getImageData() { return imageData; }
    public byte[] getAudioWordData() { return audioWordData; }
    public byte[] getAudioSentenceData() { return audioSentenceData; }
    public String getImageMimeType() { return imageMimeType; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setTargetWord(String targetWord) { this.targetWord = targetWord; }
    public void setPhoneticReading(String phoneticReading) { this.phoneticReading = phoneticReading; }
    public void setNativeTranslation(String nativeTranslation) { this.nativeTranslation = nativeTranslation; }
    public void setPartOfSpeech(String partOfSpeech) { this.partOfSpeech = partOfSpeech; }
    public void setTargetSentence(String targetSentence) { this.targetSentence = targetSentence; }
    public void setSentencePhonetic(String sentencePhonetic) { this.sentencePhonetic = sentencePhonetic; }
    public void setSentenceTranslation(String sentenceTranslation) { this.sentenceTranslation = sentenceTranslation; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }
    public void setAudioWordData(byte[] audioWordData) { this.audioWordData = audioWordData; }
    public void setAudioSentenceData(byte[] audioSentenceData) { this.audioSentenceData = audioSentenceData; }
    public void setImageMimeType(String imageMimeType) { this.imageMimeType = imageMimeType; }
}
