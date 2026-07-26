package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.DeckCreateDTO;
import com.projflashcards.backend.dto.DeckSummaryDTO;
import com.projflashcards.backend.service.DeckService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/decks")
public class DeckController {

    private final DeckService deckService;

    public DeckController(DeckService deckService) {
        this.deckService = deckService;
    }

    @PostMapping
    public ResponseEntity<DeckSummaryDTO> create(@RequestBody @Valid DeckCreateDTO dto) {
        var result = deckService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping
    public ResponseEntity<List<DeckSummaryDTO>> listAll() {
        return ResponseEntity.ok(deckService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckSummaryDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(deckService.findById(id));
    }
}
