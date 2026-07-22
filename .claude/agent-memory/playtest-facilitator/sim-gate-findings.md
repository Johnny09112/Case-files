---
name: sim-gate-findings
description: Verdikt simulační brány + prokázaná balanční čísla. 1./2./3. běh (3. = po D10, 240k).
metadata:
  type: project
---

# Simulační brána — prokázané nálezy

Simulátor ve scratchpadu (Node, seedovaný RNG). Věrná pravidla z prototyp-mvp.md +
obsah/*.yaml. Vyhodnocováno proti zafixovaným kritériím brány (Fáze 0, referenční 4p run).
Scratchpad je per-session — simulátor se rekonstruuje z tohoto souboru + [[sim-model-assumptions]].

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
