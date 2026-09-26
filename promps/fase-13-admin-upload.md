# Fase 13: Panel Admin — Upload de Imágenes

## Resultado Final
`ImageUploadField` integrado en TODOS los formularios con imagen: de cara al usuario es **un único formulario** (elige archivo → miniatura → guardar). El "2 pasos" del contrato (upload → url en el JSON) es interno y transparente.

> Requisito previo: fases 10–12 (formularios de entidades ya existen con campo de URL como texto).
> Contrato: `POST /admin/upload` (openapi L2050), respuesta UploadResponse (L518). El front usa SIEMPRE raw JSON en las entidades; NUNCA los campos multipart `image` de los endpoints de entidades.

## Paso 1: Servicio de upload (TDD)

**Prompt RED:**
```
Genera uploadImage.test.js en src/services/. Mockea fetch. Prueba:
- construye FormData con el campo `file` y, opcionalmente, `section` (pintura|ilustracion|diseno|general; por defecto general)
- añade Authorization: Bearer <token>
- devuelve { url, thumbnail, width, height, format }
- 400 por formato/section inválidos → ApiError con mensaje visible
- errores 401/403 → mismo tratamiento que adminApi (logout + redirect)
Solo crea tests.
```

**Prompt GREEN:**
```
Implementa src/services/uploadImage.js con JSDoc y cobertura 100%.
No fijar Content-Type manualmente (el navegador añade el boundary del FormData).
```

## Paso 2: ImageUploadField (TDD)

**Prompt RED:**
```
Genera ImageUploadField.test.jsx. Prueba:
- input de archivo con label accesible; acepta image/jpeg, image/png, image/webp
- validación cliente ANTES de llamar a la red: formato no válido o >5 MB → error visible, sin fetch
- la subida se dispara AL SELECCIONAR el archivo (segundo plano), con estado de progreso/loading
- al terminar muestra la miniatura (thumbnail) y el nombre/dimensiones
- botón "Quitar imagen" limpia el estado (no borra nada en el server)
- si ya existe imagen en la entidad, se muestra precargada y se puede sustituir
- expone la url obtenida al formulario padre (onChange) para el JSON del create/update
```

**Prompt GREEN:**
```
Implementa ImageUploadField.jsx + ImageUploadField.scss (BEM).
Usa uploadImage; estados idle/uploading/error/done; errores accesibles (aria-live).
```

## Paso 3: Integración en formularios

**Prompt para la IA:**
```
Sustituye los campos de URL por ImageUploadField en los formularios de las fases 11–12:
- paintings (imageUrl), collections (coverImage), exhibitions (imageUrl),
  design (campo de imagen del schema), illustrations (imageUrl), biography (foto)
Al guardar, el JSON del create/update incluye la url devuelta por el upload
(comprueba el nombre exacto del campo en cada Request schema del openapi vía INDEX).
Si el usuario no cambia la imagen en una edición, NO volver a subirla: enviar solo los campos modificados (PUT parcial).
```

## Mejoras futuras (backlog — fuera de esta fase)

- **Archivos huérfanos**: si se abandona el formulario con la imagen ya subida (o el upload OK pero el create/update falla), el archivo queda en Cloudinary. El contrato actual solo tiene `POST /admin/upload`, sin endpoint de borrado.
- Propuesta a llevar al server en una iteración futura: `DELETE /api/v1/admin/upload` (auth ADMIN, body `{ url }`) o un GC de assets no referenciados por ninguna entidad.
- Hasta entonces los huérfanos se aceptan como inofensivos a escala de portfolio.

## Verificación
```bash
pnpm test:run
pnpm lint
pnpm build
```
Manual con server local: subir JPEG/PNG/WebP <5 MB en un formulario de pintura (miniatura visible, entidad creada con la url); probar archivo >5 MB y formato inválido (error sin llamada de red).
