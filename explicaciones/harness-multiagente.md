# Harness multi-agente — Guía de referencia

Qué es, cómo funciona, cuándo construir uno y cómo evolucionar
desde el flujo manual hasta la orquestación automatizada.

---

## Qué es un harness

Un **harness** es un sistema que coordina múltiples agentes de IA,
gestiona el flujo de información entre ellos y controla cuándo
interviene un humano.

La palabra viene de la ingeniería de tests — un "test harness" es
el andamiaje que ejecuta los tests de forma controlada. Un harness
multi-agente hace lo mismo con los agentes: les da contexto,
les asigna roles, recoge sus outputs y decide qué hacer con ellos.

```
SIN HARNESS — flujo ad-hoc
─────────────────────────────────────────────────────────────
  Developer → [un agente] → código
  Developer → [mismo agente] → revisa el código
  Developer → [mismo agente] → genera tests

  Problema: un solo agente hace todo con el mismo contexto.
  No hay separación de roles ni control del flujo.

CON HARNESS — flujo orquestado
─────────────────────────────────────────────────────────────
  Harness → [Planificador] → plan de tasks
  Harness → [Desarrollador] × N tasks → código
  Harness → [Tester] → tests por criterio de aceptación
  Harness → [QA] → veredicto
  Harness → [Humano si falla QA] → decisión

  Ventaja: cada agente tiene un rol, un contexto y un output
  definido. El harness controla el flujo y los gates humanos.
```

---

## Los 3 niveles de harness

### Nivel 1 — Harness manual

Tú eres el harness. Abres sesiones, copias outputs entre ellas
y decides cuándo pasar al siguiente rol.

```
Tú → abres sesión de Planificador → copias el plan
Tú → abres sesión de Tester → pegas el plan → copias los tests
Tú → abres sesión de Desarrollador → pegas los tests → copias el código
Tú → abres sesión de QA → pegas el código → lees el veredicto
```

**Cuándo usar:** aprendizaje, proyectos personales, flujos esporádicos.
Es lo que practicamos en el Ejercicio 3.6 del curso.

**Coste:** tiempo del desarrollador en cada transición.
**Control:** máximo — tú ves y decides en cada paso.

---

### Nivel 2 — Harness semi-automatizado

Un script coordina las llamadas a la API, pero los gates humanos
siguen siendo manuales en los puntos críticos.

El harness recibe primero la especificación de la funcionalidad y se la
entrega a un agente con el rol de **planificador**. Este agente no escribe
código: divide el trabajo en tareas ordenadas y señala las decisiones que
pueden afectar a la implementación.

En ese punto se detiene el flujo para que una persona revise el plan. Si el
plan no es correcto o está incompleto, se corrige antes de continuar. Este es
el primer **gate humano**.

Después, el harness entrega el plan y los criterios de aceptación a un agente
con el rol de **tester**. Su trabajo consiste en proponer tests ejecutables que
comprueben esos criterios, sin basarse en una implementación concreta. La
persona revisa también esos tests para confirmar que realmente distinguen una
solución correcta de una incorrecta.

Una vez aprobados, el harness pasa el plan, los tests y las instrucciones del
proyecto al agente **desarrollador**. Este agente implementa la funcionalidad
con un alcance limitado a las tareas acordadas. En esta fase no hace falta una
revisión humana después de cada paso, porque los tests ofrecen una
comprobación automática de la implementación.

Por último, el harness entrega el código, los tests y los criterios de
aceptación a un agente de **QA**. Este agente revisa el resultado y devuelve un
informe con un veredicto. Si encuentra un problema importante, el flujo se
detiene y una persona decide si hay que corregir el código, modificar los
tests, revisar el plan o descartar el cambio. Este es el último **gate humano**
del proceso.

**Cuándo usar:** flujos repetitivos en el mismo proyecto, equipos
con un proceso establecido, cuando el tiempo de coordinación manual
empieza a ser un coste real.

**Coste:** tiempo de configuración inicial del script.
**Control:** configurable — defines tú dónde van los gates humanos.

---

### Nivel 3 — Harness automatizado (pipeline)

El harness corre en CI/CD sin intervención humana salvo en fallos
o umbrales de calidad no alcanzados.

```yaml
# Ejemplo conceptual de pipeline
on: [push to feature branch]

steps:
  - planificador:
      input: diff + spec del ticket
      output: plan de tasks

  - tester:
      input: plan + criterios de aceptación
      output: suite de tests

  - desarrollador:
      input: tests + plan + AGENTS.md
      output: código implementado

  - validacion:
      run: npm test
      fail-if: cobertura < 80%

  - qa:
      input: código + tests + AGENTS.md
      output: informe de revisión
      fail-if: severidad == "alta"

  - [GATE HUMANO]: si algún paso falla
    notifica → desarrollador decide
```

**Cuándo usar:** equipos maduros con proceso probado, features
repetitivas con patrón claro, cuando la calidad del pipeline
genera confianza suficiente para reducir gates humanos.

**Coste:** inversión inicial alta, mantenimiento continuo.
**Control:** menor intervención humana en el flujo normal,
pero más responsabilidad en el diseño del pipeline.

---

## Arquitectura de un harness

### Los 4 componentes

```
┌─────────────────────────────────────────────────────────┐
│                      HARNESS                             │
│                                                          │
│  ┌──────────────┐   ┌──────────────┐                    │
│  │   ROUTER     │   │   MEMORIA    │                    │
│  │              │   │              │                    │
│  │ Decide qué   │   │ Contexto     │                    │
│  │ agente recibe│   │ compartido   │                    │
│  │ cada input   │   │ entre roles  │                    │
│  └──────┬───────┘   └──────┬───────┘                    │
│         │                  │                             │
│  ┌──────▼───────────────────▼──────┐                    │
│  │           AGENTES               │                    │
│  │                                 │                    │
│  │  Planificador  Desarrollador    │                    │
│  │  Tester        QA               │                    │
│  └──────────────────┬──────────────┘                    │
│                     │                                    │
│  ┌──────────────────▼──────────────┐                    │
│  │        GATES DE CONTROL         │                    │
│  │                                 │                    │
│  │  Human-in-the-loop  Checkpoint  │                    │
│  │  Umbrales de calidad            │                    │
│  └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**Router:** decide qué agente recibe cada input y en qué orden.
Puede ser tan simple como una función `if/else` o tan complejo
como un LLM que decide dinámicamente.

**Memoria:** el contexto compartido entre agentes. Puede ser:
- Un fichero de texto que se va completando (lo más simple)
- Una base de datos de vectores para búsqueda semántica
- El propio AGENTS.md del proyecto (lo que hacemos en el curso)

**Agentes:** instancias del modelo con system prompts de rol.
Cada uno ve solo el contexto que necesita para su función.

**Gates de control:** los puntos donde el flujo se pausa.
Pueden ser humanos (revisión manual) o automáticos
(tests que pasan, cobertura mínima, QA sin severidad alta).

---

## Los 4 roles — referencia rápida

| Rol | Input | Output | Sesgo a evitar |
|-----|-------|--------|----------------|
| **Planificador** | Spec + AGENTS.md | Plan de tasks ordenado | Empezar a implementar antes de planificar |
| **Desarrollador** | Una task + AGENTS.md | Implementación acotada | Tocar ficheros fuera del scope |
| **Tester** | Criterios de aceptación | Tests ejecutables por CA | Generar tests que confirmen la implementación en lugar de validarla |
| **QA** | Código + tests + CAs | Veredicto con evidencia | Tener el sesgo de quien escribió el código |

**La clave de la separación de roles:**
cada agente trabaja en una sesión limpia, sin el contexto
de los pasos anteriores. El Tester no sabe cómo implementó
el Desarrollador. El QA no sabe lo que pensó el Tester.
Esa ignorancia deliberada elimina el sesgo de confirmación.

---

## Cuándo tiene sentido construir un harness

### Señales de que el harness manual ya no escala

```
☐ Pasas más de 20 minutos coordinando roles en cada feature
☐ Los errores de "pegar en la sesión equivocada" son frecuentes
☐ El equipo tiene el mismo flujo repetido en más de 5 features
☐ Alguien ha documentado el proceso en más de una página
☐ Hay fricción real entre "quien genera" y "quien valida"
```

### Señales de que aún NO necesitas un harness automatizado

```
☐ El proceso cambia en cada feature — no hay patrón estable
☐ Los gates humanos son la parte más valiosa del flujo
☐ El equipo aún está aprendiendo a calibrar los roles
☐ El coste de mantenimiento del harness supera el ahorro
```

### La regla práctica

> Automatiza cuando el proceso manual se ha repetido suficientes veces
> como para conocer exactamente qué va en cada paso, qué sale de cada
> agente y dónde necesitas que intervenga un humano.
>
> Un harness construido antes de conocer el proceso solo automatiza el caos.

---

## Harness con las herramientas del curso

### Claude Code como orquestador

Un harness sencillo basado en Claude Code puede coordinar los cuatro roles
mediante un script. Primero lee la especificación de la funcionalidad y las
instrucciones generales del proyecto, por ejemplo las contenidas en
`AGENTS.md`. Esa información se entrega a Claude Code con el rol de
**planificador**, que devuelve únicamente una propuesta de tareas ordenadas.

El script muestra el plan y se detiene para que una persona lo revise. Si el
plan no se aprueba, el proceso termina y debe corregirse antes de volver a
ejecutarlo. Si se aprueba, el plan pasa al agente con el rol de **tester**, que
genera los tests necesarios para comprobar los criterios de aceptación.

Después, el harness entrega esos tests y el plan al agente **desarrollador**.
Este agente modifica el proyecto para que la implementación cumpla los tests.
Su trabajo se realiza sobre el mismo código del proyecto, por lo que el
resultado no se copia manualmente entre sesiones.

Finalmente, el código implementado y los tests se entregan a un agente con el
rol de **QA**. Este agente revisa el resultado y genera un informe. El harness
muestra ese informe para que el equipo valore si la funcionalidad está lista o
si es necesario volver a una fase anterior y hacer correcciones.

### Copilot CLI como orquestador

```bash
# Usando gh copilot con roles secuenciales
gh copilot "Planificador: descompón esta spec en tasks. Solo el plan." < spec.md
# [Gate humano: revisión]
gh copilot "Tester: genera tests para estas tasks." < plan.md
# [Gate automático: npm test]
gh copilot "Desarrollador: implementa para pasar los tests." < tests.md
gh copilot "/rubber-duck"  # QA integrado en Copilot CLI
```

### OpenCode como orquestador

```bash
# OpenCode con Plan mode para el gate humano natural
opencode
> Plan: Eres el Planificador. Descompón esta spec: [spec]
# [Revisar plan → confirmar]
> Build: Eres el Tester. Genera tests para este plan: [plan]
# [npm test → gate automático]
> Build: Eres el Desarrollador. Implementa para pasar los tests: [tests]
> /rubber-duck  # QA inmediato sobre el código generado
```

---

## Qué NO es un harness

```
❌ Un prompt muy largo con instrucciones para todos los roles
   → Un solo agente haciendo todo no es un harness

❌ Copiar el output de una sesión al principio de la siguiente
   sin cambiar el system prompt / rol
   → El rol define el comportamiento, no solo el contexto

❌ Añadir "actúa como QA" al final de la sesión donde
   el mismo agente acaba de escribir el código
   → El sesgo del contexto previo invalida la revisión

❌ Un pipeline que nunca para para revisión humana
   en código de alta consecuencia
   → Un harness sin gates humanos en puntos críticos
     es un riesgo, no una mejora
```

---

## Evolución recomendada

```
SEMANA 1-2: Harness manual
  → Practica los 4 roles en sesiones separadas
  → Aprende qué va en cada prompt, qué output esperar
  → Identifica dónde los gates humanos aportan más valor

SEMANA 3-4: Primeros scripts
  → Automatiza las transiciones más mecánicas
  → Mantén los gates humanos en puntos críticos
  → Documenta el proceso mientras lo construyes

MES 2+: Pipeline semi-automatizado
  → Integra en el flujo de PR o CI
  → Añade umbrales de calidad automáticos
  → Reduce gates humanos solo donde la confianza es alta

NUNCA: Pipeline completamente sin gates
  → En código de negocio crítico, siempre hay
    un punto donde un humano decide
```
