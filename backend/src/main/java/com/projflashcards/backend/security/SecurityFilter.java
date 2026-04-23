package com.projflashcards.backend.security;

import com.projflashcards.backend.service.AuthorizationService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final AuthorizationService authorizationService; //<-- MUDOU AQUI!!

    //Injeção via construtor
    public SecurityFilter(TokenService tokenService, AuthorizationService authorizationService) {
        this.tokenService = tokenService;
        this.authorizationService = authorizationService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        var token = this.recoverToken(request);
        
        if (token != null) {
            var email = tokenService.validateToken(token);
            
            if (!email.isEmpty()) {
                //Buscamos o usuário no banco para garantir que ele ainda existe e pegar as Roles
                //Aqui o Spring já recebe o nosso UserDetailsImpl redondinho!
                var userDetails = authorizationService.loadUserByUsername(email);//Cria o objeto de autenticação que o Spring Security entende
                
                //Passamos o usuário, a senha (null por segurança aqui) e as autoridades (Roles)
                var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                //"Carimba" a requisição como autenticada no contexto do Spring
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        
        //Segue o fluxo para o próximo filtro ou para o Controller
        filterChain.doFilter(request, response);
    }

    /*
     * Método auxiliar para extrair o token do cabeçalho 'Authorization'
     */
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}
