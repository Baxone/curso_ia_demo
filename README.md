# curso-ia-demo

Proyecto de práctica para el curso avanzado de asistentes IA para código.
API de gestión de transacciones financieras — agnóstica al lenguaje.

> ⚠️ Este proyecto está diseñado para los ejercicios del curso.
> El AGENTS.md tiene gaps intencionados que se auditan en la Jornada 1.
> Hay 1 test que falla a propósito — se usa en la demo de ReAct en la Jornada 2.

---

## Setup rápido

```bash
npm install
cp .env.example .env
npm test
```

Salida esperada:
```
Tests: 8 passed, 1 failed  ← El test fallido es intencional (demo J2)
```

---

## Comandos

```bash
npm test          # Ejecuta los tests
npm run lint      # Lint del código
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
```

---

## Estructura del proyecto

```
src/
├── routes/        → Definición de endpoints (solo routing)
├── services/      → Lógica de negocio
├── models/        → Modelos de datos
└── validators/    → Validación de input

tests/             → Tests (espejo de src/)
specs/             → Especificaciones funcionales
config/secrets/    → VACÍO — existirá solo en local, nunca en el repo
```

---

## Ramas para las demos

| Rama | Cuándo se usa | Para qué |
|------|--------------|----------|
| `jornada-1/inicio` | Jornada 1 | Punto de partida limpio — solo estructura y spec, sin código |
| `main` | Jornadas 2 y 3 | Estado con código implementado — base de los ejercicios complejos |
| `demo/agente-se-paso` | J2 — Ejercicio 3.4 | Escenario "el agente hizo más de lo pedido" |
| `demo/pr-con-errores` | J3 — Ejercicio 4.2 | PR con 6 errores para el ejercicio de Critic-Actor |
| `solucion/jornada-1` | Post J1 | Estado de referencia tras la jornada 1 |
| `solucion/jornada-2` | Post J2 | Estado de referencia tras la jornada 2 |
| `solucion/jornada-3` | Post J3 | Estado de referencia tras la jornada 3 |

---

## Notas de seguridad

- El fichero `.env` **nunca** se commitea — está en `.gitignore`
- La carpeta `config/secrets/` **nunca** se commitea — está en `.gitignore`
- El `.env.example` contiene solo valores ficticios para documentar las variables

Este proyecto es material didáctico. No contiene credenciales reales.
