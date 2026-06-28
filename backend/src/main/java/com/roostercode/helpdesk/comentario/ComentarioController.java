package com.roostercode.helpdesk.comentario;

import com.roostercode.helpdesk.auth.Usuario;
import com.roostercode.helpdesk.ticket.Ticket;
import com.roostercode.helpdesk.ticket.TicketNoEncontradoException;
import com.roostercode.helpdesk.ticket.TicketRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comentarios")
public class ComentarioController {

    private final ComentarioRepository comentarioRepository;
    private final TicketRepository ticketRepository;

    public ComentarioController(ComentarioRepository comentarioRepository, TicketRepository ticketRepository) {
        this.comentarioRepository = comentarioRepository;
        this.ticketRepository = ticketRepository;
    }

    @PostMapping
    public ResponseEntity<ComentarioResponse> crear(
            @PathVariable UUID ticketId,
            @Valid @RequestBody CrearComentarioRequest req,
            @AuthenticationPrincipal Usuario autor) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNoEncontradoException(ticketId));

        Comentario nuevo = new Comentario(ticket, autor, req.cuerpo(), req.visibilidad());
        Comentario guardado = comentarioRepository.saveAndFlush(nuevo);
        // Re-leemos para obtener created_at generado por la base.
        Comentario completo = comentarioRepository.findById(guardado.getId()).orElse(guardado);
        return ResponseEntity.status(HttpStatus.CREATED).body(ComentarioResponse.from(completo));
    }

    @GetMapping
    public List<ComentarioResponse> listar(@PathVariable UUID ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new TicketNoEncontradoException(ticketId);
        }
        return comentarioRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(ComentarioResponse::from)
                .toList();
    }

    @ExceptionHandler(TicketNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> handleNoEncontrado(TicketNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }
}
