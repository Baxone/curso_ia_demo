#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
# setup-repo.sh — Configura el repositorio de demos del curso
# ══════════════════════════════════════════════════════════════════
#
# Ejecutar UNA VEZ, desde la raíz del repositorio curso-ia-demo:
#
#   cd curso-ia-demo
#   chmod +x setup-repo.sh
#   ./setup-repo.sh
#
# Qué hace:
#   1. Crea el commit inicial en main
#   2. Crea la rama demo/agente-se-paso (Ejercicio 3.4 — J2)
#   3. Crea la rama demo/pr-con-errores (Ejercicio 4.2 — J3)
#   4. Crea ramas de solución vacías para referencia post-jornada
#   5. Vuelve a main
#
# Prerequisito: estar en el directorio raíz de curso-ia-demo
# ══════════════════════════════════════════════════════════════════

set -e  # Salir si cualquier comando falla

# ── Colores para el output ──────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${BLUE}→  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo ""
echo "══════════════════════════════════════════════════════"
echo "  Setup del repositorio de demos — Curso IA avanzado"
echo "══════════════════════════════════════════════════════"
echo ""

# ── Verificar que estamos en el directorio correcto ─────────────
if [ ! -f "package.json" ] || [ ! -f "AGENTS.md" ]; then
  err "Ejecuta este script desde la raíz del repositorio curso-ia-demo"
fi
info "Directorio correcto: $(pwd)"

# ── Verificar git ────────────────────────────────────────────────
if ! command -v git &> /dev/null; then
  err "Git no está instalado"
fi

# ── Inicializar git si no está iniciado ─────────────────────────
if [ ! -d ".git" ]; then
  info "Inicializando repositorio git..."
  git init
  git branch -M main
  ok "Git inicializado"
fi

# ── Configurar usuario si no está configurado ───────────────────
if [ -z "$(git config user.email)" ]; then
  warn "Git user.email no configurado — usando valor temporal"
  git config user.email "instructor@curso-ia.demo"
  git config user.name "Instructor"
fi

# ── PASO 1: Commit inicial en main ──────────────────────────────
echo ""
info "PASO 1 — Creando commit inicial en main..."

# Asegurarse de estar en main
git checkout -B main 2>/dev/null || true

# Añadir todos los ficheros base
git add .
git add -f .claudeignore .env.example .gitignore 2>/dev/null || true

git commit -m "chore: estado inicial del proyecto — punto de partida del curso" \
  --allow-empty 2>/dev/null || true

ok "Commit inicial creado en main"

# ── PASO 2: Rama demo/agente-se-paso ────────────────────────────
echo ""
info "PASO 2 — Creando rama demo/agente-se-paso..."
info "         (Ejercicio 3.4, Jornada 2 — 'el agente hizo más de lo pedido')"

git checkout -b demo/agente-se-paso main

# Simular los cambios no solicitados que haría un agente sin restricciones

# Cambio SOLICITADO: añadir campo phone al modelo de usuario
cat >> src/models/transaction.js << 'PATCH'

/**
 * Campo añadido en demo/agente-se-paso
 * Cambio SOLICITADO: campo phone (opcional)
 */
// phone: String (opcional) — añadido por el agente
PATCH

# Cambios NO SOLICITADOS que el agente añadió por su cuenta:

# 1. Refactor del servicio de validación (no pedido)
cat > src/validators/csv.validator.refactored.js << 'PATCH'
/**
 * REFACTOR NO SOLICITADO — El agente refactorizó este fichero
 * sin que nadie se lo pidiera "para mejorar la legibilidad".
 *
 * Este fichero no debería existir en este PR.
 * El fichero original csv.validator.js sigue siendo el correcto.
 */
// ... refactor no solicitado
PATCH

# 2. Fichero utils (catch-all prohibido por AGENTS.md)
mkdir -p src/utils
cat > src/utils/validators.js << 'PATCH'
/**
 * utils/validators.js — CREADO SIN PERMISO
 *
 * El agente creó este fichero catch-all aunque AGENTS.md
 * prohíbe explícitamente: "NO crear archivos utils.*"
 *
 * Las validaciones aquí deberían estar en sus módulos de dominio.
 */
export const isNotEmpty = (value) => value !== null && value !== undefined && value !== ''
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
PATCH

# 3. Dependencia nueva (no justificada)
node -e "
const pkg = require('./package.json');
pkg.dependencies['date-fns'] = '^3.6.0';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
" 2>/dev/null || true

# 4. Tests reescritos (el agente los modificó "para mejorar las convenciones")
cat >> tests/transactions.test.js << 'PATCH'

// Tests añadidos sin solicitud por el agente durante el refactor
// Duplican cobertura existente con naming diferente
describe('Validation — refactored by agent (NOT REQUESTED)', () => {
  test('validates that amount is not empty string', () => {
    // Duplica el test existente de campo vacío con otro nombre
    const row = { date: '2026-01-15', description: 'Test', category: 'X', amount: '' }
    expect(require('../src/validators/csv.validator').validateRow(row, 1).valid).toBe(false)
  })
})
PATCH

git add .
git commit -m "feat: add phone field to user model

- Added optional phone field to Transaction model

⚠️  NOTA PARA EL CURSO: este commit también incluye cambios
no solicitados (refactor de validador, utils/validators.js,
dependencia date-fns, tests adicionales).
El ejercicio E3.4 consiste en revertir todo excepto el campo phone."

ok "Rama demo/agente-se-paso creada"

# ── PASO 3: Rama demo/pr-con-errores ────────────────────────────
echo ""
info "PASO 3 — Creando rama demo/pr-con-errores..."
info "         (Ejercicio 4.2, Jornada 3 — PR review Critic-Actor)"

git checkout -b demo/pr-con-errores main

# Añadir lodash como dependencia (Error 6)
node -e "
const pkg = require('./package.json');
pkg.dependencies['lodash'] = '^4.17.21';
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
" 2>/dev/null || true

# Los ficheros con errores ya están creados en el repo:
# - src/controllers/user.controller.js (Errores 1, 2, 3, 4, 6)
# - src/utils/helpers.js              (Error 4)
# - tests/user.test.js                (Error 5)

git add .
git commit -m "feat: add user search endpoint

Implements GET /users/search with name and role filtering.
Adds user profile endpoint with full data aggregation.

Co-authored-by: github-actions[bot] <github-actions[bot]@users.noreply.github.com>"

ok "Rama demo/pr-con-errores creada"

# ── PASO 3B: Rama jornada-1/inicio (repo vacío para el flujo SDD) ──
echo ""
info "PASO 3B — Creando rama jornada-1/inicio..."
info "           (Jornada 1 — flujo SDD completo desde cero)"

git checkout -b jornada-1/inicio main

# Eliminar el código implementado — solo queda la estructura vacía
rm -f src/models/transaction.js
rm -f src/validators/csv.validator.js
rm -f src/controllers/user.controller.js
rm -f src/utils/helpers.js
rm -f tests/transactions.test.js
rm -f tests/user.test.js

# Añadir .gitkeep para mantener las carpetas vacías
touch src/routes/.gitkeep
touch src/services/.gitkeep
touch src/models/.gitkeep
touch src/validators/.gitkeep
touch tests/.gitkeep

# Reemplazar AGENTS.md con la versión de calidad
# (la versión inicial tiene gaps intencionados — esta está corregida
#  para que los alumnos trabajen con un buen contexto desde el principio)
cat > AGENTS.md << 'AGENTS'
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
| `/pr-review` | Revisa el código como QA senior — Critic-Actor |
| `/tdd-feature` | Implementa con TDD: tests primero, código después |
| `/audit-context` | Audita la calidad de este AGENTS.md |
| `/mid-flight-change` | Gestiona cambio de requisito en 4 pasos |
AGENTS

git add .
git commit -m "chore: rama de inicio para Jornada 1 — solo estructura y spec

Estado inicial del proyecto:
- AGENTS.md de calidad (para trabajar con buen contexto)
- Estructura de carpetas vacía (sin código implementado)
- specs/transaction-import.md como punto de partida del flujo SDD

Los alumnos construyen la implementación desde aquí siguiendo:
spec → plan de tasks → tests → código → validación QA"

ok "jornada-1/inicio creada"

# ── PASO 4: Ramas de solución (referencias post-jornada) ────────
echo ""
info "PASO 4 — Creando ramas de solución..."

# Estas ramas se completan durante/después de cada jornada
git checkout -b solucion/jornada-1 main
git commit -m "chore: placeholder — completar durante/después de J1

PENDIENTE DE RELLENAR:
- AGENTS.md auditado y mejorado
- .claudeignore configurado
- Specs corregidas de los ejercicios 2.1/2.4" --allow-empty
ok "solucion/jornada-1 creada (placeholder)"

git checkout -b solucion/jornada-2 main
git commit -m "chore: placeholder — completar durante/después de J2

PENDIENTE DE RELLENAR:
- Cambio mid-flight del Ejercicio 3.3 aplicado correctamente
- email → opcional con generación de tmp_XXXXXXXXXX
- Proceso documentado en specs/" --allow-empty
ok "solucion/jornada-2 creada (placeholder)"

git checkout -b solucion/jornada-3 main
git commit -m "chore: placeholder — completar durante/después de J3

PENDIENTE DE RELLENAR:
- Tests TDD del Ejercicio 4.1
- Política de seguridad del equipo
- Evaluación de herramientas del Ejercicio 4.5" --allow-empty
ok "solucion/jornada-3 creada (placeholder)"

# ── PASO 5: Volver a main ────────────────────────────────────────
echo ""
info "PASO 5 — Volviendo a main..."
git checkout main
ok "En rama main"

# ── RESUMEN FINAL ────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════"
echo "  ✅ Setup completado"
echo "══════════════════════════════════════════════════════"
echo ""
echo "Ramas creadas:"
git branch | sed 's/^/  /'
echo ""
echo "Uso en clase:"
echo ""
echo "  JORNADA 1 — Flujo SDD completo desde cero:"
echo "    git checkout jornada-1/inicio"
echo "    → solo estructura vacía + spec"
echo "    → los alumnos construyen desde aquí"
echo ""
echo "  JORNADA 2 — Ejercicio 3.4 (el agente se fue por las ramas):"
echo "    git checkout main"
echo "    git checkout demo/agente-se-paso"
echo "    git diff main --stat"
echo ""
echo "  JORNADA 3 — Ejercicio 4.2 (PR review Critic-Actor):"
echo "    git checkout demo/pr-con-errores"
echo "    git diff main"
echo ""
echo "  Después de cada jornada, llenar las ramas de solución:"
echo "    git checkout solucion/jornada-1"
echo "    # hacer los cambios del ejercicio"
echo "    git add . && git commit -m 'solucion: J1 completada'"
echo ""
echo "  Verificar tests (1 debe fallar en main):"
echo "    git checkout main && npm test"
echo ""
