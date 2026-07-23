# Log rozhodnutí

*Append-only. Nové rozhodnutí přidávej nahoru s datem a důvodem. Nemaž — když se
rozhodnutí přehodnotí, přidej nový záznam, který na starý odkazuje.*

*Archivační strop: když log přesáhne ~200 řádků, přesuň nejstarší záznamy (nechej
aktuální a předchozí fázi) do `projekt/archiv/rozhodnuti-archiv.md` a nahoře nech
ukazatel na archiv.*

## 2026-07-23

- **D17 schváleno — finální commit model (oprava nepochopení; ruší poolový commit
  z revize).** Tým commituje po telegrafu **přesně 4 karty** (= počet slotů;
  1p volí 4, 2p po 2, 3p 2+1+1 s rotujícím držitelem mapy, 4p po 1) a po
  odhalení textu se VŠECHNY rozdělí do slotů — nic se nevrací, jádro hry je
  **„rozděl co nejméně špatně"**; nevyhnutelně špatná volba u některého slotu
  je záměrná komedie, ne chyba. **Gamble** = záchrana po odhalení: 1× za
  situaci tým vybere ČÍ ruka a lízne z ní NÁHODNĚ (1/3); vytažená karta se
  povinně použije náhradou za commitnutou (ta se odhazuje). Důsledky: pasažér
  neexistuje z definice, stakeless commit neexistuje, trivializace poolu
  odpadá. Sim priority: vyrovnání velikostí rukou mezi počty hráčů, EV gamble,
  frekvence „nevyhnutelně špatného slotu" (koření, ne norma). **Pivot v3
  uživatelem schválen** („zbytek schvaluji") — po zapracování D17 se v3 klopí
  do kanonu (design-dokument + prototyp-mvp současně + consistency-check).
- **D16 schváleno — rozsah MVP v3 a škálování počtu hráčů (po kritice návrhu).**
  (1) **Kreditová ekonomika ZŮSTÁVÁ v MVP** (uživatel přehlasoval doporučení
  kritika oddělit ji do 2. přírůstku) — podmíněno opravami: aritmetika příjmů
  konzistentní, free-cleanse složením nesmí být levnější než léčení, dostupnost
  motelu nesmí odporovat pravidlu „motel nesmí být vzácný". (2) **Tajné cíle
  ZŮSTÁVAJÍ v MVP** (uživatel přehlasoval pevné doporučení kritika odložit) —
  přijaté riziko: druhý skrytý systém přes skryté prahy; vysvětlující vrstva
  (B1) je musí pokrývat také. (3) **Škálování 1–4p: srovnat páku i hádku** —
  víc hráčů nesmí znamenat horší informaci ani tenčí hádku o přiřazení; přesná
  čísla rukou/commitů doladí simulace. Craft-opravy kritiky (vysvětlující
  vrstva jako first-class položka MVP, oprava free-cleanse, ikony viditelnosti
  slotů + telegraf proti-srsti, gamble u 3p bez povinné daně, anotace delty
  Žáru) zadány designérovi bez dalšího schvalování. *Kontext: audit v paměti
  design-critica, návrh projekt/navrh-v3.md.*
- **D15 schváleno — mantinely v3 (slotová resoluce): TOP 3 rozhodnutí + learnabilita
  prahů.** (1) Commit: **naslepo dle telegrafu** (stejný režim pro všechny počty
  hráčů), **tým přiřazuje karty do slotů volně** (vlastník karty musí souhlasit —
  drží vlastnictví postavy i jednotnou hru 1–4p), prahy klíčují na **1 stat
  s výjimkami** u speciálních slotů. (2) Postihy: **plná taxonomie**
  informační/zámkové/ztrátové (ztrátové střídmě), **dva tiery ~70/30** (lehké
  dočasné samy vyprší; těžké trvalé do vyléčení v motelu), **cap 2 aktivní na
  hráče + eskalace** (třetí = postava „složená" kolo–dvě, pak očištěná).
  (3) Prémiové karty: **meta-progrese** (odemykání do sbírky pro příští runy;
  in-run jen výjimečně truhla/event 1–2×), **specializace + výrazný efekt místo
  vyšší síly** (mění varianci, ne průměr — žádný power creep). Prahy jsou
  **kotva ± šum** (typ situace má naučitelný trend, instance ±1 — mistrovství
  roste, memorizace nefunguje, win-rate pásmo brány zůstává smysluplné).
  *Kontext: balanční posudek `technika/balanc-posudek-v3-2026-07-23.md`.
  Samotný pivot na v3 se stvrzuje až schválením design dokumentu v3.*

## 2026-07-22

- **Simulační brána vyhlášena za SPLNĚNOU (4. běh, po D7–D11).** Všech 5
  zafixovaných kritérií prošlo: win-rate 63,8/70,1 % (pásmo 45–70, kompetentní
  na stropu — ověří první měření enginu), snowball od uzlu 3 s vrcholem v uzlu 4,
  první práh Žáru medián uzel 3, žádná strategie >85 %, všech 7 mechanických
  cílů v pásmu 5–95 %. Stavba prototypu odblokována (engine+simulátor → UI →
  LLM). Do `architektura.md` §2.2 doplněna instrumentace pro bodování cílů
  (atribuce `crate_lost`, flag `dobrovolna` u `card_played`, pole
  `bedny_ztracene_timto_hodem` v `node_resolved`). Výhrady a hypotézy pro
  lidskou bránu v `technika/simulacni-brana-2026-07-22.md`.
- **D11 schváleno — finální kalibrace po 3. běhu brány (páky G/H/Ž).**
  3. běh: jádro vyřešené (win-rate 55/65 % v pásmu, snowball správný tvar, žádná
  dominance), padala jen 2 lokální kritéria. (G) `cisty-stit` + podmínka
  `doruceno` (96,3 % → změřeno 52,5 %). (H) `frajer-v-klidu` přerámován ze
  zranění na `kolaps == false a doruceno` — zranění jsou při 4p univerzální,
  žádný práh zranění nefungoval (0,1–3,6 %). (Ž) první práh Žáru (Zátah) zvednut
  ze 4 na 5 — medián prvního prahu padal uzel 2, kritérium chce 3–4; textura
  „všechno Násilí hlučné" zůstává. *Vedlejší nález pro lidskou bránu:* „zbitý,
  ale doručil" je default zážitek (kolaps ~96 % runů) — drama vs. frustrace
  rozhodne první lidské sezení. Následuje 4. běh brány.
- **D12 schváleno — zoufalé karty jako loot za zranění (loot-injury) + buff hlasu
  z auta zůstává +1.** První měření reálným enginem (výhrada č. 1 brány) odhalilo
  díru specifikace: MVP nedefinoval přístup k zoufalým; modelovaný „stálý sdílený
  pool" byl hlavní zdroj hry bez tření (greedy 88–98 % DORUČENO). Změřeny varianty
  (pool / pool-once / dealt / loot-node / loot-injury × buff): loot-injury (návrh
  uživatele) je číselné dvojče dealt (~74–76 % exploit-bot), ale karta přichází
  v dramatickém momentu a v digitálu má nulovou tempo-cenu. Pravidlo: po uzlu se
  zraněním a 2+ celkem lízneš osobní zoufalou (max 1, jednorázová). Buff 0 by
  padl do pásma, ale umrtvil by volbu hlasu z auta — zamítnuto. Zbylé ~body nad
  pásmem doladí tvrdosti/Žár nad daty z prototypu. *Nový backlog: jemné doladění
  obtížnosti po zavedení loot-injury.*
- **D13 schváleno (obsah) — postavy 4/4 a fallback šablony 22.** Pevná čtveřice
  Bartoš/Kowalski/Mazur/Fontana (fixní jména = předpoklad přenositelné cache
  protokolů; vědomě 4 muži — rodové tvary šablon). Šablony parametrické,
  `podminka` hlídá, co smí text tvrdit. Test s dosazenými čísly: 3 rozbité shody
  opraveny; schválený patch: apozice „v místě zvaném" → úřední label „v úseku
  vedeném jako {uzel}" (skřípala na uzlech pojmenovaných dějem), hlas z auta bez
  implikace smrti, `{jmeno}` = příjmení (kontrakt pro engine — AI protokoly
  i fallbacky pak drží stejný registr).
- **D10 schváleno — prahy hodu 7+/5–6/≤4 (páka F) + frajer-v-klidu ≤1 zranění.**
  2. běh brány (240k runů) ukázal overcorrection D7: kompetentní hra spadla na
  18–25 % DORUČENO, kolaps v 99 % runů, snowball front-loaded, cíl frajer 0,1 %.
  Kalibrační sweep našel páku F (snížení prahu plného úspěchu z 8+ na 7+):
  kompetentní 62 %, realistická 49 % — obě v pásmu brány 45–70 %, duch D7
  zachován (5–6 dál zraňuje). `frajer-v-klidu` zmírněn na ≤1 zranění. Potvrzeno
  z 2. běhu: Zátah nevyhnutelný (1,24×/run), konfrontační kolotoč vyřešen
  (0,97×/run), volba rideru Útěku je živá, obetni-beranek opraven (70 %).
  Hardcodované prahy odstraněny i z šablony playtestů, architektury a definic
  agentů (zdroj pravdy jen prototyp-mvp.md). Následuje 3. běh brány.
  *Otevřená hypotéza pro lidskou bránu:* častý kolaps („zbitý, ale doručil") —
  drama, nebo frustrace? Simulace to nerozhodne.
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
