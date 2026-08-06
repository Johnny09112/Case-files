// @ts-check
/**
 * České popisky pro render — jen prezentace, žádná herní logika.
 * Čísla v popiscích se berou z `rules` (ADR-003: nikde je nehardcodovat).
 */

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

/** Příčiny konce runu (events.END_PRICINA, v3). */
export const PRICINA_LABEL = /** @type {Record<string, string>} */ ({
  dojezd: 'náklad dojel do New Yorku',
  bedny_0: 'došly bedny',
  konfrontace_prohra: 'prohraná konfrontace s pronásledovatelem',
  jina: 'jiná příčina',
});

/** Důvody pohybu Žáru (events.ZAR_DUVOD) — proč šerif postoupil. */
export const ZAR_DUVOD_LABEL = /** @type {Record<string, string>} */ ({
  prusvih: 'průšvih v uzlu',
  s_nasledky: 'uzel zvládnutý s následky',
  hlucne_GANGSTER: 'zbraň v akci',
  hlucne_utok: 'hlučné násilí (vysoký útok)',
  konfrontace_prezita: 'přežitá konfrontace — pozornost opadla',
});

/** Prahy trati Žáru (rules.zar.prahy) → jak se jmenují ve spisu. */
export const PRAH_LABEL = /** @type {Record<string, string>} */ ({
  zatah: 'Zátahu',
  lecka: 'léčky',
  konfrontace: 'konfrontace',
});

/**
 * Krátký mikro-popisek CO daný práh dělá, ne jen jak se jmenuje (playtest
 * 2026-08-04: hráč viděl čísla a červené prahy na trati, ale netušil, co který
 * spouští, a myslel si, že šerif dává postihy přímo — design-dokument §4.9).
 */
export const PRAH_POPIS = /** @type {Record<string, string>} */ ({
  zatah: 'nahradí příští uzel',
  lecka: 'vloží uzel navíc',
  konfrontace: 'finále, nejvýš 1× za run',
});

/** Důvody pohybu kreditů (events.CREDIT_DUVOD). */
export const CREDIT_DUVOD_LABEL = /** @type {Record<string, string>} */ ({
  truhla: 'nález v truhle',
  hladce_loot: 'čistá práce 4 ze 4',
  hladce: 'zvládnutý uzel 3 ze 4',
  smena: 'směna věci v motelu',
  leceni: 'léčení v motelu',
  ztratovy_postih: 'ztrátový postih',
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

/** Typ místa je veřejná informace (D34/N7) — hráč ho vidí před volbou cesty. */
export const TYP_MISTA_LABEL = /** @type {Record<string, string>} */ ({
  npc: 'člověk',
  lokace: 'lokace',
  truhla: 'nález',
  zatah: 'zátah',
  lecka: 'léčka',
  konfrontace: 'konfrontace',
});
