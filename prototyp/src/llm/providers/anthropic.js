// @ts-check
/**
 * Anthropic provider — JEDINÉ místo v kódu, kde smí být vendor SDK (ADR-004:
 * adaptér orchestruje, provider jen umí `generate()`; výměna poskytovatele
 * je tedy jeden soubor v `providers/`).
 *
 * Model: `claude-haiku-4-5-20251001` (třída Haiku, architektura §2.3).
 * POZOR (ověřeno proti aktuální referenci API): Haiku 4.5 NEPODPORUJE
 * `output_config.effort` ani adaptivní thinking — posíláme jen `model`,
 * `max_tokens`, `system`, `messages`. `cache_control` se nepoužívá: minimální
 * cachovatelný prefix Haiku 4.5 je 4096 tokenů a náš prompt je kratší
 * (ADR-004), provider-side cache by se tedy neuplatnila.
 *
 * `dangerouslyAllowBrowser: true` je přijatelné JEN proto, že build prototypu
 * (dle ADR-006) se nikdy nikam nenasazuje — běží čistě lokálně u vývojáře;
 * klíč se vědomě dostane do dev bundle (viz `technika/architektura.md` §4).
 * Klíč se bere VÝHRADNĚ z `import.meta.env.VITE_ANTHROPIC_API_KEY` — bez
 * klíče `createAnthropicProvider()` vrátí `null` a hra běží na fallbacku.
 */
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-haiku-4-5-20251001';
// Brána češtiny D55 (technika/brana-cestiny-vyhodnoceni-2026-08-02.md, Vzorec 2):
// 8/13 výstupů se useklo uprostřed slova na 400 tokenech. Čeština běží ~2–2,5
// zn./token, strop protokolu je 900 zn. (design-dokument v3) → 900 zn. potřebuje
// ~360–450 výstupních tokenů SAMO O SOBĚ, plus 50–120 tokenů si model bere na
// markdown hlavičku, kterou prompt nezakazuje (Vzorec 5). 400 tokenů na to
// nestačí ani v ideálním případě. 800 dává ~350 tokenů rezervy nad worst-case
// (450 + 120 ≈ 570) na budoucí škrtání promptu, aniž by se strop zdvojnásoboval
// zbytečně — adapter.js teď navíc uříznutý výstup (stop_reason "max_tokens")
// zahazuje jako nevalidní, takže i kdyby 800 nestačilo, hráč fragment neuvidí.
const MAX_TOKENS = 800;

// Vzorec 1 (tamtéž): 13/13 výstupů mělo tvrdou jazykovou vadu (cizí písmo,
// neexistující slova, rozpadlá shoda) — SDK default temperature=1.0 je hlavní
// podezřelý, `anthropic.js` teplotu dosud vůbec neposílal. 0.5 je konzervativní
// první krok (ne 0 — chceme pořád kreativní interpretaci, D53), přepsatelný
// bez zásahu do kódu přes `VITE_LLM_TEMPERATURE` (Vite/prohlížeč) nebo CLI
// `--temperature=` v `sim/brana-cestiny.js` (čistý Node), aby šlo A/B změřit
// levně na téže baterii (návrh oprav, bod 2).
export const DEFAULT_TEMPERATURE = 0.5;

/** @returns {string|undefined} */
function envKlic() {
  // import.meta.env existuje jen pod Vite (build i Vitest) — v čistém Node
  // (např. sim/) by přístup k `import.meta.env` sám o sobě spadl, proto guard.
  try {
    return typeof import.meta !== 'undefined' ? import.meta.env?.VITE_ANTHROPIC_API_KEY : undefined;
  } catch {
    return undefined;
  }
}

/** @returns {string|undefined} syrová hodnota env proměnné, ještě neparsovaná na číslo */
function envTeplotaSurova() {
  try {
    return typeof import.meta !== 'undefined' ? import.meta.env?.VITE_LLM_TEMPERATURE : undefined;
  } catch {
    return undefined;
  }
}

/** @param {string|undefined} surova @returns {number|undefined} */
function parsujTeplotu(surova) {
  if (surova === undefined || surova === null || surova === '') return undefined;
  const cislo = Number(surova);
  return Number.isFinite(cislo) ? cislo : undefined;
}

/**
 * @param {object} [opts]
 * @param {string} [opts.apiKey] explicitní klíč (testy) — jinak `import.meta.env.VITE_ANTHROPIC_API_KEY`
 * @param {string} [opts.envKey] jen pro testy „bez klíče" (přepíše env lookup pro API klíč)
 * @param {number} [opts.temperature] explicitní přepis (testy, CLI `--temperature=` v sim/) —
 *   jinak `import.meta.env.VITE_LLM_TEMPERATURE`, jinak `DEFAULT_TEMPERATURE`
 * @param {string} [opts.envTemperatureKey] jen pro testy — přepíše env lookup pro teplotu
 *   (stejná hermetičnost jako `envKey` u API klíče: nesmí záviset na vývojářově `.env.local`)
 * @param {() => {messages: {create: Function}}} [opts.clientFactory] injekce klienta (testy — ŽÁDNÁ reálná síť)
 * @returns {{model: string, temperature: number, generate(req: {system: string, prompt: string}): Promise<{text: string, raw: object, stopReason: string|null}>}|null}
 */
export function createAnthropicProvider({ apiKey, envKey, temperature, envTemperatureKey, clientFactory } = {}) {
  const klic = apiKey ?? (envKey !== undefined ? envKey : envKlic());
  if (!klic) return null;

  const surovaTeplota = envTemperatureKey !== undefined ? envTemperatureKey : envTeplotaSurova();
  const teplota = temperature ?? parsujTeplotu(surovaTeplota) ?? DEFAULT_TEMPERATURE;
  const client = clientFactory ? clientFactory() : new Anthropic({ apiKey: klic, dangerouslyAllowBrowser: true });

  return {
    model: MODEL,
    temperature: teplota,
    async generate({ system, prompt }) {
      try {
        const resp = await client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          temperature: teplota,
          system,
          messages: [{ role: 'user', content: prompt }],
        });
        const text = (resp.content ?? [])
          .filter((blok) => blok.type === 'text')
          .map((blok) => blok.text)
          .join('\n')
          .trim();
        return { text, raw: resp, stopReason: resp.stop_reason ?? null };
      } catch (chyba) {
        if (chyba instanceof Anthropic.APIError) {
          // Typované chyby SDK (RateLimitError, AuthenticationError, ...) mohou
          // nést v `headers`/`request` autorizační hlavičku s klíčem API —
          // NIKDY se neloguje klíč, takže dál posíláme jen sanitizovanou
          // chybu (jméno + stav), ne syrový objekt SDK. Adaptér ji chytí
          // a tiše spadne na fallback (nikdy nematchujeme text chyby).
          const sanitizovana = new Error(`Anthropic API chyba: ${chyba.status ?? '?'} ${chyba.name}`);
          sanitizovana.name = chyba.name;
          throw sanitizovana;
        }
        throw chyba;
      }
    },
  };
}
