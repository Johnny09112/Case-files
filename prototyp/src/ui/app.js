// @ts-check
/**
 * Řízení obrazovek hot-seat UI v3 (architektura §2.4, §6): UI je nejtenčí
 * vrstva — drží jen stav PREZENTACE (jaká obrazovka, co je vybráno, co už bylo
 * vyklepáno), veškerý herní stav žije v enginu a UI je re-render nad jeho
 * snapshotem.
 *
 * Náhoda v UI vrstvě (seed bez zadání, losování šablon) smí používat
 * Math.random — deterministický musí být jen engine (ADR-002).
 */
import veciYaml from '../../../obsah/veci.yaml?raw';
import situaceYaml from '../../../obsah/situace.yaml?raw';
import postihyYaml from '../../../obsah/postihy.yaml?raw';
import mistaYaml from '../../../obsah/mista.yaml?raw';
import stitkyYaml from '../../../obsah/stitky.yaml?raw';
import pronasledovateleYaml from '../../../obsah/pronasledovatele.yaml?raw';
import cileYaml from '../../../obsah/cile.yaml?raw';
import postavyYaml from '../../../obsah/postavy.yaml?raw';
import sablonyYaml from '../../../prompty/fallback-sablony.yaml?raw';
import fragmentyYaml from '../../../prompty/fallback-fragmenty.yaml?raw';
import { load } from 'js-yaml';

import { parseContent } from '../content/loader.js';
import { RULES } from '../engine/rules.js';
import { createRun } from '../engine/state.js';
import { EVENT } from '../engine/events.js';

import { createVyberSablon, zapisSituace, zapisFinale } from './protocol-fill.js';
import { createVyberFragmentu } from './protocol-fragments.js';
import { vysvetli, ctxZObsahu } from './vysvetleni.js';
import { createAdapter } from '../llm/adapter.js';
import { createProvider } from '../llm/providers/index.js';
import { createCache } from '../llm/cache.js';
import { createLog } from '../llm/log.js';
import { llmCtxZObsahu } from '../llm/prompt.js';
import { obrazovkaSetup } from './screens/setup.js';
import { obrazovkaRun } from './screens/run/index.js';
import { aktivniSlotIndex, slotyPoGamblu } from './screens/run/assign.js';
import { obrazovkaKonec } from './screens/end.js';
import { h } from './dom.js';

/** @param {HTMLElement} root */
export function initApp(root) {
  const content = parseContent({
    veci: veciYaml,
    situace: situaceYaml,
    postihy: postihyYaml,
    mista: mistaYaml,
    stitky: stitkyYaml,
    pronasledovatele: pronasledovateleYaml,
    cile: cileYaml,
    postavy: postavyYaml,
  });
  const sablony = load(sablonyYaml).sablony;
  const fragmenty = load(fragmentyYaml).fragmenty;

  /**
   * LLM adaptér (fáze 3, architektura §2.3, ADR-004) — vzniká JEDNOU za
   * relaci (ne za run), ať cache a log sbírají hit-rate napříč runy. Bez
   * `VITE_ANTHROPIC_API_KEY` je `provider` `null` a adaptér VŽDY generuje
   * fallbackem — hra je bez klíče plně hratelná (nikde se to nekontroluje
   * podmínkou navíc, spadá to samo z chování adaptéru).
   *
   * `fallback` předaný sem NENÍ skutečná šablonová vrstva — ta už běží
   * SYNCHRONNĚ ve `flushUzel()` (fragmentový/pásmový fallback, D54) a hráč ji
   * vidí okamžitě, beze změny proti stavu před touto fází. Adaptér svůj
   * `fallback` použije jen interně, když provider selže/chybí/timeoutuje;
   * volající (`pokusOAdaptaci` níže) jeho návratovou hodnotu nikdy nečte —
   * zajímá ho jen `zdroj === 'llm' | 'cache'` (kdy je co vyměnit).
   */
  const llmProvider = createProvider();
  const llmCache = createCache();
  const llmLog = createLog();
  const llmAdapter = createAdapter({
    provider: llmProvider,
    fallback: () => '',
    cache: llmCache,
    log: llmLog,
  });

  const S = novyStav();

  /**
   * Onboarding rozboru telegrafu (D48/2) se spotřebuje jednou za relaci, ne
   * jednou za run — proto stojí MIMO `novyStav()`, který `novyRun()` přepisuje.
   * Kdo si zahraje druhý run, už umí telegraf číst a nemá dostat EASY první
   * uzel zadarmo.
   */
  let onboardingSpotrebovan = false;

  function novyStav() {
    return {
      obrazovka: /** @type {'setup'|'run'|'konec'} */ ('setup'),
      setup: { pocet: 2, vybrane: /** @type {string[]} */ ([]), seedText: '', ulehceni: false },
      /** @type {ReturnType<typeof createRun>|null} */ run: null,
      /** @type {number|null} */ seed: null,
      /** Ulehčení zvolené pro tenhle run (rozbor telegrafu na rozklik, D47). */
      ulehceni: false,
      /** Rozbor rozkliknutý na aktuálním uzlu — resetuje se s každým commitem. */
      rozborOtevren: false,
      /** Jednorázová onboarding ukázka rozboru (první uzel prvního runu). */
      onboardingRozbor: false,
      /** @type {Record<string, string>} */ jmena: {},
      vyber: createVyberSablon(sablony, Math.random),
      /**
       * Fragmentová vrstva (D54(1)) — na rozdíl od pásmové NELOSUJE: seed runu
       * ji plně určuje, takže týž spis se dá znovu přečíst i reprodukovat
       * z exportovaného logu. Přeseeduje se v `otevriSpis()`, až je seed znám.
       */
      vyberFragmentu: createVyberFragmentu(fragmenty, 0),
      /** Kompletní log (pro obrazovky, které hledají událost podle seq). */
      udalosti: /** @type {object[]} */ ([]),
      /** Anotace vysvětlující vrstvy: seq → Anotace[]. */
      anotace: /** @type {Map<number, object[]>} */ (new Map()),
      /** Hotové sekce protokolu: {cislo, titulek, odstavce[]}. */
      protokol: /** @type {any[]} */ ([]),
      /** Fronta výsledků k zobrazení: {nodeIndex, udalosti, sekce, vyklepano}. */
      fronta: /** @type {any[]} */ ([]),
      /** Události rozpracovaného uzlu (řez dělá band_resolved, viz flushUzel). */
      bufferUzlu: /** @type {object[]} */ ([]),
      lastSeq: 0,
      briefing: false,
      /** @type {string|null} */ odkrytyCil: null,
      /** Commit: hrac_id → vybraná id karet. */
      commitVyber: /** @type {Record<string, string[]>} */ ({}),
      /**
       * Assign: aktivní mezera (fáze 2.3 — `null` = auto, viz
       * `aktivniSlotIndex` v `assign.js`) a co kam přiřazeno.
       */
      assignVyber: { aktivni: /** @type {number|null} */ (null), sloty: /** @type {Record<number, string>} */ ({}) },
      /** @type {any|null} */ konec: null,
      finaleVyklepano: false,
    };
  }

  /** Nasype nové události do bufferu uzlu a přepočítá anotace. */
  function sync() {
    if (!S.run) return;
    S.udalosti = S.run.getEvents();
    S.anotace = vysvetli(S.udalosti, ctxZObsahu(content, S.jmena, RULES));
    for (const u of S.udalosti) {
      if (u.seq <= S.lastSeq) continue;
      S.lastSeq = u.seq;
      // Hranice uzlu: po `confirmNode()` umí engine ve STEJNÉM příkazu stihnout
      // nakročit do dalšího uzlu (finishSituation → nextStep → offerRoutes),
      // takže událost jiného nodeIndexu může dorazit dřív, než se k rozpracované
      // situaci dostane `flushUzel()` volané až po příkazu (viz `prikaz()`).
      // Uzel proto zkus uzavřít TEĎ (řez uvnitř `flushUzel()` proběhne, jen
      // když v bufferu je `band_resolved`) a teprve pak buffer zahoď — pro
      // uzly bez resoluce (mapa, motel, truhla) `flushUzel()` nic neudělá,
      // takže výslovné vyprázdnění zůstává nutné.
      if (S.bufferUzlu.length > 0 && S.bufferUzlu[0].nodeIndex !== u.nodeIndex) {
        flushUzel();
        S.bufferUzlu = [];
      }
      if (u.type === EVENT.RUN_ENDED) {
        // `run_ended` sdílí nodeIndex s posledním uzlem (engine ho před koncem
        // běhu nezvyšuje, viz `nextStep`) — hranice o řádek výš se proto
        // nespustí a poslední uzel by jinak zůstal neuzavřený. Uzavři ho tady
        // explicitně PŘED přidáním sekce finále, ať pořadí v `S.protokol`
        // zůstane chronologické (poslední list, pak Uzavření spisu).
        flushUzel();
        S.bufferUzlu = [];
        S.konec = u;
        S.protokol.push({ cislo: null, titulek: u.vysledek === 'DORUCENO' ? 'Uzavření spisu — DORUČENO' : 'Odložení spisu — NEVYŘEŠENO', odstavce: zapisFinale(u, S.vyber) });
        continue;
      }
      S.bufferUzlu.push(u);
    }
  }

  /**
   * Řez uzlu: až doběhne celá resoluce (band_resolved + důsledky), složí sekci
   * protokolu a strčí ji do fronty výsledků. Bez `band_resolved` v bufferu je
   * no-op (uzly bez resoluce — mapa, motel, truhla — sekci nedělají) a buffer
   * NEVYPRÁZDNÍ, aby volající vždy věděl, jestli řez skutečně proběhl.
   */
  function flushUzel() {
    const udalosti = S.bufferUzlu;
    if (!udalosti.some((u) => u.type === EVENT.BAND_RESOLVED)) return;
    const ctxProtokolu = ctxZObsahu(content, S.jmena);
    const sekce = {
      cislo: S.protokol.length + 1,
      titulek: ctxProtokolu.situace[udalosti.find((u) => u.type === EVENT.SITUATION_REVEALED)?.situace_id] ?? `uzel ${udalosti[0].nodeIndex}`,
      odstavce: zapisSituace(udalosti, ctxProtokolu, S.vyber, S.vyberFragmentu),
      /** Zdroj TOHOTO odstavce pro nenápadný indikátor v hlavičce spisu. */
      zdroj: /** @type {'sablony'|'ai'} */ ('sablony'),
    };
    S.protokol.push(sekce);
    const polozka = { nodeIndex: udalosti[0].nodeIndex, udalosti, sekce, vyklepano: false };
    S.fronta.push(polozka);
    S.bufferUzlu = [];
    pokusOAdaptaci(sekce, polozka, udalosti);
  }

  /**
   * Souběžný, NEBLOKUJÍCÍ pokus o lepšího vypravěče (fáze 3, ADR-004).
   * `sekce.odstavce` už v tuhle chvíli nese hotový fallback text (viz výše) —
   * hráč ho může vidět okamžitě, psací stroj na nic nečeká. LLM odpověď
   * (~5–15 s) typicky dorazí AŽ PO tom, co hráč sekci uvidí vyklepanou
   * (`polozka.vyklepano === true`) — proto se text i indikátor v hlavičce
   * vymění bez ohledu na `vyklepano`: pokud sekce ještě čeká ve frontě na
   * psací stroj, výměna proběhne jako dřív před klepáním; pokud je už
   * vyklepaná, text se vymění naráz (bez re-klepání, žádná nová animační
   * logika) a štítek přepne na AI. Když odpověď nedorazí vůbec (bez klíče,
   * timeout, chyba), fallback zůstává beze změny a nic se nestane. Žádné
   * modály, žádná chybová hlášení.
   *
   * `sekce`/`polozka` sdílí referenci s `S.protokol`/`S.fronta` (mutace tady
   * se propíše i tam, i když `polozka` mezitím z fronty vypadla). `render()`
   * vždy staví z aktuálního `S` (viz níže), ne z téhle uzavřené reference —
   * takže i když `sekce` mezitím vypadla z `S.protokol` (hráč pokročil na
   * další uzel), mutace `sekce` samotné je neškodná a `render()` nespadne.
   */
  function pokusOAdaptaci(sekce, polozka, udalosti) {
    const ctx = llmCtxZObsahu(content, S.jmena, S.run?.getState()?.kredity);
    llmAdapter
      .generate(udalosti, ctx)
      .then((vysledek) => {
        if (vysledek.zdroj !== 'llm' && vysledek.zdroj !== 'cache') return;
        sekce.odstavce = [vysledek.text];
        sekce.zdroj = 'ai';
        render();
      })
      .catch(() => {
        // `generate()` by nikdy neměl rejectovat (viz llm-adapter.test.js) —
        // pojistka navíc jen chrání UI, kdyby to přesto nastalo.
      });
  }

  /**
   * Obal příkazu enginu: provede, synchronizuje log, uzavře uzel, překreslí.
   *
   * `sync()` už sama uzel uzavírá na hranici nodeIndexu i při `run_ended`
   * (viz komentáře tam). Tohle volání navíc zachytává případ, kdy resoluce
   * (`band_resolved`) doběhne, ale žádná událost s jiným nodeIndexem v tomtéž
   * příkazu nepřijde — typicky `nextStep()` po posledním uzlu před motelem
   * nabídne `motel_offer` BEZ logované události (na rozdíl od `offerRoutes`,
   * která loguje `map_move`). Bez téhle druhé šance by takový uzel zůstal
   * viset v bufferu neuzavřený až do příští hranice. Je to bezpečný no-op,
   * pokud `sync()` uzel už uzavřela (buffer je pak prázdný).
   */
  function prikaz(/** @type {() => void} */ fn) {
    try {
      fn();
    } catch (chyba) {
      // UI hlídá legálnost předem; sem spadne jen programátorská chyba.
      console.error(chyba);
    }
    sync();
    flushUzel();
    render();
  }

  const akce = {
    /* --- setup --- */
    zmenPocet(/** @type {number} */ n) {
      S.setup.pocet = n;
      S.setup.vybrane = S.setup.vybrane.slice(0, n);
      render();
    },
    prepniPostavu(/** @type {string} */ id) {
      const i = S.setup.vybrane.indexOf(id);
      if (i >= 0) S.setup.vybrane.splice(i, 1);
      else if (S.setup.vybrane.length < S.setup.pocet) S.setup.vybrane.push(id);
      render();
    },
    zmenSeed(/** @type {string} */ text) {
      S.setup.seedText = text;
      render();
    },
    prepniUlehceni() {
      S.setup.ulehceni = !S.setup.ulehceni;
      render();
    },
    otevriSpis() {
      const zadany = S.setup.seedText.trim();
      S.seed = zadany === '' ? Math.floor(Math.random() * 0xffffffff) : Number(zadany) >>> 0;
      const players = S.setup.vybrane.map((id) => {
        const p = content.postavy.find((/** @type {any} */ x) => x.id === id);
        return { id: p.id, jmeno: p.jmeno };
      });
      S.jmena = Object.fromEntries(players.map((p) => [p.id, p.jmeno]));
      S.vyberFragmentu = createVyberFragmentu(fragmenty, S.seed);
      S.run = createRun({ seed: S.seed, content, rules: RULES, players });
      S.obrazovka = 'run';
      S.briefing = true;
      S.ulehceni = S.setup.ulehceni;
      S.onboardingRozbor = !onboardingSpotrebovan;
      sync();
      render();
    },

    /* --- briefing --- */
    odkryjCil(/** @type {string} */ id) {
      S.odkrytyCil = S.odkrytyCil === id ? null : id;
      render();
    },
    vyraz() {
      S.briefing = false;
      S.odkrytyCil = null;
      render();
    },

    /* --- mapa a motel --- */
    zvolCestu(/** @type {string} */ ref) {
      prikaz(() => S.run.chooseRoute(ref));
    },
    motelVolba(/** @type {'ukryt'|'dal'} */ volba) {
      prikaz(() => S.run.motelChoice(volba));
    },
    zaplat(/** @type {object} */ objednavka) {
      prikaz(() => S.run.spendCredits(objednavka));
    },
    opustMotel() {
      prikaz(() => S.run.leaveMotel());
    },

    /* --- commit --- */
    prepniKartu(/** @type {string} */ hracId, /** @type {string} */ kartaId) {
      const vybrane = S.commitVyber[hracId] ?? [];
      const i = vybrane.indexOf(kartaId);
      if (i >= 0) vybrane.splice(i, 1);
      else vybrane.push(kartaId);
      S.commitVyber[hracId] = vybrane;
      render();
    },
    prepniRozbor() {
      S.rozborOtevren = !S.rozborOtevren;
      render();
    },
    commitni() {
      const list = Object.entries(S.commitVyber).flatMap(([characterId, karty]) =>
        karty.map((cardId) => ({ characterId, cardId }))
      );
      prikaz(() => {
        S.run.commitCards(list);
        S.commitVyber = {};
        S.assignVyber = { aktivni: null, sloty: {} };
        // Rozklik je rozhodnutí per uzel, ne trvalý spínač — jinak by ulehčení
        // splynulo se starým „řádek svítí pořád". A onboardingová ukázka končí
        // s prvním commitem: hráč viděl, co ta slova znamenají, dál čte prózu.
        S.rozborOtevren = false;
        if (S.onboardingRozbor) {
          S.onboardingRozbor = false;
          onboardingSpotrebovan = true;
        }
      });
    },

    /* --- assign a gamble (fáze 2.3: aktivní mezera, žádný „vyber pak přiřaď") --- */
    aktivujMezeru(/** @type {number} */ slotIndex) {
      S.assignVyber.aktivni = slotIndex;
      render();
    },
    /**
     * Přiřadí committnutou věc do PRÁVĚ aktivní mezery (nahradí, co tam
     * případně bylo — původní věc se prostě přestane objevovat v `sloty`,
     * takže se sama vrátí mezi volné) a posune ukazatel na další prázdnou
     * (`aktivni: null` = auto, spočítá `aktivniSlotIndex` při renderu).
     */
    priradVec(/** @type {string} */ kartaId) {
      const sloty = S.run.getState().situace.odhaleno?.sloty ?? [];
      const idx = aktivniSlotIndex(sloty, S.assignVyber);
      if (idx == null) return;
      S.assignVyber.sloty[idx] = kartaId;
      S.assignVyber.aktivni = null;
      render();
    },
    gambluj(/** @type {string} */ hracId, /** @type {string} */ kartaId) {
      prikaz(() => {
        S.run.gamble({ handOwnerId: hracId, replacedCardId: kartaId });
        // Jen mezera s vyměněnou kartou se uvolní (engine `gamble()` mění jen
        // tuhle jednu položku committu) — přiřazení ostatních karet zůstává,
        // ať tým nepřijde o rozdělanou práci (bug z playtestu).
        S.assignVyber.sloty = slotyPoGamblu(S.assignVyber.sloty, kartaId);
      });
    },
    vyhodnot() {
      const list = Object.entries(S.assignVyber.sloty).map(([slotIndex, cardId]) => ({ slotIndex: Number(slotIndex), cardId }));
      prikaz(() => {
        S.run.assignToSlots(list);
        S.run.confirmNode();
        S.assignVyber = { aktivni: null, sloty: {} };
      });
    },

    /* --- tok obrazovek --- */
    pokracuj() {
      S.fronta.shift();
      if (S.fronta.length === 0 && S.konec) S.obrazovka = 'konec';
      render();
    },
    novyRun() {
      Object.assign(S, novyStav());
      render();
    },

    /* --- export událostního logu (surovina lidské brány) --- */
    exportLog() {
      if (!S.run) return;
      const jsonl = S.run.getEvents().map((u) => JSON.stringify(u)).join('\n');
      const blob = new Blob([jsonl], { type: 'application/x-ndjson' });
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: `dukazni-material-run-${S.seed}.jsonl` });
      a.click();
      URL.revokeObjectURL(url);
    },
  };

  function render() {
    /** @type {HTMLElement} */
    let el;
    if (S.obrazovka === 'setup') {
      el = obrazovkaSetup({ postavy: content.postavy, setup: S.setup, akce });
    } else if (S.obrazovka === 'konec') {
      el = obrazovkaKonec({ S, content, akce });
    } else {
      el = obrazovkaRun({ S, st: S.run.getState(), content, rules: RULES, akce, anotace: S.anotace });
    }
    root.replaceChildren(el);
  }

  render();
}
