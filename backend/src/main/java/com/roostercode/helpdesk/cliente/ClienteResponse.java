package com.roostercode.helpdesk.cliente;

import com.roostercode.helpdesk.proveedor.Departamento;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ClienteResponse(
        UUID id,
        String empresa,
        String rut,
        String telefono,
        String direccion,
        Departamento departamento,
        String email,
        OffsetDateTime createdAt
) {
    public static ClienteResponse from(Cliente c) {
        return new ClienteResponse(
                c.getId(), c.getEmpresa(), c.getRut(), c.getTelefono(),
                c.getDireccion(), c.getDepartamento(), c.getEmail(), c.getCreatedAt()
        );
    }
}
