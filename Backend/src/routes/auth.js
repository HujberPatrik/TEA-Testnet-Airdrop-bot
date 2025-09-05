const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../../config/db');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/login', async (req, res) => {
  try {
    const neptune_code = (req.body.neptune_code || '').trim().toUpperCase();
    const password = req.body.password || '';

    if (!neptune_code) return res.status(400).json({ error: 'Missing neptune_code' });

    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE neptune_code = ? LIMIT 1',
      [neptune_code]
    );
    const user = Array.isArray(rows) && rows.length ? rows[0] : null;
    console.log('[auth/login] DB user raw:', user);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // bcrypt használata ha telepítve van, különben fallback (nem ajánlott élesben)
    const ok = (typeof bcrypt !== 'undefined' && bcrypt)
      ? await bcrypt.compare(password, user.password_hash || '')
      : (password === (user.password_hash || ''));

    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role ?? null,
      full_name: user.full_name ?? null
    };
    console.log('[auth/login] token payload (to sign):', payload);

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

    return res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name ?? null } });
  } catch (err) {
    console.error('[auth/login] error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// /me endpoint: mindig a DB-ből adja vissza a full_name-et (friss adat)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const id = req.user && req.user.id;
    if (!id) return res.status(400).json({ error: 'Missing user id in token' });

    const [rows] = await pool.execute('SELECT id, email, full_name, role FROM users WHERE id = ?', [id]);
    const user = Array.isArray(rows) && rows.length ? rows[0] : null;
    console.log('[auth/me] DB user:', user);
    if (!user) return res.status(404).json({ error: 'Not found' });

    return res.json({ id: user.id, email: user.email, role: user.role ?? null, full_name: user.full_name ?? null });
  } catch (err) {
    console.error('[auth/me] error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;