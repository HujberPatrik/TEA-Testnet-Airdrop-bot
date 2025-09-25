const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const pool = require('./config/db'); // DB kapcsolat a költség sorokhoz

// Sablon tárolására szolgáló mappa
const templatesDir = path.join(__dirname, '../templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Dokumentum generálás
async function generateDocument(templatePath, data) {
  try {
    // Sablon betöltése
    const content = await readFile(templatePath, 'binary');
    const zip = new PizZip(content);
    
    // Template változók kezelése
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
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
    doc.render(preparedData);
    
    // Dokumentum generálása
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

module.exports = {
  generateDocument,
  templatesDir,
  generateUfOfferFromCosts
};