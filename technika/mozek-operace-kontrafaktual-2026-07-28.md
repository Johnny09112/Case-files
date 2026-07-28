# Kontrafaktuál náhrad za `mozek-operace` (kolo D39(iv), 2026-07-28)

**Role:** playtest-facilitator. **Mandát:** změřit tři kandidátní náhrady mrtvého
cíle `mozek-operace` přes `CONTENT_DIR` na kopiích `obsah/` ve scratchpadu
(metodický standard z D24/kalibrace-3) a vrátit čísla + jedno doporučení.
**Do `obsah/` se nezapisuje nic** — kandidáti žijí jen ve scratchpadu.

Diagnóza (cíl je strukturálně nesplnitelný, ne těžký) je hotová jinde a
neopakuje se: `scratchpad/mozek-diagnoza-designer.md`,
`scratchpad/mozek-diagnoza-obsah.md`.

---

## 1. Co se změnilo v `prototyp/` (a proč to nic neposunulo)

Tři soubory, všechno aditivní. Testy: **233 passed / 11 souborů** (bylo 231 —
přibyly 2 nové), golden snapshoty beze změny.

| Soubor | Změna |
|---|---|
| `src/engine/events.js` | `commitnute_stitky` má nově i klíč `GANGSTER_skryta`; větev na `slot_resolved` se rozdělila na `viditelna` / `skryta`; `METRIC_SPEC.commitnute_stitky.keys` rozšířeno. `rules.js` ani žádná resoluční konstanta se nedotkla. |
| `test/metrics.test.js` | +2 testy: (a) skrytá a viditelná role se počítají zvlášť a nezávisle na tom, jestli slot prošel; (b) parser přijme `commitnute_stitky.GANGSTER_skryta` jako platnou cestu. |
| `sim/report.js` | **hygiena měřidla:** `cileMetriky` nově vrací per cíl `{mereno, n, splneno_pct}`; textové cíle (`splnen: null`) hlásí `mereno: false` a **nepatří do jmenovatele K9**. Render: `neměřeno (textový)` místo `0`. |

### Důkaz nulové regrese — silnější než „v rámci šumu"

Změna je aditivní, takže se neměřilo „posunulo se to míň než šum", ale **bitová
shoda**. Dvě nezávislé kontroly, obě na 4 000 runech (500 seedů × 1–4p × 2
pronásledovatelé, bot `kompetentni`, seed 1):

1. **Před × po enginové změně:** `summary.json` je **identický ve všech klíčích
   mimo blok `cile`** (ten změnil tvar, ne hodnoty: `50.4` → `{mereno:true, n:1116,
   splneno_pct:50.4}`). Tedy K1, K2, K5, K5 varianta D, K5f, K6a, K6c, K7, K8,
   per-situace i per-slot rozpady — nula rozdílů.
2. **Sada cílů × brána:** táž dávka puštěná přes `CONTENT_DIR` na obsah base / A /
   B / C. Rekurzivní diff `summary.json`: **jediný rozdíl je `verzeObsahu` (hash)**.
   Nula rozdílů ve všech gate metrikách.

Kontrola měřidla: `CONTENT_DIR=cand/base` (verbatim kopie) dá bit po bitu totéž
co skutečné `obsah/` — kopie nic nerozbila.

Tím je **doloženo** (ne tvrzeno) to, co designér předpokládal: brána běží na botu
`kompetentni`, `goalBias` je jen ve strategii `cile`, takže **K1/K2/K5/K5f/K6a/K7/K8
jsou vůči výměně cíle invariantní**. Regresní rozpočet byl nulový a zůstal nulový.

Referenční brána (nezměněná): K1 1p 58,0 · 2p 66,1 · 3p 77,7 · 4p 79,1; K6a 21,1 b.

---

## 2. Metodika měření kandidátů

- **Kontrafaktuál:** `$SCRATCH/cand/{A,B,C}/obsah/` = kopie `obsah/` s posledním
  cílem vyměněným za kandidáta. Sada zůstává osmičlenná.
- **Dávka:** 4 disjunktní bloky × 1 000 seedů × 4 počty hráčů × 2 pronásledovatelé
  = **32 000 runů na konfiguraci**; verdikt vždy **z průměru přes bloky** (D31),
  v tabulkách je i min–max bloků. Celkem odehráno ~290 000 runů.
- **Incidenční vs. s biasem** (varování D30/D34 bráno vážně): `assign.js:55`
  vrací neznámým cílům bias 0, takže bez doplnění biasu se měří jen to, jak často
  cíl padne sám od sebe. Vykazují se proto **obě čísla odděleně**:
  - *incidenční* = bot `kompetentni` (gate bot, cíle ignoruje) — a navíc bot
    `cile` **bez** biasu držitele, aby srovnání nebylo zamlžené tím, že celý tým
    hraje na cíle;
  - *s biasem* = **fork `assign.js` ve scratchpadu** (repo se nemění) s novou
    větví `case 'schovana-bouchacka'`. Měřeny dvě síly: **kanonická λ = 3**
    (stejná jako u všech ostatních cílů) a **agresivní 2λ + veto na viditelnou
    roli** (horní mez „hráč jede jen na cíl").
- **B/C bias neexistuje a existovat nemůže:** `goalBias` ovlivňuje jen přiřazení
  do slotů, kdežto B/C se rozhodují v ekonomice motelu. Tam bot jede `adaptivni`,
  který **už dnes utrácí maximálně** (zajede při ≥3 kreditech, vyléčí každý těžký
  postih při ≥6, pak směňuje). Incidenční číslo B/C je proto zároveň **stropem** —
  žádná politika hráče ho nezvýší, protože nemá co přidat.
- Skripty jsou jednorázové (`scratchpad/harness.mjs`, `scratchpad/fork/*`), staví
  nad reálným enginem (`createRun`, `deriveGoalMetrics`, `parseCondition`) a
  metriky nepočítají po svém.

---

## 3. Výsledky — míra splnění (%)

Průměr přes 4 bloky; `[min–max]` = rozptyl bloků. „podm." = podmíněno `doruceno`
(předregistrovaná pásma se čtou proti tomuhle sloupci), „nepodm." = báze K9.

### A — `schovana-bouchacka` (`commitnute_stitky.GANGSTER_skryta >= 1 a doruceno`, 2 b.)

| bot | 1p podm. | 2p podm. | 3p podm. | 4p podm. |
|---|---|---|---|---|
| `kompetentni` (incidenční, gate bot) | **81,5** [75,2–86,9] | 54,8 | 38,2 | **30,0** [28,3–33,3] |
| `cile` bez biasu držitele (incidenční) | 81,5 | 51,9 | 37,4 | 28,0 |
| `cile` + bias λ=3 (kanonická síla) | **89,5** [84,2–96,1] | 63,2 | 47,3 | **35,7** [33,7–38,7] |
| `cile` + bias 2λ + veto (agresivní) | 93,5 | 77,3 | 62,5 | 50,1 |

Nepodmíněně (báze K9), varianta λ: 1p 48,4 · 2p 33,7 · 3p 28,4 · 4p 22,9.

**Páka držitele je reálná a monotónní:** bias λ přidá +7,9 / +11,3 / +9,9 / +7,8 b.
proti témuž botu bez biasu. Zároveň platí označená výhrada z návrhu — **~78 %
splnění ve 4p přijde zadarmo** (28,0 z 35,7), protože tým tam tu zbraň často chce
sám. Cíl tedy není „bez tření", ale tření je menší, než návrh sliboval.

**Utažení na `>= 2` proměřeno a ZAMÍTNUTO** (varianta A2, `cile`+λ): podm.
63,7 / 27,7 / 13,3 / 7,7; nepodmíněně 4p **4,9 %** → **pod K9 floor 5 %**. Páka,
kterou designér předregistroval jako lék na příliš vysoké 1p, přestřeluje o řád —
`>= 1` je jediný funkční práh.

### B — `noc-v-motelu` (`leceni >= 6 a smena >= 3 a doruceno`, 3 b.)

| bot | 1p | 2p | 3p | 4p |
|---|---|---|---|---|
| `kompetentni` — podm. | **13,0** [9,6–19,0] | 25,9 | 21,7 | **25,0** [23,2–27,0] |
| `kompetentni` — nepodm. (K9) | **7,3** [5,1–10,6] | 16,9 | 16,3 | 19,9 |
| `cile` — podm. | 13,0 | 26,8 | 23,2 | 25,3 |

**1p nepodmíněně sedí na hraně K9 floor** — nejhorší blok 5,1 % při gate ≥5 %.
Vazba na C ukazuje, co je úzké hrdlo: směna se povede v ~88–92 % doručených runů,
takže celá vzácnost B je **P(někdo utrpí těžký postih ∧ je na něj v motelu 6 kreditů)**.
To není rozhodnutí, to je los na postizích.

### C — `handl-u-silnice` (`smena >= 3 a doruceno`, 1 b.)

| bot | 1p | 2p | 3p | 4p |
|---|---|---|---|---|
| `kompetentni` — podm. | 87,5 | 89,2 | 91,7 | **90,9** [90,3–91,6] |
| `kompetentni` — nepodm. (K9) | 49,0 | 58,4 | 69,0 | 72,4 |
| `cile` — podm. | 87,5 | 90,2 | 89,1 | 87,6 |

### K9 pro celou osmičku po výměně (nepodmíněně, per počet hráčů, pásmo 5–95 %)

| sada | breache |
|---|---|
| base (dnešní obsah) | `muj-den` 1p 99,4 · 2p 98,3 · 3p 96,0 · (`mozek-operace` 0 % = **falešný**, po hygieně měřidla mizí) |
| A | `muj-den` 1p 99,4 · 2p 98,3 · 3p 96,0 — kandidát ✅ (22,9–48,4) |
| B | `muj-den` dtto — kandidát ✅, ale 1p 7,3 % s blokem na 5,1 (na hraně) |
| C | `muj-den` dtto — kandidát ✅ (49,0–72,4) |

**Žádný kandidát K9 neporušuje.** Zato hygiena měřidla odkryla pod falešným
breachem **skutečný, na kandidátech nezávislý:** `muj-den` je 96–99 % pro 1p–3p.
Dosud se schovával za agregát přes počty (D39 hlásil 95,4 %). Patří
game-designerovi jako samostatný nález — práh `pocet_slotu_splnil >= 3` má
v poznámce SIM-TUNE „možná potřeba per-count prahu"; teď je změřeno, že potřebuje.

---

## 4. Nález, kvůli kterému se měřilo odděleně: B a C jsou týmové cíle v přestrojení

Varování zadání č. 2 se **potvrdilo a je kvantifikované**. Pro každý run byla
podmínka každého cíle vyhodnocena pro **každou postavu** (2p+, ~150 000 runů) a
změřen podíl runů, kde by se verdikt mezi hráči lišil:

| cíl | divergence mezi hráči |
|---|---|
| `hazarder` | 53–69 % |
| `cista-ruka` | 43–56 % |
| **A `schovana-bouchacka`** | **41,8–52,9 %** |
| `bez-jizvy` | 38–46 % |
| `dve-jizvy` | 40–51 % |
| `kupecke-slovo` | 15–22 % |
| `muj-den` | 11–29 % |
| `plny-zasah` | **0,9–1,2 %** |
| **B `noc-v-motelu`** | **0,00 %** |
| **C `handl-u-silnice`** | **0,00 %** |

Nula je exaktní, ne zaokrouhlená: `events.js:175–178` nefiltruje `hrac_id`, takže
`kredity_utracene_za` je týmová veličina a **všem čtyřem vlastníkům vyjde vždy
stejně**. B i C tedy dávají důvod hádat se o *odbočku do motelu* (což je nová osa,
jak návrh správně tvrdí), ale **nedávají žádný skrytý důvod hádat se o KONKRÉTNÍ
přiřazení slotu** — a přesně to po tajných cílech chce design §4.10. Držitel B/C
navíc nemá vlastní páku: skóruje mu chování týmu, i kdyby celý run proseděl.
Metriku podle zadání **neopravuji** — je to nález pro uživatele
(`technika/architektura.md` §2.2 ř. 141 ji vede jako per-hráč).

**Vedlejší nález stejné třídy:** `plny-zasah` je s divergencí ~1 % už dnes
prakticky týmový cíl (ve 3p/4p má kartu v každém uzlu každý, takže histogram
pásem je pro všechny stejný). Není to způsobeno výměnou, ale kdyby se přidal B
nebo C, měla by sada **dva** týmové cíle z osmi.

---

## 5. Verdikt proti předregistrovaným kritériím

Pásma: **1p 80 ± 10 %** = [70, 90], **4p 35 ± 12 %** = [23, 47], podmíněno doručením.

| kandidát | 1p podm. | 4p podm. | pásmo | K9 | osobní cíl? |
|---|---|---|---|---|---|
| **A** `kompetentni` (incidenční) | 81,5 | 30,0 | ✅ ✅ | ✅ | ✅ |
| **A** `cile`+λ (s biasem) | 89,5 | 35,7 | ✅ (na horní hraně) ✅ (střed) | ✅ | ✅ |
| A `cile`+2λ (agresivní chaser) | 93,5 | 50,1 | ❌ ❌ | ✅ | ✅ |
| **B** | 13,0 | 25,0 | **❌** ✅ | ✅ na hraně floor | **❌ 0 %** |
| **C** | 87,5 | 90,9 | ✅ **❌** | ✅ | **❌ 0 %** |

- **Pravidlo „> 92 % u OBOU počtů → škrt bez náhrady (V-B)" se nespustilo** u žádného
  kandidáta. Nejblíž je C (87,5 / 90,9) — pod prahem, ale prakticky automatický cíl.
- **A prochází v obou čteních biasu, která odpovídají skutečnému hráči.** Agresivní
  varianta pásmo přestřelí, ale je to horní mez definovaná botem, který obětuje
  win-rate (1p 63,6 → 47,6 %) — ne předpověď chování u stolu.
- **Předregistrovaná ladicí páka pro A („když 1p > 92 %, utáhni na `>= 2`") je
  nepoužitelná** — proměřeno, srazí 4p pod K9 floor. Kdyby bylo potřeba utahovat,
  je to jiná páka (např. „a slot musel projít"), ne práh počtu.

---

## 6. Doporučení — jedno

**Vzít kandidáta A `schovana-bouchacka` (`>= 1`, 2 body); B a C nebrat, ani jako
pojistku.**

1. A je **jediný kandidát, který trefil obě předregistrovaná pásma** — a trefil je
   v obou poctivých čteních biasu, ne jen v tom příznivém.
2. A je **jediný kandidát, který je osobní** (divergence 42–53 %, v pásmu ostatních
   osobních cílů). B a C jsou exaktně týmové (0,00 %) — nesplní účel z §4.10 a
   držiteli neberou ani nedávají agency.
3. B navíc sedí 1p na hraně K9 floor (blok 5,1 %) a jeho vzácnost není rozhodnutím
   hráče, ale losem na těžkém postihu. C je při 88–92 % podmíněně sotva odlišitelný
   od „bod zdarma za výhru".
4. Cena A je **2 řádky enginu, které jsou už napsané a otestované** a o kterých je
   doloženo, že nehnuly ani jednou gate metrikou.

Poctivá výhrada, kterou doporučení nese s sebou: **~78 % splnění A ve 4p přijde
zadarmo** z týmově optimálního přiřazení. A je tedy dobrý cíl, ne skvělý — páka
držitele je ~8–11 b. To se dá zvětšit až po lidské bráně a jinou pákou než prahem.

### Co z toho je prokázáno simulací a co ne

**Prokázáno:** míry splnění, K9, invariance brány vůči sadě cílů, exaktní týmovost
B/C, nepoužitelnost prahu `>= 2`, falešný i skutečný breach K9.

**NEprokázáno a čeká na lidi:** že spor o jediný skrytý slot v uzlu skutečně vznikne
u stolu (simulace ukáže, že bot tam kartu dá — ne že se o to dva lidi pohádají);
že reveal „já měl schovanou bouchačku" na konci runu něco udělá; že hráč vůbec
pochopí, proč cíl splnil (metrika 6 — čitelnost). Predikce „nová osa hádky
o odbočku do motelu" u B/C je **hypotéza, kterou tohle měření ani nemohlo ověřit**
— odmítnutí B/C stojí na doložené nulové divergenci, ne na tom, že by ta osa byla
špatná.

---

## 7. Otevřené body pro uživatele (nikoli kalibrační detail)

1. **`muj-den` breachuje K9 pro 1p–3p (96–99 %).** Nezávisí na kandidátech, dosud
   ho maskoval agregát přes počty. Rozhodnutí, jestli se řeší před lidskou bránou.
2. **`kredity_utracene_za` je týmová metrika v tabulce per-hráč metrik**
   (`architektura.md` §2.2 ř. 141). Neopraveno záměrně.
3. **`plny-zasah` je de facto týmový cíl** (divergence ~1 %). Samostatný nález.
4. **Návrh na doplnění K9 o míru podmíněnou `doruceno`** (od designéra, §7 bod 4
   jeho diagnózy) je tímto měřením podpořen: nepodmíněná K9 by pustila i C
   s 90 % podmíněně. Mění znění kritéria uzavřené brány → **rozhodnutí uživatele**.
5. Diagnostická poznámka k botovi: `goalBias` u `dve-jizvy` je v 1p sebedestruktivní
   (nepodmíněné splnění 0,6 %, protože držitel shazuje sloty a run nedojede).
   Artefakt modelu bota, ne obsahu — ale zkresluje čtení strategie `cile` v sólu.

---

*Křížové odkazy: `prototyp-mvp.md` Fáze 0 (K1–K9) · `technika/kalibrace-5-sweep-prahoffset-2026-07-27.md`
(předchozí kolo, kde 0 % u `mozek-operace` vyskočilo jako mrtvá volba) ·
`obsah/cile.yaml` (nezměněn).*
