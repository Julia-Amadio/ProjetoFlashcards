package com.projflashcards.backend.exception;

//Lançada quando uma chamada a um serviço externo (hoje só o python-services) falha,
//seja porque ele respondeu um erro, seja porque não foi possível nem conectar.
//O GlobalExceptionHandler converte isso automaticamente em HTTP 502.
public class ExternalServiceException extends RuntimeException {
    public ExternalServiceException(String message) {
        super(message);
    }
}
