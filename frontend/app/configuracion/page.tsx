"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Categoria = { id: string; nombre: string; activo: boolean; createdAt: string; };
type Etiqueta  = { id: string; nombre: string; color: string;  createdAt: string; };
type Usuario   = { id: string; nombre: string; email: string; rol: string; activo: boolean; };

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
  const [rolUsuario,   setRolUsuario]   = useState<string | null>(null);

  // ── Categorías ──────────────────────────────────────────
  const [categorias,      setCategorias]      = useState<Categoria[]>([]);
  const [editandoCatId,   setEditandoCatId]   = useState<string | null>(null);
  const [catNombre,       setCatNombre]       = useState("");
  const [catActivo,       setCatActivo]       = useState(true);
  const [catErrores,      setCatErrores]      = useState<Record<string, string>>({});
  const [catErrorGeneral, setCatErrorGeneral] = useState<string | null>(null);
  const [catCargando,     setCatCargando]     = useState(false);

  // ── Usuarios ─────────────────────────────────────────────
  const [usuarios,        setUsuarios]        = useState<Usuario[]>([]);
  const [editandoUsrId,   setEditandoUsrId]   = useState<string | null>(null);
  const [usrNombre,       setUsrNombre]       = useState("");
  const [usrEmail,        setUsrEmail]        = useState("");
  const [usrRol,          setUsrRol]          = useState("AGENTE");
  const [usrPassword,     setUsrPassword]     = useState("");
  const [usrErrores,      setUsrErrores]      = useState<Record<string, string>>({});
  const [usrErrorGeneral, setUsrErrorGeneral] = useState<string | null>(null);
  const [usrCargando,     setUsrCargando]     = useState(false);

  // ── SLA ──────────────────────────────────────────────────
  const [slaHoras,        setSlaHoras]        = useState<Record<string, number>>({ BAJA: 0, MEDIA: 0, ALTA: 0, URGENTE: 0 });
  const [slaErrorGeneral, setSlaErrorGeneral] = useState<string | null>(null);
  const [slaCargando,     setSlaCargando]     = useState(false);

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
    if (res.ok) {
      const me = await res.json();
      setEmailUsuario(me.email);
      setRolUsuario(me.rol);
    }
  }

  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API}/api/v1/usuarios`, { headers: authHeader() });
      if (res.ok) setUsuarios(await res.json());
    } catch { /* no crítico */ }
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

  async function cargarSla() {
    try {
      const res = await fetch(`${API}/api/v1/sla`, { headers: authHeader() });
      if (res.ok) {
        const data: { prioridad: string; horasObjetivo: number }[] = await res.json();
        const mapa: Record<string, number> = {};
        data.forEach((d) => { mapa[d.prioridad] = d.horasObjetivo; });
        setSlaHoras(mapa);
      }
    } catch { /* no crítico */ }
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargarCategorias();
    cargarEtiquetas();
    cargarUsuarios();
    cargarSla();
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

  // ── CRUD Usuarios ────────────────────────────────────────

  function iniciarEdicionUsr(u: Usuario) {
    setEditandoUsrId(u.id);
    setUsrNombre(u.nombre);
    setUsrEmail(u.email);
    setUsrRol(u.rol);
    setUsrPassword("");
    setUsrErrores({});
    setUsrErrorGeneral(null);
  }

  function cancelarEdicionUsr() {
    setEditandoUsrId(null);
    setUsrNombre("");
    setUsrEmail("");
    setUsrRol("AGENTE");
    setUsrPassword("");
    setUsrErrores({});
    setUsrErrorGeneral(null);
  }

  async function guardarUsuario() {
    setUsrCargando(true);
    setUsrErrores({});
    setUsrErrorGeneral(null);
    try {
      if (editandoUsrId) {
        const res = await fetch(`${API}/api/v1/usuarios/${editandoUsrId}`, {
          method: "PUT",
          headers: jsonHeaders(),
          body: JSON.stringify({ nombre: usrNombre, rol: usrRol }),
        });
        if (res.status === 401) { manejarNoAutorizado(); return; }
        if (res.status === 400) { setUsrErrores((await res.json()).errores ?? {}); return; }
        if (!res.ok) throw new Error();
        setEditandoUsrId(null);
        setUsrNombre("");
        setUsrRol("AGENTE");
      } else {
        const res = await fetch(`${API}/api/v1/usuarios`, {
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify({ nombre: usrNombre, email: usrEmail, rol: usrRol, password: usrPassword }),
        });
        if (res.status === 401) { manejarNoAutorizado(); return; }
        if (res.status === 400) { setUsrErrores((await res.json()).errores ?? {}); return; }
        if (res.status === 409) { setUsrErrorGeneral((await res.json()).error ?? "Email duplicado"); return; }
        if (!res.ok) throw new Error();
        setUsrNombre("");
        setUsrEmail("");
        setUsrRol("AGENTE");
        setUsrPassword("");
      }
      await cargarUsuarios();
    } catch {
      setUsrErrorGeneral("No se pudo conectar con el backend.");
    } finally {
      setUsrCargando(false);
    }
  }

  // ── SLA ──────────────────────────────────────────────────

  async function guardarSla() {
    setSlaCargando(true);
    setSlaErrorGeneral(null);
    try {
      const res = await fetch(`${API}/api/v1/sla`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify({
          items: ["BAJA", "MEDIA", "ALTA", "URGENTE"].map((p) => ({
            prioridad: p,
            horasObjetivo: Number(slaHoras[p]),
          })),
        }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 400) { setSlaErrorGeneral("Revisá los valores ingresados."); return; }
      if (!res.ok) throw new Error();
      await cargarSla();
    } catch {
      setSlaErrorGeneral("No se pudo conectar con el backend.");
    } finally {
      setSlaCargando(false);
    }
  }

  async function toggleActivarUsr(u: Usuario) {
    const accion = u.activo ? "desactivar" : "activar";
    const res = await fetch(`${API}/api/v1/usuarios/${u.id}/${accion}`, {
      method: "PUT",
      headers: authHeader(),
    });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) await cargarUsuarios();
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

        {/* ── SLA (solo ADMIN) ── */}
        {rolUsuario === "ADMIN" && (
          <section className="section-card" style={{ marginTop: 32 }}>
            <h2 className="section-title">SLA — Tiempos objetivo (horas)</h2>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(["BAJA", "MEDIA", "ALTA", "URGENTE"] as const).map((p) => (
                <div key={p} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    {p}
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    style={{ width: 100, marginBottom: 0 }}
                    value={slaHoras[p] ?? ""}
                    onChange={(e) => setSlaHoras((prev) => ({ ...prev, [p]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
            {slaErrorGeneral && <p className="error-msg" style={{ marginTop: 10 }}>{slaErrorGeneral}</p>}
            <div style={{ marginTop: 10 }}>
              <button className="btn-primary" onClick={guardarSla} disabled={slaCargando}>
                {slaCargando ? "Guardando…" : "Guardar SLA"}
              </button>
            </div>
          </section>
        )}

        {/* ── Usuarios / Agentes (solo ADMIN) ── */}
        {rolUsuario === "ADMIN" && (
          <>
            <section className="section-card" style={{ marginTop: 32 }}>
              <h2 className="section-title">
                {editandoUsrId ? "Editar usuario" : "Nuevo usuario"}
              </h2>

              <input
                className="form-input"
                placeholder="Nombre"
                value={usrNombre}
                onChange={(e) => setUsrNombre(e.target.value)}
              />
              {usrErrores.nombre && <p style={fieldError}>{usrErrores.nombre}</p>}

              {!editandoUsrId && (
                <>
                  <input
                    className="form-input"
                    placeholder="Email"
                    type="email"
                    value={usrEmail}
                    onChange={(e) => setUsrEmail(e.target.value)}
                    autoComplete="off"
                  />
                  {usrErrores.email && <p style={fieldError}>{usrErrores.email}</p>}

                  <input
                    className="form-input"
                    placeholder="Contraseña inicial"
                    type="password"
                    value={usrPassword}
                    onChange={(e) => setUsrPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  {usrErrores.password && <p style={fieldError}>{usrErrores.password}</p>}
                </>
              )}

              <select
                className="form-input"
                value={usrRol}
                onChange={(e) => setUsrRol(e.target.value)}
              >
                <option value="AGENTE">Agente</option>
                <option value="ADMIN">Admin</option>
              </select>
              {usrErrores.rol && <p style={fieldError}>{usrErrores.rol}</p>}

              {usrErrorGeneral && <p className="error-msg">{usrErrorGeneral}</p>}

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={guardarUsuario} disabled={usrCargando}>
                  {usrCargando ? "Guardando…" : editandoUsrId ? "Guardar cambios" : "Crear usuario"}
                </button>
                {editandoUsrId && (
                  <button className="btn-secondary" onClick={cancelarEdicionUsr} disabled={usrCargando}>
                    Cancelar
                  </button>
                )}
              </div>
            </section>

            <section style={{ marginTop: 8 }}>
              <h2 className="section-heading">Usuarios ({usuarios.length})</h2>
              {usuarios.length === 0 && <p className="empty-msg">No hay usuarios.</p>}
              {usuarios.map((u) => (
                <div key={u.id} className="ticket-card">
                  <div className="ticket-header">
                    <span className="ticket-numero-titulo">{u.nombre}</span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: u.rol === "ADMIN" ? "#EFF6FF" : "#F5F3FF",
                        color: u.rol === "ADMIN" ? "#1D4ED8" : "#6D28D9",
                      }}>
                        {u.rol}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: u.activo ? "#D1FAE5" : "#F3F4F6",
                        color: u.activo ? "#065F46" : "#6B7280",
                      }}>
                        {u.activo ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </div>
                  </div>
                  <p className="ticket-descripcion" style={{ marginBottom: 6 }}>{u.email}</p>
                  <div className="ticket-acciones">
                    <button className="btn-secondary" onClick={() => iniciarEdicionUsr(u)}>
                      Editar
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => toggleActivarUsr(u)}
                      style={{ color: u.activo ? "var(--color-primary)" : "#16A34A" }}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}

      </main>
    </>
  );
}
