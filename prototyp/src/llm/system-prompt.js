// @ts-check
/**
 * Čistý parser systémového promptu z `prompty/protokol.md` (ADR-004) — BEZ
 * závislosti na Vite (`?raw` import). Vlastní modul proto, aby stejnou logiku
 * mohly použít i skripty běžící mimo Vite (`sim/brana-cestiny.js` přes plain
 * `node`, kam Vite-only `?raw` import shodí modul hned na importu — dřív, než
 * se stihne vyhodnotit cokoli uvnitř). `src/llm/prompt.js` (běžící pod Vite
 * i Vitest) čte soubor přes `?raw` a tuhle funkci jen zavolá; `brana-cestiny.js`
 * čte stejný soubor přes `fs.readFileSync` a volá ji identicky — jeden parser,
 * dvě cesty ke stejnému textu.
 */

/**
 * Vytáhne systémový prompt z markdownu (jediný zdroj pravdy). Parsuje první
 * ```-blok pod nadpisem „## Systémový prompt" — když se struktura souboru
 * rozbije (nadpis zmizí, blok chybí nebo je prázdný), spadne srozumitelnou
 * českou chybou místo tichého selhání na `undefined` promptu.
 * @param {string} md obsah prompty/protokol.md
 * @returns {string}
 */
export function extractSystemPrompt(md) {
  const nadpis = /^##\s*Systémový prompt/m.exec(md);
  if (!nadpis) {
    throw new Error('prompty/protokol.md: chybí nadpis „## Systémový prompt" — kontrakt promptu je rozbitý.');
  }
  const odNadpisu = md.slice(nadpis.index + nadpis[0].length);
  const blokStart = odNadpisu.indexOf('```');
  if (blokStart < 0) {
    throw new Error('prompty/protokol.md: pod nadpisem „## Systémový prompt" chybí ```-blok.');
  }
  const blokEnd = odNadpisu.indexOf('```', blokStart + 3);
  if (blokEnd < 0) {
    throw new Error('prompty/protokol.md: ```-blok systémového promptu není uzavřený.');
  }
  const telo = odNadpisu.slice(blokStart + 3, blokEnd);
  const text = telo.trim();
  if (!text) {
    throw new Error('prompty/protokol.md: systémový prompt v ```-bloku je prázdný.');
  }
  return text;
}
