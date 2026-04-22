package com.projflashcards.backend.repository;

import com.projflashcards.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    //Email já indexado no bd, então esse método fará buscas instantâneas
    Optional<User> findByEmail(String email);

    Optional<User> findByName(String name);

    //Métodos otimizados para checar existência antes de salvar
    boolean existsByEmail(String email);
    boolean existsByName(String name);
}
