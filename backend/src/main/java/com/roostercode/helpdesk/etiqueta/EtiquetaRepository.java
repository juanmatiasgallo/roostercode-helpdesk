package com.roostercode.helpdesk.etiqueta;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface EtiquetaRepository extends JpaRepository<Etiqueta, UUID> {
    List<Etiqueta> findAllByOrderByNombreAsc();
    boolean existsByNombre(String nombre);
    boolean existsByNombreAndIdNot(String nombre, UUID id);
}
