package com.projflashcards.backend.exception;

import com.projflashcards.backend.dto.ApiErrorDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

/* Centraliza a conversão de exceções em respostas HTTP.
 * Antes disso, todo erro (deck não encontrado, permissão negada, validação, etc.)
 * caía no handler padrão do Spring e virava um 500 genérico — o que é confuso pro
 * frontend (que já sabe interpretar {message, errors}, ver lib/api.ts) e esconde o
 * problema real nos logs. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorDTO> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiErrorDTO(ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorDTO> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiErrorDTO(ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorDTO> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiErrorDTO(ex.getMessage()));
    }

    //Disparada pelo SecurityUtils.validatePermissions() quando alguém tenta acessar
    //dado de outro usuário sem ser admin.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorDTO> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiErrorDTO(ex.getMessage()));
    }

    //Superclasse de BadCredentialsException/UsernameNotFoundException, disparada pelo
    //AuthenticationManager.authenticate() no login. Mensagem genérica de propósito, não
    //dá pra dizer "senha errada" vs. "e-mail não existe" sem abrir brecha pra enumeração
    //de usuários cadastrados.
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorDTO> handleAuthentication(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiErrorDTO("E-mail ou senha inválidos."));
    }

    //Disparada quando a chamada ao python-services falha (erro devolvido por ele, ou nem
    //foi possível conectar). Mensagem inclui o detalhe da falha porque essa rota é
    //ROLE_ADMIN-only, não é dado sensível vazando pra qualquer usuário.
    @ExceptionHandler(ExternalServiceException.class)
    public ResponseEntity<ApiErrorDTO> handleExternalService(ExternalServiceException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ApiErrorDTO(ex.getMessage()));
    }

    //Disparada automaticamente pelo Spring quando um @RequestBody @Valid falha
    //(ex.: e-mail em formato errado, senha curta demais). Devolve campo a campo,
    //no formato "errors" que o frontend já espera (ver ApiErrorBody em lib/api.ts).
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorDTO> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorDTO("Dados inválidos.", errors));
    }

    //Disparada quando o corpo da requisição não é um JSON válido (vírgula sobrando, aspas
    //erradas, corpo vazio onde se esperava JSON, etc.), erro comum testando manualmente.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorDTO> handleUnreadableBody(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorDTO("Corpo da requisição inválido ou ausente. Verifique se é um JSON bem formado."));
    }

    //Disparada quando um parâmetro de path/query não bate com o tipo esperado
    //(ex.: GET /decks/abc/flashcards, com "abc" onde se espera um Long).
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorDTO> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String tipoEsperado = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "outro tipo";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiErrorDTO(
                "Valor inválido para '" + ex.getName() + "': esperado " + tipoEsperado + "."));
    }

    //Rede de segurança: qualquer outra exceção não prevista vira um 500 genérico,
    //sem vazar detalhe interno pro cliente. O erro de verdade fica só no log do servidor.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorDTO> handleUnexpected(Exception ex) {
        log.error("Erro não tratado", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorDTO("O servidor encontrou um problema. Tente novamente."));
    }
}
