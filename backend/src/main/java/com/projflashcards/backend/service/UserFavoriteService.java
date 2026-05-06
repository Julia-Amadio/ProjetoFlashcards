package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.DeckSummaryDTO;
import com.projflashcards.backend.model.Deck;
import com.projflashcards.backend.model.User;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserFavoriteService {

    private final UserRepository userRepository;
    private final DeckRepository deckRepository;

    //Injeção de dependência via construtor (Boa prática do Spring)
    public UserFavoriteService(UserRepository userRepository, DeckRepository deckRepository) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
    }

    @Transactional
    public void addFavoriteDeck(UUID userId, Long deckId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado"));

        //O Hibernate cuida de inserir na tabela user_favorite_decks
        user.getFavoriteDecks().add(deck);
        userRepository.save(user);
    }

    //Método extra para testar se o favorito foi salvo listando eles
    @Transactional(readOnly = true)
    public List<DeckSummaryDTO> getUserFavorites(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        //Converte a lista de entidades (Set<Deck>) para a lista de DTOs
        return user.getFavoriteDecks().stream()
                .map(deck -> new DeckSummaryDTO(
                        deck.getId(),
                        deck.getTitle(),
                        deck.getLanguage(),
                        deck.getDifficultyLevel()
                ))
                .collect(Collectors.toList());
    }
}
