"use client";

import { useState, useRef, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export type ClienteData = {
  id: string;
  nombreCompleto: string;
  celular: string;
  email: string;
};

type Props = {
  value: string;
  onSelect: (cliente: ClienteData | null) => void;
  token: string | null;
  onUnauthorized: () => void;
};

export default function ClienteSelector({ value, onSelect, token, onUnauthorized }: Props) {
  const [busqueda, setBusqueda] = useState(value);
  const [resultados, setResultados] = useState<ClienteData[]>([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBusqueda(value);
  }, [value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function buscarClientes(q: string) {
    if (q.trim().length < 2) {
      setResultados([]);
      setAbierto(false);
      return;
    }
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/api/v1/clientes?q=${encodeURIComponent(q.trim())}`, { headers });
      if (res.status === 401) { onUnauthorized(); return; }
      if (res.ok) {
        const data: ClienteData[] = await res.json();
        setResultados(data);
        setAbierto(data.length > 0);
      }
    } catch {
      // ignorar errores de red en autocomplete
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setBusqueda(val);
    onSelect(null);
    buscarClientes(val);
  }

  function seleccionar(c: ClienteData) {
    setBusqueda(c.nombreCompleto);
    setResultados([]);
    setAbierto(false);
    onSelect(c);
  }

  function limpiar() {
    setBusqueda("");
    setResultados([]);
    setAbierto(false);
    onSelect(null);
  }

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 10 }}>
      <div style={{ display: "flex" }}>
        <input
          className="form-input"
          style={{
            marginBottom: 0,
            flex: 1,
            borderTopRightRadius: busqueda ? 0 : undefined,
            borderBottomRightRadius: busqueda ? 0 : undefined,
            borderRight: busqueda ? "none" : undefined,
          }}
          placeholder="Buscar cliente por nombre (mín. 2 letras)…"
          value={busqueda}
          onChange={handleChange}
          onFocus={() => { if (resultados.length > 0) setAbierto(true); }}
          autoComplete="off"
        />
        {busqueda && (
          <button
            type="button"
            onClick={limpiar}
            style={{
              border: "1px solid var(--color-border)",
              borderLeft: "none",
              borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
              background: "#F3F4F6",
              padding: "0 12px",
              cursor: "pointer",
              fontSize: 18,
              color: "var(--color-text-muted)",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>
      {abierto && resultados.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-md)",
            marginTop: 2,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {resultados.map((c, i) => (
            <div
              key={c.id}
              onClick={() => seleccionar(c)}
              style={{
                padding: "9px 12px",
                cursor: "pointer",
                borderBottom: i < resultados.length - 1 ? "1px solid var(--color-border)" : undefined,
                fontSize: 14,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontWeight: 600 }}>{c.nombreCompleto}</span>
              <span style={{ marginLeft: 8, fontSize: 12, color: "var(--color-text-muted)" }}>
                {c.email}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
