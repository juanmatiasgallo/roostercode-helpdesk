"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ClienteSelector, { ClienteData } from "../components/ClienteSelector";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type EstadoType = "ABIERTO" | "EN_PROGRESO" | "RESUELTO" | "CERRADO";

type Categoria   = { id: string; nombre: string };
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

type CampoOrden = "creado" | "prioridad";
type DirOrden = "asc" | "desc";

const PESO_PRIORIDAD: Record<string, number> = { BAJA: 0, MEDIA: 1, ALTA: 2, URGENTE: 3 };

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function prioridadClass(p: string): string {
  return `badge-prioridad prioridad-${p.toLowerCase()}`;
}

function estadoClass(estado: EstadoType): string {
  return `badge-estado estado-${estado.toLowerCase().replace("_", "-")}`;
}

function slaClass(estadoSla: string): string {
  return `badge-sla sla-${estadoSla.toLowerCase().replace("_", "-")}`;
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearHoras(h: number): string {
  if (h < 1 / 60) return "< 1m";
  if (h < 1) return `${Math.round(h * 60)}m`;
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function ReportesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estadoInicial = searchParams.get("estado") ?? "";
  const slaInicial = searchParams.get("sla") ?? "";

  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([]);
  const [filtroEstado, setFiltroEstado] = useState(estadoInicial);
  const [filtroQ, setFiltroQ] = useState("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [filtroCliente, setFiltroCliente] = useState<ClienteData | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEtiqueta, setFiltroEtiqueta] = useState("");
  const [filtroResponsable, setFiltroResponsable] = useState("");
  const [filtroSla, setFiltroSla] = useState(slaInicial);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campoOrden, setCampoOrden] = useState<CampoOrden>("creado");
  const [dirOrden, setDirOrden] = useState<DirOrden>("desc");

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

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargarCategorias();
    cargarEtiquetas();
    cargarUsuarios();
    if (estadoInicial || slaInicial) buscar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function cerrarSesion() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function buscar() {
    setBuscando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroEstado) params.set("estado", filtroEstado);
      if (filtroQ.trim()) params.set("q", filtroQ.trim());
      if (filtroDesde) params.set("desde", filtroDesde);
      if (filtroHasta) params.set("hasta", filtroHasta);
      if (filtroCliente) params.set("clienteId", filtroCliente.id);
      if (filtroCategoria) params.set("categoriaId", filtroCategoria);
      if (filtroEtiqueta) params.set("etiquetaId", filtroEtiqueta);
      if (filtroResponsable) params.set("responsableId", filtroResponsable);
      if (filtroSla) params.set("sla", filtroSla);
      const qs = params.toString();
      const res = await fetch(`${API}/api/v1/tickets${qs ? "?" + qs : ""}`, { headers: authHeader() });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (!res.ok) throw new Error();
      setTickets(await res.json());
      setBuscado(true);
    } catch {
      setError("No se pudo conectar con el backend.");
    } finally {
      setBuscando(false);
    }
  }

  function limpiar() {
    setFiltroEstado("");
    setFiltroQ("");
    setFiltroDesde("");
    setFiltroHasta("");
    setFiltroCliente(null);
    setFiltroCategoria("");
    setFiltroEtiqueta("");
    setFiltroResponsable("");
    setFiltroSla("");
    setTickets([]);
    setBuscado(false);
    setError(null);
  }

  function toggleOrden(campo: CampoOrden) {
    if (campoOrden === campo) {
      setDirOrden((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setCampoOrden(campo);
      setDirOrden("desc");
    }
  }

  const ticketsOrdenados = [...tickets].sort((a, b) => {
    let diff: number;
    if (campoOrden === "prioridad") {
      diff = PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad];
    } else {
      diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return dirOrden === "asc" ? diff : -diff;
  });

  function exportarCSV() {
    const headers = ["Número", "Título", "Cliente", "Responsable", "Categoría", "Etiquetas", "Estado", "Prioridad", "SLA", "Fecha límite", "Creado", "Resuelto", "Cerrado"];
    const rows = ticketsOrdenados.map((t) => [
      t.numero,
      `"${t.titulo.replace(/"/g, '""')}"`,
      `"${(t.cliente?.nombreCompleto ?? t.clienteNombre ?? "").replace(/"/g, '""')}"`,
      `"${(t.responsable?.nombre ?? "").replace(/"/g, '""')}"`,
      `"${(t.categoria?.nombre ?? "").replace(/"/g, '""')}"`,
      `"${t.etiquetas.map((e) => e.nombre).join(", ").replace(/"/g, '""')}"`,
      t.estado,
      t.prioridad,
      t.estadoSla ?? "",
      t.fechaLimite ? formatearFecha(t.fechaLimite) : "",
      formatearFecha(t.createdAt),
      t.resueltoEn ? formatearFecha(t.resueltoEn) : "",
      t.cerradoEn ? formatearFecha(t.cerradoEn) : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const contsPorEstado = {
    ABIERTO:     tickets.filter((t) => t.estado === "ABIERTO").length,
    EN_PROGRESO: tickets.filter((t) => t.estado === "EN_PROGRESO").length,
    RESUELTO:    tickets.filter((t) => t.estado === "RESUELTO").length,
    CERRADO:     tickets.filter((t) => t.estado === "CERRADO").length,
  };
  const conResolucion = tickets.filter((t) => t.resueltoEn);
  const promedioHoras =
    conResolucion.length === 0
      ? null
      : conResolucion.reduce((sum, t) => {
          return sum + (new Date(t.resueltoEn!).getTime() - new Date(t.createdAt).getTime()) / 3_600_000;
        }, 0) / conResolucion.length;
  const porCliente: Record<string, number> = {};
  for (const t of tickets) {
    const n = t.cliente?.nombreCompleto ?? t.clienteNombre ?? "(sin cliente)";
    porCliente[n] = (porCliente[n] ?? 0) + 1;
  }
  const topClientes = Object.entries(porCliente).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const navLink: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    textDecoration: "none",
    color: "var(--color-text-muted)",
  };
  const navLinkActive: React.CSSProperties = {
    ...navLink,
    color: "var(--color-primary)",
    fontWeight: 600,
  };

  const thStyle: React.CSSProperties = {
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--color-text-muted)",
    whiteSpace: "nowrap",
    borderBottom: "2px solid var(--color-border)",
  };
  const tdStyle: React.CSSProperties = {
    padding: "8px 12px",
    verticalAlign: "middle",
    borderBottom: "1px solid var(--color-border)",
  };

  const flechaOrden = (campo: CampoOrden) =>
    campoOrden === campo ? (dirOrden === "asc" ? " ↑" : " ↓") : "";

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
          <span style={navLinkActive}>Reportes</span>
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
        <section className="section-card">
          <h2 className="section-title">Buscar tickets</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              className="form-input"
              style={{ flex: "1 1 160px", minWidth: 160 }}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="ABIERTO">Abierto</option>
              <option value="EN_PROGRESO">En progreso</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
            <input
              className="form-input"
              style={{ flex: "2 1 200px" }}
              placeholder="Título o número de ticket"
              value={filtroQ}
              onChange={(e) => setFiltroQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
            />
            <input
              className="form-input"
              type="date"
              style={{ flex: "1 1 150px" }}
              title="Desde"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
            />
            <input
              className="form-input"
              type="date"
              style={{ flex: "1 1 150px" }}
              title="Hasta"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <ClienteSelector
              value={filtroCliente ? filtroCliente.nombreCompleto : ""}
              onSelect={setFiltroCliente}
              token={getToken()}
              onUnauthorized={manejarNoAutorizado}
            />
            {filtroCliente && (
              <p style={{ margin: "-4px 0 8px", fontSize: 12, color: "var(--color-text-muted)" }}>
                Filtrando por cliente: <strong>{filtroCliente.nombreCompleto}</strong>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {categorias.length > 0 && (
                <select
                  className="form-input"
                  style={{ flex: "1 1 180px", minWidth: 160, marginBottom: 0 }}
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              )}
              {etiquetas.length > 0 && (
                <select
                  className="form-input"
                  style={{ flex: "1 1 180px", minWidth: 160, marginBottom: 0 }}
                  value={filtroEtiqueta}
                  onChange={(e) => setFiltroEtiqueta(e.target.value)}
                >
                  <option value="">Todas las etiquetas</option>
                  {etiquetas.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              )}
              {usuarios.length > 0 && (
                <select
                  className="form-input"
                  style={{ flex: "1 1 180px", minWidth: 160, marginBottom: 0 }}
                  value={filtroResponsable}
                  onChange={(e) => setFiltroResponsable(e.target.value)}
                >
                  <option value="">Todos los responsables</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              )}
              <select
                className="form-input"
                style={{ flex: "1 1 180px", minWidth: 160, marginBottom: 0 }}
                value={filtroSla}
                onChange={(e) => setFiltroSla(e.target.value)}
              >
                <option value="">Todos los SLA</option>
                <option value="EN_TIEMPO">En tiempo</option>
                <option value="POR_VENCER">Por vencer</option>
                <option value="VENCIDO">Vencido</option>
                <option value="CUMPLIDO">Cumplido</option>
                <option value="INCUMPLIDO">Incumplido</option>
              </select>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="btn-primary" onClick={buscar} disabled={buscando}>
              {buscando ? "Buscando…" : "Buscar"}
            </button>
            <button className="btn-secondary" onClick={limpiar} disabled={buscando}>
              Limpiar
            </button>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </section>

        {buscado && (
          <>
            <section style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 className="section-heading">
                  {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} encontrado{tickets.length !== 1 ? "s" : ""}
                </h2>
                {tickets.length > 0 && (
                  <button className="btn-secondary" onClick={exportarCSV}>
                    Exportar CSV
                  </button>
                )}
              </div>

              {tickets.length === 0 ? (
                <p className="empty-msg">No se encontraron tickets con esos filtros.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>#</th>
                        <th style={thStyle}>Título</th>
                        <th style={thStyle}>Cliente</th>
                        <th style={thStyle}>Responsable</th>
                        <th style={thStyle}>SLA</th>
                        <th style={thStyle}>Categoría / Etiquetas</th>
                        <th style={thStyle}>Estado</th>
                        <th
                          style={{ ...thStyle, cursor: "pointer", userSelect: "none" }}
                          onClick={() => toggleOrden("prioridad")}
                        >
                          Prioridad{flechaOrden("prioridad")}
                        </th>
                        <th
                          style={{ ...thStyle, cursor: "pointer", userSelect: "none" }}
                          onClick={() => toggleOrden("creado")}
                        >
                          Creado{flechaOrden("creado")}
                        </th>
                        <th style={thStyle}>Resuelto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticketsOrdenados.map((t) => (
                        <tr
                          key={t.id}
                          style={{ cursor: "pointer" }}
                          onClick={() => router.push(`/tickets/${t.id}`)}
                        >
                          <td style={tdStyle}>{t.numero}</td>
                          <td style={{ ...tdStyle, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {t.titulo}
                          </td>
                          <td style={tdStyle}>{t.cliente?.nombreCompleto ?? t.clienteNombre ?? "—"}</td>
                          <td style={tdStyle}>{t.responsable?.nombre ?? "—"}</td>
                          <td style={tdStyle}>
                            {t.estadoSla ? (
                              <span className={slaClass(t.estadoSla)}>{t.estadoSla.replace("_", " ")}</span>
                            ) : "—"}
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {t.categoria && (
                                <span style={{
                                  background: "var(--color-surface)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "var(--radius-sm)",
                                  padding: "1px 6px",
                                  fontSize: 11,
                                  color: "var(--color-text-muted)",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}>
                                  {t.categoria.nombre}
                                </span>
                              )}
                              {t.etiquetas.map((e) => (
                                <span key={e.id} style={{
                                  background: e.color,
                                  color: "#fff",
                                  borderRadius: 12,
                                  padding: "1px 6px",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}>
                                  {e.nombre}
                                </span>
                              ))}
                              {!t.categoria && t.etiquetas.length === 0 && "—"}
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <span className={estadoClass(t.estado)}>{t.estado.replace("_", " ")}</span>
                          </td>
                          <td style={tdStyle}>
                            <span className={prioridadClass(t.prioridad)}>{t.prioridad}</span>
                          </td>
                          <td style={tdStyle}>{formatearFecha(t.createdAt)}</td>
                          <td style={tdStyle}>{t.resueltoEn ? formatearFecha(t.resueltoEn) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {tickets.length > 0 && (
              <section className="section-card" style={{ marginTop: 24 }}>
                <h2 className="section-title">Métricas</h2>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
                  {[
                    { label: "Abiertos",    val: contsPorEstado.ABIERTO },
                    { label: "En progreso", val: contsPorEstado.EN_PROGRESO },
                    { label: "Resueltos",   val: contsPorEstado.RESUELTO },
                    { label: "Cerrados",    val: contsPorEstado.CERRADO },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{val}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", marginTop: 2 }}>
                        {label}
                      </div>
                    </div>
                  ))}
                  {promedioHoras !== null && (
                    <div style={{ textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{formatearHoras(promedioHoras)}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", marginTop: 2 }}>
                        Prom. resolución
                      </div>
                    </div>
                  )}
                </div>

                {topClientes.length > 0 && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 8 }}>
                      Top clientes
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {topClientes.map(([nombre, cant]) => (
                        <div
                          key={nombre}
                          style={{ display: "flex", justifyContent: "space-between", fontSize: 13, maxWidth: 360 }}
                        >
                          <span>{nombre}</span>
                          <span style={{ fontWeight: 600, marginLeft: 16 }}>{cant}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default function Reportes() {
  return (
    <Suspense>
      <ReportesContent />
    </Suspense>
  );
}
