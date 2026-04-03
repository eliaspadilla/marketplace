/**
 * prisma.js — Instancia singleton del cliente Prisma.
 *
 * En desarrollo, el hot-reload de nodemon puede crear múltiples instancias
 * del cliente si se importa directamente en cada módulo. Este patrón guarda
 * la instancia en `global` para reutilizarla entre recargas.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;
