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
    data.nev || null,
    data.leiras || null,
    data.helyszin || null,
    data.cim || null,
    data.kezdo_datum || null,
    data.veg_datum || null,
    data.kezdo_idopont || null,
    data.veg_idopont || null,
    data.tipus || null,
    data.minosites || null,
    convertToBoolean(data.sajto),
    data.jelleg || null,
    data.programterv || null,
    data.berendezesi_mod || null,
    convertToBoolean(data.szallasigeny),
    data.szallasigeny_letszam || null,
    convertToBoolean(data.parkolo),
    data.parkolo_reszletek || null,
    convertToBoolean(data.internet),
    convertToBoolean(data.hulladek),
    data.hulladek_elszallitas_modja || null,
    data.hulladek_elszallitas_felelos || null,
    data.letszam || null,
    data.statusz || null,
    data.email || null,
    data.telefon || null,
    convertToBoolean(data.oktatastechnika),
    data.oktatas_eszkozok || null,
    convertToBoolean(data.korlatozott_mozgas),
    data.korlatozott_mozgas_reszletek || null,
    convertToBoolean(data.foto),
    data.foto_reszletek || null,
    convertToBoolean(data.cater),
    data.catering_tipus ? JSON.stringify(data.catering_tipus) : null,
    convertToBoolean(data.epites),
    data.epites_kezdet || null,
    data.epites_veg || null,
    data.epites_vallalkozok || null,
    convertToBoolean(data.epites_magas),
    convertToBoolean(data.epites_allvany),
    convertToBoolean(data.epites_kezi),
    convertToBoolean(data.epites_gepi),
    convertToBoolean(data.takaritas),
    convertToBoolean(data.takaritas_alatt),
    data.villanyszerelo || null,
    convertToBoolean(data.aramigeny),
    data.leg_szennyezes || null,
    data.egyeb_tevekenyseg || null,
    convertToBoolean(data.vegyi_anyag),
    data.vegyi_anyag_leiras || null,
    convertToBoolean(data.tuzveszelyes_tevekenyseg),
    data.tuzveszelyes_tevekenyseg_leiras || null,
    convertToBoolean(data.dekoracio),
    data.dekoracio_leiras || null,
    data.felelos || null,
    data.lakcim || null,
    convertToBoolean(data.tovabbi_szervezo) || null,
    data.tovabbi_telefon || null,
    data.tovabbi_email || null,
    data.tovabbi_neptun || null,
    data.tovabbi_lakcim || null,
    data.megrendelo_nev || null,
    data.megrendelo_cim || null,
    data.megrendelo_ado || null,
    data.megrendelo_telefon || null,
    data.megrendelo_email || null,
    convertToBoolean(data.portaszolgalat),
    data.portaszolgalat_leiras || null,
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
  const sql = `
    UPDATE kerveny SET
      nev = $1, statusz = $2, kezdo_datum = $3, kezdo_idopont = $4, veg_datum = $5, veg_idopont = $6, helyszin = $7,
      letszam = $8, email = $9, telefon = $10, leiras = $11, cim = $12, tipus = $13, minosites = $14, sajto = $15,
      jelleg = $16, programterv = $17, berendezesi_mod = $18, szallasigeny = $19, parkolo = $20, internet = $21,
      oktatastechnika = $22, oktatas_eszkozok = $23, // Új mező
      korlatozott_mozgas = $24, foto = $25, cater = $26, epites = $27, epites_kezdet = $28, epites_veg = $29, epites_vallalkozok = $30,
      epites_magas = $31, epites_allvany = $32, epites_kezi = $33, epites_gepi = $34, takaritas = $35, villanyszerelo = $36,
      aramigeny = $37, leg_szennyezes = $38, vegyi_anyag = $39, dekoracio = $40, felelos = $41, lakcim = $42, tovabbi_szervezo = $43,
      tovabbi_telefon = $44, tovabbi_email = $45, tovabbi_neptun = $46, tovabbi_lakcim = $47, megrendelo_nev = $48, megrendelo_cim = $49,
      megrendelo_ado = $50, megrendelo_telefon = $51, megrendelo_email = $52
    WHERE id = $53
  `;

  const values = [
    data.nev, data.statusz, data.kezdo_datum, data.kezdo_idopont, data.veg_datum, data.veg_idopont, data.helyszin, data.letszam,
    data.email, data.telefon, data.leiras, data.cim, data.tipus, data.minosites, data.sajto, data.jelleg, data.programterv,
    data.berendezesi_mod, data.szallasigeny, data.parkolo, data.internet, data.oktatastechnika, data.oktatas_eszkozok, // Új mező
    data.korlatozott_mozgas, data.foto, data.cater, data.epites, data.epites_kezdet, data.epites_veg, data.epites_vallalkozok,
    data.epites_magas, data.epites_allvany, data.epites_kezi, data.epites_gepi, data.takaritas, data.villanyszerelo,
    data.aramigeny, data.leg_szennyezes, data.vegyi_anyag, data.dekoracio, data.felelos, data.lakcim, data.tovabbi_szervezo,
    data.tovabbi_telefon, data.tovabbi_email, data.tovabbi_neptun, data.tovabbi_lakcim, data.megrendelo_nev, data.megrendelo_cim,
    data.megrendelo_ado, data.megrendelo_telefon, data.megrendelo_email, id
  ];

  try {
    const result = await pool.query(sql, values);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Nem található kérvény ilyen ID-val' });
    } else {
      res.status(200).json({ message: 'Sikeres módosítás' });
    }
  } catch (error) {
    console.error('Hiba a frissítés során:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllKerveny,
  getKervenyById,
  insertKerveny,
  updateKerveny,
};