# MCPs — Guía de referencia para alumnos

Model Context Protocol: qué es, cómo funciona, seguridad y configuración
para Claude Code, OpenCode y GitHub Copilot.

---

## Qué es MCP en una frase

MCP (Model Context Protocol) es un estándar abierto creado por Anthropic
que define cómo un agente de IA se comunica con herramientas externas —
bases de datos, APIs, sistemas de ficheros, servicios — de forma uniforme,
sin que el agente tenga que saber los detalles de cada integración.

---

## Cómo trabaja el agente con un MCP

El flujo es siempre el mismo:

```
AGENTE
  → "Necesito leer el fichero config.json"
  → llama al MCP de filesystem: read_file("config.json")

SERVIDOR MCP
  → ejecuta la operación real
  → devuelve el contenido del fichero

AGENTE
  → recibe el resultado
  → continúa razonando con esa información
```

El agente no sabe si el fichero está en local, en S3 o en Google Drive.
Solo habla con el MCP. El MCP sabe cómo acceder al recurso real.


## Los dos protocolos de conexión

### STDIO (Standard Input/Output)

El agente lanza el servidor MCP como proceso hijo.
Se comunican por stdin/stdout — texto plano en el terminal.
Abrir por ejemplo un fichero

**Cuándo se usa:**
MCPs que corren en local — filesystem, git, sqlite, bases de datos locales.

**Ejemplo en configuración:**
```json
"command": "npx",
"args": ["@modelcontextprotocol/server-filesystem", "."]
```


### HTTP + SSE (Server-Sent Events)

El servidor MCP es un servicio remoto con una URL.
El agente hace peticiones HTTP.
El servidor responde con SSE para eventos en tiempo real.


**Cuándo se usa:**
MCPs remotos — GitHub, Jira, Slack, bases de datos en la nube.

**Ejemplo en configuración:**
```json
"url": "https://mcp.github.com/sse",
"apiKey": "tu-token"
```

**Ventaja:** funciona en remoto, multi-usuario, escalable.
**Desventaja:** requiere red, autenticación y más configuración.


## Seguridad — lo más importante

### STDIO: los datos no salen de tu máquina

```
Agente → proceso local → recurso local
Todo ocurre en memoria del proceso. Nada viaja por la red.
```

El fichero `.env` que lee el MCP de filesystem nunca sale de tu máquina.
No hay logs en servidores externos. No hay tokens que interceptar.

**Riesgo principal: scope demasiado amplio.**

```json
// ❌ Peligroso — acceso a todo el sistema
"args": ["@modelcontextprotocol/server-filesystem", "/"]

// ✅ Seguro — solo el proyecto
"args": ["@modelcontextprotocol/server-filesystem", "."]
```

---

### HTTP + SSE: los datos viajan por la red

```
DATO QUE EL AGENTE ENVÍA      DÓNDE LLEGA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fragmento de código            Servidor del proveedor
Nombre de ficheros             Logs del servidor
Contenido de issues/PRs        GitHub, Jira, etc.
Queries a la BD                Servidor de BD remoto
```

**Riesgos concretos:**

**Datos en logs del proveedor** — el servidor MCP puede loguear las
peticiones. Si mandas código con credenciales hardcodeadas, ese código
puede quedar en logs externos.

**Tokens de autenticación** — si el token se filtra, un tercero tiene
acceso al servicio completo, no solo al scope del MCP.

**Datos en tránsito** — verificar siempre que la URL empieza por `https://`.
HTTP sin TLS expone el contenido en la red.

**MCP malicioso** — un MCP de terceros no verificado puede exfiltrar
el código que le mandas. Solo usar MCPs de fuentes conocidas y con
código abierto auditado.

---


### Checklist de seguridad antes de activar un MCP

```
☐ ¿Es STDIO o HTTP?
  → STDIO: revisar qué directorio tiene acceso
  → HTTP: revisar qué datos envías y quién los recibe

☐ ¿El proveedor es de confianza?
  → MCPs oficiales: Anthropic, GitHub, Atlassian
  → MCPs de terceros: leer el código fuente antes de usar

☐ ¿Qué datos van a pasar por este MCP?
  → Credenciales, PII, datos regulados → NUNCA por un MCP HTTP
    sin contrato de datos firmado con el proveedor

☐ ¿Está configurado con scope mínimo?
  → Filesystem: solo el directorio del proyecto, no "/"
  → GitHub: solo los repos necesarios
  → BD: usuario con solo SELECT si no necesitas escritura:
    GRANT SELECT ON tu_db.* TO 'agente'@'localhost';

☐ ¿Usa HTTPS?
  → Si la URL no empieza por https:// no lo uses en producción
```

## Configuración para Claude Code

Fichero: `.claude/settings.json` (proyecto) o `~/.claude/settings.json` (global)

```json
{
  "mcpServers": {

    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_tu_token_aqui"
      }
    },

    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "."]
    },

    "mysql": {
      "command": "npx",
      "args": ["-y", "@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "tu_usuario",
        "MYSQL_PASS": "tu_password",
      }
    }

  }
}
```

---

## Configuración para OpenCode

Fichero: `opencode.json` (proyecto) o `~/.config/opencode/config.json` (global)

```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "exclude": ["**/.env*"],

  "mcpServers": {

    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_tu_token_aqui"
      }
    },

    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "."]
    },

    "mysql": {
      "command": "npx",
      "args": ["-y", "@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "tu_usuario",
        "MYSQL_PASS": "tu_password",
        "MYSQL_DB":   "tu_base_de_datos"
      }
    }

  }
}
```

---

## Configuración para GitHub Copilot

Fichero: `.vscode/mcp.json` (proyecto) o VS Code Settings (global)

> ⚠️ Copilot usa `"servers"` como clave raíz.
> Claude Code y OpenCode usan `"mcpServers"`.
> Es la diferencia más frecuente que causa errores.

```json
{
  "servers": {

    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_tu_token_aqui"
      }
    },

    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "."]
    },

    "mysql": {
      "command": "npx",
      "args": ["-y", "@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "tu_usuario",
        "MYSQL_PASS": "tu_password",
        "MYSQL_DB":   "tu_base_de_datos"
      }
    }

  }
}
```

---

## Tabla de rutas de configuración

| Herramienta | Nivel proyecto | Nivel global |
|-------------|---------------|--------------|
| **Claude Code** | `.claude/settings.json` | `~/.claude/settings.json` |
| **OpenCode** | `opencode.json` | `~/.config/opencode/config.json` |
| **Copilot VS Code** | `.vscode/mcp.json` | VS Code → Settings → MCP |
| **Copilot CLI** | `.vscode/mcp.json` (lee el mismo) | `~/.config/gh/copilot/mcp.json` |

---

## Tres diferencias clave entre herramientas

```
CLAVE RAÍZ
  Claude Code → "mcpServers": { }
  OpenCode    → "mcpServers": { }
  Copilot     → "servers": { }

FICHERO
  Claude Code → .claude/settings.json
  OpenCode    → opencode.json (junto con el resto de config)
  Copilot     → .vscode/mcp.json (fichero propio)

PRIORIDAD
  Claude Code → proyecto sobreescribe global
  OpenCode    → proyecto sobreescribe global
  Copilot     → proyecto + global se fusionan
```

---

## Prerequisitos de instalación

**GitHub MCP:**
```bash
# Generar token en github.com → Settings → Developer settings
# → Personal access tokens → Fine-grained
# Permisos mínimos recomendados:
#   Contents (read)
#   Pull requests (read/write)
#   Issues (read/write)
```

**Git MCP:**
```bash
# Necesita uvx (viene con uv)
pip install uv --break-system-packages
# o en macOS:
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**MySQL MCP:**
```bash
pnpm add -g @benborla29/mcp-server-mysql

# Crear usuario con permisos mínimos en MySQL:
CREATE USER 'agente'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT ON tu_db.* TO 'agente'@'localhost';
FLUSH PRIVILEGES;
```

---

## Verificar que los MCPs están conectados

```bash
# Claude Code
claude
> /mcp

# OpenCode
opencode
> /mcp

# Copilot CLI
gh copilot
> /mcp
```

Los tres muestran el estado de conexión de cada servidor.
Si alguno aparece en rojo o no aparece, los problemas más frecuentes son:

```
1. La ruta de npx o uvx no está en el PATH
   → which npx && which uvx

2. El token de GitHub es incorrecto o ha expirado
   → Generar uno nuevo en github.com

3. MySQL no está arrancado
   → mysql.server start (macOS) o sudo systemctl start mysql (Linux)

4. Error de clave: "mcpServers" vs "servers"
   → Revisar qué clave usa cada herramienta (ver tabla arriba)
```

---

## Context7 — Documentación actualizada para librerías

Context7 es un MCP de Upstash que inyecta documentación actualizada
de librerías directamente en el contexto del agente. En lugar de que
el agente trabaje con documentación desactualizada de su entrenamiento,
Context7 le pasa la documentación real y actual de la versión que estás usando.

```
Sin Context7:
  "Usa la función X de Express"
  → el agente puede usar la API de Express 4.x cuando tú usas Express 5.x

Con Context7:
  "Usa la función X de Express"
  → Context7 inyecta la doc actual de tu versión de Express
  → el agente usa la API correcta
```

### Prerequisito — API key (opcional pero recomendado)

```bash
# Obtener API key gratuita en:
# https://context7.com/dashboard
#
# Sin API key funciona con límites de peticiones.
# Con API key tienes mayor cuota y soporte.
```

---

### Context7 en Claude Code

**Opción A — Remoto (HTTP, recomendado):**

```bash
# Instalar via comando de Claude Code
claude mcp add --scope user \
  --header "Authorization: Bearer TU_API_KEY" \
  --transport http \
  context7 https://mcp.context7.com/mcp
```

**Opción B — Local (STDIO):**

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key TU_API_KEY
```

**Opción C — Manual en `.claude/settings.json`:**

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "TU_API_KEY"]
    }
  }
}
```

---

### Context7 en OpenCode

**Opción A — Remoto (HTTP):**

Añadir a `opencode.json`:

```json
{
  "mcpServers": {
    "context7": {
      "type":    "remote",
      "url":     "https://mcp.context7.com/mcp",
      "headers": { "CONTEXT7_API_KEY": "TU_API_KEY" },
      "enabled": true
    }
  }
}
```

**Opción B — Local (STDIO):**

```json
{
  "mcpServers": {
    "context7": {
      "type":    "local",
      "command": ["npx", "-y", "@upstash/context7-mcp", "--api-key", "TU_API_KEY"],
      "enabled": true
    }
  }
}
```

---

### Context7 en GitHub Copilot (VS Code)

Añadir a `.vscode/mcp.json`:

```json
{
  "servers": {
    "context7": {
      "command": "npx",
      "args":    ["-y", "@upstash/context7-mcp", "--api-key", "TU_API_KEY"]
    }
  }
}
```

---

### Setup automático con CLI (instala en todas las herramientas)

Context7 tiene una CLI propia que detecta la herramienta y configura todo:

```bash
# Instalar CLI
npm install -g ctx7

# Setup automático — detecta qué tienes instalado
npx ctx7 setup

# O targeting una herramienta específica
npx ctx7 setup --claude      # Claude Code
npx ctx7 setup --opencode    # OpenCode

# Con API key directamente
npx ctx7 setup --api-key TU_API_KEY

# Solo para el proyecto actual (no global)
npx ctx7 setup --project

# Deshacer el setup
npx ctx7 remove
```

---

### Cómo usarlo una vez configurado

Context7 se activa mencionando la librería en el prompt:

```bash
# Claude Code
claude "usa context7 para implementar autenticación con FastAPI"
claude "cómo configuro CORS en Express 5.x"
claude "muéstrame cómo usar React Query v5"

# OpenCode / Copilot — mismo prompt, context7 actúa automáticamente
```

O de forma más explícita:

```bash
claude "usa la documentación de context7 para implementar
        un middleware de rate limiting en Express"
```

---

### Tabla actualizada de rutas de configuración

| Herramienta | Nivel proyecto | Nivel global |
|-------------|---------------|--------------|
| **Claude Code** | `.claude/settings.json` | `~/.claude/settings.json` |
| **OpenCode** | `opencode.json` | `~/.config/opencode/config.json` |
| **Copilot VS Code** | `.vscode/mcp.json` | VS Code → Settings → MCP |
| **Copilot CLI** | `.vscode/mcp.json` | `~/.config/gh/copilot/mcp.json` |
| **Context7 (todas)** | `npx ctx7 setup --project` | `npx ctx7 setup` |

---

### Diferencia STDIO vs HTTP en Context7

```
STDIO (@upstash/context7-mcp local)
  → La documentación se descarga en tu máquina
  → Algo más lento en el arranque (descarga docs)
  → Los datos de tus prompts no salen a context7.com

HTTP (https://mcp.context7.com/mcp)
  → Context7 sirve la documentación desde sus servidores
  → Más rápido — siempre actualizado
  → Tu prompt viaja a los servidores de Context7
  → Requiere HTTPS (✅ ya lo usa por defecto)
```

Para proyectos con código propietario o datos sensibles:
usar **STDIO** (opción local) para que los prompts no salgan de tu máquina.
