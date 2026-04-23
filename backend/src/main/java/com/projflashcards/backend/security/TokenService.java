package com.projflashcards.backend.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.projflashcards.backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    //Injeta o valor que definimos no application.properties
    @Value("${api.security.token.secret}")
    private String secret;

    /*
     * Gera o token JWT para um usuário que acabou de se autenticar.
     */
    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("auth-api") //Identifica quem gerou o token
                    .withSubject(user.getEmail()) //Guarda o email do usuário (o dono do token)
                    .withExpiresAt(genExpirationDate()) //Define quando o token expira
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token", exception);
        }
    }

    /*
     * Valida o token e retorna o email (subject) contido nele.
     * Se o token for inválido ou expirado, retorna uma String vazia ou nula.
     */
    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("auth-api")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException exception) {
            //Em vez de estourar erro, retornamos vazio para o filtro saber que não deu certo
            return "";
        }
    }

    /*
     * Define o tempo de expiração. Ex: 4 horas a partir de agora.
     */
    private Instant genExpirationDate() {
        return LocalDateTime.now().plusHours(4).toInstant(ZoneOffset.of("-03:00"));
    }
}