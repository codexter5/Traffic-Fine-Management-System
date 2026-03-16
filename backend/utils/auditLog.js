const AuditLog = require('../models/AuditLog');

async function createAuditLog(req, payload) {
  try {
    await AuditLog.create({
      actorId: req.user?.id,
      actorName: req.user?.name || undefined,
      actorRole: req.user?.role,
      action: payload.action,
      fineId: payload.fineId,
      paymentId: payload.paymentId,
      details: payload.details,
      metadata: payload.metadata,
    });
  } catch (_) {
    // Audit logging must not break primary request flow.
  }
}

module.exports = { createAuditLog };
