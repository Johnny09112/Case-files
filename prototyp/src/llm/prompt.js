// @ts-check
/**
 * Skládání vstupu pro LLM protokol (architektura §2.3, ADR-004).
 *
 * Čistá funkce, bez sítě a DOM. Systémový prompt i formát vstupu jsou
 * definované VÝHRADNĚ v `prompty/protokol.md` — tenhle modul je nikde
 * neduplikuje, jen z markdownu vytáhne ```-blok pod „## Systémový prompt"
 * a z uzlových událostí sestaví text dle sekce „Formát vstupu" tamtéž.
 *
 * MAD LIBS KONTRAKT (CLAUDE.md, design-dokument.md §5): žádný volný text
 * hráčů ani jejich jména do promptu NEjdou. `ctx.jmena` se používá VÝHRADNĚ
 * k odvození stabilního pořadí placeholderů „podezřelý A–D" (pořadí
 * `Object.keys(ctx.jmena)` — tedy pořadí výběru postav na obrazovce setup,
 * ne pořadí, ve kterém se hráči objeví ve slotech uzlu). Samotné hodnoty
 * (celá jména) se do výstupu nikdy nedosazují.
 */
import { EVENT } from '../engine/events.js';
import { RULES } from '../engine/rules.js';
import { extractSystemPrompt } from './system-prompt.js';
import protokolMd from '../../../prompty/protokol.md?raw';

// Re-export: `test/llm-prompt.test.js` i případní další volající importují
// `extractSystemPrompt` odsud (historicky žila přímo tady) — skutečná
// implementace je teď ve `system-prompt.js`, aby ji šlo použít i mimo Vite
// (viz `sim/brana-cestiny.js`, který `?raw` import neumí).
export { extractSystemPrompt };

const STAT_LABEL = /** @type {Record<string,string>} */ ({
  utok: 'útok',
  obrana: 'obrana',
  hodnota: 'hodnota',
  improvizace: 'improvizace',
  nastroj: 'nástroj',
});

const PASMO_LABEL = /** @type {Record<string,string>} */ ({
  '4/4_HLADCE_LOOT': 'HLADCE+LOOT',
  '3/4_HLADCE': 'HLADCE',
  '2/4_S_NASLEDKY': 'S NÁSLEDKY',
  '≤1/4_PRUSVIH': 'PRŮŠVIH',
});

const TIER_LABEL = /** @type {Record<string,string>} */ ({ lehky: 'lehký', tezky: 'těžký' });
const VIDITELNOST_LABEL = /** @type {Record<string,string>} */ ({ viditelna: 'viditelná', skryta: 'skrytá' });

const ZAR_DUVOD_LABEL = /** @type {Record<string,string>} */ ({
  prusvih: 'PRŮŠVIH',
  s_nasledky: 'S NÁSLEDKY',
  hlucne_GANGSTER: 'tasená zbraň (GANGSTER, hlučné)',
  hlucne_utok: 'hlučný útok',
  konfrontace_prezita: 'přežitá konfrontace',
});

const CREDIT_DUVOD_LABEL = /** @type {Record<string,string>} */ ({
  truhla: 'truhla',
  hladce_loot: 'HLADCE+LOOT',
  hladce: 'HLADCE',
  smena: 'směna',
  leceni: 'léčení',
  ztratovy_postih: 'ztrátový postih',
});

/** Systémový prompt načtený z reálného `prompty/protokol.md` při startu modulu. */
export const SYSTEM_PROMPT = extractSystemPrompt(protokolMd);

/** @param {Record<string,string>} jmena */
function pismenaHracu(jmena) {
  /** @type {Map<string,string>} */
  const mapa = new Map();
  Object.keys(jmena ?? {}).forEach((id, i) => {
    if (i < 4) mapa.set(id, String.fromCharCode(65 + i));
  });
  return mapa;
}

/** @param {string|undefined} pismeno */
function podezrely(pismeno) {
  return pismeno ? `podezřelý ${pismeno}` : 'neznámý podezřelý';
}

/** První věta textu, zbavená {kdo}/{VEC} placeholderů a přebytečných mezer. */
function prvniVeta(text) {
  if (!text) return '';
  const m = /^(.*?[.!?])(\s|$)/.exec(text.trim());
  const veta = m ? m[1] : text.trim();
  return veta.replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim();
}

/** Sníží první písmeno (vsazení věty doprostřed jiné věty). */
function dekapitalizuj(s) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/** Odřízne koncovou tečku/otazník/vykřičník. */
function bezKoncovky(s) {
  return s.replace(/[.!?]$/, '');
}

/** @param {string|string[]} stat */
function statLabel(stat) {
  if (Array.isArray(stat)) return stat.map((s) => STAT_LABEL[s] ?? s).join(' i ');
  return STAT_LABEL[stat] ?? stat;
}

/** Text „<stat> <hodnota>" (kombi: „<s1> <v1> i <s2> <v2>"). */
function statHodnotaText(slot) {
  if (Array.isArray(slot.stat)) {
    return slot.stat
      .map((s, i) => `${STAT_LABEL[s] ?? s} ${slot.stat_hodnota?.[i] ?? '?'}`)
      .join(' i ');
  }
  return `${STAT_LABEL[slot.stat] ?? slot.stat} ${slot.stat_hodnota ?? '?'}`;
}

/**
 * Sestaví `ctx` pro {@link buildPromptInput} z validovaného obsahu
 * (`parseContent()` výstup) — analog `ctxZObsahu` z `ui/vysvetleni.js`, ale
 * bohatší tvar ({nazev, text}, ne plochý řetězec): prompt potřebuje i „úvod
 * prózy" situace a „krátkou fikci" postihu, ne jen zobrazovaný název.
 * Volá se z UI (app.js), engine ani obsah tím NEsahá — jen čtení.
 *
 * @param {object} content výstup parseContent()
 * @param {Record<string,string>} [jmena] hrac_id → celé jméno — POUZE pro
 *   odvození pořadí placeholderů A–D uvnitř buildPromptInput; sem se nese
 *   beze změny, ale hodnoty (celá jména) se do promptu nikdy nedosadí.
 * @param {number} [kredityPo] aktuální stav kreditů PO uzlu (nouzový zdroj
 *   pro řádek „kredity: …; konto n", když uzel sám nenese credit_flow)
 */
export function llmCtxZObsahu(content, jmena = {}, kredityPo) {
  const objMapa = (pole) => Object.fromEntries((pole ?? []).map((x) => [x.id, { nazev: x.nazev, text: x.text }]));
  const vlozena = Object.fromEntries(
    (content.pronasledovatele ?? []).flatMap((p) => [
      [`${p.id}-lecka`, { nazev: p.lecka?.nazev ?? `${p.id}-lecka`, text: p.lecka?.text }],
      [`${p.id}-konfrontace`, { nazev: p.konfrontace?.nazev ?? `${p.id}-konfrontace`, text: p.konfrontace?.text }],
    ])
  );
  return {
    jmena,
    veci: Object.fromEntries((content.veci ?? []).map((v) => [v.id, v.nazev])),
    situace: { ...vlozena, ...objMapa(content.situace) },
    postihy: objMapa(content.postihy),
    kredityPo,
  };
}

/**
 * Sestaví vstup pro LLM z událostí JEDNOHO uzlu, dle „Formát vstupu"
 * v prompty/protokol.md (bloky SITUACE / PRAVIDLO RUNU / ZÁCHRANA /
 * ROZDĚLENÍ / VÝSLEDEK MECHANIKY [+ MAX DOSAŽITELNÉ] / NÁSLEDKY —
 * woz-test-2026-07-30.md §5e). `ZÁCHRANA` a `PRAVIDLO RUNU` se píšou VŽDY
 * (řádek s „—", když pro ně uzlové události nenesou podklad — stejná
 * konvence jako „složení: —"/„loot: —" v NÁSLEDCÍCH níže); `MAX DOSAŽITELNÉ`
 * se objeví jen, když ho `band_resolved` nese.
 *
 * @param {object[]} udalosti události jednoho uzlu z logu enginu
 * @param {{jmena: Record<string,string>, veci: Record<string,string>,
 *   situace: Record<string,{nazev:string, text?:string}>,
 *   postihy: Record<string,{nazev:string, text?:string}>,
 *   kredityPo?: number}} ctx
 * @returns {string}
 */
export function buildPromptInput(udalosti, ctx) {
  const odhaleni = udalosti.find((u) => u.type === EVENT.SITUATION_REVEALED);
  const pasmoU = udalosti.find((u) => u.type === EVENT.BAND_RESOLVED);
  if (!odhaleni || !pasmoU) {
    throw new Error('buildPromptInput: uzel nemá dokončenou resoluci (chybí situation_revealed nebo band_resolved).');
  }
  const sloty = udalosti
    .filter((u) => u.type === EVENT.SLOT_RESOLVED)
    .slice()
    .sort((a, b) => a.slot_index - b.slot_index);
  const postihy = udalosti.filter((u) => u.type === EVENT.PENALTY_ADDED);
  const kolapsy = udalosti.filter((u) => u.type === EVENT.CHARACTER_FOLDED);
  const kredity = udalosti.filter((u) => u.type === EVENT.CREDIT_FLOW);
  const zary = udalosti.filter((u) => u.type === EVENT.ZAR_MOVE);
  const gamble = udalosti.find((u) => u.type === EVENT.GAMBLE);

  const pismena = pismenaHracu(ctx.jmena);
  const roleBySlot = new Map((odhaleni.sloty ?? []).map((s) => [s.slot_index, s]));

  const situaceInfo = ctx.situace?.[odhaleni.situace_id];
  const nazevSituace = situaceInfo?.nazev ?? odhaleni.situace_id;
  const uvod = prvniVeta(situaceInfo?.text);

  const radky = [];

  /* --- SITUACE --- */
  radky.push(`SITUACE: ${nazevSituace} (${odhaleni.typ})${uvod ? ` — ${uvod}` : ''}`);

  /* --- PRAVIDLO RUNU (vždy; „—", když žádný slot nenese duvod stat_zrusen) --- */
  const statZrusen = sloty.find((s) => s.duvod === 'stat_zrusen');
  if (statZrusen) {
    const stat = statLabel(statZrusen.pronasledovatel_efekt?.cil ?? statZrusen.stat);
    radky.push(`PRAVIDLO RUNU: pronásledovatel po celý run ruší stat „${stat}“`);
  } else {
    radky.push('PRAVIDLO RUNU: —');
  }

  /* --- ZÁCHRANA (vždy; „—", když gamble nepadl — woz-test-2026-07-30.md §5e) --- */
  if (gamble) {
    const tazena = ctx.veci?.[gamble.tazena] ?? gamble.tazena;
    const nahrazena = ctx.veci?.[gamble.nahrazena] ?? gamble.nahrazena;
    radky.push(`ZÁCHRANA: líznuto „${tazena}“ místo „${nahrazena}“`);
  } else {
    radky.push('ZÁCHRANA: —');
  }

  /* --- ROZDĚLENÍ --- */
  radky.push('ROZDĚLENÍ:');
  for (const slot of sloty) {
    const def = roleBySlot.get(slot.slot_index);
    const role = def?.role ?? `slot ${slot.slot_index + 1}`;
    const vid = VIDITELNOST_LABEL[slot.viditelnost] ?? slot.viditelnost;
    if (slot.karta_id == null) {
      radky.push(`  ${role} [${vid}]: neobsazeno`);
      continue;
    }
    const pismeno = pismena.get(slot.hrac_id);
    const vec = ctx.veci?.[slot.karta_id] ?? slot.karta_id;
    radky.push(`  ${role} [${vid}]: ${podezrely(pismeno)} — „${vec}“`);
  }

  /* --- VÝSLEDEK MECHANIKY --- */
  radky.push(`VÝSLEDEK MECHANIKY: pásmo ${PASMO_LABEL[pasmoU.pasmo] ?? pasmoU.pasmo} ${pasmoU.zasahy}/4`);
  if (Number.isInteger(pasmoU.max_achievable_zasahy)) {
    radky.push(`  MAX DOSAŽITELNÉ: ${pasmoU.max_achievable_zasahy}/4`);
  }
  for (const slot of sloty) {
    const def = roleBySlot.get(slot.slot_index);
    const role = def?.role ?? `slot ${slot.slot_index + 1}`;
    if (slot.karta_id == null) {
      radky.push(`  ${role}: selhání (role neobsazena)`);
      continue;
    }
    const vec = ctx.veci?.[slot.karta_id] ?? slot.karta_id;
    const prahLabel = slot.typ_prahu === 'kombi_oba' ? `kombi práh ${slot.prah}` : `práh ${slot.prah}`;
    let radek = `  ${role}: ${slot.zasah ? 'zásah' : 'selhání'} (${prahLabel}; „${vec}“ mělo ${statHodnotaText(slot)}`;
    if (slot.duvod === 'gangster_auto_fail') {
      radek += `; důvod: zbraň na očích u ${String(odhaleni.typ).toUpperCase()}`;
    }
    radek += ')';
    radky.push(radek);
  }

  /* --- NÁSLEDKY --- */
  radky.push('NÁSLEDKY:');
  if (postihy.length === 0) {
    radky.push('  postihy: žádné');
  } else {
    const texty = postihy.map((p) => {
      const pismeno = pismena.get(p.hrac_id);
      const info = ctx.postihy?.[p.postih_id];
      const nazev = info?.nazev ?? p.postih_id;
      const fikce = dekapitalizuj(bezKoncovky(prvniVeta(info?.text)));
      return `${podezrely(pismeno)} — „${nazev}“ (${TIER_LABEL[p.tier] ?? p.tier}${fikce ? `, ${fikce}` : ''})`;
    });
    radky.push(`  postihy: ${texty.join('; ')}`);
  }

  if (kolapsy.length === 0) {
    radky.push('  složení: —');
  } else {
    const poradiPostihu = RULES.postihy.capNaHrace + 1;
    const texty = kolapsy.map((k) => `${podezrely(pismena.get(k.hrac_id))} leží v autě (${poradiPostihu}. postih)`);
    radky.push(`  složení: ${texty.join('; ')}`);
  }

  const deltaKredit = kredity.reduce((a, k) => a + (k.delta ?? 0), 0);
  const posledniZustatek = kredity.length > 0 ? kredity.at(-1).zustatek : ctx.kredityPo;
  const kreditDuvody = [...new Set(kredity.map((k) => CREDIT_DUVOD_LABEL[k.duvod] ?? k.duvod))];
  const kreditText = deltaKredit === 0 ? '0' : `${deltaKredit > 0 ? '+' : ''}${deltaKredit}`;
  radky.push(
    `  kredity: ${kreditText}${kreditDuvody.length ? ` (${kreditDuvody.join(', ')})` : ''}; konto ${posledniZustatek ?? '?'}`
  );

  const deltaZar = zary.reduce((a, z) => a + (z.delta ?? 0), 0);
  const zarDuvody = [...new Set(zary.map((z) => ZAR_DUVOD_LABEL[z.duvod] ?? z.duvod))];
  const prahPrekrocen = zary.find((z) => z.prah_prekrocen);
  // Žár umí klesat (konfrontace), takže znaménko se odvozuje z hodnoty — jinak
  // by záporná změna vyšla jako „+-7" a šerif by se hlásil jako „beze změny",
  // ačkoli o sedm polí ustoupil (nález design-critica V-Žár).
  const zarText = deltaZar === 0 ? '0' : `${deltaZar > 0 ? '+' : ''}${deltaZar}`;
  let serifText;
  if (deltaZar > 0) serifText = `šerif postoupil o ${deltaZar} pole blíž`;
  else if (deltaZar < 0) serifText = `šerif ustoupil o ${Math.abs(deltaZar)} pole zpět`;
  else serifText = 'šerif beze změny';
  if (prahPrekrocen) serifText += `; práh ${prahPrekrocen.prah_prekrocen} překročen`;
  radky.push(`  Žár:     ${zarText} — ${zarDuvody.length ? zarDuvody.join(' a ') : 'beze změny'}; ${serifText}`);

  const ztraceno = pasmoU.naklad_ztrata ?? 0;
  radky.push(`  bedny:   ${ztraceno > 0 ? `ztraceno ${ztraceno}` : '0'}${ztraceno > 0 ? ' (PRŮŠVIH)' : ''}; náklad ${pasmoU.zbyva_beden}`);

  // Loot: engine NEloguje id konkrétní líznuté věci (drawCard() v applyBandConsequences
  // je bez události) — bez sahání do enginu nejde věc pojmenovat, radši mlčíme, než
  // abychom si vymysleli, co bylo líznuto (viz nález v LLM adaptéru).
  radky.push('  loot:    —');

  return radky.join('\n');
}
