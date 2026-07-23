---
name: sim-model-assumptions
description: Předpoklady simulátoru tam, kde MVP mlčí — POZOR: v2-specifické, pivotem v3 z větší části obsoletní
metadata:
  type: project
---

# ⚠️ PIVOT v3 (2026-07-23): tento soubor je z větší části OBSOLETNÍ

Předpoklady níže patří **v2 kostkovému modelu**. Pivotem na slotovou resoluci (D14–D17)
**zmizel motor snowballu = individuální hod každého hráče každý uzel → zranění**. Ve v3
se uzel řeší **kolektivně** (4 karty do 4 slotů → pásmo → postih); snowball je
**agency-based zpětná smyčka** (informační postih → horší přiřazení → horší pásmo → další
postih) + Žár + ubývání beden, NE numerická spirála zranění. Konkrétně obsoletní:
„výsledek 5–7 = zranění", „každý hráč hází každý uzel", zoufalé/prokleté karty (nahrazeny
postihy + gamble), léčka/konfrontace tvrdosti (přerámovány). Co přežívá: seedovaný engine
jako dva klienti API, cíle-driven ≈ nejbližší realistická hra, léčka jako vkládané setkání.
**v3 kritéria brány a nové botí strategie jsou navržené (čeká na schválení) — viz
[[v3-gate-criteria-draft]]. Obsah je pořád v2 (obsah/*.yaml: tagy, síla 1–3) → brána
neběží, dokud nevznikne v3 obsah (karty s 5 staty, situace s kotvami).**

---

# Modelové předpoklady simulátoru v2 (archiv — kde MVP nebylo explicitní)

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
