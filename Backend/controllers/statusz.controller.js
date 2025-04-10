const pool = require('../config/db');

const getAllStatusz = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM statusz');
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};  
const insertStatusz = async (req,res) => {
  const {nev} = req.body;

  try {
    const query = 'INSERT INTO statusz(nev) VALUES($1)';
    const values = [nev];

    await pool.query(query, values);
    res.status(200).json({msg: "Sikeres hozzáadás"});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const deleteStatusz = async (req,res) =>{
  const {id} = req.body

  try{
    const query = 'Delete FROM statusz WHERE id = $1';
    const values = [id];
    const result = await pool.query(query,values);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Data not found' });
    } else {
      res.status(200).json("Sikeres törlés!");
    }

  } catch (err) {
    console.error('Error updating data:', err.message);
    res.status(400).json({ error: err.message });
  }
};

const updateStatusz = async (req, res) => {
  const { id } = req.params;
  const { statusz } = req.body;

  try {
    const query = 'UPDATE statusz SET statusz = $1 WHERE id = $2 RETURNING *';
    const values = [statusz, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Nem található státusz ilyen ID-val' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Hiba a státusz frissítése során:', error);
    res.status(500).json({ error: 'Hiba történt a státusz frissítése során' });
  }
};

module.exports = { getAllStatusz, insertStatusz, deleteStatusz, updateStatusz };