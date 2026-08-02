// @ts-check
/**
 * Akceptační brána češtiny — prožene regresní baterii `prompty/protokol-testy.yaml`
 * reálným Anthropic API (produkční provider, žádný mock) a uloží výstupy do
 * `prototyp/logs/brana-cestiny-<datum>.md` pro LIDSKÉ hodnocení (protocol-humor-tester
 * / uživatel) — kvalita českého humoru se strojově neposuzuje (jen `ocekavani.musi`/
 * `nesmi` v baterii se sem propisují jako připomínka, co hlídat).
 *
 * VSTUP SE STAVÍ Z buildPromptInput() (D55 A/B report, §Nula) — každý case definuje
 * scénář jako `ctx` + `udalosti` (stejný tvar jako reálný event log enginu), skript
 * je prožene TOUTÉ funkcí, kterou volá produkce (`src/llm/prompt-input.js`). Ručně
 * psaný `vstup` (string) je jen VÝJIMKA (historické casy, které se ještě nepřevedly) —
 * kdykoli se použije, log ho označí `[RUČNÍ VSTUP — VÝJIMKA]`, ať je hned vidět, který
 * výstup neprošel stejnou cestou jako hra. Důvod: baterie psaná rukou byla opakovaně
 * vlídnější než to, co posílá `buildPromptInput()` v produkci (chybějící `důvod:`
 * u slotů, jiné znění `PRAVIDLO RUNU`) — třetí doložený nález téže třídy.
 *
 * NIKDY se nespouští automaticky (ne v CI, ne v `npm test`) — je to placené volání
 * skutečného modelu. `logs/` je v .gitignore.
 *
 * Použití:
 *   npm run test:cestina
 * Vyžaduje `VITE_ANTHROPIC_API_KEY` (nebo `ANTHROPIC_API_KEY`) v prostředí — skript
 * běží jako čistý Node proces mimo Vite, takže `.env.local` sám nečte; klíč musí být
 * exportovaný v shellu, který skript spouští. Bez klíče skončí čitelnou českou
 * hláškou a nenulovým exit kódem — NIKDY nepadá stacktracem.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { load } from 'js-yaml';
import { createAnthropicProvider } from '../src/llm/providers/anthropic.js';
import { extractSystemPrompt } from '../src/llm/system-prompt.js';
import { buildPromptInput } from '../src/llm/prompt-input.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(REPO_ROOT, '..');
const BATERIE_CESTA = path.join(MONOREPO_ROOT, 'prompty', 'protokol-testy.yaml');
const PROTOKOL_MD_CESTA = path.join(MONOREPO_ROOT, 'prompty', 'protokol.md');
const LOGS_DIR = path.join(REPO_ROOT, 'logs');

// `src/llm/prompt.js` (SYSTEM_PROMPT) čte protokol.md přes Vite `?raw` import,
// který plain `node` neumí (spadne hned na importu — dřív, než dojde na hlášku
// „klíč není nastaven"). Tenhle skript proto čte stejný soubor přes `fs`
// a použije STEJNÝ parser (`extractSystemPrompt`), jen jinou cestou k textu.
function nactiSystemPrompt() {
  return extractSystemPrompt(fs.readFileSync(PROTOKOL_MD_CESTA, 'utf8'));
}

/**
 * Test je strojově použitelný, když má `id` a K TOMU buď (a) `udalosti` +
 * `ctx` — normální cesta, vstup postaví `buildPromptInput()` stejně jako
 * produkce — nebo (b) ruční `vstup` (string) — VÝJIMKA pro casy, které se
 * ještě nepřevedly (viz hlavička souboru); `renderMd` ji v logu vyznačí.
 * @param {object} t
 */
function jePouzitelnyTest(t) {
  if (typeof t?.id !== 'string') return false;
  if (typeof t?.vstup === 'string') return true;
  return Array.isArray(t?.udalosti) && t.udalosti.length > 0 && typeof t?.ctx === 'object' && t.ctx !== null;
}

/**
 * Načte a validuje baterii. `protokol-testy.yaml` je souběžně rozšiřovaný jiným
 * agentem (viz zadání) — parser je proto tolerantní ke KLÍČŮM navíc a hlásí jen
 * skutečně chybějící/nepoužitelnou strukturu (chybí `testy`, nebo test bez
 * použitelného vstupu — ani `udalosti`+`ctx`, ani ruční `vstup`).
 * @returns {{id: string, popis?: string, vstup?: string, udalosti?: object[],
 *   ctx?: object, ocekavani?: {musi?: string[], nesmi?: string[]}}[]}
 */
export function nactiBaterii(cesta = BATERIE_CESTA) {
  let surovy;
  try {
    surovy = load(fs.readFileSync(cesta, 'utf8'));
  } catch (chyba) {
    // js-yaml sám hlásí anglicky a bez cesty k souboru — přebal na česky
    // srozumitelnou hlášku (pořád jen zpráva, ne stacktrace) s kontextem,
    // odkud přesně chyba je, ať se autor obsahu hned trefí do souboru.
    throw new Error(
      `${path.relative(MONOREPO_ROOT, cesta)}: YAML se nedá naparsovat (${chyba?.message ?? chyba}) — baterie není strojově použitelná, dokud se soubor neopraví.`
    );
  }
  const testy = Array.isArray(surovy?.testy) ? surovy.testy : null;
  if (!testy || testy.length === 0) {
    throw new Error(
      `${path.relative(MONOREPO_ROOT, cesta)}: klíč „testy" chybí nebo je prázdný — baterie není strojově použitelná, oprav strukturu nebo nahlas nález.`
    );
  }
  const nepouzitelne = testy.filter((t) => !jePouzitelnyTest(t));
  if (nepouzitelne.length > 0) {
    throw new Error(
      `${path.relative(MONOREPO_ROOT, cesta)}: ${nepouzitelne.length} test(ů) nemá „id" a k tomu ani „udalosti"+„ctx", ani ruční „vstup" jako string — baterie se mezitím strukturálně rozešla se skriptem.`
    );
  }
  return testy;
}

/**
 * Postaví vstup pro jeden test — VÝHRADNĚ přes `buildPromptInput()`, pokud
 * case nese `udalosti`+`ctx` (normální cesta, shodná s produkcí); ruční
 * `vstup` je jen výjimka (viz `jePouzitelnyTest`). `nactiBaterii()` už
 * zaručila, že aspoň jedna z cest je dostupná.
 * @param {{id: string, vstup?: string, udalosti?: object[], ctx?: object}} test
 * @returns {{vstup: string, rucni: boolean}}
 */
export function vstupProTest(test) {
  if (Array.isArray(test.udalosti) && test.ctx) {
    try {
      return { vstup: buildPromptInput(test.udalosti, test.ctx), rucni: false };
    } catch (chyba) {
      throw new Error(`test „${test.id}": buildPromptInput() selhalo (${chyba?.message ?? chyba})`);
    }
  }
  return { vstup: test.vstup, rucni: true };
}

/**
 * Čte `--temperature=X` z argumentů příkazové řádky (levné A/B proti bráně
 * češtiny — návrh oprav bod 2, technika/brana-cestiny-vyhodnoceni-2026-08-02.md
 * — beze změny kódu). Neplatná/chybějící hodnota se tiše ignoruje, provider
 * pak sám dosadí `DEFAULT_TEMPERATURE`.
 * @param {string[]} [argv]
 * @returns {number|undefined}
 */
export function ziskejTeplotuZArgv(argv = process.argv.slice(2)) {
  const arg = argv.find((a) => a.startsWith('--temperature='));
  if (!arg) return undefined;
  const hodnota = Number(arg.slice('--temperature='.length));
  return Number.isFinite(hodnota) ? hodnota : undefined;
}

function dnesniDatum() {
  const d = new Date();
  const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * @param {{test: {id: string, popis?: string, ocekavani?: {musi?: string[], nesmi?: string[]}},
 *   text: string|null, chyba: string|null, rucni?: boolean}[]} vysledky
 * @param {string} model
 * @param {number} [temperature] hodnota použitá pro tenhle běh (CLI `--temperature=` nebo default) —
 *   vypsáno do hlavičky logu, ať jde A/B kolo dohledat zpětně (návrh oprav bod 2)
 */
export function renderMd(vysledky, model, temperature) {
  const pocetRucnich = vysledky.filter((v) => v.rucni).length;
  const radky = [
    '# Akceptační brána češtiny — výstupy k lidskému hodnocení',
    '',
    `Model: ${model}`,
    ...(temperature !== undefined ? [`Temperature: ${temperature}`] : []),
    `Datum: ${dnesniDatum()}`,
    `Počet testů: ${vysledky.length}`,
    '',
    'Kvalita humoru se NEposuzuje strojově (protocol-humor-tester / uživatel) —',
    'u každého testu je připomínka `musí`/`nesmí` z baterie, ať se hodnotí proti ní.',
    'Vstup normálně staví `buildPromptInput()` ze strukturovaných `udalosti`+`ctx`',
    '(shodně s produkcí); `[RUČNÍ VSTUP — VÝJIMKA]` znamená, že case ještě nese',
    'ručně psaný `vstup` a neprošel stejnou cestou jako hra.',
    ...(pocetRucnich > 0 ? [`Ručních vstupů v tomto běhu: ${pocetRucnich}/${vysledky.length}.`] : []),
    '',
  ];
  for (const { test, text, chyba, rucni } of vysledky) {
    radky.push(`## ${test.id}`);
    if (rucni) radky.push('', '**[RUČNÍ VSTUP — VÝJIMKA]** — neprošel `buildPromptInput()`.');
    if (test.popis) radky.push('', test.popis.trim());
    if (test.ocekavani?.musi?.length) {
      radky.push('', '**Musí:**', ...test.ocekavani.musi.map((m) => `- ${m}`));
    }
    if (test.ocekavani?.nesmi?.length) {
      radky.push('', '**Nesmí:**', ...test.ocekavani.nesmi.map((m) => `- ${m}`));
    }
    radky.push('', '**Výstup:**');
    radky.push('', chyba ? `CHYBA VOLÁNÍ: ${chyba}` : (text || '(prázdný výstup)'));
    radky.push('', '---', '');
  }
  return radky.join('\n');
}

async function main() {
  // Baterie a systémový prompt se načtou VŽDY, i bez klíče — skript má selhat
  // až na chybějícím klíči, ne dřív; usnadňuje to ověření „mock cesty" (skript
  // se spustí, baterii načte, teprve pak korektně skončí na chybějícím klíči).
  let testy;
  let systemPrompt;
  try {
    testy = nactiBaterii();
    systemPrompt = nactiSystemPrompt();
  } catch (chyba) {
    console.error(String(chyba?.message ?? chyba));
    process.exitCode = 1;
    return;
  }
  console.log(`Baterie načtena: ${testy.length} test(ů) z prompty/protokol-testy.yaml.`);

  const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(
      'Klíč není nastaven. Nastav VITE_ANTHROPIC_API_KEY (nebo ANTHROPIC_API_KEY) v prostředí, kde skript spouštíš, a zkus to znovu.\n' +
        'Skript čte proměnnou přímo z process.env — soubor .env.local sám nenačítá (běží mimo Vite).'
    );
    process.exitCode = 1;
    return;
  }

  const teplotaZArgv = ziskejTeplotuZArgv();
  const provider = createAnthropicProvider({ apiKey, temperature: teplotaZArgv });
  if (!provider) {
    console.error('Klíč byl předán, ale providera se z něj nepodařilo vytvořit — zkontroluj hodnotu VITE_ANTHROPIC_API_KEY.');
    process.exitCode = 1;
    return;
  }
  const teplota = provider.temperature;
  console.log(`Temperature: ${teplota}${teplotaZArgv !== undefined ? ' (z --temperature=)' : ' (default)'}`);

  const vysledky = [];
  for (const test of testy) {
    process.stdout.write(`… ${test.id}\n`);
    let vstup;
    let rucni;
    try {
      ({ vstup, rucni } = vstupProTest(test));
    } catch (chyba) {
      vysledky.push({ test, text: null, chyba: String(chyba?.message ?? chyba), rucni: false });
      continue;
    }
    try {
      const { text } = await provider.generate({ system: systemPrompt, prompt: vstup });
      vysledky.push({ test, text, chyba: null, rucni });
    } catch (chyba) {
      vysledky.push({ test, text: null, chyba: String(chyba?.message ?? chyba), rucni });
    }
  }

  fs.mkdirSync(LOGS_DIR, { recursive: true });
  const cilovySoubor = path.join(LOGS_DIR, `brana-cestiny-${dnesniDatum()}.md`);
  fs.writeFileSync(cilovySoubor, renderMd(vysledky, provider.model, teplota), 'utf8');
  console.log(`Hotovo — ${vysledky.length} výstupů uloženo do ${path.relative(REPO_ROOT, cilovySoubor)}.`);
  console.log('Hodnocení kvality češtiny/humoru je na člověku (protocol-humor-tester) — tenhle skript jen sbírá data.');
}

// Spustí se jen při přímém volání (`node sim/brana-cestiny.js`), ne při importu z testů.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
