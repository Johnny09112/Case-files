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

## Čísla: buď změřená, nebo přiznaně odhadnutá — nikdy vymyšlená

Číselné vlastnosti obsahu (délka ve ZNACÍCH, počty, rozložení) nepiš od oka.
**Why:** kolo telegrafů uvedlo „~330 zn." u textu, který měl 385, a délky se
v projektu spletly dvakrát o 30–50 znaků; bajtové měření navíc nadhodnocuje český
text o ~10 % (diakritika v UTF-8), takže jednotka je `String.length`, ne bajty.
**How to apply:** počty a výskyty frází spočítám vždy sám (jde to odškrtáním).
**Délky ale spočítat nemám čím — nemám Bash** a zápis do scratchpadu sám nic
nezměří. Proto délku uvedu jako **výslovně označený odhad** a definitivní měření
patří `playtest-facilitator`. Vymyšlené „přesné" číslo je horší než přiznaný odhad.

## Přepisy od recenzentů kontroluj, nepřebírej

Návrh kritika ani humor-testéra není hotová oprava — projdi ho proti mechanice
a proti slotům. **Why:** dvakrát potvrzeno designérem. (1) Prověrka 2026-07-27:
přepis fallbacku tvrdil „jediná zdařilá úloha" tam, kde pásmo znamená ≤ 1 (i nulu).
(2) D49: odmítl jsem 3 ze 7 návrhů humor-testéra na telegrafy („dveře ve zdi" by
pojmenovaly skrytý nástrojový slot, „postraněk" a „údaj v knize" by nesly týž
předmět jako viditelný nárok) a Brodyho připomínku sjednotil na „pozornost" místo
navrhovaného „výstřelu"/„olova", protože `rusi` je `typ: stitek, cil: GANGSTER` —
tedy i karta ve skrytém slotu, kde se nestřílí. Designér dal v obou případech za
pravdu mně. **How to apply:** odmítnutí zdůvodni věcně a nahlas v reportu kola;
sáhnu-li i na už schválenou položku, přiznám to jako overreach a nechám rozhodnout
designéra (D49: `urednik-vaha` — přijato).

## Místo, kde invariant/zadání nejde splnit, je NÁLEZ

Ne důvod k tichému ohnutí pravidla. Vypiš ho do výstupu jako samostatnou položku.
Totéž platí pro prázdné políčko v kontrolní tabulce.

## Škrtnuté položky patří do KOMENTÁŘOVÉ PATIČKY souboru, ne do commitu

Vzor: patička `obsah/cile.yaml` u `mozek-operace`. Uveď text původní položky, datum,
věcný důvod a **poučení**, ať se nápad nenavrhne znovu. Pozor při editaci: patička
musí zůstat na KONCI souboru, i když se škrtaná položka nahrazuje uprostřed seznamu.

Viz též [[kalibrace-obsahu]], [[telegraf-invariant]].
