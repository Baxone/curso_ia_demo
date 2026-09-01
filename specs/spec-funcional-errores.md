# Objetivo 

El sistema debe permitir al usuario exportar sus datos en CSV.
Se usará la librería SheetJS para generar el archivo.
El botón de exportación estará en la esquina superior derecha con el icono
de descarga estándar.
El CSV debe incluir headers y usar punto y coma como separador para
compatibilidad con Excel en español.

*Errores: "SheetJS" es técnico, "esquina superior derecha" es ambiguo*

# Registro y confirmación:

Cuando un usuario se registra, se debe enviar un email de confirmación.
El email se envía a través de SendGrid usando la plantilla ID T-123.
El enlace de confirmación expira en 24 horas.
Si el usuario no confirma en ese plazo, su cuenta queda en estado
pendiente durante 7 días y luego se elimina automáticamente.

*Errores: "SendGrid" + "plantilla T-123" son técnicos*

# Dashboard de métricas (para demo en vivo)

El dashboard debe mostrar métricas en tiempo real.
Se usará WebSocket para las actualizaciones.
Las métricas incluyen: usuarios activos, transacciones por minuto
y tiempo de respuesta medio.
Los datos se refrescan cada 5 segundos.
Se debe usar Chart.js para las gráficas.

*Errores: "WebSocket" y "Chart.js" son técnicos. El agente instalará ambas librerías sin cuestionar.*