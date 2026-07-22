---
name: sim-model-assumptions
description: Předpoklady simulátoru tam, kde MVP mlčí — nutné pro čtení čísel a příští sim
metadata:
  type: project
---

# Modelové předpoklady simulátoru (kde MVP nebylo explicitní)

**Why:** tahle rozhodnutí nesou balanc; kdo bude číst čísla z brány nebo sim upravovat,
musí vědět, co je pravidlo a co můj domodel. Několik z nich jsou zároveň otevřené
otázky pro design (viz [[sim-gate-findings]] páka #1, #5).

**How to apply:** než někdo prohlásí sim číslo za pravdu, ověř, že jeho předpoklad
odpovídá tomu, jak to nakonec bude v prototypu. Když se pravidlo upřesní, uprav sim.

- **Ruka:** každá postava drží 5 základních karet ze sdíleného balíčku 32; hraje 1/uzel,
  dobírá na 5. MVP velikost ruky ani doběr NEspecifikuje — to je klíčová mezera
  (ovlivňuje dostupnost optimálního tagu → obtížnost). Doporučeno v MVP doplnit.
- **Výsledek 5–7 = REÁLNÉ zranění (D7, zafixováno 2026-07-22).** Už není nejasnost —
  MVP to má jednoznačně. 2. běh ale ukázal, že to na KAŽDÉM hodu × 4 hráči × každý uzel
  je moc silné (viz [[sim-gate-findings]] páka F). Klíčový modelový předpoklad: každý
  hráč hází každý uzel individuálně (shodné s 1. během) — to je motor přívalu zranění.
- **Zoufalé karty** = pool dostupný postavě s 3+ zraněními (neubývají, síla 3).
- **Prokletá karta** = 1 uzel malusu, pak odhoz (jedna za uzel); zákaz tagu > vynucení.
- **Léčka (práh 7)** tvrdost=zar, **Konfrontace (práh 10)** tvrdost=zraneni — teď
  POTVRZENO v obsah/pronasledovatele.yaml (D-změna 7), už ne domodel.
- **Léčka je vkládaná (extra) setkání, konfrontace okamžité extra, Zátah nahradí běžný
  slot.** Toto je modelová interpretace „vložený/okamžitý vs. nahradí obě cesty".
  Dopad velký: extra setkání jsou hlavní zesilovač zranění ve 2. běhu (léčka+konf ~2×/run).
  Když prototyp bude řešit inserted uzly jinak (např. jen 1 hráč hází), přesimuluj.
- **„+2 za vybrané výsledky uzlu"** (přestřelka/mrtvola) VYNECHÁNO — obsah to
  nekonkretizuje; jediný +2 zdroj Žáru v simu je tvrdost `zar`. Doplnit do obsahu.
- **Není uzlová brána:** tým vždy postoupí na další uzel; prohra jen přes 0 beden nebo
  vybití týmu. Odpovídá design-dokumentu (každý hráč řeší svou kartu individuálně).
- Strategie „cíle-driven" = kompetentní hráč sledující svůj tajný cíl (nejbližší
  odhad reálné hry); NEnahrazuje lidský test.
