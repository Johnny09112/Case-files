// @ts-check
/**
 * Testy Anthropic provideru (src/llm/providers/anthropic.js). ŽÁDNÁ reálná
 * síť: `client` se injektuje jako závislost (`createAnthropicProvider` bere
 * volitelný `clientFactory`), takže testy nikdy nevolají API.
 */
import { describe, it, expect, vi } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import { createAnthropicProvider, MODEL, DEFAULT_TEMPERATURE } from '../src/llm/providers/anthropic.js';

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

describe('createAnthropicProvider — stop_reason (brána češtiny D55, useknutí)', () => {
  it('generate() vrací stopReason z resp.stop_reason', async () => {
    const create = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Protokol useklý upro' }],
      stop_reason: 'max_tokens',
    });
    const provider = createAnthropicProvider({ apiKey: 'k', clientFactory: () => ({ messages: { create } }) });
    const vysledek = await provider.generate({ system: 's', prompt: 'p' });
    expect(vysledek.stopReason).toBe('max_tokens');
  });

  it('normální (neuseklá) odpověď má stopReason "end_turn"', async () => {
    const create = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: 'Protokol dokončený v pořádku, bez useknutí.' }],
      stop_reason: 'end_turn',
    });
    const provider = createAnthropicProvider({ apiKey: 'k', clientFactory: () => ({ messages: { create } }) });
    const vysledek = await provider.generate({ system: 's', prompt: 'p' });
    expect(vysledek.stopReason).toBe('end_turn');
  });

  it('chybějící stop_reason v odpovědi (starý mock/edge-case) se vrátí jako null, ne undefined', async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Text.' }] });
    const provider = createAnthropicProvider({ apiKey: 'k', clientFactory: () => ({ messages: { create } }) });
    const vysledek = await provider.generate({ system: 's', prompt: 'p' });
    expect(vysledek.stopReason).toBeNull();
  });

  it('posílá max_tokens: 800 (rezerva nad strop 900 zn., viz komentář v anthropic.js)', async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Text.' }] });
    const provider = createAnthropicProvider({ apiKey: 'k', clientFactory: () => ({ messages: { create } }) });
    await provider.generate({ system: 's', prompt: 'p' });
    const [volani] = create.mock.calls[0];
    expect(volani.max_tokens).toBe(800);
  });
});

describe('createAnthropicProvider — temperature (brána češtiny D55, Vzorec 1)', () => {
  // envTemperatureKey: '' = hermetické „env je prázdné" (stejný důvod jako envKey
  // u API klíče v testech výše) — bez toho by test záviselo na tom, jestli má
  // vývojář VITE_LLM_TEMPERATURE nastavené v .env.local.
  it('bez explicitní hodnoty a bez env pošle DEFAULT_TEMPERATURE (0.5)', async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Text.' }] });
    const provider = createAnthropicProvider({ apiKey: 'k', envTemperatureKey: '', clientFactory: () => ({ messages: { create } }) });
    expect(provider.temperature).toBe(DEFAULT_TEMPERATURE);
    expect(DEFAULT_TEMPERATURE).toBe(0.5);
    await provider.generate({ system: 's', prompt: 'p' });
    const [volani] = create.mock.calls[0];
    expect(volani.temperature).toBe(0.5);
  });

  it('explicitní opts.temperature přebije default (A/B, CLI --temperature= v sim/)', async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Text.' }] });
    const provider = createAnthropicProvider({ apiKey: 'k', temperature: 1.0, envTemperatureKey: '', clientFactory: () => ({ messages: { create } }) });
    expect(provider.temperature).toBe(1.0);
    await provider.generate({ system: 's', prompt: 'p' });
    const [volani] = create.mock.calls[0];
    expect(volani.temperature).toBe(1.0);
  });

  it('VITE_LLM_TEMPERATURE z env se použije, když opts.temperature není zadané', async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Text.' }] });
    const provider = createAnthropicProvider({ apiKey: 'k', envTemperatureKey: '0.7', clientFactory: () => ({ messages: { create } }) });
    expect(provider.temperature).toBe(0.7);
  });

  it('nesmyslná hodnota env proměnné se ignoruje a padá se na default', async () => {
    const create = vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Text.' }] });
    const provider = createAnthropicProvider({ apiKey: 'k', envTemperatureKey: 'nesmysl', clientFactory: () => ({ messages: { create } }) });
    expect(provider.temperature).toBe(DEFAULT_TEMPERATURE);
  });
});
