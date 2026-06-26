package com.roostercode.helpdesk.ticket;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketRepository repository;

    public TicketController(TicketRepository repository) {
        this.repository = repository;
    }

    // GET /api/v1/tickets  -> lista los tickets, del más nuevo al más viejo
    @GetMapping
    public List<Ticket> listar() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    // POST /api/v1/tickets -> crea un ticket
    @PostMapping
    public ResponseEntity<Ticket> crear(@Valid @RequestBody CrearTicketRequest req) {
        Prioridad prioridad = (req.prioridad() != null) ? req.prioridad() : Prioridad.MEDIA;
        Ticket nuevo = new Ticket(req.titulo(), req.descripcion(), req.clienteNombre(), prioridad);
        Ticket guardado = repository.saveAndFlush(nuevo);
        // Volvemos a leerlo para devolver "numero" y "createdAt", que los genera la base.
        Ticket completo = repository.findById(guardado.getId()).orElse(guardado);
        return ResponseEntity.status(HttpStatus.CREATED).body(completo);
    }
}
