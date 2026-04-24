package com.projflashcards.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
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

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {
    @Autowired
    SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return  httpSecurity
        /* Desabilita a proteção CSRF. Essencial para conseguir fazer requisições POST pelo Postman/Front-end
         * Optando por JWT + Header de autorização, deve ficar desativado mesmo em prod. */
		.csrf(csrf -> csrf.disable())
            //Muda a gestão de sessão para STATELESS (o padrão do Spring é criar sessão, mas com JWT não usamos isso)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
					//IMPORTANTE: usar .hasAuthority() ao invés de .hasRole().

					//IMPORTANTE: liberar a rota de login, senão ninguém consegue gerar o token.
					.requestMatchers(HttpMethod.POST, "/login").permitAll()

					//Libera o cadastro de usuários
					.requestMatchers(HttpMethod.POST, "/users").permitAll()

					//Protege rota de listagem de usuários para apenas ADMINs
					.requestMatchers(HttpMethod.GET, "/users").hasAuthority("ROLE_ADMIN")

					//Qualquer outra requisição precisará de um token JWT válido
					.anyRequest().authenticated()
            )
			//Coloca o nosso filtro de JWT ANTES do filtro padrão do Spring
			.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
			.build();
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
