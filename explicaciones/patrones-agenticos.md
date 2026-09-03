# Patrones agénticos — Guía de referencia

Mecanismos que ya usan los agentes de código. Conocerlos permite
diseñarlos de forma deliberada en lugar de dejar que ocurran por accidente.

---

## ReAct — Reason · Act · Observe

**Qué es:**
El agente razona, ejecuta una acción, observa el resultado y vuelve
a razonar. Itera hasta resolver el problema.

```
REASON  → "El test falla. Probablemente está en el validador."
ACT     → ejecuta los tests, lee el output
OBSERVE → "El error está en la línea 98 de csv.validator.js"
REASON  → "La condición usa > en lugar de >="
ACT     → aplica el fix
OBSERVE → "Los tests pasan"
```

**Dónde lo ves:**
Claude Code depurando un error. Copilot CLI en `/autopilot`.
OpenCode en Build mode. Cualquier agente que ejecuta comandos
y ajusta su respuesta según el output.

**Cuándo tiene sentido usarlo:**
- Depuración — el agente no sabe cuál es el bug hasta que ejecuta
- Tareas exploratorias — el camino correcto no está claro al principio
- Pipelines con feedback — compilar, testear, corregir, repetir

**Cuándo no usarlo:**
- Tareas con spec clara y resultado predecible — usar Plan-Execute directamente
- Contextos donde cada iteración es cara (APIs externas, operaciones destructivas)

---

## Plan-Execute — Planifica primero, ejecuta después

**Qué es:**
El agente genera un plan completo antes de tocar ningún fichero.
El desarrollador revisa el plan y autoriza la ejecución.

```
PLAN  → descompone la spec en tasks ordenadas
       "Task 1: modelo · Task 2: servicio · Task 3: endpoint · Task 4: tests"
       [el desarrollador revisa y aprueba]
EXECUTE → implementa cada task en orden
```

**Dónde lo ves:**
OpenCode con prefijo `Plan:` / `Build:`. Claude Code con
"dame el plan antes de ejecutar". Copilot CLI antes de `/autopilot`.
La calibración de tasks del curso ES diseñar la fase Plan.

**Cuándo tiene sentido usarlo:**
- Tasks complejas que afectan a muchos ficheros
- Cuando el scope importa — quieres saber qué va a tocar antes de que lo toque
- Equipos con revisión obligatoria antes de cambios grandes
- Cualquier operación difícil de revertir

**Cuándo no usarlo:**
- Tasks pequeñas y bien definidas — el plan añade fricción sin valor
- Prototipos rápidos donde iterar es más valioso que planificar

---

## Reflection — El agente revisa su propio output

**Qué es:**
Antes de entregar el resultado, el agente lo evalúa críticamente
buscando errores, edge cases o inconsistencias.

```
GENERATE → el agente produce el código o la spec
REFLECT  → "¿hay casos edge no cubiertos? ¿algo que falle en producción?"
REFINE   → corrige lo que encuentra
DELIVER  → entrega el resultado mejorado
```

**Cómo activarlo:**
```
"Antes de darme el resultado, revísalo tú mismo:
¿hay casos edge no cubiertos? ¿algo que podría fallar
en producción pero no en los tests? Corrige lo que encuentres."
```

En Copilot CLI: `/rubber-duck` (Reflection + Critic-Actor en un comando).

**Cuándo tiene sentido usarlo:**
- Código de lógica de negocio compleja
- Specs antes de pasarlas al agente que va a implementarlas
- Tests — para verificar que realmente cubren lo que dicen
- Cualquier output de alta consecuencia

**Cuándo no usarlo:**
- Código trivial o boilerplate — añade tiempo sin valor real
- Cuando ya hay un QA separado en el flujo (Critic-Actor es más efectivo)

---

## Critic-Actor — Genera y critica en sesiones separadas

**Qué es:**
Dos instancias del agente con roles opuestos. El Actor genera,
el Critic evalúa sin el sesgo de haber escrito el código.

```
ACTOR  → genera el código (sesión 1, con contexto de implementación)
CRITIC → revisa el código (sesión 2, contexto limpio — rol QA)
         "¿bugs? ¿vulnerabilidades? ¿inconsistencias con AGENTS.md?"
ACTOR  → refina con el feedback del Critic
```

**Dónde lo ves:**
Copilot CLI `/rubber-duck`. PR review con el agente en sesión limpia.
El flujo de 4 roles del curso (Desarrollador → QA).

**Cuándo tiene sentido usarlo:**
- Revisión de PRs — el Critic no tiene el sesgo del que escribió
- Funcionalidades críticas (autenticación, pagos, datos sensibles)
- Validación de specs antes de implementar
- Cuando el equipo necesita separar "quien genera" de "quien valida"

**Cuándo no usarlo:**
- Features pequeñas de bajo riesgo — dos sesiones es overhead innecesario
- Cuando el tiempo es el factor crítico y se puede iterar después

---

## Human-in-the-Loop — Gate humano deliberado

**Qué es:**
El flujo agéntico se pausa en puntos críticos esperando
aprobación humana antes de continuar.

```
AGENT  → genera el plan
PAUSE  → [el desarrollador revisa]  ← gate humano
AGENT  → ejecuta si se aprueba
PAUSE  → [el desarrollador revisa el diff]  ← gate humano
AGENT  → hace commit si se aprueba
```

**Dónde lo ves:**
Plan Mode de OpenCode (plan → aprobación → build).
Revisión de PR antes de merge. El `git diff --stat` manual
antes de cada commit durante los ejercicios del curso.

**Cuándo tiene sentido usarlo:**
- Operaciones irreversibles o difíciles de revertir
- Cambios que afectan a muchos ficheros o al core del sistema
- Equipos con políticas de revisión obligatoria
- Cuando la confianza en el agente aún se está construyendo

**Cuándo no usarlo:**
- Flujos completamente automatizados en CI/CD de bajo riesgo
- Tareas repetitivas con patrón probado donde el gate solo añade latencia

---

## Orchestrator-Worker — Un agente coordina a otros

**Qué es:**
Un agente orquestador descompone el trabajo y delega en agentes
especializados. Cada worker tiene un rol acotado.

```
ORCHESTRATOR → lee la spec, genera el plan, asigna roles
WORKER-1     → implementa (rol: Desarrollador)
WORKER-2     → genera tests (rol: Tester)
WORKER-3     → valida (rol: QA)
ORCHESTRATOR → integra los resultados
```

**Dónde lo ves:**
El flujo de 4 roles del curso. Pipelines multi-agente.
Copilot Coding Agent asignando subtareas. Claude Code con MCPs
que coordinan herramientas externas.

**Cuándo tiene sentido usarlo:**
- Funcionalidades grandes que requieren múltiples competencias
- Cuando la separación de responsabilidades mejora la calidad
- Equipos que quieren paralelizar trabajo entre agentes
- Flujos donde cada fase necesita contexto diferente

**Cuándo no usarlo:**
- Tasks pequeñas — la coordinación cuesta más que el trabajo
- Cuando un solo agente con buen contexto resuelve el problema

---

## Checkpoint — Persistencia de estado para poder reanudar

**Qué es:**
El agente guarda el estado en puntos intermedios para poder
reanudar si algo falla, en lugar de empezar desde cero.

```
EXECUTE task 1 → CHECKPOINT (commit)
EXECUTE task 2 → CHECKPOINT (commit)
EXECUTE task 3 → [falla]
RESUME         → retoma desde el checkpoint de task 2
```

**Dónde lo ves:**
OpenCode guarda sesiones en SQLite (`/undo` revierte al checkpoint anterior).
Commits intermedios en Claude Code. El pipeline de CI como secuencia
de checkpoints automatizados (lint → test → build → deploy).

**Cuándo tiene sentido usarlo:**
- Tasks largas donde un fallo a mitad obligaría a rehacer todo
- CI/CD — cada stage es un checkpoint natural
- Flujos con operaciones costosas (compilaciones largas, migraciones)
- Cualquier proceso donde "reanudar" sea más valioso que "reiniciar"

**Cuándo no usarlo:**
- Tareas cortas donde reiniciar es más rápido que gestionar el estado
- Cuando el output de cada paso es impredecible y el contexto previo no ayuda

---

## Parallel Agents — Varios agentes en paralelo

**Qué es:**
Múltiples agentes ejecutan tasks independientes simultáneamente,
reduciendo el tiempo total del flujo.

```
SPLIT    → descomponer en tasks sin dependencias entre sí
PARALLEL → Agente A: implementa módulo de notificaciones
           Agente B: implementa módulo de pagos
           Agente C: genera tests de ambos
MERGE    → integrar los resultados
```

**Dónde lo ves:**
El Ejercicio 1.1 del curso (mismo prompt en 3 herramientas a la vez).
Pipelines de CI con jobs paralelos. Equipos donde cada developer
usa su agente sobre módulos distintos del mismo repo.

**Cuándo tiene sentido usarlo:**
- Tasks verdaderamente independientes sin dependencias entre sí
- Cuando el tiempo es el factor crítico
- Equipos grandes donde cada persona trabaja en su módulo

**Cuándo no usarlo:**
- Tasks con dependencias — la paralelización provoca conflictos
- Repos pequeños donde los ficheros de configuración se pisan

---

## Tabla resumen

| Patrón | Actívalo cuando... | Evítalo cuando... |
|--------|-------------------|-------------------|
| **ReAct** | No sabes el camino hasta ejecutar | El resultado es predecible desde el principio |
| **Plan-Execute** | El scope y los riesgos importan | La task es pequeña y bien definida |
| **Reflection** | El output tiene alta consecuencia | Es código trivial o ya hay QA separado |
| **Critic-Actor** | Necesitas separar quien genera de quien valida | El riesgo es bajo y el tiempo escaso |
| **Human-in-the-loop** | Hay operaciones irreversibles | El flujo es automatizado y el patrón está probado |
| **Orchestrator-Worker** | La tarea necesita múltiples roles o competencias | Una sola tarea pequeña y acotada |
| **Checkpoint** | La tarea es larga y un fallo a mitad es costoso | La tarea es corta y reiniciar es rápido |
| **Parallel Agents** | Las tasks son independientes y el tiempo importa | Hay dependencias entre tasks |

---

## Combinaciones frecuentes en proyectos reales

**Feature de complejidad media:**
`Plan-Execute` → `Checkpoint` por cada task → `Reflection` antes de entregar

**Feature crítica (pagos, auth, datos):**
`Plan-Execute` → `Human-in-the-loop` en el plan → `Checkpoint` → `Critic-Actor` en la revisión

**Pipeline de CI/CD:**
`Parallel Agents` (tests en paralelo) → `Checkpoint` (cada stage) → `Human-in-the-loop` antes del deploy

**Depuración de un bug:**
`ReAct` puro — dejar que el agente itere hasta encontrar y corregir

**Refactor masivo:**
`Orchestrator-Worker` (un agente por módulo) → `Parallel Agents` → `Critic-Actor` en la integración
