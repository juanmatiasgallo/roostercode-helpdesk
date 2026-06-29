"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Categoria = { id: string; nombre: string; activo: boolean; createdAt: string; };
type Etiqueta  = { id: string; nombre: string; color: string;  createdAt: string; };

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

export default function Configuracion() {
  const router = useRouter();
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);

  // ── Categorías ──────────────────────────────────────────
  const [categorias,      setCategorias]      = useState<Categoria[]>([]);
  const [editandoCatId,   setEditandoCatId]   = useState<string | null>(null);
  const [catNombre,       setCatNombre]       = useState("");
  const [catActivo,       setCatActivo]       = useState(true);
  const [catErrores,      setCatErrores]      = useState<Record<string, string>>({});
  const [catErrorGeneral, setCatErrorGeneral] = useState<string | null>(null);
  const [catCargando,     setCatCargando]     = useState(false);

  // ── Etiquetas ────────────────────────────────────────────
  const [etiquetas,      setEtiquetas]      = useState<Etiqueta[]>([]);
  const [editandoEtqId,  setEditandoEtqId]  = useState<string | null>(null);
  const [etqNombre,      setEtqNombre]      = useState("");
  const [etqColor,       setEtqColor]       = useState("#3B82F6");
  const [etqErrores,     setEtqErrores]     = useState<Record<string, string>>({});
  const [etqErrorGeneral,setEtqErrorGeneral]= useState<string | null>(null);
  const [etqCargando,    setEtqCargando]    = useState(false);

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
    const res = await fetch(`${API}/api/v1/categorias`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setCategorias(await res.json());
  }

  async function cargarEtiquetas() {
    const res = await fetch(`${API}/api/v1/etiquetas`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setEtiquetas(await res.json());
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargarCategorias();
    cargarEtiquetas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function cerrarSesion() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  // ── CRUD Categorías ──────────────────────────────────────

  function iniciarEdicionCat(c: Categoria) {
    setEditandoCatId(c.id);
    setCatNombre(c.nombre);
    setCatActivo(c.activo);
    setCatErrores({});
    setCatErrorGeneral(null);
  }

  function cancelarEdicionCat() {
    setEditandoCatId(null);
    setCatNombre("");
    setCatActivo(true);
    setCatErrores({});
    setCatErrorGeneral(null);
  }

  async function guardarCategoria() {
    setCatCargando(true);
    setCatErrores({});
    setCatErrorGeneral(null);
    try {
      const url    = editandoCatId ? `${API}/api/v1/categorias/${editandoCatId}` : `${API}/api/v1/categorias`;
      const method = editandoCatId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: jsonHeaders(),
        body: JSON.stringify({ nombre: catNombre, activo: catActivo }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 400) { setCatErrores((await res.json()).errores ?? {}); return; }
      if (res.status === 409) { setCatErrorGeneral((await res.json()).error ?? "Nombre duplicado"); return; }
      if (!res.ok) throw new Error();
      setEditandoCatId(null);
      setCatNombre("");
      setCatActivo(true);
      await cargarCategorias();
    } catch {
      setCatErrorGeneral("No se pudo conectar con el backend.");
    } finally {
      setCatCargando(false);
    }
  }

  async function eliminarCategoria(c: Categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${c.nombre}"? Los tickets que la tengan quedarán sin categoría.`)) return;
    const res = await fetch(`${API}/api/v1/categorias/${c.id}`, { method: "DELETE", headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) await cargarCategorias();
  }

  // ── CRUD Etiquetas ───────────────────────────────────────

  function iniciarEdicionEtq(e: Etiqueta) {
    setEditandoEtqId(e.id);
    setEtqNombre(e.nombre);
    setEtqColor(e.color);
    setEtqErrores({});
    setEtqErrorGeneral(null);
  }

  function cancelarEdicionEtq() {
    setEditandoEtqId(null);
    setEtqNombre("");
    setEtqColor("#3B82F6");
    setEtqErrores({});
    setEtqErrorGeneral(null);
  }

  async function guardarEtiqueta() {
    setEtqCargando(true);
    setEtqErrores({});
    setEtqErrorGeneral(null);
    try {
      const url    = editandoEtqId ? `${API}/api/v1/etiquetas/${editandoEtqId}` : `${API}/api/v1/etiquetas`;
      const method = editandoEtqId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: jsonHeaders(),
        body: JSON.stringify({ nombre: etqNombre, color: etqColor }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 400) { setEtqErrores((await res.json()).errores ?? {}); return; }
      if (res.status === 409) { setEtqErrorGeneral((await res.json()).error ?? "Nombre duplicado"); return; }
      if (!res.ok) throw new Error();
      setEditandoEtqId(null);
      setEtqNombre("");
      setEtqColor("#3B82F6");
      await cargarEtiquetas();
    } catch {
      setEtqErrorGeneral("No se pudo conectar con el backend.");
    } finally {
      setEtqCargando(false);
    }
  }

  async function eliminarEtiqueta(e: Etiqueta) {
    if (!window.confirm(`¿Eliminar la etiqueta "${e.nombre}"? Se quitará de todos los tickets.`)) return;
    const res = await fetch(`${API}/api/v1/etiquetas/${e.id}`, { method: "DELETE", headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) await cargarEtiquetas();
  }

  const navLink: React.CSSProperties = {
    padding: "4px 10px", borderRadius: "var(--radius-sm)",
    fontSize: 13, textDecoration: "none", color: "var(--color-text-muted)",
  };
  const navLinkActive: React.CSSProperties = { ...navLink, color: "var(--color-primary)", fontWeight: 600 };
  const fieldError: React.CSSProperties = { fontSize: 12, color: "#c0392b", marginTop: 2, marginBottom: 4 };

  return (
    <>
      <header className="app-header">
        <span className="app-header-brand"><span>Rooster</span>Code · Help Desk</span>
        <nav style={{ display: "flex", gap: 4, marginLeft: 20 }}>
          <Link href="/"             style={navLink}>Tickets</Link>
          <Link href="/proveedores"  style={navLink}>Proveedores</Link>
          <Link href="/clientes"     style={navLink}>Clientes</Link>
          <Link href="/reportes"     style={navLink}>Reportes</Link>
          <span                      style={navLinkActive}>Configuración</span>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          {emailUsuario && <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{emailUsuario}</span>}
          <button className="btn-secondary" onClick={cerrarSesion} style={{ padding: "5px 12px", fontSize: 13 }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="app-main">

        {/* ── Categorías ── */}
        <section className="section-card">
          <h2 className="section-title">{editandoCatId ? "Editar categoría" : "Nueva categoría"}</h2>
          <input
            className="form-input"
            placeholder="Nombre de la categoría"
            value={catNombre}
            onChange={(e) => setCatNombre(e.target.value)}
          />
          {catErrores.nombre && <p style={fieldError}>{catErrores.nombre}</p>}

          {editandoCatId && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={catActivo}
                onChange={(e) => setCatActivo(e.target.checked)}
              />
              Activa
            </label>
          )}

          {catErrorGeneral && <p className="error-msg">{catErrorGeneral}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={guardarCategoria} disabled={catCargando}>
              {catCargando ? "Guardando…" : editandoCatId ? "Guardar cambios" : "Agregar categoría"}
            </button>
            {editandoCatId && (
              <button className="btn-secondary" onClick={cancelarEdicionCat} disabled={catCargando}>Cancelar</button>
            )}
          </div>
        </section>

        <section style={{ marginTop: 8, marginBottom: 32 }}>
          <h2 className="section-heading">Categorías ({categorias.length})</h2>
          {categorias.length === 0 && <p className="empty-msg">Todavía no hay categorías.</p>}
          {categorias.map((c) => (
            <div key={c.id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-numero-titulo">{c.nombre}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: c.activo ? "#D1FAE5" : "#F3F4F6",
                  color: c.activo ? "#065F46" : "#6B7280",
                }}>
                  {c.activo ? "ACTIVA" : "INACTIVA"}
                </span>
              </div>
              <div className="ticket-acciones">
                <button className="btn-secondary" onClick={() => iniciarEdicionCat(c)}>Editar</button>
                <button className="btn-secondary" onClick={() => eliminarCategoria(c)} style={{ color: "var(--color-primary)" }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ── Etiquetas ── */}
        <section className="section-card">
          <h2 className="section-title">{editandoEtqId ? "Editar etiqueta" : "Nueva etiqueta"}</h2>
          <input
            className="form-input"
            placeholder="Nombre de la etiqueta"
            value={etqNombre}
            onChange={(e) => setEtqNombre(e.target.value)}
          />
          {etqErrores.nombre && <p style={fieldError}>{etqErrores.nombre}</p>}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <label style={{ fontSize: 14, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
              Color:
            </label>
            <input
              type="color"
              value={etqColor}
              onChange={(e) => setEtqColor(e.target.value)}
              style={{ width: 44, height: 36, padding: 2, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", background: "none" }}
            />
            <span style={{
              background: etqColor, color: "#fff",
              borderRadius: 12, padding: "3px 12px",
              fontSize: 12, fontWeight: 600,
            }}>
              {etqNombre || "Vista previa"}
            </span>
          </div>
          {etqErrores.color && <p style={fieldError}>{etqErrores.color}</p>}

          {etqErrorGeneral && <p className="error-msg">{etqErrorGeneral}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={guardarEtiqueta} disabled={etqCargando}>
              {etqCargando ? "Guardando…" : editandoEtqId ? "Guardar cambios" : "Agregar etiqueta"}
            </button>
            {editandoEtqId && (
              <button className="btn-secondary" onClick={cancelarEdicionEtq} disabled={etqCargando}>Cancelar</button>
            )}
          </div>
        </section>

        <section style={{ marginTop: 8 }}>
          <h2 className="section-heading">Etiquetas ({etiquetas.length})</h2>
          {etiquetas.length === 0 && <p className="empty-msg">Todavía no hay etiquetas.</p>}
          {etiquetas.map((e) => (
            <div key={e.id} className="ticket-card">
              <div className="ticket-header">
                <span style={{
                  background: e.color, color: "#fff",
                  borderRadius: 12, padding: "3px 14px",
                  fontSize: 13, fontWeight: 600,
                }}>
                  {e.nombre}
                </span>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "monospace" }}>
                  {e.color}
                </span>
              </div>
              <div className="ticket-acciones">
                <button className="btn-secondary" onClick={() => iniciarEdicionEtq(e)}>Editar</button>
                <button className="btn-secondary" onClick={() => eliminarEtiqueta(e)} style={{ color: "var(--color-primary)" }}>
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
