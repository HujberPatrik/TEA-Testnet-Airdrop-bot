// KANONIKUS státuszok + szépen formázott címkék
export const STATUSES = [
  { code: 'BEERKEZETT', label: 'Beérkezett', phase: 'beerkezett' },

  { code: 'UF_ARAJANLATRA_VAR', label: 'UF árajánlatra vár', phase: 'beerkezett' },
  { code: 'UF_ARAJANLAT_ELFOGADASARA_VAR', label: 'UF árajánlat elfogadására vár', phase: 'beerkezett' },

  { code: 'ARAJANLAT_KESZITESERE_VAR', label: 'Árajánlat készítésére vár', phase: 'beerkezett' },
  { code: 'ARAJANLAT_ELFOGADASRA_VAR', label: 'Árajánlat elfogadásra vár', phase: 'beerkezett' },
  { code: 'ARAJANLAT_KESZITES_FOLYAMATBAN', label: 'Árajánlat készítés folyamatban', phase: 'beerkezett' },

  { code: 'SZERZODES_ADATOKRA_VAR', label: 'Szerződéses adatokra vár', phase: 'szerzodes' },
  { code: 'SZERZODES_ATNEZESRE_VAR', label: 'Szerződés átnézésre vár', phase: 'szerzodes' },
  { code: 'SZERZODES_KIKULDESRE_VAR', label: 'Szerződés kiküldésre vár', phase: 'szerzodes' },
  { code: 'SZERZODES_PARTNERI_ALAIRASRA_VAR', label: 'Szerződés partneri aláírásra vár', phase: 'szerzodes' },
  { code: 'SZERZODES_EGYETEMI_ALAIRASRA_VAR', label: 'Szerződés egyetemi aláírásra vár', phase: 'szerzodes' },
  { code: 'SZERZODES_ALAIRVA', label: 'Szerződés aláírva', phase: 'lezart' },

  { code: 'MEGVALOSITASRA_VAR', label: 'Megvalósításra vár', phase: 'megvalositas' },
  { code: 'MEGVALOSULT_UF_IGAZOLASRA_VAR', label: 'Megvalósult – UF igazolásra vár', phase: 'megvalositas' },
  { code: 'UF_TIG_JOVAHAGYASRA_VAR', label: 'UF TIG jóváhagyásra vár', phase: 'megvalositas' },

  { code: 'ADATKOZLO_GENERALASRA_VAR', label: 'Adatközlő generálásra vár', phase: 'elszamolas' },
  { code: 'ADATKOZLO_FELKULDVE', label: 'Adatközlő felküldve', phase: 'elszamolas' },

  { code: 'LEZARVA', label: 'Lezárva', phase: 'lezart' },
  { code: 'ELUTASITVA', label: 'Elutasítva', phase: 'lezart' },
  { code: 'LEMONDVA', label: 'Lemondva', phase: 'lezart' }
];

// Terminális státuszok
export const TERMINAL_STATUS_CODES = ['LEZARVA', 'ELUTASITVA', 'LEMONDVA'];

// Aliasok → kanonikus kód
const ALIASES = {
  MEGVALOSULASRA_VAR: 'MEGVALOSITASRA_VAR'
};

export function normalizeStatusCode(code) {
  const c = String(code || '').trim().toUpperCase();
  return ALIASES[c] || c;
}

export function prettyStatus(code) {
  const s = String(code || '').toLowerCase().replace(/_/g, ' ').trim();
  const titled = s.replace(/\b\w/g, ch => ch.toUpperCase());
  return titled
    .replace(/\bSzerzodes\b/g, 'Szerződés')
    .replace(/\bEgyetemi\b/g, 'Egyetemi')
    .replace(/\bMegvalositas\b/g, 'Megvalósítás')
    .replace(/\bMegvalosult\b/g, 'Megvalósult')
    .replace(/\bIgazol\w*\b/g, 'Igazolás')
    .replace(/\bFelkuldve\b/g, 'Felküldve')
    .replace(/\bEllenorzes\w*\b/g, 'Ellenőrzés')
    .replace(/\bVar\b/g, 'vár')
    .replace(/\bUf\b/g, 'UF');
}

export function getStatusInfo(code) {
  const canon = normalizeStatusCode(code);
  const hit = STATUSES.find(s => s.code === canon);
  if (hit) return hit;
  // Fallback: generált label + semleges fázis
  return { code: canon, label: prettyStatus(canon), phase: 'beerkezett' };
}

export function getStatusLabel(code) {
  return getStatusInfo(code).label;
}

export function getStatusPhase(code) {
  return getStatusInfo(code).phase;
}