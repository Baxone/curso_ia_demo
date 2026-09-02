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


## Cómo usar esta skill

```
/tdd-feature

Criterios de aceptación:
CA-1: [descripción]
CA-2: [descripción]
CA-3: [descripción]
```
