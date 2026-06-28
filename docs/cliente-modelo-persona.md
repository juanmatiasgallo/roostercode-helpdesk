# Especificación: Corregir el modelo de Cliente (pasa a ser una persona)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Contexto

El Cliente se creó como espejo de Proveedor (empresa, RUT, dirección,
departamento…), pero eso está mal: el cliente es una **persona** a la que damos
soporte. Hoy el formulario pide RUT y no deja cargar clientes. Hay que corregir
el modelo. **Ya existen clientes cargados con el modelo viejo**, así que la
migración debe preservarlos mapeando los datos, no borrarlos.

## Objetivo

Cambiar la entidad Cliente para que tenga solo: **nombre completo, celular y
email** (los tres obligatorios), actualizando base, backend y la pantalla, sin
perder los clientes ya cargados.

## Modelo nuevo del Cliente

| Campo            | Regla                                            |
|------------------|--------------------------------------------------|
| nombreCompleto   | Texto, **requerido**.                            |
| celular          | **Requerido**. Dígitos (admite `+`, espacios, guiones). |
| email            | **Requerido**. Email válido. **Único**.          |

Se eliminan del Cliente: empresa, rut, direccion, departamento.

## Backend

### Migración (preservando datos)

- Crear una migración Flyway nueva, con el **siguiente número de versión
  disponible** (revisá la carpeta `db/migration`; probablemente `V8`).
- La migración debe, sobre la tabla `cliente`:
  1. Agregar las columnas `nombre_completo` y `celular`.
  2. **Backfill (preservar datos):** copiar `empresa` → `nombre_completo` y
     `telefono` → `celular` en las filas existentes. `email` se mantiene.
  3. Poner `nombre_completo`, `celular` y `email` como NOT NULL.
  4. Eliminar las columnas `empresa`, `rut`, `telefono`, `direccion`,
     `departamento` y el índice único de `rut`.
  5. Mantener el índice único de `email`.
- No editar migraciones anteriores.

### Entidad y código

- `Cliente`: campos `nombreCompleto`, `celular`, `email`, más id y createdAt.
  Quitar los campos viejos.
- `CrearClienteRequest`: `@NotBlank nombreCompleto`, `@NotBlank`/`@Pattern`
  `celular`, `@Email` `email`. Los tres requeridos.
- `ClienteResponse`: nombreCompleto, celular, email (+ id).
- `ClienteRepository`: quitar `existsByRut`; mantener `existsByEmail`. El
  parámetro de búsqueda `q` (si existe) debe buscar por nombreCompleto, celular o email.
- `ClienteController`: ajustar a los campos nuevos (409 si email duplicado).

### Importante: actualizar TODAS las referencias

- Buscar en el código cualquier uso de los campos viejos del Cliente (empresa,
  rut, direccion, departamento) y actualizarlo a los nuevos. Esto incluye, si ya
  está implementado, el **buscador/selector de cliente al crear un ticket** y la
  visualización del cliente en la lista de tickets (mostrar `nombreCompleto`).
- El Cliente ya **no** usa el enum `Departamento` (Proveedor lo sigue usando;
  no tocar Proveedor).

## Frontend

- Pantalla `/clientes`: el formulario de alta queda con tres campos
  (nombre completo, celular, email). La lista muestra esos tres.
- Quitar de esa pantalla el desplegable de departamento y los campos de
  empresa/RUT/dirección.
- Mantener los errores de validación por campo y el 409 de email duplicado.
- Heredar la identidad visual; usar el token como el resto.

## Restricciones (de CLAUDE.md)

- Migración nueva (siguiente número), no editar las anteriores.
- No tocar Proveedor (sigue con su modelo y su enum Departamento).
- Validación en el servidor. API bajo `/api/v1`. No agregar dependencias.

## Criterios de aceptación

- [ ] Puedo cargar un cliente con nombre completo, celular y email; ya no pide RUT.
- [ ] Los tres campos son obligatorios y se validan en el servidor.
- [ ] No deja dos clientes con el mismo email.
- [ ] Los clientes que ya estaban cargados siguen existiendo (su nombre quedó
  con el valor de la empresa vieja y el celular con el teléfono viejo).
- [ ] Si el cliente ya estaba vinculado a tickets o al buscador de tickets, eso
  sigue funcionando mostrando el nombre completo.
- [ ] La pantalla de Proveedores sigue funcionando igual que antes.

## Notas

- No requiere variables de entorno nuevas.
- Tras esto, los clientes viejos pueden tener el nombre "raro" (era la empresa);
  se corrigen cuando esté la función de editar (próxima spec).

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/cliente-modelo-persona.md`. Seguí las reglas
> de `CLAUDE.md`. La migración debe preservar los clientes ya cargados (mapear
> empresa→nombre y teléfono→celular), no borrarlos. Actualizá todas las
> referencias a los campos viejos del cliente, incluido el buscador de cliente
> del ticket si ya existe. No toques Proveedor. Antes de editar archivos,
> mostrame el plan paso a paso.

Revisá el plan antes de dejar que avance.
