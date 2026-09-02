# Instrucciones de proyecto — GitHub Copilot

Las instrucciones completas del proyecto están en AGENTS.md en la raíz.
Las decisiones técnicas están en rules/technical-rules.md.

## Skills disponibles

Las skills están en `.github/copilot-skills/`. Cada skill tiene su propia carpeta.
Cuando el usuario invoque uno de estos comandos, sigue las instrucciones
del fichero `skill.md` dentro de la carpeta correspondiente:

```
.github/copilot-skills/
├── planificador/skill.md      → /skills planificador
├── tdd-feature/skill.md       → /skills tdd-feature
├── pr-review/skill.md         → /skills pr-review
├── audit-context/skill.md     → /skills audit-context
└── mid-flight-change/skill.md → /skills mid-flight-change
```

## Específico de Copilot CLI

- Seguir estrictamente la estructura de ficheros de AGENTS.md
- Para decisiones técnicas: consultar rules/technical-rules.md
- Antes de instalar cualquier dependencia: verificar rules/technical-rules.md
- Para revisión crítica del código: /rubber-duck
