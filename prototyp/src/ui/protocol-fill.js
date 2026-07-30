// @ts-check
/**
 * Výběr a dosazení v3 fallback šablon protokolu
 * (prompty/fallback-sablony.yaml v kořeni monorepa — schéma v hlavičce souboru).
 *
 * Čistý modul bez DOM a bez herní logiky (architektura §2.4): dostává hotové
 * události jednoho uzlu z logu enginu (`situation_revealed`, `slot_resolved`,
 * `band_resolved`, `penalty_added`, `character_folded`, `character_returned`)
 * a jen z nich skládá text. Náhoda výběru šablon je UI záležitost — vstřikuje
 * se přes `rand` (v testech deterministická, v aplikaci Math.random; engine
 * se jí nedotýká).
 *
 * Kontrakt {jmeno} (CLAUDE.md): dosazuje se PŘÍJMENÍ postavy — poslední slovo
 * pole `jmeno` z obsah/postavy.yaml.
 */
import { EVENT } from '../engine/events.js';
import { zapisSloty } from './protocol-fragments.js';
import { dosad, prijmeni } from './protocol-text.js';

// Re-export: `prijmeni` i `dosad` sem importuje zbytek UI (assign.js,
// situace-text.js, testy) — modul `protocol-text.js` je jen rozdělení kvůli
// cyklu s fragmentovou vrstvou, ne změna veřejného rozhraní.
export { dosad, prijmeni };

/** Nouzová věta, kdyby pro kombinaci neexistovala žádná šablona. */
export const NOUZOVY_ZAZNAM =
  'Průběh v tomto bodě zaznamenán bez podrobností; spis doplní vyšetřovatel dodatečně.';

const BEDNY_SLOVY = [
  'žádná bedna',
  'jedna bedna',
  'dvě bedny',
  'tři bedny',
  'čtyři bedny',
  'pět beden',
  'šest beden',
];

/**
 * Česká fráze počtu beden („jedna bedna" / „dvě bedny" / „pět beden").
 * Slovem do šesti (víc jich tým nevozí — rules.bedenNaStartu), dál číslicí.
 * @param {number} n
 */
export function frazeBeden(n) {
  return BEDNY_SLOVY[n] ?? `${n} beden`;
}

/** Úvodní šablona dle typu místa (jen vložená/speciální setkání ji mají). */
export const PASMO_UVODU = /** @type {Record<string, string>} */ ({
  zatah: 'zatah',
  lecka: 'lecka',
  konfrontace: 'konfrontace',
});

/**
 * Sedí šablona na stav situace? Klíč vynechaný v `podminka` = „jakkoli";
 * uvedený klíč musí odpovídat (`ano` ⇔ true). v3 klíče: postih, bedna.
 * @param {{podminka?: {postih?: string, bedna?: string}}} sablona
 * @param {{postih?: boolean, bedna?: boolean}} stav
 */
export function sedi(sablona, stav) {
  const p = sablona.podminka ?? {};
  for (const klic of /** @type {const} */ (['postih', 'bedna'])) {
    if (p[klic] != null && (p[klic] === 'ano') !== Boolean(stav?.[klic])) return false;
  }
  return true;
}

/**
 * Stavový výběr šablon: filtruje dle pásma + podmínky a losuje bez opakování
 * v řadě (tatáž šablona nepadne dvakrát po sobě, pokud je z čeho vybírat).
 *
 * ŠKRTNUTÁ PREFERENCE `bezVeci` (D54(1), 2026-07-30): pokus potlačit varianty
 * s `{veci}`, když pod odstavcem běží fragmentová vrstva, byl ZRUŠEN po měření —
 * runtime filtr je špatná vrstva. Půlil tři ze čtyř pásmových zásobníků
 * (4/4: 3→2, 3/4: 4→2, 2/4 s postihem: 4→2), čímž vynutil střídání A-B-A-B
 * (v jednom runu dva DOSLOVA shodné odstavce), a v PRŮŠVIHU srazil varianty
 * hlásící ztrátu bedny z 3 na 1 — protokol pak o ztracené bedně mlčel, ačkoli
 * ji předchozí verze hlásila. Odstranění výčtu je AUTORSKÁ změna (přepis
 * `{veci}`-variant dle N6 „ať je vyšetřovatel hodnotí, ne vyjmenovává"),
 * ne běhový filtr; zadáno obsahovému kolu.
 *
 * @param {object[]} sablony seznam z fallback-sablony.yaml
 * @param {() => number} [rand] zdroj náhody [0,1) — v testech deterministický
 * @returns {(pasmo: string, stav?: {postih?: boolean, bedna?: boolean}) =>
 *   {id: string|null, text: string}}
 */
export function createVyberSablon(sablony, rand = Math.random) {
  /** @type {Map<string, string>} poslední vylosované id per pásmo */
  const posledni = new Map();
  return function vyber(pasmo, stav = {}) {
    let kandidati = sablony.filter((s) => s.pasmo === pasmo && sedi(s, stav));
    if (kandidati.length === 0) return { id: null, text: NOUZOVY_ZAZNAM };
    if (kandidati.length > 1 && posledni.has(pasmo)) {
      const bezPosledni = kandidati.filter((s) => s.id !== posledni.get(pasmo));
      if (bezPosledni.length > 0) kandidati = bezPosledni;
    }
    const s = kandidati[Math.floor(rand() * kandidati.length)];
    posledni.set(pasmo, s.id);
    return { id: s.id, text: s.text };
  };
}

/**
 * Složí odstavce protokolu jedné SITUACE z jejích událostí (v3).
 *
 * Pořadí: úvod vloženého setkání (Zátah/léčka/konfrontace) → pásmový odstavec
 * (nese všechny čtyři věci ve slotech) → kolapsy → návraty (návrat je
 * poslední, protože ho `tickPenalties()` v enginu vyhodnocuje až PO
 * vyhodnocení situace, tedy chronologicky za kolapsy). Nic, co mechanika
 * nedala: počty beden i postih se DOSAZUJÍ z událostí.
 *
 * {jmeno} smí padnout jen tam, kde engine osobu skutečně určil (příjemce
 * postihu, složení, návrat) — NIKDY jako fallback na vlastníka propadlého
 * slotu: propadlý slot nemusí mít viníka (může být neobsazený, viz `sedi`
 * dokumentace šablon), takže by protokol tvrdil jméno, které mechanika
 * nedala.
 *
 * FRAGMENTOVÁ VRSTVA (D54(1), volitelný `vyberFragmentu`): za pásmovým
 * odstavcem přibude odstavec s jednou větou na slot — teprve on říká, KTERÁ věc
 * byla v KTERÉ roli a jak dopadla (`protocol-fragments.js`). Když běží, pásmový
 * odstavec se vybírá s preferencí variant bez `{veci}`.
 *
 * @param {object[]} udalosti události jednoho uzlu z logu enginu
 * @param {{jmena: Record<string,string>, veci: Record<string,string>,
 *   situace: Record<string,string>, postihy: Record<string,string>}} ctx
 * @param {ReturnType<typeof createVyberSablon>} vyber
 * @param {ReturnType<typeof import('./protocol-fragments.js').createVyberFragmentu>} [vyberFragmentu]
 * @returns {string[]} hotové odstavce
 */
export function zapisSituace(udalosti, ctx, vyber, vyberFragmentu) {
  const odhaleni = udalosti.find((u) => u.type === EVENT.SITUATION_REVEALED);
  const pasmoUdalost = udalosti.find((u) => u.type === EVENT.BAND_RESOLVED);
  const sloty = udalosti.filter((u) => u.type === EVENT.SLOT_RESOLVED);
  const postihy = udalosti.filter((u) => u.type === EVENT.PENALTY_ADDED);
  const kolapsy = udalosti.filter((u) => u.type === EVENT.CHARACTER_FOLDED);
  const navraty = udalosti.filter((u) => u.type === EVENT.CHARACTER_RETURNED);
  const uzel = ctx.situace?.[odhaleni?.situace_id] ?? odhaleni?.situace_id ?? 'neznámý úsek';

  /** @type {string[]} */
  const odstavce = [];

  const pasmoUvodu = PASMO_UVODU[odhaleni?.typ_mista];
  if (pasmoUvodu) odstavce.push(dosad(vyber(pasmoUvodu).text, { uzel }));

  const vetySlotu = vyberFragmentu ? zapisSloty(udalosti, ctx, vyberFragmentu) : [];

  if (pasmoUdalost) {
    const postih = postihy[0] ?? null;
    const stav = { postih: postih != null, bedna: (pasmoUdalost.naklad_ztrata ?? 0) > 0 };
    odstavce.push(
      dosad(vyber(pasmoUdalost.pasmo, stav).text, {
        // {jmeno} JEN z příjemce postihu — mechanika jinak žádnou osobu
        // neurčila (viz JSDoc výše i hlavička fallback-sablony.yaml).
        ...(postih ? { jmeno: prijmeni(ctx.jmena?.[postih.hrac_id] ?? postih.hrac_id) } : {}),
        uzel,
        veci: seznamVeci(sloty, ctx),
        postih: postih ? (ctx.postihy?.[postih.postih_id] ?? postih.postih_id) : '',
        bedny: frazeBeden(pasmoUdalost.naklad_ztrata ?? 0),
        naklad: frazeBeden(pasmoUdalost.zbyva_beden ?? 0),
      })
    );
  }

  if (vetySlotu.length > 0) odstavce.push(vetySlotu.join(' '));

  for (const kolaps of kolapsy) {
    odstavce.push(
      dosad(vyber('kolaps').text, { jmeno: prijmeni(ctx.jmena?.[kolaps.hrac_id] ?? kolaps.hrac_id), uzel })
    );
  }

  for (const navrat of navraty) {
    odstavce.push(
      dosad(vyber('navrat').text, { jmeno: prijmeni(ctx.jmena?.[navrat.hrac_id] ?? navrat.hrac_id), uzel })
    );
  }

  return odstavce;
}

/** Čtyři věci ve slotech jako česká výčtová fráze („A“, „B“, „C“ a „D“). */
function seznamVeci(sloty, ctx) {
  const nazvy = sloty
    .sort((a, b) => a.slot_index - b.slot_index)
    .map((s) => (s.karta_id ? `„${ctx.veci?.[s.karta_id] ?? s.karta_id}“` : 'nic'));
  if (nazvy.length <= 1) return nazvy[0] ?? 'nic';
  return `${nazvy.slice(0, -1).join(', ')} a ${nazvy.at(-1)}`;
}

/**
 * Závěrečný odstavec spisu z události `run_ended`.
 * @param {object} udalost run_ended ({vysledek, zbyva_beden, …})
 * @param {ReturnType<typeof createVyberSablon>} vyber
 * @returns {string[]}
 */
export function zapisFinale(udalost, vyber) {
  const pasmo = udalost.vysledek === 'DORUCENO' ? 'finale_doruceno' : 'finale_nevyreseno';
  return [dosad(vyber(pasmo).text, { naklad: frazeBeden(udalost.zbyva_beden ?? 0) })];
}
