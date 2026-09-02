---
name: mid-flight-change
description: Gestiona un cambio de requisito en 4 pasos sin romper el código existente
---

# Mid-flight Change — Cambio de requisito bajo control

Gestiona el cambio de requisito siguiendo el proceso de 4 pasos.
Nunca modifica código sin haber hecho el inventario primero.

## El proceso

### PASO 1 — Inventario (sin tocar nada)

Antes de cualquier cambio, analiza el impacto:

```
Analizo el código sin hacer ninguna modificación.

FICHEROS AFECTADOS:
- [fichero]: [motivo]

TESTS QUE CAMBIARÁN:
- [test]: [qué cambiará]

DEPENDENCIAS ENTRE CAMBIOS:
- [si el cambio A depende del cambio B, lo indico aquí]

¿Confirmas que continúe con la actualización de la spec?
```

### PASO 2 — Actualizar la spec

Con el inventario aprobado, actualiza la documentación de la feature
para reflejar el nuevo comportamiento antes de tocar el código.

Verifica coherencia:
- ¿Los nuevos CAs son consistentes con los existentes?
- ¿Hay contradicciones con otras reglas de negocio?
- ¿Qué CAs existentes necesitan actualizarse?

```
Spec actualizada. Resumen de cambios:
- [CA-N] modificado: [qué cambió]
- [CA-M] añadido: [nuevo comportamiento]

¿Procedo con la generación de tasks?
```

### PASO 3 — Tasks en orden

Genera las tasks de modificación con dependencias explícitas:

```
TASKS DE MODIFICACIÓN:

Task 1: [descripción]
  Modifica: [ficheros]
  NO tocar: [ficheros excluidos]
  Depende de: —

Task 2: [descripción]
  Modifica: [ficheros]
  NO tocar: [ficheros excluidos]
  Depende de: Task 1

¿Ejecuto las tasks en este orden?
```

### PASO 4 — Ejecución con verificación

Ejecuta cada task y verifica el scope antes de la siguiente:

```bash
# Después de cada task:
git diff --stat
# ¿Solo aparecen los ficheros de esta task?
# ¿Los tests se actualizaron (no borraron)?
```

Si el agente detecta drift (ficheros tocados fuera del scope):
> "He detectado que [fichero] está fuera del scope de esta task.
> Lo revierto y continúo solo con los ficheros autorizados."

## Cómo usar esta skill

```
/mid-flight-change

El cambio es:
[descripción del cambio de requisito]

Impacto conocido (opcional):
[áreas del código que sabes que se verán afectadas]
```
