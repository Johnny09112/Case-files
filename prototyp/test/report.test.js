// @ts-check
/**
 * Testy formalizovaného `sim/report.js` (kalibrace-4, D26 bod 0a).
 *
 * Nejdůležitější je TRIPWIRE (případ 1): report rekonstruuje `odhad` post-hoc
 * z logu, zatímco bot ho počítá za běhu. Kdyby se ta dvě čísla rozešla, K7 by
 * měřila něco jiného, než co bot skutečně dělal — a nikdo by si toho nevšiml.
 */
import { describe, it, expect } from 'vitest';
import { RULES } from '../src/engine/rules.js';
import { playRun, PRESETY, loadContent } from '../sim/run.js';
import {
  collectRunStats, createAggregate, addRun, finalizeAggregate,
  jeNulovanySlot, bucketTypu, k6aVariance, sd,
} from '../sim/report.js';

const content = loadContent();
const hraci = (n) => content.postavy.slice(0, n).map((p) => ({ id: p.id, jmeno: p.jmeno }));

/** Odehraje dávku a vrátí `{fin, uzly, runy}`. */
function davka({ runs = 40, players = 4, pursuer = 'agent-malone', seed = 1, spec = PRESETY.kompetentni } = {}) {
  const agg = createAggregate();
  const uzly = [];
  for (let i = 0; i < runs; i++) {
    const log = playRun({ seed: seed + i, content, rules: RULES, players: hraci(players), pronasledovatelId: pursuer, spec });
    const s = collectRunStats(log);
    addRun(agg, s);
    uzly.push(...s.uzly);
  }
  return { fin: finalizeAggregate(agg), uzly, agg };
}

/* ================= syntetické logy ================= */

const STAT4 = (utok) => ({ utok, obrana: 0, hodnota: 0, improvizace: 0, nastroj: 0 });
const slot = (i, over = {}) => ({ slot_index: i, role: `r${i}`, stat: 'utok', kotva: 3, sum: 0, prah: 3, typ_prahu: 'jednostat', viditelnost: 'viditelna', stitek_citlivy: null, ...over });
const karta = (id, utok) => ({ karta_id: id, staty: STAT4(utok), stitky: [] });

/**
 * Sestaví minimální log jednoho runu z popisu uzlů.
 * @param {object} p
 */
function stavLog({ pocetHracu = 1, pronasledovatel = 'serif-brody', rusi = null, uzly, vysledek = 'DORUCENO', pricina = 'dojezd' }) {
  const ev = [{ type: 'run_started', nodeIndex: 0, seed: 1, pocetHracu, pronasledovatel, rusi, cile: [] }];
  uzly.forEach((u, idx) => {
    const n = idx + 1;
    const sloty = u.sloty ?? [slot(0), slot(1), slot(2), slot(3)];
    const commit = u.commit ?? [karta('c1', 0), karta('c2', 0), karta('c3', 0), karta('c4', 0)];
    ev.push({ type: 'commit', nodeIndex: n, commit: commit.map((c) => ({ hrac_id: 'h1', ...c })) });
    ev.push({ type: 'situation_revealed', nodeIndex: n, situace_id: u.situaceId ?? `sit${n}`, typ: u.typ ?? 'npc', typ_mista: u.typ ?? 'npc', sloty });
    if (u.ctx !== false) {
      ev.push({
        type: 'assign_context', nodeIndex: n, situace_id: u.situaceId ?? `sit${n}`, typ: u.typ ?? 'npc',
        stitek_chovani: null,
        gamble_dostupny: u.gambleDostupny ?? true,
        gamble_blokovan: (u.gambleDostupny ?? true) ? null : (u.gambleBlokovan ?? 'lock_gamble'),
        ruce: u.ruce ?? [{ hrac_id: 'h1', slozena: false, karty: [] }],
      });
    }
    if (u.gambleVzat) ev.push({ type: 'gamble', nodeIndex: n, ci_ruka: 'h1', zbyvajici_v_ruce: 2, tazena: 'x', nahrazena: 'c1', do_slotu: null });
    sloty.forEach((s, si) => ev.push({
      type: 'slot_resolved', nodeIndex: n, slot_index: si, karta_id: `c${si + 1}`, hrac_id: 'h1',
      stat: s.stat, stat_hodnota: 0, prah: s.prah, typ_prahu: s.typ_prahu, viditelnost: s.viditelnost,
      stitky: [], stitek_efekt: null, pronasledovatel_efekt: null,
      zasah: si < (u.zasahy ?? 0), duvod: si < (u.zasahy ?? 0) ? 'proslo' : (u.duvod ?? 'nizky_stat'),
    }));
    ev.push({
      type: 'band_resolved', nodeIndex: n, zasahy: u.zasahy ?? 0, pasmo: u.pasmo ?? '≤1/4_PRUSVIH',
      max_achievable_zasahy: u.maxPost ?? 0, max_achievable_band: '≤1/4_PRUSVIH', gap: 0,
      naklad_ztrata: 0, zbyva_beden: 5,
    });
  });
  ev.push({ type: 'run_ended', nodeIndex: 99, vysledek, pricina, pocet_uzlu: uzly.length, zbyva_beden: 5, konecny_zar: 3, kredity_zbytek: 7, cile: [] });
  return ev.map((e, i) => ({ seq: i + 1, ...e }));
}

/* ================= testy ================= */

describe('report.js — tripwire a invarianty nad reálnou dávkou', () => {
  it('1) rekonstruovaný odhad se SHODUJE s gamble-politikou bota (100 % uzlů)', () => {
    const neshody = [];
    for (const pursuer of ['agent-malone', 'serif-brody']) {
      for (const players of [1, 4]) {
        const { uzly } = davka({ runs: 25, players, pursuer });
        for (const u of uzly) {
          if (u.odhad == null) continue;
          const ocekavano = u.gambleDostupny === true && u.odhad <= 2;
          if (u.gambleVzat !== ocekavano) neshody.push({ pursuer, players, situace: u.situaceId, odhad: u.odhad, dostupny: u.gambleDostupny, vzat: u.gambleVzat });
        }
      }
    }
    expect(neshody).toEqual([]);
  });

  it('2) monotonie K5: podíl(maxPre≤1) ≥ expDead ≥ strictDead', () => {
    const { fin } = davka({ runs: 60 });
    const d = fin.k5.varianta_d;
    expect(fin.k5.max_do_1.pre_gamble_common.hodnota).toBeGreaterThanOrEqual(d.exp_dead.hodnota);
    expect(d.exp_dead.hodnota).toBeGreaterThanOrEqual(d.strict_dead.hodnota);
    expect(d.monotonie_ok).toBe(true);
  });

  it('3) free-pass ≤ doslovné čtení; u Brodyho (rusi = null) ROVNOST', () => {
    const m = davka({ runs: 40, pursuer: 'agent-malone' }).fin.k5;
    expect(m.free_pass.max_do_1_common.hodnota).toBeLessThanOrEqual(m.max_do_1.pre_gamble_common.hodnota);
    const b = davka({ runs: 40, pursuer: 'serif-brody' }).fin.k5;
    expect(b.free_pass.max_do_1_common.hodnota).toBe(b.max_do_1.pre_gamble_common.hodnota);
    expect(b.free_pass.podil_nulovanych_slotu.hodnota).toBe(0);
  });

  it('K5f: přežití konfrontace a přežití JAKÉHOKOLI finále jsou dvě různá čísla', () => {
    const { fin } = davka({ runs: 60 });
    expect(fin.k5f.celkem.hodnota).not.toBeNull();
    const c = fin.k5f.per_count['4p'];
    expect(c.dojezd_do_konfrontace.hodnota).toBeLessThanOrEqual(c.dojezd_do_finale.hodnota);
    expect(c.preziti_konfrontace.definice).toContain('KONFRONTACE');
  });
});

describe('report.js — nulované sloty (free-pass definice, bod 1 balíku)', () => {
  const rusi = { typ: 'stat', cil: 'hodnota' };
  it('4) detekce nulovaného slotu dle schématu rusi', () => {
    expect(jeNulovanySlot({ stat: 'hodnota' }, rusi)).toBe(true);
    expect(jeNulovanySlot({ stat: 'utok' }, rusi)).toBe(false);
    expect(jeNulovanySlot({ stat: ['hodnota', 'obrana'] }, rusi)).toBe(false);
    expect(jeNulovanySlot({ stat: ['hodnota', 'hodnota'] }, rusi)).toBe(true);
    expect(jeNulovanySlot({ stat: 'hodnota' }, null)).toBe(false);
  });
});

describe('report.js — K5 varianta D (realistická gamble-politika)', () => {
  // 4 sloty utok≥3; committnuté c1 utok5 (projde) + tři nuly → maxPre = 1 (kandidát).
  const commit = [karta('c1', 5), karta('c2', 0), karta('c3', 0), karta('c4', 0)];

  it('5) jedna ruka, 1 ze 2 karet zachrání → expDead 0,5 · strictDead 0', () => {
    const log = stavLog({ uzly: [{ commit, ruce: [{ hrac_id: 'h1', slozena: false, karty: [karta('d1', 5), karta('d2', 0)] }] }] });
    const u = collectRunStats(log).uzly[0];
    expect(u.maxPre).toBe(1);
    expect(u.expDead).toBeCloseTo(0.5, 9);
    expect(u.strictDead).toBe(0);
  });

  it('6) gamble nedostupný → uzel je mrtvý v obou číslech', () => {
    const log = stavLog({ uzly: [{ commit, gambleDostupny: false, gambleBlokovan: 'lock_gamble', ruce: [{ hrac_id: 'h1', slozena: false, karty: [karta('d1', 5)] }] }] });
    const u = collectRunStats(log).uzly[0];
    expect(u.expDead).toBe(1);
    expect(u.strictDead).toBe(1);
  });

  it('7) volba ruky se MAXIMALIZUJE (0,25 vs 0,75 → bere lepší)', () => {
    const ruceA = { hrac_id: 'h1', slozena: false, karty: [karta('a1', 5), karta('a2', 0), karta('a3', 0), karta('a4', 0)] };
    const ruceB = { hrac_id: 'h2', slozena: false, karty: [karta('b1', 5), karta('b2', 5), karta('b3', 5), karta('b4', 0)] };
    const u = collectRunStats(stavLog({ uzly: [{ commit, ruce: [ruceA, ruceB] }] })).uzly[0];
    expect(u.expDead).toBeCloseTo(0.25, 9);
  });

  it('varianta D je KONTRAFAKTUÁLNÍ — nezávisí na tom, zda bot gamble vzal', () => {
    const base = { commit, ruce: [{ hrac_id: 'h1', slozena: false, karty: [karta('d1', 5), karta('d2', 0)] }] };
    const bez = collectRunStats(stavLog({ uzly: [{ ...base }] })).uzly[0];
    const s = collectRunStats(stavLog({ uzly: [{ ...base, gambleVzat: true }] })).uzly[0];
    expect(s.expDead).toBe(bez.expDead);
  });
});

describe('report.js — bucketing, K2 ordinály, K1/K6a', () => {
  it('8) K5/K7 čítají jen běžné uzly, K5f jen finále', () => {
    expect(bucketTypu('npc')).toBe('common');
    expect(bucketTypu('lokace')).toBe('common');
    for (const t of ['zatah', 'lecka', 'konfrontace']) expect(bucketTypu(t)).toBe('finale');

    const log = stavLog({ uzly: [{ typ: 'npc' }, { typ: 'konfrontace', zasahy: 2, pasmo: '2/4_S_NASLEDKY' }] });
    const agg = createAggregate();
    addRun(agg, collectRunStats(log));
    const fin = finalizeAggregate(agg);
    expect(fin.k6c_pasma.common.n).toBe(1);
    expect(fin.k6c_pasma.finale.n).toBe(1);
    expect(fin.k6c_pasma.vse.n).toBe(2);
    expect(fin.k5f.celkem.hodnota).toBe(100); // konfrontace 2/4 = přežil
  });

  it('9) K5f: run bez konfrontace NENÍ ve jmenovateli (a nepočítá se jako přežilý)', () => {
    const agg = createAggregate();
    addRun(agg, collectRunStats(stavLog({ uzly: [{ typ: 'npc' }] }))); // bez konfrontace
    addRun(agg, collectRunStats(stavLog({ uzly: [{ typ: 'konfrontace', zasahy: 0, pasmo: '≤1/4_PRUSVIH' }], vysledek: 'NEVYRESENO', pricina: 'konfrontace_prohra' })));
    const fin = finalizeAggregate(agg);
    expect(fin.k5f.celkem.hodnota).toBe(0); // 0 z 1, který konfrontace dosáhl
    expect(fin.k5f.podil_proher_ve_finale.hodnota).toBe(100);
  });

  it('10) K2: ordinál s vloženou léčkou vs. bez dává RŮZNÉ hodnoty (obě se reportují)', () => {
    // uzly: npc(PRŮŠVIH), npc(HLADCE), lecka(HLADCE), npc(PRŮŠVIH), npc(PRŮŠVIH)
    const log = stavLog({ uzly: [
      { typ: 'npc', zasahy: 0, pasmo: '≤1/4_PRUSVIH' },
      { typ: 'npc', zasahy: 3, pasmo: '3/4_HLADCE' },
      { typ: 'lecka', zasahy: 3, pasmo: '3/4_HLADCE' },
      { typ: 'npc', zasahy: 0, pasmo: '≤1/4_PRUSVIH' },
      { typ: 'npc', zasahy: 0, pasmo: '≤1/4_PRUSVIH' },
    ] });
    const agg = createAggregate();
    addRun(agg, collectRunStats(log));
    const k2 = finalizeAggregate(agg).k2;
    // ordinalUzlu (GATE): léčka se nepočítá → 1–2 = 50 %, 3–4 = oba PRŮŠVIH = 100 % → drift 2,0
    expect(k2.gate_ordinal_uzlu.prusvih_rate_1_2.hodnota).toBe(50);
    expect(k2.gate_ordinal_uzlu.prusvih_rate_3_4.hodnota).toBe(100);
    expect(k2.gate_ordinal_uzlu.drift.hodnota).toBe(2);
    // ordinalVse (diagnostika): uzel 3 je léčka (HLADCE), uzel 4 PRŮŠVIH → 50 % → drift 1,0
    expect(k2.diagnostika_ordinal_vse.prusvih_rate_3_4.hodnota).toBe(50);
    expect(k2.diagnostika_ordinal_vse.drift.hodnota).toBe(1);
  });

  it('11) K1 per-count + K6a spread označí breach', () => {
    const agg = createAggregate();
    const pridej = (pocetHracu, doruceno, kolik) => {
      for (let i = 0; i < kolik; i++) {
        addRun(agg, collectRunStats(stavLog({ pocetHracu, uzly: [{ typ: 'npc' }], vysledek: doruceno ? 'DORUCENO' : 'NEVYRESENO', pricina: doruceno ? 'dojezd' : 'bedny_0' })));
      }
    };
    pridej(1, true, 45); pridej(1, false, 55);   // 45 %
    pridej(4, true, 75); pridej(4, false, 25);   // 75 % → breach nahoru
    const k1 = finalizeAggregate(agg).k1;
    expect(k1.per_count['1p'].hodnota).toBe(45);
    expect(k1.per_count['4p'].hodnota).toBe(75);
    expect(k1.breach).toEqual(['4p']);
    expect(k1.k6a.spread.hodnota).toBe(30);
    expect(k1.k6a.plni).toBe(false);
  });

  it('12) K6a variance: sd, 2sd a rozhodnutí „je práh 6 nad šumem?"', () => {
    const v = k6aVariance([6.1, 5.9, 7.2, 4.8, 6.0]);
    expect(v.bloku).toBe(5);
    expect(v.mean).toBe(6);
    expect(v.sd).toBeCloseTo(0.76, 2); // sqrt(2.90/5) = 0,7616
    expect(v.prah_6_nad_sumem).toBe(true);
    expect(k6aVariance([1]).sd).toBeNull();
    expect(k6aVariance([]).mean).toBeNull();
    expect(sd([5, 5, 5])).toBe(0);
    // šum tak velký, že práh 6 b. měří šum → P-rozhodnutí uživatele
    expect(k6aVariance([0, 12, 1, 11]).prah_6_nad_sumem).toBe(false);
  });
});

describe('report.js — degradace, determinismus, per-slot', () => {
  it('13) log BEZ assign_context: nespadne, dotčené metriky jsou null (ne 0)', () => {
    const log = stavLog({ uzly: [{ typ: 'npc', zasahy: 1, pasmo: '≤1/4_PRUSVIH' }] }).filter((e) => e.type !== 'assign_context');
    const agg = createAggregate();
    addRun(agg, collectRunStats(log));
    const fin = finalizeAggregate(agg);
    expect(fin.k7.dostupne).toBe(false);
    expect(fin.k5.varianta_d.exp_dead.hodnota).toBeNull();
    expect(fin.nedostupne).toContain('k5.varianta_d');
    expect(fin.nedostupne).toContain('k7.take_rate');
    expect(fin.pokryti_assign_context).toBe('0/1 uzlů');
    // metriky nezávislé na assign_context zůstávají spočítané
    expect(fin.k1.celkem.hodnota).toBe(100);
    expect(fin.k5.max_do_1.pre_gamble_common.hodnota).not.toBeNull();
  });

  it('14) finalizace je deterministická (bytově shodný JSON)', () => {
    const { agg } = davka({ runs: 15 });
    expect(JSON.stringify(finalizeAggregate(agg))).toBe(JSON.stringify(finalizeAggregate(agg)));
  });

  it('15) prázdný agregát: null místo 0, žádný NaN', () => {
    const fin = finalizeAggregate(createAggregate());
    expect(fin.k1.celkem.hodnota).toBeNull();
    expect(fin.k2.gate_ordinal_uzlu.drift.hodnota).toBeNull();
    expect(fin.k5f.celkem.hodnota).toBeNull();
    expect(JSON.stringify(fin)).not.toContain('NaN');
  });

  it('16) per-slot rozpad: fail-rate a důvody; gangster_auto_fail se nepřičte k nizky_stat', () => {
    const { fin } = davka({ runs: 30 });
    const klice = Object.keys(fin.perSlot);
    expect(klice.length).toBeGreaterThan(0);
    const s = fin.perSlot[klice[0]];
    expect(s.fail_rate).not.toBeNull();
    const duvody = new Set(Object.values(fin.perSlot).flatMap((x) => Object.keys(x.rozpad_duvodu)));
    expect([...duvody].every((d) => ['nizky_stat', 'kombi_neuplny', 'stat_zrusen', 'gangster_auto_fail', 'neobsazeno'].includes(d))).toBe(true);
    // součet důvodů == počet failů
    for (const x of Object.values(fin.perSlot)) {
      const suma = Object.values(x.rozpad_duvodu).reduce((a, b) => a + b, 0);
      expect(Math.round((x.fail_rate / 100) * x.n)).toBe(suma);
    }
  });

  it('každé gate číslo nese `definice` (podmínka 0b — sjednocení dvojího cutu)', () => {
    const { fin } = davka({ runs: 15 });
    for (const v of [fin.k1.celkem, fin.k5.max_do_1.pre_gamble_common, fin.k5.max_do_1.post_gamble_vse,
      fin.k5.varianta_d.exp_dead, fin.k5f.celkem, fin.k2.gate_ordinal_uzlu.drift]) {
      expect(typeof v.definice).toBe('string');
      expect(v.definice.length).toBeGreaterThan(10);
    }
  });
});
