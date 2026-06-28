package com.roostercode.helpdesk.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Optional<Usuario> usuario = repository.findByEmail(req.email());

        if (usuario.isEmpty()
                || !usuario.get().isActivo()
                || !passwordEncoder.matches(req.password(), usuario.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales incorrectas"));
        }

        Usuario u = usuario.get();
        return ResponseEntity.ok(new LoginResponse(jwtService.generarToken(u), UsuarioResponse.from(u)));
    }

    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal Usuario usuario) {
        return UsuarioResponse.from(usuario);
    }
}
