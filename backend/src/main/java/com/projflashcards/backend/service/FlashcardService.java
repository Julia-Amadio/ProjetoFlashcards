package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.FlashcardCreateDTO;
import com.projflashcards.backend.dto.FlashcardDTO;
import com.projflashcards.backend.dto.FlashcardUpdateDTO;
import com.projflashcards.backend.model.Flashcard;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.repository.FlashcardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;
    private final DeckRepository deckRepository;

    public FlashcardService(FlashcardRepository flashcardRepository, DeckRepository deckRepository) {
        this.flashcardRepository = flashcardRepository;
        this.deckRepository = deckRepository;
    }

    @Transactional
    public FlashcardDTO create(Long deckId, FlashcardCreateDTO dto) {
        var deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado"));

        var card = new Flashcard(deck, dto.targetWord(), dto.phoneticReading(),
                dto.nativeTranslation(), dto.partOfSpeech(), dto.targetSentence(),
                dto.sentencePhonetic(), dto.sentenceTranslation());
        card = flashcardRepository.save(card);
        return toDTO(card);
    }

    @Transactional(readOnly = true)
    public List<FlashcardDTO> listByDeck(Long deckId) {
        return flashcardRepository.findByDeckId(deckId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public FlashcardDTO findById(Long id) {
        var card = flashcardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flashcard não encontrado"));
        return toDTO(card);
    }

    @Transactional
    public FlashcardDTO update(Long id, FlashcardUpdateDTO dto) {
        var card = flashcardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flashcard não encontrado"));

        if (dto.targetWord() != null) card.setTargetWord(dto.targetWord());
        if (dto.phoneticReading() != null) card.setPhoneticReading(dto.phoneticReading());
        if (dto.nativeTranslation() != null) card.setNativeTranslation(dto.nativeTranslation());
        if (dto.partOfSpeech() != null) card.setPartOfSpeech(dto.partOfSpeech());
        if (dto.targetSentence() != null) card.setTargetSentence(dto.targetSentence());
        if (dto.sentencePhonetic() != null) card.setSentencePhonetic(dto.sentencePhonetic());
        if (dto.sentenceTranslation() != null) card.setSentenceTranslation(dto.sentenceTranslation());

        card = flashcardRepository.save(card);
        return toDTO(card);
    }

    @Transactional
    public void delete(Long id) {
        if (!flashcardRepository.existsById(id)) {
            throw new RuntimeException("Flashcard não encontrado");
        }
        flashcardRepository.deleteById(id);
    }

    private FlashcardDTO toDTO(Flashcard card) {
        return new FlashcardDTO(
                card.getId(), card.getTargetWord(), card.getPhoneticReading(),
                card.getNativeTranslation(), card.getPartOfSpeech(), card.getTargetSentence(),
                card.getSentencePhonetic(), card.getSentenceTranslation()
        );
    }
}
