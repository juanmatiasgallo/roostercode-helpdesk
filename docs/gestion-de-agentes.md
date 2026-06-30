# Especificación: Gestión de agentes (usuarios)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Contexto

Hoy existe un solo usuario (admin). Para poder asignar tickets a responsables,
primero tiene que haber más usuarios. Esta es la base del trabajo en equipo.

## Objetivo

Permitir que un ADMIN cree y administre usuarios (agentes) desde la app.

## Alcance

**Incluye:** crear usuario, listarlos, activar/desactivar, y un rol `AGENTE`
además de `ADMIN`. Solo un ADMIN puede administrar usuarios.
**No incluye:** recuperación de contraseña, permisos finos por rol (más adelante).

## Backend

- `Usuario` ya existe (id, nombre, email, passwordHash, rol, activo). Permitir el
  rol `AGENTE` además de `ADMIN`. **Si el `CHECK` de `rol` solo admite 'ADMIN',
  crear una migración nueva (siguiente número disponible) que permita 'AGENTE'.**
- Endpoints (bajo `/api/v1`, solo ADMIN):
  - `POST /usuarios` — crear (nombre, email único, rol, contraseña inicial que se
    guarda hasheada con BCrypt). Validación en servidor; 409 si el email existe.
  - `GET /usuarios` — listar (sin exponer el hash).
  - `PUT /usuarios/{id}` — editar nombre/rol.
  - `PUT /usuarios/{id}/activar` y `/desactivar` — habilitar/inhabilitar el acceso.
- Un usuario `activo = false` no puede iniciar sesión.
- Nunca registrar (log) contraseñas.

## Frontend

- En la pantalla **Configuración**, agregar una sección "Usuarios / Agentes":
  formulario de alta (nombre, email, rol, contraseña inicial) + lista con su rol
  y estado, y botones para editar y activar/desactivar.
- Reutilizar el patrón de las otras pantallas de ABM. Errores por campo y 409.
- Heredar la identidad visual; usar el token; solo visible para ADMIN.

## Restricciones (de CLAUDE.md)

- Si hace falta migración (CHECK de rol), usar el siguiente número; no editar las
  anteriores.
- Validación en el servidor. No poner contraseñas en el código ni en logs.
- Reutilizar componentes existentes; no duplicar.

## Criterios de aceptación

- [ ] Como ADMIN puedo crear un agente (nombre, email, rol, contraseña inicial).
- [ ] El nuevo agente puede iniciar sesión con esos datos.
- [ ] Puedo listar usuarios, editarlos y activarlos/desactivarlos.
- [ ] Un usuario desactivado no puede entrar.
- [ ] No se puede crear dos usuarios con el mismo email.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/gestion-de-agentes.md`. Seguí las reglas de
> `CLAUDE.md`. Permití el rol AGENTE además de ADMIN (migración nueva si el CHECK
> lo limita). Solo un ADMIN administra usuarios. La contraseña inicial se guarda
> con BCrypt. Antes de editar archivos, mostrame el plan paso a paso.
