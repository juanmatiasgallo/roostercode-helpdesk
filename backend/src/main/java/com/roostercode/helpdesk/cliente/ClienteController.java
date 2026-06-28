package com.roostercode.helpdesk.cliente;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CrearClienteRequest req) {
        if (clienteRepository.existsByRut(req.rut())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un cliente con ese RUT"));
        }
        if (clienteRepository.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un cliente con ese email"));
        }
        Cliente nuevo = new Cliente(
                req.empresa(), req.rut(), req.telefono(),
                req.direccion(), req.departamento(), req.email()
        );
        Cliente guardado = clienteRepository.saveAndFlush(nuevo);
        Cliente completo = clienteRepository.findById(guardado.getId()).orElse(guardado);
        return ResponseEntity.status(HttpStatus.CREATED).body(ClienteResponse.from(completo));
    }

    @GetMapping
    public List<ClienteResponse> listar() {
        return clienteRepository.findAllByOrderByEmpresaAsc()
                .stream()
                .map(ClienteResponse::from)
                .toList();
    }
}
