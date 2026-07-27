---
name: kalibrace-4-baseline
description: Baseline doměření (kal-2 obsah, beze změny) pro návrh nových gate pásem kalibrace-4 — K7 rozklad, finále, K5 varianty, K2 drift (2026-07-27)
metadata:
  type: project
---

# Kalibrace-4 baseline doměření (2026-07-27) — PROKÁZÁNO SIMULACÍ

**Why:** mandát D25 — game-designer potřebuje čísla pro redefinici gate pásem
(K5/K7 scope, K1 finále). Obsah = stav kal-2, NIC neměněno. 1000 runů × 2
pronásledovatelé, seedy 1–1000, bot kompetentni, reálný engine, gamble-odhad
rekonstruován z event-logu (COMMIT pre-gamble + SITUATION_REVEALED).

**Validace harnessu:** reprodukuje kal-3 baseline přesně — 4p win-rate 70,9;
K5 logged (post-gamble) 4p 17,3 %. Rekonstruovaný botův odhad předpovídá reálný
gamble (estLE2TakeRate ~97,5 %; take v est-bandech 3/4 = 0 %).

## K7 — take-rate a rozklad (kompetentni bot gambluje při est ≤2/4)

Take se dělí jen na **vynucený (est≤1)** a **zvolený (est=2)** — bot nikdy
negambluje při est≥3. Klíč pro strop K7 = **zvolený jako % všech uzlů**:

| | take-all | vynucený %uzlů | **zvolený %uzlů** | zvolený podíl z take |
|---|---|---|---|---|
| 1p | 54,8 | 13,1 | **41,8** | 76 % |
| 4p | 49,0 | 9,4 | **39,6** | 81 % |

- Realistický **strop K7 pro „zvolené" gambly ≈ 40–45 %** (est=2 jako % všech uzlů
  = 39,6–40,8). Gate ≤20 % je pro kompetentního bota nedosažitelný z definice
  strategie (gambluje iff est≤2; est=2 má ~40 % uzlů). **Strop je funkcí CENY gamblu:**
  bez ceny je rerol při est=2 racionální (malý upside, ~0 downside) → 40 % je „správně"
  a gate patří na ~45 %; chceme-li ≤20 % (gamble jako vzácná desperace), musí ho
  game-designer ZDRAŽIT, aby est=2 rerol byl −EV. **Vynucený (est≤1) NEGATOVAT.**
- **Oracle vs est** (doměřeno 2026-07-27, oba výklady v jednom běhu): bot NIKDY
  negambluje při vlastním est≥3, ale ORACLE (skutečný šumový prah) ukáže ≥3 dosažitelných
  ve **31 %** gamblovaných uzlů — příznivý šum, který bot (jen kotva) netušil. NENÍ to
  degenerace strategie, je to informační mezera kotva↔prah → sledovat jen diagnosticky.
- EV-proxy: Δmax (post−pre oracle) = 0,07–0,09; realizované pásmo > pre-gamble strop
  jen ve ~14 % gamblů. **EV z logu přímo NEODVODITELNÝ** (chybí zbytek ruky v okamžiku
  líznutí); tohle je proxy. Gamble je „levný, ale málokdy zaplatí".

## Finále (konfrontace = klimax; zar prahy zatah 4 / lecka 7 / konfrontace 10)

- **Dosažení konfrontace:** 1p 88 % → 2–4p 95–96 % runů. lecka ~90 %, zatah ~98 %.
- **Přežití konfrontace ~76–79 %**, plochém napříč pc (1p 76,6 · 4p 78,5).
  Malone 74–77, Brody 78–80.
- **Atribuce proher: ~88 % proher je VE finále** (4p kombinace: 513 konfrontace-prohra
  vs 69 bedny-0; z bedny-0 navíc většina ve finálových uzlech). Konfrontace hru
  rozhoduje — podporuje P1 (K1 řešit přes finále/Žár, ne běžné uzly).

## K5 — % beznadějných situací (max≤1/4, pre-gamble oracle) — ZÁSADNÍ NÁLEZ

**„Vyloučit mechanicky nulované sloty z MAX výpočtu" (P0a doslovně) = matematicky
BEZE ZMĚNY** (va == v0 do desetiny, všechny pc, oba pursueři). Důvod: nulovaný slot
je garantovaný fail = 0, který oracle-MAX už tak nezapočítá; odebrání z MAX ho
nemůže snížit. **Toto je početní invariant, ne artefakt dat.**

Hýbe jen **free-pass** (nulovaný slot = auto-průchod, tým za by-design slot neviníme):

| varianta (4p komb.) | K5 |
|---|---|
| v0 current (vše) | 18,4 % |
| „vyloučit z MAX" (va) | 18,4 % (=v0) |
| free-pass (vše) | 14,5 % |
| jen common | 18,8 % (common NENÍ nižší!) |
| free-pass + common | 11,4 % |
| Malone·common·free-pass (nejlevnější) | **9,7 %** |

- Baseline K5 (logged post-gamble) 4p 17,3 %; per pc: 1p 20,3 · 2p 19,4 · 3p 17,8 · 4p 17,3.
- **Jen ~14 % situací vůbec MÁ nulovaný slot** (všechny pod Malonem; Brody = 0 %,
  ruší štítek GANGSTER přes Žár, ne stat-slot). Jen ~24 % hopeless situací obsahuje
  nulovaný slot → **76 % beznadějnosti nemá s Malonem nic společného.**
- **Závěr pro P0: scoping ani nulled-exclusion NEsrazí K5 pod 5 %.** Driver je
  broad kotva+šum±2 struktura, ne finále a ne Malone. Buď zvednout gate práh
  (~15 %), nebo obsahový/mechanický zásah do šířky beznadějnosti.
- **Potvrzeno re-měřením 2026-07-27** (post-gamble logged basis, k4-mereni.mjs):
  (a)=17,3 · vyřadit-z-počtu=17,3 (NO-OP) · free-pass=13,5 · free-pass+common=**10,8 %**.
  Čísla se od pre-gamble oracle výše liší o ~1 b. (báze), závěr identický: i nejlepší
  kombinace 2× nad gate <5 %.

## K2 — drift míry PRŮŠVIHŮ (uzel 1–2 → 3–4), baseline (dřív chyběl)

Poměr 4p komb. **1,16×** (Malone 1,12 · Brody 1,21); 1p 1,11 · 2p 1,07 · 3p 1,09.
Míra PRŮŠVIHŮ 4p: uzel1–2 21,5 % → uzel3–4 24,8 %. Snowball existuje, ale
**baseline je pod gate-návrhem 1,3×** — kal-3 měl C-real 1,29 / B-real 1,47
(revert kotev drift zvyšoval). Gate 1,3× je nad baseline → buď eskalace postihů
(D22f), nebo revize prahu dolů (~1,15×).

## Nástroj
Diagnostika běžela ad-hoc skriptem přes import reálného enginu (report.js pořád
neumí per-situace/common-finále/est-band rozpad — stále čeká zadání pro
technical-developera z kal-3). Skript: scratchpad/diag-k4.mjs (mimo repo).
