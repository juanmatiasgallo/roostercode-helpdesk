"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) router.push("/");
  }, [router]);

  async function iniciarSesion() {
    if (!email.trim() || !password) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 401) {
        setError("Email o contraseña incorrectos.");
        return;
      }
      if (!res.ok) throw new Error("Error del servidor");
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <header className="app-header">
        <span className="app-header-brand">
          <span>Rooster</span>Code · Help Desk
        </span>
      </header>

      <main className="app-main" style={{ maxWidth: 420 }}>
        <div className="section-card" style={{ marginTop: 24 }}>
          <h2 className="section-title">Iniciar sesión</h2>
          <input
            className="form-input"
            type="email"
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && iniciarSesion()}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Contraseña"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && iniciarSesion()}
          />
          {error && <p className="error-msg">{error}</p>}
          <button
            className="btn-primary"
            onClick={iniciarSesion}
            disabled={cargando}
            style={{ width: "100%" }}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </main>
    </>
  );
}
