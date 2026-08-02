// @ts-check
/**
 * Testy orchestrace LLM adaptéru (src/llm/adapter.js, ADR-004):
 * cache → provider → 10s timeout → validace → fallback. `generate()` NIKDY
 * nerejectuje — hra nikdy nečeká na síť ani nedostane výjimku z UI vrstvy.
 *
 * Mock provider = prostá funkce (žádná reálná síť). Čas je injektovaný přes
 * `now`, aby latence v testech byla deterministická.
 */
import { describe, it, expect } from 'vitest';
import { EVENT } from '../src/engine/events.js';
import { createAdapter } from '../src/llm/adapter.js';
import { createCache } from '../src/llm/cache.js';
import { createLog } from '../src/llm/log.js';

const CTX = {
  jmena: { p1: 'Vincenc Bartoš', p2: 'Frank Kowalski' },
  veci: { a: 'Balík bankovek', b: 'Otrlený výraz', c: 'Zlaté hodinky', d: 'Banánový kanón' },
  situace: { s1: { nazev: 'Farmářův brod', text: 'Kola zapadla do brodu.' } },
  postihy: {},
};

function uzel() {
  return [
    {
      seq: 1, nodeIndex: 3, type: EVENT.SITUATION_REVEALED, situace_id: 's1', typ: 'npc',
      sloty: [
        { slot_index: 0, role: 'Zaplatit', stat: 'hodnota', kotva: 3, viditelnost: 'viditelna' },
        { slot_index: 1, role: 'Mlčet', stat: 'obrana', kotva: 3, viditelnost: 'viditelna' },
        { slot_index: 2, role: 'Táhnout', stat: 'nastroj', kotva: 3, viditelnost: 'viditelna' },
        { slot_index: 3, role: 'Hrozit', stat: 'utok', kotva: 3, viditelnost: 'skryta' },
      ],
    },
    { seq: 2, nodeIndex: 3, type: EVENT.SLOT_RESOLVED, slot_index: 0, karta_id: 'a', hrac_id: 'p1', stat: 'hodnota', stat_hodnota: 5, prah: 3, typ_prahu: 'jednostat', viditelnost: 'viditelna', zasah: true, duvod: 'proslo' },
    { seq: 3, nodeIndex: 3, type: EVENT.SLOT_RESOLVED, slot_index: 1, karta_id: 'b', hrac_id: 'p2', stat: 'obrana', stat_hodnota: 4, prah: 3, typ_prahu: 'jednostat', viditelnost: 'viditelna', zasah: true, duvod: 'proslo' },
    { seq: 4, nodeIndex: 3, type: EVENT.SLOT_RESOLVED, slot_index: 2, karta_id: 'c', hrac_id: 'p1', stat: 'nastroj', stat_hodnota: 1, prah: 3, typ_prahu: 'jednostat', viditelnost: 'viditelna', zasah: false, duvod: 'nizky_stat' },
    { seq: 5, nodeIndex: 3, type: EVENT.SLOT_RESOLVED, slot_index: 3, karta_id: 'd', hrac_id: 'p2', stat: 'utok', stat_hodnota: 1, prah: 3, typ_prahu: 'jednostat', viditelnost: 'skryta', zasah: false, duvod: 'nizky_stat' },
    { seq: 6, nodeIndex: 3, type: EVENT.BAND_RESOLVED, zasahy: 2, pasmo: '2/4_S_NASLEDKY', max_achievable_zasahy: 3, naklad_ztrata: 0, zbyva_beden: 6 },
  ];
}

const fallbackText = () => 'Fallback text protokolu o dostatečné délce pro validaci.';

describe('createAdapter — cache hit', () => {
  it('druhé volání se stejným vstupem providera nezavolá, zdroj je "cache"', async () => {
    let volani = 0;
    const provider = {
      model: 'test-model',
      async generate() {
        volani += 1;
        return { text: 'Odpověď z LLM, dostatečně dlouhá na validaci textu.', raw: {} };
      },
    };
    const adapter = createAdapter({ provider, fallback: fallbackText, cache: createCache(), now: () => 0 });
    const prvni = await adapter.generate(uzel(), CTX);
    const druhe = await adapter.generate(uzel(), CTX);
    expect(volani).toBe(1);
    expect(prvni.zdroj).toBe('llm');
    expect(druhe.zdroj).toBe('cache');
    expect(druhe.text).toBe(prvni.text);
  });
});

describe('createAdapter — timeout', () => {
  it('provider, který se nikdy nevyřeší, padne na fallback do timeoutu', async () => {
    const provider = { model: 'test-model', generate: () => new Promise(() => {}) };
    const adapter = createAdapter({ provider, fallback: fallbackText, timeoutMs: 30, now: () => 0 });
    const vysledek = await adapter.generate(uzel(), CTX);
    expect(vysledek.zdroj).toBe('fallback');
    expect(vysledek.text).toBe(fallbackText());
  }, 2000);
});

describe('createAdapter — chyba providera', () => {
  it('provider, který zahodí výjimku, padne na fallback', async () => {
    const provider = { model: 'test-model', async generate() { throw new Error('API selhalo'); } };
    const adapter = createAdapter({ provider, fallback: fallbackText, now: () => 0 });
    const vysledek = await adapter.generate(uzel(), CTX);
    expect(vysledek.zdroj).toBe('fallback');
  });

  it('generate() nikdy nerejectuje, i když provider i fallback vybuchnou', async () => {
    const provider = { model: 'x', async generate() { throw new Error('boom'); } };
    const rozbityFallback = () => { throw new Error('fallback taky spadl'); };
    const adapter = createAdapter({ provider, fallback: rozbityFallback, now: () => 0 });
    await expect(adapter.generate(uzel(), CTX)).resolves.toMatchObject({ zdroj: 'fallback', text: '' });
  });
});

describe('createAdapter — žádný klíč (provider null)', () => {
  it('bez providera hra funguje na fallbacku a nikde nevyhodí výjimku', async () => {
    const adapter = createAdapter({ provider: null, fallback: fallbackText, now: () => 0 });
    const vysledek = await adapter.generate(uzel(), CTX);
    expect(vysledek.zdroj).toBe('fallback');
    expect(vysledek.text).toBe(fallbackText());
  });
});

describe('createAdapter — nevalidní výstup', () => {
  it('prázdný string z providera padne na fallback', async () => {
    const provider = { model: 'x', async generate() { return { text: '', raw: {} }; } };
    const adapter = createAdapter({ provider, fallback: fallbackText, now: () => 0 });
    const vysledek = await adapter.generate(uzel(), CTX);
    expect(vysledek.zdroj).toBe('fallback');
  });

  it('nestringový/nesmyslný výstup padne na fallback', async () => {
    const provider = { model: 'x', async generate() { return { text: undefined, raw: {} }; } };
    const adapter = createAdapter({ provider, fallback: fallbackText, now: () => 0 });
    const vysledek = await adapter.generate(uzel(), CTX);
    expect(vysledek.zdroj).toBe('fallback');
  });
});

describe('createAdapter — useknutý výstup (stop_reason "max_tokens", brána češtiny D55)', () => {
  it('odpověď s validní délkou, ale stopReason "max_tokens" padne na fallback (ADR-004: hráč nesmí vidět fragment)', async () => {
    const provider = {
      model: 'x',
      async generate() {
        // Délkou naprosto validní text (>= 20 zn.) — dřív by tohle prošlo jako "llm".
        return { text: 'Toto je useklý text uprostřed vě', raw: { stop_reason: 'max_tokens' }, stopReason: 'max_tokens' };
      },
    };
    const adapter = createAdapter({ provider, fallback: fallbackText, now: () => 0 });
    const vysledek = await adapter.generate(uzel(), CTX);
    expect(vysledek.zdroj).toBe('fallback');
    expect(vysledek.text).toBe(fallbackText());
  });

  it('zaloguje důvod "usekuto_max_tokens", ať se dá zpětně odlišit od jiných pádů na fallback', async () => {
    const log = createLog();
    const provider = {
      model: 'x',
      async generate() { return { text: 'Useklý text dostatečné délky na projití délkové validace.', raw: {}, stopReason: 'max_tokens' }; },
    };
    const adapter = createAdapter({ provider, fallback: fallbackText, log, now: () => 0 });
    await adapter.generate(uzel(), CTX);
    const [zaznam] = log.all();
    expect(zaznam.zdroj).toBe('fallback');
    expect(zaznam.duvod).toBe('usekuto_max_tokens');
  });

  it('normální dokončená odpověď (stopReason "end_turn") projde jako "llm" beze změny chování', async () => {
    const provider = {
      model: 'test-model',
      async generate() { return { text: 'Odpověď z LLM, dostatečně dlouhá a dokončená v pořádku.', raw: {}, stopReason: 'end_turn' }; },
    };
    const adapter = createAdapter({ provider, fallback: fallbackText, now: () => 0 });
    const vysledek = await adapter.generate(uzel(), CTX);
    expect(vysledek.zdroj).toBe('llm');
  });

  it('fallback z jiné příčiny (prázdný text) zaloguje jiný důvod ("nevalidni_delka"), ne useknutí', async () => {
    const log = createLog();
    const provider = { model: 'x', async generate() { return { text: '', raw: {}, stopReason: 'end_turn' }; } };
    const adapter = createAdapter({ provider, fallback: fallbackText, log, now: () => 0 });
    await adapter.generate(uzel(), CTX);
    const [zaznam] = log.all();
    expect(zaznam.duvod).toBe('nevalidni_delka');
  });
});

describe('createAdapter — logování', () => {
  it('každé volání zapíše log záznam se zdrojem a latencí, nikdy s API klíčem', async () => {
    const log = createLog();
    let t = 0;
    const now = () => (t += 100);
    const provider = { model: 'test-model', async generate() { return { text: 'Odpověď z LLM dostatečně dlouhá.', raw: {} }; } };
    const adapter = createAdapter({ provider, fallback: fallbackText, log, now, cache: createCache() });
    await adapter.generate(uzel(), CTX);
    const zaznamy = log.all();
    expect(zaznamy).toHaveLength(1);
    expect(zaznamy[0].zdroj).toBe('llm');
    expect(zaznamy[0].latenceMs).toBeGreaterThan(0);
    expect(JSON.stringify(zaznamy[0])).not.toMatch(/sk-ant|api[_-]?key/i);
  });
});

describe('createAdapter — validace parametrů', () => {
  it('bez fallbacku spadne hned při vytvoření (fallback je povinný)', () => {
    expect(() => createAdapter({ provider: null })).toThrow(/fallback/i);
  });
});
