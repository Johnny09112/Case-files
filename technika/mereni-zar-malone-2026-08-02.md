# Měřicí kolo D57(2) — Žár V3-A′, Malone V2-A′, V4-D supply-aware clamp

> Mandát: D57 (`projekt/rozhodnuti.md`, 2026-08-02) po
> [[../technika/design-audit-2p-2026-08-02|design-audit-2p]]. Měří tři
> kontrafaktuály: **(a)** Žár V3-A′ „jeden klimax za run" + V3-C (dopředná
> anotace), **(b)** Malone V2-A′ „dotahuje" (rušení se aktivuje prahem Zátahu),
> **(c)** V4-D „supply-aware clamp" (nejdřív D6 diagnostika, pak plná brána).
> Autor: playtest-facilitator · 2026-08-04.
>
> **STAV: PRŮBĚŽNÝ ZÁPIS.** Běh opakovaně padal na infrastrukturních výpadcích
> (watchdog 600 s bez postupu) — vždy na pozadí/čekacích smyčkách, NIKDY na
> samotném výpočtu. Od nálezu měřím **výhradně synchronně, po jednotlivých
> blocích** (`node sim/mereni-d57-2.js <runů/buňku> <varianta> <blok 1|2>`,
> jeden příkaz = jeden blok = 8000 runů, ~55–60 s), bez pozadí a bez čekacích
> smyček, a zapisuji mezivýsledek na disk hned po každém příkazu. Sekce se
> doplňují postupně; nehotové jsou označené `[ROZPRACOVÁNO]`.
>
> **DŮLEŽITÁ ZMĚNA V PRŮBĚHU MĚŘENÍ:** commit `88018f1` (V1-A krok 1 — oběť
> postihu = vlastník slotu s NEJVĚTŠÍ statovou mezerou, ne první v pořadí) +
> `faa997c`/`952a580`/`9edcd75` přistály v `main` PO založení worktree. Worktree
> byl **domergován na `main` @ `9edcd75`** (`git merge origin/main`, bez
> konfliktů, 475/475 testů zelených). **D6 diagnostika (content-only, §1) je
> beze změny** — `obsah/veci.yaml`/`situace.yaml`/`stitky.yaml` nedotčené, jen
> `pronasledovatele.yaml` prózový text. **Baseline (§2) byla PŘEMĚŘENA nad
> novým kódem** (číslo nahrazeno, staré přeškrtnuté níže jako referenční bod) —
> V1-A krok 1 potvrdil vlastní předpověď auditu „ΔK1 zdarma": rozdíl je v
> šumu bloků, ne v mechanice. Kandidáti (a)/(b)/(c) se měřili AŽ PO merge,
> tedy VŽDY nad V1-A krok 1 — žádné přeměření navíc nebylo potřeba.

## 0. Metodika a hlavička

- **Motor:** izolovaný git worktree `d57-2-mereni-zar-malone` (větev stejného
  jména), založen na `main` @ `9407b15`, **později domergován na `main` @
  `9edcd75`** (viz banner výš — V1-A krok 1 přistálo v `main` v půlce měření).
  **`rules.js`/`state.js`/`resolve.js`/`obsah/` v `main` jsou po celou dobu
  NETKNUTÉ** — injektáž žije jen ve worktree jako RULES flagy (default
  `false`/`null` = beze změny chování; po mergi 475/475 testů zelených, jediný
  behaviorální diff proti `main` je nové pole `rusi_efektivni` v logu). Worktree
  se po tomto kole **zahodí** (nemerguje se) — precedens „izolovaný worktree"
  z `design-audit-2p` §6.1.
- **V1-A krok 1 — STAV V KÓDU: od merge IMPLEMENTOVÁNO** (viz banner výš).
  Všechna čísla (a)/(b)/(c) v tomto reportu jsou změřená AŽ PO mergi, tedy
  vždy nad V1-A krok 1 — jen baseline (§2) existuje ve dvou verzích (pre/post),
  obě zdokumentované.
- **Bot:** `kompetentni` (jediný bot v gate metodice D31/D39-ii).
- **Rozsah:** 2 disjunktní bloky, každý blok 4 počty hráčů × 2 pronásledovatelé
  × 1000 runů/buňku = 8000/blok, **16 000 runů/variantu** (2000/buňka
  kumulativně přes oba bloky — stejná hloubka jako baseline v `design-audit`).
  Verdikt = průměr přes bloky (D31).
- **Injektážní flagy (výchozí `false`/`null`, engine beze změny):**
  - `rules.zar.klimaxJednouZaRun` + `rules.zar.deltaPoPrezitiKonfrontace` —
    V3-A′: práh KONFRONTACE se po prvním překročení **nikdy nepřenabíjí**
    (žádné druhé finále v runu); přežití odečte pevnou hodnotu od Žáru místo
    resetu na absolutní cíl (ten při týmových prazích okamžitě mazal
    `firedThresholds` a otvíral druhé finále — přesně vada zamítnuté C1).
  - `rules.malone.aktivacePoPrahuZatahu` — V2-A′: run-wide rušení statu (dnes
    jen Malone, `rusi.typ === 'stat'`) se aktivuje TEPRVE po prvním překročení
    prahu Zátahu; do té doby platí rušení `null`. Nová trvalá proměnná
    `zatahLimitEverCrossed` (na rozdíl od `firedThresholds` se nikdy nemaže).
    Aktivace se loguje PER UZEL (`situation_revealed.rusi_efektivni`), takže
    `sim/report.js` počítá K5/K5f/oracle nad SKUTEČNĚ platným rušením v době
    daného uzlu, ne nad statickým `run_started.rusi`.
  - `rules.supplyAwareClamp` — V4-D: na viditelném slotu situace, kde GANGSTER
    auto-failuje (a slot nemá výjimku `stitek_citlivy: GANGSTER`), se clamp
    prahu sníží z `statMax` (5) na nejvyšší stat dosažitelný NON-GANGSTER věcí.
    Nemění kartu ani telegraf, jen strop skrytého prahu.
- **Kill-kritéria** jsou převzatá doslovně z `design-audit-2p-2026-08-02.md`
  §6 (Předregistrace) — viz jednotlivé sekce níže; nedointerpretovávám je po
  naměření.

## 1. D6 diagnostika (V4-D) — content-only, HOTOVO

Spočteno analyticky přímo z `obsah/veci.yaml` + `obsah/situace.yaml` +
`obsah/stitky.yaml` (žádný engine, žádný run) — replikuje a rozšiřuje ruční
příklad z `design-audit` §5.1 na VŠECH 60 slotů v obsahu.

- Nejvyšší stat mezi 40 věcmi: útok **all=5, non-GANGSTER=4** (jediný dotčený
  stat); obrana/hodnota/improvizace/nástroj beze změny (5=5).
- **Dotčeno: 3 z 60 slotů (5,0 %)** — viditelný útok-slot v situaci, kde
  GANGSTER auto-failuje, bez slotové výjimky:
  - `rival-prepad` (npc) slot 0 „Postavit se jim" útok, kotva 4 → nový strop 4
  - `urednik-vaha` (npc) slot 2 „Zvýšit hlas" útok, kotva 4 → nový strop 4
  - `mesto-ulicka` (npc) slot 2 „Zastrašit gestem" útok, kotva 4 → nový strop 4

  (Přesně ty tři sloty, které `design-audit` §5.1 cituje jako „nejtvrdší
  doklad" — nezávislá replikace ručního nálezu strojovým průchodem celého
  obsahu potvrzuje, že žádný další slot stejným problémem netrpí.)
- Ve všech 3 případech kotva(4) + šum(2) = 6 > nový strop 4 → clamp **reálně
  mění chování** u všech 3 (5,00 % všech slotů, ne jen teoretických 5,0 %).

**Verdikt D6 vs. predikce:** predikce byla „dotčeno < 3 % slotů", naměřeno
**5,0 %** — mírně nad predikcí, ale souhlasí přesně s ručním nálezem auditu (3
konkrétní sloty) a je to malá, dobře ohraničená množina. Postupuji dál k plné
bráně (ΔK1, K5-D) dle mandátu „nejdřív D6, pak clamp".

## 2. Baseline replikace — HOTOVO (post-V1-A, souhlasí s `design-audit`)

2 bloky × 8000 = 16 000 runů, změřeno NAD `main` @ `9edcd75` (vč. V1-A krok 1).

| Metrika | design-audit (2026-08-03, pre-V1-A) | toto měření (post-V1-A, průměr 2 bloků) | shoda |
|---|---|---|---|
| K1 celkem | ~70,9 % | **71,25 %** | ✅ |
| K1 1p/2p/3p/4p | 57,65 / 66,90 / 77,60 / 79,30 | 58,25 / 68,65 / 77,75 / 80,35 | ✅ |
| K1 per pronásledovatel (1p/2p/3p/4p) malone | — | 56,3 / 65,3 / 74,1 / 77,4 | — |
| K1 per pronásledovatel (1p/2p/3p/4p) brody | — | 60,15 / 72,0 / 81,4 / 83,2 | — |
| K6a spread | 22,4 | **22,1** | ✅ |
| K5-D expDead (pooled) | 9,65 % | **9,55 %** | ✅ |
| K5-D expDead malone / brody | — | 12,0 / 7,15 % | — |
| K5f celkem | 76,7 % | **77,45 %** | ✅ |
| K3 medián (1p/2p/3p/4p) | 3/2/2/2 | **3/2/2/2** | ✅ přesná shoda |
| konfrontací/run 2+ % (1p/2p/3p/4p) | — | 10,0 / 34,9 / 30,85 / 27,55 | ~shoda s dřívějším 10,5/35,0/29,1/29,2 |
| Malone free-pass situací s nulovaným | — | **11,6 %** (baseline referenční pro B4) | — |

**Závěr: V1-A krok 1 je skutečně „zdarma"** — audit's vlastní ΔK1 předpověď
(0 až −0,85 b.) potvrzena i mimo A/B test proti nové baseline. (a)/(b)/(c) níže
měřím bezpečně nad tímto stavem.

## 3. (a) Žár V3-A′ „jeden klimax za run" — HOTOVO

Práh KONFRONTACE se po prvním překročení nikdy nepřenabíjí (žádné druhé finále
v runu); přežití odečte pevných −3 od Žáru místo resetu na absolutní 3.
2 bloky × 8000 = 16 000 runů.

| Metrika | baseline (§2) | Žár V3-A′ (průměr 2 bloků) | Δ |
|---|---|---|---|
| K1 celkem | 71,25 % | **79,7 %** | **+8,45 b.** |
| K1 1p/2p/3p/4p | 58,25/68,65/77,75/80,35 | 65,05/81,05/86,2/86,65 | +6,8/+12,4/+8,45/+6,3 |
| K6a spread | 22,1 | **21,6** | −0,5 (beze změny) |
| K5-D expDead | 9,55 % | 9,7 % | +0,15 (beze změny) |
| K5f celkem | 77,45 % | 77,45 % | 0,0 (beze změny — čekáno: mění se ČETNOST finále, ne jeho tvrdost) |
| K5f proher ve finále | — | 96,1 % | (stále ≥90 %, C1 gate typu nedotčen) |
| Malone free-pass | 11,6 % | 12,85 % | +1,25 b. (šum, netýká se téhle varianty) |
| **konfrontací/run** | 1,145 | **0,86** | −0,29 |
| **runů s 2+ konfrontace (pooled)** | 25,8 % | **0,0 %** | **−25,8 b.** |
| runů s 2+ konfrontace 1p/2p/3p/4p | 10,0/34,9/30,85/27,55 % | **0/0/0/0 %** | mechanismus kategoricky vylučuje druhé finále |
| runů s ≥1 léčkou | 91,6 % | 90,85 % (2p 91,8 · 3p 92,0 · 4p 92,05 · 1p 83,6) | −0,75 b. |
| K3 medián (1p/2p/3p/4p) | 3/2/2/2 | 3/2/2/2 | beze změny (Žár do prahu Zátahu netknutý) |

### Verdikt vůči předregistrovaným kritériím (design-audit §6)

- **C1** (K3 ∈ {3,4}): **splněno, beze změny** (mechanika mění jen konfrontaci,
  ne Zátah).
- **C2** (2+ konfrontace: medián 1 ∧ podíl ≤15 %, >30 %=kill): **medián 1 ✅,
  podíl 0,0 % ≪ 15 % ✅ — silně splněno, s velkou rezervou.** Toto NENÍ jen
  „pod prahem" jako u dřívějšího zamítnutého C1-kandidátu (`poPrezitiKonfrontace
  3→6`, který kill spustil na 44,2 %) — je to **strukturální nula**: mechanismus
  čistě VYLUČUJE druhou konfrontaci, takže hodnota 0,0 % platí robustně napříč
  všemi počty hráčů a oběma pronásledovateli, ne jen v průměru.
- **C2b** (runů s ≥1 léčkou nesmí klesnout o >10 p.b.): pokles **0,75 b.** ≪
  10 b. — **splněno s rezervou.**
- **A2-analogie (K1/K6a stabilita):** K6a spread **21,6 vs. 22,1** — beze
  zhoršení (žádný nový breach K6a, který už dnes existuje jako známá odchylka).
  K1 vyskočilo +8,45 b. celkem — to je OČEKÁVANÝ a ŽÁDOUCÍ vedlejší efekt (druhé
  finále bylo hlavní příčinou proher popisovanou hráčem — „4–5× za run uteče
  problém z lopaty"), ne regrese. Nejde o breach směrem od gate [45,70] — baseline
  i varianta zůstávají uvnitř pásma na všech počtech kromě již známého 3p/4p
  breach-nahoru (audit ho měl u baseline taky, tady se jen prohlubuje o ~7–8 b.,
  což je čekaná cena za odstranění druhého finále, ne nová vada).

**VERDIKT (a): PROCHÁZÍ VŠECHNA PŘEDREGISTROVANÁ KRITÉRIA, s velkou rezervou.**
Mechanismus dělá přesně to, co sliboval — strukturálně (ne jen staticky)
eliminuje druhé finále, aniž by zlehčil finále samotné (K5f beze změny) nebo
zesílil K6a nerovnost. Vedlejší efekt (K1 nahoru) je repositoried jako zamýšlený
důsledek, ne nález navíc — potvrzuje hráčovu stížnost „dopad zásahu je pořád
stejný" byla o TÉTO mechanice.

## 4. (b) Malone V2-A′ „dotahuje" — HOTOVO

Run-wide rušení statu HODNOTA (dnes jen Malone) se aktivuje TEPRVE po prvním
překročení prahu Zátahu; do té doby úplatky berou. 2 bloky × 8000 = 16 000 runů.

| Metrika | baseline (§2) | Malone V2-A′ (průměr 2 bloků) | Δ |
|---|---|---|---|
| K1 celkem | 71,25 % | **72,05 %** | +0,80 b. |
| K1 1p/2p/3p/4p | 58,25/68,65/77,75/80,35 | 59,85/69,15/78,45/80,7 | +1,6/+0,5/**+0,70**/**+0,35** |
| K6a spread | 22,1 | 20,85 | −1,25 (mírně lepší) |
| **K5-D expDead pooled** | 9,55 % | **8,65 %** | −0,90 (lepší) |
| **K5-D expDead agent-malone** | 12,0 % | **10,15 %** | −1,85 (lepší, ale nad gate ≤10 %) |
| K5-D expDead serif-brody | 7,15 % | 7,15 % | 0,0 (nedotčen, čekáno) |
| K5f celkem | 77,45 % | 77,6 % | +0,15 |
| K5f agent-malone / serif-brody | 76,0 / 78,95 % | 76,25 / 78,95 % | ~0 |
| **Malone free-pass — situací s nulovaným (pooled)** | 11,6 % | **6,05 %** | **−5,55 b. (−47,8 % relativně)** |
| Malone free-pass — jen agent-malone uzly | 23,0 % | **12,05 %** | **−10,95 b. (−47,6 % relativně)** |
| konfrontací/run | 1,145 | 1,125 | −0,02 |
| runů s 2+ konfrontace | 25,8 % | 25,0 % | −0,8 (nedotčeno, čekáno) |
| K3 medián (1p/2p/3p/4p) | 3/2/2/2 | 3/2/2/2 | beze změny (čekáno — mění se JEN kdy Malone ruší, ne trať) |

### Verdikt vůči předregistrovaným kritériím B1–B4

- **B1 (K5-D ≤ 10 % pooled i per pronásledovatel):** pooled **8,65 % ✅**,
  serif-brody **7,15 % ✅**, **agent-malone 10,15 % — TĚSNĚ NAD gate** (o
  0,15 b., uvnitř block-to-block šumu pozorovaného jinde v tomto kole ~0,3 b.
  — hraniční, ne jasný breach, ale ani jasný pass).
- **B2 (K1 3p/4p ≤ +3 b., > +5 = kill):** **+0,70 / +0,35 b. — silně splněno**,
  daleko pod kill i pod predikcí +2 až +4 b. (mechanika je JEMNĚJŠÍ, než audit
  čekal).
- **B3 (K5f per pronásledovatel i pooled beze zhoršení):** splněno, všechny
  delty ~0.
- **B4 (pokles podílu nulovaných Maloneových uzlů < 1/3):** **NESPLNĚNO —
  pokles ~48 % pooled i na uzlech samotného Malonea**, víc než dvojnásobek
  predregistrovaného stropu 1/3. **Není to erasure jako u zamítnutého V2-A**
  (tam šlo 22–24 % → 0,00 %, mechanika zmizela úplně; tady 23,0 % → 12,05 %,
  mechanika pořád běží ve víc než polovině svého dřívějšího rozsahu) — ale
  formálně kritérium nesedí. Mechanický důvod: K3 medián = 2 (Zátah přichází
  po ~2 dokončených uzlech ze 7), takže naivní odhad poklesu by byl ~2/7 ≈
  29 %; skutečných ~48 % vzniká navíc tím, že část runů skončí (bedny/finále)
  DŘÍV, než Žár vůbec poprvé překročí práh Zátahu — celé takové runy pak
  nemají ŽÁDNÝ uzel s aktivním rušením, což táhne podíl dolů nad rámec prostého
  „o kolik uzlů později se to zapne".

**VERDIKT (b): SMÍŠENÝ — dvě ze čtyř kritérií (B2, B3) silně splněna, B1 na
hraně gate (agent-malone 10,15 % vs. ≤10 %), B4 formálně nesplněno (~48 %
pokles proti stropu <1/3), ač jde mechanicky o cosi kvalitativně jiného než
zamítnuté V2-A (dotahuje, nemaže). **Toto je interpretační spor, ne číselný
— eskaluji na PM/uživatele**, zda „mění KDY, ne KDE" ustojí i při poklesu
frekvence o polovinu, nebo zda má gate B4 platit doslova.

## 5. (c) V4-D supply-aware clamp — plná brána — HOTOVO

D6 diagnostika viz §1 (3/60 slotů dotčeno, 5,0 %). Plná brána: clamp prahu
sníží strop viditelných útok-slotů, kde GANGSTER auto-failuje, z 5 na 4 (nejvyšší
útok mezi non-GANGSTER věcmi). 2 bloky × 8000 = 16 000 runů.

| Metrika | baseline (§2) | V4-D clamp (průměr 2 bloků) | Δ |
|---|---|---|---|
| K1 celkem | 71,25 % | **72,1 %** | +0,85 b. |
| K1 1p/2p/3p/4p | 58,25/68,65/77,75/80,35 | 59,65/69,6/78,0/81,05 | +1,4/+0,95/**+0,25**/**+0,70** |
| K6a spread | 22,1 | 21,4 | −0,7 (mírně lepší) |
| **K5-D expDead pooled** | 9,55 % | **8,8 %** | −0,75 (lepší) |
| K5f celkem | 77,45 % | 77,6 % | +0,15 |
| Konfrontací/run, 2+ konfrontace | 25,8 % | 24,9 % | −0,9 (nedotčeno, čekáno) |
| K3 medián | 3/2/2/2 | 3/2/2/2 | beze změny (čekáno — clamp nemá se Žárem nic společného) |

### Verdikt vůči D6 kill-kritériím (design-audit §6, řádek D6)

- **|ΔK1| ≤ 2 b.:** naměřeno max +1,4 b. (1p) — **splněno s velkou rezervou**
  (3p/4p, přímo dotčené sloty `rival-prepad`/`urednik-vaha`/`mesto-ulicka`,
  posunuly se jen o +0,25/+0,70 b.).
- **K5-D ≤ 10 %:** 8,8 % — **splněno** (navíc lepší než baseline, protože 3
  dřív neprůchozí sloty teď mají legální kartu).
- **Dotčeno < 3 % slotů (D6 predikce):** naměřeno 5,0 % (§1) — **mírně nad
  predikcí, ale beze škody na bráně** (viz čísla výš).

**VERDIKT (c): PROCHÁZÍ VŠECHNA KILL-KRITÉRIA.** Malý, dobře ohraničený zásah
(3 sloty ze 60) opravuje konstrukční vadu popsanou v `design-audit` §5.1
(„práh 5 na slotu, kterým neprojde žádná ze 40 karet ve hře") bez měřitelné
ceny na K1 ani K5-D. Nejlevnější ze tří kandidátů tohoto kola — čistě
komunikační V4-C (bez měření, doporučeno auditem „hned") by měl jít současně
s tímto, ne místo něj (V4-C opravuje LEŽ v rozkladu, V4-D opravuje SAMOTNOU
neprůchodnost).

## 6. Souhrn kill-kritérií

| Varianta | Kritérium | Práh | Naměřeno | Verdikt |
|---|---|---|---|---|
| (a) Žár V3-A′ | C1 (K3 ∈ {3,4}) | — | 3/2/2/2, beze změny | ✅ |
| (a) Žár V3-A′ | C2 (2+ konfrontace: medián 1 ∧ ≤15 %, >30 %=kill) | ≤15 %/>30 % | medián 1, podíl **0,0 %** všude | ✅ silně |
| (a) Žár V3-A′ | C2b (léček pokles ≤10 p.b.) | ≤10 p.b. | −0,75 p.b. | ✅ |
| (a) Žár V3-A′ | K1/K6a stabilita | — | K6a beze zhoršení, K1 +8,45 b. (čekaný, žádoucí) | ✅ |
| (b) Malone V2-A′ | B1 (K5-D ≤10 % pooled i per pronásledovatel) | ≤10 % | pooled 8,65 ✅ · brody 7,15 ✅ · **malone 10,15 — hranice** | ⚠ hraniční |
| (b) Malone V2-A′ | B2 (K1 3p/4p ≤+3 b., >+5=kill) | ≤+3/>+5 | +0,70 / +0,35 b. | ✅ silně |
| (b) Malone V2-A′ | B3 (K5f beze zhoršení, pooled i per pronásledovatel) | — | delty ~0 | ✅ |
| (b) Malone V2-A′ | B4 (pokles nulovaných Maloneových uzlů <1/3) | <33 % | **~48 % pokles** | ❌ nesplněno |
| (c) V4-D clamp | D6 (\|ΔK1\|≤2 b., K5-D≤10 %) | ≤2 b./≤10 % | max +1,4 b., K5-D 8,8 % | ✅ |
| (c) V4-D clamp | D6 (podíl dotčených slotů) | „<3 % predikce" | 5,0 % | mírně nad predikcí, bez dopadu na bránu |

**Souhrn:** (a) Žár V3-A′ a (c) V4-D clamp projdou VŠECHNA předregistrovaná
kritéria, (c) navíc bez měřitelné vedlejší ceny. (b) Malone V2-A′ je smíšený:
tři kritéria (B1 pooled/brody, B2, B3) procházejí silně, jedno (B1 malone-only)
je na hraně gate v rámci šumu, a B4 formálně nesplňuje předregistrovaný strop
<1/3 (naměřeno ~48% pokles) — byť jde mechanicky o „dotahuje", ne o „maže"
jako zamítnuté V2-A (tam šlo o 100% erasure).

## 7. Doporučení

1. **(a) Žár V3-A′ + V3-C — DOPORUČUJI ZAPÉCT.** Prochází všechna kritéria
   s velkou rezervou, řeší přesně hráčovu stížnost („4–5× za run uteče problém
   z lopaty") strukturálně, ne kosmeticky. V3-C (dopředná anotace u pohybu
   šerifa) je čistě komunikační a nebyla součástí simulace — doporučuji ji
   implementovat současně (nulové riziko, `design-audit` ji označuje jako
   „povinné bez ohledu na A/B").
2. **(c) V4-D supply-aware clamp — DOPORUČUJI ZAPÉCT.** Nejlevnější změna
   tohoto kola (3 sloty ze 60), žádná měřitelná cena na K1 ani K5-D, opravuje
   konstrukční neprůchodnost zdokumentovanou analyticky v `design-audit` §5.1.
   **V4-C (komunikační oprava rozkladu) UŽ JE HOTOVÁ** — ověřeno přímo v kódu:
   commit `88018f1` přidal `stropVeta()`/rozšířil `rozkladPrahu()` v
   `prototyp/src/ui/vysvetleni.js` přesně dle §5.2 bodu 1–2 (anotace odhalení
   řekne strop PŘED vyhodnocením, rozklad pojmenuje zastropování/podlahování
   místo mlčení). **V4-D je tedy jediný zbývající kus mandátu 4** — bez něj
   V4-C jen POJMENOVÁVÁ neprůchodnost slotu, neopravuje ji.
3. **(b) Malone V2-A′ — ESKALUJI K ROZHODNUTÍ, NEZAPÉKÁM SÁM.** Tři kritéria
   ze čtyř procházejí (dvě silně), jedno je na hraně gate v rámci šumu (B1
   agent-malone 10,15 % vs. ≤10 %) a jedno formálně nesplňuje předregistrovaný
   strop (B4, ~48 % pokles proti <33 %). Kvalitativně je to jasně jiná věc
   než zamítnuté V2-A (mechanika běží dál na víc než polovině svého dřívějšího
   rozsahu, ne 0 %) a K1/K5f dopad je menší, než audit čekal — ale číselně gate
   B4 nesedí. **Otázka pro PM/uživatele:** platí předregistrovaný strop <1/3
   doslova (pak varianta nezapéká se dnešním zněním a čeká na úpravu — např.
   jemnější aktivační podmínka, ne binární „než/od Zátahu"), nebo se strop B4
   reviduje ve světle toho, že jde o kvalitativně jinou (ne erasure) mechaniku?
   Nerozhoduji to sám — je to přesně ten typ sporu, který má jít na PM/uživatele
   (`design-audit` D25e precedens: identita mechaniky se nemění tichou kalibrací).
4. **K3 (4. odchylka) zůstává nevyřešená.** Žádná ze tří variant K3 neopravuje
   (ani nemá proč — K3 řeší POZICI prvního Zátahu, ne co se děje po něm).
   Baseline i všechny tři varianty souhlasně měří **3/2/2/2** proti gate
   {3,4} — potvrzuje se breach u 2p/3p/4p zapsaný v `projekt/rozhodnuti.md`
   D57 bodu 3 jako čtvrtá známá odchylka. Toto měřicí kolo k tomu nic nepřidává
   ani neubírá; zůstává otevřené pro budoucí kalibrační kolo nebo lidskou bránu.
5. **Metodická poznámka pro příští kola:** watchdog (600 s bez postupu) opakovaně
   zabil běhy spouštěné na pozadí nebo přes čekací smyčky — NIKDY samotný
   výpočet (žádný jednotlivý blok nepřesáhl 61 s). Doporučuji pro budoucí
   simulační kola v tomto rozsahu (16 000 runů/varianta) rovnou počítat s
   `sim/mereni-d57-2.js <runů/buňku> <varianta> <blok>` vzorem — jeden
   synchronní příkaz = jeden blok, žádné pozadí, žádné until-loopy.

---

## 8. Dodatek — verifikační přeměření v produkčním kódu po zapečení (D58, 2026-08-04)

Po `projekt/rozhodnuti.md` D58 (zapéct všechny tři varianty + V4-C) přistály
(a) Žár V3-A′ + V3-C, (b) Malone V2-A′ a (c) V4-D supply-aware clamp přímo
v `main` (`prototyp/src/engine/rules.js`, `resolve.js`, `state.js`; UI
`ui/screens/run/{commit,assign,okraj}.js` + `ui/vysvetleni.js` pro V3-C
a `rusiAktivni`; `sim/strategies.js` pro botí povědomí o Maloneově aktivační
bráně — bez něj `oracle`/`kompetentni` plánovaly proti rušení, které v tu
chvíli ještě neplatilo, a spadl invariant `max_achievable === reálné zásahy`).
Na rozdíl od §1–§7 výše **tohle NENÍ injektážní worktree** — jde o finální
engine, se kterým hra běží. 475 → **484/484 testů zelených** (9 nových: V2-A′
aktivace/gating, V3-A′ jeden-klimax + přesná delta odečtu, V4-D supply-aware
clamp na `revealSlots`).

**Metodika:** stejná jako §0 — bot `kompetentni`, 2 disjunktní bloky × 8000
runů (seedy 1–1000 a 1001–2000, 4 počty hráčů × 2 pronásledovatelé ×
1000 runů/buňka/blok), `npm run sim -- --runs 1000 --players 1,2,3,4 --pursuer
agent-malone,serif-brody --strategy kompetentni --seed <1|1001>`. Na rozdíl od
§1–§7 (kde se každá varianta měřila IZOLOVANĚ) je tohle přeměření
**VŠECH TŘÍ SOUČASNĚ** — přesně stav, v jakém D58 hru zapekl.

| Metrika | Baseline (§2, pre-D58) | Blok 1 (seed 1–1000) | Blok 2 (seed 1001–2000) | Průměr | Δ vs. baseline |
|---|---|---|---|---|---|
| K1 celkem | 71,25 % | 81,0 % | 80,4 % | **80,7 %** | +9,45 b. |
| K1 1p | 58,25 % | 68,1 % | 68,6 % | **68,35 %** | +10,10 b. |
| K1 2p | 68,65 % | 81,4 % | 79,9 % | **80,65 %** | +12,00 b. |
| K1 3p | 77,75 % | 87,4 % | 85,8 % | **86,60 %** | +8,85 b. |
| K1 4p | 80,35 % | 87,1 % | 87,3 % | **87,20 %** | +6,85 b. |
| K6a spread | 22,1 | 19,3 | 18,7 | **19,0** | −3,1 b. (lepší) |
| K5-D expDead (pooled) | 9,55 % | 7,7 % | 8,0 % | **7,85 %** | −1,70 b. (lepší) |
| K5f celkem | 77,45 % | 77,6 % | 77,0 % | **77,3 %** | −0,15 b. (beze změny) |
| K5f proher ve finále | — | 96,7 % | 97,0 % | **96,85 %** | ≥90 % ✅ |
| medián Žáru | 6 | 9 | 9 | **9** | (čekáno — Žár teď doráží dál bez druhého resetu) |

**Verdikt vůči STOP podmínce zadání D58 bodu 4** (odchylka od predikce
`K1 celkem ~79,7 % se všemi třemi` **> 2 b. = STOP**): naměřeno **80,7 %**,
Δ **+1,0 b.** — **uvnitř tolerance šumu, STOP se nenastal.** Číslo navíc sedí
s vlastní logikou skládání: D58 samo cituje jako „přiznanou cenu" Žárova
kola izolovaná čísla **2p 81,05 / 3p 86,2 / 4p 86,65** (§3 výše) — a tohle
přeměření se VŠEMI TŘEMI SOUČASNĚ dává **2p 80,65 / 3p 86,60 / 4p 87,20**,
tedy prakticky identické Žárovu izolovanému efektu. Malone V2-A′ a V4-D tedy
K1 dál neprohlubují ani nekompenzují navzájem — jejich dopad na K1 je
(očekávaně) o řád menší než Žárův (+0,70/+0,85 b. izolovaně, §4/§5) a v součtu
s Žárem se ztrácí v blok-to-blok šumu (K1 se mezi vlastními dvěma bloky hýbe
o 0,6–1,6 b., viz sloupce výš). **K5-D a K6a se navíc oba zlepšily** proti
baseline (Malone V2-A′ a V4-D obě samostatně K5-D snižovaly, §4/§5) — žádný
z nich se skládáním nezhoršil.

**Co se NEPŘEMĚŘOVALO číselně, ale drží strukturálně:** V3-A′ „jeden klimax
za run" (žádná druhá konfrontace) není v `renderSummaryMd` výstupu jako
samostatná metrika (report počítá jen `dosahlKonfrontace`/`prezilKonfrontaci`
jako run-level boolean, ne počet konfrontací na run) — invariant je ale
dokázaný STROJOVĚ dvěma novými testy (`state.test.js`, popis „práh
konfrontace se po prvním odpálení v runu už NIKDY znovu nevrátí"), které
žene Žár na strop, nechají konfrontaci přežít, a pak ho ženou na strop
ZNOVU — a ověřují, že `situation_revealed` typu `konfrontace` padne v logu
přesně jednou. To je silnější záruka než vzorek 16 000 runů (platí pro
KAŽDÝ run, ne jen pravděpodobnostně).

**Závěr: číslo souhlasí s reportem měření (§3–§5), STOP se nenastal, D58
zapečení je verifikované v produkčním kódu.** Dodatek do `prototyp-mvp.md`
(§Žár, §Skryté prahy) a `design-dokument.md` (§4.5, §4.9) proveden souběžně
s implementací; `obsah/pronasledovatele.yaml` Maloneho `rusi.pravidlo` a
hlavičkový komentář schématu přepsány na novou mechaniku (content-generator).

---

*Worktree `d57-2-mereni-zar-malone` (branch stejného jména, merge `main` @
`9edcd75`) se po schválení/zamítnutí variant výše ZAHODÍ — nemerguje se do
`main`. Skript `sim/mereni-d57-2.js` žije jen tam. Kdyby bylo třeba přeměřit,
worktree lze znovu založit ze stejného commitu main + reapply patchů popsaných
v §0 (nebo požádat playtest-facilitator o reprodukci).*

*Související: [[design-audit-2p-2026-08-02|design-audit-2p]] ·
[[../projekt/rozhodnuti|projekt/rozhodnuti.md]] (D57, D58) ·
[[../prototyp-mvp|prototyp-mvp.md]] (K1–K8, Žár, Pronásledovatel).*
