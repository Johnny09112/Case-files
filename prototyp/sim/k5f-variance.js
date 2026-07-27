// @ts-check
/**
 * Run-to-run variance K5f (přežití konfrontace) per počet hráčů × pronásledovatel.
 *
 * Gate je pásmo [60, 80] %. Když naměřený „breach" 80,2–80,6 leží uvnitř šumu,
 * není co honit — a hnát se za ním obsahem by bylo ladění na šum. Stejná logika,
 * jakou si kritik vymínil u K6a ≤6 b.
 *
 * Použití: node sim/k5f-variance.js [runsNaBlok] [pocetBloku]
 */

import { RULES } from '../src/engine/rules.js';
import { loadContent, runBatch, PRESETY } from './run.js';
import { createAggregate, finalizeAggregate, sd } from './report.js';

const RUNS = Number(process.argv[2] ?? 1000);
const BLOKY = Number(process.argv[3] ?? 6);
const PURSUERS = ['agent-malone', 'serif-brody'];
const content = loadContent();

/** klíč `4p_serif-brody` → pole hodnot přes bloky */
const serie = new Map();

for (let b = 0; b < BLOKY; b++) {
  const seedOd = b * RUNS + 1;
  for (const players of [1, 2, 3, 4]) {
    for (const pursuer of PURSUERS) {
      const agg = createAggregate();
      runBatch({ content, players, pronasledovatelId: pursuer, spec: PRESETY.kompetentni, strategyLabel: 'kompetentni', seedOd, runs: RUNS, events: false, rules: RULES, agg });
      const fin = finalizeAggregate(agg);
      const klic = `${players}p_${pursuer}`;
      const v = fin.k5f.celkem.hodnota;
      if (!serie.has(klic)) serie.set(klic, []);
      serie.get(klic).push(v);
    }
  }
}

const r2 = (x) => (x == null ? null : Math.round(x * 100) / 100);
console.log(`# K5f run-to-run variance — ${BLOKY} bloků × ${RUNS} seedů\n`);
console.log('| konfigurace | mean | sd | min | max | 2sd | breach 80 mimo šum? |');
console.log('|---|---|---|---|---|---|---|');
for (const [klic, vals] of serie) {
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const s = sd(vals);
  // „Breach je reálný" = i dolní hrana pásma mean − 2sd leží nad stropem 80.
  const realny = mean - 2 * s > 80;
  const nadStropem = vals.filter((v) => v > 80).length;
  console.log(`| ${klic} | ${r2(mean)} | ${r2(s)} | ${r2(Math.min(...vals))} | ${r2(Math.max(...vals))} | ${r2(2 * s)} | ${realny ? '**ANO**' : `ne (${nadStropem}/${vals.length} bloků nad 80)`} |`);
}
