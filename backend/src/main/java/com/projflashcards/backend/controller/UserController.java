package com.projflashcards.backend.controller;

import com.projflashcards.backend.dto.UserCreateDTO;
import com.projflashcards.backend.dto.UserResponseDTO;
import com.projflashcards.backend.dto.UserUpdateDTO;
import com.projflashcards.backend.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/* O professor usou @Controller (usado quando retornamos páginas HTML).
 * O correto para APIs REST que retornam JSON é @RestController. */
@RestController //Modificado de @Controller para @RestController
@RequestMapping(value="/users") //Boa prática: URLs REST no plural
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    /* Injeção de dependência via CONSTRUTOR
     * Este método é preferível ao @Autowired em campos (Field Injection) pois:
     * 1. Garante a imutabilidade da dependência (uso do 'final');
     * 2. Facilita testes unitários, permitindo instanciar a classe sem o container Spring;
     * 3. Evita que o objeto seja criado em estado inconsistente (sem suas dependências). */
    //Injeção do Service em vez do Repository
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponseDTO> registerUser(@Valid @RequestBody UserCreateDTO dto) {
        //O Service já devolve o DTO pronto
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable UUID id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateDTO dto) {

        return ResponseEntity.ok(userService.updateUser(id, dto));
    }
}
