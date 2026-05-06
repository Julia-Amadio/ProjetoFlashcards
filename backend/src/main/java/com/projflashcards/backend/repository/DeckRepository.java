package com.projflashcards.backend.repository;

import com.projflashcards.backend.model.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {

    //Retorna todos os decks de um idioma específico (Ex: "English")
    List<Deck> findByLanguageIgnoreCase(String language);

    //Retorna todos os decks criados por um usuário específico
    List<Deck> findByAuthorId(UUID authorId);

    //Ótimo para uma barra de pesquisa: busca decks onde o título contém a palavra
    List<Deck> findByTitleContainingIgnoreCase(String title);

    //Filtro combinado: Idioma + Dificuldade
    List<Deck> findByLanguageAndDifficultyLevel(String language, String difficultyLevel);
}
