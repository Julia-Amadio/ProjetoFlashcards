package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.DeckSummaryDTO;
import com.projflashcards.backend.service.UserFavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserFavoriteController {

    private final UserFavoriteService favoriteService;

    public UserFavoriteController(UserFavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    //1. Endpoint para favoritar (POST)
    @PostMapping("/{userId}/favorites/{deckId}")
    public ResponseEntity<Void> favoriteADeck(
            @PathVariable UUID userId,
            @PathVariable Long deckId) {

        favoriteService.addFavoriteDeck(userId, deckId);
        return ResponseEntity.ok().build(); //Retorna 200 OK sem corpo
    }

    //2. Endpoint para listar os favoritos (GET) usando DeckSummaryDTO
    @GetMapping("/{userId}/favorites")
    public ResponseEntity<List<DeckSummaryDTO>> getFavorites(@PathVariable UUID userId) {

        List<DeckSummaryDTO> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }
}
