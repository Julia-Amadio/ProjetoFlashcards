package com.projflashcards.backend.dto;

import java.util.Map;

//Formato padrão de erro devolvido pra qualquer requisição que falhe.
//"errors" só vem preenchido em falhas de validação (@Valid), campo a campo.
public record ApiErrorDTO(String message, Map<String, String> errors) {
    public ApiErrorDTO(String message) {
        this(message, null);
    }
}
