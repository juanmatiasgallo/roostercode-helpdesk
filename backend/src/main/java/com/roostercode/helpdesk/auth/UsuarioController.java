package com.roostercode.helpdesk.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CrearUsuarioRequest req) {
        if (repository.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un usuario con ese email"));
        }
        RolUsuario rol = (req.rol() != null) ? req.rol() : RolUsuario.AGENTE;
        Usuario nuevo = new Usuario(req.nombre(), req.email(), passwordEncoder.encode(req.password()), rol);
        Usuario guardado = repository.saveAndFlush(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioResponse.from(guardado));
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return repository.findAllByOrderByNombreAsc().stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @Valid @RequestBody EditarUsuarioRequest req) {
        Usuario usuario = repository.findById(id).orElse(null);
        if (usuario == null) return ResponseEntity.notFound().build();
        usuario.setNombre(req.nombre());
        if (req.rol() != null) usuario.setRol(req.rol());
        return ResponseEntity.ok(UsuarioResponse.from(repository.save(usuario)));
    }

    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activar(@PathVariable UUID id) {
        Usuario usuario = repository.findById(id).orElse(null);
        if (usuario == null) return ResponseEntity.notFound().build();
        usuario.setActivo(true);
        return ResponseEntity.ok(UsuarioResponse.from(repository.save(usuario)));
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivar(@PathVariable UUID id) {
        Usuario usuario = repository.findById(id).orElse(null);
        if (usuario == null) return ResponseEntity.notFound().build();
        usuario.setActivo(false);
        return ResponseEntity.ok(UsuarioResponse.from(repository.save(usuario)));
    }
}
