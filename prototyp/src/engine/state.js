// @ts-check
/**
 * Stav runu + slotové příkazy v3 (architektura.md §2.2 v3, ADR-008).
 *
 * API enginu: createRun({seed, content, rules, players, pronasledovatelId?})
 * a příkazy chooseRoute / motelChoice / leaveMotel / commitCards / gamble /
 * assignToSlots / confirmNode / spendCredits. Nic jiného stav nemění. Výstup:
 * read-only snapshot (getState) + append-only událostní log (getEvents).
 * Deterministický: stejný seed + stejná sekvence příkazů = bit-přesně stejný
 * log (ADR-002).
 *
 * Tok jednoho backbone kroku: [motel odbočka] → volba cesty (map_move) →
 * commit 4 karet naslepo (commit) → odhalení (situation_revealed) →
 * [gamble] → přiřazení do slotů (assignment) → resoluce (slot_resolved×4,
 * band_resolved) → důsledky (zar_move / credit_flow / penalty_*) → další.
 *
 * Modelová rozhodnutí nad rámec prototyp-mvp.md (ENGINE:):
 * - Backbone `uzluNaRun` stopů; truhla je pevný krok (nejde vyroutovat kolem
 *   masa), motel je binární odbočka (mid+late). Vložená setkání (léčka,
 *   konfrontace) i Zátah dostávají vlastní `nodeIndex` (unikátní seq situace),
 *   ale jen backbone a Zátah posouvají `completedNodes` k dojezdu.
 * - Ruce se po každé situaci doplňují na velikost dle počtu hráčů minus
 *   aktivní `ruka_minus`. Sdílený balík, odhaz, reshuffle. Loot (4/4) = 1 karta
 *   navíc prvnímu aktivnímu hráči.
 * - Postih se přiřadí vlastníkovi propadlého slotu s NEJVĚTŠÍ statovou mezerou
 *   (`prah − stat_hodnota`, D57/V1-A krok 1); tvrdé propady (GANGSTER auto-fail,
 *   zámkový postih) jdou na řadu jen bez statového propadu, tie-break nejnižší
 *   slot_index (`vyberObet`). Cap 2: přidání 3. aktivního postihu → „složení"
 *   (kolo–dvě), které maže LEHKÉ postihy; těžké přetrvávají a léčí se jen
 *   v motelu.
 * - Konfrontace v pásmu PRŮŠVIH = prohra (konfrontace_prohra); jinak přežití
 *   odečte `zar.poPrezitiKonfrontaceOdecet` od Žáru (V3-A′, D58) — NE nastaví
 *   na absolutní cíl jako dřív. Práh konfrontace se navíc po prvním odpálení
 *   v runu už NIKDY znovu nenabíjí (`konfrontaceOdpalena`, „jeden klimax za
 *   run") — Zátah a léčka se dál nabíjejí normálně.
 * - Run-wide rušení statu pronásledovatelem (dnes jen Malone, `rusi.typ ===
 *   'stat'`) se aktivuje TEPRVE prvním překročením prahu Zátahu
 *   (`zatahLimitEverCrossed`, V2-A′, D58) — do té doby úplatky/hodnota platí
 *   normálně; od aktivace dál run-wide do konce runu. Štítkové rušení (dnes
 *   Brody/GANGSTER) touhle branou neprochází a platí run-wide od startu
 *   beze změny (`effectiveRusi`).
 * - Skryté prahy se clampují supply-aware (V4-D, D58): na viditelném slotu
 *   situace, kde GANGSTER auto-failuje, je strop nejvyšší stat dosažitelný
 *   NON-GANGSTER věcí, ne plochý `statMax` (`resolve.js` `nonGangsterStatMax`).
 */

import { createRng } from './rng.js';
import {
  ENCOUNTER_KINDS,
  revealSlots,
  resolveSlot,
  bandFromHits,
  maxAchievableZasahy,
  deriveTelegrafSignal,
  nonGangsterStatMax,
} from './resolve.js';
import {
  EVENT,
  BAND,
  ZAR_DUVOD,
  CREDIT_DUVOD,
  END_PRICINA,
  createLog,
  scoreGoals,
} from './events.js';

/**
 * `slot_resolved.duvod` hodnoty, kde propad je STATOVÝ (porovnání se skrytým
 * prahem selhalo) — na rozdíl od tvrdého pravidla nad staty (GANGSTER
 * auto-fail, zámkový postih), kde stat nehrál roli vůbec (D57/V1-A krok 1).
 */
const JE_STATOVY_PROPAD = new Set(['nizky_stat', 'stat_zrusen', 'kombi_neuplny']);

/**
 * Statová mezera propadlého slotu (`prah − stat_hodnota`) — u kombi slotu
 * (`stat_hodnota` je pole dvou hodnot) se bere HORŠÍ (nižší) z dvojice, protože
 * ta slot shodila (kombi vyžaduje OBA staty ≥ práh).
 * @param {{prah?: number, stat_hodnota?: number|number[]|null}} v
 */
function statovaMezera(v) {
  const hodnota = Array.isArray(v.stat_hodnota) ? Math.min(...v.stat_hodnota) : (v.stat_hodnota ?? 0);
  return (v.prah ?? 0) - hodnota;
}

/**
 * @param {object} opts
 * @param {number} opts.seed
 * @param {object} opts.content výstup parseContent() (v3 schémata)
 * @param {typeof import('./rules.js').RULES} opts.rules
 * @param {{id: string, jmeno?: string}[]} opts.players 1–4 postavy
 * @param {string} [opts.pronasledovatelId] vynucený pronásledovatel (jinak los)
 */
export function createRun({ seed, content, rules, players, pronasledovatelId }) {
  if (!Array.isArray(players) || players.length < 1 || players.length > 4) {
    throw new Error('createRun: players musí být 1–4 postavy.');
  }
  const rng = createRng(seed);
  const log = createLog();
  const handConfig = rules.ruce[players.length];

  /* --- obsah --- */
  const masoPool = content.situace.filter((s) => s.typ === 'npc' || s.typ === 'lokace');
  const zatahSituace = content.situace.find((s) => s.typ === 'zatah');
  const truhly = content.mista.filter((m) => m.typ === 'truhla');
  const motely = content.mista.filter((m) => m.typ === 'motel');
  const gangsterParams = content.stitky.find((s) => s.id === 'GANGSTER')?.parametry ?? null;
  // V4-D (D58): supply-aware clamp — spočítá se JEDNOU při načtení obsahu,
  // nemění ani jednu kartu (resolve.js `nonGangsterStatMax`/`revealSlots`).
  const nonGangsterMax = nonGangsterStatMax(content.veci, rules.staty);

  /* --- pronásledovatel --- */
  const pursuer = pronasledovatelId
    ? content.pronasledovatele.find((p) => p.id === pronasledovatelId)
    : rng.pick(content.pronasledovatele);
  if (!pursuer) throw new Error(`createRun: pronásledovatel „${pronasledovatelId}" v obsahu není.`);
  const rusi = pursuer.rusi ? { typ: pursuer.rusi.typ, cil: pursuer.rusi.cil } : null;
  const brodyGangster = rusi && rusi.typ === 'stitek' && rusi.cil === 'GANGSTER';
  const gangsterZarBase = gangsterParams?.hlucnost_zar ?? rules.zar.zaGangster;

  /* --- balík --- */
  let drawPile = rng.shuffle(content.veci);
  /** @type {object[]} */
  let discardPile = [];
  function drawCard() {
    if (drawPile.length === 0 && discardPile.length > 0) {
      drawPile = rng.shuffle(discardPile);
      discardPile = [];
    }
    return drawPile.pop() ?? null;
  }

  /* --- postavy --- */
  const characters = players.map((p) => ({
    id: p.id,
    jmeno: p.jmeno ?? p.id,
    /** @type {object[]} */ ruka: [],
    /** @type {{id:string, tier:string, efekt:object, zbyva:number|null, kategorie:string}[]} */
    postihy: [],
    slozena: false,
    kolDoNavratu: 0,
    /** @type {object|null} */ cil: null,
  }));
  const goalDeck = rng.shuffle(content.cile);
  characters.forEach((c, i) => {
    c.cil = goalDeck[i] ?? null;
    const potreba = handConfig.ruka;
    for (let k = 0; k < potreba; k++) {
      const karta = drawCard();
      if (karta) c.ruka.push(karta);
    }
  });

  /* --- průběh --- */
  let credits = rules.kredity.startovni;
  let crates = rules.bedenNaStartu;
  let heat = 0;
  let completedNodes = 0;
  let nodeSeq = 0;
  let drzitelMapyIdx = 0;
  /** @type {Set<string>} */ const visited = new Set();
  /** @type {Set<string>} */ const firedThresholds = new Set();
  /** @type {Set<number>} */ const offeredMotel = new Set();
  let zatahPending = false;
  let ambushPending = false;
  let confrontationPending = false;
  // V2-A′ (D58): jednou true, navždy true — na rozdíl od `firedThresholds` se
  // NIKDY nemaže, i když Žár zase klesne pod práh Zátahu (na to slouží
  // `firedThresholds`, které dál umožňuje Zátahu se opakovat).
  let zatahLimitEverCrossed = false;
  // V3-A′ (D58): „jeden klimax za run" — jakmile se práh konfrontace jednou
  // odpálí, `updateThresholds` ho už nikdy znovu nezkoumá (žádné druhé finále).
  let konfrontaceOdpalena = false;

  /** @type {'map'|'motel_offer'|'motel'|'commit'|'assign'|'confirm'|'ended'} */
  let phase = 'map';
  /** @type {object|null} */ let offered = null;
  /** @type {object|null} */ let situ = null; // aktuální situace v běhu
  let runOver = false;
  /** @type {{vysledek:string, pricina:string}|null} */ let endCause = null;
  /** @type {object|null} */ let result = null;

  log.append(EVENT.RUN_STARTED, 0, {
    seed,
    verzeObsahu: content.verze,
    verzePravidel: rules.verze,
    pronasledovatel: pursuer.id,
    rusi,
    pocetHracu: players.length,
    ruce: characters.map((c) => ({ hrac_id: c.id, velikost: c.ruka.length, karty: c.ruka.map((k) => k.id) })),
    loadout: characters.map(() => []), // MVP []
    startBeden: crates,
    startZar: heat,
    startKreditu: credits,
    cile: characters.map((c) => ({ hrac_id: c.id, cil: c.cil?.id ?? null })),
  });

  nextStep();

  /* ================= mapa a odbočky ================= */

  function nextStep() {
    if (runOver) return endRun(endCause);
    if (completedNodes >= rules.uzluNaRun) {
      return endRun({ vysledek: 'DORUCENO', pricina: END_PRICINA.DOJEZD });
    }
    const krok = completedNodes + 1;
    if (!zatahPending && rules.map.motelKroky.includes(krok) && !offeredMotel.has(krok) && motely.length > 0) {
      offeredMotel.add(krok);
      phase = 'motel_offer';
      offered = { motel: rng.pick(motely).id };
      return;
    }
    offerRoutes(krok);
  }

  /**
   * Krokové zúžení maso-poolu dle volitelného pole `faze` (kalibrace-4, K2).
   *
   * Run je cesta z Buffala do New Yorku: venkovské situace patří na začátek,
   * městské a rivalské na konec. Tvrdost tím roste s postupem trasy, což je
   * přesně to, co K2 měří (drift míry PRŮŠVIHŮ uzel 3–4 / 1–2) — dnes se
   * všechno losuje z jednoho pytle, takže se snowball rozmělňuje.
   *
   * Není to nové pravidlo pro hráče, jen sekvencování obsahu — mapa už dnes
   * krokově podmiňuje truhlu (`rules.map.truhlaKrok`). Situace bez `faze`
   * se nabízí kdykoli.
   *
   * **Fallback je povinný:** kdyby zúžení nechalo míň než 2 možnosti, vrací se
   * celý pool. Nabídka na mapě nesmí zdegenerovat na jedinou cestu — volba
   * trasy je herní rozhodnutí (StS graf), ne dekorace.
   */
  function faziPool(pool, krok) {
    const faze = krok <= rules.map.faziRanaDoKroku ? 'rana' : krok >= rules.map.faziPozdniOdKroku ? 'pozdni' : null;
    if (!faze) return pool;
    const uzsi = pool.filter((s) => s.faze === faze || s.faze == null);
    return uzsi.length >= 2 ? uzsi : pool;
  }

  function offerRoutes(krok) {
    nodeSeq += 1;
    if (zatahPending && zatahSituace) {
      zatahPending = false;
      offered = { nabidnuto: [{ ref: zatahSituace.id, typ_mista: 'zatah' }], zatah: true };
    } else if (krok === rules.map.truhlaKrok && truhly.length > 0) {
      const vyber = rng.shuffle(truhly).slice(0, Math.min(2, truhly.length));
      offered = { nabidnuto: vyber.map((t) => ({ ref: t.id, typ_mista: 'truhla' })), zatah: false };
    } else {
      const pool = faziPool(masoPool.filter((s) => !visited.has(s.id)), krok);
      const vyber = rng.shuffle(pool).slice(0, Math.min(2, pool.length));
      offered = { nabidnuto: vyber.map((s) => ({ ref: s.id, typ_mista: s.typ })), zatah: false };
    }
    phase = 'map';
    log.append(EVENT.MAP_MOVE, nodeSeq, {
      nabidnuto: offered.nabidnuto,
      byl_zatah: Boolean(offered.zatah),
    });
  }

  /* ================= situace ================= */

  function startSituation(def, kind, typMista) {
    const commitPlan = buildCommitPlan();
    situ = {
      def,
      kind,
      typ: def.typ,
      typMista,
      /** @type {{hrac_id:string, pocet:number}[]} */ commitPlan,
      /** @type {object[]} */ committed: [],
      /** @type {object[]|null} */ odhaleno: null,
      /** @type {object[]|null} */ assignment: null,
      gambleUsed: false,
      signal: deriveTelegrafSignal(def.sloty, gangsterParams, def.typ),
    };
    const nevidi = characters.filter((c) => hasEfekt(c, 'hide_telegraf')).map((c) => c.id);
    log.append(EVENT.TELEGRAF_DERIVED, nodeSeq, {
      signal_pravy: situ.signal,
      signal_vyslany: situ.signal, // fidelita p = sim knob (bot zašumí), engine derivuje pravdu
      nevidi,
    });
    // Nikdo aktivní (všichni složení) → situace se auto-vyhodnotí (samé auto-faily).
    if (commitPlan.length === 0) {
      situ.odhaleno = revealSlots(situ.def, rng, rules, { stitekParams: gangsterParams, nonGangsterMax });
      situ.rusiEfektivni = effectiveRusi();
      logSituationRevealed();
      logAssignContext();
      situ.assignment = [];
      phase = 'confirm';
      return resolveSituation();
    }
    phase = 'commit';
  }

  /**
   * Kvóta commitu per SEDÍCÍ postava (dle počtu hráčů); u 3p držitel mapy 2.
   * @returns {Map<string, number>}
   */
  function seatQuota() {
    const commit = handConfig.commit;
    const q = new Map();
    if (players.length === 3) {
      q.set(characters[drzitelMapyIdx].id, commit[0]);
      let k = 1;
      for (const c of characters) if (c.id !== characters[drzitelMapyIdx].id) q.set(c.id, commit[k++]);
    } else {
      characters.forEach((c, i) => q.set(c.id, commit[i]));
    }
    return q;
  }

  /**
   * Commit plan jen za AKTIVNÍ (nesložené) postavy — složení i zmenšená ruka
   * (ruka_minus) = méně committnutých karet (nikdy víc, než kolik hráč drží).
   */
  function buildCommitPlan() {
    const q = seatQuota();
    return characters
      .filter((c) => !c.slozena)
      .map((c) => ({ hrac_id: c.id, pocet: Math.min(q.get(c.id) ?? 0, c.ruka.length) }))
      .filter((p) => p.pocet > 0);
  }

  function logSituationRevealed() {
    log.append(EVENT.SITUATION_REVEALED, nodeSeq, {
      situace_id: situ.def.id,
      typ: situ.typ,
      typ_mista: situ.typMista,
      // V2-A′ (D58): rušení platné PRÁVĚ V TOMHLE uzlu — na rozdíl od statického
      // `run_started.rusi` (definice pronásledovatele) reflektuje, jestli Malone
      // svou branu (práh Zátahu) už v runu překročil. Report/sim počítají K5/K5f/
      // oracle nad TÍMHLE polem, ne nad `run_started.rusi`.
      rusi_efektivni: situ.rusiEfektivni ?? null,
      sloty: situ.odhaleno.map((s) => ({
        slot_index: s.slot_index,
        role: s.role,
        stat: s.stat,
        kotva: s.kotva,
        sum: s.sum,
        prah: s.prah,
        typ_prahu: s.typ_prahu,
        viditelnost: s.viditelnost,
        stitek_citlivy: s.stitek_citlivy,
      })),
    });
  }

  /**
   * Objektivní kontext na hraně commit→assign (ADR-010) — zbytky rukou a
   * dostupnost gamblu, tedy data, která po gamblu už nejdou zrekonstruovat.
   * Loguje se u KAŽDÉ situace (i té, kterou nikdo nekomitoval, protože jsou
   * všichni složení), ať report nemusí rozlišovat „chybí, protože stará dávka"
   * od „chybí, protože degenerovaný uzel". Nesahá na `rng`.
   */
  function logAssignContext() {
    const blokovan = situ.gambleUsed
      ? 'jiz_pouzit'
      : characters.some((c) => hasEfekt(c, 'lock_gamble'))
        ? 'lock_gamble'
        : situ.committed.length === 0
          ? 'bez_commitu'
          : characters.every((c) => c.ruka.length === 0)
            ? 'prazdne_ruce'
            : null;
    log.append(EVENT.ASSIGN_CONTEXT, nodeSeq, {
      situace_id: situ.def.id,
      typ: situ.typ,
      stitek_chovani: gangsterParams?.chovani_dle_typu?.[situ.typ] ?? null,
      gamble_dostupny: blokovan === null,
      gamble_blokovan: blokovan,
      // Složené postavy se logují také (s příznakem) — `gamble()` je nefiltruje,
      // takže report musí replikovat stejnou doménu výběru ruky.
      ruce: characters.map((c) => ({
        hrac_id: c.id,
        slozena: c.slozena,
        // Zámkové postihy (D34/N1) mění, co je pro KTERÉHO hráče dosažitelné —
        // bez nich by post-hoc report počítal K5/K7 nad jinou hrou, než bot hrál
        // (a padl by tripwire shody odhadu s gamble-politikou, ADR-010).
        zamky: zamkyHrace(c),
        karty: c.ruka.map((k) => ({
          karta_id: k.id,
          staty: { ...k.staty },
          stitky: k.stitek ? [k.stitek] : [],
        })),
      })),
    });
  }

  /* ================= postihy ================= */

  function hasEfekt(c, druh) {
    return c.postihy.some((p) => p.efekt?.druh === druh);
  }
  /**
   * Aktivní ZÁMKOVÉ postihy hráče ve tvaru, kterému rozumí `resolveSlot`
   * (D34/N1). Do 2026-07-27 se nikde nečetly — `lock_stitek`
   * a `lock_slot_viditelnost` byly no-opy.
   * @param {object} c postava
   */
  function zamkyHrace(c) {
    const stitky = c.postihy.filter((p) => p.efekt?.druh === 'lock_stitek').map((p) => p.efekt.stitek);
    const viditelnosti = c.postihy.filter((p) => p.efekt?.druh === 'lock_slot_viditelnost').map((p) => p.efekt.viditelnost);
    return stitky.length === 0 && viditelnosti.length === 0 ? null : { stitky, viditelnosti };
  }
  /** Zámky vlastníka pro každou committnutou kartu (index sdílený s `committed`). */
  function zamkyCommitu() {
    return situ.committed.map((c) => zamkyHrace(findCharacter(c.hrac_id)));
  }
  function rukaMinus(c) {
    return c.postihy.filter((p) => p.efekt?.druh === 'ruka_minus').reduce((a, p) => a + (p.efekt.kolik ?? 1), 0);
  }
  function effectiveHand(c) {
    return Math.max(0, handConfig.ruka - rukaMinus(c));
  }

  /** @param {object} c @param {string} postihId @param {string} pricina */
  function addPenalty(c, postihId, pricina) {
    if (c.slozena) return;
    const def = content.postihy.find((p) => p.id === postihId);
    if (!def) return;
    // Okamžité (ihned) ztrátové efekty — aplikují se hned, do fronty nejdou (necapují).
    if (def.trvani === 'ihned') {
      applyImmediate(c, def, pricina);
      log.append(EVENT.PENALTY_ADDED, nodeSeq, penaltyPayload(c, def, pricina, 0));
      return;
    }
    // Cap 2 aktivní: 3. trvalý postih se NEPŘIDÁVÁ — místo něj postava „složí"
    // (maže lehké, těžké přetrvávají). Zabraňuje hromadění postihů nad cap.
    if (c.postihy.length >= rules.postihy.capNaHrace) {
      foldCharacter(c);
      return;
    }
    if (def.efekt?.druh === 'ztrata_naklad' || def.efekt?.druh === 'ztrata_kreditu' || def.efekt?.druh === 'ztrata_karty') {
      applyImmediate(c, def, pricina);
    }
    const zbyva = def.tier === 'tezky' ? null : def.trvani;
    c.postihy.push({ id: def.id, tier: def.tier, kategorie: def.typ, efekt: def.efekt, zbyva });
    log.append(EVENT.PENALTY_ADDED, nodeSeq, penaltyPayload(c, def, pricina, c.postihy.length));
  }

  function penaltyPayload(c, def, pricina, aktivnich) {
    return {
      hrac_id: c.id,
      postih_id: def.id,
      kategorie: def.typ,
      tier: def.tier,
      efekt: def.efekt,
      vyprsi_za: def.tier === 'tezky' ? null : def.trvani,
      pricina,
      aktivnich_po: aktivnich,
    };
  }

  function applyImmediate(c, def, pricina) {
    const e = def.efekt;
    if (e.druh === 'ztrata_kreditu') changeCredits(-(e.kolik ?? 1), CREDIT_DUVOD.ZTRATOVY_POSTIH);
    else if (e.druh === 'ztrata_naklad') loseCrates(e.kolik ?? 1);
    else if (e.druh === 'ztrata_karty') {
      for (let i = 0; i < (e.kolik ?? 1) && c.ruka.length > 0; i++) discardPile.push(c.ruka.pop());
    }
    void pricina;
  }

  function foldCharacter(c) {
    const smazane = c.postihy.filter((p) => p.tier === 'lehky').map((p) => p.id);
    const tezke = c.postihy.filter((p) => p.tier === 'tezky');
    c.postihy = tezke; // složení maže jen lehké
    c.slozena = true;
    c.kolDoNavratu = rules.postihy.slozeniKolMin + rng.int(rules.postihy.slozeniKolMax - rules.postihy.slozeniKolMin + 1);
    log.append(EVENT.CHARACTER_FOLDED, nodeSeq, {
      hrac_id: c.id,
      kolo_od: nodeSeq,
      smazane_lehke: smazane,
      pretrvavaji_tezke: tezke.map((p) => p.id),
    });
  }

  /** Po každé situaci: odečti trvání lehkých, vrať složené. */
  function tickPenalties() {
    for (const c of characters) {
      const vyprsele = [];
      for (const p of c.postihy) {
        if (p.zbyva != null) {
          p.zbyva -= 1;
          if (p.zbyva <= 0) vyprsele.push(p);
        }
      }
      if (vyprsele.length > 0) {
        c.postihy = c.postihy.filter((p) => !vyprsele.includes(p));
        for (const p of vyprsele) {
          log.append(EVENT.PENALTY_EXPIRED, nodeSeq, { hrac_id: c.id, postih_id: p.id, duvod: 'cas' });
        }
      }
      if (c.slozena) {
        c.kolDoNavratu -= 1;
        if (c.kolDoNavratu <= 0) {
          c.slozena = false;
          log.append(EVENT.CHARACTER_RETURNED, nodeSeq, { hrac_id: c.id });
        }
      }
    }
  }

  /* ================= zdroje ================= */

  function changeCredits(delta, duvod) {
    if (delta === 0) return;
    credits = Math.max(0, credits + delta);
    log.append(EVENT.CREDIT_FLOW, nodeSeq, { delta, duvod, zustatek: credits });
  }

  function loseCrates(kolik) {
    if (runOver || kolik <= 0) return 0;
    const skutecne = Math.min(kolik, crates);
    crates -= skutecne;
    if (crates <= 0) {
      runOver = true;
      endCause = { vysledek: 'NEVYRESENO', pricina: END_PRICINA.BEDNY_0 };
    }
    return skutecne;
  }

  function changeHeat(delta, duvod, prahPole) {
    if (runOver || delta === 0) return;
    const old = heat;
    heat = Math.max(0, Math.min(rules.zar.max, heat + delta));
    if (heat === old) return;
    log.append(EVENT.ZAR_MOVE, nodeSeq, {
      delta: heat - old,
      duvod,
      nova_pozice: heat,
      prah_prekrocen: prahPole ?? null,
    });
    updateThresholds();
  }

  function updateThresholds() {
    // P1 (D25d): prahy trati se per počet hráčů posouvají dolů — jediná
    // per-count páka, která nesahá na obtížnost běžných uzlů.
    const offset = rules.zar.prahOffsetDlePoctu?.[players.length] ?? 0;
    for (const [nazev, prahBase] of Object.entries(rules.zar.prahy)) {
      // V3-A′ (D58): jednou odpálený práh konfrontace se v tomhle runu už
      // NIKDY znovu nezkoumá — ani kdyby Žár znovu vystoupal na jeho úroveň.
      if (nazev === 'konfrontace' && konfrontaceOdpalena) continue;
      const prah = Math.max(1, prahBase - offset);
      if (heat >= prah && !firedThresholds.has(nazev)) {
        firedThresholds.add(nazev);
        if (nazev === 'zatah') {
          zatahPending = true;
          zatahLimitEverCrossed = true; // V2-A′ (D58): navždy — brána pro Maloneovo rušení
        } else if (nazev === 'lecka') {
          ambushPending = true;
        } else if (nazev === 'konfrontace') {
          confrontationPending = true;
          konfrontaceOdpalena = true;
        }
      } else if (heat < prah) {
        firedThresholds.delete(nazev);
      }
    }
  }

  /**
   * Je run-wide rušení pronásledovatele PRÁVĚ TEĎ aktivní? (D58)
   * Statové rušení (Malone, `rusi.typ === 'stat'`, V2-A′) se aktivuje teprve
   * prvním překročením prahu Zátahu; do té doby úplatky/hodnota platí.
   * Štítkové rušení (Brody, `rusi.typ === 'stitek'`) touhle branou neprochází
   * — platí run-wide od startu, jak sliboval kanon od začátku (D20a).
   */
  function jeRusiAktivni() {
    if (!rusi) return false;
    if (rusi.typ === 'stat') return zatahLimitEverCrossed;
    return true;
  }

  /** Rušení, které se smí předat `resolveSlot`/`maxAchievableZasahy` PRÁVĚ TEĎ. */
  function effectiveRusi() {
    return jeRusiAktivni() ? rusi : null;
  }

  /* ================= resoluce situace ================= */

  function resolveSituation() {
    const sloty = situ.odhaleno;
    // V2-A′ (D58): rušení zachycené PŘI ODHALENÍ tohohle uzlu (`situ.rusiEfektivni`)
    // — ne přepočítané znovu, ať log (`situation_revealed.rusi_efektivni`)
    // a skutečná resoluce vždy mluví o TÉŽE hodnotě, i kdyby se mezitím (gamble)
    // stalo cokoli, co by teoreticky mohlo pohnout Žárem (dnes nic nehýbe, ale
    // jednoznačnost je zadarmo).
    const rusiUzlu = situ.rusiEfektivni ?? null;
    const assignByCard = new Map(situ.assignment.map((a) => [a.karta_id, a]));
    const kartaById = new Map(situ.committed.map((c) => [c.karta.id, c.karta]));
    /** @type {{hrac_id:string, zasah:boolean, slot_index:number, duvod?:string, prah?:number, stat_hodnota?:(number|number[]|null)}[]} */ const vysledky = [];
    let zasahy = 0;

    for (const slot of sloty) {
      const a = situ.assignment.find((x) => x.slot_index === slot.slot_index);
      if (!a) {
        // Neobsazený slot (méně committnutých karet při složení) → auto-fail.
        vysledky.push({ hrac_id: null, zasah: false, slot_index: slot.slot_index });
        log.append(EVENT.SLOT_RESOLVED, nodeSeq, {
          slot_index: slot.slot_index,
          karta_id: null,
          hrac_id: null,
          stat: slot.stat,
          stat_hodnota: null,
          prah: slot.prah,
          typ_prahu: slot.typ_prahu,
          viditelnost: slot.viditelnost,
          stitky: [],
          stitek_efekt: null,
          pronasledovatel_efekt: null,
          zasah: false,
          duvod: 'neobsazeno',
        });
        continue;
      }
      const karta = kartaById.get(a.karta_id);
      const zamky = zamkyHrace(findCharacter(a.hrac_id));
      const r = resolveSlot({ karta, slot, rusi: rusiUzlu, stitekParams: gangsterParams, typSituace: situ.typ, zamky });
      if (r.zasah) zasahy += 1;
      vysledky.push({
        hrac_id: a.hrac_id,
        zasah: r.zasah,
        slot_index: slot.slot_index,
        duvod: r.duvod,
        prah: slot.prah,
        stat_hodnota: r.stat_hodnota,
      });
      log.append(EVENT.SLOT_RESOLVED, nodeSeq, {
        slot_index: slot.slot_index,
        karta_id: karta.id,
        hrac_id: a.hrac_id,
        stat: slot.stat,
        stat_hodnota: r.stat_hodnota,
        prah: slot.prah,
        typ_prahu: slot.typ_prahu,
        viditelnost: slot.viditelnost,
        stitky: karta.stitek ? [karta.stitek] : [],
        stitek_efekt: r.stitek_efekt,
        pronasledovatel_efekt: r.pronasledovatel_efekt,
        postih_efekt: r.postih_efekt,
        zasah: r.zasah,
        duvod: r.duvod,
      });
    }
    void assignByCard;

    const pasmo = bandFromHits(zasahy);
    // Oracle nad committnutými (doplněnými na 4 „prázdnými" sloty, které vždy padnou).
    const committedKarty = situ.committed.map((c) => c.karta);
    const committedZamky = zamkyCommitu();
    while (committedKarty.length < rules.slotu) {
      committedKarty.push(null);
      committedZamky.push(null);
    }
    const maxZasahy = maxAchievableZasahy(committedKarty, sloty, rusiUzlu, gangsterParams, situ.typ, committedZamky);

    // Náklad: PRŮŠVIH bere bednu.
    let naklad_ztrata = 0;
    if (pasmo === BAND.PRUSVIH) naklad_ztrata = loseCrates(rules.nakladPrusvihZtrata);

    log.append(EVENT.BAND_RESOLVED, nodeSeq, {
      zasahy,
      pasmo,
      max_achievable_zasahy: maxZasahy,
      max_achievable_band: bandFromHits(maxZasahy),
      gap: maxZasahy - zasahy,
      naklad_ztrata,
      zbyva_beden: crates,
    });

    // Žár z hlučného hraní (assignované karty).
    for (const c of situ.committed) {
      const k = c.karta;
      if (k.stitek === 'GANGSTER') {
        changeHeat(gangsterZarBase * (brodyGangster ? 2 : 1), ZAR_DUVOD.HLUCNE_GANGSTER);
      } else if ((k.staty.utok ?? 0) >= rules.zar.hlucnyUtokPrah) {
        changeHeat(rules.zar.zaHlucnyUtok, ZAR_DUVOD.HLUCNE_UTOK);
      }
      if (runOver) break;
    }

    // Pásmová ekonomika + postihy (globální dle prototyp-mvp.md).
    if (!runOver) applyBandConsequences(pasmo, vysledky);

    // Konfrontace: PRŮŠVIH = prohra; jinak přežití srazí Žár.
    if (situ.kind === ENCOUNTER_KINDS.KONFRONTACE && !runOver) {
      if (pasmo === BAND.PRUSVIH) {
        runOver = true;
        endCause = { vysledek: 'NEVYRESENO', pricina: END_PRICINA.KONFRONTACE_PROHRA };
      } else {
        // V3-A′ (D58): pevný ODEČET od Žáru, ne nastavení na absolutní cíl —
        // `updateThresholds` navíc práh konfrontace po tomhle bodu už nikdy
        // znovu nezkoumá (`konfrontaceOdpalena`), takže tenhle pokles nemůže
        // otevřít druhé finále, ať skončí kdekoli.
        changeHeat(-rules.zar.poPrezitiKonfrontaceOdecet, ZAR_DUVOD.KONFRONTACE_PREZITA);
      }
    }

    finishSituation();
  }

  /**
   * Oběť postihu (D57/V1-A krok 1, technika/design-audit-2p-2026-08-02.md §2.2):
   * vlastník propadlého slotu s NEJVĚTŠÍ statovou mezerou (`prah − stat_hodnota`)
   * mezi statovými propady (duvod `nizky_stat` / `stat_zrusen` / `kombi_neuplny`).
   * Tvrdé propady (GANGSTER auto-fail, zámkový postih) jdou na řadu, jen když
   * statový propad v uzlu není — jinak by oběť byla deterministicky ten, komu
   * D17 vnutil zbraň do viditelné role (nález kritika, audit §2.2 bod 1).
   * Tie-break: nejnižší `slot_index` (pole `vysledky` je v pořadí slotů).
   */
  function vyberObet(vysledky) {
    const statoveFaily = vysledky.filter((v) => !v.zasah && v.hrac_id != null && JE_STATOVY_PROPAD.has(v.duvod));
    if (statoveFaily.length > 0) {
      let nejhorsi = statoveFaily[0];
      let nejvetsiMezera = statovaMezera(nejhorsi);
      for (const v of statoveFaily.slice(1)) {
        const mezera = statovaMezera(v);
        if (mezera > nejvetsiMezera) {
          nejhorsi = v;
          nejvetsiMezera = mezera;
        }
      }
      return findCharacter(nejhorsi.hrac_id);
    }
    // Bez statového propadu (jen tvrdá pravidla) → první propadlý slot v pořadí.
    const propadli = vysledky.filter((v) => !v.zasah && v.hrac_id != null).map((v) => v.hrac_id);
    return propadli.length > 0 ? findCharacter(propadli[0]) : null;
  }

  function applyBandConsequences(pasmo, vysledky) {
    const obet = vyberObet(vysledky);
    if (pasmo === BAND.LOOT) {
      changeCredits(rules.kredity.zaHladceLoot, CREDIT_DUVOD.HLADCE_LOOT);
      const kdo = characters.find((c) => !c.slozena) ?? characters[0];
      const karta = drawCard();
      if (karta) kdo.ruka.push(karta);
    } else if (pasmo === BAND.HLADCE) {
      changeCredits(rules.kredity.zaHladce, CREDIT_DUVOD.HLADCE);
    } else if (pasmo === BAND.NASLEDKY) {
      changeHeat(rules.zar.zaSNasledky, ZAR_DUVOD.SNASLEDKY);
      if (obet) addPenalty(obet, rng.pick(situ.def.pasmove_vysledky.s_nasledky.postih_lehky), pasmo);
    } else if (pasmo === BAND.PRUSVIH) {
      changeHeat(rules.zar.zaPrusvih, ZAR_DUVOD.PRUSVIH);
      if (obet) addPenalty(obet, rng.pick(situ.def.pasmove_vysledky.prusvih.postih_tezky), pasmo);
    }
  }

  function finishSituation() {
    // Odhoz committnutých + doplnění rukou.
    for (const c of situ.committed) discardPile.push(c.karta);
    tickPenalties();
    if (situ.kind === ENCOUNTER_KINDS.UZEL || situ.kind === ENCOUNTER_KINDS.ZATAH) {
      completedNodes += 1;
      visited.add(situ.def.id);
      if (players.length === 3) drzitelMapyIdx = (drzitelMapyIdx + 1) % 3;
    }
    for (const c of characters) {
      if (c.slozena) continue;
      while (c.ruka.length < effectiveHand(c)) {
        const karta = drawCard();
        if (!karta) break;
        c.ruka.push(karta);
      }
    }
    situ = null;

    if (runOver) return endRun(endCause);

    // Vložená setkání: konfrontace > léčka; Zátah se řeší až při volbě cesty.
    if (confrontationPending) {
      confrontationPending = false;
      ambushPending = false;
      nodeSeq += 1;
      return startSituation({ ...pursuer.konfrontace, id: `${pursuer.id}-konfrontace` }, ENCOUNTER_KINDS.KONFRONTACE, 'konfrontace');
    }
    if (ambushPending) {
      ambushPending = false;
      nodeSeq += 1;
      return startSituation({ ...pursuer.lecka, id: `${pursuer.id}-lecka` }, ENCOUNTER_KINDS.LECKA, 'lecka');
    }
    nextStep();
  }

  /* ================= konec ================= */

  function endRun(cause) {
    phase = 'ended';
    situ = null;
    const prirazeni = characters.filter((c) => c.cil).map((c) => ({ postavaId: c.id, cil: c.cil }));
    const cileSkore = scoreGoals(
      [...log.all(), { type: EVENT.RUN_ENDED, vysledek: cause.vysledek }],
      prirazeni
    );
    for (const s of cileSkore) {
      log.append(EVENT.GOAL_SCORED, nodeSeq, {
        hrac_id: s.postava,
        cil_id: s.cil,
        overeni_typ: s.textovy ? 'textovy' : 'mechanicky',
        splnen: s.splnen,
      });
    }
    result = {
      vysledek: cause.vysledek,
      pricina: cause.pricina,
      pocet_uzlu: completedNodes,
      zbyva_beden: crates,
      konecny_zar: heat,
      kredity_zbytek: credits,
      cile: cileSkore,
    };
    log.append(EVENT.RUN_ENDED, nodeSeq, result);
  }

  function findCharacter(id) {
    const c = characters.find((x) => x.id === id);
    if (!c) throw new Error(`Neznámá postava „${id}".`);
    return c;
  }

  /* ================= veřejné API ================= */

  return {
    getState() {
      return structuredClone({
        faze: phase,
        seed,
        // `rusiAktivni` (D58): je run-wide rušení PRÁVĚ TEĎ v platnosti? U Malonea
        // (typ 'stat', V2-A′) false, dokud Žár poprvé nepřekročí práh Zátahu —
        // UI (commit.js/assign.js přeškrtnutá hodnota) na tomhle poli závisí,
        // ať netvrdí rušení dřív, než skutečně platí.
        pronasledovatel: { id: pursuer.id, nazev: pursuer.nazev, rusi, rusiAktivni: jeRusiAktivni() },
        zar: heat,
        // V3-A′ (D58): jednou odpálený práh konfrontace se v tomhle runu už nikdy
        // znovu nezkoumá (`konfrontaceOdpalena` výše) — okraj (okraj.js) tohle
        // potřebuje, aby práh konfrontace po klimaxu vizuálně odlišil jako
        // spotřebovaný, ne jen jako „zatím pod aktuální hladinou Žáru".
        konfrontaceSpotrebovana: konfrontaceOdpalena,
        zbyvaBeden: crates,
        kredity: credits,
        dokoncenoUzlu: completedNodes,
        nodeIndex: nodeSeq,
        drzitelMapy: players.length === 3 ? characters[drzitelMapyIdx].id : null,
        nabidka: phase === 'map' ? offered : null,
        motelNabidka: phase === 'motel_offer' ? offered : null,
        motel: phase === 'motel' ? { id: offered?.motel, sluzby: motely.find((m) => m.id === offered?.motel)?.sluzby ?? null } : null,
        situace:
          situ && (phase === 'commit' || phase === 'assign' || phase === 'confirm')
            ? {
                id: situ.def.id,
                typ: situ.typ,
                kind: situ.kind,
                telegraf: situ.def.telegraf,
                signal: situ.signal,
                stitekParams: gangsterParams, // GANGSTER pravidlo je veřejné (telegraf hlásí verdikt zbraně)
                commitPlan: situ.commitPlan,
                committed: situ.committed.map((c) => ({ hrac_id: c.hrac_id, karta: { ...c.karta } })),
                odhaleno: situ.odhaleno ? { sloty: situ.odhaleno.map((s) => ({ ...s })) } : null,
                assignment: situ.assignment,
                gambleUsed: situ.gambleUsed,
              }
            : null,
        postavy: characters.map((c) => ({
          id: c.id,
          jmeno: c.jmeno,
          ruka: c.ruka.map((k) => ({ ...k })),
          postihy: c.postihy.map((p) => ({ ...p })),
          slozena: c.slozena,
          kolDoNavratu: c.kolDoNavratu,
          cil: c.cil ? { ...c.cil } : null,
        })),
        vysledek: result,
      });
    },

    getEvents() {
      return structuredClone(log.all());
    },

    getHand(hracId) {
      return structuredClone(findCharacter(hracId).ruka);
    },

    chooseRoute(ref) {
      if (phase !== 'map') throw new Error(`chooseRoute mimo fázi map (fáze: ${phase}).`);
      const volba = offered.nabidnuto.find((n) => n.ref === ref);
      if (!volba) throw new Error(`Cesta „${ref}" není v nabídce.`);
      log.append(EVENT.MAP_MOVE, nodeSeq, { volba: ref, typ_mista: volba.typ_mista });
      if (volba.typ_mista === 'truhla') {
        const truhla = truhly.find((t) => t.id === ref);
        const [lo, hi] = truhla.odmena.kredity_rozsah;
        changeCredits(lo + rng.int(hi - lo + 1), CREDIT_DUVOD.TRUHLA);
        if (truhla.odmena.vyber_karty) {
          const kdo = characters.find((c) => !c.slozena) ?? characters[0];
          const karta = drawCard();
          if (karta) kdo.ruka.push(karta);
        }
        completedNodes += 1;
        visited.add(ref);
        if (players.length === 3) drzitelMapyIdx = (drzitelMapyIdx + 1) % 3;
        offered = null;
        return nextStep();
      }
      const kind = volba.typ_mista === 'zatah' ? ENCOUNTER_KINDS.ZATAH : ENCOUNTER_KINDS.UZEL;
      const def = volba.typ_mista === 'zatah' ? zatahSituace : masoPool.find((s) => s.id === ref);
      offered = null;
      startSituation(def, kind, volba.typ_mista);
    },

    motelChoice(volba) {
      if (phase !== 'motel_offer') throw new Error(`motelChoice mimo fázi motel_offer (fáze: ${phase}).`);
      log.append(EVENT.MAP_MOVE, nodeSeq, { motel_odbocka: { volba } });
      if (volba === 'ukryt') {
        phase = 'motel';
      } else if (volba === 'dal') {
        offered = null;
        offerRoutes(completedNodes + 1);
      } else {
        throw new Error(`Neznámá volba motelu „${volba}" (ukryt | dal).`);
      }
    },

    spendCredits({ sluzba, hracId, postihId, kartaId }) {
      if (phase !== 'motel') throw new Error(`spendCredits mimo fázi motel (fáze: ${phase}).`);
      if (sluzba === 'leceni') {
        const c = findCharacter(hracId);
        const p = c.postihy.find((x) => x.id === postihId && x.tier === 'tezky');
        if (!p) throw new Error(`Postava „${hracId}" nemá těžký postih „${postihId}".`);
        if (credits < rules.kredity.leceniTezkeho) throw new Error('Nedost kreditů na léčení.');
        changeCredits(-rules.kredity.leceniTezkeho, CREDIT_DUVOD.LECENI);
        c.postihy = c.postihy.filter((x) => x !== p);
        log.append(EVENT.PENALTY_HEALED, nodeSeq, { hrac_id: hracId, postih_id: postihId, cena: rules.kredity.leceniTezkeho });
      } else if (sluzba === 'smena') {
        const c = findCharacter(hracId);
        if (credits < rules.kredity.smenaKarty) throw new Error('Nedost kreditů na směnu.');
        const idx = c.ruka.findIndex((k) => k.id === kartaId);
        if (idx < 0) throw new Error(`Karta „${kartaId}" není v ruce „${hracId}".`);
        changeCredits(-rules.kredity.smenaKarty, CREDIT_DUVOD.SMENA);
        discardPile.push(c.ruka.splice(idx, 1)[0]);
        const karta = drawCard();
        if (karta) c.ruka.push(karta);
      } else {
        throw new Error(`Neznámá služba „${sluzba}" (leceni | smena).`);
      }
    },

    leaveMotel() {
      if (phase !== 'motel') throw new Error(`leaveMotel mimo fázi motel (fáze: ${phase}).`);
      offered = null;
      offerRoutes(completedNodes + 1);
    },

    commitCards(list) {
      if (phase !== 'commit') throw new Error(`commitCards mimo fázi commit (fáze: ${phase}).`);
      const ocekavano = situ.commitPlan.reduce((a, p) => a + p.pocet, 0);
      if (!Array.isArray(list) || list.length !== ocekavano) {
        throw new Error(`commitCards: očekávám přesně ${ocekavano} karet (dostal ${list?.length}).`);
      }
      // kontrola počtu per hráč dle commitPlan
      const perHrac = new Map(situ.commitPlan.map((p) => [p.hrac_id, p.pocet]));
      const dano = new Map();
      for (const { characterId } of list) dano.set(characterId, (dano.get(characterId) ?? 0) + 1);
      for (const [hrac, pocet] of perHrac) {
        if ((dano.get(hrac) ?? 0) !== pocet) {
          throw new Error(`commitCards: hráč „${hrac}" má committnout ${pocet}, dostal ${dano.get(hrac) ?? 0}.`);
        }
      }
      for (const { characterId, cardId } of list) {
        const c = findCharacter(characterId);
        const idx = c.ruka.findIndex((k) => k.id === cardId);
        if (idx < 0) throw new Error(`Karta „${cardId}" není v ruce „${characterId}".`);
        const karta = c.ruka.splice(idx, 1)[0];
        situ.committed.push({ hrac_id: characterId, karta });
      }
      log.append(EVENT.COMMIT, nodeSeq, {
        commit: situ.committed.map((c) => ({
          hrac_id: c.hrac_id,
          karta_id: c.karta.id,
          staty: { ...c.karta.staty },
          stitky: c.karta.stitek ? [c.karta.stitek] : [],
          dobrovolna: true,
        })),
        rozdeleni: situ.commitPlan,
        drzitel_mapy: players.length === 3 ? characters[drzitelMapyIdx].id : null,
      });
      // Odhalení situace.
      situ.odhaleno = revealSlots(situ.def, rng, rules, { stitekParams: gangsterParams, nonGangsterMax });
      situ.rusiEfektivni = effectiveRusi();
      logSituationRevealed();
      logAssignContext();
      phase = 'assign';
    },

    gamble({ handOwnerId, replacedCardId }) {
      if (phase !== 'assign') throw new Error(`gamble mimo fázi assign (fáze: ${phase}).`);
      if (situ.gambleUsed) throw new Error('Gamble už byl v této situaci použit.');
      if (characters.some((c) => hasEfekt(c, 'lock_gamble'))) {
        throw new Error('Gamble je zablokován postihem (lock_gamble).');
      }
      const owner = findCharacter(handOwnerId);
      if (owner.ruka.length === 0) throw new Error(`Ruka „${handOwnerId}" je prázdná — není z čeho líznout.`);
      const zbyvajici = owner.ruka.length;
      const tazenaIdx = rng.int(zbyvajici);
      const tazena = owner.ruka.splice(tazenaIdx, 1)[0];
      const ci = situ.committed.findIndex((c) => c.karta.id === replacedCardId);
      if (ci < 0) throw new Error(`Karta „${replacedCardId}" není mezi committnutými.`);
      const nahrazena = situ.committed[ci].karta;
      // Gamble přepisuje i VLASTNICTVÍ slotu — nahrazená karta se už nikdy
      // nevyhodnotí, takže původní vlastník slot ztrácí. Bez téhle atribuce
      // by ztracený slot nebyl v logu nikde a metrika `sloty_vlastnika_celkem`
      // by šla obejít („nech odgamblovat moji odsouzenou kartu").
      const nahrazenaHracId = situ.committed[ci].hrac_id;
      discardPile.push(nahrazena);
      situ.committed[ci] = { hrac_id: handOwnerId, karta: tazena };
      situ.gambleUsed = true;
      log.append(EVENT.GAMBLE, nodeSeq, {
        ci_ruka: handOwnerId,
        zbyvajici_v_ruce: zbyvajici,
        tazena: tazena.id,
        nahrazena: nahrazena.id,
        nahrazena_hrac_id: nahrazenaHracId,
        do_slotu: null,
      });
    },

    assignToSlots(list) {
      if (phase !== 'assign') throw new Error(`assignToSlots mimo fázi assign (fáze: ${phase}).`);
      // Přiřazuje se tolik, kolik je committnutých karet (méně než 4 při složení).
      if (!Array.isArray(list) || list.length !== situ.committed.length) {
        throw new Error(`assignToSlots: očekávám přesně ${situ.committed.length} přiřazení (dostal ${list?.length}).`);
      }
      const sloty = new Set();
      const karty = new Set();
      const prirazeni = list.map(({ slotIndex, cardId }) => {
        if (sloty.has(slotIndex)) throw new Error(`Slot ${slotIndex} přiřazen dvakrát.`);
        if (karty.has(cardId)) throw new Error(`Karta „${cardId}" přiřazena dvakrát.`);
        sloty.add(slotIndex);
        karty.add(cardId);
        const commit = situ.committed.find((c) => c.karta.id === cardId);
        if (!commit) throw new Error(`Karta „${cardId}" není mezi committnutými.`);
        return { slot_index: slotIndex, karta_id: cardId, hrac_id: commit.hrac_id };
      });
      situ.assignment = prirazeni;
      log.append(EVENT.ASSIGNMENT, nodeSeq, {
        prirazeni,
        navrhl: prirazeni[0]?.hrac_id ?? null,
        souhlasili: [...new Set(prirazeni.map((p) => p.hrac_id))],
        pocet_preskladani: 0,
      });
      phase = 'confirm';
    },

    confirmNode() {
      if (phase !== 'confirm') throw new Error(`confirmNode mimo fázi confirm (fáze: ${phase}).`);
      resolveSituation();
    },
  };
}
