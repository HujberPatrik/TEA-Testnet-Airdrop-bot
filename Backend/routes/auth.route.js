const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

router.post('/login', async (req, res) => {
  const { identity, password } = req.body || {};
  if (!identity || !password) return res.status(400).json({ error: 'Hiányzó adatok' });

  const client = await pool.connect();
  try {
    const q = `SELECT id, email, neptun_code, full_name, role, password_hash, password FROM users
               WHERE lower(email) = lower($1) OR upper(neptun_code) = upper($1) LIMIT 1`;
    const r = await client.query(q, [String(identity).trim()]);
    const user = r.rows[0];
    if (!user) return res.status(401).json({ error: 'Nincs ilyen felhasználó' });

    const hash = user.password_hash || user.password;
    if (!hash) return res.status(401).json({ error: 'Jelszó nincs beállítva' });

    const ok = await bcrypt.compare(password, hash);
    if (!ok) return res.status(401).json({ error: 'Hibás jelszó' });

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({
      token,
      user: { id: user.id, email: user.email, neptun: user.neptun_code, full_name: user.full_name, role: user.role }
    });
  } catch (err) {
    console.error('auth/login error', err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;