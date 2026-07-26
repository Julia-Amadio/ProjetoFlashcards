package com.projflashcards.backend.security;

import com.projflashcards.backend.model.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class SecurityUtils {

    public User getAuthenticatedUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Usuário não autenticado.");
        }
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            throw new AccessDeniedException("Credenciais inválidas.");
        }
        var user = userDetails.getUser();
        if (user == null) {
            throw new AccessDeniedException("Detalhes do usuário não encontrados.");
        }
        return user;
    }

    public void validatePermissions(UUID targetID) {
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
