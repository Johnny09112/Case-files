// @ts-check
/**
 * Testy fragmentové vrstvy fallbacku (D54(1)) — src/ui/protocol-fragments.js.
 *
 * Co vrstva řeší: plochý placeholder {veci} vyjmenuje čtyři věci a mlčí o tom,
 * KTERÁ věc byla v KTERÉ roli a jak dopadla. Fragmentová vrstva skládá jednu
 * větu na slot z autorského fragmentu klíčovaného `duvod` (× volitelně stat).
 *
 * Dvě roviny testů:
 *   1) čistá logika nad SYNTETICKÝMI fragmenty (nesmí stát na obsahu),
 *   2) kontrakt nad REÁLNOU sadou prompty/fallback-fragmenty.yaml.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { load } from 'js-yaml';
import { EVENT } from '../src/engine/events.js';
import { createVyberSablon, zapisSituace } from '../src/ui/protocol-fill.js';
import {
  VYSLEDKY,
  POVOLENE_PLACEHOLDERY,
  stabilniIndex,
  createVyberFragmentu,
  vetaSlotu,
  zapisSloty,
} from '../src/ui/protocol-fragments.js';

const CESTA_FRAGMENTU = new URL('../../prompty/fallback-fragmenty.yaml', import.meta.url);
/** Obsahové kolo běží souběžně s kódovým (D54(1)) — sada tu být ještě nemusí. */
const MA_FRAGMENTY = fs.existsSync(CESTA_FRAGMENTU);
const REALNE_FRAGMENTY = MA_FRAGMENTY
  ? load(fs.readFileSync(CESTA_FRAGMENTU, 'utf8')).fragmenty
  : [];

/** Syntetické fragmenty — unit testy nesmí stát na obsahu. */
const FRAGMENTY = [
  { id: 'f-proslo-nastroj', vysledek: 'proslo', stat: 'nastroj', text: 'NÁSTROJ prošlo „{vec}“ k „{role}“.' },
  { id: 'f-proslo-utok', vysledek: 'proslo', stat: 'utok', text: 'ÚTOK prošlo „{vec}“ k „{role}“.' },
  { id: 'f-proslo-obecny-1', vysledek: 'proslo', text: 'OBECNĚ prošlo „{vec}“, hlásí podezřelý {jmeno}.' },
  { id: 'f-proslo-obecny-2', vysledek: 'proslo', text: 'OBECNĚ prošlo podruhé „{vec}“ k „{role}“.' },
  { id: 'f-nizky-obecny-1', vysledek: 'nizky_stat', text: 'SELHALO „{vec}“ k „{role}“.' },
  { id: 'f-nizky-obecny-2', vysledek: 'nizky_stat', text: 'SELHALO podruhé „{vec}“ k „{role}“.' },
  { id: 'f-neobsazeno-1', vysledek: 'neobsazeno', text: 'PRÁZDNO u „{role}“.' },
  { id: 'f-neobsazeno-vadny', vysledek: 'neobsazeno', text: 'VADNÝ: „{vec}“ nikdo nedodal.' },
];

const CTX = {
  seed: 42,
  jmena: { p1: 'Vincenc Bartoš', p2: 'Frank Kowalski' },
  veci: { a: 'Sochor', b: 'Obálka', c: 'Klíč', d: 'Bouchačka' },
  situace: { s1: 'Brod u farmy' },
  postihy: { 'rozdrcena-noha': 'Rozdrcená noha' },
};

const ROLE = ['Zaplatit za vytažení', 'Nezvednout hlas', 'Zapřáhnout a táhnout', 'Kdyby začal vyvádět'];

/** Události jednoho uzlu tak, jak je engine loguje (včetně rolí v odhalení). */
function udalostiUzlu({ pasmo = '3/4_HLADCE', duvody = ['proslo', 'proslo', 'nizky_stat', 'nizky_stat'], statySlotu = ['hodnota', 'obrana', 'nastroj', 'utok'], karty = ['a', 'b', 'c', 'd'] } = {}) {
  return [
    {
      seq: 1, nodeIndex: 2, type: EVENT.SITUATION_REVEALED, situace_id: 's1', typ: 'npc', typ_mista: 'npc',
      sloty: ROLE.map((role, i) => ({ slot_index: i, role, stat: statySlotu[i], kotva: 3, viditelnost: 'viditelna' })),
    },
    ...ROLE.map((_, i) => ({
      seq: 2 + i, nodeIndex: 2, type: EVENT.SLOT_RESOLVED, slot_index: i,
      karta_id: karty[i], hrac_id: karty[i] == null ? null : 'p1',
      stat: statySlotu[i], zasah: duvody[i] === 'proslo', duvod: duvody[i],
    })),
    { seq: 6, nodeIndex: 2, type: EVENT.BAND_RESOLVED, zasahy: 2, pasmo, max_achievable_zasahy: 3, gap: 1, naklad_ztrata: 0, zbyva_beden: 5 },
  ];
}

describe('stabilniIndex — deterministický výběr bez Math.random', () => {
  it('vrací index v rozsahu a pro týž klíč vždy totéž', () => {
    for (const klic of ['a', 'bb', 'seed:1|2|3', '']) {
      const i = stabilniIndex(klic, 7);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(7);
      expect(stabilniIndex(klic, 7)).toBe(i);
    }
  });

  it('rozdílné klíče index rozprostírají (ne vždy nula)', () => {
    const indexy = new Set(Array.from({ length: 40 }, (_, i) => stabilniIndex(`klic-${i}`, 5)));
    expect(indexy.size).toBeGreaterThan(1);
  });

  it('prázdný seznam nespadne', () => {
    expect(stabilniIndex('x', 0)).toBe(0);
  });
});

describe('createVyberFragmentu — přihrádky duvod × stat', () => {
  const vyber = createVyberFragmentu(FRAGMENTY);

  it('nikdy nesáhne po fragmentu klíčovaném na CIZÍ stat', () => {
    // 40 různých klíčů na stat `obrana`: ani jednou nesmí padnout nastroj/utok varianta.
    for (let i = 0; i < 40; i += 1) {
      const f = vyber('proslo', 'obrana', `k${i}`);
      expect(f?.stat ?? null).toBeNull();
    }
  });

  it('fragment klíčovaný na sedící stat je v poolu (padne aspoň jednou)', () => {
    const ids = new Set(Array.from({ length: 40 }, (_, i) => vyber('proslo', 'nastroj', `k${i}`)?.id));
    expect(ids.has('f-proslo-nastroj')).toBe(true);
    expect(ids.has('f-proslo-utok')).toBe(false);
  });

  it('kombi slot (stat = pole) bere jen obecné fragmenty', () => {
    const ids = new Set(Array.from({ length: 40 }, (_, i) => vyber('proslo', ['nastroj', 'improvizace'], `k${i}`)?.id));
    expect([...ids].every((id) => id?.startsWith('f-proslo-obecny'))).toBe(true);
  });

  it('prázdná přihrádka vrací null (žádná nouzová věta se nevymýšlí)', () => {
    expect(vyber('stat_zrusen', 'utok', 'k')).toBeNull();
  });

  it('`pouzite` odsune už použitý fragment, dokud je z čeho brát', () => {
    for (let i = 0; i < 40; i += 1) {
      const v = createVyberFragmentu(FRAGMENTY);
      expect(v('nizky_stat', null, `k${i}`, ['f-nizky-obecny-1'])?.id).toBe('f-nizky-obecny-2');
    }
  });

  it('vyčerpaný pool ustoupí na „jen ne poslední“ — věta je důležitější než rozmanitost', () => {
    for (let i = 0; i < 40; i += 1) {
      const v = createVyberFragmentu(FRAGMENTY);
      // Obě varianty použité, poslední byla `-2` → smí se zopakovat jen `-1`.
      expect(v('nizky_stat', null, `k${i}`, ['f-nizky-obecny-1', 'f-nizky-obecny-2'])?.id).toBe('f-nizky-obecny-1');
    }
  });

  it('runové počítadlo čerpá sadu rovnoměrně (nález: 1 fragment nesl 6 z 32 vět)', () => {
    // 40 losování téže přihrádky bez omezení uzlem: rozdíl mezi nejčastějším
    // a nejvzácnějším fragmentem smí být nejvýš 1.
    const v = createVyberFragmentu(FRAGMENTY);
    const pocty = {};
    for (let i = 0; i < 40; i += 1) {
      const f = v('proslo', 'hodnota', `k${i}`);
      pocty[f.id] = (pocty[f.id] ?? 0) + 1;
    }
    const hodnoty = Object.values(pocty);
    expect(Math.max(...hodnoty) - Math.min(...hodnoty)).toBeLessThanOrEqual(1);
  });

  it('`dostupne` vyřadí fragment žádající placeholder, který slot nemá', () => {
    // Neobsazený slot umí dosadit jen {role} → varianta s {vec} se NENABÍDNE
    // (dřív se vybrala a až po dosazení zahodila, čímž slot zmlkl).
    const v = createVyberFragmentu(FRAGMENTY);
    for (let i = 0; i < 40; i += 1) {
      expect(v('neobsazeno', null, `k${i}`, [], ['role'])?.id).toBe('f-neobsazeno-1');
    }
  });

  it('přidání nesouvisejícího fragmentu nepřerovná volby v jiné přihrádce', () => {
    // Rendezvous hash: volba je vázaná na id fragmentu, ne na index v poli.
    const klice = Array.from({ length: 10 }, (_, i) => `n|${i}`);
    const pred = klice.map((k) => createVyberFragmentu(FRAGMENTY)('nizky_stat', null, k)?.id);
    const rozsirene = [...FRAGMENTY, { id: 'f-proslo-navic', vysledek: 'proslo', text: 'NOVÝ „{vec}“.' }];
    const po = klice.map((k) => createVyberFragmentu(rozsirene)('nizky_stat', null, k)?.id);
    expect(po).toEqual(pred);
  });

  it('seed runu mění volbu — dva runy nedostanou tutéž větu na týž slot', () => {
    const a = createVyberFragmentu(FRAGMENTY, 1);
    const b = createVyberFragmentu(FRAGMENTY, 2);
    const klice = Array.from({ length: 12 }, (_, i) => `2|${i}|a|proslo`);
    expect(klice.map((k) => a('proslo', 'hodnota', k)?.id)).not.toEqual(klice.map((k) => b('proslo', 'hodnota', k)?.id));
  });
});

describe('vetaSlotu — dosazení a kontrakt placeholderů', () => {
  const vyber = createVyberFragmentu(FRAGMENTY);
  const u = (over) => ({ nodeIndex: 2, slot_index: 2, karta_id: 'c', hrac_id: 'p1', stat: 'nastroj', duvod: 'proslo', ...over });

  it('dosadí název věci, roli slotu i příjmení vlastníka', () => {
    const vsechny = createVyberFragmentu([
      { id: 'f-vse', vysledek: 'proslo', text: 'K „{role}“ šel „{vec}“; hlásí podezřelý {jmeno}.' },
    ]);
    const { text } = vetaSlotu(u(), 'Zapřáhnout a táhnout', CTX, vsechny);
    expect(text).toBe('K „Zapřáhnout a táhnout“ šel „Klíč“; hlásí podezřelý Bartoš.');
  });

  it('{jmeno} je PŘÍJMENÍ, ne celé jméno (kontrakt CLAUDE.md)', () => {
    const vyberJmeno = createVyberFragmentu([
      { id: 'f-j', vysledek: 'proslo', text: 'Hlásí podezřelý {jmeno}.' },
    ]);
    expect(vetaSlotu(u(), 'R', CTX, vyberJmeno).text).toBe('Hlásí podezřelý Bartoš.');
  });

  it('neobsazený slot nedosazuje ani věc, ani jméno — vadný fragment se zahodí', () => {
    const prazdny = u({ karta_id: null, hrac_id: null, duvod: 'neobsazeno' });
    // Pool má jeden platný a jeden vadný fragment; přes všechny klíče nesmí
    // z vadného nikdy projít věta s nedosazeným {vec}.
    for (let i = 0; i < 40; i += 1) {
      const veta = vetaSlotu({ ...prazdny, slot_index: i }, 'Nezvednout hlas', CTX, vyber);
      if (veta === null) continue;
      expect(veta.text).not.toMatch(/\{\w+\}/);
      expect(veta.text).toBe('PRÁZDNO u „Nezvednout hlas“.');
    }
  });

  it('chybějící přihrádka nevyrobí větu (radši ticho než výmysl)', () => {
    expect(vetaSlotu(u({ duvod: 'gangster_auto_fail' }), 'R', CTX, vyber)).toBeNull();
  });

  it('týž slot ZNOVU PŘEHRANÉHO runu dá tutéž větu (determinismus)', () => {
    // Determinismus = reprodukovatelnost runu od začátku, ne stálost odpovědi
    // téhož výběru: ten si vede runové počítadlo a záměrně se posouvá.
    const a = vetaSlotu(u(), 'Zapřáhnout a táhnout', CTX, createVyberFragmentu(FRAGMENTY, 7));
    const b = vetaSlotu(u(), 'Zapřáhnout a táhnout', CTX, createVyberFragmentu(FRAGMENTY, 7));
    expect(a.text).toBe(b.text);
  });
});

describe('zapisSloty — věta na slot, v pořadí slotů', () => {
  const vyber = createVyberFragmentu(FRAGMENTY);

  it('vyrobí větu ke každému slotu a drží pořadí slotů', () => {
    const vety = zapisSloty(udalostiUzlu(), CTX, vyber);
    expect(vety).toHaveLength(4);
    expect(vety[0]).toContain('Zaplatit za vytažení');
    expect(vety[3]).toContain('Kdyby začal vyvádět');
  });

  it('slot bez pokryté přihrádky se vynechá, ostatní zůstanou', () => {
    const vety = zapisSloty(udalostiUzlu({ duvody: ['proslo', 'stat_zrusen', 'nizky_stat', 'proslo'] }), CTX, vyber);
    expect(vety).toHaveLength(3);
  });

  it('čtyři věty jednoho uzlu neopakují týž fragment (jinak odstavec zní jako formulář)', () => {
    // Čtyři sloty se stejným výsledkem i statem: bez ochrany by hash klidně
    // vybral týž fragment třikrát — přesně to golden nad reálným runem ukázal.
    const vety = zapisSloty(
      udalostiUzlu({ duvody: ['proslo', 'proslo', 'proslo', 'proslo'], statySlotu: ['hodnota', 'hodnota', 'hodnota', 'hodnota'] }),
      CTX,
      vyber
    );
    expect(vety).toHaveLength(4);
    // Pool pro `hodnota` = 2 obecné fragmenty → čtyři sloty se musí střídat,
    // ale žádné dvě SOUSEDNÍ věty nesmí být z téhož fragmentu.
    const tvary = vety.map((v) => v.replace(/„[^“]*“/g, '×'));
    for (let i = 1; i < tvary.length; i += 1) expect(tvary[i]).not.toBe(tvary[i - 1]);
  });

  it('uzel bez slotů (truhla, motel) nevrací nic', () => {
    expect(zapisSloty([{ seq: 1, nodeIndex: 1, type: EVENT.CREDIT_FLOW ?? 'credit_flow' }], CTX, vyber)).toEqual([]);
  });
});

describe('zapisSituace — zapojení fragmentové vrstvy do protokolu', () => {
  const SABLONY = [
    { id: 't-hladce-veci', pasmo: '3/4_HLADCE', text: 'HLADCE, kusy: {veci}.' },
    { id: 't-hladce-bez', pasmo: '3/4_HLADCE', text: 'HLADCE bez výčtu.' },
  ];

  it('bez fragmentové vrstvy se protokol nemění (zpětná kompatibilita)', () => {
    const odstavce = zapisSituace(udalostiUzlu(), CTX, createVyberSablon(SABLONY, () => 0));
    expect(odstavce).toHaveLength(1);
    expect(odstavce[0]).toContain('Sochor');
  });

  it('s fragmentovou vrstvou přibude odstavec ZA pásmovým', () => {
    const odstavce = zapisSituace(udalostiUzlu(), CTX, createVyberSablon(SABLONY, () => 0), createVyberFragmentu(FRAGMENTY));
    expect(odstavce).toHaveLength(2);
    expect(odstavce[0]).toMatch(/^HLADCE/);
    expect(odstavce[1]).toContain('Zaplatit za vytažení');
  });

  /**
   * Preference `bezVeci` byla po měření ZRUŠENA (viz JSDoc `createVyberSablon`):
   * půlila pásmové zásobníky a v PRŮŠVIHU umlčela hlášení o ztracené bedně.
   * Test drží, že se nevrátila jako runtime filtr — dvojí výčet řeší přepis sady.
   */
  it('fragmentová vrstva NEOVLIVŇUJE výběr pásmové šablony', () => {
    const bez = zapisSituace(udalostiUzlu(), CTX, createVyberSablon(SABLONY, () => 0));
    const s = zapisSituace(udalostiUzlu(), CTX, createVyberSablon(SABLONY, () => 0), createVyberFragmentu(FRAGMENTY));
    expect(s[0]).toBe(bez[0]);
  });

  it('žádný odstavec nenechá nedosazený placeholder', () => {
    for (const odstavec of zapisSituace(udalostiUzlu(), CTX, createVyberSablon(SABLONY, () => 0), createVyberFragmentu(FRAGMENTY))) {
      expect(odstavec).not.toMatch(/\{\w+\}/);
    }
  });
});

describe.skipIf(!MA_FRAGMENTY)('kontrakt reálné sady prompty/fallback-fragmenty.yaml', () => {
  /**
   * Mandát D54(1) zněl ~20–30. Po review zvednuto na 42 (strop v hlavičce sady)
   * z expozičního důvodu: pásmová vrstva losuje ~9× za run, fragmentová ~36× —
   * stejný rozpočet při 4× expozici garantuje refrén. Rezerva na jednu opravnou
   * dvojici, dál se opravuje PŘEPISEM, ne přírůstkem.
   */
  it('drží strop sady (~40–42, +rezerva)', () => {
    expect(REALNE_FRAGMENTY.length).toBeGreaterThanOrEqual(38);
    expect(REALNE_FRAGMENTY.length).toBeLessThanOrEqual(44);
  });

  it('id jsou unikátní a kebab-case', () => {
    const ids = REALNE_FRAGMENTY.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('`vysledek` je vždy hodnota, kterou engine skutečně loguje', () => {
    for (const f of REALNE_FRAGMENTY) expect(VYSLEDKY).toContain(f.vysledek);
  });

  it('každá přihrádka má aspoň dva OBECNÉ fragmenty (pojistka, když stat nesedí)', () => {
    for (const vysledek of VYSLEDKY) {
      const obecne = REALNE_FRAGMENTY.filter((f) => f.vysledek === vysledek && f.stat == null);
      expect(obecne.length, `přihrádka ${vysledek}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('`stat` je jen jeden z pěti statů (kombi sloty stat-klíčované fragmenty nedostávají)', () => {
    for (const f of REALNE_FRAGMENTY) {
      if (f.stat == null) continue;
      expect(['utok', 'obrana', 'hodnota', 'improvizace', 'nastroj']).toContain(f.stat);
    }
  });

  it('používá jen povolené placeholdery', () => {
    for (const f of REALNE_FRAGMENTY) {
      for (const [, klic] of f.text.matchAll(/\{(\w+)\}/g)) {
        expect(POVOLENE_PLACEHOLDERY, `${f.id}: {${klic}}`).toContain(klic);
      }
    }
  });

  it('přihrádka `neobsazeno` neuvádí ani věc, ani osobu (pravidlo N2 sady)', () => {
    for (const f of REALNE_FRAGMENTY.filter((x) => x.vysledek === 'neobsazeno')) {
      expect(f.text, f.id).not.toContain('{vec}');
      expect(f.text, f.id).not.toContain('{jmeno}');
    }
  });

  it('žádná ASCII uvozovka (rozbíjí YAML scalar — na tom shořela sada v2)', () => {
    for (const f of REALNE_FRAGMENTY) expect(f.text, f.id).not.toContain('"');
  });

  /**
   * Hlavička sady měří ŠABLONU, kdežto hráč čte text PO DOSAZENÍ (+20–30 znaků:
   * {role} ~16, {vec} ~19). Dokud se jednotka neurčila, „~60–120" a skutečných
   * 145 si odporovaly, aniž kdokoli porušil pravidlo. Testuje se obojí.
   */
  it('drží i strop po dosazení (150 znaků), ne jen strop šablony', () => {
    const nejdelsi = { vec: 'Rezervní pneumatika', role: 'Nedýchat, když jde kolem', jmeno: 'Kowalski' };
    for (const f of REALNE_FRAGMENTY) {
      const po = f.text.replace(/\{(\w+)\}/g, (c, k) => nejdelsi[k] ?? c);
      expect(po.length, `${f.id} po dosazení`).toBeLessThanOrEqual(150);
    }
  });

  it('fragment je JEDNA věta rozumné délky', () => {
    for (const f of REALNE_FRAGMENTY) {
      expect(f.text.length, f.id).toBeLessThanOrEqual(160);
      expect(f.text.trim().endsWith('.'), f.id).toBe(true);
      // Jedna věta = jedno ukončení věty; „…“ uvnitř uvozovek se nepočítá,
      // proto počítáme tečky/otazníky/vykřičníky mimo poslední znak.
      expect(f.text.trim().slice(0, -1), f.id).not.toMatch(/[.!?]\s/);
    }
  });

  it('žádný výhledový čas (pravidlo N5 sady — run může skončit tímhle uzlem)', () => {
    for (const f of REALNE_FRAGMENTY) {
      expect(f.text, f.id).not.toMatch(/do dalšího|nadále|potáhne|příště|pokračoval/i);
    }
  });

  it('nemluví o následcích, které patří pásmovému odstavci', () => {
    for (const f of REALNE_FRAGMENTY) {
      expect(f.text, f.id).not.toMatch(/bedn|kredit|Žár|žáru|postih/i);
    }
  });

  /**
   * D51: prahy se před vyhodnocením neukazují a protokol je nesmí prozradit
   * ani zpětně v podobě „scházely dva stupně". Sada je dnes čistá, ale bez
   * zámku je to autorská náhoda — D51 stálo čtyři průchody.
   */
  it('neprozrazuje čísla ani slovník prahů (D51)', () => {
    for (const f of REALNE_FRAGMENTY) {
      expect(f.text, f.id).not.toMatch(/\d/);
      expect(f.text, f.id).not.toMatch(/práh|prahu|kotv|šum/i);
    }
  });
});

/**
 * Tripwire proti tichému rozchodu s enginem: `VYSLEDKY` je ručně udržovaný
 * seznam. Když engine začne vydávat nový `duvod`, fragmentová vrstva o tom
 * druhu výsledku bez tohohle testu prostě MLČÍ (vysvetleni.js má na tutéž
 * třídu rizika `neznama()`; tady zmlknutí nikdo nepozná).
 */
describe('VYSLEDKY drží krok s enginem', () => {
  it('pokrývá přesně důvody, které resolve.js vydává', () => {
    const zdroj = fs.readFileSync(new URL('../src/engine/resolve.js', import.meta.url), 'utf8');
    const zEnginu = new Set([...zdroj.matchAll(/duvod:\s*(?:zasah\s*\?\s*)?'([a-z_]+)'/g)].map((m) => m[1]));
    // `resolve.js` staví část důvodů ternárně (`zasah ? 'proslo' : …`) — posbírej i ty.
    for (const m of zdroj.matchAll(/'([a-z_]+)'\s*:\s*rusiTohoto\s*\?\s*'([a-z_]+)'\s*:\s*'([a-z_]+)'/g)) {
      for (const d of m.slice(1)) zEnginu.add(d);
    }
    for (const duvod of zEnginu) expect(VYSLEDKY, `engine vydává '${duvod}'`).toContain(duvod);
  });
});
