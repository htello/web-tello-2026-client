# Fase 14: Panel Admin — Usuarios + E2E

## Resultado Final
`AdminUsers` con paginación, registro de administradores y cambio de contraseña, más el journey E2E del panel contra el server local real.

> Requisito previo: fases 10–13 (panel completo).
> Contrato: GET/POST/PUT/DELETE de `/admin/users` (openapi L695-L894), schemas RegisterRequest (L86), UserUpdateRequest (L166), PasswordResetRequest (L178), PaginationMeta (L74). No inventar campos.

## Paso 1: AdminUsers (TDD)

**Prompt RED:**
```
Genera AdminUsers.test.jsx. Prueba:
- listado paginado: GET /admin/users?page=&limit= → { data, meta { total, page, limit, pages } } con paginador accesible
- crear admin: POST /admin/users/register (requiere token ADMIN vigente) con validación de password fuerte (≥8, mayúscula y símbolo)
- editar: PUT /admin/users/:id (parcial, UserUpdateRequest)
- borrar: DELETE /admin/users/:id con ConfirmDialog; no permitir borrar el usuario propio sin aviso claro
- cambiar password: PUT /admin/users/:id/password
- la respuesta 400/404/429 se muestra como error accesible
- nunca aparecen password ni token en el DOM, consola o snapshots
```

**Prompt GREEN:**
```
Implementa AdminUsers.jsx (+ SCSS BEM) con AdminTable, EntityForm, ConfirmDialog y adminApi.
El password usa input type=password con validación cliente y mensaje de requisitos.
```

## Paso 2: E2E del panel (Playwright)

**Prompt para la IA:**
```
Crea e2e/admin-journey.spec.js con sus Page Objects en e2e/pages/ (patrón de e2e/ existente).
Backend: server local REAL (../server con pnpm dev en http://localhost:3000/api/v1).
Credenciales: E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD en .env (gitignored; NUNCA commiteadas ni en variables VITE_*). Añádirlas a .env.example vacías.
Journey:
1. sin sesión: /admin redirige a /admin/login
2. login con credenciales válidas → dashboard
3. crear colección → crear pintura (year + collectionId) con imagen subida (archivo de fixture pequeño)
4. reordenar pinturas (subir/bajar) y verificar el orden
5. editar la pintura (parcial) → borrarla con confirmación → borrar la colección (limpieza de datos del journey)
6. logout → vuelve a /admin/login
Tolerancia al cold start si se apunta a producción: timeouts generosos en la config.
```

## Verificación
```bash
pnpm test:run
pnpm lint
pnpm build
pnpm test:e2e
```
