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
import { nactiBaterii, renderMd } from '../sim/brana-cestiny.js';

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
