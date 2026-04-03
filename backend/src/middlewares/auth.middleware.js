/**
 * auth.middleware.js
 * Verifica que el request incluya un JWT válido en el header Authorization.
 *
 * Uso en rutas:
 *   router.get('/ruta-protegida', verificarToken, controller);
 *
 * Si el token es válido, agrega `req.user` con { id, email, rol }
 * para que los controllers puedan usarlo sin volver a decodificar.
 */

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  // El header debe tener el formato: "Authorization: Bearer <token>"
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, rol, iat, exp }
    next();
  } catch (err) {
    // TokenExpiredError o JsonWebTokenError
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { verificarToken };
