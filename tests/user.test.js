/**
 * tests/user.test.js — Tests del módulo de usuarios
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  FICHERO PARA EL EJERCICIO 4.2 — PR REVIEW (JORNADA 3)      ║
 * ║                                                              ║
 * ║  ERROR 5 — TEST ENGAÑOSO                                     ║
 * ║    El test 'should validate email format' tiene un nombre    ║
 * ║    que promete validar el FORMAT del email, pero el código   ║
 * ║    solo comprueba que el campo no esté vacío.                ║
 * ║                                                              ║
 * ║    Resultado: el test PASA con 'not-an-email' (string        ║
 * ║    sin @ ni dominio) porque no está vacío. Cualquier         ║
 * ║    implementación que acepte strings no vacíos pasará        ║
 * ║    el test, aunque no valide el formato del email.           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const request = require('supertest')
const app     = require('../src/index')

describe('User API — búsqueda', () => {

  test('GET /users/search — devuelve usuarios activos', async () => {
    const res = await request(app)
      .get('/users/search')
      .query({ q: 'maria', role: 'user' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('users')
    expect(Array.isArray(res.body.users)).toBe(true)
  })

  test('GET /users/search — sin parámetros devuelve todos', async () => {
    const res = await request(app)
      .get('/users/search')
      .query({})

    expect(res.status).toBe(200)
  })

})

describe('User API — registro', () => {

  test('POST /users — crea usuario con datos válidos', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
  })

  // ERROR 5: TEST ENGAÑOSO
  // El nombre promete validar el FORMATO del email.
  // El test solo comprueba que el campo no esté vacío (status 400 por campo vacío).
  // Un email como 'not-an-email' pasará este test aunque no tenga @ ni dominio,
  // porque devuelve 400 por otra razón (o 201 si la validación es laxa).
  // El nombre correcto sería: 'should reject empty email field'
  test('should validate email format', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'Test',
        email: 'not-empty',   // ← string no vacío pero formato incorrecto
        role: 'user'
      })

    // Este expect pasa porque el status no es 201,
    // pero por razones distintas al formato del email
    expect(res.status).toBe(400)
  })

  test('POST /users — falla sin nombre', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'test@example.com' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message')
  })

})
