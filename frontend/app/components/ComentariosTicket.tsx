"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Comentario = {
  id: string;
  cuerpo: string;
  visibilidad: "INTERNA" | "PUBLICA";
  createdAt: string;
  autorNombre: string;
  autorEmail: string;
};

type Props = {
  ticketId: string;
  token: string | null;
  onUnauthorized: () => void;
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ComentariosTicket({ ticketId, token, onUnauthorized }: Props) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [cuerpo, setCuerpo] = useState("");
  const [visibilidad, setVisibilidad] = useState<"INTERNA" | "PUBLICA">("INTERNA");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function authHeader(): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function cargar() {
    const res = await fetch(`${API}/api/v1/tickets/${ticketId}/comentarios`, {
      headers: authHeader(),
    });
    if (res.status === 401) { onUnauthorized(); return; }
    if (res.ok) setComentarios(await res.json());
  }

  useEffect(() => {
    cargar();
  }, [ticketId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function enviar() {
    if (!cuerpo.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/tickets/${ticketId}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ cuerpo, visibilidad }),
      });
      if (res.status === 401) { onUnauthorized(); return; }
      if (!res.ok) throw new Error();
      setCuerpo("");
      await cargar();
    } catch {
      setError("No se pudo guardar el comentario.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 14, paddingTop: 14 }}>

      {comentarios.length === 0 && (
        <p className="empty-msg" style={{ padding: "4px 0 10px" }}>Sin comentarios todavía.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {comentarios.map((c) => (
          <div key={c.id} style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)" }}>
                {c.autorNombre} · {formatFecha(c.createdAt)}
              </span>
              <span
                className={`badge-estado ${c.visibilidad === "INTERNA" ? "estado-cerrado" : "estado-abierto"}`}
                style={{ fontSize: 10, letterSpacing: "0.04em" }}
              >
                {c.visibilidad === "INTERNA" ? "Interna" : "Pública"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-text)", lineHeight: 1.5 }}>
              {c.cuerpo}
            </p>
          </div>
        ))}
      </div>

      <textarea
        className="form-input"
        style={{ height: 72, resize: "vertical", marginBottom: 8 }}
        placeholder="Escribí un comentario..."
        value={cuerpo}
        onChange={(e) => setCuerpo(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          className="form-input"
          style={{ width: "auto", marginBottom: 0 }}
          value={visibilidad}
          onChange={(e) => setVisibilidad(e.target.value as "INTERNA" | "PUBLICA")}
        >
          <option value="INTERNA">Interna</option>
          <option value="PUBLICA">Pública</option>
        </select>
        <button className="btn-primary" onClick={enviar} disabled={enviando}>
          {enviando ? "Guardando..." : "Comentar"}
        </button>
      </div>
      {error && <p className="error-msg" style={{ marginTop: 8, marginBottom: 0 }}>{error}</p>}
    </div>
  );
}
