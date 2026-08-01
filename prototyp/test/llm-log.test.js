// @ts-check
/**
 * Testy JSONL logu volání LLM (src/llm/log.js, architektura §2.3).
 * Klíčový invariant: klíč API se NIKDY nikam neloguje, ani omylem.
 */
import { describe, it, expect } from 'vitest';
import { createLog } from '../src/llm/log.js';

describe('createLog — záznam na volání + export do JSONL', () => {
  it('zapíše záznam s očekávanými poli', () => {
    const log = createLog();
    const z = log.record({
      cas: 1000, klicExakt: 'abc', klicHruby: 'def', prompt: 'SITUACE: ...',
      rawOdpoved: 'text protokolu', zdroj: 'llm', latenceMs: 850, model: 'claude-haiku-4-5-20251001',
    });
    expect(z).toMatchObject({ cas: 1000, klicExakt: 'abc', klicHruby: 'def', zdroj: 'llm', latenceMs: 850, model: 'claude-haiku-4-5-20251001' });
  });

  it('all() vrací všechny záznamy v pořadí zápisu', () => {
    const log = createLog();
    log.record({ cas: 1, klicExakt: 'a', zdroj: 'cache', latenceMs: 1 });
    log.record({ cas: 2, klicExakt: 'b', zdroj: 'fallback', latenceMs: 2 });
    expect(log.all().map((z) => z.klicExakt)).toEqual(['a', 'b']);
  });

  it('toJsonl() vrátí jeden řádek JSON na záznam', () => {
    const log = createLog();
    log.record({ cas: 1, klicExakt: 'a', zdroj: 'llm', latenceMs: 5 });
    log.record({ cas: 2, klicExakt: 'b', zdroj: 'fallback', latenceMs: 6 });
    const radky = log.toJsonl().split('\n');
    expect(radky).toHaveLength(2);
    expect(JSON.parse(radky[0])).toMatchObject({ klicExakt: 'a', zdroj: 'llm' });
    expect(JSON.parse(radky[1])).toMatchObject({ klicExakt: 'b', zdroj: 'fallback' });
  });

  it('chybějící volitelná pole (klicHruby, model, rawOdpoved) se zapíší jako null, ne undefined', () => {
    const log = createLog();
    log.record({ cas: 1, klicExakt: 'a', zdroj: 'cache', latenceMs: 1 });
    const [z] = log.all();
    expect(z.klicHruby).toBeNull();
    expect(z.model).toBeNull();
    expect(z.rawOdpoved).toBeNull();
    expect(JSON.parse(log.toJsonl())).toMatchObject({ klicHruby: null, model: null, rawOdpoved: null });
  });

  it('NIKDY nezaloguje klíč API — i kdyby ho volající omylem předal, whitelist polí ho odřízne', () => {
    const log = createLog();
    log.record({
      cas: 1, klicExakt: 'a', zdroj: 'llm', latenceMs: 1,
      // omylem předané citlivé pole — nesmí se propsat do záznamu ani do JSONL
      apiKey: 'sk-ant-tajny-klic-xyz',
      headers: { Authorization: 'Bearer sk-ant-tajny-klic-xyz' },
    });
    const jsonl = log.toJsonl();
    expect(jsonl).not.toContain('sk-ant-tajny-klic-xyz');
    expect(jsonl).not.toContain('Authorization');
    expect(Object.keys(log.all()[0])).not.toContain('apiKey');
    expect(Object.keys(log.all()[0])).not.toContain('headers');
  });
});
