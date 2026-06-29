"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ComentariosTicket from "./components/ComentariosTicket";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Ticket = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  clienteNombre: string | null;
  prioridad: string;
  estado: "ABIERTO" | "EN_PROGRESO" | "RESUELTO" | "CERRADO";
  createdAt: string;
  resueltoEn: string | null;
  cerradoEn: string | null;
};

type Resumen = {
  abiertos: number;
  enProgreso: number;
  resueltos: number;
  cerrados: number;
  total: number;
  tiempoPromedioResolucionHoras: number | null;
};

type Accion = "iniciar" | "resolver" | "cerrar" | "reabrir";

const ACCIONES_POR_ESTADO: Record<Ticket["estado"], Accion[]> = {
  ABIERTO:     ["iniciar", "resolver"],
  EN_PROGRESO: ["resolver"],
  RESUELTO:    ["cerrar", "reabrir"],
  CERRADO:     ["reabrir"],
};

const LABEL_ACCION: Record<Accion, string> = {
  iniciar:  "Iniciar",
  resolver: "Resolver",
  cerrar:   "Cerrar",
  reabrir:  "Reabrir",
};

const PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "URGENTE"];

function estadoClass(estado: Ticket["estado"]) {
  return `badge-estado estado-${estado.toLowerCase().replace("_", "-")}`;
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

function formatearHoras(h: number): string {
  if (h < 1 / 60) return "< 1m";
  if (h < 1) return `${Math.round(h * 60)}m`;
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export default function Home() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTransicion, setErrorTransicion] = useState<string | null>(null);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [comentariosAbiertos, setComentariosAbiertos] = useState<Set<string>>(new Set());

  function toggleComentarios(id: string) {
    setComentariosAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function manejarNoAutorizado() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function cargarUsuario() {
    const res = await fetch(`${API}/api/v1/auth/me`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setEmailUsuario((await res.json()).email);
  }

  async function cargarTickets() {
    try {
      const res = await fetch(`${API}/api/v1/tickets?estado=ABIERTO`, { headers: authHeader() });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (!res.ok) throw new Error();
      setTickets(await res.json());
      setError(null);
    } catch {
      setError("No se pudo conectar con el backend. ¿Está corriendo y bien configurada la URL?");
    }
  }

  async function cargarResumen() {
    try {
      const res = await fetch(`${API}/api/v1/tickets/resumen`, { headers: authHeader() });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.ok) setResumen(await res.json());
    } catch {
      // resumen no es crítico, ignorar errores de red
    }
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargarTickets();
    cargarResumen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function cerrarSesion() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function transicionarTicket(id: string, accion: Accion) {
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
      await Promise.all([cargarTickets(), cargarResumen()]);
    } catch {
      setErrorTransicion("No se pudo conectar con el backend.");
    }
  }

  async function crearTicket() {
    if (!titulo.trim() || !descripcion.trim()) return;
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/v1/tickets`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ titulo, descripcion, clienteNombre, prioridad }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (!res.ok) throw new Error();
      setTitulo("");
      setDescripcion("");
      setClienteNombre("");
      setPrioridad("MEDIA");
      await Promise.all([cargarTickets(), cargarResumen()]);
    } catch {
      setError("No se pudo crear el ticket.");
    } finally {
      setCargando(false);
    }
  }

  const navLink: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    textDecoration: "none",
    color: "var(--color-text-muted)",
  };

  return (
    <>
      <header className="app-header">
        <span className="app-header-brand">
          <span>Rooster</span>Code · Help Desk
        </span>
        <nav style={{ display: "flex", gap: 4, marginLeft: 20 }}>
          <span style={{ padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>
            Tickets
          </span>
          <Link href="/proveedores" style={navLink}>Proveedores</Link>
          <Link href="/clientes" style={navLink}>Clientes</Link>
          <Link href="/reportes" style={navLink}>Reportes</Link>
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
        {resumen && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}>
            {[
              { label: "Abiertos", value: resumen.abiertos, color: "var(--color-primary)" },
              { label: "En progreso", value: resumen.enProgreso, color: "#e67e22" },
              { label: "Resueltos", value: resumen.resueltos, color: "#27ae60" },
              { label: "Cerrados", value: resumen.cerrados, color: "#7f8c8d" },
              { label: "Total", value: resumen.total, color: "var(--color-text-muted)" },
              ...(resumen.tiempoPromedioResolucionHoras != null ? [{
                label: "Prom. resolución",
                value: formatearHoras(resumen.tiempoPromedioResolucionHoras),
                color: "var(--color-text-muted)" as string,
              }] : []),
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                padding: "12px 16px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="section-card">
          <h2 className="section-title">Nuevo ticket</h2>
          <input
            className="form-input"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <textarea
            className="form-input"
            style={{ height: 80, resize: "vertical" }}
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="Cliente (opcional)"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
          />
          <select
            className="form-input"
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={crearTicket} disabled={cargando}>
            {cargando ? "Creando..." : "Crear ticket"}
          </button>
        </section>

        {error && <p className="error-msg">{error}</p>}
        {errorTransicion && <p className="error-msg">{errorTransicion}</p>}

        <section style={{ marginTop: 24 }}>
          <h2 className="section-heading">Tickets abiertos ({tickets.length})</h2>
          {tickets.length === 0 && (
            <p className="empty-msg">No hay tickets abiertos en este momento.</p>
          )}
          {tickets.map((t) => (
            <div key={t.id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-numero-titulo">#{t.numero} · {t.titulo}</span>
                <div className="ticket-badges">
                  <span className={estadoClass(t.estado)}>{t.estado}</span>
                  <span className="badge-prioridad">{t.prioridad}</span>
                </div>
              </div>
              <p className="ticket-descripcion">{t.descripcion}</p>
              {t.clienteNombre && (
                <span className="ticket-cliente">Cliente: {t.clienteNombre}</span>
              )}
              <div className="ticket-acciones">
                {ACCIONES_POR_ESTADO[t.estado].map((accion) => (
                  <button
                    key={accion}
                    className="btn-secondary"
                    onClick={() => transicionarTicket(t.id, accion)}
                  >
                    {LABEL_ACCION[accion]}
                  </button>
                ))}
                <button
                  className="btn-secondary"
                  onClick={() => toggleComentarios(t.id)}
                >
                  {comentariosAbiertos.has(t.id) ? "Ocultar comentarios" : "Comentarios"}
                </button>
              </div>
              {comentariosAbiertos.has(t.id) && (
                <ComentariosTicket
                  ticketId={t.id}
                  token={getToken()}
                  onUnauthorized={manejarNoAutorizado}
                />
              )}
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
