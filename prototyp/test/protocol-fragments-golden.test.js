// @ts-check
/**
 * Golden fallback protokol nad REÁLNÝM runem (D54(1)).
 *
 * Fixture `technika/woz-run-2026-07-30.jsonl` je log runu, ze kterého vznikl WoZ
 * test (D53) — tedy přesně ta cesta, kterou už jeden člověk odehrál a přečetl.
 * Snapshot chytá drift mezi FRAGMENTY a jejich složením stejně, jako golden runy
 * chytají drift enginu: když se protokol změní, commit message musí říct proč.
 *
 * Testuje se PLNÁ cesta: pásmová vrstva + fragmentová vrstva, deterministicky
 * (šablony i fragmenty se vybírají bez `Math.random`).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { load } from 'js-yaml';
import { parseContent } from '../src/content/loader.js';
import { EVENT } from '../src/engine/events.js';
import { createVyberSablon, zapisSituace, zapisFinale } from '../src/ui/protocol-fill.js';
import { createVyberFragmentu } from '../src/ui/protocol-fragments.js';
import { ctxZObsahu } from '../src/ui/vysvetleni.js';
import { loadRealYaml } from './content.test.js';

const CESTA_FRAGMENTU = new URL('../../prompty/fallback-fragmenty.yaml', import.meta.url);
const MA_FRAGMENTY = fs.existsSync(CESTA_FRAGMENTU);

const content = parseContent(loadRealYaml());
const sablony = load(
  fs.readFileSync(new URL('../../prompty/fallback-sablony.yaml', import.meta.url), 'utf8')
).sablony;
const fragmenty = MA_FRAGMENTY
  ? load(fs.readFileSync(CESTA_FRAGMENTU, 'utf8')).fragmenty
  : [];

/** Log runu z fixture (JSONL, jedna událost na řádek). */
function udalostiFixture() {
  const cesta = new URL('../../technika/woz-run-2026-07-30.jsonl', import.meta.url);
  return fs
    .readFileSync(cesta, 'utf8')
    .split('\n')
    .filter((r) => r.trim() !== '')
    .map((r) => JSON.parse(r));
}

/**
 * Složí celý fallback spis runu. `vyberFragmentu === null` = dnešní chování
 * (jen pásmová vrstva), jinak plná fragmentová vrstva.
 */
function spis(udalosti, vyberFragmentu) {
  const seed = udalosti.find((u) => u.type === EVENT.RUN_STARTED)?.seed ?? 0;
  const jmena = Object.fromEntries(content.postavy.map((/** @type {any} */ p) => [p.id, p.jmeno]));
  const ctx = { ...ctxZObsahu(content, jmena), seed };
  // Deterministické losování pásmových šablon: pevná posloupnost místo
  // Math.random, aby snapshot nezávisel na náhodě UI vrstvy.
  let i = 0;
  const vyber = createVyberSablon(sablony, () => [0.13, 0.61, 0.37, 0.88, 0.05][i++ % 5]);

  /** @type {{titulek: string, odstavce: string[]}[]} */
  const sekce = [];
  /** @type {object[]} */
  let buffer = [];
  const rez = () => {
    if (!buffer.some((u) => u.type === EVENT.BAND_RESOLVED)) return;
    const odhaleni = buffer.find((u) => u.type === EVENT.SITUATION_REVEALED);
    sekce.push({
      titulek: ctx.situace[odhaleni?.situace_id] ?? `uzel ${buffer[0].nodeIndex}`,
      odstavce: zapisSituace(buffer, ctx, vyber, vyberFragmentu ?? undefined),
    });
  };

  for (const u of udalosti) {
    if (buffer.length > 0 && buffer[0].nodeIndex !== u.nodeIndex) {
      rez();
      buffer = [];
    }
    if (u.type === EVENT.RUN_ENDED) {
      rez();
      buffer = [];
      sekce.push({ titulek: `Uzavření spisu — ${u.vysledek}`, odstavce: zapisFinale(u, vyber) });
      continue;
    }
    buffer.push(u);
  }
  rez();
  return sekce;
}

describe('golden fallback protokol nad runem WoZ testu', () => {
  const udalosti = udalostiFixture();

  it('dnešní pásmová vrstva (kontrolní rameno bez fragmentů)', () => {
    expect(spis(udalosti, null)).toMatchSnapshot();
  });

  it.skipIf(!MA_FRAGMENTY)('s fragmentovou vrstvou', () => {
    expect(spis(udalosti, createVyberFragmentu(fragmenty, 1))).toMatchSnapshot();
  });

  it.skipIf(!MA_FRAGMENTY)('žádný odstavec runu nenechá nedosazený placeholder', () => {
    for (const { odstavce } of spis(udalosti, createVyberFragmentu(fragmenty, 1))) {
      for (const o of odstavce) expect(o).not.toMatch(/\{\w+\}/);
    }
  });

  it.skipIf(!MA_FRAGMENTY)('každý vyhodnocený slot runu dostane větu (podlaha D54(1))', () => {
    // Kritérium podlahy: hráč po uzlu umí říct, co ta věc v té roli dělala.
    // Měřitelně: pro každý `slot_resolved` runu existuje pokrytá přihrádka.
    const vyber = createVyberFragmentu(fragmenty, 1);
    for (const u of udalosti.filter((x) => x.type === EVENT.SLOT_RESOLVED)) {
      expect(vyber(u.duvod, u.stat, `${u.seq}`), `slot seq ${u.seq}, důvod ${u.duvod}`).not.toBeNull();
    }
  });

  it.skipIf(!MA_FRAGMENTY)('fragmentová vrstva přidá odstavec ke každé situaci runu', () => {
    const bez = spis(udalosti, null);
    const s = spis(udalosti, createVyberFragmentu(fragmenty, 1));
    for (let i = 0; i < bez.length; i += 1) {
      if (bez[i].titulek.startsWith('Uzavření')) continue;
      expect(s[i].odstavce.length, s[i].titulek).toBeGreaterThan(bez[i].odstavce.length);
    }
  });
});
