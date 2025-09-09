const pool = require('../config/db');

const mapRow = r => ({
  id: r.id,
  code: r.code,
  label: r.label,
  phase: r.phase,
  terminal: r.terminal,
  sort_order: r.sort_order,
  active: r.active
});

const getAllStatusz = async (req, res) => {
  try {
    const q = 'SELECT * FROM statusz WHERE active = TRUE ORDER BY sort_order, code';
    const result = await pool.query(q);
    res.status(200).json(result.rows.map(mapRow));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const insertStatusz = async (req, res) => {
  const { code, label, phase, terminal = false, sort_order = 9999 } = req.body;
  if (!code || !label || !phase)
    return res.status(400).json({ error: 'code, label, phase kötelező' });

  try {
    const q = `INSERT INTO statusz (code,label,phase,terminal,sort_order)
               VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const v = [code, label, phase, terminal, sort_order];
    const { rows } = await pool.query(q, v);
    res.status(201).json(mapRow(rows[0]));
  } catch (error) {
    if (error.code === '23505')
      return res.status(409).json({ error: 'code már létezik' });
    res.status(500).json({ error: error.message });
  }
};

const updateStatusz = async (req, res) => {
  const { id } = req.params;
  const { label, phase, terminal, sort_order, active } = req.body;
  try {
    const q = `UPDATE statusz
               SET label = COALESCE($1,label),
                   phase = COALESCE($2,phase),
                   terminal = COALESCE($3,terminal),
                   sort_order = COALESCE($4,sort_order),
                   active = COALESCE($5,active)
               WHERE id = $6
               RETURNING *`;
    const v = [label, phase, terminal, sort_order, active, id];
    const { rows, rowCount } = await pool.query(q, v);
    if (!rowCount) return res.status(404).json({ error: 'Nincs ilyen ID' });
    res.status(200).json(mapRow(rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteStatusz = async (req, res) => {
  const { id } = req.params;
  try {
    // Ha esemény táblában hivatkozás van (pl. events.statusz_id), előbb ellenőrizd
    const ref = await pool.query('SELECT 1 FROM events WHERE statusz_id = $1 LIMIT 1', [id])
      .catch(() => ({ rowCount: 0 }));
    if (ref.rowCount) {
      return res.status(409).json({ error: 'Használatban van (events). Inaktiváld inkább).' });
    }
    const del = await pool.query('DELETE FROM statusz WHERE id = $1', [id]);
    if (!del.rowCount) return res.status(404).json({ error: 'Nincs ilyen ID' });
    res.status(200).json({ msg: 'Törölve' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Opcionális: összes (inaktív is)
const getAllStatuszAdmin = async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM statusz ORDER BY sort_order, code');
    res.status(200).json(rows.map(mapRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  getAllStatusz,
  getAllStatuszAdmin,
  insertStatusz,
  updateStatusz,
  deleteStatusz
};