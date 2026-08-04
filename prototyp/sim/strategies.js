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
import { decideAssignment } from './assign.js';
import { estimateHitsVsKotva } from './estimate.js';

// Přiřazovací heuristiky žijí v `assign.js` (ADR-010) — re-export drží zpětnou
// kompatibilitu importů (test/strategies.test.js).
export { decideAssignment };

/**
 * Run-wide rušení pronásledovatele, tak jak PRÁVĚ TEĎ platí (D58/V2-A′).
 * `state.pronasledovatel.rusi` je statická DEFINICE (veřejné pravidlo od
 * startu runu, D20a); u statového rušení (dnes Malone) se ale samotný EFEKT
 * aktivuje až prvním překročením prahu Zátahu (`state.pronasledovatel.
 * rusiAktivni`, engine `jeRusiAktivni`). Bez tohohle gatu by „vševědoucí"
 * strategie (oracle/memorizacni) i běžné boty počítaly s rušením o uzly
 * dřív, než skutečně kouše — engine samotný takhle nerozhodl (invariant
 * `max_achievable === reálné zásahy` u oracle by pak nesouhlasil, protože bot
 * by plánoval proti jinému pravidlu, než jaké `resolveSlot` použil).
 * Štítkové rušení (dnes Brody) touhle branou neprochází — platí od startu.
 * @param {object} state veřejný snapshot enginu (getState())
 * @returns {{typ: string, cil: string}|null}
 */
function rusiEfektivni(state) {
  const r = state.pronasledovatel?.rusi ?? null;
  if (!r) return null;
  if (r.typ === 'stat' && !state.pronasledovatel?.rusiAktivni) return null;
  return r;
}

/**
 * @param {number} seed
 * @param {typeof RULES} [rules] pro model šumu (kalibrace-2)
 * @param {object|null} [content] obsah — POUZE pro „vševědoucí" měřicí strategie
 *   (commit `memorizacni` si z něj dohledá staty skrytých slotů dle id situace).
 *   Běžné strategie ho nesmí použít: bot nesmí vědět nic, co hráč u stolu nevidí.
 */
export function createStrategy(spec, seed, rules = RULES, content = null) {
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
  // Parametry štítku jsou VEŘEJNÁ pravidla (telegraf hlásí verdikt zbraně doslova,
  // `stitky.yaml` je vede jako strojový zdroj pravdy) — na rozdíl od statů skrytých
  // slotů je smí číst každá strategie, nejen „vševědoucí" měřicí meze.
  const gangsterParams = content?.stitky?.find((x) => x.id === 'GANGSTER')?.parametry ?? null;
  const stitekChovani = gangsterParams?.chovani_dle_typu ?? null;
  const zarZaGangster = gangsterParams?.hlucnost_zar ?? rules.zar.zaGangster;

  return {
    spec: s,

    /* -------- mapa -------- */
    /**
     * D34/N7: typ nabídnutého místa je VEŘEJNÝ a mechanicky významný — u `lokace`
     * (a Zátahu) zbraň projde všude, u `npc` ve viditelné roli auto-failuje
     * (obsah/stitky.yaml `chovani_dle_typu`). Bot dřív losoval, přestože 32,4 %
     * nabídek obsahovalo dva různé typy. Preference je úzká a odvoditelná: držím-li
     * zbraň, jdu tam, kde není mrtvá. Jinak dál losuji (jiná veřejná informace
     * o obsahu uzlu na mapě není — telegraf se ukazuje až po volbě).
     */
    pickRoute(state) {
      const n = state.nabidka.nabidnuto;
      const maZbran = state.postavy.some((p) => p.ruka.some((k) => k.stitek === 'GANGSTER'));
      if (maZbran && stitekChovani) {
        const pratelske = n.filter((x) => stitekChovani[x.typ_mista] === 'vzdy_pass');
        if (pratelske.length > 0 && pratelske.length < n.length) return pratelske[rng.int(pratelske.length)].ref;
      }
      return n[rng.int(n.length)].ref;
    },

    /* -------- motel -------- */
    /**
     * D34/N8: zajížďka do motelu je VOLNÁ OPCE — nestojí uzel ani Žár
     * (`motelChoice('ukryt')` → `leaveMotel` → tytéž cesty). Adaptivní bot přesto
     * zajel jen při těžkém postihu a ≥6 kreditech, takže si sám zamykal směnu
     * karty za 3 kredity, kterou by uvnitř provedl. Zajet je nikdy horší než minout.
     */
    pickMotelOffer(state) {
      const maTezky = state.postavy.some((p) => p.postihy.some((x) => x.tier === 'tezky'));
      if (s.econ === 'hoard') return 'dal';
      if (s.econ === 'lecit' || s.econ === 'adaptivni') {
        if (maTezky && state.kredity >= rules.kredity.leceniTezkeho) return 'ukryt';
      }
      if ((s.econ === 'smenit' || s.econ === 'adaptivni') && state.kredity >= rules.kredity.smenaKarty) return 'ukryt';
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
      // D34/N3: rušený stat je VEŘEJNÝ od startu runu (pronasledovatele.yaml:
      // „hráči to vědí od startu"). Přiřazení ho respektovalo, commit ne — bot
      // proti Malonovi vybíral karty podle statu, který je zaručeně 0.
      // D58/V2-A′: `rusiEfektivni()` navíc gatuje statové rušení prahem Zátahu —
      // viz komentář u definice funkce.
      const rusi = rusiEfektivni(state);
      // D34/N4: cena hlučné karty v Žáru. `hlucnost_zar` je v stitky.yaml, Brodyho
      // zdvojnásobení je jeho veřejné run-wide pravidlo, prahy jsou vyznačené na
      // trati (prototyp-mvp.md §Mapa). Bot dřív Žár nečetl vůbec, přestože hlučné
      // hraní tvoří 58 % jeho přírůstku a překračuje přes polovinu všech prahů.
      const brodyX2 = rusi?.typ === 'stitek' && rusi.cil === 'GANGSTER';
      const cenaZaru = (k) => (k.stitek === 'GANGSTER'
        ? zarZaGangster * (brodyX2 ? 2 : 1)
        : (k.staty.utok ?? 0) >= rules.zar.hlucnyUtokPrah ? rules.zar.zaHlucnyUtok : 0);
      const prahOffset = rules.zar.prahOffsetDlePoctu?.[state.postavy.length] ?? 0;
      const dalsiPrah = Object.values(rules.zar.prahy)
        .map((p) => Math.max(1, p - prahOffset))
        .filter((p) => p > state.zar)
        .sort((a, b) => a - b)[0] ?? Infinity;
      /**
       * Pokuta za hluk ve STATOVÝCH bodech (měřítko `commitScore`). Není to
       * resoluční číslo, ale váha v botí heuristice — proto žije tady, ne v RULES
       * (ADR-003). Kalibrace: u prahu ať bot obětuje i silnou kartu, jinak jen
       * rozhodne remízu mezi srovnatelnými kandidáty.
       */
      const hlukPokuta = (k) => {
        const cena = cenaZaru(k);
        if (cena === 0) return 0;
        return state.zar + cena >= dalsiPrah ? cena * 2 : cena * 0.5;
      };
      // Kolik GANGSTER věcí má smysl committnout (kalibrace-4, nález D29).
      // Verdikt zbraně je VEŘEJNÉ pravidlo — telegraf ho hlásí doslova („zbraň
      // na očích neprojde") a `stitky.yaml` ho vede jako veřejné, takže se
      // neškáluje fidelitou; kompetentní hráč ho zná.
      //   `ano`        → zbraň projde všude (lokace) → bez omezení
      //   `jen_skryte` → ve viditelné roli AUTO-FAIL; smysl má nanejvýš JEDNA
      //                  zbraň, a jen když existuje skrytý utok-slot, kam ji dát
      // Dřív bot tohle ignoroval a cpal nejsilnější útočnou kartu do viditelné
      // role, kde padla bez ohledu na staty (107 z 204 propadů útočného slotu
      // v nadrazi-vypravci byl gangster_auto_fail) — bot byl hloupější než
      // člověk u stolu a K5/K1 byly o tuhle chybu pesimistické.
      // Slotová výjimka (`stitek_citlivy: GANGSTER`) je DALŠÍ místo, kam zbraň
      // patří — sčítá se se skrytým utok-slotem, nenahrazuje ho.
      let zbraniPovoleno = signal.zbran_projde === 'ano'
        ? Infinity
        : (signal.zbran_skryte ? 1 : 0) + (signal.zbran_slot_vyjimka ? 1 : 0);

      /** Zbylé karty a kvóty per hráč; committuje se z nich napříč týmem. */
      const zbyva = new Map();
      const kvota = new Map();
      for (const plan of state.situace.commitPlan) {
        zbyva.set(plan.hrac_id, run.getHand(plan.hrac_id).slice());
        kvota.set(plan.hrac_id, plan.pocet);
      }
      const vezmi = (hracId, karta) => {
        out.push({ characterId: hracId, cardId: karta.id });
        kvota.set(hracId, kvota.get(hracId) - 1);
        zbyva.set(hracId, zbyva.get(hracId).filter((x) => x.id !== karta.id));
        if (karta.stitek === 'GANGSTER') zbraniPovoleno -= 1;
      };

      // MĚŘICÍ NÁSTROJ (K7 gate 3, kalibrace-4): podlaha commit-learnability.
      // Committne náhodné karty bez ohledu na telegraf — rozdíl win-rate proti
      // `informovany` (obojí s gamble-politikou) měří, kolik rozhodnutí commit
      // ještě nese. Kdyby gamble commit trivializoval, mezera by zmizela.
      if (s.commit === 'nahodny') {
        for (const plan of state.situace.commitPlan) {
          const michana = rng.shuffle(zbyva.get(plan.hrac_id).slice());
          for (let i = 0; i < plan.pocet; i++) out.push({ characterId: plan.hrac_id, cardId: michana[i].id });
        }
        run.commitCards(out);
        return;
      }

      // Bod 4 (D22): hráč s hide_telegraf z minulého uzlu NEVIDÍ telegraf →
      // committne naivně (bez trendu, bez skryté-zbraně i bez verdiktu zbraně) →
      // info-postih degraduje commit uzlu N+1 (snowball K2), ne jen assign.
      // Slepí jdou první: hrají svoje naslepo, tým pak pokrývá role kolem nich.
      for (const plan of state.situace.commitPlan) {
        const hrac = state.postavy.find((p) => p.id === plan.hrac_id);
        if (!(hrac?.postihy?.some((x) => x.efekt?.druh === 'hide_telegraf') ?? false)) continue;
        const ruka = zbyva.get(plan.hrac_id).slice().sort((a, b) => statSum(b) - statSum(a));
        for (let i = 0; i < plan.pocet && i < ruka.length; i++) vezmi(plan.hrac_id, ruka[i]);
      }

      /**
       * D34/N2: telegraf jmenuje ROLE, ne pytel statů. Bot dosud sečetl poptávané
       * staty a každou kartu oboudil součtem — takže mohl committnout čtyři karty
       * silné v témže statu a na zbylé role nezbylo nic (kontrafaktuál: kandidáti
       * K5-D 13,1 → 9,6 %, PRŮŠVIH proxy 15,3 → 11,2 %). Nově dostane každá role
       * svého nejlepšího kandidáta a teprve zbytek kvóty jde na generalistu —
       * což je zároveň odpověď na „jedna skrytá čeká na nejhorší" (`proti_srsti`).
       */
      const role = commitRoles(signal, s, rng, content, state.situace.id);
      /**
       * Karta, která je pro svého vlastníka předem mrtvá, se nemá vůbec
       * committnout: zamčený štítek (D34/N1 — „po bouchačce radši nesáhneš")
       * auto-failuje ve VŠECH slotech a hráč to o sobě ví. Verdikt zbraně
       * z telegrafu (`zbraniPovoleno`) je totéž o krok dřív.
       */
      const mrtvaKarta = (k, hracId) => {
        const z = zamkyPostavy(state, hracId);
        if (k.stitek && z?.stitky.includes(k.stitek)) return true;
        return zbraniPovoleno <= 0 && k.stitek === 'GANGSTER';
      };
      const skoreRole = (k, hracId, staty) => Math.min(...staty.map((st) => statSNaRusenim(k, st, rusi)))
        - hlukPokuta(k) + (mrtvaKarta(k, hracId) ? -100 : 0);
      const skoreGeneralista = (k, hracId) => statSum(k) / rules.staty.length
        - hlukPokuta(k) + (mrtvaKarta(k, hracId) ? -100 : 0);
      const nejlepsi = (skoreFn) => {
        let best = null;
        for (const [hracId, karty] of zbyva) {
          if ((kvota.get(hracId) ?? 0) <= 0) continue;
          for (const k of karty) {
            const sc = skoreFn(k, hracId);
            if (best == null || sc > best.sc) best = { sc, hracId, karta: k };
          }
        }
        return best;
      };
      const zbyvaKvota = () => [...kvota.values()].reduce((a, b) => a + b, 0);
      for (const staty of role) {
        if (zbyvaKvota() <= 0) break;
        const best = nejlepsi((k, hracId) => skoreRole(k, hracId, staty));
        if (!best) break;
        vezmi(best.hracId, best.karta);
      }
      while (zbyvaKvota() > 0) {
        const best = nejlepsi(skoreGeneralista);
        if (!best) break;
        vezmi(best.hracId, best.karta);
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
          const replaced = nejmeneUzitecnaId(state, noise);
          if (owner && replaced) {
            run.gamble({ handOwnerId: owner, replacedCardId: replaced });
            state = run.getState();
          }
        }
      }

      const sloty = state.situace.odhaleno.sloty;
      const committed = state.situace.committed;
      const goalByHrac = Object.fromEntries(state.postavy.map((p) => [p.id, p.cil?.id ?? null]));
      const maEfekt = (hracId, druh) =>
        state.postavy.find((p) => p.id === hracId)?.postihy?.some((x) => x.efekt?.druh === druh) ?? false;
      const opts = {
        strat: s.assign,
        committed,
        sloty,
        rusi: rusiEfektivni(state), // D58/V2-A′
        stitekParams: state.situace.stitekParams ?? null,
        typSituace: state.situace.typ,
        goalByHrac,
        rng,
        // D34/N1: zámkové postihy vlastníka karty (engine je nově vynucuje) a
        // slepota na ikony viditelnosti — obojí per KARTU, ne per tým.
        zamkyKaret: committed.map((c) => zamkyPostavy(state, c.hrac_id)),
        slepiNaViditelnost: committed.map((c) => maEfekt(c.hrac_id, 'hide_viditelnost')),
        ...noise,
      };
      let mapping = decideAssignment(opts);
      // D34/N5: `hide_staty` degraduje jen karty POSTIŽENÉHO hráče („vlastník vidí
      // názvy věcí, ne jejich staty"). Dřív stačil jeden postižený a bot ε-greedy
      // randomizoval CELÉ přiřazení včetně karet hráčů, kteří vidí normálně — chyba
      // rostoucí s počtem hráčů, tedy mířící rovnou do K6a. Prohození dvou pozic
      // drží platnou permutaci a lokalizuje škodu na tápajícího hráče.
      const slepiIdx = committed.map((c, i) => (maEfekt(c.hrac_id, 'hide_staty') ? i : -1)).filter((i) => i >= 0);
      for (const i of slepiIdx) {
        if (rng.next() >= s.epsilon) continue;
        const j = rng.int(mapping.length);
        mapping = mapping.slice();
        [mapping[i], mapping[j]] = [mapping[j], mapping[i]];
      }
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
    rusi: rusiEfektivni(state), // D58/V2-A′
    stitekParams: state.situace.stitekParams ?? null,
    typSituace: state.situace.typ,
    zamkyKaret: state.situace.committed.map((c) => zamkyPostavy(state, c.hrac_id)),
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

/**
 * Kterou committnutou kartu gamble nahradí (D34/N6).
 *
 * Dřív to byla karta s nejnižším SOUČTEM statů — jenže po odhalení slotů zní
 * správná otázka „která karta v nejlepším rozdělení nic neuhraje". To je často
 * karta s vysokým součtem (hodnota 5 proti Malonovi, zbraň bez skrytého slotu).
 * Bot proto trefil nejlepší nahrazovanou pozici jen v 86,5 % gamblů a ve 4,9 %
 * minul únik z „mříže mrtvých rozhodnutí" (max≤1 → ≥2), což je přesně veličina
 * měřená K5 variantou D.
 *
 * Kritérium je veřejné: kolik zásahů vs. KOTVĚ tým uhraje, když kartu vynecháme
 * (prázdné místo). Nejmenší ztráta = nejméně užitečná karta. Per-instance šum
 * ani prahy do toho nevstupují.
 */
function nejmeneUzitecnaId(state, noise) {
  const c = state.situace.committed;
  if (c.length === 0) return null;
  const spolecne = {
    sloty: state.situace.odhaleno.sloty,
    rusi: rusiEfektivni(state), // D58/V2-A′
    stitekParams: state.situace.stitekParams ?? null,
    typSituace: state.situace.typ,
    ...noise,
  };
  let nej = null;
  for (let i = 0; i < c.length; i++) {
    const bezNi = c.filter((_, j) => j !== i);
    const hits = estimateHitsVsKotva({
      committed: bezNi,
      zamkyKaret: bezNi.map((x) => zamkyPostavy(state, x.hrac_id)),
      ...spolecne,
    });
    // Remízu láme nižší součet statů — zachovává dřívější chování tam, kde je
    // příspěvek karet stejný, takže se nemění nic, co se měnit nemusí.
    const klic = { hits, sum: statSum(c[i].karta) };
    if (nej == null || klic.hits > nej.hits || (klic.hits === nej.hits && klic.sum < nej.sum)) {
      nej = { ...klic, id: c[i].karta.id };
    }
  }
  return nej.id;
}

/** Aktivní zámkové postihy hráče ve tvaru pro `resolveSlot` (D34/N1). */
function zamkyPostavy(state, hracId) {
  const p = state.postavy.find((x) => x.id === hracId);
  if (!p) return null;
  const stitky = p.postihy.filter((x) => x.efekt?.druh === 'lock_stitek').map((x) => x.efekt.stitek);
  const viditelnosti = p.postihy.filter((x) => x.efekt?.druh === 'lock_slot_viditelnost').map((x) => x.efekt.viditelnost);
  return stitky.length === 0 && viditelnosti.length === 0 ? null : { stitky, viditelnosti };
}

/* ================= commit heuristiky ================= */

function statSum(k) {
  return Object.values(k.staty).reduce((a, b) => a + b, 0);
}

const STATY = ['utok', 'obrana', 'hodnota', 'improvizace', 'nastroj'];

/** Hodnota statu s ohledem na run-wide rušení pronásledovatelem (D34/N3). */
function statSNaRusenim(k, stat, rusi) {
  if (rusi && rusi.typ === 'stat' && rusi.cil === stat) return 0;
  return k.staty[stat] ?? 0;
}

/**
 * ROLE, které chce commit pokrýt — jedna položka = jeden slot, hodnota = staty,
 * které ten slot žádá (kombi slot má dva). Nahrazuje dřívější plochou „poptávku"
 * (D34/N2): telegraf je seznam rolí, ne pytel statů.
 *
 * Fidelita p se aplikuje PER ROLI: s pravděpodobností p ji hráč přečte správně,
 * jinak si domyslí náhodný stat. Skryté role (`zbran_skryte`, `improv_skryte`)
 * si drží vlastní hod jako dosud — telegraf je hlásí prózou, ne výčtem.
 */
function commitRoles(signal, s, rng, content, situaceId) {
  if (s.commit === 'naivni') return [];
  if (s.commit === 'monokultura') return [[s.monoStat]];
  // MĚŘICÍ NÁSTROJ (K4c-analog na commit-ose, kalibrace-4): memorizační bot zná
  // staty VŠECH slotů situace (i skrytých) dle jejího id — to je přesně to, co si
  // hráč po pár runech zapamatuje a co telegraf neprozrazuje. Rozdíl memorizační
  // − kompetentní měří, zda commit-osa nezdegeneruje na lookup tabulku.
  if (s.commit === 'memorizacni' && content) {
    const sloty = content.situace.find((x) => x.id === situaceId)?.sloty ?? [];
    return sloty.map((sl) => (Array.isArray(sl.stat) ? sl.stat : [sl.stat]));
  }
  const role = signal.trend.map((t) => {
    const staty = Array.isArray(t.stat) ? t.stat : [t.stat];
    return rng.next() < s.fidelita ? staty : [STATY[rng.int(STATY.length)]];
  });
  // Bod 3 (D22): telegraf hlásí „zbraň se ve skrytém slotu vyplatí" → informovaný
  // hráč committne zbraň i bez viditelné poptávky útoku (samostatná fidelita).
  if (signal.zbran_skryte && rng.next() < s.fidelita) role.push(['utok']);
  // P3 (D25f): totéž pro skrytý improvizační slot — telegraf ho hlásí prózou
  // („jedna skrytá ho zmate papírem"). Bez toho byl slot naslepo.
  if (signal.improv_skryte && rng.next() < s.fidelita) role.push(['improvizace']);
  return role;
}

/* Přiřazovací heuristiky (decideAssignment, randomMapping, goalBias) se
   přestěhovaly do `assign.js` — viz re-export v hlavičce a ADR-010. */
