package com.roostercode.helpdesk.sla;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sla")
public class SlaController {

    private final SlaObjetivoRepository repository;

    public SlaController(SlaObjetivoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<SlaObjetivoResponse> listar() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(o -> o.getPrioridad().ordinal()))
                .map(SlaObjetivoResponse::from)
                .toList();
    }

    @PutMapping
    public ResponseEntity<?> editar(@Valid @RequestBody EditarSlaRequest req) {
        for (SlaObjetivoItem item : req.items()) {
            SlaObjetivo objetivo = repository.findByPrioridad(item.prioridad()).orElse(null);
            if (objetivo == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("errores", Map.of("prioridad", "Prioridad desconocida: " + item.prioridad())));
            }
            objetivo.setHorasObjetivo(item.horasObjetivo());
            repository.save(objetivo);
        }
        return ResponseEntity.ok(listar());
    }
}
