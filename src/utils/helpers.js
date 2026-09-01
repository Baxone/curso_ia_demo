/**
 * utils/helpers.js
 *
 * ERROR 4 — Este fichero no debería existir.
 * El AGENTS.md del proyecto prohíbe explícitamente ficheros catch-all:
 *   "NO crear archivos utils.*, helpers.*, misc.*, common.*"
 *
 * Las funciones deberían estar en módulos de dominio específico:
 *   formatDate → src/formatters/date.formatter.js
 *   capitalize → donde se use (inline o en el componente/servicio)
 */

/**
 * Formatea una fecha en formato ISO corto (YYYY-MM-DD).
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toISOString().split('T')[0]
}

/**
 * Capitaliza la primera letra de un string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Trunca un string a la longitud indicada añadiendo '...' si es necesario.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}
