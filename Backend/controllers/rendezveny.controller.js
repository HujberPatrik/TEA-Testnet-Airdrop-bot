const pool = require('../config/db');
const { sendSuccessEmail } = require('../emailService');
require('dotenv').config();

// ÚJ: támogatott státuszkódok + legacy numerikus mapping
const ALLOWED_STATUS_CODES = [
  'ARAJANLAT_KESZITES_FOLYAMATBAN',
  'UF_ARAJANLATRA_VAR',
  'UF_ARAJANLAT_ELFOGADASARA_VAR',
  'ARAJANLAT_KESZITESERE_VAR',
  'ARAJANLAT_ELFOGADASRA_VAR',
  'SZERZODES_ADATOKRA_VAR',
  'SZERZODES_ATNEZESRE_VAR',
  'SZERZODES_KIKULDESRE_VAR',
  'SZERZODES_PARTNERI_ALAIRASRA_VAR',
  'SZERZODES_EGYETEMI_ALAIRASRA_VAR',
  'SZERZODES_ALAIRVA',
  'MEGVALOSITASRA_VAR',
  'MEGVALOSULT_UF_IGAZOLASRA_VAR',
  'UF_TIG_JOVAHAGYASRA_VAR',
  'ADATKOZLO_GENERALASRA_VAR',
  'ADATKOZLO_FELKULDVE',
  'LEZARVA',
  'ELUTASITVA',
  'LEMONDVA'
];

const LEGACY_NUMERIC_MAP = {
  0: 'ARAJANLAT_KESZITES_FOLYAMATBAN',
  1: 'UF_ARAJANLAT_ELFOGADASARA_VAR',
  2: 'SZERZODES_ALAIRVA',
  3: 'ELUTASITVA',
  4: 'LEZARVA'
};

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
    if (value === 'igen') return true;
    if (value === 'nem') return false;
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
    data.hulladek_elszallitas_modja || null, data.hulladek_elszallitas_felelos || null, data.letszam || null, data.statusz || 0,
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

    // Hívja meg az emailService-t
    await sendSuccessEmail(data.email, data.megrendelo_nev);

    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Hiba a kérvény beszúrása során:', error);
    res.status(500).json({ message: 'Hiba történt a kérvény beszúrása során.' });
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

// Helper: státusz rekord lekérése kódból vagy id-ból
async function resolveStatusRecord(input) {
  // input lehet: { code: 'ARAJANLAT_KESZITES_FOLYAMATBAN' } vagy { id: 3 }
  if (!input) return null;
  if (input.id) {
    const { rows } = await pool.query(
      'SELECT id, code, label, phase, terminal FROM statusz WHERE id = $1 AND active = TRUE',
      [input.id]
    );
    return rows[0] || null;
  }
  if (input.code) {
    const code = String(input.code).trim().toUpperCase();
    const { rows } = await pool.query(
      'SELECT id, code, label, phase, terminal FROM statusz WHERE code = $1 AND active = TRUE',
      [code]
    );
    return rows[0] || null;
  }
  return null;
}

// Csak státusz frissítése (ÚJ / FELÜLÍR)
const updateKervenyStatus = async (req, res) => {
  const { id } = req.params;
  let { statusz, statusz_code, statusz_id } = req.body;

  if (
    statusz === undefined &&
    statusz_code === undefined &&
    statusz_id === undefined
  ) {
    return res.status(400).json({ message: 'Adj meg statusz (kód) vagy statusz_id mezőt.' });
  }

  try {
    // Oszlopok + típusok felderítése
    const colQuery = await pool.query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_name = 'kerveny'
         AND column_name IN ('statusz_id','statusz');`
    );
    const cols = colQuery.rows;
    const hasStatuszId = cols.some(c => c.column_name === 'statusz_id');
    const hasStatuszText = cols.some(c => c.column_name === 'statusz');

    // 1. Bemenet normalizálása -> kód lesz (upper)
    let codeCandidate = statusz_code ?? statusz;
    if (statusz_id != null) {
      // Ha direkt id-t küldtek, megpróbáljuk kikeresni a kódját (opcionális)
      const r = await pool.query(
        'SELECT id, code FROM statusz WHERE id = $1 LIMIT 1',
        [statusz_id]
      );
      if (!r.rowCount) {
        return res.status(400).json({ message: 'Ismeretlen statusz_id.' });
      }
      codeCandidate = r.rows[0].code;
    }

    if (!codeCandidate || String(codeCandidate).trim() === '') {
      return res.status(400).json({ message: 'Üres státuszkód.' });
    }
    const statusCode = String(codeCandidate).trim().toUpperCase();

    // 2. Lekérjük a statusz táblából (ha létezik)
    let statusRecord = null;
    try {
      const sr = await pool.query(
        `SELECT id, code, label, phase, terminal
         FROM statusz
         WHERE (code = $1 OR UPPER(code) = $1)
           AND (active = TRUE OR active IS NULL)
         LIMIT 1`,
        [statusCode]
      );
      if (sr.rowCount) statusRecord = sr.rows[0];
    } catch (e) {
      // Ha nincs statusz tábla, egyszerűen haladunk tovább statusRecord nélkül
      console.warn('[updateKervenyStatus] statusz tábla nem érhető el vagy lekérdezési hiba (nem kritikus átmenetileg).');
    }

    if (!statusRecord && !hasStatuszText && hasStatuszId) {
      return res.status(400).json({ message: 'Ismeretlen státuszkód (és nincs text statusz mező fallback).' });
    }

    // 3. Döntés: melyik mezőt frissítjük
    //    a) Ha van statusz_id integer mező és VAN numeric id (statusRecord.id számszerű)
    //    b) Egyébként ha van text statusz mező -> azt frissítjük
    //    c) Ha csak statusz_id van, de statusRecord nincs vagy id nem számszerű -> hiba
    let updated;
    if (hasStatuszId) {
      // Ellenőrizzük hogy statusRecord.id használható-e integerként
      const needsNumeric = cols.find(c => c.column_name === 'statusz_id')?.data_type.includes('int');
      const numericId = statusRecord ? parseInt(statusRecord.id, 10) : NaN;

      if (statusRecord && (!needsNumeric || !Number.isNaN(numericId))) {
        // Normál FK update
        const upd = await pool.query(
          'UPDATE kerveny SET statusz_id = $1 WHERE id = $2 RETURNING *',
          [numericId, id]
        );
        if (!upd.rowCount) return res.status(404).json({ message: 'Nem található kérvény.' });
        updated = upd.rows[0];
      } else if (hasStatuszText) {
        // Fallback: text mező frissítése (átmeneti állapot)
        const upd = await pool.query(
          'UPDATE kerveny SET statusz = $1 WHERE id = $2 RETURNING *',
          [statusCode, id]
        );
        if (!upd.rowCount) return res.status(404).json({ message: 'Nem található kérvény.' });
        updated = upd.rows[0];
      } else {
        return res.status(500).json({
          message: 'statusz_id integer mező van, de a statusz táblában nincs megfelelő numerikus id ehhez a kódhoz.'
        });
      }
    } else if (hasStatuszText) {
      // Csak text oszlop
      const upd = await pool.query(
        'UPDATE kerveny SET statusz = $1 WHERE id = $2 RETURNING *',
        [statusCode, id]
      );
      if (!upd.rowCount) return res.status(404).json({ message: 'Nem található kérvény.' });
      updated = upd.rows[0];
    } else {
      return res.status(500).json({ message: 'Nincs statusz/statusz_id oszlop a kerveny táblában.' });
    }

    // 4. Válasz (mindig adunk statusz kódot)
    return res.status(200).json({
      ...updated,
      statusz: statusRecord ? statusRecord.code : statusCode,
      statusz_meta: statusRecord || null
    });
  } catch (error) {
    console.error('updateKervenyStatus hiba:', error);
    return res.status(500).json({ message: 'Belső hiba státusz frissítés közben.' });
  }
};

module.exports = {
  getAllKerveny,
  getKervenyById,
  insertKerveny,
  updateKerveny,
  updateKervenyStatus
};
