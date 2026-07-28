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
import { load } from 'js-yaml';

import { parseContent } from '../content/loader.js';
import { RULES } from '../engine/rules.js';
import { createRun } from '../engine/state.js';
import { EVENT } from '../engine/events.js';

import { createVyberSablon, zapisSituace, zapisFinale, opravUvozovkySablon } from './protocol-fill.js';
import { vysvetli, ctxZObsahu } from './vysvetleni.js';
import { obrazovkaSetup } from './screens/setup.js';
import { obrazovkaRun } from './screens/run/index.js';
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
  const sablony = load(opravUvozovkySablon(sablonyYaml)).sablony;

  const S = novyStav();

  function novyStav() {
    return {
      obrazovka: /** @type {'setup'|'run'|'konec'} */ ('setup'),
      setup: { pocet: 2, vybrane: /** @type {string[]} */ ([]), seedText: '' },
      /** @type {ReturnType<typeof createRun>|null} */ run: null,
      /** @type {number|null} */ seed: null,
      /** @type {Record<string, string>} */ jmena: {},
      vyber: createVyberSablon(sablony, Math.random),
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
      /** Assign: co je vybráno a co kam přiřazeno. */
      assignVyber: { karta: /** @type {string|null} */ (null), sloty: /** @type {Record<number, string>} */ ({}) },
      /** @type {any|null} */ konec: null,
      finaleVyklepano: false,
    };
  }

  /** Nasype nové události do bufferu uzlu a přepočítá anotace. */
  function sync() {
    if (!S.run) return;
    S.udalosti = S.run.getEvents();
    S.anotace = vysvetli(S.udalosti, ctxZObsahu(content, S.jmena));
    for (const u of S.udalosti) {
      if (u.seq <= S.lastSeq) continue;
      S.lastSeq = u.seq;
      // Uzel bez resoluce (mapa, motel, truhla) sekci protokolu nedělá — jakmile
      // přijde událost jiného uzlu, starý buffer se zahodí.
      if (S.bufferUzlu.length > 0 && S.bufferUzlu[0].nodeIndex !== u.nodeIndex) S.bufferUzlu = [];
      S.bufferUzlu.push(u);
      if (u.type === EVENT.RUN_ENDED) {
        S.konec = u;
        S.protokol.push({ cislo: null, titulek: u.vysledek === 'DORUCENO' ? 'Uzavření spisu — DORUČENO' : 'Odložení spisu — NEVYŘEŠENO', odstavce: zapisFinale(u, S.vyber) });
      }
    }
  }

  /**
   * Řez uzlu: až doběhne celá resoluce (band_resolved + důsledky), složí sekci
   * protokolu a strčí ji do fronty výsledků. Volá se PO příkazu, ne uvnitř
   * `sync` — postihy a Žár se logují až za `band_resolved`, a kdyby se řezalo
   * na ní, odstavec by o postihu nevěděl.
   */
  function flushUzel() {
    const udalosti = S.bufferUzlu;
    if (!udalosti.some((u) => u.type === EVENT.BAND_RESOLVED)) return;
    const ctxProtokolu = ctxZObsahu(content, S.jmena);
    const sekce = {
      cislo: S.protokol.length + 1,
      titulek: ctxProtokolu.situace[udalosti.find((u) => u.type === EVENT.SITUATION_REVEALED)?.situace_id] ?? `uzel ${udalosti[0].nodeIndex}`,
      odstavce: zapisSituace(udalosti, ctxProtokolu, S.vyber),
    };
    S.protokol.push(sekce);
    S.fronta.push({ nodeIndex: udalosti[0].nodeIndex, udalosti, sekce, vyklepano: false });
    S.bufferUzlu = [];
  }

  /** Obal příkazu enginu: provede, synchronizuje log, uzavře uzel, překreslí. */
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
    otevriSpis() {
      const zadany = S.setup.seedText.trim();
      S.seed = zadany === '' ? Math.floor(Math.random() * 0xffffffff) : Number(zadany) >>> 0;
      const players = S.setup.vybrane.map((id) => {
        const p = content.postavy.find((/** @type {any} */ x) => x.id === id);
        return { id: p.id, jmeno: p.jmeno };
      });
      S.jmena = Object.fromEntries(players.map((p) => [p.id, p.jmeno]));
      S.run = createRun({ seed: S.seed, content, rules: RULES, players });
      S.obrazovka = 'run';
      S.briefing = true;
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
    commitni() {
      const list = Object.entries(S.commitVyber).flatMap(([characterId, karty]) =>
        karty.map((cardId) => ({ characterId, cardId }))
      );
      prikaz(() => {
        S.run.commitCards(list);
        S.commitVyber = {};
        S.assignVyber = { karta: null, sloty: {} };
      });
    },

    /* --- assign a gamble --- */
    vyberKartu(/** @type {string} */ kartaId) {
      S.assignVyber.karta = S.assignVyber.karta === kartaId ? null : kartaId;
      render();
    },
    prirad(/** @type {number} */ slotIndex) {
      if (!S.assignVyber.karta) return;
      S.assignVyber.sloty[slotIndex] = S.assignVyber.karta;
      S.assignVyber.karta = null;
      render();
    },
    zrusPrirazeni(/** @type {number} */ slotIndex) {
      delete S.assignVyber.sloty[slotIndex];
      render();
    },
    gambluj(/** @type {string} */ hracId, /** @type {string} */ kartaId) {
      prikaz(() => {
        S.run.gamble({ handOwnerId: hracId, replacedCardId: kartaId });
        // Vyměněná věc už ve slotech být nesmí — přiřazení se resetuje.
        S.assignVyber = { karta: null, sloty: {} };
      });
    },
    vyhodnot() {
      const list = Object.entries(S.assignVyber.sloty).map(([slotIndex, cardId]) => ({ slotIndex: Number(slotIndex), cardId }));
      prikaz(() => {
        S.run.assignToSlots(list);
        S.run.confirmNode();
        S.assignVyber = { karta: null, sloty: {} };
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
