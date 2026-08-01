// @ts-check
/**
 * Orchestrace LLM adaptéru (architektura §2.3, ADR-004): cache → provider →
 * `Promise.race` s 10s timeoutem → lehká validace → fallback šablona.
 *
 * Orchestraci vlastní ADAPTÉR, ne provider (ADR-004) — provider jen umí
 * `generate({system, prompt}) → {text, raw}`. `generate()` NIKDY nerejectuje:
 * chybějící provider, timeout, chyba SDK i nevalidní výstup vedou tiše na
 * fallback — hra nikdy nečeká na síť (CLAUDE.md, neporušitelný princip).
 */
import { buildPromptInput, SYSTEM_PROMPT } from './prompt.js';
import { computeExactKey, computeGrossKey, createCache } from './cache.js';

const DEFAULT_TIMEOUT_MS = 10000;
const MIN_DELKA = 20;
const MAX_DELKA = 2000;

/**
 * Lehká validace (obsah hlídá regresní baterie protocol-humor-testera, ne kód):
 * neprázdný string rozumné délky.
 * @param {*} text
 */
function jeValidni(text) {
  return typeof text === 'string' && text.trim().length >= MIN_DELKA && text.trim().length <= MAX_DELKA;
}

/**
 * @param {Promise<*>} promise
 * @param {number} ms
 */
function zavodSTimeoutem(promise, ms) {
  return new Promise((resolve, reject) => {
    const casovac = setTimeout(() => reject(new Error(`LLM: timeout po ${ms} ms`)), ms);
    Promise.resolve(promise).then(
      (hodnota) => {
        clearTimeout(casovac);
        resolve(hodnota);
      },
      (chyba) => {
        clearTimeout(casovac);
        reject(chyba);
      }
    );
  });
}

/**
 * @param {object} opts
 * @param {{model?: string, generate(req: {system: string, prompt: string}): Promise<{text: string, raw?: *}>}|null} [opts.provider]
 *   `null` = bez klíče, adaptér rovnou generuje fallbackem.
 * @param {(udalosti: object[], ctx: object) => string} opts.fallback fragmentová/pásmová šablona (D54) — nikdy nesmí reject/network
 * @param {ReturnType<typeof createCache>} [opts.cache]
 * @param {ReturnType<typeof import('./log.js').createLog>|null} [opts.log]
 * @param {() => number} [opts.now] injektovaný čas (testy) — jinak `Date.now`
 * @param {number} [opts.timeoutMs]
 */
export function createAdapter({ provider = null, fallback, cache = createCache(), log = null, now = () => Date.now(), timeoutMs = DEFAULT_TIMEOUT_MS }) {
  if (typeof fallback !== 'function') {
    throw new Error('createAdapter: „fallback" je povinný — hra nikdy nečeká na síť ani nesmí zůstat bez textu.');
  }

  /**
   * @param {object[]} udalosti
   * @param {object} ctx
   */
  async function generate(udalosti, ctx) {
    const zacatek = now();

    let klicExakt = null;
    let klicHruby = null;
    try {
      klicExakt = await computeExactKey(udalosti);
      klicHruby = await computeGrossKey(udalosti, ctx);
    } catch {
      // Klíčování selhalo (nekompletní uzel) — pokračuj bez cache, na fallback dojde stejně.
      klicExakt = null;
      klicHruby = null;
    }

    if (klicExakt != null) {
      const zasah = await cache.get(klicExakt);
      if (zasah.hit) {
        return dokoncit({
          text: zasah.value.text,
          zdroj: 'cache',
          model: zasah.value.model ?? null,
          zacatek,
          klicExakt,
          klicHruby,
          prompt: null,
          rawOdpoved: null,
        });
      }
    }

    let prompt = null;
    try {
      prompt = buildPromptInput(udalosti, ctx);
    } catch {
      // Uzel nemá dokončenou resoluci (chybný vstup) — rovnou fallback, mechanika rozhoduje dál.
      return fallbackVysledek({ udalosti, ctx, zacatek, klicExakt, klicHruby, prompt: null });
    }

    if (!provider) {
      return fallbackVysledek({ udalosti, ctx, zacatek, klicExakt, klicHruby, prompt });
    }

    let odpoved;
    try {
      odpoved = await zavodSTimeoutem(provider.generate({ system: SYSTEM_PROMPT, prompt }), timeoutMs);
    } catch {
      return fallbackVysledek({ udalosti, ctx, zacatek, klicExakt, klicHruby, prompt });
    }

    if (!odpoved || !jeValidni(odpoved.text)) {
      return fallbackVysledek({ udalosti, ctx, zacatek, klicExakt, klicHruby, prompt, rawOdpoved: odpoved?.raw ?? odpoved?.text ?? null });
    }

    const text = odpoved.text.trim();
    const model = provider.model ?? null;
    if (klicExakt != null) {
      try {
        await cache.set(klicExakt, { text, model });
      } catch {
        // Cache-set selže jen na programátorskou chybu úložiště — výsledek už máme, pokračuj.
      }
    }
    return dokoncit({ text, zdroj: 'llm', model, zacatek, klicExakt, klicHruby, prompt, rawOdpoved: odpoved.raw ?? text });
  }

  /** @param {{udalosti: object[], ctx: object, zacatek: number, klicExakt: string|null, klicHruby: string|null, prompt: string|null, rawOdpoved?: *}} p */
  function fallbackVysledek({ udalosti, ctx, zacatek, klicExakt, klicHruby, prompt, rawOdpoved = null }) {
    let text;
    try {
      text = fallback(udalosti, ctx);
    } catch {
      // I fallback smí selhat (programátorská chyba v šablonách) — hra pořád nesmí spadnout.
      text = '';
    }
    return dokoncit({ text, zdroj: 'fallback', model: null, zacatek, klicExakt, klicHruby, prompt, rawOdpoved });
  }

  /** @param {{text: string, zdroj: 'llm'|'cache'|'fallback', model: string|null, zacatek: number, klicExakt: string|null, klicHruby: string|null, prompt: string|null, rawOdpoved?: *}} p */
  function dokoncit({ text, zdroj, model, zacatek, klicExakt, klicHruby, prompt, rawOdpoved = null }) {
    const latenceMs = now() - zacatek;
    log?.record({ cas: zacatek, klicExakt, klicHruby, prompt, rawOdpoved, zdroj, latenceMs, model });
    return { text, zdroj, latenceMs, klic: klicExakt, model };
  }

  return { generate };
}
