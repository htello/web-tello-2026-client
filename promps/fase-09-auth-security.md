# Fase 9: Login Admin + Seguridad (15 min)

## Resultado Final
Login real contra `/api/v1/auth/login`, sesión admin y rutas protegidas para el panel.

## Paso 1: TDD - Validación

**Prompt RED:**
```
Genera validateLogin.test.js para email válido, email inválido, password vacío y password menor de 8 caracteres.
Genera también validateContact.test.js para name, email, subject y message.
Solo crea tests.
```

**Prompt GREEN:**
```
Implementa las funciones puras en src/utils/.
No almacenes contraseñas ni datos de contacto en texto plano.
```

## Paso 2: AuthContext

**Prompt RED:**
```
Genera AuthContext.test.jsx.
Prueba login exitoso, credenciales inválidas, logout, restauración de token al recargar y usuario no autenticado.
Mockea POST /api/v1/auth/login.
```

**Prompt GREEN:**
```
Implementa AuthProvider y useAuth.
- POST /api/v1/auth/login (rate limit 10/min)
- guardar token y user en una estrategia explícita de sesión
- limpiar sesión en logout
- añadir Authorization: Bearer <token> a peticiones admin
- no exponer password ni token en el DOM
- distinguir 401 (sin token) de 403 (token inválido/expirado o sin rol ADMIN)
- redirigir al login si una respuesta admin es 401/403
```

## Paso 3: AdminLogin

**Prompt RED:**
```
Genera AdminLogin.test.jsx.
Prueba inputs accesibles, botón deshabilitado con formulario inválido, éxito, error 401 y rate limit si aplica.
```

**Prompt GREEN:**
```
Implementa AdminLogin.jsx con Sass/SCSS y estados idle, loading, error y success.
```

## Paso 4: Recuperación de contraseña

**Prompt para la IA:**
```
Crea ForgotPasswordForm.jsx y ResetPasswordForm.jsx.

Endpoints:
- POST /api/v1/auth/forgot-password con { email }
- POST /api/v1/auth/reset-password con { token, password }

Requisitos:
- El mensaje de forgot-password debe ser genérico y no revelar si el email existe (el server siempre responde 200).
- Mostrar errores 400 y 429 de forma accesible (recuperación: rate limit 5/15 min).
- Nunca imprimir tokens ni contraseñas en consola, DOM o Sentry.
- Validar password con mínimo 8 caracteres, una mayúscula y un símbolo.
Genera primero los tests y después la implementación.
```

## Paso 5: ProtectedRoute

**Prompt para la IA:**
```
Crea ProtectedRoute.jsx.
Solo permite acceder al panel si useAuth tiene token y user.role === 'ADMIN'.
Si está cargando muestra estado de carga; si no está autenticado redirige a /admin/login.
```

## Verificación
```bash
pnpm test:run
pnpm lint
pnpm build
```
