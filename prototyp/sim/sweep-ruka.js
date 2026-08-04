// @ts-check
/**
 * Sweep rezervní páky `hraci[n].ruka` — D58 bod 4 (projekt/rozhodnuti.md D58/D39).
 *
 * Po zapečení D58 (Žár klimax + Malone V2-A′ + V4-D clamp) je K1 celkem ~80,7 %
 * — 2p/3p/4p breachují strop 70 (2p ~80,65 · 3p ~86,60 · 4p ~87,20, viz
 * `../technika/mereni-zar-malone-2026-08-02.md` §8). Páka = zmenšit TÝMOVÉ ruce
 * (`RULES.ruce[n].ruka`), aby se zúžil výběr nejlepší karty napříč týmem
 * (driver K1 3p/4p z D35). `commit` (rozdělení 4 slotů mezi hráče) se NEMĚNÍ —
 * jen velikost ruky, ze které se committuje a gambluje. 1p (ruka 8) je mimo
 * sweep — je v pásmu, D39 poznámka „větší ruka u méně hráčů vyrovnává K6a".
 *
 * Injektáž `{...RULES, ruce: {...}}` — `rules.js` se needituje (ADR-003 čísla
 * zůstávají jediným zdrojem pravdy, dokud se kandidát nezapéká).
 *
 * Guardrail: ruka nesmí klesnout pod (max commitů jednoho hráče v uzlu) + 1,
 * jinak gamble nemá z čeho táhnout (gamble.js: `owner.ruka.length === 0` hodí
 * chybu). Max commitů/hráče: 2p→2 (ruka≥3), 3p→2 (ruka≥3), 4p→1 (ruka≥2).
 * Sweep rozsahy {5,4}/{4,3}/{3,2} se drží přesně na téhle hraně u dolní meze
 * (3p=3, 4p=2) — testuje se záměrně na floor.
 *
 * Použití:
 *   node sim/sweep-ruka.js explore [runsPerCell=1500]
 *     -> per-count izolovaná diagnostika (počty jsou vzájemně nezávislé —
 *        změna ruky u 2p neovlivní běhy 3p/4p), jeden běh = jedna buňka.
 *   node sim/sweep-ruka.js confirm <ruka2> <ruka3> <ruka4> [runsPerCell=1000] [seedOd=1]
 *     -> jeden blok plné brány (4 počty × 2 pronásledovatelé × runsPerCell),
 *        stejná metodika jako D57(2)/D58 dodatek (mereni-zar-malone §8).
 */

import { RULES } from '../src/engine/rules.js';
import { loadContent, runBatch, PRESETY } from './run.js';
import { createAggregate, finalizeAggregate } from './report.js';

const PURSUERS = ['agent-malone', 'serif-brody'];
const content = loadContent();

function rulesFor(overrides) {
  const ruce = { ...RULES.ruce };
  for (const [count, ruka] of Object.entries(overrides)) {
    ruce[count] = { ...ruce[count], ruka };
  }
  return { ...RULES, ruce };
}

/** Izolovaný běh jednoho počtu hráčů (ostatní počty nejsou dotčeny — nezávislé). */
function zmerIzolovane(players, ruka, runsPerCell) {
  const overrides = players === 1 ? {} : { [players]: ruka };
  const rules = rulesFor(overrides);
  const agg = createAggregate();
  for (const pursuer of PURSUERS) {
    runBatch({ content, players, pronasledovatelId: pursuer, spec: PRESETY.kompetentni, strategyLabel: 'kompetentni', seedOd: 1, runs: runsPerCell, events: false, rules, agg });
  }
  const fin = finalizeAggregate(agg);
  return {
    k1: fin.k1.celkem.hodnota,
    k5f: fin.k5f.celkem.hodnota,
    k5f_proher_finale: fin.k5f.podil_proher_ve_finale.hodnota,
    expDead: fin.k5.varianta_d.exp_dead.hodnota,
    k2_drift: fin.k2.gate_ordinal_uzlu.drift.hodnota,
    k2_floor: fin.k2.gate_ordinal_uzlu.prusvih_rate_3_4.hodnota,
    k7_zachranny_podil: fin.k7.dostupne ? fin.k7.podil_uzlu_zachranny.hodnota : null,
    k7_zachranny_take: fin.k7.dostupne ? fin.k7.zachranny.take_rate.hodnota : null,
    k7_silny_take: fin.k7.dostupne ? fin.k7.silny.take_rate.hodnota : null,
    k7_hedge_podil: fin.k7.dostupne ? fin.k7.podil_uzlu_hedge.hodnota : null,
    zar_median: fin.ekonomika.zar_median,
  };
}

function fmt(v) {
  return v == null ? '—' : v;
}

const mode = process.argv[2] ?? 'explore';

if (mode === 'explore') {
  const RUNS = Number(process.argv[3] ?? 1500);
  console.log(`# Sweep ruka — explorace, izolovaně per počet (${RUNS} runů/pronásledovatel/buňka, 2 pronásledovatelé)\n`);

  const KANDIDATI = {
    1: [8],
    2: [5, 4],
    3: [4, 3],
    4: [3, 2],
  };

  const vysledky = {};
  for (const players of [1, 2, 3, 4]) {
    vysledky[players] = {};
    for (const ruka of KANDIDATI[players]) {
      const r = zmerIzolovane(players, ruka, RUNS);
      vysledky[players][ruka] = r;
      console.log(`${players}p ruka=${ruka}: K1 ${fmt(r.k1)} | K5f ${fmt(r.k5f)} (proher-finale ${fmt(r.k5f_proher_finale)}) | expDead ${fmt(r.expDead)} | K2 drift ${fmt(r.k2_drift)} floor ${fmt(r.k2_floor)} | K7 zachranny podil ${fmt(r.k7_zachranny_podil)} take ${fmt(r.k7_zachranny_take)} | K7 silny take ${fmt(r.k7_silny_take)} | K7 hedge podil ${fmt(r.k7_hedge_podil)} | zar median ${fmt(r.zar_median)}`);
    }
  }

  console.log('\n## Kombinace (K1 per count + K6a spread nad kombinací) — počty jsou nezávislé, kombinuje se post-hoc\n');
  const kombinace = {
    baseline: { 1: 8, 2: 5, 3: 4, 4: 3 },
    'floor (2:4,3:3,4:2)': { 1: 8, 2: 4, 3: 3, 4: 2 },
    'mid (2:4,3:4,4:3)': { 1: 8, 2: 4, 3: 4, 4: 3 },
    'jen 4p (2:5,3:4,4:2)': { 1: 8, 2: 5, 3: 4, 4: 2 },
  };
  for (const [label, combo] of Object.entries(kombinace)) {
    const ks = [1, 2, 3, 4].map((p) => vysledky[p][combo[p]]?.k1);
    if (ks.some((k) => k == null)) { console.log(`${label}: chybí data (${JSON.stringify(combo)})`); continue; }
    const spread = Math.round((Math.max(...ks) - Math.min(...ks)) * 10) / 10;
    console.log(`${label} → K1 1p/2p/3p/4p: ${ks.join(' / ')} | K6a spread ${spread} b. ${spread <= 6 ? '✅' : '❌'} | pásmo [45,70]: ${ks.map((k) => (k >= 45 && k <= 70 ? '✅' : '❌')).join(' ')}`);
  }
} else if (mode === 'confirm') {
  const ruka2 = Number(process.argv[3]);
  const ruka3 = Number(process.argv[4]);
  const ruka4 = Number(process.argv[5]);
  const RUNS = Number(process.argv[6] ?? 1000);
  const seedOd = Number(process.argv[7] ?? 1);
  if (!ruka2 || !ruka3 || !ruka4) throw new Error('confirm vyžaduje: <ruka2> <ruka3> <ruka4> [runsPerCell] [seedOd]');

  const rules = rulesFor({ 2: ruka2, 3: ruka3, 4: ruka4 });
  console.log(`# Sweep ruka — confirm blok (seed ${seedOd}..${seedOd + RUNS - 1}, ${RUNS} runů/buňka, 4 počty × 2 pronásledovatelé = ${RUNS * 8} runů)\n`);
  console.log(`ruce override: 2p=${ruka2} 3p=${ruka3} 4p=${ruka4} (1p=8 nezměněno)\n`);

  const agg = createAggregate();
  for (const players of [1, 2, 3, 4]) {
    for (const pursuer of PURSUERS) {
      runBatch({ content, players, pronasledovatelId: pursuer, spec: PRESETY.kompetentni, strategyLabel: 'kompetentni', seedOd, runs: RUNS, events: false, rules, agg });
    }
  }
  const fin = finalizeAggregate(agg);
  console.log('K1 celkem:', fin.k1.celkem.hodnota);
  console.log('K1 per_count:', JSON.stringify(Object.fromEntries(Object.entries(fin.k1.per_count).map(([k, v]) => [k, v.hodnota]))));
  console.log('K1 breach:', JSON.stringify(fin.k1.breach));
  console.log('K6a spread:', fin.k1.k6a.spread.hodnota, fin.k1.k6a.plni ? '✅' : '❌');
  console.log('K5-D expDead pooled:', fin.k5.varianta_d.exp_dead.hodnota);
  console.log('K5f celkem:', fin.k5f.celkem.hodnota, '| proher_ve_finale:', fin.k5f.podil_proher_ve_finale.hodnota, fin.k5f.plni_podil_proher ? '✅' : '❌');
  console.log('K5f per_count:', JSON.stringify(Object.fromEntries(Object.entries(fin.k5f.per_count).map(([k, v]) => [k, v.preziti_konfrontace.hodnota]))));
  console.log('K2 drift/floor:', fin.k2.gate_ordinal_uzlu.drift.hodnota, fin.k2.gate_ordinal_uzlu.prusvih_rate_3_4.hodnota, fin.k2.plni ? '✅' : '❌');
  console.log('K7:', fin.k7.dostupne ? JSON.stringify(fin.k7.plni) : 'nedostupné');
  console.log('K7 podil zachranny/hedge/silny:', fin.k7.dostupne ? [fin.k7.podil_uzlu_zachranny.hodnota, fin.k7.podil_uzlu_hedge.hodnota, fin.k7.podil_uzlu_silny.hodnota].join(' / ') : '—');
  console.log('K7 take zachranny/hedge/silny:', fin.k7.dostupne ? [fin.k7.zachranny.take_rate.hodnota, fin.k7.hedge.take_rate.hodnota, fin.k7.silny.take_rate.hodnota].join(' / ') : '—');
  console.log('zar median:', fin.ekonomika.zar_median);
  console.log('konfrontaci dosahlo (per_count dojezd_do_konfrontace):', JSON.stringify(Object.fromEntries(Object.entries(fin.k5f.per_count).map(([k, v]) => [k, v.dojezd_do_konfrontace.hodnota]))));
} else {
  throw new Error(`Neznámý mode „${mode}" (explore | confirm).`);
}
