---
name: kalibrace-5-sweep-prahoffset
description: Sweep zar.prahOffsetDlePoctu (D37) — A1 {0,5,6,6} spraví K1 6/6, K6a na hraně 6,03, cenou je K2 drift; páka má nemonotonní režim (2026-07-27)
metadata:
  type: project
---

# Kalibrace-5: sweep `prahOffsetDlePoctu` — PROKÁZÁNO SIMULACÍ

**Why:** mandát D37 po breachi K1/K6a z D35. Jediná per-count páka bez dotyku
obsahu. Report: `technika/kalibrace-5-sweep-prahoffset-2026-07-27.md`.
**How to apply:** čísla platí pro obsah + engine ve stavu po D35 (opravy N1–N8).
Hodnota v `rules.js` **nebyla změněna** — zapečení je otevřené rozhodnutí uživatele.

## Prokázané balanční nálezy

- **Použitelný rozsah páky je 0–6, ne libovolně vysoko.** Křivka K1(offset) je
  **nemonotonní** a mechanismus je v kódu: prahy jsou `max(1, base − offset)`,
  přežitá konfrontace nastaví Žár přesně na `poPrezitiKonfrontace = 3` a práh se
  nabíjí jen při `heat < prah`. **Každý práh ≤ 3 se stane jednorázovou událostí.**
  Proto offset 4 mírně ZLEHČÍ (zasekne se léčka) a od offsetu 7 se obtížnost
  OTOČÍ (zasekne se konfrontace: 1p 24,8 → 71,6 %). Nález mimo mandát, nahlášen
  a neopraven.
- **A1 = `{1:0, 2:5, 3:6, 4:6}` je JEDINÝ kandidát v gate-pásmu.** 1p je pinnutý
  na 57,3 % (offset 0 je podlaha), takže ostatní musí padnout do [51,3; 63,3];
  3p i 4p tam mají jedinou přípustnou hodnotu (off 6). Verdikt 6×8000:
  K1 **57,3 / 57,0 / 51,7 / 54,7 — 6/6 bloků bez breache**.
- **K6a je pod rozlišením měřidla.** A1 spread 6,03 (3/6) při 1000 runů/buňka,
  ale **5,08 (5/6) při 2000/buňka** — skutečný spread ≈ 5,0–5,6 b. Gate ≤6 b.
  se při standardní dávce z velké části měří šum (max−min ze 4 zašuměných čísel).
  Riziko, na které upozorňoval D31.
- **K1 a K2 drift jsou přes tuhle páku v PŘÍMÉM ROZPORU.** A1 sráží drift
  1,39 → 1,28 (6/6 → 2/6). Mechanismus doložen rozpadem: pozdní PRŮŠVIH-rate se
  nehnula (20,6 → 20,9 %), zvedla se **raná** (14,8 → 16,3 %) — zkrácení trati
  posune tvrdost dopředu a K2 měří přesně to, že má růst dozadu. Kontrolní
  varianta A2 `{0,3,5,5}` platí stejnou cenu (1,26) za horší výsledek → zamítnuta.
- **Páka je hrubá:** jeden krok offsetu = 5–14 b. K1. Jemnější tvar by byl vektor
  po prazích (jiný offset pro zátah/léčku/konfrontaci) — návrh pro game-designera.
- **Beze změny zůstávají K7, K8, pásma běžných uzlů** (PRŮŠVIH common 17,9 → 17,4)
  — potvrzuje, že páka nesahá na obtížnost běžných uzlů (falzifikace kal-3 drží).
- **K5f padal už před změnou** (6 z 8 buněk počet×pronásledovatel mimo [60,80]);
  A1 přidá jednu (2p Malone 77,1 → 81,1). Není to nový pád kategorie.
- **`mozek-operace` má 0 % splnění ve všech variantách včetně baseline** — mrtvá
  volba, nález nezávislý na sweepu, patří game-designerovi.

## Metodická poznámka k harnessu

Verdikt = 6 disjunktních bloků, blok = 1000 seedů × 4 počty × 2 pronásledovatelé
(8000 runů). Baseline přeměřený tímto harnessem reprodukuje D35 do desetiny —
harness je validovaný. Skripty jsou jednorázové (scratchpad), staví nad
`sim/run.js` + `sim/report.js`, metriky nepočítají po svém. Kandidáti se měří
**injektáží pravidel**, `rules.js` se nemění.

Hypotézy, které tenhle sweep otevřel pro lidi, jsou v [[pending-human-hypotheses]].
