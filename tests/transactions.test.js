/**
 * Tests base del proyecto de demo
 *
 * NOTA PARA EL CURSO:
 *
 * test_ca_email_mandatory — se usará en el Ejercicio 3.3 (Cambio mid-flight, J2).
 * Cuando el campo email pase a ser opcional, este test fallará y habrá que actualizarlo.
 *
 * test_react_bug — falla intencionalmente (amount = 0 debería ser válido).
 * Se usa en la demo de ReAct de la Jornada 2:
 * "Hay un test fallando. Encuéntralo y corrígelo."
 */

const { createTransaction } = require('../src/models/transaction')
const { validateRow, validateAmount, validateHeaders, validateFileSize } = require('../src/validators/csv.validator')

// ─── TESTS DE MODELO ──────────────────────────────────────────

describe('Transaction model', () => {

  test('crea transacción con datos válidos', () => {
    const tx = createTransaction({
      date: '2026-01-15',
      description: 'Compra supermercado',
      category: 'Alimentación',
      amount: 45.50,
      email: 'user@example.com'
    })
    expect(tx).toHaveProperty('id')
    expect(tx.amount).toBe(45.50)
    expect(tx.email).toBe('user@example.com')
  })

  // ESTE TEST FALLARÁ en el Ejercicio 3.3 cuando email sea opcional
  test('test_ca_email_mandatory — email es obligatorio', () => {
    const dataWithoutEmail = {
      date: '2026-01-15',
      description: 'Compra',
      category: 'Shopping',
      amount: 50.00
      // email ausente intencionalmente
    }
    expect(() => createTransaction(dataWithoutEmail)).toThrow('email is required')
  })

  test('email con formato inválido lanza error', () => {
    expect(() => createTransaction({
      date: '2026-01-15',
      description: 'Test',
      category: 'Test',
      amount: 10,
      email: 'no-es-un-email'
    })).toThrow('email format is invalid')
  })

  test('amount no numérico lanza error', () => {
    expect(() => createTransaction({
      date: '2026-01-15',
      description: 'Test',
      category: 'Test',
      amount: 'no-es-numero',
      email: 'user@example.com'
    })).toThrow('amount must be a number')
  })

})

// ─── TESTS DE VALIDADOR CSV ───────────────────────────────────

describe('CSV validator — validateHeaders', () => {

  test('headers válidos pasan la validación', () => {
    const result = validateHeaders(['date', 'description', 'category', 'amount'])
    expect(result.valid).toBe(true)
  })

  test('headers con mayúsculas y espacios son aceptados', () => {
    const result = validateHeaders(['Date ', 'DESCRIPTION', 'Category', 'Amount'])
    expect(result.valid).toBe(true)
  })

  test('headers con campo faltante fallan', () => {
    const result = validateHeaders(['date', 'description', 'amount'])
    expect(result.valid).toBe(false)
    expect(result.error).toContain('category')
  })

})

describe('CSV validator — validateRow', () => {

  test('fila válida pasa la validación', () => {
    const row = { date: '2026-01-15', description: 'Test', category: 'Shopping', amount: '25.50' }
    expect(validateRow(row, 1).valid).toBe(true)
  })

  test('campo vacío es rechazado con motivo', () => {
    const row = { date: '2026-01-15', description: '', category: 'Shopping', amount: '25.50' }
    const result = validateRow(row, 3)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('description')
    expect(result.reason).toContain('línea 3')
  })

  test('amount no numérico es rechazado', () => {
    const row = { date: '2026-01-15', description: 'Test', category: 'Shopping', amount: 'abc' }
    const result = validateRow(row, 5)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('amount inválido')
  })

})

describe('CSV validator — validateAmount', () => {

  test('amount positivo es válido', () => {
    expect(validateAmount(100)).toBe(true)
    expect(validateAmount(0.01)).toBe(true)
  })

  test('amount negativo es inválido', () => {
    expect(validateAmount(-5)).toBe(false)
  })

  // ESTE TEST FALLA INTENCIONALMENTE — se usa en la demo de ReAct (J2)
  // El validador usa `amount > 0` en lugar de `amount >= 0`
  // Una transferencia de 0€ debería ser válida
  test('test_react_bug — amount de 0 debería ser válido (transferencia de 0€)', () => {
    expect(validateAmount(0)).toBe(true)  // FALLA: validateAmount devuelve false para 0
  })

})

describe('CSV validator — validateFileSize', () => {

  test('archivo dentro del límite pasa la validación', () => {
    const smallBuffer = Buffer.alloc(1024) // 1KB
    expect(validateFileSize(smallBuffer).valid).toBe(true)
  })

  test('archivo que supera 10MB falla', () => {
    const bigBuffer = Buffer.alloc(11 * 1024 * 1024) // 11MB
    const result = validateFileSize(bigBuffer)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('10MB')
  })

})
