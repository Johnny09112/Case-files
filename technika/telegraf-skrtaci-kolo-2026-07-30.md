# Telegraf — škrtací kolo (D51)

*Stav ke 2026-07-30, `game-designer` dle mandátu D51 + dokončovacího kola.
**Invariant v3 je hotový a po re-review doplněný o pravidla, která kolo objevilo
teprve použitím na hotové texty (zákaz výhradnosti, směrový test — §2, §3.6).
Sada 19 telegrafů prošla ČTYŘMI průchody a do `obsah/` se ANI TEĎ NEZAPSALA:**
oba recenzenti dali „ZAPÉCT PO OPRAVÁCH", jejich nálezy jsou zapracované (§3.5),
ale výsledná verze je opět nerecenzovaná a **délky se musí přeměřit** — kritik
doloženě odhaduje, že čtvrtý průchod ubral obraz v 9 uzlech. Předem, aby to nebylo
zpětné rozhodnutí: **vyjde-li průměr pod 315 znaků, nezapéká se a rozpočet se
dopisuje do obrazu** (§3.6). Historie všech průchodů je záměrně zachovaná
v §3.1–3.6 — je to doklad, co gate zachytil a co recenzentům uniklo. Consistency
opravy z D51 bodu 3 jsou zapsané (§6.1), oprava kanonu čeká na zapékací commit
(§6.2). Předchůdci: [[telegraf-invariant-navrh-2026-07-29|technika/telegraf-invariant-navrh-2026-07-29.md]]
(znění v1 a v2), [[koncept-kreativita-navrh-2026-07-30|technika/koncept-kreativita-navrh-2026-07-30.md]]
§5 (Q4 — verdikt „osekat právě jeden kanál") a §8 (prověrka kritika).*

---

## 1. Co se škrtá a proč (jedna změna, ne třetí přepis)

**Škrtá se pravidlo (A) POKRYTÍ** — „každý VIDITELNÝ slot má v próze právě jeden
nárok". To je jediná změna, kterou zadal mandát D51.

**Co se změnilo NAD mandát a proč** (mandát žádal ostatní kanály zachovat dle v2,
„pokud kolo neukáže jinak — každou další změnu zdůvodni zvlášť"; kolo ukázalo jinak
u **devíti** věcí, každá má jmenovaný důvod a jmenovaného nálezce — tři poslední
řádky přidalo teprve dokončovací kolo, kdy se pravidla poprvé použila na hotové
texty):

| změna | důvod | odkud |
|---|---|---|
| **pravidlo 1b** — viditelný útok-slot × `zbran_projde=ano` ⇒ je to kotva | bez toho v3 neřekne u finále, že se tam bije, a chybný commit v konfrontaci ukončí run | blokující nález **B-1** kritika |
| **POVINNÝ ZÁPOR** útoku, když `zbran_projde=ano` a útok není v žádném slotu (3 uzly) | verdikt „zbraně se tu nikdo nelekne" jinak **svádí** committnout brokovnici do scény bez útok-slotu; a je to jediná mitigace přiznané ceny, která nestojí položku | blokující nález **B-2** |
| **číslovka počtu skrytých jen tam, kde `proti_srsti` ≠ 1** | počet „jedna" je konstanta u 18 z 19 → vyčíslovat ji = platit skeletonem za nulu; přesně tenhle požadavek vyrobil v D49 skeleton v 17 z 19 | nález **N-1** generátoru |
| **druhý nárok** dovolen i v léčce/konfrontaci (kanál 7 srostlý), ale nikdy tam, kde by pojmenoval všechny viditelné sloty; kvóta podílem + registr | plošný zákaz upíral nejvíc informace `brody-zataras`, tedy uzlu, na kterém hráč nález vyslovil | **N-2** + **V-6** |
| **PRAVIDLO PODMĚTU** (vět s podmětem posádka = počet nároků) | po škrtu se poměr kulisy k nároku převrací z ~1:3 na ~1:1 a falešná poptávka přestává být rozpoznatelná; je to jediná kontrola ČISTOTY, kterou máme | **V-5** |
| **PŘEJÍMKA v3** (6 bodů) + **strop záporů** o témže statu | procedura D49 byla definovaná proti plnému pokrytí, po škrtu neznamená nic; a šest telegrafů říkajících „peníze neplatí" by naučilo, že hodnota je past | **B-3** + **N-4** |
| **VERDIKT ZBRANĚ přestal být „smysl" a je NORMATIVNÍ ZNĚNÍ** — 4 doslovné řetězce v jednom paradigmatu + 2 pevné appendy | pravidlo „slovesa se smějí přizpůsobit, smysl ne" ten rozpad **vyrobilo**: 11 znění na 4 buňky, s největším rozptylem u dvou buněk, které se liší jen tím, jestli skrytá zbraň pomáhá → posluchač je rozlišoval na posledních třech slovech. Chybné čtení = auto-fail karty | **N-3** generátoru, **potvrzeno měřením** humor-testéra |
| **KONTROLA ANTI-TELLU VÝČTEM** (vypiš pět statů uzlu, odškrtni, který není v žádném slotu — pak teprve čti prózu) | zápor o statu, který ve slotech JE, se čtením nenajde: první průchod v3 měl **4 z 19**, všechny o `improvizace`, a neodhalil je ani jeden recenzent | vlastní nález při opravě, §3.5 |
| **DOVĚTEK k pravidlu podmětu:** nárok vzniká i přes NPC-přání („chce…", „ustoupí jen tomu, kdo…") | pravidlo podmětu je jinak obcházitelné — `urednik-vaha` si tak vyrobil tři nároky místo jednoho, ačkoli podmětové počítání vycházelo (kritik na to varoval: „semantika přebije grep") | vlastní nález, §3.4 |

Naopak **beze změny zůstává** jádro („nárok je sloveso, ne kulisa"), mřížka
verdiktu jako čtyři buňky (mění se jen znění, ne logika), kanál 6 (slotová
výjimka), kanál 7 jako připomínka pravidla, slovník nároků, dělicí čára humoru,
strop 400 znaků a rozpočet uzlu 670.

Argument je **počet položek, ne délka**. `farmar-brod` má 351 znaků a nese věci,
které si hráč musí držet v hlavě naráz, po jednom přečtení, nahlas, před slepým
commitem: 3 viditelné nároky + počet skrytých + skrytý útok + verdikt zbraně.
Nález hráče („telegraf neříká nic a ještě víc mate", playtest 2026-07-29) tedy
**není selhání exekuce D49** — sada z D49 je proti staré měřitelně lepší
(0× skeleton, kotvy ze scény, verdikty 19/19, délky pod stropem). Je to selhání
specifikace: invariant v2 enumeraci **přikazoval**.

**Pozor na dvojí počítání, ať se čísla nerozjedou:** konceptové kolo (§5.1)
mluvilo o **šesti** položkách, protože počítalo počet skrytých a skrytý útok
zvlášť. Definice položky ve v3 (§2) je slučuje do jedné *předzvěsti*, takže táž
zapečená sada má dle v3 **pět** položek. Cíl v3 je **tři**. Úspora je tedy
2 položky dle nového počítání a 3 dle starého — a v obou čteních je to skok pod
hranici, na které si čtenář obsah z jednoho přečtení udrží.

**Délka se přitom nemění** (zapečený průměr 338 znaků, cíl v3 je střed pásma
300–360): mění se náplň. Ubere se ~120 znaků za dva nároky a přidá ~100 znaků
obrazu. Hráč sám řekl, že text **smí být delší** — uvolněné místo proto jde do
**obrazu**, ne do úspory znaků a ne do dalších nároků. *Argument o „hustotě
znaků na položku" jsem odsud vyškrtl (nález D-a prověrky): připisoval položkám
znaky, které jdou do kulisy, a je to týž typ tvrzení, který jsem v konceptovém
kole sám odmítl. Proměnná je počet položek, nic jiného.*

### 1.1 Co škrt NENÍ

- **Není to balanční páka.** Zákaz z D47 §13.2 („vágnější próza se nesmí
  používat jako dial obtížnosti") platí. Tvrzení „osekání srazí K1 3p/4p" bylo
  v konceptovém kole vyškrtnuto jako blokující nález K-2 a **nevzkřísí se**:
  sim aplikuje fidelitu `p` na každou roli **uniformně**
  (`sim/strategies.js:417–427`), kdežto v3 dává jistotu jedné roli a nulu třem —
  **tuhle asymetrii model nemodeluje**. Kdo bude chtít balanční argument, zaplatí
  pevnou cenu: sweep asymetrické fidelity, 2000 runů/buňka, průměr přes bloky,
  předregistrovaný směr. *(Původní formulace „sim to neumí modelovat ani jedním
  směrem" je opravena po nálezu V-2: pro asymetrii platí, ale pro druhou polovinu
  sázky v3 — hodnotu prioru — měřidlo existuje, rameno `memorizacni`. Viz §1.2.)*
- **Není to důkaz, že brána osekání unese.** Je to jen absence brzdy: K4d má
  u 1p rezervu **18,6 b.** proti τ = 6 a i při `p` = 0,3 zůstává na 13,0 b.
  (přeměřeno PM, D47 §9). Skutečné měřidlo je **lidské** (metrika 6, zakrývací
  zkouška), protože sim prózu nečte.
- **Není to plošné ubrání informace.** Co přestalo být **povinné**, zůstává
  **dovolené** — viz „dovolený druhý nárok" v §2. Bez toho by škrt sáhl na
  learnabilitu (K7/K4d) a na to, že zadání slepého commitu stojí na próze.

### 1.2 Přiznaná cena škrtu (nemá měřidlo v bráně, patří k stolu)

Ve v2 šlo z **absence** útok-nároku usoudit „brokovnici necháme doma" — nároky
byly vyčerpávající, takže absence byla informace. Ve v3 absence nároku
**neznamená nic**. Tu inferenci proto nese výhradně **verdikt zbraně** (kanál 5)
a **záporné tvrzení**. Dva důsledky, oba zapsané do invariantu:

1. Verdikt zbraně se nesmí zatmavit ani o slovo (bot ho navíc čte s jistotou,
   brána pro jeho ztrátu měřidlo nemá).
2. Záporné tvrzení („peníze si vzít netroufne") je ve v3 **cennější než ve v2**
   a zůstává povolené za týchž podmínek (jen stat, který není v žádném slotu,
   nejvýš 1× za telegraf).

**Proti kterým metrikám se to smí obhajovat (a proti kterým ne):**

- **Metrika 6 (čitelnost)** je v `prototyp-mvp.md` definovaná jako „hráč **po
  uzlu** chápe, proč slot prošel/selhal" — tedy jako **poresolučí** srozumitelnost.
  V3 na ni nesahá: odhalení textu i vysvětlující vrstva zůstávají beze změny
  a nesou plná jména statů, kotvu s rozpětím šumu a viditelnost (přesný práh
  padne s razítkem — oprava úniku prahů dle D51/1 je už v kódu, `assign.js`). Škrt tedy metriku 6 nezlepšuje
  ani nezhoršuje; kdo by v3 prodával jako lék na metriku 6, míchá dvě různé věci.
  Léčí se **srozumitelnost telegrafu**, což je nález hráče, ne zapsaná metrika.
- **Metrika 1 (stůl se před rozdělením hádá/radí)** je ta, kde se to rozhodne —
  a tady je hlavní designový argument v3: hádka se **přesouvá z luštění telegrafu
  na rozdělení po odhalení**. To je přesně místo, kam ji `design-dokument.md`
  §4.3 chce („jádro hry není »vyber nejlepší«, ale »rozděl to, co máš, co nejméně
  špatně«"). Debata nad commitem se ztenčí — přiznávám to — ale debata nad
  rozdělením se nemění a je to ta, na které design staví večer.
- **Riziko, které z toho plyne a patří na stůl, ne do simu:** committne-li tým
  čtyři karty po jedné informaci a typovém prioru, může commit působit jako
  loterie. Testuje se to u stolu; sim to nezachytí (prózu nečte).
- **v3 dělá PRVNÍ run těžší a další snazší — a lidská brána je první run.**
  *(Nález V-2 prověrky, přijat; je to nejdůležitější věta téhle sekce.)* v3
  přesouvá commit-schopnost ze čtení textu do **prioru v hlavě hráče**. Pro
  hráče, který prior nemá, je mitigace „typový prior zůstává jako sázka" hodna
  **nuly** — a přesně takový hráč sedí u prvního sezení, na kterém projekt už
  jednou havaroval. Proti tomu stojí jen onboarding z D50 (na prvním uzlu relace
  je rozbor vidět) a odhalení, které role pojmenuje.
  **Kritik navrhl na to měřidlo — a měření ten návrh vyvrátilo.** Rameno
  `memorizacni` (`sim/strategies.js:413–416`) je bot, který zná staty všech slotů
  podle `id`, tedy měl být limitním případem sázky v3 a shora ohraničit, co je
  prior hoden. Facilitátor to proměřil (3 disjunktní bloky × 1000 runů × 8
  konfigurací = 96 000 runů, metodika D31):

  | rozdíl *memorizační − kompetentní* | celkem | 1p | 2p | 3p | 4p |
  |---|---|---|---|---|---|
  | b. win-rate (mean ± sd přes bloky) | −4,4 | **+3,9** (sd 2,0) | −3,9 | −8,1 | −9,6 |

  **Znaménko se otáčí.** Bot s **dokonalou** znalostí slotů je u 2p–4p
  o 4–10 bodů **horší** než bot, který čte telegraf s fidelitou 0,7 — a ztráta
  roste s počtem hráčů. Směr je konzistentní ve všech třech blocích jednotlivě.
  **Důsledek pro tenhle report: rameno NENÍ horní mez hodnoty prioru.** Kdyby se
  ta dvě ramena lišila jen informací, striktně informovanější bot nemůže být
  horší; rozdíl tedy nese **commit-politika**, ne znalost (facilitátorova
  hypotéza: `memorizacni` cílí commit na všechny sloty naráz, `kompetentni` na
  užší množinu odvozenou z telegrafu, a širší cílení hůř svazuje kvótu napříč
  hráči). Interpretace je čtení kódu, ne měření, a nikdo ji zatím neudělal.
  **Platí tedy původní stav: pro sázku v3 nemá simulace měřidlo a jediná brána je
  lidská.** Zapisuji to jako **třetí případ v tomto jednom kole, kdy měření
  vyvrátilo teorii** — po bajtech vs. znacích a po mé vlastní přehlédnuté falešné
  poptávce.
  *Co z těch čísel použít SMÍM, protože to je rozdíl ramen na týchž seedech:*
  u **1p** dokonalá znalost pomáhá (+3,9 b.), tedy prior sólistovi hodnotu má —
  a sólo je přesně buňka, ve které lidská brána poprvé havarovala.
  *Co z nich NEODVOZUJI:* že „úzká informace je pro tým lepší". Je to lákavá
  hypotéza (tým potřebuje ohnisko, ne víc možností) a **přesně ta třída tvrzení,
  kterou jsem si v §1.1 zakázal.** Kdo ji bude chtít tvrdit, zaplatí sweepem
  asymetrické fidelity, ne tímhle číslem.
- **Postih `hide_telegraf`** byl ladil proti telegrafu o pěti položkách, po v3
  bere tři. Sim ho modeluje jako „bot committne bez trendu", takže **změna jeho
  tvrdosti je pro simulaci neviditelná v obou směrech** — táž třída jako
  asymetrická fidelita. Přiznáno, neměřeno (nález D-f).
- **Přístupnostní ventil zůstává a je to doložitelné:** přepínač *Ulehčení:
  rozbor telegrafu na rozklik* (D50) vypisuje `popisSignalu()`
  (`prototyp/src/ui/telegraf-rozbor.js:55–67`) — **plná jména statů všech
  viditelných rolí, počet skrytých, verdikt zbraně, skrytý útok/improvizace
  i slotovou výjimku**, tedy přesně to, co v3 z prózy ubírá. Kdo pokrytí
  potřebuje, má ho na jeden klik (a na prvním uzlu relace ho dostane sám).
  **v3 tedy nikomu informaci neodebírá — mění jen default.** Zároveň to znamená,
  že se z ulehčení nesmí stát doporučený režim: dle D48 jde se zapnutým rozborem
  4p win-rate na 86,8 %, takže je to EASY, ne „lepší čitelnost".

### 1.2b Kde nález hráče vznikl — a proč to mění pravidlo pro pronásledovatele

Konkrétní příklad, na kterém hráč nález vyslovil, je **`brody-zataras`**
(playtest 2026-07-29, „absolutně neříká nic — vyloženě špatný a ještě víc
mate"), tedy **léčka**. To je nepříjemné: u léček a konfrontací nese próza
navíc **kanál 7** (připomínka run-wide pravidla `rusi`), takže by jim samotný
škrt POKRYTÍ srazil počet položek jen z pěti na čtyři — nejmenší zlepšení by
dopadlo přesně na telegraf, který stížnost vygeneroval.

Řešení je v obsahu, ne v úlevě z rozpočtu — **srostlá forma kanálu 7** (zapsána
do invariantu §2, kanál 7):

- **Brody** (`rusi: stitek GANGSTER`) míří na **tutéž osu jako verdikt zbraně**
  (železo = pozornost), takže se s ním spojí do jedné věty: *„Zbraně se tu nikdo
  nelekne, ale u Brodyho každá přitáhne dvojnásob pozornosti."* Jedna položka,
  ne dvě.
- **Malone** (`rusi: stat hodnota`) — a `hodnota` **není v žádném jeho slotu, ani
  skrytém** (ověřeno u léčky i konfrontace), takže připomínka je legální
  **záporné tvrzení** („peníze na něj neplatí"), a zápor se do položek nepočítá.

Všechny čtyři uzly pronásledovatelů tím jdou na **tři položky** stejně jako
běžné uzly. Cena: zápor u Malonea je vyčerpán pravidlem a nesmí se použít na nic
jiného.

### 1.3 Nález, na kterém stojí pravidlo výběru kotvy

Zapečený obsah má **silný a doposud nikde nezapsaný typový prior** — spočítáno
přes viditelné sloty všech 19:

*Počítáno jako „v kolika scénách daného typu se stat objevuje aspoň v jednom
VIDITELNÉM slotu"; KOMBI slot se počítá do obou svých statů.*

| typ | výskyt statu ve viditelné trojici | co je očekávané | co je informativní |
|---|---|---|---|
| `lokace` / `zatah` (5) | `nastroj` **5/5** · `improvizace` **5/5** · `utok` 1/5 · `hodnota` **0/5** · `obrana` **0/5** | nářadí + improvizace | útok, peníze, klid — a mezi nářadím a improvizací to, co scéna nevypadá, že chce |
| `npc` / `lecka` (12) | `improvizace` 9/12 · `hodnota` 8/12 · `obrana` 8/12 · `nastroj` 7/12 · `utok` **4/12** | řeč, peníze, klid | **útok** — a jen útok. („A po něm nářadí" je po nálezu V-4 **vyškrtnuto**: rozdíl 7/12 proti 8/12 je jedna scéna a nerozlišuje nic.) Útok o to víc, že u `npc`/`lecka` zbraň na očích propadá, takže „zatlačit" je pobídka i past zároveň |
| `konfrontace` (2) | `utok` 2/2 · `improvizace` 2/2 · `obrana` 1/2 · `nastroj` 1/2 · `hodnota` 0/2 | průraz a improvizace | **prior se tu nepoužívá** — po nálezu B-1 platí pravidlo 1b (viditelný útok-slot × `zbran_projde=ano` ⇒ kotva), protože chybný commit v konfrontaci ukončí run |

**Kde prior platí a kde ne:** deterministický je jen u `lokace` (5/5 proti 0/5).
U `npc` rozlišuje jedinou věc (útok) a u 3 z 12 scén nedává odpověď vůbec.
U `zatah` (n = 1) je sebereferenční, u `lecka`/`konfrontace` ho hráč nemá odkud
znát. Pravidlo 2 je tedy **užší, než jak vypadalo** — a to je v pořádku: pravidla
1, 1b a 3 pokrývají zbytek.

**A tenhle prior není náhoda — kanon ho předepisuje doslova.**
`design-dokument.md` §4.5: *„typ situace má naučitelný trend (NPC »všimné« →
hodnota; překážka »oprava« → nástroj)"*. Měření to potvrzuje položku po položce:
`npc`/`lecka` → `hodnota` 8/12, `lokace`/`zatah` → `nastroj` **5/5**. Zapečený
obsah tedy slib §4.5 **plní**, jen to nikdo nikdy nezměřil a nezapsal.

**Co přesně hráč před commitem o typu ví — doloženo kódem, ne odhadem**
(`prototyp/src/ui/screens/run/mapa.js:1–40`):

- **typ místa je VEŘEJNÁ informace** (komentář v hlavičce modulu, D34/N7),
- mapa u každé cesty vypisuje **obecné pravidlo pro zbraň** („zbraň tu projde
  i na očích" / „zbraň ve viditelné roli tu propadá — přesný verdikt padne až
  v telegrafu"), `pravidloTypu()` ř. 17–22,
- a vypisuje **jméno místa** z pole `nazev` („Silniční váha u Amsterdamu",
  „Starý most přes Mohawk"), `nazevCesty()` ř. 34–40 — což je samo o sobě
  fikční prior,
- a typ se hráči zobrazuje **česky a intuitivně** (`labels.js:87–94`: `npc` =
  **„člověk"**, `lokace` = **„lokace"**). To je důležité: prior „člověk chce řeč
  a peníze, místo chce nářadí" je z těch dvou slov **odhadnutelný bez učení** —
  není to arbitrární tabulka, ale to, co si každý domyslí sám. Právě proto je
  utrácet na něj jedinou položku telegrafu plýtvání.

Hráč si tedy cestu vybírá se znalostí typu, jména místa a pravidla o zbrani —
**s výjimkou léček a konfrontací, kde typ nevidí nikde** (vkládají se z prahů
Žáru, `mapa.js` na ně kartu volby nedává a `commit.js` typ nevypisuje; nález V-3
prověrky). U těch čtyř uzlů proto prior neplatí a rozhoduje pravidlo 3.
`design-dokument.md` §4.5 learnabilitu typového trendu **slibuje**, takže telegraf
může svou jedinou položku utratit na **odchylku od prioru** místo na potvrzení
toho, co si hráč domyslí sám.

**Co z toho NEplyne (nález V-1 prověrky, přijat):** že je změna „ortogonální
k obtížnosti". Pravidlo „kotva se nevybírá podle výšky kotvy" je zákaz *kritéria*,
kdežto ortogonalita je tvrzení o *společném rozdělení* — druhé z prvního neplyne
a byla by to táž třída tvrzení jako zamítnutý balanční argument K-2, jen menší.
**Naměřený fakt místo něj** (kritik aplikoval pravidla na všech 19): v 17 případech
kotva výšku kotvy nesleduje, **ve dvou ano a systematicky** — pravidlo 1 (KOMBI je
vždy kotva) vybírá v obou KOMBI scénách **nejnižší kotvu scény** (`farmar-stodola`
3 proti 4/4, `most-prohnila-prkna` 2 proti 3/3). Je to naměřená vlastnost téhle
sady, ne garance příštího kola.

*Poctivá mez tohohle argumentu:* prior je **naučitelný**, ne **sdělený**. Hráč
v prvním runu ho nemá a v jeho očích telegraf mluví o jedné náhodné věci. Proti
tomu stojí onboarding z D50 (na prvním uzlu relace je vidět mechanický rozbor)
a odhalení, které role pojmenuje. Kdyby se u stolu ukázalo, že prior se za jeden
run nenaučí, správná odpověď **není** vrátit POKRYTÍ, ale prior **doříct na mapě**
(jedna věta k typu místa) — to je levnější a nezahltí telegraf.

---

## 2. Nové znění invariantu (v3) — ke vložení do `obsah/situace.yaml`

Nahrazuje blok od `# QA INVARIANT TELEGRAFU` po `# --- STAV PŘEJÍMKY …` včetně
(v dnešním `situace.yaml` jsou to ř. 38–156). Řádek schématu se mění jen o jednotku:
`telegraf: předzvěst před commitem, max 400 ZNAKŮ (viz QA invariant níže)`.
Platí i pro `lecka`/`konfrontace` v `obsah/pronasledovatele.yaml` (tam navíc
kanál 7).

```yaml
# QA INVARIANT TELEGRAFU (D19 + D6; v3 — ŠKRTACÍ KOLO 2026-07-30, D51)
#
# Historie znění: „zmiň VŠECHNY VIDITELNÉ staty“ (do D47) → v2 „(A) POKRYTÍ:
# každý viditelný slot má nárok“ (D47–D49) → v3: POKRYTÍ ŠKRTNUTO. Důvod: první
# dohraný run u člověka (playtesty/2026-07-29) — „telegraf neříká nic a ještě víc
# mate“. Nebyla to vada exekuce D49, ale vada specifikace: farmar-brod nesl na
# 351 znacích PĚT položek dle definice níže (v konceptovém kole se počítalo šest —
# počet skrytých a skrytý útok zvlášť), které si hráč držel v hlavě naráz, po
# jednom přečtení, před slepým commitem. Léčí se POČET POLOŽEK (5 → 3), NE délka —
# hráč sám řekl, že text smí být delší, takže uvolněné místo jde do OBRAZU.
#
# Telegraf je PŘEDZVĚST, ne výčet rolí. Je to PRÓZA = lidský rendering signálu,
# který engine DERIVUJE ze slotů (`deriveTelegrafSignal`, prototyp/src/engine/
# resolve.js). Signál se NEautoruje — próza jen musí zůstat věrná: nesmí tvrdit
# nic, co signál vyvrací. Od D47/D50 je mechanický výčet („co z toho plyne“) v UI
# nativně SKRYTÝ (viditelný jen na 1. uzlu relace nebo se zapnutým ulehčením),
# takže v defaultním režimu je tenhle text JEDINÝ nositel informace před commitem.
# Informaci nese OBRAZ (překážka, člověk, předmět, gesto), ne jméno statu.
#
# --- JÁDRO: NÁROK JE SLOVESO, NE KULISA ---------------------------------------
# Scéna smí obsahovat cokoli — úředníka, který se dívá, zámek, blok pokut. Kulisa
# NIC neprozrazuje. Nárok vzniká teprve tím, že próza přiřkne POSÁDCE práci
# („bude třeba…“, „zbude…“, „jde to jedině tak, že…“). Z toho dvě pravidla:
#   (A) KOTVA    — právě JEDEN viditelný slot dostane nárok. Povinný.
#                  (v2 žádalo nárok pro KAŽDÝ viditelný slot — to je ŠKRTNUTO.)
#   (B) ČISTOTA  — próza nepřiřkne posádce žádný nárok, který není slotem.
#                  NEZMĚNĚNO, a po škrtu POKRYTÍ je to nejdražší pravidlo sady:
#                  falešná poptávka je chyba, kterou hráč nemá jak odhalit —
#                  committne kartu naprázdno a nedozví se proč.
# Pořadí nároků je VOLNÉ — commit je naslepo, pořadí rolí je pro něj irelevantní.
#
# MARKÉR HRANICE NÁROKU (bez něj je nárok splněný jen v autorském čtení):
#   KOMBI slot        = „a zároveň / a přitom“ v TÉŽE klauzuli.
#   dva různé sloty   = oddělené AKTÉREM nebo tečkou („Někdo… jiný…“),
#                       nikdy jen spojkou „a“.
#   jeden slot        = jedno sloveso, jeden objekt; druhý obraz se škrtá.
#
# PRAVIDLO PODMĚTU (dodatek po prověrce, nález V-5 — nejlevnější kontrola v celém
# invariantu, a téměř grepovatelná):
#   VĚT S PODMĚTEM POSÁDKA JE PŘESNĚ TOLIK, KOLIK JE NÁROKŮ (tedy 1, výjimečně 2).
#   Nárok = věta, kde podmětem je posádka nebo její člen („někdo“, „jiný“, „vy“)
#   nebo kde stojí „bude třeba / musí / zbude / jde to jedině“. Všechny ostatní
#   věty mají podmětem SCÉNU (úředník, most, lucerna, dav, vidle) a nesmějí
#   obsahovat tyhle obraty.
#   DOVĚTEK (2. obsahové kolo v3 — bez něj je pravidlo obcházitelné): nárok vzniká
#   i tehdy, když práci posádce přiřkne NPC svým PŘÁNÍM nebo podmínkou („chce
#   listinu, která obstojí“, „nedá, dokud…“, „ustoupí jen tomu, kdo…“). Podmětem
#   je formálně NPC, ale čtenář dostane poptávku — takové věty se POČÍTAJÍ do
#   nároků. Grep to nenajde; hlídá to recenzent. (Přesně tímhle si `urednik-vaha`
#   ve 2. kole vyrobil tři nároky místo jednoho, ačkoli podmětové počítání
#   vycházelo.)
#   Proč to teď potřebujeme: v2 měla 3 nároky a ≤1 větu bez kanálu, v3 má 1 nárok
#   a ≤2 věty bez položky plus ~100 znaků uvolněných do obrazu. Poměr kulisy
#   k nároku se převrací z ~1:3 na ~1:1, a tím se mění DETEKOVATELNOST falešné
#   poptávky: pod POKRYTÍM trčela jako čtvrtá mezi třemi pravými, ve v3 stojí
#   vedle jediného pravého nároku a hráč nemá jak poznat, který je který.
#
# --- ROZPOČET POLOŽEK (jádro v3) ----------------------------------------------
# POLOŽKA = jedna věc, kterou si hráč musí odnést z JEDNOHO přečtení:
#   (1) každý NÁROK posádce — KOMBI slot je JEDNA položka, i když má dva požadavky
#   (2) PŘEDZVĚST skrytých — počet skrytých + skrytý útok/improvizace DOHROMADY
#       jedna položka (kanály 3 a 4 se říkají jednou větou)
#   (3) VERDIKT ZBRANĚ včetně dovětku slotové výjimky — jedna položka
#   (4) PŘIPOMÍNKA `rusi` (jen `lecka`/`konfrontace`) — jedna položka
# CÍL 3 POLOŽKY, STROP 4. Záporné tvrzení se do položek NEPOČÍTÁ (ubírá možnosti,
# nepřidává věc k zapamatování); platí u něj vlastní strop — jeden zápor za
# telegraf, výjimečně dva, ale jen v JEDNÉ klauzuli (viz blok ZÁPORNÉ TVRZENÍ).
#
# DOVOLENÝ DRUHÝ NÁROK — co přestalo být povinné, zůstává dovolené:
#   · nejvýš JEDEN další viditelný slot smí dostat nárok;
#   · NIKDY tam, kde by tím byly pojmenované VŠECHNY viditelné STATY scény —
#     ne sloty, STATY. Commit se dělá po statech, takže uzel se dvěma různými
#     staty ve třech slotech (`mesto-houkacky`: improvizace/nastroj/improvizace)
#     je po dvou nárocích vyčerpaný a odhalení nepřinese žádnou novou poptávku.
#     Odhalení musí vždy zbýt aspoň jeden NEPOJMENOVANÝ STAT, jinak přestane být
#     odhalením. (Nález V-6 prověrky, zpřesněný po 3. průchodu: litera „sloty“
#     měla díru, kterou `mesto-houkacky` prošlo.) Dopadá na `nadrazi-noc`
#     a `mesto-houkacky`;
#   · nejvýš u TŘETINY telegrafů sady (dnes 19 → nejvýš 6); vyjádřeno podílem,
#     aby pravidlo přežilo růst obsahu. Jinak se enumerace vrátí zadními dvířky
#     a strop položek je fikce;
#   · POVINNÝ REGISTR: použitá id se vypisují níže v bloku STAV PŘEJÍMKY, protože
#     „druhý nárok“ NENÍ grepovatelný (na rozdíl od frázové kvóty z D49) a bez
#     registru se počet nedá zkontrolovat jinak než dalším přečtením všech 19;
#   · a jen tam, kde má scéna dvě opravdu charakteristické práce — ne aby se
#     „dorovnal rozpočet znaků“;
#   · v `lecka`/`konfrontace` je DOVOLENÝ, ale jen když je kanál 7 v SROSTLÉ FORMĚ
#     (viz kanál 7) — pak má i ten uzel jen tři položky a čtvrtá je volná.
#     (Opraveno po 1. obsahovém kole v3: plošný zákaz stál na předpokladu, že
#     kanál 7 je vždy samostatná položka. Není — u Brodyho srůstá s verdiktem,
#     u Malonea je to zápor. Zákaz by nejvíc informace upřel `brody-zataras`,
#     tedy PŘESNĚ tomu uzlu, na kterém hráč nález vyslovil, a byl by to
#     nejtvrdší uzel runu s nejtenčí předzvěstí.)
#   Kdo ho použije, zdůvodní to v reportu kola (který telegraf a proč).
#
# --- JAK SE VYBERE KOTVA (pořadí pravidel) ------------------------------------
# 1) Je-li ve scéně KOMBI slot (`stat: [a, b]`), KOTVA je ON. Je to jediný slot,
#    který žádá JEDNU věc dobrou ve DVOU statech; neohlášený dělá z commitu
#    loterii a přerozdělením v odhalení se nespraví. (Platí pro 2 z 19:
#    farmar-stodola „Zaklínit vrata“, most-prohnila-prkna „Zpevnit prkna“.)
# 1b) NENÍ-LI KOMBI a má-li scéna VIDITELNÝ ÚTOK-SLOT, u kterého zbraň na očích
#    PROJDE (`zbran_projde = ano`, tj. lokace/zatah/konfrontace), je KOTVA TEN SLOT.
#    Dopadá na `zatah`, `agent-malone/konfrontace`, `serif-brody/konfrontace`.
#    Důvod je tvrdý: je to JEDINÉ místo ve hře, kde je GANGSTER karta ve VIDITELNÉ
#    roli správná hra, verdikt o tom mlčí (mluví jen o toleranci, D48), a chybný
#    commit v konfrontaci UKONČÍ RUN (`PRICINA_LABEL.konfrontace_prohra`).
#    Bez tohoto pravidla by v3 u finále neřekla, že se tam bije — a to je přesně
#    ta díra, kterou D48 zavíralo, když verdikt zúžilo na toleranci s odůvodněním
#    „jestli se zbraň hodí, to je práce trendu“. v3 trend mimo kotvu ruší, takže
#    tu práci musí převzít výběr kotvy.
# 2) Jinak je KOTVA nárok, KTERÝ HRÁČ Z TYPU UZLU NEUHODNE. Typ je vidět na mapě
#    (`mapa.js`) a zapečený obsah má silný typový prior:
#      lokace/zatah — nářadí a improvizace jsou ve viditelné trojici 5/5, peníze
#                     a klid 0/5 → informativní je útok, peníze, klid, a mezi
#                     nářadím a improvizací to, co scéna nevypadá, že chce.
#      npc/lecka    — řeč 9/12, peníze 8/12, klid 8/12, nářadí 7/12, ÚTOK jen
#                     4/12 → informativní je ÚTOK; útok o to víc, že u `npc`/`lecka`
#                     zbraň na očích propadá, takže „zatlačit“ je pobídka i past
#                     zároveň. („A po něm nářadí“ je ŠKRTNUTO: rozdíl 7/12 proti
#                     8/12 je jedna scéna a nerozlišuje nic.)
#    KRITÉRIEM JE INFORMAČNÍ HODNOTA, NE SPLNITELNOST. Viditelný útok-slot u `npc`
#    obslouží asi 4 karty ze 40 (`veci.yaml`: 4 non-GANGSTER útočné) — telegraf ho
#    přesto jmenuje, protože hráčovým úkolem je ROZHODNOUT, ne dostat splnitelný
#    úkol. „Tuhle poptávku nemáme čím obsadit“ je platné a dramatické rozhodnutí;
#    nevědět o ní je jen ztráta. Je to SÁZKA, ne odvozený závěr — a je tu zapsaná
#    jako sázka.
#    Telegraf tedy utrácí svou jednu položku na ODCHYLKU od prioru. Typový prior
#    zůstává hráči jako sázka a odhalení mu ji pojmenuje — to je learnabilita
#    slíbená v design-dokument §4.5, ne její obcházení.
# 3) Nedá-li pravidlo 2 odpověď, vyhrává nárok, který dává scéně jméno (`nazev`)
#    nebo je fyzicky nevyhnutelný. **U `zatah`, `lecka` a `konfrontace` je pravidlo 3
#    PRIMÁRNÍ** (po 1 a 1b): léčky ani konfrontace se nevkládají do běžného uzlu
#    (jdou z prahů Žáru), takže hráč u nich typ místa před commitem NIKDE nevidí —
#    `mapa.js` na ně kartu volby nedává a `commit.js` typ nevypisuje. Odchylku
#    od prioru tam tedy není z čeho poznat. Totéž u `zatah` (n = 1, prior je
#    sebereferenční). Pravidlo 2 zůstává v platnosti jen pro `npc` a `lokace`.
#    U `npc` navíc nedává odpověď u 3 z 12 scén (`deputy-mytnice`, `rival-parley`,
#    `serif-brody/lecka` mají viditelné právě {hodnota, improvizace, obrana}) —
#    tam je pravidlo 3 a je legitimní použít DOVOLENÝ DRUHÝ NÁROK.
# 4) ZÁKAZ: kotva se NEVYBÍRÁ podle výšky kotvy slotu. Vybírat „nejtvrdší slot“
#    by z čitelnosti udělalo obtížnostní páku, a ta je zakázaná (D47 §13.2). Sim
#    tu asymetrii navíc nemodeluje: fidelitu aplikuje na každou roli uniformně
#    (`sim/strategies.js:417–427`), kdežto v3 dává jistotu jedné roli a nulu třem.
#    POZOR, tenhle zákaz je zákaz KRITÉRIA, ne tvrzení o ortogonalitě k obtížnosti
#    (nález V-1). Naměřeno na zapečené sadě: v 17 z 19 kotva výšku nesleduje, ale
#    pravidlo 1 vybírá v OBOU KOMBI scénách nejnižší kotvu scény. Je to vlastnost
#    téhle sady, ne garance — kdo bude tvrdit „nemá to balanční dopad“, měří to.
#
# --- ZÁPORNÉ TVRZENÍ (povolené, po škrtu POKRYTÍ cennější než dřív) ------------
# Stat se smí výslovně VYLOUČIT („peníze si vzít netroufne“) — ale JEN stat, který
# není v žádném slotu, ani skrytém, a nejvýš jednou za telegraf. Bot celý trend
# zná, takže tím člověk nedostane víc než on. Zákaz u skrytých slotů je proto, aby
# próza neodváděla od toho, co se pokazí.
# POVINNÝ ZÁPOR (dodatek po prověrce kritika, nález B-2 — jediná věc v celém v3,
# která přiznanou cenu škrtu opravdu PLATÍ, a nestojí ani jednu položku):
#   Je-li `zbran_projde = ano` A ÚTOK není v žádném slotu (ani skrytém), MUSÍ
#   telegraf útok výslovně vyloučit („a bít se tu nebude s kým“).
#   Dopadá na 3 z 19: farmar-stodola, most-prohnila-prkna, mesto-houkacky.
#   Bez toho zní verdikt „Zbraň tu nikdo neřeší“ jako POBÍDKA ve scéně, kde
#   útok-slot vůbec není — hráč committne brokovnici do uzlu, kde je mrtvá, a po
#   škrtu POKRYTÍ mu to nikdo neřekne (ve v2 to plynulo ze tří nároků).
#   (`urednik-razitko` má útok taky nikde, ale je `jen_skryte + false`, kde už
#   verdikt sám říká „ani schovaná nezmůže nic“ — tam by zápor byl redundantní.)
# STROP NA SADU: zápor o TÉMŽE statu nejvýš 3× v celé sadě — a to jen na zápory
# VOLITELNÉ. Povinné se NEPOČÍTAJÍ a jejich počet je dán obsahem, ne autorem
# (dtto Malonovy dvě připomínky `rusi`, vynucuje je kanál 7). Bez tohohle
# rozlišení by se strop a povinnost srazily, jak dorostou lokace bez útok-slotu
# (dnes jsou tři, tedy přesně na stropu). Důvod: první obsahové kolo v3 mělo šest telegrafů
# z devatenácti, které říkaly „peníze tady neplatí“. Každý je jednotlivě legální
# a šetří hráči mrtvou kartu, ale dohromady sada učí „hodnota je past“ —
# a `hodnota` je nárokem v 8 slotech a jediný stat, který Malone ruší run-wide.
# Zápor má šetřit kartu, ne odepsat stat.
# DVA ZÁPORY V JEDNOM TELEGRAFU jsou dovolené jedině tehdy, když je nese JEDNA
# klauzule („nechce zaplaceno ani se s nikým bít“) — pak je to pro čtenáře jedna
# myšlenka. Jinak platí jeden na telegraf.
#
# JAK SE ZÁPOR KONTROLUJE (dodatek po dokončovacím kole — bez tohohle postupu se
# chyba NENAJDE, doloženo: první průchod v3 měl 4 anti-telly z 19):
#   NEČTI větu a neptej se „je to zápor?“. Vypiš si VŠECH PĚT statů uzlu, u každého
#   odškrtni, jestli je v nějakém slotu (viditelném NEBO skrytém), a teprve pak se
#   podívej, o kterém z nich próza tvrdí, že nepomůže. Vyloučit se smí JEN stat
#   s nulou u obou.
#   POZOR NA `improvizace`: všechny čtyři nalezené anti-telly mířily na ni
#   („mluvit nepomůže“, „na řeči nedá“, „jméno zná zpaměti“, „je na to zvyklý“).
#   Je to jediný stat, jehož poptávka je NEPŘEDMĚTNÁ, takže se v próze vylučuje
#   nejsnáz — a přitom je nárokem v 9 z 12 npc scén. Zápor o improvizaci je proto
#   nejlevnější věta, kterou autor napíše, a nejdražší chyba, kterou udělá.
#   ANTI-TELL JE HORŠÍ NEŽ MLČENÍ: mlčení jen neinformuje, anti-tell aktivně
#   odvádí od správné karty — a hráč nemá jak poznat, že byl obelhán.
#
# --- ZÁKAZ VÝHRADNOSTI (nejdražší pravidlo v3; přidáno po 3. průchodu) ---------
# VĚTA NÁROKU NESMÍ OBSAHOVAT OPERÁTOR VÝHRADNOSTI vztažený ke splnění scény:
# „jen“, „jedině“, „jinak“, „dokud ne…“, „nic jiného“.
# Nárok se formuluje jako práce, která JE potřeba — nikdy jako práce, která je
# JEDINÁ potřeba.
#   ✗ „Ustoupí JEDINĚ tomu, kdo na ně vyjede zostra.“
#   ✗ „Neustoupí, DOKUD na něj někdo nezvýší hlas.“
#   ✗ „Ven vede JEN průraz.“
#   ✓ „Zostra na ně vyjet bude muset někdo z posádky.“
#   ✓ „Ven se někdo musí probít silou.“
# POVOLENÁ VÝJIMKA: výhradnost vztažená k NÁSTROJI té jedné práce, protože tam se
# nic jiného nezapírá — „Bedny se BEZ PÁKY nehnou“, „Zámek PO DOBRÉM nepovolí“.
# PROČ TO JE KRITICKÉ PRÁVĚ VE V3 (a pod POKRYTÍM nebylo): dokud próza jmenovala
# všechny poptávky, byla výhradnost neškodná ozdoba. Po škrtu POKRYTÍ mění
# ABSENCI nároku — která nemá znamenat NIC — na EXPLICITNÍ ZÁPOR o všech
# nepojmenovaných slotech. Je to tedy anti-tell v gramatickém převleku nároku:
# výčtová kontrola záporů (výše) ho NENAJDE, protože autor po pravdě odpoví
# „nevylučuji žádný stat“.
#
# --- SMĚROVÝ TEST (druhá polovina kontroly ČISTOTY; bez něj to nefunguje) ------
# Na KAŽDOU větu telegrafu, ne jen na zápory, se ptej:
#   „Zvýší, nebo SNÍŽÍ tato věta ochotu stolu committnout kartu na stat X?“
# Každé SNÍŽÍ u statu, který je v nějakém slotu (viditelném i skrytém), je
# porušení — bez ohledu na gramatickou formu. Tenhle test chytá výhradnost,
# anti-telly i „NPC to nezajímá“ obraty; výčet statů sám chytá jen zápory.
# Doloženo: 3. průchod v3 měl 4 uzly, které výčtem prošly a směrovým testem ne
# (`urednik-vaha`, `mesto-ulicka`, `zatah`, `nadrazi-vypravci`).
#
# --- KANÁLY: CO PRÓZA NESE A CO VĚDOMĚ NENESE ---------------------------------
# Engine derivuje ŠEST kanálů (`resolve.js`), próza od v3 nese jen PODMNOŽINU:
# z `trend` jen JEDEN slot (kotvu), zbytek ne. Próza tedy říká MÉNĚ než signál —
# je to VĚDOMÁ ODCHYLKA ve prospěch čitelnosti, NE drift, a nesmí se „opravovat“
# doplněním nároků. Kdo bude chtít POKRYTÍ vrátit (bylo by to potřetí), musí
# nejdřív vrátit viditelnost mechanického řádku (D47/D50) — jinak jen zaplatí
# hádankou to, co se má naučit z odhalení.
# 1) KOTVA — pravidlo (A) výše. Obraz je předmět, člověk nebo gesto, nikdy
#    abstrakce. Slovník NÁROKŮ níže.
# 2) KOMBI SLOT (`stat: [a, b]`) — je vždy kotvou (pravidlo výběru 1) a nese se
#    jako JEDEN nárok se dvěma požadavky výslovně spojenými do JEDNÉ práce
#    („přibít a zároveň podložit něčím, co leží po ruce“). Nikdy jako dvě práce.
# 3+4) PŘEDZVĚST — JEDNA věta, že se něco pokazí, nesená PŘEDMĚTEM Z TÉHLE SCÉNY
#    (vidle, lucerna, ručička váhy, štěrk), nikdy abstraktní „věc“. Je-li
#    `zbran_skryte` nebo `improv_skryte` true, MUSÍ to v ní být („…a rozhodne to,
#    kdo je rychlejší“ / „…bude se to muset něčím zamluvit“).
#    `zbran_skryte` SE V PŘEDZVĚSTI NEOPAKUJE (rozhodnuto po 3. průchodu, týž
#    argument jako u číslovky v N-1): buňky B a C verdiktu ho nesou DOSLOVA
#    („a potají se vyplatí“ / „potají může rozhodnout“), takže požadovat ho i
#    v předzvěsti je dvojí kódování téže konstanty u 10 z 19 uzlů — ~25 znaků za
#    informaci, kterou vzápětí zopakuje razítko. Předzvěst ho smí nést obrazem,
#    ale NEMUSÍ. `improv_skryte` naopak POVINNÝ ZŮSTÁVÁ: v žádném verdiktu není
#    a v celé sadě ho nese jediný uzel (`nadrazi-vypravci`) — kdyby vypadl,
#    zmizí beze zbytku.
#    PŘEDZVĚST JE VŽDY NEOSOBNÍ — podmětem je předmět scény, NIKDY posádka, a
#    markéry nároku („bude muset“, „zbude“, „někdo“) se v ní NEPOUŽÍVAJÍ, i když
#    příklady výše vypadají jinak. (Oprava po 2. obsahovém kole v3: příklad
#    „bude se to muset něčím zamluvit“ je zároveň markér nároku dle PRAVIDLA
#    PODMĚTU, takže kdo ho vezme doslova, vyrobí si o jednu nárokovou větu víc,
#    než má nároků — a to u 11 z 19 telegrafů. Správně: „spraví to leda historka
#    na místě“, „dál to bude o rychlosti“.)
#    ČÍSLOVKA JE POVINNÁ JEN TAM, KDE `proti_srsti` ≠ 1 (v celé sadě jediné
#    nadrazi-noc, kde jsou dvě — a to musí být citelně těžší, ne jen o číslovku
#    jiná). Jinde se počet NEVYČÍSLUJE. Důvod (nález 1. obsahového kola v3): počet
#    „jedna“ je u 18 z 19 uzlů konstanta, kterou hráč zná po druhém uzlu, takže
#    číslovka nenese informaci — a přitom je to PŘESNĚ ten požadavek, který v D49
#    vyrobil skeleton „Jedna věc se rozhodne bez vás…“ v 17 z 19 telegrafů.
#    Vyčíslovat konstantu = platit skeletonem za nulu. Próza tím říká MÉNĚ než
#    signál (bot počet zná), což je vědomá a přiznaná odchylka, ne drift.
#    O statu jiného skrytého slotu se MLČÍ (D47/R1) — ani kladně, ani záporně.
# 5) VERDIKT ZBRANĚ — jedna věta, smysl z uzavřené mřížky, doporučeně poslední.
#    Mluví VÝHRADNĚ o toleranci místa, nikdy o tom, jestli se zbraň hodí. Zdroj
#    pravdy obsah/stitky.yaml `chovani_dle_typu`, ne typ uzlu odhadem.
#    PARADIGMA: pevný rám „Zbraň … na očích …, potají …“, jediné variabilní místo
#    je KONEC. Tím je hlavička předvídatelná a nese ji rytmus, kdežto informace
#    stojí tam, kde posluchač čeká pointu. Čtyři normativní řetězce:
#      zbran_projde=ano,        zbran_skryte=false → „Zbraň tu nikdo neřeší,
#                                                    ani na očích.“
#      zbran_projde=ano,        zbran_skryte=true  → „Zbraň tu nikdo neřeší
#                                                    a potají se vyplatí.“
#      zbran_projde=jen_skryte, zbran_skryte=true  → „Zbraň na očích tu všechno
#                                                    pokazí, potají může být to
#                                                    jediné, co pomůže.“
#      zbran_projde=jen_skryte, zbran_skryte=false → „Zbraň na očích tu jen popudí
#                                                    a potají nezmůže nic.“
#    (Znění z D49 „Zbraně se tu nikdo nelekne“ / „sáhnout pod kabát“ se tímto
#    RUŠÍ — nikoli proto, že by byla špatná, ale protože míchala registr: sada
#    v jednom kanálu střídala zbraň / bouchačku / železo a osy na očích / pod
#    kabátem / schovaná / na světle. Jednotný registr je celý smysl opravy.)
#    APPENDY (pevné znění, připojují se ZA řetězec pomlčkou):
#      · slotová výjimka: append se VÁŽE NA NÁROK KOTVY, ne na osobu — jinak nemá
#        rozlišovač scope a stůl ho přečte jako ODVOLÁNÍ verdiktu, ne jako výjimku
#        (nález kritika po 3. průchodu). Znění: „— ale zatlačit s ní nahlas je
#        tady jediné, co zabere.“, tj. slovesná fráze kotvy + „s ní“.
#        NENÍ-LI `stitek_citlivy` slot zároveň KOTVOU, je to nález a řeší se
#        výběrem kotvy (pravidlo 1b/2), ne appendem. V celé sadě je to jeden uzel
#        (`nadrazi-vypravci`) a kotvou tam je právě on.
#        (Dřívější znění „ale jednomu z nich bouchačka pusu zavře“ je ZRUŠENO:
#        „nich“ mířilo na vyjmenované role, které POKRYTÍ škrtlo, a „bouchačka“
#        porušovala jednotný registr tři odstavce nad sebou. Invariant si
#        odporoval sám — proto to sada tiše nedodržovala.)
#      · Brodyho `rusi`:  „— a u Brodyho přitáhne každá dvojnásob pozornosti.“
#    ZNĚNÍ JE NORMATIVNÍ, NE PŘÍKLADNÉ — cituje se DOSLOVNĚ (změna po review
#    2026-07-30: pravidlo „slovesa a obrazy se smějí přizpůsobit, smysl ne“
#    v praxi NEDRŽELO. První kolo v3 z něj vyrobilo 11 znění na 4 buňky, a rozptyl
#    byl největší právě u dvou buněk, které se liší JEN tím, jestli skrytá zbraň
#    pomáhá — posluchač je pak rozlišuje na POSLEDNÍCH TŘECH SLOVECH dvou téměř
#    identických vět. To je auto-fail karty za přeslechnutí.)
#    JEDINÁ POVOLENÁ VARIACE jsou ty dva APPENDY výše (kanál 6 a kanál 7).
#    LEXIKÁLNÍ REGISTR JE JEDNOTNÝ: vždy „zbraň“ (ne střídavě bouchačka/železo)
#    a vždy osa „na očích / potají“. Ať ta věta zní jako DORAŽENÁ KLAUZULE
#    TELEGRAMU, ne jako narátorova poslední myšlenka — po druhém uzlu ji stůl čte
#    jako razítko a smí ji přeslechnout, aniž o obsah přijde.
#    KOMPENZACE ZA TU PEVNOST PATŘÍ O VĚTU DŘÍV: rozvolni POZICI PŘEDZVĚSTI
#    (u 3–4 telegrafů ji dej na začátek nebo doprostřed). První kolo mělo tutéž
#    informaci ve téže pozici 8× z 19 („a poznáte to pozdě“) — variabilita je
#    zdarma tam, a za auto-fail tady.
#    VE V3 SE TENTO KANÁL NESMÍ ZATMAVIT ANI
#    O SLOVO — po škrtu POKRYTÍ už absence útok-nároku NEZNAMENÁ, že se tu nebije
#    (nároky přestaly být vyčerpávající), takže inferenci „brokovnici necháme
#    doma“ nese jen tenhle verdikt a případný zápor. Bot ho navíc čte s JISTOTOU
#    (fidelita se na něj neaplikuje) — pro jeho ztrátu brána nemá měřidlo.
# 6) SLOTOVÁ VÝJIMKA (`stitek_citlivy: GANGSTER`) — je-li přítomna, připoj
#    k verdiktu append s pevným zněním (viz kanál 5). Bez toho si próza a strojový
#    signál protiřečí (resolve.js). V celé sadě je to jediný uzel
#    (`nadrazi-vypravci`). PŘIZNANÁ VÝJIMKA V ROZPOČTU (nález D-d prověrky): tady
#    verdikt s appendem nesou dvě protichůdné věci k zapamatování, tedy de facto
#    dvě položky v jedné. Je to jeden uzel z devatenácti, cena je malá a přiznává
#    se, aby se z toho nestal vzor.
# 7) JEN V `lecka`/`konfrontace`: PŘIPOMÍNKA PRAVIDLA `rusi` pronásledovatele
#    („peníze na něj neplatí“ / „u Brodyho přitáhne dvojnásob pozornosti“).
#    NENÍ to derivovaný kanál — pravidlo je run-wide a viditelné od startu.
#    Formuluje se fikcí, nikdy zněním pravidla; Brodyho pravidlo je o POZORNOSTI
#    (Žár za GANGSTER karty, i ve skrytém slotu), ne o výstřelech a olovu.
#    SROSTLÁ FORMA (POVINNÁ, aby léčky nezůstaly na 4 položkách — a právě jedna
#    z nich, brody-zataras, vygenerovala nález hráče „neříká nic a mate“):
#      · BRODY — připomínka je o TÉŽE OSE jako verdikt zbraně (železo = pozornost),
#        takže se s ním spojí do JEDNÉ věty a JEDNÉ položky, a to APPENDEM
#        s pevným zněním za normativní řetězec (kanál 5): např. „Zbraň na očích tu
#        všechno pokazí, potají může být to jediné, co pomůže — a u Brodyho
#        přitáhne každá dvojnásob pozornosti.“ Nikdy jako druhá samostatná věta
#        o pravidle.
#      · MALONE — `rusi: stat hodnota`, a `hodnota` NENÍ v žádném jeho slotu (ani
#        skrytém, ověřeno u obou uzlů), takže připomínka se píše jako ZÁPORNÉ
#        TVRZENÍ („peníze na něj neplatí“) — a zápor se do položek NEPOČÍTÁ.
#    Obojí drží léčku i konfrontaci na TŘECH položkách, stejně jako běžné uzly.
#
# --- CO SE STANE S NEPOJMENOVANÝMI VIDITELNÝMI SLOTY (přiznaná cena škrtu) ----
# Vynoří se PŘI ODHALENÍ TEXTU, kde je vedle nich plné jméno statu, KOTVA
# s rozpětím šumu a viditelnost (přesný práh až s razítkem — D51/1, assign.js
# hlavička). Smyčka učení je: PŘEDZVĚST → sázka naslepo → ODHALENÍ, které
# pojmenuje. Cena je přiznaná a nemá měřidlo v simulaci (sim prózu nečte): hráč
# ztrácí dvě ze tří viditelných poptávek (u nadrazi-noc jednu ze dvou, a je-li
# použit dovolený druhý nárok, jednu ze tří). Proto (a) verdikt zbraně je nedotknutelný,
# (b) zápor je cennější než dřív, (c) typový prior musí zůstat čitelný z mapy
# a (d) ROZPIS ROLÍ NA ODHALENÍ SE NIKDY NESMÍ SCHOVAT. Bod (d) je po v3 tvrdá
# závislost, ne preference: odhalení je jediné místo, kde hráč nároky slotů vůbec
# dostane. Kdyby se rozpis schoval „pro atmosféru“, jako se schoval mechanický
# řádek telegrafu (D47/D50), zmizí učení mapy fikce→stat úplně a v3 se tím obrátí
# ve ztrátu. Kdo o to někdy požádá, tenhle řádek je odpověď.
#
# --- CO SE NESMÍ PROZRADIT ----------------------------------------------------
# Kotvy, prahy, šum, konkrétní čísla, pásma, obsah lootu ani stat skrytého slotu
# nad rámec kanálu 3+4. Telegraf říká, CO se blíží, nikdy JAK TĚŽKÉ to je.
#
# --- ZÁKAZ META-SLOVNÍKU (autorský checklist, ne CI test) ----------------------
# NESMÍ se objevit: „role“, „slot“, „viditeln*“, „skryt*“, „stat“, „práh“,
# „kotva“, jména statů (útok / obrana / hodnota / improvizace / nástroj ani
# synonyma „nářadí“, „důvtip“, „šikovné ruce“) a číslovky ve spojení s rolemi.
# Výjimka: „na očích“ / „potají“ ve verdiktu zbraně. (Grep chytí tohle, ale
# drahá porušení — falešná poptávka, leak skrytého slotu — grepem NEjdou.)
#
# --- SLOVNÍK NÁROKŮ (klíčem je SLOVESO; jsou to DEFINICE, NE ZNĚNÍ) -----------
# POZOR: příklady níže definují, co který nárok JE. Nejsou to doporučené formulace.
# První obsahové kolo je použilo jako frázovník („vymyslíte až na místě“ 10×) —
# proto STROP: žádná fráze ze slovníku se v sadě neopakuje víc než 2×.
#   utok         posádka musí TLAČIT: prorazit, zvýšit hlas, být rychlejší,
#                postavit se. Obraz zbraně jen tam, kde je zbran_projde=ano.
#   obrana       posádka musí VYDRŽET a nedat znát. POZOR: NPC, který se dívá,
#                sám o sobě obranu NEobsazuje — obsadí ji až demand posádce.
#   hodnota      posádka musí DÁT něco, co má cenu.
#   improvizace  NEEXISTUJE správná věc: musí to jen OBSTÁT.
#   nastroj      SPRÁVNÁ věc existuje a musí se správně použít.
#   Kolize: utok × obrana = kdo jedná první (tlačí vs. drží nápor) · nastroj ×
#   improvizace = existuje ve scéně věc, která to řeší? · hodnota × improvizace =
#   dostane protistrana VĚC, nebo jen slova? ZBYTEK DISJUNKTNÍ NEBUDE: NPC jako
#   kulisa je v pašerácké scéně nevyhnutelné a čtenář si ho může přečíst jako
#   poptávku po obraně. Invariant to nezakazuje a NEPŘEDSTÍRÁ, že to vyřešil.
#
# --- HUMOR (dělicí čára proti protokolu) --------------------------------------
# Smí plynout ze SUCHÉHO POJMENOVÁNÍ hrozivé věci („parta nadšených občanů“,
# „úředník s předpisem na všechno“). NESMÍ ze srovnání, pomlčkové pointy ani
# komentáře k NPC — to je motor protokolu a každý takový vtip v telegrafu je
# smích, který protokol už nevydělá.
#
# OPERAČNÍ TEST PŘEKROČENÍ (dodatek po review 2026-07-30; všech pět porušení
# prvního kola v3 mělo TÝŽ tvar — konkrétní obraz, čárka, a narátorův verdikt
# nad tím obrazem):
#   ŠKRTNI DRUHOU POLOVINU VĚTY. Přežije-li obraz sám a pořád hrozí, byl ten
#   ocásek narátorova poznámka a patří do protokolu. Zmizí-li hrozba, byl to fakt
#   a zůstává.
#   ZAKÁZÁN je hodnotící PREDIKÁT nad obrazem („tři chlapi, kteří se nebaví“,
#   „most stojí nad vodou už jen ze zvyku“, „leští si odznak, jako by měl do
#   večera čas“, „nikdo z nich nikam nespěchá“).
#   DOVOLENA je hodnotící JMENNÁ FRÁZE („parta nadšených občanů“, „úředník
#   s předpisem na všechno“) — ironie je uvnitř substantiva a nestojí ani slovo.
# POZOR na FIGURU SADY: „nikdo nespěchá“ (a její varianty „beze spěchu“, „beze
# slova“, „do večera čas“) je evaluační register půjčený protokolu. Strop 2×
# v sadě platí i na SYNTAKTICKÉ skeletony, které grep nechytí — první kolo v3
# mělo mould nároku „jde to jen/jedině tak, že…“ 6× z 19. Frekvenční seznam veď
# i podle rytmu, ne jen podle slov.
#
# --- KAM SMÍ TÉCT UVOLNĚNÉ MÍSTO (a kam ne) -----------------------------------
# Do věty NÁROKU a do PŘEDZVĚSTI. NE do úvodní expozice scény: tu hráč dostane
# ještě dvakrát (pole `text` po uzlu a PRVNÍ VĚTA PROTOKOLU, která rekapituluje
# scénu — viz prompty/protokol.md). Rozvine-li telegraf scénu na dvě věty, zní
# protokolova první věta jako opakování něčeho, co stůl slyšel dvakrát, a protokol
# má o jednu větu pointy méně. Smyslový detail (zvuk, pach, vibrace) je vítaný,
# ale patří DO nároku a předzvěsti, ne před ně.
#
# --- ROZSAH, JEDNOTKA A TEMPO -------------------------------------------------
# 3–5 vět, STROP 400 znaků (D48), CÍL ~320 (D51) — a ten cíl je STŘED PÁSMA
# 300–360, NE pokyn ke krácení. Zapečená sada má průměr 338 znaků, takže „320“
# není úspora: je to týž rozsah s jinou náplní. Jediné číslo, které se v3 opravdu
# mění, je POČET POLOŽEK. Nejvýš DVĚ věty bez položky — uvolněné místo po
# škrtnutém POKRYTÍ jde do OBRAZU, ne do dalších nároků a ne do úspory znaků
# (hráč výslovně řekl, že text smí být delší).
# JEDNOTKA DÉLKY = ZNAKY: `String.length` v JS nad NAPARSOVANÝM řetězcem telegrafu
# (bez obalujících uvozovek, bez accent-foldu, bez koncového newline). NE bajty:
# česká diakritika je v UTF-8 dvoubajtová, takže bajtové měření nadhodnocuje
# telegraf o ~10 % (391 vs. 351 u farmar-brod). Jednotka se sem doplňuje proto, že
# o ni vznikl spor, NE proto, že by se sada měřila špatně: přeměření 2026-07-30
# potvrdilo, že zapečená sada D49 („302–379, průměr 338“) jsou ZNAKY a byla
# správně. Rozpočet uzlu (670) měř ve stejné jednotce.
# Rozpočet na UZEL: telegraf + `text` ≤ 670 ZDROJOVÝCH znaků, tj. `text` se měří
# s NEDOSAZENÝMI zástupnými symboly `{VEC}` / `{kdo}` (po dosazení naroste o ~25 %,
# to je započítané v tom stropu, ne navíc) — roste-li telegraf, krátí se
# `text`. Telegraf je scéna PŘEDEM: neosobně, v přítomném čase, nikdy nepředjímá
# výsledek. `text` je táž scéna POTOM: v minulém čase a se jmény.
# KAŽDÝ TELEGRAF SE MĚŘÍ, NEODHADUJE — a měří ho někdo, kdo umí spustit kód, ne
# autor odhadem (dvakrát se to spletlo o 30–50 znaků a jednou se z toho stal spor
# o jednotku).
#
# --- PŘEJÍMKA v3 (6 bodů, per telegraf; nahrazuje proceduru D49) ---------------
# Procedura D49 („derivovaný signál položku po položce, 19/19“) byla definovaná
# proti `trend` = VŠEM viditelným slotům. Po škrtu POKRYTÍ by hlásila, že sada
# signál nepokrývá (pravda a irelevantní), a o kotvě ani ČISTOTĚ by nezkontrolovala
# nic. Nová přejímka — bez ní se telegraf nezapéká:
#   1) KOTVA je právě jeden viditelný slot a je vybraná dle pořadí pravidel
#      1 → 1b → 2 → 3. Recenzent uvede KTERÝ a PODLE KTERÉHO pravidla.
#   2) ČISTOTA přes PRAVIDLO PODMĚTU: počet vět s podmětem posádka == počet nároků.
#      Žádná obrazová věta neobsahuje „někdo / jiný / vy / bude třeba / musí /
#      zbude / jde to jedině“. (Tenhle bod je nový a je téměř grepovatelný —
#      je to jediná kontrola falešné poptávky, kterou máme.)
#      A DRUHÁ POLOVINA TÉHOŽ BODU, bez které to nefunguje: každý nárok se čte
#      PROTI POLI `text` téhož uzlu, ne proti jménu role. Jméno role je zkratka
#      („Najít, kudy ujet“), `text` říká, co se v tom slotu doopravdy dělá — a
#      právě na tomhle rozdílu propadl v 1. kole v3 jeden telegraf
#      (`brody-konfrontace` udělal z „hledání cesty ven“ odklízení překážky
#      z mostu). Kontrola „sedí nárok na nějaký slot?“ tuhle chybu NENAJDE.
#   3) PŘEDZVĚST nese předmět ze scény + `zbran_skryte`/`improv_skryte`, je-li
#      true; číslovku jen tam, kde `proti_srsti` ≠ 1.
#   4) VERDIKT je DOSLOVNĚ jeden ze čtyř normativních řetězců dle `chovani_dle_typu`
#      (ne dle typu odhadem) + pevný append při `stitek_citlivy` nebo u Brodyho.
#      Kontroluje se ZNĚNÍ, ne smysl: recenzent sestaví tabulku buňka → uzel →
#      znění a spočítá RŮZNÁ znění na buňku. Musí být 1. (Rozpad na 11 znění se
#      čtením po jednom telegrafu NENAJDE — takhle se našel.)
#   5) POVINNÝ ZÁPOR tam, kde `zbran_projde = ano` a útok není v žádném slotu;
#      u `lecka`/`konfrontace` navíc kanál 7 ve srostlé formě.
#   6) ŽÁDNÝ ANTI-TELL: vypiš všech pět statů uzlu, odškrtni u každého, jestli je
#      v nějakém slotu (viditelném NEBO skrytém), a teprve pak zkontroluj, o kterém
#      próza tvrdí, že nepomůže. Kontroluje se VÝČTEM, ne čtením — čtením se to
#      nenajde (první průchod v3: 4 anti-telly z 19, všechny o `improvizace`).
#   7) SMĚROVÝ TEST NA KAŽDOU VĚTU + ZÁKAZ VÝHRADNOSTI (viz bloky výše). Bod 6 sám
#      NESTAČÍ: chytá jen zápory, kdežto výhradnost („jen“, „jedině“, „dokud“,
#      „jinak“) je gramaticky NÁROK a výčtem projde — ve 3. průchodu takhle prošly
#      4 uzly, z toho dva čerstvě „opravené“. U každé věty se ptej, jestli SNIŽUJE
#      ochotu committnout na stat, který v nějakém slotu je.
# Zapisuje se i REGISTR: u kterých id je použit DOVOLENÝ DRUHÝ NÁROK.
```

**Blok STAV PŘEJÍMKY**, který se do hlavičky vkládá při zapečení (hotový, včetně
registru a naměřených délek):

```yaml
# --- STAV PŘEJÍMKY (v3, D51, 2026-07-30) --------------------------------------
# Znění invariantu i sada 19 telegrafů jsou zapečeny po AUTORSKÉM A RECENZNÍM
# CHECKLISTU: generátor → design-critic (na SPECIFIKACI, dřív než na texty)
# → protocol-humor-tester (na sadě) → opravné kolo → dokončovací kolo → cílené
# re-review obou recenzentů na diff → přejímka v3 (6 bodů výše) → délky změřené
# kódem, ne odhadem.
# Verdikt kritika na SPECIFIKACI: SCHVÁLIT S ÚPRAVAMI (3 blokující, zapracovány).
# Verdikt humor-testéra na SADĚ: ZAPÉCT PO OPRAVÁCH (2 blokující, zapracovány).
# Sada se v prvním pokusu NEZAPEKLA (4 anti-telly + 1 falešná poptávka + 1 nepřiznaný
# druhý nárok) — držel je předregistrovaný gate ČISTOTY. Zapéká se až tato verze.
# ZAKRÝVACÍ ZKOUŠKA JE POŘÁD OTEVŘENÁ POLOŽKA (od D49) — protokol viz
# technika/telegraf-invariant-navrh-2026-07-29.md §13; po v3 se zjednodušuje
# (ptá se na jednu poptávku, ne na tři).
# REGISTR DRUHÉHO NÁROKU (5 z 19, kvóta ≤ třetina): deputy-mytnice · mesto-houkacky
# · agent-malone/konfrontace · serif-brody/lecka · serif-brody/konfrontace.
# DÉLKY (změřeno kódem 2026-07-30, znaky): min 285 · max 358 (urednik-vaha) ·
# průměr 319,5. Strop 400 i rozpočet uzlu 670 splněny 19/19; nejtěsnější uzel
# privoz-celnik 580/670.
# Podrobný report kola: technika/telegraf-skrtaci-kolo-2026-07-30.md
```

---

## 3. Přepsaná sada 19 telegrafů

### 3.0 Kritéria přijetí — PŘEDREGISTROVÁNO NASLEPO

*Psáno 2026-07-30 **před** doručením přepsané sady (autor sadu v té chvíli
neviděl). Důvod formátu: projekt má historii, kdy se výsledek dal vyložit zpětně
podle toho, co zrovna vyšlo.*

**Tvrdé podmínky (nesplněná = sada se nezapéká, položku po položce se vrací
zapečené znění z D49):**

1. **Věrnost signálu 19/19.** Verdikt zbraně dle mřížky, počet skrytých, skrytý
   útok/improvizace, slotová výjimka — ověřeno položku po položce proti tabulce
   v §2/§3, ne důvěrou. *Jediná chyba tady = přepis, ne diskuse* (auto-fail karty).
2. **Pravidlo (B) ČISTOTA 19/19** — nula falešných poptávek. Po škrtu POKRYTÍ je
   to nejdražší chyba sady: hráč ji nemá jak odhalit.
3. **Rozpočet položek:** 3 položky, strop 4; dovolený druhý nárok **nejvýš 5×
   v sadě** a ani jednou u léčky/konfrontace.
4. **Délky (měří facilitátor, ne autor):** žádný telegraf nad **400 znaků**,
   žádný uzel nad **670 znaků** (telegraf + `text`).
5. **Žádný sdílený skeleton:** nejčastější fráze sady **nejvýš 2×** (mez z D49).

**Rozpočet zhoršení (co je ještě přijatelná cena):**

6. Průměrná délka sady **smí** klesnout i vzrůst v pásmu ~280–360 znaků. Pokles
   pod ~280 je **nález, ne úspěch** — znamenal by, že se uvolněné místo neutratilo
   do obrazu, což je celý smysl mandátu D51 („víc obrazu").
7. **Nejvýš 3 telegrafy** smějí zůstat bit po bitu shodné s D49. Škrtací kolo,
   které nechá půlku sady být, neškrtlo specifikaci — jen ji přepsalo na papíře.

**Pravidlo výběru při sporu:** vyhrává znění s **maximin rezervou** ke tvrdým
podmínkám 1–5, ne to první, které projde.

**Co konkrétně tuhle změnu zabije, a jak je to pravděpodobné** (bez téhle věty
není předregistrace předregistrací):

- **Podmínka 7 je ta, která reálně může padnout.** Sada z D49 je dobrá surovina
  a autor obsahu má silný důvod ji šetřit; „škrtací kolo" se snadno zvrhne
  v kosmetiku. Odhaduji **~30 % šanci**, že víc než 3 telegrafy zůstanou
  nedotčené — a pak se sada nezapéká, protože specifikace by se změnila
  a obsah ne.
- **Podmínka 6 zdola** je druhý reálný falzifikátor: pokud průměr spadne pod
  ~280 znaků, škrt se vyplatil na tempu, ale **nedoručil mandát D51** („víc
  obrazu"), a hráčova stížnost na nezáživnost textů zůstane nezhojená.
  Odhaduji **~25 %**, protože škrtat je snazší než dopisovat obraz.
- Podmínky 1–2 naopak **pravděpodobně projdou** (D49 je splnilo 19/19), takže
  je nepočítám jako důkaz úspěchu — jsou to pojistky, ne měřidlo.

**Vyhodnocení předregistrace po prvním kole (dopsáno po měření, ne před):** oba
předpovídané falzifikátory (6 a 7) **prošly** — a padla podmínka **2**, o které
jsem naslepo napsal, že „pravděpodobně projde". Padla navíc tak, že jsem to
při vlastní kontrole **nenašel** a odhalilo ji až review. Poučení, které si
odsud beru: *pojistka, u které předem napíšu, že projde, je přesně ta, kterou
odškrtnu bez čtení.* Příště se položky označené jako „pravděpodobně projdou"
kontrolují jako první, ne jako poslední.

**Kdy páku nepoužít / co eskalovat uživateli:** ukáže-li se, že 3 položky nejdou
splnit bez toho, aby telegraf přestal být o té scéně (tj. próza degeneruje na
„něco se pokazí + verdikt"), **neškrtám dál a nerozpočtuji** — hlásím to jako
volbu mezi „druhý nárok povolit plošně (4 položky)" a „vrátit POKRYTÍ a znovu
otevřít viditelnost mechanického řádku (D47/D50)".

### 3.1 Sada — 1. verze obsahového kola (doručeno 2026-07-30)

Sada je v příloze tohoto kola (znění všech 19 níže v §3.3 po opravném kole).
**Kontrola proti předregistrovaným kritériím §3.0:**

| # | kritérium | výsledek |
|---|---|---|
| 1 | věrnost signálu 19/19 | **PROŠLO** — ověřeno položku po položce (kotva, předzvěst, `zbran_skryte` 10×, `improv_skryte` 1×, `proti_srsti` 2 u `nadrazi-noc`, slotová výjimka u `nadrazi-vypravci`, všechny 4 buňky mřížky verdiktu) |
| 2 | ČISTOTA (nula falešných poptávek) | **NEPROŠLO — 1 z 19, a moje kontrola to nenašla.** Odškrtl jsem to jako splněné; falešnou poptávku odhalil až humor-testér, a to jako vedlejší produkt jiné výtky (abstrakce „něco" místo předmětu). `brody-konfrontace` říká „vjezd na most zavírá **něco**, co se odtud musí dostat" — ale nástrojový slot toho uzlu je *„Najít, kudy ujet"*, tedy hledání cesty ven, **ne odklízení překážky**. Telegraf si vymyslel práci, která ve slotech není. Zbylých 18 je čistých (kulisa — psi, závora, zeď, obušky — nikde nedostává sloveso pro posádku). **Poučení k zapsání: ČISTOTA se nedá odškrtat čtením „sedí to na slot?"; musí se čtenářsky konfrontovat s polem `text`, protože právě tam je vidět, co slot doopravdy je.** |
| 3 | rozpočet položek 3 (strop 4) | **PROŠLO** — 3 položky u 16 uzlů, druhý nárok 3× (`nadrazi-noc`, `deputy-mytnice`, `mesto-houkacky`) proti kvótě 5 |
| 4 | délky (měří facilitátor) | **ČEKÁ** — autorský odhad ⌀ ~335, max ~360; rezerva u sedmi nejdelších je ~40 zn., tedy v pásmu chyby odhadu → měření je nutné, ne formalita |
| 5 | žádný skeleton, fráze ≤ 2× | **PROŠLO v podstatě, s výjimkou verdiktů** — skeleton předzvěsti **0×** (19 různých předmětů), „vymyslíte" 1×. Ale „bouchačka" 4×, „jedině" 3×, „pozdě" 3×. **Adjudikace: strop 2× se vztahuje na prózu nároku a předzvěsti, NE na verdikt zbraně** — ten je uzavřená mřížka a jeho opakování je *funkce*, ne únava (viz N-3 níže). Formuluji to takhle výslovně, aby se to příště nemuselo hádat. |
| 6 | ⌀ délka v pásmu 280–360 | **PROŠLO dle odhadu** (~335) — uvolněné místo skutečně šlo do obrazu, ne do úspory |
| 7 | nejvýš 3 telegrafy shodné s D49 | **PROŠLO** — přepsáno 19/19, žádný nezůstal bit po bitu |

**Sada se tedy zapéká po opravném kole, ne v této verzi** — a to kvůli
rozhodnutím o nálezech N-1 až N-4 níže, ne kvůli chybě v sadě.

### 3.2 Nálezy generátoru a jak jsem je rozhodl

Generátor přinesl pět nálezů proti mé vlastní specifikaci. **Tři z nich mají
pravdu a invariant jsem podle nich změnil** (§2 je už opravená verze).

**N-1 · „Počet skrytých je u 18 z 19 nulová informace a stojí celou položku ze
tří." → PŘIJATO, a je to nejcennější nález kola.** Počet „jedna" je konstanta,
kterou hráč zná po druhém uzlu. Vyčíslovat ji znamená platit **skeletonem za
nulu** — a je to doslova ten požadavek, který v D49 vyrobil větu „Jedna věc se
rozhodne bez vás…" v 17 z 19 telegrafů. **Invariant změněn:** číslovka je povinná
jen tam, kde `proti_srsti` ≠ 1 (v celé sadě jediné `nadrazi-noc`); jinde nese
předzvěst obraz bez počtu. *Pozor, tohle nebyla volba:* doručená sada počet
nikde nevyčísluje („Vidle se **jednou** zvednou" je příslovce, ne počet), takže
bez téhle změny by **18 z 19 telegrafů porušovalo vlastní invariant** — buď
změnit pravidlo, nebo poslat sadu zpět. Změna pravidla je správná, protože
pravidlo bylo špatné (poučení D49: invariant, který sousední záznamy porušují,
je mrtvá litera).
*Co jsem NEpřijal z návrhu N-1:* generátor navrhoval předzvěst u těch 8 uzlů
degradovat na nepovinnou a uvolněnou položku utratit na druhý nárok. **Ne** —
předzvěst není jen informace, je to **dramaturgie**, kterou si hráč výslovně
vyžádal („atmosférická předzvěst"). Nula informace ≠ nula hodnoty u stolu.

**N-2 · „Pravidlo kotvy je nesplnitelné u 5 z 19, a `brody-lecka` na to nemá
ani druhý nárok." → PŘIJATO, chyba byla moje.** Plošný zákaz druhého nároku
v léčkách stál na předpokladu, že kanál 7 je vždy samostatná položka. Po srostlé
formě (§1.2b) to není pravda: u Brodyho srůstá s verdiktem, u Malonea je to
zápor. Zákaz by tedy nejtenčí předzvěst upřel **`brody-zataras`** — právě tomu
uzlu, na kterém hráč nález vyslovil. **Invariant změněn:** druhý nárok je
v léčce/konfrontaci dovolený, je-li kanál 7 srostlý. `brody-lecka` ho v opravném
kole dostane (`hodnota` — připlatit šerifovi je podpis té scény).
*Zbytek N-2 je platný nález mimo mandát:* léčka nemá ve viditelné trojici
`nastroj` ani `utok`, takže odchylka od prioru tam neexistuje. To se prózou
spravit nedá — je to nález o **slotech**, patří do backlogu k otevřenému nálezu
D48 o statech, a tímto kolem se nezakrývá.

**N-3 · „Verdikt zbraně má být 4 doslovná neměnná znění, ne 2 varianty na
buňku." → PŘEDBĚŽNĚ PŘIJATO, potvrdí humor-testér** (byl na to výslovně dotázán).
Argument generátoru je silný a je to můj vlastní argument z §1.2: po škrtu
POKRYTÍ je verdikt **jediný** nositel inference „bouchačku necháme doma", bot ho
čte s jistotou a chybné přečtení stojí auto-fail karty. Rozpoznatelná formule se
čte na dvě slova, pátá variace se musí přeložit. Proti tomu stojí jediné —
19× tatáž věta zmrtví prózu; to je ale cena, kterou u **rule readoutu** platím
rád, a je to jiná třída textu než předzvěst (kde je skeleton zakázaný, protože
nese scénickou informaci).
**POTVRZENO humor-testérem a přijato definitivně** (§5.2): testér nález nejen
podpořil, ale **doložil měřením, že je horší, než generátor tvrdil** — nebyly to
2 varianty na buňku, ale **11 znění na 4 buňky**, s největším rozptylem přesně
u dvou buněk, které se liší jen tím, jestli skrytá zbraň pomáhá. Kanál 5 je nově
**normativní znění** + dva pevné appendy + jednotný registr, a kompenzace za tu
pevnost jde do **rozvolnění pozice předzvěsti** (ta měla tutéž informaci v téže
pozici 8× z 19). Testérova podmínka, kterou přijímám: ať ta věta zní jako
doražená klauzule telegramu, ne jako narátorova poslední myšlenka — pak ji stůl
po druhém uzlu čte jako razítko.

**N-4 · „Šest z devatenácti telegrafů říká, že peníze neplatí." → PŘIJATO jako
strop.** Každý zápor je jednotlivě legální a šetří hráči mrtvou kartu, ale sada
by dohromady učila „hodnota je past" — a `hodnota` je nárokem v 8 slotech
a jediný stat, který Malone ruší run-wide. **Invariant změněn:** zápor o témže
statu nejvýš 3× v sadě, mimo povinné `rusi` připomínky. V opravném kole padne
jeden ze čtyř hodnota-záporů; ruší se ten u **`rival-prepad`** („Smlouvat se tu
nebude o nic"), protože u zátarasu rivalů je nejméně informativní — že se
o mlácení nesmlouvá, si hráč domyslí ze scény.

**N-5 · „Sáhl jsem i na `most-prohnila-prkna`, referenční implementaci." →
PŘIJATO bez výhrad.** Bylo to nevyhnutelné: nesl tři nároky a v3 povoluje jeden.
Zachoval KOMBI větu doslova i „až bude pozdě couvnout", škrtl závoru a díru jako
nároky. **Reference se tím posouvá:** referenčním telegrafem v3 je nadále
`most-prohnila-prkna`, jen v novém znění — je to jediný uzel, který drží KOMBI
kotvu, zápor nemá a přesto se vejde do ~310 znaků.

**N-6 · Dvě neověřené dobové reálie** (kávové šálky jako nádoba na kořalku,
„motor duní pod podlahou" u přívozu) → **předáno humor-testérovi k ověření**,
včetně obušků, bloku pokut a „nákladního listu". Autor je psal z paměti a sám
to přiznal; to je správné chování, ne chyba.
**Výsledek (§5.2):** šálky **čisté** (doložená praxe speakeasy), „motor"
**anachronismus** (parní trajekty na Hudsonu 1930 → „stroj"). A testér našel dvě
další reálie, na které se nikdo neptal: **„celnice v Albany"** je institucionálně
mimo (domácí trasa Buffalo → NY celnici neřeší) a **„Pátou silnici"** se česky
čte jako Fifth Avenue. Oboje se opravuje jedním slovem. **Přiznání se vyplatilo:
tři ze čtyř dobových nálezů kola vyšly z toho, že autor sám označil, co si není
jistý.**

### 3.3 Sada po opravném kole (2026-07-30) — ZNĚNÍ, které jde do dalšího kola

> **Procesní chyba, kterou přiznávám a která tu sadu stála kus kvality:** znění
> z 1. kola jsem **nikam neuložil** (obsahové kolo běželo jen v odpovědi agenta).
> Opravné kolo tedy nemělo z čeho kopírovat „nezměněné" telegrafy a napsalo sadu
> **celou znovu** — čímž se ztratila část obrazů, které humor-testér výslovně
> chránil („proud pod koly přerovnává kameny", „vrata se samotíží otvírají
> dokořán", kávové šálky, „nárazník na nárazník", „beze slova sundává klobouk").
> Generátor to sám nahlásil jako první věc. **Pravidlo do budoucna: dodaná sada
> se zapisuje do reportu OKAMŽITĚ, ne po review.** Proto je celé znění níže.

#### `obsah/situace.yaml`

1. **`farmar-brod`** · npc · kotva `nastroj` (pr. 3) · 3 položky · verdikt C
   > Vůz sedí v brodě po nápravy a na břehu už čeká farmář s vidlemi. Postraňky jsou zpuchřelé; někdo je bude muset přepřáhnout, než koně vůz vytrhnou. Farmář si u toho nahlas počítá, co mu podle něj patří za škodu na poli. Ty vidle se zvednou bez ohlášení a dál to bude o rychlosti. Na očích zbraň všechno pokazí, potají může být to jediné, co pomůže.
2. **`farmar-stodola`** · lokace · kotva KOMBI (pr. 1) · 3 položky · spojený zápor hodnota+útok · verdikt A
   > Statkář za nocleh nechce ani dolar a bít se tu nebude s kým. U vrat leží jeho smečka a nespí; seno za nimi je vlhké až k trámům. Vrata držet nebudou, dokud je někdo nezaklíní a zároveň nepodepře tím, co leží po ruce. Lucerna projde kolem stání jedinkrát a mimo její světlo se stodola nedá přečíst. Zbraně se tu nikdo nelekne.
3. **`deputy-mytnice`** · npc · kotva `hodnota` (pr. 3) · **2. nárok** `improvizace` · 4 položky · verdikt C
   > U mýtné boudy natahuje zástupce šerifa ruku po silničním poplatku a sazbu si určuje sám. Vysolit ji bude muset někdo z posádky. Jiný zatím odvede řeč k pumpě, která na dvoře netočí ani kapku. Ruka mu sjede z bloku pokut níž a bude to o pěstech. Na očích zbraň všechno pokazí, potají může být to jediné, co pomůže.
4. **`deputy-hlidka`** · npc · kotva `nastroj` (pr. 3) · 3 položky · verdikt C
   > Postarší strážník stojí vozem napříč silnicí a leští si odznak. Na zadním kole se cestou uvolnily matice a někdo je dotáhne, nebo se dál nepojede. Strážník si zatím prohlíží tabulku vozu, číslo po číslo. Odznak dopadne zpátky na kapsu dřív, než kdo domluví, a dál se mluvit nebude. Na očích zbraň všechno pokazí, potají může být to jediné, co pomůže.
5. **`most-prohnila-prkna`** · lokace · kotva KOMBI (pr. 1) · 3 položky · povinný zápor útoku · verdikt A
   > Příjezd na most přes Mohawk drží zrezivělá závora, kterou roky nikdo nezvedl, a bít se tu nebude s kým. Prkna za ní jsou prohnilá: bude je třeba přibít a zároveň podložit něčím, co leží po ruce. Uprostřed zeje díra a řeka pod ní jde rychleji, než se zdá. Jedno prkno povolí, až bude pozdě couvnout. Zbraně se tu nikdo nelekne.
6. **`privoz-celnik`** · npc · kotva `nastroj` (pr. 3) · 3 položky · verdikt C
   > Prám se odráží od břehu a celník obchází náklad s nosem u plachty. Bedny se bez páky z dohledu nehnou a někdo se do toho musí dát dřív, než celník dojde na konec. Za pohled jinam si řekne svoje a na řeč o svatbách je zvyklý. Plachta sklouzne sama a pak jde o to, kdo se pohne dřív. Na očích zbraň všechno pokazí, potají může být to jediné, co pomůže.
7. **`rival-prepad`** · npc · kotva `utok` (pr. 2) · 3 položky · verdikt C
   > Napříč silnicí stojí vozy konkurence a chlapi z nich vystupují beze spěchu. Někdo se do nich musí opřít dřív, než se srovnají do řady. Vpředu si jeden zapaluje, druhý si plive do dlaní. Jeden z nich si beze slova omotá dlaň řemenem a nečeká, až kdo domluví. Na očích zbraň všechno pokazí, potají může být to jediné, co pomůže.
8. **`rival-parley`** · npc · kotva `hodnota` (pr. 3) · 3 položky · verdikt C
   > V zadní místnosti nalévá hostitel a za jeho zády stojí tři stíny. Na stůl bude muset přijít něco, co má cenu. Na stole je pořád plno, ačkoli nikdo nepije, a řeč jde o starých časech. Sklenka dopadne na stůl tvrdě a od té chvíle jde o rychlost. Na očích zbraň všechno pokazí, potají může být to jediné, co pomůže.
9. **`urednik-vaha`** · npc · kotva `utok` (pr. 2) · zápor `hodnota` · verdikt D
   > U silniční váhy sedí úředník s předpisem na všechno a peníze si vzít netroufne. Chce listinu, která před ním obstojí, a razítko, které v knize chybí. Když ani papíry nepomohou, zbude na něj zvýšit hlas. Ručička váhy se zastaví jinde, než má, a řekne se to až pozdě. Sáhnout tu pod kabát jen popudí, a schovaná zbraň nezmůže nic.
10. **`urednik-razitko`** · npc · kotva `nastroj` (pr. 3) · 3 položky · verdikt D
    > V celnici stojí fronta až ke dveřím a od vedlejší přepážky doléhá dopadání razítek. Nákladní list nese otisk, který v knize není, a dorazit ho bude muset někdo kusem korku. Úředník listuje pomalu a mračí se. V listině zůstane prázdné políčko a všimne si toho až on. Sáhnout tu pod kabát jen popudí, a schovaná zbraň nezmůže nic.
11. **`mesto-houkacky`** · lokace · kotva `nastroj` (pr. 2) · **2. nárok** `improvizace` · 4 položky · povinný zápor útoku · verdikt A
    > Ulicemi houkají hlídkové vozy a chodníky praskají ve švech; s houkající hlídkou se nikdo nebije. Vůz musí někdo protáhnout průjezdem, kam se sotva vejde. Jiný nechá za sebou něco, co pošle pátrání do vedlejšího bloku. V okně nad ulicí se rozsvítí ve špatnou chvíli a světlo padne přes celý chodník. Zbraně se tu nikdo nelekne.
12. **`mesto-ulicka`** · npc · kotva `utok` (pr. 2) · 3 položky · verdikt D
    > Ulička končí zdí a dva strážníci stojí v jejím ústí. Domluvit se s nimi nejde a zbude na ně vyjet zostra. Obušky mají zavěšené na zápěstí a jeden z nich si stoupá tak, aby byl vidět z ulice. Lampa nad uličkou zhasne bez varování a stín pod ní padne jinam, než měl. Sáhnout tu pod kabát jen popudí, a schovaná zbraň nezmůže nic.
13. **`nadrazi-vypravci`** · npc · kotva `utok` (pr. 2) · 3 položky · verdikt D + dovětek výjimky · nese `improv_skryte`
    > Výpravčí stojí před vagonem a chce nákladní list, který nikdo nemá. Někdo na něj bude muset zatlačit nahlas, jinak neustoupí. Závora u rampy je spuštěná a za ní čeká vagon s otevřenými dveřmi. Listina zůstane bez čísla a spraví to leda historka na místě. Tomuhle chlapovi bouchačka pusu zavře; jinak tu sáhnout pod kabát jen popudí a schovaná zbraň nezmůže nic.
14. **`nadrazi-noc`** · lokace · kotva `nastroj` (pr. 3) · **2. nárok zrušen** · 3 položky · číslovka „dvakrát" · verdikt B
    > Na odstavné koleji v Peekskillu se mezi vagony pohupuje lucerna nočního hlídače. Zámek na dveřích vagonu po dobrém nepovolí a někdo ho bude muset vypáčit. Hlídač si pohvizduje a jméno každého, kdo tu má co dělat, zná zpaměti. Potmě se to na štěrku pokazí hned dvakrát, pokaždé jinak, a jednou z toho ranou. Zbraň tu nikoho nevyplaší a schovaná se vyplatí.
15. **`zatah`** · zatah · kotva `utok` (pr. 1b) · 3 položky · verdikt A
    > Silnici přehrazují hlídkové vozy a ven vede jen průraz; někdo do něj bude muset tlačit, dokud to nepovolí. Za blokádou stojí druhá řada vozů a postranní ulice se zavírají jedna po druhé. Na chodníku stojí zvědavci a jeden z nich ukazuje na plachtu vozu. Reflektor se stočí právě na vůz a zůstane na něm. Zbraně se tu nikdo nelekne.

#### `obsah/pronasledovatele.yaml`

16. **`malone-lecka`** · lecka · kotva `improvizace` (pr. 3) · 3 položky · kanál 7 = zápor · verdikt C
    > Na mostě u Poughkeepsie stojí Malone s fotografií v ruce a na peníze neslyší. Někdo si k té fotografii bude muset vymyslet jméno, které mu Malone uvěří. Krajnice u zábradlí je úzká a federál od ní neuhne ani o krok. Malonovi zajede ruka pod kabát a od té chvíle je řeč zbytečná. Na očích zbraň všechno pokazí, potají může být to jediné, co pomůže.
17. **`malone-konfrontace`** · konfrontace · kotva `utok` (pr. 1b) · **2. nárok** `obrana` · 4 položky · verdikt B
    > Kolona federálních vozů svírá silnici z obou stran a Malone si beze spěchu nasazuje brýle; na peníze neslyší. Ven se někdo musí probít silou. Jiný u toho vydrží první salvu vestoje. Jeden z vozů popojede a zavře poslední mezeru mezi blatníky; rána pak přijde ze strany, kde nikdo nestál. Zbraň tu nikoho nevyplaší a schovaná se vyplatí.
18. **`brody-lecka`** · lecka · kotva `improvizace` (pr. 3) · **2. nárok** `hodnota` · 4 položky · kanál 7 srostlý · verdikt C
    > Silnici přehrazuje Brodyho valník a kolem se tlačí parta nadšených občanů. Dav musí někdo uklidnit dřív, než se rozjede sám. Jiný zatím šerifovi připlatí za shovívavost. Z davu přiletí kámen a dál se to řeší rukama. Na očích zbraň všechno pokazí, potají může být to jediné, co pomůže — a u Brodyho přitáhne každá dvojnásob pozornosti.
19. **`brody-konfrontace`** · konfrontace · kotva `utok` (pr. 1b) · **2. nárok** `nastroj` · 4 položky · kanál 7 srostlý · verdikt A
    > Brodyho muži tlačí kolonu k zavřenému mostu a šerif si sundává klobouk. Vpřed se někdo musí probít silou. Jiný zatím dostane z vjezdu to, co ho zavírá; po dobrém to z cesty nepůjde. Most dutě zaduní tam, kde to nikdo nečekal. Zbraně se tu nikdo nelekne, ale u Brodyho přitáhne každá bouchačka dvojnásob pozornosti.

**Registr druhého nároku (5 z 19, kvóta ≤ 6):** `deputy-mytnice` (improvizace) ·
`mesto-houkacky` (improvizace) · `malone-konfrontace` (obrana) · `brody-lecka`
(hodnota) · `brody-konfrontace` (nastroj).

**Pravidlo podmětu:** generátor doložil tabulku po telegrafech — 24 nároků,
24 vět s podmětem posádka, **shoda 19/19**, nula zakázaných obratů v obrazových
větách. **Vedlejší efekt, který stojí za zapsání:** s čištěním podmětů zmizel
i počítací rám, takže v celé sadě je **jediná číslovka** („dvakrát" u
`nadrazi-noc`) — přesně jak kanál 3+4 po opravě chce.

### 3.4 Co opravné kolo doručilo, co ztratilo a proč se DNES NEZAPÉKÁ

**Doručeno (a je to hodně):** všech 5 překročení dělicí čáry humoru je pryč ·
mřížka verdiktu sražena na 4 doslovná znění + 2 appendy · pravidlo 1b u obou
konfrontací i u `zatah` · registr druhého nároku · `nadrazi-noc` zbaven plného
pokrytí · povinný zápor útoku u 3 lokací · pravidlo podmětu 19/19 · a **všechny
tři dobové nálezy se vyřešily samy tím, že se ty věty přepsaly** („motor"
i „celnice v Albany" i „Pátá silnice" v sadě už nejsou).

**Ztraceno (moje procesní chyba, viz rámeček výše):** část obrazů, které
humor-testér jmenovitě chránil. Nejcitelněji **kávové šálky** v `rival-parley`
a **„proud pod koly přerovnává kameny"** v `farmar-brod`.

**Dvě NOVÁ porušení, která jsem našel při kontrole proti slotům** — a proto
sada v tomto kole **nejde do `obsah/`**:

1. **`privoz-celnik` — anti-tell o reálném slotu.** „…a na řeč o svatbách je
   zvyklý" říká, že mluvení nepomůže — ale `improvizace` **je viditelný slot
   s kotvou 4** („Zamotat hlavu"). Zápor smí vylučovat jen stat, který není
   v žádném slotu; tohle je zápor o poptávce, která tam je, tedy horší než
   mlčení: aktivně odvádí od správné karty.
2. **`urednik-vaha` — implicitní trojité pokrytí.** „Chce listinu, která před ním
   obstojí, a razítko, které v knize chybí" formálně projde pravidlem podmětu
   (podmětem je úředník), ale čtenáři to **jmenuje dvě další poptávky** —
   improvizaci i nástroj. S kotvou „zvýšit hlas" má ten telegraf de facto tři
   nároky, tedy zpátky v2. **A je to nález o pravidle, ne o textu:** pravidlo
   podmětu je gameovatelné přes „NPC chce X" a přesně na tohle kritik varoval
   („semantika přebije grep"). Do invariantu proto patří dovětek: *nárok vzniká
   i tehdy, když práci posádce přiřkne NPC svým přáním („chce…", „nedá, dokud…"),
   a takové věty se počítají do nároků.*

**Stav vůči předregistrovaným kritériím §3.0:** 1 ✅ · 2 ❌ (2 porušení výše) ·
3 ✅ · 4 čeká na měření · 5 ✅ (nejčastější fráze 2×, „bouchačka" sražena ze 4× na
2×) · 6 ✅ (odhad ⌀ ~335, shodné s D49 — táž délka, jiná náplň) · 7 ✅.
**Pravidlo z předregistrace zní: nesplněná tvrdá podmínka = nezapékat.** Držím
ho, i když je to nepříjemné, protože právě proto se předregistrace píše naslepo.

**Co zbývá — jedno krátké kolo, ne další velké:** (a) opravit ty dvě věty,
(b) vrátit chráněné obrazy z 1. kola (šálky, „proud přerovnává kameny"),
(c) doplnit dovětek o NPC-přání do invariantu, (d) nechat změřit délky
(facilitátor má skript připravený), (e) krátká kontrola obou recenzentů **jen
na diff**, ne celé sady. Teprve pak zapečení.

**Tři věci, které generátor nahlásil a nechávám je vědomě bez změny:**
- **Útok má nově 7 kotev z 19 (37 %)**, ve 4 případech ve scéně, kde zbraň na
  očích propadá. Je to důsledek pravidla 1b + pravidla 2 a invariant to má předem
  přiznané jako **sázku** („kritériem je informační hodnota, ne splnitelnost").
  Nemění se — ale patří to do měřených očekávání sezení: *„telegraf pořád chce
  mlátit, a to nemáme čím"* je první věta, kterou u stolu čekám. Neútočných
  útočných karet jsou 4 ze 40.
- **`rival-parley` platí za doslovnost verdiktu nejvíc** (zapečená adaptace
  „na stole / pod stolem" byla nejlepší v celé staré sadě). Generátor navrhuje
  jednu pojmenovanou výjimku; **odmítám** — jedna výjimka v uzavřené mřížce je
  začátek jedenácti znění. Obraz stolu ať žije v jiné větě téhož telegrafu.
- **`nadrazi-vypravci` má strukturálně nejméně místa na obraz** (verdikt
  s dovětkem ~106 zn.). Není to lenost autora, je to fixní náklad slotové
  výjimky. Zapsáno, ať to nikdo nečte jako vadu.

## 4. Naměřené délky

### 4.1 Zapečená sada (D49) — přeměřeno 2026-07-30, `playtest-facilitator`

Měřeno týmž YAML loaderem, jaký používá engine (`js-yaml`), `String.length` nad
naparsovaným řetězcem, `text` bez koncového newline.

| jednotka | min | max | průměr |
|---|---|---|---|
| **znaky** | **302** (`most-prohnila-prkna`) | **379** (`rival-prepad`) | **338,1** |
| bajty | 336 | 421 | 373,8 |

**Nález: čísla z D49 („302–379, průměr 338") jsou ZNAKY a byla správná.** Výtka
kritika V-2 z konceptového kola („návrh měřil u zapečených textů bajty; invariant
u stropu jednotku neuvádí") je tedy **z poloviny vyvrácena měřením**: jednotku
invariant skutečně neuváděl a doplnit se má, ale zapečená sada špatně změřená
nebyla. Je to třetí případ v tomto projektu, kdy teorii o číslech vyvrátilo
měření (precedens: revert kotev v kalibraci-3, redefinice K5 v D34) — a stojí za
zapsání, protože oba předchozí šly opačným směrem než intuice recenzenta.
**Kritik to sám odvolal:** *„moje výtka V-2 byla z poloviny mylná — mělo se měřit
dřív, než jsem tvrdil, že se měřilo špatně."* Poučení je obousměrné a levné:
konkrétní číslo od recenzenta je hypotéza, dokud ho někdo se Bashem nepřeměří,
a to měření je jeden node skript na půl druhé minuty.

Součet `telegraf` + `text` je u všech 19 pod rozpočtem uzlu 670 (max 595,
`rival-prepad`). **Volný rozpočet (670 − `text`) je u všech 19 mezi 432 a 479
znaky, takže vázající limit je STROP 400, ne rozpočet uzlu.** Nová sada má tedy
proti cíli ~320 pohodlnou rezervu a „místo pro obraz" není teoretické.

### 4.2 Finální sada — ZMĚŘENO (2026-07-30, `playtest-facilitator`)

Měřeno stejnou metodikou jako §4.1 (`String.length` nad naparsovaným řetězcem,
`text` s nedosazenými `{VEC}`/`{kdo}`), znění z §3.5.

| jednotka | min | max | průměr |
|---|---|---|---|
| **znaky** | **285** (`malone-konfrontace`) | **358** (`urednik-vaha`) | **319,5** |
| bajty | 312 | 402 | ~356 |

- **Strop 400 zn.: splněn u 19/19**, nejtěsnější `urednik-vaha` s rezervou 42 zn.
- **Rozpočet uzlu 670 zn.: splněn u 19/19**, nejtěsnější `privoz-celnik` 580
  (rezerva 90) a `malone-lecka` 577.
- **Průměr 319,5 je přesně cíl mandátu D51 („~320")** a leží v předregistrovaném
  pásmu 300–360 — proti zapečené D49 (338) je to −18,5 zn., tedy **táž délka,
  jiná náplň**, jak kolo slibovalo. Pod hranici nálezu (280) sada nespadla.

**Dva nálezy z měření, které stojí za zapsání:**

1. **Můj odhad, kdo bude nejdelší, byl mylný.** Tipoval jsem `nadrazi-vypravci`
   a `privoz-celnik` (oba mají dlouhý verdikt); nejdelší je `urednik-vaha`
   s **nejkratším** ze čtyř verdiktů. **Délka verdiktu není prediktor délky
   telegrafu** — rozhoduje délka nárokových obrazů. Je to čtvrté potvrzení
   pravidla „každý telegraf se měří, neodhaduje" v jednom kole.
2. **Bajty vs. znaky: u téhle sady žádný code-point rozdíl** (facilitátor
   přepočítal `[...s].length` proti `.length` — shoda), takže jediný rozdíl proti
   bajtům je diakritika, jak invariant tvrdí.

*Skript: `d51-final-19.mjs` ve scratchpadu; nález uložen v paměti facilitátora
(`d51-final-19-delky.md`).*

### 4.3 Finální vyhodnocení předregistrovaných kritérií §3.0

| # | kritérium | verdikt na FINÁLNÍ sadě (§3.5) |
|---|---|---|
| 1 | věrnost signálu 19/19 | **SPLNĚNO** — kotva, předzvěst, `zbran_skryte` 10×, `improv_skryte` 1×, `proti_srsti` 2 u `nadrazi-noc`, slotová výjimka 1×, mřížka verdiktu 19/19 |
| 2 | ČISTOTA, nula falešných poptávek a anti-tellů | **SPLNĚNO po opravě šesti uzlů** — v předchozí verzi 6 porušení (4 anti-telly, 1 falešná poptávka, 1 nepřiznaný druhý nárok), viz §3.5 |
| 3 | rozpočet položek 3 (strop 4) | **SPLNĚNO** — 3 položky u 14 uzlů, 4 u pěti (registr) |
| 4 | délky (strop 400 / uzel 670) | **SPLNĚNO 19/19** — max 358, nejtěsnější uzel 580/670 (§4.2) |
| 5 | žádný skeleton, fráze ≤ 2× | **SPLNĚNO** — skeleton předzvěsti 0×, 19 různých předmětů; verdikt je uzavřená mřížka a z kvóty je vyjmutý (adjudikace §3.1) |
| 6 | ⌀ délka v pásmu 280–360 | **SPLNĚNO — 319,5**, tedy přesně cíl D51 „~320" a −18,5 proti D49 |
| 7 | nejvýš 3 telegrafy shodné s D49 | **SPLNĚNO** — přepsáno 19/19 |

**Tři průchody, jeden gate.** Kritérium 2 padlo v obou předchozích verzích sady
a odhalilo pokaždé něco jiného (1. průchod: falešná poptávka, kterou našel
humor-testér; 2. průchod: čtyři anti-telly, které nenašel nikdo z recenzentů
a vypadly z výčtové kontroly). Kdyby se sada zapekla po prvním „ano s úpravami",
nesla by šest míst, kde próza odvádí od správné karty.

## 5. Verdikt recenzentů

### 5.1 `design-critic` — prověrka SPECIFIKACE (2026-07-30)

*Kritik byl pouštěn na invariant **dřív** než na texty: kdyby byla vadná
specifikace, nemá cenu recenzovat texty psané podle ní. Přepočítal typový prior
nezávisle po slotech, délky ověřil ručně, kód u zdroje.*

**Verdikt: SCHVÁLIT S ÚPRAVAMI.** *„Škrt POKRYTÍ je správná diagnóza a v3 je
poprvé napsaná tak, že přiznává, co ztrácí."* Tři blokující nálezy — všechny
**přijaty a zapracovány** do §2:

| # | nález | jak vyřízen |
|---|---|---|
| **B-1** | **Pravidlo 2 maže útok-nárok v obou konfrontacích** a znovu otevírá díru, kterou D48 zavíralo. `serif-brody/konfrontace`: viditelný `utok 4`, `zbran_projde=ano`, ale pravidlo 2 vybere kotvu = nářadí → hráč před finálním commitem nikde nemá, že se tam **bije**. Přitom je to jediné místo ve hře, kde je GANGSTER karta ve viditelné roli správná hra, a chybný commit **ukončí run**. D48 zúžilo verdikt na toleranci s odůvodněním „jestli se zbraň hodí, to je práce trendu" — a v3 trend mimo kotvu ruší. | **Nové pravidlo 1b:** viditelný útok-slot × `zbran_projde=ano` ⇒ kotva je ten slot. Dopadá na `zatah`, `malone-konfrontace`, `brody-konfrontace`. |
| **B-2** | **„Cenu nese verdikt a zápor" je slib, který invariant nikomu neukládá** — zápor byl dobrovolný. Kritik spočítal: útok není v žádném slotu u 4 z 19, a u tří z nich (`farmar-stodola`, `most-prohnila-prkna`, `mesto-houkacky`) je `zbran_projde=ano`, takže verdikt „Zbraně se tu nikdo nelekne" **aktivně svádí** committnout brokovnici do scény, kde útok-slot vůbec není. Mitigace stála na třech větách, které nikdo nemusel napsat. | **POVINNÝ ZÁPOR** zapsán do §2 + do přejímky. Nestojí ani jednu položku. Je to jediná věc v celém v3, která přiznanou cenu opravdu platí. |
| **B-3** | **Přejímka v3 nemá definici.** Procedura D49 („derivovaný signál položku po položce, 19/19") byla definovaná proti `trend` = všem viditelným slotům; po škrtu POKRYTÍ by hlásila „sada nepokrývá signál" (pravda a irelevantní) a o ČISTOTĚ — pravidle, které sám označuji za nejdražší — by nezkontrolovala nic. Grep ji nechytí, hráč taky ne. | **PŘEJÍMKA v3, 5 bodů per telegraf**, zapsána do §2. Jádrem je bod 2 = **pravidlo podmětu** (V-5), které je téměř grepovatelné. |

**Vážné nálezy — všechny přijaty:**

- **V-1 · „Ortogonální k obtížnosti" neplyne ze zákazu kritéria.** Nevybírat
  *podle* výšky kotvy je zákaz kritéria; ortogonalita je tvrzení o společném
  rozdělení. Kritik to proměřil: v 17 z 19 kotva výšku nesleduje, **ve dvou ano
  a systematicky** (pravidlo 1 vybírá v obou KOMBI scénách nejnižší kotvu scény).
  → věta v §1.3 vyškrtnuta a nahrazena naměřeným tvrzením.
- **V-2 · „Sim to neumí modelovat ani jedním směrem" bylo přestřelené** — kritik
  navrhl rameno `memorizacni` jako horní mez hodnoty prioru. **Přijato, změřeno
  (96 000 runů, 3 bloky) — a měření ten návrh VYVRÁTILO:** bot s dokonalou
  znalostí slotů je u 2p–4p o 4–10 b. **horší** než bot čtoucí telegraf, takže se
  ta ramena neliší jen informací a mez to není (detail v §1.2). Zůstává tedy moje
  původní pozice, jen doloženě: **pro sázku v3 simulace měřidlo nemá.**
  **Co z nálezu ale platí a je nejcennější věta prověrky: v3 dělá první run
  těžší a další snazší, přičemž lidská brána JE první run.** A u 1p prior hodnotu
  má (+3,9 b.), což je zrovna buňka, kde sezení havarovalo. → zapsáno do §1.2.
- **V-3 · „Typ je vidět na mapě" je u 4 z 19 nepravda** — léčky a konfrontace se
  vkládají z prahů Žáru, kartu volby cesty nedostanou a `commit.js` typ nevypisuje.
  → pravidlo 3 je u `zatah`/`lecka`/`konfrontace` primární.
- **V-4 · Prior u `npc` nerozlišuje tak, jak invariant tvrdil** („nářadí 7/12"
  proti „obrana 8/12" je jedna scéna) a u 3 z 12 nedává pravidlo 2 odpověď vůbec.
  → „a po něm nářadí" vyškrtnuto; doplněna **přiznaná sázka**, že kritériem je
  informační hodnota, ne splnitelnost (viditelný útok-slot u `npc` obslouží ~4
  karty ze 40 — a hráčovým úkolem je rozhodnout, ne dostat splnitelný úkol).
- **V-5 · Po škrtu se převrací poměr kulisy k nároku** (~1:3 → ~1:1) a falešná
  poptávka přestává být rozpoznatelná — pod POKRYTÍM trčela jako čtvrtá mezi
  třemi pravými. → **pravidlo podmětu**.
- **V-6 · Kvóta „≤ 5 v sadě" není grepovatelná** (na rozdíl od frázové kvóty
  z D49), nemá pravidlo pro růst sady a nechává legálně obsadit strop u 9 z 19.
  → kvóta vyjádřena **podílem** (≤ třetina), doplněn **registr id** v přejímce
  a nový zákaz: druhý nárok nikdy tam, kde by pojmenoval **všechny** viditelné
  sloty (dopadá na `nadrazi-noc`).

**Drobné:** D-a (hustota znaků na položku — vyškrtnuto z §1), D-b (cíl ~320 čtený
jako pokyn ke krácení — přeformulován na střed pásma 300–360), D-c (jednotka
rozpočtu uzlu — vráceno „zdrojových znaků"), D-d (dovětek slotové výjimky
u `nadrazi-vypravci` jsou vlastně dvě věci k zapamatování — přiznáno, 1 uzel),
D-e (hlavička „kanály, které próza MUSÍ nést" — přepsána na „co próza nese a co
vědomě nenese", jako pojistka proti tomu, aby POKRYTÍ přišlo potřetí), D-f (postih
`hide_telegraf` byl ladil proti pěti položkám — přiznáno v §1.2).

**Co kritik schválil bez výhrad:** celá §1.1 (odmítnutí balančního argumentu
i cena za jeho vzkříšení), typový prior jako tabulka (**přepočítáno nezávisle,
15/15 řádků správně**), §4.1 a jednotka délky, pravidlo 1 (KOMBI je vždy kotva),
pravidlo 4 jako zákaz kritéria, §6.1 (obě opravy skutečně zapsané, formulace
u obtížnosti „správně obranná, ne alibistická") a §6.3.

**Kritik zároveň odvolal svou vlastní výtku z konceptového kola:** *„moje výtka
V-2 byla z poloviny mylná — zapečená sada D49 se měřila správně; mělo se měřit
dřív, než jsem tvrdil, že se měřilo špatně."*

**Jedna procesní výhrada, kterou předávám PM (nemám ji čím vyřídit sám):** nález
§6.2 (oprava kanonu o kanálech telegrafu) je „připravený, nezapsaný" už potřetí
(D47 §7/1 → konceptové kolo §10/2 → sem). Kritik souhlasí, že ho nemám zapisovat
nad mandát, **ale žádá, aby se zapsal do `projekt/stav.md` jako blokátor commitu
zapečení** — slib v pracovním souboru, který bude nahrazen dalším pracovním
souborem, selhal už dvakrát.
**VYŘÍZENO v dokončovacím kole (2026-07-30):** blokátor PM do `projekt/stav.md`
zapsal a **mandát dokončovacího kola opravu kanonu výslovně zadal do TÉHOŽ
commitu jako zapečení**. Trojnásobné odkládání tím končí — viz §6.2, kde je
u každé položky poznámka „ZAPSÁNO".

### 5.2 `protocol-humor-tester` — review SADY (2026-07-30)

**Verdikt: ZAPÉCT PO OPRAVÁCH.** *„Sada je proti D49 měřitelně lepší v tom, co
mandát D51 chtěl: smyslový detail je nový a funguje, srostlá forma kanálu 7
u Brodyho je elegantní, a čistě registrových úletů (minulý čas, rozkazovací
způsob, meta-slovník) je nula."*

**Blokující 1 · Mřížka verdiktu zbraně se rozpadla na 11 znění na 4 buňky.**
Testér ji sestavil buňka → uzel → doslovné znění (rozpad se čtením po jednom
najít nedá) a našel, že rozptyl je největší **právě u dvou buněk, které se liší
jen tím, jestli skrytá zbraň pomáhá**: „ta pod kabátem může být poslední záchrana"
proti „a potají nepomůže vůbec" — posluchač je rozlišuje **na posledních třech
slovech dvou téměř identických vět**. K tomu míchání registru (zbraň / bouchačka
/ železo / na světle / pod kabátem). → **Přijato: kanál 5 je nově NORMATIVNÍ
znění** + dva pevné appendy + jednotný lexikální register (§2).
*Testér to výslovně označil za chybu specifikace, ne autora:* pravidlo „slovesa
a obrazy se smějí přizpůsobit, smysl ne" ten rozpad **vyrobilo** — táž třída
chyby jako škrtnuté POKRYTÍ.

**Blokující 2 · Pět překročení dělicí čáry humoru, všech pět s týmž tvarem:**
konkrétní obraz + čárka + narátorův verdikt nad tím obrazem (`most` „stojí nad
vodou už jen ze zvyku", `deputy-hlidka` „jako by měl do večera čas",
`rival-parley` „tři chlapi, kteří se nebaví", `zatah` „nikdo z nich nikam
nespěchá", `brody-lecka` „může vytrhnout trn"). → **Přijato**, včetně
**operačního testu** („škrtni druhou polovinu věty") a rozlišení *zakázaný
hodnotící predikát* × *dovolená hodnotící jmenná fráze* (§2). Jsou to **škrty,
ne přepisy** — uvolní ~90 znaků zpět do obrazu, tedy jdou ve prospěch mandátu.

**Dva dobové nálezy, na které jsem se neptal — oba přijaty a oba by prošly:**

- **`privoz-celnik` „motor duní pod podlahou" = ANACHRONISMUS.** Trajekty na
  Hudsonu byly v roce 1930 **parní**; dieselové konverze až od ~1935, a česky
  „motor" implikuje spalovací stroj. → *„pod podlahou duní **stroj**"* (jedno
  slovo, rytmus věty zachován).
- **`urednik-razitko` „v celnici v Albany" = reálie mimo.** Domácí přeprava
  Buffalo → New York **celnici neřeší** (celní přístav na téhle trase je Buffalo,
  Peace Bridge 1927), a albanská celní budova byla v roce 1930 teprve financovaná.
  → *„v **úřadovně** v Albany"*. (Testér nabídl i přesun uzlu do Buffala jako
  tematicky nejlepší, ale to je designová změna mimo mandát — **nedělá se**.)
- **`zatah` „Pátou silnici"** — dobově správně (NY Route 5 vede po pašerácké
  trase), ale česky se to čte jako **Fifth Avenue** a posluchače to přehodí
  o 500 km. → **„Pětku"** (řidičský slang, dobově sedne).
- Ověřeno a v pořádku: **kávové šálky** (doložená praxe speakeasy — *„nemazat
  kvůli mé poznámce o čajovém šálku"*), obušky, blok pokut, nákladní list, celý
  místopis. `malone-lecka` „Most u Poughkeepsie": Mid-Hudson Bridge otevřen
  25. 8. 1930 — obhajitelné, ale platí jen pro druhou polovinu roku; zapsáno,
  aby to nikdo neotevíral podruhé.

**Čtivost nahlas — šest vět se láme v ústech** (`mesto-ulicka` nejhorší, dále
`zatah`, `farmar-brod`, `malone-lecka`, `brody-lecka`, `nadrazi-noc`), vždy jedním
ze tří defektů: tři souřadné členy v první větě, mould „jen… a jen když… tak,
aby…", nebo elipsa vynucující druhé přečtení. Testér dodal konkrétní znění ke
každé. → **Přijato.** Telegraf se čte 6–7× za run nahlas, tohle není kosmetika.

**Nález nad zadání, který beru jako nejcennější z celého review:**
**uvolněné místo teklo do úvodní expozice — a to je jediný odstavec, který
protokol dubluje.** Scénu hráč dostane třikrát (telegraf → `text` → první věta
protokolu, viz vzorový výstup v `prompty/protokol.md`). Rozvine-li telegraf scénu
na dvě věty, protokol má o jednu větu pointy méně. → **Zapsáno do invariantu jako
samostatné pravidlo** („kam smí téct uvolněné místo").

**Dva systémové nálezy o jednotvárnosti, které si odpovídají:** předzvěst má
tutéž informaci v téže pozici **8× z 19** („a poznáte to pozdě"), kdežto verdikt
má **variabilní znění v pevné pozici** — přesně obráceně, než by mělo být.
→ **Zafixovat verdikt, rozvolnit pozici předzvěsti** (obojí v §2).

**Co testér jmenovitě chrání před opravným kolem** (a co tedy opravné kolo nesmí
smést): „proud pod koly přerovnává kameny" (nejlepší obraz sady), „od vedlejší
přepážky sem doléhá dopadání razítek", „a nic za to nechce", „vrata se samotíží
otvírají dokořán", „šerif si beze slova sundává klobouk", „nárazník na nárazník",
„úředník s předpisem na všechno", „parta nadšených občanů", „pumpě, která u boudy
netočí", „plivou si do dlaní", kávové šálky — a dvě systémové věci: **smyslový
posun** (sluch, pach, vibrace) a **osobní konvence** (práce posádky neosobně
„někdo", znalost hráče 2. os. mn. „poznáte"), která drží 19/19 bez výjimky.

**Nález, který review vyrobilo mimochodem a je horší než jak byl nahlášen:**
testér označil `brody-konfrontace` „vjezd zavírá **něco**, co se odtud musí
dostat" za abstrakci místo předmětu (porušení kanálu 1). Při kontrole proti
`text` je to ale **falešná poptávka** (porušení pravidla B, tedy tvrdé podmínky
§3.0/2): nástrojový slot toho uzlu je *„Najít, kudy ujet"*, ne odklizení
překážky z mostu. Telegraf si tedy vymyslel práci, která ve slotech není. Po
pravidle 1b je kotvou stejně útok („probít se vpřed") a druhý nárok musí mluvit
o **cestě ven**, ne o odklízení mostu.

### 3.5 Dokončovací kolo — finální sada (2026-07-30)

**Rozsah se při opravě rozšířil, a je to nález, ne bobtnání.** Šel jsem opravit
dvě věty (§3.4) a při čtení každého záporu proti *všem* slotům — včetně skrytých —
jsem našel **tři další porušení téže třídy**. Anti-tell o reálném slotu tedy
nebyl výjimka, byl to **vzor: 4 z 19**.

| uzel | co bylo špatně | třída |
|---|---|---|
| `privoz-celnik` | „na řeč o svatbách je zvyklý" — `improvizace` JE viditelný slot (kotva 4) | anti-tell |
| `mesto-ulicka` | „Domluvit se s nimi nejde" — `improvizace` JE viditelný slot (kotva 4) | anti-tell |
| `nadrazi-noc` | „jméno každého, kdo tu má co dělat, zná zpaměti" — `improvizace` JE viditelný slot (kotva 3) | anti-tell |
| `urednik-vaha` | „Chce listinu…, a razítko…" — dvě další poptávky přes NPC-přání | implicitní pokrytí |
| `farmar-brod` | „nahlas počítá, co mu patří za škodu" — `hodnota` je slot, tedy nepřiznaný druhý nárok mimo registr | implicitní pokrytí |
| `brody-konfrontace` | „dostane z vjezdu to, co ho zavírá" — slot je *„Najít, kudy ujet"* | falešná poptávka |

**Proč to vzniklo trojmo:** všechny tři anti-telly míří na `improvizace` — a to
je stat, který se v próze nejsnáz vylučuje („mluvit nepomůže", „na řeči nedá"),
protože je to jediný stat, jehož poptávka je *nepředmětná*. Zápor o improvizaci
je proto **nejlevnější věta, kterou autor napíše, a nejdražší chyba, kterou
udělá**: `improvizace` je nárokem v 9 z 12 npc scén.
→ **Do invariantu doplněno provozní pravidlo** (viz níže): zápor se nekontroluje
podle toho, co říká, ale **vyjmenováním všech pěti statů uzlu** a odškrtnutím,
který z nich není v žádném slotu. Jinak se to nenajde.

**Druhá věc, kterou dokončovací kolo muselo udělat:** sada z opravného kola
používala **verdikty ve znění D49**, kdežto invariant v3 mezitím zafixoval
**nové normativní paradigma** („Zbraň … na očích …, potají …"). Nechat to být
by znamenalo zapéct sadu, která porušuje vlastní právě dopsaný invariant — přesně
mrtvá litera z poučení D49. Verdikty jsou proto přepsané u všech 19.

**Vráceny dva chráněné obrazy z 1. kola** (ztracené mou procesní chybou):
„proud pod koly přerovnává kameny" (`farmar-brod`) a **kávové šálky**
(`rival-parley`).

**Jeden dobový nález testéra se v tomto kole VĚDOMĚ neopravuje** a jde do
backlogu: `urednik-razitko` má v telegrafu „V celnici", což testér označil za
institucionálně sporné (domácí trasa Buffalo → New York celnici neřeší) a navrhl
„v úřadovně". Jenže **`nazev` toho uzlu je „Celnice v Albany"** a `nazev` se
zobrazuje na mapě a dosazuje do protokolu jako `{uzel}`. Kdybych opravil jen
telegraf, mapa a próza si začnou protiřečit — a `nazev` je pole mimo rozsah
telegrafního kola. **Oprava je jednořádková, ale patří do kola, které smí sáhnout
na `nazev`** (nebo do přesunu uzlu do Buffala, což testér označil za tematicky
nejlepší a co je designová změna). Poloopravu nedělám.

#### Finální znění — `obsah/situace.yaml`

1. **`farmar-brod`** · kotva `nastroj` · verdikt C
   > Vůz sedí v brodě po nápravy a na břehu už čeká farmář s vidlemi. Postraňky jsou zpuchřelé; někdo je bude muset sešít, než koně vůz vytrhnou. Proud pod koly přerovnává kameny. Ty vidle se zvednou bez ohlášení a dál to bude o rychlosti. Zbraň na očích tu všechno pokazí, potají může rozhodnout.
2. **`farmar-stodola`** · kotva KOMBI · zápor hodnoty + povinný zápor útoku · verdikt A
   > Statkář za nocleh nechce ani dolar a bít se tu nebude s kým. U vrat leží jeho smečka a nespí; seno za nimi je vlhké až k trámům. Vrata bude muset někdo zaklínit a zároveň podepřít tím, co leží po ruce. Lucerna projde kolem stání jedinkrát a mimo její světlo se stodola nedá přečíst. Zbraň tu nikdo neřeší, ani na očích.
3. **`deputy-mytnice`** · kotva `hodnota` · 2. nárok `improvizace` · verdikt C
   > U mýtné boudy natahuje zástupce šerifa ruku po silničním poplatku a sazbu si určuje sám; vysolit ji bude muset někdo z posádky. Jiný zatím odvede řeč k pumpě, která na dvoře netočí ani kapku. Ruka mu sjede z bloku pokut níž a bude to o pěstech. Zbraň na očích tu všechno pokazí, potají může rozhodnout.
4. **`deputy-hlidka`** · kotva `nastroj` · verdikt C
   > Postarší strážník stojí vozem napříč silnicí a leští si odznak. Na zadním kole se cestou uvolnily matice a někdo je dotáhne, nebo se dál nepojede. Strážník si zatím prohlíží tabulku vozu, číslo po číslo. Odznak dopadne zpátky na kapsu dřív, než kdo domluví. Zbraň na očích tu všechno pokazí, potají může rozhodnout.
5. **`most-prohnila-prkna`** · kotva KOMBI · povinný zápor útoku · verdikt A
   > Příjezd na most přes Mohawk drží zrezivělá závora, kterou roky nikdo nezvedl, a bít se tu nebude s kým. Prkna za ní jsou prohnilá: bude je třeba přibít a zároveň podložit něčím, co leží po ruce. Uprostřed zeje díra a pod ní jde řeka. Jedno prkno povolí, až bude pozdě couvnout. Zbraň tu nikdo neřeší, ani na očích.
6. **`privoz-celnik`** · kotva `nastroj` · **OPRAVENO** · verdikt C
   > Prám se odlepil od břehu a celník obchází náklad s nosem u plachty. Bedny se bez páky z dohledu nehnou a někdo se do toho musí dát dřív, než celník dojde na konec. Pod podlahou duní stroj a paluba je od stříkající vody klouzavá. Plachta sklouzne sama a pak jde o to, kdo se pohne dřív. Zbraň na očích tu všechno pokazí, potají může rozhodnout.
7. **`rival-prepad`** · kotva `utok` · verdikt C
   > Napříč silnicí stojí vozy konkurence a chlapi z nich vystupují jeden po druhém. Někdo se do nich musí opřít dřív, než se srovnají do řady. Vpředu si jeden zapaluje, druhý si plive do dlaní. Jeden z nich si beze slova omotá dlaň řemenem. Zbraň na očích tu všechno pokazí, potají může rozhodnout.
8. **`rival-parley`** · kotva `hodnota` · **šálky vráceny** · verdikt C
   > V zadní místnosti nalévá hostitel kořalku do kávových šálků a za jeho zády stojí tři stíny. Na stůl bude muset přijít něco, co má cenu. Na stole je pořád plno a nikdo nepije. Sklenka dopadne na desku tvrdě a ruka pod stolem bude blíž než ta na stole. Zbraň na očích tu všechno pokazí, potají může rozhodnout.
9. **`urednik-vaha`** · kotva `utok` · zápor `hodnota` · **OPRAVENO** · verdikt D
   > U silniční váhy sedí úředník s předpisem na všechno a peníze si vzít netroufne. Před sebou má od rána prázdnou knihu a brýle si sundává jen na váhu. Zvýšit na něj hlas tak, aby ho to zvedlo ze židle, bude muset někdo z posádky. Ručička váhy se zastaví jinde, než má, a řekne se to až pozdě. Zbraň na očích tu jen popudí a potají nezmůže nic.
10. **`urednik-razitko`** · kotva `nastroj` · verdikt D
    > V celnici stojí fronta až ke dveřím a od vedlejší přepážky doléhá dopadání razítek. Nákladní list nese otisk, který v knize není, a dorazit ho bude muset někdo kusem korku. Úředník listuje pomalu a mračí se. V listině zůstane prázdné políčko a všimne si toho až on. Zbraň na očích tu jen popudí a potají nezmůže nic.
11. **`mesto-houkacky`** · kotva `nastroj` · **2. nárok ŠKRTNUT** · povinný zápor útoku · verdikt A
    > Ulicemi houkají hlídkové vozy a chodníky praskají ve švech; s houkající hlídkou se nikdo nebije. Vůz bude muset někdo protáhnout průjezdem, kam se sotva vejde. Nad hlavami bouchají okna a na rohu stojí strážník s píšťalkou. V jednom okně se rozsvítí ve špatnou chvíli a světlo padne přes celý chodník. Zbraň tu nikdo neřeší, ani na očích.
12. **`mesto-ulicka`** · kotva `utok` · **OPRAVENO 2×** · verdikt D
    > Ulička končí zdí a v ústí stojí dva strážníci. Vyjet na ně zostra bude muset někdo z posádky. Obušky mají zavěšené na zápěstí a jeden z nich si stoupá tak, aby byl vidět z ulice. Lampa nad hlavami zhasne a tma spolkne i konec uličky. Zbraň na očích tu jen popudí a potají nezmůže nic.
13. **`nadrazi-vypravci`** · kotva `utok` + `stitek_citlivy` · `improv_skryte` · verdikt D + append na kotvu
    > Výpravčí stojí před vagonem a chce nákladní list, který nikdo nemá. Zatlačit na něj nahlas bude muset někdo z posádky. Závora u rampy je spuštěná a za ní čeká vagon s otevřenými dveřmi. Listina zůstane bez čísla a spraví to leda historka na místě. Zbraň na očích tu jen popudí a potají nezmůže nic — ale zatlačit s ní nahlas je tady jediné, co zabere.
14. **`nadrazi-noc`** · kotva `nastroj` · **OPRAVENO** · číslovka „dvakrát" · verdikt B
    > Na odstavné koleji v Peekskillu se mezi vagony pohupuje lucerna nočního hlídače. Zámek na dveřích vagonu po dobrém nepovolí a někdo ho bude muset vypáčit. Hlídač si pohvizduje a lucernou zajíždí i pod vagony. Potmě se to na štěrku pokazí dvakrát, pokaždé jinak, a z jednoho padne rána. Zbraň tu nikdo neřeší a potají se vyplatí.
15. **`zatah`** · kotva `utok` (pr. 1b) · **OPRAVENO** · verdikt A
    > Silnici přehrazují hlídkové vozy nárazník na nárazník a za nimi stojí chlapi s puškami. Prorazit se bude muset někdo z posádky, dokud to nepovolí. Za blokádou stojí druhá řada vozů a postranní ulice se zavírají jedna po druhé. Reflektor se stočí právě na vůz a zůstane na něm. Zbraň tu nikdo neřeší, ani na očích.

#### Finální znění — `obsah/pronasledovatele.yaml`

16. **`malone-lecka`** · kotva `improvizace` · kanál 7 = zápor · verdikt C
    > Na mostě u Poughkeepsie stojí Malone s fotografií v ruce a na peníze neslyší. Někdo si k té fotografii bude muset vymyslet jméno, které mu Malone uvěří. Krajnice u zábradlí je úzká a federál od ní neuhne ani o krok. Malonovi zajede ruka pod kabát a od té chvíle je řeč zbytečná. Zbraň na očích tu všechno pokazí, potají může být to jediné, co pomůže.
17. **`malone-konfrontace`** · kotva `utok` (pr. 1b) · 2. nárok `obrana` · verdikt B
    > Kolona federálních vozů svírá silnici z obou stran a Malone si beze spěchu nasazuje brýle; na peníze neslyší. Ven se někdo musí probít silou. Druhý u toho vydrží první salvu vestoje. Jeden z vozů popojede a zavře poslední mezeru mezi blatníky. Zbraň tu nikdo neřeší a potají se vyplatí.
18. **`brody-lecka`** · kotva `improvizace` · 2. nárok `hodnota` · verdikt C + Brodyho append
    > Silnici přehrazuje Brodyho valník a kolem se tlačí parta nadšených občanů. Dav musí někdo uklidnit dřív, než se rozjede sám. Vedle toho šerifovi někdo připlatí za shovívavost. Z davu přiletí kámen a dál se to řeší rukama. Zbraň na očích tu všechno pokazí, potají může rozhodnout — a u Brodyho přitáhne každá dvojnásob pozornosti.
19. **`brody-konfrontace`** · kotva `utok` (pr. 1b) · **2. nárok ŠKRTNUT** · **OPRAVENO 2×** · verdikt A + Brodyho append
    > Brodyho muži tlačí kolonu k zavřenému mostu a šerif si sundává klobouk. Vpřed se někdo musí probít silou. Vozy za nimi dojíždějí jeden po druhém a poslední mezera se zavírá. Most dutě zaduní pod prvním vozem, který na něj vjede. Zbraň tu nikdo neřeší, ani na očích — a u Brodyho přitáhne každá dvojnásob pozornosti.

**Registr druhého nároku (3 z 19, kvóta ≤ 6):** `deputy-mytnice` ·
`malone-konfrontace` · `brody-lecka`. *(Ze pěti na tři: `mesto-houkacky`
a `brody-konfrontace` druhý nárok pozbyly po zpřesnění V-6 na „všechny viditelné
STATY" — u prvního by po dvou nárocích nezůstal odhalení žádný nový stat, u druhého
byl navíc statově dvojznačný.)*

**Verdikty:** 4 buňky → **4 doslovná znění** (A 5× · B 2× · C 8× · D 4×), plus
2 appendy. Rozpad z 11 znění na 1 znění na buňku. Buňka C dostala po re-review
kratší a souřadné znění („potají může rozhodnout", 57 zn. proti 71) — byla to
jediná ze čtyř se vztažnou větou a rozdíl C↔D teď leží na obou slovesech, ne na
posledních třech slovech.

### 3.6 Čtvrtý průchod (po re-review) — co se změnilo a proč se ANI TEĎ nezapéká

**Oba recenzenti dali „ZAPÉCT PO OPRAVÁCH", ne „ZAPÉCT".** Verze výše je po
zapracování všech jejich nálezů, ale **je to opět neodrecenzovaná verze** —
a přesně před tímhle kritik varoval: *„nedělej čtvrtý průchod typu »opravím dvě
věty«, dokud pravidlo nebude v invariantu. Poslední dva průchody rozbily právě
ten uzel, který opravovaly."*

**Rozdíl proti předchozím průchodům je ale podstatný: tentokrát jsou pravidla
zapsaná PŘED texty**, ne po nich. Kritikův nález č. 1 odhalil, že jsem opravoval
**gramatickou formu, ne třídu chyby**:

| co jsem si myslel, že opravuji | co to ve skutečnosti bylo |
|---|---|
| „zápor o improvizaci" (4 uzly) | **operátor výhradnosti u jediného nároku** — `jen`, `jedině`, `dokud`, `jinak` |
| kontrola: vypsat pět statů a najít, který vylučuji | výčet to **NENAJDE**: autor po pravdě odpoví „nevylučuji žádný stat", protože gramaticky je to **nárok** |

Pod POKRYTÍM byla výhradnost neškodná ozdoba (všechny poptávky byly vyjmenované).
Ve v3 mění **absenci nároku, která nemá znamenat nic, na explicitní zápor o všech
nepojmenovaných slotech**. Dopadalo to na 4 uzly — a dva z nich (`urednik-vaha`,
`mesto-ulicka`) jsem v předchozím průchodu „opravil" tak, že jsem tam výhradnost
**přidal**. `urednik-vaha` je teď opravovaný potřetí: verze 1 dávala *příliš*
informace, verze 2 *špatnou*, verze 3 (výše) žádnou navíc.

**Nová pravidla v invariantu (§2), bez kterých by byl pátý průchod stejně slepý:**
1. **ZÁKAZ VÝHRADNOSTI** u věty nároku + povolená výjimka (výhradnost vztažená
   k *nástroji* té jedné práce: „bez páky se nehnou", „po dobrém nepovolí").
2. **SMĚROVÝ TEST** na každou větu, ne jen na zápory: *„zvýší, nebo sníží tato věta
   ochotu committnout kartu na stat X?"* — každé *sníží* u statu, který v nějakém
   slotu je, je porušení bez ohledu na gramatiku. Tenhle test najde všechny čtyři.
3. **`zbran_skryte` se v předzvěsti neopakuje** (verdikt ho nese doslova v B a C —
   dvojí kódování konstanty u 10 z 19; týž argument jako u číslovky v N-1).
   `improv_skryte` povinný zůstává (v žádném verdiktu není, nese ho jediný uzel).
4. **V-6 zpřesněno na „všechny viditelné STATY"**, ne sloty — commit se dělá po
   statech, takže `mesto-houkacky` (improvizace/nastroj/improvizace) bylo po dvou
   nárocích vyčerpané a odhalení nemělo co odhalit.
5. **Append slotové výjimky se váže na NÁROK KOTVY**, ne na osobu — jinak nemá
   rozlišovač scope a stůl ho čte jako odvolání verdiktu. Dřívější znění
   („jednomu z nich bouchačka…") je zrušené: „nich" mířilo na role, které POKRYTÍ
   škrtlo, a „bouchačka" porušovala jednotný registr tři odstavce nad sebou —
   **invariant si odporoval sám, proto ho sada tiše nedodržovala.**

**Dále zapracováno z re-review** (bez nároku na pravidlo): věcná chyba
„přepřáhnout postraňky" → „sešít" (přepřahují se koně, ne postraňky — a celý uzel
stojí na koních) · „Most dutě zaduní tam, kde to nikdo nečekal" → „pod prvním
vozem, který na něj vjede" (epistemický verdikt vypravěče v minulém čase) ·
`urednik-vaha` dlouhé souvětí s vsuvkou → „od rána prázdnou knihu" (−20 zn.) ·
`nadrazi-noc` elipsa bez slovesa → „z jednoho padne rána" · `mesto-ulicka` anafora
mířící na zeď → „v ústí stojí dva strážníci" · „ačkoli" (jediné knižní slovo
v sadě) → „a" · figura „bez varování/bez ohlášení/ve špatnou chvíli" sražena ze 3×
na 2× · „beze spěchu/beze slova" ze 3× na 2× · „Jiný zatím" ze 3× na 1× ·
`farmar-stodola` vrácena půlvěta předzvěsti, která jediná nesla „něco se pokazí" ·
`privoz-celnik` „prám se odráží od břehu" × „pod podlahou duní stroj" (odpichovaný
prám nemá motor) → „odlepil od břehu" · vráceno „nárazník na nárazník" do `zatah`.

**Co ZŮSTÁVÁ otevřené a proč to nezavírám sám:**

- **Délky se musí přeměřit.** Kritik odhaduje, že čtvrtý průchod ubral obraz
  v 9 uzlech a průměr spadl k ~300–310 (měření třetího průchodu dalo 319,5).
  Numericky by pásmo 280–360 prošlo, ale **kvalitativní půlka mandátu D51
  („uvolněné místo jde do obrazu") ne** — a to je přesně ta otázka, na kterou
  předregistrace odpověď nemá. **Rozhoduji ji teď, aby nebyla zpětná:** vyjde-li
  průměr **pod 315 znaků, sada se nezapéká** a uvolněný rozpočet se dopisuje do
  obrazu. Škrtací kolo nesmí skončit tím, že se ušetří znaky.
- **Adjudikace skeletonu nároku:** rám „někdo … musí / bude muset" je teď
  v 17 z 19. **Není to vada, je to audio-značka nároku** — táž funkce jako razítko
  verdiktu: ve v3 je jediný nárok a tenhle rám je to, čím ho posluchač pozná.
  Zapisuji to výslovně, aby to příští kolo „neopravilo" a nerozbilo jedinou
  sluchovou značku, kterou nárok má. **Strop 2× se na něj nevztahuje** (jako
  u verdiktu).
- **Amendment předregistrace, přiznaný jako amendment:** kritérium §3.0/3 znělo
  „druhý nárok ani jednou u léčky/konfrontace". Finální sada tam má 2 z 3
  (`malone-konfrontace`, `brody-lecka`). Změna je zdůvodněná (N-2 + srostlá forma
  kanálu 7), ale **je to posunutá branka a hlásí se tak**, ne jako „PROŠLO".

**Můj návrh dalšího kroku (rozhodnutí uživatele, ne default):** jedno **měřicí**
kolo (délky) + **jedna cílená kontrola směrovým testem** na všech 19 od kritika —
ne nová recenze prózy, ale mechanická aplikace pravidla, které teď existuje.
Teprve pak zapečení. Alternativa, kterou nedoporučuji: zapéct tuhle verzi
a spolehnout se, že pravidla jsou nová a texty psané už podle nich.

---

### 5.4 Re-review před zapečením (2026-07-30) — oba recenzenti: ZAPÉCT PO OPRAVÁCH

**`design-critic`, tři kritické nálezy — všechny přijaty:**

1. **Exkluzivita nároku zapírá reálné viditelné sloty (4 z 19).** *„Neopravil jsi
   třídu chyby, opravil jsi její jednu gramatickou formu."* Doloženo scénářem
   u stolu: `urednik-vaha` říkal „peníze si vzít netroufne" + „neustoupí, dokud na
   něj někdo nezvýší hlas" → racionální stůl committne útočné karty a po odhalení
   vidí *Podstrčit papíry* (improvizace 4) a *Doložit razítko* (nastroj 4), na které
   nemá nic. **To je doslova stížnost, která tohle kolo otevřela** — a oba
   předchozí fixy toho uzlu ji zhoršily. → **ZÁKAZ VÝHRADNOSTI + SMĚROVÝ TEST**
   v invariantu, 4 věty přepsané.
2. **Append slotové výjimky byl v invariantu rozbitý** — „jednomu z **nich**"
   nemá ve v3 antecedent (POKRYTÍ škrtlo vyjmenované role) a „bouchačka" porušuje
   jednotný registr tři odstavce nad sebou; **invariant si odporoval sám, proto ho
   sada tiše nedodržovala.** A na mou obavu odpověděl přesně: stůl to přečte jako
   chybu ne kvůli protimluvu, ale protože druhá klauzule nemá **rozlišovač scope**
   → čte se jako odvolání verdiktu. → append se váže **na nárok kotvy**.
3. **`zbran_skryte` vypadl z předzvěsti u 2 uzlů** — ale místo doplnění kritik
   správně ukázal, že je to **dvojí kódování konstanty**: verdikt ho nese doslova
   v buňkách B a C, tedy 10 z 19 uzlů platí ~25 znaků za informaci, kterou vzápětí
   zopakuje razítko. → **požadavek škrtnut** (týž argument jako u číslovky v N-1);
   `improv_skryte` povinný zůstává.

**Vážné:** ubraný obraz v 9 uzlech (→ povinné přeměření + předem stanovená hranice
315 zn.) · nový skeleton „někdo musí/bude muset" 17 z 19 (→ **adjudikováno jako
audio-značka nároku**, ne vada, po vzoru razítka verdiktu) · V-6 mělo díru
(„sloty" místo „staty" → `mesto-houkacky` prošlo literou, ne duchem) · 5 drobných
(vrácená předzvěst `farmar-stodola`, „odpichovaný prám nemá motor", statově
dvojznačný druhý nárok u `brody-konfrontace`, figura „beze spěchu" 3×, amendment
předregistrace u léček).

**Co kritik potvrdil bez výhrad:** mřížka verdiktu 19/19 doslovně a jedno znění na
buňku (ověřeno typ → `chovani_dle_typu` → `zbran_skryte` uzel po uzlu), povinné
zápory útoku u všech tří, registr odpovídá textům, `nadrazi-noc` má jeden nárok,
anti-telly o improvizaci skutečně pryč.

**A nejcennější věta celého re-review**, kterou přijímám i jako procesní pravidlo:
*„Vyjmenování pěti statů je nutné, ale nedostatečné — a zákaz záporu problém
neřeší, jen ho odstíní. Ty čtyři nálezy nejsou zápory, gramaticky jsou to nároky.
Tvá procedura by je odškrtla jako čisté."*

**`protocol-humor-tester`, tři blokující — všechny přijaty:** verdikt C byl jediný
ze čtyř se vztažnou větou (71 zn. proti 35/42/50) → zkráceno na *„potají může
rozhodnout"* (57 zn.), a rozdíl C↔D tím přestal ležet na posledních třech slovech ·
věcná chyba „přepřáhnout postraňky" (přepřahují se koně) → „sešít" · „Most dutě
zaduní tam, kde to nikdo nečekal" = epistemický verdikt vypravěče v minulém čase
→ „pod prvním vozem, který na něj vjede". Plus tři čtivostní přepisy, dvě figury
nad kvótou a nález, že **2. osoba („poznáte") zmizela z celé sady** jako důsledek
nového pravidla o neosobní předzvěsti — vědomé, zapsané, ať to příští kolo
„neopraví" zpátky.

**Testér zároveň potvrdil, že doslovnost verdiktů funguje** (*„čte se jako refrén
telegrafního úředníka právě proto, že je v pevné koncové pozici"*) a že z jedenácti
chráněných obrazů drží devět, dva jsou nahrazené lépe.

---

## 5.3 Proč se nezapékalo v prvním kole, i když oba recenzenti řekli „ano s úpravami"

Oba verdikty se vztahovaly k **jiným artefaktům**, než jaký by se dnes zapékal:
kritik recenzoval **specifikaci** (a ta je hotová, všechny tři blokující nálezy
zapracované), humor-testér recenzoval **1. verzi sady** (a všech pět jeho
blokujících nálezů je opravených). **Sadu, která leží na stole teď, neviděl ani
jeden z nich** — a já v ní našel dvě porušení tvrdé podmínky.

Zapéct ji by znamenalo obejít proces v tom jediném bodě, kde ho mandát D51
formuloval nejtvrději („do `obsah/` zapiš AŽ PO shodě recenzentů"). Navíc by to
podruhé zopakovalo chybu, kterou jsem v tomhle kole sám nahlásil: **odškrtnout
podmínku, o které jsem předem napsal, že projde.** Nezapékám.

**Co to nestojí:** invariant, měření, consistency opravy a celé znění sady jsou
zapsané, takže další kolo začíná u diffu dvou vět, ne u prázdného papíru.

**Jak to dopadlo (dopsáno po dokončovacím kole):** ten gate se vyplatil. Při
opravě těch „dvou vět" se ukázalo, že porušení je **šest, ne dvě** — čtyři
anti-telly, jedna falešná poptávka a jeden nepřiznaný druhý nárok (§3.5). Sada,
kterou bych byl v prvním kole zapekl „protože recenzenti řekli ano", by tedy nesla
čtyři místa, kde próza aktivně odvádí od správné karty. **Předregistrovaná tvrdá
podmínka zachytila věc, kterou nenašel ani jeden ze dvou recenzentů** — a je to
nejlepší doklad, proč se kritéria píšou naslepo předem.

---

## 6. Consistency opravy

### 6.1 Zapsáno rovnou (D51 bod 3 — mandát to výslovně zadal)

1. **`design-dokument.md` §4.10 — škrtnutý cíl `mozek-operace` jako inzerovaný
   příklad. OPRAVENO.** Třetí příklad tajného cíle („polda tě označí za mozek
   operace") nahrazen zapečeným `schovana-bouchacka` („ať tvoje železo zapracuje
   tam, kam nikdo nevidí"). Zároveň upřesněna navazující věta: sada je **celá
   mechanicky ověřitelná** (všech 8 cílů má `overeni_typ: mechanicky`), a čistě
   textový cíl je vize podmíněná tím, že vstup promptu nese informaci o osobách —
   dnes ji nenese (osoby jsou „podezřelý A–D"), proto byl D42 škrtnut.
   *Proč to vadilo:* vize inzerovala jako příklad přesně ten typ cíle, který
   obsahová vrstva zamítla jako strukturálně nesplnitelný.
2. **`prototyp-mvp.md` §„Záměrně MIMO rozsah v3 MVP" — „volba obtížnosti".
   SLOUČENO.** Položka změněna na **„plná volba obtížnosti (easy/normal/hard,
   D25d)"** a doplněna výslovná výjimka: kolonka **Obtížnost** na setupu v MVP
   **je**, obsahuje výhradně přepínač *Ulehčení: rozbor telegrafu na rozklik*
   (D50), a je zároveň prázdný rám pro D25d. Připsán i důvod pojmenování
   (se zapnutým rozborem jde 4p win-rate na 86,8 %, D48 — je to obtížnost,
   ne kosmetika).
   *Proč to vadilo:* sekce „Záměrně MIMO rozsah" je scope obrana, kterou má
   Claude dle CLAUDE.md aktivně hájit. Položka, která je už postavená, z ní dělá
   kulisu a příští přírůstek si nikdo nevšimne.
3. **Jednotka délky v invariantu. DOPLNĚNO** (§2, blok ROZSAH, JEDNOTKA A TEMPO)
   — `String.length` nad naparsovaným řetězcem, ne bajty, ne accent-fold; plus
   výsledek přeměření a poznámka, že sada D49 byla měřena správně (§4.1).

### 6.2 Připraveno, ale ZÁMĚRNĚ nezapsáno — čeká na zapečení v3 (nebo na PM)

**Oba kanonické dokumenty tvrdí o telegrafu něco, co po v3 přestane být pravda.**
Je to zároveň starší otevřený nález (D47 §7/1, konceptové kolo §10/2: kanon říká
3 kanály, engine derivuje 6 a obsah po D49 nese 6 + kanál 7), který D47 doporučil
poslat **vlastním commitem**. Mandát D51 tuhle opravu nezadal, takže ji **nepíšu
naslepo** — ale znění je hotové a patří do TÉHOŽ commitu jako zapečení v3, jinak
by v repu vznikl kanon popisující zrušené pravidlo:

- **`design-dokument.md` §3 krok 1 (ř. 107–108).** Dnes: *„Sděluje trend (jaké
  staty situace nejspíš chce) i kolik rolí půjde »proti srsti«."*
  Navrhované znění: *„Sděluje **jednu** práci, kterou to místo chce — tu pro
  scénu charakteristickou, typicky takovou, kterou by hráč z typu uzlu neuhodl —
  dále **předzvěst**, že něco půjde »proti srsti«, a **verdikt o zbrani** (snese
  to místo železo na očích?). Zbytek rolí se pojmenuje teprve při odhalení
  textu."*
  *(Formulace záměrně neříká „odchylka od typového trendu" jako pravidlo: po
  nálezech B-1 a V-3 platí odchylka jen u `npc` a `lokace`, kdežto u finále
  rozhoduje viditelný útok-slot a u léček to, co dává scéně jméno. Kanonický
  dokument má nést smysl, ne rozhodovací tabulku — ta patří do hlavičky obsahu.)*
  *Proč to vadí:* kdo bude psát obsah podle kanonu, obnoví škrtnuté POKRYTÍ.
- **`prototyp-mvp.md` §Předpoklady simu (ř. 91–93).** Dnes: *„Telegraf: signál
  (`trend`, `proti_srsti`, `zbraň_projde`) derivuje engine ze slotů."*
  Navrhované znění: *„Telegraf: engine derivuje ze slotů **šest** kanálů
  (`trend`, `proti_srsti`, `zbran_projde`, `zbran_skryte`, `improv_skryte`,
  `zbran_slot_vyjimka`; `resolve.js`), próza je lidský rendering s QA invariantem
  věrnosti a **od v3 (D51) nese jen podmnožinu: jednu kotvu + předzvěst +
  verdikt** — próza tedy říká **méně** než signál, což je vědomá odchylka
  ve prospěch čitelnosti, ne drift. Fidelita telegrafu `p` = sweep knob;
  **pozor, model aplikuje `p` per roli uniformně, takže asymetrii v3 (jistota na
  jedné roli, nula na třech) nemodeluje — horní mez hodnoty prioru dává rameno
  `memorizacni`.**"*
  *Proč to vadí:* bez poslední věty se z fidelitní tabulky budou dál dovozovat
  balanční tvrzení, která kritik v konceptovém kole zamítl (K-2). Formulace
  „neumí modelovat ani jedním směrem" je **vyškrtnutá** — kritik doložil
  (nález V-2), že jedno rameno existuje a měří limitní případ.
- **`prototyp-mvp.md` ř. 65–66 — mrtvé číslo K4d.** Kanon cituje *„K4d (9,1 b.,
  ale 3p jen 7,9)"*, což je hodnota z ramene `optimal`, kdežto gate je definován
  na rameni `kompetentní` (dnes 1p 18,6 · 2p 22,1 · 3p 24,6 · 4p 22,8; přeměřeno
  PM v D47 §9). *(Otevřený nález D47 i konceptového kola §10/3, stále v textu.)*
  *Proč to vadí právě teď:* §1.1 tohoto reportu se o rezervu 18,6 b. **opírá**
  jako o argument, že brána škrtu nebrání. Dokud v kanonu stojí 7,9, čte se týž
  argument jako těsný pass a někdo z něj vyvodí brzdu, která neexistuje.

**Žádost na PM (procesní, od kritika a připojuji se k ní):** tenhle nález je
„připravený, nezapsaný" **potřetí** (D47 §7/1 → konceptové kolo §10/2 → sem).
Slib v pracovním souboru, který bude nahrazen dalším pracovním souborem, selhal
už dvakrát. Ať se zapíše do `projekt/stav.md` jako **blokátor commitu zapečení
v3**, ne jen jako řádek v backlogu. Já do `stav.md` nezapisuji (drží ho PM).

### 6.3 Kód: v3 nevyžaduje ani řádek změny (ověřeno)

- `deriveTelegrafSignal` (`resolve.js:260–283`) derivuje signál **ze slotů**, ne
  z prózy — v3 na sloty nesahá, takže **derivovaný signál se nemění**. Bot čte
  totéž co dřív; kontrafaktuál přes `CONTENT_DIR` je u téhle změny no-op.
- Onboarding text v `commit.js:139` už dnes říká přesně to, co v3 slibuje:
  *„Dál si telegraf čtete sami — a role vám po commitu pojmenuje odhalení."*
  Smyčka „předzvěst → sázka naslepo → odhalení, které pojmenuje" je tedy v UI
  postavená, ne teoretická.
- Žádný test neasertuje délku ani obsah telegrafu (`prototyp/test/` — hledáno).
  Zapečení proto smí změnit jedině **golden snapshoty přes `verzeObsahu`**, jako
  u D49; jakýkoli jiný rozdíl v golden runu = chyba a zapečení se vrací.

### 6.4 Beze nálezu

Křížové odkazy v patičkách obou dokumentů jsou platné a vzájemné; škrtnuté směry
(Jackbox, tajné karty, AI balancování, product placement) nejsou ani v jednom
dokumentu uvedené jako aktivní funkce. Terminologie telegraf / předzvěst / kotva
/ nárok / položka je po v3 v obou dokumentech i v hlavičce obsahu shodná —
pod podmínkou, že projde oprava 6.2.

**Jedna nová položka do backlogu, která z tohoto kola vypadla** (není to
consistency nález, je to nález o obsahu a nezakrývá se prózou): `lecka`
i `konfrontace` mají ve viditelné trojici jen `improvizace`/`obrana`/`hodnota`
resp. `utok`/`improvizace`, takže u nich **neexistuje odchylka od typového
prioru** a pravidlo výběru kotvy tam degraduje na „co dává scéně jméno". Léčky
jsou přitom nejtvrdší uzly runu. Řešitelné jedině **slotem** (dát léčce do
viditelné trojice `nastroj` nebo `utok`) — patří k otevřenému nálezu D48
o statech, ne do tohoto kola.

**Druhá položka do backlogu (z dokončovacího kola):** `urednik-razitko` je
institucionálně sporný uzel — „celnice" na domácí trase Buffalo → New York.
Oprava se nedá udělat jen v telegrafu, protože `nazev` uzlu je „Celnice v Albany"
a zobrazuje se na mapě i v protokolu jako `{uzel}`. Buď se přepíše `nazev`
i telegraf na „úřadovnu", nebo se uzel tematicky přesune do Buffala (návrh
humor-testéra) — obojí je mimo rozsah telegrafního kola.

**Třetí, drobná:** paměťový záznam facilitátora `d51-final-19-delky.md` tvrdí,
že měřená sada „ještě nese dvě nová porušení ČISTOTY". To platilo pro §3.4,
ne pro §3.5, kterou měřil — tabulka v §3.5 vyjmenovává porušení, která už jsou
opravená. Za opravu vlastní paměti odpovídá facilitátor, hlásím to jen proto,
aby ten záznam příští session nemátl.
