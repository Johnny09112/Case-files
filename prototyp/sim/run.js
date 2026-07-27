// @ts-check
/**
 * Headless v3 simulátor — CLI dávky slotových runů nad enginem (architektura §3,
 * prototyp-mvp.md Fáze 0). Měří metriky brány K1–K9.
 *
 * Použití:
 *   npm run sim -- --runs 2000 --players 4 --strategy kompetentni \
 *     --pursuer agent-malone,serif-brody --seed 1 [--events] [--out logs/moje-davka]
 *
 * `--strategy` je preset (random | naivni | kompetentni | cile | oracle |
 * memorizacni | monokultura) NEBO ho lze složit z os --commit/--assign/--econ.
 * Každá dávka = {verze obsahu, verze pravidel, strategie, pronásledovatel,
 * rozsah seedů} — plně reprodukovatelná. Simulátor nevolá LLM ani fallbacky.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseContent } from '../src/content/loader.js';
import { RULES } from '../src/engine/rules.js';
import { createRun } from '../src/engine/state.js';
import { createStrategy } from './strategies.js';
import { collectRunStats, createAggregate, addRun, finalizeAggregate, renderSummaryMd, k6aVariance } from './report.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

/** Presety strategií (osy commit × assign × econ). */
export const PRESETY = {
  random: { commit: 'naivni', assign: 'random', econ: 'hoard', gamble: false },
  naivni: { commit: 'naivni', assign: 'greedy', econ: 'adaptivni', gamble: true },
  kompetentni: { commit: 'informovany', assign: 'kompetentni', econ: 'adaptivni', gamble: true },
  cile: { commit: 'informovany', assign: 'cile', econ: 'adaptivni', gamble: true },
  oracle: { commit: 'informovany', assign: 'oracle', econ: 'adaptivni', gamble: true },
  memorizacni: { commit: 'informovany', assign: 'memorizacni', econ: 'adaptivni', gamble: true },
  monokultura: { commit: 'monokultura', assign: 'kompetentni', econ: 'adaptivni', gamble: true },
};

/* ---------------- obsah ---------------- */

/** Obsah se čte z kořene monorepa (../obsah), přepsatelné přes CONTENT_DIR (ADR-005). */
export function loadContent() {
  const contentDir = process.env.CONTENT_DIR ? path.resolve(process.env.CONTENT_DIR) : path.resolve(REPO_ROOT, '..');
  const obsahDir = path.join(contentDir, 'obsah');
  const precti = (soubor) => fs.readFileSync(path.join(obsahDir, soubor), 'utf8');
  return parseContent({
    veci: precti('veci.yaml'),
    situace: precti('situace.yaml'),
    postihy: precti('postihy.yaml'),
    mista: precti('mista.yaml'),
    stitky: precti('stitky.yaml'),
    pronasledovatele: precti('pronasledovatele.yaml'),
    cile: precti('cile.yaml'),
    postavy: precti('postavy.yaml'),
  });
}

/* ---------------- jeden run ---------------- */

/**
 * Odehraje jeden run danou strategií (všichni hráči táhnou stejnou strategií).
 * @param {object} opts {seed, content, rules, players, pronasledovatelId, spec}
 * @returns {object[]} kompletní událostní log runu
 */
export function playRun({ seed, content, rules = RULES, players, pronasledovatelId, spec }) {
  const run = createRun({ seed, content, rules, players, pronasledovatelId });
  const strat = createStrategy(spec, seed, rules);
  let pojistka = 0;
  for (;;) {
    const s = run.getState();
    if (s.faze === 'ended') return run.getEvents();
    if (++pojistka > 5000) throw new Error(`playRun: run se nezastavil (fáze ${s.faze}, seed ${seed}).`);
    switch (s.faze) {
      case 'map':
        run.chooseRoute(strat.pickRoute(s));
        break;
      case 'motel_offer':
        run.motelChoice(strat.pickMotelOffer(s));
        break;
      case 'motel':
        strat.motelActions(s, run);
        break;
      case 'commit':
        strat.commit(s, run);
        break;
      case 'assign':
        strat.assign(s, run);
        break;
      default:
        throw new Error(`playRun: neznámá fáze „${s.faze}".`);
    }
  }
}

/**
 * Odehraje dávku runů jedné konfigurace a vrátí finalizovaný souhrn.
 * `agg` se vrací taky, aby šlo víc konfigurací slít do jednoho agregátu —
 * K1 per-count a K6a spread se z jedné konfigurace spočítat nedají.
 */
export function runBatch({ content, players, pronasledovatelId, spec, strategyLabel, seedOd, runs, events, rules = RULES, agg = null }) {
  const vlastni = createAggregate();
  const jsonl = [];
  const hraci = content.postavy.slice(0, players).map((p) => ({ id: p.id, jmeno: p.jmeno }));
  for (let i = 0; i < runs; i++) {
    const seed = seedOd + i;
    const log = playRun({ seed, content, rules, players: hraci, pronasledovatelId, spec });
    const stats = collectRunStats(log);
    addRun(vlastni, stats);
    if (agg) addRun(agg, stats);
    if (events) for (const e of log) jsonl.push(JSON.stringify(e));
  }
  return {
    fin: finalizeAggregate(vlastni),
    agg: vlastni,
    jsonl,
    meta: { players, pursuer: pronasledovatelId, strategy: strategyLabel, seedOd, seedDo: seedOd + runs - 1 },
  };
}

/**
 * Run-to-run variance K6a (podmínka kritika k bodu 5 balíku D26): N disjunktních
 * bloků po `runs` seedech; v každém bloku spread win-rate napříč počty hráčů.
 * Práh ≤6 b. je obhajitelný jen tehdy, je-li 2·sd(spread) < 6.
 */
export function measureVariance({ content, counts, pursuers, spec, strategyLabel, runs, blocks, rules = RULES }) {
  const spready = [];
  const detail = [];
  for (let b = 0; b < blocks; b++) {
    const seedOd = b * runs + 1;
    const agg = createAggregate();
    for (const players of counts) {
      for (const pursuer of pursuers) {
        runBatch({ content, players, pronasledovatelId: pursuer, spec, strategyLabel, seedOd, runs, events: false, rules, agg });
      }
    }
    const fin = finalizeAggregate(agg);
    const spread = fin.k1.k6a.spread.hodnota;
    spready.push(spread);
    detail.push({ blok: b + 1, seedy: `${seedOd}–${seedOd + runs - 1}`, per_count: Object.fromEntries(Object.entries(fin.k1.per_count).map(([k, v]) => [k, v.hodnota])), spread });
  }
  return { detail, souhrn: k6aVariance(spready.filter((x) => x != null)) };
}

/* ---------------- CLI ---------------- */

function parseArgs(argv) {
  const args = { runs: 200, players: '4', strategy: 'kompetentni', pursuer: 'agent-malone,serif-brody', seed: 1, events: false, out: null, commit: null, assign: null, econ: null, blocks: 0 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--runs') args.runs = Number(argv[++i]);
    else if (a === '--players') args.players = argv[++i];
    else if (a === '--strategy') args.strategy = argv[++i];
    else if (a === '--pursuer') args.pursuer = argv[++i];
    else if (a === '--seed') args.seed = Number(argv[++i]);
    else if (a === '--events') args.events = true;
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--commit') args.commit = argv[++i];
    else if (a === '--assign') args.assign = argv[++i];
    else if (a === '--econ') args.econ = argv[++i];
    else if (a === '--blocks') args.blocks = Number(argv[++i]);
    else throw new Error(`Neznámý argument „${a}".`);
  }
  if (!Number.isInteger(args.runs) || args.runs < 1) throw new Error('--runs musí být kladné celé číslo.');
  // `--players` přijímá i seznam („1,2,3,4") — K1 per-count a K6a spread se
  // z jediného počtu hráčů spočítat nedají (D26 bod 5).
  args.counts = String(args.players).split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
  if (args.counts.length === 0 || args.counts.some((n) => !Number.isInteger(n) || n < 1 || n > 4)) {
    throw new Error('--players musí být 1–4 (nebo seznam, např. „1,2,3,4").');
  }
  return args;
}

function specFromArgs(args) {
  const base = PRESETY[args.strategy] ?? PRESETY.kompetentni;
  return { ...base, ...(args.commit ? { commit: args.commit } : {}), ...(args.assign ? { assign: args.assign } : {}), ...(args.econ ? { econ: args.econ } : {}) };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const content = loadContent();
  const spec = specFromArgs(args);
  const pursuers = args.pursuer.split(',').map((s) => s.trim()).filter(Boolean);

  if (args.blocks > 0) {
    const v = measureVariance({ content, counts: args.counts, pursuers, spec, strategyLabel: args.strategy, runs: args.runs, blocks: args.blocks });
    const md = `# K6a run-to-run variance — ${args.blocks} bloků × ${args.runs} seedů\n\n` +
      v.detail.map((d) => `- blok ${d.blok} (seedy ${d.seedy}): ${Object.entries(d.per_count).map(([k, x]) => `${k} ${x}`).join(' · ')} → spread **${d.spread}** b.`).join('\n') +
      `\n\n**Souhrn:** mean ${v.souhrn.mean} · sd ${v.souhrn.sd} · min ${v.souhrn.min} · max ${v.souhrn.max} · 2sd ${v.souhrn.dve_sd}\n` +
      `**Je gate ≤6 b. nad šumem?** ${v.souhrn.prah_6_nad_sumem ? 'ANO (2sd < 6)' : 'NE — práh měří šum, úprava je P-rozhodnutí uživatele'}\n`;
    if (args.out) {
      fs.mkdirSync(path.join(REPO_ROOT, args.out), { recursive: true });
      fs.writeFileSync(path.join(REPO_ROOT, args.out, 'variance.json'), JSON.stringify(v, null, 2));
      fs.writeFileSync(path.join(REPO_ROOT, args.out, 'variance.md'), md);
      console.log(`Hotovo → ${args.out}/variance.md`);
    }
    console.log(md);
    return;
  }

  const casti = [`# v3 simulační dávka — strategie \`${args.strategy}\``];
  const jsonAll = {};
  const gateAgg = createAggregate();
  for (const players of args.counts) {
    for (const pursuer of pursuers) {
      const { fin, jsonl, meta } = runBatch({
        content,
        players,
        pronasledovatelId: pursuer,
        spec,
        strategyLabel: args.strategy,
        seedOd: args.seed,
        runs: args.runs,
        events: args.events,
        agg: gateAgg,
      });
      const label = `${players}p · ${pursuer} · ${args.strategy}`;
      casti.push(renderSummaryMd({ ...meta, label }, fin));
      jsonAll[`${players}p_${pursuer}_${args.strategy}`] = fin;
      if (args.out && args.events) {
        fs.mkdirSync(path.join(REPO_ROOT, args.out), { recursive: true });
        fs.writeFileSync(path.join(REPO_ROOT, args.out, `events_${players}p_${pursuer}.jsonl`), jsonl.join('\n'));
      }
    }
  }
  // Slitý agregát přes všechny konfigurace — jediné místo, kde jde vyhodnotit
  // K1 per-count a K6a spread (gate-tabulka kalibrace-4).
  const gateFin = finalizeAggregate(gateAgg);
  casti.unshift(renderSummaryMd({ label: 'CELÁ BRÁNA (slito přes všechny konfigurace)', seedOd: args.seed, seedDo: args.seed + args.runs - 1, strategy: args.strategy }, gateFin));
  const md = casti.join('\n');
  if (args.out) {
    fs.mkdirSync(path.join(REPO_ROOT, args.out), { recursive: true });
    fs.writeFileSync(path.join(REPO_ROOT, args.out, 'summary.md'), md);
    fs.writeFileSync(path.join(REPO_ROOT, args.out, 'summary.json'), JSON.stringify({ verzeObsahu: content.verze, verzePravidel: RULES.verze, brana: gateFin, konfigurace: jsonAll }, null, 2));
    console.log(`Hotovo → ${args.out}/summary.md`);
  } else {
    console.log(md);
  }
}

// Spustit jen jako CLI (ne při importu z testů).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
