/**
 * PROVĚRKA BOTA proti veřejným pravidlům (backlog bod (a), D32/D33).
 *
 * Diagnostika NAD LOGEM — engine ani bota NEMĚNÍ. Pro každý podezřelý únik měří,
 * jak často a jak silně bot ignoruje informaci, kterou hráč u stolu veřejně má.
 *
 * Kontrafaktuál je UZLOVÝ (stav držíme fixní): pro každý uzel rekonstruuji ruku
 * v okamžiku commitu (committnuté ∪ zbytek z assign_context) a přehraji commit
 * jinou heuristikou; obojí pak měřím proti STEJNÝM odhaleným slotům. Neměří to
 * složené efekty přes run, ale řadí úniky podle síly bez re-simulace.
 *
 * Použití: `node sim/audit-bot.js [pocet-seedu]` (default 250 → 2000 runů).
 * Doprovodná sonda `sim/audit-postihy.js` ověřuje vynucování zámkových postihů.
 */

import { playRun, loadContent } from './run.js';
import { RULES } from '../src/engine/rules.js';
import { maxAchievableZasahy, resolveSlot } from '../src/engine/resolve.js';
import { decideAssignment } from './assign.js';

const RUNS = Number(process.argv[2] ?? 250);
const COUNTS = [1, 2, 3, 4];
const PURSUERS = ['agent-malone', 'serif-brody'];
const SPEC = { commit: 'informovany', assign: 'kompetentni', econ: 'adaptivni', gamble: true };
const INERT = new Set(['lock_stitek', 'lock_slot_viditelnost', 'hide_viditelnost']);

const content = loadContent();

/* ---------------- pomocné ---------------- */

const karta = (c) => (c == null ? null : { id: c.karta_id, staty: c.staty, stitek: c.stitky?.[0] ?? null });
const doplnNull = (k) => { const o = k.slice(); while (o.length < RULES.slotu) o.push(null); return o; };
const sum5 = (k) => RULES.staty.reduce((a, st) => a + (k.staty[st] ?? 0), 0);
const pct = (a, b) => (b === 0 ? null : Math.round((a / b) * 1000) / 10);
const avg = (l) => (l.length === 0 ? null : Math.round((l.reduce((a, b) => a + b, 0) / l.length) * 1000) / 1000);

/** Hodnota statu s ohledem na run-wide rušení (veřejné pravidlo pronásledovatele). */
const statRusen = (k, st, rusi) => (rusi && rusi.typ === 'stat' && rusi.cil === st ? 0 : k.staty[st] ?? 0);

/* ---------------- commit heuristiky (varianty) ---------------- */

/**
 * B = dnešní bot (fidelita 1, bez slepoty) — referenční rekonstrukce.
 * C1 = navíc zná run-wide rušení statu (Malone) — veřejné od startu.
 * C2 = navíc pokrývá KAŽDÝ viditelný slot zvlášť (trend je seznam rolí, ne pytel).
 */
function recommit({ varianta, signal, ruce, plan, rusi }) {
  const demand = signal.trend.flatMap((t) => (Array.isArray(t.stat) ? t.stat : [t.stat]));
  if (signal.zbran_skryte && !demand.includes('utok')) demand.push('utok');
  if (signal.improv_skryte && !demand.includes('improvizace')) demand.push('improvizace');
  const rusiZnam = varianta === 'C1' || varianta === 'C2';
  const pokryti = varianta === 'C2' || varianta === 'C3';
  const hodnotaStatu = (k, st) => (rusiZnam ? statRusen(k, st, rusi) : k.staty[st] ?? 0);
  let zbraniPovoleno = signal.zbran_projde === 'ano'
    ? Infinity
    : (signal.zbran_skryte ? 1 : 0) + (signal.zbran_slot_vyjimka ? 1 : 0);

  const zbyva = new Map(ruce.map((r) => [r.hrac_id, r.karty.slice()]));
  const out = [];

  if (pokryti) {
    // Pokrytí rolí: každý VIDITELNÝ slot dostane svého nejlepšího kandidáta,
    // zbylé kvóty jdou na generalistu (skryté sloty jsou naslepo → široká karta).
    const role = signal.trend.map((t) => (Array.isArray(t.stat) ? t.stat : [t.stat]));
    if (signal.zbran_skryte) role.push(['utok']);
    if (signal.improv_skryte) role.push(['improvizace']);
    const kvota = new Map(plan.map((p) => [p.hrac_id, p.pocet]));
    const celkem = plan.reduce((a, p) => a + p.pocet, 0);
    const skore = (k, staty) => Math.min(...staty.map((st) => hodnotaStatu(k, st)));
    const vezmi = (skoreFn) => {
      let best = null;
      for (const [hrac, karty] of zbyva) {
        if ((kvota.get(hrac) ?? 0) <= 0) continue;
        for (const k of karty) {
          const s = skoreFn(k) + (zbraniPovoleno <= 0 && k.stitek === 'GANGSTER' ? -100 : 0);
          if (best == null || s > best.s) best = { s, hrac, k };
        }
      }
      if (!best) return false;
      kvota.set(best.hrac, kvota.get(best.hrac) - 1);
      zbyva.set(best.hrac, zbyva.get(best.hrac).filter((x) => x !== best.k));
      if (best.k.stitek === 'GANGSTER') zbraniPovoleno -= 1;
      out.push({ hrac_id: best.hrac, karta: best.k });
      return true;
    };
    for (const staty of role.slice(0, celkem)) if (!vezmi((k) => skore(k, staty))) break;
    while (out.length < celkem) if (!vezmi((k) => sum5(k) / 5)) break;
    return out;
  }

  const skore = (k) => (demand.length === 0
    ? sum5(k)
    : demand.reduce((a, st) => a + hodnotaStatu(k, st), 0))
    + (zbraniPovoleno <= 0 && k.stitek === 'GANGSTER' ? -100 : 0);
  for (const p of plan) {
    const ruka = (zbyva.get(p.hrac_id) ?? []).slice().sort((a, b) => skore(b) - skore(a));
    for (let i = 0; i < p.pocet && i < ruka.length; i++) {
      out.push({ hrac_id: p.hrac_id, karta: ruka[i] });
      if (ruka[i].stitek === 'GANGSTER') zbraniPovoleno -= 1;
    }
  }
  return out;
}

/** Kolik zásahů uhraje KOMPETENTNÍ přiřazení proti skutečným prahům. */
function hitsKompetentni(karty, sloty, rusi, stitekParams, typ) {
  const committed = karty.map((k) => ({ karta: k }));
  const map = decideAssignment({ strat: 'kompetentni', committed, sloty, rusi, stitekParams, typSituace: typ });
  let h = 0;
  map.forEach((slotPos, i) => {
    if (resolveSlot({ karta: karty[i], slot: sloty[slotPos], rusi, stitekParams, typSituace: typ }).zasah) h += 1;
  });
  return h;
}

/* ---------------- sběr ---------------- */

const S = {
  runy: 0,
  zar: { celkem: 0, dleDuvodu: new Map(), prekroceni: new Map(), prekroceniHlucne: new Map(), prekroceniDlePursuer: new Map() },
  postihy: { celkem: 0, dleId: new Map(), inertni: 0 },
  hideStaty: { uzluSAktivnim: 0, uzlu: 0, vicehracSAktivnim: 0 },
  mapa: { nabidek: 0, smisenychTypu: 0 },
  commit: { shodaSBotem: 0, uzlu: 0 },
  varianty: {},
  gamble: { pripadu: 0, botSpravne: 0, ztracenoMax: [], zvednutoNa2: 0 },
  hluk: { karet: 0, zdarma: 0, bezNahrady: 0, zarZdarma: 0, znatelne: 0, zarZnatelne: 0 },
};
const V = ['B', 'C1', 'C3', 'C2'];
const novy = () => ({ max: [], dead: 0, n: 0, hits: [] });
for (const v of V) S.varianty[v] = { common: novy(), vse: novy(), rozpad: new Map() };

function prahy(pocetHracu) {
  const off = RULES.zar.prahOffsetDlePoctu?.[pocetHracu] ?? 0;
  return Object.fromEntries(Object.entries(RULES.zar.prahy).map(([k, v]) => [k, Math.max(1, v - off)]));
}

for (const players of COUNTS) {
  const hraci = content.postavy.slice(0, players).map((p) => ({ id: p.id, jmeno: p.jmeno }));
  for (const pursuer of PURSUERS) {
    for (let i = 0; i < RUNS; i++) {
      const log = playRun({ seed: 1 + i, content, rules: RULES, players: hraci, pronasledovatelId: pursuer, spec: SPEC });
      S.runy += 1;
      const start = log.find((e) => e.type === 'run_started');
      const rusi = start.rusi ?? null;
      const P = prahy(players);

      /* --- Žár --- */
      let zarPred = 0;
      for (const e of log) {
        if (e.type !== 'zar_move') continue;
        if (e.delta > 0) {
          S.zar.celkem += e.delta;
          S.zar.dleDuvodu.set(e.duvod, (S.zar.dleDuvodu.get(e.duvod) ?? 0) + e.delta);
          for (const [nazev, prah] of Object.entries(P)) {
            if (zarPred < prah && e.nova_pozice >= prah) {
              S.zar.prekroceni.set(nazev, (S.zar.prekroceni.get(nazev) ?? 0) + 1);
              if (e.duvod.startsWith('hlucne')) {
                S.zar.prekroceniHlucne.set(nazev, (S.zar.prekroceniHlucne.get(nazev) ?? 0) + 1);
                const kl = `${pursuer}/${nazev}`;
                S.zar.prekroceniDlePursuer.set(kl, (S.zar.prekroceniDlePursuer.get(kl) ?? 0) + 1);
              }
            }
          }
        }
        zarPred = e.nova_pozice;
      }

      /* --- postihy --- */
      for (const e of log) {
        if (e.type !== 'penalty_added') continue;
        S.postihy.celkem += 1;
        S.postihy.dleId.set(e.postih_id, (S.postihy.dleId.get(e.postih_id) ?? 0) + 1);
        if (INERT.has(e.efekt?.druh)) S.postihy.inertni += 1;
      }

      /* --- mapa: nabídka dvou různých typů místa --- */
      for (const e of log) {
        if (e.type === 'map_move' && Array.isArray(e.nabidnuto)) {
          S.mapa.nabidek += 1;
          if (new Set(e.nabidnuto.map((n) => n.typ_mista)).size > 1) S.mapa.smisenychTypu += 1;
        }
      }

      /* --- uzly --- */
      const uzly = new Map();
      const u = (i2) => {
        if (!uzly.has(i2)) uzly.set(i2, {});
        return uzly.get(i2);
      };
      let hideStatyAktivni = 0;
      for (const e of log) {
        switch (e.type) {
          case 'telegraf_derived': u(e.nodeIndex).signal = e.signal_pravy; break;
          case 'commit': u(e.nodeIndex).commit = e.commit; u(e.nodeIndex).plan = e.rozdeleni; break;
          case 'situation_revealed': u(e.nodeIndex).sloty = e.sloty; u(e.nodeIndex).typ = e.typ; break;
          case 'assign_context': u(e.nodeIndex).ctx = e; u(e.nodeIndex).hideStaty = hideStatyAktivni; break;
          case 'gamble': u(e.nodeIndex).gamble = e; break;
          case 'band_resolved': u(e.nodeIndex).band = e; break;
          case 'penalty_added': if (e.efekt?.druh === 'hide_staty') hideStatyAktivni += 1; break;
          case 'penalty_expired':
          case 'penalty_healed': if (hideStatyAktivni > 0) hideStatyAktivni -= 1; break;
        }
      }

      for (const n of uzly.values()) {
        if (!n.band || !n.sloty || !n.commit || !n.ctx || !n.signal) continue;
        if (n.sloty.length !== RULES.slotu) continue;
        const typ = n.typ;
        const stitekParams = { chovani_dle_typu: { [typ]: n.ctx.stitek_chovani } };
        const bucket = ['zatah', 'lecka', 'konfrontace'].includes(typ) ? 'finale' : 'common';

        S.hideStaty.uzlu += 1;
        if (n.hideStaty > 0) {
          S.hideStaty.uzluSAktivnim += 1;
          if (players > 1) S.hideStaty.vicehracSAktivnim += 1;
        }

        // ruka v okamžiku commitu = committnuté + zbytek z assign_context
        const ruce = n.ctx.ruce.map((r) => ({
          hrac_id: r.hrac_id,
          karty: [
            ...n.commit.filter((c) => c.hrac_id === r.hrac_id).map(karta),
            ...r.karty.map(karta),
          ],
        }));
        const plan = n.plan.filter((p) => p.pocet > 0);
        const skutecne = n.commit.map(karta);

        S.commit.uzlu += 1;
        for (const varianta of V) {
          const set = recommit({ varianta, signal: n.signal, ruce, plan, rusi });
          const karty = set.map((x) => x.karta);
          if (karty.length !== skutecne.length) continue;
          const mx = maxAchievableZasahy(doplnNull(karty), n.sloty, rusi, stitekParams, typ);
          const hits = hitsKompetentni(karty, n.sloty, rusi, stitekParams, typ);
          const rz = S.varianty[varianta].rozpad;
          const klic = `${players}p/${pursuer}`;
          if (bucket === 'common' && !rz.has(klic)) rz.set(klic, novy());
          for (const kam of [
            S.varianty[varianta].vse,
            ...(bucket === 'common' ? [S.varianty[varianta].common, rz.get(klic)] : []),
          ]) {
            kam.n += 1;
            kam.max.push(mx);
            kam.hits.push(hits);
            if (mx <= 1) kam.dead += 1;
          }
          if (varianta === 'B') {
            const stejne = new Set(karty.map((k) => k.id));
            if (skutecne.every((k) => stejne.has(k.id))) S.commit.shodaSBotem += 1;
          }
        }

        /* --- hluk zadarmo: koupila hlučná karta vůbec něco? --- */
        {
          const maxTed = maxAchievableZasahy(doplnNull(skutecne), n.sloty, rusi, stitekParams, typ);
          const hlucna = (k) => k != null && (k.stitek === 'GANGSTER' || (k.staty.utok ?? 0) >= RULES.zar.hlucnyUtokPrah);
          const brodyX2 = rusi?.typ === 'stitek' && rusi.cil === 'GANGSTER';
          for (let ci = 0; ci < skutecne.length; ci++) {
            const k = skutecne[ci];
            if (!hlucna(k)) continue;
            S.hluk.karet += 1;
            const cena = k.stitek === 'GANGSTER' ? RULES.zar.zaGangster * (brodyX2 ? 2 : 1) : RULES.zar.zaHlucnyUtok;
            const hrac = n.commit[ci].hrac_id;
            const tiche = (ruce.find((r) => r.hrac_id === hrac)?.karty ?? []).filter(
              (x) => !hlucna(x) && !skutecne.some((s) => s.id === x.id)
            );
            if (tiche.length === 0) { S.hluk.bezNahrady += 1; continue; }
            let nej = -1;
            for (const t of tiche) {
              const karty = doplnNull(skutecne).slice();
              karty[ci] = t;
              nej = Math.max(nej, maxAchievableZasahy(karty, n.sloty, rusi, stitekParams, typ));
            }
            if (nej >= maxTed) { S.hluk.zdarma += 1; S.hluk.zarZdarma += cena; }
            // PŘÍSNÁ varianta bez zpětného pohledu: rozhodnutelné UŽ PŘI COMMITU
            // jen z telegrafu — hlučnost karty nikde v poptávce nefiguruje a tichá
            // karta v ruce je na poptávaných statech stejně dobrá nebo lepší.
            const poptavka = n.signal.trend.flatMap((t) => (Array.isArray(t.stat) ? t.stat : [t.stat]));
            const utokPoptavan = poptavka.includes('utok') || n.signal.zbran_skryte || n.signal.zbran_slot_vyjimka;
            if (!utokPoptavan) {
              const skorePop = (x) => (poptavka.length === 0 ? sum5(x) : poptavka.reduce((a, st) => a + statRusen(x, st, rusi), 0));
              if (tiche.some((t) => skorePop(t) >= skorePop(k))) { S.hluk.znatelne += 1; S.hluk.zarZnatelne += cena; }
            }
          }
        }

        /* --- gamble: trefil bot správnou nahrazovanou kartu? --- */
        if (n.gamble) {
          const vsechny = ruce.flatMap((r) => r.karty);
          const tazena = vsechny.find((k) => k.id === n.gamble.tazena);
          const ci = skutecne.findIndex((k) => k.id === n.gamble.nahrazena);
          if (tazena && ci >= 0) {
            S.gamble.pripadu += 1;
            const zkus = (pozice) => {
              const k = doplnNull(skutecne).slice();
              k[pozice] = tazena;
              return maxAchievableZasahy(k, n.sloty, rusi, stitekParams, typ);
            };
            const botuv = zkus(ci);
            let nej = -1;
            for (let p2 = 0; p2 < skutecne.length; p2++) nej = Math.max(nej, zkus(p2));
            if (botuv >= nej) S.gamble.botSpravne += 1;
            S.gamble.ztracenoMax.push(nej - botuv);
            if (botuv < 2 && nej >= 2) S.gamble.zvednutoNa2 += 1;
          }
        }
      }
    }
  }
}

/* ---------------- výstup ---------------- */

const R = [];
R.push(`# Prověrka bota — diagnostika nad ${S.runy} runy (${RUNS} seedů × ${COUNTS.length} počtů × ${PURSUERS.length} pronásledovatelů)\n`);

R.push(`## 1. Žár z hlučného hraní (veřejné pravidlo: stitky.yaml hlucnost_zar, prahy na trati)`);
R.push(`- celkem přírůstků Žáru: **${S.zar.celkem}**`);
for (const [d, v] of [...S.zar.dleDuvodu].sort((a, b) => b[1] - a[1])) R.push(`  - ${d}: ${v} (${pct(v, S.zar.celkem)} %)`);
R.push(`- překročení prahů (kolikrát / z toho hlučnou kartou):`);
for (const nazev of ['zatah', 'lecka', 'konfrontace']) {
  const c = S.zar.prekroceni.get(nazev) ?? 0;
  const h = S.zar.prekroceniHlucne.get(nazev) ?? 0;
  R.push(`  - ${nazev}: ${c} / **${h}** (${pct(h, c)} %)`);
}
R.push(`- z toho dle pronásledovatele: ${[...S.zar.prekroceniDlePursuer].map(([k, v]) => `${k} ${v}`).join(' · ')}\n`);

R.push(`## 2. Zastoupení zámkových a viditelnostních postihů (lock_stitek / lock_slot_viditelnost / hide_viditelnost)`);
R.push(`- přidaných postihů celkem: ${S.postihy.celkem}, z toho tohoto druhu: **${S.postihy.inertni}** (${pct(S.postihy.inertni, S.postihy.celkem)} %)`);
R.push(`  *(do D34 byly VŠECHNY mechanicky no-op — dnes je engine vynucuje, hlídá \`sim/audit-postihy.js\`)*`);
R.push(`- rozpad: ${[...S.postihy.dleId].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}\n`);

R.push(`## 3. hide_staty — jak často je vůbec ve hře (od D34 degraduje jen karty postiženého)`);
R.push(`- uzlů s aktivním hide_staty: ${S.hideStaty.uzluSAktivnim} / ${S.hideStaty.uzlu} (${pct(S.hideStaty.uzluSAktivnim, S.hideStaty.uzlu)} %), z toho u 2–4p: ${S.hideStaty.vicehracSAktivnim}\n`);

R.push(`## 4. Volba cesty — kolik nabídek vůbec nese rozhodnutí (typ místa je veřejný)`);
R.push(`- nabídek na mapě: ${S.mapa.nabidek}, z toho se dvěma RŮZNÝMI typy místa: ${S.mapa.smisenychTypu} (${pct(S.mapa.smisenychTypu, S.mapa.nabidek)} %)\n`);

R.push(`## 5. Commit — kontrafaktuál nad stejným stavem (${S.commit.uzlu} uzlů)`);
R.push(`- kontrola harness: rekonstrukce B trefila skutečný commit bota v ${pct(S.commit.shodaSBotem, S.commit.uzlu)} % uzlů (zbytek = fidelita 0,7 a pořadí ruky)\n`);
R.push(`| varianta | bucket | n | prům. maxAchievable | max≤1 (K5-D kandidáti) | prům. zásahy (kompetentní přiřazení) | zásahy ≤1 (PRŮŠVIH) |`);
R.push(`|---|---|---|---|---|---|---|`);
for (const v of V) {
  for (const b of ['common', 'vse']) {
    const d = S.varianty[v][b];
    R.push(`| ${v} | ${b} | ${d.n} | ${avg(d.max)} | ${pct(d.dead, d.n)} % | ${avg(d.hits)} | ${pct(d.hits.filter((h) => h <= 1).length, d.n)} % |`);
  }
}
R.push(`\nB = dnešní pravidlo · C1 = B + zná run-wide rušení statu · C3 = B + pokrývá každý viditelný slot zvlášť · C2 = C1+C3\n`);

R.push(`### 5a. Rozpad B → C2 na běžných uzlech (per počet hráčů × pronásledovatel)`);
R.push(`| konfigurace | n | max≤1 B | max≤1 C2 | zásahy ≤1 B | zásahy ≤1 C2 |`);
R.push(`|---|---|---|---|---|---|`);
for (const klic of [...S.varianty.B.rozpad.keys()].sort()) {
  const b = S.varianty.B.rozpad.get(klic);
  const c = S.varianty.C2.rozpad.get(klic);
  const p1 = (d) => pct(d.hits.filter((h) => h <= 1).length, d.n);
  R.push(`| ${klic} | ${b.n} | ${pct(b.dead, b.n)} % | ${pct(c.dead, c.n)} % | ${p1(b)} % | ${p1(c)} % |`);
}
R.push('');

R.push(`## 5b. Hluk zadarmo — hlučná karta, kterou šlo nahradit tichou beze ztráty`);
R.push(`- committnutých hlučných karet (GANGSTER nebo útok ≥ ${RULES.zar.hlucnyUtokPrah}): ${S.hluk.karet}`);
R.push(`- z toho ZADARMO (tichá náhrada v téže ruce dávala stejný nebo lepší maxAchievable): **${S.hluk.zdarma}** (${pct(S.hluk.zdarma, S.hluk.karet)} %)`);
R.push(`- z toho bez jakékoli tiché náhrady v ruce (hluk vynucený): ${S.hluk.bezNahrady} (${pct(S.hluk.bezNahrady, S.hluk.karet)} %)`);
R.push(`- Žár zaplacený zbytečně: **${S.hluk.zarZdarma}** bodů (${pct(S.hluk.zarZdarma, S.zar.celkem)} % veškerého Žáru v dávce) — HORNÍ mez, počítáno se zpětným pohledem na odhalené sloty`);
R.push(`- PŘÍSNĚ (rozhodnutelné už z telegrafu, bez zpětného pohledu): **${S.hluk.znatelne}** karet (${pct(S.hluk.znatelne, S.hluk.karet)} %) a **${S.hluk.zarZnatelne}** bodů Žáru (${pct(S.hluk.zarZnatelne, S.zar.celkem)} % dávky) — DOLNÍ mez\n`);

R.push(`## 6. Gamble — kterou kartu bot nahrazuje`);
R.push(`- vyhodnocených gamblů: ${S.gamble.pripadu}`);
R.push(`- bot trefil nejlepší nahrazovanou pozici: **${pct(S.gamble.botSpravne, S.gamble.pripadu)} %**`);
R.push(`- průměrná ztráta maxAchievable proti nejlepší volbě: **${avg(S.gamble.ztracenoMax)}**`);
R.push(`- případů, kdy lepší volba vytáhla uzel z max≤1 na ≥2 a bot to minul: **${S.gamble.zvednutoNa2}** (${pct(S.gamble.zvednutoNa2, S.gamble.pripadu)} %)`);

console.log(R.join('\n'));
