// @ts-check
/**
 * Vysvětlující vrstva (src/ui/vysvetleni.js) — čistá funkce nad událostním logem.
 * Testuje se PŘEKLAD logu do češtiny, ne mechanika (ta má vlastní testy v enginu).
 */
import { describe, it, expect } from 'vitest';
import { EVENT } from '../src/engine/events.js';
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

  it('registr handlerů je exportovaný (Task 4 proti němu testuje pokrytí enumu)', () => {
    expect(TYPY_S_HANDLEREM).toContain(EVENT.RUN_STARTED);
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

/** Odhalený slot v payloadu situation_revealed. */
function slot(prepis = {}) {
  return { slot_index: 0, role: 'Zaplatit za vytažení', stat: 'hodnota', kotva: 3, sum: 1, prah: 4, typ_prahu: 'jednostat', viditelnost: 'viditelna', stitek_citlivy: null, ...prepis };
}

/** slot_resolved payload s rozumnými defaulty. */
function resolved(prepis = {}) {
  return { type: EVENT.SLOT_RESOLVED, slot_index: 0, karta_id: 'svara', hrac_id: 'p1', stat: 'nastroj', stat_hodnota: 4, prah: 3, typ_prahu: 'jednostat', viditelnost: 'viditelna', stitky: [], stitek_efekt: null, pronasledovatel_efekt: null, postih_efekt: null, zasah: true, duvod: 'proslo', ...prepis };
}

const CTX = {
  jmena: { p1: 'Vincenc Bartoš', p2: 'Frank Kowalski' },
  veci: { svara: 'Sochor', klic: 'Francouzský klíč', bouchacka: 'Bouchačka' },
  situace: { 's1': 'Brod u farmy' },
  pronasledovatele: { 'agent-malone': 'Agent Malone' },
};

describe('vysvetli — odhalení prahů (jádro učení, §5)', () => {
  it('rozepisuje práh na kotvu a šum u každého slotu', () => {
    const anotace = vsechny(vysvetli(log({ type: EVENT.SITUATION_REVEALED, situace_id: 's1', typ: 'npc', typ_mista: 'npc', sloty: [slot(), slot({ slot_index: 1, kotva: 2, sum: -1, prah: 1 })] }), CTX));
    expect(anotace).toHaveLength(2);
    expect(anotace[0].misto).toBe(MISTO.SLOT);
    expect(anotace[0].slot_index).toBe(0);
    expect(anotace[0].veta).toContain('práh 4 = kotva 3 +1');
    expect(anotace[1].veta).toContain('práh 1 = kotva 2 −1');
    expect(anotace[0].detail).toContain('naučitelná');
  });

  it('u skrytého slotu a slotové výjimky to řekne v detailu', () => {
    const anotace = vsechny(vysvetli(log({ type: EVENT.SITUATION_REVEALED, situace_id: 's1', typ: 'npc', typ_mista: 'npc', sloty: [slot({ viditelnost: 'skryta', stitek_citlivy: 'GANGSTER' })] }), CTX));
    expect(anotace[0].detail).toContain('skrytá role');
    expect(anotace[0].detail).toContain('GANGSTER');
  });
});

describe('vysvetli — důvody resoluce slotu (§5)', () => {
  it('proslo: razítko a čísla stat vs. práh', () => {
    const a = vsechny(vysvetli(log(resolved()), CTX))[0];
    expect(a.razitko).toBe('PROŠLO');
    expect(a.veta).toContain('nástroj 4');
    expect(a.veta).toContain('prahu 3');
  });

  it('nizky_stat: co to chtělo a co věc měla', () => {
    const a = vsechny(vysvetli(log(resolved({ zasah: false, duvod: 'nizky_stat', stat_hodnota: 2, prah: 4 })), CTX))[0];
    expect(a.razitko).toBe('NEPROŠLO');
    expect(a.veta).toContain('nástroj 4');
    expect(a.veta).toContain('Sochor');
    expect(a.veta).toContain('má 2');
  });

  it('kombi_neuplny: kombi chce OBA staty nad práh a řekne který selhal', () => {
    const a = vsechny(vysvetli(log(resolved({ zasah: false, duvod: 'kombi_neuplny', stat: ['nastroj', 'improvizace'], stat_hodnota: [4, 2], prah: 3, typ_prahu: 'kombi_oba' })), CTX))[0];
    expect(a.veta).toContain('OBA');
    expect(a.veta).toContain('nástroj 4');
    expect(a.veta).toContain('improvizace 2');
  });

  it('stat_zrusen: jmenuje pronásledovatele a run-wide platnost', () => {
    const events = log(
      { type: EVENT.RUN_STARTED, pronasledovatel: 'agent-malone', rusi: { typ: 'stat', cil: 'hodnota' } },
      resolved({ zasah: false, duvod: 'stat_zrusen', stat: 'hodnota', stat_hodnota: 0, pronasledovatel_efekt: { typ: 'stat', cil: 'hodnota' } })
    );
    const a = vsechny(vysvetli(events, CTX)).at(-1);
    expect(a.veta).toContain('Agent Malone');
    expect(a.veta).toContain('hodnota');
    expect(a.veta).toContain('0');
    expect(a.detail).toContain('celém runu');
  });

  it('gangster_auto_fail: zbraň ve viditelné roli padá bez ohledu na staty', () => {
    const a = vsechny(vysvetli(log(resolved({ karta_id: 'bouchacka', zasah: false, duvod: 'gangster_auto_fail', stitky: ['GANGSTER'], stitek_efekt: 'auto_fail' })), CTX))[0];
    expect(a.veta).toContain('Bouchačka');
    expect(a.veta).toContain('viditelné roli');
    expect(a.veta).toContain('bez ohledu na staty');
  });

  it('neobsazeno: nikdo slot neobsadil → automatický propad', () => {
    const a = vsechny(vysvetli(log(resolved({ karta_id: null, hrac_id: null, stat_hodnota: null, zasah: false, duvod: 'neobsazeno' })), CTX))[0];
    expect(a.razitko).toBe('NEPROŠLO');
    expect(a.veta).toContain('neobsadil');
    expect(a.veta).toContain('složená');
  });
});
