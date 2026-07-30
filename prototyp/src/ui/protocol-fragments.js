// @ts-check
/**
 * Fragmentová vrstva fallbacku (D54(1), návrh technika/koncept-kreativita-navrh-2026-07-30.md §2.7).
 *
 * PROBLÉM, KTERÝ ŘEŠÍ: pásmová šablona zná jen plochý placeholder `{veci}` —
 * vyjmenuje čtyři kusy a mlčí o tom, KTERÁ věc byla v KTERÉ roli a jak dopadla.
 * Fallback tak neumí to, co se od protokolu čeká („hráč po uzlu umí říct, co ta
 * věc v té roli dělala"). Tahle vrstva k tomu skládá JEDNU VĚTU NA SLOT
 * z autorského fragmentu v `prompty/fallback-fragmenty.yaml`.
 *
 * ARCHITEKTURA (architektura §2.4): čistý modul bez DOM a bez herní logiky.
 * Dostává hotové události uzlu z logu enginu (`situation_revealed` nese role
 * slotů, `slot_resolved` nese kartu, vlastníka, stat a `duvod`) a jen z nich
 * skládá text. ENGINE SE NEMĚNÍ.
 *
 * DETERMINISMUS: výběr fragmentu NEPOUŽÍVÁ `Math.random`. Klíč se skládá ze
 * seedu runu a souřadnic slotu (uzel × index × karta × důvod) a prochází
 * stabilním hashem — tentýž run vypíše tentýž protokol (golden testovatelné),
 * dva různé seedy dostanou různé věty.
 *
 * KONTRAKT „nic, co mechanika nedala": dosazují se jen hodnoty, které událost
 * skutečně nese. Neobsazený slot nemá kartu ani vlastníka (`duvod: 'neobsazeno'`,
 * pravidlo N2 v hlavičce `prompty/fallback-sablony.yaml`), takže se do něj
 * `{vec}` ani `{jmeno}` nedosadí — a fragment, kterému by po dosazení zbyl
 * nevyplněný placeholder, se ZAHODÍ místo vytištění. Ticho je levnější než
 * věta, kterou razítko o centimetr výš popírá.
 */
import { EVENT } from '../engine/events.js';
import { dosad, prijmeni } from './protocol-text.js';

/**
 * Přihrádky fragmentů = přesné hodnoty `slot_resolved.duvod`, které vydává
 * engine (`src/engine/resolve.js`). Nová hodnota v enginu = nová přihrádka tady
 * i v hlavičce sady, jinak vrstva o tom druhu výsledku mlčí.
 */
export const VYSLEDKY = /** @type {const} */ ([
  'proslo',
  'nizky_stat',
  'kombi_neuplny',
  'stat_zrusen',
  'gangster_auto_fail',
  'postih_lock_stitek',
  'postih_lock_viditelnost',
  'neobsazeno',
]);

/** Placeholdery, které tahle vrstva umí dosadit (schéma sady fragmentů). */
export const POVOLENE_PLACEHOLDERY = /** @type {const} */ (['vec', 'role', 'jmeno']);

/**
 * Stabilní index z řetězce (FNV-1a 32bit) — deterministická náhrada losování.
 * @param {string} klic
 * @param {number} pocet velikost seznamu
 * @returns {number} index v <0, pocet), nebo 0 pro prázdný seznam
 */
export function stabilniIndex(klic, pocet) {
  if (!pocet || pocet <= 0) return 0;
  let h = 0x811c9dc5;
  const s = String(klic);
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % pocet;
}

/**
 * Výběr fragmentu pro slot. Pool = fragmenty přihrádky klíčované na SEDÍCÍ stat
 * ∪ fragmenty bez `stat` (obecné). Fragment klíčovaný na CIZÍ stat se do poolu
 * nikdy nedostane — jinak by protokol popsal roli, kterou slot nehrál.
 *
 * Kombi slot (`stat` je pole dvou statů) bere jen obecné fragmenty: „stat
 * neprošel" u kombi znamená něco jiného než u jednoduchého slotu.
 *
 * `pouzite` = id fragmentů už použitých V TOMTO UZLU, v pořadí použití. Čtyři
 * věty jednoho odstavce se čtou naráz, takže opakovaný tvar z nich udělá
 * formulář (nález golden testu nad reálným runem: tři ze čtyř vět měly stejnou
 * stavbu). Odsun je DVOUSTUPŇOVÝ a jen preference — pořadí: pool bez všech
 * použitých → pool bez naposledy použitého → celý pool. Věta je totiž
 * důležitější než rozmanitost: mlčení o slotu je horší než opakovaný tvar.
 *
 * @param {{id: string, vysledek: string, stat?: string, text: string}[]} fragmenty sada z prompty/fallback-fragmenty.yaml
 * @param {string|number} [seed] seed runu (`run_started.seed`) — dva runy nedostanou tutéž větu
 * @returns {(vysledek: string, stat: string|string[]|null|undefined, klic: string,
 *   pouzite?: string[]) => {id: string, stat?: string, text: string}|null}
 */
export function createVyberFragmentu(fragmenty, seed = 0) {
  return function vyber(vysledek, stat, klic, pouzite = []) {
    const statSlotu = Array.isArray(stat) ? null : stat;
    const pool = fragmenty.filter(
      (f) => f.vysledek === vysledek && (f.stat == null || f.stat === statSlotu)
    );
    if (pool.length === 0) return null;
    const bezVsech = pool.filter((f) => !pouzite.includes(f.id));
    const bezPosledniho = pool.filter((f) => f.id !== pouzite.at(-1));
    const kandidati = bezVsech.length > 0 ? bezVsech : bezPosledniho.length > 0 ? bezPosledniho : pool;
    return kandidati[stabilniIndex(`${seed}|${klic}`, kandidati.length)];
  };
}

/**
 * Jedna věta o jednom slotu, nebo `null` (přihrádka nepokrytá / fragment by
 * po dosazení tvrdil něco, co událost nenese).
 *
 * @param {object} slot událost `slot_resolved`
 * @param {string|undefined} role název role slotu ze `situation_revealed`
 * @param {{jmena?: Record<string,string>, veci?: Record<string,string>}} ctx názvy věcí a jména postav (seed drží `vyber`)
 * @param {ReturnType<typeof createVyberFragmentu>} vyber
 * @param {string[]} [pouzite] id fragmentů už použitých v tomto uzlu (viz `createVyberFragmentu`)
 * @returns {{text: string, id: string}|null}
 */
export function vetaSlotu(slot, role, ctx, vyber, pouzite = []) {
  const klic = `${slot.nodeIndex ?? 0}|${slot.slot_index}|${slot.karta_id ?? '-'}|${slot.duvod}`;
  const fragment = vyber(slot.duvod, slot.stat, klic, pouzite);
  if (!fragment) return null;

  /** @type {Record<string, string>} */
  const hodnoty = {};
  if (slot.karta_id != null) hodnoty.vec = ctx.veci?.[slot.karta_id] ?? slot.karta_id;
  if (slot.hrac_id != null) hodnoty.jmeno = prijmeni(ctx.jmena?.[slot.hrac_id] ?? slot.hrac_id);
  if (role) hodnoty.role = role;

  const text = dosad(fragment.text, hodnoty);
  // Pojistka kontraktu: nedosazený placeholder = fragment mluví o něčem, co
  // mechanika v tomhle slotu neurčila. Radši větu zahodit než vytisknout.
  return /\{\w+\}/.test(text) ? null : { text, id: fragment.id };
}

/**
 * Věty o všech slotech jednoho uzlu, v pořadí slotů situace.
 * Uzly bez situace (truhla, motel) nevracejí nic — nemají sloty.
 *
 * @param {object[]} udalosti události jednoho uzlu z logu enginu
 * @param {{jmena?: Record<string,string>, veci?: Record<string,string>}} ctx názvy věcí a jména postav (seed drží `vyber`)
 * @param {ReturnType<typeof createVyberFragmentu>} vyber
 * @returns {string[]}
 */
export function zapisSloty(udalosti, ctx, vyber) {
  const odhaleni = udalosti.find((u) => u.type === EVENT.SITUATION_REVEALED);
  const role = new Map((odhaleni?.sloty ?? []).map((s) => [s.slot_index, s.role]));
  const sloty = udalosti
    .filter((u) => u.type === EVENT.SLOT_RESOLVED)
    .slice()
    .sort((a, b) => a.slot_index - b.slot_index);

  /** @type {string[]} */ const pouzite = [];
  /** @type {string[]} */ const vety = [];
  for (const u of sloty) {
    const v = vetaSlotu(u, role.get(u.slot_index), ctx, vyber, pouzite);
    if (v == null) continue;
    pouzite.push(v.id);
    vety.push(v.text);
  }
  return vety;
}
