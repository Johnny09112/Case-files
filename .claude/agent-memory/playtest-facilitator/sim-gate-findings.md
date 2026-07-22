---
name: sim-gate-findings
description: Verdikt simulační brány a prokázaná balanční čísla (216k runů, 2026-07-22)
metadata:
  type: project
---

# Simulační brána — prokázané nálezy (2026-07-22)

Simulátor ve scratchpadu (Node, seedovaný RNG), 216 000 runů: 3 počty hráčů × 9 strategií
× 2 pronásledovatelé × 2 větve hlasu z auta, à 2000. Věrná pravidla z prototyp-mvp.md.

**Celkový verdikt: NEPROŠLA** kvůli kritériu 1. Ostatní kritéria PROŠLA S VÝHRADAMI.
Náprava je ale jasná a levná (viz páky níže).

**Why:** default čísla dělají kompetentní hru bez tření — brána tohle měla chytit
před zabetonováním do prototypu, a chytila.

**How to apply:** než se čísla zafixují do prototypu, protlačit game-designerem
aspoň páku #1 (sémantika 5–7) a přesimulovat. Po změně kterékoli páky přesimuluj.

## Prokázaná čísla (jen matematika/tempo, NE zábavnost)
- Kompetentní hra vyhrává skoro vždy: greedy/opatrná/bedny-šetřící 96–98 % DORUČENO;
  realistická „cíle-driven" 90 % (84 % u 4 hráčů). Zdravé pásmo je 40–70 %. → krit. 1 padá.
- **Nejsilnější páka = sémantika výsledku 5–7.** Default „poznámka" (bez zranění) →
  kompetentní 4p 88–91 %. Kdyby 5–7 = reálné zranění → 72,5 % (zdravé). Rozdíl je obří,
  a MVP to má nejednoznačně („zranění NEBO poznámka").
- Snowball u 4 hráčů/realistické hry zrychluje přesně od 3. uzlu (delta zranění
  0,67→1,27 na uzlu 3). U 1–2 kompetentních hráčů je snowball zanedbatelný (moc snadné).
- První práh Žáru (4=Zátah) padá medián uzel 3 — sedí s cílem 3.–4. uzel.
- Zátah je měkký: reálně padne jen ~0,22×/run (tým si vybere druhou cestu).
- Konfrontační kolotoč: práh 10 padne 1,5–2,6×/run u realistické 4p hry (Brody až 3,8×),
  protože přežití sráží Žár jen na 6 (těsně pod 7) a hned se recykluje → ztrácí „finální" ráz.
- Škálování je invertované: víc hráčů = těžší (sdílené bedny drané per-hráč eventy).
  1–2 hráči moc snadní; 1 hráč swingy (15 % náhlý wipe).
- Kanály ztráty beden nevyvážené: Útěk rider >> tvrdost bedna > dobrovolný Úplatek.
  Mono-Útěk 4p končí 94 % na 0 beden → Útěk je past.
- Tagy jako mono-strategie nevyvážené (24 p.b. rozptyl): Úplatek 83 % / Lest 79 % bezpečné,
  Násilí 64 % (wipe přes Žár) a Útěk 58 % (0 beden) pasti. Žádný tag ale „neválcuje"
  nad smíšenou greedy hrou.
- Cíl „obětní beránek" (max síla ≤1) je i při cíleném hraní splněn jen ~1 % → prakticky
  mrtvý (blokují ho zoufalé síla3, Zbrklost, nedostatek síla-1). Ostatní cíle 17–58 % (OK).
- Pronásledovatelé fungují oba; Brody (hlučná +2) trestá Násilí prokazatelně
  (tag-nasili+Brody 4p jen 47 % DORUČENO). Malone/Brody i obě větve hlasu z auta jsou
  živé volby (hlas: buff 88 % vs curse 80 % u 4p — smysluplný swing).

## Navržené páky (poslány game-designerovi, čekají na rozhodnutí čísel)
1. 5–7 ať bije: reálné zranění nebo volba zranění/−1 bedna, ne „poznámka zdarma".
2. Zúžit „vždy dostupný +2 tag" (menší ruka / uzly bez +2 / vyšší prahy) — kompetentní
   selhání je teď skoro nemožné.
3. Konfrontace: přežití sráží Žár níž (3–4) NEBO léčka/konfrontace jen 1×/run NEBO
   konfrontace ukončí run.
4. Zátah (práh 4) přitvrdit — teď je beztrestně obejitelný.
5. Útěk rider míň krvavý na bedny (střídat zranění/bedna, nebo jen u nižší tvrdosti).
6. „Obětní beránek" zmírnit na max síla ≤2, nebo výjimka pro vynucené/zoufalé karty.
