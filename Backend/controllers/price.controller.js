const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM prices ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, category, unit, priceUniversity=0, priceUniversityWeekend=0, priceExternal=0, priceExternalWeekend=0, notes='' } = req.body;
    const sql = `INSERT INTO prices (name, category, unit, priceUniversity, priceUniversityWeekend, priceExternal, priceExternalWeekend, notes)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
    const { rows } = await pool.query(sql, [name, category, unit, priceUniversity, priceUniversityWeekend, priceExternal, priceExternalWeekend, notes]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, category, unit, priceUniversity=0, priceUniversityWeekend=0, priceExternal=0, priceExternalWeekend=0, notes='' } = req.body;
    const sql = `UPDATE prices SET name=$1, category=$2, unit=$3, priceUniversity=$4, priceUniversityWeekend=$5, priceExternal=$6, priceExternalWeekend=$7, notes=$8 WHERE id=$9 RETURNING *`;
    const { rows } = await pool.query(sql, [name, category, unit, priceUniversity, priceUniversityWeekend, priceExternal, priceExternalWeekend, notes, id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM prices WHERE id=$1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};