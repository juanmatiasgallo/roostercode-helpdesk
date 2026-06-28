package com.roostercode.helpdesk.comentario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CrearComentarioRequest(
        @NotBlank String cuerpo,
        @NotNull  Visibilidad visibilidad
) {}
