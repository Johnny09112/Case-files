---
name: design-era-kalibrace
description: Aktuální designová éra hry a designový vkus uživatele — kalibrace, ať nenavrhuji zastaralé v2 mechaniky jako nové
metadata:
  type: feedback
---

Od 2026-07-23 je kanonem **v3 slotová resoluce** (D14–D17, překlopeno do
`design-dokument.md` + `prototyp-mvp.md`). Nenavrhuj v2-éra mechaniky jako by byly
nové: **kostka d6, 4 tagy + ridery, pevné postavy, zranění jako −X, prokleté/zoufalé
karty** jsou nahrazené (5 statů vs. skryté prahy, postihy, gamble-záchrana, profily
hráčů, „rozděl 4 karty nejméně špatně"). Zdroj pravdy: oba kanonické dokumenty;
`projekt/navrh-v3.md` je jen archiv procesu pivotu.

**Why:** uživatel vede odvážné pivoty a nechce recyklovat zavržené směry; škrtnuté
nápady (Jackbox, tajné karty, AI balancování, product placement) se nevzkřísují.

**Designový vkus uživatele (pozorováno):** preferuje **náhodu na vstupu** (co ti
přijde do ruky) místo na výstupu (hod), **komedii zabudovanou v mechanice** místo
odečítání síly, a záchrany, které komedii **ředí**, odmítá (proto gamble draw místo
utracení druhé věci).

**How to apply:** při návrhu drž se v3 slovníku; než doručím návrh, nech ho roztrhat
design-criticem (hlavní pracovní režim) a předlož obojí spolu.

**Spolupráce — uživatel váží vizi nad čistotou balancu.** V D16 dvakrát přehlasoval
pevná doporučení kritika (kreditovou ekonomiku i tajné cíle nechal v MVP, ač kritik
radil odložit) — přijal přidanou složitost výměnou za features, kterým věří.
**How to apply:** doporučení kritika neber jako finální verdikt; když navrhuješ škrt
kvůli scope/balancu, nabídni i variantu „ponechat + čím to podepřít", ať má uživatel
z čeho vybrat. Craft-opravy (jak to udělat dobře) bere bez diskuse; strategické
škrty rád přehodnotí sám.

**Nepřepisuj uživatelův mechanismus na vlastní, když řešíš nález kritika.** V revizi
D16 jsem na kritiku „4p má horší commit-info" vymyslel *poolový commit* (commit >
slotů, výběr, návrat karet) — jenže uživatel měl vlastní model (commit přesně 4,
vše se rozdělí, „rozděl nejméně špatně") a musel to opravovat (D17).
**How to apply:** když kritik najde díru v uživatelem zadané mechanice, řeš ji
*uvnitř* jeho modelu (zde: velikost ruky jako páka), nebo se **zeptej**, než
zavedeš strukturálně jiný systém. Velké mechanické změny bez pokynu = riziko
nepochopení.
