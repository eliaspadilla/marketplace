/**
 * stats.controller.js
 * Estadísticas e informes para el vendedor autenticado.
 *
 * GET /api/stats/vendor
 * Devuelve resumen general, stats por producto y órdenes de los últimos 7 días,
 * calculados únicamente sobre los productos del vendedor logueado.
 */

const prisma = require('../lib/prisma');

async function estadisticasVendedor(req, res) {
  const userId = req.user.id;

  // Productos del vendedor con su stock actual
  const productos = await prisma.product.findMany({
    where: { vendedorId: userId },
    select: { id: true, nombre: true, stock: true },
  });

  const productIds = productos.map((p) => p.id);

  // Respuesta vacía si aún no tiene productos
  if (productIds.length === 0) {
    return res.json({
      resumen:      { ingresos: 0, ordenes: 0, unidadesVendidas: 0, productoMasVendido: null },
      porProducto:  [],
      ultimaSemana: [],
    });
  }

  // Todos los OrderItems de productos del vendedor
  const items = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: {
      order:   { select: { id: true, createdAt: true } },
      product: { select: { id: true, nombre: true } },
    },
  });

  // ── Resumen general ────────────────────────────────────────────────────────
  const ingresos        = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const ordenesIds      = new Set(items.map((i) => i.orderId));
  const unidadesVendidas = items.reduce((s, i) => s + i.cantidad, 0);

  // ── Stats por producto ─────────────────────────────────────────────────────
  const statsMap = {};
  for (const p of productos) {
    statsMap[p.id] = { id: p.id, nombre: p.nombre, stock: p.stock, unidades: 0, ingresos: 0 };
  }
  for (const item of items) {
    statsMap[item.productId].unidades += item.cantidad;
    statsMap[item.productId].ingresos += item.precioUnitario * item.cantidad;
  }
  const porProducto = Object.values(statsMap).sort((a, b) => b.unidades - a.unidades);

  const productoMasVendido = porProducto[0]?.unidades > 0
    ? { nombre: porProducto[0].nombre, unidades: porProducto[0].unidades }
    : null;

  // ── Órdenes últimos 7 días ────────────────────────────────────────────────
  const hace7dias = new Date();
  hace7dias.setDate(hace7dias.getDate() - 7);

  const ordenesRecientes = {};
  for (const item of items) {
    if (new Date(item.order.createdAt) >= hace7dias) {
      if (!ordenesRecientes[item.orderId]) {
        ordenesRecientes[item.orderId] = { id: item.orderId, fecha: item.order.createdAt, monto: 0 };
      }
      ordenesRecientes[item.orderId].monto += item.precioUnitario * item.cantidad;
    }
  }
  const ultimaSemana = Object.values(ordenesRecientes)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return res.json({
    resumen: {
      ingresos:         parseFloat(ingresos.toFixed(2)),
      ordenes:          ordenesIds.size,
      unidadesVendidas,
      productoMasVendido,
    },
    porProducto: porProducto.map((p) => ({ ...p, ingresos: parseFloat(p.ingresos.toFixed(2)) })),
    ultimaSemana,
  });
}

module.exports = { estadisticasVendedor };
