package com.roostercode.helpdesk.proveedor;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProveedorResponse(
        UUID id,
        String empresa,
        String rut,
        String telefono,
        String direccion,
        Departamento departamento,
        String email,
        OffsetDateTime createdAt
) {
    public static ProveedorResponse from(Proveedor p) {
        return new ProveedorResponse(
                p.getId(), p.getEmpresa(), p.getRut(), p.getTelefono(),
                p.getDireccion(), p.getDepartamento(), p.getEmail(), p.getCreatedAt()
        );
    }
}
