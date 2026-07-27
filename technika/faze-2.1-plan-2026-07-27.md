# Fáze 2.1 — implementační plán (hot-seat UI na slotech + vysvětlující vrstva)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Zadání (zdroj pravdy):** [[faze-2.1-navrh-2026-07-27|technika/faze-2.1-navrh-2026-07-27.md]]
(schválená verze vč. §10 rozhodnutí). Tenhle soubor je JAK, ne CO — když se rozejdou,
platí návrh.

**Goal:** Odklikatelný v3 run v prohlížeči (1–4 hráči, hot-seat) s průběžnou
vysvětlující vrstvou, která z událostního logu enginu vyrábí české „proč" pro
každý slot, pohyb Žáru i postihový řetězec přes uzly.

**Architecture:** Vysvětlující vrstva je **čistá funkce `vysvetli(events, ctx)`
= fold přes událostní log** (žádná nová data, engine zůstává jazykově neutrální,
ADR-002). Obrazovka uzlu se rozpadá na modul per fáze (`src/ui/screens/run/*`),
každý jen renderuje snapshot enginu a anotace z vrstvy. `protocol-fill.js` se
přepisuje z v2 hodů na v3 pásma. Skořápka `app.js` (řízení obrazovek, sync logu,
export JSONL) přežívá, mění se jen slovesa příkazů.

**Tech Stack:** Vite + vanilla JS (ADR-001, žádný framework), Vitest, js-yaml,
`src/ui/dom.js` helper `h()`, existující sépiová `style.css`.

## Global Constraints

Platí pro KAŽDÝ task, i když to v něm není zopakováno:

- **Kód anglicky** (identifikátory, komentáře), **dokumentace, herní texty
  a commit zprávy česky** (`prototyp/CLAUDE.md`).
- **Engine se v této fázi NEMĚNÍ.** `src/engine/**` je read-only; když se zdá,
  že je potřeba nová událost nebo pole, je to nález do `projekt/stav.md`, ne
  tichá úprava (rozbila by golden snapshoty a měření brány).
- **Obsah se z kódu NEEDITUJE** (`../obsah/**`, `../prompty/**`) — edituje ho
  výhradně designový tým (CLAUDE.md, princip 5).
- **Žádná nová devDependency.** Bez `jsdom`/`happy-dom` — logika je v čistých
  modulech, renderer se ověřuje ručně v prohlížeči (§7 návrhu).
- **Resoluční čísla jen v `src/engine/rules.js`** (ADR-003). UI je čte
  z `RULES` / ze snapshotu, nikdy je nehardcoduje — včetně prahů Žáru,
  které se per počet hráčů posouvají o `rules.zar.prahOffsetDlePoctu[n]`.
- **Testy musí projít před každým commitem** (`npm test`), lint čistý
  (`npm run lint`). Golden snapshoty se mění jen vědomě a commit zpráva říká proč.
- Práce probíhá v `prototyp/`; příkazy se pouštějí přes npm z tohoto adresáře
  (Windows prostředí): `npm test`, `npm run lint`, `npm run dev`.
- Po každém tasku commit (česky, první řádek = co a proč). Push až po Tasku 12
  nebo po logickém celku, nikdy rozbitý stav.

## Odchylky od návrhu (vědomé, se zdůvodněním)

Návrh §5 uvádí ilustrativní věty; dvě z nich nejdou naplnit z logu bez
duplikace mechaniky. Řeším takto a hlásím to nahlas:

1. **`gamble` — „Odhad před sázkou 1/4"**: pre-gamble `max_achievable` v logu
   není (`band_resolved` ho nese až po gamblu). Spočítat ho v UI by znamenalo
   pustit oracle `maxAchievableZasahy` nad rekonstruovaným stavem = druhá
   implementace resoluce v UI vrstvě, přesně to, čemu se §4.1 vyhýbá. Místo toho
   anotace hlásí **co se vyměnilo, kolik karet v ruce zbývalo, a jak tažená karta
   dopadla** (doplní se zpětně, až přijde její `slot_resolved`). Learnabilitu
   („kolik zásahů zůstalo na stole") nese `band_resolved.gap` — ta část §5 platí
   beze změny.
2. **`goal_scored` — „které tahy cíl plnily"**: log neváže cíl na jednotlivé
   tahy. Anotace použije `deriveGoalMetrics(events, hrac_id)` (čistá funkce už
   v `engine/events.js`) a vypíše **hodnoty metrik, na kterých cíl stál** — to je
   ta samá informace v agregované podobě, bez nové mechaniky.
3. **`odkaz.popis`**: situace v `obsah/situace.yaml` **nemá pole `nazev`**
   (schéma: id, typ, telegraf, text, sloty, pasmove_vysledky). Odkaz proto ukazuje
   `uzel N — <id situace>`; `ctx.situace` je mapa id → lidský label, takže až
   obsah `nazev` dostane, stačí ji naplnit a věty se opraví samy.

## File Structure

| Soubor | Odpovědnost |
|---|---|
| `src/ui/vysvetleni.js` **(nový)** | ČISTÁ `vysvetli(events, ctx) → Map<seq, Anotace[]>`; fold s účetní knihou. Bez DOM, bez herní logiky. |
| `src/ui/labels.js` **(přepis)** | České popisky v3 (staty, pásma, důvody Žáru, kategorie postihů). Jen prezentace. |
| `src/ui/protocol-fill.js` **(přepis)** | Výběr a dosazení v3 fallback šablon (pásma 4/4…≤1/4, postihy, `{veci}`). |
| `src/ui/screens/run/index.js` **(nový)** | Přepínač fáze + společný rám `plocha` = `okraj` \| `list`. |
| `src/ui/screens/run/okraj.js` **(nový)** | Stálý panel: pronásledovatel, trať Žáru s prahy, náklad, kredity, podezřelí, trasa, export, anotace `misto: 'okraj'`. |
| `src/ui/screens/run/mapa.js` **(nový)** | Nabídka cest (typ místa je veřejný — D34/N7), Zátah. |
| `src/ui/screens/run/motel.js` **(nový)** | Odbočka ukryt/dál + služby (léčení, směna). |
| `src/ui/screens/run/commit.js` **(nový)** | Telegraf + odvozený signál, ruce, kvóty, commit naslepo, informační postihy variantou (b). |
| `src/ui/screens/run/assign.js` **(nový)** | Odhalené sloty s prahy, gamble, rozdělení karet. |
| `src/ui/screens/run/vysledek.js` **(nový)** | Razítka slotů + anotace, pásmo, důsledky, protokol (psací stroj). |
| `src/ui/app.js` **(přepis příkazů)** | v3 slovesa, v3 obsah, sync logu → sekce protokolu + anotace, export JSONL. |
| `src/main.js` **(přepis)** | Připojí `initApp` místo hlášky „UI odpojeno". |
| `src/ui/screens/run.js` **(maže se)** | v2 obrazovka na kostkové resoluci. |
| `test/vysvetleni.test.js` **(nový)** | Jednotkové nad katalogem §5 + pokrytí enumu + řetězec přes uzly. |
| `test/vysvetleni-golden.test.js` **(nový)** | Snapshot anotací nad runem pevného seedu. |
| `test/protocol-fill.test.js` **(přepis)** | v3 pásma a placeholdery. |
| `src/ui/{style.css,typewriter.js,dom.js}`, `screens/{setup.js,end.js}` | **beze změny** (end.js drobnost v Tasku 12). |

---

## Task 1: Kostra vysvětlující vrstvy (fold + účetní kniha + tripwire „neznámá")

**Files:**
- Create: `prototyp/src/ui/vysvetleni.js`
- Create: `prototyp/test/vysvetleni.test.js`

**Interfaces:**
- Consumes: `EVENT` z `src/engine/events.js` (uzavřený enum typů událostí).
- Produces:
  - `MISTO = { SLOT: 'slot', OKRAJ: 'okraj', SPIS: 'spis' }`
  - `vysvetli(events: object[], ctx?: VysvetliCtx): Map<number, Anotace[]>`
  - `VysvetliCtx = { jmena?: Record<string,string>, postihy?: Record<string,string>,
    veci?: Record<string,string>, situace?: Record<string,string>,
    pronasledovatele?: Record<string,string>, cile?: Record<string,{text:string}> }`
    — všechny mapy jsou id → český label; engine loguje jen id.
  - `Anotace = { misto: 'slot'|'okraj'|'spis', veta: string, detail?: string,
    odkaz?: {seq: number, popis: string}, slot_index?: number, razitko?: string }`

**Rozšíření typu proti návrhu §4.1** (`slot_index`, `razitko`): renderer musí vědět,
u KTERÉHO slotu anotace visí a jaké razítko vyklepnout. Vytahovat to parsováním
`veta` by byla próza jako API. Ostatní pole sedí na návrh přesně, včetně jména
`misto` (ne `kotva`).

- [ ] **Step 1: Napiš failující test kostry**

`prototyp/test/vysvetleni.test.js`:

```js
// @ts-check
/**
 * Vysvětlující vrstva (src/ui/vysvetleni.js) — čistá funkce nad událostním logem.
 * Testuje se PŘEKLAD logu do češtiny, ne mechanika (ta má vlastní testy v enginu).
 */
import { describe, it, expect } from 'vitest';
import { EVENT } from '../src/engine/events.js';
import { vysvetli, MISTO } from '../src/ui/vysvetleni.js';

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
```

- [ ] **Step 2: Pusť test a ověř, že padá**

```bash
npm --prefix prototyp test -- vysvetleni
```

Očekávám: FAIL — `Failed to resolve import "../src/ui/vysvetleni.js"`.

- [ ] **Step 3: Napiš minimální implementaci**

`prototyp/src/ui/vysvetleni.js`:

```js
// @ts-check
/**
 * Vysvětlující vrstva (fáze 2.1, technika/faze-2.1-navrh-2026-07-27.md §4.1).
 *
 * ČISTÁ funkce nad událostním logem enginu: bez DOM, bez herní logiky, bez
 * náhody. Vrstva NENÍ nová data — engine „proč" už loguje (prah, stat_hodnota,
 * duvod, stitek_efekt, postih_efekt, gap, prah_prekrocen); tohle je jeho
 * překlad do češtiny. Do enginu se české věty NEPŘIDÁVAJÍ: znečistily by
 * golden snapshoty a JSONL, ze kterých měří simulace (ADR-002).
 *
 * Fold, ne per-událost mapper: průchod drží účetní knihu (postih → uzel původu,
 * gamble → jak dopadl), bez které nejde udělat řetězec přes uzly — přesně to,
 * co playtestu 2026-07-22 chybělo nejvíc.
 *
 * Volá se nad PREFIXEM logu při hře i nad CELÝM logem po runu — jedna definice.
 */
import { EVENT } from '../engine/events.js';

/** Kam anotace v UI patří (slot situace / okraj mapy / list spisu). */
export const MISTO = /** @type {const} */ ({ SLOT: 'slot', OKRAJ: 'okraj', SPIS: 'spis' });

/**
 * @typedef {object} Anotace
 * @property {'slot'|'okraj'|'spis'} misto
 * @property {string} veta hlavní „proč" — jedna věta, úřední tón
 * @property {string} [detail] rozšíření na rozkliknutí (čísla, kontext)
 * @property {{seq: number, popis: string}} [odkaz] zpětný ukazatel na událost původu
 * @property {number} [slot_index] u misto='slot': ke kterému slotu anotace patří
 * @property {string} [razitko] krátké razítko pro render (PROŠLO / NEPROŠLO / …)
 */

/**
 * @typedef {object} VysvetliCtx
 * @property {Record<string,string>} [jmena] hrac_id → celé jméno
 * @property {Record<string,string>} [postihy] postih_id → název
 * @property {Record<string,string>} [veci] karta_id → název věci
 * @property {Record<string,string>} [situace] situace_id → lidský label
 * @property {Record<string,string>} [pronasledovatele] id → název
 * @property {Record<string,{text: string}>} [cile] cil_id → definice cíle
 */

/**
 * Přeloží událostní log do anotací indexovaných podle `seq`.
 * @param {object[]} events log enginu (celý, nebo prefix při živé hře)
 * @param {VysvetliCtx} [ctx] české labely k id z obsahu
 * @returns {Map<number, Anotace[]>}
 */
export function vysvetli(events, ctx = {}) {
  /** @type {Map<number, Anotace[]>} */
  const out = new Map();
  const kniha = novaKniha(ctx, events, out);
  for (const e of events) {
    const handler = HANDLERS[e.type];
    const anotace = handler ? handler(e, kniha) : [neznama(e)];
    if (anotace.length > 0) out.set(e.seq, anotace);
  }
  return out;
}

/** Účetní kniha foldu — kontext, který jedna událost sama o sobě nemá. */
function novaKniha(ctx, events, out) {
  return {
    ctx,
    events,
    out,
    /** Název pronásledovatele + co ruší (z run_started). */
    pronasledovatel: /** @type {string|null} */ (null),
    rusi: /** @type {{typ: string, cil: string}|null} */ (null),
    /** nodeIndex → situace_id (pro popis odkazů). */
    situaceUzlu: /** @type {Map<number, string>} */ (new Map()),
  };
}

/** Tripwire: engine vydal typ, který vrstva nezná (§7 test 2). */
function neznama(e) {
  return {
    misto: MISTO.SPIS,
    veta: `Do spisu přibyla neznámá událost „${e.type}" — vysvětlující vrstva ji neumí přeložit.`,
    detail: 'Vrstva se rozešla s enginem: doplň handler v src/ui/vysvetleni.js (katalog §5 návrhu fáze 2.1).',
  };
}

/**
 * Handlery per typ události. Prázdné pole = událost vědomě BEZ anotace
 * (§5 návrhu) — musí tu ale být, aby nespadla do `neznama`.
 * @type {Record<string, (e: object, k: ReturnType<typeof novaKniha>) => Anotace[]>}
 */
const HANDLERS = {
  // run_started anotaci nenese (vysvětluje ho setup obrazovka), ale zakládá
  // knihu: jméno pronásledovatele a co ruší potřebují pozdější anotace slotů.
  [EVENT.RUN_STARTED]: (e, k) => {
    k.pronasledovatel = k.ctx.pronasledovatele?.[e.pronasledovatel] ?? e.pronasledovatel;
    k.rusi = e.rusi ?? null;
    return [];
  },
  // Akt hráče; učení nese telegraf_derived před ním.
  [EVENT.COMMIT]: () => [],
  // Akt hráče; dopad vysvětluje slot_resolved.
  [EVENT.ASSIGNMENT]: () => [],
  // Čistě měřicí událost (ADR-010) — anotaci nenese.
  [EVENT.ASSIGN_CONTEXT]: () => [],
};
```

- [ ] **Step 4: Pusť test a ověř, že prochází**

```bash
npm --prefix prototyp test -- vysvetleni
```

Očekávám: PASS, 4 testy.

- [ ] **Step 5: Commit**

```bash
git add prototyp/src/ui/vysvetleni.js prototyp/test/vysvetleni.test.js && git commit -m "Fáze 2.1: kostra vysvětlující vrstvy (fold nad logem, tripwire na neznámou událost)"
```

---

## Task 2: Anotace slotů — jádro učení (odhalení prahů + všech 8 důvodů resoluce)

**Files:**
- Modify: `prototyp/src/ui/vysvetleni.js` (přidat handlery)
- Modify: `prototyp/src/ui/labels.js` (přidat `STAT_LABEL`, zachovat `znamenko`)
- Modify: `prototyp/test/vysvetleni.test.js` (přidat describe blok)

**Interfaces:**
- Consumes: `MISTO`, `vysvetli` (Task 1); `znamenko(n)` z `labels.js`.
- Produces: `STAT_LABEL: Record<string,string>` v `labels.js` (utok → „útok" …);
  handlery `situation_revealed` a `slot_resolved` vydávající anotace
  `misto: 'slot'` se `slot_index` a `razitko`.

Pokrývá řádky katalogu §5: `situation_revealed`, `slot_resolved` ve variantách
`proslo`, `nizky_stat`, `kombi_neuplny`, `stat_zrusen`, `gangster_auto_fail`,
`neobsazeno`. Zámkové (`postih_lock_*`) přijdou v Tasku 3 — potřebují knihu postihů.

- [ ] **Step 1: Napiš failující testy slotů**

Přidej na konec `prototyp/test/vysvetleni.test.js`:

```js
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
    expect(anotace[0].veta).toContain('Práh 4 = kotva 3 +1');
    expect(anotace[1].veta).toContain('Práh 1 = kotva 2 −1');
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
    expect(a.veta).toContain('hodnota');
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
    expect(a.veta).toContain('složená');
  });
});
```

- [ ] **Step 2: Pusť testy a ověř, že padají**

```bash
npm --prefix prototyp test -- vysvetleni
```

Očekávám: FAIL — nové testy hlásí `expected [] to have a length of 2` / `Cannot read properties of undefined (reading 'razitko')`
(handlery ještě neexistují, události padají do `neznama`).

- [ ] **Step 3: Doplň `STAT_LABEL` do labels.js**

Do `prototyp/src/ui/labels.js` přidej (v2 popisky zatím nech být, uklidí je Task 7):

```js
/** Pět statů věci v češtině (pořadí kanonické dle rules.staty). */
export const STAT_LABEL = /** @type {Record<string, string>} */ ({
  utok: 'útok',
  obrana: 'obrana',
  hodnota: 'hodnota',
  improvizace: 'improvizace',
  nastroj: 'nástroj',
});
```

- [ ] **Step 4: Doplň handlery slotů do vysvetleni.js**

Do `prototyp/src/ui/vysvetleni.js` přidej import a pomocníky nad `HANDLERS`:

```js
import { STAT_LABEL, znamenko } from './labels.js';

/** Název statu (jednostat i kombi) — „nástroj" / „nástroj + improvizace". */
function popisStatu(stat) {
  return Array.isArray(stat) ? stat.map((s) => STAT_LABEL[s] ?? s).join(' + ') : (STAT_LABEL[stat] ?? stat);
}

/** „stat hodnota" pro jednostat i kombi: „nástroj 4" / „nástroj 4, improvizace 2". */
function statSHodnotou(stat, hodnota) {
  if (Array.isArray(stat)) {
    return stat.map((s, i) => `${STAT_LABEL[s] ?? s} ${Array.isArray(hodnota) ? hodnota[i] : '?'}`).join(', ');
  }
  return `${STAT_LABEL[stat] ?? stat} ${hodnota ?? '?'}`;
}

function nazevVeci(k, kartaId) {
  return k.ctx.veci?.[kartaId] ?? kartaId ?? 'neobsazeno';
}

function jmenoHrace(k, hracId) {
  return k.ctx.jmena?.[hracId] ?? hracId ?? 'nikdo';
}
```

a do objektu `HANDLERS` tyto dva handlery:

```js
  // JÁDRO UČENÍ: práh se rozepisuje na stálou (naučitelnou) kotvu a per-instance šum.
  [EVENT.SITUATION_REVEALED]: (e, k) => {
    k.situaceUzlu.set(e.nodeIndex, e.situace_id);
    return e.sloty.map((s) => ({
      misto: MISTO.SLOT,
      slot_index: s.slot_index,
      veta: `${s.role}: práh ${s.prah} = kotva ${s.kotva} ${s.sum === 0 ? 'bez šumu' : znamenko(s.sum)}.`,
      detail: [
        `Chce ${popisStatu(s.stat)}${s.typ_prahu === 'kombi_oba' ? ' (OBA staty)' : ''}`,
        s.viditelnost === 'skryta' ? 'skrytá role — telegraf ji hlásil jen počtem' : 'viditelná role',
        s.stitek_citlivy ? `výjimka ze štítku: ${s.stitek_citlivy} projde i na očích` : null,
        'Kotva je stálá a naučitelná, šum se dorolí u každé instance zvlášť.',
      ].filter(Boolean).join(' · '),
    }));
  },

  [EVENT.SLOT_RESOLVED]: (e, k) => {
    const vec = nazevVeci(k, e.karta_id);
    const zaklad = { misto: MISTO.SLOT, slot_index: e.slot_index, razitko: e.zasah ? 'PROŠLO' : 'NEPROŠLO' };
    const kdo = `„${vec}" — ${jmenoHrace(k, e.hrac_id)}`;
    switch (e.duvod) {
      case 'proslo':
        return [{ ...zaklad, veta: `${statSHodnotou(e.stat, e.stat_hodnota)} proti prahu ${e.prah}.`, detail: kdo }];
      case 'nizky_stat':
        return [{ ...zaklad, veta: `Chtělo to ${popisStatu(e.stat)} ${e.prah}, „${vec}" má ${e.stat_hodnota}.`, detail: kdo }];
      case 'kombi_neuplny':
        return [{ ...zaklad, veta: `Kombi slot chce OBA staty nad práh ${e.prah}: „${vec}" má ${statSHodnotou(e.stat, e.stat_hodnota)}.`, detail: kdo }];
      case 'stat_zrusen':
        return [{
          ...zaklad,
          veta: `${k.pronasledovatel ?? 'Pronásledovatel'} ruší ${popisStatu(e.stat)} — „${vec}" se počítá jako 0 proti prahu ${e.prah}.`,
          detail: `${kdo} · Rušení platí v celém runu, ne jen v tomhle slotu.`,
        }];
      case 'gangster_auto_fail':
        return [{
          ...zaklad,
          veta: `„${vec}" je zbraň ve viditelné roli — padá bez ohledu na staty.`,
          detail: `${kdo} · Telegraf to hlásil předem: zbraň na očích tady neprojde.`,
        }];
      case 'neobsazeno':
        return [{
          ...zaklad,
          veta: 'Slot nikdo neobsadil — automatický propad.',
          detail: 'Složená postava necommituje, a co se nedostane do slotu, propadá.',
        }];
      default:
        return [{ ...zaklad, veta: `Slot vyhodnocen (${e.duvod}).`, detail: kdo }];
    }
  },
```

- [ ] **Step 5: Pusť testy a ověř, že prochází**

```bash
npm --prefix prototyp test -- vysvetleni
```

Očekávám: PASS, 12 testů.

- [ ] **Step 6: Commit**

```bash
git add prototyp/src/ui/vysvetleni.js prototyp/src/ui/labels.js prototyp/test/vysvetleni.test.js && git commit -m "Fáze 2.1: anotace slotů — rozpad prahu na kotvu+šum a všech 6 běžných důvodů resoluce"
```

---

## Task 3: Postihy a řetězec přes uzly (`odkaz` — to, co playtestu chybělo nejvíc)

**Files:**
- Modify: `prototyp/src/ui/vysvetleni.js`
- Modify: `prototyp/test/vysvetleni.test.js`

**Interfaces:**
- Consumes: kniha z Tasku 1 (`situaceUzlu`), handler `slot_resolved` z Tasku 2.
- Produces: v knize `aktivniPostihy: Map<string, {postih_id, druh, seq, nodeIndex}[]>`;
  handlery `penalty_added`, `penalty_expired`, `penalty_healed`,
  `character_folded`, `character_returned`; větve `postih_lock_stitek`
  a `postih_lock_viditelnost` ve `slot_resolved` s vyplněným `odkaz`.

- [ ] **Step 1: Napiš failující testy postihů a řetězce**

Přidej na konec `prototyp/test/vysvetleni.test.js`:

```js
const CTX_POSTIH = { ...CTX, postihy: { 'rozdrcena-noha': 'Rozdrcená noha', 'narazene-rameno': 'Naražené rameno', 'ochrnuta-ruka': 'Ochrnutá ruka' } };

describe('vysvetli — postihy (§5)', () => {
  it('penalty_added řekne za co, jaký tier a co postih dělá', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.PENALTY_ADDED, nodeIndex: 3, hrac_id: 'p1', postih_id: 'rozdrcena-noha', kategorie: 'zamkovy', tier: 'tezky', efekt: { druh: 'lock_slot_viditelnost', viditelnost: 'skryta' }, vyprsi_za: null, pricina: '≤1/4_PRUSVIH', aktivnich_po: 1 }), CTX_POSTIH))[0];
    expect(a.misto).toBe(MISTO.SPIS);
    expect(a.veta).toContain('Rozdrcená noha');
    expect(a.veta).toContain('těžký');
    expect(a.veta).toContain('zámkový');
    expect(a.detail).toContain('skryté role');
    expect(a.detail).toContain('do vyléčení');
  });

  it('penalty_expired a penalty_healed se liší důvodem a cenou', () => {
    const anotace = vsechny(vysvetli(log(
      { type: EVENT.PENALTY_EXPIRED, hrac_id: 'p1', postih_id: 'narazene-rameno', duvod: 'cas' },
      { type: EVENT.PENALTY_HEALED, hrac_id: 'p1', postih_id: 'rozdrcena-noha', cena: 6 }
    ), CTX_POSTIH));
    expect(anotace[0].veta).toContain('Naražené rameno');
    expect(anotace[0].veta).toContain('vypršel');
    expect(anotace[1].veta).toContain('vyléčena v motelu za 6');
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
    expect(a.odkaz.seq).toBe(1);
  });

  it('po vyléčení už další auto-fail na týž postih neodkazuje', () => {
    const s = [...events, { seq: 4, nodeIndex: 6, type: EVENT.PENALTY_HEALED, hrac_id: 'p1', postih_id: 'rozdrcena-noha', cena: 6 },
      { seq: 5, nodeIndex: 7, ...resolved({ zasah: false, duvod: 'postih_lock_viditelnost', postih_efekt: 'lock_slot_viditelnost', stat_hodnota: 0 }) }];
    const a = vsechny(vysvetli(s, CTX_POSTIH)).at(-1);
    expect(a.odkaz).toBeUndefined();
  });
});
```

- [ ] **Step 2: Pusť testy a ověř, že padají**

```bash
npm --prefix prototyp test -- vysvetleni
```

Očekávám: FAIL — `expected undefined to contain 'Rozdrcená noha'` a u řetězce
`Cannot read properties of undefined (reading 'seq')`.

- [ ] **Step 3: Doplň knihu postihů a handlery**

V `prototyp/src/ui/vysvetleni.js` doplň do `novaKniha` jedno pole:

```js
    /** hrac_id → aktivní trvalé postihy (pro řetězec: kde vznikly). */
    aktivniPostihy: /** @type {Map<string, {postih_id: string, druh: string, seq: number, nodeIndex: number}[]>} */ (new Map()),
```

nad `HANDLERS` přidej pomocníky:

```js
function nazevPostihu(k, postihId) {
  return k.ctx.postihy?.[postihId] ?? postihId;
}

/** Popis uzlu pro zpětný odkaz: „uzel 3 — Brod u farmy". */
function popisUzlu(k, nodeIndex) {
  const situaceId = k.situaceUzlu.get(nodeIndex);
  const label = situaceId ? (k.ctx.situace?.[situaceId] ?? situaceId) : null;
  return label ? `uzel ${nodeIndex} — ${label}` : `uzel ${nodeIndex}`;
}

/** Co postih dělá, česky — uzavřený enum efektů (rules.POSTIH_EFEKTY). */
function popisEfektu(efekt) {
  switch (efekt?.druh) {
    case 'hide_staty': return 'vlastník vidí názvy věcí, ne jejich staty';
    case 'hide_telegraf': return 'vlastník nevidí telegraf příští situace — commituje naslepo';
    case 'hide_viditelnost': return 'vlastník nevidí, které role jsou skryté';
    case 'lock_stitek': return `co má štítek ${efekt.stitek}, vlastníkovi ve slotu propadne`;
    case 'lock_slot_viditelnost': return `do ${efekt.viditelnost === 'skryta' ? 'skryté role' : 'viditelné role'} vlastník nic neprosadí`;
    case 'lock_gamble': return 'tým nesmí použít gamble, dokud postih drží';
    case 'ztrata_kreditu': return `týmu ubylo ${efekt.kolik ?? 1} kreditů`;
    case 'ztrata_karty': return `vlastník odhodil ${efekt.kolik ?? 1} věcí z ruky`;
    case 'ztrata_naklad': return `týmu ubyly ${efekt.kolik ?? 1} bedny nákladu`;
    case 'ruka_minus': return `vlastník má o ${efekt.kolik ?? 1} menší ruku`;
    default: return 'efekt neznámý';
  }
}

/** Najde aktivní postih hráče podle druhu efektu (pro zpětný odkaz auto-failu). */
function najdiPostih(k, hracId, druh) {
  return (k.aktivniPostihy.get(hracId) ?? []).find((p) => p.druh === druh) ?? null;
}

/** Odebere postih z knihy (vypršel / vyléčen / smazán složením). */
function odeberPostih(k, hracId, postihId) {
  const seznam = k.aktivniPostihy.get(hracId);
  if (!seznam) return;
  k.aktivniPostihy.set(hracId, seznam.filter((p) => p.postih_id !== postihId));
}

const KATEGORIE_LABEL = { informacni: 'informační', zamkovy: 'zámkový', ztratovy: 'ztrátový' };
```

a do `HANDLERS` tyto handlery:

```js
  [EVENT.PENALTY_ADDED]: (e, k) => {
    // „ihned" postihy se jen provedou a zmizí — do knihy aktivních nepatří.
    if (e.vyprsi_za !== 'ihned') {
      const seznam = k.aktivniPostihy.get(e.hrac_id) ?? [];
      seznam.push({ postih_id: e.postih_id, druh: e.efekt?.druh, seq: e.seq, nodeIndex: e.nodeIndex });
      k.aktivniPostihy.set(e.hrac_id, seznam);
    }
    const trvani = e.tier === 'tezky' ? 'drží do vyléčení v motelu' : e.vyprsi_za === 'ihned' ? 'jednorázově' : `vyprší za ${e.vyprsi_za} kola`;
    return [{
      misto: MISTO.SPIS,
      veta: `Za ${e.pricina}: ${jmenoHrace(k, e.hrac_id)} — ${nazevPostihu(k, e.postih_id)} (${e.tier === 'tezky' ? 'těžký' : 'lehký'}, ${KATEGORIE_LABEL[e.kategorie] ?? e.kategorie}).`,
      detail: `${popisEfektu(e.efekt)}; ${trvani}. Aktivních postihů: ${e.aktivnich_po}.`,
    }];
  },

  [EVENT.PENALTY_EXPIRED]: (e, k) => {
    odeberPostih(k, e.hrac_id, e.postih_id);
    return [{ misto: MISTO.SPIS, veta: `${nazevPostihu(k, e.postih_id)} (${jmenoHrace(k, e.hrac_id)}) vypršel.` }];
  },

  [EVENT.PENALTY_HEALED]: (e, k) => {
    odeberPostih(k, e.hrac_id, e.postih_id);
    return [{
      misto: MISTO.SPIS,
      veta: `${nazevPostihu(k, e.postih_id)} (${jmenoHrace(k, e.hrac_id)}) vyléčena v motelu za ${e.cena} kreditů.`,
      detail: 'Těžké postihy se jinak než v motelu nezbavíš — složení maže jen lehké.',
    }];
  },

  [EVENT.CHARACTER_FOLDED]: (e, k) => {
    for (const id of e.smazane_lehke ?? []) odeberPostih(k, e.hrac_id, id);
    return [{
      misto: MISTO.SPIS,
      veta: `${jmenoHrace(k, e.hrac_id)} se složil — třetí postih se nepřidává, postava kolo–dvě leží.`,
      detail: [
        `Smazáno (lehké): ${(e.smazane_lehke ?? []).map((id) => nazevPostihu(k, id)).join(', ') || 'nic'}`,
        `Zůstává (těžké): ${(e.pretrvavaji_tezke ?? []).map((id) => nazevPostihu(k, id)).join(', ') || 'nic'}`,
        'Složená postava necommituje — její sloty propadnou jako neobsazené.',
      ].join(' · '),
    }];
  },

  [EVENT.CHARACTER_RETURNED]: (e, k) => [{
    misto: MISTO.SPIS,
    veta: `${jmenoHrace(k, e.hrac_id)} se vrací do hry a zase committuje.`,
  }],
```

Nakonec do `switch (e.duvod)` v handleru `SLOT_RESOLVED` (Task 2) přidej **před**
`default` dvě větve:

```js
      case 'postih_lock_stitek':
      case 'postih_lock_viditelnost': {
        const zdroj = najdiPostih(k, e.hrac_id, e.postih_efekt);
        const nazev = zdroj ? nazevPostihu(k, zdroj.postih_id) : 'Postih';
        const veta = e.duvod === 'postih_lock_stitek'
          ? `${nazev} — zbraň v ruce neudržíš, „${vec}" propadá bez ohledu na staty.`
          : `${nazev} — do ${e.viditelnost === 'skryta' ? 'skryté' : 'viditelné'} role nic neprosadíš, „${vec}" propadá.`;
        return [{
          ...zaklad,
          veta,
          detail: `${kdo} · Zámkový postih je tvrdé pravidlo nad staty, stejná třída jako štítek.`,
          ...(zdroj ? { odkaz: { seq: zdroj.seq, popis: popisUzlu(k, zdroj.nodeIndex) } } : {}),
        }];
      }
```

- [ ] **Step 4: Pusť testy a ověř, že prochází**

```bash
npm --prefix prototyp test -- vysvetleni
```

Očekávám: PASS, 19 testů.

- [ ] **Step 5: Commit**

```bash
git add prototyp/src/ui/vysvetleni.js prototyp/test/vysvetleni.test.js && git commit -m "Fáze 2.1: anotace postihů + zpětný odkaz zámkového auto-failu na uzel původu"
```

---

## Task 4: Zbytek katalogu §5 + tvrdý test pokrytí enumu

**Files:**
- Modify: `prototyp/src/ui/vysvetleni.js`
- Modify: `prototyp/src/ui/labels.js` (důvody Žáru a kreditů)
- Modify: `prototyp/test/vysvetleni.test.js`

**Interfaces:**
- Consumes: `EVENT`, `BAND`, `ZAR_DUVOD`, `CREDIT_DUVOD`, `END_PRICINA`,
  `deriveGoalMetrics` — vše z `src/engine/events.js`.
- Produces: handlery `telegraf_derived`, `band_resolved`, `zar_move`,
  `credit_flow`, `map_move`, `gamble`, `goal_scored`, `run_ended`;
  v `labels.js` `ZAR_DUVOD_LABEL`, `CREDIT_DUVOD_LABEL`, `BAND_LABEL`,
  `PRICINA_LABEL` (v3 hodnoty).
- Po tomhle tasku má **každý** typ z `EVENT` handler — hlídá to test pokrytí.

- [ ] **Step 1: Napiš failující testy zbytku katalogu + pokrytí enumu**

Přidej na konec `prototyp/test/vysvetleni.test.js`:

```js
describe('vysvetli — telegraf, pásmo, Žár, mapa, gamble, konec (§5)', () => {
  it('telegraf_derived přeloží signál na trend, skryté role a verdikt zbraně', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.TELEGRAF_DERIVED, signal_pravy: { trend: [{ slot_index: 0, stat: 'hodnota' }, { slot_index: 1, stat: 'obrana' }, { slot_index: 2, stat: 'nastroj' }], proti_srsti: 1, zbran_projde: 'jen_skryte', zbran_skryte: true, improv_skryte: false, zbran_slot_vyjimka: false }, signal_vyslany: {}, nevidi: ['p2'] }), CTX))[0];
    expect(a.misto).toBe(MISTO.SPIS);
    expect(a.veta).toContain('hodnota');
    expect(a.veta).toContain('obrana');
    expect(a.veta).toContain('nástroj');
    expect(a.veta).toContain('jedna skrytá');
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

  it('run_ended hlásí příčinu konce', () => {
    const a = vsechny(vysvetli(log({ type: EVENT.RUN_ENDED, vysledek: 'NEVYRESENO', pricina: 'bedny_0', pocet_uzlu: 5, zbyva_beden: 0, konecny_zar: 8, kredity_zbytek: 2, cile: [] }), CTX))[0];
    expect(a.veta).toContain('NEVYŘEŠENO');
    expect(a.veta).toContain('bedny');
  });
});

describe('vysvetli — pokrytí enumu (§7 test 2, tripwire proti rozjetí vrstvy a enginu)', () => {
  it.each(Object.values(EVENT))('typ %s má handler (nespadne do „neznámá")', (typ) => {
    const anotace = vsechny(vysvetli(log({ type: typ, ...MINIMALNI_PAYLOAD[typ] })));
    for (const a of anotace) expect(a.veta).not.toContain('neznámá událost');
  });
});
```

a nad tenhle poslední `describe` přidej minimální payloady (jeden na typ — bez
nich by handler spadl na `undefined`, což je stejná díra jako chybějící handler):

```js
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
```

- [ ] **Step 2: Pusť testy a ověř, že padají**

```bash
npm --prefix prototyp test -- vysvetleni
```

Očekávám: FAIL — nové věty chybí a test pokrytí hlásí `neznámá událost`
u `telegraf_derived`, `band_resolved`, `zar_move`, `credit_flow`, `map_move`,
`gamble`, `goal_scored`, `run_ended`.

- [ ] **Step 3: Doplň v3 popisky do labels.js**

Do `prototyp/src/ui/labels.js` přidej:

```js
/** Pásma v3 (events.BAND) → čitelný popisek. */
export const BAND_LABEL = /** @type {Record<string, string>} */ ({
  '4/4_HLADCE_LOOT': '4/4 — hladce, ještě se něco našlo',
  '3/4_HLADCE': '3/4 — hladce',
  '2/4_S_NASLEDKY': '2/4 — s následky',
  '≤1/4_PRUSVIH': '≤1/4 — průšvih',
});

/** Důvody pohybu Žáru (events.ZAR_DUVOD) — proč šerif postoupil. */
export const ZAR_DUVOD_LABEL = /** @type {Record<string, string>} */ ({
  prusvih: 'průšvih v uzlu',
  s_nasledky: 'uzel zvládnutý s následky',
  hlucne_GANGSTER: 'zbraň v akci',
  hlucne_utok: 'hlučné násilí (vysoký útok)',
  konfrontace_prezita: 'přežitá konfrontace — pozornost opadla',
});

/** Prahy trati Žáru (rules.zar.prahy) → jak se jmenují ve spisu. */
export const PRAH_LABEL = /** @type {Record<string, string>} */ ({
  zatah: 'Zátahu',
  lecka: 'léčky',
  konfrontace: 'konfrontace',
});

/** Důvody pohybu kreditů (events.CREDIT_DUVOD). */
export const CREDIT_DUVOD_LABEL = /** @type {Record<string, string>} */ ({
  truhla: 'nález v truhle',
  hladce_loot: 'čistá práce (4/4)',
  hladce: 'zvládnutý uzel (3/4)',
  smena: 'směna věci v motelu',
  leceni: 'léčení v motelu',
  ztratovy_postih: 'ztrátový postih',
});

/** Příčiny konce runu (events.END_PRICINA). */
export const PRICINA_LABEL = /** @type {Record<string, string>} */ ({
  dojezd: 'náklad dojel do New Yorku',
  bedny_0: 'došly bedny',
  konfrontace_prohra: 'prohraná konfrontace s pronásledovatelem',
  jina: 'jiná příčina',
});
```

Pozn.: `PRICINA_LABEL` v souboru **už je** ve v2 znění (`doruceno`,
`dosly_bedny`, `vsichni_vyrazeni`) — přepiš ji, nepřidávej druhou.

- [ ] **Step 4: Doplň zbývající handlery**

V `prototyp/src/ui/vysvetleni.js` rozšiř import z enginu a labelů:

```js
import { EVENT, deriveGoalMetrics } from '../engine/events.js';
import { STAT_LABEL, znamenko, BAND_LABEL, ZAR_DUVOD_LABEL, PRAH_LABEL, CREDIT_DUVOD_LABEL, PRICINA_LABEL } from './labels.js';
```

do `novaKniha` přidej:

```js
    /** Poslední gamble (pro zpětné doplnění, jak tažená karta dopadla). */
    gamble: /** @type {{seq: number, tazena: string}|null} */ (null),
```

nad `HANDLERS` přidej:

```js
const POCET_SLOVY = ['žádná', 'jedna', 'dvě', 'tři', 'čtyři'];

/** Typ místa je veřejné pravidlo (D34/N7) — hráč ho zná před volbou cesty. */
const TYP_MISTA_PRAVIDLO = {
  npc: 'někdo se ti dívá do rukou — zbraň na očích neprojde',
  lokace: 'nikdo tě nešpehuje — zbraň projde i na očích',
  zatah: 'zátah — zbraň projde, jiná cesta není',
  truhla: 'bez resoluce, jen nález',
  lecka: 'léčka — zbraň na očích neprojde',
  konfrontace: 'finále — zbraň projde',
};
```

a do `HANDLERS` zbývající handlery:

```js
  [EVENT.TELEGRAF_DERIVED]: (e, k) => {
    const s = e.signal_pravy ?? {};
    const staty = (s.trend ?? []).map((t) => popisStatu(t.stat));
    const skryte = s.proti_srsti ?? 0;
    const veta = [
      staty.length > 0
        ? `Telegraf slibuje ${POCET_SLOVY[staty.length] ?? staty.length} viditelné role (${staty.join(', ')})`
        : 'Telegraf neslibuje žádnou viditelnou roli',
      skryte > 0 ? ` a ${POCET_SLOVY[skryte] ?? skryte} skrytá čeká na nejhorší.` : ' a nic skrytého.',
      s.zbran_projde === 'ano' ? ' Zbraň tady projde i na očích.' : ' Zbraň na očích neprojde.',
      s.zbran_skryte ? ' Ve skryté roli se ale zbraň vyplatí.' : '',
      s.improv_skryte ? ' Skrytá role stojí na improvizaci.' : '',
      s.zbran_slot_vyjimka ? ' Jedna role zbraň přímo vítá.' : '',
    ].join('');
    const nevidi = (e.nevidi ?? []).map((id) => jmenoHrace(k, id));
    return [{
      misto: MISTO.SPIS,
      veta,
      detail: nevidi.length > 0
        ? `Telegraf nevidí: ${nevidi.join(', ')} (informační postih) — nesmí podle něj radit.`
        : 'Commituje se naslepo: telegraf je jediné, co o situaci před commitem víš.',
    }];
  },

  [EVENT.BAND_RESOLVED]: (e) => [{
    misto: MISTO.SPIS,
    veta: `Pásmo ${BAND_LABEL[e.pasmo] ?? e.pasmo}: ${e.zasahy} ze 4 slotů prošly.${e.naklad_ztrata > 0 ? ` Náklad ztrácí ${e.naklad_ztrata} bednu (zbývá ${e.zbyva_beden}).` : ''}`,
    detail: e.gap > 0
      ? `Optimální rozdělení TÉHOŽ commitu by dalo ${e.max_achievable_zasahy}/4 (${BAND_LABEL[e.max_achievable_band] ?? e.max_achievable_band}) — ${e.gap} zásah zůstal na stole.`
      : 'Z toho, co tým committnul, se líp rozdělit nedalo — tohle bylo nejlepší možné.',
  }],

  [EVENT.ZAR_MOVE]: (e) => [{
    misto: MISTO.OKRAJ,
    veta: `Šerif postoupil o ${Math.abs(e.delta)} na ${e.nova_pozice} — ${ZAR_DUVOD_LABEL[e.duvod] ?? e.duvod}.${e.prah_prekrocen ? ` Tím překročil práh ${PRAH_LABEL[e.prah_prekrocen] ?? e.prah_prekrocen}.` : ''}`,
    ...(e.delta < 0 ? { detail: 'Žár klesl — prahy se znovu nabíjejí.' } : {}),
  }],

  [EVENT.CREDIT_FLOW]: (e) => [{
    misto: MISTO.OKRAJ,
    veta: `Kredity ${znamenko(e.delta)} (${CREDIT_DUVOD_LABEL[e.duvod] ?? e.duvod}), zůstatek ${e.zustatek}.`,
  }],

  [EVENT.MAP_MOVE]: (e, k) => {
    if (e.motel_odbocka) {
      return [{
        misto: MISTO.OKRAJ,
        veta: e.motel_odbocka.volba === 'ukryt'
          ? 'Tým zajel do motelu — léčení a směna stojí kredity, čas neběží.'
          : 'Tým motel minul a hnal náklad dál.',
      }];
    }
    if (e.volba) {
      return [{
        misto: MISTO.OKRAJ,
        veta: `Cesta zvolena: ${k.ctx.situace?.[e.volba] ?? e.volba} (${e.typ_mista}) — ${TYP_MISTA_PRAVIDLO[e.typ_mista] ?? 'typ místa je veřejný'}.`,
      }];
    }
    const kolik = (e.nabidnuto ?? []).length;
    return [{
      misto: MISTO.OKRAJ,
      veta: e.byl_zatah
        ? 'Zátah: Žár překročil práh, jiná cesta než přes kontrolu není.'
        : `Na výběr jsou ${POCET_SLOVY[kolik] ?? kolik} cesty — typ místa je vidět předem a rozhoduje o tom, jestli projde zbraň.`,
    }];
  },

  [EVENT.GAMBLE]: (e, k) => {
    k.gamble = { seq: e.seq, tazena: e.tazena };
    return [{
      misto: MISTO.SPIS,
      veta: `Sázka: místo „${nazevVeci(k, e.nahrazena)}" přišel „${nazevVeci(k, e.tazena)}" (ruka ${jmenoHrace(k, e.ci_ruka)}).`,
      detail: `V ruce zbývalo ${e.zbyvajici_v_ruce} věcí, tažení je naslepo. Jednou za situaci.`,
    }];
  },

  [EVENT.GOAL_SCORED]: (e, k) => {
    const cil = k.ctx.cile?.[e.cil_id];
    if (e.overeni_typ === 'textovy') {
      return [{
        misto: MISTO.SPIS,
        veta: `Tajný cíl ${jmenoHrace(k, e.hrac_id)}: ${cil?.text ?? e.cil_id} — posoudí stůl z protokolu.`,
      }];
    }
    const m = deriveGoalMetrics(k.events, e.hrac_id);
    return [{
      misto: MISTO.SPIS,
      veta: `Tajný cíl ${jmenoHrace(k, e.hrac_id)}: ${cil?.text ?? e.cil_id} — ${e.splnen ? 'SPLNĚN' : 'nesplněn'}.`,
      detail: `Sloty ${m.pocet_slotu_splnil} splnil / ${m.pocet_slotu_selhal} propadl · postihy ${m.postihy_utrpene.pocet} · gamble ${m.gamble_pouzit}× · složen ${m.slozeni_krat}× · ztracené bedny ${m.bedny_ztracene_vlastni} · doručeno: ${m.doruceno ? 'ano' : 'ne'}.`,
    }];
  },

  [EVENT.RUN_ENDED]: (e) => [{
    misto: MISTO.SPIS,
    veta: `Spis se uzavírá: ${e.vysledek === 'DORUCENO' ? 'DORUČENO' : 'NEVYŘEŠENO'} — ${PRICINA_LABEL[e.pricina] ?? e.pricina}.`,
    detail: `Uzlů ${e.pocet_uzlu} · zbývá beden ${e.zbyva_beden} · konečný Žár ${e.konecny_zar} · kredity ${e.kredity_zbytek}.`,
  }],
```

Zpětné doplnění výsledku gamblu patří do handleru `SLOT_RESOLVED` — hned na jeho
začátek (před `switch`):

```js
    // Gamble je v logu PŘED resolucí, takže „jak to dopadlo" jde doplnit až tady.
    // Fold to umí: anotace už v Map je a drží se na ni reference (§4.1).
    if (k.gamble && e.karta_id === k.gamble.tazena) {
      const gambleAnotace = k.out.get(k.gamble.seq)?.[0];
      if (gambleAnotace) {
        gambleAnotace.detail += ` Tažená věc ${e.zasah ? 'vyšla' : 'nevyšla'} — slot ${e.slot_index + 1}.`;
      }
      k.gamble = null;
    }
```

- [ ] **Step 5: Pusť celou baterii a ověř, že prochází**

```bash
npm --prefix prototyp test
```

Očekávám: PASS všech souborů; `vysvetleni.test.js` má 27+ testů, včetně
18 případů pokrytí enumu.

- [ ] **Step 6: Commit**

```bash
git add prototyp/src/ui/vysvetleni.js prototyp/src/ui/labels.js prototyp/test/vysvetleni.test.js && git commit -m "Fáze 2.1: dokončen katalog anotací (telegraf, pásmo, Žár, mapa, gamble, cíle) + test pokrytí enumu událostí"
```

---

## Task 5: Golden anotace nad reálným runem

**Files:**
- Create: `prototyp/test/vysvetleni-golden.test.js`
- Create (automaticky): `prototyp/test/__snapshots__/vysvetleni-golden.test.js.snap`

**Interfaces:**
- Consumes: `vysvetli` (Tasky 1–4), `parseContent`, `RULES`, `playRun`/`PRESETY`
  ze `sim/run.js`, `loadRealYaml` z `test/content.test.js`.
- Produces: `ctxZObsahu(content): VysvetliCtx` — sdílený builder kontextu,
  který **použije i `app.js`** v Tasku 12 (jedno místo, kde se z obsahu dělají
  labely). Exportuje se z `src/ui/vysvetleni.js`.

- [ ] **Step 1: Napiš failující golden test**

`prototyp/test/vysvetleni-golden.test.js`:

```js
// @ts-check
/**
 * Golden anotace (§7 test 3): snapshot vysvětlující vrstvy nad runem pevného
 * seedu. Chytá drift mezi PRAVIDLEM a jeho VYSVĚTLENÍM stejně, jako golden runy
 * chytají drift enginu. Když se snapshot změní, commit message musí říct proč.
 */
import { describe, it, expect } from 'vitest';
import { parseContent } from '../src/content/loader.js';
import { RULES } from '../src/engine/rules.js';
import { playRun, PRESETY } from '../sim/run.js';
import { loadRealYaml } from './content.test.js';
import { vysvetli, ctxZObsahu } from '../src/ui/vysvetleni.js';

const content = parseContent(loadRealYaml());
const hraci = (n) => content.postavy.slice(0, n).map((p) => ({ id: p.id, jmeno: p.jmeno }));

/** Anotace jako prosté pole (Map se do snapshotu čte hůř). */
function anotaceRunu(opts) {
  const events = playRun({ content, rules: RULES, spec: PRESETY.kompetentni, ...opts });
  const mapa = vysvetli(events, ctxZObsahu(content, Object.fromEntries(opts.players.map((p) => [p.id, p.jmeno]))));
  return [...mapa.entries()].map(([seq, anotace]) => ({ seq, typ: events.find((e) => e.seq === seq).type, anotace }));
}

describe('golden anotace nad reálným obsahem', () => {
  it('seed 42, 1 hráč, Malone', () => {
    expect(anotaceRunu({ seed: 42, players: hraci(1), pronasledovatelId: 'agent-malone' })).toMatchSnapshot();
  });

  it('seed 7, 4 hráči, Brody', () => {
    expect(anotaceRunu({ seed: 7, players: hraci(4), pronasledovatelId: 'serif-brody' })).toMatchSnapshot();
  });

  it('žádná anotace nezůstane s nedosazeným id místo českého názvu', () => {
    const zaznamy = anotaceRunu({ seed: 7, players: hraci(4), pronasledovatelId: 'serif-brody' });
    for (const { anotace } of zaznamy) {
      for (const a of anotace) {
        // kebab-case id (např. „rozdrcena-noha") ve větě = chybějící label v ctx
        expect(a.veta).not.toMatch(/[a-z]+-[a-z]+-[a-z]+/);
        expect(a.veta).not.toContain('undefined');
        expect(a.detail ?? '').not.toContain('undefined');
      }
    }
  });
});
```

- [ ] **Step 2: Pusť test a ověř, že padá**

```bash
npm --prefix prototyp test -- vysvetleni-golden
```

Očekávám: FAIL — `does not provide an export named 'ctxZObsahu'`.

- [ ] **Step 3: Doplň `ctxZObsahu` do vysvetleni.js**

Na konec `prototyp/src/ui/vysvetleni.js`:

```js
/**
 * Postaví kontext labelů z validovaného obsahu — jediné místo, kde se z id
 * dělají české názvy (používá ho golden test i app.js).
 *
 * `situace` nemá v obsahu pole `nazev` (schéma obsah/situace.yaml), takže label
 * padá na id; až obsah název dostane, opraví se věty samy.
 *
 * @param {object} content výstup parseContent()
 * @param {Record<string,string>} [jmena] hrac_id → celé jméno postavy
 * @returns {VysvetliCtx}
 */
export function ctxZObsahu(content, jmena = {}) {
  const mapa = (pole, klic) => Object.fromEntries(pole.map((x) => [x.id, x[klic] ?? x.id]));
  return {
    jmena,
    veci: mapa(content.veci, 'nazev'),
    postihy: mapa(content.postihy, 'nazev'),
    pronasledovatele: mapa(content.pronasledovatele, 'nazev'),
    situace: mapa(content.situace, 'nazev'),
    cile: Object.fromEntries(content.cile.map((c) => [c.id, { text: c.text }])),
  };
}
```

- [ ] **Step 4: Pusť test, prohlédni snapshot a ověř, že prochází**

```bash
npm --prefix prototyp test -- vysvetleni-golden
```

Očekávám: PASS (2 snapshoty zapsány, 1 test kontroly). **Snapshot si přečti** —
je to první ucelený pohled na to, co hráč uvidí. Když věta drhne nebo lže,
oprav ji teď (a snapshot přepiš `-u`), ne po playtestu.

- [ ] **Step 5: Commit**

```bash
git add prototyp/src/ui/vysvetleni.js prototyp/test/vysvetleni-golden.test.js prototyp/test/__snapshots__/vysvetleni-golden.test.js.snap && git commit -m "Fáze 2.1: golden snapshot anotací nad reálným runem + ctxZObsahu (id → české názvy)"
```

---

## Task 6: `protocol-fill.js` na v3 pásma

**Files:**
- Modify: `prototyp/src/ui/protocol-fill.js` (přepis v2 částí)
- Modify: `prototyp/test/protocol-fill.test.js` (přepis 32 v2 případů na v3)

**Interfaces:**
- Consumes: události jednoho uzlu z logu (`situation_revealed`, `slot_resolved`,
  `band_resolved`, `penalty_added`, `character_folded`) — nic z v2 `node_resolved`.
- Produces (export z `protocol-fill.js`):
  - **zůstává beze změny:** `prijmeni(celeJmeno)`, `frazeBeden(n)`,
    `dosad(text, hodnoty)`, `createVyberSablon(sablony, rand)`,
    `NOUZOVY_ZAZNAM`, `opravUvozovkySablon(yamlText)`
  - **mění se:** `sedi(sablona, stav)` — klíče `podminka` nově `postih` a `bedna`
    (v2 mělo `zraneni`, `bedna`)
  - **nové:** `PASMO_UVODU: Record<string,string>` (typ_mista → pásmo úvodní
    šablony), `zapisSituace(udalosti, ctx, vyber): string[]`
  - **mizí:** `popisZraneni`, `PASMO_HODU`, `PASMO_DRUHU`, `zapisUzlu`
  - `zapisFinale(udalost, vyber)` zůstává (pásma `finale_doruceno` /
    `finale_nevyreseno`, placeholder `{naklad}`)

**Závislost na obsahu (§8 návrhu):** v3 fallback šablony vyrábí souběžně
designový tým. Kód je needituje. Dokud v `prompty/fallback-sablony.yaml` leží
v2 sada, test pokrytí reálných šablon se **přeskočí** (guard níže) a hra jede na
`NOUZOVY_ZAZNAM`. Až obsah dorazí, guard přestane platit sám a test se rozjede;
když sada dorazí neúplná, test zčervená — to je chtěné.

- [ ] **Step 1: Napiš failující v3 testy**

Přepiš `prototyp/test/protocol-fill.test.js` na (celý soubor):

```js
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
```

- [ ] **Step 2: Pusť testy a ověř, že padají**

```bash
npm --prefix prototyp test -- protocol-fill
```

Očekávám: FAIL — `does not provide an export named 'zapisSituace'`.

- [ ] **Step 3: Přepiš protocol-fill.js na v3**

V `prototyp/src/ui/protocol-fill.js`:
**smaž** `PASMO_HODU`, `PASMO_DRUHU`, `popisZraneni`, `zapisUzlu`;
**zachovej beze změny** `opravUvozovkySablon`, `NOUZOVY_ZAZNAM`, `prijmeni`,
`BEDNY_SLOVY`, `frazeBeden`, `dosad`, `createVyberSablon`;
**nahraď** `sedi` a doplň zbytek:

```js
import { EVENT } from '../engine/events.js';

/** Úvodní šablona dle typu místa (jen vložená/speciální setkání ji mají). */
export const PASMO_UVODU = /** @type {Record<string, string>} */ ({
  zatah: 'zatah',
  lecka: 'lecka',
  konfrontace: 'konfrontace',
});

/**
 * Sedí šablona na stav situace? Klíč vynechaný v `podminka` = „jakkoli";
 * uvedený klíč musí odpovídat (`ano` ⇔ true). v3 klíče: postih, bedna.
 * @param {{podminka?: {postih?: string, bedna?: string}}} sablona
 * @param {{postih?: boolean, bedna?: boolean}} stav
 */
export function sedi(sablona, stav) {
  const p = sablona.podminka ?? {};
  for (const klic of /** @type {const} */ (['postih', 'bedna'])) {
    if (p[klic] != null && (p[klic] === 'ano') !== Boolean(stav?.[klic])) return false;
  }
  return true;
}

/**
 * Složí odstavce protokolu jedné SITUACE z jejích událostí (v3).
 *
 * Pořadí: úvod vloženého setkání (Zátah/léčka/konfrontace) → pásmový odstavec
 * (nese všechny čtyři věci ve slotech) → kolapsy. Nic, co mechanika nedala:
 * počty beden i postih se DOSAZUJÍ z událostí.
 *
 * @param {object[]} udalosti události jednoho uzlu z logu enginu
 * @param {{jmena: Record<string,string>, veci: Record<string,string>,
 *   situace: Record<string,string>, postihy: Record<string,string>}} ctx
 * @param {ReturnType<typeof createVyberSablon>} vyber
 * @returns {string[]} hotové odstavce
 */
export function zapisSituace(udalosti, ctx, vyber) {
  const odhaleni = udalosti.find((u) => u.type === EVENT.SITUATION_REVEALED);
  const pasmoUdalost = udalosti.find((u) => u.type === EVENT.BAND_RESOLVED);
  const sloty = udalosti.filter((u) => u.type === EVENT.SLOT_RESOLVED);
  const postihy = udalosti.filter((u) => u.type === EVENT.PENALTY_ADDED);
  const kolapsy = udalosti.filter((u) => u.type === EVENT.CHARACTER_FOLDED);
  const uzel = ctx.situace?.[odhaleni?.situace_id] ?? odhaleni?.situace_id ?? 'neznámý úsek';

  /** @type {string[]} */
  const odstavce = [];

  const pasmoUvodu = PASMO_UVODU[odhaleni?.typ_mista];
  if (pasmoUvodu) odstavce.push(dosad(vyber(pasmoUvodu).text, { uzel }));

  if (pasmoUdalost) {
    const postih = postihy[0] ?? null;
    // Hlavní postava odstavce: postižený, jinak vlastník prvního propadlého
    // slotu, jinak vlastník prvního slotu — nikdy „undefined".
    const hlavni = postih?.hrac_id
      ?? sloty.find((s) => !s.zasah && s.hrac_id)?.hrac_id
      ?? sloty.find((s) => s.hrac_id)?.hrac_id
      ?? null;
    const stav = { postih: postih != null, bedna: (pasmoUdalost.naklad_ztrata ?? 0) > 0 };
    odstavce.push(
      dosad(vyber(pasmoUdalost.pasmo, stav).text, {
        jmeno: hlavni ? prijmeni(ctx.jmena?.[hlavni] ?? hlavni) : 'neznámý',
        uzel,
        veci: seznamVeci(sloty, ctx),
        postih: postih ? (ctx.postihy?.[postih.postih_id] ?? postih.postih_id) : '',
        bedny: frazeBeden(pasmoUdalost.naklad_ztrata ?? 0),
        naklad: frazeBeden(pasmoUdalost.zbyva_beden ?? 0),
      })
    );
  }

  for (const kolaps of kolapsy) {
    odstavce.push(
      dosad(vyber('kolaps').text, { jmeno: prijmeni(ctx.jmena?.[kolaps.hrac_id] ?? kolaps.hrac_id), uzel })
    );
  }

  return odstavce;
}

/** Čtyři věci ve slotech jako česká výčtová fráze („A, B, C a D"). */
function seznamVeci(sloty, ctx) {
  const nazvy = sloty
    .sort((a, b) => a.slot_index - b.slot_index)
    .map((s) => (s.karta_id ? `„${ctx.veci?.[s.karta_id] ?? s.karta_id}"` : 'nic'));
  if (nazvy.length <= 1) return nazvy[0] ?? 'nic';
  return `${nazvy.slice(0, -1).join(', ')} a ${nazvy.at(-1)}`;
}
```

a uprav `zapisFinale` na v3 pole (`zbyva_beden` místo `zbyvaBeden`):

```js
/**
 * Závěrečný odstavec spisu z události `run_ended`.
 * @param {object} udalost run_ended ({vysledek, zbyva_beden, …})
 * @param {ReturnType<typeof createVyberSablon>} vyber
 * @returns {string[]}
 */
export function zapisFinale(udalost, vyber) {
  const pasmo = udalost.vysledek === 'DORUCENO' ? 'finale_doruceno' : 'finale_nevyreseno';
  return [dosad(vyber(pasmo).text, { naklad: frazeBeden(udalost.zbyva_beden ?? 0) })];
}
```

- [ ] **Step 4: Pusť testy a ověř, že prochází**

```bash
npm --prefix prototyp test -- protocol-fill
```

Očekávám: PASS; blok reálných šablon je `skipped` (dokud obsah nedorazí),
což vitest vypíše jako `↓ skipped`.

- [ ] **Step 5: Commit**

```bash
git add prototyp/src/ui/protocol-fill.js prototyp/test/protocol-fill.test.js && git commit -m "Fáze 2.1: protocol-fill přepsán na v3 pásma (čtyři věci ve slotech, postih místo zranění)"
```

---

## Task 7: Úklid popisků + okraj spisu (stálý panel)

**Files:**
- Modify: `prototyp/src/ui/labels.js` (smazat v2 zbytky)
- Create: `prototyp/src/ui/screens/run/okraj.js`

**Interfaces:**
- Consumes: `h()` z `../../dom.js`; `MISTO` z `../../vysvetleni.js`;
  `PRAH_LABEL`, `ZAR_DUVOD_LABEL` z `../../labels.js`; snapshot `getState()`
  a `RULES`.
- Produces: `okrajSpisu(ctx): HTMLElement`, kde
  `ctx = {S, st, rules, akce, anotace}` a `anotace` je `Map<seq, Anotace[]>`
  z `vysvetli()`.
- Po tomhle tasku už `labels.js` neobsahuje nic z v2 (žádné tagy ani tvrdost).

- [ ] **Step 1: Ukliď v2 popisky**

Z `prototyp/src/ui/labels.js` **smaž**: `TAG_LABEL`, `PASMO_LABEL`, `DRUH_LABEL`,
`tvrdostLabel`. **Nech**: `znamenko`, `vysledekLabel`, `STAT_LABEL` (Task 2),
`BAND_LABEL`, `ZAR_DUVOD_LABEL`, `PRAH_LABEL`, `CREDIT_DUVOD_LABEL`,
`PRICINA_LABEL` (Task 4) a přidej:

```js
/** Typ místa je veřejná informace (D34/N7) — hráč ho vidí před volbou cesty. */
export const TYP_MISTA_LABEL = /** @type {Record<string, string>} */ ({
  npc: 'člověk',
  lokace: 'lokace',
  truhla: 'nález',
  zatah: 'zátah',
  lecka: 'léčka',
  konfrontace: 'konfrontace',
});
```

- [ ] **Step 2: Ověř, že smazané popisky nikdo nepoužívá**

```bash
npm --prefix prototyp run lint
```

Očekávám: chyby `'TAG_LABEL' is not defined` **jen** v `src/ui/screens/run.js`
(v2 obrazovka, maže se v Tasku 12). Jinde nic. Kdyby lint hlásil i jiný soubor,
zastav se a doplň ho — je to nález, ne šum.

- [ ] **Step 3: Napiš okraj.js**

`prototyp/src/ui/screens/run/okraj.js`:

```js
// @ts-check
/**
 * Okraj spisu — stálý panel vedle listu (design-dokument §4.11 „spis + okraj
 * mapy"). Přebírá se z v2 layoutu; obsah je v3: trať Žáru s posunutými prahy,
 * náklad, kredity, podezřelí s postihy, poslední anotace `misto: 'okraj'`.
 *
 * Žádná herní logika — jen render snapshotu enginu (architektura §2.4).
 */
import { h } from '../../dom.js';
import { MISTO } from '../../vysvetleni.js';
import { PRAH_LABEL } from '../../labels.js';

/** Kolik posledních okrajových anotací se ukazuje (víc = zahlcení, §9 návrhu). */
const OKRAJ_ANOTACI = 4;

/**
 * @param {{S: object, st: object, rules: object, akce: Record<string, any>,
 *   anotace: Map<number, object[]>}} ctx
 */
export function okrajSpisu(ctx) {
  const { S, st, rules, akce, anotace } = ctx;
  // P1 (rules.zar.prahOffsetDlePoctu): prahy trati se per počet hráčů posouvají
  // dolů. Kdyby okraj kreslil základní prahy, hráč by viděl jinou trať, než na
  // které stojí (a metrika 6 by padla přesně na tomhle).
  const offset = rules.zar.prahOffsetDlePoctu?.[st.postavy.length] ?? 0;
  const prahy = Object.entries(rules.zar.prahy).map(([nazev, base]) => [nazev, Math.max(1, base - offset)]);
  const prahU = (/** @type {number} */ n) => prahy.find(([, p]) => p === n)?.[0];

  return h(
    'aside',
    { class: 'okraj' },
    h('p', { class: 'formular-popisek' }, 'Okraj spisu'),
    h('p', { class: 'okraj-seed' }, `spisová značka ${S.seed}`),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, 'Pronásledovatel'),
      h('strong', {}, st.pronasledovatel.nazev),
      h('p', { class: 'napoveda' }, st.pronasledovatel.rusi
        ? `ruší ${st.pronasledovatel.rusi.typ === 'stat' ? 'stat' : 'štítek'}: ${st.pronasledovatel.rusi.cil} — v celém runu se počítá jako 0`
        : 'neruší nic')
    ),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, `Žár ${st.zar} / ${rules.zar.max}`),
      h(
        'div',
        { class: 'zar-draha' },
        Array.from({ length: rules.zar.max }, (_, i) => {
          const hodnota = i + 1;
          const jePrah = prahU(hodnota);
          return h(
            'div',
            {
              class: `zar-dilek${hodnota <= st.zar ? ' zaplneny' : ''}${jePrah ? ' prah' : ''}`,
              title: jePrah ? `práh ${hodnota}: ${PRAH_LABEL[jePrah] ?? jePrah}` : `Žár ${hodnota}`,
            },
            jePrah ? h('span', { class: 'zar-prah-popisek' }, String(hodnota)) : null
          );
        })
      ),
      h('p', { class: 'napoveda' }, `prahy: ${prahy.map(([k, p]) => `${p} ${PRAH_LABEL[k] ?? k}`).join(' · ')}`),
      offset > 0
        ? h('p', { class: 'napoveda' }, `Ve ${st.postavy.length} lidech je trať o ${offset} kratší — víc lidí v autě, víc hluku.`)
        : null
    ),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, `Náklad ${st.zbyvaBeden} / ${rules.bedenNaStartu}`),
      h(
        'div',
        { class: 'bedny-rada' },
        Array.from({ length: rules.bedenNaStartu }, (_, i) =>
          h('span', { class: `bedna${i < st.zbyvaBeden ? '' : ' ztracena'}` }, '▮')
        )
      ),
      h('p', { class: 'napoveda' }, `kredity: ${st.kredity}`)
    ),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, 'Podezřelí'),
      st.postavy.map((/** @type {any} */ p) =>
        h(
          'div',
          { class: `okraj-postava${p.slozena ? ' vyrazena' : ''}` },
          h(
            'div',
            { class: 'okraj-postava-radka' },
            h('strong', {}, p.jmeno),
            p.slozena ? h('span', { class: 'razitko razitko-male' }, `složen (${p.kolDoNavratu})`) : null,
            st.drzitelMapy === p.id ? h('span', { class: 'razitko razitko-male' }, 'mapa') : null
          ),
          h(
            'p',
            { class: 'napoveda' },
            p.postihy.length === 0
              ? 'bez postihů'
              : p.postihy.map((/** @type {any} */ x) => `${x.id}${x.tier === 'tezky' ? ' (těžký)' : ''}`).join(' · ')
          )
        )
      )
    ),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, `Trasa: uzel ${Math.min(st.dokoncenoUzlu + 1, rules.uzluNaRun)} / ${rules.uzluNaRun}`),
      posledniAnotace(anotace).map((/** @type {any} */ a) => h('p', { class: 'napoveda', title: a.detail ?? '' }, a.veta))
    ),

    h('button', { class: 'tlacitko okraj-export', onclick: () => akce.exportLog() }, 'Exportovat log (JSONL)')
  );
}

/** Posledních pár anotací patřících na okraj (Žár, kredity, mapa). */
function posledniAnotace(anotace) {
  const vse = [...anotace.values()].flat().filter((a) => a.misto === MISTO.OKRAJ);
  return vse.slice(-OKRAJ_ANOTACI);
}
```

- [ ] **Step 4: Ověř lint a testy**

```bash
npm --prefix prototyp run lint && npm --prefix prototyp test
```

Očekávám: lint hlásí už jen v2 `screens/run.js`; testy PASS (okraj se
netestuje automaticky — renderer, §7 návrhu).

- [ ] **Step 5: Commit**

```bash
git add prototyp/src/ui/labels.js prototyp/src/ui/screens/run/okraj.js && git commit -m "Fáze 2.1: okraj spisu na v3 (trať Žáru s posunutými prahy, postihy, kredity) + úklid v2 popisků"
```

---

## Task 8: Rám obrazovky uzlu + mapa + motel

**Files:**
- Create: `prototyp/src/ui/screens/run/index.js`
- Create: `prototyp/src/ui/screens/run/mapa.js`
- Create: `prototyp/src/ui/screens/run/motel.js`

**Interfaces:**
- Consumes: `okrajSpisu(ctx)` (Task 7), `h()`, `TYP_MISTA_LABEL` z `labels.js`.
- Produces:
  - `obrazovkaRun(ctx): HTMLElement` — jediný vstup, který volá `app.js`.
    `ctx = {S, st, content, rules, akce, anotace}`.
  - `pohledMapy(ctx): HTMLElement`, `pohledMotelu(ctx): HTMLElement`.
  - Akce, které `app.js` musí v Tasku 12 dodat: `zvolCestu(ref)`,
    `motelVolba('ukryt'|'dal')`, `zaplat({sluzba, hracId, postihId, kartaId})`,
    `opustMotel()`, `odkryjCil(id)`, `vyraz()`, `exportLog()`.
- Briefing (los pronásledovatele + „Jsem X" tajné cíle) žije v `index.js` —
  není to fáze enginu, jen vstupní obrazovka runu; vlastní soubor by §4.2
  rozšiřoval o osmý modul zbytečně.

- [ ] **Step 1: Napiš index.js (přepínač fáze + rám + briefing)**

`prototyp/src/ui/screens/run/index.js`:

```js
// @ts-check
/**
 * Obrazovka runu v3: společný rám (okraj spisu | list) a přepínač fáze
 * (mapa → motel → commit → assign → výsledek). Žádná herní logika —
 * jen render snapshotu enginu a odesílání příkazů (architektura §2.4).
 */
import { h } from '../../dom.js';
import { okrajSpisu } from './okraj.js';
import { pohledMapy } from './mapa.js';
import { pohledMotelu } from './motel.js';
import { pohledCommitu } from './commit.js';
import { pohledPrirazeni } from './assign.js';
import { pohledVysledku } from './vysledek.js';

/**
 * @param {{S: object, st: object, content: object, rules: object,
 *   akce: Record<string, any>, anotace: Map<number, object[]>}} ctx
 */
export function obrazovkaRun(ctx) {
  const { S, st } = ctx;
  let obsah;

  if (S.briefing) obsah = pohledBriefing(ctx);
  else if (S.fronta.length > 0) obsah = pohledVysledku(ctx);
  else if (st.faze === 'map') obsah = pohledMapy(ctx);
  else if (st.faze === 'motel_offer' || st.faze === 'motel') obsah = pohledMotelu(ctx);
  else if (st.faze === 'commit') obsah = pohledCommitu(ctx);
  else if (st.faze === 'assign' || st.faze === 'confirm') obsah = pohledPrirazeni(ctx);
  else obsah = h('p', { class: 'napoveda' }, `Fáze „${st.faze}" nemá obrazovku — to je chyba UI, ne hry.`);

  return h('div', { class: 'plocha' }, okrajSpisu(ctx), h('main', { class: 'list' }, obsah));
}

/* ================= briefing ================= */

/** Los pronásledovatele + tajné cíle („Jsem X" — ostatní se nedívají). */
function pohledBriefing(ctx) {
  const { S, st, content, akce } = ctx;
  const pronasledovatel = content.pronasledovatele.find((/** @type {any} */ p) => p.id === st.pronasledovatel.id);

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, 'Spis otevřen'),
      h('h1', {}, 'Los pronásledovatele')
    ),
    h(
      'section',
      { class: 'uzel-karta pronasledovatel-karta' },
      h('span', { class: 'razitko' }, 'v patách'),
      h('h2', {}, pronasledovatel.nazev),
      h('p', { class: 'uzel-uvod' }, pronasledovatel.flavor),
      h('p', { class: 'pravidlo' }, pronasledovatel.rusi.pravidlo)
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Tajné cíle — ostatní se nedívají'),
      h(
        'div',
        { class: 'radka-voleb' },
        st.postavy.map((/** @type {any} */ p) =>
          h(
            'button',
            { class: `tlacitko${S.odkrytyCil === p.id ? ' aktivni' : ''}`, onclick: () => akce.odkryjCil(p.id) },
            S.odkrytyCil === p.id ? `Schovat (${p.jmeno})` : `Jsem ${p.jmeno}`
          )
        )
      ),
      S.odkrytyCil
        ? (() => {
            const p = st.postavy.find((/** @type {any} */ x) => x.id === S.odkrytyCil);
            return h(
              'div',
              { class: 'cil-karta' },
              h('p', { class: 'formular-popisek' }, `tajný cíl — ${p.jmeno}${p.cil ? ` (${p.cil.body} b.)` : ''}`),
              h('p', {}, p.cil ? p.cil.text : 'Cíl nebyl přidělen (došly karty cílů).'),
              p.cil ? h('p', { class: 'napoveda' }, p.cil.overeni) : null
            );
          })()
        : h('p', { class: 'napoveda' }, 'Každý si svůj cíl prohlédne sám a zase ho schová.')
    ),
    h(
      'footer',
      { class: 'formular-paticka' },
      h('button', { class: 'tlacitko tlacitko-hlavni', onclick: () => akce.vyraz() }, 'Vyrazit na trasu')
    )
  );
}
```

- [ ] **Step 2: Napiš mapa.js**

`prototyp/src/ui/screens/run/mapa.js`:

```js
// @ts-check
/**
 * Volba cesty (StS páteř). Typ místa je VEŘEJNÁ informace (D34/N7) — hráč před
 * commitem ví, jestli tam projde zbraň. Telegraf se ukáže až po volbě (fáze
 * commit); mapa ho neprozrazuje.
 */
import { h } from '../../dom.js';
import { TYP_MISTA_LABEL } from '../../labels.js';

/** Co typ místa znamená pro zbraň — plyne z obsah/stitky.yaml chovani_dle_typu. */
function pravidloTypu(content, typ) {
  const chovani = content.stitky.find((/** @type {any} */ s) => s.id === 'GANGSTER')?.parametry?.chovani_dle_typu?.[typ];
  if (chovani === 'vzdy_pass') return 'zbraň tu projde i na očích';
  if (chovani === 'viditelna_role_selze') return 'zbraň ve viditelné roli tu propadne';
  return 'bez resoluce — jen nález';
}

/** @param {{st: object, content: object, rules: object, akce: Record<string, any>}} ctx */
export function pohledMapy(ctx) {
  const { st, content, rules, akce } = ctx;
  const zatah = Boolean(st.nabidka?.zatah);

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, `úsek ${st.dokoncenoUzlu + 1} z ${rules.uzluNaRun}`),
      h('h1', {}, zatah ? 'Zátah! Jiná cesta není' : 'Volba cesty'),
      h('p', { class: 'napoveda' }, zatah
        ? `Žár dosáhl prahu — ${st.pronasledovatel.nazev} přehradil obě cesty.`
        : 'Typ místa je vidět předem a rozhoduje o zbrani. Stůl se radí, kliká kdokoli.')
    ),
    h(
      'div',
      { class: 'mrizka-cest' },
      st.nabidka.nabidnuto.map((/** @type {any} */ volba) => {
        const misto = content.mista.find((/** @type {any} */ m) => m.id === volba.ref);
        return h(
          'button',
          { class: `uzel-karta${zatah ? ' zatah' : ''}`, onclick: () => akce.zvolCestu(volba.ref) },
          zatah ? h('span', { class: 'razitko' }, 'zátah') : null,
          h('h2', {}, volba.ref),
          h('p', { class: 'napoveda' }, `typ: ${TYP_MISTA_LABEL[volba.typ_mista] ?? volba.typ_mista}`),
          misto ? h('p', { class: 'uzel-uvod' }, misto.text) : null,
          h('p', { class: 'pravidlo' }, pravidloTypu(content, volba.typ_mista))
        );
      })
    )
  );
}
```

- [ ] **Step 3: Napiš motel.js**

`prototyp/src/ui/screens/run/motel.js`:

```js
// @ts-check
/**
 * Motel: binární odbočka (ukryt/dál) a služby (léčení těžkého postihu, směna
 * věci). Ceny se berou ze snapshotu (`st.motel.sluzby`) — zrcadlí obsah, ne
 * konstanty v UI (ADR-003).
 */
import { h } from '../../dom.js';

/** @param {{st: object, content: object, akce: Record<string, any>}} ctx */
export function pohledMotelu(ctx) {
  const { st, content, akce } = ctx;

  if (st.faze === 'motel_offer') {
    const misto = content.mista.find((/** @type {any} */ m) => m.id === st.motelNabidka.motel);
    return h(
      'div',
      {},
      h(
        'header',
        { class: 'spis-hlavicka' },
        h('p', { class: 'formular-popisek' }, 'odbočka'),
        h('h1', {}, 'Motel u cesty')
      ),
      h('section', { class: 'uzel-karta' }, h('p', { class: 'uzel-uvod' }, misto?.text ?? '')),
      h('p', { class: 'napoveda' }, 'Zajet znamená utratit kredity za léčení nebo směnu. Hnát dál znamená nechat si je.'),
      h(
        'footer',
        { class: 'formular-paticka radka-voleb' },
        h('button', { class: 'tlacitko tlacitko-hlavni', onclick: () => akce.motelVolba('ukryt') }, 'Zajet do motelu'),
        h('button', { class: 'tlacitko', onclick: () => akce.motelVolba('dal') }, 'Hnát náklad dál')
      )
    );
  }

  const sluzby = st.motel?.sluzby ?? {};
  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, `kredity: ${st.kredity}`),
      h('h1', {}, 'V motelu')
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, `Léčení těžkého postihu — ${sluzby.leceni_tezkeho} kreditů`),
      st.postavy.flatMap((/** @type {any} */ p) =>
        p.postihy.filter((/** @type {any} */ x) => x.tier === 'tezky').map((/** @type {any} */ x) =>
          h(
            'div',
            { class: 'radka-voleb' },
            h(
              'button',
              {
                class: 'tlacitko',
                disabled: st.kredity < sluzby.leceni_tezkeho,
                onclick: () => akce.zaplat({ sluzba: 'leceni', hracId: p.id, postihId: x.id }),
              },
              `Vyléčit: ${p.jmeno} — ${x.id}`
            ),
            h('span', { class: 'napoveda' }, 'těžký postih jinak drží do konce runu')
          )
        )
      ),
      st.postavy.every((/** @type {any} */ p) => p.postihy.every((/** @type {any} */ x) => x.tier !== 'tezky'))
        ? h('p', { class: 'napoveda' }, 'Žádný těžký postih k léčení.')
        : null
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, `Směna věci — ${sluzby.smena_karty} kreditů`),
      st.postavy.filter((/** @type {any} */ p) => !p.slozena).map((/** @type {any} */ p) =>
        h(
          'div',
          { class: 'panel-postavy' },
          h('h3', {}, p.jmeno),
          h(
            'div',
            { class: 'ruka' },
            p.ruka.map((/** @type {any} */ k) =>
              h(
                'button',
                {
                  class: 'karta',
                  disabled: st.kredity < sluzby.smena_karty,
                  onclick: () => akce.zaplat({ sluzba: 'smena', hracId: p.id, kartaId: k.id }),
                },
                h('strong', {}, k.nazev),
                h('span', { class: 'karta-meta' }, 'vyměnit za líznutou')
              )
            )
          )
        )
      )
    ),
    h(
      'footer',
      { class: 'formular-paticka' },
      h('button', { class: 'tlacitko tlacitko-hlavni', onclick: () => akce.opustMotel() }, 'Vyrazit dál')
    )
  );
}
```

- [ ] **Step 4: Ověř lint**

```bash
npm --prefix prototyp run lint
```

Očekávám: chyby jen v `src/ui/screens/run.js` (v2) a nevyřešené importy
`commit.js` / `assign.js` / `vysledek.js` **lint nehlásí** (ESLint neřeší
existenci modulu) — ty dorazí v Taskách 9–11. Obrazovka ještě není připojená
(`main.js` mění Task 12), takže nic nespustíš předčasně.

- [ ] **Step 5: Commit**

```bash
git add prototyp/src/ui/screens/run/index.js prototyp/src/ui/screens/run/mapa.js prototyp/src/ui/screens/run/motel.js && git commit -m "Fáze 2.1: rám obrazovky uzlu, mapa s veřejným typem místa a motel"
```

---

## Task 9: Commit naslepo (telegraf, kvóty, informační postihy variantou b)

**Files:**
- Create: `prototyp/src/ui/screens/run/commit.js`
- Modify: `prototyp/src/ui/style.css` (třída pro přeškrtnutou informaci)

**Interfaces:**
- Consumes: `st.situace.{telegraf, signal, commitPlan}`, `st.postavy[].{ruka, postihy, slozena}`,
  `S.commitVyber: Record<string, string[]>` (id vybraných karet per hráč).
- Produces: `pohledCommitu(ctx): HTMLElement`; akce, které `app.js` dodá:
  `prepniKartu(hracId, kartaId)`, `commitni()`.

**Rozhodnutí §10.1 — varianta (b):** informace se **zobrazí přeškrtnutá
s poznámkou** „X tohle nevidí — nesmí podle toho radit". Čestnostní pravidlo,
drží fikci; kooperativní hra u stolu na čestnosti stojí i jinde (tajné cíle).
Schovat všem = trestat nesprávné hráče; překlopit na mechanický efekt = měnit
kalibrovaná čísla brány. Ani jedno.

- [ ] **Step 1: Přidej CSS třídu**

Do `prototyp/src/ui/style.css` (sekce „tah hráčů"):

```css
/* informační postih, varianta (b): informace je vidět, ale přeškrtnutá */
.skryto-postihem {
  text-decoration: line-through;
  opacity: 0.6;
}

.cestnost {
  border-left: 3px solid var(--cervena);
  padding-left: 0.6rem;
  font-size: 0.78rem;
  color: var(--cervena-tmava);
}
```

- [ ] **Step 2: Napiš commit.js**

`prototyp/src/ui/screens/run/commit.js`:

```js
// @ts-check
/**
 * Commit naslepo: telegraf (próza) + odvozený signál, ruce hráčů s kvótami.
 * Tým committne přesně tolik karet, kolik říká `commitPlan`, a teprve pak se
 * odhalí sloty — v tom je celé napětí v3 resoluce.
 *
 * Informační postihy (hide_telegraf / hide_staty / hide_viditelnost) se v
 * hot-seatu řeší variantou (b) dle §10.1 návrhu: informace se ZOBRAZÍ
 * přeškrtnutá s poznámkou, kdo podle ní nesmí radit. Čestnostní pravidlo.
 */
import { h } from '../../dom.js';
import { STAT_LABEL } from '../../labels.js';

/** Jména postav, které mají aktivní postih daného druhu. */
export function kdoNevidi(st, druh) {
  return st.postavy
    .filter((/** @type {any} */ p) => p.postihy.some((/** @type {any} */ x) => x.efekt?.druh === druh))
    .map((/** @type {any} */ p) => p.jmeno);
}

/** Čestnostní poznámka varianty (b) — nebo nic, když postih nikdo nemá. */
function poznamkaCestnosti(jmena, co) {
  if (jmena.length === 0) return null;
  return h('p', { class: 'cestnost' }, `${jmena.join(', ')} tohle nevidí (${co}) — ${jmena.length > 1 ? 'nesmějí' : 'nesmí'} podle toho radit.`);
}

/** @param {{S: object, st: object, akce: Record<string, any>}} ctx */
export function pohledCommitu(ctx) {
  const { S, st, akce } = ctx;
  const situace = st.situace;
  const kvota = new Map(situace.commitPlan.map((/** @type {any} */ p) => [p.hrac_id, p.pocet]));
  const vybrano = (/** @type {string} */ id) => S.commitVyber[id] ?? [];
  const hotovo = situace.commitPlan.every((/** @type {any} */ p) => vybrano(p.hrac_id).length === p.pocet);
  const nevidiTelegraf = kdoNevidi(st, 'hide_telegraf');
  const nevidiStaty = kdoNevidi(st, 'hide_staty');

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, `úsek ${st.dokoncenoUzlu + 1} · commit naslepo`),
      h('h1', {}, situace.id)
    ),
    h(
      'section',
      { class: 'uzel-karta' },
      h('p', { class: 'formular-popisek' }, 'Telegraf — jediné, co víte předem'),
      h('p', { class: 'uzel-uvod' }, situace.telegraf),
      h('p', { class: 'pravidlo' }, popisSignalu(situace.signal)),
      poznamkaCestnosti(nevidiTelegraf, 'informační postih na telegraf')
    ),
    h(
      'section',
      { class: 'postavy-tah' },
      st.postavy.map((/** @type {any} */ p) => panelPostavy(p)),
      poznamkaCestnosti(nevidiStaty, 'informační postih na staty')
    ),
    h(
      'footer',
      { class: 'formular-paticka' },
      h(
        'button',
        { class: 'tlacitko tlacitko-hlavni', disabled: !hotovo, onclick: () => akce.commitni() },
        'Committnout naslepo'
      ),
      hotovo ? null : h('p', { class: 'napoveda' }, 'Každý vyloží přesně tolik věcí, kolik má v kvótě. Vlastník kliká sám.')
    )
  );

  /** @param {any} p */
  function panelPostavy(p) {
    const potreba = kvota.get(p.id) ?? 0;
    const maSkryteStaty = p.postihy.some((/** @type {any} */ x) => x.efekt?.druh === 'hide_staty');
    if (p.slozena) {
      return h(
        'div',
        { class: 'panel-postavy vyrazena' },
        h('h3', {}, p.jmeno, ' ', h('span', { class: 'razitko razitko-male' }, 'složen')),
        h('p', { class: 'napoveda' }, `necommittuje, vrací se za ${p.kolDoNavratu} · jeho sloty propadnou jako neobsazené`)
      );
    }
    return h(
      'div',
      { class: `panel-postavy${vybrano(p.id).length === potreba ? ' zahrano' : ''}` },
      h(
        'div',
        { class: 'okraj-postava-radka' },
        h('h3', {}, p.jmeno),
        h('span', { class: 'napoveda' }, `kvóta ${vybrano(p.id).length} / ${potreba} · v ruce ${p.ruka.length}`)
      ),
      p.postihy.length > 0
        ? h('p', { class: 'napoveda' }, `postihy: ${p.postihy.map((/** @type {any} */ x) => x.id).join(' · ')}`)
        : null,
      h(
        'div',
        { class: 'ruka' },
        p.ruka.map((/** @type {any} */ k) => {
          const jeVybrana = vybrano(p.id).includes(k.id);
          const plno = vybrano(p.id).length >= potreba && !jeVybrana;
          return h(
            'button',
            {
              class: `karta${jeVybrana ? ' zoufala' : ''}${plno ? ' neaktivni' : ''}`,
              disabled: plno,
              title: k.text,
              onclick: () => akce.prepniKartu(p.id, k.id),
            },
            h('strong', {}, k.nazev),
            h('span', { class: `karta-meta${maSkryteStaty ? ' skryto-postihem' : ''}` }, popisStatu(k.staty)),
            k.stitek ? h('span', { class: 'karta-hlucna' }, `${k.stitek} — hlučná`) : null
          );
        })
      )
    );
  }
}

/** „útok 3 · obrana 1 · hodnota 4 · improvizace 0 · nástroj 2" */
function popisStatu(staty) {
  return Object.entries(staty).map(([klic, hodnota]) => `${STAT_LABEL[klic] ?? klic} ${hodnota}`).join(' · ');
}

/** Odvozený signál telegrafu do jedné věty (engine ho derivuje ze slotů). */
function popisSignalu(signal) {
  if (!signal) return '';
  const staty = (signal.trend ?? []).map((/** @type {any} */ t) =>
    Array.isArray(t.stat) ? t.stat.map((/** @type {string} */ s) => STAT_LABEL[s] ?? s).join('+') : (STAT_LABEL[t.stat] ?? t.stat)
  );
  return [
    `viditelné role: ${staty.join(', ') || 'žádné'}`,
    `skrytých rolí: ${signal.proti_srsti}`,
    signal.zbran_projde === 'ano' ? 'zbraň projde i na očích' : 'zbraň na očích neprojde',
    signal.zbran_skryte ? 've skryté roli se zbraň vyplatí' : null,
    signal.improv_skryte ? 'skrytá role stojí na improvizaci' : null,
    signal.zbran_slot_vyjimka ? 'jedna role zbraň přímo vítá' : null,
  ].filter(Boolean).join(' · ');
}
```

- [ ] **Step 3: Ověř lint**

```bash
npm --prefix prototyp run lint
```

Očekávám: žádná nová chyba (jen v2 `screens/run.js`).

- [ ] **Step 4: Commit**

```bash
git add prototyp/src/ui/screens/run/commit.js prototyp/src/ui/style.css && git commit -m "Fáze 2.1: obrazovka commitu naslepo — telegraf, kvóty, informační postihy variantou (b)"
```

---

## Task 10: Přiřazení do slotů + gamble

**Files:**
- Create: `prototyp/src/ui/screens/run/assign.js`

**Interfaces:**
- Consumes: `st.situace.{odhaleno.sloty, committed, gambleUsed}`, anotace
  `misto: 'slot'` z `vysvetli()` (odhalení prahů), `kdoNevidi` z `commit.js`.
- Produces: `pohledPrirazeni(ctx): HTMLElement`; akce, které `app.js` dodá:
  `vyberKartu(kartaId)`, `prirad(slotIndex)`, `zrusPrirazeni(slotIndex)`,
  `gambluj(hracId, kartaId)`, `vyhodnot()`.
- `S.assignVyber: {karta: string|null, sloty: Record<number, string>}` — stav
  prezentace (co je vybráno, co kam přiřazeno) drží `app.js`, ne engine.

- [ ] **Step 1: Napiš assign.js**

`prototyp/src/ui/screens/run/assign.js`:

```js
// @ts-check
/**
 * Rozdělení committnutých věcí do odhalených slotů („rozděl 4 karty do 4 slotů
 * co nejméně špatně") + gamble jako jednorázová záchrana.
 *
 * Prahy jsou tady poprvé vidět — a rovnou s vysvětlením, z čeho vznikly
 * (anotace `misto: 'slot'` z vysvětlující vrstvy). Tohle je místo, kde se hráč
 * učí, že kotva je stálá a šum ne.
 */
import { h } from '../../dom.js';
import { MISTO } from '../../vysvetleni.js';
import { STAT_LABEL } from '../../labels.js';
import { kdoNevidi } from './commit.js';

/** Anotace odhalení prahů pro tenhle uzel: slot_index → anotace. */
function anotaceSlotu(anotace, nodeIndex, events) {
  const seq = events.find((e) => e.type === 'situation_revealed' && e.nodeIndex === nodeIndex)?.seq;
  const seznam = seq ? (anotace.get(seq) ?? []) : [];
  return new Map(seznam.filter((a) => a.misto === MISTO.SLOT).map((a) => [a.slot_index, a]));
}

/**
 * @param {{S: object, st: object, akce: Record<string, any>,
 *   anotace: Map<number, object[]>}} ctx
 */
export function pohledPrirazeni(ctx) {
  const { S, st, akce, anotace } = ctx;
  const situace = st.situace;
  const sloty = situace.odhaleno?.sloty ?? [];
  const vysvetlivky = anotaceSlotu(anotace, st.nodeIndex, S.udalosti ?? []);
  const prirazeno = S.assignVyber.sloty;
  const hotovo = Object.keys(prirazeno).length === situace.committed.length;
  const nevidiViditelnost = kdoNevidi(st, 'hide_viditelnost');
  const gambleLze = !situace.gambleUsed
    && st.postavy.some((/** @type {any} */ p) => p.ruka.length > 0)
    && !st.postavy.some((/** @type {any} */ p) => p.postihy.some((/** @type {any} */ x) => x.efekt?.druh === 'lock_gamble'));

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, 'odhaleno — teď se dělí'),
      h('h1', {}, situace.id),
      h('p', { class: 'napoveda' }, 'Klikni na věc, pak na roli. Práh je vidět; kotva se opakuje, šum ne.')
    ),
    nevidiViditelnost.length > 0
      ? h('p', { class: 'cestnost' }, `${nevidiViditelnost.join(', ')} nevidí, které role jsou skryté — nesmí podle toho radit.`)
      : null,
    h(
      'section',
      { class: 'rozpis-hodu' },
      sloty.map((/** @type {any} */ s) => radekSlotu(s))
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Committnuté věci'),
      h(
        'div',
        { class: 'ruka' },
        situace.committed.map((/** @type {any} */ c) => {
          const uzPouzita = Object.values(prirazeno).includes(c.karta.id);
          const vybrana = S.assignVyber.karta === c.karta.id;
          return h(
            'button',
            {
              class: `karta${vybrana ? ' zoufala' : ''}${uzPouzita ? ' neaktivni' : ''}`,
              disabled: uzPouzita,
              title: c.karta.text,
              onclick: () => akce.vyberKartu(c.karta.id),
            },
            h('strong', {}, c.karta.nazev),
            h('span', { class: 'karta-meta' }, Object.entries(c.karta.staty).map(([k, v]) => `${STAT_LABEL[k] ?? k} ${v}`).join(' · ')),
            c.karta.stitek ? h('span', { class: 'karta-hlucna' }, c.karta.stitek) : null
          );
        })
      )
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Gamble — jednou za situaci'),
      situace.gambleUsed
        ? h('p', { class: 'napoveda' }, 'Sázka už v téhle situaci padla.')
        : !gambleLze
          ? h('p', { class: 'napoveda' }, 'Sázka není k dispozici (prázdné ruce nebo zámkový postih).')
          : h(
              'div',
              {},
              h('p', { class: 'napoveda' }, 'Vyber committnutou věc, kterou nahradíš naslepo taženou z ruky. Nová věc může být horší.'),
              situace.committed.map((/** @type {any} */ c) =>
                h(
                  'div',
                  { class: 'radka-voleb' },
                  h(
                    'button',
                    { class: 'tlacitko tlacitko-varovne', onclick: () => akce.gambluj(c.hrac_id, c.karta.id) },
                    `Vyměnit „${c.karta.nazev}" z ruky ${jmenoHrace(st, c.hrac_id)}`
                  )
                )
              )
            )
    ),
    h(
      'footer',
      { class: 'formular-paticka' },
      h('button', { class: 'tlacitko tlacitko-hlavni', disabled: !hotovo, onclick: () => akce.vyhodnot() }, 'Rozdělit a vyhodnotit'),
      hotovo ? null : h('p', { class: 'napoveda' }, 'Každá committnutá věc musí do nějaké role.')
    )
  );

  /** @param {any} s odhalený slot */
  function radekSlotu(s) {
    const kartaId = prirazeno[s.slot_index];
    const karta = situace.committed.find((/** @type {any} */ c) => c.karta.id === kartaId)?.karta ?? null;
    const a = vysvetlivky.get(s.slot_index);
    return h(
      'div',
      { class: 'hod-radek', onclick: () => (karta ? akce.zrusPrirazeni(s.slot_index) : akce.prirad(s.slot_index)) },
      h(
        'div',
        { class: 'okraj-postava-radka' },
        h('strong', {}, s.role),
        h('span', { class: 'napoveda' }, `${popisStatSlotu(s)} · práh ${s.prah} · ${s.viditelnost === 'skryta' ? 'skrytá role' : 'viditelná role'}`)
      ),
      a ? h('p', { class: 'napoveda', title: a.detail ?? '' }, a.veta) : null,
      h('p', { class: 'hod-vypocet' }, karta ? `→ „${karta.nazev}"` : '→ (prázdné, klikni pro přiřazení vybrané věci)')
    );
  }
}

function popisStatSlotu(s) {
  return Array.isArray(s.stat)
    ? `${s.stat.map((x) => STAT_LABEL[x] ?? x).join(' + ')} (OBA)`
    : (STAT_LABEL[s.stat] ?? s.stat);
}

function jmenoHrace(st, id) {
  return st.postavy.find((/** @type {any} */ p) => p.id === id)?.jmeno ?? id;
}
```

- [ ] **Step 2: Ověř lint**

```bash
npm --prefix prototyp run lint
```

Očekávám: žádná nová chyba.

- [ ] **Step 3: Commit**

```bash
git add prototyp/src/ui/screens/run/assign.js && git commit -m "Fáze 2.1: rozdělení věcí do odhalených slotů s vysvětlením prahů + gamble"
```

---

## Task 11: Výsledek situace — razítka, anotace, protokol

**Files:**
- Create: `prototyp/src/ui/screens/run/vysledek.js`

**Interfaces:**
- Consumes: `S.fronta[0] = {nodeIndex, udalosti, sekce, vyklepano}` (staví ho
  `app.js` v Tasku 12; `sekce = {cislo, titulek, odstavce}`), `anotace` z `vysvetli()`,
  `vyklepej()` z `../../typewriter.js`.
- Produces: `pohledVysledku(ctx): HTMLElement`; akce `pokracuj()`.

Tohle je obrazovka, na které stojí **metrika 6 (čitelnost)**: hráč tu musí bez
nahlédnutí do logu vidět, proč propadl konkrétní slot a proč postoupil šerif.

- [ ] **Step 1: Napiš vysledek.js**

`prototyp/src/ui/screens/run/vysledek.js`:

```js
// @ts-check
/**
 * Výsledek situace: razítko na každém slotu s větou proč, pásmo s learnabilitou
 * („optimální rozdělení TÉHOŽ commitu by dalo…"), důsledky (Žár, kredity,
 * postihy, složení) a nakonec protokol vyklepaný psacím strojem.
 *
 * Anotace se sem NEPOČÍTAJÍ — přebírají se hotové z vysvětlující vrstvy
 * (jedna definice pro živou hru i pro rozbor po runu, §4.1).
 */
import { h } from '../../dom.js';
import { vyklepej } from '../../typewriter.js';
import { MISTO } from '../../vysvetleni.js';
import { EVENT } from '../../../engine/events.js';

/**
 * @param {{S: object, akce: Record<string, any>, anotace: Map<number, object[]>}} ctx
 */
export function pohledVysledku(ctx) {
  const { S, akce, anotace } = ctx;
  const polozka = S.fronta[0];
  const { udalosti, sekce } = polozka;
  const prvni = (/** @type {object} */ u) => (anotace.get(u.seq) ?? [])[0];

  const sloty = udalosti.filter((/** @type {any} */ u) => u.type === EVENT.SLOT_RESOLVED);
  const pasmo = udalosti.find((/** @type {any} */ u) => u.type === EVENT.BAND_RESOLVED);
  const dusledky = udalosti.filter((/** @type {any} */ u) =>
    [EVENT.ZAR_MOVE, EVENT.CREDIT_FLOW, EVENT.PENALTY_ADDED, EVENT.PENALTY_EXPIRED, EVENT.PENALTY_HEALED, EVENT.CHARACTER_FOLDED, EVENT.CHARACTER_RETURNED, EVENT.GAMBLE].includes(u.type)
  );

  const protokol = h('div', { class: 'protokol-list' });
  if (polozka.vyklepano) {
    for (const odstavec of sekce.odstavce) protokol.append(h('p', { class: 'protokol-odstavec' }, odstavec));
  } else {
    polozka.vyklepano = true;
    vyklepej(protokol, sekce.odstavce);
  }

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, 'výsledek — hráč vždy ví proč'),
      h('h1', {}, `List ${sekce.cislo} — ${sekce.titulek}`)
    ),

    h(
      'section',
      { class: 'rozpis-hodu' },
      sloty.map((/** @type {any} */ u) => {
        const a = prvni(u);
        return h(
          'div',
          { class: `hod-radek ${u.zasah ? 'uspech' : 'selhani'}` },
          h(
            'div',
            { class: 'okraj-postava-radka' },
            h('strong', {}, `Slot ${u.slot_index + 1}`),
            h('span', { class: `pasmo-stitek ${u.zasah ? 'uspech' : 'selhani'}` }, a?.razitko ?? (u.zasah ? 'PROŠLO' : 'NEPROŠLO'))
          ),
          a ? h('p', { class: 'hod-vypocet' }, a.veta) : null,
          a?.detail ? h('p', { class: 'napoveda' }, a.detail) : null,
          a?.odkaz
            ? h('p', { class: 'pravidlo' }, `Řetězec: pochází z ${a.odkaz.popis}.`)
            : null
        );
      })
    ),

    pasmo
      ? h(
          'section',
          { class: 'formular-blok' },
          h('h2', { class: 'formular-popisek' }, 'Pásmo situace'),
          h('p', {}, prvni(pasmo)?.veta ?? ''),
          h('p', { class: 'napoveda' }, prvni(pasmo)?.detail ?? '')
        )
      : null,

    dusledky.length > 0
      ? h(
          'section',
          { class: 'formular-blok' },
          h('h2', { class: 'formular-popisek' }, 'Důsledky'),
          dusledky.map((/** @type {any} */ u) => {
            const a = prvni(u);
            if (!a) return null;
            return h(
              'p',
              { class: a.misto === MISTO.OKRAJ ? 'napoveda' : 'pravidlo', title: a.detail ?? '' },
              a.veta,
              a.detail ? h('span', { class: 'napoveda' }, ` ${a.detail}`) : null
            );
          })
        )
      : null,

    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Protokol vyšetřovatele (klik přeskočí klepání)'),
      protokol
    ),

    h(
      'footer',
      { class: 'formular-paticka' },
      h('button', { class: 'tlacitko tlacitko-hlavni', onclick: () => akce.pokracuj() }, 'Pokračovat')
    )
  );
}
```

- [ ] **Step 2: Ověř lint**

```bash
npm --prefix prototyp run lint
```

Očekávám: žádná nová chyba.

- [ ] **Step 3: Commit**

```bash
git add prototyp/src/ui/screens/run/vysledek.js && git commit -m "Fáze 2.1: obrazovka výsledku — razítka slotů s vysvětlením, pásmo s learnabilitou, důsledky"
```

---

## Task 12: Zapojení (app.js, main.js), úklid v2 a ruční ověření v prohlížeči

**Files:**
- Modify: `prototyp/src/ui/app.js` (přepis na v3)
- Modify: `prototyp/src/main.js` (připojit UI)
- Modify: `prototyp/src/ui/screens/end.js` (v3 pole výsledku)
- Delete: `prototyp/src/ui/screens/run.js` (v2, 572 řádků)

**Interfaces:**
- Consumes: všechno z Tasků 1–11.
- Produces: `initApp(root)` s v3 slovesy; kompletní `akce` API, které
  obrazovky volají: `zmenPocet`, `prepniPostavu`, `zmenSeed`, `otevriSpis`,
  `odkryjCil`, `vyraz`, `zvolCestu`, `motelVolba`, `zaplat`, `opustMotel`,
  `prepniKartu`, `commitni`, `vyberKartu`, `prirad`, `zrusPrirazeni`,
  `gambluj`, `vyhodnot`, `pokracuj`, `novyRun`, `exportLog`.

- [ ] **Step 1: Přepiš app.js**

Celý `prototyp/src/ui/app.js`:

```js
// @ts-check
/**
 * Řízení obrazovek hot-seat UI v3 (architektura §2.4, §6): UI je nejtenčí
 * vrstva — drží jen stav PREZENTACE (jaká obrazovka, co je vybráno, co už bylo
 * vyklepáno), veškerý herní stav žije v enginu a UI je re-render nad jeho
 * snapshotem.
 *
 * Náhoda v UI vrstvě (seed bez zadání, losování šablon) smí používat
 * Math.random — deterministický musí být jen engine (ADR-002).
 */
import veciYaml from '../../../obsah/veci.yaml?raw';
import situaceYaml from '../../../obsah/situace.yaml?raw';
import postihyYaml from '../../../obsah/postihy.yaml?raw';
import mistaYaml from '../../../obsah/mista.yaml?raw';
import stitkyYaml from '../../../obsah/stitky.yaml?raw';
import pronasledovateleYaml from '../../../obsah/pronasledovatele.yaml?raw';
import cileYaml from '../../../obsah/cile.yaml?raw';
import postavyYaml from '../../../obsah/postavy.yaml?raw';
import sablonyYaml from '../../../prompty/fallback-sablony.yaml?raw';
import { load } from 'js-yaml';

import { parseContent } from '../content/loader.js';
import { RULES } from '../engine/rules.js';
import { createRun } from '../engine/state.js';
import { EVENT } from '../engine/events.js';

import { createVyberSablon, zapisSituace, zapisFinale, opravUvozovkySablon } from './protocol-fill.js';
import { vysvetli, ctxZObsahu } from './vysvetleni.js';
import { obrazovkaSetup } from './screens/setup.js';
import { obrazovkaRun } from './screens/run/index.js';
import { obrazovkaKonec } from './screens/end.js';
import { h } from './dom.js';

/** @param {HTMLElement} root */
export function initApp(root) {
  const content = parseContent({
    veci: veciYaml,
    situace: situaceYaml,
    postihy: postihyYaml,
    mista: mistaYaml,
    stitky: stitkyYaml,
    pronasledovatele: pronasledovateleYaml,
    cile: cileYaml,
    postavy: postavyYaml,
  });
  const sablony = load(opravUvozovkySablon(sablonyYaml)).sablony;

  const S = novyStav();

  function novyStav() {
    return {
      obrazovka: /** @type {'setup'|'run'|'konec'} */ ('setup'),
      setup: { pocet: 2, vybrane: /** @type {string[]} */ ([]), seedText: '' },
      /** @type {ReturnType<typeof createRun>|null} */ run: null,
      /** @type {number|null} */ seed: null,
      /** @type {Record<string, string>} */ jmena: {},
      vyber: createVyberSablon(sablony, Math.random),
      /** Kompletní log (pro obrazovky, které hledají událost podle seq). */
      udalosti: /** @type {object[]} */ ([]),
      /** Anotace vysvětlující vrstvy: seq → Anotace[]. */
      anotace: /** @type {Map<number, object[]>} */ (new Map()),
      /** Hotové sekce protokolu: {cislo, titulek, odstavce[]}. */
      protokol: /** @type {any[]} */ ([]),
      /** Fronta výsledků k zobrazení: {nodeIndex, udalosti, sekce, vyklepano}. */
      fronta: /** @type {any[]} */ ([]),
      /** Události rozpracovaného uzlu (řez dělá band_resolved, viz flushUzel). */
      bufferUzlu: /** @type {object[]} */ ([]),
      lastSeq: 0,
      briefing: false,
      /** @type {string|null} */ odkrytyCil: null,
      /** Commit: hrac_id → vybraná id karet. */
      commitVyber: /** @type {Record<string, string[]>} */ ({}),
      /** Assign: co je vybráno a co kam přiřazeno. */
      assignVyber: { karta: /** @type {string|null} */ (null), sloty: /** @type {Record<number, string>} */ ({}) },
      /** @type {any|null} */ konec: null,
      finaleVyklepano: false,
    };
  }

  /** Nasype nové události do bufferu uzlu a přepočítá anotace. */
  function sync() {
    if (!S.run) return;
    S.udalosti = S.run.getEvents();
    S.anotace = vysvetli(S.udalosti, ctxZObsahu(content, S.jmena));
    for (const u of S.udalosti) {
      if (u.seq <= S.lastSeq) continue;
      S.lastSeq = u.seq;
      // Uzel bez resoluce (mapa, motel, truhla) sekci protokolu nedělá — jakmile
      // přijde událost jiného uzlu, starý buffer se zahodí.
      if (S.bufferUzlu.length > 0 && S.bufferUzlu[0].nodeIndex !== u.nodeIndex) S.bufferUzlu = [];
      S.bufferUzlu.push(u);
      if (u.type === EVENT.RUN_ENDED) {
        S.konec = u;
        S.protokol.push({ cislo: null, titulek: u.vysledek === 'DORUCENO' ? 'Uzavření spisu — DORUČENO' : 'Odložení spisu — NEVYŘEŠENO', odstavce: zapisFinale(u, S.vyber) });
      }
    }
  }

  /**
   * Řez uzlu: až doběhne celá resoluce (band_resolved + důsledky), složí sekci
   * protokolu a strčí ji do fronty výsledků. Volá se PO příkazu, ne uvnitř
   * `sync` — postihy a Žár se logují až za `band_resolved`, a kdyby se řezalo
   * na ní, odstavec by o postihu nevěděl.
   */
  function flushUzel() {
    const udalosti = S.bufferUzlu;
    if (!udalosti.some((u) => u.type === EVENT.BAND_RESOLVED)) return;
    const ctxProtokolu = ctxZObsahu(content, S.jmena);
    const sekce = {
      cislo: S.protokol.length + 1,
      titulek: ctxProtokolu.situace[udalosti.find((u) => u.type === EVENT.SITUATION_REVEALED)?.situace_id] ?? `uzel ${udalosti[0].nodeIndex}`,
      odstavce: zapisSituace(udalosti, ctxProtokolu, S.vyber),
    };
    S.protokol.push(sekce);
    S.fronta.push({ nodeIndex: udalosti[0].nodeIndex, udalosti, sekce, vyklepano: false });
    S.bufferUzlu = [];
  }

  /** Obal příkazu enginu: provede, synchronizuje log, uzavře uzel, překreslí. */
  function prikaz(/** @type {() => void} */ fn) {
    try {
      fn();
    } catch (chyba) {
      // UI hlídá legálnost předem; sem spadne jen programátorská chyba.
      console.error(chyba);
    }
    sync();
    flushUzel();
    render();
  }

  const akce = {
    /* --- setup --- */
    zmenPocet(/** @type {number} */ n) {
      S.setup.pocet = n;
      S.setup.vybrane = S.setup.vybrane.slice(0, n);
      render();
    },
    prepniPostavu(/** @type {string} */ id) {
      const i = S.setup.vybrane.indexOf(id);
      if (i >= 0) S.setup.vybrane.splice(i, 1);
      else if (S.setup.vybrane.length < S.setup.pocet) S.setup.vybrane.push(id);
      render();
    },
    zmenSeed(/** @type {string} */ text) {
      S.setup.seedText = text;
      render();
    },
    otevriSpis() {
      const zadany = S.setup.seedText.trim();
      S.seed = zadany === '' ? Math.floor(Math.random() * 0xffffffff) : Number(zadany) >>> 0;
      const players = S.setup.vybrane.map((id) => {
        const p = content.postavy.find((/** @type {any} */ x) => x.id === id);
        return { id: p.id, jmeno: p.jmeno };
      });
      S.jmena = Object.fromEntries(players.map((p) => [p.id, p.jmeno]));
      S.run = createRun({ seed: S.seed, content, rules: RULES, players });
      S.obrazovka = 'run';
      S.briefing = true;
      sync();
      render();
    },

    /* --- briefing --- */
    odkryjCil(/** @type {string} */ id) {
      S.odkrytyCil = S.odkrytyCil === id ? null : id;
      render();
    },
    vyraz() {
      S.briefing = false;
      S.odkrytyCil = null;
      render();
    },

    /* --- mapa a motel --- */
    zvolCestu(/** @type {string} */ ref) {
      prikaz(() => S.run.chooseRoute(ref));
    },
    motelVolba(/** @type {'ukryt'|'dal'} */ volba) {
      prikaz(() => S.run.motelChoice(volba));
    },
    zaplat(/** @type {object} */ objednavka) {
      prikaz(() => S.run.spendCredits(objednavka));
    },
    opustMotel() {
      prikaz(() => S.run.leaveMotel());
    },

    /* --- commit --- */
    prepniKartu(/** @type {string} */ hracId, /** @type {string} */ kartaId) {
      const vybrane = S.commitVyber[hracId] ?? [];
      const i = vybrane.indexOf(kartaId);
      if (i >= 0) vybrane.splice(i, 1);
      else vybrane.push(kartaId);
      S.commitVyber[hracId] = vybrane;
      render();
    },
    commitni() {
      const list = Object.entries(S.commitVyber).flatMap(([characterId, karty]) =>
        karty.map((cardId) => ({ characterId, cardId }))
      );
      prikaz(() => {
        S.run.commitCards(list);
        S.commitVyber = {};
        S.assignVyber = { karta: null, sloty: {} };
      });
    },

    /* --- assign a gamble --- */
    vyberKartu(/** @type {string} */ kartaId) {
      S.assignVyber.karta = S.assignVyber.karta === kartaId ? null : kartaId;
      render();
    },
    prirad(/** @type {number} */ slotIndex) {
      if (!S.assignVyber.karta) return;
      S.assignVyber.sloty[slotIndex] = S.assignVyber.karta;
      S.assignVyber.karta = null;
      render();
    },
    zrusPrirazeni(/** @type {number} */ slotIndex) {
      delete S.assignVyber.sloty[slotIndex];
      render();
    },
    gambluj(/** @type {string} */ hracId, /** @type {string} */ kartaId) {
      prikaz(() => {
        S.run.gamble({ handOwnerId: hracId, replacedCardId: kartaId });
        // Vyměněná věc už ve slotech být nesmí — přiřazení se resetuje.
        S.assignVyber = { karta: null, sloty: {} };
      });
    },
    vyhodnot() {
      const list = Object.entries(S.assignVyber.sloty).map(([slotIndex, cardId]) => ({ slotIndex: Number(slotIndex), cardId }));
      prikaz(() => {
        S.run.assignToSlots(list);
        S.run.confirmNode();
        S.assignVyber = { karta: null, sloty: {} };
      });
    },

    /* --- tok obrazovek --- */
    pokracuj() {
      S.fronta.shift();
      if (S.fronta.length === 0 && S.konec) S.obrazovka = 'konec';
      render();
    },
    novyRun() {
      Object.assign(S, novyStav());
      render();
    },

    /* --- export událostního logu (surovina lidské brány) --- */
    exportLog() {
      if (!S.run) return;
      const jsonl = S.run.getEvents().map((u) => JSON.stringify(u)).join('\n');
      const blob = new Blob([jsonl], { type: 'application/x-ndjson' });
      const url = URL.createObjectURL(blob);
      const a = h('a', { href: url, download: `dukazni-material-run-${S.seed}.jsonl` });
      a.click();
      URL.revokeObjectURL(url);
    },
  };

  function render() {
    /** @type {HTMLElement} */
    let el;
    if (S.obrazovka === 'setup') {
      el = obrazovkaSetup({ postavy: content.postavy, setup: S.setup, akce });
    } else if (S.obrazovka === 'konec') {
      el = obrazovkaKonec({ S, content, akce });
    } else {
      el = obrazovkaRun({ S, st: S.run.getState(), content, rules: RULES, akce, anotace: S.anotace });
    }
    root.replaceChildren(el);
  }

  render();
}
```

- [ ] **Step 2: Zapoj UI v main.js**

Celý `prototyp/src/main.js`:

```js
// @ts-check
/**
 * Vstup Vite aplikace: hot-seat UI nad v3 slotovým enginem (fáze 2.1).
 * Bez API klíče je hra plně hratelná — protokoly jedou na fallback šablonách
 * (ADR-004); LLM adaptér přijde ve fázi 3.
 */
import './ui/style.css';
import { initApp } from './ui/app.js';

const app = document.querySelector('#app');
if (app) initApp(/** @type {HTMLElement} */ (app));
```

- [ ] **Step 3: Uprav end.js na v3 pole a smaž v2 obrazovku**

V `prototyp/src/ui/screens/end.js`:
- v hlavičce nahraď `vysledek.pocetUzlu` za `vysledek.pocet_uzlu`,
- smaž import a použití `DRUH_LABEL` (řádek s `DRUH_LABEL[sekce.druh] ? …` nahraď
  prázdným řetězcem — v3 sekce pole `druh` nemá),
- `PRICINA_LABEL` už je v3 (Task 4), import nech.

Pak smaž v2 obrazovku:

```bash
git rm prototyp/src/ui/screens/run.js
```

- [ ] **Step 4: Lint a celá testovací baterie**

```bash
npm --prefix prototyp run lint && npm --prefix prototyp test
```

Očekávám: lint **čistý** (v2 soubor už neexistuje), testy PASS — engine,
loader, golden runy, invarianty, metriky, report, strategie, vysvětlující
vrstva, golden anotace, protocol-fill.

- [ ] **Step 5: Ruční průchod v prohlížeči (§7: renderer se ověřuje ručně)**

Spusť dev server (Browser pane, ne bash):

```bash
npm --prefix prototyp run dev
```

Odklikej **celý run pro 1 hráče a celý run pro 4 hráče** (seed zadej, ať jde
opakovat) a odškrtej:

- [ ] setup → briefing (los pronásledovatele, „Jsem X" cíle) → mapa
- [ ] mapa ukazuje typ místa a pravidlo zbraně, volba funguje
- [ ] commit: telegraf + signál, kvóty sedí (1p = 4 karty, 4p = 1 na hlavu),
      tlačítko je zamčené, dokud kvóty nesedí
- [ ] assign: prahy vidět, u každého slotu věta „práh = kotva ± šum",
      přiřazení a zrušení klikem, gamble jednou
- [ ] výsledek: razítka PROŠLO/NEPROŠLO s větou proč, pásmo s learnabilitou,
      důsledky, protokol se vyklepává a klik ho přeskočí
- [ ] okraj: Žár roste, prahy jsou na správných místech (u 4p o 2 níž),
      bedny ubývají, postihy se objevují a mizí
- [ ] motel: nabídka, léčení těžkého postihu, směna, odchod
- [ ] konec: razítko DORUČENO/NEVYŘEŠENO, celý protokol, reveal cílů, export JSONL
- [ ] **kontrola metriky 6:** po runu dokáže člověk bez nahlédnutí do logu říct,
      **proč propadl konkrétní slot a proč postoupil šerif**. Když ne, je to
      nález do `projekt/stav.md`, ne důvod plán obejít.
- [ ] konzole prohlížeče bez chyb (`console.error` z `prikaz()` = nelegální
      příkaz, který UI mělo zamknout dřív)

- [ ] **Step 6: Commit a push**

```bash
git add -A prototyp/src && git commit -m "Fáze 2.1: hot-seat UI zapojeno na v3 engine (app.js slotová slovesa, main.js, úklid v2 obrazovky)" && git push
```

- [ ] **Step 7: Zapiš stav (procesní paměť)**

Do `projekt/stav.md` uprav řádky fáze 2.1 (stavba proběhla, co je hotové, co
zbývá — zejména stav v3 fallback šablon a případné nálezy z ručního průchodu)
a do `projekt/rozhodnuti.md` přidej datovaný záznam o dokončení stavby.
Commit zvlášť: `git commit -m "D38: fáze 2.1 postavena — stav a rozhodnutí"`.

---

## Kritérium hotovo (§11 návrhu)

- [ ] Celý v3 run je odklikatelný v prohlížeči, 1–4 hráči, bez pádů.
- [ ] Každá událost z §5 nese anotaci; test pokrytí enumu je zelený.
- [ ] Hráč, který hru nezná, po runu odpoví, proč propadl konkrétní slot
      a proč postoupil šerif (metrika 6).
- [ ] Testy zelené, lint čistý, run jde exportovat jako JSONL.

**Mimo tenhle plán (a je to tak správně):** ~20 v3 fallback šablon (§8 návrhu —
designový tým, běží souběžně), přeladění `prahOffsetDlePoctu` (D37, kalibrace),
LLM adaptér (fáze 3).

## Kontrola plánu proti zadání (self-review)

| Požadavek návrhu | Kde je splněn |
|---|---|
| §3.1 přestavba obrazovky uzlu na slotovou smyčku | Tasky 8–11 |
| §3.2 vysvětlující vrstva jako čistá funkce nad logem | Tasky 1–5 |
| §3.3 přepis `protocol-fill` na v3 | Task 6 |
| §3.4 úklid mrtvého v2 kódu | Task 7 (labels), Task 12 (`screens/run.js`) |
| §4.1 `misto` místo `kotva`, fold, prefix i celek, engine neutrální | Task 1 (+ test prefixu) |
| §4.2 rozpad po fázích (7 modulů) | Tasky 7–11 (briefing v `index.js`, viz pozn. u Tasku 8) |
| §4.3 co přežívá / co se maže | Task 7, Task 12 |
| §5 katalog anotací (14 řádků) | Tasky 2–4 |
| §5 čtyři události vědomě bez anotace | Task 1 (explicitní prázdné handlery) |
| §7 test 1 jednotkové nad katalogem | Tasky 2–4 |
| §7 test 2 pokrytí enumu | Task 4 |
| §7 test 3 golden anotace | Task 5 |
| §7 test 4 řetězec přes uzly | Task 3 |
| §7 test 5 `protocol-fill` v3 | Task 6 |
| §10.1 informační postihy variantou (b) | Task 9 (+ Task 10 pro `hide_viditelnost`) |
| §10.2 anotace zapnuté hned, všechny | Tasky 2–4, render v Taskách 10–11 |
| §11 kritérium hotovo | checklist výše + Task 12 Step 5 |

Tři vědomé odchylky (gamble bez pre-gamble odhadu, `goal_scored` přes
`deriveGoalMetrics`, `odkaz.popis` bez názvu situace) jsou vysvětlené nahoře
v sekci **Odchylky od návrhu**.

---

*Souvisí: [[faze-2.1-navrh-2026-07-27|technika/faze-2.1-navrh-2026-07-27.md]] (zadání) ·
[[architektura|technika/architektura.md]] §2.2/§2.4 (událostní log jako kontrakt, tenké UI) ·
[[proverka-bota-2026-07-27|technika/proverka-bota-2026-07-27.md]] (D34/D35 — `postih_efekt`,
který vrstva vysvětluje).*




