# Technical Rules — curso-ia-demo

Decisiones técnicas del proyecto. El agente lee este fichero
junto con el AGENTS.md antes de implementar cualquier task.

**Regla general: NO instalar dependencias nuevas sin pedirlo
explícitamente. Todo lo necesario ya está en package.json.**

---

## Runtime y framework

```
Node.js >= 18
Express 4.x — router modular (un fichero por recurso en routes/)
```

## Uploads y procesamiento de ficheros

```
Librería: multer (ya instalada)
Configuración: memoryStorage — NO diskStorage
               los ficheros son temporales, no se persisten en disco

Acceso al fichero en el handler: req.file.buffer (Buffer)
Límite de tamaño: gestionar manualmente en el validator,
                  NO usar limits de multer para el 413
                  (necesitamos el control del mensaje de error)
```

## Parsing de CSV

```
Librería: csv-parse (ya instalada)
Modo: síncrono con parse() de csv-parse/sync
      NO usar el modo stream para este endpoint
      (los archivos son <= 10MB, caben en memoria)

Separador: coma (,) — hardcodeado, no configurable en v1
Encoding: UTF-8
Headers: primera fila del CSV, normalizar a lowercase con trim()
```

## Validación de input

```
NO usar librerías externas de validación (Zod, Joi, Yup)
Validación manual en src/validators/csv.validator.js

Orden de validación obligatorio:
  1. Tamaño del fichero (antes de parsear)
  2. Formato CSV (headers presentes)
  3. Fila a fila (fields obligatorios + tipos)

Si una fila falla: añadir a rejected[], continuar con las demás
Si el fichero falla: devolver error HTTP inmediatamente
```

## Generación de IDs

```
Librería: uuid (ya instalada)
Versión: v4 (aleatoria)
Uso: uuidv4() para el campo id de cada entidad creada
```

## Respuestas HTTP

```
Códigos a usar en este endpoint:
  200 → procesamiento completado (incluso con filas rechazadas)
  400 → formato de fichero inválido o no es CSV
  413 → fichero supera 10MB
  500 → error no esperado (nunca exponer el stack trace)

Formato de respuesta siempre JSON:
  { valid_count, rejected, total_by_category, top_5 }
  En errores: { message: "descripción legible" }
```

## Tests

```
Framework: Jest + Supertest (ya instalados)
Ubicación: tests/ — espejo de src/
Nombrado de tests: test_ca1_..., test_ca2_... (uno por CA)

Para crear buffers CSV en tests: helper makeCSV(rows)
NO usar ficheros .csv en disco para los tests
NO mockar el sistema de ficheros — usar buffers en memoria
```

## Lo que NO usar en este proyecto

```
❌ papaparse, csv-parser, fast-csv → usar csv-parse
❌ diskStorage de multer → usar memoryStorage
❌ Zod, Joi, Yup → validación manual
❌ moment.js, dayjs → date-fns si se necesita (o Date nativo)
❌ lodash → usar métodos nativos de Array/Object
❌ axios, node-fetch → no hay llamadas HTTP externas en este endpoint
```
