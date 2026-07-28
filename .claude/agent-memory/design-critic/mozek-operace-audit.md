---
name: mozek-operace-audit
description: Audit variant léku na mrtvý cíl mozek-operace (2026-07-28) — V-A „strůjce" roztrhán na 4 kritických bodech, protinávrh GANGSTER_skryta + „věta bez bodů"
metadata:
  type: project
---

Kritika návrhu game-designera na `mozek-operace` (jediný `overeni_typ: textovy`,
0 % splnění). Doporučená varianta V-A („strůjce" = nejvíc `pocet_slotu_splnil`)
dostala verdikt **nedoporučuji v předložené podobě**.

**Vznesené nálezy (ať se neopakují):**
1. V-A znovuotevírá kalibraci přes `sim/assign.js goalBias` (dnes bias 0), ne přes
   `rules.js` — jeho „regresní rozpočet: žádná změna K1…K8" je fakticky nepravdivý.
   Pozor: i V-B (škrt na 7) perturbuje osudí cílů. Měřicí-neutrální varianta neexistuje.
2. Komparativní cíl je nesatiovatelný → vlastnické veto („vlastník souhlasí",
   prototyp-mvp ř. 148) se mění v rukojmí u každého uzlu.
3. Tvar cíle se láme přes počty: 1p ≈ 85–90 % podmíněno doručením (per-slot
   pass ≈ 0,58 z pásem 10,0/35,6/36,4/17,9), 4p ≈ 14 % (los). Nejdražší karta (3 b.).
4. Tie-break „nižší selhal" je prázdný, když splnil+selhal = konst. (4p, 2p);
   rozvazují ho jen gamble / složení / rotace mapy ve 3p → ~1/3 runů nejmenuje nikoho.
5. Protokol se píše po uzlech, strůjce je znám až na konci → LLM může jmenovat
   jiného „velitele" v uzlu 3. Ošetření jen negativní instrukcí + regresní case.
6. Věta o strůjci si bere pointu obou `fb-v3-finale-doruceno-*` (anonymita).
7. „Prostor pro 8. cíl je vyčerpaný" NENÍ pravda — protinávrh
   `commitnute_stitky.GANGSTER_skryta >= 1 a doruceno` (+2 řádky v `deriveGoalMetrics`,
   events.js:146 už čte viditelnost i štítky). Skutečné omezení není počet metrik,
   ale že každá POČÍTACÍ metrika škáluje 4× mezi 1p a 4p.
8. Doporučený obchod: **škrt cíle + věta o strůjci jako flavour bez bodů**
   (precedens: end-of-mission superlativy v DRG / L4D se nebodují).

**Metodický nález k opakovanému použití:** K9 (5–95 % per držící hráč) systematicky
MASKUJE cíle, které jsou automatické-při-výhře, protože násobí win-rate. Podezření
padá i na `plny-zasah`. Před dalším cílem se ptej „jaká je míra PODMÍNĚNÁ doručením".

**Why:** rozhodnutí D39 explicitně říká „kalibraci znovu neotevírej — další kolo je
rozhodnutí uživatele"; každá varianta léku to porušuje, jen různě draho.
**How to apply:** až uživatel rozhodne, zapiš sem verdikt; nálezy 1–8 už nevznášej
znovu. Viz [[kalibrace-4-audit]], [[k7-learnabilita-verdikt]].
