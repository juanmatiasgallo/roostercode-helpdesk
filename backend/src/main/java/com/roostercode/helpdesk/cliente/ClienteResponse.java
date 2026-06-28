package com.roostercode.helpdesk.cliente;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ClienteResponse(
        UUID id,
        String nombreCompleto,
        String celular,
        String email,
        OffsetDateTime createdAt
) {
    public static ClienteResponse from(Cliente c) {
        return new ClienteResponse(
                c.getId(), c.getNombreCompleto(), c.getCelular(), c.getEmail(), c.getCreatedAt()
        );
    }
}
