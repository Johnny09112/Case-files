# CLAUDE.md — Důkazní materiál 1930

Kooperativní party hra (1–4 hráči): gangsteři pašují chlast z Buffala do New Yorku,
zkorumpovaný polda o tom píše protokol. Mechanika rozhoduje, AI vypráví.

## Co tento repozitář je

**Pouze design dokumenty.** Kód prototypu vznikne v samostatném repozitáři.
Sem patří: design, definice MVP, herní obsah (karty, uzly, cíle, šablony),
poznámky z playtestů. Sem nepatří: zdrojový kód, buildy, assety.

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

Oba dokumenty udržuj konzistentní: změna mechaniky v jednom = zkontroluj druhý.
Křížové odkazy v patičkách zachovávej.

## Role Clauda v projektu

1. **Kritický design partner** — zpochybňuj nápady, hlídej scope creep (v MVP je
   sekce „Záměrně MIMO rozsah" — braň ji), upozorňuj na rizika. Nesouhlas je
   cennější než přitakávání.
2. **Generátor obsahu** — karty, šablony uzlů, tajné cíle, prokleté/zoufalé karty,
   fallback šablony protokolů. Vždy česky, vždy s tagem a silou dle resolučního
   systému v `prototyp-mvp.md` (tag Násilí/Lest/Úplatek/Útěk, síla 1–3).
3. **Testér AI humoru** — největší produktové riziko je kvalita českého humoru
   protokolů. Při ladění promptů: suchý policejní zápis, 3–5 vět, česky, humor
   plyne z kontrastu úřední řeči a absurdní situace — ne z vtipkování.
4. **Programátor prototypu** (později, v jiném repu) — Vite + vanilla JS,
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
- **Limity:** text karty max ~140 znaků, název karty max 3 slova, úvod uzlu
  1–2 věty. Protokol 3–5 vět dle `prompty/protokol.md`.

## Konvence

- Dokumentace a komunikace **česky**; budoucí kód (identifikátory, komentáře)
  **anglicky**. Herní obsah (karty, protokoly) česky.
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
4. **Paměť hlavní session** (Claude Code) — uživatelské preference a meta; drž
   v ní minimum projektových faktů, ta žijí v repu.

Práce začíná přečtením `projekt/stav.md` (+ relevantních zdrojů) a končí zápisem
změn stavu/rozhodnutí. Zdroj pravdy je vždy soubor v gitu, ne generovaná stránka.

## Aktuální fáze

**Papírový playtest (Fáze 0) přeskočen — rozhodnutí 2026-07-22:** nejsou lokální
hráči v dojezdu. Jde se rovnou na digitální prototyp; papírovou pojistku nahrazuje
simulace + první digitální/remote sezení (viz agent `playtest-facilitator` a
Fáze 0 v `prototyp-mvp.md`). K papíru se lze vrátit, až budou hráči.

Nové Go/No-Go je **dvoustupňové**:
1. **Simulační brána** (před/během stavby prototypu) — resoluční matematika a tempo
   sedí: hra se nesejde triviálně brzy ani není bez tření, snowball je citelný od
   ~3. uzlu, ekonomika beden vytváří napětí, neexistuje nudně dominantní strategie.
2. **Lidská brána** (po prototypu, solo/remote/async) — původní kritérium zábavnosti
   platí dál, jen se měří digitálně: hráči se hádají o karty, čtou protokol nahlas
   se smíchem, dají si dobrovolně další run. Simulace tohle NEprokáže.

Po dokončení fáze aktualizuj tuto sekci a zapiš výsledek Go/No-Go s datem —
zastaralá sekce navádí špatně.
