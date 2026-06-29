package com.roostercode.helpdesk.etiqueta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EtiquetaRequest(
        @NotBlank String nombre,
        @NotBlank @Pattern(
                regexp = "^#[0-9A-Fa-f]{6}$",
                message = "El color debe ser un valor hexadecimal válido (#RRGGBB)"
        ) String color
) {}
