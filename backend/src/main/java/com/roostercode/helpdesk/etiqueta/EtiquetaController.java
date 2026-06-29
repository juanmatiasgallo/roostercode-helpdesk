package com.roostercode.helpdesk.etiqueta;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/etiquetas")
public class EtiquetaController {

    private final EtiquetaRepository repository;

    public EtiquetaController(EtiquetaRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody EtiquetaRequest req) {
        if (repository.existsByNombre(req.nombre().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe una etiqueta con ese nombre"));
        }
        Etiqueta nueva = new Etiqueta(req.nombre().trim(), req.color());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(EtiquetaResponse.from(repository.save(nueva)));
    }

    @GetMapping
    public List<EtiquetaResponse> listar() {
        return repository.findAllByOrderByNombreAsc()
                .stream().map(EtiquetaResponse::from).toList();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @Valid @RequestBody EtiquetaRequest req) {
        Etiqueta etiqueta = repository.findById(id).orElse(null);
        if (etiqueta == null) return ResponseEntity.notFound().build();
        if (repository.existsByNombreAndIdNot(req.nombre().trim(), id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe una etiqueta con ese nombre"));
        }
        etiqueta.setNombre(req.nombre().trim());
        etiqueta.setColor(req.color());
        return ResponseEntity.ok(EtiquetaResponse.from(repository.save(etiqueta)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
