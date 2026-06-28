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

  async function crearCliente() {
    setCargando(true);
    setErroresCampos({});
    setErrorGeneral(null);
    try {
      const res = await fetch(`${API}/api/v1/clientes`, {
        method: "POST",
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
          <h2 className="section-title">Nuevo cliente</h2>

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

          <button className="btn-primary" onClick={crearCliente} disabled={cargando}>
            {cargando ? "Guardando..." : "Agregar cliente"}
          </button>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 className="section-heading">Clientes ({clientes.length})</h2>
          {clientes.length === 0 && (
            <p className="empty-msg">Todavía no hay clientes. Cargá el primero arriba.</p>
          )}
          {clientes.map((c) => (
            <div key={c.id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-numero-titulo">{c.nombreCompleto}</span>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{c.email}</span>
              </div>
              <p className="ticket-descripcion" style={{ marginBottom: 0 }}>
                <strong>Cel:</strong> {c.celular}
              </p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
