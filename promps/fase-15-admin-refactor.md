# Fase 15: Refactor del Admin

## Resultado Final
Panel DRY y homogéneo tras construir las 8 vistas, contrato verificado contra el openapi y cobertura completa. Sin funcionalidad nueva: solo refactor protegido por la red de seguridad de los tests y el E2E de la fase 14 (espejo de la fase 8 con el lado público).

## Paso 1: Auditoría de duplicación

**Prompt para la IA:**
```
Audita las vistas admin (Dashboard, Collections, Paintings, Exhibitions, Design, Illustrations, Biography, Users) y lista las duplicaciones reales entre ellas:
- montaje listado + tabla + acciones (editar/borrar/subir/bajar)
- wiring de formularios (create vs edit, PUT parcial, mensajes de error)
- diálogos de confirmación y feedback (toast/inline)
Propón extracciones SOLO donde haya ≥2 usos reales (nada de abstracciones de un solo uso):
p. ej. un patrón de sección CRUD declarativa (columnas + campos + endpoint) sobre AdminTable/EntityForm/useAdminResource.
Presenta la lista y espera aprobación antes de refactorizar. Refactoriza en pasos pequeños con tests en verde tras cada paso.
```

## Paso 2: Contrato y convenciones

**Prompt para la IA:**
```
Verifica el panel contra ../server/docs/openapi.yaml (leer SIEMPRE vía openapi-INDEX.md, nunca el yaml completo):
- rutas, métodos, nombres de campos y códigos de error usados por adminApi/uploadImage coinciden con el contrato
- no hay rutas ni campos inventados; los reorder envían solo { orderedIds }
Revisa convenciones:
- JSDoc completo en src/services/, src/hooks/ y src/utils/
- SCSS: BEM, parciales con @use, variables centralizadas en _variables.scss, sin valores mágicos
- sin console.log de datos sensibles (tokens, emails, passwords)
- imports con el alias @/ consistente
```

## Paso 3: Cobertura

**Prompt para la IA:**
```
Ejecuta pnpm test:coverage y cierra huecos:
- 100% obligatorio en src/services/, src/hooks/ y src/utils/
- global ≥90%
- componentes admin con tests de comportamiento (RTL), no de implementación
```

## Paso 4: Regresión completa

```bash
pnpm lint
pnpm test:run
pnpm test:e2e
pnpm build
```

El E2E del admin (fase 14) y los unitarios deben pasar sin modificar sus aserciones: si un test falla por el refactor, el refactor está mal, no el test.
