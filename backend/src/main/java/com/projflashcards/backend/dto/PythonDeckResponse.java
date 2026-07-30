package com.projflashcards.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record PythonDeckResponse(
        @JsonProperty("deck_title") @NotBlank @Size(max = 100) String deckTitle,
        String description,
        @JsonProperty("cards") @NotEmpty List<@Valid PythonCardResponse> cards
) {
    public record PythonCardResponse(
            @JsonProperty("target_word") @NotBlank @Size(max = 100) String targetWord,
            @JsonProperty("phonetic_reading") @Size(max = 100) String phoneticReading,
            @JsonProperty("native_translation") @NotBlank @Size(max = 255) String nativeTranslation,
            @JsonProperty("part_of_speech") @Size(max = 50) String partOfSpeech,
            @JsonProperty("target_sentence") String targetSentence,
            @JsonProperty("sentence_phonetic") String sentencePhonetic,
            @JsonProperty("sentence_translation") String sentenceTranslation,
            @JsonProperty("image_url") String imageUrl,
            @JsonProperty("audio_word_url") String audioWordUrl,
            @JsonProperty("audio_sentence_url") String audioSentenceUrl
    ) {}
}
