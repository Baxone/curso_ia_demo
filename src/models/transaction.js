/**
 * Modelo de Transacción
 *
 * NOTA PARA EL CURSO:
 * El campo `email` es OBLIGATORIO en este modelo base.
 * En el Ejercicio 3.3 (Cambio mid-flight, Jornada 2) lo cambiaremos
 * a opcional y añadiremos generación de identificador temporal.
 */

const { v4: uuidv4 } = require('uuid')

/**
 * Crea una nueva transacción validando los campos obligatorios.
 * @param {Object} data - Datos de la transacción
 * @returns {Object} Transacción creada
 * @throws {Error} Si algún campo obligatorio falta o es inválido
 */
function createTransaction(data) {
  const { date, description, category, amount, email } = data

  // Validaciones — campo email OBLIGATORIO (cambiará en Ejercicio 3.3)
  if (!date) throw new Error('date is required')
  if (!description) throw new Error('description is required')
  if (!category) throw new Error('category is required')
  if (amount === undefined || amount === null) throw new Error('amount is required')
  if (!email) throw new Error('email is required')
  if (!isValidEmail(email)) throw new Error('email format is invalid')

  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount)) throw new Error(`amount must be a number, got: ${amount}`)

  return {
    id: uuidv4(),
    date: new Date(date).toISOString(),
    description: String(description).trim(),
    category: String(category).trim(),
    amount: Math.round(parsedAmount * 100) / 100,
    email: String(email).trim().toLowerCase(),
    createdAt: new Date().toISOString()
  }
}

/**
 * Valida el formato de un email.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(String(email))
}

module.exports = { createTransaction, isValidEmail }

/**
 * Campo añadido en demo/agente-se-paso
 * Cambio SOLICITADO: campo phone (opcional)
 */
// phone: String (opcional) — añadido por el agente
