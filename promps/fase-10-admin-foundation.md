# Fase 10: Panel Admin — Fundación

## Resultado Final
Zona `/admin` protegida con cliente API autenticado, layout con navegación, hooks y componentes compartidos de CRUD, y dashboard. Es la base sobre la que se construyen los CRUD de las fases 11–14.

> Requisito previo: fase 9 completada (AuthContext, useAuth, AdminLogin y ProtectedRoute funcionando).

## Paso 1: Cliente API autenticado (TDD)

**Prompt RED:**
```
Genera adminApi.test.js en src/services/.
Mockea la red con vi.stubGlobal('fetch', ...). Prueba:
- añade Authorization: Bearer <token> a todas las peticiones (token del AuthContext/useAuth)
- parsea el éxito: { data } y, para GET /admin/users, { data, meta }
- traduce { error, code } a un ApiError estructurado (message en español + code)
- 401 UNAUTHORIZED y 403 FORBIDDEN disparan limpieza de sesión y redirect a /admin/login
- timeout generoso (~90 s) por el cold start de Render
- nunca loguea el token ni la Authorization
Solo crea tests.
```

**Prompt GREEN:**
```
Implementa src/services/adminApi.js con JSDoc obligatorio.
- get/post/put/del genéricos sobre VITE_API_URL + rutas /admin/...
- PUT = actualización parcial: enviar solo los campos modificados (mínimo 1 campo)
- manejo de códigos: VALIDATION_ERROR, DUPLICATE_ERROR, NOT_FOUND, RATE_LIMITED, INTERNAL_ERROR
- cobertura 100% del archivo
```

## Paso 2: Hooks compartidos (TDD)

**Prompt RED:**
```
Genera useAdminResource.test.js y useReorder.test.js en src/hooks/.
useAdminResource: estados idle/loading/error/success para list, create, update (parcial) y remove; recarga el listado tras mutar.
useReorder: moveUp/moveDown sobre el listado local y PUT .../reorder con { orderedIds }; en paintings enviar SOLO orderedIds (el server ignora collectionId); error 400 con IDs inexistentes visible en UI.
Solo crea tests.
```

**Prompt GREEN:**
```
Implementa src/hooks/useAdminResource.js y src/hooks/useReorder.js con JSDoc y cobertura 100%.
Reutilizan adminApi; no duplican lógica de estados (apóyate en useAsyncData si encaja).
```

## Paso 3: Rutas y AdminLayout

**Prompt para la IA:**
```
Añade al router las rutas /admin/* envueltas en ProtectedRoute (token + role ADMIN).
Crea src/features/admin/AdminLayout.jsx + AdminLayout.scss (BEM, variables de _variables.scss):
- navegación lateral accesible (nav + aria-current): Dashboard, Colecciones, Pinturas, Exhibiciones, Diseño, Ilustración, Biografía, Usuarios
- botón de logout que limpia sesión y vuelve a /admin/login
- <main> para las vistas anidadas
- responsive mobile-first (nav colapsable en móvil)
Crea AdminRoute o equivalente que renderice el layout con <Outlet />.
```

## Paso 4: Componentes compartidos (TDD)

**Prompt RED:**
```
Genera tests RTL para AdminTable, EntityForm y ConfirmDialog (src/components/admin/ o src/features/admin/components/):
- AdminTable: columnas configurables, filas con acciones editar/borrar/subir/bajar accesibles por rol, estado vacío y de carga
- EntityForm: campos configurables, validación cliente (requeridos/formatos), submit deshabilitado mientras guarda, errores del server visibles (message + code), modo edición con valores precargados
- ConfirmDialog: role=dialog, foco atrapado, confirmación y cancelación, usado antes de borrar
Queries por rol/label/texto accesible; nada de data-testid salvo necesidad.
```

**Prompt GREEN:**
```
Implementa AdminTable.jsx, EntityForm.jsx y ConfirmDialog.jsx con SCSS BEM.
Reutiliza LoadingState/ErrorState existentes. Sin window.alert/confirm nativos.
```

## Paso 5: AdminDashboard

**Prompt para la IA:**
```
Crea AdminDashboard.jsx: tarjetas con el recuento por entidad consumiendo
GET /api/v1/admin/{collections,paintings,exhibitions,design,illustrations}
y accesos directos a cada sección. Estados loading/error y mensaje de bienvenida con el nombre del admin.
```

## Verificación
```bash
pnpm test:run
pnpm lint
pnpm build
```
Manual: login → /admin muestra layout y dashboard; sin sesión, /admin/* redirige a /admin/login; token expirado (403) devuelve al login.
