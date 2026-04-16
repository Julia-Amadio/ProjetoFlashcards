package com.projflashcards.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.projflashcards.backend.model.User;
import com.projflashcards.backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/* O professor usou @Controller (usado quando retornamos páginas HTML).
 * O correto para APIs REST que retornam JSON é @RestController. */
@RestController //Modificado de @Controller para @RestController
@RequestMapping(value="/users") //Boa prática: URLs REST no plural
public class UserController {

    private final UserRepository userRepository;

    /* Injeção de dependência via CONSTRUTOR
     * Este método é preferível ao @Autowired em campos (Field Injection) pois:
     * 1. Garante a imutabilidade da dependência (uso do 'final');
     * 2. Facilita testes unitários, permitindo instanciar a classe sem o container Spring;
     * 3. Evita que o objeto seja criado em estado inconsistente (sem suas dependências). */
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //Busca um usuário específico pelo ID
    //GET http://localhost:8080/users/{id}
    @GetMapping(value="/{id}", produces="application/json")
    public ResponseEntity<User> getUser(@PathVariable(value="id") UUID id) {
        Optional<User> user = userRepository.findById(id);

        //Tratamento correto: verifica se encontrou antes de dar o .get()
        if (user.isPresent()) {
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); //Retorna 404
        }
    }

    //Lista todos os usuários (substitui 'init' do professor)
    //GET http://localhost:8080/users
    @GetMapping(produces="application/json")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    //Rota REAL para criar um usuário via JSON (POST)
    //POST http://localhost:8080/users
    @PostMapping(consumes="application/json", produces="application/json")
    public ResponseEntity<User> createUser(@RequestBody User newUser) {
        User savedUser = userRepository.save(newUser);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    //Deleta um usuário específico pelo ID
    //DELETE http://localhost:8080/users/{id}
    @DeleteMapping("/{id}") //<-- Alterado de "/delete/{id}". Verbo HTTP (DELETE) da requisição já indica a ação
    public ResponseEntity<Void> deleteUserById(@PathVariable UUID id){
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isPresent()) {
            /* - Anterior: quando deletado com sucesso, retornava '200 OK' (ResponseEntity.ok())
             * - Novo: retorna '204 No Content' (melhor prática pra quando não há retorno JSON após o DELETE) */
            userRepository.delete(userOptional.get());
            return ResponseEntity.noContent().build(); //204
        } else {
            /* - Anterior: throw new RuntimeException.
                 Sem tratativa explícita para essa exceção, jogava um 500 Internal Server Error
             * - Novo: cai no else e retorna 404 Not Found (ResponseEntity.notFound()).
                 Indica apenas que o recurso não existe. */
            return ResponseEntity.notFound().build(); //404
        }

        /* Outras mudanças:
        *  - Anterior: usava exceção (throw) como "freio". Precisava estourar erro para forçar o método a parar,
        *    evitando que a execução continue e retorne o 200 OK na última linha.
        *    Usa erro como controle de fluxo.
        *  - Novo (if/else): trata cenário de "não encontrou" como regra de negócio normal.
        *    Mais amigável e legível para quem for ler/consumir a API. */
    }

    //Atualiza os dados de um usuário existente pelo ID
    //PUT http://localhost:8080/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable UUID id, @RequestBody User userDetails) {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();

            //Atualiza APENAS dados seguros do perfil
            existingUser.setName(userDetails.getName());
            existingUser.setEmail(userDetails.getEmail());

            //Sem setRole() para evitar falhas de segurança
            //Sem atualização de senha aqui por enquanto
            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(updatedUser);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //Endpoint de busca com parâmetros
    //Podemos implementar também busca com nome, com formato semelhante a este método
    //Ex.: GET http://localhost:8080/users/search?email=teste@email.com
    @GetMapping("/search")
    public ResponseEntity<User> getUserByEmail(@RequestParam String email) {
        return userRepository.findByEmail(email)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

}
