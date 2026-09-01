---
name: audit-context
description: Audita la calidad del AGENTS.md y los ficheros de contexto del proyecto
---

# Audit Context — Calidad de los ficheros de contexto

Evalúa la calidad del AGENTS.md (y CLAUDE.md si existe) del proyecto
contra una rúbrica de calidad y propone mejoras concretas.

## Rúbrica de evaluación

Evalúa cada ítem con ✅ / ⚠️ / ❌:

### Contenido mínimo obligatorio
- [ ] **Comandos ejecutables** — ¿tiene los comandos de build, test, lint y dev?
- [ ] **Estructura del proyecto** — ¿describe qué hay en cada directorio?
- [ ] **Convenciones de naming** — ¿con ejemplos concretos, no solo reglas?
- [ ] **Sección "NO hacer"** — ¿restricciones explícitas para el agente?
- [ ] **Tamaño** — ¿menos de 100 líneas? (`wc -l AGENTS.md`)

### Calidad del contenido
- [ ] **Convenciones con ejemplos** — "kebab-case" es vago; "user-service.js ✅ userService.js ❌" es concreto
- [ ] **Restricciones específicas** — "no crear utils.js" es mejor que "seguir buenas prácticas"
- [ ] **Criterios de localización** — ¿dónde va cada tipo de fichero? ¿dónde va la lógica de negocio?
- [ ] **Política de tests** — ¿dónde van? ¿qué framework? ¿cobertura mínima?
- [ ] **Política de autoría IA** — ¿cómo se indica en los commits/PRs que se usó IA?

### Mantenibilidad
- [ ] **Criterios de actualización** — ¿cuándo y quién actualiza el fichero?
- [ ] **Sin información obsoleta** — ¿las versiones y paths siguen siendo correctos?

## Formato de respuesta

```
PUNTUACIÓN: [X/13] ítems cumplidos

GAPS CRÍTICOS (resolver antes del próximo sprint):
1. [descripción del gap + corrección concreta]

GAPS MODERADOS (resolver en las próximas semanas):
1. [descripción del gap + corrección concreta]

BIEN HECHO:
- [lo que está bien y por qué]

VERSIÓN MEJORADA de la sección más crítica:
[propuesta concreta lista para copiar y pegar]
```

## Cómo usar esta skill

```
/audit-context
```

El agente leerá el AGENTS.md actual del proyecto y generará
el informe de calidad sin modificar nada.
