# curso-ia-demo
API de gestión de transacciones financieras para prácticas del curso.
## Comandos
```bash
# Instalar dependencias
npm install
# Ejecutar tests
npm test
# Ejecutar tests en modo watch
npm run test:watch
# Lint del código
npm run lint
# Servidor de desarrollo (con hot reload)
npm run dev
# Build de producción
npm run build
```
## Stack

- Lenguaje: Node.js >= 18
- Framework: Express 4.x
- Base de datos: PostgreSQL (compatible con DB2 en producción)
- Tests: Jest + Supertest
- Lint: ESLint

## Estructura del proyecto

```
src/
├── routes/        → Definición de endpoints (solo routing, sin lógica)
├── services/      → Lógica de negocio (aquí va el código principal)
├── models/        → Modelos de datos y validaciones de dominio
└── validators/    → Validación de input (formato y tipos)
tests/             → Tests (espejo exacto de src/ — misma estructura)
specs/             → Especificaciones funcionales con criterios de aceptación
config/secrets/    → NUNCA commiteado — credenciales locales únicamente
```

## Convenciones de naming

```
Ficheros: kebab-case  → transaction-service.js ✅   transactionService.js ❌
Funciones: camelCase  → createTransaction() ✅  CreateTransaction() ❌
Clases: PascalCase       → TransactionService ✅ transaction_service ❌
Constantes: UPPER_SNAKE  → MAX_FILE_SIZE ✅     maxFileSize ❌
Tests:   mismo nombre     → transaction.test.js ✅   test-transaction.js ❌
```

## Dónde va cada tipo de lógica

```
routes/       → Solo: definir ruta, llamar al servicio, devolver respuesta
               NO: lógica de negocio, validaciones, acceso a BD directo

services/     → Lógica de negocio, orquestación, cálculos
               NO: acceso a request/response, lógica de presentación

models/       → Estructura de datos, validaciones de dominio, creación de entidades NO: lógica de negocio, llamadas externas

validators/   → Validación de formato e input del usuario
               NO: reglas de negocio (esas van en services/)
```
## NO hacer

```
❌ NO crear ficheros catch-all: utils.*, helpers.*, misc.*, common.*
   → Cada función en su módulo de dominio correspondiente

❌ NO refactorizar código fuera del scope de la task actual
   → Si ves algo que mejorar, coméntalo en el chat pero no lo implementes

❌ NO modificar ficheros de configuración (.env, CI, package.json)
   sin pedirlo explícitamente

❌ NO borrar tests existentes
   → Si un test necesita cambiar, actualízalo — nunca lo borres

❌ NO leer ni modificar config/secrets/ ni ficheros .env
   → Barrera técnica — están en .claudeignore / exclude de opencode

❌ NO mezclar cambios funcionales con refactors en el mismo commit
```

## Tests

```
Un test mínimo por criterio de aceptación definido en la spec.
Los tests van en tests/ — nunca junto al código fuente.
Framework: Jest (configurado en package.json).
Nombrado: describe('[módulo]') + test('[comportamiento cuando condición]')
Cobertura mínima: 80% en services/ y models/
```

## Pull Requests

```
Si el PR fue generado o modificado con ayuda de IA:
  → Añadir "AI-assisted" en la descripción del PR

No mezclar en el mismo PR:
  → Cambios funcionales + refactors
  → Features + fixes de bugs no relacionados

Tamaño recomendado: máximo 400 líneas cambiadas por PR
```

## Skills disponibles

Invoca estos comandos directamente en el chat del agente: sigue las
instrucciones del fichero correspondiente en `.claude/skills/`:

| Comando | Qué hace |
|---------|----------|
| `/planificador` | Descompone una spec en tasks con orden y dependencias |
| `/pr-review` | Revisa el código actual como QA senior — patrón Critic-Actor |
| `/tdd-feature` | Implementa una feature con flujo TDD: tests primero, código después |
| `/audit-context` | Audita la calidad de este AGENTS.md con rúbrica de 13 ítems |
| `/mid-flight-change` | Gestiona un cambio de requisito en 4 pasos sin romper el código |

## Cuándo actualizar este fichero
```
SÍ añadir:
  → Nuevos patrones de código descubiertos en el proyecto
  → Errores recurrentes del agente que necesitan restricción explícita
  → Cambios en el stack o las convenciones del equipo

NO añadir:
  → Workarounds temporales
  → Preferencias personales de un desarrollador
  → Instrucciones específicas de una sola tarea

Responsable: el tech lead del equipo
Frecuencia de revisión: al inicio de cada sprint o cuando cambian las convenciones
```
## Roles del flujo SDD
Cuando el usuario indique uno de estos roles, adopta el comportamiento descrito.
Cada rol trabaja en una **sesión separada** — el aislamiento de contexto es intencional.
### Planificador
Lee la spec y genera el plan de tasks con orden y dependencias.
**NO escribe código.** Usa `/planificador` para activarlo.
### Tester
Lee los CAs y genera tests ejecutables (uno por CA mínimo).
**NO implementa el código.** Usa `/tdd-feature` para activarlo.
### Desarrollador
Una vez aprobados los tests, implementa el código para que todos pasen.
**Reglas:**
- Tu único objetivo: que los tests pasen
- NO modifiques los tests bajo ningún concepto
- Sigue las convenciones del AGENTS.md del proyecto
- Si un test falla, arregla la implementación — nunca el test
- Si crees que un test está mal escrito, coméntalo pero no lo cambies
### QA
Revisa en sesión limpia, sin sesgo de haber escrito el código.
Veredicto: APROBADO / APROBADO CON OBSERVACIONES / RECHAZADO.
Usa `/pr-review` para activarlo.

