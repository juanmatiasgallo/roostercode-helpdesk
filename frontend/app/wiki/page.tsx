"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WikiArbol, { WikiNodo } from "../components/WikiArbol";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

function carpetaPadre(ruta: string): string {
  const idx = ruta.lastIndexOf("/");
  return idx === -1 ? "" : ruta.slice(0, idx);
}

function breadcrumb(nodo: WikiNodo): string[] {
  const partes = nodo.ruta.split("/");
  if (nodo.tipo === "ARTICULO") partes[partes.length - 1] = nodo.nombre;
  return partes;
}

export default function Wiki() {
  const router = useRouter();
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [arbol, setArbol] = useState<WikiNodo[]>([]);
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const [seleccionado, setSeleccionado] = useState<WikiNodo | null>(null);
  const [contenido, setContenido] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [contenidoEditado, setContenidoEditado] = useState("");
  const [cargandoArbol, setCargandoArbol] = useState(true);
  const [cargandoArticulo, setCargandoArticulo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function manejarNoAutorizado() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  async function cargarUsuario() {
    const res = await fetch(`${API}/api/v1/auth/me`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setEmailUsuario((await res.json()).email);
  }

  async function cargarArbol() {
    setCargandoArbol(true);
    try {
      const res = await fetch(`${API}/api/v1/wiki/arbol`, { headers: authHeader() });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.ok) setArbol(await res.json());
    } catch {
      setError("No se pudo conectar con el backend.");
    } finally {
      setCargandoArbol(false);
    }
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargarArbol();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function cerrarSesion() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function toggleExpandido(ruta: string) {
    setExpandidos((prev) => {
      const next = new Set(prev);
      if (next.has(ruta)) next.delete(ruta); else next.add(ruta);
      return next;
    });
  }

  async function seleccionarNodo(nodo: WikiNodo) {
    setError(null);
    setEditando(false);
    setSeleccionado(nodo);
    if (nodo.tipo !== "ARTICULO") { setContenido(null); return; }
    setCargandoArticulo(true);
    try {
      const res = await fetch(`${API}/api/v1/wiki/articulo?ruta=${encodeURIComponent(nodo.ruta)}`, { headers: authHeader() });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.ok) {
        setContenido((await res.json()).contenido);
      } else {
        setError("No se pudo cargar el artículo.");
      }
    } catch {
      setError("No se pudo conectar con el backend.");
    } finally {
      setCargandoArticulo(false);
    }
  }

  function carpetaContexto(): string {
    if (!seleccionado) return "";
    return seleccionado.tipo === "CARPETA" ? seleccionado.ruta : carpetaPadre(seleccionado.ruta);
  }

  function iniciarEdicion() {
    setContenidoEditado(contenido ?? "");
    setEditando(true);
  }

  async function guardarArticulo() {
    if (!seleccionado) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/wiki/articulo?ruta=${encodeURIComponent(seleccionado.ruta)}`, {
        method: "PUT",
        headers: jsonHeaders(),
        body: JSON.stringify({ contenido: contenidoEditado }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (!res.ok) throw new Error();
      setContenido(contenidoEditado);
      setEditando(false);
    } catch {
      setError("No se pudo guardar el artículo.");
    } finally {
      setGuardando(false);
    }
  }

  async function crearCarpeta() {
    const nombre = window.prompt("Nombre de la nueva carpeta:");
    if (!nombre || !nombre.trim()) return;
    const rutaPadre = carpetaContexto();
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/wiki/carpeta`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ rutaPadre, nombre: nombre.trim() }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 409) { setError("Ya existe un elemento con ese nombre en esa carpeta."); return; }
      if (res.status === 400) { setError("Nombre inválido."); return; }
      if (!res.ok) throw new Error();
      setExpandidos((prev) => new Set(prev).add(rutaPadre));
      await cargarArbol();
    } catch {
      setError("No se pudo conectar con el backend.");
    }
  }

  async function crearArticulo() {
    const nombre = window.prompt("Nombre del nuevo artículo:");
    if (!nombre || !nombre.trim()) return;
    const rutaPadre = carpetaContexto();
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/wiki/articulo`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ rutaPadre, nombre: nombre.trim() }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 409) { setError("Ya existe un elemento con ese nombre en esa carpeta."); return; }
      if (res.status === 400) { setError("Nombre inválido."); return; }
      if (!res.ok) throw new Error();
      setExpandidos((prev) => new Set(prev).add(rutaPadre));
      await cargarArbol();
    } catch {
      setError("No se pudo conectar con el backend.");
    }
  }

  async function eliminarNodo() {
    if (!seleccionado) return;
    const tipoLabel = seleccionado.tipo === "CARPETA" ? "la carpeta" : "el artículo";
    if (!window.confirm(`¿Eliminar ${tipoLabel} "${seleccionado.nombre}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/wiki/nodo?ruta=${encodeURIComponent(seleccionado.ruta)}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (!res.ok) throw new Error();
      setSeleccionado(null);
      setContenido(null);
      setEditando(false);
      await cargarArbol();
    } catch {
      setError("No se pudo eliminar.");
    }
  }

  const navLink: React.CSSProperties = {
    padding: "4px 10px", borderRadius: "var(--radius-sm)",
    fontSize: 13, textDecoration: "none", color: "var(--color-text-muted)",
  };
  const navLinkActive: React.CSSProperties = { ...navLink, color: "var(--color-primary)", fontWeight: 600 };

  return (
    <>
      <header className="app-header">
        <span className="app-header-brand"><span>Rooster</span>Code · Help Desk</span>
        <nav style={{ display: "flex", gap: 4, marginLeft: 20 }}>
          <Link href="/"             style={navLink}>Tickets</Link>
          <Link href="/proveedores"  style={navLink}>Proveedores</Link>
          <Link href="/clientes"     style={navLink}>Clientes</Link>
          <Link href="/reportes"     style={navLink}>Reportes</Link>
          <span                      style={navLinkActive}>Base de Conocimiento</span>
          <Link href="/configuracion" style={navLink}>Configuración</Link>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          {emailUsuario && <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{emailUsuario}</span>}
          <button className="btn-secondary" onClick={cerrarSesion} style={{ padding: "5px 12px", fontSize: 13 }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="app-main" style={{ maxWidth: 1100 }}>
        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <aside className="section-card" style={{ width: 260, flexShrink: 0, padding: 14 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 12, padding: "6px 8px" }} onClick={crearCarpeta}>
                + Carpeta
              </button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 12, padding: "6px 8px" }} onClick={crearArticulo}>
                + Artículo
              </button>
            </div>
            {cargandoArbol ? (
              <p className="empty-msg">Cargando…</p>
            ) : (
              <WikiArbol
                nodos={arbol}
                rutaSeleccionada={seleccionado?.ruta ?? null}
                expandidos={expandidos}
                onToggle={toggleExpandido}
                onSeleccionar={seleccionarNodo}
              />
            )}
          </aside>

          <section className="section-card" style={{ flex: 1, minHeight: 400 }}>
            {!seleccionado && (
              <p className="empty-msg">Seleccioná una carpeta o un artículo del árbol, o creá uno nuevo.</p>
            )}

            {seleccionado && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                    {breadcrumb(seleccionado).map((parte, i) => (
                      <span key={i}>
                        {i > 0 && " / "}
                        {parte}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {seleccionado.tipo === "ARTICULO" && !editando && (
                      <button className="btn-secondary" onClick={iniciarEdicion}>Editar</button>
                    )}
                    {editando && (
                      <>
                        <button className="btn-primary" onClick={guardarArticulo} disabled={guardando}>
                          {guardando ? "Guardando…" : "Guardar"}
                        </button>
                        <button className="btn-secondary" onClick={() => setEditando(false)} disabled={guardando}>
                          Cancelar
                        </button>
                      </>
                    )}
                    <button className="btn-secondary" onClick={eliminarNodo} style={{ color: "var(--color-primary)" }}>
                      Eliminar
                    </button>
                  </div>
                </div>

                {seleccionado.tipo === "CARPETA" && (
                  <p className="empty-msg">
                    Carpeta seleccionada. Usá los botones de arriba para crear contenido dentro de ella.
                  </p>
                )}

                {seleccionado.tipo === "ARTICULO" && cargandoArticulo && (
                  <p className="empty-msg">Cargando artículo…</p>
                )}

                {seleccionado.tipo === "ARTICULO" && !cargandoArticulo && editando && (
                  <div style={{ display: "flex", gap: 16 }}>
                    <textarea
                      className="form-input"
                      style={{ flex: 1, height: 480, resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
                      value={contenidoEditado}
                      onChange={(e) => setContenidoEditado(e.target.value)}
                    />
                    <div style={{ flex: 1, height: 480, overflowY: "auto", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: 12 }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contenidoEditado}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {seleccionado.tipo === "ARTICULO" && !cargandoArticulo && !editando && (
                  <div>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{contenido ?? ""}</ReactMarkdown>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
