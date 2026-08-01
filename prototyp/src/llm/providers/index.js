// @ts-check
/**
 * Továrna providerů (architektura §2.3, ADR-004). Dnes jediný poskytovatel
 * (Anthropic Haiku 4.5) — nový provider = nová větev tady + nový soubor
 * v `providers/`, adaptér ani UI se nemění.
 */
import { createAnthropicProvider } from './anthropic.js';

/**
 * @param {Parameters<typeof createAnthropicProvider>[0]} [opts] protéká do createAnthropicProvider (testy)
 * @returns {ReturnType<typeof createAnthropicProvider>}
 */
export function createProvider(opts) {
  return createAnthropicProvider(opts);
}
