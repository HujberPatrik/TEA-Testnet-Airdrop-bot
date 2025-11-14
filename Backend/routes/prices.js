const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// boolean érték normalizálása (true/false, 1/0, "true"/"false", "on"/"off", stb.)
function coerceBool(v, fallback = false) {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1', 'true', 't', 'yes', 'y', 'on'].includes(s)) return true;
    if (['0', 'false', 'f', 'no', 'n', 'off'].includes(s)) return false;
  }
  return fallback;
}

// helper: body mezők normalizálása (magyar kulcsokra)
function normalizeBody(body = {}) {
  // trim strings and convert empty unit to null so DB kapjon NULL-t helyett üres stringnek
  const megnevezes = (body.megnevezes ?? body.name ?? '').toString().trim();
  const kategoria = body.kategoria ?? body.category ?? null;

  let mertekegyseg = body.mertekegyseg ?? body.unit ?? null;
  if (typeof mertekegyseg === 'string') {
    mertekegyseg = mertekegyseg.trim() === '' ? null : mertekegyseg.trim();
  }

  const ar_egyetem = body.ar_egyetem ?? body.priceUniversity ?? body.priceuniversity ?? 0;
  const ar_egyetem_hetvege = body.ar_egyetem_hetvege ?? body.priceUniversityWeekend ?? body.priceuniversityweekend ?? 0;
  const ar_kulso = body.ar_kulso ?? body.priceExternal ?? body.priceexternal ?? 0;
  const ar_kulso_hetvege = body.ar_kulso_hetvege ?? body.priceExternalWeekend ?? body.priceexternalweekend ?? 0;
  const megjegyzes = (body.megjegyzes ?? body.notes ?? '').toString().trim();

  // ÚJ: ÁFA mező normalizálás (elfogad: true/false, "true"/"false", 1/0, "on"/"off")
  const afa = coerceBool(body.afa ?? body.vat ?? body.is_vat ?? body.isAfa, false);

  return {
    megnevezes,
    kategoria,
    mertekegyseg,
    ar_egyetem,
    ar_egyetem_hetvege,
    ar_kulso,
    ar_kulso_hetvege,
    megjegyzes,
    afa
  };
}

// szekvencia újraszinkronizálása (prices.id)
async function resyncPricesIdSequence() {
  const { rows } = await pool.query(`SELECT pg_get_serial_sequence('prices','id') AS seq`);
  const seq = rows[0]?.seq;
  if (!seq) return;
  await pool.query(`SELECT setval($1, COALESCE((SELECT MAX(id) FROM prices), 0))`, [seq]);
}

router.get('/famulus', async (req, res) => {
  try {
    const q = `SELECT * FROM prices WHERE kategoria LIKE 'UF'`
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/university', async (req, res) => {
  try {
    const q = `SELECT * FROM prices WHERE kategoria LIKE 'Egyetemi'`
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/prices
router.get('/', async (req, res) => {
  try {
    const q = `
      SELECT id, megnevezes, kategoria, mertekegyseg,
             ar_egyetem, ar_egyetem_hetvege,
             ar_kulso, ar_kulso_hetvege, megjegyzes,
             afa
      FROM prices
      ORDER BY megnevezes NULLS LAST, id
    `;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/prices error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prices
router.post('/', async (req, res) => {
  // id mezőt ignoráljuk, DB generálja
  // eslint-disable-next-line no-unused-vars
  const { id: _ignoreId, ...body } = req.body || {};
  const b = normalizeBody(body);

  const q = `
    INSERT INTO prices
      (megnevezes, kategoria, mertekegyseg,
       ar_egyetem, ar_egyetem_hetvege,
       ar_kulso, ar_kulso_hetvege, megjegyzes, afa)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;
  const params = [
    b.megnevezes, b.kategoria, b.mertekegyseg,
    Number(b.ar_egyetem) || 0,
    Number(b.ar_egyetem_hetvege) || 0,
    Number(b.ar_kulso) || 0,
    Number(b.ar_kulso_hetvege) || 0,
    b.megjegyzes,
    !!b.afa
  ];

  try {
    const { rows } = await pool.query(q, params);
    return res.status(201).json(rows[0]);
  } catch (err) {
    // duplikált PK esetén (prices_pkey) szekvencia resync + 1 retry
    const isDupPk = err.code === '23505' && (err.constraint === 'prices_pkey' || /prices_pkey/i.test(err.detail || ''));
    if (isDupPk) {
      try {
        await resyncPricesIdSequence();
        const { rows } = await pool.query(q, params);
        return res.status(201).json(rows[0]);
      } catch (e2) {
        console.error('POST /api/prices retry after seq resync failed:', e2);
        return res.status(500).json({ error: e2.detail || e2.message });
      }
    }
    console.error('POST /api/prices error:', err);
    return res.status(500).json({ error: err.detail || err.message });
  }
});

// PUT /api/prices/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    const b = normalizeBody(req.body);
    const q = `
      UPDATE prices SET
        megnevezes = $1,
        kategoria = $2,
        mertekegyseg = $3,
        ar_egyetem = $4,
        ar_egyetem_hetvege = $5,
        ar_kulso = $6,
        ar_kulso_hetvege = $7,
        megjegyzes = $8,
        afa = $9
      WHERE id = $10
      RETURNING *
    `;
    const params = [
      b.megnevezes, b.kategoria, b.mertekegyseg,
      Number(b.ar_egyetem) || 0,
      Number(b.ar_egyetem_hetvege) || 0,
      Number(b.ar_kulso) || 0,
      Number(b.ar_kulso_hetvege) || 0,
      b.megjegyzes,
      !!b.afa,
      id
    ];
    const { rows } = await pool.query(q, params);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/prices/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/prices/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    const { rowCount } = await pool.query('DELETE FROM prices WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/prices/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;