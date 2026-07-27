package com.projflashcards.backend.service;

import com.projflashcards.backend.dto.UserPreferencesDTO;
import com.projflashcards.backend.dto.UserPreferencesSaveDTO;
import com.projflashcards.backend.exception.BadRequestException;
import com.projflashcards.backend.model.UserPreferences;
import com.projflashcards.backend.repository.UserPreferencesRepository;
import com.projflashcards.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserPreferencesService {

    //Únicos valores de meta diária que o app oferece — mesma lista usada no frontend (SettingsPage)
    private static final List<Integer> ALLOWED_DAILY_GOALS = List.of(5, 10, 15, 20, 30);

    private final UserPreferencesRepository userPreferencesRepository;
    private final SecurityUtils securityUtils;

    public UserPreferencesService(UserPreferencesRepository userPreferencesRepository, SecurityUtils securityUtils) {
        this.userPreferencesRepository = userPreferencesRepository;
        this.securityUtils = securityUtils;
    }

    //Devolve as preferências salvas, ou os padrões do app se o usuário nunca configurou nada
    @Transactional(readOnly = true)
    public UserPreferencesDTO find(UUID userId) {
        securityUtils.validatePermissions(userId);

        return userPreferencesRepository.findById(userId)
                .map(this::toDTO)
                .orElseGet(() -> new UserPreferencesDTO(10, false, true));
    }

    @Transactional
    public UserPreferencesDTO save(UUID userId, UserPreferencesSaveDTO dto) {
        securityUtils.validatePermissions(userId);

        if (!ALLOWED_DAILY_GOALS.contains(dto.dailyGoal())) {
            throw new BadRequestException("Meta diária inválida");
        }

        var preferences = userPreferencesRepository.findById(userId)
                .orElseGet(() -> new UserPreferences(userId));

        preferences.setDailyGoal(dto.dailyGoal());
        preferences.setAutoplayAudio(dto.autoplayAudio());
        preferences.setConfirmExit(dto.confirmExit());

        preferences = userPreferencesRepository.save(preferences);
        return toDTO(preferences);
    }

    private UserPreferencesDTO toDTO(UserPreferences preferences) {
        return new UserPreferencesDTO(preferences.getDailyGoal(), preferences.isAutoplayAudio(), preferences.isConfirmExit());
    }
}
