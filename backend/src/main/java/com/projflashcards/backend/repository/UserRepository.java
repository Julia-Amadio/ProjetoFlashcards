package com.projflashcards.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.projflashcards.backend.model.User;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Email já indexado no bd, então esse método fará buscas instantâneas
    Optional<User> findByEmail(String email);

    Optional<User> findByName(String name);
}
