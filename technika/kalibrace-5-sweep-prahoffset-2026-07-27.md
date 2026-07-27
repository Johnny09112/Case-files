# Kalibrace-5 — sweep `zar.prahOffsetDlePoctu`: K1 spraveno, K6a na hraně, K2 zaplaceno

> **STAV: cíl zadání není splněn celý.** Existuje jediná hodnota, která dostane
> **K1 per-count u všech počtů do [45,70] robustně (6/6 bloků)** — `{1:0, 2:5,
> 3:6, 4:6}`. **K6a spread padá 22,4 → 6,0 b.**, což je *na* prahu gate ≤6, ne
> pod ním (3/6 bloků při standardní dávce; při dvojnásobné dávce 5,1 b. a 5/6 —
> rozdíl je šum měřidla, ne hry). **Cena je K2 drift: 1,39 → 1,28 (6/6 → 2/6
> bloků), tedy kritérium, které D35 poprvé rozsvítil zeleně, nově padá.**
> Hodnota v `rules.js` NEBYLA změněna — zapečení je rozhodnutí uživatele.

*Sestavil: playtest-facilitator. Datum: 2026-07-27. Mandát:
[[../projekt/rozhodnuti|D37]] (sweep jediné per-count páky, nic jiného se neladí).
Navazuje na [[proverka-bota-2026-07-27]] (D35 — odkud breach K1/K6a vznikl) a
metodiku bloků z [[../projekt/rozhodnuti|D31]]. Verdikt: 6 disjunktních bloků
× 8000 runů (1000 seedů × 4 počty × 2 pronásledovatelé), bot `kompetentni`,
průměr přes bloky. Obsah ani engine se nedotkly — kandidáti se měří injektáží
pravidel, jak to dělá `sim/sweep-p1.js`.*

---

## 0. Validace harnessu

Baseline `{1:0, 2:2, 3:2, 4:2}` přeměřený tímto harnessem reprodukuje D35 do
desetiny: K1 **57,33 / 67,10 / 77,45 / 79,70** (D35: 57,3 / 67,1 / 77,5 / 79,7),
K6a **22,37** (22,4), K5-D **9,72** (9,72), K2 drift **1,39** (1,39), K2 floor
**20,63 %, 5/6 bloků** (20,3 %, 5/6). Měřidlo je totéž, mění se jen jedna páka.

## 1. Explorační mřížka — tvar křivky

Offset je **per-count separovatelný** (`state.js:489` čte
`prahOffsetDlePoctu[players.length]`), takže se každý počet měří nezávisle.
2000 runů na buňku (2 bloky × 500 × 2 pronásledovatelé), % DORUČENO:

| počet | off 0 | off 1 | off 2 | off 3 | off 4 | off 5 | off 6 ‖ | off 7 | off 8 | off 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1p | **55,7** | 49,9 | 42,8 | 37,7 | 40,4 | 33,7 | 24,8 ‖ | 71,6 | 75,8 | 78,4 |
| 2p | 78,2 | 74,3 | 66,4 | 62,0 | 65,5 | **56,9** | 44,6 ‖ | 82,7 | 84,2 | 86,0 |
| 3p | 87,4 | 83,3 | 76,4 | 71,1 | 74,8 | 65,4 | **51,3** ‖ | 85,6 | 87,6 | 88,3 |
| 4p | 87,6 | 83,6 | 79,9 | 74,9 | 74,9 | 69,2 | **54,6** ‖ | 85,6 | 86,9 | 87,8 |

```
K1 (% DORUČENO) × offset — číslice = počet hráčů, „|" = zlom režimu
 90 |34   .    .    .    .    .    .   | 34   34   234
 85 |.    34   .    .    .    .    .   | 2    2    .
 81 |2    .    34   .    .    .    .   | .    .    1
 76 |.    2    .    4    34   .    .   | 1    1    .
 71 |.    .    .    3    .    4    .   | .    .    .
 67 |.    .    2    2    2    3    .   | .    .    .
 62 |.    .    .    2    .    .    .   | .    .    .
 57 |1    .    .    .    .    2    4   | .    .    .
 53 |.    1    .    .    .    .    3   | .    .    .
 48 |.    .    .    .    .    .    2   | .    .    .
 43 |.    .    1    .    1    .    .   | .    .    .
 39 |.    .    .    1    .    .    .   | .    .    .
 34 |.    .    .    .    .    1    .   | .    .    .
 29 |.    .    .    .    .    .    1   | .    .    .
    +---------------------------------------------------
     0    1    2    3    4    5    6     7    8    9
                                        ^ režim „prah ≤ 3" — obtížnost se OTOČÍ
```

**Monotonie NEPLATÍ — a není to šum.** Křivka má dva zlomy a oba mají doložený
mechanismus v kódu:

- **Zlom A (offset 3 → 4): mírné zlehčení** u všech počtů (1p 37,7 → 40,4;
  3p 71,1 → 74,8). Prahy jsou `Math.max(1, prahBase − offset)` (`state.js:491`),
  takže při offsetu 4 padne práh **léčky na 3**. Přežitá konfrontace nastavuje
  Žár přesně na `poPrezitiKonfrontace = 3` (`state.js:602`) a práh se znovu
  nabíjí jen podmínkou `heat < prah` (`state.js:497`). Práh rovný 3 se tedy po
  první konfrontaci **už nikdy nepřezbrojí** → o jednu opakovanou léčku míň.
- **Zlom B (offset 6 → 7): obtížnost se otočí** a hra se stane výrazně snazší
  než na offsetu 0 (1p 24,8 → 71,6). Týž mechanismus, ale teď se zasekne práh
  **konfrontace** (10 − 7 = 3). Konfrontace proběhne jednou a po přežití je tým
  do konce runu vůči ní imunní.

**Nález mimo zadání, hlásím a neopravuji:** interakce „podlaha prahu = 1"
+ „`poPrezitiKonfrontace` = 3" + „práh se nabíjí jen při `heat < prah`" dělá
z jakéhokoli prahu ≤ 3 **jednorázovou událost**. Není to vada tohoto sweepu, je
to vlastnost trati Žáru; sweep ji jen odkryl. Použitelný rozsah páky je proto
**0–6**, ne „libovolně vysoko".

## 2. Proč zbyl jediný kandidát

1p má na offsetu 0 **57,3 %** a víc už z něj nedostaneme (offset dolů nejde).
1p je tedy kotva: aby K6a spread ≤ 6 b., musí všechny ostatní počty padnout do
zhruba **[51,3; 63,3]**. Z mřížky:

- 2p: vyhovuje off 3 (62,0) a off 5 (56,9)
- 3p: vyhovuje **jen** off 6 (51,3) — off 5 je 65,4, tedy 2 b. nad stropem
- 4p: vyhovuje **jen** off 6 (54,6) — off 5 je 69,2

Kombinace s 2p = 3 dává spread 10,7 b. Zbývá **jediná**: `{1:0, 2:5, 3:6, 4:6}`
(dále **A1**). Jako kontrast se měřil i **A2 = `{1:0, 2:3, 3:5, 4:5}`** — „jen
dostat K1 do pásma, trať zkrátit co nejmíň".

**Granularita páky je binding constraint:** jeden krok offsetu posune K1 o 5–14
bodů. Mezi 3p/off5 (65,4) a 3p/off6 (51,3) není nic. Skalární offset na počet
hráčů je na cíl „spread ≤ 6 b." hrubý nástroj; jemnější by byl vektor po prazích
(jiný offset pro zátah / léčku / konfrontaci) — **to je ale změna tvaru páky,
tedy návrh pro game-designera, ne krok tohoto sweepu.**

## 3. Verdikt — 6 bloků × 8000 runů, průměr přes bloky

### A1 = `{1:0, 2:5, 3:6, 4:6}` — doporučený kandidát

| blok (seedy) | 1p | 2p | 3p | 4p | K6a spread | K5-D | K2 drift / floor |
|---|---|---|---|---|---|---|---|
| 1 | 58,8 | 57,7 | 51,6 | 55,0 | 7,2 ❌ | 9,2 ✅ | 1,24 ❌ / 20,5 ✅ |
| 1001 | 56,5 | 56,3 | 52,4 | 56,0 | 4,1 ✅ | 9,7 ✅ | 1,30 ✅ / 21,4 ✅ |
| 2001 | 57,1 | 56,5 | 53,2 | 55,5 | 3,9 ✅ | 9,8 ✅ | 1,30 ✅ / 21,0 ✅ |
| 3001 | 56,2 | 58,1 | 52,1 | 54,6 | 6,0 ✅ | 9,7 ✅ | 1,29 ❌ / 20,8 ✅ |
| 4001 | 58,2 | 55,3 | 51,1 | 54,2 | 7,1 ❌ | 9,8 ✅ | 1,28 ❌ / 20,9 ✅ |
| 5001 | 57,2 | 57,9 | 50,0 | 53,0 | 7,9 ❌ | 10,2 ❌ | 1,27 ❌ / 20,9 ✅ |
| **průměr** | **57,33** | **56,97** | **51,73** | **54,72** | **6,03** | **9,73** | **1,28** / **20,92** |

**K1 per-count: žádný breach v 6/6 blocích** (nejnižší jednotlivá hodnota 50,0 —
5 b. nad dolní hranicí 45, nejvyšší 58,8 — 11 b. pod stropem 70). Rezerva na obou
stranách je pohodlná; K1 je spraveno robustně, ne o vlásek.

### A2 = `{1:0, 2:3, 3:5, 4:5}` — kontrast „zkrať trať co nejmíň"

| blok | 1p | 2p | 3p | 4p | spread | K5-D | K2 drift / floor |
|---|---|---|---|---|---|---|---|
| 1 | 58,8 | 62,3 | 65,2 | **70,5** ❌ | 11,7 | 9,5 | 1,29 / 20,7 |
| 1001 | 56,5 | 61,8 | 63,8 | 67,3 | 10,8 | 9,7 | 1,26 / 20,8 |
| 2001 | 57,1 | 59,9 | 65,3 | 69,4 | 12,3 | 9,6 | 1,30 / 20,8 |
| 3001 | 56,2 | 63,2 | 65,2 | 67,4 | 11,2 | 9,8 | 1,30 / 20,4 |
| 4001 | 58,2 | 63,4 | 65,3 | 67,4 | 9,2 | 9,7 | 1,23 / 19,9 |
| 5001 | 57,2 | 63,2 | 64,9 | 66,6 | 9,4 | 10,1 | 1,21 / 19,9 |
| **průměr** | **57,33** | **62,30** | **64,95** | **68,10** | **10,77** | **9,73** | **1,26** / **20,42** |

A2 dostane K1 do pásma jen **5/6 bloků** (4p v bloku 1 = 70,5) a K6a nechá na
10,8 b. (0/6). **K2 drift přitom klesne stejně (1,26).** To je klíčové zjištění:
zhoršení K2 **není daň za extrémní offset** — přijde, jakmile se trať týmu
zkrátí vůbec. A2 tedy platí stejnou cenu za horší výsledek. **Zamítnuto.**

### Rozlišovací zkouška K6a — kolik z 6,03 je šum měřidla

A1 a baseline přeměřeny při **dvojnásobné dávce** (2000 runů na buňku,
6 disjunktních bloků seedů 1 / 2001 / … / 10001 — jiné rozvržení než D31, proto
jen diagnostika, ne verdikt):

| | K1 per-count | K6a mean (rozsah) | bloků v gate |
|---|---|---|---|
| baseline @1000 | 57,33 / 67,10 / 77,45 / 79,70 | 22,37 (20,3–24,0) | 0/6 |
| baseline @2000 | 57,07 / 67,27 / 77,13 / 79,78 | 22,72 (21,6–24,5) | 0/6 |
| **A1 @1000** | 57,33 / 56,97 / 51,73 / 54,72 | **6,03** (3,9–7,9) | **3/6** |
| **A1 @2000** | 57,07 / 55,98 / 52,10 / 54,70 | **5,08** (3,9–7,2) | **5/6** |

Skutečný spread A1 je **≈ 5,0–5,6 b.**, tedy pod gate. Hodnota 6,03 při
standardní dávce je z velké části **nadhodnocení šumem** (spread je max−min ze
4 zašuměných čísel, takže roste s rozptylem). Praktický důsledek: **gate „K6a
≤ 6 b." je při dávce 1000 runů/buňka pod rozlišovací schopností měřidla** —
přesně riziko, na které upozorňoval D31 (`2·sd < 6?`). Buď se K6a měří na
dvojnásobné dávce, nebo se gate čte jako „≈ 6", ne „< 6". **To je rozhodnutí
o kritériu, ne o čísle — nepřebírám ho.**

## 4. Regresní kontrola celé brány (povinná, A1 vs. baseline)

Stejný harness, stejné bloky (D31 rozvržení, 1000/buňku), jediný rozdíl je páka:

| kritérium | gate | baseline `{0,2,2,2}` | **A1 `{0,5,6,6}`** | dopad |
|---|---|---|---|---|
| **K1 per-count** | každý ∈ [45,70] | 57,3 / 67,1 / **77,5** / **79,7** — 0/6 bloků čistých | **57,3 / 57,0 / 51,7 / 54,7 — 6/6 čistých** | **✅ SPRAVENO** |
| **K6a spread** | ≤ 6 b. | 22,37 (0/6) | **6,03 (3/6)**; @2000 runů 5,08 (5/6) | **⚠️ na hraně** |
| **K2 drift** | ≥ 1,3 | **1,39 (6/6)** | **1,28 (2/6)** | **❌ NOVĚ PADÁ** |
| K2 pozdní floor | ≥ 20 % | 20,63 (5/6) | 20,92 (6/6) | ✅ mírně lepší |
| **K5 varianta D** | ≤ 10 % | 9,72 (6/6) | 9,73 (**5/6**) | ⚠️ průměr stejný, o blok křehčí |
| K5 max≤1 pre/common | diagnostika | 13,8 % | 13,83 % | beze změny |
| **K5f přežití konfrontace** | ∈ [60,80] per počet×pronásl. | breach v **6 z 8** buněk (1p Malone 56,7 pod; 2p Brody 80,2; 3p/4p 82,6–85,9 nad) | breach v **7 z 8** (2p Malone 77,1 → **81,1** nově nad stropem) | ❌ o buňku horší (padalo už předtím) |
| K5f podíl proher ve finále | ≥ 90 % | 97,67 (6/6) | 99,27 (6/6) | ✅ |
| **K7** záchranný podíl / take | ≤15 % / ≥80 % | 5,93 / 100 (6/6) | 5,92 / 100 (6/6) | beze změny |
| K7 hedge podíl uzlů | diag. 30–50 | 31,35 | 31,60 | beze změny |
| K7 silný take | ≈ 0 | 0 | 0 | beze změny |
| K8 pásma (common) | LOOT/HLADCE/NÁSL./PRŮŠVIH | 10,0 / 35,6 / 36,4 / 17,9 | 10,1 / 35,9 / 36,5 / 17,4 | beze změny |
| příčiny proher | — | bedny-0 10,1 % / konfrontace 89,9 % | 3,6 % / **96,4 %** | posun na finále |
| medián Žáru / uzlů | — | 6 / 7 | 5,33 / 7 | délka runu stejná |
| splnění cílů (nejvíc dotčené) | diagnostika | čistá-ruka 41,8 · hazardér 72,5 · bez-jizvy 49,8 | 22,6 · 53,7 · 36,9 | ❌ citelně hůř |

**Explicitně: co dnes prochází a po změně padá.**
1. **K2 drift** (6/6 → 2/6). Jediný gate, který se změnou rozbije.
2. **K5-D** klesne z 6/6 na 5/6 bloků, průměr ale zůstává 9,7 — je to křehkost,
   ne pád.
3. **K5f** padal už před změnou (6 z 8 buněk); změna přidá jednu buňku (2p
   Malone překročí strop 80 %). Zhoršení, ne nový pád kategorie.
4. Nic dalšího se nehnulo — **K7, K8 a pásma běžných uzlů jsou identické**, což
   je očekávané a zároveň potvrzuje, že páka opravdu nesahá na obtížnost
   běžných uzlů (falzifikace kalibrace-3 drží).

**Mechanismus regrese K2** (prokázáno rozpadem, ne dohadem): pozdní PRŮŠVIH-rate
se **nezměnila** (20,6 → 20,9 %). Zvedla se **raná**: 14,82 → 16,32 %. Drift
neklesl proto, že by pozdní hra změkla, ale proto, že **tvrdost přišla dřív** —
při offsetu 6 padne práh léčky na 1, takže léčka dorazí v průměru na pozici 2,6
(baseline 4,85) a tým vstupuje do uzlu 2 už s finálovými postihy. Sníh napadne
na začátku kopce, takže se po cestě nenabaluje. Totéž u A2 (raná 16,17 %) —
proto obě varianty platí stejně.

## 5. Tempová diagnostika — co se změní kvalitativně

400 seedů × 2 pronásledovatelé na buňku; `ordVse` = pořadí uzlu včetně vložených
setkání:

| offset | počet | uzlů/run | z toho finálových | 1. zátah | 1. léčka | 1. konfrontace | runů s ≥2 konfrontacemi |
|---|---|---|---|---|---|---|---|
| baseline | 4p | 8,59 | 3,54 | 3,21 | 4,85 | 6,52 (85 %) | 28 % |
| **A1** | 4p | 9,01 | **4,85** | 3,89 | **2,59** | **4,42 (100 %)** | **82 %** |
| A2 | 4p | 8,80 | 4,20 | 3,11 | 3,22 | 5,05 (99 %) | 76 % |
| baseline | 1p | 7,59 | 3,11 | 4,13 | 5,42 | 6,61 (81 %) | 11 % |
| A1 | 1p | 7,59 | 3,11 | 4,13 | 5,42 | 6,61 (81 %) | 11 % | 

(1p je ve všech variantách identické — offset 0 se nemění.)

A1 mění u týmu **strukturu runu, ne jen obtížnost**:
- **Léčka předběhne zátah** (2,59 vs. 3,89) — dramaturgické pořadí trati se obrátí.
- **Konfrontace je u 3–4p prakticky jistá** (99,7–99,9 % runů; baseline 87–88 %)
  a přijde o dva uzly dřív.
- **82 % týmových runů obsahuje dvě a víc konfrontací** (baseline 28 %), a víc
  než polovina uzlů runu je finálový typ.

Fikčně to lze číst obojím způsobem: „čtyři lidi v autě = štvanice od začátku" je
konzistentní s odůvodněním P1 v `rules.js`. Ale je to jiná hra než trať se
stupňováním — a **jestli to čte jako eskalace, nebo jako šeď, simulace
nerozhodne.**

## 6. Odpověď na zadání

- **K1 per-count do [45,70] u všech počtů: DOSAŽITELNÉ.** `{1:0, 2:5, 3:6, 4:6}`,
  6/6 bloků bez breache, s rezervou 5–11 b. na obě strany.
- **Současně K6a ≤ 6 b.: NA HRANĚ, ne prokazatelně.** Skutečný spread ≈ 5,0–5,6 b.
  (pod gate), ale při standardní dávce měřidlo hlásí 6,03 a jen 3/6 bloků.
  Jiná hodnota páky spread nezlepší — 5,6 b. je **strop, co skalární offset umí**,
  protože 1p je pinnutý na 57,3 a 3p má v pásmu jedinou přípustnou hodnotu.
- **Bez ceny to nejde: NEDOSAŽITELNÉ.** Žádná kombinace v rozsahu 0–6 nedrží
  zároveň K1, K6a i K2 drift. Zkrácení trati týmu **z principu** posouvá tvrdost
  dopředu, a K2 měří přesně to, že tvrdost má růst dozadu. Ty dva gate jsou přes
  tuhle páku **v přímém rozporu** — to je designové rozhodnutí, ne kalibrační.

**Volba, kterou předkládám (nezapékám):**

| varianta | K1 | K6a | K2 drift | poznámka |
|---|---|---|---|---|
| ponechat `{0,2,2,2}` | ❌ 3p/4p breach 6/6 | ❌ 22,4 | ✅ 1,39 | týmová hra zůstává snadná (78–80 %) |
| **A1 `{0,5,6,6}`** | ✅ 6/6 | ⚠️ 6,03 (5,08 @2000) | ❌ 1,28 | mění strukturu týmového runu |
| A2 `{0,3,5,5}` | ⚠️ 5/6 | ❌ 10,8 | ❌ 1,26 | platí cenu A1 bez jejího přínosu |

Doporučení facilitátora: **A1**, protože K1 je gate o obtížnosti hry pro reálný
počet hráčů, kdežto K2 drift je gate o *pocitu* stupňování — a ten je ze všech
devíti kritérií nejvíc odkázaný na lidský test (viz §7). Vzít A1 znamená vědomě
přepsat pořadí priorit; **není to čistá výhra a nemá se tak prodávat.**

## 7. Co tenhle report NEPROKAZUJE

Vše výše je matematika a tempo. **O zábavnosti neříká nic.** Konkrétně:

- **Že 82 % týmových runů se dvěma konfrontacemi je eskalace, a ne opakování,**
  je hypotéza. Simulace vidí, že to je těžší; nevidí, jestli to u stolu vrcholí,
  nebo omrzí.
- **Že K2 drift 1,28 vs. 1,39 je u stolu rozeznatelné,** je hypotéza. Rozdíl
  v míře PRŮŠVIHŮ mezi ranou a pozdní částí je 16,3 → 20,9 %; jestli hráč cítí
  „utahuje se to", nebo jen „občas to nevyjde", ukáže až sezení.
- **Že obrácené pořadí léčka → zátah nerozbije vyprávění,** je hypotéza.
- **Cíle:** `mozek-operace` má **0 % splnění ve všech variantách včetně baseline**
  — to je mrtvá volba a nález nezávislý na tomto sweepu; předávám
  game-designerovi. Ostatní cíle po A1 citelně klesnou (čistá-ruka 41,8 → 22,6 %),
  což může být správně (těžší hra) i špatně (cíle přestanou být dosažitelné) —
  **simulace to nerozsoudí, protože nevím, jaká míra splnění je zábavná.**

## 8. Reprodukce

Hodnota v `prototyp/src/engine/rules.js` **nebyla změněna**; kandidáti se měřili
injektáží pravidel (`{...RULES, zar: {...RULES.zar, prahOffsetDlePoctu: …}}`),
takže v repu po tomto sweepu není žádná změna chování.

```bash
# explorační mřížka (offsety 0–9 × 1–4p, 2000 runů/buňka)
node scratchpad/explore-offset.mjs 500
# verdikt (6 bloků × 8000 runů) pro danou mapu offsetů
node scratchpad/verdikt-offset.mjs "0,5,6,6" 1000
node scratchpad/verdikt-offset.mjs "0,2,2,2" 1000
node scratchpad/verdikt-offset.mjs "0,3,5,5" 1000
# rozlišovací zkouška K6a (jiné rozvržení bloků, 2000/buňka)
node scratchpad/verdikt-offset.mjs "0,5,6,6" 2000 "1,2001,4001,6001,8001,10001"
# tempová diagnostika
node scratchpad/tempo-diag.mjs "0,2,2,2" "0,5,6,6" "0,3,5,5"
```

Skripty jsou jednorázové a žijí ve scratchpadu (mimo repo, dle pracovní hygieny
role); staví výhradně nad `sim/run.js` a `sim/report.js`, žádnou metriku
nepočítají po svém.

---

*Otevřené položky pro rozhodnutí uživatele: (1) zapéct A1, nebo ponechat breach
K1; (2) jak číst K6a ≤ 6 b. při dávce, kde je gate pod rozlišením měřidla;
(3) co s K2 driftem, který je s touto pákou v přímém rozporu s K1. Body (2) a (3)
jsou změny sdíleného pravidla (`prototyp-mvp.md` Fáze 0) — návrh znění patří
game-designerovi, schválení uživateli.*
