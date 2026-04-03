/**
 * role.middleware.js
 * Verifica que el usuario autenticado tenga el rol requerido.
 * Siempre debe usarse DESPUÉS de verificarToken.
 *
 * Uso en rutas:
 *   router.post('/productos', verificarToken, soloVendedor, controller);
 */

function requireRol(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`,
      });
    }

    next();
  };
}

// Atajo semántico para uso directo en rutas de vendedor
const soloVendedor = requireRol('VENDEDOR');

module.exports = { requireRol, soloVendedor };
