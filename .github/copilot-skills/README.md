# Skills para Copilot CLI y OpenCode

Las skills de Claude Code (`.claude/skills/`) tienen equivalentes
en las otras dos herramientas. El contenido es el mismo — cambia cómo
se invocan y dónde se almacenan.

---

## GitHub Copilot CLI

### Dónde van las skills

```
.github/copilot-skills/
├── pr-review.md
├── tdd-feature.md
├── audit-context.md
└── mid-flight-change.md
```

### Cómo invocarlas

```bash
# Listar skills disponibles
gh copilot
> /skills

# Invocar una skill por nombre
gh copilot
> /skills pr-review

# O invocarla directamente con el contenido
gh copilot
> /pr-review   ← si está registrada como slash command
```

### Formato del fichero de skill

El contenido es idéntico al de Claude Code.
La diferencia es dónde se almacena y cómo se registra:

```markdown
---
name: pr-review
description: Revisa el código como QA senior — Critic-Actor
---

[mismo contenido que .claude/skills/pr-review.md]
```

### Registrar la skill en copilot-instructions.md

Para que Copilot reconozca tus skills, añade al final de
`.github/copilot-instructions.md`:

```markdown
## Skills disponibles en este proyecto

Este proyecto tiene las siguientes skills configuradas
en `.github/copilot-skills/`. Cuando el usuario las invoque,
sigue las instrucciones del fichero correspondiente:

- `/pr-review` → .github/copilot-skills/pr-review.md
- `/tdd-feature` → .github/copilot-skills/tdd-feature.md
- `/audit-context` → .github/copilot-skills/audit-context.md
- `/mid-flight-change` → .github/copilot-skills/mid-flight-change.md
```

### Alternativa: /rubber-duck como skill nativa

Para PR review, Copilot CLI tiene `/rubber-duck` integrado
que ejecuta el patrón Critic-Actor sin necesidad de skill propia.
Úsalo cuando no quieras configurar la skill manualmente:

```bash
gh copilot
> /rubber-duck
```

---

## OpenCode

### Dónde van las skills

OpenCode soporta custom tools definidos en `opencode.json`.
Para skills basadas en prompts, la estrategia más simple
es definirlas como entradas en el AGENTS.md y referenciarlas
por nombre en el chat.

**Opción A — Como sección en AGENTS.md:**

```markdown
## Skills disponibles

### /pr-review
Cuando el usuario escriba "/pr-review", actúa como reviewer senior
en sesión limpia y sigue el proceso del fichero
.claude/skills/pr-review.md (compartido con Claude Code).

### /tdd-feature
Cuando el usuario escriba "/tdd-feature", sigue el flujo TDD de dos
fases definido en .claude/skills/tdd-feature.md.

### /audit-context
Cuando el usuario escriba "/audit-context", evalúa el AGENTS.md
siguiendo la rúbrica de .claude/skills/audit-context.md.

### /mid-flight-change
Cuando el usuario escriba "/mid-flight-change", gestiona el cambio
de requisito en 4 pasos siguiendo .claude/skills/mid-flight-change.md.
```

**Opción B — Como custom tools en opencode.json:**

```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "tools": {
    "pr-review": {
      "description": "Revisa el código como QA senior — Critic-Actor",
      "command": "cat .claude/skills/pr-review.md"
    },
    "tdd-feature": {
      "description": "Implementa feature con flujo TDD agentizado",
      "command": "cat .claude/skills/tdd-feature.md"
    },
    "audit-context": {
      "description": "Audita la calidad del AGENTS.md",
      "command": "cat .claude/skills/audit-context.md"
    },
    "mid-flight-change": {
      "description": "Gestiona cambio de requisito en 4 pasos",
      "command": "cat .claude/skills/mid-flight-change.md"
    }
  }
}
```

### Cómo invocarlas en OpenCode

```bash
opencode
> /pr-review
> /tdd-feature [descripción de la feature]
> /audit-context
> /mid-flight-change [descripción del cambio]
```

---

## Tabla comparativa

| Herramienta | Dónde se guardan | Cómo se invocan | Formato |
|-------------|-----------------|----------------|---------|
| Claude Code | `.claude/skills/*.md` | `/nombre-skill` | Markdown con frontmatter |
| Copilot CLI | `.github/copilot-skills/*.md` | `/skills nombre` o `/nombre` | Markdown con frontmatter |
| OpenCode | AGENTS.md o opencode.json | `/nombre-skill` | Referencia al fichero .md |

**Ventaja de compartir los ficheros `.claude/skills/`:**
Claude Code y Copilot CLI pueden leer los mismos ficheros.
OpenCode los referencia desde el AGENTS.md.
Un solo set de skills funciona para las tres herramientas.
