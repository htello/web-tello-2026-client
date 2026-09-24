# Fase 11: Panel Admin — CRUD Pintura

## Resultado Final
Gestión completa de colecciones, pinturas y exhibiciones: listar (publicado y no publicado), crear, editar, borrar, publicar/destacar y reordenar.

> Requisito previo: fase 10 (adminApi, useAdminResource, useReorder, AdminTable, EntityForm, ConfirmDialog, AdminLayout).
> Campos exactos de cada formulario: leer los schemas del openapi vía INDEX — CollectionRequest (L216), PaintingRequest (L275), PaintingUpdateRequest (L302), ExhibitionRequest (L355), ReorderRequest (L233). No inventar campos.

## Particularidades del contrato

- `POST /admin/paintings`: **`year` obligatorio (1900-2100)** y **`collectionId` obligatorio**.
- `PUT` de entidades = actualización parcial (enviar solo campos a cambiar; mínimo 1 campo).
- Reorder: `PUT /admin/{collections,paintings,exhibitions}/reorder` con `{ "orderedIds": [...] }`; en paintings enviar **solo** `orderedIds`; IDs inexistentes → 400.
- `GET /admin/...` devuelve TODO (publicado y no publicado) ordenado por `position asc`.
- Errores a mostrar: `VALIDATION_ERROR` (400), `DUPLICATE_ERROR` (400), `NOT_FOUND` (404).

## Paso 1: AdminCollections (TDD)

**Prompt RED:**
```
Genera AdminCollections.test.jsx. Prueba:
- lista todas las colecciones (publicadas y no) con indicador de estado
- formulario crear/editar basado en EntityForm (campos del schema CollectionRequest)
- borrado con ConfirmDialog
- reorder con botones subir/bajar → PUT /admin/collections/reorder { orderedIds }
- error 400 del server visible y accesible
```

**Prompt GREEN:**
```
Implementa AdminCollections.jsx (+ SCSS BEM) reutilizando AdminTable, EntityForm, ConfirmDialog, useAdminResource y useReorder.
Ruta /admin/collections dentro de AdminLayout.
```

## Paso 2: AdminPaintings (TDD)

**Prompt RED:**
```
Genera AdminPaintings.test.jsx. Prueba:
- validación cliente: year obligatorio (1900-2100) y collectionId obligatorio antes de enviar
- selector de colección alimentado por GET /admin/collections
- toggles published/featured
- filtro de la lista por colección
- reorder envía SOLO { orderedIds }
- POST inválido → muestra VALIDATION_ERROR del server
```

**Prompt GREEN:**
```
Implementa AdminPaintings.jsx (+ SCSS). El campo de imagen queda preparado para recibir ImageUploadField (fase 13): de momento acepta la URL como texto.
```

## Paso 3: AdminExhibitions (TDD)

**Prompt RED:**
```
Genera AdminExhibitions.test.jsx: listar, crear/editar (schema ExhibitionRequest, fechas inicio/fin), borrar con confirmación y reorder.
```

**Prompt GREEN:**
```
Implementa AdminExhibitions.jsx (+ SCSS) con los componentes compartidos.
```

## Verificación
```bash
pnpm test:run
pnpm lint
pnpm build
```
Manual con server local: crear colección → crear pintura (con year y colección) → reordenar → editar parcial → borrar con confirmación.
