package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.DeckUpdateDTO;
import com.projflashcards.backend.exception.ResourceNotFoundException;
import com.projflashcards.backend.model.Deck;
import com.projflashcards.backend.repository.DeckRepository;
import com.projflashcards.backend.security.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeckServiceTest {

    @Mock
    private DeckRepository deckRepository;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private DeckService deckService;

    @Test
    void updateChangesOnlyFieldsPresentInRequest() {
        var deck = new Deck("Título antigo", "Descrição antiga", "english", "A1", null);
        deck.setId(7L);
        when(deckRepository.findById(7L)).thenReturn(Optional.of(deck));
        when(deckRepository.save(deck)).thenReturn(deck);

        var result = deckService.update(
                7L,
                new DeckUpdateDTO("Título novo", null, null, "A2")
        );

        assertEquals("Título novo", result.title());
        assertEquals("Descrição antiga", result.description());
        assertEquals("english", result.language());
        assertEquals("A2", result.difficultyLevel());
        verify(deckRepository).save(deck);
    }

    @Test
    void updateThrowsWhenDeckDoesNotExist() {
        when(deckRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> deckService.update(99L, new DeckUpdateDTO("Título", null, null, null))
        );
        verify(deckRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deleteRemovesExistingDeck() {
        when(deckRepository.existsById(7L)).thenReturn(true);

        deckService.delete(7L);

        verify(deckRepository).deleteById(7L);
    }

    @Test
    void deleteThrowsWhenDeckDoesNotExist() {
        when(deckRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> deckService.delete(99L));
        verify(deckRepository, never()).deleteById(99L);
    }
}
