const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt'); // használjuk ugyanazt a forrást

function requireAuth(req, res, next) {
  let raw = req.headers.authorization || req.headers['x-access-token'] || req.query?.token || null;
  if (!raw) return res.status(401).json({ error: 'No token' });

  if (typeof raw === 'string' && raw.toLowerCase().startsWith('bearer ')) raw = raw.slice(7).trim();

  // DEBUG: mit kap a middleware?
  console.log('[auth] received token length:', raw ? String(raw).length : null);
  try {
    const decodedBefore = jwt.decode(raw);
    console.log('[auth] decoded (no verify) payload preview:', decodedBefore);
  } catch (e) {
    console.warn('[auth] decode before verify failed:', e.message);
  }

  try {
    const payload = jwt.verify(raw, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.warn('[auth] JWT verify failed:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No user' });
  if ((req.user.role || '').toString().toLowerCase() !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  return next();
}

module.exports = { requireAuth, requireAdmin };