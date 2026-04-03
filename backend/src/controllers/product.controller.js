/**
 * product.controller.js
 * CRUD de productos. Las rutas de escritura requieren rol VENDEDOR.
 *
 * GET    /api/products        — público, lista todos los productos
 * GET    /api/products/:id    — público, detalle de un producto
 * POST   /api/products        — vendedor, crear producto
 * PUT    /api/products/:id    — vendedor, editar su propio producto
 * DELETE /api/products/:id    — vendedor, eliminar su propio producto
 */

const prisma = require('../lib/prisma');

// ── Lectura (pública) ─────────────────────────────────────────────────────────

/**
 * GET /api/products
 * Devuelve todos los productos con datos básicos del vendedor.
 * Acepta ?search=texto para filtrar por nombre.
 */
async function listarProductos(req, res) {
  const { search } = req.query;

  const productos = await prisma.product.findMany({
    where: search
      ? { nombre: { contains: search, mode: 'insensitive' } }
      : undefined,
    include: {
      vendedor: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ productos });
}

/**
 * GET /api/products/:id
 * Devuelve el detalle completo de un producto.
 */
async function obtenerProducto(req, res) {
  const id = parseInt(req.params.id);

  const producto = await prisma.product.findUnique({
    where: { id },
    include: {
      vendedor: { select: { id: true, nombre: true } },
    },
  });

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  return res.json({ producto });
}

// ── Escritura (solo VENDEDOR) ─────────────────────────────────────────────────

/**
 * POST /api/products
 * Crea un nuevo producto asociado al vendedor autenticado.
 * Body: { nombre, descripcion, precio, stock, imageUrl? }
 */
async function crearProducto(req, res) {
  const { nombre, descripcion, precio, stock, imageUrl } = req.body;

  if (!nombre || !descripcion || precio === undefined || stock === undefined) {
    return res.status(400).json({
      error: 'nombre, descripcion, precio y stock son requeridos',
    });
  }

  if (precio < 0 || stock < 0) {
    return res.status(400).json({ error: 'precio y stock deben ser >= 0' });
  }

  const producto = await prisma.product.create({
    data: {
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: parseInt(stock),
      imageUrl: imageUrl || null,
      vendedorId: req.user.id, // inyectado por verificarToken
    },
  });

  return res.status(201).json({ producto });
}

/**
 * PUT /api/products/:id
 * Actualiza un producto. Solo el vendedor dueño puede editarlo.
 * Body: campos a actualizar (todos opcionales)
 */
async function actualizarProducto(req, res) {
  const id = parseInt(req.params.id);

  const producto = await prisma.product.findUnique({ where: { id } });

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Verificar que el producto pertenece al vendedor autenticado
  if (producto.vendedorId !== req.user.id) {
    return res.status(403).json({ error: 'No puedes editar productos de otro vendedor' });
  }

  const { nombre, descripcion, precio, stock, imageUrl } = req.body;

  const actualizado = await prisma.product.update({
    where: { id },
    data: {
      ...(nombre      !== undefined && { nombre }),
      ...(descripcion !== undefined && { descripcion }),
      ...(precio      !== undefined && { precio: parseFloat(precio) }),
      ...(stock       !== undefined && { stock: parseInt(stock) }),
      ...(imageUrl    !== undefined && { imageUrl }),
    },
  });

  return res.json({ producto: actualizado });
}

/**
 * DELETE /api/products/:id
 * Elimina un producto. Solo el vendedor dueño puede borrarlo.
 * También elimina los CartItems que referencian este producto.
 */
async function eliminarProducto(req, res) {
  const id = parseInt(req.params.id);

  const producto = await prisma.product.findUnique({ where: { id } });

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  if (producto.vendedorId !== req.user.id) {
    return res.status(403).json({ error: 'No puedes eliminar productos de otro vendedor' });
  }

  // Eliminar referencias en carrito antes de borrar el producto
  await prisma.cartItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  return res.json({ mensaje: 'Producto eliminado correctamente' });
}

/**
 * GET /api/products/mis-productos
 * Devuelve solo los productos del vendedor autenticado (para su panel).
 */
async function misProductos(req, res) {
  const productos = await prisma.product.findMany({
    where: { vendedorId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ productos });
}

module.exports = {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  misProductos,
};
