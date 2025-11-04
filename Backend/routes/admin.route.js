const express = require('express');
const router = express.Router();
const pool = require('../config/db');
// const { requireAuth, requireAdmin } = require('../middleware/auth'); // ha van, vedd vissza a kommentet

// POST /api/admin/assign-role
router.post('/assign-role', /* requireAuth, requireAdmin, */ async (req, res) => {
  const { neptun, role, reason, email } = req.body || {};
  if (!neptun && !email) return res.status(400).json({ error: 'Neptun vagy email szükséges' });
  const neptunCode = neptun ? String(neptun).trim().toUpperCase() : null;
  const allowed = ['Admin', 'Főadmin', 'Uni-Famulus', 'Rendezvényszervező'];
  if (!role || !allowed.includes(role)) return res.status(400).json({ error: 'Érvénytelen szerepkör' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // próbáljuk meg megtalálni a felhasználót (elsőként neptun szerint)
    let userQ = null;
    let userRow = null;
    if (neptunCode) {
      userQ = await client.query('SELECT id, role FROM users WHERE neptun_code = $1 LIMIT 1', [neptunCode]);
      userRow = userQ.rows[0] || null;
    }
    if (!userRow && email) {
      const emailLc = String(email).trim().toLowerCase();
      userQ = await client.query('SELECT id, role FROM users WHERE email = $1 LIMIT 1', [emailLc]);
      userRow = userQ.rows[0] || null;
    }

    let userId = null;
    let oldRole = null;
    if (userRow) {
      userId = userRow.id;
      oldRole = userRow.role;
      await client.query('UPDATE users SET role = $1, role_assigned_at = now(), updated_at = now() WHERE id = $2', [role, userId]);
    } else {
      // létrehozunk egy minimális új felhasználót
      const insertQ = `INSERT INTO users (email, full_name, neptun_code, role, role_assigned_at, created_at, updated_at)
                       VALUES ($1, $2, $3, $4, now(), now(), now()) RETURNING id`;
      const values = [email ? String(email).toLowerCase() : null, null, neptunCode, role];
      const ins = await client.query(insertQ, values);
      userId = ins.rows[0].id;
      oldRole = null;
    }

    await client.query('COMMIT');
    // audit beszúrás külön, ne törjön meg ha nincs tábla
    try {
      await client.query(
        `INSERT INTO role_audit (user_id, neptun_code, old_role, new_role, changed_by, changed_at, reason)
         VALUES ($1, $2, $3, $4, $5, now(), $6)`,
        [userId, neptunCode, oldRole, role, null, reason || null]
      );
    } catch (auditErr) {
      console.warn('role_audit insert failed (non-fatal):', auditErr.message);
      // opcionálisan: logold valahova vagy értesítsd az admint
    }
    return res.json({ success: true, id: userId, role });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('assign-role error', err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;