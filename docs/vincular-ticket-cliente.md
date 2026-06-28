# Especificación: Vincular el ticket a un cliente (buscar o crear) — v1

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Contexto

Hoy el ticket guarda el cliente como texto libre (`clienteNombre`). Ya existe la
entidad Cliente con su pantalla. Queremos que, al crear un ticket, se pueda
**elegir un cliente ya existente** o **crear uno nuevo en el momento**, sin salir
de la pantalla de tickets. El cliente es **opcional**: un ticket puede quedar sin
cliente asignado.

## Objetivo

Conectar el ticket con la entidad Cliente, con una experiencia fluida de
buscar-o-crear al momento de crear el ticket.

## Alcance del v1

**Incluye:**

- Vínculo opcional Ticket → Cliente.
- Al crear un ticket: buscar entre los clientes existentes y seleccionar uno,
  o crear uno nuevo en el momento, o dejarlo sin cliente.
- Mostrar el cliente del ticket en la lista/detalle.
- No romper los tickets viejos (que tienen solo texto libre).

**Fuera del alcance (futuro):**

- Cambiar el cliente de un ticket ya creado.
- Eliminar/editar clientes.

## Backend

### Modelo y migración

- Agregar a `Ticket` una relación **opcional** a `Cliente` (`@ManyToOne`, nullable).
- Migración Flyway `V7__ticket_cliente.sql`: agregar columna `cliente_id`
  (UUID, NULL) a la tabla `ticket`, con FK a `cliente(id)` **ON DELETE SET NULL**
  (si algún día se borra un cliente, el ticket NO se borra: queda sin cliente).
- **Conservar** la columna `cliente_nombre` existente (para los tickets viejos);
  ya no es obligatoria.

### Creación de ticket

- `POST /api/v1/tickets` acepta un `clienteId` **opcional** en el body.
  - Si viene `clienteId`: validar que el cliente exista (si no, 400/404) y
    vincularlo.
  - Si no viene: el ticket queda sin cliente.
- La respuesta del ticket incluye, cuando tiene cliente, sus datos básicos
  (id y empresa).

### Búsqueda de clientes (para el buscador)

- Extender `GET /api/v1/clientes` para aceptar un parámetro opcional `q`:
  - Con `q`: devuelve los clientes cuyo nombre de empresa (o RUT o email)
    coincida, para alimentar el buscador.
  - Sin `q`: se comporta como hoy (lista completa).
- La creación "en el momento" reutiliza el endpoint existente `POST /clientes`
  (no crear uno nuevo).

## Frontend (la parte clave: buscar o crear)

En el formulario de creación de ticket, reemplazar el campo de texto libre del
cliente por un **selector de cliente** que:

1. Permite **escribir para buscar** clientes existentes (llama a
   `GET /clientes?q=...`) y elegir uno de la lista que aparece.
2. Si el cliente no existe, ofrece **"Crear nuevo cliente"**, que abre el
   formulario de alta (los 6 campos, reutilizando el de la pantalla de Clientes,
   en un modal o panel). Al guardarlo (vía `POST /clientes`), queda seleccionado
   automáticamente para ese ticket.
3. Puede quedar **vacío** (cliente opcional).

- En la lista/detalle de tickets, mostrar la **empresa del cliente** vinculado;
  si el ticket no tiene cliente, mostrar el `clienteNombre` viejo si existe, o
  "Sin cliente".
- Reutilizar el componente/formulario de alta de cliente que ya existe (no
  duplicar el formulario).
- Heredar la identidad visual y cuidar que el buscador sea cómodo.
- Usa el token como el resto; si 401, al login.

## Restricciones (de CLAUDE.md)

- Migración nueva `V7`, no editar las anteriores (V1–V6).
- Reutilizar la entidad Cliente, su endpoint de creación y su formulario; no
  duplicar.
- API bajo `/api/v1`. Validación en el servidor.
- No agregar dependencias innecesarias.

## Criterios de aceptación

- [ ] Al crear un ticket puedo buscar un cliente existente y seleccionarlo.
- [ ] Al crear un ticket puedo crear un cliente nuevo en el momento y queda
  seleccionado.
- [ ] Puedo crear un ticket **sin** cliente.
- [ ] El ticket guarda el vínculo y, en la lista, veo la empresa del cliente
  (o "Sin cliente").
- [ ] Los tickets viejos (con solo texto libre) siguen viéndose bien.
- [ ] El vínculo persiste al reiniciar el backend.

## Notas

- No requiere variables de entorno nuevas.
- Esta funcionalidad es la base para los reportes y el análisis cruzado
  (ticket ↔ cliente).

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/vincular-ticket-cliente.md`. Seguí las reglas
> de `CLAUDE.md`. El cliente en el ticket es opcional. Reutilizá la entidad
> Cliente, su endpoint de creación y su formulario de alta; no dupliques. Antes
> de editar archivos, mostrame el plan paso a paso.

Revisá el plan antes de dejar que avance.
