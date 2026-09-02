const express = require('express')
const app     = express()

app.use(express.json())

// Rutas
// Las rutas se añaden aquí cuando se implementan en los ejercicios
// Ejemplo: app.use('/transactions', require('./routes/transactions'))

const PORT = process.env.PORT || 3000

// Solo arrancar el servidor si este fichero se ejecuta directamente
// (no cuando se importa en los tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}`)
  })
}

module.exports = app
