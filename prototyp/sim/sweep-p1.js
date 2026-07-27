// @ts-check
/**
 * P1 sweep — dorovnání obtížnosti 1–4p tempem Žáru (D25d, D26 bod 5).
 *
 * Hledá `zar.tempoDlePoctu`, při kterém K1 padne per-count do [45,70] a K6a
 * spread pod 6 b. Nesahá na běžné uzly (falzifikace kalibrace-3) — mění jen,
 * jak rychle tým dojede na finále.
 *
 * Použití: node sim/sweep-p1.js [runs]
 */

import { RULES } from '../src/engine/rules.js';
import { loadContent, runBatch, PRESETY } from './run.js';
import { createAggregate, finalizeAggregate } from './report.js';

const RUNS = Number(process.argv[2] ?? 400);
const PURSUERS = ['agent-malone', 'serif-brody'];
const content = loadContent();

/** Změří jeden počet hráčů při daném tempu Žáru. */
function zmerCount(players, tempo) {
  const rules = { ...RULES, zar: { ...RULES.zar, prahOffsetDlePoctu: { ...RULES.zar.prahOffsetDlePoctu, [players]: tempo } } };
  const agg = createAggregate();
  for (const pursuer of PURSUERS) {
    runBatch({ content, players, pronasledovatelId: pursuer, spec: PRESETY.kompetentni, strategyLabel: 'kompetentni', seedOd: 1, runs: RUNS, events: false, rules, agg });
  }
  const fin = finalizeAggregate(agg);
  return {
    k1: fin.k1.celkem.hodnota,
    k5f: fin.k5f.celkem.hodnota,
    zarMedian: fin.ekonomika.zar_median,
  };
}

const TEMPA = [0, 1, 2, 3];
console.log(`# P1 sweep — posun prahů Žáru per počet hráčů (${RUNS} runů × 2 pronásledovatelé na buňku)\n`);
console.log('| počet | ' + TEMPA.map((t) => `offset ${t}`).join(' | ') + ' |');
console.log('|---|' + TEMPA.map(() => '---').join('|') + '|');

const tabulka = {};
for (const players of [1, 2, 3, 4]) {
  const radek = TEMPA.map((t) => zmerCount(players, t));
  tabulka[players] = radek;
  console.log(`| ${players}p | ` + radek.map((r) => `K1 ${r.k1} / K5f ${r.k5f}`).join(' | ') + ' |');
}

// Najdi kombinaci tempa, která srovná K1 co nejblíž společnému cíli.
console.log('\n## Nejlepší kombinace (minimalizuje spread K1 při dodržení pásma [45,70])\n');
let nej = null;
const idx = [0, 1, 2, 3];
for (const i1 of idx) for (const i2 of idx) for (const i3 of idx) for (const i4 of idx) {
  const v = [tabulka[1][i1].k1, tabulka[2][i2].k1, tabulka[3][i3].k1, tabulka[4][i4].k1];
  if (v.some((x) => x == null || x < 45 || x > 70)) continue;
  const spread = Math.max(...v) - Math.min(...v);
  if (!nej || spread < nej.spread) nej = { spread, tempa: [TEMPA[i1], TEMPA[i2], TEMPA[i3], TEMPA[i4]], k1: v };
}
if (nej) {
  console.log("offset:", JSON.stringify({ 1: nej.tempa[0], 2: nej.tempa[1], 3: nej.tempa[2], 4: nej.tempa[3] }));
  console.log('K1 per count:', nej.k1.join(' · '), '→ spread', Math.round(nej.spread * 10) / 10, 'b.', nej.spread <= 6 ? '✅ K6a' : '❌ K6a');
} else {
  console.log('ŽÁDNÁ kombinace v tomto rozsahu tempa nedostane vsechny pocty do [45,70].');
}
