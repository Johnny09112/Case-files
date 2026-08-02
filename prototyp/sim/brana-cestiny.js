// @ts-check
/**
 * Akceptační brána češtiny — prožene regresní baterii `prompty/protokol-testy.yaml`
 * reálným Anthropic API (produkční provider, žádný mock) a uloží výstupy do
 * `prototyp/logs/brana-cestiny-<datum>.md` pro LIDSKÉ hodnocení (protocol-humor-tester
 * / uživatel) — kvalita českého humoru se strojově neposuzuje (jen `ocekavani.musi`/
 * `nesmi` v baterii se sem propisují jako připomínka, co hlídat).
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
 * Načte a validuje baterii. `protokol-testy.yaml` je souběžně rozšiřovaný jiným
 * agentem (viz zadání) — parser je proto tolerantní ke KLÍČŮM navíc a hlásí jen
 * skutečně chybějící/nepoužitelnou strukturu (chybí `testy`, nebo test bez `vstup`).
 * @returns {{id: string, popis?: string, vstup: string, ocekavani?: {musi?: string[], nesmi?: string[]}}[]}
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
  const nepouzitelne = testy.filter((t) => typeof t?.vstup !== 'string' || typeof t?.id !== 'string');
  if (nepouzitelne.length > 0) {
    throw new Error(
      `${path.relative(MONOREPO_ROOT, cesta)}: ${nepouzitelne.length} test(ů) nemá „id" a/nebo „vstup" jako string — baterie se mezitím strukturálně rozešla se skriptem.`
    );
  }
  return testy;
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
 * @param {{test: {id: string, popis?: string, ocekavani?: {musi?: string[], nesmi?: string[]}}, text: string|null, chyba: string|null}[]} vysledky
 * @param {string} model
 * @param {number} [temperature] hodnota použitá pro tenhle běh (CLI `--temperature=` nebo default) —
 *   vypsáno do hlavičky logu, ať jde A/B kolo dohledat zpětně (návrh oprav bod 2)
 */
export function renderMd(vysledky, model, temperature) {
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
    '',
  ];
  for (const { test, text, chyba } of vysledky) {
    radky.push(`## ${test.id}`);
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
    try {
      const { text } = await provider.generate({ system: systemPrompt, prompt: test.vstup });
      vysledky.push({ test, text, chyba: null });
    } catch (chyba) {
      vysledky.push({ test, text: null, chyba: String(chyba?.message ?? chyba) });
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
