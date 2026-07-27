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
    const zaznamy = anotaceRunu({ seed: 7, players: hraci(4), pronasledovatelId: 'serif-brody' });
    for (const { anotace } of zaznamy) {
      for (const a of anotace) {
        // kebab-case id (např. „rozdrcena-noha") ve větě = chybějící label v ctx
        expect(a.veta).not.toMatch(/[a-z]+-[a-z]+-[a-z]+/);
        expect(a.veta).not.toContain('undefined');
        expect(a.detail ?? '').not.toContain('undefined');
      }
    }
  });
});
