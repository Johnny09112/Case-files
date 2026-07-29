# CLAUDE.md — Důkazní materiál 1930

Kooperativní party hra (1–4 hráči): gangsteři pašují chlast z Buffala do New Yorku,
zkorumpovaný polda o tom píše protokol. Mechanika rozhoduje, AI vypráví.

## Co tento repozitář je

**Monorepo projektu (od 2026-07-26, D23).** Kořen = design vrstva (design,
definice MVP, herní obsah, prompty, poznámky z playtestů, procesní paměť).
Podadresář `prototyp/` = kód digitálního prototypu (Vite + vanilla JS) —
má vlastní `CLAUDE.md` s kódovými konvencemi; engine čte `obsah/*.yaml`
přímo z kořene. Dřívější samostatný repo `dukazni-material-prototyp` byl
2026-07-26 sloučen sem (subtree, historie zachována) a na GitHubu archivován.

Dělba: **obsah a design dokumenty edituje jen designový tým** (kód je pouze
čte), kód se mění podle pravidel v `prototyp/CLAUDE.md` (testy před commitem).

## Soubory

- `design-dokument.md` — aktuální design (v2, po produktové diskusi 2026-07-22).
  Jediný zdroj pravdy pro vizi hry. Historie škrtnutých nápadů je v patičce —
  nenavrhuj znovu, co už bylo zamítnuto (Jackbox režim, tajné karty, AI
  balancování, product placement).
- `prototyp-mvp.md` — definice prvního hratelného prototypu (fáze 0–2), resoluční
  systém s konkrétními čísly, metriky úspěchu playtestů.
- `obsah/*.yaml` — herní obsah (karty, uzly, tajné cíle, pronásledovatelé) ve
  strojově čitelném formátu. Jediný zdroj pravdy pro obsah; prototyp ho bude
  načítat přímo. Schéma
  je popsané v komentáři na začátku každého souboru — dodržuj ho, nová pole
  nepřidávej bez úpravy komentáře.
- `prompty/protokol.md` — kanonické znění promptu pro generování protokolu,
  s příklady dobrého/špatného výstupu a changelogem. Prompt nikdy neupravuj
  jinde než tam.
- `playtesty/` — poznámky z playtestů, jeden soubor na sezení (`RRRR-MM-DD.md`),
  vždy podle struktury `playtesty/sablona.md`. Bez vyplněných metrik se sezení
  nepočítá do Go/No-Go.
- `prototyp/` — kód prototypu (engine, simulátor, UI, testy). Konvence a
  principy kódu: `prototyp/CLAUDE.md`; architektura: `technika/architektura.md`.

Oba dokumenty udržuj konzistentní: změna mechaniky v jednom = zkontroluj druhý.
Křížové odkazy v patičkách zachovávej.

## Role Clauda v projektu

1. **Kritický design partner** — zpochybňuj nápady, hlídej scope creep (v MVP je
   sekce „Záměrně MIMO rozsah" — braň ji), upozorňuj na rizika. Nesouhlas je
   cennější než přitakávání.
2. **Generátor obsahu** — věci (karty s 5 staty: útok/obrana/hodnota/improvizace/
   nástroj), situace (telegraf + text se 4 sloty + skryté prahy kotva ± šum),
   postihy (informační/zámkové/ztrátové, 2 tiery), tajné cíle, fallback šablony
   protokolů. Vždy česky, vždy dle resolučního systému v3 v `prototyp-mvp.md`.
3. **Testér AI humoru** — největší produktové riziko je kvalita českého humoru
   protokolů. Při ladění promptů: suchý policejní zápis, 3–5 vět, česky, humor
   plyne z kontrastu úřední řeči a absurdní situace — ne z vtipkování.
4. **Programátor prototypu** (v `prototyp/`) — Vite + vanilla JS,
   hot-seat only, jediný povinný efekt je psací stroj vyklepávající protokol.

## Neporušitelné design principy

- **Mechanika rozhoduje, AI vypráví.** LLM nikdy neurčuje výsledek akce — dostává
  hotový výsledek a jen ho dramatizuje. Každý návrh, který dává AI rozhodovací
  pravomoc, odmítni.
- **Hra nikdy nečeká na síť.** Timeout 10 s → fallback šablona.
- **Viditelná pravidla.** Hráč vždy ví, proč uspěl nebo selhal.
- **Vlastnictví postavy.** Ostatní radí, vlastník rozhoduje (řeší quarterbacking).
- **Žádný volný text hráčů do AI** — jen Mad Libs šablony (prompt injection).

## Stylová pravidla herního obsahu

- **Dobová stylizace (1930):** žádné anachronismy mimo záměrný, ojedinělý vtip.
- **Žádné reálné značky, firmy ani reálné osoby** (právní riziko + Steam AI
  disclosure). Smyšlená jména mohou dobové reálie parodovat.
- **Humor:** suchý, situační, plyne z kontrastu úřední řeči a absurdity. Nikdy
  na účet etnika, pohlaví ani dětí — tohle je zároveň baseline budoucí moderace
  UGC karet.
- **Limity:** text věci max ~140 znaků, název max 3 slova, telegraf situace
  3–5 vět / max 400 znaků (D48; telegraf je **předzvěst, ne výčet rolí** —
  závazný je QA invariant v hlavičce `obsah/situace.yaml`), text situace se
  4 mezerami max ~5 vět, rozpočet na uzel telegraf + text ≤ 670 zn. Protokol
  3–5 vět dle `prompty/protokol.md`.

## Konvence

- Dokumentace a komunikace **česky**; kód v `prototyp/` (identifikátory,
  komentáře) **anglicky**. Herní obsah (karty, protokoly) česky.
- Datumy zapisuj absolutně (2026-07-22), ne relativně.
- Škrtnuté nápady nemaž — přesuň do historie v patičce s důvodem škrtnutí.
- Repozitář je verzovaný gitem: **po dokončení ucelené práce Claude vždy sám
  commitne a pushne** (bez čekání na pokyn). „Kdy" určuje Claude — jakmile jsou
  soubory v konzistentním stavu (žádné rozeditované půlky). Zprávy česky, první
  řádek = co se změnilo a proč; commituj v logických celcích. Nikdy necommituj
  rozbitý stav ani tajemství. Remote `origin` je nastaven (GitHub, větev `main`).
- LLM poskytovatel **zatím nerozhodnut** — v návrzích drž volání abstrahované
  (levný model třídy Haiku, jedno volání na uzel, strukturovaný vstup, logovat
  vše, globální cache).

## Paměť a kontext (jak se drží dlouhodobě)

Vrstvená paměť, aby projekt neztrácel kontext mezi sezeními:

1. **Doménová pravda** — `design-dokument.md`, `prototyp-mvp.md`,
   `prompty/protokol.md`, `obsah/*.yaml`, `playtesty/*`. Autoritativní, ruční, git.
2. **Procesní paměť** — `projekt/stav.md` (živý stav, roadmapa, backlog, otevřené
   otázky) a `projekt/rozhodnuti.md` (datovaný, append-only log rozhodnutí a proč).
   `project-manager` je udržuje. `projekt/README.md` je rozcestník (i Obsidian home).
3. **Privátní paměť agentů** (`memory: project`) — **jen kalibrace role** (tón,
   co už kritik vytkl…), ne projektová fakta. Cokoli, co má vědět jiný agent nebo
   příští session, patří do sdílených souborů výše, ne do privátní paměti.
4. **Osobní vault** (`~/.claude/vault/`, off-git, cross-project) — uživatelské
   preference, styl práce a znovupoužitelné postupy napříč projekty. Sem NEpatří
   projektová/týmová fakta (ta žijí v gitu výše). Načítá se přes `~/.claude/CLAUDE.md`.

Práce začíná přečtením `projekt/stav.md` (+ relevantních zdrojů) a končí zápisem
změn stavu/rozhodnutí. Zdroj pravdy je vždy soubor v gitu, ne generovaná stránka.
Invarianty projektové paměti (integrita, bezpečnost, scope) jsou v `projekt/policies.md`.

## Aktuální fáze

**Papírový playtest (Fáze 0) přeskočen — rozhodnutí 2026-07-22:** nejsou lokální
hráči v dojezdu. Jde se rovnou na digitální prototyp; papírovou pojistku nahrazuje
simulace + první digitální/remote sezení (viz agent `playtest-facilitator` a
Fáze 0 v `prototyp-mvp.md`). K papíru se lze vrátit, až budou hráči.

**PIVOT v3 (2026-07-23, rozhodnutí D14–D17):** kostková resoluce nahrazena
**slotovou** — commit věcí naslepo dle telegrafu, „rozděl 4 karty do 4 slotů co
nejméně špatně", skryté prahy odhalované po vyhodnocení, postihy místo zranění,
StS mapa s křížkujícím šerifem, kreditová ekonomika. Kanon = design-dokument v3
+ prototyp-mvp v3 (v2 vč. splněné brány D7–D11 je uzavřená kapitola v patičkách
a `technika/simulacni-brana-2026-07-22.md`).

Go/No-Go je **dvoustupňové**:
1. **v3 simulační brána — UZAVŘENA 2026-07-27 (D39), verdikt: JDE SE DÁL
   se dvěma známými odchylkami.** Kritéria K1–K9 (`prototyp-mvp.md` Fáze 0),
   engine na slotové resoluci; verdikt vždy z průměru přes bloky (D31), K6a
   napříště na 2000 runů/buňka. **Splněno:** K5 varianta D 9,72 %, K1 pro 1p/2p,
   K2 floor, K4d, K5f, K7, K8. **Nesplněno a vědomě nesené do lidské brány:**
   K1 3p/4p (77,5 / 79,7 % proti stropu 70) a K6a (22,4 b. proti ≤6) — příčinou
   je co-op škálování výběru karet, jediná páka bez dotyku obsahu
   (`prahOffsetDlePoctu`) je proměřená a vyčerpaná (D38), záložní páka
   `hraci[n].ruka` se aktivuje jen na nález lidské brány. **Kalibraci znovu
   neotevírej** — další kolo je rozhodnutí uživatele, ne default.
   Historie kalibrací: -1 (D22) zapečena · -2 opravila K4c (šum ±2) · -3 (D24)
   lék „snížit viditelné kotvy" měřením vyvrátila · -4 (D26–D33) zapekla nové
   znění brány (K5 varianta D, K5f, K2 drift degradován na diagnostiku) ·
   prověrka bota (D34) + opravy (D35) zavřely K5 a otevřely K1 3p/4p a K6a ·
   -5 (D38) sweep `prahOffsetDlePoctu` — negativní výsledek.
   Od **D23 (2026-07-26) monorepo** — kód v `prototyp/`, kalibrační smyčka
   v jednom repu; kandidátní obsah se měří kontrafaktuálně přes `CONTENT_DIR`
   před zapečením.
2. **Lidská brána — OTEVŘENÁ:** hádka o rozdělení, smích nad protokolem,
   dobrovolný další run + **čitelnost** (metrika 6 — nález playtestu 2026-07-22:
   hra musí vysvětlovat „proč se to stalo").

**Obsah:** `obsah/*.yaml` je **v3-kompletní** (od 2026-07-23; kalibrace-1
zapečena 2026-07-24) — 40 věcí s 5 staty, 15 situací se sloty, postihy, cíle,
pronásledovatelé. Jediný zdroj pravdy pro obsah; edituj dle schémat v komentářích
souborů (v2 obsah je archivovaný).

Po dokončení fáze aktualizuj tuto sekci a zapiš výsledek Go/No-Go s datem —
zastaralá sekce navádí špatně.
