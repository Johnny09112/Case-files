---
name: separabilita-cenikovy-null
description: Mezislotové vazby — cena jako funkce počtu zásahů je vždy sveditelná na ceník; sítko pro kandidáty a správný null model předregistrace
metadata:
  type: feedback
---

Když navrhuji vazbu mezi sloty, musí kandidát projít **analytickým sítkem dřív,
než se cokoli měří** (kolo D52(3), 2026-07-30 — tři zamítnuté kandidáti):

- **(a)** Je cíl funkcí **víc než jednoho** aditivního součtu přes dvojice
  (karta, slot), i po dosazení reálné ekonomiky pásem?
- **(b)** Existuje nezanedbatelný podíl instancí, kde tým při realistickém kurzu
  **dobrovolně obětuje zásah**? Bez toho není co měřit.
- **(c)** Kolik Žáru na uzel to bere/přidá? Každý zásah do zdroje Žáru se měří
  **nejdřív na Žár/uzel a teprve pak na K1** — jinak se daňová sleva čte jako design.
- **(d)** Rozchází se kandidát s `argmax E[H]` i pro **reálný** užitek pásem, ne
  jen pro krajní preferenci?

**Why:** dokázáno měřením i analyticky — **cena, která je monotónní funkcí
jednoho váženého součtu přes dvojice, je sveditelná na ceník** (práh, rozpočet,
kvórum, cap, eskalace). Tím padla celá rodina „sdílený rozpočet → Žár". Pozor na
rozsah: **neplatí to pro nemonotónní funkce součtu** (skalarizace generuje jen
podporované Paretovy body) ani pro **cenu vázanou na vzájemnou polohu karet**
(kvadratické členy) — ta zůstává neprozkoumaná, ne mrtvá. Mrtvé je „cena jako
funkce **zásahů**", ne „Žár". Detaily: `technika/separabilita-navrh-2026-07-30.md`.

**Předregistrace musí mít správný NULL MODEL, ne jen práh.** Dvakrát za sebou
selhala předregistrace, ne mechanika: M2 („nesveditelnost na ceník") byla
tautologie, protože lexikografické optimum je limita λ→0+ téhož ceníku; a
divergence `argmax E[H]` vs `argmax P(4/4)` je rozdíl dvou ceníků (`Σp` vs
`Σ log p`). **Ptej se vždycky: co přesně je ta třída, vůči které měřím
nesveditelnost, a nemůže mi vyjít z definice?** Konvence musí být *weak*
(argmax nullu ⊆ pravá optima); *strict* měří jen rozbíjení remíz.

**How to apply:** platí pro každý další návrh mezislotové vazby i pro každou
metriku „je se o čem rozhodovat". Nosný důkaz je **behaviorální** (dva boti
s různou posturou → rozdíl v K1), ne oracle-vázaná metrika nad známými prahy.
Souvisí: [[divergence-a-falzifikovatelnost]], [[preregistrace-kriterii]],
[[kalibrace-revert-falzifikace]].

**A hlavní designový závěr, který si nesu dál:** hádka u stolu nevzniká
z nerozložitelného cíle, ale z **rozcházejících se cílů nebo informace**
(Hanabi, The Crew, Magic Maze vs. Pandemic a jeho alfa hráč). Úspěšná
mezislotová vazba by quarterbacking spíš **zhoršila** — dělá úlohu těžší a
těžší úloha nahrává tomu, kdo počítá nejlíp.
