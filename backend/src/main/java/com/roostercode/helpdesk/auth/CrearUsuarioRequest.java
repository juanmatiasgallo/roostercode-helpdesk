package com.roostercode.helpdesk.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CrearUsuarioRequest(
        @NotBlank String nombre,
        @NotBlank @Email String email,
        RolUsuario rol,
        @NotBlank String password
) {}
