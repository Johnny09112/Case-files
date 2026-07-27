// @ts-check
/**
 * Run-to-run variance K2 driftu (a K6a spreadu) — gate ≥ 1,3.
 *
 * Když návrh doveze drift na 1,32, je marže 0,02 a otázka „je to pass, nebo
 * šum?" je legitimní. Stejná disciplína, jakou si kritik vymínil u K6a ≤6 b.
 * a jakou jsem použil u K5f.
 *
 * Použití: node sim/k2-variance.js [runsNaBlok] [pocetBloku]
 */

import { RULES } from '../src/engine/rules.js';
import { loadContent, runBatch, PRESETY } from './run.js';
import { createAggregate, finalizeAggregate, sd } from './report.js';

const RUNS = Number(process.argv[2] ?? 1000);
const BLOKY = Number(process.argv[3] ?? 6);
const PURSUERS = ['agent-malone', 'serif-brody'];
const content = loadContent();

const drifty = [];
const floory = [];
const spready = [];
const k5d = [];

for (let b = 0; b < BLOKY; b++) {
  const seedOd = b * RUNS + 1;
  const agg = createAggregate();
  for (const players of [1, 2, 3, 4]) {
    for (const pursuer of PURSUERS) {
      runBatch({ content, players, pronasledovatelId: pursuer, spec: PRESETY.kompetentni, strategyLabel: 'kompetentni', seedOd, runs: RUNS, events: false, rules: RULES, agg });
    }
  }
  const fin = finalizeAggregate(agg);
  drifty.push(fin.k2.gate_ordinal_uzlu.drift.hodnota);
  floory.push(fin.k2.gate_ordinal_uzlu.prusvih_rate_3_4.hodnota);
  spready.push(fin.k1.k6a.spread.hodnota);
  k5d.push(fin.k5.varianta_d.exp_dead.hodnota);
}

const r = (x, d = 3) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);
function radek(nazev, vals, gate, smer) {
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const s = sd(vals);
  // „Pass mimo šum" = i konzervativní hrana (mean ∓ 2sd) je na správné straně gate.
  const hrana = smer === '>=' ? mean - 2 * s : mean + 2 * s;
  const ok = smer === '>=' ? hrana >= gate : hrana <= gate;
  const bloku = vals.filter((v) => (smer === '>=' ? v >= gate : v <= gate)).length;
  console.log(`| ${nazev} | ${gate} | ${r(mean)} | ${r(s)} | ${r(Math.min(...vals))} | ${r(Math.max(...vals))} | ${bloku}/${vals.length} | ${ok ? '**ANO**' : 'NE — marže je uvnitř šumu'} |`);
}

console.log(`# Variance gatů — ${BLOKY} bloků × ${RUNS} seedů × 4 počty × 2 pronásledovatelé\n`);
console.log('| metrika | gate | mean | sd | min | max | bloků v gate | pass mimo šum (mean ∓ 2sd)? |');
console.log('|---|---|---|---|---|---|---|---|');
radek('K2 drift', drifty, 1.3, '>=');
radek('K2 floor pozdní PRŮŠVIH %', floory, 20, '>=');
radek('K6a spread b.', spready, 6, '<=');
radek('K5-D expDead %', k5d, 10, '<=');
