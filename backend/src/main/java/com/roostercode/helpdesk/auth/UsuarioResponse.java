package com.roostercode.helpdesk.auth;

import java.util.UUID;

public record UsuarioResponse(UUID id, String nombre, String email, RolUsuario rol, boolean activo) {

    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getEmail(), u.getRol(), u.isActivo());
    }
}
