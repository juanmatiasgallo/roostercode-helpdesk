package com.roostercode.helpdesk.cliente;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {
    List<Cliente> findAllByOrderByNombreCompletoAsc();
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, UUID id);
}
