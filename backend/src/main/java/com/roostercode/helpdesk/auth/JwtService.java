package com.roostercode.helpdesk.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${JWT_SECRET:#{null}}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-hours:12}")
    private int expirationHours;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "La variable de entorno JWT_SECRET es obligatoria. La aplicación no puede arrancar sin ella.");
        }
        if (jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET debe tener al menos 32 caracteres para garantizar seguridad HS256.");
        }
        secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generarToken(Usuario usuario) {
        long ahora = System.currentTimeMillis();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("rol", usuario.getRol().name())
                .issuedAt(new Date(ahora))
                .expiration(new Date(ahora + (long) expirationHours * 3600 * 1000))
                .signWith(secretKey)
                .compact();
    }

    public String extraerEmail(String token) {
        return parsearClaims(token).getSubject();
    }

    public boolean esValido(String token, String emailEsperado) {
        try {
            String email = extraerEmail(token);
            return email.equals(emailEsperado) && !parsearClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parsearClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
