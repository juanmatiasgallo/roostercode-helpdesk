# Especificación: Login v1 (autenticación y seguridad)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.
> Basada en la definición del Vault (fuente de verdad). Claude Code debe limitarse
> a implementar esto, sin introducir cambios arquitectónicos no documentados.

## Contexto

La app está hoy abierta en un dominio público: cualquiera con la URL puede usarla.
Antes de incorporar datos reales de clientes hay que autenticar y proteger.
(RCDF: la seguridad es la prioridad número uno.)

## Objetivo

Sistema mínimo de autenticación que permita identificar usuarios y proteger la
aplicación.

## Principios

- Seguridad antes que nuevas funcionalidades.
- Usar únicamente tecnologías estándar ampliamente probadas.
- No implementar soluciones criptográficas propias.
- Diseño preparado para incorporar nuevos roles a futuro sin romper compatibilidad.

## Alcance del v1

**Incluye:**

- Inicio de sesión con correo electrónico y contraseña.
- Contraseñas almacenadas exclusivamente con BCrypt.
- Autenticación basada en JWT (stateless).
- Protección de todos los endpoints privados con Spring Security.
- Un único rol inicial: `ADMIN` (modelado para agregar más roles luego).
- Endpoint para obtener el usuario autenticado (`/me`).
- Usuario admin inicial creado por *bootstrap* desde variables de entorno.

**Fuera del alcance (no implementar):**

- Recuperación de contraseña, registro público, OAuth, MFA, permisos avanzados,
  múltiples organizaciones, administración completa de usuarios.

> **Nota sobre auditoría (creador/modificador):** la definición la mencionaba.
> La recomiendo mover a la próxima funcionalidad (notas con autoría), porque con
> un solo usuario todavía no aporta valor y encaja mejor ahí. **Esta spec NO la
> incluye.** Si la querés en el v1, avisá y se agrega.

## Backend

### Modelo

- Nueva entidad `Usuario`: id (UUID), nombre, email (único), passwordHash, rol
  (`ADMIN`), activo (boolean), createdAt, updatedAt.
- Migración Flyway `V3__usuario.sql` que cree la tabla `usuario`.
  **No incluir contraseñas en la migración.**
- `rol` como `varchar` + `CHECK` (por ahora solo `'ADMIN'`), preparado para sumar
  valores en el futuro.

### Autenticación

- `POST /api/v1/auth/login` recibe `{ email, password }`, valida contra el hash
  BCrypt y devuelve un JWT.
- JWT firmado con HS256; el secreto se lee de la variable de entorno `JWT_SECRET`.
  Expiración configurable (ej. 12 horas). **Si falta `JWT_SECRET`, la app NO debe
  arrancar** (nunca usar un secreto por defecto).
- Usar una librería JWT estándar (ej. `jjwt`) o el soporte de Spring Security.
  No implementar el JWT a mano.
- `GET /api/v1/auth/me` devuelve el usuario autenticado (sin el hash de contraseña).

### Protección (Spring Security)

- Público: `POST /api/v1/auth/login` (y, opcional, un endpoint de salud).
- Protegido: **todo el resto de `/api/v1`** (tickets y transiciones incluidos).
  Sin token válido → 401.
- Configuración *stateless* (sin sesión de servidor). El token viaja en el header
  `Authorization: Bearer <token>`.
- CORS debe permitir el header `Authorization` (mantener `allowedHeaders` abierto).

### Bootstrap del admin inicial

- Al arrancar, si no existe ningún usuario, crear uno con rol `ADMIN` usando las
  variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` (la contraseña se guarda hasheada con
  BCrypt). Si ya existe al menos un usuario, no hacer nada.
- Nunca registrar (log) la contraseña.

## Frontend

- Pantalla de login (email + contraseña) que llama a `/auth/login` y guarda el token.
- Guardar el JWT en el navegador con `localStorage` para el v1. (Deuda técnica
  anotada: migrar a cookie `httpOnly` más adelante, por seguridad.)
- Enviar `Authorization: Bearer <token>` en todas las llamadas a la API.
- Si una llamada devuelve 401 (sin token o token vencido), redirigir al login.
- Botón de cerrar sesión (borra el token y vuelve al login).
- Mostrar quién está logueado (ej. el email, usando `/me`).
- Heredar la identidad visual ya existente.

## Variables de entorno nuevas (EasyPanel, servicio `api`)

Cargar **antes** de desplegar. Van en EasyPanel, NUNCA en el repo:

- `JWT_SECRET`: cadena larga y aleatoria (ej. 64 caracteres).
- `ADMIN_EMAIL`: tu correo de admin.
- `ADMIN_PASSWORD`: una contraseña fuerte.

## Restricciones (de CLAUDE.md)

- Migración nueva `V3`, no editar `V1` ni `V2`.
- Enums con `@Enumerated(EnumType.STRING)`.
- No agregar dependencias más allá de Spring Security y una librería JWT estándar.
- No poner secretos en el código.
- No inventar: usar Spring Security estándar.

## Criterios de aceptación

- [ ] Sin sesión iniciada, la API responde 401 y la web lleva al login.
- [ ] Puedo iniciar sesión con el email y contraseña del admin.
- [ ] Con sesión iniciada, puedo crear, listar y cambiar el estado de tickets como antes.
- [ ] `GET /api/v1/auth/me` devuelve mi usuario.
- [ ] Las contraseñas se guardan hasheadas con BCrypt, nunca en texto plano.
- [ ] Si falta `JWT_SECRET`, la app no arranca.
- [ ] Puedo cerrar sesión.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/login-v1.md`. Seguí las reglas de `CLAUDE.md`.
> Es una funcionalidad de seguridad: usá Spring Security, BCrypt y una librería
> JWT estándar, sin criptografía propia. Antes de editar archivos, mostrame el
> plan completo paso a paso.

Revisá el plan **antes** de dejar que avance (esta es la funcionalidad más
delicada hasta ahora).
