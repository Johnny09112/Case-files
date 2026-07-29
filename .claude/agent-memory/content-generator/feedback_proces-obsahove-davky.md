---
name: proces-obsahove-davky
description: Jak vést obsahovou dávku — fikce má přednost před metrikou, měř místo odhadování, škrtnuté položky do patičky souboru
metadata:
  type: feedback
---

## Fikce má přednost před číslem

Když obsah dostane za úkol dotlačit metriku brány (K1–K9), zadání typu „chybí 0,03
driftu, přiřaď situacím fázi" se řeší **fikční logikou**. Položku, kterou by fikce
a číslo táhly proti sobě, nechávám **bez přiřazení** — nikdy ji neohnu.
Kontrolní test návrhu: *zůstaly v něm položky, které jdou proti číslu?* Když ne, je
to setříděná tabulka s dolepenou historkou. Do výstupu explicitně napiš, kde jsem si
mohl pomoct a neudělal to.
**Why:** designér to formuloval jako tvrdé omezení („nechci tabulku seřazenou dle
PRŮŠVIH-rate s dolepenou historkou") a **negativní doporučení označil za plnohodnotný
výstup**. **How to apply:** u každé kalibrační dávky; odhad dopadu na metriku dávej
jako pásmo s tlumiči, ne bodové číslo, a napiš, že je to návrh k měření (měří se
kontrafaktuálně přes `CONTENT_DIR`).

## Měř, neodhaduj

Číselné vlastnosti obsahu (délka textu ve znacích, počty, rozložení) **spočítej
nástrojem a napiš skutečné číslo u každé položky.** **Why:** kolo telegrafů uvádělo
„~330 zn." u textu, který měl 385 — na odhadech od oka se projekt už spálil.
**How to apply:** i když nemám Bash, dá se soubor zapsat do scratchpadu a změřit;
nikdy nepiš přibližné číslo tam, kde je strop.

## Místo, kde invariant/zadání nejde splnit, je NÁLEZ

Ne důvod k tichému ohnutí pravidla. Vypiš ho do výstupu jako samostatnou položku.
Totéž platí pro prázdné políčko v kontrolní tabulce.

## Škrtnuté položky patří do KOMENTÁŘOVÉ PATIČKY souboru, ne do commitu

Vzor: patička `obsah/cile.yaml` u `mozek-operace`. Uveď text původní položky, datum,
věcný důvod a **poučení**, ať se nápad nenavrhne znovu. Pozor při editaci: patička
musí zůstat na KONCI souboru, i když se škrtaná položka nahrazuje uprostřed seznamu.

Viz též [[kalibrace-obsahu]], [[telegraf-invariant]].
