package com.roostercode.helpdesk.proveedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CrearProveedorRequest(

    @NotBlank(message = "La empresa es obligatoria")
    String empresa,

    @NotBlank(message = "El RUT es obligatorio")
    @Pattern(regexp = "\\d{12}", message = "El RUT debe tener exactamente 12 dígitos numéricos")
    String rut,

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "\\+?\\d[\\d\\s\\-]{4,18}", message = "Formato de teléfono inválido (dígitos, +, espacios o guiones)")
    String telefono,

    @NotBlank(message = "La dirección es obligatoria")
    String direccion,

    @NotNull(message = "El departamento es obligatorio")
    Departamento departamento,

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    String email
) {}
