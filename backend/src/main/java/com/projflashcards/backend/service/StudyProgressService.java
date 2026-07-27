package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.StudyProgressDTO;
import com.projflashcards.backend.dto.StudyProgressSaveDTO;
import com.projflashcards.backend.dto.StudyResultsDTO;
import com.projflashcards.backend.exception.ResourceNotFoundException;
import com.projflashcards.backend.model.StudyProgress;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.repository.StudyProgressRepository;
import com.projflashcards.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class StudyProgressService {

    private final StudyProgressRepository studyProgressRepository;
    private final DeckRepository deckRepository;
    private final SecurityUtils securityUtils;

    public StudyProgressService(StudyProgressRepository studyProgressRepository,
                                 DeckRepository deckRepository,
                                 SecurityUtils securityUtils) {
        this.studyProgressRepository = studyProgressRepository;
        this.deckRepository = deckRepository;
        this.securityUtils = securityUtils;
    }

    //Devolve o progresso salvo, ou um progresso "zerado" se o usuário nunca estudou esse deck
    @Transactional(readOnly = true)
    public StudyProgressDTO find(UUID userId, Long deckId) {
        securityUtils.validatePermissions(userId);

        return studyProgressRepository.findByUserIdAndDeckId(userId, deckId)
                .map(this::toDTO)
                .orElseGet(() -> new StudyProgressDTO(deckId, 0, false, false, new StudyResultsDTO(0, 0, 0), null));
    }

    //Cria ou atualiza (upsert) o progresso do usuário num deck
    @Transactional
    public StudyProgressDTO save(UUID userId, Long deckId, StudyProgressSaveDTO dto) {
        securityUtils.validatePermissions(userId);

        if (!deckRepository.existsById(deckId)) {
            throw new ResourceNotFoundException("Deck não encontrado");
        }

        var progress = studyProgressRepository.findByUserIdAndDeckId(userId, deckId)
                .orElseGet(() -> new StudyProgress(userId, deckId));

        progress.setCardIndex(dto.index());
        progress.setRevealed(dto.revealed());
        progress.setCompleted(dto.completed());
        progress.setAgainCount(dto.results().again());
        progress.setAlmostCount(dto.results().almost());
        progress.setEasyCount(dto.results().easy());

        progress = studyProgressRepository.save(progress);
        return toDTO(progress);
    }

    private StudyProgressDTO toDTO(StudyProgress progress) {
        return new StudyProgressDTO(
                progress.getDeckId(),
                progress.getCardIndex(),
                progress.isRevealed(),
                progress.isCompleted(),
                new StudyResultsDTO(progress.getAgainCount(), progress.getAlmostCount(), progress.getEasyCount()),
                progress.getUpdatedAt()
        );
    }
}
