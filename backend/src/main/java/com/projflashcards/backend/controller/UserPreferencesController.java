package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.UserPreferencesDTO;
import com.projflashcards.backend.dto.UserPreferencesSaveDTO;
import com.projflashcards.backend.service.UserPreferencesService;
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
@RequestMapping("/users/{userId}/preferences")
public class UserPreferencesController {

    private final UserPreferencesService userPreferencesService;

    public UserPreferencesController(UserPreferencesService userPreferencesService) {
        this.userPreferencesService = userPreferencesService;
    }

    @GetMapping
    public ResponseEntity<UserPreferencesDTO> find(@PathVariable UUID userId) {
        return ResponseEntity.ok(userPreferencesService.find(userId));
    }

    @PutMapping
    public ResponseEntity<UserPreferencesDTO> save(@PathVariable UUID userId, @RequestBody @Valid UserPreferencesSaveDTO dto) {
        return ResponseEntity.ok(userPreferencesService.save(userId, dto));
    }
}
