# Kalibrace-4 — výsledek: 7 z 9 gatů splněno, 2 otevřené

> **DODATEK 2026-07-27 (po opravě bota, D29 nález 3).** Rozhodnutím uživatele se
> jako první krok další iterace opravila commit i assign heuristika kompetentního
> bota, aby respektovala veřejné pravidlo štítku GANGSTER. **Všechna čísla níže
> jsou tím překonaná** — aktuální baseline je v §6. Souhrn posunu:
> gangster_auto_fail **9497 → 2858** propadů (−70 %); K1 per count
> **64,6 / 61,2 / 63,7 / 64,6** (breach žádný); K6a **3,4 b.**;
> K2 drift **1,18 → 1,26**; K5 expDead **11,3 → 10,7 %**.
> Otevřené gaty se nezměnily co do identity, jen se přiblížily.

> **STAV: brána Fáze 0 NENÍ splněna.** Splněno je K1 (per-count), K6a, K5f,
> K7 a K3/K4/K8/K9; **nesplněné zůstávají K2 drift (1,18 proti ≥1,3)** a
> **K5 varianta D (11,3 % proti ≤10 %)**, plus jeden marginální breach K5f
> (4p Brody 80,1 proti stropu 80). Ani jeden gate se **nesnížil** — oba otevřené
> jsou vstupním zadáním další iterace, ne slevou.

*Sestavil: PM. Datum: 2026-07-27. Navazuje na
[[kalibrace-4-2026-07-27]] (podmínky platnosti 0a–0d a eskalace D27) a na
[[kalibrace-4-brana-navrh-2026-07-27]] (balík D26). Znění brány zapečeno
v [[../prototyp-mvp|prototyp-mvp.md]] Fáze 0 (D26 + D28/V1).
Měřeno 1000 seedů × 4 počty hráčů × 2 pronásledovatelé = 8000 runů,
bot `kompetentni`, formalizovaný `sim/report.js`.*

---

## 1. Gate-tabulka — konečný stav

| # | Metrika | Gate | Baseline (před kal-4) | **Po kalibraci-4** | Plní? |
|---|---|---|---|---|---|
| **K1** | % DORUČENO per count | každý ∈ [45, 70] % | 59,1 / 67,4 / **70,7** / **70,9** | **61,6 / 56,6 / 59,1 / 60,3** | ✅ **NOVĚ** |
| **K2** | drift PRŮŠVIH-rate 3–4 / 1–2 | ≥ 1,3 | 1,14 | **1,18** | ❌ |
| **K2** | floor pozdní PRŮŠVIH-rate | ≥ 20 % | 26,2 | **25,4 %** | ✅ |
| **K4d** | learnabilita commit osy | ≥ τ (6 b.) ∧ memo ≤3 ∧ monotonie | 9,1 / −4,8 / ✅ | **9,1 / −4,8 / ✅** | ✅ |
| **K5** | varianta D `expDead` | ≤ 10 % | 13,1 | **11,3 %** | ❌ |
| **K5f** | přežití konfrontace | ∈ [60, 80] % per count × pronásl. | breach 3p Brody 81,6 | **breach 4p Brody 80,1** | ❌ marginálně |
| **K5f** | podíl proher ve finále | ≥ 90 % | 97,2 | **97,1 %** | ✅ |
| **K6a** | spread win-rate 1–4p | ≤ 6 b. | 11,8 | **5,0 b.** | ✅ **NOVĚ** |
| **K7** | podíl uzlů záchranný gamble | ≤ 15 % | 12,5 | **10,1 %** | ✅ |
| **K7** | take záchranný | ≥ 80 % | 100 | **100 %** | ✅ |
| **K7 (3′)** | DiD gamble vs. bez gamblu | ≥ −3 b. | −0,2 / +1,0 | **−0,2 / +1,0** | ✅ |
| **K7** | take při odhadu ≥3 | ≈ 0 % | 0 | **0 %** | ✅ |

Doprovodné: pásma common 4/4 6,8 · 3/4 30,7 · 2/4 38,7 · ≤1/4 23,8 %;
fail-rate viditelných slotů 50,4 % vs. skrytých 35,6 %; medián kreditů 6,
medián Žáru 7, medián uzlů 7.

---

## 2. Co kalibrace-4 udělala (chronologicky, s cenou)

### P2 — řešitelnost bez hodnota-slotu (D25e)

**Kořenová příčina, kterou nikdo dosud nepojmenoval:** `prah = clamp(kotva + šum,
0, 5)` znamená, že **kotva 4 dává prahy [2, 3, 4, 5, 5]** — clamp zdvojuje pětku,
takže **40 % instancí vyžaduje stat 5**. Balíček má na úrovni 5 po jednom nositeli
u obrany/improvizace/nástroje a u útoku **nula použitelných** (obě pětky jsou
GANGSTER, ten ve viditelné roli NPC auto-failuje). Kotva 4 na řídkém statu tedy
není těžký slot, ale **hod mincí o mrtvý slot**.

Zapečeno: 5 cílených kotev 4→3 (`nadrazi-vypravci`, `privoz-celnik`,
`deputy-hlidka`, `urednik-razitko`, `rival-parley`). Druhá kotva 4 v každé
situaci **zůstala** — je to fikční jádro scény a hranice mezi „řešitelné"
a „pohodlné". `farmar-brod` a `deputy-mytnice` netknuty (už byly v pásmu).

**Zamítnuto měřením:** varianta „přesuny statů věcí" (pokrytí balíčku). Kupuje
−2,3 b. K5 za +5,7 b. K1(4p), +1,6 K6a a +3,0 K5f — **~4× dražší než kotvy**,
protože se dotýká všech kotev 4 ve hře včetně Malonovy léčky a obou konfrontací,
tedy tlačí finále přesně opačným směrem, než potřebuje P1. `veci.yaml` netknutý.

### P3 — derivace `improv_skryte` (D25f)

Próza telegrafu skrytou improvizační roli hlásila už dnes („jedna skrytá ho zmate
papírem"), ale `deriveTelegrafSignal` ji nenesl → informovaný hráč na ni nemohl
reagovat commitem a slot byl fakticky naslepo. **Próza a strojový signál si
protiřečily** (porušení QA invariantu věrnosti, D19). Obsah se nemění.

Efekt: `nadrazi-vypravci` `max≤1` pod Malonem 38,5 → **31,6 %**, slot
„Zmást papírem" fail-rate 42,4 → 37,6 %. Celkově malý, protože v obsahu je
**jediný** skrytý improvizační slot.

### P1 — dorovnání 1–4p (D25d) — hlavní úspěch kalibrace-4

Nová per-count páka `zar.prahOffsetDlePoctu`: posun prahů trati
(zatah/lecka/konfrontace) dolů. **Sólo hraje na plnou trať, tým na zkrácenou
o 2.** Fikce: víc lidí v autě = víc hluku, víc svědků, dřív si vás všimnou.

**Zamítnutá operacionalizace (měřením):** násobič přírůstku Žáru. Přírůstky jsou
1–2, takže `ceil(1 × 1,25) = 2` je skok o 100 % a tempa 1,25 i 1,5 dávají
**identické** výsledky — K1 4p spadlo 75,5 → 45,6 bez čehokoli mezi tím. Posun
prahu o 1 je nejjemnější krok, který trať dovoluje.

Výsledek: **K1 breach zmizel u všech počtů, K6a 11,0 → 5,0 b.** To je poprvé od
pivotu v3, kdy obě metriky procházejí současně.

**Pass K6a není artefakt jednoho bloku seedů.** Doměřeno 6 disjunktních bloků
po 1000 seedech: spread **mean 4,35 · sd 0,43 · min 3,8 · max 5,0 · 2sd = 0,86**.
Gate ≤6 b. tedy drží s rezervou větší než dvojnásobek šumu (před P1 byl
mean 11,31 · sd 1,61). Podmínka kritika k D26 bodu 5 je splněna i po zásahu.

**P4 (ruka 1p 8→9) se NEPROVÁDÍ** — měla přijít až po P1 a P1 ji zbytečnou: 1p je
po dorovnání na 61,6 %, tedy nejvyšší ze všech počtů. Zvětšení ruky by ho
vystřelilo dál od ostatních a rozbilo K6a.

---

## 3. Co NEPLNÍ a proč (žádná tichá sleva)

### K2 drift 1,18 proti gate ≥ 1,3 — diagnóza hotová, lék neproveden

Snowball mechanismus **existuje**, ale je slabý: korelace „počet aktivních
informačních postihů × počet zásahů" je **−0,131** (správné znaménko, malá síla).
Poměr počtu postihů je saturovaný capem 2, proto je od D26 jen diagnostika.

**Nejsilnější neprozkoumaná páka — pořadí situací.** PRŮŠVIH-rate se mezi
situacemi liší **3,8násobně** (10,1 % až 38,6 %), ale situace se losují zhruba
rovnoměrně (n ≈ 2500 na každou):

| nejtvrdší | % | nejměkčí | % |
|---|---|---|---|
| rival-prepad | 38,6 | most-prohnila-prkna | 10,1 |
| mesto-ulicka | 36,4 | nadrazi-noc | 11,9 |
| nadrazi-vypravci | 34,1 | mesto-houkacky | 13,3 |

Kdyby se pozdní uzly losovaly z tvrdšího poolu a rané z měkčího, drift by vzrostl
**bez sáhnutí na jedinou kotvu** — a to je přesně směr D22d („pozdní snowball
obsahem"). Vyžaduje ale krokově podmíněné pooly v `mista.yaml` + podporu v mapě,
tedy engine i obsah. **Neprovedeno v této session** — je to samostatná iterace,
ne doladění.

**Dosažitelnost 1,3 zůstává neověřená.** Pokud se ani přeuspořádáním poolů
nedosáhne, vrací se to jako P-rozhodnutí uživatele (D26 bod 5 to explicitně
předjímá), ne jako tiché snížení.

### K5 varianta D 11,3 % proti gate ≤ 10 % — vázající je Malone

Rozpad je jednoznačný:

| | Malone | Brody |
|---|---|---|
| 1p | **17,8** | 10,3 |
| 2p | **16,0** | 8,4 ✅ |
| 3p | **13,7** | 6,5 ✅ |
| 4p | **11,5** | 5,8 ✅ |

**Brody gate plní u 2p/3p/4p; Malone ho nesplní nikde.** Zbytek mezery drží
`nadrazi-vypravci` (31,6 %) a `privoz-celnik` (34,7 %) — obě situace, kde vedle
mrtvého hodnota-slotu zůstala druhá kotva 4 na řídkém statu (fikční jádro scény,
záměrně neškrtnuto).

**Identifikovaný další lék (neproveden):** varianta C z návrhu content-generatora
— přidat `stitek_citlivy: GANGSTER` slotu „Zatlačit hrubě". Nesnižuje žádný práh,
jen otevírá nabídku (utok ≥5 z 0 na 2 karty), má vestavěnou cenu v Žáru a jako
jediná **pomáhá i K2**. **Blokátor:** `deriveTelegrafSignal`
(`prototyp/src/engine/resolve.js`) odvozuje verdikt zbraně jen z typu situace
a slotové `stitek_citlivy` ignoruje — bez opravy by próza telegrafu lhala.
Patří technical-developerovi, nutné **před** měřením C.

### K5f 4p Brody 80,1 % proti stropu 80 — marginální

Byl 3p Brody 81,6; P1 ho posunul na 4p Brody 80,1. Je to **0,1 b. nad stropem**,
tedy uvnitř run-to-run šumu. Neřešit samostatně — vyřeší se při iteraci K2/K5.

---

## 4. Nálezy mimo mandát (hlásím, neměním)

1. **Viditelný `utok`-4 slot v NPC situaci je ve 40 % instancí nesplnitelný.**
   Horní konec útočné křivky je celý GANGSTER a ten ve viditelné roli NPC
   auto-failuje → non-GANGSTER `utok ≥5` je **0 karet ze 40**. Týká se
   `rival-prepad`, `urednik-vaha`, `mesto-ulicka` (a `nadrazi-vypravci`, řešeno).
   Není náhoda, že první dvě jsou zároveň dvě nejtvrdší situace ve hře.
2. **Kombi slot `[nastroj, improvizace]` je nesplnitelný nad práh 3** — žádná věc
   nemá oba staty ≥4; jediná s oběma ≥3 je `stary-kompas`.
3. **Kompetentní bot ignoruje `zbran_projde`.** V `nadrazi-vypravci` je
   **107 z 204 propadů** útočného slotu `gangster_auto_fail` — bot committne
   nejsilnější útočnou kartu, přestože telegraf hlásí „zbraň na očích neprojde".
   Bot je tu **hloupější než kompetentní člověk**, takže K5/K1 jsou o tuhle
   chybu pesimistické. Oprava commit-heuristiky je změna referenční strategie →
   re-baseline všeho; **rozhodnutí, ne údržba.**
4. **Saturace pokrytím (z D27):** přínos dokonalého čtení telegrafu je +5,1 b.
   u 1p, ale ≈0 u 2–4p. Commit je u čtyř hráčů slabší rozhodnutí než sólo —
   patří na watchlist lidské brány (metrika 1 „stůl se hádá").
5. **3p je potrvé problémový count** (nález kritika u D27): na K4d má jen 7,9 b.
   proti prahu 6, tedy nejmenší rezervu ze všech počtů.

---

## 5. Doporučené pořadí další iterace

1. **Oprava `deriveTelegrafSignal`** o slotové `stitek_citlivy` (technical-developer)
   — odblokuje variantu C a odstraní latentní próza/signál drift.
2. **Varianta C** na `nadrazi-vypravci` → měřit dopad na K5-D i K2.
3. **K2: krokově podmíněné pooly** (tvrdé situace pozdě, měkké brzy) — jediná
   páka, která zvedne drift bez sáhnutí na kotvy. Engine + `mista.yaml`.
4. **Rozhodnout o commit-heuristice bota** (nález 3) — pokud se opraví, celý
   baseline se musí přeměřit.
5. Teprve pak re-měření celé brány a Go/No-Go k lidské bráně.

---

---

## 6. Aktuální baseline po opravě bota (2026-07-27, `f3bb97d`)

Referenční bot byl v jednom místě hloupější než člověk u stolu: telegraf hlásí
doslova „zbraň na očích neprojde" a `stitky.yaml` vede to pravidlo jako **veřejné**,
ale bot ho ignoroval na **obou** osách — v commitu i v přiřazení. Zbraň s útokem 5
měla ve viditelném utok-slotu nejvyšší skóre, přestože tam padne bez ohledu na
staty. Gate tedy neměřil hru, ale botovu chybu.

| # | Metrika | Gate | Před opravou | **Po opravě** | Plní? |
|---|---|---|---|---|---|
| **K1** | % DORUČENO per count | ∈ [45, 70] % | 61,6 / 56,6 / 59,1 / 60,3 | **64,6 / 61,2 / 63,7 / 64,6** | ✅ |
| **K2** | drift PRŮŠVIH-rate | ≥ 1,3 | 1,18 | **1,26** | ❌ |
| **K2** | floor pozdní PRŮŠVIH-rate | ≥ 20 % | 25,4 | **23,5 %** | ✅ |
| **K5** | varianta D `expDead` | ≤ 10 % | 11,3 | **10,7 %** | ❌ |
| **K5f** | přežití konfrontace | ∈ [60, 80] % | breach 4p Brody 80,1 | **breach 3p Brody 80,6 · 4p Malone 80,5** | ❌ marginálně |
| **K5f** | podíl proher ve finále | ≥ 90 % | 97,1 | **97,8 %** | ✅ |
| **K6a** | spread 1–4p | ≤ 6 b. | 5,0 | **3,4 b.** | ✅ |
| **K7** | podíl uzlů záchranný | ≤ 15 % | 10,1 | **8,0 %** | ✅ |

**Co to znamená pro zbývající dva gaty:**

- **K2 drift 1,26** — oprava bota přiblížila drift ke gate **bez jediného zásahu
  do obsahu** (1,18 → 1,26). Mechanismus: kompetentní hráč teď v raných uzlech
  nechybuje, kdežto v pozdních ho `hide_telegraf` oslepí a on zbraně committne
  znovu — tedy snowball konečně funguje tak, jak byl navržen. Zbývá **0,04**.
  Páka „krokově podmíněné pooly" je stále nepoužitá a měla by na to stačit.
- **K5 expDead 10,7 %** — vázající je dál **výhradně Malone**
  (10,9–16,6 % vs. Brody 5,9–10,0 %). Zbývá **0,7 b.**
- **K5f** se opravou mírně **zhoršila**: lepší bot přežívá konfrontaci častěji.
  Žár-offsety to neopraví — dřívější konfrontace znamená zdravější tým, tedy
  vyšší přežití. Páka je severita finále (obsah), ne tempo trati.
  P1 offsety `{0,2,2,2}` byly nad opraveným botem přeověřeny sweepem a zůstávají
  optimální (spread 2,6 b.), takže re-tune netřeba.

---

*Podklady měření (scratchpad 2026-07-27): `kal4-final/summary.{md,json}`,
`cf-bot/`, `cf-bot2/` (oprava bota),
`kal4-baseline/`, `cf-a/`, `cf-b/`, `cf-b5/`, `cf-p3/`, `cf-p1/`,
`kal4-learnabilita.{md,json}`, `kal4-variance/`. Kontrafaktuální artefakty
k P2 doloženy dle change-controlu D26 bodu 6. Nástroje: `sim/report.js`,
`sim/learnability.js`, `sim/sweep-p1.js`, `sim/run.js --blocks`.*
