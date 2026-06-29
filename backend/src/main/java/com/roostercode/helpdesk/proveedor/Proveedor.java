package com.roostercode.helpdesk.proveedor;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "proveedor")
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String empresa;

    @Column(nullable = false, length = 12)
    private String rut;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(nullable = false, columnDefinition = "text")
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Departamento departamento;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Proveedor() {}

    public Proveedor(String empresa, String rut, String telefono, String direccion,
                     Departamento departamento, String email) {
        this.empresa = empresa;
        this.rut = rut;
        this.telefono = telefono;
        this.direccion = direccion;
        this.departamento = departamento;
        this.email = email;
    }

    public UUID getId() { return id; }
    public String getEmpresa() { return empresa; }
    public String getRut() { return rut; }
    public String getTelefono() { return telefono; }
    public String getDireccion() { return direccion; }
    public Departamento getDepartamento() { return departamento; }
    public String getEmail() { return email; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setEmpresa(String empresa) { this.empresa = empresa; }
    public void setRut(String rut) { this.rut = rut; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public void setDepartamento(Departamento departamento) { this.departamento = departamento; }
    public void setEmail(String email) { this.email = email; }
}
