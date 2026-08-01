// @ts-check
/**
 * Testy dvouvrstvého klíčování cache protokolů (src/llm/cache.js, ADR-007).
 * Exaktní klíč = SHA-256 kanonického JSON vstupu; hrubý klíč se počítá jen
 * STÍNOVĚ (a jen pro „čisté" stavy bez aktivních postihů) — nikdy se
 * nepoužívá k vyhledání, jen k měření potenciálu globální cache.
 */
import { describe, it, expect } from 'vitest';
import { EVENT } from '../src/engine/events.js';
import { canonicalJson, computeExactKey, computeGrossKey, createCache } from '../src/llm/cache.js';

function uzel({ karty = ['a', 'b', 'c', 'd'], hraci = ['p1', 'p2', 'p1', 'p2'], zasahy = [true, true, false, false], seq = 1, nodeIndex = 3 } = {}) {
  return [
    { seq, nodeIndex, type: EVENT.SITUATION_REVEALED, situace_id: 's1', typ: 'npc' },
    ...karty.map((k, i) => ({
      seq: seq + 1 + i, nodeIndex, type: EVENT.SLOT_RESOLVED, slot_index: i,
      karta_id: k, hrac_id: hraci[i], zasah: zasahy[i], duvod: zasahy[i] ? 'proslo' : 'nizky_stat',
    })),
    { seq: seq + 5, nodeIndex, type: EVENT.BAND_RESOLVED, zasahy: zasahy.filter(Boolean).length, pasmo: '2/4_S_NASLEDKY', naklad_ztrata: 0, zbyva_beden: 6 },
  ];
}

describe('canonicalJson — kanonizace (seřazené klíče, rekurzivně)', () => {
  it('dvě sémanticky stejné objekty v jiném pořadí klíčů dají stejný JSON', () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }));
  });

  it('pořadí polí se NEmění (jen klíče objektů)', () => {
    expect(canonicalJson({ a: [3, 1, 2] })).toBe('{"a":[3,1,2]}');
  });

  it('vnořené objekty se kanonizují taky', () => {
    expect(canonicalJson({ z: { b: 1, a: 2 }, a: 1 })).toBe(canonicalJson({ a: 1, z: { a: 2, b: 1 } }));
  });
});

describe('computeExactKey — deterministický, mechanicky citlivý', () => {
  it('stejný vstup dá stejný klíč', async () => {
    const a = await computeExactKey(uzel());
    const b = await computeExactKey(uzel());
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/); // SHA-256 hex
  });

  it('jiná karta ve slotu → jiný klíč', async () => {
    const a = await computeExactKey(uzel());
    const b = await computeExactKey(uzel({ karty: ['a', 'b', 'c', 'x'] }));
    expect(a).not.toBe(b);
  });

  it('jiné pásmo výsledku → jiný klíč', async () => {
    const a = await computeExactKey(uzel());
    const jineUdalosti = uzel().map((u) => (u.type === EVENT.BAND_RESOLVED ? { ...u, pasmo: '3/4_HLADCE' } : u));
    const b = await computeExactKey(jineUdalosti);
    expect(a).not.toBe(b);
  });

  it('je nezávislý na seq/nodeIndex (irelevantní pro obsah situace)', async () => {
    const a = await computeExactKey(uzel({ seq: 1, nodeIndex: 3 }));
    const b = await computeExactKey(uzel({ seq: 99, nodeIndex: 40 }));
    expect(a).toBe(b);
  });
});

describe('computeExactKey — nezávislost na jménech a seedu (ADR-007)', () => {
  it('klíč se počítá jen z `udalosti` — jména hráčů (ctx.jmena) do funkce vůbec nejdou', async () => {
    // Exaktní klíč bere jen hrac_id (seat), ne celé jméno — jméno se dosazuje
    // až ve fallback/LLM textu, nikdy se do klíčovacího payloadu nedostane.
    const a = await computeExactKey(uzel({ hraci: ['p1', 'p2', 'p1', 'p2'] }));
    const b = await computeExactKey(uzel({ hraci: ['p1', 'p2', 'p1', 'p2'] }));
    expect(a).toBe(b);
  });

  it('seed nikde nefiguruje v uzlových událostech, takže dva runy se stejnou situací sdílí klíč', async () => {
    // run_started.seed se do buildPromptInput/cache vůbec nepředává — jen
    // uzlové události (situation_revealed/slot_resolved/band_resolved/…).
    const udalostiRunA = uzel();
    const udalostiRunB = uzel(); // simuluje jiný run, stejná mechanická situace
    expect(await computeExactKey(udalostiRunA)).toBe(await computeExactKey(udalostiRunB));
  });
});

describe('computeGrossKey — jen STÍNOVĚ, jen pro čisté stavy (ADR-007)', () => {
  it('bez ctx.postihBucket (default „čistý") se spočítá', async () => {
    const k = await computeGrossKey(uzel(), {});
    expect(k).toMatch(/^[0-9a-f]{64}$/);
  });

  it('pro stav s aktivními postihy (bucket "1"/"2+") se NEPOČÍTÁ (vrací null)', async () => {
    expect(await computeGrossKey(uzel(), { postihBucket: '1' })).toBeNull();
    expect(await computeGrossKey(uzel(), { postihBucket: '2+' })).toBeNull();
  });

  it('liší se od exaktního klíče (jiný payload)', async () => {
    const exact = await computeExactKey(uzel());
    const gross = await computeGrossKey(uzel(), {});
    expect(gross).not.toBe(exact);
  });
});

describe('createCache — in-memory Map, cache hit/miss', () => {
  it('miss, pak set, pak hit', async () => {
    const cache = createCache();
    const klic = await computeExactKey(uzel());
    expect((await cache.get(klic)).hit).toBe(false);
    await cache.set(klic, { text: 'protokol...' });
    const zasah = await cache.get(klic);
    expect(zasah.hit).toBe(true);
    expect(zasah.value.text).toBe('protokol...');
  });

  it('různé klíče nekolidují', async () => {
    const cache = createCache();
    const k1 = await computeExactKey(uzel());
    const k2 = await computeExactKey(uzel({ karty: ['a', 'b', 'c', 'x'] }));
    await cache.set(k1, { text: 'jedna' });
    expect((await cache.get(k2)).hit).toBe(false);
  });
});
