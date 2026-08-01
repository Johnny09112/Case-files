// @ts-check
/**
 * Testy skládání vstupu pro LLM (src/llm/prompt.js) — architektura §2.3,
 * ADR-004. Formát vstupu i systémový prompt se čtou VÝHRADNĚ z
 * prompty/protokol.md (jediný zdroj pravdy) — modul je nikde neduplikuje.
 *
 * Klíčové kontrakty testované tady:
 *  - Mad Libs: žádná jména hráčů (ctx.jmena) se do výstupu nedostanou, jen
 *    placeholdery „podezřelý A–D".
 *  - Systémový prompt se skutečně parsuje z reálného souboru (test selže,
 *    když se struktura protokol.md rozbije).
 *  - Tři nové řádky (MAX DOSAŽITELNÉ / ZÁCHRANA / PRAVIDLO RUNU) se objeví
 *    JEN, když je podklad v uzlových událostech skutečně přítomný.
 */
import { describe, it, expect } from 'vitest';
import { EVENT } from '../src/engine/events.js';
import { buildPromptInput, extractSystemPrompt, SYSTEM_PROMPT, llmCtxZObsahu } from '../src/llm/prompt.js';

const CTX = {
  jmena: { p1: 'Vincenc Bartoš', p2: 'Frank Kowalski' },
  veci: { a: 'Balík bankovek', b: 'Otrlený výraz', c: 'Zlaté hodinky', d: 'Banánový kanón' },
  situace: {
    's1': {
      nazev: 'Farmářův brod',
      text: 'Kola zapadla doprostřed brodu a na břehu už čeká farmář s vidlemi. {kdo} mu nabídl {VEC} za vytažení.',
    },
  },
  postihy: {
    'narazene-rameno': { nazev: 'Naražené rameno', text: 'Do kapes teď sahá pomaleji, než by chtěl.' },
  },
};

const ROLE = ['Zaplatit za vytažení', 'Nezvednout hlas', 'Zapřáhnout a táhnout', 'Kdyby začal vyvádět'];

/** Základní uzel: 2 zásahy, 2 selhání, žádný gamble/postih/stat_zrusen. */
function zakladniUzel(over = {}) {
  const {
    zasahy = [true, true, false, false],
    karty = ['a', 'b', 'c', 'd'],
    hraci = ['p1', 'p2', 'p1', 'p2'],
    duvody = ['proslo', 'proslo', 'nizky_stat', 'nizky_stat'],
    pasmo = '2/4_S_NASLEDKY',
    extra = [],
  } = over;
  return [
    {
      seq: 1, nodeIndex: 3, type: EVENT.SITUATION_REVEALED, situace_id: 's1', typ: 'npc', typ_mista: 'npc',
      sloty: ROLE.map((role, i) => ({
        slot_index: i, role, stat: i === 2 ? 'nastroj' : i === 3 ? 'utok' : i === 0 ? 'hodnota' : 'obrana',
        kotva: 3, viditelnost: i === 3 ? 'skryta' : 'viditelna',
      })),
    },
    ...ROLE.map((_, i) => ({
      seq: 2 + i, nodeIndex: 3, type: EVENT.SLOT_RESOLVED, slot_index: i,
      karta_id: karty[i], hrac_id: karty[i] == null ? null : hraci[i],
      stat: i === 2 ? 'nastroj' : i === 3 ? 'utok' : i === 0 ? 'hodnota' : 'obrana',
      stat_hodnota: zasahy[i] ? 5 : 1,
      prah: 3, typ_prahu: 'jednostat', viditelnost: i === 3 ? 'skryta' : 'viditelna',
      zasah: zasahy[i], duvod: duvody[i],
      pronasledovatel_efekt: duvody[i] === 'stat_zrusen' ? { typ: 'stat', cil: 'utok' } : null,
    })),
    {
      seq: 6, nodeIndex: 3, type: EVENT.BAND_RESOLVED,
      zasahy: zasahy.filter(Boolean).length, pasmo,
      max_achievable_zasahy: 3, max_achievable_band: '3/4_HLADCE', gap: 1,
      naklad_ztrata: 0, zbyva_beden: 6,
    },
    ...extra,
  ];
}

describe('extractSystemPrompt — parsuje ```-blok pod "## Systémový prompt"', () => {
  it('vytáhne text bloku', () => {
    const md = [
      '# Prompt',
      '## Systémový prompt (v0.3)',
      '',
      '```',
      'Řádek jedna.',
      'Řádek dva.',
      '```',
      '',
      '## Formát vstupu',
    ].join('\n');
    expect(extractSystemPrompt(md)).toBe('Řádek jedna.\nŘádek dva.');
  });

  it('spadne česky, když nadpis chybí (rozbitá struktura souboru)', () => {
    expect(() => extractSystemPrompt('# Prompt\nbez nadpisu\n```\nx\n```')).toThrow(/Systémový prompt/);
  });

  it('spadne, když pod nadpisem chybí ```-blok', () => {
    expect(() => extractSystemPrompt('## Systémový prompt\nžádný blok tady')).toThrow();
  });

  it('spadne, když je blok prázdný', () => {
    expect(() => extractSystemPrompt('## Systémový prompt\n```\n```\n')).toThrow();
  });

  it('SYSTEM_PROMPT (reálný prompty/protokol.md) se skutečně načetl a obsahuje pravidlo o placeholderech', () => {
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(50);
    expect(SYSTEM_PROMPT).toMatch(/podezřelý/);
    expect(SYSTEM_PROMPT).toMatch(/NIKDY neměníš výsledek/);
  });
});

describe('buildPromptInput — základní bloky dle formátu vstupu (protokol.md)', () => {
  const text = buildPromptInput(zakladniUzel(), CTX);

  it('SITUACE nese název, typ a úvod prózy (první věta, bez {kdo}/{VEC})', () => {
    expect(text).toMatch(/^SITUACE: Farmářův brod \(npc\) — Kola zapadla doprostřed brodu/);
    expect(text).not.toMatch(/\{kdo\}|\{VEC\}/);
  });

  it('pořadí bloků odpovídá v0.4 formátu: SITUACE, PRAVIDLO RUNU, ZÁCHRANA, ROZDĚLENÍ, VÝSLEDEK MECHANIKY, NÁSLEDKY', () => {
    const radky = text.split('\n');
    expect(radky[0]).toMatch(/^SITUACE:/);
    expect(radky[1]).toMatch(/^PRAVIDLO RUNU:/);
    expect(radky[2]).toMatch(/^ZÁCHRANA:/);
    expect(radky[3]).toBe('ROZDĚLENÍ:');
    const vysledekIdx = radky.findIndex((r) => r.startsWith('VÝSLEDEK MECHANIKY:'));
    const naslIdx = radky.findIndex((r) => r === 'NÁSLEDKY:');
    expect(vysledekIdx).toBeGreaterThan(3);
    expect(naslIdx).toBeGreaterThan(vysledekIdx);
  });

  it('PRAVIDLO RUNU a ZÁCHRANA se vypisují VŽDY — „—", když pro ně uzel nenese podklad', () => {
    expect(text).toContain('PRAVIDLO RUNU: —');
    expect(text).toContain('ZÁCHRANA: —');
  });

  it('ROZDĚLENÍ vypíše všechny 4 sloty s rolí, viditelností, placeholderem a věcí', () => {
    expect(text).toContain('ROZDĚLENÍ:');
    expect(text).toContain('Zaplatit za vytažení [viditelná]: podezřelý A — „Balík bankovek“');
    expect(text).toContain('Kdyby začal vyvádět [skrytá]: podezřelý B — „Banánový kanón“');
  });

  it('VÝSLEDEK MECHANIKY nese pásmo, MAX DOSAŽITELNÉ hned pod ním a per-slot zásah/selhání s prahem a statem', () => {
    expect(text).toContain('VÝSLEDEK MECHANIKY: pásmo S NÁSLEDKY 2/4\n  MAX DOSAŽITELNÉ: 3/4');
    expect(text).toContain('Zaplatit za vytažení: zásah (práh 3; „Balík bankovek“ mělo hodnota 5)');
    expect(text).toContain('Zapřáhnout a táhnout: selhání (práh 3; „Zlaté hodinky“ mělo nástroj 1)');
  });

  it('NÁSLEDKY: bez postihu/složení hlásí "žádné" / "—"', () => {
    expect(text).toContain('postihy: žádné');
    expect(text).toContain('složení: —');
  });

  it('bedny se berou přímo z band_resolved (naklad_ztrata/zbyva_beden), ne z externího stavu', () => {
    expect(text).toContain('bedny:   0; náklad 6');
  });

  it('žádné z jmen ctx.jmena se nikde neobjeví (Mad Libs kontrakt)', () => {
    for (const jmeno of Object.values(CTX.jmena)) {
      expect(text).not.toContain(jmeno);
      // ani samotné příjmení
      expect(text).not.toContain(jmeno.split(' ').at(-1));
    }
  });

  it('placeholdery jsou vázané na pořadí Object.keys(ctx.jmena), ne na pořadí slotů', () => {
    // p1 se v ctx.jmena objevuje první → „A“; p2 druhý → „B“.
    expect(text).toMatch(/Zaplatit za vytažení \[viditelná\]: podezřelý A/);
    expect(text).toMatch(/Nezvednout hlas \[viditelná\]: podezřelý B/);
  });
});

describe('buildPromptInput — GANGSTER auto-fail nese důvod', () => {
  it('slot s duvod gangster_auto_fail dostane „; důvod: zbraň na očích u NPC"', () => {
    const udalosti = zakladniUzel({ duvody: ['gangster_auto_fail', 'proslo', 'nizky_stat', 'nizky_stat'], zasahy: [false, true, false, false] });
    const text = buildPromptInput(udalosti, CTX);
    expect(text).toMatch(/Zaplatit za vytažení: selhání \(práh 3;.*; důvod: zbraň na očích u NPC\)/);
  });
});

describe('buildPromptInput — tři doplňkové položky formátu v0.4 (woz-test-2026-07-30.md §5e)', () => {
  it('MAX DOSAŽITELNÉ se objeví vždy, když ho band_resolved nese (engine ho loguje přímo)', () => {
    const text = buildPromptInput(zakladniUzel(), CTX);
    expect(text).toContain('MAX DOSAŽITELNÉ: 3/4');
  });

  it('ZÁCHRANA nese obě věci, když padla událost gamble; jinak zůstává „—"', () => {
    const bezGamblu = buildPromptInput(zakladniUzel(), CTX);
    expect(bezGamblu).toContain('ZÁCHRANA: —');

    const sGamblem = buildPromptInput(
      zakladniUzel({
        extra: [{
          seq: 5.5, nodeIndex: 3, type: EVENT.GAMBLE, ci_ruka: 'p1',
          zbyvajici_v_ruce: 2, tazena: 'c', nahrazena: 'd', nahrazena_hrac_id: 'p2', do_slotu: null,
        }],
      }),
      CTX
    );
    expect(sGamblem).toContain('ZÁCHRANA: líznuto „Zlaté hodinky“ místo „Banánový kanón“');
    expect(sGamblem).not.toContain('ZÁCHRANA: —');
  });

  it('PRAVIDLO RUNU jmenuje zrušený stat, když nějaký slot nese duvod stat_zrusen; jinak zůstává „—"', () => {
    const bezPravidla = buildPromptInput(zakladniUzel(), CTX);
    expect(bezPravidla).toContain('PRAVIDLO RUNU: —');

    const sPravidlem = buildPromptInput(
      zakladniUzel({ duvody: ['proslo', 'proslo', 'nizky_stat', 'stat_zrusen'], zasahy: [true, true, false, false] }),
      CTX
    );
    expect(sPravidlem).toContain('PRAVIDLO RUNU: pronásledovatel po celý run ruší stat „útok“');
    expect(sPravidlem).not.toContain('PRAVIDLO RUNU: —');
  });
});

describe('buildPromptInput — postihy a složení v NÁSLEDCÍCH', () => {
  it('postih se zapíše jako placeholder — nazev — (tier, fikce)', () => {
    const udalosti = zakladniUzel({
      extra: [{ seq: 5.5, nodeIndex: 3, type: EVENT.PENALTY_ADDED, hrac_id: 'p2', postih_id: 'narazene-rameno', kategorie: 'informacni', tier: 'lehky', aktivnich_po: 1 }],
    });
    const text = buildPromptInput(udalosti, CTX);
    expect(text).toContain('postihy: podezřelý B — „Naražené rameno“ (lehký, do kapes teď sahá pomaleji, než by chtěl)');
  });

  it('složení se zapíše jako placeholder leží v autě', () => {
    const udalosti = zakladniUzel({
      extra: [{ seq: 5.5, nodeIndex: 3, type: EVENT.CHARACTER_FOLDED, hrac_id: 'p1', kolo_od: 3, smazane_lehke: [], pretrvavaji_tezke: [] }],
    });
    const text = buildPromptInput(udalosti, CTX);
    expect(text).toMatch(/složení: podezřelý A leží v autě \(3\. postih\)/);
  });
});

describe('llmCtxZObsahu — staví ctx z parseContent() výstupu pro UI wiring', () => {
  const content = {
    veci: [{ id: 'a', nazev: 'Balík bankovek' }],
    situace: [{ id: 's1', nazev: 'Farmářův brod', text: 'Kola zapadla do brodu. {kdo} …' }],
    postihy: [{ id: 'p1', nazev: 'Naražené rameno', text: 'Bolí ho rameno.' }],
    pronasledovatele: [{ id: 'malone', lecka: { nazev: 'Most u Poughkeepsie', text: 'U mostu …' }, konfrontace: { nazev: 'Finále', text: 'Konečně …' } }],
  };

  it('vrací ploché veci a bohaté situace/postihy', () => {
    const ctx = llmCtxZObsahu(content, { p1: 'Vincenc Bartoš' }, 12);
    expect(ctx.veci.a).toBe('Balík bankovek');
    expect(ctx.situace.s1.nazev).toBe('Farmářův brod');
    expect(ctx.postihy.p1.text).toBe('Bolí ho rameno.');
    expect(ctx.kredityPo).toBe(12);
    expect(ctx.jmena).toEqual({ p1: 'Vincenc Bartoš' });
  });

  it('doplní vložená setkání (léčka/konfrontace) pod klíči "<id>-lecka"/"<id>-konfrontace"', () => {
    const ctx = llmCtxZObsahu(content);
    expect(ctx.situace['malone-lecka'].nazev).toBe('Most u Poughkeepsie');
    expect(ctx.situace['malone-konfrontace'].nazev).toBe('Finále');
  });
});

describe('buildPromptInput — chybějící resoluce spadne srozumitelně', () => {
  it('uzel bez situation_revealed/band_resolved vyhodí českou chybu', () => {
    expect(() => buildPromptInput([{ seq: 1, nodeIndex: 1, type: EVENT.CREDIT_FLOW, delta: 1, duvod: 'truhla', zustatek: 1 }], CTX)).toThrow(/resoluc/i);
  });
});
