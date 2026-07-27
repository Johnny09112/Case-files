// @ts-check
/**
 * Přiřazovací heuristiky botů — ČISTÉ funkce bez enginu (architektura.md §3).
 *
 * Vytaženo ze `strategies.js` (kalibrace-4, ADR-010), aby je mohl importovat
 * i `estimate.js` bez cyklu `strategies ↔ estimate`. Chování se stěhováním
 * NEMĚNÍ — jakákoli redefinice by posunula golden snapshoty i všechna dosavadní
 * měření.
 */

import { resolveSlot } from '../src/engine/resolve.js';

/** Všechny permutace [0..n-1] (n ≤ 4). */
function permutace(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  const out = [];
  const gen = (k, a) => {
    if (k === 1) return out.push(a.slice());
    for (let i = 0; i < k; i++) {
      gen(k - 1, a);
      const j = k % 2 === 0 ? i : 0;
      [a[j], a[k - 1]] = [a[k - 1], a[j]];
    }
  };
  gen(n, arr);
  return out;
}

/** mapping[indexKarty] = pozice slotu; karty jdou na náhodný podmnožinový výběr slotů. */
export function randomMapping(pocetKaret, pocetSlotu, rng) {
  return rng.shuffle(Array.from({ length: pocetSlotu }, (_, i) => i)).slice(0, pocetKaret);
}

/**
 * Bias cíle-driven bota: bonus/postih per (karta VLASTNÍKA cíle, slot). Vytváří
 * měřitelnou odchylku od kompetentního (týmově-optimálního) přiřazení.
 */
function goalBias(karta, slot, goalId) {
  if (!goalId) return 0;
  const LAMBDA = 3;
  const rawStaty = Array.isArray(slot.stat) ? slot.stat : [slot.stat];
  const pass = Math.min(...rawStaty.map((st) => karta.staty[st] ?? 0)) >= slot.kotva; // odhad vs kotva
  const gangsterVisible = karta.stitek === 'GANGSTER' && slot.viditelnost === 'viditelna';
  switch (goalId) {
    case 'cista-ruka':
      return gangsterVisible ? -100 : 0; // NIKDY zbraň do viditelné role
    case 'dve-jizvy':
      return pass ? -LAMBDA : LAMBDA; // toleruj/vyhledej vlastní propad (chce postihy)
    case 'muj-den':
    case 'bez-jizvy':
    case 'kupecke-slovo':
    case 'plny-zasah':
      return pass ? LAMBDA : -LAMBDA; // tlač vlastní průchod
    default:
      return 0; // hazarder (řeší gamble), mozek-operace (textový)
  }
}

/**
 * Vrací `mapping[indexKarty] = pozice slotu` — přiřazení dle strategie.
 * ČISTÁ funkce (testovatelná bez enginu).
 *
 * @param {object} p {strat, committed:[{hrac_id,karta}], sloty, rusi, stitekParams, typSituace, goalByHrac, rng}
 */
export function decideAssignment({ strat, committed, sloty, rusi = null, stitekParams = null, typSituace = null, goalByHrac = {}, rng = null, sumRozsah = 1, statMax = 5, zamkyKaret = null, slepiNaViditelnost = null }) {
  const karty = committed.map((c) => c.karta);
  const M = karty.length;
  if (strat === 'random') return randomMapping(M, sloty.length, rng);

  // Zámkové postihy vlastníka karty (D34/N1) — hráč své vlastní postihy ZNÁ,
  // takže se slotu, kde by karta auto-failovala, kompetentní hráč vyhne.
  const zamkyKarty = (i) => zamkyKaret?.[i] ?? null;
  const passVsPrah = (k, slot, i) => (resolveSlot({ karta: k, slot, rusi, stitekParams, typSituace, zamky: zamkyKarty(i) }).zasah ? 1 : 0);
  const rawStat = (k, slot) => {
    const staty = Array.isArray(slot.stat) ? slot.stat : [slot.stat];
    return Math.min(...staty.map((st) => (rusi?.typ === 'stat' && rusi.cil === st ? 0 : k.staty[st] ?? 0)));
  };
  /** Padne věc v tomto slotu na tvrdé pravidlo (štítek / zámkový postih) bez ohledu na staty? */
  const autoFail = (k, slot, i) => !resolveSlot({ karta: k, slot: { ...slot, prah: -99 }, rusi, stitekParams, typSituace, zamky: zamkyKarty(i) }).zasah;
  /**
   * Skóre KOMPETENTNÍHO hráče: jako `rawStat`, ale zná veřejná tvrdá pravidla
   * (kalibrace-4, nález D29; zámkové postihy D34/N1). Zbraň ve viditelné roli NPC
   * padne bez ohledu na staty — dřív ji `rawStat` s útokem 5 hodnotil jako ideální
   * kandidátku a bot ji tam cpal. `greedy` zůstává naivní schválně: je to detektor
   * K4a („max win-rate fixní přiřazovací heuristiky"), ne model kompetence.
   *
   * `hide_viditelnost` (D34/N1): postižený hráč NEVIDÍ ikony viditelnosti slotů,
   * takže u SVÝCH karet nemůže auto-fail dopředu odhadnout — hodnotí je syrovým
   * statem. Tím postih poprvé mechanicky kouše (dřív byl no-op).
   */
  const kompetentniStat = (k, slot, i) => (slepiNaViditelnost?.[i] ? rawStat(k, slot) : autoFail(k, slot, i) ? -1 : rawStat(k, slot));
  // Memorizační bot ZNÁ kotvu (ne per-instance šum) → maximalizuje OČEKÁVANÝ počet
  // zásahů: P(stat ≥ clamp(kotva+šum, 0, statMax)) přes šum uniform v {−R…+R}.
  // Model se počítá ze STEJNÉHO rozsahu + clampu jako engine (kalibrace-2) — jinak
  // by byl bot mis-kalibrovaný a K4c gate by měřil artefakt. GANGSTER auto-fail
  // se promítne jako nulová hodnota přes resolveSlot ve viditelné roli.
  const R = sumRozsah;
  const expectedPass = (k, slot, i) => {
    const auto = resolveSlot({ karta: k, slot: { ...slot, prah: -99 }, rusi, stitekParams, typSituace, zamky: zamkyKarty(i) });
    if (!auto.zasah) return 0; // GANGSTER / zámkový postih auto-fail (prošel by i s prahem −99)
    const stat = rawStat(k, slot);
    let hits = 0;
    for (let sv = -R; sv <= R; sv++) {
      const prah = Math.max(0, Math.min(statMax, slot.kotva + sv));
      if (stat >= prah) hits += 1;
    }
    return hits / (2 * R + 1);
  };

  if (strat === 'greedy') {
    // `greedy` je detektor K4a — schválně naivní (zná jen syrové staty).
    const zbyleSloty = sloty.map((_, i) => i);
    const mapping = new Array(M);
    for (let cardIdx = 0; cardIdx < M; cardIdx++) {
      let best = 0;
      for (let j = 1; j < zbyleSloty.length; j++) {
        if (rawStat(karty[cardIdx], sloty[zbyleSloty[j]]) > rawStat(karty[cardIdx], sloty[zbyleSloty[best]])) best = j;
      }
      mapping[cardIdx] = zbyleSloty.splice(best, 1)[0];
    }
    return mapping;
  }

  const base = strat === 'oracle' ? passVsPrah : strat === 'memorizacni' ? expectedPass : kompetentniStat;
  const scoreFn =
    strat === 'cile'
      ? (k, slot, i) => kompetentniStat(k, slot, i) + goalBias(k, slot, goalByHrac[committed[i].hrac_id])
      : (k, slot, i) => base(k, slot, i);

  let bestMap = null;
  let bestScore = -Infinity;
  for (const perm of permutace(sloty.length)) {
    let sc = 0;
    for (let i = 0; i < M; i++) sc += scoreFn(karty[i], sloty[perm[i]], i);
    if (sc > bestScore) {
      bestScore = sc;
      bestMap = perm.slice(0, M);
    }
  }
  return bestMap;
}
