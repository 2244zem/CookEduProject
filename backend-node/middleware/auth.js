/**
 * ============================================
 * Auth Middleware — JWT Token Verification
 * ============================================
 * Verifikasi JWT token dari header Authorization.
 * Menyediakan middleware untuk route yang membutuhkan auth.
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'masakyuk_secret_key_2026';

/**
 * Middleware: Wajib login
 * Verifikasi token, set req.user jika valid
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau expired' });
  }
}

/**
 * Middleware: Wajib admin
 * Harus dipasang setelah authenticate
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses khusus admin' });
  }
  next();
}

/**
 * Middleware: Opsional auth
 * Jika ada token valid, set req.user. Jika tidak, lanjut tanpa user.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    // Token invalid, tapi lanjut tanpa auth
  }
  next();
}

module.exports = { authenticate, requireAdmin, optionalAuth };
