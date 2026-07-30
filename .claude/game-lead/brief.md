# Game Dev Lead — Brief projektu Důkazní materiál 1930 (Case File: 1930)
> Aktualizováno: 2026-07-30 (onboarding, Denisa)

## Hra

- **Žánr:** kooperativní narativní hra s volbou (1–4 hráči), roguelite struktura,
  slotová resoluce; hot-seat + online co-op (Steam), estetika *Papers, Please*.
  Jeden run ≈ 30 min. Rok 1930 je první „svět", další (studená válka, kyberpunk)
  jsou plánované DLC nad stejným jádrem.
- **Pitch (1 věta):** Zkorumpovaný polda sepisuje protokol o partě pašeráků chlastu
  z Buffala do New Yorku — hráči nehážou kostkou, cpou věci ze svých kapes do
  situací a hádají se, jak čtyři věci rozdělit do čtyř rolí co nejméně špatně.
- **Cílová skupina:** primárně **2–4 hráči u jednoho stolu** (nebo Remote Play
  Together) — fanoušci narativních indie her ve stylu *Papers, Please*, tolerantní
  k hodně textu a čtení nahlas. **Druhá cílová skupina: streameři a tvůrci obsahu**
  — protokol je sdílný artefakt (váže na marketing). Sólo režim je plnohodnotný,
  ale sekundární (kabinetní puzzle/deckbuilder).
- **Cena / model:** 9,99 € (proti tomu se počítá break-even provozu LLM).

## Design pilíře

1. **Nikdy nemáš dost dobrých věcí — někam se špatná volba MUSÍ dát.** Komedie
   i tření vznikají z nucené špatné volby, ne z optimalizace.
2. **Hádka o rozdělení u stolu.** Vlastnictví postavy: ostatní radí, vlastník
   rozhoduje (obrana proti quarterbackingu).
3. **Čtení protokolu nahlas.** Suchý úřední zápis 3–5 vět, humor z kontrastu
   úřední řeči a absurdní situace — čím hůř dopadneš, tím lepší čtení.

**Neporušitelné principy (nejsou pilíře, ale veto):** mechanika rozhoduje, AI jen
vypráví (LLM nikdy neurčuje výsledek) · hra nikdy nečeká na síť (10 s → fallback)
· viditelná pravidla („proč se to stalo") · žádný volný text hráčů do AI (jen
Mad Libs) · dobová stylizace bez reálných značek a osob · humor nikdy na účet
etnika, pohlaví ani dětí.

## Stav vývoje

- **Aktuální fáze / milník: dva souběžné proudy (rozhodnutí uživatele 2026-07-30).**
  - **P0 — zábavnost a AI vrstva.** Nejvážnější nález projektu: první dohraný run
    lidské brány (2026-07-29) = „všechno, jen ne zábava" (texty nezáživné,
    vytratila se představivost, věci nudné). Živé: **slepý verdikt uživatele nad
    WoZ testem** (`technika/woz-test-2026-07-30.md`, doporučení testéra „B-lite"),
    rám **nespolehlivého vypravěče** (`technika/koncept-kreativita-navrh-2026-07-30.md`),
    pak **fáze 3 = LLM adaptér** — blokuje ji **nerozhodnutý poskytovatel LLM**.
  - **P1 — hygiena D51 (nesmí uvíznout jako „připraveno, nezapsáno").**
    Dokončovací kolo telegrafů v3: invariant hotov a 19 telegrafů přepsáno, ale
    **sada NEZAPEČENA** — dvě porušení ČISTOTY (`privoz-celnik` anti-tell,
    `urednik-vaha` trojité pokrytí). Zapékací commit **musí** obsahovat i opravu
    kanonu o kanálech telegrafu (blokátor od kritika — „připraveno, nezapsáno"
    už dvakrát selhalo).
- **Klíčové hotové systémy:** headless deterministický engine + simulátor
  (slotová resoluce v3) · hot-seat UI přes celý run (psací stroj, mapa, léčky,
  konfrontace) · vysvětlující vrstva 2.1 · próza situace s klikatelnými mezerami
  2.2 · fallback šablony protokolu (28) · přepínač rozboru telegrafu (D50) ·
  obsah v3-kompletní (40 věcí, 15 situací, 8 cílů, pronásledovatelé).
  **Nikdy nestálo: LLM vrstva** — tedy největší produktové riziko je netestované.
- **Go/No-Go je dvoustupňové:** (1) v3 simulační brána **UZAVŘENA 2026-07-27
  (D39): jde se dál** se dvěma známými odchylkami — kalibraci znovu neotevírat,
  je to rozhodnutí uživatele, ne default. (2) **Lidská brána OTEVŘENÁ** (hádka,
  smích, dobrovolný další run, čitelnost) — první run ji fakticky neprošel.
- **Otevřené P0 / rozhodnutí na uživateli:**
  - volba **LLM poskytovatele** (blokuje fázi 3 a test českého humoru),
  - **verdikt nad WoZ testem** (kanonický vs. kreativní režim protokolu),
  - **jazyková strategie CZ→EN** (obsah vzniká česky, primární Steam trh anglický).
- **Známé, vyčíslené odchylky nesené do lidské brány:** K1 3p/4p 77,5 / 79,7 %
  (strop 70) · K6a spread 22,4 b. (gate ≤6) · cíl `muj-den` saturovaný (91–99 %,
  gate 5–95) · 2 z 8 cílů nejsou osobní. Záložní páky (`hraci[n].ruka`, kandidát
  V-3) se aktivují **jen** na nález lidské brány.
- **Otevřený dluh, který si žádá pozornost:** zakrývací zkouška telegrafů (6 čtenářů)
  je vědomě odložená a její riziko se už raz naplnilo · sloty „pohyb vozu"
  `nastroj` vs. `improvizace` (hráč se učí seznam výjimek) · protokol utrácí první
  větu na rekapitulaci telegrafu · `kredity_utracene_za` se počítá týmově, ač je
  vedena jako per-hráč metrika.

## Mapa projektu (kde co je)

- **Trvalá paměť (procesní):** `projekt/stav.md` (živý stav, backlog, otevřené
  otázky — **čti první**), `projekt/rozhodnuti.md` (append-only log D1…D51),
  `projekt/policies.md` (invarianty paměti), `projekt/README.md` (rozcestník).
  Privátní paměť agentů `.claude/agent-memory/**` a osobní vault
  `~/.claude/vault/` — **jen čtu, nikdy nezapisuji**.
- **Design docs:** `CLAUDE.md` (pravidla projektu) · `design-dokument.md` (vize v3,
  zdroj pravdy; škrtnuté nápady v patičce — nenavrhovat znovu) ·
  `prototyp-mvp.md` (resoluční systém, konkrétní čísla, kritéria K1–K9) ·
  `prompty/protokol.md` + `prompty/fallback-sablony.yaml` · `obsah/*.yaml`
  (schémata v komentářích hlaviček; QA invariant telegrafu je v hlavičce
  `obsah/situace.yaml`) · `technika/*.md` (architektura + ADR, kalibrační reporty,
  návrhy fází) · `playtesty/*.md` (jeden soubor na sezení, dle `sablona.md`).
- **Klíčové složky kódu:** `prototyp/src/engine/` (headless, deterministický,
  čísla jen v `rules.js`) · `prototyp/src/ui/` (obrazovky v `screens/run/`,
  čisté moduly `situace-text.js`, `telegraf-rozbor.js`, `vysvetleni.js`) ·
  `prototyp/sim/` (simulátor, bot, report) · `prototyp/test/` (Vitest, golden runy).
  Konvence kódu: `prototyp/CLAUDE.md`.
- **Build/test příkazy & quality gates** (Windows, spouštět přes npm):
  - `npm --prefix prototyp test` — Vitest, **musí být zelené před každým commitem**,
    který mění `prototyp/` nebo `obsah/` (aktuálně 316 testů).
  - `npm --prefix prototyp run lint` — ESLint (hlídá i zákaz `Math.random`/`Date.now`
    v enginu).
  - `npm --prefix prototyp run dev` — Vite dev server (hot-seat UI, smoke test
    v prohlížeči je součástí přejímky fáze).
  - `npm --prefix prototyp run sim` — simulátor; kandidátní obsah se měří
    **kontrafaktuálně přes `CONTENT_DIR`** na kopii `obsah/` ve scratchpadu,
    a to **před** zapečením.
  - Golden snapshoty se mění **jen vědomě**, commit message říká proč.
  - Metodické standardy projektu: **předregistrace kritérií naslepo** před měřením ·
    verdikt z **průměru přes bloky** seedů, ne z jednoho bloku (D31) · negativní
    výsledek se zapisuje a nic se nezapéká.

## Poznámky agenta (log zásadních doporučení/rozhodnutí)

- [2026-07-30] Onboarding proveden. Pilíře potvrzeny uživatelem ve variantě
  „nedostatek / hádka / protokol"; „mechanika rozhoduje, AI vypráví" vedena jako
  neporušitelný princip, ne pilíř. Cílovka = stolní co-op parta **+ streameři**.
  Milník = **oba proudy paralelně** (zábavnost/AI = P0, hygiena D51 = P1).
