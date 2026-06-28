package com.roostercode.helpdesk.auth;

public record LoginResponse(String token, UsuarioResponse usuario) {}
