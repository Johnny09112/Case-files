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
const MAX_TOKENS = 400;

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

/**
 * @param {object} [opts]
 * @param {string} [opts.apiKey] explicitní klíč (testy) — jinak `import.meta.env.VITE_ANTHROPIC_API_KEY`
 * @param {string} [opts.envKey] jen pro testy „bez klíče" (přepíše env lookup)
 * @param {() => {messages: {create: Function}}} [opts.clientFactory] injekce klienta (testy — ŽÁDNÁ reálná síť)
 * @returns {{model: string, generate(req: {system: string, prompt: string}): Promise<{text: string, raw: object}>}|null}
 */
export function createAnthropicProvider({ apiKey, envKey, clientFactory } = {}) {
  const klic = apiKey ?? (envKey !== undefined ? envKey : envKlic());
  if (!klic) return null;

  const client = clientFactory ? clientFactory() : new Anthropic({ apiKey: klic, dangerouslyAllowBrowser: true });

  return {
    model: MODEL,
    async generate({ system, prompt }) {
      try {
        const resp = await client.messages.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system,
          messages: [{ role: 'user', content: prompt }],
        });
        const text = (resp.content ?? [])
          .filter((blok) => blok.type === 'text')
          .map((blok) => blok.text)
          .join('\n')
          .trim();
        return { text, raw: resp };
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
