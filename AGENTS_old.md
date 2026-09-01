# curso-ia-demo

API de gestión de transacciones financieras para prácticas del curso.

## Comandos

## No hacer - punto rojos.


## Stack

- Lenguaje: Node.js (agnóstico — adaptable a cualquier stack)
- Framework: Express / equivalente REST
- Base de datos: relacional (PostgreSQL compatible)
- Tests: Jest / equivalente

## Estructura

```
src/
├── routes/        → Endpoints
├── services/      → Lógica de negocio
├── models/        → Modelos de datos
└── validators/    → Validación de input
tests/             → Tests (espejo de src/)
specs/             → Especificaciones funcionales
```

## Convenciones

- Naming de ficheros: kebab-case 
- Naming de funciones: camelCase
- Naming de clases: PascalCase

## Skills disponibles

Cuando el usuario invoque uno de estos comandos, sigue las
instrucciones del fichero correspondiente en `.claude/skills/`:

| Comando | Qué hace |
|---------|----------|
| `/planificador` | Descompone una spec en tasks con orden y dependencias |
| `/pr-review` | Revisa el código actual como QA senior — patrón Critic-Actor |
| `/tdd-feature` | Implementa una feature con flujo TDD: tests primero, código después |
| `/audit-context` | Audita la calidad del AGENTS.md con rúbrica de 13 ítems |
| `/mid-flight-change` | Gestiona un cambio de requisito en 4 pasos sin romper el código |


