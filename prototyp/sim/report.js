// @ts-check
/**
 * Agregace v3 simulačních dávek na metriky brány (prototyp-mvp.md Fáze 0).
 *
 * **Formalizováno kalibrací-4 (D26, bod 0a).** Dřívější verze byla sada plochých
 * čítačů; rozpad *common/finále × per-situace × per-slot × per-count* u KAŽDÉ
 * metriky přes ně vyjádřit nešlo, takže se v kalibraci-3 dopočítával ad-hoc
 * skriptem — a dvě nezávislá měření pak dala dvě různá čísla (K5 17,3 vs. 18,4;
 * přežití 1p 68,8 vs. 76,6). Proto:
 *
 * 1. Sbírají se ZÁZNAMY (per uzel, per run), metriky se z nich odvozují až ve
 *    finalizaci — libovolné seskupení je pak jen `groupBy`.
 * 2. Každé číslo nese vedle sebe `definice` (co přesně čitatel/jmenovatel je).
 *    Bez toho se dvojí měřicí cut sjednotit nedá.
 * 3. Definiční logika gate (odhad, gamble-politika, K5 varianta D, free-pass)
 *    žije TADY — post-hoc nad logem. Předefinování metriky = úprava tohoto
 *    souboru + přeagregace uložených JSONL, bez re-simulace a bez dotyku enginu.
 *
 * Známé pasti, které report explicitně pojmenovává (dřív byly tiché):
 * - `band_resolved.max_achievable_zasahy` je **post-gamble** (gamble přepíše
 *   `situ.committed` před resolucí) — proto se počítá i `maxPre`.
 * - Ordinál uzlu má dvě legitimní definice (s vloženými léčkami / bez) — obě.
 * - Přežití „konfrontace" ≠ přežití „jakéhokoli finále" — obě.
 */

import { EVENT, BAND, END_PRICINA } from '../src/engine/events.js';
import { resolveSlot, maxAchievableZasahy } from '../src/engine/resolve.js';
import { RULES } from '../src/engine/rules.js';
import { estimateHitsVsKotva } from './estimate.js';

const BANDY = [BAND.LOOT, BAND.HLADCE, BAND.NASLEDKY, BAND.PRUSVIH];
const FINALE_TYPY = new Set(['zatah', 'lecka', 'konfrontace']);
/** Vložená setkání — neposouvají `completedNodes` (state.js ř. 581/716). */
const VLOZENE_TYPY = new Set(['lecka', 'konfrontace']);

/** Bucket uzlu dle typu situace (bod 2 balíku: K5/K7 jen nad běžnými uzly). */
export function bucketTypu(typ) {
  return FINALE_TYPY.has(typ) ? 'finale' : 'common';
}

/** Je slot mechanicky nulovaný pronásledovatelem? (bod 1 balíku, free-pass čtení) */
export function jeNulovanySlot(slot, rusi) {
  if (!rusi || rusi.typ !== 'stat') return false;
  return Array.isArray(slot.stat) ? slot.stat.every((s) => s === rusi.cil) : slot.stat === rusi.cil;
}

/** Karta z logu (`{staty, stitky}`) do tvaru, kterému rozumí `resolveSlot`. */
function kartaZLogu(c) {
  return c == null ? null : { id: c.karta_id ?? null, staty: c.staty, stitek: c.stitky?.[0] ?? null };
}

/** Doplní karty na `RULES.slotu` `null`y — engine dělá totéž (složené postavy). */
function doplnNull(karty) {
  const out = karty.slice();
  while (out.length < RULES.slotu) out.push(null);
  return out;
}

/**
 * Free-pass varianta oracle: nulovaný slot se počítá jako auto-splněný (tým
 * neviníme za by-design nemožný slot). `resolve.js` se NEUPRAVUJE — free-pass je
 * metrická konvence, ne pravidlo hry.
 */
function maxAchievableFreePass(karty, sloty, rusi, stitekParams, typSituace) {
  const zbyle = sloty.filter((s) => !jeNulovanySlot(s, rusi));
  const bonus = sloty.length - zbyle.length;
  if (zbyle.length === 0) return sloty.length;
  // Nulované sloty projdou vždy; zbytek se řeší oracle nad stejným počtem karet.
  let max = 0;
  const idx = karty.map((_, i) => i);
  const rek = (pouzite, pos, hits) => {
    if (pos === zbyle.length) {
      if (hits > max) max = hits;
      return;
    }
    for (const i of idx) {
      if (pouzite.has(i)) continue;
      pouzite.add(i);
      const r = resolveSlot({ karta: karty[i], slot: zbyle[pos], rusi, stitekParams, typSituace });
      rek(pouzite, pos + 1, hits + (r.zasah ? 1 : 0));
      pouzite.delete(i);
    }
  };
  rek(new Set(), 0, 0);
  return Math.min(sloty.length, max + bonus);
}

/* ================= sběr záznamů z jednoho runu ================= */

/**
 * Rozloží event log jednoho runu na `{run, uzly}`.
 * @param {object[]} events kompletní log runu (včetně `run_ended`)
 */
export function collectRunStats(events) {
  const start = events.find((e) => e.type === EVENT.RUN_STARTED) ?? {};
  const konec = events[events.length - 1];
  const rusi = start.rusi ?? null;

  /** nodeIndex → surová data uzlu. */
  const nodes = new Map();
  const node = (i) => {
    if (!nodes.has(i)) nodes.set(i, { nodeIndex: i, sloty: null, commit: null, ctx: null, gamble: null, band: null, slotVysledky: [] });
    return nodes.get(i);
  };

  /** Aktivní informační postihy v čase (pro K2 mechanismus-diagnostiku). */
  let aktivniInfo = 0;
  const infoVCase = new Map();

  for (const e of events) {
    switch (e.type) {
      case EVENT.COMMIT:
        node(e.nodeIndex).commit = e.commit;
        break;
      case EVENT.SITUATION_REVEALED: {
        const n = node(e.nodeIndex);
        n.sloty = e.sloty;
        n.situaceId = e.situace_id ?? null;
        n.typ = e.typ ?? e.typ_mista ?? null;
        n.typMista = e.typ_mista ?? null;
        break;
      }
      case EVENT.ASSIGN_CONTEXT:
        node(e.nodeIndex).ctx = e;
        break;
      case EVENT.GAMBLE:
        node(e.nodeIndex).gamble = e;
        break;
      case EVENT.SLOT_RESOLVED:
        node(e.nodeIndex).slotVysledky.push(e);
        break;
      case EVENT.BAND_RESOLVED:
        node(e.nodeIndex).band = e;
        infoVCase.set(e.nodeIndex, aktivniInfo);
        break;
      case EVENT.PENALTY_ADDED:
        if (e.kategorie === 'informacni') aktivniInfo += 1;
        break;
      case EVENT.PENALTY_EXPIRED:
      case EVENT.PENALTY_HEALED:
        if (aktivniInfo > 0) aktivniInfo -= 1;
        break;
    }
  }

  const uzly = [];
  let ordVse = 0;
  let ordUzlu = 0;
  for (const n of [...nodes.values()].sort((a, b) => a.nodeIndex - b.nodeIndex)) {
    if (!n.band) continue; // situace bez resoluce (neměla by nastat)
    ordVse += 1;
    // Vložená setkání (léčka/konfrontace) NEMAJÍ pořadí na páteři — dostávají
    // `null`, ne pořadí předchozího uzlu. Jinak by spadla do bucketu „uzel 1–2"
    // a zředila by K2 drift uzlem, který na páteři vůbec nestojí.
    const vlozene = VLOZENE_TYPY.has(n.typ);
    if (!vlozene) ordUzlu += 1;
    uzly.push(nodeRecord(n, { rusi, ordVse, ordUzlu: vlozene ? null : ordUzlu, infoPostihy: infoVCase.get(n.nodeIndex) ?? 0 }));
  }

  const posledni = uzly[uzly.length - 1] ?? null;
  const konfrontace = uzly.find((u) => u.typ === 'konfrontace') ?? null;
  const doruceno = konec.vysledek === 'DORUCENO';

  return {
    run: {
      vysledek: konec.vysledek,
      doruceno,
      pricina: konec.pricina,
      pocetHracu: start.pocetHracu ?? null,
      pronasledovatel: start.pronasledovatel ?? null,
      pocetUzlu: konec.pocet_uzlu,
      zbyvaBeden: konec.zbyva_beden,
      konecnyZar: konec.konecny_zar,
      kredity: konec.kredity_zbytek,
      cile: konec.cile ?? [],
      dosahlKonfrontace: konfrontace !== null,
      prezilKonfrontaci: konfrontace ? konfrontace.pasmo !== BAND.PRUSVIH : null,
      dosahlFinale: uzly.some((u) => u.bucket === 'finale'),
      typPoslednihoUzlu: posledni?.typ ?? null,
      prohralVeFinale: !doruceno && posledni != null && posledni.bucket === 'finale',
      maAssignContext: uzly.length > 0 && uzly.every((u) => u.maCtx),
    },
    uzly,
  };
}

/** Jeden `NodeRecord` — všechna per-uzlová čísla se počítají tady, streamově. */
function nodeRecord(n, { rusi, ordVse, ordUzlu, infoPostihy }) {
  const typ = n.typ;
  const sloty = n.sloty ?? [];
  const maCtx = n.ctx != null;
  const stitekParams = maCtx ? { chovani_dle_typu: { [typ]: n.ctx.stitek_chovani } } : null;
  const commitPre = (n.commit ?? []).map(kartaZLogu);

  // maxPre: oracle nad commitem PŘED gamblem (band_resolved nese post-gamble).
  const maxPre = sloty.length === RULES.slotu && n.commit
    ? maxAchievableZasahy(doplnNull(commitPre), sloty, rusi, stitekParams, typ)
    : null;
  const maxPreFreePass = sloty.length === RULES.slotu && n.commit
    ? maxAchievableFreePass(doplnNull(commitPre), sloty, rusi, stitekParams, typ)
    : null;

  const odhad = maCtx && n.commit && commitPre.length > 0
    ? estimateHitsVsKotva({
        committed: commitPre.map((k) => ({ karta: k })),
        sloty,
        rusi,
        stitekParams,
        typSituace: typ,
        sumRozsah: RULES.sumRozsah,
        statMax: RULES.statMax,
      })
    : null;

  const d = maCtx && maxPre != null && maxPre <= 1
    ? variantaD({ commitPre, sloty, rusi, stitekParams, typ, ctx: n.ctx })
    : null;

  return {
    nodeIndex: n.nodeIndex,
    situaceId: n.situaceId,
    typ,
    bucket: bucketTypu(typ),
    ordVse,
    ordUzlu,
    maCtx,
    pasmo: n.band.pasmo,
    zasahy: n.band.zasahy,
    gap: n.band.gap,
    nakladZtrata: n.band.naklad_ztrata ?? 0,
    maxPost: n.band.max_achievable_zasahy,
    maxPre,
    maxPreFreePass,
    nulovaneSloty: sloty.filter((s) => jeNulovanySlot(s, rusi)).length,
    nulovanePrah0: sloty.filter((s) => jeNulovanySlot(s, rusi) && s.prah === 0).length,
    odhad,
    gambleDostupny: maCtx ? n.ctx.gamble_dostupny : null,
    gambleBlokovan: maCtx ? n.ctx.gamble_blokovan : null,
    gambleVzat: n.gamble != null,
    expDead: d ? d.expDead : null,
    strictDead: d ? d.strictDead : null,
    infoPostihy,
    slotVysledky: n.slotVysledky.map((s) => ({
      slotIndex: s.slot_index,
      role: s.role ?? null,
      stat: s.stat,
      viditelnost: s.viditelnost,
      prah: s.prah,
      typPrahu: s.typ_prahu,
      zasah: s.zasah,
      duvod: s.duvod,
    })),
    slotyDef: sloty.map((s) => ({
      slotIndex: s.slot_index,
      role: s.role,
      stat: s.stat,
      kotva: s.kotva,
      viditelnost: s.viditelnost,
      stitekCitlivy: s.stitek_citlivy ?? null,
      nulovany: jeNulovanySlot(s, rusi),
    })),
  };
}

/**
 * K5 varianta D — „mříž mrtvých rozhodnutí" (schvalovací bod 1, D26).
 *
 * Uzel je kandidát, když `maxPre ≤ 1`. Ptáme se: **mohl hráč uniknout gamblem?**
 * Realistická gamble-politika (podmínka kritika): hráč ŘÍDÍ výběr ruky i to,
 * kterou committnutou kartu nahradí → přes obojí bereme maximum. Hráč NEŘÍDÍ,
 * která karta se z ruky líznula → přes líz se průměruje uniformně (engine:
 * `rng.int(zbyvajici)`). Best-case líz by byl „gamble jako deus ex machina".
 *
 * Vrací `expDead = 1 − pEscape` (GATE) a `strictDead` (tvrdý floor, diagnostika).
 * Počítá se KONTRAFAKTUÁLNĚ — nezávisle na tom, zda bot gamble skutečně vzal.
 */
function variantaD({ commitPre, sloty, rusi, stitekParams, typ, ctx }) {
  if (!ctx.gamble_dostupny) return { expDead: 1, strictDead: 1, pEscape: 0 };
  const ruce = (ctx.ruce ?? []).map((h) => ({ hrac_id: h.hrac_id, karty: h.karty.map(kartaZLogu) }));
  const base = doplnNull(commitPre);

  // Tabulka (nahrazovaná pozice × líznutá karta) → max. `maxAchievable` nezávisí
  // na tom, ze které ruky karta pochází, tak ji počítáme jen jednou (§4.4 spec).
  const cache = new Map();
  const maxPoNahrade = (ci, karta) => {
    const key = `${ci}|${karta.id}`;
    if (cache.has(key)) return cache.get(key);
    const karty = base.slice();
    karty[ci] = karta;
    const v = maxAchievableZasahy(karty, sloty, rusi, stitekParams, typ);
    cache.set(key, v);
    return v;
  };

  let pEscape = 0;
  for (let ci = 0; ci < commitPre.length; ci++) {
    for (const ruka of ruce) {
      if (ruka.karty.length === 0) continue;
      const zachrani = ruka.karty.filter((k) => maxPoNahrade(ci, k) >= 2).length;
      const p = zachrani / ruka.karty.length;
      if (p > pEscape) pEscape = p;
    }
  }
  return { expEscape: pEscape, expDead: 1 - pEscape, strictDead: pEscape === 0 ? 1 : 0, pEscape };
}

/* ================= agregace ================= */

export function createAggregate() {
  return { runy: /** @type {object[]} */ ([]), uzly: /** @type {object[]} */ ([]) };
}

/** @param {ReturnType<typeof createAggregate>} agg */
export function addRun(agg, stats) {
  agg.runy.push(stats.run);
  for (const u of stats.uzly) agg.uzly.push({ ...u, pocetHracu: stats.run.pocetHracu, pronasledovatel: stats.run.pronasledovatel });
}

/* ================= pomocné ================= */

/** Podíl v %, nebo `null` při prázdném jmenovateli — NIKDY 0, nikdy NaN. */
const pct = (a, b) => (b === 0 || b == null ? null : Math.round((a / b) * 1000) / 10);
const round = (x, d = 2) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** d) / 10 ** d);
const prumer = (list) => (list.length === 0 ? null : list.reduce((a, b) => a + b, 0) / list.length);

function median(list) {
  if (list.length === 0) return null;
  const s = [...list].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Číslo s labelem definice — invariant výstupu (§3.3 spec). */
const val = (hodnota, definice) => ({ hodnota, definice });

function groupBy(list, klic) {
  const m = new Map();
  for (const x of list) {
    const k = klic(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(x);
  }
  return m;
}

/** Směrodatná odchylka (populační) — pro run-to-run varianci K6a. */
export function sd(list) {
  if (list.length < 2) return null;
  const m = prumer(list);
  return Math.sqrt(prumer(list.map((x) => (x - m) ** 2)));
}

/**
 * Run-to-run variance K6a (podmínka kritika k bodu 5): práh ≤6 b. je obhajitelný
 * jako „pod prahem citelnosti", jen když `2·sd(spread) < 6`. Jinak práh měří šum
 * a jeho úprava je P-rozhodnutí uživatele, ne tichá změna.
 * @param {number[]} spready spread (max−min win-rate napříč 1–4p) per blok
 */
export function k6aVariance(spready) {
  if (!Array.isArray(spready) || spready.length < 2) {
    return { bloku: spready?.length ?? 0, mean: null, sd: null, min: null, max: null, dve_sd: null, prah_6_nad_sumem: null };
  }
  const s = sd(spready);
  return {
    bloku: spready.length,
    mean: round(prumer(spready)),
    sd: round(s),
    min: round(Math.min(...spready)),
    max: round(Math.max(...spready)),
    dve_sd: round(2 * s),
    prah_6_nad_sumem: 2 * s < 6,
  };
}

/** Rozdíl win-rate dvou souhrnů (K7 learnabilita, gate ≥12 b.). */
export function diffWinRate(finA, finB) {
  const out = {};
  for (const k of new Set([...Object.keys(finA.k1.per_count), ...Object.keys(finB.k1.per_count)])) {
    const a = finA.k1.per_count[k]?.hodnota;
    const b = finB.k1.per_count[k]?.hodnota;
    out[k] = a == null || b == null ? null : round(a - b, 1);
  }
  const vse = finA.k1.celkem.hodnota == null || finB.k1.celkem.hodnota == null ? null : round(finA.k1.celkem.hodnota - finB.k1.celkem.hodnota, 1);
  return { per_count: out, celkem: vse };
}

/* ================= finalizace ================= */

/** @param {ReturnType<typeof createAggregate>} agg */
export function finalizeAggregate(agg) {
  const runy = agg.runy;
  const uzly = agg.uzly;
  const common = uzly.filter((u) => u.bucket === 'common');
  const finale = uzly.filter((u) => u.bucket === 'finale');

  const nedostupne = [];
  const bezCtx = uzly.filter((u) => !u.maCtx).length;
  const sCtx = uzly.length - bezCtx;
  if (sCtx === 0) nedostupne.push('k5.varianta_d', 'k7.klasifikace', 'k7.take_rate', 'k7.ev_proxy');

  return {
    pocet: runy.length,
    pocetUzlu: uzly.length,
    pokryti_assign_context: uzly.length === 0 ? null : `${sCtx}/${uzly.length} uzlů`,
    nedostupne,
    ...(nedostupne.length > 0 ? { duvod_nedostupnosti: 'log bez assign_context (dávka před kalibrací-4)' } : {}),

    k1: k1Metriky(runy),
    k2: k2Metriky(uzly),
    k5: k5Metriky(common, finale, uzly),
    k5f: k5fMetriky(runy),
    k7: k7Metriky(common),
    k6c_pasma: pasmaMetriky(uzly),
    ekonomika: {
      kredit_median: median(runy.map((r) => r.kredity)),
      zar_median: median(runy.map((r) => r.konecnyZar)),
      uzlu_median: median(runy.map((r) => r.pocetUzlu)),
    },
    cile: cileMetriky(runy),
    perSituace: perSituace(uzly),
    perSlot: perSlot(uzly),
    viditelnost: viditelnostMetriky(uzly),
  };
}

function k1Metriky(runy) {
  const perCount = {};
  for (const [n, list] of [...groupBy(runy, (r) => r.pocetHracu)].sort((a, b) => a[0] - b[0])) {
    perCount[`${n}p`] = val(pct(list.filter((r) => r.doruceno).length, list.length), `% DORUČENO, ${n}p, oba pronásledovatelé, n=${list.length}`);
  }
  const perCountPursuer = {};
  for (const [k, list] of groupBy(runy, (r) => `${r.pocetHracu}p_${r.pronasledovatel}`)) {
    perCountPursuer[k] = val(pct(list.filter((r) => r.doruceno).length, list.length), `% DORUČENO, n=${list.length}`);
  }
  const hodnoty = Object.values(perCount).map((v) => v.hodnota).filter((x) => x != null);
  const spread = hodnoty.length < 2 ? null : round(Math.max(...hodnoty) - Math.min(...hodnoty), 1);
  const prohry = runy.filter((r) => !r.doruceno);
  return {
    celkem: val(pct(runy.filter((r) => r.doruceno).length, runy.length), '% DORUČENO přes všechny konfigurace v agregátu'),
    per_count: perCount,
    per_count_pursuer: perCountPursuer,
    gate: 'každý počet hráčů ∈ [45, 70] %',
    breach: Object.entries(perCount).filter(([, v]) => v.hodnota != null && (v.hodnota < 45 || v.hodnota > 70)).map(([k]) => k),
    k6a: {
      spread: val(spread, 'max − min % DORUČENO napříč 1–4p'),
      gate: '≤ 6 b. (zpřísněno z ≤10, D26 bod 5)',
      plni: spread == null ? null : spread <= 6,
    },
    pricina_proher: {
      bedny_0: pct(prohry.filter((r) => r.pricina === END_PRICINA.BEDNY_0).length, prohry.length),
      konfrontace_prohra: pct(prohry.filter((r) => r.pricina === END_PRICINA.KONFRONTACE_PROHRA).length, prohry.length),
      jina: pct(prohry.filter((r) => r.pricina === END_PRICINA.JINA).length, prohry.length),
      definice: '% ze všech proher',
    },
  };
}

/** K2 — drift míry PRŮŠVIHŮ (bod 4 balíku: poměr POČTU postihů je jen diagnostika). */
function k2Metriky(uzly) {
  const varianta = (vstup, ord) => {
    const list = vstup.filter((u) => u[ord] != null);
    const rano = list.filter((u) => u[ord] <= 2);
    const pozde = list.filter((u) => u[ord] >= 3 && u[ord] <= 4);
    const rRano = pct(rano.filter((u) => u.pasmo === BAND.PRUSVIH).length, rano.length);
    const rPozde = pct(pozde.filter((u) => u.pasmo === BAND.PRUSVIH).length, pozde.length);
    return {
      prusvih_rate_1_2: val(rRano, `% PRŮŠVIHŮ v uzlech 1–2 (${ord}), n=${rano.length}`),
      prusvih_rate_3_4: val(rPozde, `% PRŮŠVIHŮ v uzlech 3–4 (${ord}), n=${pozde.length}`),
      drift: val(rRano ? round(rPozde / rRano) : null, `poměr PRŮŠVIH-rate 3–4 / 1–2 (${ord})`),
    };
  };
  const gateVar = varianta(uzly, 'ordUzlu');
  const drift = gateVar.drift.hodnota;
  const floor = gateVar.prusvih_rate_3_4.hodnota;
  return {
    // GATE se vyhodnocuje nad ordinálem BEZ vložených léček/konfrontací.
    gate_ordinal_uzlu: gateVar,
    diagnostika_ordinal_vse: varianta(uzly, 'ordVse'),
    gate_common_only: varianta(uzly.filter((u) => u.bucket === 'common'), 'ordUzlu'),
    gate: 'drift ≥ 1,3 ∧ pozdní PRŮŠVIH-rate ≥ 20 %',
    plni: drift == null || floor == null ? null : drift >= 1.3 && floor >= 20,
    korelace_info_postih_zasahy: val(korelace(uzly.map((u) => u.infoPostihy), uzly.map((u) => u.zasahy)), 'Pearson: počet aktivních informačních postihů × počet zásahů (mechanismus-diagnostika)'),
  };
}

function korelace(xs, ys) {
  if (xs.length < 2) return null;
  const mx = prumer(xs);
  const my = prumer(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  return sxx === 0 || syy === 0 ? null : round(sxy / Math.sqrt(sxx * syy), 3);
}

/** K5 — tři varianty vedle sebe (bod 1 balíku, D26 = varianta D). */
function k5Metriky(common, finale, vse) {
  const do1 = (list, pole) => pct(list.filter((u) => u[pole] != null && u[pole] <= 1).length, list.filter((u) => u[pole] != null).length);
  const pod4 = (list, pole) => pct(list.filter((u) => u[pole] != null && u[pole] < 4).length, list.filter((u) => u[pole] != null).length);

  // Jmenovatel varianty D = common uzly, KDE SE DÁ VYHODNOTIT (mají assign_context).
  // Ředit ho uzly bez dat by tiše podhodnotilo beznaděj — radši `null` (§9 spec).
  const commonCtx = common.filter((u) => u.maCtx);
  const kandidati = commonCtx.filter((u) => u.maxPre != null && u.maxPre <= 1 && u.expDead != null);
  const expDead = commonCtx.length === 0 ? null : round((kandidati.reduce((a, u) => a + u.expDead, 0) / commonCtx.length) * 100, 1);
  const strictDead = commonCtx.length === 0 ? null : round((kandidati.reduce((a, u) => a + u.strictDead, 0) / commonCtx.length) * 100, 1);
  const preDo1Common = do1(common, 'maxPre');

  return {
    // (a) doslovné čtení — obě definice vedle sebe (sjednocení dvojího cutu, 0b)
    max_do_1: {
      pre_gamble_common: val(preDo1Common, 'max≤1 nad commitem PŘED gamblem; jen npc|lokace'),
      pre_gamble_vse: val(do1(vse, 'maxPre'), 'max≤1 nad commitem PŘED gamblem; všechny typy uzlů'),
      post_gamble_common: val(do1(common, 'maxPost'), 'band_resolved.max_achievable_zasahy ≤1 (PO gamblu); jen npc|lokace'),
      post_gamble_vse: val(do1(vse, 'maxPost'), 'band_resolved.max_achievable_zasahy ≤1 (PO gamblu); všechny typy uzlů'),
      finale_pre_gamble: val(do1(finale, 'maxPre'), 'max≤1 PŘED gamblem; jen zatah|lecka|konfrontace'),
    },
    max_pod_4: {
      pre_gamble_common: val(pod4(common, 'maxPre'), 'max<4 PŘED gamblem; jen npc|lokace'),
      post_gamble_vse: val(pod4(vse, 'maxPost'), 'max<4 PO gamblu; všechny typy uzlů (vrstva LOOT)'),
    },
    // (b) free-pass — nulovaný slot = auto-splněný
    free_pass: {
      max_do_1_common: val(do1(common, 'maxPreFreePass'), 'max≤1 PŘED gamblem, nulované sloty auto-splněné; jen npc|lokace'),
      podil_situaci_s_nulovanym: val(pct(vse.filter((u) => u.nulovaneSloty > 0).length, vse.length), '% situací s aspoň jedním mechanicky nulovaným slotem'),
      podil_nulovanych_slotu: val(pct(vse.reduce((a, u) => a + u.nulovaneSloty, 0), vse.reduce((a, u) => a + u.slotyDef.length, 0)), '% slotů nulovaných pronásledovatelem'),
      z_toho_prah_0: vse.reduce((a, u) => a + u.nulovanePrah0, 0),
    },
    // (D) SCHVÁLENÁ VARIANTA (D26 bod 1)
    varianta_d: {
      exp_dead: val(expDead, 'GATE: Σ(1−pEscape) přes kandidátní uzly / všechny common uzly; pEscape = max přes (volba ruky × nahrazovaná karta) z uniformního lízu'),
      strict_dead: val(strictDead, 'tvrdý floor: % common uzlů, kde nezachrání ŽÁDNÝ líz (diagnostika, ne gate — jako gate by to bylo best-case účetnictví)'),
      kandidatu: kandidati.length,
      monotonie_ok: preDo1Common == null || expDead == null || strictDead == null ? null : preDo1Common >= expDead - 1e-9 && expDead >= strictDead - 1e-9,
      gate: 'práh dodá kalibrace-4 (baseline se měří poprvé)',
    },
  };
}

/** K5f — tvrdost finále (bod 2 balíku). */
function k5fMetriky(runy) {
  const perGroup = (klic) => {
    const out = {};
    for (const [k, list] of [...groupBy(runy, klic)].sort((a, b) => String(a[0]).localeCompare(String(b[0])))) {
      const dosahl = list.filter((r) => r.dosahlKonfrontace);
      const dosahlF = list.filter((r) => r.dosahlFinale);
      out[k] = {
        preziti_konfrontace: val(pct(dosahl.filter((r) => r.prezilKonfrontaci).length, dosahl.length), `% přežití KONFRONTACE (jmenovatel = runy, které konfrontace dosáhly, n=${dosahl.length})`),
        dojezd_do_konfrontace: val(pct(dosahl.length, list.length), '% runů, které konfrontace dosáhnou'),
        dojezd_do_finale: val(pct(dosahlF.length, list.length), '% runů, které dosáhnou zatah|lecka|konfrontace'),
      };
    }
    return out;
  };
  const prohry = runy.filter((r) => !r.doruceno);
  const dosahl = runy.filter((r) => r.dosahlKonfrontace);
  const podilVeFinale = pct(prohry.filter((r) => r.prohralVeFinale).length, prohry.length);
  const prez = pct(dosahl.filter((r) => r.prezilKonfrontaci).length, dosahl.length);
  return {
    celkem: val(prez, '% přežití konfrontace přes celý agregát'),
    per_count: perGroup((r) => `${r.pocetHracu}p`),
    per_count_pursuer: perGroup((r) => `${r.pocetHracu}p_${r.pronasledovatel}`),
    gate: 'přežití konfrontace ∈ [60, 80] % per počet hráčů × pronásledovatel',
    podil_proher_ve_finale: val(podilVeFinale, '% proher, jejichž POSLEDNÍ uzel byl finálový (vč. bedny-0 ve finále)'),
    gate_podil_proher: '≥ 90 %',
    plni_podil_proher: podilVeFinale == null ? null : podilVeFinale >= 90,
  };
}

/** K7 — záchranný (odhad ≤1) vs. hedge (odhad =2) gamble (bod 3 balíku). */
function k7Metriky(common) {
  const sOdhadem = common.filter((u) => u.odhad != null);
  if (sOdhadem.length === 0) {
    return { dostupne: false, duvod: 'log bez assign_context — odhad nelze rekonstruovat' };
  }
  const tridy = {
    zachranny: sOdhadem.filter((u) => u.odhad <= 1),
    hedge: sOdhadem.filter((u) => u.odhad === 2),
    silny: sOdhadem.filter((u) => u.odhad >= 3),
  };
  const take = (list) => {
    const dostupne = list.filter((u) => u.gambleDostupny);
    return {
      take_rate: val(pct(list.filter((u) => u.gambleVzat).length, dostupne.length), `% vzatých gamblů (jmenovatel = příležitosti, kde byl gamble DOSTUPNÝ, n=${dostupne.length})`),
      take_rate_vsechny_uzly: val(pct(list.filter((u) => u.gambleVzat).length, list.length), `% vzatých gamblů (jmenovatel = všechny uzly třídy, n=${list.length})`),
    };
  };
  const evProxy = (list) => {
    const vzate = list.filter((u) => u.gambleVzat && u.maxPre != null);
    const hist = Object.fromEntries(BANDY.map((b) => [b, pct(vzate.filter((u) => u.pasmo === b).length, vzate.length)]));
    return {
      n: vzate.length,
      delta_max: val(round(prumer(vzate.map((u) => u.maxPost - u.maxPre))), 'průměr maxPost − maxPre (oracle po gamblu minus před)'),
      prekonal_strop: val(pct(vzate.filter((u) => u.maxPost > u.maxPre).length, vzate.length), '% gamblů, které zvedly dosažitelný strop'),
      realizovane_pasmo: hist,
    };
  };
  const podilVynucenych = pct(tridy.zachranny.length, sOdhadem.length);
  const takeZachranny = take(tridy.zachranny).take_rate.hodnota;
  const takeSilny = take(tridy.silny).take_rate.hodnota;
  const takeHedge = take(tridy.hedge).take_rate.hodnota;
  return {
    dostupne: true,
    podil_uzlu_zachranny: val(podilVynucenych, '% common uzlů s odhadem ≤1 („bez volby") — GATE ≤ 15 %'),
    // POZOR na dvojí čtení v balíku D26 bod 3: pásmo „take_zvolený 30–50 %
    // (baseline ~40 %)" odpovídá PODÍLU UZLŮ s odhadem =2, ne take-rate na nich
    // (ten je ~100 %, bot gambluje deterministicky iff odhad ≤2). Obě čísla
    // proto reportujeme zvlášť a pásmo 30–50 % čteme proti podílu uzlů.
    podil_uzlu_hedge: val(pct(tridy.hedge.length, sOdhadem.length), '% common uzlů s odhadem =2 — pásmo 30–50 % z balíku se vztahuje k TOMUTO číslu'),
    podil_uzlu_silny: val(pct(tridy.silny.length, sOdhadem.length), '% common uzlů s odhadem ≥3'),
    zachranny: { n: tridy.zachranny.length, ...take(tridy.zachranny), ev: evProxy(tridy.zachranny), gate: 'take ≥ 80 %' },
    hedge: { n: tridy.hedge.length, ...take(tridy.hedge), ev: evProxy(tridy.hedge), gate: 'diagnostika, pásmo 30–50 %' },
    silny: { n: tridy.silny.length, ...take(tridy.silny), gate: 'take ≈ 0 % (EV<0 z pozice síly)' },
    prilezitosti_bez_gamblu: Object.fromEntries(
      [...groupBy(common.filter((u) => u.gambleDostupny === false), (u) => u.gambleBlokovan ?? 'neznamy')].map(([k, v]) => [k, v.length])
    ),
    plni: podilVynucenych == null ? null : {
      podil_zachranny_do_15: podilVynucenych <= 15,
      take_zachranny_nad_80: takeZachranny == null ? null : takeZachranny >= 80,
      take_silny_nula: takeSilny == null ? null : takeSilny === 0,
      hedge_podil_uzlu_v_pasmu_30_50: (() => { const p = pct(tridy.hedge.length, sOdhadem.length); return p == null ? null : p >= 30 && p <= 50; })(),
      _take_hedge_diagnostika: takeHedge,
      learnabilita: 'měří se samostatným během (diffWinRate) — není v report.js',
    },
  };
}

function pasmaMetriky(uzly) {
  const per = (list, label) => ({ ...Object.fromEntries(BANDY.map((b) => [b, pct(list.filter((u) => u.pasmo === b).length, list.length)])), n: list.length, definice: label });
  return {
    vse: per(uzly, '% situací dle pásma, všechny typy uzlů'),
    common: per(uzly.filter((u) => u.bucket === 'common'), '% situací dle pásma, jen npc|lokace'),
    finale: per(uzly.filter((u) => u.bucket === 'finale'), '% situací dle pásma, jen zatah|lecka|konfrontace'),
  };
}

function cileMetriky(runy) {
  const acc = {};
  for (const r of runy) {
    for (const c of r.cile) {
      const id = c.cil_id ?? c.cil;
      (acc[id] ??= { celkem: 0, splneno: 0 });
      acc[id].celkem += 1;
      if (c.splnen === true) acc[id].splneno += 1;
    }
  }
  return Object.fromEntries(Object.entries(acc).sort(([a], [b]) => a.localeCompare(b)).map(([id, v]) => [id, pct(v.splneno, v.celkem)]));
}

/** Per-situace rozpad — nahrazuje ad-hoc skript kalibrace-3. */
function perSituace(uzly) {
  const out = {};
  for (const [id, list] of [...groupBy(uzly, (u) => u.situaceId ?? 'neznama')].sort((a, b) => b[1].length - a[1].length)) {
    const sMax = list.filter((u) => u.maxPre != null);
    out[id] = {
      n: list.length,
      typ: list[0].typ,
      bucket: list[0].bucket,
      prusvih_rate: pct(list.filter((u) => u.pasmo === BAND.PRUSVIH).length, list.length),
      prumer_zasahu: round(prumer(list.map((u) => u.zasahy))),
      podil_max_do_1: pct(sMax.filter((u) => u.maxPre <= 1).length, sMax.length),
      podil_max_pod_4: pct(sMax.filter((u) => u.maxPre < 4).length, sMax.length),
      prumerny_gap: round(prumer(list.map((u) => u.gap))),
      podil_gamble_vzat: pct(list.filter((u) => u.gambleVzat).length, list.length),
      podil_odhad_do_1: pct(list.filter((u) => u.odhad != null && u.odhad <= 1).length, list.filter((u) => u.odhad != null).length),
    };
  }
  return out;
}

/** Per-slot rozpad (klíč `situaceId:slot_index`). */
function perSlot(uzly) {
  const acc = new Map();
  for (const u of uzly) {
    for (const v of u.slotVysledky) {
      const def = u.slotyDef.find((s) => s.slotIndex === v.slotIndex);
      const key = `${u.situaceId ?? 'neznama'}:${v.slotIndex}`;
      if (!acc.has(key)) {
        acc.set(key, {
          situace: u.situaceId, slot_index: v.slotIndex, role: def?.role ?? v.role, stat: def?.stat ?? v.stat,
          kombi: Array.isArray(def?.stat ?? v.stat), viditelnost: v.viditelnost, kotva: def?.kotva ?? null,
          stitek_citlivy: def?.stitekCitlivy ?? null, nulovany: def?.nulovany ?? false,
          n: 0, faily: 0, prahSum: 0, duvody: {},
        });
      }
      const a = acc.get(key);
      a.n += 1;
      a.prahSum += v.prah ?? 0;
      if (!v.zasah) {
        a.faily += 1;
        a.duvody[v.duvod] = (a.duvody[v.duvod] ?? 0) + 1;
      }
    }
  }
  const out = {};
  for (const [k, a] of [...acc].sort((x, y) => y[1].faily / y[1].n - x[1].faily / x[1].n)) {
    out[k] = {
      situace: a.situace, slot_index: a.slot_index, role: a.role, stat: a.stat, kombi: a.kombi,
      viditelnost: a.viditelnost, kotva: a.kotva, stitek_citlivy: a.stitek_citlivy, nulovany: a.nulovany,
      n: a.n, fail_rate: pct(a.faily, a.n), prumerny_prah: round(a.prahSum / a.n), rozpad_duvodu: a.duvody,
    };
  }
  return out;
}

/** Průřezový rozpad viditelná vs. skrytá role (explicitní požadavek backlogu). */
function viditelnostMetriky(uzly) {
  const sloty = uzly.flatMap((u) => u.slotVysledky.map((v) => ({ ...v, bucket: u.bucket })));
  const per = (list) => ({
    n: list.length,
    fail_rate: pct(list.filter((s) => !s.zasah).length, list.length),
    podil_slotu: pct(list.length, sloty.length),
  });
  return {
    viditelna: per(sloty.filter((s) => s.viditelnost === 'viditelna')),
    skryta: per(sloty.filter((s) => s.viditelnost === 'skryta')),
    viditelna_common: per(sloty.filter((s) => s.viditelnost === 'viditelna' && s.bucket === 'common')),
    skryta_common: per(sloty.filter((s) => s.viditelnost === 'skryta' && s.bucket === 'common')),
  };
}

/* ================= markdown ================= */

const h = (v) => (v == null ? '—' : v);
const flag = (ok) => (ok == null ? '?' : ok ? '✅' : '❌');

/** Čitelný markdown souhrn jedné konfigurace / celého agregátu. */
export function renderSummaryMd(meta, fin) {
  const k5 = fin.k5;
  const k7 = fin.k7;
  const radky = [];
  radky.push(`## ${meta.label}`);
  radky.push('');
  radky.push(`- **Runů:** ${fin.pocet} | seedy ${meta.seedOd}–${meta.seedDo} | strategie \`${meta.strategy}\` | uzlů ${fin.pocetUzlu}`);
  if (fin.nedostupne.length > 0) radky.push(`- ⚠ **NEDOSTUPNÉ:** ${fin.nedostupne.join(', ')} — ${fin.duvod_nedostupnosti}`);
  radky.push(`- **K1 % DORUČENO:** celkem ${h(fin.k1.celkem.hodnota)} % · ${Object.entries(fin.k1.per_count).map(([k, v]) => `${k} ${h(v.hodnota)}`).join(' · ')} | gate ${fin.k1.gate} | breach: ${fin.k1.breach.join(', ') || 'žádný'}`);
  radky.push(`- **K6a spread:** ${h(fin.k1.k6a.spread.hodnota)} b. ${flag(fin.k1.k6a.plni)} (gate ${fin.k1.k6a.gate})`);
  radky.push(`- **K2 drift PRŮŠVIHŮ:** ${h(fin.k2.gate_ordinal_uzlu.drift.hodnota)}× (1–2: ${h(fin.k2.gate_ordinal_uzlu.prusvih_rate_1_2.hodnota)} % → 3–4: ${h(fin.k2.gate_ordinal_uzlu.prusvih_rate_3_4.hodnota)} %) ${flag(fin.k2.plni)} | gate ${fin.k2.gate}`);
  radky.push(`- **K5 max≤1:** pre/common ${h(k5.max_do_1.pre_gamble_common.hodnota)} % · post/vše ${h(k5.max_do_1.post_gamble_vse.hodnota)} % · free-pass ${h(k5.free_pass.max_do_1_common.hodnota)} %`);
  radky.push(`- **K5 varianta D (GATE):** expDead ${h(k5.varianta_d.exp_dead.hodnota)} % · strictDead ${h(k5.varianta_d.strict_dead.hodnota)} % (kandidátů ${k5.varianta_d.kandidatu}, monotonie ${flag(k5.varianta_d.monotonie_ok)})`);
  radky.push(`- **K5f přežití konfrontace:** ${h(fin.k5f.celkem.hodnota)} % | ${Object.entries(fin.k5f.per_count).map(([k, v]) => `${k} ${h(v.preziti_konfrontace.hodnota)}`).join(' · ')} | gate ${fin.k5f.gate}`);
  radky.push(`- **K5f proher ve finále:** ${h(fin.k5f.podil_proher_ve_finale.hodnota)} % ${flag(fin.k5f.plni_podil_proher)} (gate ≥ 90 %)`);
  if (k7.dostupne) {
    radky.push(`- **K7 záchranný gamble:** uzlů ${h(k7.podil_uzlu_zachranny.hodnota)} % (gate ≤15) · take ${h(k7.zachranny.take_rate.hodnota)} % (gate ≥80) | **hedge:** uzlů ${h(k7.podil_uzlu_hedge.hodnota)} % (diag. 30–50) · take ${h(k7.hedge.take_rate.hodnota)} % | **silný:** uzlů ${h(k7.podil_uzlu_silny.hodnota)} % · take ${h(k7.silny.take_rate.hodnota)} % (gate ≈0)`);
    radky.push(`- **K7 EV-proxy:** Δmax záchranný ${h(k7.zachranny.ev.delta_max.hodnota)} / hedge ${h(k7.hedge.ev.delta_max.hodnota)} · překonal strop ${h(k7.zachranny.ev.prekonal_strop.hodnota)} / ${h(k7.hedge.ev.prekonal_strop.hodnota)} %`);
  } else {
    radky.push(`- **K7:** ${k7.duvod}`);
  }
  radky.push(`- **Pásma** (common): ${BANDY.map((b) => `${b} ${h(fin.k6c_pasma.common[b])}`).join(' · ')}`);
  radky.push(`- **Viditelnost slotů** (fail-rate): viditelná ${h(fin.viditelnost.viditelna.fail_rate)} % · skrytá ${h(fin.viditelnost.skryta.fail_rate)} %`);
  radky.push(`- **Ekonomika:** medián kreditů ${h(fin.ekonomika.kredit_median)} · Žár ${h(fin.ekonomika.zar_median)} · uzlů ${h(fin.ekonomika.uzlu_median)}`);
  radky.push(`- **Cíle:** ${Object.entries(fin.cile).map(([id, v]) => `${id} ${h(v)}`).join(' · ') || '—'}`);
  radky.push('');
  return radky.join('\n');
}
