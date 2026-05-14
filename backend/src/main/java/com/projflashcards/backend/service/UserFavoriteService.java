package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.DeckSummaryDTO;
import com.projflashcards.backend.model.Deck;
import com.projflashcards.backend.model.User;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.repository.UserRepository;
import com.projflashcards.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserFavoriteService {

    private final UserRepository userRepository;
    private final DeckRepository deckRepository;
    private final SecurityUtils securityUtils; //<--- NOVA INJEÇÃO

    //Injeção de dependência via construtor (Boa prática do Spring)
    public UserFavoriteService(UserRepository userRepository, DeckRepository deckRepository,
                               SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
        this.securityUtils = securityUtils;
    }

    //Add um deck à lista de favoritos
    @Transactional
    public void addFavoriteDeck(UUID userId, Long deckId) {
        securityUtils.validatePermissions(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Deck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado"));

        //O Hibernate cuida de inserir na tabela user_favorite_decks
        user.getFavoriteDecks().add(deck);
        userRepository.save(user);
    }

    //Remove deck da lista de favoritos
    @Transactional
    public void removeFavoriteDeck(UUID userId, Long deckId) {
        securityUtils.validatePermissions(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        //removeIf percorre a lista e remove o deck que tiver o ID correspondente
        boolean removed = user.getFavoriteDecks().removeIf(deck -> deck.getId().equals(deckId));

        if (!removed) {
            throw new RuntimeException("Este deck não está nos favoritos do usuário");
        }

        userRepository.save(user);
    }

    //Lista decks favoritos do usuário
    @Transactional(readOnly = true)
    public List<DeckSummaryDTO> getUserFavorites(UUID userId) {
        securityUtils.validatePermissions(userId);

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
