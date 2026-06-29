package com.roostercode.helpdesk.etiqueta;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EtiquetaResponse(
        UUID id,
        String nombre,
        String color,
        OffsetDateTime createdAt
) {
    public static EtiquetaResponse from(Etiqueta e) {
        return new EtiquetaResponse(e.getId(), e.getNombre(), e.getColor(), e.getCreatedAt());
    }
}
