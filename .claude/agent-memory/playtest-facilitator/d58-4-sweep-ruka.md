---
name: d58-4-sweep-ruka
description: Sweep hraci[n].ruka (D58 bod 4) — lever na guardrail-floor (2p=4,3p=3,4p=2) uzavírá jen ~20-28 % mezery K1 3p/4p ke stropu 70; K6a spread pořád 14,6 vs. gate ≤6. Páka je vyčerpaná, sama nestačí.
metadata:
  type: project
---

**Report:** `technika/sweep-ruka-2026-08-04.md`. Skript `prototyp/sim/sweep-ruka.js`
(injektáž `{...RULES, ruce:{...}}`, `rules.js` needitován, commitnuto jako
trvalý nástroj — precedens `sweep-p1.js`). Nic nezapečeno, verdikt jde
uživateli/PM.

**Metoda:** počty hráčů jsou v enginu vzájemně nezávislé (`RULES.ruce[n]`
ovlivňuje jen běhy `players===n`) → K1 per count se dá měřit IZOLOVANĚ per
počet a kombinovat post-hoc, bez nutnosti simulovat všechny 4 počty najednou
pro každého kandidáta. Ušetřilo to většinu explorační fáze — jen nejlepší
kombinace (guardrail-floor) šla na plnou 2-bloky×8000 metodiku.

**Výsledek:** guardrail-floor (2p ruka=4, 3p=3, 4p=2 — přesně na hraně
`ruka ≥ max_commitů_hráče + 1`, jinak `gamble()` nemá z čeho táhnout) je
prokazatelně NEJLEPŠÍ dostupný kandidát (dominuje ostatní kombinace na každém
počtu zvlášť) a je bezpečný — 16 000 runů bez jediné chyby prázdné ruky. Ale:
K1 3p 86,60→81,90 (−4,7 b.), 4p 87,20→82,75 (−4,45 b.), 2p 80,65→78,55
(−2,1 b.) — všechny pořád 8,5–12,75 b. NAD stropem 70. K6a spread 19,0→14,6
(pořád ≫ gate ≤6). K5-D/K5f/K2/K7 beze zhoršení (K7 obava „gamble EV závisí
na zbytku ruky" se v souhrnných gate-metrikách nepotvrdila).

**Klíčový mechanický nález (pro příště):** `gamble()` v `state.js` netáhne
novou kartu z balíčku — losuje z VLASTNÍHO zbytku ruky vlastníka. Menší ruka
proto zmenšuje i kvalitu gamble-náhrady, ne jen commit-výběr. Relevantní pro
K7/K4d, kdyby se ruka měnila znovu.

**Nezměřeno tímto kolem (přiznaná mezera, ne tichý pass):** K3 (report.js
nemá hotovou metriku), K4d (vyžaduje samostatný `learnability.js` běh),
K6c (v `report.js` fakticky NEEXISTUJE jako metrika — `k6c_pasma` je jen
alias pro pásmová procenta situací, ne run-agregovaný floor příspěvku per
hráč z definice v `prototyp-mvp.md`).

**How to apply:** stejná rodina nálezu jako [[kalibrace-5-sweep-prahoffset]]
(D38 `prahOffsetDlePoctu` sweep) — bezobsahová páka je vyčerpaná, hlavní
driver (co-op škálování výběru karet) potřebuje sáhnout na obsah nebo
mechaniku (commit-rozdělení, ne jen velikost ruky), což je mimo rozsah
příští sweep-iterace téhle páky. Pokud se floor kombinace přesto zapeče
(jako menší, ale bezpečná kompenzace), K3/K4d/K6c mezery zůstávají otevřené
pro budoucí kolo.
