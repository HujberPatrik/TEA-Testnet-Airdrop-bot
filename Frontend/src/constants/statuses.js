export const STATUSES = [
  { code: 'ARAJANLAT_KESZITES_FOLYAMATBAN', label: 'Árajánlat készítés folyamatban', phase: 'BEERKEZETT', sort_order: 10 },
  { code: 'UF_ARAJANLATRA_VAR',            label: 'UF Árajánlatra vár',              phase: 'BEERKEZETT', sort_order: 20 },
  { code: 'UF_ARAJANLAT_ELFOGADASARA_VAR', label: 'UF Árajánlat elfogadására vár',   phase: 'BEERKEZETT', sort_order: 30 },
  { code: 'ARAJANLAT_KESZITESERE_VAR',     label: 'Árajánlat készítésére vár',       phase: 'BEERKEZETT', sort_order: 40 },
  { code: 'ARAJANLAT_ELFOGADASRA_VAR',     label: 'Árajánlat elfogadásra vár',       phase: 'BEERKEZETT', sort_order: 50 },

  { code: 'SZERZODES_ADATOKRA_VAR',        label: 'Szerződés adatokra vár',          phase: 'SZERZODES', sort_order: 110 },
  { code: 'SZERZODES_ATNEZESRE_VAR',       label: 'Szerződés átnézésre vár',         phase: 'SZERZODES', sort_order: 120 },
  { code: 'SZERZODES_KIKULDESRE_VAR',      label: 'Szerződés kiküldésre vár',        phase: 'SZERZODES', sort_order: 130 },
  { code: 'SZERZODES_PARTNERI_ALAIRASRA_VAR', label: 'Partneri aláírásra vár',       phase: 'SZERZODES', sort_order: 140 },
  { code: 'SZERZODES_EGYETEMI_ALAIRASRA_VAR', label: 'Egyetemi aláírásra vár',       phase: 'SZERZODES', sort_order: 150 },
  { code: 'SZERZODES_ALAIRVA',             label: 'Szerződés aláírva',               phase: 'SZERZODES', sort_order: 160 },

  { code: 'MEGVALOSITASRA_VAR',            label: 'Megvalósításra vár',              phase: 'MEGVALOSITAS', sort_order: 210 },
  { code: 'MEGVALOSULT_UF_IGAZOLASRA_VAR', label: 'Megvalósult - UF igazolásra vár', phase: 'MEGVALOSITAS', sort_order: 220 },

  { code: 'UF_TIG_JOVAHAGYASRA_VAR',       label: 'UF TIG jóváhagyásra vár',         phase: 'ELSZAMOLAS', sort_order: 310 },
  { code: 'ADATKOZLO_GENERALASRA_VAR',     label: 'Adatközlő generálásra vár',       phase: 'ELSZAMOLAS', sort_order: 320 },
  { code: 'ADATKOZLO_FELKULDVE',           label: 'Adatközlő felküldve',             phase: 'ELSZAMOLAS', sort_order: 330 },

  { code: 'LEZARVA',                       label: 'Lezárva',                         phase: 'LEZART', sort_order: 400, terminal: true },
  { code: 'ELUTASITVA',                    label: 'Elutasítva',                      phase: 'LEZART', sort_order: 410, terminal: true },
  { code: 'LEMONDVA',                      label: 'Lemondva',                        phase: 'LEZART', sort_order: 420, terminal: true }
];

export const TERMINAL_STATUS_CODES = STATUSES.filter(s => s.terminal).map(s => s.code);