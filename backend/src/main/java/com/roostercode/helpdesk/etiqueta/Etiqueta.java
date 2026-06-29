package com.roostercode.helpdesk.etiqueta;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "etiqueta")
public class Etiqueta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false, length = 7)
    private String color;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Etiqueta() {}

    public Etiqueta(String nombre, String color) {
        this.nombre = nombre;
        this.color = color;
    }

    public UUID getId() { return id; }
    public String getNombre() { return nombre; }
    public String getColor() { return color; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setColor(String color) { this.color = color; }
}
