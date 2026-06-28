package com.roostercode.helpdesk.comentario;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ComentarioResponse(
        UUID id,
        String cuerpo,
        Visibilidad visibilidad,
        OffsetDateTime createdAt,
        String autorNombre,
        String autorEmail
) {
    public static ComentarioResponse from(Comentario c) {
        return new ComentarioResponse(
                c.getId(),
                c.getCuerpo(),
                c.getVisibilidad(),
                c.getCreatedAt(),
                c.getAutor().getNombre(),
                c.getAutor().getEmail()
        );
    }
}
