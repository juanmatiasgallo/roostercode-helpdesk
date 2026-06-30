package com.roostercode.helpdesk.ticket;

import com.roostercode.helpdesk.categoria.CategoriaRepository;
import com.roostercode.helpdesk.cliente.Cliente;
import com.roostercode.helpdesk.cliente.ClienteRepository;
import com.roostercode.helpdesk.etiqueta.Etiqueta;
import com.roostercode.helpdesk.etiqueta.EtiquetaRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketRepository repository;
    private final ClienteRepository clienteRepository;
    private final CategoriaRepository categoriaRepository;
    private final EtiquetaRepository etiquetaRepository;

    public TicketController(TicketRepository repository,
                            ClienteRepository clienteRepository,
                            CategoriaRepository categoriaRepository,
                            EtiquetaRepository etiquetaRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.categoriaRepository = categoriaRepository;
        this.etiquetaRepository = etiquetaRepository;
    }

    @GetMapping
    public List<Ticket> listar(
            @RequestParam(required = false) EstadoTicket estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String clienteNombre,
            @RequestParam(required = false) UUID clienteId,
            @RequestParam(required = false) UUID categoriaId,
            @RequestParam(required = false) UUID etiquetaId
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
        if (clienteId != null) {
            stream = stream.filter(t -> t.getCliente() != null
                    && clienteId.equals(t.getCliente().getId()));
        } else if (clienteNombre != null && !clienteNombre.isBlank()) {
            String cnl = clienteNombre.trim().toLowerCase();
            stream = stream.filter(t -> t.getClienteNombre() != null
                    && t.getClienteNombre().toLowerCase().contains(cnl));
        }
        if (categoriaId != null) {
            stream = stream.filter(t -> t.getCategoria() != null
                    && categoriaId.equals(t.getCategoria().getId()));
        }
        if (etiquetaId != null) {
            stream = stream.filter(t -> t.getEtiquetas().stream()
                    .anyMatch(e -> etiquetaId.equals(e.getId())));
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

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> obtener(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new TicketNoEncontradoException(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @Valid @RequestBody CrearTicketRequest req) {
        Ticket ticket = repository.findById(id)
                .orElseThrow(() -> new TicketNoEncontradoException(id));
        ticket.setTitulo(req.titulo());
        ticket.setDescripcion(req.descripcion());
        ticket.setPrioridad(req.prioridad() != null ? req.prioridad() : ticket.getPrioridad());
        if (req.clienteId() != null) {
            Cliente cliente = clienteRepository.findById(req.clienteId()).orElse(null);
            if (cliente == null) {
                return ResponseEntity.badRequest().body(Map.of("errores", Map.of("clienteId", "Cliente no encontrado")));
            }
            ticket.setCliente(cliente);
        } else {
            ticket.setCliente(null);
        }
        if (req.categoriaId() != null) {
            categoriaRepository.findById(req.categoriaId()).ifPresent(ticket::setCategoria);
        } else {
            ticket.setCategoria(null);
        }
        List<Etiqueta> etqs = (req.etiquetaIds() != null && !req.etiquetaIds().isEmpty())
                ? etiquetaRepository.findAllById(req.etiquetaIds())
                : List.of();
        ticket.setEtiquetas(new HashSet<>(etqs));
        return ResponseEntity.ok(repository.save(ticket));
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CrearTicketRequest req) {
        Prioridad prioridad = (req.prioridad() != null) ? req.prioridad() : Prioridad.MEDIA;
        Ticket nuevo = new Ticket(req.titulo(), req.descripcion(), req.clienteNombre(), prioridad);
        if (req.clienteId() != null) {
            Cliente cliente = clienteRepository.findById(req.clienteId()).orElse(null);
            if (cliente == null) {
                return ResponseEntity.badRequest().body(Map.of("errores", Map.of("clienteId", "Cliente no encontrado")));
            }
            nuevo.setCliente(cliente);
        }
        if (req.categoriaId() != null) {
            categoriaRepository.findById(req.categoriaId()).ifPresent(nuevo::setCategoria);
        }
        if (req.etiquetaIds() != null && !req.etiquetaIds().isEmpty()) {
            nuevo.setEtiquetas(new HashSet<>(etiquetaRepository.findAllById(req.etiquetaIds())));
        }
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
