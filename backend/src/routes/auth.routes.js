/**
 * auth.routes.js
 *
 * POST /api/auth/register  — Crear cuenta nueva
 * POST /api/auth/login     — Iniciar sesión
 * GET  /api/auth/me        — Obtener usuario autenticado (requiere token)
 */

const { Router } = require('express');
const { register, login, me } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        verificarToken, me);

module.exports = router;
