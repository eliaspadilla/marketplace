/**
 * cart.routes.js
 * Todas las rutas del carrito requieren autenticación.
 *
 * GET    /api/cart             — ver carrito
 * POST   /api/cart             — agregar item
 * PUT    /api/cart/:productId  — actualizar cantidad
 * DELETE /api/cart/:productId  — quitar item
 * DELETE /api/cart             — vaciar carrito
 */

const { Router } = require('express');
const {
  verCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
} = require('../controllers/cart.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

// Todas requieren token — aplicar una vez al router completo
router.use(verificarToken);

router.get('/',               verCarrito);
router.post('/',              agregarAlCarrito);
router.put('/:productId',     actualizarCantidad);
router.delete('/:productId',  eliminarDelCarrito);
router.delete('/',            vaciarCarrito);

module.exports = router;
