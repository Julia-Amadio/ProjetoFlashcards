package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.FlashcardCreateDTO;
import com.projflashcards.backend.dto.FlashcardDTO;
import com.projflashcards.backend.dto.FlashcardUpdateDTO;
import com.projflashcards.backend.service.FlashcardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping("/decks/{deckId}/flashcards")
    public ResponseEntity<FlashcardDTO> create(@PathVariable Long deckId, @RequestBody @Valid FlashcardCreateDTO dto) {
        var result = flashcardService.create(deckId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/decks/{deckId}/flashcards")
    public ResponseEntity<List<FlashcardDTO>> listByDeck(@PathVariable Long deckId) {
        return ResponseEntity.ok(flashcardService.listByDeck(deckId));
    }

    @GetMapping("/flashcards/{id}")
    public ResponseEntity<FlashcardDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(flashcardService.findById(id));
    }

    @PutMapping("/flashcards/{id}")
    public ResponseEntity<FlashcardDTO> update(@PathVariable Long id, @RequestBody @Valid FlashcardUpdateDTO dto) {
        return ResponseEntity.ok(flashcardService.update(id, dto));
    }

    @DeleteMapping("/flashcards/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        flashcardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
