---
name: kalibrace-3-per-slot
description: Per-slot diagnostika před kalibrací-3 (2026-07-26) — proč revert viditelných kotev 4→3 nestačí a mis-targetuje improv
metadata:
  type: project
---

# Kalibrace-3 per-slot diagnostika (2026-07-26) — PROKÁZÁNO SIMULACÍ

**Why:** kalibrace-3 chtěla revertovat 12 viditelných kotev 4→3 v běžných uzlech,
držet přitom viditelné improv-4 sloty. Design-critic vznesl 3 neměřené premisy;
odehráno 1200 runů (300×2 pronásledovatelé × 4p a 1p, kompetentni, seed 1) + 2400
runů kontrafaktuálu přes reálný engine (import playRun/resolveSlot, klon obsahu
v paměti — obsah/ nezměněn).

**How to apply:** až se bude fixovat kalibrace-3, ber v úvahu tyto tři prokázané věci.

1. **improv-4 NENÍ nevinný slot — plán ho mis-targetuje.** V privoz-celnik,
   mesto-ulicka, urednik-razitko je držený viditelný improv-4 slot TOP-1/2 driver
   missů (oracle-miss 53–57 %), roven nebo tvrdší než nastroj/obrana-4, které plán
   revertuje. Kontrafaktuál: revert common VČETNĚ improv (B) srazí gamble-take
   48,5→41,0 a max≤1 17,5→13,7; „plán" bez improv (C) jen 48,5→44,4 / 17,5→14,7.
   Vynechání improv zahodí ~40 % dosažitelného zlepšení.
2. **Skutečný driver 3 ze 4 nejhorších = hodnota-slot, ne výška kotvy.**
   nadrazi-vypravci/privoz-celnik/urednik-razitko mají viditelný hodnota-slot
   (miss 68–72 %), který je už kotva 3 — revert ho nezmění. Miss je z agent-malone
   (rusi=hodnota → run-wide zeroed → hodnota slot vždy padne, mechanicky jisté) +
   scarcity hodnota-karet. Anchor-revert tenhle driver NEŘEŠÍ.
3. **common vs finále ≈ 50/50 → common-revert je nutný, ne dostačující.**
   common (npc/lokace) nese 53 % gamblů a 51 % max≤1; finále (zatah/lecka/konf.)
   47 %/49 %. I kdyby common šel na 0, globální K5 zůstane ~10 % (gate <5 %) →
   nedosažitelné bez zásahu do finále. Kontrafaktuál D (revert VŠE vč. finále):
   take 28,4 / max≤1 9,2 — pořád mimo gate. **Revert viditelných kotev je správný
   SMĚR, ale zdaleka ne dostačující** (zbytek: skryté sloty, pursuer stat-zero,
   scarcity, volnost gamble u bota).
4. **Směr (r=0,73–0,79):** vis-kotva-suma × gamble-take r=0,73, × max<4 r=0,79.
   Revert kotev SNIŽUJE gamble-take a max≤1 (monotónně A→C→B→D). ⚠️ Ale ZVYŠUJE
   win-rate (72→75→89 %) — pozor na strop K1 70 %. Pozn.: zadání psalo „K1
   gamble-inflace" — to je gamble-take (K7), ne win-rate; u win-rate je efekt opačný.

## GATE-měření C-real / B-real (2026-07-26, 1000×2, CONTENT_DIR na kopiích ve scratchpadu)

**VERDIKT: žádná podmnožina mandátu (23 běžných viditelných-4 slotů) gate nesplní.**
- C-real (12 slotů 4→3): K1 4p 72,9 (↑, hůř nad 70) · K5 4p 15,1 % · K7 4p 45,9 % · K6a 11,3 · K4c +2,7/68,7 · K4a oracle **80,4** (na stropu ≤80) · K2 PRŮŠVIH drift 17,3→22,3 %.
- B-real (23 slotů = mandátové MAXIMUM): K1 4p 73,6 (↑) · K5 4p 13,6 % · K7 4p 40,5 % · K6a **7,5 ✅**.
- Baseline kal-2: K1 4p 70,9 · K5 ~17,3 % · K7 ~49 % · K6a 11,8.

**Tři nezávislé důvody, proč mandát nestačí (monotónně dokázáno):**
1. B-real = infimum K5/K7 v mandátu (nejvíc změkčeno) = 13,6 %/40,5 % → pořád 3×/2× nad gate. Každá podmnožina ⟹ K5≥13,6, K7≥40,5.
2. **Směr K1:** revert win-rate ZVYŠUJE (ne snižuje); baseline už nad 70 na 3p/4p, mandát to jen zhorší. K4a oracle vyskočil na 80,4.
3. **~50 % neřešitelnosti je ve FINÁLE** (common/finále 49,5/50,5), mimo mandát; ~78 % propadlých slotů je viditelných. Snížit je stačí narazit na strop K1 dřív, než se vyčistí K5/K7.

Náprava je MIMO mandát: sáhnout i na finále (zatah/lecka/konfrontace), řešit hodnota/pursuer-zero driver, a rozseknout K1↔K5 coupling (win-rate drží konfrontace+Žár, ne úbytek beden). Zvážit revizi samotného K7≤20 (kompetentni bot gambluje při est≤2/4 → strop nереálný).

**Nástroj:** report.js NEumí per-situace/per-slot ani common/finále rozpad —
diagnostika běžela přes scratchpad skript (import reálného enginu). Návrh:
technical-developer doplní tyto rozpady do report.js, jinak se per-slot atribuce
musí pořád počítat ad-hoc.
