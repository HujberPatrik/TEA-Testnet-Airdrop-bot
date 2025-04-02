const pool = require('../config/db');


const getAllKerveny = async (req, res) => {
  let sql = 'SELECT * FROM kerveny'
  pool.query(sql, (err, data) => {
    if (err) {
      res.status(500).send({
          message: err.message || 'Unknow error'
      })
    }
    else{
      res.send(data.rows);
    }
  });
};

const getKervenyById = async (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM kerveny WHERE id = ?';
  
  pool.query(sql, [id], (error, results) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      if (results.length === 0) {
        res.status(404).json({ message: 'Nem található rekord ilyen id-val' });
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
};

const insertKerveny = async (req, res) => {
  const data = req.body;
  const sql = `
    INSERT INTO kerveny (
      nev, statusz, kezdo_datum, helyszin, letszam, email, telefonszam,
      leiras, cim, veg_datum, tipus, minosites, sajto, jelleg, programterv,
      berendezesi_mod, szallasigeny, parkolo, internet, oktatastechnika,
      korlatozott_mozgas, foto, cater, epites, epites_kezdet, epites_veg,
      epites_vallalkozok, epites_magas, epites_allvany, epites_kezi,
      epites_gepi, takaritas, villanyszerelo, aramigeny, leg_szennyezes,
      vegyi_anyag, dekoracio, felelos, lakcim, tovabbi_szervezo,
      tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim,
      megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon,
      megrendelo_email
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
      $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41,
      $42, $43, $44, $45, $46, $47, $48, $49
    )
    RETURNING id
  `;

  const values = [
    data.nev, data.statusz, data.kezdoDatum, data.helyszin, data.letszam,
    data.email, data.telefonszam, data.leiras, data.cim, data.vegDatum,
    data.tipus, data.minosites, data.sajto, data.jelleg, data.programterv,
    data.berendezesiMod, data.szallasigeny, data.parkolo, data.internet,
    data.oktatastechnika, data.korlatozottMozgas, data.foto, data.cater,
    data.epites, data.epitesKezdet, data.epitesVeg, data.epitesVallalkozok,
    data.epitesMagas, data.epitesAllvany, data.epitesKezi, data.epitesGepi,
    data.takaritas, data.villanyszerelo, data.aramigeny, data.legSzennyezes,
    data.vegyiAnyag, data.dekoracio, data.felelos, data.lakcim,
    data.tovabbiSzervezo, data.tovabbiTelefon, data.tovabbiEmail,
    data.tovabbiNeptun, data.tovabbiLakcim, data.megrendeloNev,
    data.megrendeloCim, data.megrendeloAdo, data.megrendeloTelefon,
    data.megrendeloEmail
  ];

  try {
    const result = await pool.query(sql, values);
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ message: error.message });
  }
};
const updateKerveny = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const sql = `
    UPDATE kerveny SET
      nev = $1, statusz = $2, kezdo_datum = $3, helyszin = $4,
      letszam = $5, email = $6, telefonszam = $7, leiras = $8,
      cim = $9, veg_datum = $10, tipus = $11, minosites = $12,
      sajto = $13, jelleg = $14, programterv = $15,
      berendezesi_mod = $16, szallasigeny = $17, parkolo = $18,
      internet = $19, oktatastechnika = $20,
      korlatozott_mozgas = $21, foto = $22, cater = $23,
      epites = $24, epites_kezdet = $25, epites_veg = $26,
      epites_vallalkozok = $27, epites_magas = $28,
      epites_allvany = $29, epites_kezi = $30, epites_gepi = $31,
      takaritas = $32, villanyszerelo = $33, aramigeny = $34,
      leg_szennyezes = $35, vegyi_anyag = $36, dekoracio = $37,
      felelos = $38, lakcim = $39, tovabbi_szervezo = $40,
      tovabbi_telefon = $41, tovabbi_email = $42,
      tovabbi_neptun = $43, tovabbi_lakcim = $44,
      megrendelo_nev = $45, megrendelo_cim = $46,
      megrendelo_ado = $47, megrendelo_telefon = $48,
      megrendelo_email = $49
    WHERE id = $50
  `;

  const values = [
    data.nev, data.statusz, data.kezdoDatum, data.helyszin, data.letszam,
    data.email, data.telefonszam, data.leiras, data.cim, data.vegDatum,
    data.tipus, data.minosites, data.sajto, data.jelleg, data.programterv,
    data.berendezesiMod, data.szallasigeny, data.parkolo, data.internet,
    data.oktatastechnika, data.korlatozottMozgas, data.foto, data.cater,
    data.epites, data.epitesKezdet, data.epitesVeg, data.epitesVallalkozok,
    data.epitesMagas, data.epitesAllvany, data.epitesKezi, data.epitesGepi,
    data.takaritas, data.villanyszerelo, data.aramigeny, data.legSzennyezes,
    data.vegyiAnyag, data.dekoracio, data.felelos, data.lakcim,
    data.tovabbiSzervezo, data.tovabbiTelefon, data.tovabbiEmail,
    data.tovabbiNeptun, data.tovabbiLakcim, data.megrendeloNev,
    data.megrendeloCim, data.megrendeloAdo, data.megrendeloTelefon,
    data.megrendeloEmail,
    id
  ];

  try {
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Nem található kérvény ilyen id-val' });
    } else {
      res.status(200).json({ message: 'Sikeres módosítás' });
    }
  } catch (error) {
    console.error('HIba:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteKerveny = async (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM kerveny WHERE id = ?';
  
  pool.query(sql, [id], (error, results) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      if (results.affectedRows === 0) {
        res.status(404).json({ message: 'Nem található kérvény ilyen id-val' });
      } else {
        res.status(200).json({ message: 'Sikeres törlés' });
      }
    }
  });
};

module.exports = { getAllKerveny, getKervenyById, insertKerveny, updateKerveny, deleteKerveny  };