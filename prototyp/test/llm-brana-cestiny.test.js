// @ts-check
/**
 * Testy akceptační brány češtiny (sim/brana-cestiny.js). ŽÁDNÁ reálná síť —
 * `nactiBaterii`/`renderMd` se testují nad SYNTETICKÝMI daty (nezávisle na
 * aktuálním stavu prompty/protokol-testy.yaml, který ladí jiný agent souběžně
 * s touhle prací), a spuštění celého skriptu bez klíče se ověřuje jen jako
 * proces (mock cesta) — nikdy nevolá provider.generate() proti API.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nactiBaterii, renderMd, ziskejTeplotuZArgv, vstupProTest } from '../sim/brana-cestiny.js';

/** Minimální validní `udalosti`+`ctx` pro jeden uzel — dost pro buildPromptInput(). */
const UDALOSTI_MIN = [
  {
    type: 'situation_revealed', nodeIndex: 0, situace_id: 's1', typ: 'npc',
    sloty: [{ slot_index: 0, role: 'Role jedna' }],
  },
  {
    type: 'slot_resolved', nodeIndex: 0, slot_index: 0, karta_id: 'vec1', hrac_id: 'p1',
    stat: 'utok', stat_hodnota: 4, prah: 3, typ_prahu: 'jednostat', viditelnost: 'viditelna',
    zasah: true, duvod: 'proslo',
  },
  { type: 'band_resolved', nodeIndex: 0, pasmo: '2/4_S_NASLEDKY', zasahy: 1, naklad_ztrata: 0, zbyva_beden: 6 },
];
const CTX_MIN = {
  jmena: { p1: 'Vincenc Bartoš' },
  veci: { vec1: 'Zlaté hodinky' },
  situace: { s1: { nazev: 'Situace jedna', text: 'Úvod situace.' } },
  postihy: {},
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKRIPT = path.join(__dirname, '..', 'sim', 'brana-cestiny.js');

function docasnyYaml(obsah) {
  const soubor = path.join(os.tmpdir(), `brana-cestiny-test-${Date.now()}-${Math.random().toString(36).slice(2)}.yaml`);
  fs.writeFileSync(soubor, obsah, 'utf8');
  return soubor;
}

describe('nactiBaterii — synteticky, nezávisle na aktuálním obsahu protokol-testy.yaml', () => {
  it('načte platnou baterii', () => {
    const soubor = docasnyYaml(`
testy:
  - id: test-a
    popis: "ukázkový případ"
    vstup: "SITUACE: X (npc) — úvod\\nROZDĚLENÍ:\\n  role: podezřelý A"
    ocekavani:
      musi: ["něco"]
      nesmi: ["něco jiného"]
`);
    const testy = nactiBaterii(soubor);
    expect(testy).toHaveLength(1);
    expect(testy[0].id).toBe('test-a');
    expect(testy[0].vstup).toMatch(/^SITUACE/);
  });

  it('chybějící klíč "testy" spadne českou hláškou (ne stacktrace)', () => {
    const soubor = docasnyYaml('nic_uzitecneho: 1\n');
    expect(() => nactiBaterii(soubor)).toThrow(/klíč „testy"/);
  });

  it('test bez "vstup"/"id" spadne českou hláškou', () => {
    const soubor = docasnyYaml(`
testy:
  - popis: "bez id a vstupu"
`);
    expect(() => nactiBaterii(soubor)).toThrow(/nemá „id"/);
  });

  it('rozbitý YAML (syntax error) spadne česky přebalenou hláškou, ne syrovou js-yaml výjimkou', () => {
    // Přesně třída chyby, na kterou aktuálně narazil reálný prompty/protokol-testy.yaml
    // (vnořená ASCII uvozovka uvnitř YAML dvojitě uvozeného scalaru).
    const soubor = docasnyYaml('testy:\n  - id: x\n    vstup: "obsahuje "vnořenou" uvozovku"\n');
    expect(() => nactiBaterii(soubor)).toThrow(/YAML se nedá naparsovat/);
  });

  it('toleruje neznámé klíče navíc (baterie se souběžně rozšiřuje jiným agentem)', () => {
    const soubor = docasnyYaml(`
testy:
  - id: test-a
    vstup: "SITUACE: X"
    novy_klic_o_kterem_nevime: 42
kompletne_jiny_top_level_klic:
  - cokoli
`);
    expect(() => nactiBaterii(soubor)).not.toThrow();
  });

  it('přijme case s „udalosti"+„ctx" MÍSTO ručního „vstup" (normální cesta po D55 opravě)', () => {
    const soubor = docasnyYaml(`
testy:
  - id: test-strukturovany
    udalosti:
      - {type: situation_revealed, nodeIndex: 0, situace_id: s1, typ: npc, sloty: [{slot_index: 0, role: "Role jedna"}]}
      - {type: slot_resolved, nodeIndex: 0, slot_index: 0, karta_id: vec1, hrac_id: p1, stat: utok, stat_hodnota: 4, prah: 3, typ_prahu: jednostat, viditelnost: viditelna, zasah: true, duvod: proslo}
      - {type: band_resolved, nodeIndex: 0, pasmo: "2/4_S_NASLEDKY", zasahy: 1, naklad_ztrata: 0, zbyva_beden: 6}
    ctx:
      jmena: {p1: "Vincenc Bartoš"}
      veci: {vec1: "Zlaté hodinky"}
      situace: {s1: {nazev: "Situace jedna", text: "Úvod situace."}}
`);
    const testy = nactiBaterii(soubor);
    expect(testy).toHaveLength(1);
    expect(testy[0].vstup).toBeUndefined();
    expect(testy[0].udalosti).toHaveLength(3);
  });

  it('case bez „vstup" A bez „udalosti"+„ctx" spadne českou hláškou', () => {
    const soubor = docasnyYaml(`
testy:
  - id: test-prazdny
    popis: "nemá ani jedno, ani druhé"
`);
    expect(() => nactiBaterii(soubor)).toThrow(/nemá „id"/);
  });
});

describe('vstupProTest — vstup z buildPromptInput() (normální cesta) vs. ruční vstup (výjimka)', () => {
  it('case s „udalosti"+„ctx" postaví vstup přes buildPromptInput() a označí rucni: false', () => {
    const { vstup, rucni } = vstupProTest({ id: 'x', udalosti: UDALOSTI_MIN, ctx: CTX_MIN });
    expect(rucni).toBe(false);
    expect(vstup).toMatch(/^SITUACE: Situace jedna \(npc\) — Úvod situace\./);
    expect(vstup).toContain('Role jedna [viditelná]: podezřelý A — „Zlaté hodinky“');
  });

  it('case jen s ručním „vstup" ho vrátí beze změny a označí rucni: true', () => {
    const { vstup, rucni } = vstupProTest({ id: 'x', vstup: 'SITUACE: ručně psaná' });
    expect(rucni).toBe(true);
    expect(vstup).toBe('SITUACE: ručně psaná');
  });

  it('„udalosti" má přednost před ručním „vstup", je-li omylem uvedeno obojí', () => {
    const { vstup, rucni } = vstupProTest({ id: 'x', vstup: 'STARÝ RUČNÍ TEXT', udalosti: UDALOSTI_MIN, ctx: CTX_MIN });
    expect(rucni).toBe(false);
    expect(vstup).not.toContain('STARÝ RUČNÍ TEXT');
  });

  it('vadné „udalosti" (chybí situation_revealed/band_resolved) spadnou českou hláškou s id casu', () => {
    expect(() => vstupProTest({ id: 'vadny-case', udalosti: [{ type: 'credit_flow', delta: 1 }], ctx: CTX_MIN }))
      .toThrow(/vadny-case.*buildPromptInput\(\) selhalo/s);
  });
});

describe('renderMd — markdown výstup pro lidské hodnocení', () => {
  it('vypíše musí/nesmí a odpověď pro úspěšné volání', () => {
    const md = renderMd(
      [{ test: { id: 'case-1', popis: 'popis', ocekavani: { musi: ['A'], nesmi: ['B'] } }, text: 'Protokol text.', chyba: null }],
      'claude-haiku-4-5-20251001'
    );
    expect(md).toContain('## case-1');
    expect(md).toContain('**Musí:**');
    expect(md).toContain('- A');
    expect(md).toContain('**Nesmí:**');
    expect(md).toContain('- B');
    expect(md).toContain('Protokol text.');
    expect(md).toContain('claude-haiku-4-5-20251001');
  });

  it('vypíše CHYBA VOLÁNÍ, když selhalo API volání', () => {
    const md = renderMd([{ test: { id: 'case-2' }, text: null, chyba: 'timeout' }], 'model-x');
    expect(md).toContain('CHYBA VOLÁNÍ: timeout');
  });

  it('vypíše Temperature do hlavičky, když je zadaná (A/B kolo, návrh oprav bod 2)', () => {
    const md = renderMd([{ test: { id: 'case-1' }, text: 'text', chyba: null }], 'model-x', 0.7);
    expect(md).toContain('Temperature: 0.7');
  });

  it('bez zadané temperature hlavička řádek Temperature vůbec nemá (zpětná kompatibilita)', () => {
    const md = renderMd([{ test: { id: 'case-1' }, text: 'text', chyba: null }], 'model-x');
    expect(md).not.toContain('Temperature:');
  });

  it('case s rucni: true je v logu vyznačen „[RUČNÍ VSTUP — VÝJIMKA]" (A.1 — sim/brana-cestiny.js)', () => {
    const md = renderMd([{ test: { id: 'case-rucni' }, text: 'text', chyba: null, rucni: true }], 'model-x');
    expect(md).toContain('**[RUČNÍ VSTUP — VÝJIMKA]**');
    expect(md).toContain('Ručních vstupů v tomto běhu: 1/1.');
  });

  it('case s rucni: false (normální cesta buildPromptInput()) nenese žádnou výjimečnou značku u sebe ani v souhrnu', () => {
    const md = renderMd([{ test: { id: 'case-normalni' }, text: 'text', chyba: null, rucni: false }], 'model-x');
    // legenda v hlavičce vysvětluje značku obecně (v code-spanu ``...``) — ta smí být přítomná vždy;
    // per-case tučná značka a souhrnný řádek počtu se objeví JEN, když nějaký case rucni skutečně je.
    expect(md).not.toContain('**[RUČNÍ VSTUP — VÝJIMKA]**');
    expect(md).not.toContain('Ručních vstupů v tomto běhu');
  });
});

describe('ziskejTeplotuZArgv — CLI --temperature= (levné A/B bez editace kódu)', () => {
  it('rozparsuje --temperature=0.7 na číslo', () => {
    expect(ziskejTeplotuZArgv(['--temperature=0.7'])).toBe(0.7);
  });

  it('bez argumentu vrátí undefined (provider dosadí default)', () => {
    expect(ziskejTeplotuZArgv([])).toBeUndefined();
  });

  it('nesmyslnou hodnotu ignoruje a vrátí undefined', () => {
    expect(ziskejTeplotuZArgv(['--temperature=nesmysl'])).toBeUndefined();
  });

  it('funguje i mezi jinými argumenty', () => {
    expect(ziskejTeplotuZArgv(['node', 'sim/brana-cestiny.js', '--temperature=1'])).toBe(1);
  });
});

describe('sim/brana-cestiny.js — mock cesta (proces, žádná síť)', () => {
  it('bez klíče v prostředí skončí nenulovým exit kódem a BEZ stacktrace', () => {
    let vysledek;
    try {
      execFileSync('node', [SKRIPT], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, VITE_ANTHROPIC_API_KEY: '', ANTHROPIC_API_KEY: '' },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      vysledek = { spadl: false };
    } catch (chyba) {
      vysledek = { spadl: true, status: chyba.status, stderr: String(chyba.stderr ?? ''), stdout: String(chyba.stdout ?? '') };
    }
    // Skript musí selhat (klíč chybí, nebo — pokud je baterie zrovna rozbitá
    // souběžnou úpravou obsahu — selže na tom dřív; v obou případech čistě).
    expect(vysledek.spadl).toBe(true);
    expect(vysledek.status).not.toBe(0);
    expect(vysledek.stderr.length).toBeGreaterThan(0);
    // Žádný Node stacktrace marker ("    at ...(...:NN:NN)") v hlášce.
    expect(vysledek.stderr).not.toMatch(/^\s*at .+:\d+:\d+\)?\s*$/m);
  });
}, 15000);
