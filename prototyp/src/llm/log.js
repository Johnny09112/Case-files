// @ts-check
/**
 * JSONL logování volání LLM (architektura §2.3): jeden záznam na volání
 * {čas, klíč cache (exaktní i hrubý), prompt, raw odpověď, zdroj, latence,
 * model}. V0.1 v paměti (export tlačítkem „Exportovat logy" v UI, stejně
 * jako `S.run.getEvents()` — viz `app.js` `exportLog()`); IndexedDB/
 * localStorage je post-v0.1 rozšíření stejného rozhraní.
 *
 * BEZPEČNOST: klíč API se NIKDY nezapisuje. `record()` kopíruje jen
 * WHITELISTOVANÁ pole — i kdyby volající omylem předal `apiKey`/`headers`
 * (např. z chyby SDK), do záznamu se nedostanou.
 */

/**
 * @typedef {{cas: number, klicExakt: string|null, klicHruby: string|null,
 *   prompt: string|null, rawOdpoved: string|null,
 *   zdroj: 'llm'|'cache'|'fallback', latenceMs: number, model: string|null,
 *   duvod: string|null}} LogZaznam
 */

/**
 * @returns {{record(vstup: object): LogZaznam, all(): LogZaznam[], toJsonl(): string}}
 */
export function createLog() {
  /** @type {LogZaznam[]} */
  const zaznamy = [];
  return {
    /** @param {object} vstup — jen whitelistovaná pole se propíšou (viz LogZaznam) */
    record(vstup) {
      /** @type {LogZaznam} */
      const zaznam = {
        cas: vstup.cas,
        klicExakt: vstup.klicExakt ?? null,
        klicHruby: vstup.klicHruby ?? null,
        prompt: vstup.prompt ?? null,
        rawOdpoved: vstup.rawOdpoved ?? null,
        zdroj: vstup.zdroj,
        latenceMs: vstup.latenceMs,
        model: vstup.model ?? null,
        // Proč se zdroj stal "fallback" (usekuto_max_tokens, nevalidni_delka, ...) —
        // viz adapter.js `duvodNevalidity()`. `null` pro "llm"/"cache" (bez chyby).
        duvod: vstup.duvod ?? null,
      };
      zaznamy.push(zaznam);
      return zaznam;
    },
    all() {
      return zaznamy.slice();
    },
    toJsonl() {
      return zaznamy.map((z) => JSON.stringify(z)).join('\n');
    },
  };
}
