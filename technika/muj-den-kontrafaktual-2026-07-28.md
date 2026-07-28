# `muj-den` — kontrafaktuál kandidáta V-3 a retrakce D42 (2026-07-28)

**Role:** playtest-facilitator. **Mandát:** postavit měřicí podporu (metrika podílu,
oprava parseru, trvalý sloupec divergence) a kontrafaktuálně změřit kandidáta V-3
proti předregistrovaným kritériím ze `scratchpad/muj-den-navrh.md` §D.
**Do `obsah/cile.yaml` se nezapisovalo nic** — kandidáti žijí ve scratchpadu
a měří se přes `CONTENT_DIR`. Zapečení je rozhodnutí uživatele.

Graf k tomuto reportu: [`muj-den-kontrafaktual-2026-07-28.html`](muj-den-kontrafaktual-2026-07-28.html)
(míra splnění per počet hráčů proti pásmu; normalizovaná divergence osmi cílů).

---

## 1. Co se změnilo v `prototyp/`

Čtyři soubory, všechno aditivní. **Testy: 237 passed / 11 souborů** (bylo 233 —
přibyly 4). Enginová a měřicí část je užitečná bez ohledu na verdikt o obsahu,
proto je commitnutá zvlášť od jakéhokoli rozhodnutí o cíli.

| Soubor | Změna |
|---|---|
| `src/engine/events.js` | (a) `deriveGoalMetrics` nově vrací `sloty_vlastnika_celkem` a `podil_slotu_splnil_pct` (celá procenta, guard na nulovém jmenovateli → 0); obě v `METRIC_SPEC`. (b) **oprava potvrzeného bugu parseru:** `parseValue` házel jen na nečíselném vstupu, takže `podminka: "cokoli >= 0.6"` prošla loaderem i testy a byla **vždy pravda** (řetězec `"0.6"` protáhl `evalCondition` přes `Number()`). Nově neceločíselný numerický literál **vyhodí českou chybu**. |
| `src/engine/state.js` | +1 pole `nahrazena_hrac_id` v události `gamble` — vlastník přepsaného slotu v logu dosud nebyl nikde. |
| `sim/report.js` | +**trvalý sloupec divergence verdiktu** pro všechny mechanické cíle: raw %, marginální míra, `null_strop = 1 − p^m − (1−p)^m`, normalizovaná = raw/strop. Per počet hráčů. Žije uvnitř bloku `cile`. |
| `test/metrics.test.js` | +4 testy: jmenovatel a zaokrouhlení podílu, guard na nule, odgamblovaný slot v jmenovateli, odmítnutí desetinného literálu. |

**Jmenovatel počítá i odgamblované sloty vlastníka** — doloženo kódem, ne
předpokladem: `state.js` v `gamble()` přepisuje `situ.committed[ci]` **včetně
`hrac_id`**, nahrazená karta jde do odhazovaliště a nikdy se nevyhodnotí. Bez
téhle atribuce by šel podíl vylepšit tím, že tým utratí (jeden na situaci) gamble
na moji odsouzenou kartu — soukromá páka na sdílený zdroj.

**Ověřeno, netvrzeno: `sim/assign.js` se měnit nemá.** Kvóta commitu je
`Math.min(kvóta, ruka.length)` (`buildCommitPlan`), takže **v rámci uzlu je
jmenovatel exogenní** → maximalizace podílu = maximalizace počtu zásahů a
`goalBias` „tlač vlastní průchod" platí beze změny. Změřeno i empiricky: podíl
uzlů, kde se týmově optimální přiřazení liší od přiřazení s biasem držitele, je
**8,5 / 22,6 / 17,4 / 15,5 %** (1–4p) a je **identický** pro obě znění cíle —
bias je týž objekt.

### Regresní rozpočet: NULA (doloženo dvakrát)

1. **Před × po enginové změně**, 4 000 runů (500 seedů × 1–4p × 2 pronásledovatelé,
   `kompetentni`, seed 1), rekurzivní diff `summary.json`: **56 rozdílů, všech 56
   je nový klíč `cile.<id>.divergence`.** Nula rozdílů v K1, K2, K5, K5-D, K5f,
   K6a, K6c, K7, K8, per-situace i per-slot.
2. **Base × kandidát přes `CONTENT_DIR`**, 8 000 runů: **46 rozdílů, mimo blok
   `cile` a `verzeObsahu` jich je 0.** K9 zbylých sedmi cílů je bit po bitu
   totožná (`bez-jizvy` 49,5 → 49,5; `cista-ruka` 42,9 → 42,9; `dve-jizvy` 34,0;
   `hazarder` 72,6; `kupecke-slovo` 27,8; `plny-zasah` 46,9; `schovana-bouchacka`
   30,8). Hýbe se **jen** `muj-den`.

**Golden snapshot:** jediná povolená změna, doložená diffem — `git diff --stat`
hlásí **3 insertions, 0 deletions**, a všechny tři vložené řádky jsou
`"nahrazena_hrac_id": …`. Nic jiného se v logu nezměnilo.

---

## 2. Metodika

- **Dávka:** 4 disjunktní bloky × 1 000 seedů × 4 počty hráčů × 2 pronásledovatelé
  = 32 000 runů na strategii; strategie `kompetentni` (incidenční, gate bot) a
  `cile` (kanonický bias λ=3, který `assign.js` pro `muj-den` už má). **64 000 runů**
  v hlavní dávce + 8 000 na regresi + 40 000 na `CONTENT_DIR` kontrolu pěti sad
  obsahu + 12 000 na K6b diagnostiku. Verdikt vždy z **průměru přes bloky** (D31),
  v tabulkách je i min–max bloků.
- **Jmenovatel míry splnění = runy, kde cíl někdo drží** (v 1p ho drží 1/8 runů) —
  táž báze, na jaké K9 počítá `report.js`. Bez toho vycházejí míry ~8× nižší;
  na tuhle past jsem během kola sám narazil a je to důvod, proč jsou v tabulkách
  vedle sebe i sloupce `n`.
- **Sweep cutů se počítá post-hoc z týchž runů.** Je to exaktní, ne aproximace:
  pod botem `kompetentni` je běh na cílech nezávislý, a pod botem `cile` závisí
  bias jen na `id` cíle, které se nemění. Průchodnost celé cesty (loader → parser
  → K9) je navíc ověřena zvlášť přes `CONTENT_DIR` pro každý ze čtyř cutů.
- Skripty jsou jednorázové (`scratchpad/harness-mujden.mjs`), staví nad reálným
  enginem (`createRun`, `deriveGoalMetrics`, `parseCondition`) a metriky nepočítají
  po svém.

---

## 3. Baseline dnešního `muj-den` — prosba (i) splněna

Nepodmíněně (báze K9), bot `kompetentni`, průměr bloků `[min–max]`:

| | 1p | 2p | 3p | 4p |
|---|---|---|---|---|
| **dnešní `pocet_slotu_splnil >= 3`** | **99,4** [98,9–100] | **98,3** [98,0–98,9] | **96,0** [95,1–96,7] | **91,4** [90,4–92,0] |
| podmíněně `doruceno` | 100 | 100 | 99,5 | 96,1 |
| zásoba slotů vlastníka (medián / průměr) | 32 / 32,1 | 18 / 18,4 | 12 / 12,3 | 9 / 9,1 |

**4p = 91,4 %, tedy uvnitř předregistrovaného pásma 85–93 %.** Diagnóza designéra
je **potvrzena**: cíl je téměř automatický i tam, kde má nejméně slotů. Alternativa
„< 70 % → diagnóza je neúplná" se nespustila.

Zásoba slotů škáluje **3,5×** mezi 1p a 4p (32,1 → 9,1), ne 4× — protože běžný run
má víc než 7 rozhodnutých uzlů (vložené léčky a konfrontace). Směr i řád diagnózy
to nemění.

---

## 4. Divergence verdiktu per počet hráčů — prosba (ii) splněna, a RETRAKCE

Bot `kompetentni` (incidenční čtení), 32 000 runů. `raw` = % runů, kde by verdikt
téhož cíle mezi postavami vyšel různě; `marg` = průměrná míra splnění přes všechny
postavy; `strop` = `1 − p^m − (1−p)^m` (maximum při nezávislých verdiktech);
**`norm` = raw / strop**.

| cíl | 2p raw / marg / strop / **norm** | 3p | 4p |
|---|---|---|---|
| `hazarder` | 56,6 / 36,8 / 46,5 / **1,22** | 71,8 / 36,4 / 69,4 / **1,03** | 77,7 / 20,6 / 60,1 / **1,29** |
| `schovana-bouchacka` | 36,2 / 37,3 / 46,8 / **0,77** | 58,5 / 31,2 / 64,4 / **0,91** | 63,9 / 25,4 / 68,6 / **0,93** |
| `dve-jizvy` | 30,9 / 44,1 / 49,3 / **0,63** | 58,4 / 34,2 / 67,5 / **0,86** | 62,7 / 25,0 / 68,0 / **0,92** |
| `cista-ruka` | 35,7 / 26,5 / 39,0 / **0,92** | 62,5 / 43,4 / 73,7 / **0,85** | 68,6 / 52,2 / 87,4 / **0,79** |
| **`muj-den` (dnes)** | **3,0 / 98,1 / 3,7 / 0,80** | **7,7 / 96,2 / 10,9 / 0,71** | **21,1 / 91,8 / 28,9 / 0,73** |
| `bez-jizvy` | 33,0 / 36,9 / 46,6 / **0,71** | 49,1 / 52,7 / 74,8 / **0,66** | 54,9 / 59,4 / 84,9 / **0,65** |
| `kupecke-slovo` | 6,1 / 18,2 / 29,8 / **0,20** | 21,5 / 28,2 / 60,7 / **0,35** | 38,0 / 32,1 / 77,7 / **0,49** |
| `plny-zasah` | 0,0 / 41,2 / 48,5 / **0,00** | 0,8 / 48,7 / 75,0 / **0,01** | 2,8 / 50,8 / 87,5 / **0,03** |
| **kandidát V-3, řez 50 %** | 41,0 / 60,9 / 47,6 / **0,86** | 62,9 / 65,8 / 67,6 / **0,93** | 74,4 / 66,8 / 78,9 / **0,94** |

### Odpověď na dvě otázky retrakce — natvrdo

**1. Drží verdikt D42 o `schovana-bouchacka`? ANO. Jeho zdůvodnění v `cile.yaml` NE.**

Normalizovaně 0,77 / 0,91 / 0,93 — nad prahem 0,7 u všech počtů, v pásmu ostatních
osobních cílů. Verdikt „A je osobní cíl" tedy **stojí**.

Neplatí ale to, co je u cíle napsáno. Dvě chyby, obě doložené měřením:
- **Absolutní divergence není důkaz osobnosti**, protože je funkcí marginální míry.
  Doklad ze stejné tabulky: `plny-zasah` má raw 2,8 % a `muj-den` raw 21,1 % — ale
  po normalizaci je první exaktně týmový (0,03) a druhý osobní (0,73). Absolutní
  čísla ta dva cíle **řadí obráceně**, než jaká je jejich struktura.
- **Rozsah „41,8–52,9 %" není per počet hráčů.** Reprodukovat ho jde jen jako
  min–max **přes počty** při čtení botem `cile` (naměřeno 26,5 / 46,0 / 53,0 pro
  2p/3p/4p). Jako baseline byl tedy nepoužitelný — přesně jak designér tušil.

**Navržené správné znění poznámky** (do `obsah/cile.yaml` nezapisuji — předkládám):

> Osobnost cíle je doložena **normalizovanou** divergencí verdiktu (incidenční
> čtení, bot `kompetentni`, 32 000 runů): při marginální míře 37,3 / 31,2 / 25,4 %
> (2p/3p/4p) je strop divergence při nezávislosti `1 − p^m − (1−p)^m` roven
> 46,8 / 64,4 / 68,6 %; naměřeno 36,2 / 58,5 / 63,9 %, tj. **0,77 / 0,91 / 0,93
> stropu** — verdikty hráčů jsou téměř nezávislé. Absolutní čísla z D42
> (41,8–52,9 %) byla min–max **přes počty hráčů** při čtení botem `cile` a
> samostatně osobnost nedokazují: divergence je funkce marginální míry.

**2. Drží zamítnutí kandidátů B/C? ANO, a fortiori — potvrzeno.**

Nula je pod nullem za všech okolností, které v datech nastaly. Normalizace by
zamítnutí mohla zvrátit jen tehdy, kdyby byl strop sám nulový, což vyžaduje
marginální míru přesně 0 % nebo 100 %. B i C se plnily v 7,3–72,4 % (D42), takže
jejich strop je řádu desítek procent a `0,00 / strop = 0,00`. Zamítnutí stojí
na silnějším základě než dřív, ne slabším.

### Vedlejší nálezy z normalizace (patří game-designerovi, neřeším je tady)

- **`kupecke-slovo` je z poloviny týmový cíl** (0,20 / 0,35 / 0,49) — jeho D42 raw
  15–22 % tohle skrývalo. Kdyby se kritérium „norm ≥ 0,7", které tohle kolo
  aplikuje na kandidáta, aplikovalo na zapečenou sadu, **neprojde ani
  `kupecke-slovo`, ani `plny-zasah`** a `bez-jizvy` je na hraně (0,71 / 0,66 / 0,65).
- **`hazarder` má norm > 1** (až 1,29). Není to chyba měřidla: gamble čerpá z ruky
  **jednoho** hráče, takže verdikty jsou záporně korelované — divergence je vyšší,
  než umožňuje nezávislost. Je to nejosobnější cíl sady.

---

## 5. Sweep cutů proti předregistrovaným pásmům

Bot `kompetentni`, nepodmíněně, průměr bloků `[min–max]`. Pásmo přijetí **20–70 %**
u všech čtyř počtů; žádný blok mimo **12–80 %**.

| řez | 1p | 2p | 3p | 4p | D3.1 |
|---|---|---|---|---|---|
| **50 % („půlka")** | **43,8** [42,2–45,9] | **61,3** [59,8–64,0] | **66,9** [64,4–68,4] | **67,2** [66,3–69,0] | **✅** |
| 60 % („tři z pěti") | **17,8** [15,7–19,4] | 30,2 | 39,4 | 43,0 | ❌ 1p pod 20 |
| 67 % („dvě ze tří") | 6,8 | 16,5 | 25,3 | 28,1 | ❌ 1p, 2p |
| 75 % („tři ze čtyř") | 1,5 | 5,9 | 11,0 | 15,2 | ❌ 1p, 2p, 3p |

Doplňková čtení pro **řez 50 %**:

| kritérium | 1p | 2p | 3p | 4p | práh | verdikt |
|---|---|---|---|---|---|---|
| podmíněně `doruceno` | 68,4 | 76,1 | 73,5 | 72,8 | 30–80 % | ✅ |
| čtení s biasem λ=3 (`cile`) | 44,3 | 63,8 | 70,4 | 71,5 | ≤ 80 % | ✅ |
| **normalizovaná divergence** | — | **0,86** | **0,93** | **0,94** | ≥ 0,7 | ✅ |
| **absolutní divergence** | — | **41,0** | **62,9** | **74,4** | ≥25 / ≥35 / ≥35 | ✅ |
| guard-kill (`n < 5`) | 0,0 | 0,0 | 0,0 | 0,7 (1,8 s biasem) | < 15 % | ✅ |
| efektivní práh `k` z `n` | 16 z 32 | 9 z 18 | 6 z 12 | 5 z 9 | — | ⌈n/2⌉ |

Histogram realizovaného `n` (sloty vlastníka; min / p10 / medián / p90 / max):
1p 14/24/32/41/56 · 2p 6/12/18/24/34 · 3p 4/8/12/16/26 · **4p 3/6/9/12/22**.
Guard `>= 5` tedy kouše skoro výhradně ve 4p a i tam jen v 0,7 % runů — je to
poctivá ochrana malého vzorku, ne skrytá per-count klauzule.

### Výběr cutu podle předregistrovaného pravidla D5

Maximin rezerva k hranám pásma: **řez 50 % = 2,8 b.** (4p k horní hraně);
řezy 60/67/75 mají rezervu **zápornou** (jsou mimo pásmo). Tie-break se
neuplatňuje — průchozí cut je jediný. „Půlka" je zároveň jediná frakce, kterou
lze napsat na dobovou kartu bez počítání.

### Skóre předregistrace naslepo (co predikce trefila a co ne)

| predikce (§D2, řez 60) | 1p | 2p | 3p | 4p |
|---|---|---|---|---|
| designér | 25–55 | 25–55 | 28–58 | 30–60 |
| **naměřeno** | **17,8 ❌** | 30,2 ✅ | 39,4 ✅ | 43,0 ✅ |

- Podmíněná míra: predikce 45–80 % u všech počtů, naměřeno **30,7 / 40,5 / 45,0 /
  48,0** → 1p a 2p **mimo**.
- Normalizovaná divergence: predikce 0,75–1,0, naměřeno 0,92 / 0,94 / 0,97 ✅.
- Guard-kill: predikce <10 % (1–3p) a <20 % (4p), naměřeno ≤0,7 % ✅ (přestřeleno
  na bezpečnou stranu).
- Nezávislý odhad kritika („řez 60: 1p ~44 %, 4p ~36 %") je **mimo u obou konců
  a s obráceným pořadím**.

**Proč se to nepovedlo — a je to hlavní nález kola:** podíl odstranil závislost
**polohy** na počtu hráčů (průměrný podíl držitele je 47,1 / 51,9 / 54,6 / 55,0 %,
rozpětí 7,9 b.), ale **nezávislost rozptylu nezajistil — obrátil ji**. Rozptyl
podílu klesá jako 1/√n, a `n` škáluje 3,5× dolů, takže sólo hráč se svými ~32
sloty leží těsně kolem průměru, kdežto čtyřčlenná parta má s ~9 sloty široký chvost.
Práh položený blízko průměru je proto **v sólu nejtěžší a ve čtyřech nejlehčí** —
přesně naopak, než čekali designér i kritik. Rozpětí přes počty je u řezu 50
**23,4 b.** proti 8,0 b. u dnešního prahu; dnešní rozpětí je ale malé jen proto,
že je celé slepené o strop. Věta „vada je v metrice, ne v prahu" tedy platí ve
svém **důsledku** (existuje plochý práh, který sedne všem čtyřem počtům), ale
mechanismus, kterým to funguje, je jiný než v diagnóze.

---

## 6. K6b a tempo — varování, které D4 ukládá vyslovit

Měřeno nad rozhodovacími uzly držitele (uzel, kde má aspoň jeden slot; medián
7–9 uzlů na run):

| | 1p | 2p | 3p | 4p |
|---|---|---|---|---|
| **cíl je ještě nerozhodnutý** — dnešní `>= 3` | 21,7 % | 32,9 % | 45,1 % | 57,5 % |
| **cíl je ještě nerozhodnutý** — řez 50 % | **88,8 %** | **86,4 %** | **82,6 %** | **80,2 %** |
| konflikt s týmovým optimem (celkem) | 8,5 % | 22,6 % | 17,4 % | 15,5 % |
| **konflikt ∧ cíl živý** — dnešní `>= 3` | 1,8 % | 7,9 % | 7,9 % | 9,1 % |
| **konflikt ∧ cíl živý** — řez 50 % | 7,6 % | 19,6 % | 14,3 % | 12,5 % |

Nový rozsah je přesně ten, který designér avizoval: pod dnešním prahem je cíl v
sólu mrtvý po ~1/5 uzlů, pod podílem žije v ~85 % uzlů. **Práh D4 „> 50 % uzlů"
je tím překročen**, takže kolo podle vlastního pravidla končí eskalací na
uživatele s tempovým varováním.

Poctivé zmírnění téhož čísla: *živý* cíl ještě neznamená *spor*. Uzlů, kde se
držitelovo preferované přiřazení skutečně liší od týmově optimálního, je
**7,6–19,6 %** — zhruba dvojnásobek dneška, ne „debata u každého uzlu". Kolik
z toho se u stolu promění v hádku, simulace nezjistí.

---

## 7. Verdikt proti předregistrovaným kritériím

| kritérium (§D3) | řez 50 % |
|---|---|
| D3.1 pásmo 20–70 % u všech počtů, žádný blok mimo 12–80 % | ✅ (nejtěsněji 4p 67,2, blok max 69,0) |
| D3.1 podmíněně 30–80 % | ✅ 68,4–76,1 |
| D3.2 čtení s λ=3 ≤ 80 % | ✅ max 71,5 |
| D3.3 normalizovaná divergence ≥ 0,7 u 2p/3p/4p | ✅ 0,86 / 0,93 / 0,94 |
| D3.3 absolutní divergence ≥25 / ≥35 / ≥35 % | ✅ 41,0 / 62,9 / 74,4 |
| D3.4 regresní rozpočet NULA + jediná změna snapshotu | ✅ doloženo diffem |
| D3.5 K9 zbylých sedmi se nehne | ✅ bit po bitu |
| guard-kill < 15 % | ✅ ≤ 1,8 % |
| **D4 K6b > 50 % uzlů** | ⚠ **spuštěno** (80–89 %) — nezamítá, ale je to blokující eskalace |

**Žádné z kritérií, která měla variantu zabít, nespadlo.** Nejvíc hrozilo D3.3
(designér ho označil za reálně padnoucí) — a padlo naopak nejpohodlněji ze všech.

---

## 8. Doporučení — jedno

**Přijmout kandidáta V-3 s řezem 50 %:**
`podil_slotu_splnil_pct >= 50 a sloty_vlastnika_celkem >= 5`, bez `doruceno`.
Text na kartu: *„Ať se z tvé ruky dostane do hry aspoň pět věcí — a půlka z nich
ať projde."*

Odůvodnění v pořadí hodnoty, které designér předregistroval (osobnost > rezerva >
čitelnost > elegance):
1. **Osobnost:** normalizovaná divergence 0,86–0,94, absolutní 41–74 % — nejlepší
   čísla v celé osmičce po `hazarderovi`. Dnešní `muj-den` je přitom strukturálně
   osobní taky (0,71–0,80), jen se to u stolu nemá jak projevit: při 92–98% míře
   splnění je fyzický strop rozdílného verdiktu 3,7–28,9 %. Řez 50 % ten strop
   uvolní na 47,6–78,9 %.
2. **Rezerva:** jediný cut uvnitř pásma u všech čtyř počtů. Rezerva je ale tenká —
   **2,8 b.** ve 4p, a s biasem λ=3 už 4p sedí na 71,5 %, tedy nad horní hranou
   pásma (pásmo se čte proti incidenčnímu sloupci, kritérium pro bias je ≤ 80 %,
   takže to formálně prochází — ale komfortní to není).
3. **Čitelnost:** „půlka" je jediná z proměřených frakcí, kterou lze napsat na
   dobovou kartu.
4. K9 se ze tří breachů (1p–3p) stane nula breachů, a to bez dotyku jediné gate
   metriky.

**Dvě podmínky, které to doporučení nese s sebou** (ani jedna není v mém mandátu,
obě patří před zapečení):
- **Tempové varování K6b je spuštěné** → podle §D4 kolo končí eskalací na uživatele,
  ne tichým zapečením.
- **UI ukazatel chybí.** Návrh počítal s průběžným „prošlo X / propadlo Y"
  v `ui/vysvetleni.js` — bez něj je podíl neřiditelný (cíl se dnes hráči ukazuje
  jen na startu) a metrika 6 (čitelnost) je v přímém ohrožení. Není součástí
  tohoto commitu; patří technical-developerovi **před** zapečením obsahu.

Fallbacky **A** (škrtnout `muj-den`, otevřít kolo na `o-vlasek`) a **B** (nést
breach do lidské brány) se nespouštějí — jsou rezervou pro případ, že uživatel
tempové varování vyhodnotí jako blokující.

---

## 9. Co je prokázáno simulací a co ne

**Prokázáno:** míry splnění pro dnešní práh i pro čtyři řezy per počet hráčů;
4p baseline 91,4 %; nulová regrese (dvakrát, rekurzivním diffem, ne „v rámci
šumu"); invariance zbylých sedmi cílů; divergence raw i normalizovaná pro všech
8 cílů per počet; nepoužitelnost řezů 60/67/75; guard-kill; rozsah živosti cíle;
že bug parseru byl skutečný a je opravený.

**NEprokázáno a čeká na lidi:**
- že hráč podíl **pochopí** a uřídí — dnešní UI mu během runu neukazuje ani
  „prošlo X / propadlo Y" (metrika 6, čitelnost);
- že „cíl je živý v 85 % uzlů" znamená u stolu **zajímavější rozhodování** a ne
  jen delší uzly. Simulace umí říct, kde je spor možný, ne jestli je zábavný;
- že reveal *„já měl svůj den"* při 61 % úspěšnosti něco udělá — čísla o revealu
  neříkají nic;
- že tempový náklad (konflikt ∧ živý cíl vzroste z 1,8–9,1 % na 7,6–19,6 % uzlů)
  je u stolu přijatelný. **Tohle je hypotéza, kterou tohle měření ani nemohlo
  ověřit**, a je to zároveň jediný důvod, proč doporučení končí eskalací.

---

## 10. Otevřené body pro uživatele (nikoli kalibrační detail)

1. **Zapečení kandidáta** je P-rozhodnutí (obsah + spuštěné tempové varování K6b).
2. **Poznámka u `schovana-bouchacka` v `cile.yaml` je věcně chybně zdůvodněná** —
   navržené znění je v §4. Verdikt se nemění, zdůvodnění ano.
3. **`kupecke-slovo` (norm 0,20–0,49) a `plny-zasah` (0,00–0,03) jsou týmové cíle
   v zapečené sadě.** Kritérium „norm ≥ 0,7", kterým se poměřoval kandidát, na ně
   dosud nikdo neaplikoval. Nález pro game-designera.
4. **`doruceno` u `muj-den`**: designér navrhuje nedoplňovat a zapsat výjimku jako
   rozhodnutí do hlavičky `cile.yaml`. Měření tomu neodporuje ani to nepodporuje —
   je to designové rozhodnutí.
5. **Průběžný ukazatel podílu v UI** je předpokladem, ne příslušenstvím (§8).

---

*Křížové odkazy: `prototyp-mvp.md` Fáze 0 (K1–K9) · `technika/mozek-operace-kontrafaktual-2026-07-28.md`
(D42, jehož čtení divergence tento report reviduje) · `scratchpad/muj-den-navrh.md`
(předregistrace naslepo, verze 2) · `obsah/cile.yaml` (**nezměněn**).*
