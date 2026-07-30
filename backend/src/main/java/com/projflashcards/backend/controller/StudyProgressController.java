package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.StudyProgressDTO;
import com.projflashcards.backend.dto.StudyProgressSaveDTO;
import com.projflashcards.backend.service.StudyProgressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/users/{userId}/study-progress")
public class StudyProgressController {

    private final StudyProgressService studyProgressService;

    public StudyProgressController(StudyProgressService studyProgressService) {
        this.studyProgressService = studyProgressService;
    }

    @GetMapping("/{deckId}")
    public ResponseEntity<StudyProgressDTO> find(@PathVariable UUID userId, @PathVariable Long deckId) {
        return ResponseEntity.ok(studyProgressService.find(userId, deckId));
    }

    @PutMapping("/{deckId}")
    public ResponseEntity<StudyProgressDTO> save(@PathVariable UUID userId, @PathVariable Long deckId,
                                                  @RequestBody @Valid StudyProgressSaveDTO dto) {
        return ResponseEntity.ok(studyProgressService.save(userId, deckId, dto));
    }
}
