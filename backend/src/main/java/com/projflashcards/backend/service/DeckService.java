package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.DeckCreateDTO;
import com.projflashcards.backend.dto.DeckSummaryDTO;
import com.projflashcards.backend.dto.DeckUpdateDTO;
import com.projflashcards.backend.exception.ResourceNotFoundException;
import com.projflashcards.backend.model.Deck;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    //Paginado: devolve uma "página" de decks por vez em vez da tabela inteira de uma só
    //requisição — importante pra não virar um problema quando o catálogo crescer.
    @Transactional(readOnly = true)
    public Page<DeckSummaryDTO> listAll(Pageable pageable) {
        return deckRepository.findAll(pageable).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public DeckSummaryDTO findById(Long id) {
        var deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deck não encontrado"));
        return toSummary(deck);
    }

    @Transactional
    public DeckSummaryDTO update(Long id, DeckUpdateDTO dto) {
        var deck = deckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deck não encontrado"));

        if (dto.title() != null) deck.setTitle(dto.title());
        if (dto.description() != null) deck.setDescription(dto.description());
        if (dto.language() != null) deck.setLanguage(dto.language());
        if (dto.difficultyLevel() != null) deck.setDifficultyLevel(dto.difficultyLevel());

        return toSummary(deckRepository.save(deck));
    }

    @Transactional
    public void delete(Long id) {
        if (!deckRepository.existsById(id)) {
            throw new ResourceNotFoundException("Deck não encontrado");
        }
        deckRepository.deleteById(id);
    }

    private DeckSummaryDTO toSummary(Deck deck) {
        return new DeckSummaryDTO(
                deck.getId(),
                deck.getTitle(),
                deck.getDescription(),
                deck.getLanguage(),
                deck.getDifficultyLevel()
        );
    }
}
