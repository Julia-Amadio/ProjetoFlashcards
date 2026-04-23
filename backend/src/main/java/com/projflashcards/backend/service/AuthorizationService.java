package com.projflashcards.backend.service;

import com.projflashcards.backend.model.User;
import com.projflashcards.backend.repository.UserRepository;
import com.projflashcards.backend.security.UserDetailsImpl;

import org.jspecify.annotations.NonNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService implements UserDetailsService {

    private final UserRepository userRepository;

    //Injeção de dependência via construtor (a mesma boa prática do Controller)
    public AuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /* ------------------------------ MÉTODO ANTIGO - AINDA NÃO TINHAMOS UserDetailsImpl ----------------------------
    * Null safety: a interface original UserDetailsService do Spring diz que quem implementar
    * o método nunca pode retornar um valor nulo e não pode receber um username nulo.
    * Para evitar warnings, usa-se @NonNull no que é enviado para o método e no retorno do método.
    @Override
    @NonNull
    public UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        //O Spring Security sempre chama o parâmetro de "username",
        //mas no nosso banco nós definimos que o login será feito pelo email.
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + username));

        //Como a nossa entidade User não implementa UserDetails diretamente,
        //construimos o UserDetails esperado pelo Spring Security aqui mesmo.
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole()) //Ex: "ROLE_USER" ou "ROLE_ADMIN"
                .build();
    }*/

    @Override
    @NonNull
    public UserDetails loadUserByUsername(@NonNull String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + username));

        //Mais limpo e direto:
        return new UserDetailsImpl(user); 
    }
}
