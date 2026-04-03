/**
 * order.routes.js
 * Todas las rutas de órdenes requieren autenticación.
 *
 * POST /api/orders      — checkout (crear orden desde carrito)
 * GET  /api/orders      — historial de órdenes del usuario
 * GET  /api/orders/:id  — detalle de una orden
 */

const { Router } = require('express');
const { crearOrden, misOrdenes, obtenerOrden } = require('../controllers/order.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);

router.post('/',    crearOrden);
router.get('/',     misOrdenes);
router.get('/:id',  obtenerOrden);

module.exports = router;
