package com.projflashcards.backend.exception;

//Lançada quando o pedido esbarra em algo que já existe (e-mail/nome de usuário duplicado).
//Vira HTTP 409.
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
