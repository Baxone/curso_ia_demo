/**
 * UserController — búsqueda y gestión de usuarios
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  FICHERO PARA EL EJERCICIO 4.2 — PR REVIEW (JORNADA 3)      ║
 * ║                                                              ║
 * ║  Este fichero contiene 6 errores intencionados:              ║
 * ║                                                              ║
 * ║  ERROR 1 — Bug funcional                                     ║
 * ║    u.active > 0  →  debería ser  u.active === true           ║
 * ║    Causa: usuarios con active=1 (integer) son filtrados mal  ║
 * ║                                                              ║
 * ║  ERROR 2 — SQL Injection                                     ║
 * ║    Interpolación directa de ${query} y ${role} en SQL        ║
 * ║    Un atacante puede inyectar: ' OR '1'='1                   ║
 * ║                                                              ║
 * ║  ERROR 3 — Code smell                                        ║
 * ║    processUserData() — 178 líneas, 6 niveles de anidamiento  ║
 * ║    Mezcla perfil, órdenes, pagos, preferencias y notific.    ║
 * ║                                                              ║
 * ║  ERROR 4 — Inconsistencia con AGENTS.md                      ║
 * ║    import desde 'utils/helpers' → AGENTS.md prohíbe          ║
 * ║    ficheros catch-all (utils.*, helpers.*, etc.)             ║
 * ║                                                              ║
 * ║  ERROR 5 — Test engañoso (en user.test.js)                   ║
 * ║    'should validate email format' solo comprueba que         ║
 * ║    el campo no esté vacío, no que el formato sea válido      ║
 * ║                                                              ║
 * ║  ERROR 6 — Dependencia innecesaria                           ║
 * ║    import _ from 'lodash' solo para _.get()                  ║
 * ║    Reemplazable por: users?.data ?? active                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import _ from 'lodash'                          // ERROR 6: lodash innecesario
import { formatDate } from '../utils/helpers'   // ERROR 4: import de catch-all prohibido

export class UserController {

  /**
   * GET /users/search
   * Busca usuarios por nombre y rol.
   */
  async searchUsers(req, res) {
    const query = req.query.q
    const role  = req.query.role

    // ERROR 2: SQL INJECTION — los parámetros se interpolan directamente
    // Un atacante puede enviar: q=' OR '1'='1&role=admin
    const sql = `
      SELECT id, name, email, role, active, created_at
      FROM users
      WHERE name LIKE '%${query}%'
      AND   role = '${role}'
    `

    const users = await this.db.query(sql)

    // ERROR 1: BUG FUNCIONAL
    // u.active viene como boolean de la BD — la comparación > 0 falla
    // con valores false/true. Debería ser: u.active === true
    const active = users.filter(u => u.active > 0)

    // ERROR 6 (uso): _.get() reemplazable por optional chaining + nullish
    // Corrección: const result = users?.data ?? active
    const result = _.get(users, 'data', active)

    return res.json({
      users: result,
      total: result.length
    })
  }

  /**
   * GET /users/:id/profile
   * Devuelve el perfil completo del usuario.
   *
   * ERROR 3: FUNCIÓN DE 178 LÍNEAS — mezcla demasiadas responsabilidades.
   * Debería dividirse en: ProfileService, OrderService, PaymentService,
   * NotificationService, AnalyticsService.
   */
  async processUserData(userId) {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new Error('User not found')

    // Bloque 1: Perfil básico (20 líneas)
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      status: user.status,
      preferences: user.preferences || {},
      avatar: user.avatarUrl || null,
      timezone: user.timezone || 'UTC'
    }

    // Bloque 2: Órdenes (35 líneas)
    const orders = await this.orderRepo.findByUser(userId)
    let orderSummary = {}
    if (orders && orders.length > 0) {
      const completed = orders.filter(o => o.status === 'completed')
      const pending   = orders.filter(o => o.status === 'pending')
      const cancelled = orders.filter(o => o.status === 'cancelled')
      orderSummary = {
        total: orders.length,
        completed: completed.length,
        pending: pending.length,
        cancelled: cancelled.length,
        totalSpent: completed.reduce((sum, o) => {
          if (o.amount && typeof o.amount === 'number') {
            return sum + o.amount
          }
          return sum
        }, 0),
        lastOrder: completed.length > 0
          ? completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : null,
        averageOrderValue: completed.length > 0
          ? completed.reduce((s, o) => s + o.amount, 0) / completed.length
          : 0
      }
    }

    // Bloque 3: Pagos (30 líneas)
    const payments = await this.paymentRepo.findByUser(userId)
    let paymentSummary = {}
    if (payments && payments.length > 0) {
      const successful = payments.filter(p => p.status === 'success')
      const failed     = payments.filter(p => p.status === 'failed')
      paymentSummary = {
        total: payments.length,
        successful: successful.length,
        failed: failed.length,
        totalCharged: successful.reduce((sum, p) => sum + (p.amount || 0), 0),
        defaultMethod: payments.find(p => p.isDefault) || null,
        lastPayment: successful.length > 0
          ? successful.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : null
      }
    }

    // Bloque 4: Preferencias y notificaciones (28 líneas)
    const notifPrefs = await this.notifRepo.findByUser(userId)
    let notificationConfig = {
      email: true,
      push: false,
      inApp: true,
      frequency: 'daily'
    }
    if (notifPrefs) {
      notificationConfig = {
        email: notifPrefs.emailEnabled !== false,
        push: notifPrefs.pushEnabled === true,
        inApp: notifPrefs.inAppEnabled !== false,
        frequency: notifPrefs.frequency || 'daily',
        quietHoursStart: notifPrefs.quietHoursStart || null,
        quietHoursEnd: notifPrefs.quietHoursEnd || null
      }
    }

    // Bloque 5: Analytics (25 líneas)
    const loginHistory = await this.analyticsRepo.getLoginHistory(userId, 30)
    const pageViews    = await this.analyticsRepo.getPageViews(userId, 30)
    const analytics = {
      loginsLast30Days: loginHistory ? loginHistory.length : 0,
      lastLogin: loginHistory && loginHistory.length > 0
        ? loginHistory[0].timestamp
        : null,
      pageViewsLast30Days: pageViews ? pageViews.length : 0,
      mostVisitedSection: pageViews && pageViews.length > 0
        ? pageViews.reduce((acc, pv) => {
            acc[pv.section] = (acc[pv.section] || 0) + 1
            return acc
          }, {})
        : {},
      daysSinceRegistration: Math.floor(
        (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
      )
    }

    // Bloque 6: Caché y respuesta final (20 líneas)
    const cacheKey = `user-profile-${userId}`
    const ttl = 300

    const result = {
      profile,
      orders: orderSummary,
      payments: paymentSummary,
      notifications: notificationConfig,
      analytics,
      generatedAt: new Date().toISOString()
    }

    if (this.cache) {
      await this.cache.set(cacheKey, result, ttl)
    }

    return result
  }
}
