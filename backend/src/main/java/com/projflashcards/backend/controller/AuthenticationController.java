package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.AuthenticationDTO;
import com.projflashcards.backend.security.TokenService;
import com.projflashcards.backend.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    //Injeção de dependências
    public AuthenticationController(AuthenticationManager authenticationManager, TokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping
    public ResponseEntity<String> login(@RequestBody @Valid AuthenticationDTO data) {
        //Cria um token temporário apenas com os dados digitados para passar ao AuthenticationManager
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        
        //O Spring Security vai usar seu AuthorizationService para buscar o usuário e comparar as senhas automaticamente
        var auth = this.authenticationManager.authenticate(usernamePassword);

        //Se a senha estiver correta, extraímos o UserDetailsImpl do objeto autenticado
        var userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        //Pegamos a entidade User de dentro do nosso Wrapper e geramos o token JWT
        var token = tokenService.generateToken(userDetails.getUser());

        //Retorna o Token. 
        //TODO: podemos retornar um record como TokenResponseDTO(String token) para ficar em formato JSON.
        return ResponseEntity.ok(token);
    }
}
