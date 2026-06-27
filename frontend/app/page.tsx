"use client";

import { useEffect, useState } from "react";

// La URL del backend se inyecta en el build. En EasyPanel se setea como NEXT_PUBLIC_API_URL.
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

const COLOR_ESTADO: Record<Ticket["estado"], string> = {
  ABIERTO:     "#1565c0",
  EN_PROGRESO: "#e65100",
  RESUELTO:    "#2e7d32",
  CERRADO:     "#616161",
};

const PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "URGENTE"];

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTransicion, setErrorTransicion] = useState<string | null>(null);

  async function cargarTickets() {
    try {
      const res = await fetch(`${API}/api/v1/tickets`);
      if (!res.ok) throw new Error("No se pudieron cargar los tickets");
      setTickets(await res.json());
      setError(null);
    } catch (e) {
      setError("No se pudo conectar con el backend. ¿Está corriendo y bien configurada la URL?");
    }
  }

  useEffect(() => {
    cargarTickets();
  }, []);

  async function transicionarTicket(id: string, accion: Accion) {
    setErrorTransicion(null);
    try {
      const res = await fetch(`${API}/api/v1/tickets/${id}/${accion}`, { method: "POST" });
      if (res.status === 409) {
        const body = await res.json();
        setErrorTransicion(body.error ?? "Transición inválida");
        return;
      }
      if (!res.ok) throw new Error("Error inesperado");
      await cargarTickets();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, clienteNombre, prioridad }),
      });
      if (!res.ok) throw new Error("No se pudo crear el ticket");
      setTitulo("");
      setDescripcion("");
      setClienteNombre("");
      setPrioridad("MEDIA");
      await cargarTickets();
    } catch (e) {
      setError("No se pudo crear el ticket.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>RoosterCode · Help Desk</h1>
      <p style={{ color: "#666", marginTop: 0 }}>Walking skeleton — v0.1</p>

      <section style={card}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Nuevo ticket</h2>
        <input style={input} placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <textarea style={{ ...input, height: 80 }} placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <input style={input} placeholder="Cliente (opcional)" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} />
        <select style={input} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button style={boton} onClick={crearTicket} disabled={cargando}>
          {cargando ? "Creando..." : "Crear ticket"}
        </button>
      </section>

      {error && <p style={{ color: "#b00020" }}>{error}</p>}
      {errorTransicion && <p style={{ color: "#b00020" }}>{errorTransicion}</p>}

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16 }}>Tickets ({tickets.length})</h2>
        {tickets.length === 0 && <p style={{ color: "#888" }}>Todavía no hay tickets. Creá el primero arriba.</p>}
        {tickets.map((t) => (
          <div key={t.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <strong>#{t.numero} · {t.titulo}</strong>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ ...badge, background: COLOR_ESTADO[t.estado], color: "#fff" }}>{t.estado}</span>
                <span style={badge}>{t.prioridad}</span>
              </div>
            </div>
            <p style={{ margin: "6px 0", color: "#444" }}>{t.descripcion}</p>
            <small style={{ color: "#888" }}>
              {t.clienteNombre ? `Cliente: ${t.clienteNombre}` : ""}
            </small>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {ACCIONES_POR_ESTADO[t.estado].map((accion) => (
                <button
                  key={accion}
                  style={botonAccion}
                  onClick={() => transicionarTicket(t.id, accion)}
                >
                  {LABEL_ACCION[accion]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e3e3e3",
  borderRadius: 10,
  padding: 16,
  marginBottom: 12,
};
const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  marginBottom: 10,
  border: "1px solid #ccc",
  borderRadius: 8,
  fontSize: 14,
};
const boton: React.CSSProperties = {
  background: "#c0392b",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 18px",
  fontSize: 14,
  cursor: "pointer",
};
const badge: React.CSSProperties = {
  background: "#f0f0f0",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: 12,
};
const botonAccion: React.CSSProperties = {
  background: "#f0f0f0",
  color: "#333",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "5px 12px",
  fontSize: 13,
  cursor: "pointer",
};
