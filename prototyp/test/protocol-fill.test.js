// @ts-check
/**
 * Testy čistého modulu výběru a dosazení v3 fallback šablon
 * (src/ui/protocol-fill.js). Typewriter se netestuje (jen efekt); herní logika
 * je v enginu, ne tady.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { load } from 'js-yaml';
import { EVENT } from '../src/engine/events.js';
import {
  prijmeni,
  frazeBeden,
  dosad,
  sedi,
  createVyberSablon,
  zapisSituace,
  zapisFinale,
  NOUZOVY_ZAZNAM,
  opravUvozovkySablon,
} from '../src/ui/protocol-fill.js';

const REALNE_SABLONY = load(
  opravUvozovkySablon(
    fs.readFileSync(new URL('../../prompty/fallback-sablony.yaml', import.meta.url), 'utf8')
  )
).sablony;

/** v3 sada už v obsahu je? (viz §8 návrhu — obsahové kolo běží souběžně) */
const MA_V3_SABLONY = REALNE_SABLONY.some((s) => s.pasmo === '3/4_HLADCE');

/** Deterministický zdroj náhody: vrací zadanou posloupnost dokola. */
function pevnyRand(hodnoty) {
  let i = 0;
  return () => hodnoty[i++ % hodnoty.length];
}

/** Syntetické v3 šablony — unit testy nesmí stát na obsahu. */
const SABLONY = [
  { id: 't-loot', pasmo: '4/4_HLADCE_LOOT', podminka: { postih: 'ne', bedna: 'ne' }, text: 'LOOT {jmeno} v {uzel}: {veci}. Náklad: {naklad}.' },
  { id: 't-hladce', pasmo: '3/4_HLADCE', podminka: { postih: 'ne', bedna: 'ne' }, text: 'HLADCE {jmeno} v {uzel}: {veci}. Náklad: {naklad}.' },
  { id: 't-nasledky', pasmo: '2/4_S_NASLEDKY', podminka: { postih: 'ano', bedna: 'ne' }, text: 'NÁSLEDKY {jmeno}: {postih}. Náklad: {naklad}.' },
  { id: 't-prusvih', pasmo: '≤1/4_PRUSVIH', podminka: { postih: 'ano', bedna: 'ano' }, text: 'PRŮŠVIH {jmeno}: {postih}, ztraceno {bedny}. Náklad: {naklad}.' },
  { id: 't-lecka', pasmo: 'lecka', text: 'LÉČKA v {uzel}.' },
  { id: 't-kolaps', pasmo: 'kolaps', text: 'KOLAPS {jmeno} v {uzel}.' },
  { id: 't-doruceno', pasmo: 'finale_doruceno', text: 'DORUČENO, náklad: {naklad}.' },
  { id: 't-nevyreseno', pasmo: 'finale_nevyreseno', text: 'NEVYŘEŠENO, náklad: {naklad}.' },
];

const CTX = { jmena: { p1: 'Vincenc Bartoš', p2: 'Frank Kowalski' }, veci: { a: 'Sochor', b: 'Obálka', c: 'Klíč', d: 'Bouchačka' }, situace: { s1: 'Brod u farmy' }, postihy: { 'rozdrcena-noha': 'Rozdrcená noha' } };

/** Události jednoho uzlu (tak, jak je enginu vypadne v logu). */
function udalostiUzlu({ pasmo = '3/4_HLADCE', naklad_ztrata = 0, zbyva_beden = 5, postih = null, kolaps = null, typ_mista = 'npc' } = {}) {
  const u = [
    { seq: 1, nodeIndex: 2, type: EVENT.SITUATION_REVEALED, situace_id: 's1', typ: 'npc', typ_mista, sloty: [] },
    ...['a', 'b', 'c', 'd'].map((karta, i) => ({ seq: 2 + i, nodeIndex: 2, type: EVENT.SLOT_RESOLVED, slot_index: i, karta_id: karta, hrac_id: i === 3 ? 'p2' : 'p1', zasah: i < 2, duvod: i < 2 ? 'proslo' : 'nizky_stat' })),
    { seq: 6, nodeIndex: 2, type: EVENT.BAND_RESOLVED, zasahy: 2, pasmo, max_achievable_zasahy: 3, gap: 1, naklad_ztrata, zbyva_beden },
  ];
  if (postih) u.push({ seq: 7, nodeIndex: 2, type: EVENT.PENALTY_ADDED, hrac_id: 'p1', postih_id: postih, tier: 'tezky', kategorie: 'zamkovy', efekt: { druh: 'lock_gamble' }, pricina: pasmo, aktivnich_po: 1 });
  if (kolaps) u.push({ seq: 8, nodeIndex: 2, type: EVENT.CHARACTER_FOLDED, hrac_id: kolaps, smazane_lehke: [], pretrvavaji_tezke: [] });
  return u;
}

describe('prijmeni / frazeBeden / dosad (beze změny proti v2)', () => {
  it('prijmeni bere poslední slovo (kontrakt {jmeno} z CLAUDE.md)', () => {
    expect(prijmeni('Vincenc Bartoš')).toBe('Bartoš');
    expect(prijmeni('  Cesare   Fontana  ')).toBe('Fontana');
  });
  it('frazeBeden skloňuje česky', () => {
    expect(frazeBeden(0)).toBe('žádná bedna');
    expect(frazeBeden(2)).toBe('dvě bedny');
    expect(frazeBeden(6)).toBe('šest beden');
    expect(frazeBeden(7)).toBe('7 beden');
  });
  it('dosad nechává neznámý placeholder být', () => {
    expect(dosad('{jmeno} a {neco}', { jmeno: 'Mazur' })).toBe('Mazur a {neco}');
  });
});

describe('sedi — v3 podmínky (postih, bedna)', () => {
  it('vynechaný klíč = jakkoli', () => {
    expect(sedi({ podminka: undefined }, { postih: true, bedna: false })).toBe(true);
  });
  it('uvedený klíč musí odpovídat', () => {
    expect(sedi({ podminka: { postih: 'ano', bedna: 'ne' } }, { postih: true, bedna: false })).toBe(true);
    expect(sedi({ podminka: { postih: 'ano', bedna: 'ne' } }, { postih: true, bedna: true })).toBe(false);
    expect(sedi({ podminka: { postih: 'ne' } }, { postih: true })).toBe(false);
  });
});

describe('zapisSituace — v3 pásma', () => {
  it('dosazuje všechny čtyři věci ve slotech, ne jednu kartu', () => {
    const [odstavec] = zapisSituace(udalostiUzlu(), CTX, createVyberSablon(SABLONY, pevnyRand([0])));
    expect(odstavec).toContain('Sochor');
    expect(odstavec).toContain('Obálka');
    expect(odstavec).toContain('Klíč');
    expect(odstavec).toContain('Bouchačka');
    expect(odstavec).not.toMatch(/\{\w+\}/);
  });

  it('pásmo s postihem dosazuje název postihu a jméno postiženého', () => {
    const [odstavec] = zapisSituace(udalostiUzlu({ pasmo: '2/4_S_NASLEDKY', postih: 'rozdrcena-noha' }), CTX, createVyberSablon(SABLONY, pevnyRand([0])));
    expect(odstavec).toContain('Rozdrcená noha');
    expect(odstavec).toContain('Bartoš');
  });

  it('PRŮŠVIH se ztrátou bedny dosazuje {bedny} i zůstatek {naklad}', () => {
    const [odstavec] = zapisSituace(udalostiUzlu({ pasmo: '≤1/4_PRUSVIH', postih: 'rozdrcena-noha', naklad_ztrata: 1, zbyva_beden: 4 }), CTX, createVyberSablon(SABLONY, pevnyRand([0])));
    expect(odstavec).toContain('jedna bedna');
    expect(odstavec).toContain('čtyři bedny');
  });

  it('vložené setkání dostává úvodní odstavec a kolaps vlastní', () => {
    const odstavce = zapisSituace(udalostiUzlu({ typ_mista: 'lecka', kolaps: 'p2' }), CTX, createVyberSablon(SABLONY, pevnyRand([0])));
    expect(odstavce).toHaveLength(3); // úvod + pásmo + kolaps
    expect(odstavce[0]).toContain('LÉČKA');
    expect(odstavce[2]).toContain('Kowalski');
    for (const o of odstavce) expect(o).not.toMatch(/\{\w+\}/);
  });

  it('bez vyhovující šablony vrací nouzový záznam, ne prázdno ani výjimku', () => {
    const odstavce = zapisSituace(udalostiUzlu({ pasmo: '4/4_HLADCE_LOOT', postih: 'rozdrcena-noha' }), CTX, createVyberSablon(SABLONY, pevnyRand([0])));
    expect(odstavce[0]).toBe(NOUZOVY_ZAZNAM);
  });
});

describe('zapisFinale', () => {
  it('DORUČENO i NEVYŘEŠENO mají šablonu a dosazený náklad', () => {
    const vyber = createVyberSablon(SABLONY, pevnyRand([0]));
    expect(zapisFinale({ vysledek: 'DORUCENO', zbyva_beden: 3 }, vyber)[0]).toContain('tři bedny');
    expect(zapisFinale({ vysledek: 'NEVYRESENO', zbyva_beden: 0 }, vyber)[0]).toContain('NEVYŘEŠENO');
  });
});

describe('opravUvozovkySablon (workaround nevalidního YAML v obsahu)', () => {
  it('escapuje vnitřní ASCII uvozovky v text: scalarech na typografické', () => {
    const vstup = '  - id: x\n    text: "postup „{veci}". Dál."';
    expect(() => load(opravUvozovkySablon(vstup))).not.toThrow();
  });
  it('validní řádky nechává beze změny', () => {
    const vstup = '  - id: x\n    text: "bez vnitřních uvozovek"\n    pasmo: 3/4_HLADCE';
    expect(opravUvozovkySablon(vstup)).toBe(vstup);
  });
});

// Až designový tým dodá v3 sadu (§8 návrhu), guard přestane platit sám.
describe.skipIf(!MA_V3_SABLONY)('reálné v3 šablony pokrývají, co engine umí vyrobit', () => {
  const kombinace = [
    ['4/4_HLADCE_LOOT', { postih: false, bedna: false }],
    ['3/4_HLADCE', { postih: false, bedna: false }],
    ['2/4_S_NASLEDKY', { postih: true, bedna: false }],
    ['≤1/4_PRUSVIH', { postih: true, bedna: true }],
    ['≤1/4_PRUSVIH', { postih: true, bedna: false }],
  ];
  it.each(kombinace)('%s %o má aspoň jednu šablonu', (pasmo, stav) => {
    expect(createVyberSablon(REALNE_SABLONY, pevnyRand([0]))(String(pasmo), stav).id).not.toBeNull();
  });

  it.each(['zatah', 'lecka', 'konfrontace', 'kolaps', 'finale_doruceno', 'finale_nevyreseno'])(
    'speciální pásmo %s má šablonu',
    (pasmo) => {
      expect(createVyberSablon(REALNE_SABLONY, pevnyRand([0]))(pasmo).id).not.toBeNull();
    }
  );

  it('vysokofrekvenční pásma mají ≥4 varianty (§8 návrhu)', () => {
    for (const pasmo of ['3/4_HLADCE', '2/4_S_NASLEDKY']) {
      expect(REALNE_SABLONY.filter((s) => s.pasmo === pasmo).length).toBeGreaterThanOrEqual(4);
    }
  });
});
