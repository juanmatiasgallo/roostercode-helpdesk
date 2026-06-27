# Especificación: Identidad visual base

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Contexto

La app funciona pero es visualmente plana (estilos sueltos en `page.tsx`).
Queremos darle una identidad propia (color, tipografía, componentes) y dejar una
base de estilo que las próximas pantallas (login, notas) hereden.

## Objetivo

Establecer un sistema de diseño base (tokens reutilizables) y aplicarlo a la
pantalla actual de tickets, **sin cambiar ninguna funcionalidad**.

## Alcance

**Incluye:**

- Tokens de diseño como variables CSS en `globals.css` (paleta, tipografía,
  espaciado, radios, sombras suaves).
- Una barra superior (header) con el nombre e identidad de la app.
- Los tickets mostrados como tarjetas prolijas.
- Badge de estado con color distinto por estado.
- Badge de prioridad.
- Botones con estilo (primario y secundario).
- Inputs, select y textarea del formulario, con estilo coherente.
- Mensajes de error con estilo.

**No incluye:**

- Cualquier funcionalidad nueva (esto es solo visual).
- Login, comentarios, clientes (van en otras specs).
- Agregar frameworks de UI pesados (ver restricciones).

## Dirección visual

Tema "Rooster" (gallo): un acento **cálido (rojo/carmesí)** sobre **neutros
limpios**, con aire moderno y profesional. Look ordenado y serio, tipo herramienta
de trabajo, no recargado.

### Paleta sugerida (Claude puede ajustar los tonos, manteniendo el espíritu)

| Token              | Valor      | Uso                                  |
|--------------------|------------|--------------------------------------|
| `--color-primary`  | `#C0392B`  | Acento principal, botones primarios  |
| `--color-primary-hover` | `#A93226` | Hover del primario               |
| `--color-bg`       | `#F6F7F9`  | Fondo de la página                   |
| `--color-surface`  | `#FFFFFF`  | Tarjetas, header                     |
| `--color-border`   | `#E3E6EA`  | Bordes suaves                        |
| `--color-text`     | `#1A1A1A`  | Texto principal                      |
| `--color-text-muted` | `#6B7280`| Texto secundario                     |

### Colores por estado del ticket

| Estado       | Color       |
|--------------|-------------|
| ABIERTO      | azul `#2563EB`   |
| EN_PROGRESO  | ámbar `#D97706`  |
| RESUELTO     | verde `#059669`  |
| CERRADO      | gris `#6B7280`   |

(Para los badges, usar el color de fondo claro y el texto en el tono oscuro de la
misma familia, de modo que se lea bien.)

### Tipografía

- Fuente del sistema (system font stack), sin agregar fuentes externas.
- Jerarquía clara: título de la app, títulos de sección, texto normal, texto
  secundario.

## Componentes a estilar

- **Header:** barra superior con el nombre "RoosterCode · Help Desk" e identidad
  (un acento de color). Queda fija arriba de la pantalla.
- **Tarjeta de ticket:** fondo `surface`, borde suave, radio, sombra ligera,
  buen espaciado. Muestra número, título, descripción, cliente, badges y botones.
- **Badge de estado:** color por estado (tabla de arriba).
- **Badge de prioridad:** un estilo diferenciado (puede ser sutil).
- **Botones:** primario (acento) y secundario (neutro), con estado hover.
- **Formulario:** inputs, select y textarea con bordes, foco visible y espaciado.
- **Mensajes de error:** estilo claro (fondo/borde suave en tono de alerta).

## Restricciones (de CLAUDE.md)

- **Sin cambios funcionales.** Crear, listar y las transiciones de estado tienen
  que seguir funcionando exactamente igual.
- **No agregar frameworks de UI pesados** (Tailwind, Material UI, etc.). Usar CSS
  con variables en `globals.css`. (Principio 18: toda tecnología debe justificarse.)
- Contraste de color accesible (texto legible sobre cada fondo).
- Debe verse bien en pantallas chicas (responsive básico).
- No tocar el backend.

## Criterios de aceptación

- [ ] La app tiene una barra superior con el nombre y un acento de color.
- [ ] Los tickets se ven como tarjetas prolijas y ordenadas.
- [ ] Cada estado se distingue por color (badge).
- [ ] Botones, inputs y mensajes tienen estilo coherente.
- [ ] Nada funcional se rompió: crear, listar, iniciar, resolver, cerrar y
  reabrir siguen andando.
- [ ] Se ve bien en una pantalla angosta (celular).

## Cómo pedírselo a Claude Code

Abrí el proyecto en VS Code y escribí:

> Implementá lo que está en `docs/identidad-visual.md`. Seguí las reglas de
> `CLAUDE.md`. Es solo visual: no cambies funcionalidad. Antes de editar
> archivos, mostrame el plan paso a paso.

Revisá el plan y, si está bien, decile que avance.
