"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Cliente = {
  id: string;
  nombreCompleto: string;
  celular: string;
  email: string;
  createdAt: string;
};

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

export default function Clientes() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");

  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  function manejarNoAutorizado() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function cargarUsuario() {
    const res = await fetch(`${API}/api/v1/auth/me`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setEmailUsuario((await res.json()).email);
  }

  async function cargarClientes() {
    const res = await fetch(`${API}/api/v1/clientes`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setClientes(await res.json());
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargarClientes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function cerrarSesion() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function iniciarEdicion(c: Cliente) {
    setEditandoId(c.id);
    setNombreCompleto(c.nombreCompleto);
    setCelular(c.celular);
    setEmail(c.email);
    setErroresCampos({});
    setErrorGeneral(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNombreCompleto("");
    setCelular("");
    setEmail("");
    setErroresCampos({});
    setErrorGeneral(null);
  }

  async function guardarCliente() {
    setCargando(true);
    setErroresCampos({});
    setErrorGeneral(null);
    try {
      const url = editandoId
        ? `${API}/api/v1/clientes/${editandoId}`
        : `${API}/api/v1/clientes`;
      const method = editandoId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: jsonHeaders(),
        body: JSON.stringify({ nombreCompleto, celular, email }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 400) {
        const body = await res.json();
        setErroresCampos(body.errores ?? {});
        return;
      }
      if (res.status === 409) {
        const body = await res.json();
        setErrorGeneral(body.error ?? "Ya existe un cliente con ese email");
        return;
      }
      if (!res.ok) throw new Error();
      setEditandoId(null);
      setNombreCompleto("");
      setCelular("");
      setEmail("");
      await cargarClientes();
    } catch {
      setErrorGeneral("No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminarCliente(c: Cliente) {
    if (!window.confirm(`¿Eliminar a ${c.nombreCompleto}?`)) return;
    const res = await fetch(`${API}/api/v1/clientes/${c.id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) await cargarClientes();
  }

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

  const fieldError: React.CSSProperties = {
    fontSize: 12,
    color: "var(--color-error, #c0392b)",
    marginTop: 2,
    marginBottom: 4,
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
          <span style={navLinkActive}>Clientes</span>
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
        <section className="section-card">
          <h2 className="section-title">
            {editandoId ? "Editar cliente" : "Nuevo cliente"}
          </h2>

          <input
            className="form-input"
            placeholder="Nombre completo"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
          />
          {erroresCampos.nombreCompleto && <p style={fieldError}>{erroresCampos.nombreCompleto}</p>}

          <input
            className="form-input"
            placeholder="Celular"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
          />
          {erroresCampos.celular && <p style={fieldError}>{erroresCampos.celular}</p>}

          <input
            className="form-input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {erroresCampos.email && <p style={fieldError}>{erroresCampos.email}</p>}

          {errorGeneral && <p className="error-msg">{errorGeneral}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={guardarCliente} disabled={cargando}>
              {cargando ? "Guardando..." : editandoId ? "Guardar cambios" : "Agregar cliente"}
            </button>
            {editandoId && (
              <button className="btn-secondary" onClick={cancelarEdicion} disabled={cargando}>
                Cancelar
              </button>
            )}
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 className="section-heading">Clientes ({clientes.length})</h2>
          {clientes.length === 0 && (
            <p className="empty-msg">Todavía no hay clientes. Cargá el primero arriba.</p>
          )}
          {clientes.map((c) => (
            <div key={c.id} className="ticket-card">
              <div className="ticket-header">
                <Link
                  href={`/clientes/${c.id}`}
                  className="ticket-numero-titulo"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {c.nombreCompleto}
                </Link>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{c.email}</span>
              </div>
              <p className="ticket-descripcion" style={{ marginBottom: 6 }}>
                <strong>Cel:</strong> {c.celular}
              </p>
              <div className="ticket-acciones">
                <button className="btn-secondary" onClick={() => iniciarEdicion(c)}>
                  Editar
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => eliminarCliente(c)}
                  style={{ color: "var(--color-primary)" }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
