/**
 * order.controller.js
 * Checkout simulado: convierte el carrito en una orden y limpia el carrito.
 *
 * POST /api/orders        — crear orden desde el carrito actual
 * GET  /api/orders        — historial de órdenes del usuario
 * GET  /api/orders/:id    — detalle de una orden específica
 */

const prisma = require('../lib/prisma');

/**
 * POST /api/orders
 * Flujo del checkout:
 *  1. Leer items del carrito del usuario
 *  2. Verificar que hay items y que hay stock suficiente
 *  3. Crear la Order y sus OrderItems en una transacción
 *  4. Descontar stock de cada producto
 *  5. Vaciar el carrito
 */
async function crearOrden(req, res) {
  const userId = req.user.id;

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  if (items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  // Verificar stock de todos los items antes de procesar
  for (const item of items) {
    if (item.cantidad > item.product.stock) {
      return res.status(400).json({
        error: `Stock insuficiente para "${item.product.nombre}". Disponible: ${item.product.stock}`,
      });
    }
  }

  const total = items.reduce(
    (acc, item) => acc + item.product.precio * item.cantidad,
    0
  );

  // Transacción: todo ocurre o nada ocurre
  const orden = await prisma.$transaction(async (tx) => {
    // Crear la orden
    const nuevaOrden = await tx.order.create({
      data: {
        userId,
        total: parseFloat(total.toFixed(2)),
        estado: 'PENDIENTE',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            cantidad: item.cantidad,
            precioUnitario: item.product.precio,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    // Descontar stock de cada producto
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    // Vaciar el carrito
    await tx.cartItem.deleteMany({ where: { userId } });

    return nuevaOrden;
  });

  return res.status(201).json({ orden });
}

/**
 * GET /api/orders
 * Devuelve el historial de órdenes del usuario autenticado.
 */
async function misOrdenes(req, res) {
  const ordenes = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, nombre: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ ordenes });
}

/**
 * GET /api/orders/:id
 * Detalle de una orden. Solo el dueño puede verla.
 */
async function obtenerOrden(req, res) {
  const id = parseInt(req.params.id);

  const orden = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, nombre: true, imageUrl: true } },
        },
      },
    },
  });

  if (!orden) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }

  if (orden.userId !== req.user.id) {
    return res.status(403).json({ error: 'No tienes acceso a esta orden' });
  }

  return res.json({ orden });
}

module.exports = { crearOrden, misOrdenes, obtenerOrden };
