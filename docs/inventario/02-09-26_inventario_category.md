# Inventario — campo `category` (obligatorio → opcional)

**Fecha:** 02-09-2026
**Motivo:** el campo `category` va a pasar de obligatorio a opcional.
**Alcance de este documento:** solo inventario de análisis, sin cambios de código.

## 1. Ficheros con validación del campo `category`

| Fichero | Línea | Qué valida |
|---|---|---|
| `src/models/transaction.js` | 24 | `if (!category) throw new Error('category is required')` — obligatorio en el modelo `createTransaction` |
| `src/validators/csv.validator.js` | 11 | `REQUIRED_HEADERS = ['date', 'description', 'category', 'amount']` — obligatorio como cabecera del CSV (`validateHeaders`) |
| `src/validators/csv.validator.js` | 54 | `const fields = ['date', 'description', 'category', 'amount']` dentro de `validateRow` — rechaza la fila si `category` viene vacío |

## 2. Tests que verifican que `category` es obligatorio

| Fichero | Línea | Test |
|---|---|---|
| `tests/transactions.test.js` | 82–86 | `'headers con campo faltante fallan'` — construye headers **sin** `category` (`['date', 'description', 'amount']`) y comprueba que `validateHeaders` falla y que `result.error` contiene `'category'` |

## Observaciones

- No existe ningún test que verifique la obligatoriedad de `category` a nivel de fila individual (`validateRow` con `category` vacío) ni a nivel de modelo (`createTransaction` sin `category`) — a diferencia de `email`, que sí tiene un test dedicado (`test_ca_email_mandatory`).
- El resto de apariciones de `category` en `tests/transactions.test.js` (líneas 25, 39, 50, 60, 73, 93, 98, 106) son solo datos de prueba, no aserciones sobre su obligatoriedad.
