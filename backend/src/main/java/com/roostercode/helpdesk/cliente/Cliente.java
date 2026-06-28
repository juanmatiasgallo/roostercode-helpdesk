package com.roostercode.helpdesk.cliente;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nombre_completo", nullable = false, length = 255)
    private String nombreCompleto;

    @Column(nullable = false, length = 30)
    private String celular;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Cliente() {}

    public Cliente(String nombreCompleto, String celular, String email) {
        this.nombreCompleto = nombreCompleto;
        this.celular = celular;
        this.email = email;
    }

    public UUID getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getCelular() { return celular; }
    public String getEmail() { return email; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
