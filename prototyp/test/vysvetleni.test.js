// @ts-check
/**
 * Vysvětlující vrstva (src/ui/vysvetleni.js) — čistá funkce nad událostním logem.
 * Testuje se PŘEKLAD logu do češtiny, ne mechanika (ta má vlastní testy v enginu).
 */
import { describe, it, expect } from 'vitest';
import { EVENT } from '../src/engine/events.js';
// TYPY_S_HANDLEREM se v tomto testu zatím nepoužívá — pokrytí proti EVENT
// (aby tripwire nebyl slepý) přidává až Task 4. Import je tu podle briefu
// Tasku 1, aby soubor od začátku odpovídal API vrstvy.
// eslint-disable-next-line no-unused-vars
import { vysvetli, MISTO, TYPY_S_HANDLEREM } from '../src/ui/vysvetleni.js';

/** Poskládá log ze zadaných událostí a dopočítá seq (jako createLog). */
export function log(...udalosti) {
  return udalosti.map((u, i) => ({ seq: i + 1, nodeIndex: u.nodeIndex ?? 1, ...u }));
}

/** Všechny anotace jako plochý seznam (pořadí dle seq). */
export function vsechny(mapa) {
  return [...mapa.entries()].flatMap(([seq, a]) => a.map((x) => ({ seq, ...x })));
}

describe('vysvetli — kostra', () => {
  it('vrací Map indexovanou podle seq události', () => {
    const events = log({ type: EVENT.RUN_STARTED, pronasledovatel: 'agent-malone', rusi: { typ: 'stat', cil: 'hodnota' } });
    expect(vysvetli(events)).toBeInstanceOf(Map);
  });

  it('události vědomě bez anotace nic nevydají (§5 návrhu)', () => {
    const events = log(
      { type: EVENT.RUN_STARTED, pronasledovatel: 'agent-malone', rusi: null },
      { type: EVENT.COMMIT, commit: [] },
      { type: EVENT.ASSIGN_CONTEXT, situace_id: 's1', gamble_dostupny: true, ruce: [] },
      { type: EVENT.ASSIGNMENT, prirazeni: [] }
    );
    expect(vysvetli(events).size).toBe(0);
  });

  it('neznámý typ události spadne do tripwire anotace, ne do ticha', () => {
    const anotace = vsechny(vysvetli(log({ type: 'nejaka_nova_udalost' })));
    expect(anotace).toHaveLength(1);
    expect(anotace[0].misto).toBe(MISTO.SPIS);
    expect(anotace[0].veta).toContain('neznámá událost');
    expect(anotace[0].veta).toContain('nejaka_nova_udalost');
  });

  it('volání nad prefixem logu dá tytéž anotace jako nad celkem (§4.1)', () => {
    const events = log(
      { type: EVENT.RUN_STARTED, pronasledovatel: 'agent-malone', rusi: null },
      { type: 'nejaka_nova_udalost' }
    );
    const prefix = vysvetli(events.slice(0, 1));
    const cely = vysvetli(events);
    expect([...prefix.keys()]).toEqual([]);
    expect([...cely.keys()]).toEqual([2]);
  });
});
