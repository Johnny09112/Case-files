---
name: feedback_sim-batch-velikost
description: Watchdog zabíjí simulační běhy spuštěné na pozadí nebo v čekacích smyčkách, nikdy samotný výpočet — dlouhé sim kola dělej jako sérii malých SYNCHRONNÍCH příkazů, ne jeden velký běh na pozadí
metadata:
  type: feedback
---

Při velkých simulačních kolech (16 000+ runů/variantu) NEPOUŠTĚJ dávku jako
jeden `run_in_background` proces a NEČEKEJ na něj `until`-smyčkou v Bash. Místo
toho rozděl na malé **synchronní** příkazy (jeden blok ~8000 runů ≈ 55–60 s na
tomto enginu, bezpečně pod jakýmkoli timeoutem) a po každém ihned zapiš
mezivýsledek na disk do rozpracovaného reportu.

**Why:** v kole D57(2) (2026-08-04) watchdog (600 s bez postupu) třikrát zabil
běh — pokaždé na pozadí/čekací smyčce, ANI JEDNOU na samotném výpočtu (žádný
jednotlivý blok nepřesáhl 61 s). Navíc `kill`/`ps` v Git Bash na Windows
nespolehlivě mapují na skutečné `node.exe` PID — nahromadilo se 14 osiřelých
node procesů, které si navzájem žraly CPU. `taskkill //F //IM node.exe` (Windows
nativní) je spolehlivější úklid než `kill -9 <bash-pid>`.

**How to apply:** u simulačních skriptů v `prototyp/sim/` napiš CLI tak, aby
jeden příkaz = jeden blok (typicky 4 počty hráčů × 2 pronásledovatelé ×
≤1000 runů/buňku), spouštěj `Bash` BEZ `run_in_background` a bez
`until`-čekání, a hned po každém příkazu zapiš výsledek Edit/Write nástrojem
do cílového reportu — nikdy nedrž rozpracovaná data jen v paměti konverzace.
Když je potřeba dlouhotrvající proces přece jen pustit na pozadí, po
dokončení/selhání vždy ověř `tasklist //FI "IMAGENAME eq node.exe"` (ne jen
`ps aux`) před dalším pokusem, ať se procesy nekupí.

Viz [[d57-2-mereni-zar-malone]] pro konkrétní kolo, kde se tohle poučilo.
