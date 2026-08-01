// @ts-check
/**
 * Testy továrny providerů (src/llm/providers/index.js) — dnes jen Anthropic,
 * ale vrací `null` bez klíče (ADR-004: hra bez klíče plně hratelná).
 */
import { describe, it, expect } from 'vitest';
import { createProvider } from '../src/llm/providers/index.js';

describe('createProvider', () => {
  it('bez klíče vrací null', () => {
    expect(createProvider({ apiKey: undefined })).toBeNull();
  });

  it('s klíčem (a injektovaným klientem) vrací provider s generate()', () => {
    const provider = createProvider({ apiKey: 'k', clientFactory: () => ({ messages: { create: async () => ({ content: [] }) } }) });
    expect(provider).not.toBeNull();
    expect(typeof provider.generate).toBe('function');
  });
});
