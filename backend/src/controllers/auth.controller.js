/**
 * auth.controller.js
 * Maneja registro y login de usuarios.
 * Rutas: POST /api/auth/register  |  POST /api/auth/login  |  GET /api/auth/me
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Genera un JWT firmado con el id, email y rol del usuario.
 * Expira según JWT_EXPIRES_IN del .env (default: 7d).
 */
function generarToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/** Devuelve los campos públicos del usuario (nunca el password hash). */
function usuarioPublico(user) {
  return { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
}

// ── Controladores ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { nombre, email, password, rol? }
 * Crea un nuevo usuario. Rol por defecto: COMPRADOR.
 */
async function register(req, res) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y password son requeridos' });
  }

  const rolesValidos = ['COMPRADOR', 'VENDEDOR'];
  if (rol && !rolesValidos.includes(rol)) {
    return res.status(400).json({ error: 'rol debe ser COMPRADOR o VENDEDOR' });
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const nuevoUsuario = await prisma.user.create({
    data: { nombre, email, password: passwordHash, rol: rol || 'COMPRADOR' },
  });

  const token = generarToken(nuevoUsuario);
  return res.status(201).json({ token, user: usuarioPublico(nuevoUsuario) });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Verifica credenciales y devuelve token JWT.
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Mensaje genérico para no revelar si el email existe
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const passwordValida = await bcrypt.compare(password, user.password);
  if (!passwordValida) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = generarToken(user);
  return res.json({ token, user: usuarioPublico(user) });
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Devuelve datos del usuario autenticado. Requiere verificarToken.
 */
async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  return res.json({ user: usuarioPublico(user) });
}

module.exports = { register, login, me };
