---
name: sim-gate-findings
description: Verdikt simulační brány + prokázaná balanční čísla. 1.–4. běh (4. = po D11, PROŠLA s výhradami).
metadata:
  type: project
---

# Simulační brána — prokázané nálezy

Simulátor ve scratchpadu (Node, seedovaný RNG). Věrná pravidla z prototyp-mvp.md +
obsah/*.yaml. Vyhodnocováno proti zafixovaným kritériím brány (Fáze 0, referenční 4p run).
Scratchpad je per-session — simulátor se rekonstruuje z tohoto souboru + [[sim-model-assumptions]].

**Věrnost rekonstrukce (4. běh):** čerstvě přestavěný simulátor NENÍ bit-identický s instancí
3. běhu. Kotva věrnosti = **run-kolaps 96,3 % cíle / 98,7 % greedy (4. běh) vs. 95,7 % / 97,5 %
(3. běh)** → jádrová injury/kolaps ekonomika a tvar snowballu jsou věrné. Rozcházejí se ale
absolutní % některých cílů (prsty 89 vs 50, kupecke 67 vs 48,5) a win-rate běží ~5–6 b. tepleji
(závislé na goal-play biasu a definici cautious). **Závěr:** pásmová příslušnost robustní,
konkrétní číslo cíle/win-rate brát jako orientační → arbitrem je instrumentovaný prototyp.

## 4. BĚH (2026-07-22, po D11, 240 000 runů) — PROŠLA (s výhradami)

D11: (G) cisty-stit `pocet_tag.nasili == 0 a doruceno`; (H) frajer-v-klidu přerámován na
`kolaps == false a doruceno`; (Ž) 1. práh Žáru 4→5 (prahy 5/7/10). Resoluce beze změny od 3. běhu.

**Diferenciální nález (nejsilnější, invariantní k rekonstrukci):** stejný simulátor, jen práh
Žáru 4→5, posune medián 1. prahu z **uzlu 2 → uzlu 3** (cíle i greedy 4p). To byl přesně účel
páky Ž a potvrzuje se čistě. cautious 4→5 (uzel 4→5).

### Verdikt per kritérium (4p referenční)
- **Krit. 1 win-rate 45–70 % ✓ (s výhradou):** cíle (realistická) **63,8 %** v pásmu; greedy
  (kompetentní) **70,1 %** = na stropu / marginálně přes (rekonstrukce teplá; 3. běh měl greedy
  64,7 % v pásmu, resoluce se nezměnila → pravá hodnota ~65). cautious 39,7 %.
- **Krit. 2 snowball od uzlu 3 ✓:** cíle přírůstek zranění/uzel 1,75 / 2,04 / **2,44 / 2,50** /
  2,25 / 1,80 (uzly 1–6). Vrchol uzel 4, roste od uzlu 3. Tvar drží z 3. běhu.
- **Krit. 3 1. práh Žáru medián uzel 3–4 ✓:** medián **uzel 3** (cíle i greedy). D11 páka Ž
  splnila účel (z uzlu 2 ve 3. běhu). OPRAVENO.
- **Krit. 4 žádná strategie >85 % ✓:** max **73,9 % (greedy/2p)**; spam < greedy všude, žádná
  degenerativní cesta. Robustně.
- **Krit. 5 každý cíl 5–95 % ✓:** nohy 78,6 / modrinu 54,9 / **cisty 59,4 (páka G opravila
  z 96,3)** / kupecke 67,2 / **frajer 34,0 (páka H opravila z 1,8)** / beranek 94,8 (těsně pod
  stropem — hlídat) / prsty 89,0. mozek = textový (vynechán). VŠECH 7 v pásmu. OPRAVENO.

### Výhrady k předání
1. greedy 4p na stropu pásma (rekonstrukce teplá) — **první měření instrumentovaného prototypu
   musí win-rate potvrdit**; kdyby reálně >70, páka = mírně přitvrdit (nejlevněji tvrdost uzlů/Žár).
2. beranek 94,8 % těsně pod 95 — po jakékoli další změně čísel může vylézt nad strop; hlídat.
3. Kolaps zůstává default zážitek (96,3 % runů, per-postava ~70 %) — mechanicky OK (win-rate
   zdravá, hlas z auta doveze), ale je to hlavní otázka pro lidskou bránu, ne balanční blok.

## 3. BĚH (2026-07-22, po D10, 240 000 runů) — NEPROŠLA TĚSNĚ (2 lokální kalibrace)

## 3. BĚH (2026-07-22, po D10, 240 000 runů) — NEPROŠLA TĚSNĚ (2 lokální kalibrace)

D10: prahy **7+ úspěch / 5–6 úspěch za cenu (reálné zranění) / ≤4 selhání** (páka F);
frajer-v-klidu zmírněn na `zraneni <= 1 a doruceno`. Matice 3 počty × 10 strategií × 2
pronásledovatelé × 2 hlasy à 2000.

**Jádro je vyřešené (krit. 1, 2, 4 PROŠLA). Padají jen dvě lokální věci: krit. 3
(Žár o uzel horký) marginálně a krit. 5 (dva cíle mimo pásmo).** Nejde o rozbitou
matematiku jako v 1./2. běhu — jde o doladění.

### Verdikt per kritérium
- **Krit. 1 DORUČENO 45–70 % ✓** — cíle (realistická) **55,1 %**, greedy (kompetentní)
  **64,7 %**, cautious 63,2 % (4p). Sweep predikce (62/49) SEDÍ; plná sim u cíle o ~6 b.
  optimističtější (kompetentnější model než sweep aproximace).
- **Krit. 2 snowball roste od uzlu 3 ✓** — cíle přírůstek zranění/uzel:
  1,71 / 2,04 / **2,31 / 2,37** / 2,29 / 1,75 (uzly 1–6). Vrchol uzel 4, citelně vyšší
  než uzly 1–2. Pokles na uzlu 5–6 je artefakt kolapsu (dochází živá těla), ne chladnutí.
  Tvarově MNOHEM lepší než 2. běh (tam cliff: vrchol uzel 3, pak ~0).
- **Krit. 3 první práh Žáru medián uzel 3–4 ✗ (marginálně)** — cíle i greedy **medián
  uzel 2** (0-idx 1), cautious uzel 4 ✓. Žár běží o uzel horko pod agresivní/realistickou
  hrou kvůli stackování hlučných karet přes 4 hráče. Lever: kdyby 1. práh = 5, medián → uzel 3.
- **Krit. 4 žádná strategie >85 % ✓** — max **2p/cautious 68,2 %**. Žádná spam strategie
  nedominuje (spam < greedy všude) → žádná degenerativní cesta. Robustně splněno.
- **Krit. 5 žádný cíl <5 % ani >95 % ✗** — **frajer-v-klidu 1,8 %** (<5, i po D10 zmírnění)
  a **cisty-stit 96,3 %** (>95). Ostatní v pásmu: nohy 77,6 / beranek 94,4 / modrinu 49 /
  kupecke 48,5 / prsty 50,2. mozek = textový (vynechán).

### Kalibrační páky do 3. běhu (poslat game-designerovi)
- **Páka G (cisty-stit ceiling):** podmínka `pocet_tag.nasili == 0 a doruceno` → **52,5 %**
  (z 96,3 %). Čistý fix >95 % — cíl „nikoho jsem neuhodil" má smysl jen když i dojedeš.
- **Páka H (frajer floor):** zmírnění nestačí — `<=1` = 1,8 %, `<=2` = **3,6 %** (POŘÁD <5),
  `<=3` = 19,1 %. Injury ekonomika 4p dělá „prostál v klidu" skoro nemožným. `<=3` projde,
  ale rozbíjí téma („frajer" se 3 zraněními není v klidu). Doporučení: **přerámovat cíl**
  na ne-zranění metriku (např. „nezahrál jsi hlučnou kartu" / „nezkolaboval jsi"), ne
  jen posouvat práh. frajer je mechanický kanárek širšího nálezu níže.
- **Páka Ž (krit. 3):** 1. práh Žáru 4→5 posune medián na uzel 3 (do pásma), ALE mění
  timing Zátahu (vázán na práh 4). Alternativa: srazit Žár z hlučných (např. +1 jen za
  nasili sílu 3). Volba je na designu — číslo je připravené.

### Kolaps & „zbitý, ale doručil" (JEN ZMĚŘENO, viz [[pending-human-hypotheses]])
- Kolaps v **95,7 % runů** (cíle 4p), 97,5 % greedy. Přes to je win-rate zdravá (55–65 %)
  → hlas z auta doveze náklad. **Kolaps je default, ne edge-case.**
- Průměr **~6 hráčo-uzlů stráveno vyřazeně** (cíle avgDown 5,98; greedy 6,16) — cca 20 %
  hráčo-uzlo-času leží někdo v autě. To je centrální otázka pro lidskou bránu: dramatické, nebo mlýn?

## 2. BĚH (2026-07-22, po D7–D9, 240k) — NEPROŠLA (overcorrection, moc těžké)
D7 (5–7 = reálné zranění na každém hodu) × 4 hráči × ~9 setkání → kolaps 99 %, kompetentní
hra ~25 % DORUČENO. Sweep našel páku F (7+/5–6/≤4): greedy 62/cíle 49 % — schváleno jako D10.
Snowball tehdy cliff (vrchol uzel 3, pak smrt). frajer 0,1 %. Beranek 70 % (D9 opravilo z ~1 %).
Rider Útěku (D8) = reálná volba (mono-Útěk 6,1 % > vždy-bedna 4,4 %). Detaily v git historii.


## 1. BĚH (2026-07-22, před D7–D9, 216k runů) — NEPROŠLA (moc snadné)
Kompetentní hra 96–98 % DORUČENO, realistická 84–90 % (pásmo 45–70). Nejsilnější páka =
sémantika 5–7; „poznámka zdarma" dělala hru bez tření. Predikce „5–7 = zranění → 72,5 %"
se NEnaplnila (2. běh dal 25 %), protože D7 nešel sám — spolu s ním padly D8 (nevyhnutelný
Zátah, víc tvrdých uzlů) a horký Žár ekonomika, které zranění znásobily. Detaily viz git
historie této poznámky. Cíl beranek tehdy ~1 % (mrtvý), teď 70 % (D9 opravilo).
