# Especificación: Proveedores — entidad y pantalla de alta (v1)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Contexto

Hoy el ticket guarda el cliente como texto libre. Necesitamos los proveedores
como entidad propia, con su pantalla para darlos de alta y verlos. Esta entidad
es la base sobre la que después se construyen el vínculo ticket–proveedor, los
reportes y el análisis cruzado.

## Objetivo

Crear la entidad Proveedor y una pantalla donde se puedan cargar proveedores
nuevos y ver, en la misma vista, los que ya existen.

## Alcance del v1

**Incluye:**

- Entidad Proveedor con todos sus campos y validación.
- Endpoint para crear y endpoint para listar proveedores.
- Pantalla con: formulario de alta + lista de los proveedores ya creados
  (que se actualiza al agregar uno).
- Navegación para llegar a esta pantalla desde la app.

**Fuera del alcance (van en otras specs):**

- Vincular el ticket a un proveedor (es la próxima funcionalidad).
- Editar o eliminar proveedores.

## Campos del Proveedor (TODOS obligatorios)

| Campo         | Tipo / regla                                                     |
|---------------|------------------------------------------------------------------|
| empresa       | Texto, requerido (no vacío).                                     |
| rut           | Requerido. 12 dígitos numéricos. **Único** (no se repite).       |
| telefono      | Requerido. Dígitos (admite `+`, espacios y guiones), largo razonable. |
| direccion     | Texto, requerido.                                                |
| departamento  | Requerido. Uno de los 19 de Uruguay (lista fija de abajo).       |
| email         | Requerido. Formato de email válido. **Único**.                  |

### Lista fija de departamentos (Uruguay)

Artigas, Canelones, Cerro Largo, Colonia, Durazno, Flores, Florida, Lavalleja,
Maldonado, Montevideo, Paysandú, Río Negro, Rivera, Rocha, Salto, San José,
Soriano, Tacuarembó, Treinta y Tres.

## Backend

### Modelo

- Entidad `Proveedor`: id (UUID), empresa, rut, telefono, direccion,
  departamento (enum `Departamento`), email, createdAt.
- Migración Flyway `V5__proveedor.sql` que cree la tabla `proveedor`, con
  **índice único en `rut` y en `email`**.
- `departamento` con `@Enumerated(EnumType.STRING)`; en la base, `varchar` +
  `CHECK` con los 19 valores permitidos.

### Validación (control de seguridad clave)

- Validar **en el servidor** con Bean Validation (`@NotBlank`, `@Email`,
  `@Pattern` para el RUT y el teléfono, etc.). La validación del navegador es
  solo comodidad; la del servidor es la que protege de verdad (nunca confiar en
  el cliente).
- Si algún campo falta o tiene formato inválido → 400 con un mensaje claro de
  qué campo está mal.
- Si el RUT o el email ya existen → 409 con un mensaje claro.

### Endpoints (bajo `/api/v1`, protegidos por la seguridad ya existente)

| Método | Ruta                | Efecto                                  |
|--------|---------------------|-----------------------------------------|
| POST   | `/proveedores`      | Crear proveedor (con validación)        |
| GET    | `/proveedores`      | Listar proveedores (orden por empresa)  |

## Frontend

- Nueva pantalla "Proveedores" con dos partes:
  - **Formulario de alta:** un campo por cada dato; `departamento` es un
    desplegable con los 19 de la lista. Todos obligatorios.
  - **Lista de proveedores ya creados:** se ve debajo o al costado del
    formulario, y se actualiza al agregar uno nuevo.
- **Navegación:** agregar una forma simple de moverse entre "Tickets" y
  "Proveedores" (ej. enlaces en la barra superior ya existente).
- Mostrar los errores de validación que devuelve el backend (campo faltante,
  RUT/email duplicado) de forma clara.
- Heredar la identidad visual existente y cuidar que sea cómodo de usar.
- Las llamadas usan el token igual que el resto de la app; si da 401, al login.

## Restricciones (de CLAUDE.md)

- Migración nueva `V5`, no editar las anteriores (V1–V4).
- Enums con `@Enumerated(EnumType.STRING)` + `varchar`/`CHECK` en la base.
- API bajo `/api/v1`.
- No agregar dependencias innecesarias.
- No poner datos sensibles en el código.

## Criterios de aceptación

- [ ] Puedo abrir la pantalla de Proveedores desde la app.
- [ ] Puedo cargar un proveedor con empresa, RUT, teléfono, dirección,
  departamento (de la lista de Uruguay) y email.
- [ ] Si falta un campo o el RUT/email tienen formato inválido, el servidor lo
  rechaza con un mensaje claro (no solo el navegador).
- [ ] No me deja crear dos proveedores con el mismo RUT ni el mismo email.
- [ ] Veo la lista de proveedores ya creados y se actualiza al agregar uno.
- [ ] Los proveedores persisten (sobreviven a reiniciar el backend).

## Notas

- No requiere variables de entorno nuevas.
- "RUT único" y "email único" son los controles que evitan proveedores
  duplicados; son parte del pedido de "controles de seguridad".
- (Futuro opcional) Validar el dígito verificador del RUT uruguayo; por ahora
  alcanza con 12 dígitos.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/proveedores.md`. Seguí las reglas de
> `CLAUDE.md`. La validación de los campos debe estar también en el servidor, no
> solo en el navegador. Antes de editar archivos, mostrame el plan paso a paso.

Revisá el plan antes de dejar que avance.
