const fs = require('fs');
const path = require('path');

// A sablon mappa a repo gyökérben van: root/templates
// Ne törölj semmit, csak állítsd át/egészítsd ki a mappát erre az elérési útra.
const templatesDir = path.resolve(__dirname, '..', 'templates');
// ha máshol használtok templatesDir-t, ez biztosítja a helyes útvonalat
module.exports.templatesDir = module.exports.templatesDir || templatesDir;

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const InspectModule = require('docxtemplater/js/inspect-module');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const pool = require('./config/db'); // DB kapcsolat a költség sorokhoz

// Sablon tárolására szolgáló mappa
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Dokumentum generálás
async function generateDocument(templatePath, data) {
  try {
    const content = await readFile(templatePath, 'binary');
    
    // 1) Inspect: gyűjtsük ki, milyen tagek vannak a sablonban
    const zipForInspect = new PizZip(content);
    const inspectModule = new InspectModule();
    // Csak az inspect miatt hozzuk létre:
    // (külön zipet használunk, hogy a valódi render zipje érintetlen maradjon)
    // A docxtemplater automatikusan feltölti a module-ba a tag listát.
    /* eslint-disable no-new */
    new Docxtemplater(zipForInspect, { modules: [inspectModule] });
    /* eslint-enable no-new */
    const allTagsObj = inspectModule.getAllTags(); // { tagName: true, ... }
    const allTags = Object.keys(allTagsObj || {});
    
    // 2) Render
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter() { return ''; } // ne írjon 'undefined'-et
    });
    
    // Adatok előkészítése
    const preparedData = {
      ...data,
      // Boolean értékek átalakítása
      convertBoolean: function(value) {
        if (value === null) return ''; // Ha null, hagyja üresen
        return value === false ? 'hamis' : 'igaz';
      },
      // Dátumok formázása
      formatDate: function(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('hu-HU');
      }
    };

    // Boolean mezők átalakítása
    const booleanFields = [
      'sajto', 'szallasigeny', 'parkolo', 'internet', 'hulladek',
      'oktatastechnika', 'korlatozott_mozgas', 'foto', 'cater', 'epites',
      'epites_magas', 'epites_allvany', 'epites_kezi', 'epites_gepi',
      'takaritas', 'takaritas_alatt', 'vegyi_anyag', 'tuzveszelyes_tevekenyseg',
      'dekoracio', 'tovabbi_szervezo', 'portaszolgalat'
    ];

    booleanFields.forEach(field => {
      preparedData[field] = preparedData.convertBoolean(data[field]);
    });

    console.log('Renderelt adatok:', preparedData); // Debug
    console.log('Sablonban használt változók:', Object.keys(preparedData));
    
    // Adatok beillesztése
    doc.setData(preparedData);
    try {
      doc.render();
    } catch (e) {
      // Bővebb hibakiírás, hogy lásd, mi hiányzik/hibás a sablonban
      console.error('DOCX template render hiba:');
      const errs = (e.properties && e.properties.errors) || [];
      if (errs.length) {
        errs.forEach((err, i) => {
          const p = err.properties || {};
          console.error(
            ` ${i + 1}. id=${p.id || err.name} tag=${p.tag || ''} explanation=${p.explanation || err.message}`
          );
        });
      } else {
        console.error(e);
      }
      // Sablonban talált összes tag
      console.error('Sablonban talált tagek:', allTags);

      // Megpróbáljuk kideríteni, mely tagekhez nincs adat (egyszerűsített ellenőrzés)
      const missing = [];
      const hasPath = (root, path) => {
        // csak top-level és egyszerű "byName.xxx.yyy" kulcsokat vizsgálunk
        if (!path) return true;
        if (root[path] !== undefined) return true;
        if (path.startsWith('byName.')) {
          const parts = path.split('.');
          if (parts.length >= 3) {
            const [, key, prop] = parts;
            return root.byName && root.byName[key] && root.byName[key][prop] !== undefined;
          }
        }
        if (path.startsWith('items.')) {
          // items.loop esetén a belső tagek (service_name, qty_label, stb.) nem látszanak top-levelen,
          // ezért ezt nem listázzuk "missing"-nek.
          return true;
        }
        return false;
      };
      allTags.forEach(t => {
        if (!hasPath(preparedData, t)) missing.push(t);
      });
      if (missing.length) {
        console.error('Lehetséges hiányzó adatok ezekhez a tagekhez:', missing);
      }
      // továbbdobjuk a hibát
      throw e;
    }
    
    // Dokumentum generálás
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
    
    return buf;
  } catch (error) {
    console.error('Hiba a dokumentum generálása során:', error);
    throw error;
  }
}

/**
 * Kérelem (kerveny) meta adatok betöltése és formázása
 */
async function fetchKervenyMeta(kervenyId) {
  const { rows } = await pool.query(`SELECT * FROM kerveny WHERE id = $1`, [kervenyId]);
  const r = rows?.[0] || {};

  const pick = (obj, keys) => {
    for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
    return undefined;
  };

  // dátum + idő mezők (preferált oszlopok az adatbázisból)
  const startRaw = pick(r, ['kezdo_datum', 'kezdet', 'kezdete', 'datum_tol', 'start_at', 'start', 'startdate']);
  const endRaw   = pick(r, ['veg_datum', 'vege', 'vege_datum', 'datum_ig', 'end_at', 'end', 'enddate']);
  const startTimeRaw = pick(r, ['kezdo_idopont', 'kezdo_ido', 'start_time']);
  const endTimeRaw   = pick(r, ['veg_idopont', 'veg_ido', 'end_time']);

  const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('hu-HU') : '');
  const fmtTime = (v) => {
    if (!v) return '';
    const s = String(v);
    // PostgreSQL time: 'HH:MM:SS' → 'HH:MM'
    const m = s.match(/^(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : s;
  };

  const start_date_fmt = fmtDate(startRaw);
  const end_date_fmt   = fmtDate(endRaw);
  const start_time_fmt = fmtTime(startTimeRaw);
  const end_time_fmt   = fmtTime(endTimeRaw);

  const date_range_fmt = start_date_fmt && end_date_fmt
    ? `${start_date_fmt} – ${end_date_fmt}`
    : (start_date_fmt || end_date_fmt || '');

  const datetime_range_fmt =
    (start_date_fmt || start_time_fmt) || (end_date_fmt || end_time_fmt)
      ? `${[start_date_fmt, start_time_fmt].filter(Boolean).join(' ')} – ${[end_date_fmt, end_time_fmt].filter(Boolean).join(' ')}`
      : '';

  return {
    ...r,
    // top-level aliasok a sablonhoz
    nev: r.nev || '',
    leiras: r.leiras || '',
    helyszin: r.helyszin || '',
    cim: r.cim || '',
    tipus: r.tipus || '',
    // formázott mezők (magyar nevű aliasokkal is)
    start_date_fmt,
    end_date_fmt,
    date_range_fmt,
    start_time_fmt,
    end_time_fmt,
    datetime_range_fmt,
    kezdo_datum_fmt: start_date_fmt,
    veg_datum_fmt: end_date_fmt,
    kezdo_idopont_fmt: start_time_fmt,
    veg_idopont_fmt: end_time_fmt
  };
}

/**
 * UF Árajánlat DOCX generálása a kerveny_koltseg táblából.
 * A sablon: <project-root>/templates/UF_arajanlat_sablon.docx
 * Visszatér: Buffer (DOCX)
 */
async function generateUfOfferFromCosts(kervenyId) {
  if (!kervenyId) throw new Error('Hiányzó kervenyId');
  
  // Költség sorok lekérése
  const { rows } = await pool.query(`
    SELECT id, kerveny_id, service_id, service_name, rate_key, unit,
           hours, persons, unit_price, line_total, created_at
    FROM kerveny_koltseg
    WHERE kerveny_id = $1
    ORDER BY id
  `, [kervenyId]);
  
  if (!rows.length) {
    throw new Error('Nincs mentett költség ehhez a kérvényhez.');
  }
  
  // Formázók
  const fmt2  = n => new Intl.NumberFormat('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);
  const fmtHuf = n => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(Number(n) || 0);
  
  // Összesítők
  const totals = rows.reduce((acc, r) => {
    acc.hours   += Number(r.hours)      || 0;
    acc.persons += Number(r.persons)    || 0;
    acc.total   += Number(r.line_total) || 0;
    return acc;
  }, { hours: 0, persons: 0, total: 0 });
  
  // Sorok + formázott mezők a sablonnak
  const costs = rows.map(r => ({
    ...r,
    hours_fmt: fmt2(r.hours),
    persons_fmt: fmt2(r.persons),
    unit_price_fmt: fmtHuf(r.unit_price),
    line_total_fmt: fmtHuf(r.line_total)
  }));
  
  // A sablon által használt adatok
  const data = {
    costs,                                  // {#costs}{service_name}{unit}{hours_fmt}...{/costs}
    sum_hours: totals.hours,
    sum_persons: totals.persons,
    sum_total: totals.total,
    sum_hours_fmt: fmt2(totals.hours),
    sum_persons_fmt: fmt2(totals.persons),
    sum_total_fmt: fmtHuf(totals.total),
    today: new Date().toLocaleDateString('hu-HU')
  };
  
  const templatePath = path.join(templatesDir, 'UF_arajanlat_sablon.docx');
  return await generateDocument(templatePath, data);
}

// --- SEGÉDFÜGGVÉNYEK (unit -> látható oszlopok) ---
function normalizeUnit(u) {
  return String(u || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();
}
function columnsForUnit(u) {
  const s = String(u || '').toLowerCase();
  const has = (t) => s.includes(t);
  const isPerHour = has('fő/óra') || has('fo/ora') || (has('fő') && has('óra')) || (has('fo') && has('ora'));
  const hasDbAlkalom = has('db/alkalom');
  return {
    hours: isPerHour || has('óra') || has('ora'),
    persons: isPerHour || (has('fő') || has('fo')),
    days: has('nap'),
    occasions: has('alkalom'),
    quantity: hasDbAlkalom || (has('db') && !hasDbAlkalom)
  };
}
const fmt2   = (n) => new Intl.NumberFormat('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);
const fmtHuf = (n) => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(Number(n) || 0);

// --- EGYETEMI ÁRAJÁNLAT DOCX (csak a táblázatban megjelenő oszlopokkal) ---
async function generateUniversityOfferFromCosts(kervenyId) {
  if (!kervenyId) throw new Error('Hiányzó kervenyId');

  // Csak az EGYETEMI kategóriájú tételek
  const { rows } = await pool.query(
    `
    SELECT kk.id, kk.kerveny_id, kk.service_id, kk.service_name,
           kk.rate_key, kk.unit,
           kk.hours, kk.persons, kk.days, kk.occasions, kk.quantity,
           kk.unit_price, kk.line_total, kk.created_at
    FROM kerveny_koltseg kk
    INNER JOIN prices p ON p.id = kk.service_id
    WHERE kk.kerveny_id = $1
      AND lower(p.kategoria) = 'egyetemi'
    ORDER BY kk.id
    `,
    [kervenyId]
  );

  if (!rows.length) {
    throw new Error('Nincs mentett egyetemi költség ehhez a kérvényhez.');
  }

  // Látható oszlopok meghatározása globálisan (legalább egy sor alapján)
  const visible = rows.reduce(
    (acc, r) => {
      const c = columnsForUnit(normalizeUnit(r.unit));
      acc.hours    ||= c.hours;
      acc.persons  ||= c.persons;
      acc.days     ||= c.days;
      acc.occasions||= c.occasions;
      acc.quantity ||= c.quantity;
      return acc;
    },
    { hours: false, persons: false, days: false, occasions: false, quantity: false }
  );

  // Sorok előkészítése (nem látható oszlopok üresen mennek a sablonba)
  const items = rows.map(r => {
    const c = columnsForUnit(normalizeUnit(r.unit));
    return {
      service_name: r.service_name,
      unit: r.unit,
      qty_label: buildQtyLabel(r),
      hours:     c.hours     ? Number(r.hours)     || 0 : '',
      persons:   c.persons   ? Number(r.persons)   || 0 : '',
      days:      c.days      ? Number(r.days)      || 0 : '',
      occasions: c.occasions ? Number(r.occasions) || 0 : '',
      quantity:  c.quantity  ? Number(r.quantity)  || 0 : '',
      unit_price_fmt: fmtHuf(r.unit_price),
      line_total_fmt: fmtHuf(r.line_total)
    };
  });

  // Név szerinti gyors elérés a DOCX-hez (service_name -> slug -> adatok)
  const byName = rows.reduce((acc, r) => {
    const key = slugifyName(r.service_name);
    const c = columnsForUnit(normalizeUnit(r.unit));
    acc[key] = {
      service_name: r.service_name,
      unit: r.unit,
      qty_label: buildQtyLabel(r),
      hours:     c.hours     ? Number(r.hours)     || 0 : '',
      persons:   c.persons   ? Number(r.persons)   || 0 : '',
      days:      c.days      ? Number(r.days)      || 0 : '',
      occasions: c.occasions ? Number(r.occasions) || 0 : '',
      quantity:  c.quantity  ? Number(r.quantity)  || 0 : '',
      unit_price_fmt: fmtHuf(r.unit_price),
      line_total_fmt: fmtHuf(r.line_total)
    };
    return acc;
  }, {});

  const totals = rows.reduce(
    (acc, r) => ({ ...acc, total: acc.total + (Number(r.line_total) || 0) }),
    { total: 0 }
  );

  // Kerveny meta adatok betöltése
  const kerveny = await fetchKervenyMeta(kervenyId);

  const data = {
    // Kerveny mezőket top-levelre is kiterítjük, hogy a meglévő boolean mezők működjenek
    ...kerveny,
    // és külön objektumként is elérhetők:
    kerveny,

    items,                         // loop-hoz {#items}...{/items}
    byName,                        // név szerinti elérés
    show_hours: visible.hours,
    show_persons: visible.persons,
    show_days: visible.days,
    show_occasions: visible.occasions,
    show_quantity: visible.quantity,
    sum_total_fmt: fmtHuf(totals.total),
    today: new Date().toLocaleDateString('hu-HU'),
    kervenyId
  };

  const templatePath = path.join(templatesDir, 'SZE_arajanlat_sablon.docx');
  return await generateDocument(templatePath, data);
}

// Service név -> slug (ékezetek nélkül, szóközök helyett _)
function slugifyName(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Mennyiség felirat építése (unit + mezők alapján)
function buildQtyLabel(row) {
  const unit = String(row.unit || '').toLowerCase();
  const n = (v) => Number(v) || 0;

  const hours = n(row.hours);
  const persons = n(row.persons);
  const days = n(row.days);
  const occasions = n(row.occasions);
  const quantity = n(row.quantity);

  const has = (t) => unit.includes(t);
  const isPerHour =
    has('fő/óra') || has('fo/ora') ||
    ((has('fő') || has('fo')) && (has('óra') || has('ora')));
  const hasDbAlkalom = has('db/alkalom');

  if (isPerHour) {
    if (hours && persons) return `${hours} óra x ${persons} fő`;
    if (hours) return `${hours} óra/fő`;
    if (persons) return `${persons} fő`;
  }
  if (has('nap') && days) return `${days} nap`;
  if (has('alkalom')) {
    if (hasDbAlkalom && quantity && occasions) return `${quantity} db / ${occasions} alkalom`;
    if (occasions) return `${occasions} alkalom`;
    if (quantity) return `${quantity} db / alkalom`;
  }
  if (has('db') && !hasDbAlkalom && quantity) return `${quantity} db`;
  if ((has('óra') || has('ora')) && hours) return `${hours} óra`;

  if (days) return `${days} nap`;
  if (occasions) return `${occasions} alkalom`;
  if (quantity) return `${quantity} db`;
  if (hours && persons) return `${hours} óra x ${persons} fő`;
  if (hours) return `${hours} óra`;
  if (persons) return `${persons} fő`;

  return unit || '';
}

// A sablonba beilleszthető tagek listája a megadott kérvényhez
async function getUniversityDocxTags(kervenyId) {
  const { rows } = await pool.query(
    `
    SELECT kk.service_name, kk.unit, kk.hours, kk.persons, kk.days, kk.occasions, kk.quantity,
           kk.unit_price, kk.line_total
    FROM kerveny_koltseg kk
    INNER JOIN prices p ON p.id = kk.service_id
    WHERE kk.kerveny_id = $1
      AND lower(p.kategoria) = 'egyetemi'
    ORDER BY kk.id ASC
    `,
    [kervenyId]
  );

  const result = rows.map(r => {
    const slug = slugifyName(r.service_name);
    return {
      name: r.service_name,
      slug,
      // Ezeket a változókat használhatod a DOCX-ben:
      qty_label: `{byName.${slug}.qty_label}`,
      net_unit: `{byName.${slug}.unit_price_fmt}`,
      gross_line: `{byName.${slug}.line_total_fmt}`,
      // Ha külön oszlopokra is szükség van:
      hours: `{byName.${slug}.hours}`,
      persons: `{byName.${slug}.persons}`,
      days: `{byName.${slug}.days}`,
      occasions: `{byName.${slug}.occasions}`,
      quantity: `{byName.${slug}.quantity}`
    };
  });

  return result;
}

module.exports = {
  generateDocument,
  templatesDir,
  generateUfOfferFromCosts,
  generateUniversityOfferFromCosts,
  getUniversityDocxTags,
  // új helper export (ha máshol is kell)
  fetchKervenyMeta
};