package com.projflashcards.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {
    @Autowired
    SecurityFilter securityFilter;

    //Lista separada por virgula das origens liberadas a chamar a API pelo navegador.
    //Default cobre só o Vite local; em produção, adiciona a URL do Vercel via env var
    //CORS_ALLOWED_ORIGINS, sem precisar mudar código nenhum.
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return  httpSecurity
        /* Desabilita a proteção CSRF. Essencial para conseguir fazer requisições POST pelo Postman/Front-end
         * Optando por JWT + Header de autorização, deve ficar desativado mesmo em prod. */
		.csrf(csrf -> csrf.disable())
            //Libera CORS pras origens configuradas (ver corsConfigurationSource() logo abaixo) -
            //sem isso, o navegador bloqueia toda chamada do front quando front e backend estão
            //em domínios diferentes (é o caso assim que o front for deployado separado).
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            //Muda a gestão de sessão para STATELESS (o padrão do Spring é criar sessão, mas com JWT não usamos isso)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
					//Rotas públicas — não exigem token
					.requestMatchers(HttpMethod.POST, "/login").permitAll()
					.requestMatchers(HttpMethod.POST, "/users").permitAll()

					//Swagger/OpenAPI — acessível sem token em dev
					.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

					//Health check para a plataforma de deploy (Render/Railway/Fly.io)
					.requestMatchers(HttpMethod.GET, "/health").permitAll()

					//Rotas administrativas — apenas usuários com ROLE_ADMIN
					.requestMatchers(HttpMethod.GET, "/users").hasAuthority("ROLE_ADMIN")
					//"/users/*" (um segmento só) para não capturar "/users/{id}/favorites/{deckId}",
					//que precisa ficar liberado para o próprio usuário remover seus favoritos.
					.requestMatchers(HttpMethod.DELETE, "/users/*").hasAuthority("ROLE_ADMIN")
					.requestMatchers(HttpMethod.POST, "/decks/generate").hasAuthority("ROLE_ADMIN")
					.requestMatchers(HttpMethod.POST, "/decks").hasAuthority("ROLE_ADMIN")
					.requestMatchers(HttpMethod.POST, "/decks/*/flashcards").hasAuthority("ROLE_ADMIN")
					.requestMatchers(HttpMethod.PUT, "/flashcards/**").hasAuthority("ROLE_ADMIN")
					.requestMatchers(HttpMethod.DELETE, "/flashcards/**").hasAuthority("ROLE_ADMIN")

					//Qualquer outra requisição precisará de um token JWT válido
					.anyRequest().authenticated()
            )
			//Coloca o nosso filtro de JWT ANTES do filtro padrão do Spring
			.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
			.build();
    }

    //Monta a política de CORS a partir de app.cors.allowed-origins (ver campo acima).
    //Não é @Bean pra poder ser chamado direto dentro do securityFilterChain acima.
    private CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
    	return authenticationConfiguration.getAuthenticationManager();
	}

	/** 
	 * --- TRAZIDO DO DEFUNTO (config.SecurityConfig) ---
	 * O Spring precisa saber como comparar a senha digitada no login com o Hash do banco
     */ 
	@Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
