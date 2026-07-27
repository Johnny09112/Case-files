// @ts-check
/**
 * České popisky pro render — jen prezentace, žádná herní logika.
 * Čísla v popiscích se berou z `rules` (ADR-003: nikde je nehardcodovat).
 */

export const TAG_LABEL = /** @type {Record<string, string>} */ ({
  nasili: 'Násilí',
  lest: 'Lest',
  uplatek: 'Úplatek',
  utek: 'Útěk',
});

export const PASMO_LABEL = /** @type {Record<string, string>} */ ({
  uspech: 'ÚSPĚCH',
  uspech_za_cenu: 'ÚSPĚCH ZA CENU',
  selhani: 'SELHÁNÍ',
});

export const DRUH_LABEL = /** @type {Record<string, string|null>} */ ({
  uzel: null,
  zatah: 'ZÁTAH',
  lecka: 'LÉČKA',
  konfrontace: 'KONFRONTACE',
});

/** Pět statů věci v češtině (pořadí kanonické dle rules.staty). */
export const STAT_LABEL = /** @type {Record<string, string>} */ ({
  utok: 'útok',
  obrana: 'obrana',
  hodnota: 'hodnota',
  improvizace: 'improvizace',
  nastroj: 'nástroj',
});

/** Staty ve 4. pádě — věty typu „chtělo to hodnotu 4" jinak drhnou. */
export const STAT_LABEL_4 = /** @type {Record<string, string>} */ ({
  utok: 'útok',
  obrana: 'obranu',
  hodnota: 'hodnotu',
  improvizace: 'improvizaci',
  nastroj: 'nástroj',
});

export const PRICINA_LABEL = /** @type {Record<string, string>} */ ({
  doruceno: 'náklad dojel do New Yorku',
  dosly_bedny: 'došly bedny',
  vsichni_vyrazeni: 'všichni podezřelí vyřazeni',
});

/** Pásma v3 (events.BAND) → čitelný popisek. */
export const BAND_LABEL = /** @type {Record<string, string>} */ ({
  '4/4_HLADCE_LOOT': '4/4 — hladce, ještě se něco našlo',
  '3/4_HLADCE': '3/4 — hladce',
  '2/4_S_NASLEDKY': '2/4 — s následky',
  '≤1/4_PRUSVIH': '≤1/4 — průšvih',
});

/** Kategorie postihu (informační/zámkový/ztrátový) → čeština. */
export const KATEGORIE_LABEL = /** @type {Record<string, string>} */ ({
  informacni: 'informační',
  zamkovy: 'zámkový',
  ztratovy: 'ztrátový',
});

/**
 * Co navíc stojí selhání v tomto uzlu.
 * @param {string} tvrdost @param {{tvrdostZarPrirustek: number}} rules
 */
export function tvrdostLabel(tvrdost, rules) {
  if (tvrdost === 'bedna') return 'selhání stojí navíc 1 bednu';
  if (tvrdost === 'zar') return `selhání přidává +${rules.tvrdostZarPrirustek} Žáru (za každé)`;
  if (tvrdost === 'zraneni') return 'selhání přidává druhé zranění';
  return tvrdost;
}

/** Zobrazení čísla se znaménkem a typografickým minus. @param {number} n */
export function znamenko(n) {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${-n}`;
  return '±0';
}

/** Výsledek runu s diakritikou. @param {string} vysledek */
export function vysledekLabel(vysledek) {
  return vysledek === 'DORUCENO' ? 'DORUČENO' : 'NEVYŘEŠENO';
}
