// @ts-check
/**
 * Odhad zásahů vůči KOTVĚ — jediná definice sdílená botem i reportem (ADR-010).
 *
 * `odhad` řídí gamble-politiku bota (`strategies.js`) A ZÁROVEŇ klasifikuje
 * gamble-příležitosti v bráně K7 (`report.js`, kalibrace-4 bod 3: záchranný
 * `odhad ≤ 1` vs. hedge `odhad === 2`). Kdyby ta dvě čísla žila zvlášť, K7 by
 * měřila něco jiného, než co bot skutečně dělal — proto jeden modul a tripwire
 * test, který shodu hlídá nad reálnou dávkou.
 *
 * Bot nezná per-instance šum, jen kotvu → odhad se počítá proti `slot.kotva`,
 * ne proti `slot.prah`.
 */

import { resolveSlot } from '../src/engine/resolve.js';
import { decideAssignment } from './assign.js';

/**
 * Nejlepší dosažitelný počet zásahů vůči kotvě (bez gamblu), tj. „odhad" týmu.
 *
 * @param {object} p
 * @param {{karta: object}[]} p.committed committnuté karty (PŘED gamblem)
 * @param {object[]} p.sloty odhalené sloty (s `kotva`)
 * @param {{typ: string, cil: string}|null} [p.rusi]
 * @param {{chovani_dle_typu: object}|null} [p.stitekParams]
 * @param {string|null} [p.typSituace]
 * @param {number} [p.sumRozsah] model šumu (RULES.sumRozsah)
 * @param {number} [p.statMax] RULES.statMax
 * @returns {number} 0–4
 */
export function estimateHitsVsKotva({ committed, sloty, rusi = null, stitekParams = null, typSituace = null, sumRozsah = 1, statMax = 5 }) {
  const map = decideAssignment({ strat: 'memorizacni', committed, sloty, rusi, stitekParams, typSituace, sumRozsah, statMax });
  let hits = 0;
  map.forEach((slotPos, cardIdx) => {
    const slot = sloty[slotPos];
    // Proti KOTVĚ, ne proti prahu — bot per-instance šum nevidí.
    if (resolveSlot({ karta: committed[cardIdx].karta, slot: { ...slot, prah: slot.kotva }, rusi, stitekParams, typSituace }).zasah) hits += 1;
  });
  return hits;
}
