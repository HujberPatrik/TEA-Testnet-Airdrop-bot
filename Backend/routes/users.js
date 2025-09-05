const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// egyszerű DB wrapper (mysql2 vagy pg kompatibilitás)
async function runQuery(sql, params = []) {
  if (!pool) throw new Error('DB pool not configured');
  if (typeof pool.execute === 'function') {
    const res = await pool.execute(sql, params);
    return Array.isArray(res) ? res[0] : res;
  } else if (typeof pool.query === 'function') {
    const res = await pool.query(sql, params);
    return res && res.rows ? res.rows : res;
  } else {
    throw new Error('Unsupported DB pool');
  }
}

// GET /api/users?neptun=XXX or ?email=...
router.get('/', async (req, res) => {
  try {
    const { neptun, email } = req.query;
    if (!neptun && !email) return res.status(400).json({ error: 'Missing query: neptun or email required' });

    if (neptun) {
      const nq = String(neptun).trim().toUpperCase();
      const rows = await runQuery(
        typeof pool.execute === 'function'
          ? 'SELECT id, email, full_name, neptun_code, role FROM users WHERE UPPER(neptun_code) = ? LIMIT 1'
          : 'SELECT id, email, full_name, neptun_code, role FROM users WHERE UPPER(neptun_code) = $1 LIMIT 1',
        [nq]
      );
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0]);
    } else {
      const em = String(email).trim().toLowerCase();
      const rows = await runQuery(
        typeof pool.execute === 'function'
          ? 'SELECT id, email, full_name, neptun_code, role FROM users WHERE LOWER(email) = ? LIMIT 1'
          : 'SELECT id, email, full_name, neptun_code, role FROM users WHERE LOWER(email) = $1 LIMIT 1',
        [em]
      );
      if (!rows || rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0]);
    }
  } catch (err) {
    console.error('[users GET] error', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users  -> create or update (by neptun_code or email)
// If request contains password field, it WILL overwrite password_hash (hashed). If password not present, password_hash remains unchanged.
router.post('/', async (req, res) => {
  console.log('[users POST] body:', req.body);
  try {
    const { email, full_name, neptun_code } = req.body || {};
    // detect whether password field was provided at all
    const hasPasswordField = Object.prototype.hasOwnProperty.call(req.body || {}, 'password');
    const rawPassword = req.body && req.body.password;

    if (!email || !full_name || !neptun_code) {
      return res.status(400).json({ error: 'Hiányzó adatok' });
    }

    const em = String(email).trim().toLowerCase();
    const neptun = String(neptun_code).trim().toUpperCase();

    // keresés létező userre (neptun vagy email)
    const foundRows = await runQuery(
      typeof pool.execute === 'function'
        ? 'SELECT id FROM users WHERE neptun_code = ? OR email = ? LIMIT 1'
        : 'SELECT id FROM users WHERE neptun_code = $1 OR email = $2 LIMIT 1',
      [neptun, em]
    );

    if (Array.isArray(foundRows) && foundRows.length) {
      // update meglévő user
      const id = foundRows[0].id;
      if (hasPasswordField) {
        // ha password mező van a body-ban, akkor felülírjuk (ha üres string jön, NULL lesz)
        if (typeof rawPassword === 'string' && rawPassword.length > 0) {
          const hash = await bcrypt.hash(rawPassword, 10);
          await runQuery(
            typeof pool.execute === 'function'
              ? 'UPDATE users SET email = ?, full_name = ?, neptun_code = ?, password_hash = ?, updated_at = NOW() WHERE id = ?'
              : 'UPDATE users SET email = $1, full_name = $2, neptun_code = $3, password_hash = $4, updated_at = NOW() WHERE id = $5',
            [em, full_name.trim(), neptun, hash, id]
          );
        } else {
          // üres jelszó → explicit NULL a password_hash mezőben (ez felülírja a korábbit)
          await runQuery(
            typeof pool.execute === 'function'
              ? 'UPDATE users SET email = ?, full_name = ?, neptun_code = ?, password_hash = NULL, updated_at = NOW() WHERE id = ?'
              : 'UPDATE users SET email = $1, full_name = $2, neptun_code = $3, password_hash = NULL, updated_at = NOW() WHERE id = $4',
            [em, full_name.trim(), neptun, id]
          );
        }
      } else {
        // password nincs a payloadban → ne változtassuk a password_hash-et
        await runQuery(
          typeof pool.execute === 'function'
            ? 'UPDATE users SET email = ?, full_name = ?, neptun_code = ?, updated_at = NOW() WHERE id = ?'
            : 'UPDATE users SET email = $1, full_name = $2, neptun_code = $3, updated_at = NOW() WHERE id = $4',
          [em, full_name.trim(), neptun, id]
        );
      }

      const rows = await runQuery(
        typeof pool.execute === 'function'
          ? 'SELECT id, email, full_name, neptun_code, role FROM users WHERE id = ?'
          : 'SELECT id, email, full_name, neptun_code, role FROM users WHERE id = $1',
        [id]
      );
      return res.json(Array.isArray(rows) ? rows[0] : rows[0]);
    } else {
      // create új user
      let hash = null;
      if (hasPasswordField && typeof rawPassword === 'string' && rawPassword.length > 0) {
        hash = await bcrypt.hash(rawPassword, 10);
      }
      if (typeof pool.execute === 'function') {
        const ins = await runQuery(
          'INSERT INTO users (email, full_name, neptun_code, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [em, full_name.trim(), neptun, hash]
        );
        // próbálunk visszakérdezni az új sort az email alapján
        const rows = await runQuery('SELECT id, email, full_name, neptun_code, role FROM users WHERE email = ? LIMIT 1', [em]);
        return res.status(201).json(rows && rows[0] ? rows[0] : null);
      } else {
        // pg támogatás RETURNING
        const ins = await runQuery(
          'INSERT INTO users (email, full_name, neptun_code, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, email, full_name, neptun_code, role',
          [em, full_name.trim(), neptun, hash]
        );
        return res.status(201).json(ins && ins[0] ? ins[0] : null);
      }
    }
  } catch (err) {
    console.error('[users POST] error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// multer setup
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const userId = req.body.userId ? String(req.body.userId) : 'anon';
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${userId}-${Date.now()}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // max 5MB

// POST /api/users/avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  // új: részletes debug-logok
  console.log('[users avatar] incoming request body:', req.body);
  console.log('[users avatar] file object:', req.file);

  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    if (!req.file) return res.status(400).json({ error: 'Missing file' });

    // miután multer feltöltötte a fájlt:
    const publicPath = `/uploads/${req.file.filename}`; // <-- NE fájlrendszer útvonalat ments

    // frissítjük az avatar_url mezőt
    await runQuery(
      typeof pool.execute === 'function'
        ? 'UPDATE users SET avatar_url = ? WHERE id = ?'
        : 'UPDATE users SET avatar_url = $1 WHERE id = $2',
      [publicPath, userId]
    );

    return res.json({ avatar_url: publicPath });
  } catch (err) {
    console.error('[users avatar] error', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;