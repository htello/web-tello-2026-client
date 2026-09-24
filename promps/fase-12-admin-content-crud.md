# Fase 12: Panel Admin — CRUD Diseño, Ilustración y Biografía

## Resultado Final
Gestión de proyectos de diseño (por subcategoría), ilustraciones y biografía (crear/editar).

> Requisito previo: fases 10 y 11 (capa compartida ya ejercitada con pintura).
> Campos exactos: schemas DesignRequest (L401), IllustrationRequest (L445), BiographyRequest (L476) del openapi vía INDEX. No inventar campos.

## Paso 1: AdminDesign (TDD)

**Prompt RED:**
```
Genera AdminDesign.test.jsx. Prueba:
- formulario con subcategoría obligatoria (select con los 4 valores del contrato):
  imagen-corporativa | packaging-expositores | carteleria | editorial
- filtro del listado por subcategoría
- crear/editar (parcial)/borrar con ConfirmDialog
- reorder con { orderedIds } → PUT /admin/design/reorder
```

**Prompt GREEN:**
```
Implementa AdminDesign.jsx (+ SCSS BEM) con los componentes compartidos.
Campo de imagen preparado para ImageUploadField (fase 13).
```

## Paso 2: AdminIllustrations (TDD)

**Prompt RED:**
```
Genera AdminIllustrations.test.jsx: listar todo (publicado y no), crear/editar (schema IllustrationRequest), toggle published/featured, borrar con confirmación y reorder.
```

**Prompt GREEN:**
```
Implementa AdminIllustrations.jsx (+ SCSS) con los componentes compartidos.
```

## Paso 3: AdminBiography

**Prompt para la IA:**
```
Crea AdminBiography.jsx (+ SCSS). La biografía es un recurso único SIN delete ni reorder:
- carga inicial GET /api/v1/biography: si responde 404 → formulario de creación (POST /api/v1/admin/biography)
- si existe → formulario de edición precargado (PUT /api/v1/admin/biography, actualización parcial)
- campos según BiographyRequest; la foto del artista queda preparada para ImageUploadField (fase 13)
- feedback de guardado accesible (role=status) y errores del server visibles
```

## Verificación
```bash
pnpm test:run
pnpm lint
pnpm build
```
Manual con server local: crear proyecto de diseño en cada subcategoría → filtrar → reordenar; crear biografía si no existe y editarla.
