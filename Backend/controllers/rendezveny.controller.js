const pool = require('../config/db');
const { sendSuccessEmail, sendRejectionEmail } = require('../emailService');
require('dotenv').config();

// ÚJ: támogatott státuszkódok + legacy numerikus mapping
const ALLOWED_STATUS_CODES = [
  'BEERKEZETT',
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

const DEFAULT_STATUS_CODE = 'BEERKEZETT';

const LEGACY_NUMERIC_MAP = {
  0: 'BEERKEZETT',
  1: 'UF_ARAJANLAT_ELFOGADASARA_VAR',
  2: 'SZERZODES_ALAIRVA',
  3: 'ELUTASITVA',
  4: 'LEZARVA'
};

const TARGET_STATUS_AFTER_COST = 'UF_ARAJANLAT_ELFOGADASARA_VAR'; // mentés után erre váltunk

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
  try {
    const data = req.body;

    const statusRaw =
      data.statusz ??
      data.status ??
      data.statusz_code ??
      data.status_code ??
      data.statusz_id ??
      data.statusId ??
      null;

    let normalizedStatus = null;
    if (typeof statusRaw === 'number') {
      normalizedStatus = LEGACY_NUMERIC_MAP[statusRaw] || null;
    } else if (typeof statusRaw === 'string') {
      const tmp = statusRaw.trim().toUpperCase();
      normalizedStatus = ALLOWED_STATUS_CODES.includes(tmp) ? tmp : null;
    }

    if (!normalizedStatus) normalizedStatus = DEFAULT_STATUS_CODE;

    // (Debug – ideiglenes) console.log('INSERT status:', statusRaw, '=>', normalizedStatus);

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
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,
        $26,$27,$28,$29,$30,$31,
        $32,$33,$34,$35,$36,$37,$38,$39,
        $40,$41,$42,$43,$44,$45,
        $46,$47,$48,$49,$50,$51,
        $52,$53,$54,$55,
        $56,$57,$58,$59,$60,
        $61,$62,$63,$64,$65,
        $66,$67,$68,$69
      )
      RETURNING *;
    `;

    const toBool = v => v === true || v === 'igen';

    const values = [
      data.nev || null, data.leiras || null, data.helyszin || null, data.cim || null, data.kezdo_datum || null, data.veg_datum || null, data.kezdo_idopont || null, data.veg_idopont || null,
      data.tipus || null, data.minosites || null, toBool(data.sajto), data.jelleg || null, data.programterv || null, data.berendezesi_mod || null, toBool(data.szallasigeny),
      data.szallasigeny_letszam || null, toBool(data.parkolo), data.parkolo_reszletek || null, toBool(data.internet), toBool(data.hulladek),
      data.hulladek_elszallitas_modja || null, data.hulladek_elszallitas_felelos || null, data.letszam || null, normalizedStatus,
      data.email || null, data.telefon || null, toBool(data.oktatastechnika), data.oktatas_eszkozok || null, toBool(data.korlatozott_mozgas), data.korlatozott_mozgas_reszletek || null,
      toBool(data.foto), data.foto_reszletek || null, toBool(data.cater), data.catering_tipus ? JSON.stringify(data.catering_tipus) : null, toBool(data.epites), data.epites_kezdet || null, data.epites_veg || null, data.epites_vallalkozok || null,
      toBool(data.epites_magas), toBool(data.epites_allvany), toBool(data.epites_kezi), toBool(data.epites_gepi), toBool(data.takaritas), toBool(data.takaritas_alatt),
      data.villanyszerelo || null, toBool(data.aramigeny), data.leg_szennyezes || null, data.egyeb_tevekenyseg || null, toBool(data.vegyi_anyag), data.vegyi_anyag_leiras || null,
      toBool(data.tuzveszelyes_tevekenyseg), data.tuzveszelyes_tevekenyseg_leiras || null, toBool(data.dekoracio), data.dekoracio_leiras || null,
      data.felelos || null, data.lakcim || null, toBool(data.tovabbi_szervezo), data.tovabbi_telefon || null, data.tovabbi_email || null,
      data.tovabbi_neptun || null, data.tovabbi_lakcim || null, data.megrendelo_nev || null, data.megrendelo_cim || null, data.megrendelo_ado || null,
      data.megrendelo_telefon || null, data.megrendelo_email || null, toBool(data.portaszolgalat), data.portaszolgalat_leiras || null
    ];

    const result = await pool.query(sql, values);
    return res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Insert hiba' });
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
  const { statusz, reason } = req.body; // reason opcionális indoklás
  try {
    const q = 'UPDATE kerveny SET statusz = $1 WHERE id = $2 RETURNING *';
    const { rows, rowCount } = await pool.query(q, [statusz, id]);
    if (!rowCount) return res.status(404).json({ message: 'Nem található kérvény ilyen ID-val' });

    const updated = rows[0];

    // Ha ELUTASITVA lett, küldjünk értesítőt
    const newCode = String(statusz).toUpperCase();
    if (newCode === 'ELUTASITVA') {
      // best-effort, ne blokkolja a válaszküldést, de itt await-eljük hogy lássuk a hibát a logban
      try {
        await sendRejectionEmail(updated.email, updated.felelos, reason);
      } catch (e) {
        console.error('Elutasítás email küldés sikertelen:', e.message);
      }
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Hiba a státusz frissítése során:', error);
    res.status(500).json({ message: error.message });
  }
};

async function saveCostsAndAdvance(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { breakdown, total } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (!Array.isArray(breakdown)) return res.status(400).json({ error: 'Invalid breakdown' });

    await client.query('BEGIN');

    await client.query('DELETE FROM kerveny_koltseg WHERE kerveny_id = $1', [id]);

    const insertText = `
      INSERT INTO kerveny_koltseg
        (kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;

    for (const row of breakdown) {
      await client.query(insertText, [
        id,
        row.serviceId || null,
        row.serviceName || null,
        row.rateKey || null,
        row.unit || null,
        row.hours || 0,
        row.persons || 0,
        row.unitPrice || 0,
        row.lineTotal || 0
      ]);
    }

    await client.query(`
      ALTER TABLE kerveny
      ADD COLUMN IF NOT EXISTS koltseg_osszesen NUMERIC(14,2)
    `);

    const result = await client.query(
      'UPDATE kerveny SET koltseg_osszesen = $2, statusz = $3 WHERE id = $1 RETURNING id,statusz,koltseg_osszesen',
      [id, total || 0, TARGET_STATUS_AFTER_COST]
    );

    await client.query('COMMIT');
    res.json({ ok: true, event: result.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('saveCostsAndAdvance error', e);
    res.status(500).json({ error: 'Cost save failed' });
  } finally {
    client.release();
  }
}

module.exports = {
  getAllKerveny,
  getKervenyById,
  insertKerveny,
  updateKerveny,
  updateKervenyStatus,
  saveCostsAndAdvance
};
