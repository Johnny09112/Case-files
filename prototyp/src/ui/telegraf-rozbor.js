// @ts-check
/**
 * Mechanický rozbor telegrafu — „co z toho plyne" (D47 + D48).
 *
 * Do fáze 2.2 svítil pod každým telegrafem výčet všech kanálů plnými jmény
 * statů. Kritik (nález K-1, D47) ukázal, že tím byla atmosférická inference
 * z prózy vždycky zrušena o řádek níž — próza nikdy nebyla jediný nositel
 * informace. Uživatel proto rozhodl: **řádek je nativně skrytý**.
 *
 * Zapnout se dá jako ULEHČENÍ, ne jako nastavení zobrazení: při dokonalém
 * čtení signálu (= řádek trvale na očích) jde 4p win-rate na 86,8 % proti
 * stropu K1 70 % (§13.2 návrhu invariantu). Je to EASY režim a v UI se tak
 * musí jmenovat — kolonka volitelné obtížnosti (D25d), kam tenhle přepínač
 * výhledově patří celý.
 *
 * Onboarding (D48/2): na PRVNÍM uzlu prvního runu se řádek ukáže i bez
 * ulehčení, ať se hráč nemusí učit, co ta slova znamenají, ztrátou prvního
 * uzlu. Dál už ne.
 *
 * Čistý modul bez DOM (architektura §2.4) — „kdy je řádek vidět" je pravidlo,
 * ne kosmetika, takže se testuje odděleně od renderu.
 */
import { STAT_LABEL } from './labels.js';

/**
 * @typedef {{viditelny: boolean, prepinac: boolean, poznamka: boolean}} StavRozboru
 *   `viditelny` = vypsat řádek · `prepinac` = nabídnout rozklik ·
 *   `poznamka` = přiznat, že je to jednorázová ukázka
 */

/**
 * Rozhodne, co se z rozboru na commit obrazovce ukáže.
 *
 * Se zapnutým ulehčením onboarding jen otevře rozklik — poznámku „vidíte to
 * naposledy" tam vydat nesmí, protože by lhala (řádek zůstává k dispozici).
 *
 * @param {{ulehceni?: boolean, onboarding?: boolean, otevreno?: boolean}} [volby]
 * @returns {StavRozboru}
 */
export function stavRozboru({ ulehceni = false, onboarding = false, otevreno = false } = {}) {
  if (ulehceni) return { viditelny: otevreno || onboarding, prepinac: true, poznamka: false };
  return { viditelny: onboarding, prepinac: false, poznamka: onboarding };
}

/**
 * Odvozený signál telegrafu do jedné věty (engine ho derivuje ze slotů,
 * `deriveTelegrafSignal`). Přesun z `screens/run/commit.js` beze změny
 * chování — tady je pod testem, protože je to obsah EASY režimu.
 *
 * @param {{trend?: {stat: string|string[]}[], proti_srsti?: number,
 *   zbran_projde?: string, zbran_skryte?: boolean, improv_skryte?: boolean,
 *   zbran_slot_vyjimka?: boolean}|null} [signal]
 * @returns {string}
 */
export function popisSignalu(signal) {
  if (!signal) return '';
  const staty = (signal.trend ?? []).map((t) =>
    Array.isArray(t.stat) ? t.stat.map((s) => STAT_LABEL[s] ?? s).join('+') : (STAT_LABEL[t.stat] ?? t.stat)
  );
  return [
    `viditelné role: ${staty.join(', ') || 'žádné'}`,
    `skrytých rolí: ${signal.proti_srsti}`,
    signal.zbran_projde === 'ano' ? 'zbraň projde i na očích' : 'zbraň na očích neprojde',
    signal.zbran_skryte ? 've skryté roli se zbraň vyplatí' : null,
    signal.improv_skryte ? 'skrytá role stojí na improvizaci' : null,
    signal.zbran_slot_vyjimka ? 'jedna role zbraň přímo vítá' : null,
  ].filter(Boolean).join(' · ');
}
