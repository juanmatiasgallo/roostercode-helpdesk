package com.roostercode.helpdesk.proveedor;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProveedorRepository extends JpaRepository<Proveedor, UUID> {
    List<Proveedor> findAllByOrderByEmpresaAsc();
    boolean existsByRut(String rut);
    boolean existsByEmail(String email);
    boolean existsByRutAndIdNot(String rut, UUID id);
    boolean existsByEmailAndIdNot(String email, UUID id);
}
