package com.roostercode.helpdesk.ticket;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketRepository repository;

    public TicketController(TicketRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Ticket> listar(
            @RequestParam(required = false) EstadoTicket estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) String q
    ) {
        Stream<Ticket> stream = repository.findAllByOrderByCreatedAtDesc().stream();
        if (estado != null) stream = stream.filter(t -> t.getEstado() == estado);
        if (desde != null) stream = stream.filter(t -> !t.getCreatedAt().toLocalDate().isBefore(desde));
        if (hasta != null) stream = stream.filter(t -> !t.getCreatedAt().toLocalDate().isAfter(hasta));
        if (q != null && !q.isBlank()) {
            String ql = q.trim().toLowerCase();
            stream = stream.filter(t -> t.getTitulo().toLowerCase().contains(ql)
                    || t.getNumero().toString().contains(q.trim()));
        }
        return stream.collect(Collectors.toList());
    }

    @GetMapping("/resumen")
    public TicketResumenResponse resumen() {
        long abiertos = repository.countByEstado(EstadoTicket.ABIERTO);
        long enProgreso = repository.countByEstado(EstadoTicket.EN_PROGRESO);
        long resueltos = repository.countByEstado(EstadoTicket.RESUELTO);
        long cerrados = repository.countByEstado(EstadoTicket.CERRADO);
        long total = repository.count();
        List<Ticket> conFecha = repository.findByResueltoEnIsNotNull();
        Double promedio = conFecha.isEmpty() ? null :
                conFecha.stream()
                        .mapToDouble(t -> Duration.between(t.getCreatedAt(), t.getResueltoEn()).toMinutes() / 60.0)
                        .average()
                        .getAsDouble();
        return new TicketResumenResponse(abiertos, enProgreso, resueltos, cerrados, total, promedio);
    }

    @PostMapping
    public ResponseEntity<Ticket> crear(@Valid @RequestBody CrearTicketRequest req) {
        Prioridad prioridad = (req.prioridad() != null) ? req.prioridad() : Prioridad.MEDIA;
        Ticket nuevo = new Ticket(req.titulo(), req.descripcion(), req.clienteNombre(), prioridad);
        Ticket guardado = repository.saveAndFlush(nuevo);
        // Volvemos a leerlo para devolver "numero" y "createdAt", que los genera la base.
        Ticket completo = repository.findById(guardado.getId()).orElse(guardado);
        return ResponseEntity.status(HttpStatus.CREATED).body(completo);
    }

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<Ticket> iniciar(@PathVariable UUID id) {
        return transicionar(id, "iniciar");
    }

    @PostMapping("/{id}/resolver")
    public ResponseEntity<Ticket> resolver(@PathVariable UUID id) {
        return transicionar(id, "resolver");
    }

    @PostMapping("/{id}/cerrar")
    public ResponseEntity<Ticket> cerrar(@PathVariable UUID id) {
        return transicionar(id, "cerrar");
    }

    @PostMapping("/{id}/reabrir")
    public ResponseEntity<Ticket> reabrir(@PathVariable UUID id) {
        return transicionar(id, "reabrir");
    }

    private ResponseEntity<Ticket> transicionar(UUID id, String accion) {
        Ticket ticket = repository.findById(id)
                .orElseThrow(() -> new TicketNoEncontradoException(id));
        ticket.aplicarTransicion(accion);
        return ResponseEntity.ok(repository.save(ticket));
    }

    @ExceptionHandler(TransicionInvalidaException.class)
    public ResponseEntity<Map<String, String>> handleTransicionInvalida(TransicionInvalidaException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(TicketNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> handleNoEncontrado(TicketNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }
}
