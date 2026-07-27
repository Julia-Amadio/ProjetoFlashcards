package com.projflashcards.backend.exception;

//Lançada quando um recurso (deck, flashcard, usuário, etc.) não é encontrado.
//O GlobalExceptionHandler converte isso automaticamente em HTTP 404.
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
