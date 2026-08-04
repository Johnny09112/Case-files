---
name: d57-2-mereni-zar-malone
description: Měřicí kolo D57(2) — Žár V3-A' a V4-D clamp prošly všechna kill-kritéria, Malone V2-A' smíšený (B4 formálně nesplněno, eskalováno na PM)
metadata:
  type: project
---

**Report:** `technika/mereni-zar-malone-2026-08-02.md` (commit `688dc10`, 2026-08-04).
2 bloky × 8000 = 16 000 runů/variantu, izolovaný worktree `d57-2-mereni-zar-malone`
(zahozen po měření, nemergováno). Baseline přeměřena nad V1-A krok 1 (commit
`88018f1` přistálo v `main` v půlce měření) — potvrzeno „zdarma" jak audit
předpovídal.

**Výsledky (viz [[../../../technika/design-audit-2p-2026-08-02|design-audit-2p]]
pro definice variant a kill-kritérií):**
- **(a) Žár V3-A′ „jeden klimax za run"** — PROCHÁZÍ VŠE s rezervou. Runů s 2+
  konfrontace 25,8 % → **0,0 % strukturálně** (ne jen pod prahem — mechanismus
  druhé finále kategoricky vylučuje). K1 +8,45 b. je čekaný žádoucí vedlejší
  efekt, K6a/K5f/K3 beze změny.
- **(b) Malone V2-A′ „dotahuje"** — SMÍŠENÝ. B2 (K1 3p/4p +0,70/+0,35 b.) a B3
  (K5f beze zhoršení) silně splněny. B1 hraniční (K5-D agent-malone 10,15 %
  vs. gate ≤10 %, v rámci šumu). **B4 formálně NESPLNĚNO**: podíl nulovaných
  Maloneových uzlů klesl ~48 % (23,0 % → 12,05 %) proti předregistrovanému
  stropu <1/3 — i když jde kvalitativně o „dotahuje" (mechanika běží dál na
  >50 % svého rozsahu), ne o „maže" jako zamítnuté V2-A (100% erasure, 22–24 %
  → 0,00 %). Mechanický důvod přesahu: K3 medián=2 dává naivní odhad poklesu
  ~2/7≈29 %, ale runy co skončí PŘED prvním Zátahem přispívají navíc (celý run
  bez jediného aktivního uzlu). **Eskalováno na PM/uživatele** — nerozhodnuto.
- **(c) V4-D supply-aware clamp** — PROCHÁZÍ VŠE. D6 diagnostika (content-only,
  nezávislá replikace §5.1 auditu na celém obsahu): 3/60 slotů dotčeno (5,0 %,
  mírně nad predikcí <3 % ale bezpečně malé). ΔK1 max +1,4 b., K5-D 8,8 %
  (lepší než baseline). **V4-C už je v main hotová** (commit `88018f1`,
  `stropVeta()`/`rozkladPrahu()` v `vysvetleni.js`) — jen V4-D zbývá zapéct.

**Metodická technika (injektáž bez editace produkčního kódu):** `RULES` je
prostý JS objekt předávaný jako parametr do `createRun` — pro logiku
vyjádřitelnou čistě daty (prahy, delty) stačí `{...RULES, ...}` v sim skriptu
BEZE zásahu do repa (viz `sweep-p1.js` precedens). Pro logiku, kterou RULES-data
nevyjádří (kdy se práh přenabíjí, per-node gating rušení), jsem přidal opt-in
flagy (default `false`/`null` = beze změny, ověřeno celou test suitou) přímo
do `state.js`/`resolve.js` **v izolovaném git worktree** — `main` zůstal po
celou dobu netknutý, worktree se po měření zahodil. To je legitimní cesta,
když RULES-only injektáž nestačí (na rozdíl od main-repo edice, kterou
zakazuje zadání).

**How to apply:** až se bude řešit Malone V2-A′ dál, referuj tuhle B4 nuanci
— není to stejná vada jako zamítnuté V2-A, ale číselně gate nesedí. Pokud PM/
uživatel B4 revidoval, zapiš výsledek sem jako update.
