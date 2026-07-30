// @ts-check
/**
 * Sdílené textové primitivy protokolu — dosazení placeholderů a kontrakt
 * `{jmeno}`. Vlastní modul proto, že je používá jak pásmová vrstva
 * (`protocol-fill.js`), tak fragmentová (`protocol-fragments.js`), a ty dvě se
 * navzájem importují; bez tohohle modulu by vznikl cyklus.
 *
 * Bez DOM, bez herní logiky (architektura §2.4).
 */

/**
 * Příjmení = poslední slovo celého jména („Vincenc Bartoš" → „Bartoš").
 * Kontrakt `{jmeno}` z prototyp/CLAUDE.md: do protokolů se dosazuje PŘÍJMENÍ,
 * aby fallback i AI držely stejný úřední registr („podezřelý Bartoš").
 * @param {string} celeJmeno
 */
export function prijmeni(celeJmeno) {
  const slova = String(celeJmeno).trim().split(/\s+/);
  return slova[slova.length - 1];
}

/**
 * Dosadí hodnoty do placeholderů {klic}. Neznámé placeholdery nechává být
 * (šablona smí zmínit jen to, co jí `podminka` zaručuje — chybějící hodnota
 * je chyba šablony, ne dosazení).
 * @param {string} text
 * @param {Record<string, string|number>} hodnoty
 */
export function dosad(text, hodnoty) {
  return text.replace(/\{(\w+)\}/g, (cely, klic) =>
    klic in hodnoty ? String(hodnoty[klic]) : cely
  );
}
