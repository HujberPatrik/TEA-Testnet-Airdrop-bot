/**
 * Chat controller + router (drop-in)
 * Mount in your server:
 *   const { initChatController } = require('./controllers/chat.controller');
 *   initChatController(app); // registers /api/chat endpoints
 *
 * Frontend (Chat.vue):
 *   axios.get('/api/chat/messages?kervenyId=123')
 *   axios.post('/api/chat/messages', { text:'Hello', kervenyId:123 })
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'RendezvenyApp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '12345'
});

/* ---------------- Migration ---------------- */
async function ensureChatTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id           BIGSERIAL PRIMARY KEY,
        author_id    VARCHAR(64)  NOT NULL,
        author_name  VARCHAR(128) NOT NULL,
        text         TEXT         NOT NULL,
        kerveny_id   BIGINT,
        created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
      );
    `);
    // csak akkor próbálja az FK-t ha létezik kerveny
    const { rows } = await pool.query(`
      SELECT 1 FROM information_schema.tables WHERE table_name='kerveny' LIMIT 1;
    `);
    if (rows.length) {
      await pool.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name='fk_chat_messages_kerveny'
          ) THEN
            ALTER TABLE chat_messages
              ADD CONSTRAINT fk_chat_messages_kerveny
              FOREIGN KEY (kerveny_id) REFERENCES kerveny(id) ON DELETE CASCADE;
          END IF;
        END$$;
      `);
    } else {
      console.warn('[chat] kerveny table not found, skipping FK');
    }
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_kerveny_id ON chat_messages(kerveny_id);`);

    // last_seen tábla
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_last_seen (
        user_id      VARCHAR(64) NOT NULL,
        kerveny_id   BIGINT      NOT NULL,
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, kerveny_id)
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_last_seen_kerveny ON chat_last_seen(kerveny_id);`);
  } catch (e) {
    console.error('[chat] ensureChatTable error:', e.message);
  }
}

/* ---------------- Auth middleware ---------------- */
function ensureAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

/* ---------------- Router ---------------- */
const router = express.Router();

const CHAT_DEBUG = process.env.CHAT_DEBUG === '1';

// username kiválasztása: NEM esünk vissza e-mailre
function pickUsername(u = {}, fromBody) {
  if (typeof fromBody === 'string' && fromBody.trim()) return fromBody.trim();
  return (
    u.username ||
    u.userName ||
    u.preferred_username ||
    u.name ||
    u.full_name ||
    u.fullName ||
    u.neptun ||
    (u.id != null ? String(u.id) : null)
  );
}

// POST /messages – author_name csak a kliens által küldött érték lehet
router.post('/messages', ensureAuth, async (req, res) => {
  try {
    const text = (req.body?.text || '').trim();
    const kervenyId = Number(req.body?.kervenyId);
    const authorNameRaw = typeof req.body?.authorName === 'string' ? req.body.authorName.trim() : '';

    if (!text) return res.status(400).json({ error: 'empty' });
    if (!Number.isInteger(kervenyId) || kervenyId <= 0) {
      return res.status(400).json({ error: 'invalid kervenyId' });
    }
    if (!authorNameRaw) {
      return res.status(400).json({ error: 'authorName required' });
    }

    const exists = await pool.query('SELECT 1 FROM kerveny WHERE id=$1 LIMIT 1', [kervenyId]);
    if (exists.rowCount === 0) return res.status(404).json({ error: 'kerveny not found' });

    const u = req.user || {};
    const author_id = getUserId(u);
    const author_name = authorNameRaw; // kizárólag a küldött név

    const { rows } = await pool.query(
      `INSERT INTO chat_messages(author_id, author_name, text, kerveny_id)
       VALUES($1,$2,$3,$4) RETURNING *`,
      [author_id, author_name, text, kervenyId]
    );
    // saját üzenet küldése után frissítsük a last_seen-t (látja azonnal)
    try { await markSeen(author_id, kervenyId); } catch {}
    return res.status(201).json(rows[0]);
  } catch (e) {
    console.error('[chat POST /messages] DB error:', e);
    return res.status(500).json({ error: 'db error', detail: e.message });
  }
});

router.get('/messages', ensureAuth, async (req, res) => {
  try {
    const sinceMs = req.query.since ? Number(req.query.since) : null;
    const kervenyId = Number(req.query.kervenyId);
    if (!Number.isInteger(kervenyId) || kervenyId <= 0) {
      return res.status(400).json({ error: 'kervenyId required (positive integer)' });
    }
    const params = [kervenyId];
    let where = 'WHERE kerveny_id = $1';
    if (Number.isFinite(sinceMs) && sinceMs > 0) {
      where += ' AND created_at > $2';
      params.push(new Date(sinceMs));
    }
    const { rows } = await pool.query(
      `SELECT * FROM chat_messages ${where} ORDER BY created_at ASC LIMIT 500`,
      params
    );
    const userId = getUserId(req.user || {});
    // lekérjük last_seen
    const lsRes = await pool.query(
      `SELECT last_seen_at FROM chat_last_seen WHERE user_id=$1 AND kerveny_id=$2`,
      [userId, kervenyId]
    );
    const lastSeenAt = lsRes.rows[0]?.last_seen_at || null;
    // unread count
    const unreadRes = await pool.query(
      `SELECT COUNT(*)::int AS c FROM chat_messages
       WHERE kerveny_id=$1 AND ($2::timestamptz IS NULL OR created_at > $2)`,
      [kervenyId, lastSeenAt]
    );
    const unreadCount = unreadRes.rows[0]?.c || 0;
    // opcionális frissítés (ha param: markSeen=1)
    if (req.query.markSeen === '1') {
      try { await markSeen(userId, kervenyId); } catch {}
    }
    return res.json({
      messages: rows,
      lastSeenAt,
      unreadCount
    });
  } catch (e) {
    console.error('[chat GET /messages] DB error:', e);
    return res.status(500).json({ error: 'db error', detail: e.message });
  }
});

router.delete('/messages', ensureAuth, async (req, res) => {
  try {
    const kervenyId = Number(req.query.kervenyId);
    const scope = String(req.query.scope || 'mine');
    if (!Number.isInteger(kervenyId) || kervenyId <= 0) {
      return res.status(400).json({ error: 'invalid kervenyId' });
    }
    // csak létező rendezvényhez
    const exists = await pool.query('SELECT 1 FROM kerveny WHERE id=$1 LIMIT 1', [kervenyId]);
    if (exists.rowCount === 0) return res.status(404).json({ error: 'kerveny not found' });

    const u = req.user || {};
    const author_id = getUserId(u);

    let sql = 'DELETE FROM chat_messages WHERE kerveny_id = $1 AND author_id = $2 RETURNING id';
    let params = [kervenyId, author_id];

    // csak saját üzenetek törlése támogatott
    if (scope !== 'mine') {
      return res.status(403).json({ error: 'forbidden: only own messages can be deleted' });
    }

    const { rowCount } = await pool.query(sql, params);
    // törlés után frissítsük az utolsó látást (nem számítanak unread-nek)
    try { await markSeen(author_id, kervenyId); } catch {}
    return res.json({ deleted: rowCount });
  } catch (e) {
    console.error('[chat DELETE /messages] DB error:', e);
    return res.status(500).json({ error: 'db error', detail: e.message });
  }
});

// explicit last_seen frissítés
router.post('/seen', ensureAuth, async (req, res) => {
  try {
    const kervenyId = Number(req.body?.kervenyId);
    if (!Number.isInteger(kervenyId) || kervenyId <= 0) {
      return res.status(400).json({ error: 'invalid kervenyId' });
    }
    const userId = getUserId(req.user || {});
    await markSeen(userId, kervenyId);
    return res.json({ ok: true, kervenyId });
  } catch (e) {
    console.error('[chat POST /seen] error', e);
    return res.status(500).json({ error: 'db error', detail: e.message });
  }
});

/* ---------------- Init ---------------- */
function initChatController(app, basePath = '/api/chat') {
  ensureChatTable().catch(e => console.error('[chat] migration error', e.message));
  app.use(basePath, router);
  console.log('[chat] mounted at', basePath);
}

module.exports = {
  initChatController
};

function getUserId(u = {}) {
  return String(u.id || u.sub || u.neptun || u.username || 'anon');
}

async function markSeen(userId, kervenyId) {
  await pool.query(`
    INSERT INTO chat_last_seen(user_id, kerveny_id, last_seen_at)
    VALUES($1,$2,NOW())
    ON CONFLICT (user_id, kerveny_id) DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at
  `, [userId, kervenyId]);
}