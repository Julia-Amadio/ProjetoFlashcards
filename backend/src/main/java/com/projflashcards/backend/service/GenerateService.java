package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.*;
import com.projflashcards.backend.model.Deck;
import com.projflashcards.backend.model.Flashcard;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.repository.FlashcardRepository;
import com.projflashcards.backend.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class GenerateService {

    private final RestTemplate restTemplate;
    private final DeckRepository deckRepository;
    private final FlashcardRepository flashcardRepository;
    private final SecurityUtils securityUtils;
    private final String pythonServiceUrl;

    public GenerateService(@Value("${app.python-service.url}") String pythonServiceUrl,
                           DeckRepository deckRepository,
                           FlashcardRepository flashcardRepository,
                           SecurityUtils securityUtils) {
        this.restTemplate = new RestTemplate();
        this.pythonServiceUrl = pythonServiceUrl;
        this.deckRepository = deckRepository;
        this.flashcardRepository = flashcardRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public DeckSummaryDTO generate(DeckGenerateDTO dto) {
        var author = securityUtils.getAuthenticatedUser();

        var pythonResponse = restTemplate.postForObject(
                pythonServiceUrl + "/generate",
                dto,
                PythonDeckResponse.class
        );

        if (pythonResponse == null || pythonResponse.cards() == null || pythonResponse.cards().isEmpty()) {
            throw new RuntimeException("Python service returned empty response");
        }

        var deck = new Deck(pythonResponse.deckTitle(), pythonResponse.description(),
                dto.language(), dto.difficultyLevel(), author);
        deck = deckRepository.save(deck);

        var finalDeck = deck;
        var cards = pythonResponse.cards().stream().map(c -> {
            var card = new Flashcard(
                    finalDeck, c.targetWord(), c.phoneticReading(),
                    c.nativeTranslation(), c.partOfSpeech(), c.targetSentence(),
                    c.sentencePhonetic(), c.sentenceTranslation()
            );
            return flashcardRepository.save(card);
        }).toList();

        return new DeckSummaryDTO(
                finalDeck.getId(),
                finalDeck.getTitle(),
                finalDeck.getLanguage(),
                finalDeck.getDifficultyLevel()
        );
    }
}
