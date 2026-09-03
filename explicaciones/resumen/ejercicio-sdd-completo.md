# Ejercicio SDD completo — Paso a paso
## Discount Engine — Módulo de cálculo de descuentos

Ejercicio de referencia que muestra el flujo SDD completo:
**spec → Planificador → Tester → Desarrollador → QA**

Sin framework. Sin base de datos. Solo Node.js y Jest.

---

## El proyecto

Un módulo de cálculo de descuentos para un e-commerce.
Recibe un carrito de compra y devuelve el total con el descuento aplicado.

**Reglas de negocio:**
- 3 o más artículos → 5% de descuento
- Subtotal > 100€ → 10% de descuento
- Ambas condiciones → 15% (no son acumulables, se aplica el mayor)
- Cliente premium → 5% adicional sobre el descuento que corresponda
- Artículo con precio negativo o cantidad < 1 → error

---

## PASO 0 — Setup del proyecto

```bash
mkdir discount-engine && cd discount-engine
pnpm init -y
pnpm add -D jest
mkdir src tests
```

Crear `package.json` con el script de tests:

```json
{
  "name": "discount-engine",
  "scripts": {
    "test": "jest --runInBand"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

Crear `AGENTS.md`:

```markdown
# discount-engine

Módulo de cálculo de descuentos para e-commerce.

## Stack
- Node.js — sin dependencias externas
- Tests: Jest

## Estructura
src/discount.js     → lógica de descuentos
tests/discount.test.js → tests (espejo de src/)

## Convenciones
- Funciones en camelCase
- Lanzar Error con mensaje descriptivo para inputs inválidos
- NO usar dependencias externas — solo lógica pura

## NO hacer
❌ NO añadir dependencias externas
❌ NO modificar los tests sin autorización
❌ NO crear ficheros fuera de src/ y tests/
```

---

## LA SPEC — punto de partida del flujo

**Este es el documento que se le pasa al Planificador.**

```markdown
# Spec — Módulo de cálculo de descuentos

## Función principal
calculateTotal(items, isPremium)

## Input
items: array de objetos { name: string, price: number, quantity: number }
isPremium: boolean (cliente premium o no)

## Output
{
  subtotal: number,   → suma de price × quantity de todos los artículos
  discount: number,   → porcentaje de descuento aplicado (0, 5, 10, 15, 20)
  total: number       → subtotal con el descuento aplicado
}

## Reglas de negocio
R1: subtotal = suma de (price × quantity) para cada artículo
R2: 3 o más artículos distintos → descuento base del 5%
R3: subtotal > 100€ → descuento base del 10%
R4: R2 y R3 a la vez → descuento base del 15% (no acumulable — se aplica el mayor)
R5: isPremium = true → descuento adicional del 5% sobre el base
R6: price < 0 → lanzar Error("precio inválido")
R7: quantity < 1 → lanzar Error("cantidad inválida")
R8: items vacío → { subtotal: 0, discount: 0, total: 0 }

## Criterios de aceptación

CA-1: Carrito sin descuento
  Input: 2 artículos, subtotal ≤ 100€, isPremium: false
  Output: discount: 0, total = subtotal

CA-2: Descuento por cantidad (3+ artículos)
  Input: 3 artículos, subtotal ≤ 100€, isPremium: false
  Output: discount: 5, total = subtotal × 0.95

CA-3: Descuento por importe (subtotal > 100€)
  Input: 2 artículos, subtotal > 100€, isPremium: false
  Output: discount: 10, total = subtotal × 0.90

CA-4: Descuento máximo (3+ artículos Y subtotal > 100€)
  Input: 3 artículos, subtotal > 100€, isPremium: false
  Output: discount: 15, total = subtotal × 0.85

CA-5: Cliente premium con descuento base
  Input: 3 artículos, subtotal > 100€, isPremium: true
  Output: discount: 20, total = subtotal × 0.80

CA-6: Precio inválido
  Input: artículo con price: -5
  Output: lanza Error("precio inválido")

CA-7: Carrito vacío
  Input: items: []
  Output: { subtotal: 0, discount: 0, total: 0 }
```

---

## PASO 1 — Planificador

**Nueva terminal. Prompt:**

```
Rol: Planificador

Descompón esta spec en tasks implementables.
Para cada task: nombre, qué ficheros crea/modifica,
criterios de acción verificables, dependencias.
NO escribas código — solo el plan.

[pegar la spec completa de arriba]
```

**Plan de referencia esperado:**

```
TASK-1: validateItems(items)
Fichero: src/discount.js
Valida que cada artículo tenga price >= 0 y quantity >= 1.
Lanza Error con mensaje descriptivo si alguno falla.
Devuelve true si todo es válido.
Done: los errores de CA-6 y CA-7 se gestionan aquí.
Depende de: ninguna

TASK-2: calculateSubtotal(items)
Fichero: src/discount.js
Suma price × quantity de todos los artículos.
Devuelve 0 si items está vacío.
Done: CA-7 (carrito vacío) cubierto.
Tecnologia:
Depende de: TASK-1

TASK-3: getDiscountRate(itemCount, subtotal, isPremium)
Fichero: src/discount.js
Aplica las reglas R2-R5 y devuelve el porcentaje de descuento.
Done: CA-1 al CA-5 cubiertos por esta función.
Depende de: ninguna (función pura, no necesita TASK-1 ni TASK-2)

TASK-4: calculateTotal(items, isPremium)
Fichero: src/discount.js
Orquesta las tres funciones anteriores y devuelve el objeto final.
Done: todos los CAs cubiertos de principio a fin.
Depende de: TASK-1, TASK-2, TASK-3
```

---

## PASO 2 — Tester

**Nueva terminal. Prompt:**

```
Rol: Tester

Genera tests para estos criterios de aceptación.
Un test por CA mínimo, nombrado test_ca1_..., test_ca2_...
Tests ejecutables tal cual — sin TODOs.
NO implementes las funciones — solo los tests.

CA-1: 2 artículos, subtotal ≤ 100€, isPremium false → discount: 0
CA-2: 3 artículos, subtotal ≤ 100€, isPremium false → discount: 5
CA-3: 2 artículos, subtotal > 100€, isPremium false → discount: 10
CA-4: 3 artículos, subtotal > 100€, isPremium false → discount: 15
CA-5: 3 artículos, subtotal > 100€, isPremium true  → discount: 20
CA-6: artículo con price negativo → lanza Error
CA-7: carrito vacío → { subtotal: 0, discount: 0, total: 0 }
```

**Tests de referencia — `tests/discount.test.js`:**

```javascript
const { calculateTotal } = require('../src/discount')

describe('Discount Engine — calculateTotal', () => {

  test('test_ca1_sin_descuento_para_carrito_pequeno', () => {
    const items = [
      { name: 'Libro',  price: 20, quantity: 1 },
      { name: 'Bolígrafo', price: 5, quantity: 1 }
    ]
    const result = calculateTotal(items, false)
    expect(result.subtotal).toBe(25)
    expect(result.discount).toBe(0)
    expect(result.total).toBe(25)
  })

  test('test_ca2_descuento_5_por_tres_o_mas_articulos', () => {
    const items = [
      { name: 'A', price: 10, quantity: 1 },
      { name: 'B', price: 10, quantity: 1 },
      { name: 'C', price: 10, quantity: 1 }
    ]
    const result = calculateTotal(items, false)
    expect(result.subtotal).toBe(30)
    expect(result.discount).toBe(5)
    expect(result.total).toBeCloseTo(28.5)
  })

  test('test_ca3_descuento_10_por_subtotal_mayor_100', () => {
    const items = [
      { name: 'Monitor', price: 80, quantity: 1 },
      { name: 'Teclado', price: 40, quantity: 1 }
    ]
    const result = calculateTotal(items, false)
    expect(result.subtotal).toBe(120)
    expect(result.discount).toBe(10)
    expect(result.total).toBeCloseTo(108)
  })

  test('test_ca4_descuento_15_por_cantidad_y_importe', () => {
    const items = [
      { name: 'A', price: 50, quantity: 1 },
      { name: 'B', price: 40, quantity: 1 },
      { name: 'C', price: 30, quantity: 1 }
    ]
    const result = calculateTotal(items, false)
    expect(result.subtotal).toBe(120)
    expect(result.discount).toBe(15)
    expect(result.total).toBeCloseTo(102)
  })

  test('test_ca5_descuento_20_para_cliente_premium', () => {
    const items = [
      { name: 'A', price: 50, quantity: 1 },
      { name: 'B', price: 40, quantity: 1 },
      { name: 'C', price: 30, quantity: 1 }
    ]
    const result = calculateTotal(items, true)
    expect(result.subtotal).toBe(120)
    expect(result.discount).toBe(20)
    expect(result.total).toBeCloseTo(96)
  })

  test('test_ca6_precio_negativo_lanza_error', () => {
    const items = [
      { name: 'Artículo roto', price: -5, quantity: 1 }
    ]
    expect(() => calculateTotal(items, false)).toThrow('precio inválido')
  })

  test('test_ca7_carrito_vacio_devuelve_ceros', () => {
    const result = calculateTotal([], false)
    expect(result).toEqual({ subtotal: 0, discount: 0, total: 0 })
  })

})
```

**Ejecutar para confirmar que los tests fallan** (aún no hay implementación):

```bash
pnpm test
# → 7 failing — correcto, el código no existe todavía
```

---

## PASO 3 — Desarrollador

**Nueva terminal. Prompt:**

```
Rol: Desarrollador

Tu objetivo: que TODOS los tests pasen.
NO modifiques los tests — si fallan, arregla la implementación.

[pegar tests/discount.test.js]

Contexto del proyecto: [pegar AGENTS.md]
Podemos darle como contexto las rules con librerias, etc.
```

**Implementación de referencia — `src/discount.js`:**

```javascript
/**
 * Valida que todos los artículos tengan precio >= 0 y cantidad >= 1.
 * Lanza Error con mensaje descriptivo si algún artículo es inválido.
 */
function validateItems(items) {
  for (const item of items) {
    if (item.price < 0) {
      throw new Error(`precio inválido: ${item.name} tiene precio ${item.price}`)
    }
    if (item.quantity < 1) {
      throw new Error(`cantidad inválida: ${item.name} tiene cantidad ${item.quantity}`)
    }
  }
  return true
}

/**
 * Calcula la suma de price × quantity de todos los artículos.
 */
function calculateSubtotal(items) {
  if (items.length === 0) return 0
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/**
 * Determina el porcentaje de descuento según las reglas de negocio.
 * R2: 3+ artículos → 5%
 * R3: subtotal > 100 → 10%
 * R4: ambas → 15%
 * R5: isPremium → +5% adicional
 */
function getDiscountRate(itemCount, subtotal, isPremium) {
  let baseDiscount = 0

  const byQuantity = itemCount >= 3
  const byAmount   = subtotal > 100

  if (byQuantity && byAmount) {
    baseDiscount = 15
  } else if (byAmount) {
    baseDiscount = 10
  } else if (byQuantity) {
    baseDiscount = 5
  }

  return isPremium ? baseDiscount + 5 : baseDiscount
}

/**
 * Calcula el total final con descuento.
 * @param {Array}   items      - Array de { name, price, quantity }
 * @param {boolean} isPremium  - Si el cliente es premium
 * @returns {{ subtotal, discount, total }}
 */
function calculateTotal(items, isPremium = false) {
  if (items.length === 0) {
    return { subtotal: 0, discount: 0, total: 0 }
  }

  validateItems(items)

  const subtotal     = calculateSubtotal(items)
  const discount     = getDiscountRate(items.length, subtotal, isPremium)
  const total        = subtotal * (1 - discount / 100)

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount,
    total: Math.round(total * 100) / 100
  }
}

module.exports = { calculateTotal, getDiscountRate, calculateSubtotal, validateItems }
```

**Verificar:**

```bash
pnpm test
# → 7 passing ✅
```

---

## PASO 4 — QA

**Nueva terminal. Prompt:**

```
Rol: QA

Sesión limpia — no has escrito este código.
Revisa el código contra los CAs originales.
Busca bugs funcionales, edge cases no cubiertos,
inconsistencias con AGENTS.md.

Veredicto: APROBADO / APROBADO CON OBSERVACIONES / RECHAZADO

[pegar src/discount.js]

CAs: [pegar los 7 CAs de la spec]

Explicar como quiero el informe 
```

**Veredicto de referencia esperado:**

```
APROBADO CON OBSERVACIONES ⚠️

✅ CA-1 a CA-7: implementación correcta, todos los tests pasan.

OBSERVACIÓN MEDIA:
CA-6 solo valida price < 0 pero la spec dice price < 0 ("precio inválido").
Si price es 0 (artículo gratuito), ¿es válido? La spec no lo especifica.
La implementación actual lo acepta (price >= 0). Si un artículo gratuito
no tiene sentido en el negocio, la spec debería decir price > 0.
→ Aclarar con el equipo de negocio antes de la siguiente iteración.

OBSERVACIÓN BAJA:
getDiscountRate() recibe itemCount pero no valida que sea un número entero.
Si se llama directamente con itemCount = 2.5, el comportamiento es impredecible.
→ La función es interna (no exportada como API pública) así que el riesgo
es bajo. Añadir un comment de que es para uso interno.

SIN FALSOS POSITIVOS.

VEREDICTO: APROBADO CON OBSERVACIONES
Las observaciones no son bloqueantes para entregar esta versión.
Registrar como deuda técnica para la siguiente iteración.
```

---

## Resultado final

```bash
pnpm test

PASS  tests/discount.test.js
  Discount Engine — calculateTotal
    ✓ test_ca1_sin_descuento_para_carrito_pequeno
    ✓ test_ca2_descuento_5_por_tres_o_mas_articulos
    ✓ test_ca3_descuento_10_por_subtotal_mayor_100
    ✓ test_ca4_descuento_15_por_cantidad_y_importe
    ✓ test_ca5_descuento_20_para_cliente_premium
    ✓ test_ca6_precio_negativo_lanza_error
    ✓ test_ca7_carrito_vacio_devuelve_ceros

Tests: 7 passed
```

---

## Qué ha pasado en este ejercicio

```
SPEC FUNCIONAL
  → 7 CAs verificables, sin decisiones técnicas, sin mencionar
    cómo implementar los descuentos

PLANIFICADOR
  → 4 tasks con dependencias claras y sin ciclos
  → Cada task tiene criterios de done verificables

TESTER
  → 7 tests, uno por CA, ejecutables tal cual
  → Los tests fallaron al principio — eso es correcto
  → Son el CONTRATO, no la validación post-hoc

DESARROLLADOR
  → Implementó para que los tests pasaran
  → 4 funciones, una por task del Planificador
  → No tocó los tests

QA
  → Encontró 2 observaciones que los tests no detectaron
  → Ninguna bloqueante — veredicto: aprobado con observaciones

RESULTADO
  → 7 tests pasando
  → Código limpio, funciones con un solo propósito
  → Deuda técnica identificada y registrada
  → El proceso es repetible para cualquier feature siguiente
```

---

## Cómo aplicarlo a tu proyecto

Sustituye:
- La spec → la spec de tu próxima feature
- Los CAs → los criterios de tu equipo o cliente
- `discount.js` → el módulo de tu dominio

El flujo es idéntico. Cambia el contenido, no el proceso.
