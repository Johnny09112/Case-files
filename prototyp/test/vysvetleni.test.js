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
    expect(a.veta).toContain('hodnotu');
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
    expect(a.detail).toContain('složená');
    expect(a.detail).toContain('zmenšenou ruku');
  });
});

const CTX_POSTIH = { ...CTX, postihy: { 'rozdrcena-noha': 'Rozdrcená noha', 'narazene-rameno': 'Naražené rameno', 'ochrnuta-ruka': 'Ochrnutá ruka' } };

describe('vysvetli — postihy (§5)', () => {
  it('penalty_added řekne za co, jaký tier a co postih dělá', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.PENALTY_ADDED, nodeIndex: 3, hrac_id: 'p1', postih_id: 'rozdrcena-noha', kategorie: 'zamkovy', tier: 'tezky', efekt: { druh: 'lock_slot_viditelnost', viditelnost: 'skryta' }, vyprsi_za: null, pricina: '≤1/4_PRUSVIH', aktivnich_po: 1 }), CTX_POSTIH))[0];
    expect(a.misto).toBe(MISTO.SPIS);
    expect(a.veta).toContain('Rozdrcená noha');
    expect(a.veta).toContain('těžký');
    expect(a.veta).toContain('zámkový');
    // Pásmo (pricina) musí být přeložené do češtiny, ne syrový interní kód (nález review 2).
    expect(a.veta).toContain('≤1/4 — průšvih');
    expect(a.veta).not.toContain('PRUSVIH');
    expect(a.detail).toContain('skryté role');
    expect(a.detail).toContain('do vyléčení');
  });

  it('penalty_added skloňuje „kolo" podle počtu (nález review 2)', () => {
    const zaklad = { type: EVENT.PENALTY_ADDED, nodeIndex: 1, hrac_id: 'p1', postih_id: 'narazene-rameno', kategorie: 'informacni', tier: 'lehky', efekt: { druh: 'hide_staty' }, pricina: '2/4_S_NASLEDKY', aktivnich_po: 1 };
    const veta = (vyprsi_za) => vsechny(vysvetli(log({ ...zaklad, vyprsi_za }), CTX_POSTIH))[0].detail;
    expect(veta(1)).toContain('vyprší za 1 kolo');
    expect(veta(2)).toContain('vyprší za 2 kola');
    expect(veta(4)).toContain('vyprší za 4 kola');
    expect(veta(5)).toContain('vyprší za 5 kol');
  });

  it('penalty_expired a penalty_healed se liší důvodem a cenou', () => {
    const anotace = vsechny(vysvetli(log(
      { type: EVENT.PENALTY_EXPIRED, hrac_id: 'p1', postih_id: 'narazene-rameno', duvod: 'cas' },
      { type: EVENT.PENALTY_HEALED, hrac_id: 'p1', postih_id: 'rozdrcena-noha', cena: 6 }
    ), CTX_POSTIH));
    expect(anotace[0].veta).toContain('Naražené rameno');
    expect(anotace[0].veta).toContain('vypršel');
    expect(anotace[1].veta).toContain('vyléčen v motelu za 6');
  });

  it('character_folded vysvětlí cap i to, že lehké se mažou a těžké zůstávají', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.CHARACTER_FOLDED, hrac_id: 'p1', kolo_od: 4, smazane_lehke: ['narazene-rameno'], pretrvavaji_tezke: ['rozdrcena-noha'] }), CTX_POSTIH))[0];
    expect(a.veta).toContain('Bartoš');
    expect(a.veta).toContain('třetí postih');
    expect(a.detail).toContain('Naražené rameno');
    expect(a.detail).toContain('Rozdrcená noha');
  });

  it('character_returned hlásí návrat do hry', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.CHARACTER_RETURNED, hrac_id: 'p1' }), CTX_POSTIH))[0];
    expect(a.veta).toContain('Bartoš');
    expect(a.veta).toContain('vrací');
  });
});

describe('vysvetli — řetězec přes uzly (§7 test 4)', () => {
  /** Postih vznikne v uzlu 3, auto-fail způsobí v uzlu 5 — odkaz musí ukázat zpátky. */
  const events = log(
    { type: EVENT.SITUATION_REVEALED, nodeIndex: 3, situace_id: 's1', typ: 'lokace', typ_mista: 'lokace', sloty: [slot()] },
    { type: EVENT.PENALTY_ADDED, nodeIndex: 3, hrac_id: 'p1', postih_id: 'rozdrcena-noha', kategorie: 'zamkovy', tier: 'tezky', efekt: { druh: 'lock_slot_viditelnost', viditelnost: 'skryta' }, vyprsi_za: null, pricina: '≤1/4_PRUSVIH', aktivnich_po: 1 },
    { type: EVENT.SLOT_RESOLVED, nodeIndex: 5, ...resolved({ zasah: false, duvod: 'postih_lock_viditelnost', postih_efekt: 'lock_slot_viditelnost', viditelnost: 'skryta', stat_hodnota: 0 }) }
  );

  it('zámkový auto-fail odkazuje na uzel, kde postih vznikl', () => {
    const a = vsechny(vysvetli(events, CTX_POSTIH)).at(-1);
    expect(a.veta).toContain('Rozdrcená noha');
    expect(a.odkaz.seq).toBe(2);
    expect(a.odkaz.popis).toContain('uzel 3');
    expect(a.odkaz.popis).toContain('Brod u farmy');
  });

  it('lock_stitek řekne, že zbraň neudržíš, a taky odkáže', () => {
    const s = log(
      { type: EVENT.PENALTY_ADDED, nodeIndex: 2, hrac_id: 'p1', postih_id: 'ochrnuta-ruka', kategorie: 'zamkovy', tier: 'tezky', efekt: { druh: 'lock_stitek', stitek: 'GANGSTER' }, vyprsi_za: null, pricina: '≤1/4_PRUSVIH', aktivnich_po: 1 },
      { type: EVENT.SLOT_RESOLVED, nodeIndex: 4, ...resolved({ karta_id: 'bouchacka', zasah: false, duvod: 'postih_lock_stitek', postih_efekt: 'lock_stitek', stitky: ['GANGSTER'], stat_hodnota: 0 }) }
    );
    const a = vsechny(vysvetli(s, CTX_POSTIH)).at(-1);
    expect(a.veta).toContain('Ochrnutá ruka');
    expect(a.veta).toContain('zbraň v ruce neudržíš');
    expect(a.veta).toContain('Bouchačka');
    expect(a.odkaz.seq).toBe(1);
  });

  it('dva aktivní postihy STEJNÉHO druhu efektu → odkaz ukazuje na novější (nález review 2)', () => {
    // p1 dostane lock_stitek dvakrát (nervy-v-hajzlu v uzlu 2, ochrnuta-ruka v uzlu 5) —
    // cap je 2, takže oba mohou být aktivní zároveň. Zpětný odkaz auto-failu
    // musí ukázat na ten NOVĚJŠÍ (uzel 5), ne na nejstarší shodu.
    const s = log(
      { type: EVENT.PENALTY_ADDED, nodeIndex: 2, hrac_id: 'p1', postih_id: 'nervy-v-hajzlu', kategorie: 'zamkovy', tier: 'lehky', efekt: { druh: 'lock_stitek', stitek: 'GANGSTER' }, vyprsi_za: 3, pricina: '2/4_S_NASLEDKY', aktivnich_po: 1 },
      { type: EVENT.PENALTY_ADDED, nodeIndex: 5, hrac_id: 'p1', postih_id: 'ochrnuta-ruka', kategorie: 'zamkovy', tier: 'tezky', efekt: { druh: 'lock_stitek', stitek: 'GANGSTER' }, vyprsi_za: null, pricina: '≤1/4_PRUSVIH', aktivnich_po: 2 },
      { type: EVENT.SLOT_RESOLVED, nodeIndex: 7, ...resolved({ karta_id: 'bouchacka', zasah: false, duvod: 'postih_lock_stitek', postih_efekt: 'lock_stitek', stitky: ['GANGSTER'], stat_hodnota: 0 }) }
    );
    const a = vsechny(vysvetli(s, { ...CTX_POSTIH, postihy: { ...CTX_POSTIH.postihy, 'nervy-v-hajzlu': 'Nervy v hajzlu' } })).at(-1);
    expect(a.veta).toContain('Ochrnutá ruka');
    expect(a.odkaz.seq).toBe(2);
    expect(a.odkaz.popis).toContain('uzel 5');
  });

  it('po vyléčení už další auto-fail na týž postih neodkazuje', () => {
    const s = [...events, { seq: 4, nodeIndex: 6, type: EVENT.PENALTY_HEALED, hrac_id: 'p1', postih_id: 'rozdrcena-noha', cena: 6 },
      { seq: 5, nodeIndex: 7, ...resolved({ zasah: false, duvod: 'postih_lock_viditelnost', postih_efekt: 'lock_slot_viditelnost', stat_hodnota: 0 }) }];
    const a = vsechny(vysvetli(s, CTX_POSTIH)).at(-1);
    expect(a.odkaz).toBeUndefined();
  });
});

describe('vysvetli — telegraf, pásmo, Žár, mapa, gamble, konec (§5)', () => {
  it('telegraf_derived přeloží signál na trend, skryté role a verdikt zbraně', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.TELEGRAF_DERIVED, signal_pravy: { trend: [{ slot_index: 0, stat: 'hodnota' }, { slot_index: 1, stat: 'obrana' }, { slot_index: 2, stat: 'nastroj' }], proti_srsti: 1, zbran_projde: 'jen_skryte', zbran_skryte: true, improv_skryte: false, zbran_slot_vyjimka: false }, signal_vyslany: {}, nevidi: ['p2'] }), CTX))[0];
    expect(a.misto).toBe(MISTO.SPIS);
    expect(a.veta).toContain('hodnota');
    expect(a.veta).toContain('obrana');
    expect(a.veta).toContain('nástroj');
    expect(a.veta).toContain('jedna skrytá role');
    expect(a.veta).toContain('Zbraň na očích neprojde');
    expect(a.detail).toContain('Kowalski');
  });

  it('band_resolved nese pásmo i learnabilitu z gap', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.BAND_RESOLVED, zasahy: 2, pasmo: '2/4_S_NASLEDKY', max_achievable_zasahy: 3, max_achievable_band: '3/4_HLADCE', gap: 1, naklad_ztrata: 0, zbyva_beden: 5 }), CTX))[0];
    expect(a.veta).toContain('2/4');
    expect(a.detail).toContain('TÉHOŽ commitu');
    expect(a.detail).toContain('3/4');
    expect(a.detail).toContain('na stole');
  });

  it('band_resolved bez mezery learnabilitu nevymýšlí', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.BAND_RESOLVED, zasahy: 3, pasmo: '3/4_HLADCE', max_achievable_zasahy: 3, max_achievable_band: '3/4_HLADCE', gap: 0, naklad_ztrata: 0, zbyva_beden: 5 }), CTX))[0];
    expect(a.detail).toContain('nejlepší možné');
    expect(a.detail).not.toContain('na stole');
  });

  it('zar_move hlásí důvod a překročený práh', () => {
    const anotace = vsechny(vysvetli(log(
      { type: EVENT.ZAR_MOVE, delta: 2, duvod: 'prusvih', nova_pozice: 4, prah_prekrocen: 'zatah' },
      { type: EVENT.ZAR_MOVE, delta: 1, duvod: 'hlucne_GANGSTER', nova_pozice: 5, prah_prekrocen: null }
    ), CTX));
    expect(anotace[0].misto).toBe(MISTO.OKRAJ);
    expect(anotace[0].veta).toContain('o 2');
    expect(anotace[0].veta).toContain('práh Zátahu');
    expect(anotace[1].veta).toContain('zbraň');
  });

  it('map_move rozlišuje nabídku, volbu i odbočku do motelu', () => {
    const anotace = vsechny(vysvetli(log(
      { type: EVENT.MAP_MOVE, nabidnuto: [{ ref: 's1', typ_mista: 'lokace' }, { ref: 's2', typ_mista: 'npc' }], byl_zatah: false },
      { type: EVENT.MAP_MOVE, volba: 's1', typ_mista: 'lokace' },
      { type: EVENT.MAP_MOVE, motel_odbocka: { volba: 'ukryt' } }
    ), CTX));
    expect(anotace[0].veta).toContain('dvě cesty');
    expect(anotace[1].veta).toContain('lokace');
    expect(anotace[1].veta).toContain('zbraň');
    expect(anotace[2].veta).toContain('motel');
  });

  it('map_move přeloží syrový typ_mista do češtiny (nález review 1)', () => {
    // Jediný dřív testovaný typ byl `lokace`, což je náhodou i české slovo —
    // test to nechytil. `npc` odhalí, jestli se do věty dostává syrový kód.
    const a = vsechny(vysvetli(log(
      { type: EVENT.MAP_MOVE, volba: 's1', typ_mista: 'npc' }
    ), CTX))[0];
    expect(a.veta).toContain('člověk');
    expect(a.veta).not.toContain('npc');
  });

  it('gamble popíše výměnu a zpětně doplní, jak tažená karta dopadla', () => {
    const events = log(
      { type: EVENT.GAMBLE, ci_ruka: 'p1', zbyvajici_v_ruce: 3, tazena: 'klic', nahrazena: 'svara', do_slotu: null },
      { ...resolved({ karta_id: 'klic', zasah: true, duvod: 'proslo' }), type: EVENT.SLOT_RESOLVED }
    );
    const mapa = vysvetli(events, CTX);
    const a = mapa.get(1)[0];
    expect(a.veta).toContain('Sochor');
    expect(a.veta).toContain('Francouzský klíč');
    expect(a.detail).toContain('3');
    expect(a.detail).toContain('vyšla');
  });

  it('gamble nad PREFIXEM logu (bez navazujícího slot_resolved) anotaci má, ale nedoplní výsledek (nález review 2)', () => {
    // Stejná funkce se volá nad prefixem při živé hře i nad celým logem po
    // runu (§4.1) — v okamžiku sázky ještě není známo, jak tažená věc dopadla.
    const events = log(
      { type: EVENT.GAMBLE, ci_ruka: 'p1', zbyvajici_v_ruce: 3, tazena: 'klic', nahrazena: 'svara', do_slotu: null }
    );
    const a = vysvetli(events, CTX).get(1)[0];
    expect(a.veta).toContain('Sochor');
    expect(a.veta).toContain('Francouzský klíč');
    expect(a.detail).not.toContain('vyšla');
    expect(a.detail).not.toContain('nevyšla');
  });

  it('run_ended hlásí příčinu konce', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.RUN_ENDED, vysledek: 'NEVYRESENO', pricina: 'bedny_0', pocet_uzlu: 5, zbyva_beden: 0, konecny_zar: 8, kredity_zbytek: 2, cile: [] }), CTX))[0];
    expect(a.veta).toContain('NEVYŘEŠENO');
    expect(a.veta).toContain('bedny');
  });
});

/** Minimální payload per typ, aby handler měl na čem pracovat. */
const MINIMALNI_PAYLOAD = {
  [EVENT.RUN_STARTED]: { pronasledovatel: 'agent-malone', rusi: null },
  [EVENT.MAP_MOVE]: { nabidnuto: [{ ref: 's1', typ_mista: 'npc' }], byl_zatah: false },
  [EVENT.TELEGRAF_DERIVED]: { signal_pravy: { trend: [], proti_srsti: 0, zbran_projde: 'ano', zbran_skryte: false, improv_skryte: false, zbran_slot_vyjimka: false }, nevidi: [] },
  [EVENT.COMMIT]: { commit: [], rozdeleni: [] },
  [EVENT.SITUATION_REVEALED]: { situace_id: 's1', typ: 'npc', typ_mista: 'npc', sloty: [slot()] },
  [EVENT.ASSIGN_CONTEXT]: { situace_id: 's1', gamble_dostupny: true, gamble_blokovan: null, ruce: [] },
  [EVENT.ASSIGNMENT]: { prirazeni: [] },
  [EVENT.GAMBLE]: { ci_ruka: 'p1', zbyvajici_v_ruce: 2, tazena: 'klic', nahrazena: 'svara' },
  [EVENT.SLOT_RESOLVED]: resolved(),
  [EVENT.BAND_RESOLVED]: { zasahy: 3, pasmo: '3/4_HLADCE', max_achievable_zasahy: 3, max_achievable_band: '3/4_HLADCE', gap: 0, naklad_ztrata: 0, zbyva_beden: 6 },
  [EVENT.PENALTY_ADDED]: { hrac_id: 'p1', postih_id: 'x', kategorie: 'ztratovy', tier: 'lehky', efekt: { druh: 'ztrata_kreditu', kolik: 1 }, vyprsi_za: 'ihned', pricina: '2/4_S_NASLEDKY', aktivnich_po: 0 },
  [EVENT.PENALTY_EXPIRED]: { hrac_id: 'p1', postih_id: 'x', duvod: 'cas' },
  [EVENT.PENALTY_HEALED]: { hrac_id: 'p1', postih_id: 'x', cena: 6 },
  [EVENT.CHARACTER_FOLDED]: { hrac_id: 'p1', kolo_od: 1, smazane_lehke: [], pretrvavaji_tezke: [] },
  [EVENT.CHARACTER_RETURNED]: { hrac_id: 'p1' },
  [EVENT.CREDIT_FLOW]: { delta: 2, duvod: 'hladce', zustatek: 4 },
  [EVENT.ZAR_MOVE]: { delta: 1, duvod: 'prusvih', nova_pozice: 1, prah_prekrocen: null },
  [EVENT.GOAL_SCORED]: { hrac_id: 'p1', cil_id: 'c1', overeni_typ: 'mechanicky', splnen: true },
  [EVENT.RUN_ENDED]: { vysledek: 'DORUCENO', pricina: 'dojezd', pocet_uzlu: 7, zbyva_beden: 4, konecny_zar: 3, kredity_zbytek: 5, cile: [] },
};

describe('vysvetli — pokrytí enumu (§7 test 2, tripwire proti rozjetí vrstvy a enginu)', () => {
  it.each(Object.values(EVENT))('typ %s má registrovaný handler', (typ) => {
    // Registr, ne jen chování: události s prázdným handlerem (commit, assignment…)
    // by jinak testem prošly i kdyby handler chyběl úplně.
    expect(TYPY_S_HANDLEREM).toContain(typ);
  });

  it.each(Object.values(EVENT))('typ %s nespadne do „neznámá" ani s minimálním payloadem', (typ) => {
    const anotace = vsechny(vysvetli(log({ type: typ, ...MINIMALNI_PAYLOAD[typ] })));
    for (const a of anotace) expect(a.veta).not.toContain('neznámá událost');
  });
});
