const pool = require('../config/db');

// Összes kérvény lekérdezése
const getAllKerveny = async (req, res) => {
  const sql = 'SELECT * FROM kerveny';
  pool.query(sql, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || 'Ismeretlen hiba történt',
      });
    } else {
      res.send(data.rows);
    }
  });
};

// Egy kérvény lekérdezése ID alapján
const getKervenyById = async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM kerveny WHERE id = $1';

  pool.query(sql, [id], (error, results) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else if (results.rows.length === 0) {
      res.status(404).json({ message: 'Nem található rekord ilyen ID-val' });
    } else {
      res.status(200).json(results.rows[0]);
    }
  });
};

// Új kérvény beszúrása
const insertKerveny = async (req, res) => {
  const data = req.body;

  const convertToBoolean = (value) => {
    if (value === "igen") return true;
    if (value === "nem") return false;
    return null;
  };

  const sql = `
  INSERT INTO kerveny (
    nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont,
    tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny,
    szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek,
    hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, statusz,
    email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek,
    foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok,
    epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt,
    villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras,
    tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras,
    felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email,
    tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado,
    megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
    $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
    $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56,
    $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68
  )
  RETURNING id
  `;
  
  const values = [
    data.nev || null, data.leiras || null, data.helyszin || null, data.cim || null, data.kezdo_datum || null, data.veg_datum || null, data.kezdo_idopont || null, data.veg_idopont || null,
    data.tipus || null, data.minosites || null, convertToBoolean(data.sajto), data.jelleg || null, data.programterv || null, data.berendezesi_mod || null, convertToBoolean(data.szallasigeny),
    data.szallasigeny_letszam || null, convertToBoolean(data.parkolo), data.parkolo_reszletek || null, convertToBoolean(data.internet), convertToBoolean(data.hulladek),
    data.hulladek_elszallitas_modja || null, data.hulladek_elszallitas_felelos || null, data.letszam || null, data.statusz || null,
    data.email || null, data.telefon || null, convertToBoolean(data.oktatastechnika), data.oktatas_eszkozok || null, convertToBoolean(data.korlatozott_mozgas), data.korlatozott_mozgas_reszletek || null,
    convertToBoolean(data.foto), data.foto_reszletek || null, convertToBoolean(data.cater), data.catering_tipus ? JSON.stringify(data.catering_tipus) : null, convertToBoolean(data.epites), data.epites_kezdet || null, data.epites_veg || null, data.epites_vallalkozok || null,
    convertToBoolean(data.epites_magas), convertToBoolean(data.epites_allvany), convertToBoolean(data.epites_kezi), convertToBoolean(data.epites_gepi), convertToBoolean(data.takaritas), convertToBoolean(data.takaritas_alatt),
    data.villanyszerelo || null, convertToBoolean(data.aramigeny), data.leg_szennyezes || null, data.egyeb_tevekenyseg || null, convertToBoolean(data.vegyi_anyag), data.vegyi_anyag_leiras || null,
    convertToBoolean(data.tuzveszelyes_tevekenyseg), data.tuzveszelyes_tevekenyseg_leiras || null, convertToBoolean(data.dekoracio), data.dekoracio_leiras || null,
    data.felelos || null, data.lakcim || null, convertToBoolean(data.tovabbi_szervezo) || null, data.tovabbi_telefon || null, data.tovabbi_email || null,
    data.tovabbi_neptun || null, data.tovabbi_lakcim || null, data.megrendelo_nev || null, data.megrendelo_cim || null, data.megrendelo_ado || null,
    data.megrendelo_telefon || null, data.megrendelo_email || null, convertToBoolean(data.portaszolgalat), data.portaszolgalat_leiras || null,
  ];

  try {
    const result = await pool.query(sql, values);
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Hiba az adatbázis művelet során:', error);
    res.status(500).json({ error: 'Adatbázis hiba történt.', details: error.message });
  }
};

// Kérvény frissítése ID alapján
const updateKerveny = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  console.log('Frissítési adatok:', data); // Debug log az adatokhoz

  const convertToBoolean = (value) => {
    if (value === "igen") return true;
    if (value === "nem") return false;
    return null;
  };

  const sql = `
    UPDATE kerveny SET
      nev = $1, leiras = $2, helyszin = $3, cim = $4, kezdo_datum = $5, veg_datum = $6, kezdo_idopont = $7, veg_idopont = $8,
      tipus = $9, minosites = $10, sajto = $11, jelleg = $12, programterv = $13, berendezesi_mod = $14, szallasigeny = $15,
      szallasigeny_letszam = $16, parkolo = $17, parkolo_reszletek = $18, internet = $19, hulladek = $20,
      hulladek_elszallitas_modja = $21, hulladek_elszallitas_felelos = $22, letszam = $23, statusz = $24,
      email = $25, telefon = $26, oktatastechnika = $27, oktatas_eszkozok = $28, korlatozott_mozgas = $29, korlatozott_mozgas_reszletek = $30,
      foto = $31, foto_reszletek = $32, cater = $33, catering_tipus = $34, epites = $35, epites_kezdet = $36, epites_veg = $37, epites_vallalkozok = $38,
      epites_magas = $39, epites_allvany = $40, epites_kezi = $41, epites_gepi = $42, takaritas = $43, takaritas_alatt = $44,
      villanyszerelo = $45, aramigeny = $46, leg_szennyezes = $47, egyeb_tevekenyseg = $48, vegyi_anyag = $49, vegyi_anyag_leiras = $50,
      tuzveszelyes_tevekenyseg = $51, tuzveszelyes_tevekenyseg_leiras = $52, dekoracio = $53, dekoracio_leiras = $54,
      felelos = $55, lakcim = $56, tovabbi_szervezo = $57, tovabbi_telefon = $58, tovabbi_email = $59,
      tovabbi_neptun = $60, tovabbi_lakcim = $61, megrendelo_nev = $62, megrendelo_cim = $63, megrendelo_ado = $64,
      megrendelo_telefon = $65, megrendelo_email = $66, portaszolgalat = $67, portaszolgalat_leiras = $68
    WHERE id = $69
    RETURNING *; -- Visszaadja a frissített rekordot
  `;

  const values = [
    data.nev || null, data.leiras || null, data.helyszin || null, data.cim || null, 
    data.kezdo_datum || null, data.veg_datum || null, data.kezdo_idopont || null, data.veg_idopont || null,
    data.tipus || null, data.minosites || null, convertToBoolean(data.sajto), data.jelleg || null, 
    data.programterv || null, data.berendezesi_mod || null, convertToBoolean(data.szallasigeny),
    data.szallasigeny_letszam || null, convertToBoolean(data.parkolo), data.parkolo_reszletek || null, 
    convertToBoolean(data.internet), convertToBoolean(data.hulladek), data.hulladek_elszallitas_modja || null, 
    data.hulladek_elszallitas_felelos || null, data.letszam || null, data.statusz || null,
    data.email || null, data.telefon || null, convertToBoolean(data.oktatastechnika), data.oktatas_eszkozok || null, 
    convertToBoolean(data.korlatozott_mozgas), data.korlatozott_mozgas_reszletek || null,
    convertToBoolean(data.foto), data.foto_reszletek || null, convertToBoolean(data.cater), 
    data.catering_tipus ? JSON.stringify(data.catering_tipus) : null, convertToBoolean(data.epites), 
    data.epites_kezdet || null, data.epites_veg || null, data.epites_vallalkozok || null,
    convertToBoolean(data.epites_magas), convertToBoolean(data.epites_allvany), convertToBoolean(data.epites_kezi), 
    convertToBoolean(data.epites_gepi), convertToBoolean(data.takaritas), convertToBoolean(data.takaritas_alatt),
    data.villanyszerelo || null, convertToBoolean(data.aramigeny), data.leg_szennyezes || null, 
    data.egyeb_tevekenyseg || null, convertToBoolean(data.vegyi_anyag), data.vegyi_anyag_leiras || null,
    convertToBoolean(data.tuzveszelyes_tevekenyseg), data.tuzveszelyes_tevekenyseg_leiras || null, 
    convertToBoolean(data.dekoracio), data.dekoracio_leiras || null, data.felelos || null, data.lakcim || null, 
    convertToBoolean(data.tovabbi_szervezo) || null, data.tovabbi_telefon || null, data.tovabbi_email || null,
    data.tovabbi_neptun || null, data.tovabbi_lakcim || null, data.megrendelo_nev || null, 
    data.megrendelo_cim || null, data.megrendelo_ado || null, data.megrendelo_telefon || null, 
    data.megrendelo_email || null, convertToBoolean(data.portaszolgalat), data.portaszolgalat_leiras || null, id
  ];

  try {
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Nem található kérvény ilyen ID-val' });
    } else {
      res.status(200).json(result.rows[0]); // Visszaküldi a frissített adatokat
    }
  } catch (error) {
    console.error('Hiba a frissítés során:', error);
    res.status(500).json({ message: error.message });
  }
};

// Csak a kérvény státuszának frissítése
const updateKervenyStatus = async (req, res) => {
  const { id } = req.params;
  const { statusz } = req.body;

  if (statusz === undefined) {
    return res.status(400).json({ message: 'A státusz mező kötelező' });
  }

  const sql = `UPDATE kerveny SET statusz = $1 WHERE id = $2 RETURNING *`;

  try {
    const result = await pool.query(sql, [statusz, id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Nem található kérvény ilyen ID-val' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Hiba a státusz frissítése során:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllKerveny,
  getKervenyById,
  insertKerveny,
  updateKerveny,
  updateKervenyStatus // Exportáljuk az új metódust
};
