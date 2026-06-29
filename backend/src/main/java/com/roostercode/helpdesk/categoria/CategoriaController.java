package com.roostercode.helpdesk.categoria;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categorias")
public class CategoriaController {

    private final CategoriaRepository repository;

    public CategoriaController(CategoriaRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CategoriaRequest req) {
        if (repository.existsByNombre(req.nombre().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe una categoría con ese nombre"));
        }
        Categoria nueva = new Categoria(req.nombre().trim());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(CategoriaResponse.from(repository.save(nueva)));
    }

    @GetMapping
    public List<CategoriaResponse> listar() {
        return repository.findAllByOrderByNombreAsc()
                .stream().map(CategoriaResponse::from).toList();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @Valid @RequestBody CategoriaRequest req) {
        Categoria cat = repository.findById(id).orElse(null);
        if (cat == null) return ResponseEntity.notFound().build();
        if (repository.existsByNombreAndIdNot(req.nombre().trim(), id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe una categoría con ese nombre"));
        }
        cat.setNombre(req.nombre().trim());
        if (req.activo() != null) cat.setActivo(req.activo());
        return ResponseEntity.ok(CategoriaResponse.from(repository.save(cat)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
