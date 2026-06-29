package com.roostercode.helpdesk.categoria;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CategoriaResponse(
        UUID id,
        String nombre,
        boolean activo,
        OffsetDateTime createdAt
) {
    public static CategoriaResponse from(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNombre(), c.isActivo(), c.getCreatedAt());
    }
}
