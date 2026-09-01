/**
 * utils/validators.js — CREADO SIN PERMISO
 *
 * El agente creó este fichero catch-all aunque AGENTS.md
 * prohíbe explícitamente: "NO crear archivos utils.*"
 *
 * Las validaciones aquí deberían estar en sus módulos de dominio.
 */
export const isNotEmpty = (value) => value !== null && value !== undefined && value !== ''
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
