package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.DeckCreateDTO;
import com.projflashcards.backend.dto.DeckSummaryDTO;
import com.projflashcards.backend.model.Deck;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DeckService {

    private final DeckRepository deckRepository;
    private final SecurityUtils securityUtils;

    public DeckService(DeckRepository deckRepository, SecurityUtils securityUtils) {
        this.deckRepository = deckRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public DeckSummaryDTO create(DeckCreateDTO dto) {
        var author = securityUtils.getAuthenticatedUser();

        var deck = new Deck(dto.title(), dto.description(), dto.language(), dto.difficultyLevel(), author);
        deck = deckRepository.save(deck);

        return toSummary(deck);
    }

    @Transactional(readOnly = true)
    public List<DeckSummaryDTO> listAll() {
        return deckRepository.findAll().stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeckSummaryDTO findById(Long id) {
        var deck = deckRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado"));
        return toSummary(deck);
    }

    private DeckSummaryDTO toSummary(Deck deck) {
        return new DeckSummaryDTO(
                deck.getId(),
                deck.getTitle(),
                deck.getLanguage(),
                deck.getDifficultyLevel()
        );
    }
}
