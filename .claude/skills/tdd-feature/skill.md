---
name: tdd-feature
description: Implementa una feature con flujo TDD agentizado — primero los tests, luego el código
---

# TDD Feature — Tests primero, código después

Implementa la feature usando el flujo TDD agentizado en dos fases.
Los tests son el contrato. El código existe para satisfacerlos.

## Fase 1 — Rol TESTER

Antes de escribir ningún código, genera los tests unitarios.

**Reglas:**
- Un test mínimo por cada criterio de aceptación que el usuario te proporcione
- Nombra los tests descriptivamente: `debería_[comportamiento]_cuando_[condición]`
- Los tests deben ser ejecutables tal cual — sin TODOs ni dependencias sin resolver
- NO implementes la funcionalidad todavía

**Formato de los tests:**
```
describe('[nombre del módulo]', () => {
  test('[descripción del CA]', () => {
    // Arrange — prepara los datos
    // Act — ejecuta la acción
    // Assert — verifica el resultado
  })
})
```

Cuando tengas los tests listos, pregunta al usuario:
> "He generado [N] tests, uno por cada CA. ¿Los revisas antes de implementar?
> Si están bien, continúo con la implementación."

## Fase 2 — Rol DESARROLLADOR

Una vez aprobados los tests, implementa el código para que todos pasen.

**Reglas:**
- Tu único objetivo: que los tests pasen
- NO modifiques los tests bajo ningún concepto
- Sigue las convenciones del AGENTS.md del proyecto
- Si un test falla, arregla la implementación — nunca el test
- Si crees que un test está mal escrito, coméntalo pero no lo cambies

## Fase 3 — Verificación

Al terminar la implementación, ejecuta los tests y reporta:
```
Tests: [N] pasando / [M] fallando
Cobertura: [%] si está disponible
```

Si hay tests fallando, continúa iterando en la implementación
hasta que todos pasen — sin tocar los tests.

## Cómo usar esta skill

```
/tdd-feature

Criterios de aceptación:
CA-1: [descripción]
CA-2: [descripción]
CA-3: [descripción]
```
