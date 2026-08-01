// @ts-check
/**
 * Dvouvrstvé klíčování cache protokolů (architektura §2.3, ADR-007).
 *
 * 1. Exaktní klíč (v0.1, jediný aktivní pro vyhledávání): SHA-256 kanonického
 *    JSON vstupu — jen mechanická fakta z uzlových událostí (postava/karta/
 *    zásah/důvod na slot, pásmo, ztracené bedny, postihy). ŽÁDNÉ časy, seedy
 *    ani jména — ty se do klíčovacího payloadu vůbec nedostanou (klíč se
 *    počítá jen z `udalosti`, ctx.jmena se do funkce ani nepředává).
 * 2. Hrubý klíč (příprava na globální cache, ADR-007 bod 2): vynechá text
 *    poznámek a nahradí je bucketem AKTIVNÍCH POSTIHŮ (0/1/2+, `ctx.postihBucket`).
 *    Počítá se JEN pro „čisté" stavy (bucket „0"/nezadáno) — u stavů
 *    s poznámkami by hrubý hit riskoval protokol zmiňující následek, který
 *    postava nemá. V0.1 se hrubý klíč nikde NEPOUŽÍVÁ k lookupu, jen se
 *    loguje stínově pro měření hit-rate potenciálu (viz src/llm/log.js).
 *
 * Kanonizace = seřazené klíče objektů (rekurzivně), pole zůstávají v pořadí.
 * SHA-256 přes Web Crypto (`globalThis.crypto.subtle`) — funguje v Node 18+
 * i v prohlížeči beze změny kódu.
 */
import { EVENT } from '../engine/events.js';

/**
 * Rekurzivně seřadí klíče objektů (pole beze změny pořadí).
 * @param {*} value
 * @returns {*}
 */
export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value != null && typeof value === 'object') {
    /** @type {Record<string, *>} */
    const out = {};
    for (const klic of Object.keys(value).sort()) out[klic] = canonicalize(value[klic]);
    return out;
  }
  return value;
}

/** @param {*} value */
export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

/** @param {string} text */
async function sha256Hex(text) {
  const bajty = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bajty);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Klíčovací payload — jen mechanická fakta jednoho uzlu, ŽÁDNÉ časy/seedy/jména.
 * @param {object[]} udalosti události jednoho uzlu z logu enginu
 */
export function exactKeyPayload(udalosti) {
  const odhaleni = udalosti.find((u) => u.type === EVENT.SITUATION_REVEALED);
  const pasmo = udalosti.find((u) => u.type === EVENT.BAND_RESOLVED);
  const zaznamy = udalosti
    .filter((u) => u.type === EVENT.SLOT_RESOLVED)
    .slice()
    .sort((a, b) => a.slot_index - b.slot_index)
    .map((s) => ({ postava_id: s.hrac_id ?? null, karta_id: s.karta_id ?? null, zasah: Boolean(s.zasah), duvod: s.duvod ?? null }));
  const nasledky = udalosti
    .filter((u) => u.type === EVENT.PENALTY_ADDED)
    .map((p) => ({ postava_id: p.hrac_id ?? null, kategorie: p.kategorie ?? null, tier: p.tier ?? null }));
  return {
    uzel_id: odhaleni?.situace_id ?? null,
    zaznamy,
    pasmo: pasmo?.pasmo ?? null,
    ztracene_bedny: pasmo?.naklad_ztrata ?? 0,
    nasledky,
  };
}

/**
 * Hrubý klíčovací payload — jako exaktní, ale bez textů poznámek (bucket
 * aktivních postihů místo jejich výčtu).
 * @param {object[]} udalosti
 * @param {{postihBucket?: '0'|'1'|'2+'}} [ctx]
 */
export function grossKeyPayload(udalosti, ctx = {}) {
  const zakladni = exactKeyPayload(udalosti);
  return {
    uzel_id: zakladni.uzel_id,
    zaznamy: zakladni.zaznamy,
    pasmo: zakladni.pasmo,
    ztracene_bedny: zakladni.ztracene_bedny,
    postih_bucket: ctx.postihBucket ?? '0',
  };
}

/** @param {object[]} udalosti @returns {Promise<string>} */
export async function computeExactKey(udalosti) {
  return sha256Hex(canonicalJson(exactKeyPayload(udalosti)));
}

/**
 * @param {object[]} udalosti
 * @param {{postihBucket?: '0'|'1'|'2+'}} [ctx]
 * @returns {Promise<string|null>} `null`, pokud stav není „čistý" (ADR-007 bod 2)
 */
export async function computeGrossKey(udalosti, ctx = {}) {
  const bucket = ctx.postihBucket ?? '0';
  if (bucket !== '0') return null;
  return sha256Hex(canonicalJson(grossKeyPayload(udalosti, ctx)));
}

/**
 * Globální cache v paměti (Map). V0.1 lokální jen pro tuhle relaci prohlížeče —
 * globální sdílená cache mezi hráči je produkční směr (ADR-006), mimo v0.1.
 * @returns {{get(klic: string): Promise<{hit: boolean, value: *}>,
 *   set(klic: string, value: *): Promise<void>, has(klic: string): boolean}}
 */
export function createCache() {
  const store = new Map();
  return {
    async get(klic) {
      return store.has(klic) ? { hit: true, value: store.get(klic) } : { hit: false, value: null };
    },
    async set(klic, value) {
      store.set(klic, value);
    },
    has(klic) {
      return store.has(klic);
    },
  };
}
