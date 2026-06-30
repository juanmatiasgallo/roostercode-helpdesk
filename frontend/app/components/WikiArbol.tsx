"use client";

export type NodoTipo = "CARPETA" | "ARTICULO";

export type WikiNodo = {
  nombre: string;
  tipo: NodoTipo;
  ruta: string;
  hijos: WikiNodo[];
};

type Props = {
  nodos: WikiNodo[];
  rutaSeleccionada: string | null;
  expandidos: Set<string>;
  onToggle: (ruta: string) => void;
  onSeleccionar: (nodo: WikiNodo) => void;
  nivel?: number;
};

export default function WikiArbol({ nodos, rutaSeleccionada, expandidos, onToggle, onSeleccionar, nivel = 0 }: Props) {
  if (nodos.length === 0 && nivel === 0) {
    return <p className="empty-msg" style={{ padding: "8px 0" }}>El wiki está vacío.</p>;
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, paddingLeft: nivel === 0 ? 0 : 14 }}>
      {nodos.map((nodo) => {
        const esCarpeta = nodo.tipo === "CARPETA";
        const expandido = expandidos.has(nodo.ruta);
        const seleccionado = rutaSeleccionada === nodo.ruta;
        return (
          <li key={nodo.ruta}>
            <div
              onClick={() => {
                if (esCarpeta) onToggle(nodo.ruta);
                onSeleccionar(nodo);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 6px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: 13,
                background: seleccionado ? "var(--color-border)" : "transparent",
                color: esCarpeta ? "var(--color-text)" : "var(--color-text)",
                fontWeight: esCarpeta ? 600 : 400,
              }}
            >
              <span style={{ width: 14, textAlign: "center", color: "var(--color-text-muted)", fontSize: 11 }}>
                {esCarpeta ? (expandido ? "▾" : "▸") : "·"}
              </span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {esCarpeta ? "📁" : "📄"} {nodo.nombre}
              </span>
            </div>
            {esCarpeta && expandido && nodo.hijos.length > 0 && (
              <WikiArbol
                nodos={nodo.hijos}
                rutaSeleccionada={rutaSeleccionada}
                expandidos={expandidos}
                onToggle={onToggle}
                onSeleccionar={onSeleccionar}
                nivel={nivel + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
