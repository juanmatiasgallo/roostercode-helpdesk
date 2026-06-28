# Especificación: Comentarios en el ticket, con autoría (v1)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Contexto

Los tickets ya se crean, se listan y cambian de estado, y la app tiene login
(usuarios con rol ADMIN). Falta poder dejar notas dentro de cada ticket y saber
quién las escribió.

## Objetivo

Permitir agregar comentarios a un ticket. Cada comentario registra **quién lo
escribió** (autoría) y si es **interno** o **público**.

## Alcance del v1

**Incluye:**

- Agregar un comentario a un ticket.
- Cada comentario guarda: autor (el usuario logueado), texto, visibilidad
  (INTERNA | PUBLICA) y fecha.
- Listar los comentarios de un ticket, en orden cronológico.
- Ver, en cada comentario, el autor, la fecha y una etiqueta de visibilidad.

**Fuera del alcance:**

- Portal de cliente (los clientes no inician sesión todavía). Por eso, la
  visibilidad "PUBLICA" hoy **no expone nada a ningún cliente**; es solo una
  etiqueta guardada para el futuro.
- Editar o borrar comentarios.
- Notificaciones.

## Backend

### Modelo

- Nueva entidad `Comentario`: id (UUID), ticket (referencia al Ticket),
  autor (referencia al Usuario), cuerpo (texto), visibilidad
  (INTERNA | PUBLICA), createdAt.
- Migración Flyway `V4__comentario.sql` que cree la tabla `comentario`
  (con FK a `ticket` —ON DELETE CASCADE— y a `usuario`).
- `visibilidad` como `varchar` + `CHECK ('INTERNA','PUBLICA')`, mapeada con
  `@Enumerated(EnumType.STRING)`.

### Endpoints (bajo `/api/v1`, protegidos por la seguridad ya existente)

| Método | Ruta                              | Efecto                          |
|--------|-----------------------------------|---------------------------------|
| POST   | `/tickets/{id}/comentarios`       | Crear comentario en el ticket   |
| GET    | `/tickets/{id}/comentarios`       | Listar comentarios del ticket   |

- **El autor se toma del usuario autenticado (del token), NUNCA del body.**
  El cliente no puede decir quién es el autor; lo determina el backend.
- Body de creación: `{ "cuerpo": "...", "visibilidad": "INTERNA" | "PUBLICA" }`.
- La respuesta de listado incluye, por cada comentario: id, cuerpo, visibilidad,
  fecha, y el autor (nombre y/o email, sin datos sensibles).
- Si el ticket no existe → 404.

## Frontend

- En el detalle de cada ticket (expandiendo la tarjeta o en una vista de
  detalle, lo que quede más limpio con el diseño actual), mostrar:
  - La lista de comentarios: autor, fecha, etiqueta de visibilidad y texto.
  - Un formulario para agregar: un área de texto + un selector de visibilidad
    (Interna / Pública) + botón.
- La etiqueta de visibilidad se muestra como un badge (ej. Interna en gris,
  Pública en otro color), heredando la identidad visual existente.
- Al crear, refrescar la lista de comentarios del ticket.
- Las llamadas usan el token (igual que el resto de la app); si da 401, al login.

## Restricciones (de CLAUDE.md)

- Migración nueva `V4`, no editar las anteriores.
- Enums con `@Enumerated(EnumType.STRING)`.
- API bajo `/api/v1`.
- El autor sale del contexto de seguridad, no del request.
- No agregar dependencias innecesarias.

## Criterios de aceptación

- [ ] Puedo agregar un comentario a un ticket, eligiendo Interna o Pública.
- [ ] El comentario queda guardado con mi usuario como autor y la fecha.
- [ ] Veo la lista de comentarios del ticket, con autor, fecha y la etiqueta.
- [ ] El autor lo pone el backend (no se puede falsificar desde el cliente).
- [ ] Los comentarios persisten (sobreviven a reiniciar el backend).

## Notas

- Esta es la primera funcionalidad con **autoría real**: con un solo usuario
  (admin) el autor será siempre el admin, pero queda listo para cuando haya más
  agentes.
- No requiere variables de entorno nuevas.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/comentarios-v1.md`. Seguí las reglas de
> `CLAUDE.md`. El autor del comentario debe salir del usuario autenticado, no del
> body. Antes de editar archivos, mostrame el plan paso a paso.

Revisá el plan antes de dejar que avance.
