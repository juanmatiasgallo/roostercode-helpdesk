package com.roostercode.helpdesk.proveedor;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/proveedores")
public class ProveedorController {

    private final ProveedorRepository proveedorRepository;

    public ProveedorController(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody CrearProveedorRequest req) {
        if (proveedorRepository.existsByRut(req.rut())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un proveedor con ese RUT"));
        }
        if (proveedorRepository.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un proveedor con ese email"));
        }
        Proveedor nuevo = new Proveedor(
                req.empresa(), req.rut(), req.telefono(),
                req.direccion(), req.departamento(), req.email()
        );
        Proveedor guardado = proveedorRepository.saveAndFlush(nuevo);
        Proveedor completo = proveedorRepository.findById(guardado.getId()).orElse(guardado);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProveedorResponse.from(completo));
    }

    @GetMapping
    public List<ProveedorResponse> listar() {
        return proveedorRepository.findAllByOrderByEmpresaAsc()
                .stream()
                .map(ProveedorResponse::from)
                .toList();
    }
}
