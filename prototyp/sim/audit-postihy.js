/**
 * Přímá sonda: vynucuje engine zámkové/viditelnostní postihy?
 * Hrajeme runy, hlídáme uzly, kde měl hráč aktivní lock_stitek / lock_slot_viditelnost,
 * a počítáme, kolikrát engine PŘESTO přijal přiřazení, které postih zakazuje.
 *
 * Použití: `node sim/audit-postihy.js`. Nenulový výstup = postih je no-op.
 */

import { playRun, loadContent } from './run.js';
import { RULES } from '../src/engine/rules.js';

const content = loadContent();
const spec = { commit: 'informovany', assign: 'kompetentni', econ: 'adaptivni', gamble: true };

let porusenoStitek = 0;
let porusenoViditelnost = 0;
let uzluSLockem = 0;

for (const players of [1, 2, 3, 4]) {
  const hraci = content.postavy.slice(0, players).map((p) => ({ id: p.id, jmeno: p.jmeno }));
  for (const pursuer of ['agent-malone', 'serif-brody']) {
    for (let i = 0; i < 250; i++) {
      const log = playRun({ seed: 1 + i, content, rules: RULES, players: hraci, pronasledovatelId: pursuer, spec });
      /** hrac_id → Set aktivních zámkových efektů */
      const zamky = new Map();
      const pridej = (h, e) => {
        if (!zamky.has(h)) zamky.set(h, []);
        zamky.get(h).push(e);
      };
      const uber = (h, id) => {
        const l = zamky.get(h) ?? [];
        const idx = l.findIndex((x) => x.postih_id === id);
        if (idx >= 0) l.splice(idx, 1);
      };
      const slotyUzlu = new Map();
      for (const e of log) {
        if (e.type === 'penalty_added' && (e.efekt?.druh === 'lock_stitek' || e.efekt?.druh === 'lock_slot_viditelnost')) {
          pridej(e.hrac_id, { postih_id: e.postih_id, efekt: e.efekt });
        }
        if ((e.type === 'penalty_expired' || e.type === 'penalty_healed')) uber(e.hrac_id, e.postih_id);
        if (e.type === 'situation_revealed') slotyUzlu.set(e.nodeIndex, e.sloty);
        if (e.type === 'slot_resolved' && e.hrac_id) {
          const aktivni = zamky.get(e.hrac_id) ?? [];
          if (aktivni.length === 0) continue;
          uzluSLockem += 1;
          for (const z of aktivni) {
            if (z.efekt.druh === 'lock_stitek' && (e.stitky ?? []).includes(z.efekt.stitek)) porusenoStitek += 1;
            if (z.efekt.druh === 'lock_slot_viditelnost' && e.viditelnost === z.efekt.viditelnost) porusenoViditelnost += 1;
          }
        }
      }
    }
  }
}

console.log(`slot_resolved u hráče s aktivním zámkovým postihem: ${uzluSLockem}`);
console.log(`z toho PORUŠENÍ lock_stitek (zakázaná zbraň přesto přiřazena): ${porusenoStitek}`);
console.log(`z toho PORUŠENÍ lock_slot_viditelnost (zakázaná viditelnost slotu): ${porusenoViditelnost}`);
console.log(porusenoStitek + porusenoViditelnost > 0
  ? 'ZÁVĚR: engine zámkové postihy NEVYNUCUJE — jsou to no-opy.'
  : 'ZÁVĚR: engine je vynucuje (nebo se situace nevyskytla).');
