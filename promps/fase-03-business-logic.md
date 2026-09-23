# Fase 3: TDD - Utilidades del Portfolio (15 min)

## Resultado Final
Funciones puras testeadas para fechas, campos opcionales, filtros e imágenes protegidas.

> Desde esta fase se aplica siempre Red → Green → Refactor.

## Paso 1: formatDate

**Prompt RED:**
```
Genera SOLO src/utils/formatDate.test.js.
Cubre una fecha ISO válida, formato localizado en español y valor vacío o inválido.
La función debe devolver un texto seguro sin romper el render.
```

**Prompt GREEN:**
```
Implementa src/utils/formatDate.js usando Intl.DateTimeFormat.
Mantén la función pequeña, pura y en JavaScript estándar.
```

## Paso 2: getTechnicalDetails

**Prompt RED:**
```
Genera SOLO src/utils/getTechnicalDetails.test.js.
La función recibe una pintura y devuelve una lista de pares label/value para dimensions, technique y year.
Debe omitir campos null, undefined o vacíos y conservar el orden dimensions, technique, year.
```

**Prompt GREEN:**
```
Implementa src/utils/getTechnicalDetails.js como función pura.
```

## Paso 3: Filter y sort

**Prompt RED:**
```
Genera tests para filterBySubcategory y sortByPosition en src/utils/.
Casos: sin filtro, filtro válido, filtro inexistente, posiciones ascendentes y entradas sin position.
```

**Prompt GREEN:**
```
Implementa las funciones puras en JavaScript y exporta todo desde src/utils/index.js.
```

## Paso 4: Protección visual de imágenes

**Prompt RED:**
```
Genera src/utils/imageProtection.test.js.
Verifica que getImageProtectionProps devuelve draggable false, un alt recibido y una función onContextMenu que previene el menú.
```

**Prompt GREEN:**
```
Implementa getImageProtectionProps.js. La protección es una barrera de interfaz, no una garantía de seguridad absoluta.
```

## Verificación
```bash
pnpm test formatDate getTechnicalDetails filterBySubcategory sortByPosition imageProtection
pnpm test:run
pnpm build
```
