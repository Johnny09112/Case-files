// @ts-check
/**
 * Testy Anthropic provideru (src/llm/providers/anthropic.js). ŽÁDNÁ reálná
 * síť: `client` se injektuje jako závislost (`createAnthropicProvider` bere
 * volitelný `clientFactory`), takže testy nikdy nevolají API.
 */
import { describe, it, expect, vi } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import { createAnthropicProvider, MODEL } from '../src/llm/providers/anthropic.js';

describe('createAnthropicProvider — bez klíče', () => {
  it('vrací null, když není žádný klíč (apiKey ani env)', () => {
    // envKey: '' = hermetické „env je prázdné"; undefined by propadl na reálný
    // import.meta.env a test by selhal každému vývojáři s klíčem v .env.local
    expect(createAnthropicProvider({ apiKey: undefined, envKey: '' })).toBeNull();
  });

  it('vrací null i pro prázdný string', () => {
    expect(createAnthropicProvider({ apiKey: '', envKey: '' })).toBeNull();
  });
});

describe('createAnthropicProvider — s klíčem (mock SDK klient)', () => {
  it('generate() zavolá messages.create s modelem, system a jedním user messagem', async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Protokol o vhodné délce, vyšetřovatel zapsal vše potřebné.' }] });
    const provider = createAnthropicProvider({
      apiKey: 'sk-ant-test-key',
      clientFactory: () => ({ messages: { create } }),
    });
    expect(provider).not.toBeNull();
    expect(provider.model).toBe(MODEL);
    const vysledek = await provider.generate({ system: 'systémový prompt', prompt: 'SITUACE: ...' });
    expect(vysledek.text).toBe('Protokol o vhodné délce, vyšetřovatel zapsal vše potřebné.');
    expect(create).toHaveBeenCalledTimes(1);
    const [volani] = create.mock.calls[0];
    expect(volani.model).toBe(MODEL);
    expect(volani.system).toBe('systémový prompt');
    expect(volani.messages).toEqual([{ role: 'user', content: 'SITUACE: ...' }]);
    expect(volani).not.toHaveProperty('thinking');
    expect(volani).not.toHaveProperty('output_config');
  });

  it('spojí víc textových bloků a ořízne bílé znaky', async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: ' První část. ' }, { type: 'text', text: 'Druhá.' }] });
    const provider = createAnthropicProvider({ apiKey: 'k', clientFactory: () => ({ messages: { create } }) });
    const { text } = await provider.generate({ system: 's', prompt: 'p' });
    expect(text).toBe('První část. \nDruhá.'.trim());
  });

  it('typovaná chyba SDK (RateLimitError) se propaguje jako sanitizovaná chyba bez citlivých dat', async () => {
    const chyba = new Anthropic.RateLimitError(429, { error: { message: 'moc requestů' } }, 'moc requestů', new Headers({ authorization: 'Bearer sk-ant-tajny' }));
    const create = vi.fn().mockRejectedValue(chyba);
    const provider = createAnthropicProvider({ apiKey: 'k', clientFactory: () => ({ messages: { create } }) });
    await expect(provider.generate({ system: 's', prompt: 'p' })).rejects.toThrow();
    try {
      await provider.generate({ system: 's', prompt: 'p' });
    } catch (e) {
      expect(String(e)).not.toContain('sk-ant-tajny');
    }
  });

  it('neznámá (netypovaná) chyba se propaguje beze změny', async () => {
    const create = vi.fn().mockRejectedValue(new Error('síť spadla'));
    const provider = createAnthropicProvider({ apiKey: 'k', clientFactory: () => ({ messages: { create } }) });
    await expect(provider.generate({ system: 's', prompt: 'p' })).rejects.toThrow('síť spadla');
  });
});
