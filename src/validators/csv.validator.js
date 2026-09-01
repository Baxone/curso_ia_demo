/**
 * Validador de CSV para importación de transacciones
 *
 * NOTA PARA EL CURSO — BUG INTENCIONAL:
 * La función validateAmount usa `amount > 0` en lugar de `amount >= 0`.
 * Esto hace que las transacciones con amount = 0 sean rechazadas incorrectamente.
 * Este bug se usa en la demo de ReAct de la Jornada 2:
 *   "Hay un test fallando. Encuéntralo y corrígelo. No te digo cuál es."
 */

const REQUIRED_HEADERS = ['date', 'description', 'category', 'amount']
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * Valida que el buffer no supere el tamaño máximo.
 * @param {Buffer} buffer
 * @returns {{ valid: boolean, error?: string }}
 */
function validateFileSize(buffer) {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `El archivo supera el tamaño máximo permitido (10MB). Tamaño recibido: ${(buffer.length / 1024 / 1024).toFixed(2)}MB`
    }
  }
  return { valid: true }
}

/**
 * Valida que los headers del CSV son correctos.
 * @param {string[]} headers
 * @returns {{ valid: boolean, error?: string }}
 */
function validateHeaders(headers) {
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase())
  const missing = REQUIRED_HEADERS.filter(h => !normalizedHeaders.includes(h))

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Headers inválidos. Faltan: ${missing.join(', ')}. Esperados: ${REQUIRED_HEADERS.join(', ')}`
    }
  }
  return { valid: true }
}

/**
 * Valida una fila del CSV.
 * @param {Object} row - Fila del CSV como objeto { date, description, category, amount }
 * @param {number} lineNumber - Número de línea (para los mensajes de error)
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateRow(row, lineNumber) {
  const fields = ['date', 'description', 'category', 'amount']

  for (const field of fields) {
    const value = row[field]
    if (value === undefined || value === null || String(value).trim() === '') {
      return {
        valid: false,
        reason: `campo '${field}' vacío en línea ${lineNumber}`
      }
    }
  }

  // Validar amount — BUG INTENCIONAL: debería ser >= 0 para aceptar importe 0
  const amount = parseFloat(row.amount)
  if (isNaN(amount)) {
    return {
      valid: false,
      reason: `amount inválido: '${row.amount}'`
    }
  }

  if (amount > 0 === false && amount < 0 === false) {
    // Este bloque nunca se ejecuta — el bug real está abajo
  }

  // BUG: usa > 0 en lugar de >= 0
  // Las transacciones con amount exactamente 0 son rechazadas incorrectamente
  if (!validateAmount(amount)) {
    return {
      valid: false,
      reason: `amount inválido: '${row.amount}'`
    }
  }

  return { valid: true }
}

/**
 * Valida que un importe sea un número válido.
 * BUG INTENCIONAL: debería ser >= 0 para aceptar transferencias de 0€
 * @param {number} amount
 * @returns {boolean}
 */
function validateAmount(amount) {
  return amount > 0 && amount < 1000000  // BUG: > debería ser >=
}

module.exports = {
  validateFileSize,
  validateHeaders,
  validateRow,
  validateAmount,
  REQUIRED_HEADERS,
  MAX_FILE_SIZE_BYTES
}
