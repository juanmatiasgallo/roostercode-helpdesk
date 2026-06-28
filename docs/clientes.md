# Especificación: Clientes — entidad y pantalla de alta (v1)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.
> Esta funcionalidad es **un espejo del módulo Proveedor** ya existente: misma
> estructura, mismas validaciones, mismo estilo de pantalla. Reutilizá ese patrón.

## Contexto

Ya existe el módulo Proveedor (a quién le compramos). Ahora necesitamos los
**Clientes** (a quienes damos soporte: los que abren los tickets), como entidad
propia y separada de Proveedor. Esta entidad es la base para el próximo paso:
vincular cada ticket a un cliente.

## Objetivo

Crear la entidad Cliente y una pantalla donde se carguen clientes nuevos y se
vean los que ya existen. Misma forma y reglas que Proveedor.

## Alcance del v1

**Incluye:**

- Entidad Cliente (mismos campos y validaciones que Proveedor).
- Endpoint para crear y endpoint para listar clientes.
- Pantalla "Clientes" con formulario de alta + lista de los ya creados.
- Enlace de navegación a esa pantalla.

**Fuera del alcance (es la próxima spec):**

- Vincular el ticket a un cliente y la búsqueda/creación de cliente al crear un
  ticket.
- Editar o eliminar clientes.

## Campos del Cliente (TODOS obligatorios)

Iguales a Proveedor:

| Campo         | Tipo / regla                                                     |
|---------------|------------------------------------------------------------------|
| empresa       | Texto, requerido.                                                |
| rut           | Requerido. 12 dígitos numéricos. **Único**.                     |
| telefono      | Requerido. Dígitos (admite `+`, espacios y guiones).             |
| direccion     | Texto, requerido.                                                |
| departamento  | Requerido. Uno de los 19 de Uruguay (mismo enum que Proveedor).  |
| email         | Requerido. Email válido. **Único**.                             |

> El enum `Departamento` ya existe (del módulo Proveedor). **Reutilizarlo, no
> duplicarlo.**

## Backend

- Entidad `Cliente`: id (UUID), empresa, rut, telefono, direccion, departamento,
  email, createdAt. (Misma forma que `Proveedor`.)
- Migración Flyway `V6__cliente.sql` que cree la tabla `cliente`, con índice
  único en `rut` y en `email`, y `CHECK` de departamento.
- Reutilizar el enum `Departamento` existente.
- Validación en el servidor con Bean Validation (igual que Proveedor):
  faltante/formato inválido → 400 con mensaje por campo; RUT o email duplicado
  → 409. (El `ValidacionExceptionHandler` global ya existente cubre el 400.)
- Endpoints (bajo `/api/v1`, protegidos):
  - `POST /clientes` — crear
  - `GET  /clientes` — listar (orden por empresa)

## Frontend

- Nueva pantalla "Clientes", con el mismo diseño que la de Proveedores:
  formulario de alta (departamento como desplegable de los 19) + lista de los
  ya creados, que se actualiza al agregar uno.
- Agregar "Clientes" a la navegación de la barra superior (junto a Tickets y
  Proveedores).
- Mostrar errores de validación por campo y el 409 de duplicado.
- Heredar la identidad visual y usar el token igual que el resto.

## Restricciones (de CLAUDE.md)

- Migración nueva `V6`, no editar las anteriores (V1–V5).
- Reutilizar el enum `Departamento`; no duplicarlo.
- API bajo `/api/v1`.
- No agregar dependencias innecesarias.

## Criterios de aceptación

- [ ] Puedo abrir la pantalla de Clientes desde la app.
- [ ] Puedo cargar un cliente con los 6 campos; todos obligatorios.
- [ ] El servidor rechaza campos faltantes o RUT/email con formato inválido,
  con mensaje claro.
- [ ] No deja crear dos clientes con el mismo RUT ni el mismo email.
- [ ] Veo la lista de clientes y se actualiza al agregar uno.
- [ ] Persisten al reiniciar el backend.

## Notas

- No requiere variables de entorno nuevas.
- Cliente y Proveedor son entidades **separadas** aunque tengan la misma forma:
  representan roles distintos del negocio.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/clientes.md`. Seguí las reglas de `CLAUDE.md`.
> Es un espejo del módulo Proveedor: reutilizá ese mismo patrón y el enum
> Departamento existente. La validación va también en el servidor. Antes de
> editar archivos, mostrame el plan paso a paso.

Revisá el plan antes de dejar que avance.
