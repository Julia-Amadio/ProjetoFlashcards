package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.UserCreateDTO;
import com.projflashcards.backend.dto.UserResponseDTO;
import com.projflashcards.backend.dto.UserUpdateDTO;
import com.projflashcards.backend.model.User;
import com.projflashcards.backend.repository.UserRepository;
import com.projflashcards.backend.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service //Indica ao Spring que contém lógica de negócio
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponseDTO registerUser(UserCreateDTO dto) {
        //Regra 1: e-mail deve ser único
        if (userRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("E-mail já cadastrado.");
        }

        //Regra 2: nome de usuário deve ser único
        if (userRepository.existsByName(dto.name())) {
            throw new RuntimeException("Nome de usuário já está em uso.");
        }

        String encodedPassword = passwordEncoder.encode(dto.password());
        User newUser = new User(dto.name(), dto.email(), encodedPassword, "ROLE_USER");

        log.info("Registrando novo usuário: {}", dto.email());
        User savedUser = userRepository.save(newUser);
        return new UserResponseDTO(savedUser); //Converte aqui
    }

    @Transactional
    public UserResponseDTO updateUser(UUID id, UserUpdateDTO dto) {
        validatePermissions(id); // <--- Checagem

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        //Se enviou um nome diferente do atual, verifica se já não tem dono
        if (dto.name() != null && !dto.name().equals(user.getName())) {
            if (userRepository.existsByName(dto.name())) {
                throw new RuntimeException("Este nome de usuário já está em uso.");
            }
            user.setName(dto.name());
        }

        //Se enviou um e-mail diferente do atual, verifica se já não tem dono
        if (dto.email() != null && !dto.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.email())) {
                throw new RuntimeException("Este e-mail já está em uso.");
            }
            user.setEmail(dto.email());
        }

        if (dto.password() != null) {
            user.setPassword(passwordEncoder.encode(dto.password()));
        }

        User updatedUser = userRepository.save(user);
        return new UserResponseDTO(updatedUser); //Converte aqui
    }

    public List<UserResponseDTO> findAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<UserResponseDTO> findById(UUID id) {
        validatePermissions(id); // <--- Checagem

        return userRepository.findById(id)
                .map(UserResponseDTO::new);
    }

    //Método auxiliar para garantir que o usuário padrão possa visualizar ou alterar SOMENTE seus próprios dados
    private void validatePermissions(UUID targetID) {
        //Pega a autenticação atual do contexto do Spring Security
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        //1. Valida se a autenticação existe e se está de fato autenticada
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("ACESSO NEGADO: Usuário não autenticado.");
        }

        //2. Verifica se o Principal é exatamente do tipo que esperamos.
        //Pega do nosso UserDetailsImpl (que tem o usuário do banco)
        //O Java já faz o cast automático para a variável 'userDetails' aqui mesmo.
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            throw new AccessDeniedException("ACESSO NEGADO: Credenciais inválidas.");
        }

        var signedUser = userDetails.getUser();

        //3. Garantia extra de que o usuário existe no objeto
        if (signedUser == null) {
            throw new AccessDeniedException("ACESSO NEGADO: Detalhes do usuário não encontrados.");
        }

        //4. Verifica se ele NÃO é admin >E< se o ID dele é DIFERENTE do ID que ele está tentando acessar
        //Usa Yoda Condition: String literal ("ROLE_ADMIN") antes do .equals()
        //Evita NPE caso signedUser.getRole() retorne null por algum motivo bizarro no banco
        boolean isAdmin = "ROLE_ADMIN".equals(signedUser.getRole());
        boolean isOwner = signedUser.getId().equals(targetID);

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("ACESSO NEGADO: você não tem permissão para acessar os dados de outro usuário.");
        }
    }
}
