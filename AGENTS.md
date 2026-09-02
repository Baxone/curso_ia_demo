# curso-ia-demo

API de gestión de transacciones financieras — proyecto de prácticas del curso.
Esta es la rama de inicio: solo hay estructura y la spec. Sin código implementado.

## Comandos

```bash
npm install        # Instalar dependencias
npm test           # Ejecutar tests
npm run lint       # Lint del código
npm run dev        # Servidor de desarrollo
```

## Stack

- Lenguaje: Node.js >= 18
- Framework: Express 4.x
- Base de datos: PostgreSQL compatible
- Tests: Jest + Supertest

## Estructura del proyecto

```
src/
├── routes/        → Endpoints (solo routing, sin lógica)
├── services/      → Lógica de negocio
├── models/        → Modelos de datos y validaciones
└── validators/    → Validación de input del usuario
tests/             → Tests (espejo de src/)
specs/             → Especificaciones funcionales con CAs
```

## Convenciones de naming

```
Ficheros:   kebab-case    → transaction-service.js ✅   transactionService.js ❌
Funciones:  camelCase     → createTransaction() ✅       CreateTransaction() ❌
Tests:      mismo nombre  → transaction.test.js ✅       test-transaction.js ❌
```

## Dónde va cada tipo de lógica

```
routes/     → solo: definir ruta → llamar servicio → devolver respuesta
services/   → lógica de negocio, cálculos, orquestación
models/     → estructura de datos, validaciones de dominio
validators/ → validación de formato e input del usuario
```

## NO hacer

❌ NO crear ficheros catch-all: utils.*, helpers.*, misc.*
❌ NO refactorizar código fuera del scope de la task actual
❌ NO borrar tests existentes — actualizar si es necesario
❌ NO mezclar cambios funcionales con refactors en el mismo commit
❌ NO leer ni modificar .env ni config/secrets/

## Tests

Un test mínimo por criterio de aceptación.
Los tests van en tests/ — nunca junto al código fuente.

## Skills disponibles

| Comando | Qué hace |
|---------|----------|
| `/planificador` | Descompone una spec en tasks con orden y dependencias |
| `/pr-review` | Revisa el código como QA senior — Critic-Actor |
| `/tdd-feature` | Implementa con TDD: tests primero, código después |
| `/audit-context` | Audita la calidad de este AGENTS.md |
| `/mid-flight-change` | Gestiona cambio de requisito en 4 pasos |
