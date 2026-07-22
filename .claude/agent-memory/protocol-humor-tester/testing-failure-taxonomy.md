---
name: testing-failure-taxonomy
description: Znovupoužitelné vzorce, kde protokol selhává, a jak probíhat karty/uzly při testu humoru (kalibrace role, trvalá)
metadata:
  type: project
---

# Taxonomie selhání protokolu — jak testovat

Kalibrace pro roli protocol-humor-tester. Nejde o seznam konkrétních rozbitých
karet (to patří PM / do sdílených git souborů), ale o **jak probíhám** karty,
abych selhání našel dřív než hráč. Metodika je trvalá; stav promptu níže je
snapshot — před použitím ověř proti changelogu v `prompty/protokol.md`.

## Vzorec 1 — fikce karty tvrdí mechanický fakt → svádí ke změně výsledku (KRITICKÉ)
Karty, jejichž **text tvrdí konkrétní mechanický dopad** (ztráta/zisk beden,
hladký bezproblémový úspěch, hluk, zranění), svádějí model přepsat nebo změkčit
`VÝSLEDEK MECHANIKY`.
- **Jak testovat:** vždy takovou kartu spároj s výsledkem, který její fikci
  ODPORUJE. Např. „hladce projde, nikoho neprohledávají" + *úspěch za cenu
  (zranění)* → model rád zranění zamlčí. „Věnuješ bednu, náklad je lehčí"
  + *úspěch; náklad beze změny* → model rád sníží počet beden.
- **Regresní karty (odhalily riziko, hlídej je dál):** `bedna-na-ochutnavku`
  (tvrdí ztrátu bedny), `plyn-na-podlahu` (tvrdí „pár beden vypadne"),
  `knezsky-kolarek` (tvrdí bezproblémový průchod).
- **Stav v promptu:** v0.2 posílila pravidlo 2 (priorita VÝSLEDKU MECHANIKY nad
  textem karty) + přidala pole `bedny ztracené tímto hodem`. Otestuj, zda to
  slabý Haiku reálně drží — posílení promptu neznamená vyřešeno.

## Vzorec 2 — „bez hodu / uzel vynechán" nemá slot ve formátu → model dopoví úspěch
Formát `VÝSLEDEK MECHANIKY` zná jen úspěch / úspěch za cenu / selhání. Prokletá
karta, která **ruší hod** a nechá postavu uzel vynechat, produkuje stav mimo
formát → slabý model dopoví smyšlený (typicky úspěšný) výsledek = fabrikace.
- **Designové rozhodnutí (v0.2):** stav „bez hodu" se do formátu NEpřidal;
  místo toho se prokletá karta přepracovala na **modifikátor hodu**
  (`nutkani-ochutnat`), takže každý hod končí úspěch / za cenu / selhání.
- **Jak testovat:** hlídej **každou NOVOU** prokletou kartu, která ruší hod
  místo aby jen upravila modifikátor — znovu zavádí stav mimo formát. Prokleté,
  které jen mění hod (±modifikátor, zákaz tagu, vynucení karty), jsou pro
  protokol OK.

## Vzorec 3 — fallback šablony: apozice placeholderu vs. pevný pád / typ názvu
Fallback šablony (`prompty/fallback-sablony.yaml`) jsou hotový text s placeholdery;
engine dosazuje `{jmeno}` a `{uzel}` v **1. pádě**. Dvě opakující se vady:
- **`{jmeno}` v šikmém pádě = rozbitá shoda (řemeslná vada, opravit).** Šablona nesmí
  psát „podezřelého {jmeno}" / „únik podezřelého {jmeno}" — po dosazení nominativu
  vznikne „podezřelého Vincenc Bartoš". Přestav na nominativní podmět. Odhaleno
  2026-07-22 u `fb-selhani-1/-4/-5`.
- **„v místě zvaném {uzel}" na uzlu pojmenovaném dějem/věcí = nesmysl (tonální/design).**
  Uzly jsou mix místopisu („Brod u farmy", „Slepá ulička") a dějů/věcí („Přepadení
  rivalů", „Chybějící razítko", „Houkačky v Albany", „Zátah"). Apozice „v místě
  zvaném X" sedí jen na místopis. Řešení není per-šablona: buď úřední label
  („v hlášení vedeném jako {uzel}" — vzor už drží `fb-zatah-1`), nebo reklasifikace
  názvů u zdroje (content-generator). Není to rozbitá shoda → jen návrh, ne oprava.
- **Test:** každou šablonu dosaď kombinací s uzlem pojmenovaným dějem a s postavou
  ve všech pádových kontextech; „{karta}" v uvozovkách drží 1. pád napříč rody OK,
  ale za předložkou (o/na/po „{karta}") mírně skřípe — nejhladší je „postup/záměr/
  vedeno jako „{karta}"". Hlídej i vyřazenou postavu: „umírající" přepisuje mechaniku
  (postava je jen vyřazená „leží v autě", ne mrtvá).

## Stav promptu (snapshot: v0.2, 2026-07-22)
v0.2 adresovala oba vzorce výše (rule 2 + pole beden pro Vzorec 1; přepracování
karty na modifikátor pro Vzorec 2). Otevřené: ověřit na reálném Haiku, že
posílené rule 2 skutečně drží pod tlakem odporující fikce (nejhorší z ~3 variant).
Drž prompt krátký (Haiku, cache) — při dalším ladění cíli, nepřepisuj celek.

## Vlastní zaujatost
Jsem silnější než produkční Haiku. Generuj vždy i **nejhorší** variantu — dobré
varianty maskují riziko, které hráč reálně uvidí.
