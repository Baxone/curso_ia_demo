# Spec Funcional — POST /transactions/import

**Estado:** Aprobada  
**Versión:** 1.0  
**Usada en:** Ejercicio 4.1 (Jornada 3) — TDD agentizado

---

## Descripción

Recibe un archivo CSV con transacciones bancarias, valida el formato
y devuelve un resumen de la importación. Sin persistencia en base de datos.

## Alcance

**SÍ incluye:**
- Endpoint de importación
- Validación de formato CSV
- Clasificación de filas válidas vs rechazadas
- Cálculo del resumen

**NO incluye:**
- Persistencia en base de datos
- Autenticación o autorización
- Interfaz de usuario
- Notificaciones al usuario

## Input

```
Método:       POST
Ruta:         /transactions/import
Content-Type: multipart/form-data
Campo:        file (el archivo CSV)
```

## Formato CSV esperado

```
Headers obligatorios: date, description, category, amount
Separador:            coma (,)
Encoding:             UTF-8
Tamaño máximo:        10 MB
```

## Output exitoso

```json
{
  "valid_count": 47,
  "rejected": [
    { "line": 3, "reason": "campo 'amount' vacío en línea 3" }
  ],
  "total_by_category": {
    "Alimentación": 450.30,
    "Transporte": 89.50
  },
  "top_5": [
    { "date": "2026-03-15", "description": "Factura electricidad", "amount": 145.30 },
    { "date": "2026-03-10", "description": "Alquiler", "amount": 900.00 },
    { "date": "2026-03-01", "description": "Seguro coche", "amount": 87.50 },
    { "date": "2026-03-20", "description": "Supermercado", "amount": 76.20 },
    { "date": "2026-03-05", "description": "Gasolina", "amount": 65.00 }
  ]
}
```

## Reglas de negocio

1. Todas las columnas son obligatorias en cada fila
2. Si una fila falla validación → se incluye en `rejected` con el número de línea y el motivo
3. Las filas válidas se procesan con normalidad aunque haya filas rechazadas
4. El campo `amount` debe ser un número decimal válido (positivo, negativo o cero)
5. `total_by_category` suma los importes de las filas **válidas** por categoría
6. `top_5` son las 5 filas de mayor `amount` en orden descendente. En caso de empate, el orden es indeterminado

## Criterios de aceptación

---

### CA-1 — CSV completamente válido

**Dado:** Archivo CSV con headers correctos y N filas válidas  
**Cuando:** POST /transactions/import  
**Entonces:**
- Respuesta: `200 OK`
- `valid_count` = N
- `rejected` = array vacío `[]`
- `total_by_category` contiene la suma de cada categoría presente
- `top_5` contiene las 5 filas de mayor `amount` en orden descendente

---

### CA-2 — CSV con una fila con campo vacío

**Dado:** CSV con N filas, la fila K tiene el campo `amount` vacío (sin valor)  
**Cuando:** POST /transactions/import  
**Entonces:**
- Respuesta: `200 OK`
- `valid_count` = N - 1
- `rejected` contiene 1 elemento: `{ "line": K, "reason": "campo 'amount' vacío en línea K" }`
- Las otras N-1 filas se procesan correctamente

---

### CA-3 — CSV vacío (solo headers)

**Dado:** Archivo CSV que contiene únicamente la línea de headers, sin filas de datos  
**Cuando:** POST /transactions/import  
**Entonces:**
- Respuesta: `200 OK`
- `valid_count` = 0
- `rejected` = `[]`
- `total_by_category` = `{}`
- `top_5` = `[]`

---

### CA-4 — Archivo que no es CSV

**Dado:** Se envía un archivo que no tiene formato CSV (PDF, imagen, texto sin comas, etc.)  
**Cuando:** POST /transactions/import  
**Entonces:**
- Respuesta: `400 Bad Request`
- Body contiene un campo `message` con descripción del error de formato

---

### CA-5 — Archivo que supera 10MB

**Dado:** Se envía un archivo CSV cuyo tamaño supera los 10 megabytes  
**Cuando:** POST /transactions/import  
**Entonces:**
- Respuesta: `413 Payload Too Large`
- Body contiene un campo `message` explicando el límite
- **La validación ocurre ANTES de intentar procesar el contenido**

---

### CA-6 — Fila con amount no numérico

**Dado:** CSV donde la fila K tiene `amount` = "no-es-numero" (texto no parseable como número)  
**Cuando:** POST /transactions/import  
**Entonces:**
- Respuesta: `200 OK`
- Fila K en `rejected`: `{ "line": K, "reason": "amount inválido: 'no-es-numero'" }`
- Las demás filas se procesan correctamente

---

### CA-7 — Archivo con muchas filas y top_5 correcto

**Dado:** CSV con 1000 filas válidas, con importes variados incluyendo empates  
**Cuando:** POST /transactions/import  
**Entonces:**
- Respuesta: `200 OK`
- `valid_count` = 1000
- `top_5` contiene **exactamente** 5 elementos
- Cada elemento del `top_5` tiene un `amount` mayor o igual al de cualquier fila no incluida en el top_5
- En caso de empate de `amount`, cualquier orden es aceptable

---

## Estructura de ficheros esperada

```
src/
├── routes/transactions.js         → Solo routing, sin lógica
├── services/transaction.service.js → Lógica de procesamiento del CSV
├── validators/csv.validator.js    → Reglas de validación (ya existe)
tests/
└── transactions.test.js           → Tests — uno por CA mínimo
```

## Notas de implementación

- No usar librerías de parseo CSV externas — implementar el parseo básico
  o usar el módulo `csv-parse` ya incluido en las dependencias
- El campo `amount` acepta valores negativos (gastos negativos son válidos en contabilidad)
- El número de línea en `rejected` cuenta desde 1, siendo la línea 1 los headers
  (es decir, la primera fila de datos es la línea 2)
