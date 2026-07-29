// @ts-check
/**
 * Text situace se 4 mezerami — rozklad a plnění (fáze 2.2).
 *
 * `obsah/situace.yaml` má u každé situace pole `text:` — próza s přesně čtyřmi
 * mezerami `{VEC}`, které se plní názvy zahraných věcí **v pořadí slotů**
 * (schéma v hlavičce toho souboru, design §4.3). Volně mezi nimi stojí `{kdo}`
 * = jednající osoba; váže se na **nejbližší následující mezeru**, protože právě
 * ta určuje, čí kartu tam tým dal. Autor smí `{kdo}` u mezery vynechat (skryté
 * role typu „kdyby přituhlo, čekala pod plachtou {VEC}" nemají jednajícího) —
 * pak se jednající NEDOMÝŠLÍ.
 *
 * Čistý modul bez DOM a bez herní logiky (architektura §2.4), obdoba
 * `protocol-fill.js`: dostane text a mapu přiřazení, vrátí úseky nebo hotový
 * řetězec. Engine se nedotýká — text je autorský obsah.
 *
 * Kontrakt {kdo} (CLAUDE.md, stejný jako {jmeno} v protokolu): dosazuje se
 * PŘÍJMENÍ postavy, ať UI i protokol drží stejný registr („Bartoš").
 */
import { prijmeni } from './protocol-fill.js';

/** Znak nedoplněné mezery — v prose i v razítkovém výsledku stejný. */
export const MEZERA = '____';

/**
 * Autorský text situace podle id, jak ho zná engine.
 *
 * Vložená setkání (léčka/konfrontace) nejsou v poolu `situace.yaml`, ale
 * u pronásledovatele — engine jim dává id `${pronasledovatel.id}-lecka` /
 * `-konfrontace` (`state.js` `startSituation`), stejně jako u názvů míst
 * (`nazevSituace` v `commit.js`/`assign.js`). Bez druhé větve by na nich
 * próza situace zmizela.
 *
 * @param {{situace?: {id: string, text?: string}[],
 *   pronasledovatele?: {id: string, lecka?: {text?: string},
 *     konfrontace?: {text?: string}}[]} [content]
 * @param {string} situaceId
 * @returns {string|null} null = obsah text nemá (nikdy ne syrové id)
 */
export function textSituace(content, situaceId) {
  const zPoolu = content?.situace?.find((s) => s.id === situaceId)?.text;
  if (zPoolu) return zPoolu;
  for (const p of content?.pronasledovatele ?? []) {
    if (situaceId === `${p.id}-lecka`) return p.lecka?.text ?? null;
    if (situaceId === `${p.id}-konfrontace`) return p.konfrontace?.text ?? null;
  }
  return null;
}

/**
 * @typedef {{typ: 'text', hodnota: string}
 *   | {typ: 'vec', slot: number}
 *   | {typ: 'kdo', slot: number}} Usek
 */

/**
 * Rozloží autorský text na úseky prózy, mezer `{VEC}` a jednajících `{kdo}`.
 *
 * Mezery se číslují v pořadí výskytu — to JE index slotu (invariant schématu,
 * hlídá ho test nad reálným obsahem). `{kdo}` bez následující mezery se
 * zahodí: neexistuje slot, ze kterého by se dala určit osoba.
 *
 * @param {string} text pole `text` situace (YAML folded skalár)
 * @returns {Usek[]}
 */
export function rozlozText(text) {
  /** @type {Usek[]} */
  const useky = [];
  let slot = 0;
  let posledni = 0;
  const re = /\{VEC\}|\{kdo\}/g;
  const zdroj = String(text ?? '').trim();

  for (let m = re.exec(zdroj); m !== null; m = re.exec(zdroj)) {
    if (m.index > posledni) useky.push({ typ: 'text', hodnota: zdroj.slice(posledni, m.index) });
    posledni = m.index + m[0].length;
    if (m[0] === '{VEC}') useky.push({ typ: 'vec', slot: slot++ });
    else useky.push({ typ: 'kdo', slot: -1 }); // slot doplní druhý průchod
  }
  if (posledni < zdroj.length) useky.push({ typ: 'text', hodnota: zdroj.slice(posledni) });

  // Druhý průchod odzadu: každý {kdo} dostane slot nejbližší mezery ZA sebou.
  let nasledujici = -1;
  for (let i = useky.length - 1; i >= 0; i--) {
    const u = useky[i];
    if (u.typ === 'vec') nasledujici = u.slot;
    else if (u.typ === 'kdo') {
      if (nasledujici < 0) useky.splice(i, 1);
      else u.slot = nasledujici;
    }
  }
  return useky;
}

/**
 * Doplní text hotovými hodnotami — pro obrazovku výsledku (a pro testy).
 * Interaktivní verzi (klikatelné mezery) si `assign.js` skládá z `rozlozText`.
 *
 * @param {string} text
 * @param {{veci?: Record<number, string|null|undefined>,
 *   jmena?: Record<number, string|null|undefined>}} prirazeni
 *   slot → název věci / celé jméno vlastníka (příjmení si vezme funkce sama)
 * @returns {string}
 */
export function doplnText(text, { veci = {}, jmena = {} } = {}) {
  return rozlozText(text)
    .map((u) => {
      if (u.typ === 'text') return u.hodnota;
      if (u.typ === 'vec') return veci[u.slot] ? `„${veci[u.slot]}"` : MEZERA;
      return jmena[u.slot] ? prijmeni(String(jmena[u.slot])) : MEZERA;
    })
    .join('');
}
