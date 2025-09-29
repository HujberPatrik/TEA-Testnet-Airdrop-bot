const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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

  return {
    megnevezes,
    kategoria,
    mertekegyseg,
    ar_egyetem,
    ar_egyetem_hetvege,
    ar_kulso,
    ar_kulso_hetvege,
    megjegyzes
  };
}

router.get('/famulus', async (req, res) => {
  try {
    const q = `SELECT * FROM prices WHERE kategoria LIKE 'Általános'`
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
             ar_kulso, ar_kulso_hetvege, megjegyzes
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
  try {
    const b = normalizeBody(req.body);
    const q = `
      INSERT INTO prices
        (megnevezes, kategoria, mertekegyseg,
         ar_egyetem, ar_egyetem_hetvege,
         ar_kulso, ar_kulso_hetvege, megjegyzes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `;
    const params = [
      b.megnevezes, b.kategoria, b.mertekegyseg,
      Number(b.ar_egyetem) || 0,
      Number(b.ar_egyetem_hetvege) || 0,
      Number(b.ar_kulso) || 0,
      Number(b.ar_kulso_hetvege) || 0,
      b.megjegyzes
    ];
    const { rows } = await pool.query(q, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/prices error:', err);
    res.status(500).json({ error: err.message });
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
        megjegyzes = $8
      WHERE id = $9
      RETURNING *
    `;
    const params = [
      b.megnevezes, b.kategoria, b.mertekegyseg,
      Number(b.ar_egyetem) || 0,
      Number(b.ar_egyetem_hetvege) || 0,
      Number(b.ar_kulso) || 0,
      Number(b.ar_kulso_hetvege) || 0,
      b.megjegyzes,
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