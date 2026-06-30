"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Cliente = {
  id: string;
  nombreCompleto: string;
  celular: string;
  email: string;
  createdAt: string;
};

type Ticket = {
  id: string;
  numero: number;
  titulo: string;
  prioridad: string;
  estado: string;
  createdAt: string;
};

function getToken(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function prioridadClass(p: string) {
  return `badge-prioridad prioridad-${p.toLowerCase()}`;
}

function estadoClass(estado: string) {
  return `badge-estado estado-${estado.toLowerCase().replace("_", "-")}`;
}

export default function DetalleCliente() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);

  function manejarNoAutorizado() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function cargarUsuario() {
    const res = await fetch(`${API}/api/v1/auth/me`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setEmailUsuario((await res.json()).email);
  }

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/v1/clientes/${id}`, { headers: authHeader() });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 404) { setNoEncontrado(true); return; }
      if (!res.ok) throw new Error();
      const c: Cliente = await res.json();
      setCliente(c);

      const resT = await fetch(
        `${API}/api/v1/tickets?clienteId=${c.id}`,
        { headers: authHeader() }
      );
      if (resT.ok) setTickets(await resT.json());
    } catch {
      // estado de no-datos suficiente
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function cerrarSesion() {
    localStorage.removeItem("token");
    router.push("/login");
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
          <Link href="/" style={navLink}>Tickets</Link>
          <Link href="/proveedores" style={navLink}>Proveedores</Link>
          <Link href="/clientes" style={{ ...navLink, color: "var(--color-primary)", fontWeight: 600 }}>
            Clientes
          </Link>
          <Link href="/reportes" style={navLink}>Reportes</Link>
          <Link href="/wiki" style={navLink}>Base de Conocimiento</Link>
          <Link href="/configuracion" style={navLink}>Configuración</Link>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          {emailUsuario && (
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{emailUsuario}</span>
          )}
          <button
            className="btn-secondary"
            onClick={cerrarSesion}
            style={{ padding: "5px 12px", fontSize: 13 }}
          >
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
        {noEncontrado && <p className="error-msg">Cliente no encontrado.</p>}

        {cliente && (
          <>
            <section className="section-card">
              <h2 className="section-title">Cliente</h2>
              <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700 }}>
                {cliente.nombreCompleto}
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  fontSize: 14,
                  color: "var(--color-text-muted)",
                  marginBottom: 14,
                }}
              >
                <span>{cliente.celular}</span>
                <span>{cliente.email}</span>
                <span>Alta: {formatearFecha(cliente.createdAt)}</span>
              </div>
              <Link href="/clientes" className="btn-secondary" style={{ textDecoration: "none" }}>
                Editar datos
              </Link>
            </section>

            <section style={{ marginTop: 8 }}>
              <h2 className="section-heading">
                Tickets de {cliente.nombreCompleto} ({tickets.length})
              </h2>
              {tickets.length === 0 && (
                <p className="empty-msg">No hay tickets asociados a este cliente.</p>
              )}
              {tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/tickets/${t.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="ticket-card" style={{ cursor: "pointer" }}>
                    <div className="ticket-header">
                      <span className="ticket-numero-titulo">
                        #{t.numero} · {t.titulo}
                      </span>
                      <div className="ticket-badges">
                        <span className={estadoClass(t.estado)}>
                          {t.estado.replace("_", " ")}
                        </span>
                        <span className={prioridadClass(t.prioridad)}>{t.prioridad}</span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                      {formatearFecha(t.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}
