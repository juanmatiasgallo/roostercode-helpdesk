package com.roostercode.helpdesk.categoria;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "categoria")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Categoria() {}

    public Categoria(String nombre) {
        this.nombre = nombre;
        this.activo = true;
    }

    public UUID getId() { return id; }
    public String getNombre() { return nombre; }
    public boolean isActivo() { return activo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
