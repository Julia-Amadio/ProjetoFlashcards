package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.UserCreateDTO;
import com.projflashcards.backend.dto.UserResponseDTO;
import com.projflashcards.backend.dto.UserUpdateDTO;
import com.projflashcards.backend.exception.ConflictException;
import com.projflashcards.backend.exception.ResourceNotFoundException;
import com.projflashcards.backend.model.User;
import com.projflashcards.backend.repository.UserRepository;
import com.projflashcards.backend.security.SecurityUtils;
import com.projflashcards.backend.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service //Indica ao Spring que contém lógica de negócio
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils; //<--- NOVA INJEÇÃO

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public UserResponseDTO registerUser(UserCreateDTO dto) {
        //Regra 1: e-mail deve ser único
        if (userRepository.existsByEmail(dto.email())) {
            throw new ConflictException("E-mail já cadastrado.");
        }

        //Regra 2: nome de usuário deve ser único
        if (userRepository.existsByName(dto.name())) {
            throw new ConflictException("Nome de usuário já está em uso.");
        }

        String encodedPassword = passwordEncoder.encode(dto.password());
        User newUser = new User(dto.name(), dto.email(), encodedPassword, "ROLE_USER");

        log.info("Registrando novo usuário: {}", dto.email());
        User savedUser = userRepository.save(newUser);
        return new UserResponseDTO(savedUser); //Converte aqui
    }

    @Transactional
    public UserResponseDTO updateUser(UUID id, UserUpdateDTO dto) {
        securityUtils.validatePermissions(id); //<--- Chamando agora do Utils

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        //Se enviou um nome diferente do atual, verifica se já não tem dono
        if (dto.name() != null && !dto.name().equals(user.getName())) {
            if (userRepository.existsByName(dto.name())) {
                throw new ConflictException("Este nome de usuário já está em uso.");
            }
            user.setName(dto.name());
        }

        //Se enviou um e-mail diferente do atual, verifica se já não tem dono
        if (dto.email() != null && !dto.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.email())) {
                throw new ConflictException("Este e-mail já está em uso.");
            }
            user.setEmail(dto.email());
        }

        if (dto.password() != null) {
            user.setPassword(passwordEncoder.encode(dto.password()));
        }

        User updatedUser = userRepository.save(user);
        return new UserResponseDTO(updatedUser); //Converte aqui
    }

    //Paginado pelo mesmo motivo do DeckService: evita devolver a tabela de usuários inteira
    //numa única resposta.
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> findAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponseDTO::new);
    }

    public Optional<UserResponseDTO> findById(UUID id) {
        securityUtils.validatePermissions(id);

        return userRepository.findById(id)
                .map(UserResponseDTO::new);
    }
}
