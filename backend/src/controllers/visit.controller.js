/**
 * visit.controller.js
 * Contador global de visitas almacenado en Neon (fila única id = 1).
 *
 * POST /api/visits  — registra una visita, devuelve el nuevo total
 * GET  /api/visits  — devuelve el total actual sin incrementar
 */

const prisma = require('../lib/prisma');

async function registrarVisita(req, res) {
  const counter = await prisma.visitCounter.upsert({
    where:  { id: 1 },
    create: { id: 1, count: 1 },
    update: { count: { increment: 1 } },
  });
  return res.json({ count: counter.count });
}

async function obtenerVisitas(req, res) {
  const counter = await prisma.visitCounter.findUnique({ where: { id: 1 } });
  return res.json({ count: counter?.count ?? 0 });
}

module.exports = { registrarVisita, obtenerVisitas };
