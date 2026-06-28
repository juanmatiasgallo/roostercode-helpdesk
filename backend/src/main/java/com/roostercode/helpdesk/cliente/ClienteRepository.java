package com.roostercode.helpdesk.cliente;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {
    List<Cliente> findAllByOrderByEmpresaAsc();
    boolean existsByRut(String rut);
    boolean existsByEmail(String email);
}
