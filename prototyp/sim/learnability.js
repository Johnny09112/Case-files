// @ts-check
/**
 * K7 gate (3) — commit-learnabilita (kalibrace-4, D26 bod 3; podmínka kritika).
 *
 * Měří `commit-optimal − commit-random`, OBOJÍ s gamble-politikou (gambluj iff
 * odhad ≤ 2). Hlídá, že zvolený (hedge) gamble netrivializuje commit: kdyby ho
 * trivializoval, mezera by se smrskla a reframe K7 by byl nekryté rozvolnění.
 *
 * **Gate ≥ 12 b.** (reuse prahu K4c). Klesne-li pod, reframe K7 padá a „cena
 * gamblu" se vrací uživateli jako P-rozhodnutí — dál se nepokračuje.
 *
 * Kontrolní běh bez gamblu ukazuje, kolik z mezery gamble ukrajuje.
 *
 * Použití: node sim/learnability.js [runs] [outFile]
 */

import fs from 'node:fs';
import { RULES } from '../src/engine/rules.js';
import { loadContent, runBatch, PRESETY } from './run.js';
import { createAggregate, finalizeAggregate } from './report.js';

const RUNS = Number(process.argv[2] ?? 1000);
const OUT = process.argv[3] ?? null;
const COUNTS = [1, 2, 3, 4];
const PURSUERS = ['agent-malone', 'serif-brody'];
const content = loadContent();

/** Slije všechny počty hráčů × pronásledovatele do jednoho agregátu. */
function zmer(spec, label) {
  const agg = createAggregate();
  for (const players of COUNTS) {
    for (const pursuer of PURSUERS) {
      runBatch({ content, players, pronasledovatelId: pursuer, spec, strategyLabel: label, seedOd: 1, runs: RUNS, events: false, rules: RULES, agg });
    }
  }
  return finalizeAggregate(agg);
}

// „commit-optimal" má dvě legitimní čtení a gate na nich stojí — měříme OBĚ:
//  (a) kompetentní commit = informovaný s kanonickou fidelitou telegrafu 0,7;
//  (b) optimální commit = dokonalé čtení telegrafu (fidelita 1,0). Výš než (b)
//      se jít nedá: commit je ze zadání NASLEPO (D15/D17), takže žádný „commit
//      oracle" znající skryté prahy neexistuje.
const varianty = {
  kompetentni_s_gamblem: { ...PRESETY.kompetentni, commit: 'informovany', fidelita: 0.7, gamble: true },
  optimal_s_gamblem: { ...PRESETY.kompetentni, commit: 'informovany', fidelita: 1, gamble: true },
  // Druhá (a u K4c JEDINÁ VÁZAJÍCÍ) půlka learnability: zdegeneruje commit-osa
  // po pár runech na lookup tabulku? Gate-analog K4c: memorizační − kompetentní ≤ 3 b.
  memorizacni_s_gamblem: { ...PRESETY.kompetentni, commit: 'memorizacni', gamble: true },
  random_s_gamblem: { ...PRESETY.kompetentni, commit: 'nahodny', gamble: true },
  // Sanity: monotonie fidelity — víc informace nesmí škodit (nález kritika 3)
  fidelita_03_s_gamblem: { ...PRESETY.kompetentni, commit: 'informovany', fidelita: 0.3, gamble: true },
  fidelita_05_s_gamblem: { ...PRESETY.kompetentni, commit: 'informovany', fidelita: 0.5, gamble: true },
  // Kontrola: bez gamblu — ukazuje, zda gamble commit TRIVIALIZUJE (obava za gatem)
  kompetentni_bez_gamblu: { ...PRESETY.kompetentni, commit: 'informovany', fidelita: 0.7, gamble: false },
  optimal_bez_gamblu: { ...PRESETY.kompetentni, commit: 'informovany', fidelita: 1, gamble: false },
  random_bez_gamblu: { ...PRESETY.kompetentni, commit: 'nahodny', gamble: false },
};

const vysledky = {};
for (const [k, spec] of Object.entries(varianty)) {
  const fin = zmer(spec, k);
  vysledky[k] = {
    celkem: fin.k1.celkem.hodnota,
    per_count: Object.fromEntries(Object.entries(fin.k1.per_count).map(([c, v]) => [c, v.hodnota])),
  };
}

const mezera = (a, b) => ({
  celkem: Math.round((vysledky[a].celkem - vysledky[b].celkem) * 10) / 10,
  per_count: Object.fromEntries(COUNTS.map((c) => [`${c}p`, Math.round((vysledky[a].per_count[`${c}p`] - vysledky[b].per_count[`${c}p`]) * 10) / 10])),
});

const kompSGamblem = mezera('kompetentni_s_gamblem', 'random_s_gamblem');
const optSGamblem = mezera('optimal_s_gamblem', 'random_s_gamblem');
const kompBezGamblu = mezera('kompetentni_bez_gamblu', 'random_bez_gamblu');
const optBezGamblu = mezera('optimal_bez_gamblu', 'random_bez_gamblu');

const out = {
  runu_na_konfiguraci: RUNS,
  konfiguraci: COUNTS.length * PURSUERS.length,
  varianty: vysledky,
  learnabilita: {
    kompetentni_s_gamblem: kompSGamblem,
    optimal_s_gamblem: optSGamblem,
    kompetentni_bez_gamblu: kompBezGamblu,
    optimal_bez_gamblu: optBezGamblu,
  },
  gate: '≥ 12 b. (commit-optimal − commit-random, oba s gamble-politikou)',
  plni_kompetentni: kompSGamblem.celkem >= 12,
  plni_optimal: optSGamblem.celkem >= 12,
  // Obava za gatem: „gamble trivializuje commit". Kladné číslo = gamble mezeru
  // ZVĚTŠUJE, tedy commit je s gamblem CENNĚJŠÍ, ne levnější.
  gamble_meni_mezeru_o_b: {
    kompetentni: Math.round((kompSGamblem.celkem - kompBezGamblu.celkem) * 10) / 10,
    optimal: Math.round((optSGamblem.celkem - optBezGamblu.celkem) * 10) / 10,
  },
};

const md = `# K7 learnabilita commitu — ${RUNS} runů × ${COUNTS.length} počtů × ${PURSUERS.length} pronásledovatelé

| varianta | celkem | ${COUNTS.map((c) => `${c}p`).join(' | ')} |
|---|---|${COUNTS.map(() => '---').join('|')}|
${Object.entries(vysledky).map(([k, v]) => `| ${k} | ${v.celkem} | ${COUNTS.map((c) => v.per_count[`${c}p`]).join(' | ')} |`).join('\n')}

## Learnabilita commitu (gate ≥ 12 b.)

| čtení „commit-optimal" | s gamblem (kanonické) | bez gamblu (kontrola) | verdikt |
|---|---|---|---|
| kompetentní (fidelita 0,7) | **${kompSGamblem.celkem} b.** | ${kompBezGamblu.celkem} b. | ${out.plni_kompetentni ? '✅ PLNÍ' : '❌ NEPLNÍ'} |
| optimální (fidelita 1,0) | **${optSGamblem.celkem} b.** | ${optBezGamblu.celkem} b. | ${out.plni_optimal ? '✅ PLNÍ' : '❌ NEPLNÍ'} |

per count (optimal s gamblem): ${COUNTS.map((c) => `${c}p ${optSGamblem.per_count[`${c}p`]}`).join(' · ')}

## Memorizace commitu (analog vázající půlky K4c: memorizační − kompetentní ≤ 3 b.)

**${mezera('memorizacni_s_gamblem', 'kompetentni_s_gamblem').celkem} b.** —
${mezera('memorizacni_s_gamblem', 'kompetentni_s_gamblem').celkem <= 3 ? '✅ commit-osa NEdegeneruje na lookup tabulku' : '❌ memorizace poráží čtení telegrafu → commit-osa je po pár runech tabulka'}
per count: ${COUNTS.map((c) => `${c}p ${mezera('memorizacni_s_gamblem', 'kompetentni_s_gamblem').per_count[`${c}p`]}`).join(' · ')}

## Monotonie fidelity (sanity — víc informace nesmí škodit)

${['fidelita_03_s_gamblem', 'fidelita_05_s_gamblem', 'kompetentni_s_gamblem', 'optimal_s_gamblem'].map((k) => `- ${k}: celkem ${vysledky[k].celkem} | ${COUNTS.map((c) => `${c}p ${vysledky[k].per_count[`${c}p`]}`).join(' · ')}`).join('\n')}

**Trivializuje gamble commit?** Gamble mění mezeru o **${out.gamble_meni_mezeru_o_b.optimal} b.** (optimal) /
**${out.gamble_meni_mezeru_o_b.kompetentni} b.** (kompetentní). Kladné číslo = s gamblem je commit
CENNĚJŠÍ, ne levnější → obava, kvůli které gate (3) vznikl, se měřením NEPOTVRZUJE.
`;

if (OUT) {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  fs.writeFileSync(OUT.replace(/\.json$/, '.md'), md);
}
console.log(md);
