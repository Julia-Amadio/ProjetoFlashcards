package com.projflashcards.backend.repository;

import com.projflashcards.backend.model.StudyProgress;
import com.projflashcards.backend.model.StudyProgressId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudyProgressRepository extends JpaRepository<StudyProgress, StudyProgressId> {
    Optional<StudyProgress> findByUserIdAndDeckId(UUID userId, Long deckId);
}
