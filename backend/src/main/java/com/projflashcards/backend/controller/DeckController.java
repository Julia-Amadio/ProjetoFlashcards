package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.DeckCreateDTO;
import com.projflashcards.backend.dto.DeckGenerateDTO;
import com.projflashcards.backend.dto.DeckSummaryDTO;
import com.projflashcards.backend.service.DeckService;
import com.projflashcards.backend.service.GenerateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/decks")
public class DeckController {

    private final DeckService deckService;
    private final GenerateService generateService;

    public DeckController(DeckService deckService, GenerateService generateService) {
        this.deckService = deckService;
        this.generateService = generateService;
    }

    @PostMapping
    public ResponseEntity<DeckSummaryDTO> create(@RequestBody @Valid DeckCreateDTO dto) {
        var result = deckService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/generate")
    public ResponseEntity<DeckSummaryDTO> generate(@RequestBody @Valid DeckGenerateDTO dto) {
        var result = generateService.generate(dto);
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
