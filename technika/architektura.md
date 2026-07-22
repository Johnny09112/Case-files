# Technická architektura prototypu v0.1

**Stav:** schváleno 2026-07-22 (technical-developer, po schválení plánu uživatelem).
Tento dokument je zadání pro samostatný kódový repozitář — sem žádný kód nepatří
(viz `CLAUDE.md`). Změny architektury = nové/aktualizované ADR dole.

---

## 1. Přehled a cíle

Prototyp v0.1 je **lokální webová aplikace** (single-page, Vite + vanilla JS):
hot-seat na jednom počítači, placeholder grafika, jediný povinný efekt je
**psací stroj vyklepávající protokol**. Cíl: ověřit core loop (lidská brána
Go/No-Go), nic víc.

**Primární řídicí požadavek je ale simulační brána** (viz `CLAUDE.md`, Aktuální
fáze): dřív, než bude cokoli hratelné, musí jít resoluční matematika a tempo
prohnat tisíci simulovaných runů. Z toho plyne hlavní architektonický princip:

> **Herní engine běží od prvního dne headless** — bez UI, bez sítě, bez DOM.
> UI i simulátor jsou jen dva různí klienti téhož enginu.

Druhý řídicí fakt: **resoluční čísla jsou právě v revizi** (audit design-critica:
Žár per hod vs. per uzel, tvrdost uzlů). Architektura na konkrétních číslech
nesmí záviset — pravidla jsou data + čistá funkce (ADR-003), takže výměna
resolučních pravidel je lokalizovaná do jednoho modulu a simulátor umí porovnat
varianty pravidel proti sobě.

## 2. Architektura čtyř vrstev

```
┌───────────────────────────────────────────────┐
│  UI (hot-seat, psací stroj)   │  Simulátor    │   ← dva klienti
├───────────────────────────────┴───────────────┤
│  Game engine (čistý JS, deterministický,      │
│  seedované RNG, událostní log)                │
├───────────────┬───────────────────────────────┤
│ Content loader│  LLM adaptér (timeout,        │
│ (obsah/*.yaml)│  fallback, cache, logging)    │
└───────────────┴───────────────────────────────┘
```

Závislosti tečou jen dolů: engine nezná UI ani síť; LLM adaptér nezná engine
(dostává hotový strukturovaný výsledek); UI je nejtenčí vrstva.

### 2.1 Content loader

- Načítá `obsah/*.yaml` z design repa (knihovna `js-yaml`), validuje proti
  schématům z komentářů v hlavičkách souborů (tagy, síly 1–3, afinity −2/0/+2,
  tvrdost `bedna|zar|zraneni`, limity délek textů). Chyba validace = srozumitelná
  hláška se souborem a `id` záznamu — obsah ladí neprogramátor, hlášky musí být
  česky a konkrétní.
- Parser je izomorfní: funkce `parseContent(yamlString)` bez I/O; browser ji krmí
  přes Vite import, simulátor (Node) přes `fs`. Jeden validátor pro oba světy.
- **Sdílení mezi repy: git submodule + dev override** (ADR-005). Kódové repo
  pinuje design repo jako submodule (reprodukovatelnost buildů a CI); pro živé
  ladění obsahu lze ve vývoji nastavit `CONTENT_DIR` na lokální checkout design
  repa — neprogramátor uloží YAML, F5 v prototypu, hotovo, žádný sync krok.

### 2.2 Game engine

Čistý JS modul bez závislosti na DOM, síti i hodinách. Deterministický:
**stejný seed + stejná sekvence voleb = bit-přesně stejný run.** Veškerá
náhoda (hody d6, míchání balíčků, los pronásledovatele, nabídka cest) jde
z jediného seedovaného PRNG streamu (mulberry32 nebo ekvivalent — `Math.random`
je v enginu zakázán).

**Hranice API enginu:**

- Vstup: `createRun({seed, content, rules, players})` + příkazy hráčů
  (`chooseRoute(routeId)`, `playCard(characterId, cardId)`, `confirmNode()`).
  Nic jiného stav nemění.
- Výstup: aktuální stav (read-only snapshot pro render) + **append-only
  událostní log**. UI i simulátor čtou tentýž log; protokolová pipeline si z
  události `node_resolved` postaví vstup pro LLM přesně ve formátu
  `prompty/protokol.md`.

**Formát událostního logu** (JSONL-serializovatelný; každá událost má `seq`,
`type`, `nodeIndex` a payload):

| Událost | Payload (výběr) | Krmí metriku simulační brány |
|---|---|---|
| `run_started` | seed, verze obsahu, verze pravidel, pronásledovatel | reprodukce runu |
| `route_offered` / `route_chosen` | nabídnuté uzly, volba, byl-li Zátah | detekce dominantní strategie |
| `card_played` | postava, karta (id, tag, síla, hlučná) | distribuce tagů na strategii |
| `check_resolved` | postava, hod, síla, afinita, postih zranění, součet, pásmo (úspěch / za cenu / selhání), aplikovaná tvrdost | prahy hodů, snowball |
| `injury_added` / `cursed_drawn` / `character_down` | postava, počet zranění | distribuce zranění po uzlech |
| `crate_lost` | důvod, zbývá beden | ekonomika beden |
| `heat_changed` | delta, důvod (selhání/hlučná/uzel), nová hodnota | tempo Žáru |
| `heat_threshold` | práh (4/7/10), nodeIndex | **kdy padají prahy Žáru** (cíl: 1. práh ~3.–4. uzel) |
| `ambush_inserted` / `confrontation_started` | pronásledovatel | četnost léček/konfrontací |
| `node_resolved` | kompletní strukturovaný výsledek uzlu (vstup pro protokol) | — |
| `run_ended` | výsledek (DORUČENO/NEVYŘEŠENO), příčina, počet uzlů, skóre cílů | délka runu, příčiny konce |

**Pravidla jako data + čistá funkce (ADR-003):** všechna resoluční čísla
(prahy hodu, přírůstky a prahy Žáru, počet beden, práh kolapsu, sazba „Žár per
hod vs. per uzel" — aktuální hodnoty vždy v `prototyp-mvp.md`, sem
nehardcodovat) žijí v jednom konfiguračním objektu `rules`;
vyhodnocení je čistá funkce `resolve(state, action, rules, rng)`. Až audit čísla
změní, mění se jeden objekt — a simulátor umí pustit tutéž dávku runů proti
několika variantám `rules` a porovnat je.

### 2.3 LLM adaptér

Poskytovatel je **nerozhodnut** — rozhraní je provider-agnostic (ADR-004):

- Jedno volání na uzel. Vstup = strukturovaný text přesně dle
  `prompty/protokol.md` (UZEL / OSOBY / KARTY / VÝSLEDEK MECHANIKY); systémový
  prompt se bere z téhož souboru, nikde se neduplikuje. Žádný volný text hráčů
  do promptu (ochrana proti prompt injection).
- **LLM nikdy nerozhoduje výsledek** — dostává hotový výsledek mechaniky
  z události `node_resolved` a jen ho dramatizuje. Adaptér výstup lehce
  validuje (délka, absence měny výsledku se nevaliduje strojově — to hlídá
  regresní baterie protocol-humor-testera).
- **Tvrdý požadavek: hra nikdy nečeká na síť.** `Promise.race(provider, 10 s)`;
  timeout, chyba i nevalidní výstup → **fallback šablona** (výběr podle typu
  uzlu + pásma výsledku z ~20 šablon, doplnění jmen; čistě lokální, synchronní).
  Psací stroj začne klepat okamžitě fallbackem maskovanou latenci — hráč rozdíl
  mezi „ještě generujeme" a „už máme" nevidí.
- **Cílový model: třída Haiku** (aktuálně Claude Haiku 4.5: $1 vstup / $5 výstup
  za MTok). Odhad na volání: ~600–800 tokenů vstup + ~150–200 výstup ≈
  **$0,002/uzel, tj. ~$0,015/run bez cache**. Poznámka z reálií API: minimální
  cachovatelný prefix pro provider-side prompt caching je u Haiku 4.5
  4096 tokenů — náš systémový prompt je řádově kratší, provider cache se tedy
  neuplatní. **Nákladová páka je naše aplikační cache protokolů, ne prompt
  caching poskytovatele.**
- **Logování všeho:** každé volání zapíše JSONL záznam {čas, klíč cache, celý
  prompt, raw odpověď, zdroj (llm/cache/fallback), latence, model}. V prototypu
  IndexedDB/localStorage + tlačítko „Exportovat logy" (JSONL). Logy jsou
  surovina pro ladění promptu i budoucí doladění malého lokálního modelu.

**Klíčování cache** (cíl: maximální hit-rate, náklady na hráče časem klesají):

1. **Exaktní klíč (v0.1):** SHA-256 kanonického JSON vstupu — `{uzel_id,
   seřazené záznamy [postava_id, karta_id, pásmo výsledku, typ následku],
   ztracené bedny, digest trvalých poznámek}`. Kanonizace = seřazené klíče,
   žádné časy, žádné seedy. Hit = identická situace → identický protokol.
2. **Hrubý klíč (příprava na globální cache):** vynechá texty poznámek a
   nahradí je bucketem počtu zranění (0/1/2/3+) na postavu. Ukládá se **jen pro
   „čisté" stavy** (bez trvalých poznámek) — právě ty jsou nejčastější v prvních
   uzlech, kde je i největší objem volání; u stavů s poznámkami by hrubý hit
   riskoval protokol zmiňující následky, které postava nemá.
3. V0.1 se **měří, nerozhoduje**: loguje se hit-rate obou klíčů (hrubý jen
   stínově), globální cache na proxy (mimo v0.1) se pak klíčuje podle dat,
   ne odhadu. Konkrétní čísla hit-rate předat operations-economics.

Pozn.: jména postav jsou fixní čtveřice z obsahu, takže protokoly jsou mezi
stoly přenositelné — to je předpoklad, aby globální cache vůbec dávala smysl.

### 2.4 UI

Nejtenčí možná vrstva: render stavu enginu + odesílání příkazů. Hot-seat,
odkryté karty, tajný cíl přes „Jsem Jan" kliknutí. Jediný povinný efekt je
**psací stroj** (postupné vypisování protokolu, ~30–50 ms/znak s variancí) —
je to nosič zážitku i maska latence LLM. Žádný stavový management framework;
stav drží engine, UI je re-render nad snapshotem. Vše, co vypadá jako herní
logika v UI souboru, je architektonická chyba.

## 3. Simulátor

Headless runner nad enginem (Node, `npm run sim`), pro simulační bránu Go/No-Go
a agenta playtest-facilitator:

- **Strategie hráčů:** `random` (baseline šumu), `greedy-affinity` (vždy
  nejlepší tag+síla do afinity), `heat-averse` (minimalizuje Žár), a
  `tag-spam:<tag>` (hraje jediný tag — detektor dominantní strategie: pokud
  spam jednoho tagu vyhrává srovnatelně s greedy, je balanc rozbitý).
- **Dávky:** tisíce runů na konfiguraci; každá dávka = {verze obsahu, varianta
  `rules`, strategie, rozsah seedů} — plně reprodukovatelná.
- **Co loguje:** (a) kompletní událostní logy všech runů jako JSONL (1 řádek =
  1 událost, soubor na dávku), (b) `summary.json` + čitelný `summary.md`
  s agregacemi: win-rate a příčiny konce, distribuce délky runu, **histogram
  uzlu prvního/druhého/třetího prahu Žáru**, průměr zranění po uzlech (křivka
  snowballu — cíl: citelný od ~3. uzlu), křivka beden, srovnávací tabulka
  strategií. Playtest-facilitator navazuje na tyto dva artefakty, nemusí nic
  počítat sám.
- Simulátor **nevolá LLM ani fallback šablony** — protokol je pro matematiku
  irelevantní. (Výjimka: cíle vázané na obsah protokolu se v simulaci bodují
  jen mechanicky přes `overeni` heuristiku, nebo se z metrik vynechají —
  poznamenat do reportu.)

## 4. Klíče a produkce

**Prototyp v0.1:** API klíč v lokálním `.env` (gitignore, `.env.example`
v repu), přímé volání z browseru přes Vite (`import.meta.env`). Vědomé omezení:
klíč se dostane do dev bundle — **build prototypu se nikdy nikam nenasazuje**,
běží jen lokálně u vývojáře. Bez klíče hra plně funguje na fallback šablonách.

**Produkční směr (mimo scope v0.1, jen zaznamenáno — ADR-006):**

- **Serverless proxy** (např. Cloudflare Worker): drží API klíč, hostuje
  **globální cache** (klíčování dle 2.3 — proto se hit-rate měří už teď)
  a vynucuje **tichý fair-use strop** (po X runech denně čistě cache/fallback).
- Desktop balení **Tauri** (webview → malý binár, cesta na Steam/Itch).
- Online co-op přes **Steam networking** (SDR) — až po validaci loopu, návrh
  enginu s příkazy + deterministickým logem je na lockstep síťování připravený
  vedlejším efektem, ne záměrem.

Ekonomiku proxy/cache (náklady na hráče, strop fair-use) konzultovat
s operations-economics až nad naměřenými daty z v0.1.

## 5. Pořadí stavby

1. **Engine + simulátor bez UI → simulační brána.** Nejrizikovější a právě
   revidovaná věc jsou resoluční čísla; headless se iterují za minuty a bez
   nákladů. Dokud simulační brána neprojde, UI ani LLM nemá co zobrazovat.
2. **Hot-seat UI s fallback šablonami** — hra plně hratelná bez AI a bez
   klíče. Fallbacky tím dostanou stovky expozic zadarmo (testují se jako
   primární obsah, ne jako zaprášená pojistka) a psací stroj se ladí bez
   latence sítě.
3. **LLM adaptér** — nakonec, protože jeho rozhraní je zafixované
   `prompty/protokol.md` a mechanika na něm nezávisí; do hotové hry se jen
   „zapojí lepší vypravěč". Kvalita humoru se mezitím ladí paralelně
   (protocol-humor-tester), ne na kritické cestě stavby.

## 6. Struktura budoucího kódového repa

```
dukazni-material-prototyp/
├─ content/                  # git submodule → design repo (obsah/, prompty/)
├─ src/
│  ├─ engine/                # čistý JS, zákaz importů z ui/, llm/, DOM, sítě
│  │  ├─ rules.js            # resoluční čísla jako data (ADR-003)
│  │  ├─ resolve.js          # čistá funkce vyhodnocení
│  │  ├─ state.js            # stav runu + příkazy
│  │  ├─ events.js           # typy událostí, event log
│  │  └─ rng.js              # seedovaný PRNG (jediný zdroj náhody)
│  ├─ content/
│  │  └─ loader.js           # js-yaml parse + validace (izomorfní)
│  ├─ llm/
│  │  ├─ adapter.js          # orchestrace: cache → provider → timeout → fallback
│  │  ├─ prompt.js           # skládání vstupu dle prompty/protokol.md
│  │  ├─ cache.js            # exaktní + stínový hrubý klíč
│  │  ├─ log.js              # JSONL logování + export
│  │  └─ providers/
│  │     ├─ fallback.js      # šablony — vždy přítomný provider
│  │     └─ (anthropic.js)   # až po rozhodnutí o poskytovateli
│  ├─ ui/
│  │  ├─ app.js, screens/…
│  │  └─ typewriter.js       # psací stroj
│  └─ main.js
├─ sim/
│  ├─ run.js                 # CLI: dávky runů, výstup logs/ + summary
│  ├─ strategies.js
│  └─ report.js
├─ test/                     # Vitest
├─ logs/                     # gitignored (JSONL dávek simulace)
├─ .env.example
└─ vite.config.js
```

**Testovací strategie (Vitest — nativní k Vite, běží v Node):**

- *Unit testy enginu:* `resolve()` přes všechna pásma prahů (dle `rules`), afinity,
  postihy zranění, všechny tři tvrdosti, přírůstky a prahy Žáru, rušený tag
  pronásledovatele, kolaps postavy, konec beden.
- *Regresní testy resoluce (golden runs):* fixní seed + skriptovaná sekvence
  voleb → snapshot celého událostního logu. Změna pravidel změní snapshot
  **viditelně a záměrně** — commit message musí říct proč. Přesně tohle chrání
  probíhající revizi čísel před tichými regresemi.
- *Validace obsahu:* test načte reálné `content/obsah/*.yaml` a vynutí schémata
  — rozbitý YAML od content-generatora spadne v testu, ne za běhu hry.
- *LLM adaptér:* testy s mock providerem (timeout, chyba, pomalá odpověď,
  cache hit/miss, fallback výběr). Žádné síťové testy v CI.

**Tooling:** Vite + vanilla JS (ES moduly), Vitest, js-yaml, ESLint (mj. zákaz
`Math.random` v `src/engine/`). Bez frameworku, bez bundlovaných UI knihoven.
TypeScript ne — viz ADR-001; typy dokumentujeme JSDoc anotacemi na hranicích
modulů (engine API, formát událostí, rozhraní provideru), volitelně
`// @ts-check` v editoru, bez kompilačního kroku.

---

## 7. ADR — architektonická rozhodnutí

### ADR-001: Vite + vanilla JS; bez TypeScriptu; herní enginy zamítnuty
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** Fixní zadání (CLAUDE.md): Vite + vanilla JS, hot-seat. Zvažováno:
  TypeScript; Godot/Unity/jiný engine.
- **Rozhodnutí:** Vanilla JS (ES moduly) + Vite. TypeScript se nezavádí; typová
  dokumentace přes JSDoc na hranicích modulů. Godot/Unity zamítnuty pro v0.1.
- **Důvody:** (a) hra je textové UI + trocha stavu — engine by přinesl asset
  pipeline, export a učící křivku bez užitku pro validaci loopu; (b) rozhodnutí
  o enginu je explicitně odloženo až po validaci loopu — nepředbíhat;
  (c) TS by u projektu této velikosti (jeden vývojář, ~2–4 týdny) přidal build
  friction a šum v diffech, zatímco JSDoc + `@ts-check` dá 80 % užitku typů
  zadarmo; deterministický engine se stejně jistí golden-run testy, ne typy.
- **Důsledky:** rychlá iterace; disciplínu hranic modulů musí držet ESLint
  a code review, ne kompilátor. Pokud engine přeroste ~3 tis. řádků nebo
  přibude druhý vývojář, TS se přehodnotí (migrace JSDoc→TS je levná).

### ADR-002: Headless deterministický engine + seedované RNG
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** Simulační brána Go/No-Go vyžaduje tisíce runů před vznikem UI;
  balanc se musí ladit reprodukovatelně.
- **Rozhodnutí:** Engine je čistý JS bez DOM/sítě/hodin; veškerá náhoda z jednoho
  seedovaného PRNG; stejný seed + stejné volby = identický run i událostní log.
  UI a simulátor jsou dva klienti téhož API (příkazy dovnitř, události ven).
- **Důsledky:** simulace, golden-run regresní testy a reprodukce bugů („pošli
  seed") zadarmo; vedlejším efektem je připravenost na lockstep networking.
  Cena: disciplína (zákaz `Math.random`/`Date.now` v enginu, lint pravidlo).

### ADR-003: Resoluční pravidla jako data + čistá funkce
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** Resoluční čísla (Žár per hod vs. per uzel, tvrdost, prahy) jsou
  v revizi po auditu design-critica. Architektura na nich nesmí záviset.
- **Rozhodnutí:** Všechna čísla v jednom `rules` objektu; vyhodnocení je čistá
  funkce `resolve(state, action, rules, rng)`. Žádná konstanta resolučního
  systému mimo tento modul.
- **Důsledky:** výměna pravidel = změna jednoho objektu; simulátor porovnává
  varianty pravidel v jedné dávce (přímo podporuje probíhající audit); golden
  testy verzují pravidla spolu se snapshoty.

### ADR-004: Provider-agnostic LLM adaptér (timeout → fallback, cache, log)
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** Poskytovatel LLM nerozhodnut; tvrdé požadavky: hra nečeká na síť
  (10 s → fallback), 1 volání na uzel, model třídy Haiku, logovat vše, žádný
  volný text hráčů.
- **Rozhodnutí:** Jedno rozhraní `provider.generate(request)`; orchestraci
  (cache lookup → race s 10s timeoutem → validace → log → fallback) vlastní
  adaptér, ne provider. Fallback provider je vždy přítomný a hra je bez klíče
  plně hratelná. Prompt se skládá výhradně dle `prompty/protokol.md`.
- **Zavrženo:** vendor SDK natvrdo v herním kódu (uzamklo by volbu poskytovatele);
  spoléhání na provider-side prompt caching (u Haiku 4.5 je minimální
  cachovatelný prefix 4096 tokenů — náš prompt je kratší, neuplatní se).
- **Důsledky:** výměna poskytovatele = jeden soubor v `providers/`; nákladová
  optimalizace stojí na aplikační cache (ADR-007); JSONL logy živí ladění
  promptu i budoucí malý lokální model.

### ADR-005: Sdílení obsahu — git submodule + dev override `CONTENT_DIR`
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** `obsah/*.yaml` a `prompty/protokol.md` mají jediný zdroj pravdy
  v design repu; obsah ladí neprogramátor a potřebuje smyčku „ulož → F5".
- **Rozhodnutí:** Kódové repo vkládá design repo jako **git submodule**
  (`content/`) pinovaný na commit → build i CI jsou reprodukovatelné a je vždy
  dohledatelné, s jakou verzí obsahu simulace běžela (verze obsahu jde i do
  `run_started`). Pro vývoj lze `CONTENT_DIR` přesměrovat na lokální checkout
  design repa → živé ladění bez commitů. Submodule aktualizuje vývojář;
  neprogramátor pracuje jen v design repu.
- **Zavrženo:** *kopie souborů* (drift a druhý zdroj pravdy — přímo porušuje
  CLAUDE.md); *symlink* (na Windows vyžaduje developer mode/oprávnění, není
  verzovaný, CI ho nemá).
- **Důsledky:** jedna mimořádná git operace pro vývojáře; obsahová smyčka pro
  neprogramátora zůstává „ulož a obnov stránku".

### ADR-006: Serverová část, Tauri a Steam odloženy mimo v0.1
- **Datum:** 2026-07-22 · **Status:** přijato (odklad)
- **Kontext:** Produkce potřebuje proxy s klíčem, globální cache, fair-use,
  desktop distribuci a online co-op. Nic z toho neověřuje core loop.
- **Rozhodnutí:** v0.1 = lokální `.env` + přímé volání, build se nenasazuje.
  Směr pro později (nezavazující): serverless proxy (např. Cloudflare Worker)
  s klíčem + globální cache + fair-use stropem; Tauri pro desktop; Steam
  networking (SDR) pro co-op. Konkrétní volby padnou až po lidské bráně a nad
  naměřenými daty (hit-rate cache, náklady/run) s operations-economics.
- **Důsledky:** nulová infrastruktura v prototypu; jediné, co se pro produkci
  dělá už teď, je **měření** (logy, hit-rate) — data pro pozdější rozhodnutí.

### ADR-007: Dvouvrstvé klíčování cache protokolů
- **Datum:** 2026-07-22 · **Status:** přijato (hrubý klíč jen stínově měřený)
- **Kontext:** Globální cache je hlavní nákladová páka („náklady na hráče časem
  klesají"); klíč musí maximalizovat hit-rate bez rizika nekonzistentních
  protokolů (zmínka následku, který postava nemá).
- **Rozhodnutí:** (1) exaktní klíč = hash kanonického JSON celého vstupu —
  bezpečný, v0.1 jediný aktivní; (2) hrubý klíč bez textů poznámek s bucketem
  zranění — ukládá se jen pro čisté stavy (bez trvalých poznámek), kde
  nekonzistence nehrozí a objem volání je největší; v0.1 se počítá jen stínově
  pro měření potenciálu. Rozhodnutí o nasazení hrubého klíče v globální cache
  padne nad naměřeným hit-rate (s operations-economics).
- **Zavrženo:** klíčovat včetně seedů/časů (nulový hit-rate); agresivní hrubý
  klíč pro všechny stavy (riziko protokolů odporujících spisu — porušuje
  viditelná pravidla).
- **Důsledky:** v logu každého volání je obojí klíčování → ekonomika globální
  cache se spočítá z dat, ne z odhadu.

---

*Souvisí: [prototyp-mvp.md](../prototyp-mvp.md) (technologie, resoluční systém,
metriky), [design-dokument.md](../design-dokument.md) (§4.2 viditelná pravidla,
§4.5 protivníci, §6 AI architektura & náklady), [prompty/protokol.md](../prompty/protokol.md)
(kanonický prompt), `obsah/*.yaml` (schémata obsahu), `CLAUDE.md` (neporušitelné
principy, dvoustupňové Go/No-Go).*
