// @ts-check
/**
 * Vite vstupní bod LLM promptu (architektura §2.3, ADR-004): načte
 * `prompty/protokol.md` přes `?raw` a z něj vytáhne `SYSTEM_PROMPT`.
 *
 * Skládání vstupu (`buildPromptInput`/`llmCtxZObsahu`) i parser systémového
 * promptu (`extractSystemPrompt`) žijí v `prompt-input.js`/`system-prompt.js`
 * — čistá logika BEZ Vite závislosti, aby ji mohl použít i `sim/brana-cestiny.js`
 * (plain `node`, kam `?raw` import spadne hned na importu). Tenhle soubor je
 * jen re-exportuje, ať stávající volající (UI, testy) nemusí měnit cestu importu.
 *
 * Formát vstupu i systémový prompt jsou definované VÝHRADNĚ v
 * `prompty/protokol.md` — nikde se neduplikují jako text.
 */
import { extractSystemPrompt } from './system-prompt.js';
import { buildPromptInput, llmCtxZObsahu } from './prompt-input.js';
import protokolMd from '../../../prompty/protokol.md?raw';

export { extractSystemPrompt, buildPromptInput, llmCtxZObsahu };

/** Systémový prompt načtený z reálného `prompty/protokol.md` při startu modulu. */
export const SYSTEM_PROMPT = extractSystemPrompt(protokolMd);
