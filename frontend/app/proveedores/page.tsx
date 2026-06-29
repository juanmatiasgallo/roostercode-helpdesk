"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const DEPARTAMENTOS: [string, string][] = [
  ["ARTIGAS", "Artigas"],
  ["CANELONES", "Canelones"],
  ["CERRO_LARGO", "Cerro Largo"],
  ["COLONIA", "Colonia"],
  ["DURAZNO", "Durazno"],
  ["FLORES", "Flores"],
  ["FLORIDA", "Florida"],
  ["LAVALLEJA", "Lavalleja"],
  ["MALDONADO", "Maldonado"],
  ["MONTEVIDEO", "Montevideo"],
  ["PAYSANDU", "Paysandú"],
  ["RIO_NEGRO", "Río Negro"],
  ["RIVERA", "Rivera"],
  ["ROCHA", "Rocha"],
  ["SALTO", "Salto"],
  ["SAN_JOSE", "San José"],
  ["SORIANO", "Soriano"],
  ["TACUAREMBO", "Tacuarembó"],
  ["TREINTA_Y_TRES", "Treinta y Tres"],
];

const DEPTO_LABEL = Object.fromEntries(DEPARTAMENTOS);

type Proveedor = {
  id: string;
  empresa: string;
  rut: string;
  telefono: string;
  direccion: string;
  departamento: string;
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

export default function Proveedores() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [departamento, setDepartamento] = useState("");
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

  async function cargarProveedores() {
    const res = await fetch(`${API}/api/v1/proveedores`, { headers: authHeader() });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) setProveedores(await res.json());
  }

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    cargarUsuario();
    cargarProveedores();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function cerrarSesion() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function iniciarEdicion(p: Proveedor) {
    setEditandoId(p.id);
    setEmpresa(p.empresa);
    setRut(p.rut);
    setTelefono(p.telefono);
    setDireccion(p.direccion);
    setDepartamento(p.departamento);
    setEmail(p.email);
    setErroresCampos({});
    setErrorGeneral(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setEmpresa("");
    setRut("");
    setTelefono("");
    setDireccion("");
    setDepartamento("");
    setEmail("");
    setErroresCampos({});
    setErrorGeneral(null);
  }

  async function guardarProveedor() {
    setCargando(true);
    setErroresCampos({});
    setErrorGeneral(null);
    try {
      const url = editandoId
        ? `${API}/api/v1/proveedores/${editandoId}`
        : `${API}/api/v1/proveedores`;
      const method = editandoId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: jsonHeaders(),
        body: JSON.stringify({
          empresa,
          rut,
          telefono,
          direccion,
          departamento: departamento || null,
          email,
        }),
      });
      if (res.status === 401) { manejarNoAutorizado(); return; }
      if (res.status === 400) {
        const body = await res.json();
        setErroresCampos(body.errores ?? {});
        return;
      }
      if (res.status === 409) {
        const body = await res.json();
        setErrorGeneral(body.error ?? "Ya existe un proveedor con esos datos");
        return;
      }
      if (!res.ok) throw new Error();
      setEditandoId(null);
      setEmpresa("");
      setRut("");
      setTelefono("");
      setDireccion("");
      setDepartamento("");
      setEmail("");
      await cargarProveedores();
    } catch {
      setErrorGeneral("No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  }

  async function eliminarProveedor(p: Proveedor) {
    if (!window.confirm(`¿Eliminar a ${p.empresa}?`)) return;
    const res = await fetch(`${API}/api/v1/proveedores/${p.id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (res.status === 401) { manejarNoAutorizado(); return; }
    if (res.ok) await cargarProveedores();
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
          <span style={navLinkActive}>Proveedores</span>
          <Link href="/clientes" style={navLink}>Clientes</Link>
          <Link href="/reportes" style={navLink}>Reportes</Link>
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
            {editandoId ? "Editar proveedor" : "Nuevo proveedor"}
          </h2>

          <input
            className="form-input"
            placeholder="Empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
          />
          {erroresCampos.empresa && <p style={fieldError}>{erroresCampos.empresa}</p>}

          <input
            className="form-input"
            placeholder="RUT (12 dígitos)"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />
          {erroresCampos.rut && <p style={fieldError}>{erroresCampos.rut}</p>}

          <input
            className="form-input"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          {erroresCampos.telefono && <p style={fieldError}>{erroresCampos.telefono}</p>}

          <textarea
            className="form-input"
            style={{ height: 72, resize: "vertical" }}
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          {erroresCampos.direccion && <p style={fieldError}>{erroresCampos.direccion}</p>}

          <select
            className="form-input"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
          >
            <option value="">Seleccioná un departamento</option>
            {DEPARTAMENTOS.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {erroresCampos.departamento && <p style={fieldError}>{erroresCampos.departamento}</p>}

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
            <button className="btn-primary" onClick={guardarProveedor} disabled={cargando}>
              {cargando ? "Guardando..." : editandoId ? "Guardar cambios" : "Agregar proveedor"}
            </button>
            {editandoId && (
              <button className="btn-secondary" onClick={cancelarEdicion} disabled={cargando}>
                Cancelar
              </button>
            )}
          </div>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2 className="section-heading">Proveedores ({proveedores.length})</h2>
          {proveedores.length === 0 && (
            <p className="empty-msg">Todavía no hay proveedores. Cargá el primero arriba.</p>
          )}
          {proveedores.map((p) => (
            <div key={p.id} className="ticket-card">
              <div className="ticket-header">
                <span className="ticket-numero-titulo">{p.empresa}</span>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  {DEPTO_LABEL[p.departamento] ?? p.departamento}
                </span>
              </div>
              <p className="ticket-descripcion" style={{ marginBottom: 2 }}>
                <strong>RUT:</strong> {p.rut}
              </p>
              <p className="ticket-descripcion" style={{ marginBottom: 2 }}>
                <strong>Email:</strong> {p.email} · <strong>Tel:</strong> {p.telefono}
              </p>
              <p className="ticket-descripcion" style={{ marginBottom: 6 }}>
                {p.direccion}
              </p>
              <div className="ticket-acciones">
                <button className="btn-secondary" onClick={() => iniciarEdicion(p)}>
                  Editar
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => eliminarProveedor(p)}
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
