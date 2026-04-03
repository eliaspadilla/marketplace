/**
 * cart.controller.js
 * Gestión del carrito de compras del usuario autenticado.
 *
 * GET    /api/cart             — ver carrito con total calculado
 * POST   /api/cart             — agregar producto (o sumar cantidad si ya existe)
 * PUT    /api/cart/:productId  — cambiar cantidad de un item
 * DELETE /api/cart/:productId  — quitar un item del carrito
 * DELETE /api/cart             — vaciar carrito completo
 */

const prisma = require('../lib/prisma');

/**
 * GET /api/cart
 * Devuelve todos los items del carrito con datos del producto y total.
 */
async function verCarrito(req, res) {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        select: { id: true, nombre: true, precio: true, imageUrl: true, stock: true },
      },
    },
  });

  const total = items.reduce(
    (acc, item) => acc + item.product.precio * item.cantidad,
    0
  );

  return res.json({ items, total: parseFloat(total.toFixed(2)) });
}

/**
 * POST /api/cart
 * Body: { productId, cantidad? }
 *
 * Si el producto ya está en el carrito, suma la cantidad.
 * Valida que la cantidad no supere el stock disponible.
 */
async function agregarAlCarrito(req, res) {
  const { productId, cantidad = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId es requerido' });
  }

  const cantidadNum = parseInt(cantidad);
  if (cantidadNum < 1) {
    return res.status(400).json({ error: 'La cantidad debe ser al menos 1' });
  }

  // Verificar que el producto existe y tiene stock
  const producto = await prisma.product.findUnique({ where: { id: parseInt(productId) } });

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Verificar si el item ya está en el carrito
  const itemExistente = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId: parseInt(productId) } },
  });

  const cantidadFinal = itemExistente
    ? itemExistente.cantidad + cantidadNum
    : cantidadNum;

  if (cantidadFinal > producto.stock) {
    return res.status(400).json({
      error: `Stock insuficiente. Disponible: ${producto.stock}`,
    });
  }

  // upsert: crea el item o actualiza la cantidad si ya existe
  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId: parseInt(productId) } },
    update: { cantidad: cantidadFinal },
    create: { userId: req.user.id, productId: parseInt(productId), cantidad: cantidadNum },
    include: {
      product: { select: { id: true, nombre: true, precio: true } },
    },
  });

  return res.status(201).json({ item });
}

/**
 * PUT /api/cart/:productId
 * Body: { cantidad }
 *
 * Actualiza la cantidad de un item específico.
 * Si cantidad = 0, elimina el item.
 */
async function actualizarCantidad(req, res) {
  const productId = parseInt(req.params.productId);
  const { cantidad } = req.body;

  if (cantidad === undefined) {
    return res.status(400).json({ error: 'cantidad es requerida' });
  }

  const cantidadNum = parseInt(cantidad);

  // Si cantidad llega a 0, eliminar el item directamente
  if (cantidadNum === 0) {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id, productId },
    });
    return res.json({ mensaje: 'Item eliminado del carrito' });
  }

  if (cantidadNum < 1) {
    return res.status(400).json({ error: 'La cantidad debe ser al menos 1' });
  }

  // Verificar stock
  const producto = await prisma.product.findUnique({ where: { id: productId } });
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  if (cantidadNum > producto.stock) {
    return res.status(400).json({
      error: `Stock insuficiente. Disponible: ${producto.stock}`,
    });
  }

  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId: req.user.id, productId } },
    data: { cantidad: cantidadNum },
    include: {
      product: { select: { id: true, nombre: true, precio: true } },
    },
  });

  return res.json({ item });
}

/**
 * DELETE /api/cart/:productId
 * Elimina un producto específico del carrito.
 */
async function eliminarDelCarrito(req, res) {
  const productId = parseInt(req.params.productId);

  const item = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId } },
  });

  if (!item) {
    return res.status(404).json({ error: 'El producto no está en tu carrito' });
  }

  await prisma.cartItem.delete({
    where: { userId_productId: { userId: req.user.id, productId } },
  });

  return res.json({ mensaje: 'Producto eliminado del carrito' });
}

/**
 * DELETE /api/cart
 * Vacía todo el carrito del usuario autenticado.
 */
async function vaciarCarrito(req, res) {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  return res.json({ mensaje: 'Carrito vaciado' });
}

module.exports = {
  verCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
};
