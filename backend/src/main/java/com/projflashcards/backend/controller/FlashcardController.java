package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.FlashcardCreateDTO;
import com.projflashcards.backend.dto.FlashcardDTO;
import com.projflashcards.backend.dto.FlashcardUpdateDTO;
import com.projflashcards.backend.exception.ResourceNotFoundException;
import com.projflashcards.backend.repository.FlashcardRepository;
import com.projflashcards.backend.service.FlashcardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FlashcardController {

    private final FlashcardService flashcardService;
    private final FlashcardRepository flashcardRepository;

    public FlashcardController(FlashcardService flashcardService, FlashcardRepository flashcardRepository) {
        this.flashcardService = flashcardService;
        this.flashcardRepository = flashcardRepository;
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

    @GetMapping("/flashcards/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        var card = flashcardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard não encontrado"));

        if (card.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }

        var mediaType = card.getImageMimeType() != null
                ? MediaType.parseMediaType(card.getImageMimeType())
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(card.getImageData());
    }

    @GetMapping("/flashcards/{id}/audio/word")
    public ResponseEntity<byte[]> getAudioWord(@PathVariable Long id) {
        var card = flashcardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard não encontrado"));

        if (card.getAudioWordData() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(card.getAudioWordData());
    }

    @GetMapping("/flashcards/{id}/audio/sentence")
    public ResponseEntity<byte[]> getAudioSentence(@PathVariable Long id) {
        var card = flashcardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard não encontrado"));

        if (card.getAudioSentenceData() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(card.getAudioSentenceData());
    }
}
