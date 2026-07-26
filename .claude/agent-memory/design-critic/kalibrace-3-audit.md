---
name: kalibrace-3-audit
description: Prověrka game-designerova návrhu 12 revertů pro kalibraci-3 (2026-07-26) PŘED zapečením do YAML — nálezy a co eskalovat; sleduj rozhodnutí
metadata:
  type: project
---

Audit návrhu game-designera „kalibrace-3 — 12 revertů z 23 kandidátů" (2026-07-26, PŘED zapečením). Verdikt: **schválit s úpravami** — selekce je mandátově čistá a koherentní, ale stojí na neměřených premisách. Sleduj rozhodnutí v `projekt/rozhodnuti.md`.

**Ověřeno proti YAML:** všech 12 revertů cílí na slot aktuálně na kotvě 4, který 45-slot patch (kalibrace-1) zvedl 3→4. Žádný nesahá na skrytý slot, balík ani léčky/konfrontace (kromě mandátu). Konzistence D21c/D20/D15 OK — revert hodnota-slotů (farmar-brod, rival-parley) NERUŠÍ Malone-strop 3/4 (pod Malonem hodnota=0 padá při každé kotvě).

**Kritické/vážné nálezy (moje):**
- **K7≤20%/K5<5% pravděpodobně NEDOSAŽITELNÉ v mandátu.** Hlavní gamble-forcery jsou (a) léčky/konfrontace/zatah — 5 uzlů s 2–3 viditelnými-4, všechny mimo mandát; (b) 7 chráněných improv-4. Common-node reverty samy nesrazí aritmetický průměr take-rate dost. POZOR: per-situace data z kalibrace-2 ale ukazují nejhorší offendery jako COMMON (vypravci 78, privoz 70, ulicka 61, razitko 61) — ne finále. Nutná per-SLOT atribuce před závěrem.
- **„Drž improv-4" = sázka naslepo.** Pro 3 ze 4 nejhorších (privoz, ulicka, razitko) plán revertuje NON-improv slot a KEEPuje improv-4. Rationale „pokrytí 13 → řešitelný" plete improv≥3 supply s poptávkou improv-4+šum: kotva 4 + šum ±2 (clamp 5) → práh {2,3,4,5,5}; karta improv-4 padá ~40 %, improv-3 ~60 %. Residual breach může sedět PRÁVĚ na chráněných improv-4. → per-slot atribuce nutná.
- **K1 směr NEOVĚŘEN a odporuje sweepu.** Engine tvrdí kotva↑→K1↑ (revert srazí K1 do pásma), ale sweep offset−1 (vše lehčí) → K1 96 %. Selektivní common-revert NEBYL změřen. Iterační plán i K6a-osud visí na tomto counterintuitivním modelu.
- **K6a (11.8, breach) plán ignoruje.** Engine sám řekl lék = 1p ruka 8→9 (mimo mandát), ne resoluční práh. Reverty mohou spread ZHORŠIT, když pomůžou 4p (malé ruce) víc než 1p. Nutno explicitně eskalovat jako nadrazi-vypravci K7.
- **Zploštění obtížnosti.** Po kalibraci-3 drtivá většina viditelných slotů = kotva 3 (v3-audit už vytkl „78 % kotva3, samey"); jediná textura = improv-4, vždy stejný stat → monotónní + memorizovatelný vzor „improv je vždy tvrdý slot" (K4c watch).

**Dobré na návrhu:** farmar-brod revert (hodnota vzácná 6 + Malone nuluje + rané téma) je čistá logika; honest flag reziduálního breache u vypravci (hidden-driven, mimo mandát, eskalovat); léčky/konfrontace/zatah správně drženy jako K2/K1 tlak.

**Watch:** D22 hand-off „po zapečení drží K1 engine" se v praxi porušuje — content zase ladí K1 (kalibrace-2 „míč zpět u obsahu"). Re-ratifikovat dělbu práce. Double-reverty (urednik-vaha, mesto-ulicka) = nejvyšší variance, zvážit staging po jednom.
