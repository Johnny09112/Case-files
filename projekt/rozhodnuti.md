# Log rozhodnutí

*Append-only. Nové rozhodnutí přidávej nahoru s datem a důvodem. Nemaž — když se
rozhodnutí přehodnotí, přidej nový záznam, který na starý odkazuje.*

*Archivační strop: když log přesáhne ~200 řádků, přesuň nejstarší záznamy (nechej
aktuální a předchozí fázi) do `projekt/archiv/rozhodnuti-archiv.md` a nahoře nech
ukazatel na archiv.*

## 2026-07-22

- **Technická architektura prototypu v0.1 přijata (7 ADR)** —
  `technika/architektura.md`. Klíčové: Vite + vanilla JS bez TypeScriptu (JSDoc
  + `@ts-check`), headless deterministický engine se seedovaným RNG (UI i
  simulátor jsou dva klienti téhož API), resoluční pravidla jako data + čistá
  funkce (kvůli probíhající revizi čísel po auditu), provider-agnostic LLM
  adaptér (cache → 10 s timeout → fallback, logovat vše), obsah mezi repy přes
  git submodule + dev override `CONTENT_DIR`, server/Tauri/Steam odloženy mimo
  v0.1, dvouvrstvé klíčování cache protokolů (exaktní aktivní, hrubý stínově
  měřený). Pořadí stavby: engine+simulátor → hot-seat UI s fallbacky → LLM.
  *Důvod a detaily v jednotlivých ADR.*
- **Repozitář na GitHubu.** Nastaven remote `origin`
  (`git@github.com:Johnny09112/Case-files.git`), výchozí větev přejmenována
  z `master` na `main`, historie pushnuta. Push je od teď aktivní součástí
  konvence po dokončení práce.
- **Commit + push automaticky po dokončení práce.** Claude commituje a pushuje sám,
  bez čekání na pokyn, jakmile je ucelená práce v konzistentním stavu; „kdy" určuje
  Claude. Řešeno jako konvence v `CLAUDE.md`, ne slepý git hook — ten by neuměl
  české zprávy „co a proč" ani logické celky a slepý auto-push je rizikový.
  *Pozn.:* remote zatím nenastaven, push čeká na jeho přidání.
- **Archivační strop `rozhodnuti.md`** ~200 řádků → archiv (viz hlavička).

- **Paměťová architektura: vrstvená, sdílené soubory = pravda.** Doménová a
  procesní pravda žije v gitem verzovaných souborech; privátní paměť agentů
  (`memory: project`) slouží jen ke kalibraci role, ne k projektovým faktům.
  *Důvod:* zabránit roztříštění mezi 9 samostatnými paměťmi a driftu od zdroje pravdy.
- **Obsidian ano jako lidská vrstva nad repem; LLM-wiki odloženo.** Vault se otevře
  nad stávajícími soubory. Generativní LLM-wiki až při velkém korpusu a jen jako
  neautoritativní odvozený index. *Důvod:* tluče se se „source of truth" disciplínou
  a duplikuje grep + consistency-check; korpus je zatím malý.
- **Papírový playtest (Fáze 0) přeskočen.** Nejsou lokální hráči; jde se rovnou na
  prototyp. Go/No-Go předefinováno na dvoustupňové (simulační brána → lidská brána).
  *Důvod:* logistika; simulace nahrazuje papírovou pojistku pro matematiku a tempo.
- **Model spolupráce agentů: hybrid.** `project-manager` orchestruje a dělá review;
  specialisté konzultují adresně určené kolegy. *Důvod:* předvídatelné náklady a
  koordinace bez úzkého hrdla.
- **Založen tým agentů + skill.** 9 agentů (design-critic, content-generator,
  protocol-humor-tester, game-designer, technical-developer, operations-economics,
  marketer, project-manager, playtest-facilitator) a skill `consistency-check`.
  Implementátor kódu záměrně NEzaložen — patří do samostatného kódového repa.
