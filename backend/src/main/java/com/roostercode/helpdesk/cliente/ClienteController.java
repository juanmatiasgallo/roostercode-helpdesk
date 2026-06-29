package com.roostercode.helpdesk.cliente;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CrearClienteRequest req) {
        if (clienteRepository.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un cliente con ese email"));
        }
        Cliente nuevo = new Cliente(req.nombreCompleto(), req.celular(), req.email());
        Cliente guardado = clienteRepository.saveAndFlush(nuevo);
        Cliente completo = clienteRepository.findById(guardado.getId()).orElse(guardado);
        return ResponseEntity.status(HttpStatus.CREATED).body(ClienteResponse.from(completo));
    }

    @GetMapping
    public List<ClienteResponse> listar(@RequestParam(required = false) String q) {
        List<Cliente> clientes = (q != null && !q.isBlank())
                ? clienteRepository.findByNombreCompletoContainingIgnoreCaseOrderByNombreCompletoAsc(q.trim())
                : clienteRepository.findAllByOrderByNombreCompletoAsc();
        return clientes.stream().map(ClienteResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> obtener(@PathVariable UUID id) {
        return clienteRepository.findById(id)
                .map(c -> ResponseEntity.ok(ClienteResponse.from(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @Valid @RequestBody CrearClienteRequest req) {
        Cliente cliente = clienteRepository.findById(id).orElse(null);
        if (cliente == null) {
            return ResponseEntity.notFound().build();
        }
        if (clienteRepository.existsByEmailAndIdNot(req.email(), id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un cliente con ese email"));
        }
        cliente.setNombreCompleto(req.nombreCompleto());
        cliente.setCelular(req.celular());
        cliente.setEmail(req.email());
        return ResponseEntity.ok(ClienteResponse.from(clienteRepository.save(cliente)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        if (!clienteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clienteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
