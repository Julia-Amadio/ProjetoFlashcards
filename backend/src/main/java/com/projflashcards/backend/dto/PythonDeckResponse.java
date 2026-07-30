package com.projflashcards.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record PythonDeckResponse(
        @JsonProperty("deck_title") String deckTitle,
        String description,
        @JsonProperty("cards") List<PythonCardResponse> cards
) {
    public record PythonCardResponse(
            @JsonProperty("target_word") String targetWord,
            @JsonProperty("phonetic_reading") String phoneticReading,
            @JsonProperty("native_translation") String nativeTranslation,
            @JsonProperty("part_of_speech") String partOfSpeech,
            @JsonProperty("target_sentence") String targetSentence,
            @JsonProperty("sentence_phonetic") String sentencePhonetic,
            @JsonProperty("sentence_translation") String sentenceTranslation,
            @JsonProperty("image_url") String imageUrl,
            @JsonProperty("audio_word_url") String audioWordUrl,
            @JsonProperty("audio_sentence_url") String audioSentenceUrl
    ) {}
}
