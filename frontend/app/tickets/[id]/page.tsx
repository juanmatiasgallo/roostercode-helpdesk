"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ComentariosTicket from "../../components/ComentariosTicket";
import ClienteSelector from "../../components/ClienteSelector";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type EstadoType = "ABIERTO" | "EN_PROGRESO" | "RESUELTO" | "CERRADO";
type Accion = "iniciar" | "resolver" | "cerrar" | "reabrir";
type Categoria   = { id: string; nombre: string; activo: boolean };
type Etiqueta    = { id: string; nombre: string; color: string };
type ClienteInfo = { id: string; nombreCompleto: string };
type UsuarioInfo = { id: string; nombre: string; activo: boolean };

type Ticket = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  clienteNombre: string | null;
  cliente: ClienteInfo | null;
  responsable: UsuarioInfo | null;
  categoria: Categoria | null;
  etiquetas: Etiqueta[];
  prioridad: string;
  estado: EstadoType;
  createdAt: string;
  resueltoEn: string | null;
  cerradoEn: string | null;
  fechaLimite: string | null;
  estadoSla: string | null;
};

const PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "URGENTE"];

const ACCIONES_POR_ESTADO: Record<EstadoType, Accion[]> = {
  ABIERTO:     ["iniciar", "resolver"],
  EN_PROGRESO: ["resolver"],
  RESUELTO:    ["cerrar", "reabrir"],
  CERRADO:     ["reabrir"],
};

const LABEL_ACCION: Record<Accion, string> = {
  iniciar: "Iniciar",
  resolver: "Resolver",
  cerrar: "Cerrar",
  reabrir: "Reabrir",
};

function prioridadClass(p: string) {
  return `badge-prioridad prioridad-${p.toLowerCase()}`;
}

function estadoClass(estado: EstadoType) {
  return `badge-estado estado-${estado.toLowerCase().replace("_", "-")}`;
}

function slaClass(estadoSla: string) {
  return `badge-sla sla-${estadoSla.toLowerCase().replace("_", "-")}`;
}

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function jsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...authHeader() };
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-UY", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function DetalleTicket() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([]);

  const [editando, setEditando] = useState(false);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editPrioridad, setEditPrioridad] = useState("MEDIA");
  const [editClienteId, setEditClienteId] = useState("");
  const [editClienteNombre, setEditClienteNombre] = useState("");
  const [editResponsableId, setEditResponsableId] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState("");
  const [editEtiquetaIds, setEditEtiquetaIds] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [errorTransicion, setErrorTransicion] = useState<string | null>(null);

  function manejarNoAutorizado() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function cargarUsuario() {
    const res = await fetch(`${API}/api/v1/auth/me`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setEmailUsuario((await res.json()).email);
  }

  async function cargarCategorias() {
    try {
      const res = await fetch(`${API}/api/v1/categorias`, { headers: authHeader() });
      if (res.ok) setCategorias(await res.json());
    } catch { /* no crítico */ }
  }

  async function cargarEtiquetas() {
    try {
      const res = await fetch(`${API}/api/v1/etiquetas`, { headers: authHeader() });
      if (res.ok) setEtiquetas(await res.json());
    } catch { /* no crítico */ }
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API}/api/v1/usuarios`, { headers: authHeader() });
      if (res.ok) setUsuarios(await res.json());
    } catch { /* no crítico */ }
  }

  async function cargarTicket() {
    setCargando(true);
    setErrorCarga(null);
    try {
      const res = await fetch(`${API}/api/v1/tickets/${id}`, { headers: authHeader() });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 404) { setNoEncontrado(true); return; }
      if (!res.ok) throw new Error();
      setTicket(await res.json());
    } catch {
      setErrorCarga("No se pudo cargar el ticket.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargarTicket();
    cargarCategorias();
    cargarEtiquetas();
    cargarUsuarios();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function cerrarSesion() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function iniciarEdicion() {
    if (!ticket) return;
    setEditTitulo(ticket.titulo);
    setEditDescripcion(ticket.descripcion);
    setEditPrioridad(ticket.prioridad);
    setEditClienteId(ticket.cliente?.id ?? "");
    setEditClienteNombre(ticket.cliente?.nombreCompleto ?? ticket.clienteNombre ?? "");
    setEditResponsableId(ticket.responsable?.id ?? "");
    setEditCategoriaId(ticket.categoria?.id ?? "");
    setEditEtiquetaIds(ticket.etiquetas.map((e) => e.id));
    setErroresCampos({});
    setErrorGuardar(null);
    setEditando(true);
  }

  function cancelarEdicion() {
    setEditando(false);
    setErroresCampos({});
    setErrorGuardar(null);
  }

  async function guardarEdicion() {
    setGuardando(true);
    setErroresCampos({});
    setErrorGuardar(null);
    try {
      const res = await fetch(`${API}/api/v1/tickets/${id}`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify({
          titulo: editTitulo,
          descripcion: editDescripcion,
          prioridad: editPrioridad,
          clienteId: editClienteId || null,
          responsableId: editResponsableId || null,
          categoriaId: editCategoriaId || null,
          etiquetaIds: editEtiquetaIds,
        }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 400) {
        const body = await res.json();
        setErroresCampos(body.errores ?? {});
        return;
      }
      if (!res.ok) throw new Error();
      setTicket(await res.json());
      setEditando(false);
    } catch {
      setErrorGuardar("No se pudo guardar el ticket.");
    } finally {
      setGuardando(false);
    }
  }

  async function transicionarTicket(accion: Accion) {
    setErrorTransicion(null);
    try {
      const res = await fetch(`${API}/api/v1/tickets/${id}/${accion}`, {
        method: "POST",
        headers: authHeader(),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 409) {
        const body = await res.json();
        setErrorTransicion(body.error ?? "Transición inválida");
        return;
      }
      if (!res.ok) throw new Error();
      await cargarTicket();
    } catch {
      setErrorTransicion("No se pudo conectar con el backend.");
    }
  }

  const navLink: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    textDecoration: "none",
    color: "var(--color-text-muted)",
  };

  const fieldError: React.CSSProperties = {
    fontSize: 12,
    color: "#c0392b",
    marginTop: -6,
    marginBottom: 8,
  };

  return (
    <>
      <header className="app-header">
        <span className="app-header-brand">
          <span>Rooster</span>Code · Help Desk
        </span>
        <nav style={{ display: "flex", gap: 4, marginLeft: 20 }}>
          <Link href="/" style={navLink}>Tickets</Link>
          <Link href="/proveedores" style={navLink}>Proveedores</Link>
          <Link href="/clientes" style={navLink}>Clientes</Link>
          <Link href="/reportes" style={navLink}>Reportes</Link>
          <Link href="/wiki" style={navLink}>Base de Conocimiento</Link>
          <Link href="/configuracion" style={navLink}>Configuración</Link>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          {emailUsuario && (
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{emailUsuario}</span>
          )}
          <button className="btn-secondary" onClick={cerrarSesion} style={{ padding: "5px 12px", fontSize: 13 }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="app-main">
        <div style={{ marginBottom: 16 }}>
          <button className="btn-secondary" onClick={() => router.back()}>
            ← Volver
          </button>
        </div>

        {cargando && <p className="empty-msg">Cargando…</p>}
        {noEncontrado && <p className="error-msg">Ticket no encontrado.</p>}
        {errorCarga && <p className="error-msg">{errorCarga}</p>}

        {ticket && (
          <>
            <section className="section-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Ticket #{ticket.numero}
                </p>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <span className={estadoClass(ticket.estado)}>{ticket.estado.replace("_", " ")}</span>
                  <span className={prioridadClass(ticket.prioridad)}>{ticket.prioridad}</span>
                  {ticket.estadoSla && (
                    <span className={slaClass(ticket.estadoSla)}>{ticket.estadoSla.replace("_", " ")}</span>
                  )}
                </div>
              </div>

              {!editando ? (
                <>
                  <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
                    {ticket.titulo}
                  </h1>
                  <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.6, color: "#444" }}>
                    {ticket.descripcion}
                  </p>
                  {(ticket.cliente || ticket.clienteNombre) && (
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-muted)" }}>
                      Cliente: {ticket.cliente?.nombreCompleto ?? ticket.clienteNombre}
                    </p>
                  )}
                  {ticket.responsable && (
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--color-text-muted)" }}>
                      Responsable: {ticket.responsable.nombre}
                    </p>
                  )}
                  {(ticket.categoria || ticket.etiquetas.length > 0) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
                      {ticket.categoria && (
                        <span style={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-sm)",
                          padding: "2px 8px",
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          fontWeight: 600,
                        }}>
                          {ticket.categoria.nombre}
                        </span>
                      )}
                      {ticket.etiquetas.map((e) => (
                        <span key={e.id} style={{
                          background: e.color,
                          color: "#fff",
                          borderRadius: 12,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                          {e.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontSize: 12, color: "var(--color-text-muted)" }}>
                    <span><strong>Creado:</strong> {formatearFecha(ticket.createdAt)}</span>
                    {ticket.fechaLimite && <span><strong>Fecha límite:</strong> {formatearFecha(ticket.fechaLimite)}</span>}
                    {ticket.resueltoEn && <span><strong>Resuelto:</strong> {formatearFecha(ticket.resueltoEn)}</span>}
                    {ticket.cerradoEn && <span><strong>Cerrado:</strong> {formatearFecha(ticket.cerradoEn)}</span>}
                  </div>
                  <button className="btn-secondary" onClick={iniciarEdicion}>
                    Editar
                  </button>
                </>
              ) : (
                <>
                  <input
                    className="form-input"
                    placeholder="Título"
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                  />
                  {erroresCampos.titulo && <p style={fieldError}>{erroresCampos.titulo}</p>}

                  <textarea
                    className="form-input"
                    style={{ height: 100, resize: "vertical" }}
                    placeholder="Descripción"
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                  />
                  {erroresCampos.descripcion && <p style={fieldError}>{erroresCampos.descripcion}</p>}

                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                    <select
                      className="form-input"
                      style={{ marginBottom: 0, flex: 1 }}
                      value={editPrioridad}
                      onChange={(e) => setEditPrioridad(e.target.value)}
                    >
                      {PRIORIDADES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <span className={prioridadClass(editPrioridad)}>{editPrioridad}</span>
                  </div>

                  <ClienteSelector
                    value={editClienteNombre}
                    onSelect={(c) => {
                      setEditClienteId(c ? c.id : "");
                      setEditClienteNombre(c ? c.nombreCompleto : "");
                    }}
                    token={getToken()}
                    onUnauthorized={manejarNoAutorizado}
                  />

                  {usuarios.length > 0 && (
                    <select
                      className="form-input"
                      value={editResponsableId}
                      onChange={(e) => setEditResponsableId(e.target.value)}
                    >
                      <option value="">Sin responsable</option>
                      {usuarios.filter((u) => u.activo || u.id === editResponsableId).map((u) => (
                        <option key={u.id} value={u.id}>{u.nombre}</option>
                      ))}
                    </select>
                  )}

                  {categorias.length > 0 && (
                    <select
                      className="form-input"
                      value={editCategoriaId}
                      onChange={(e) => setEditCategoriaId(e.target.value)}
                    >
                      <option value="">Sin categoría</option>
                      {categorias.filter((c) => c.activo).map((c) => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  )}

                  {etiquetas.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                      {etiquetas.map((e) => {
                        const sel = editEtiquetaIds.includes(e.id);
                        return (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => setEditEtiquetaIds((prev) =>
                              sel ? prev.filter((id) => id !== e.id) : [...prev, e.id]
                            )}
                            style={{
                              background: sel ? e.color : "transparent",
                              color: sel ? "#fff" : e.color,
                              border: `2px solid ${e.color}`,
                              borderRadius: 12,
                              padding: "2px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {e.nombre}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {errorGuardar && <p className="error-msg">{errorGuardar}</p>}

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" onClick={guardarEdicion} disabled={guardando}>
                      {guardando ? "Guardando…" : "Guardar cambios"}
                    </button>
                    <button className="btn-secondary" onClick={cancelarEdicion} disabled={guardando}>
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </section>

            {ACCIONES_POR_ESTADO[ticket.estado].length > 0 && (
              <section className="section-card">
                <h2 className="section-title">Cambiar estado</h2>
                <div className="ticket-acciones" style={{ marginTop: 0 }}>
                  {ACCIONES_POR_ESTADO[ticket.estado].map((accion) => (
                    <button
                      key={accion}
                      className="btn-secondary"
                      onClick={() => transicionarTicket(accion)}
                    >
                      {LABEL_ACCION[accion]}
                    </button>
                  ))}
                </div>
                {errorTransicion && (
                  <p className="error-msg" style={{ marginTop: 10, marginBottom: 0 }}>
                    {errorTransicion}
                  </p>
                )}
              </section>
            )}

            <section className="section-card">
              <h2 className="section-title">Comentarios</h2>
              <ComentariosTicket
                ticketId={id}
                token={getToken()}
                onUnauthorized={manejarNoAutorizado}
              />
            </section>
          </>
        )}
      </main>
    </>
  );
}
