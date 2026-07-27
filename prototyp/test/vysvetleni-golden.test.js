// @ts-check
/**
 * Golden anotace (§7 test 3): snapshot vysvětlující vrstvy nad runem pevného
 * seedu. Chytá drift mezi PRAVIDLEM a jeho VYSVĚTLENÍM stejně, jako golden runy
 * chytají drift enginu. Když se snapshot změní, commit message musí říct proč.
 */
import { describe, it, expect } from 'vitest';
import { parseContent } from '../src/content/loader.js';
import { RULES } from '../src/engine/rules.js';
import { playRun, PRESETY } from '../sim/run.js';
import { loadRealYaml } from './content.test.js';
import { vysvetli, ctxZObsahu } from '../src/ui/vysvetleni.js';

const content = parseContent(loadRealYaml());
const hraci = (n) => content.postavy.slice(0, n).map((p) => ({ id: p.id, jmeno: p.jmeno }));

/** Anotace jako prosté pole (Map se do snapshotu čte hůř). */
function anotaceRunu(opts) {
  const events = playRun({ content, rules: RULES, spec: PRESETY.kompetentni, ...opts });
  const mapa = vysvetli(events, ctxZObsahu(content, Object.fromEntries(opts.players.map((p) => [p.id, p.jmeno]))));
  return [...mapa.entries()].map(([seq, anotace]) => ({ seq, typ: events.find((e) => e.seq === seq).type, anotace }));
}

describe('golden anotace nad reálným obsahem', () => {
  it('seed 42, 1 hráč, Malone', () => {
    expect(anotaceRunu({ seed: 42, players: hraci(1), pronasledovatelId: 'agent-malone' })).toMatchSnapshot();
  });

  it('seed 7, 4 hráči, Brody', () => {
    expect(anotaceRunu({ seed: 7, players: hraci(4), pronasledovatelId: 'serif-brody' })).toMatchSnapshot();
  });

  it('žádná anotace nezůstane s nedosazeným id místo českého názvu', () => {
    // Situace v obsahu nemají pole `nazev` (schéma obsah/situace.yaml), takže
    // jejich label legitimně padá na syrové id — zapsaná a dočasná odchylka,
    // viz technika/faze-2.1-plan-2026-07-27.md, sekce „Odchylky od návrhu",
    // bod 3. Až situace `nazev` dostanou, tahle množina zmizí a výjimku
    // půjde smazat.
    const povoleneSituaceId = new Set(content.situace.map((s) => s.id));
    // kebab-case token (jedna pomlčka stačí, např. „rozdrcena-noha" i „zatah"
    // samotné by neprošlo jako token bez pomlčky) = nedosazené id v ctx.
    const KEBAB_RE = /[a-z]+(?:-[a-z]+)+/g;

    const zaznamy = anotaceRunu({ seed: 7, players: hraci(4), pronasledovatelId: 'serif-brody' });
    for (const { anotace } of zaznamy) {
      for (const a of anotace) {
        for (const pole of [a.veta, a.detail ?? '']) {
          for (const token of pole.match(KEBAB_RE) ?? []) {
            if (!povoleneSituaceId.has(token)) {
              throw new Error(`neočekávané syrové id "${token}" ve větě/detailu: ${pole}`);
            }
          }
        }
        expect(a.veta).not.toContain('undefined');
        expect(a.detail ?? '').not.toContain('undefined');
      }
    }
  });
});
