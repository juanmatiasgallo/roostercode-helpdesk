package com.roostercode.helpdesk.ticket;

import com.roostercode.helpdesk.categoria.Categoria;
import com.roostercode.helpdesk.cliente.Cliente;
import com.roostercode.helpdesk.etiqueta.Etiqueta;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Generado por la base de datos (IDENTITY). Solo lectura desde Java.
    @Column(name = "numero", insertable = false, updatable = false)
    private Long numero;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "text")
    private String descripcion;

    @Column(name = "cliente_nombre")
    private String clienteNombre;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "ticket_etiqueta",
            joinColumns = @JoinColumn(name = "ticket_id"),
            inverseJoinColumns = @JoinColumn(name = "etiqueta_id")
    )
    private Set<Etiqueta> etiquetas = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Prioridad prioridad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoTicket estado;

    // Generado por la base de datos (DEFAULT now()). Solo lectura desde Java.
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "resuelto_en")
    private OffsetDateTime resueltoEn;

    @Column(name = "cerrado_en")
    private OffsetDateTime cerradoEn;

    protected Ticket() {
        // requerido por JPA
    }

    public Ticket(String titulo, String descripcion, String clienteNombre, Prioridad prioridad) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.clienteNombre = clienteNombre;
        this.prioridad = prioridad;
        this.estado = EstadoTicket.ABIERTO;
    }

    public void aplicarTransicion(String accion) {
        switch (accion) {
            case "iniciar" -> {
                if (estado != EstadoTicket.ABIERTO)
                    throw new TransicionInvalidaException("Solo se puede iniciar un ticket ABIERTO (estado actual: " + estado + ")");
                estado = EstadoTicket.EN_PROGRESO;
            }
            case "resolver" -> {
                if (estado != EstadoTicket.ABIERTO && estado != EstadoTicket.EN_PROGRESO)
                    throw new TransicionInvalidaException("Solo se puede resolver un ticket ABIERTO o EN_PROGRESO (estado actual: " + estado + ")");
                estado = EstadoTicket.RESUELTO;
                resueltoEn = OffsetDateTime.now();
            }
            case "cerrar" -> {
                if (estado != EstadoTicket.RESUELTO)
                    throw new TransicionInvalidaException("Solo se puede cerrar un ticket RESUELTO (estado actual: " + estado + ")");
                estado = EstadoTicket.CERRADO;
                cerradoEn = OffsetDateTime.now();
            }
            case "reabrir" -> {
                if (estado == EstadoTicket.CERRADO) {
                    estado = EstadoTicket.ABIERTO;
                    cerradoEn = null;
                    resueltoEn = null;
                } else if (estado == EstadoTicket.RESUELTO) {
                    estado = EstadoTicket.EN_PROGRESO;
                    resueltoEn = null;
                } else {
                    throw new TransicionInvalidaException("Solo se puede reabrir un ticket RESUELTO o CERRADO (estado actual: " + estado + ")");
                }
            }
            default -> throw new TransicionInvalidaException("Acción desconocida: " + accion);
        }
    }

    public UUID getId() { return id; }
    public Long getNumero() { return numero; }
    public String getTitulo() { return titulo; }
    public String getDescripcion() { return descripcion; }
    public String getClienteNombre() { return clienteNombre; }
    public Cliente getCliente() { return cliente; }
    public Categoria getCategoria() { return categoria; }
    public Set<Etiqueta> getEtiquetas() { return etiquetas; }
    public Prioridad getPrioridad() { return prioridad; }
    public EstadoTicket getEstado() { return estado; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getResueltoEn() { return resueltoEn; }
    public OffsetDateTime getCerradoEn() { return cerradoEn; }

    public void setTitulo(String titulo) { this.titulo = titulo; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public void setPrioridad(Prioridad prioridad) { this.prioridad = prioridad; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public void setEtiquetas(Set<Etiqueta> etiquetas) { this.etiquetas = etiquetas; }
}
