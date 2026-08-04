# Sweep rezervní páky `hraci[n].ruka` — D58 bod 4 (2026-08-04)

**Zadání:** `projekt/rozhodnuti.md` D58 bod 4 — po zapečení Žár V3-A′ + Malone
V2-A′ + V4-D clamp je K1 celkem **80,7 %**, 2p/3p/4p breachují strop 70 %
(2p ~80,65 · 3p ~86,60 · 4p ~87,20, baseline z
[[mereni-zar-malone-2026-08-02|mereni-zar-malone-2026-08-02.md]] §8). Aktivovat
rezervní páku D39 `hraci[n].ruka` — zmenšit TÝMOVÉ ruce (dnes 8/5/4/3 pro
1p–4p; 1p mimo sweep, je v pásmu), aby se zúžil výběr nejlepší karty napříč
týmem (driver K1 3p/4p z D35).

**Skript:** `prototyp/sim/sweep-ruka.js` (injektáž `{...RULES, ruce: {...}}`,
`rules.js` needitován — čistě datová páka, ADR-003). Commit spolu s tímto
reportem; **nic se nezapéká** — verdikt jde uživateli/PM.

## Předregistrace (před měřením)

1. **Cíl:** K1 per count → **[45,70]** nebo aspoň **výrazné přiblížení**
   (orientačně: uzavře většinu mezery ke stropu 70).
2. **K6a spread** — hlídat, ideálně směrem k ≤6 b.
3. **Guardrail:** ruka nesmí klesnout pod (max commitů jednoho hráče v uzlu) + 1
   — jinak `gamble()` nemá z čeho táhnout (`state.js`: `owner.ruka.length===0`
   hodí chybu). Max commitů/hráče dle `RULES.ruce[n].commit`: 2p→2 (ruka≥3),
   3p→2 (ruka≥3), 4p→1 (ruka≥2). Sweep testuje rozsahy **2p∈{5,4}, 3p∈{4,3},
   4p∈{3,2}** — dolní konec (3p=3, 4p=2) leží PŘESNĚ na hraně guardrailu.
4. **Hlídat bez zhoršení:** K7 (gamble EV závisí na zbytku ruky — menší ruka
   = tenčí pool, ze kterého gamble losuje náhradní kartu, viz níže), K4d/K6c
   (agency/pocit ruky), K5-D, K2 floor, K5f.
5. **K3** (medián uzlu 1. překročení prahu Zátah) — čtvrtá známá odchylka
   (D57), tímto kolem se neřeší; report.js pro ni nemá hotovou metriku (jen
   `ekonomika.zar_median` jako hrubá diagnostika tempa Žáru). **Nezměřeno
   přímo — přiznáno jako mezera, ne skryto.**
6. **K4d, K6c** — také nezměřeny: K4d vyžaduje samostatný `learnability.js`
   běh (kompetentní−náhodný diff, řádově dražší); K6c (run-agregovaný
   pasažér, floor příspěvku per hráč) **v `report.js` vůbec neexistuje jako
   metrika** (`k6c_pasma` je jen alias pro pásmová procenta, ne totéž).
   Obojí zůstává jako otevřená mezera měření, ne jako tichý předpoklad OK.

## Zjištění o mechanice (pro čtení výsledků)

`gamble()` (`state.js` ř. 989) **netáhne novou kartu z balíčku** — losuje
náhodnou kartu z **vlastního zbytku ruky** vlastníka (`owner.ruka.splice`) a
tou nahradí committnutou kartu. Menší ruka tedy neznamená jen míň karet na
commit — znamená i **menší a nekvalitnější pool, ze kterého gamble
vybírá náhradu**. To je přesně obava za předregistrovaným bodem 4 (K7).

## Krok 1 — explorace, izolovaně per počet hráčů

Počty hráčů jsou vzájemně nezávislé (`RULES.ruce[n]` ovlivňuje jen běhy
s `players===n`), takže K1 per count šlo změřit v izolovaných bězích a
kombinovat post-hoc — bez nutnosti simulovat všechny 4 počty najednou pro
každý kandidát. 1500 runů/pronásledovatel/buňka (3000/konfigurace), bot
`kompetentni`, jeden synchronní příkaz na krok.

| konfigurace | K1 | K5f | expDead | K2 drift/floor | K7 zachr. podíl/take | K7 hedge podíl |
|---|---|---|---|---|---|---|
| 1p ruka=8 (fix) | 67,8 | 58,8 | 10,3 | 1,74 / 22,4 | 6,2 / 100 | 29,7 |
| 2p ruka=5 (baseline) | 80,7 | 78,7 | 8,7 | 1,44 / 19,4 | 5,8 / 100 | 29,9 |
| **2p ruka=4** | **79,1** | 78,3 | 9,3 | 1,56 / 21,7 | 7,2 / 100 | 33,7 |
| 3p ruka=4 (baseline) | 86,9 | 84,7 | 6,6 | 1,37 / 15,5 | 4,4 / 100 | 27,6 |
| **3p ruka=3** | **82,2** | 81,2 | 7,5 | 1,40 / 19,2 | 5,9 / 100 | 33,0 |
| 4p ruka=3 (baseline) | 87,2 | 84,9 | 5,8 | 1,33 / 15,6 | 3,9 / 100 | 28,0 |
| **4p ruka=2** | **83,4** | 82,8 | 6,7 | 1,36 / 19,6 | 6,7 / 100 | 34,3 |

Směr je konzistentní a monotónní (menší ruka → nižší K1, jak páka slibuje),
ale **velikost efektu je malá**: 2p −1,6 b., 3p −4,7 b., 4p −3,8 b. — to je
zlomek toho, co je potřeba (2p chybí ~11 b. do stropu, 3p ~17 b., 4p ~17 b.
v baseline). Žádná izolovaná buňka se ani nepřiblíží pásmu [45,70]. K7
guardrail (zachr. take, silný take, hedge podíl) drží ve všech buňkách beze
změny; K2 gate (drift≥1,3 ∧ floor≥20) taky drží, floor dokonce mírně
poklesává k hraně 19,2–21,7 (pořád nad 20 většinou, ale blíž hranici).

**Kombinace post-hoc (K1 per count + K6a spread):**

| kombinace | K1 1p/2p/3p/4p | K6a spread | pásmo [45,70] |
|---|---|---|---|
| baseline (5/4/3) | 67,8 / 80,7 / 86,9 / 87,2 | 19,4 ❌ | ✅❌❌❌ |
| **floor (4/3/2)** | 67,8 / 79,1 / 82,2 / 83,4 | 15,6 ❌ | ✅❌❌❌ |
| mid (4/4/3) | 67,8 / 79,1 / 86,9 / 87,2 | 19,4 ❌ | ✅❌❌❌ |
| jen 4p (5/4/2) | 67,8 / 80,7 / 86,9 / 83,4 | 19,1 ❌ | ✅❌❌❌ |

Floor kombinace (nejagresivnější, na hraně guardrailu na všech třech počtech)
je **jednoznačně nejlepší dostupný kandidát** — dominuje ostatní kombinace na
každém počtu zvlášť. Žádná jiná kombinace v povoleném rozsahu ji nemůže
porazit (je to už maximum, které guardrail dovolí). Proto se dál měří jen ona,
plnou metodikou.

## Krok 2 — confirm, floor kombinace (2p=4, 3p=3, 4p=2), 2 bloky × 8000

Stejná metodika jako D57(2)/D58 dodatek §8 (`mereni-zar-malone-2026-08-02.md`):
4 počty × 2 pronásledovatelé × 1000 runů/buňka/blok, bot `kompetentni`, seedy
1–1000 (blok 1) a 1001–2000 (blok 2), verdikt = průměr bloků (D31). **Žádná
chyba za 16 000 runů** (guardrail na hraně 3p/4p neselhal ani jednou —
kombinace `ruka_minus` postihů s malou rukou se v praxi nesešla do stavu
„nelze committnout").

| Metrika | Baseline (§8, po D58) | Blok 1 | Blok 2 | Průměr | Δ vs. baseline |
|---|---|---|---|---|---|
| K1 celkem | 80,7 % | 78,3 % | 77,5 % | **77,9 %** | −2,8 b. |
| K1 1p | 68,35 % | 68,1 % | 68,6 % | 68,35 % | 0,0 (nedotčeno, čekáno) |
| K1 2p | 80,65 % | 79,0 % | 78,1 % | **78,55 %** | −2,1 b. |
| K1 3p | 86,60 % | 82,0 % | 81,8 % | **81,90 %** | −4,7 b. |
| K1 4p | 87,20 % | 84,1 % | 81,4 % | **82,75 %** | −4,45 b. |
| K6a spread | 19,0 | 16,0 | 13,2 | **14,6** ❌ | −4,4 b. (lepší, pořád ≫6) |
| K5-D expDead pooled | 7,85 % | 8,3 % | 8,3 % | 8,3 % | +0,45 (šum) |
| K5f celkem | 77,3 % | 76,3 % | 75,4 % | 75,85 % | −1,45 (pořád v [60,80]) |
| K5f proher_ve_finale | 96,85 % | 96,7 % | 96,6 % | 96,65 % ✅ | −0,2 (≥90 drží) |
| K2 (drift≥1,3 ∧ floor≥20) | plní | ✅ (1,48/20,3) | ✅ (1,52/21,0) | ✅ | beze změny |
| K7 (4 podmínky) | plní | ✅ vše 4/4 | ✅ vše 4/4 | ✅ | beze změny — **gamble EV se s menší rukou neprojevilo jako regrese** (take_zachranny 100 %, take_silny 0 %, hedge podíl ~32,5 % v pásmu 30–50 %) |
| zar median | 9 | 10 | 10 | 10 | +1 (mírně vyšší tempo) |

## Verdikt per kritéria

- **K1 per count → [45,70] nebo výrazné přiblížení: ❌ NESPLNĚNO ani jedno.**
  2p zůstává 8,55 b. nad stropem, 3p 11,9 b. nad, 4p 12,75 b. nad — i na
  **guardrail-floor** (nejagresivnější povolené nastavení). Uzavřený podíl
  mezery ke stropu 70: 2p ~20 %, 3p ~28 %, 4p ~26 %. To NENÍ „výrazné
  přiblížení" v smyslu předregistrace — je to citelný, ale malý ústupek.
- **K6a spread: ❌ NESPLNĚNO**, byť zlepšeno (19,0→14,6 b., uzavřeno ~34 %
  přebytku nad gate ≤6). Pořád 2,4× nad gate.
- **Guardrail: ✅ držel** — 16 000 runů na přesné hraně (3p=3, 4p=2) bez
  jediné chyby prázdné ruky/gamblu. Nejde ale dál — cokoli pod touto hranicí
  už porušuje předregistrovanou podmínku (gamble by ztratil zdroj karet).
- **K7: ✅ beze zhoršení** na floor kombinaci — obava „gamble EV závisí na
  zbytku ruky" se v souhrnných gate-metrikách nepotvrdila jako regrese (ale
  K7 tady měří JEN commit-uzly, ne přímo kvalitu náhrady při gamblu — jemnější
  efekt by potřeboval `learnability.js` běh, což nebylo v rozsahu kola).
- **K5-D, K5f, K2: ✅ beze zhoršení**, delty v rámci šumu pozorovaného
  i v D57(2)/D58 kole (0,3–1,5 b. mezi bloky).
- **K3, K4d, K6c: nezměřeno** (viz předregistrace bod 5–6) — nejde vzít jako
  tichý pass.

## Doporučení

**Páka `hraci[n].ruka` je u tohoto problému vyčerpaná i na guardrail-floor** —
stejná rodina nálezu jako D38 sweep `prahOffsetDlePoctu` (CLAUDE.md historie
kalibrací, -5): jediná bezobsahová páka existuje, je proměřená, a **sama
nestačí**. Zmenšení ruky zužuje výběr karty (funguje ve správném směru), ale
efekt je řádově menší než mezera K1 3p/4p vůči stropu 70 — protože hlavní
driver je **co-op škálování výběru** (víc hráčů = víc šancí najít dobrou
kombinaci karet do 4 slotů), a to zúžení ruky o 1 kartu neruší, jen mírně
otupuje.

Floor kombinace (2p=4, 3p=3, 4p=2) je nejlepší dostupný kandidát v rámci
tohoto sweepu a je bezpečná (žádná regrese jinam, guardrail drží) — pokud se
zapeče, ubere ~3–5 b. z K1 3p/4p a ~2 b. z 2p, s malým zlepšením K6a. Ale
**samotné to K1 do pásma nedostane.** Další krok, pokud se má 3p/4p breach
skutečně zavřít, pravděpodobně vyžaduje sáhnout na obsah nebo mechaniku
(např. commit-rozdělení mezi hráči, ne jen velikost ruky) — což je mimo
rozsah „bezobsahové páky" a potřebuje rozhodnutí uživatele/PM, ne další
sweep téhle páky.

---

*Nic z tohoto kola se nezapéká — `rules.js` zůstal nedotčen (injektáž jen
v `sim/sweep-ruka.js`). Skript zůstává v repu jako opakovatelný nástroj
(precedens `sweep-p1.js`) pro budoucí přeměření, kdyby se páka znovu otevřela.*

*Související: [[mereni-zar-malone-2026-08-02|mereni-zar-malone-2026-08-02.md]] §8
(baseline) · [[../projekt/rozhodnuti|projekt/rozhodnuti.md]] (D58 bod 4, D39
precedens rezervní páky, D38 precedens vyčerpané páky) ·
[[../prototyp-mvp|prototyp-mvp.md]] (K1, K6a, gate tabulka).*
