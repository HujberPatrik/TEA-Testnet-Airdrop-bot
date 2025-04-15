const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

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

module.exports = {
  generateDocument,
  templatesDir
};