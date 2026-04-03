/**
 * product.routes.js
 *
 * GET    /api/products              — público
 * GET    /api/products/mis-productos — vendedor autenticado
 * GET    /api/products/:id          — público
 * POST   /api/products              — solo VENDEDOR
 * PUT    /api/products/:id          — solo VENDEDOR (dueño)
 * DELETE /api/products/:id          — solo VENDEDOR (dueño)
 */

const { Router } = require('express');
const {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  misProductos,
} = require('../controllers/product.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { soloVendedor } = require('../middlewares/role.middleware');

const router = Router();

// Rutas públicas
router.get('/',   listarProductos);

// Ruta privada de vendedor — debe ir ANTES de /:id para que no lo capture
router.get('/mis-productos', verificarToken, soloVendedor, misProductos);

// Ruta pública de detalle
router.get('/:id', obtenerProducto);

// Rutas protegidas (solo VENDEDOR)
router.post('/',    verificarToken, soloVendedor, crearProducto);
router.put('/:id',  verificarToken, soloVendedor, actualizarProducto);
router.delete('/:id', verificarToken, soloVendedor, eliminarProducto);

module.exports = router;
