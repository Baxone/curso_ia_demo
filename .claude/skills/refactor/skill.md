---
name: refactor
description: Refactoriza código Python mejorando calidad sin cambiar comportamiento
---

# Python Refactor

Actúa como desarrollador Python senior. Tu único objetivo es mejorar
la calidad del código sin cambiar su comportamiento observable.

**Regla fundamental: el comportamiento antes y después del refactor
debe ser idéntico. Si los tests existentes no pasan tras el refactor,
el refactor está mal.**

---

## Qué analizar y en qué orden

### 1. Complejidad ciclomática

Funciones con más de 10 ramas de decisión (if/elif/for/while/try)
son candidatas a extracción. Divide en funciones con un único propósito.

```python
# ❌ Antes — una función hace demasiado
def process_user(user, config, db):
    if user.active:
        if user.role == 'admin':
            if config.get('allow_admin'):
                # 50 líneas más...

# ✅ Después — cada función tiene un propósito
def process_user(user, config, db):
    if not _is_eligible(user, config):
        return None
    return _apply_processing(user, db)

def _is_eligible(user, config):
    return user.active and user.role == 'admin' and config.get('allow_admin')
```

### 2. Duplicación (DRY)

Bloques de código repetidos con variaciones mínimas → extraer función
con parámetros. Umbral: si aparece 3 o más veces, extraer.

### 3. Nombres

```python
# ❌ Nombres que requieren comentario para entenderse
def calc(x, y, z):
    tmp = x * y
    res = tmp / z
    return res

# ✅ Nombres que se explican solos
def calculate_unit_price(total_amount, quantity, tax_rate):
    pretax_total = total_amount * quantity
    return pretax_total / tax_rate
```

### 4. Type hints (Python 3.9+)

Añadir type hints donde falten, especialmente en funciones públicas:

```python
# ❌ Sin type hints
def get_user(user_id, include_inactive=False):
    ...

# ✅ Con type hints
def get_user(user_id: int, include_inactive: bool = False) -> User | None:
    ...
```

### 5. Pythonismo

```python
# ❌ No pythónico
result = []
for item in items:
    if item.active:
        result.append(item.name)

# ✅ Pythónico
result = [item.name for item in items if item.active]

# ❌ Comprobar tipo explícitamente
if type(value) == str:

# ✅ Duck typing
if isinstance(value, str):

# ❌ Keys manuales en dict
if 'key' in my_dict.keys():

# ✅ Forma idiomática
if 'key' in my_dict:
```

### 6. Gestión de errores

```python
# ❌ Capturar Exception genérica
try:
    result = process(data)
except Exception as e:
    print(f"Error: {e}")

# ✅ Capturar excepciones específicas
try:
    result = process(data)
except ValueError as e:
    logger.warning("Invalid data format: %s", e)
    raise
except IOError as e:
    logger.error("IO failure during processing: %s", e)
    raise ProcessingError("Could not complete processing") from e
```

### 7. Dataclasses y NamedTuples

Sustituir dicts o tuplas anónimas que representan entidades:

```python
# ❌ Dict sin estructura
user = {'id': 1, 'name': 'Ana', 'active': True}

# ✅ Dataclass tipada
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    active: bool = True
```

---

## Restricciones

```
❌ NO cambiar la firma pública de funciones o clases
   (rompe contratos con el código que las usa)

❌ NO cambiar el comportamiento observable
   (mismos inputs → mismos outputs y efectos secundarios)

❌ NO cambiar más de un nivel de abstracción por refactor
   (si extraes funciones, no reorganices módulos en el mismo paso)

❌ NO añadir dependencias externas
   (solo librería estándar o las ya presentes en requirements)

❌ NO refactorizar tests
   (los tests son la red de seguridad — si fallan, revertir el código)

❌ NO mezclar refactor con nueva funcionalidad
   (un commit limpio de refactor, separado de los cambios funcionales)
```

---

## Formato de respuesta

Para cada mejora propuesta:

```
MEJORA: [nombre descriptivo]
TIPO: [Complejidad | Duplicación | Nombres | Type hints | Pythonismo | Errores | Dataclass]
FICHERO: ruta/al/fichero.py — líneas X-Y
PROBLEMA: descripción concreta de qué está mal y por qué
ANTES:
[código original]
DESPUÉS:
[código refactorizado]
RIESGO: [Bajo | Medio | Alto] — justificación
```

Al final, un resumen:

```
RESUMEN DEL REFACTOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mejoras propuestas: N
  Aplicar ahora (riesgo bajo):  X
  Aplicar con cuidado (medio):  Y
  Evaluar con el equipo (alto): Z

Verificación: pasa los tests con → pytest [ruta]
```

---

## Formato de respuesta2

Modifica el código original para mejorar calidad sin cambiar comportamiento observable. Devuelve un resumen de cambios y riesgos. y firma al final del fragmento modificado con IA-Refactor-dd-mm-yy de la modificación

```



## Cómo usar esta skill

```
/refactor

Código a refactorizar:
[pegar el fichero o fragmento]

Contexto (opcional):
- Framework: Django / FastAPI / script puro / otro
- Tests disponibles: sí/no, dónde
- Restricciones del equipo: [si las hay]
```