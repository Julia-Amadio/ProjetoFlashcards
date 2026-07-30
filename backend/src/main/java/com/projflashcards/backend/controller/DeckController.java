package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.DeckCreateDTO;
import com.projflashcards.backend.dto.DeckGenerateDTO;
import com.projflashcards.backend.dto.DeckSummaryDTO;
import com.projflashcards.backend.service.DeckService;
import com.projflashcards.backend.service.GenerateService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    //Aceita ?page=&size=&sort= na URL (ex.: /decks?page=1&size=10&sort=title,desc).
    //Sem parâmetros, usa os padrões abaixo: página 0, 50 decks, ordenado por título.
    @GetMapping
    public ResponseEntity<Page<DeckSummaryDTO>> listAll(
            @PageableDefault(size = 50, sort = "title") Pageable pageable) {
        return ResponseEntity.ok(deckService.listAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeckSummaryDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(deckService.findById(id));
    }
}
