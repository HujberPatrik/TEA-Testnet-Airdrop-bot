const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // ugyanazt a db config-ot használjuk, mint server.js
// const { requireAuth, requireAdmin } = require('../middleware/auth'); // ha van auth middleware-ed, vedd vissza a kommentet

// GET /api/users?neptun=ABC123  vagy /api/users?email=a@b.c
router.get('/', /* requireAuth, */ async (req, res) => {
  const { neptun, email } = req.query;
  try {
    if (neptun) {
      const q = 'SELECT id, email, full_name, neptun_code, role, created_at FROM users WHERE neptun_code = $1 LIMIT 1';
      const { rows } = await pool.query(q, [neptun.toUpperCase()]);
      return res.json(rows[0] || null);
    }
    if (email) {
      const q = 'SELECT id, email, full_name, neptun_code, role, created_at FROM users WHERE email = $1 LIMIT 1';
      const { rows } = await pool.query(q, [email.toLowerCase()]);
      return res.json(rows[0] || null);
    }
    return res.status(400).json({ error: 'Add meg a neptun vagy email paramétert' });
  } catch (err) {
    console.error('GET /api/users error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users  -> létrehozás vagy frissítés (upsert) body: { email, full_name, neptun_code, password? }
router.post('/', /* requireAuth, requireAdmin, */ async (req, res) => {
  const { email, full_name, neptun_code, password } = req.body || {};
  if (!email || !full_name || !neptun_code) {
    return res.status(400).json({ error: 'Hiányzó mezők: email, full_name és neptun_code szükséges' });
  }

  try {
    // opcionalisan hash-eld a jelszót (telepítsd: npm i bcrypt)
    let passwordHash = null;
    if (password) {
      try {
        const bcrypt = require('bcrypt');
        passwordHash = await bcrypt.hash(password, 10);
      } catch (e) {
        console.warn('bcrypt nincs telepítve — jelszó nem lesz hash-elve. Telepítsd: npm i bcrypt');
        passwordHash = null;
      }
    }

    const q = `
      INSERT INTO users (email, full_name, neptun_code, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, now(), now())
      ON CONFLICT (neptun_code) DO UPDATE
        SET email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = now()
      RETURNING id, email, full_name, neptun_code, role, created_at;
    `;
    const values = [email.toLowerCase(), full_name, neptun_code.toUpperCase(), passwordHash];
    const { rows } = await pool.query(q, values);
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('POST /api/users error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;