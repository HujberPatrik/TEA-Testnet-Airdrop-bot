const pool = require('../config/db');
const { generateCombinedUniversityAndUfOffer, generateUniversityOfferFromCosts } = require('../documentService');
const emailService = require('../emailService'); // transporter + sablonok
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

// segédfüggvények az egységhez
function normUnit(s) {
  return (s ?? '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
function calcMultiplier(u, { hours=0, persons=0, days=0, occasions=0, quantity=0 }) {
  const unit = normUnit(u);
  if (unit.includes('db/alkalom')) return (quantity || 0) * (occasions || 0);
  if (unit.includes('fo/ora'))     return (persons || 0) * (hours || 0);
  if (unit.includes('nap'))        return (days || 0);
  if (unit.includes('ora'))        return (hours || 0);
  if (unit === 'fo' || unit.includes(' fo')) return (persons || 0);
  if (unit.includes('alkalom'))    return (occasions || 0);
  if (unit === 'db' || unit.includes(' db')) return (quantity || 0);
  // fallback
  return (persons || 0) * (hours || 0);
}

async function saveCostsAndAdvance(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { breakdown, total } = req.body || {};
    // A kliens által jelzett típus csak a takarításhoz kell; a soroknál mindig a prices.kategoria dönt.
    const rawType = (req.body?.pricingType || req.body?.type || '').toString().toLowerCase();
    const pricingType = ['uni', 'egyetemi', 'university'].includes(rawType) ? 'uni' : 'famulus';

    // user_id: szigorú egész szám (body → header → auth)
    const parseIntStrict = (v) => {
      const n = Number.parseInt(v, 10);
      return Number.isInteger(n) && n > 0 ? n : null;
    };
    const userId =
      parseIntStrict(req.body?.user_id ?? req.body?.userId) ??
      parseIntStrict(req.headers['x-user-id']) ??
      parseIntStrict(req.user?.id ?? req.user?.user_id ?? req.user?.userId) ??
      null;

    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (!Array.isArray(breakdown)) return res.status(400).json({ error: 'Invalid breakdown' });
    if (userId === null) return res.status(400).json({ error: 'Missing or invalid user_id (integer required)' });

    const isUniCategory = (cat) => (cat || '').trim().toLowerCase() === 'egyetemi';

    const RATE_KEYS = new Set(['priceUniversity','priceUniversityWeekend','priceExternal','priceExternalWeekend']);

    await client.query('BEGIN');

    // csak az adott pricing_type-ú régi sorok törlése
    const deleteSql = pricingType === 'uni'
      ? `DELETE FROM kerveny_koltseg WHERE kerveny_id = $1 AND lower(pricing_type) = 'uni'`
      : `DELETE FROM kerveny_koltseg WHERE kerveny_id = $1 AND lower(pricing_type) = 'famulus'`;
    await client.query(deleteSql, [id]);

    const insertSql = `
      INSERT INTO kerveny_koltseg
        (kerveny_id, service_id, service_name, rate_key, unit,
         hours, persons, days, occasions, quantity,
         unit_price, line_total, user_id, pricing_type)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`;

    let inserted = 0;

    for (const r of breakdown) {
      const serviceId = Number(r.serviceId) || null;
      if (!serviceId) continue;

      const rateKey = String(r.rateKey || 'priceUniversity');
      if (!RATE_KEYS.has(rateKey)) continue;

      const hours = Number(r.hours) || 0;
      const persons = Number(r.persons) || 0;
      const days = Number(r.days) || 0;
      const occasions = Number(r.occasions) || 0;
      const quantity = Number(r.quantity) || 0;

      const pr = await client.query(
        `SELECT id, megnevezes, kategoria, mertekegyseg,
                ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege
           FROM prices WHERE id = $1`, [serviceId]);
      if (pr.rowCount === 0) continue;

      const p = pr.rows[0];
      // A sor pricing_type-je mindig a prices.kategoria alapján dől el.
      const rowPricingType = isUniCategory(p.kategoria) ? 'uni' : 'famulus';
      // Csak azokat szúrjuk most, amelyik a kért csoportba tartozik (törlés is aszerint történt).
      if (pricingType !== rowPricingType) continue;

      const unitPriceMap = {
        priceUniversity: Number(p.ar_egyetem) || 0,
        priceUniversityWeekend: Number(p.ar_egyetem_hetvege) || 0,
        priceExternal: Number(p.ar_kulso) || 0,
        priceExternalWeekend: Number(p.ar_kulso_hetvege) || 0
      };
      const unit_price = unitPriceMap[rateKey] || 0;
      const multiplier = calcMultiplier(p.mertekegyseg, { hours, persons, days, occasions, quantity });
      const line_total = unit_price * multiplier;

      await client.query(insertSql, [
        id, p.id, p.megnevezes || null, rateKey, p.mertekegyseg || null,
        hours, persons, days, occasions, quantity,
        unit_price, line_total, userId, rowPricingType
      ]);
      inserted++;
    }

    // főösszeg frissítése
    const sumRes = await client.query(
      'SELECT COALESCE(SUM(line_total),0) AS s FROM kerveny_koltseg WHERE kerveny_id = $1',
      [id]
    );
    const newTotal = Number(sumRes.rows[0]?.s || 0);

    // UF mentésnél opcionális státuszléptetés (ha kell)
    if (pricingType === 'famulus') {
      await client.query('UPDATE kerveny SET koltseg_osszesen = $2 WHERE id = $1', [id, newTotal]);
      // státuszt a frontend külön PATCH-eli, így itt nem írunk bele
    } else {
      await client.query('UPDATE kerveny SET koltseg_osszesen = $2 WHERE id = $1', [id, newTotal]);
    }

    await client.query('COMMIT');
    res.json({ ok: true, pricingType, inserted, total: newTotal, clientTotal: Number(total) || 0 });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message || 'Mentési hiba' });
  } finally {
    client.release();
  }
}

const getFamulusPricesByKervenyId = async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      kk.id, kk.kerveny_id, kk.service_id, kk.service_name,
      kk.rate_key, kk.unit,
      kk.hours, kk.persons, kk.days, kk.occasions, kk.quantity,
      kk.unit_price, kk.line_total, kk.user_id
    FROM kerveny_koltseg kk
    WHERE kk.kerveny_id = $1
      AND lower(kk.pricing_type) = 'famulus'
    ORDER BY kk.id ASC`;
  pool.query(sql, [id], (error, results) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(200).json(results.rows || []);
    }
  });
};

const getUniversityPricesByKervenyId = async (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      kk.id, kk.kerveny_id, kk.service_id, kk.service_name,
      kk.rate_key, kk.unit,
      kk.hours, kk.persons, kk.days, kk.occasions, kk.quantity,
      kk.unit_price, kk.line_total, kk.user_id
    FROM kerveny_koltseg kk
    WHERE kk.kerveny_id = $1
      AND lower(kk.pricing_type) = 'uni'
    ORDER BY kk.id ASC`;
  pool.query(sql, [id], (error, results) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(200).json(results.rows || []);
    }
  });
};

async function clearCostsForType(kervenyId, type) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sql = (type === 'uni')
      ? `DELETE FROM kerveny_koltseg WHERE kerveny_id = $1 AND lower(pricing_type) = 'uni'`
      : `DELETE FROM kerveny_koltseg WHERE kerveny_id = $1 AND lower(pricing_type) = 'famulus'`;
    await client.query(sql, [kervenyId]);
    // összeg frissítése
    const sumRes = await client.query(
      'SELECT COALESCE(SUM(line_total),0) AS s FROM kerveny_koltseg WHERE kerveny_id = $1',
      [kervenyId]
    );
    const total = Number(sumRes.rows[0]?.s || 0);
    await client.query('UPDATE kerveny SET koltseg_osszesen = $2 WHERE id = $1', [kervenyId, total]);
    await client.query('COMMIT');
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Egyetemi árajánlat DOCX letöltés
async function downloadUniversityDocx(req, res) {
  try {
    const { id } = req.params;
    const buffer = await (generateCombinedUniversityAndUfOffer
      ? generateCombinedUniversityAndUfOffer(id)
      : generateUniversityOfferFromCosts(id)); // fallback
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="egyetemi-ajanlat-${id}.docx"`);
    res.send(buffer);
  } catch (e) {
    console.error('downloadUniversityDocx error:', e);
    res.status(500).json({ message: 'DOCX generálás hiba' });
  }
}

// DOCX tag-ek listázása (segítség a sablonhoz)
async function listUniversityDocxTags(req, res) {
  try {
    const { id } = req.params;
    const tags = await getUniversityDocxTags(id);
    res.json(tags);
  } catch (e) {
    console.error('listUniversityDocxTags error:', e);
    res.status(500).json({ message: e.message });
  }
}

// Lemondás e-mail küldése
async function sendCancelMail(req, res) {
  try {
    const { email, felelos, eventNev, reason } = req.body || {};
    const to = email || process.env.MAIL_TEST_TO;
    if (!to) return res.status(400).json({ message: 'Hiányzó email címzett.' });
    await emailService.sendCancelEmail(to, felelos, eventNev, reason);
    res.json({ ok: true });
  } catch (e) {
    console.error('sendCancelMail error:', e);
    res.status(500).json({ ok: false, message: 'Lemondás e-mail küldési hiba.' });
  }
}

// ÚJ: laza bool konverzió
function coerceBoolLoose(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1','true','t','yes','y','on','igen','kulso','kulsos','külsős','external','extern'].includes(s)) return true;
    if (['0','false','f','no','n','off','nem','belso','belsos','belső','internal','intern'].includes(s)) return false;
  }
  return null; // hagyjuk NULL-ra, ha nincs értelmezhető input
}

// ÚJ: részleges frissítés – kulso_e (és opcionálisan statusz, modositasi_indok)
async function patchKervenyFields(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Érvénytelen azonosító' });

  const allowed = ['kulso_e', 'statusz', 'modositasi_indok'];
  const fields = req.body || {};

  const sets = [];
  const vals = [];
  let i = 1;

  for (const key of allowed) {
    if (fields[key] === undefined) continue;
    if (key === 'kulso_e') {
      const b = coerceBoolLoose(fields[key]);
      if (b === null && fields[key] !== null) {
        return res.status(400).json({ error: 'Érvénytelen kulso_e érték' });
      }
      sets.push(`kulso_e = $${i++}`);
      vals.push(b);
    } else {
      sets.push(`${key} = $${i++}`);
      vals.push(fields[key]);
    }
  }

  if (sets.length === 0) return res.status(400).json({ error: 'Nincs frissítendő mező' });

  vals.push(id);

  const sql = `UPDATE kerveny SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`;

  try {
    const { rows } = await pool.query(sql, vals);
    if (!rows.length) return res.status(404).json({ error: 'Nem található kérvény' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('patchKervenyFields error:', { code: err.code, detail: err.detail, message: err.message, sql, vals });
    // tipikus ok: oszlop nem létezik -> futtasd a migrációt
    return res.status(500).json({ error: err.detail || err.message });
  }
};

// Kervényenként az ajánlatot adó neve + ajánlat összege (pricing_type: famulus / uni)
async function getOfferProvidersForEvents(req, res) {
  const client = await pool.connect();
  try {
    const raw = req.body?.ids || req.query?.ids || [];
    const ids = Array.isArray(raw) ? raw.map(x => parseInt(x, 10)).filter(Number.isInteger) : [];
    if (!ids.length) return res.json([]);

    const sql = `
      WITH last_famulus AS (
        SELECT DISTINCT ON (kk.kerveny_id)
               kk.kerveny_id, kk.user_id
        FROM kerveny_koltseg kk
        WHERE kk.user_id IS NOT NULL
          AND lower(kk.pricing_type) = 'famulus'
        ORDER BY kk.kerveny_id, kk.id DESC
      ),
      last_uni AS (
        SELECT DISTINCT ON (kk.kerveny_id)
               kk.kerveny_id, kk.user_id
        FROM kerveny_koltseg kk
        WHERE kk.user_id IS NOT NULL
          AND lower(kk.pricing_type) = 'uni'
        ORDER BY kk.kerveny_id, kk.id DESC
      ),
      famulus_tot AS (
        SELECT kk.kerveny_id, SUM(COALESCE(kk.line_total,0))::bigint AS total
        FROM kerveny_koltseg kk
        WHERE lower(kk.pricing_type) = 'famulus'
        GROUP BY kk.kerveny_id
      ),
      uni_tot AS (
        SELECT kk.kerveny_id, SUM(COALESCE(kk.line_total,0))::bigint AS total
        FROM kerveny_koltseg kk
        WHERE lower(kk.pricing_type) = 'uni'
        GROUP BY kk.kerveny_id
      )
      SELECT
        k.id AS kerveny_id,
        ufu.full_name AS uf_offer_by_name,
        ft.total       AS uf_total,
        uuni.full_name AS uni_offer_by_name,
        ut.total       AS uni_total
      FROM kerveny k
      LEFT JOIN last_famulus luf ON luf.kerveny_id = k.id
      LEFT JOIN users ufu        ON ufu.id = luf.user_id
      LEFT JOIN famulus_tot ft   ON ft.kerveny_id = k.id
      LEFT JOIN last_uni luni    ON luni.kerveny_id = k.id
      LEFT JOIN users uuni       ON uuni.id = luni.user_id
      LEFT JOIN uni_tot ut       ON ut.kerveny_id = k.id
      WHERE k.id = ANY($1::int[])
      ORDER BY k.id ASC
    `;
    const { rows } = await client.query(sql, [ids]);
    return res.json(rows);
  } catch (e) {
    console.error('getOfferProvidersForEvents error', e);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
}

// export bővítése – semmit ne törölj
module.exports.sendCancelMail = module.exports.sendCancelMail || sendCancelMail;

// Export bővítése – tedd a fájl VÉGÉRE, hogy semmi ne írja felül
module.exports = {
  getAllKerveny,
  getKervenyById,
  insertKerveny,
  updateKerveny,
  updateKervenyStatus,
  saveCostsAndAdvance,
  getFamulusPricesByKervenyId,
  getUniversityPricesByKervenyId,
  clearCostsForType,
  downloadUniversityDocx,
  listUniversityDocxTags,
  sendCancelMail,
  patchKervenyFields,
  getOfferProvidersForEvents,
};
