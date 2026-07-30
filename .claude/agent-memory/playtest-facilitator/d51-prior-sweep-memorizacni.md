---
name: d51-prior-sweep-memorizacni
description: Rozdíl rameno memorizacni − kompetentni (dokonalý prior vs. čtení telegrafu) je NEGATIVNÍ a roste s počtem hráčů (2p−4p), jen 1p je pozitivní — dokonalý prior týmu škodí, sólistovi mírně pomáhá (2026-07-30)
metadata:
  type: project
---

# D51 — sweep prioru (`memorizacni` vs. `kompetentni`) pro škrtací kolo telegrafů

**Why:** zadání `game-designer` pro D51 (škrtací kolo telegrafů). `design-critic`
navrhl použít existující rameno `memorizacni` (`prototyp/sim/strategies.js:413–416`
— bot zná staty VŠECH slotů situace, i skrytých, dle jejího id) jako limitní
případ toho, na co v3 telegraf sází (prior v hlavě hráče místo výčtu v textu).
Rozdíl *memorizační − kompetentní* (fidelita 0,7) shora ohraničuje, co je prior
vůbec hoden — bez stavby nového sweepu, jen přeagregace existujícího harnessu
(`prototyp/sim/learnability.js` už tyhle 4 ramena počítá, jen v jednom bloku
seedů 1–1000).

**How to apply:** číslo je vstup do interpretace design-critic/game-designer
o tom, kolik učení nese prior sám o sobě vs. telegraf — NENÍ to čtení zábavnosti
ani hodnocení, zda je telegraf-škrtání (D51) v pořádku. Platí pro obsah a engine
ve stavu po D49/D50 (telegraf jako předzvěst, mechanický řádek skrytý).

## Prokázáno simulací

Metodika D31: **3 disjunktní bloky** po 1000 runech/konfiguraci (seedy 1–1000,
1001–2000, 2001–3000), 8 konfigurací (4 počty hráčů × 2 pronásledovatelé) na
blok, celkem 96 000 runů. Skript: scratchpad `prior-sweep-blocks.mjs` (jednorázový,
nesahá na repo — přeagregace nad `sim/run.js` + `sim/report.js`).

Win-rate (K1 % DORUČENO) per rameno, mean ± sd přes 3 bloky:

| rameno | celkem | 1p | 2p | 3p | 4p |
|---|---|---|---|---|---|
| memorizacni | 65,9 (sd 0,3) | 61,4 (sd 1,1) | 63,0 (sd 0,7) | 69,4 (sd 0,6) | 70,0 (sd 0,5) |
| kompetentni (fid. 0,7) | 70,3 (sd 0,5) | 57,5 (sd 1,0) | 66,9 (sd 0,8) | 77,5 (sd 0,6) | 79,6 (sd 0,5) |
| optimal (fid. 1,0) | 77,3 (sd 0,2) | 62,7 (sd 0,3) | 74,8 (sd 0,5) | 84,6 (sd 0,5) | 87,1 (sd 0,6) |
| nahodny commit | 48,2 (sd 0,7) | 40,7 (sd 1,1) | 44,4 (sd 1,1) | 52,6 (sd 0,8) | 55,2 (sd 0,9) |

**Rozdíl memorizační − kompetentní** (mean ± sd přes 3 bloky, směr konzistentní
ve VŠECH 3 blocích jednotlivě, ne jen v průměru):

| celkem | 1p | 2p | 3p | 4p |
|---|---|---|---|---|
| −4,4 b. (sd 0,7) | **+3,9 b.** (sd 2,0) | −3,9 b. (sd 0,2) | −8,1 b. (sd 0,2) | −9,6 b. (sd 0,8) |

**Odpověď na zadanou otázku:** rozdíl u 1p je MENŠÍ co do absolutní hodnoty
(~4 b.) než u 3p/4p (~8–10 b.) — ale hlavní nález je, že **znaménko se otáčí**.
Dokonalý prior pomáhá jen sólistovi (a tam jen mírně, +3,9 b., relativně
nejnejistěji — sd 2,0 je největší ze všech čtyř buněk). U týmu (2p–4p) je
dokonalý prior HORŠÍ než čtení telegrafu s fidelitou 0,7, a ztráta roste
s počtem hráčů.

## Hypotéza (NEPROKÁZANÁ simulací — mechanismus, ne jen číslo)

`memorizacni` a `kompetentni` sdílejí stejnou přiřazovací strategii (`assign:
kompetentni`) — liší se JEN v tom, jaké role commit fáze cílí. `kompetentni`
čte `signal.trend` (odvozený z telegrafu, typicky užší množina rolí + speciální
doplňky pro skrytou zbraň/improvizaci); `memorizacni` cílí VŠECHNY sloty situace
najednou. Možný mechanismus: cílení na všechny role najednou svazuje commit
kvótu napříč hráči hůř než trend-vedené cílení, když je hráčů (a tedy karet
v commit poolu) víc — ale tohle je čtení kódu, ne měření, a je to přesně
otázka pro `game-designer`/`design-critic`, ne závěr týmu QA.

## Co ještě čeká na rozhodnutí

Toto číslo samo o sobě NEHODNOTÍ D51 (škrtací kolo telegrafů) — jen dává horní
mez toho, co prior může přinést. Zda je gap memorizacni-kompetentni relevantní
pro škrtání konkrétních telegrafů, posoudí `game-designer`.

Odkazy: [[kalibrace-5-sweep-prahoffset]] (stejná metodika bloků), [[pending-human-hypotheses]].
