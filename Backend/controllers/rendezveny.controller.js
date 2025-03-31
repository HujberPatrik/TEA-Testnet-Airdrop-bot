const pool = require('../config/db');


const getAllKerveny = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM kerveny');
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};  
const insertKerveny = async (req,res) => {
  const {nev, datum, helyszin, email, statusz, telefonszam, letszam} = req.body;

  try {
    const query = 'INSERT INTO kerveny(nev, datum, helyszin, email, statusz, telefonszam, letszam) VALUES($1, $2, $3, $4, $5, $6, $7)';
    const values = [nev, datum, helyszin, email, statusz, telefonszam, letszam];

    await pool.query(query, values);
    res.status(200).json({msg: "Sikeres hozzáadás"});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateKerveny = async (req, res) => {
  const { id, nev, datum, helyszin, email, statusz, telefonszam, letszam } = req.body;

  try {
      const query = `UPDATE kerveny 
                     SET nev = $1, datum = $2, helyszin = $3  email = $4, statusz = $5, telefonszam = $6, letszam = $7 
                     WHERE id = $8 
                     RETURNING *`;
      const values = [nev, datum, helyszin, email, statusz, telefonszam, letszam, id];

      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
          res.status(404).json({ error: 'Data not found' });
      } else {
          res.status(200).json(result.rows[0]);
      }
  } catch (err) {
      console.error('Error updating data:', err.message);
      res.status(400).json({ error: err.message });
  }
};

const deleteKerveny = async (req,res) =>{
  const {id} = req.body

  try{
    const query = 'Delete FROM kerveny WHERE id = $1';
    
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

module.exports = { getAllKerveny, insertKerveny, updateKerveny, deleteKerveny  };