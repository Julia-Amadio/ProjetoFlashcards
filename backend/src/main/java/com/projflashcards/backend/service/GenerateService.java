package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.*;
import com.projflashcards.backend.exception.ExternalServiceException;
import com.projflashcards.backend.model.Deck;
import com.projflashcards.backend.model.Flashcard;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.repository.FlashcardRepository;
import com.projflashcards.backend.security.SecurityUtils;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.time.Duration;
import java.util.stream.Collectors;

@Service
public class GenerateService {

    private static final Logger log = LoggerFactory.getLogger(GenerateService.class);

    private final RestTemplate restTemplate;
    private final DeckRepository deckRepository;
    private final FlashcardRepository flashcardRepository;
    private final SecurityUtils securityUtils;
    private final Validator validator;
    private final String pythonServiceUrl;
    private final String internalSecret;

    public GenerateService(@Value("${app.python-service.url}") String pythonServiceUrl,
                           @Value("${app.internal-secret}") String internalSecret,
                           DeckRepository deckRepository,
                           FlashcardRepository flashcardRepository,
                           SecurityUtils securityUtils,
                           Validator validator) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofMinutes(3));
        this.restTemplate = new RestTemplate(requestFactory);
        this.pythonServiceUrl = pythonServiceUrl;
        this.internalSecret = internalSecret;
        this.deckRepository = deckRepository;
        this.flashcardRepository = flashcardRepository;
        this.securityUtils = securityUtils;
        this.validator = validator;
    }

    @Transactional
    public DeckSummaryDTO generate(DeckGenerateDTO dto) {
        var author = securityUtils.getAuthenticatedUser();

        var headers = new HttpHeaders();
        if (internalSecret != null && !internalSecret.isBlank()) {
            headers.set("X-Internal-Token", internalSecret);
        }
        var requestEntity = new HttpEntity<>(dto, headers);
        PythonDeckResponse pythonResponse;
        try {
            pythonResponse = restTemplate.postForObject(
                    pythonServiceUrl + "/generate",
                    requestEntity,
                    PythonDeckResponse.class
            );
        } catch (HttpStatusCodeException e) {
            //python-services respondeu, mas com erro (ex.: 502 por falha na OpenAI/Pexels/Edge-TTS).
            //O corpo da resposta já vem com o detalhe (ver main.py: HTTPException(detail=...)).
            log.warn("python-services devolveu erro em /generate: {}", e.getResponseBodyAsString());
            throw new ExternalServiceException("Falha ao gerar deck via IA: " + e.getResponseBodyAsString());
        } catch (RestClientException e) {
            //Nem chegou a ter resposta HTTP — conexão recusada, timeout, DNS, etc.
            log.warn("Não foi possível conectar ao python-services em /generate", e);
            throw new ExternalServiceException(
                    "Não foi possível conectar ao serviço de geração (python-services). Verifique se ele está no ar.");
        }

        if (pythonResponse == null || pythonResponse.cards() == null || pythonResponse.cards().isEmpty()) {
            throw new ExternalServiceException("O serviço de geração devolveu uma resposta vazia.");
        }
        var violations = validator.validate(pythonResponse);
        if (!violations.isEmpty()) {
            var details = violations.stream()
                    .map(ConstraintViolation::getPropertyPath)
                    .map(Object::toString)
                    .sorted()
                    .collect(Collectors.joining(", "));
            throw new ExternalServiceException(
                    "O serviço de geração devolveu dados inválidos nos campos: " + details);
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

            byte[] imageBytes = downloadMedia(c.imageUrl());
            if (imageBytes != null) {
                card.setImageData(imageBytes);
                card.setImageMimeType(detectImageMimeType(c.imageUrl()));
            }

            card.setAudioWordData(downloadMedia(c.audioWordUrl()));
            card.setAudioSentenceData(downloadMedia(c.audioSentenceUrl()));

            return flashcardRepository.save(card);
        }).toList();

        return new DeckSummaryDTO(
                finalDeck.getId(),
                finalDeck.getTitle(),
                finalDeck.getDescription(),
                finalDeck.getLanguage(),
                finalDeck.getDifficultyLevel()
        );
    }

    private byte[] downloadMedia(String url) {
        if (url == null || url.isBlank()) return null;
        try {
            return restTemplate.getForObject(url, byte[].class);
        } catch (Exception e) {
            log.warn("Failed to download media from {}: {}", url, e.getMessage());
            return null;
        }
    }

    private String detectImageMimeType(String url) {
        if (url == null) return null;
        String lower = url.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }
}
