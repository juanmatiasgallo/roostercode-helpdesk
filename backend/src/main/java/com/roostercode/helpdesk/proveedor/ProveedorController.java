package com.roostercode.helpdesk.proveedor;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable UUID id, @Valid @RequestBody CrearProveedorRequest req) {
        Proveedor proveedor = proveedorRepository.findById(id).orElse(null);
        if (proveedor == null) {
            return ResponseEntity.notFound().build();
        }
        if (proveedorRepository.existsByRutAndIdNot(req.rut(), id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un proveedor con ese RUT"));
        }
        if (proveedorRepository.existsByEmailAndIdNot(req.email(), id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Ya existe un proveedor con ese email"));
        }
        proveedor.setEmpresa(req.empresa());
        proveedor.setRut(req.rut());
        proveedor.setTelefono(req.telefono());
        proveedor.setDireccion(req.direccion());
        proveedor.setDepartamento(req.departamento());
        proveedor.setEmail(req.email());
        return ResponseEntity.ok(ProveedorResponse.from(proveedorRepository.save(proveedor)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        if (!proveedorRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        proveedorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
