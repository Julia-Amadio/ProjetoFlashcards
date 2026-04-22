package com.projflashcards.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String name,
        String email,
        String role,
        OffsetDateTime createdAt
) {
    //Dica extra: criar um "construtor customizado" dentro do record
    //para converter a Entity para DTO facilmente
    public UserResponseDTO(com.projflashcards.backend.model.User user) {
        this(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
