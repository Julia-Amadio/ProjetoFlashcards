package com.projflashcards.backend.exception;

//Lançada quando o pedido do cliente viola alguma regra de negócio
//(ex.: meta diária fora da lista permitida). Vira HTTP 400.
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
