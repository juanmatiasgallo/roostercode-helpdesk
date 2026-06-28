package com.roostercode.helpdesk.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UsuarioBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(UsuarioBootstrap.class);

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioBootstrap(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) return;

        String email    = System.getenv("ADMIN_EMAIL");
        String password = System.getenv("ADMIN_PASSWORD");

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "No hay usuarios en la base y ADMIN_EMAIL no está configurada. Imposible crear el admin inicial.");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalStateException(
                    "No hay usuarios en la base y ADMIN_PASSWORD no está configurada. Imposible crear el admin inicial.");
        }

        Usuario admin = new Usuario("Admin", email, passwordEncoder.encode(password), RolUsuario.ADMIN);
        repository.save(admin);
        log.info("Usuario admin creado con email: {}", email);
    }
}
