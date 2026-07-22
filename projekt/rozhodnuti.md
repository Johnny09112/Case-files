# Log rozhodnutí

*Append-only. Nové rozhodnutí přidávej nahoru s datem a důvodem. Nemaž — když se
rozhodnutí přehodnotí, přidej nový záznam, který na starý odkazuje.*

*Archivační strop: když log přesáhne ~200 řádků, přesuň nejstarší záznamy (nechej
aktuální a předchozí fázi) do `projekt/archiv/rozhodnuti-archiv.md` a nahoře nech
ukazatel na archiv.*

## 2026-07-22

- **D7 schváleno — výsledek 5–7 = reálné zranění** (+ poznámka do spisu), žádná
  „poznámka zdarma". *Důvod:* simulační brána (216k runů) ukázala kompetentní hru
  90–98 % DORUČENO; citlivostní analýza změřila, že tato jediná změna ji sráží na
  72,5 % — směrem ke zdravému pásmu. Nejsilnější páka za nejmenší pravidlo.
- **D8 schváleno — balíček pák simulace (probráno bod po bodu):**
  (2) ruka definována = 5 karet, dolízání po uzlu, prahy hodu se nezpřísňují;
  (3) přežití konfrontace → Žár klesá na **3** (proti kolotoči finále 1,5–2,6×/run);
  (4) Zátah při prahu **nahrazuje obě cesty** (dřív beztrestně obejitelný, hrál se
  0,22×/run); (5) rider Útěku: při selhání **volí vlastník** zranění vs. −1 bedna
  (Útěk byl dominantní odtok beden a mono-Útěk past); (6) `obetni-beranek` na
  max sílu ≤2 s výjimkou zoufalých/vynucených karet (byl ~1 % = mrtvý);
  (7) škálování počtem hráčů se zatím NEřeší (kognitivní zátěž, rozhodne se z dat
  po přesimulování); tvrdosti mini-uzlů pronásledovatelů: léčka `zar`,
  konfrontace `zraneni`. *Zdroj čísel:* `technika/simulacni-brana-2026-07-22.md`.
- **D9 schváleno — měřitelná kritéria simulační brány** zafixována
  v `prototyp-mvp.md` (referenční 4p run: DORUČENO 45–70 % u realistické
  i kompetentní hry, snowball od uzlu 3, první práh Žáru uzel 3–4, žádná strategie
  >85 %, žádný cíl <5 %/>95 %). *Důvod:* slovní kritérium nešlo objektivně
  vyhodnotit; příští běhy se měří proti číslům.
- **D4 schváleno — tagová textura mechanicky: „ridery tagů".** Násilí = nejvyšší
  síly, vše hlučné (+1 Žár); Úplatek = při selhání smíš odhodit 1 bednu a povýšit
  na „úspěch za cenu"; Útěk = selhání nezraní, tým ztratí bednu; Lest = bez rideru,
  nekrytá variance. *Důvod:* audit design-critica ukázal, že textura §4.5 se
  v mechanice nerealizovala — tagy byly zaměnitelné, volba karty lookup, Lest
  fakticky dominovala a Násilí (motor Žáru) bylo čistě nejhorší. Ridery zavěšují
  texturu na existující měřidla (Žár/bedny/zranění), žádný nový subsystém,
  simulovatelné. Řeší zároveň nálezy B1, B2, B3, D1 a část D5 auditu.
- **D5 schváleno — doprovodná pravidla a úpravy obsahu (balík game-designera).**
  (a) Nutkání ochutnat = modifikátor hodu místo „zrušení hodu" (sólo + fabrikace
  protokolu). (b) Cíl `do-posledniho-dechu` stažen (odměna za sebe-vyřazení);
  kolabovaný hráč dostává „hlas z auta" (+1 spoluhráči, nebo mu lízni prokletou).
  (c) Textové cíle `obetni-beranek` a `frajer-v-klidu` převedeny na mechanické
  proxy; `kupecke-slovo` personalizováno. (d) +1 generický Zátah-uzel (speciální,
  vkládaný), `mesto-zatah` přejmenován kvůli kolizi. (e) Zoufalé karty ignorují
  postih za zranění. (f) Priorita prokletých: zákaz tagu > vynucení. (g) Kosmetika
  K1–K4 (2 Lest karty jiný vtip, ujasnění Ztráty důstojnosti, zkrácení úvodu).
  *Pozn.:* proveditelnost „hlasu z auta" v hot-seat UI ověří technical-developer.
- **D6 schváleno — prompt protokolu v0.2 + regresní baterie.** Rule 2 posílena:
  počet beden a zranění se bere výhradně z výsledku mechaniky, nikdy z textu
  karty (humor-tester prokázal riziko fabrikace u „hladkých" karet). Zakládá se
  `prompty/protokol-testy.yaml` se 4 odhalenými případy jako regresní baterie.
  Stav „bez hodu" není potřeba (Nutkání ochutnat předěláno na modifikátor).
- **D1 schváleno — Žár: základní +1 per uzel, ne per hod.** Selhání v uzlu přidává
  +1 Žár max 1× za uzel (aspoň jedno selhání = +1); hlučné karty +1 per karta
  a výsledkové +2 beze změny; tvrdost `zar` (+2) zůstává záměrně per selhání.
  *Důvod:* per hod škáluje tempo Žáru s počtem hráčů (solo max +1/uzel, 4 hráči
  až +4/uzel) — práh 10 by u 4 hráčů padal téměř každý run. Per uzel dává první
  práh ~3.–4. uzel nezávisle na velikosti party.
- **D2 schváleno — sjednocení designu a prototypu (4 nálezy konzistence).**
  (1) Prahy úspěchu jsou globální (8+/5–7/≤4 v prototypu), obtížnost uzlu dělají
  afinity + tvrdost — design už nemluví o „prahu uzlu". (2) Prokleté karty se
  lížou **od 2. zranění** (potvrzeno, design zpřesněn). (3) Zátah při prvním prahu
  Žáru **nahrazuje** jednu ze dvou cest, nepřidává třetí — jinak by ho hráči vždy
  obešli; klíčové i pro simulátor (`route_offered`). (4) Čísla Žáru vyškrtnuta
  z design dokumentu — drží jen strukturu, hodnoty žijí v prototypu (dle §8).
  Stejně odhardcodovány prahy Žáru z komentářů `obsah/cile.yaml`
  a `obsah/pronasledovatele.yaml`.
- **D3 schváleno — schéma tajných cílů: `overeni_typ` + `podminka`.** Cíle se dělí
  na `mechanicky` (simulátor je boduje z událostního logu přes strojově čitelnou
  `podminka` nad metrikami z architektury §2.2) a `textovy` (pozná jen člověk
  z obsahu protokolu; simulátor je z metrik vynechá s poznámkou v reportu).
  *Důvod:* `overeni` byla volná próza — simulační brána by neuměla bodovat cíle,
  ač s tím architektura počítá. Přidány první 2 mechanické cíle jako vzor.
- **Rozvrstvení modelů agentů.** `project-manager` → **Fable** (orchestrace,
  dlouhohorizontová multi-agent práce, 1M kontext). Ostatní → **Opus 4.8**
  (design, obsah, humor, ekonomika, technika, facilitátor playtestů). Levné
  mechanické běhy (simulace) lze v případě potřeby stáhnout na Sonnet 5.
  *Důvod:* „vše na Fable" (děděno ze session) je nejdražší konfigurace; Opus 4.8
  dá ~90 % kvality za půlku ceny, Fable jen tam, kde je orchestrace jeho silou.
  *Pozn.:* `playtest-facilitator` dán na Opus kvůli poctivé interpretaci
  simulací; těžké simulační běhy jdou později zlevnit na Sonnet.
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
