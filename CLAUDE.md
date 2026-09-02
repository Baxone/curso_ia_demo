# Instrucciones de proyecto — Claude Code

Las instrucciones completas del proyecto están en AGENTS.md.
Las decisiones técnicas están en rules/technical-rules.md.

## Skills disponibles

Las skills están en `.claude/skills/`. Cada skill tiene su propia carpeta:

```
.claude/skills/
├── planificador/skill.md      → /planificador
├── tdd-feature/skill.md       → /tdd-feature
├── pr-review/skill.md         → /pr-review
├── audit-context/skill.md     → /audit-context
└── mid-flight-change/skill.md → /mid-flight-change
```

## Específico de Claude Code

- Leer AGENTS.md y rules/technical-rules.md al inicio de cada sesión
- Usar /init si la estructura del proyecto cambia significativamente
- Ante cualquier duda sobre convenciones: AGENTS.md
- Ante cualquier duda sobre librerías o implementación: rules/technical-rules.md
