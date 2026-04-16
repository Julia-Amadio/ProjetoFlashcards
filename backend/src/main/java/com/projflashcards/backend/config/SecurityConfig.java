package com.projflashcards.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                /* Desabilita a proteção CSRF. Essencial para conseguir fazer requisições POST pelo Postman
                 * https://owasp.org/www-community/attacks/csrf
                 * Optando por JWT + Header de autorização (provavel), deve ficar desativado em prod
                 * Teremos que focar em proteger melhor contra XSS (https://owasp.org/www-community/attacks/xss/)
                 * Vou pesquisar melhor sobre quando puder
                 * */
                .csrf(csrf -> csrf.disable())
                //Configura as permissões de rota
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() //Libera TODAS as rotas TEMPORARIAMENTE!!!
                );

        return http.build();
    }
}
