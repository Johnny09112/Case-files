// @ts-check
/**
 * Botí strategie pro v3 simulátor (architektura.md §3, prototyp-mvp.md Fáze 0).
 *
 * Tři osy (kombinují se):
 * - COMMIT (proti telegrafu, naslepo): informovany (čte trend viditelných statů
 *   s fidelitou p) / naivni / monokultura (jeden stat — detektor K4b).
 * - PŘIŘAZENÍ do slotů: oracle (zná prahy → horní mez max_achievable) /
 *   memorizacni (zná stabilní kotvy, ne per-instance šum) / kompetentni (zná
 *   staty, ne prahy) / greedy / random / cile (bias k vlastnímu cíli).
 * - EKONOMIKA v motelu: adaptivni / lecit / smenit / hoard.
 *
 * Info-postih hide_staty → ε-greedy přiřazení (ε = spec.epsilon). Bot má VLASTNÍ
 * RNG stream (odvozený ze seedu runu) — nesahá na RNG enginu, determinismus
 * dávky zůstává. Bot NEZNÁ nic, co by hráč u stolu neviděl, kromě explicitních
 * „vševědoucích" strategií (oracle/memorizacni) sloužících jako měřicí meze.
 */

import { createRng } from '../src/engine/rng.js';
import { RULES } from '../src/engine/rules.js';
import { decideAssignment, randomMapping } from './assign.js';
import { estimateHitsVsKotva } from './estimate.js';

// Přiřazovací heuristiky žijí v `assign.js` (ADR-010) — re-export drží zpětnou
// kompatibilitu importů (test/strategies.test.js).
export { decideAssignment };

/** @param {number} seed @param {typeof RULES} [rules] pro model šumu (kalibrace-2) */
export function createStrategy(spec, seed, rules = RULES) {
  const s = {
    commit: 'informovany',
    assign: 'kompetentni',
    econ: 'adaptivni',
    fidelita: 0.7,
    epsilon: 0.4,
    monoStat: 'utok',
    gamble: false,
    ...spec,
  };
  const rng = createRng((seed ^ 0x9e3779b9) >>> 0);
  // Model šumu, který „zná" memorizační bot (rozsah + clamp) — musí sedět s enginem.
  const noise = { sumRozsah: rules.sumRozsah, statMax: rules.statMax };

  return {
    spec: s,

    /* -------- mapa -------- */
    pickRoute(state) {
      const n = state.nabidka.nabidnuto;
      return n[rng.int(n.length)].ref;
    },

    /* -------- motel -------- */
    pickMotelOffer(state) {
      const maTezky = state.postavy.some((p) => p.postihy.some((x) => x.tier === 'tezky'));
      if (s.econ === 'hoard') return 'dal';
      if (s.econ === 'lecit' || s.econ === 'adaptivni') {
        if (maTezky && state.kredity >= 6) return 'ukryt';
      }
      if (s.econ === 'smenit' && state.kredity >= 3) return 'ukryt';
      return 'dal';
    },

    motelActions(state, run) {
      // Léčení těžkých postihů (lecit/adaptivni), pak volitelně směna nejslabší karty.
      if (s.econ === 'lecit' || s.econ === 'adaptivni') {
        for (const p of state.postavy) {
          for (const x of p.postihy.filter((y) => y.tier === 'tezky')) {
            if (run.getState().kredity >= 6) run.spendCredits({ sluzba: 'leceni', hracId: p.id, postihId: x.id });
          }
        }
      }
      if (s.econ === 'smenit' || s.econ === 'adaptivni') {
        const st = run.getState();
        if (st.kredity >= 3) {
          const p = st.postavy.find((x) => x.ruka.length > 0);
          if (p) {
            const nejslabsi = p.ruka.reduce((a, b) => (statSum(a) <= statSum(b) ? a : b));
            run.spendCredits({ sluzba: 'smena', hracId: p.id, kartaId: nejslabsi.id });
          }
        }
      }
      run.leaveMotel();
    },

    /* -------- commit (naslepo dle telegrafu) -------- */
    commit(state, run) {
      const signal = state.situace.signal;
      const out = [];
      for (const plan of state.situace.commitPlan) {
        // Bod 4 (D22): hráč s hide_telegraf z minulého uzlu NEVIDÍ telegraf →
        // committne naivně (bez trendu i bez skryté-zbraně) → info-postih
        // degraduje commit uzlu N+1 (snowball K2), ne jen assign (hide_staty).
        const hrac = state.postavy.find((p) => p.id === plan.hrac_id);
        const slepy = hrac?.postihy?.some((x) => x.efekt?.druh === 'hide_telegraf') ?? false;
        const demanded = slepy ? [] : effectiveDemand(signal, s, rng);
        const ruka = run.getHand(plan.hrac_id).slice();
        const skore = (k) => commitScore(k, demanded, s);
        ruka.sort((a, b) => skore(b) - skore(a));
        for (let i = 0; i < plan.pocet; i++) out.push({ characterId: plan.hrac_id, cardId: ruka[i].id });
      }
      run.commitCards(out);
    },

    /* -------- gamble policy (K7) + přiřazení do slotů -------- */
    assign(state, run) {
      // Gamble: odhad zásahů vs kotva; ≤2/4 → jednou líznout záchranu (ne při ≥3/4).
      if (s.gamble !== false && !state.situace.gambleUsed) {
        const locked = state.postavy.some((p) => p.postihy.some((x) => x.efekt?.druh === 'lock_gamble'));
        if (!locked && odhadZeStavu(state, noise) <= 2) {
          const owner = chooseGambleHand(state);
          const replaced = weakestCommittedId(state);
          if (owner && replaced) {
            run.gamble({ handOwnerId: owner, replacedCardId: replaced });
            state = run.getState();
          }
        }
      }

      const sloty = state.situace.odhaleno.sloty;
      const committed = state.situace.committed;
      const goalByHrac = Object.fromEntries(state.postavy.map((p) => [p.id, p.cil?.id ?? null]));
      const postizen = state.postavy.some((p) => p.postihy.some((x) => x.efekt?.druh === 'hide_staty'));
      const opts = {
        strat: s.assign,
        committed,
        sloty,
        rusi: state.pronasledovatel?.rusi ?? null,
        stitekParams: state.situace.stitekParams ?? null,
        typSituace: state.situace.typ,
        goalByHrac,
        rng,
        ...noise,
      };
      const mapping = postizen && rng.next() < s.epsilon ? randomMapping(committed.length, sloty.length, rng) : decideAssignment(opts);
      const list = mapping.map((slotIdx, cardIdx) => ({ slotIndex: sloty[slotIdx].slot_index, cardId: committed[cardIdx].karta.id }));
      run.assignToSlots(list);
      run.confirmNode();
    },
  };
}

/* ================= gamble heuristiky ================= */

/** Odhad zásahů ze stavu enginu — tenký adaptér nad sdíleným `estimate.js`. */
function odhadZeStavu(state, noise) {
  return estimateHitsVsKotva({
    committed: state.situace.committed,
    sloty: state.situace.odhaleno.sloty,
    rusi: state.pronasledovatel?.rusi ?? null,
    stitekParams: state.situace.stitekParams ?? null,
    typSituace: state.situace.typ,
    ...noise,
  });
}

/** Čí ruka poskytne gamble: hazardérův cíl preferuje vlastní, jinak nejplnější ruka. */
function chooseGambleHand(state) {
  const haz = state.postavy.find((p) => p.cil?.id === 'hazarder' && p.ruka.length > 0);
  if (haz) return haz.id;
  const plne = state.postavy.filter((p) => p.ruka.length > 0).sort((a, b) => b.ruka.length - a.ruka.length);
  return plne[0]?.id ?? null;
}

/** Nejslabší committnutá karta (nejnižší součet statů) → nahradí ji gamble. */
function weakestCommittedId(state) {
  const c = state.situace.committed;
  if (c.length === 0) return null;
  return c.reduce((a, b) => (statSum(a.karta) <= statSum(b.karta) ? a : b)).karta.id;
}

/* ================= commit heuristiky ================= */

function statSum(k) {
  return Object.values(k.staty).reduce((a, b) => a + b, 0);
}

/** Efektivní poptávka statů z telegrafu (fidelita p → občas špatný signál). */
function effectiveDemand(signal, s, rng) {
  const staty = ['utok', 'obrana', 'hodnota', 'improvizace', 'nastroj'];
  if (s.commit === 'monokultura') return [s.monoStat];
  if (s.commit === 'naivni') return [];
  // informovany: trend viditelných statů, zašuměný fidelitou
  const trend = signal.trend.flatMap((t) => (Array.isArray(t.stat) ? t.stat : [t.stat]));
  const demand = rng.next() < s.fidelita ? [...trend] : [staty[rng.int(staty.length)]]; // špatný odhad
  // Bod 3 (D22): telegraf hlásí „zbraň se ve skrytém slotu vyplatí" → informovaný
  // hráč committne zbraň i bez viditelné poptávky útoku (samostatná fidelita).
  if (signal.zbran_skryte && rng.next() < s.fidelita && !demand.includes('utok')) demand.push('utok');
  return demand;
}

function commitScore(k, demanded, s) {
  if (s.commit === 'naivni') return statSum(k);
  if (demanded.length === 0) return statSum(k);
  return demanded.reduce((a, stat) => a + (k.staty[stat] ?? 0), 0);
}

/* Přiřazovací heuristiky (decideAssignment, randomMapping, goalBias) se
   přestěhovaly do `assign.js` — viz re-export v hlavičce a ADR-010. */
