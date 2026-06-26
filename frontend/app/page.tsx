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
  estado: string;
  createdAt: string;
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

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16 }}>Tickets ({tickets.length})</h2>
        {tickets.length === 0 && <p style={{ color: "#888" }}>Todavía no hay tickets. Creá el primero arriba.</p>}
        {tickets.map((t) => (
          <div key={t.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>#{t.numero} · {t.titulo}</strong>
              <span style={badge}>{t.prioridad}</span>
            </div>
            <p style={{ margin: "6px 0", color: "#444" }}>{t.descripcion}</p>
            <small style={{ color: "#888" }}>
              {t.clienteNombre ? `Cliente: ${t.clienteNombre} · ` : ""}Estado: {t.estado}
            </small>
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
