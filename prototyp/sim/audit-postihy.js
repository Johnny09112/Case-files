/**
 * Přímá sonda: vynucuje engine zámkové postihy? (D34/N1)
 *
 * Do 2026-07-27 NE — `lock_stitek` a `lock_slot_viditelnost` byly no-opy
 * (sonda tehdy naměřila 840 + 1716 tichých porušení). Od opravy je operacionalizace
 * AUTO-FAIL: přiřazení se nezakazuje (u 1p by nemuselo existovat legální
 * rozdělení), ale slot padne s důvodem `postih_lock_*`.
 *
 * Sonda proto hlídá REGRESI: každé přiřazení karty pod aktivním zámkem musí být
 * označené odpovídajícím důvodem. Nenulové „TICHÝCH PORUŠENÍ" = postih se zase
 * někde ztratil.
 *
 * Použití: `node sim/audit-postihy.js`.
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
        // „Složení" maže LEHKÉ postihy bez události penalty_expired (state.js
        // foldCharacter) — bez tohohle by sonda hlásila falešná porušení.
        if (e.type === 'character_folded') for (const id of e.smazane_lehke ?? []) uber(e.hrac_id, id);
        if (e.type === 'situation_revealed') slotyUzlu.set(e.nodeIndex, e.sloty);
        if (e.type === 'slot_resolved' && e.hrac_id) {
          const aktivni = zamky.get(e.hrac_id) ?? [];
          if (aktivni.length === 0) continue;
          uzluSLockem += 1;
          for (const z of aktivni) {
            const dotcenoStitkem = z.efekt.druh === 'lock_stitek' && (e.stitky ?? []).includes(z.efekt.stitek);
            const dotcenoViditelnosti = z.efekt.druh === 'lock_slot_viditelnost' && e.viditelnost === z.efekt.viditelnost;
            // Zámek musí být VIDĚT ve výsledku slotu. Pozor na pořadí pravidel:
            // štítek se vyhodnocuje dřív, takže `lock_slot_viditelnost` může být
            // přebité `lock_stitek` — to je korektní, ne tiché porušení.
            const oznaceno = e.postih_efekt != null;
            if (dotcenoStitkem && e.postih_efekt !== 'lock_stitek') porusenoStitek += 1;
            if (dotcenoViditelnosti && !oznaceno) porusenoViditelnost += 1;
          }
        }
      }
    }
  }
}

console.log(`slot_resolved u hráče s aktivním zámkovým postihem: ${uzluSLockem}`);
console.log(`TICHÁ PORUŠENÍ lock_stitek (zamčená karta zahrána bez označení): ${porusenoStitek}`);
console.log(`TICHÁ PORUŠENÍ lock_slot_viditelnost (zamčená viditelnost bez označení): ${porusenoViditelnost}`);
console.log(porusenoStitek + porusenoViditelnost > 0
  ? 'ZÁVĚR: REGRESE — engine zámkové postihy někde nevynucuje.'
  : 'ZÁVĚR: engine zámkové postihy vynucuje (každý dotčený slot nese postih_efekt).');
