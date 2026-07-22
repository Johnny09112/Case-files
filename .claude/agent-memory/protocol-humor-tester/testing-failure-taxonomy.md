---
name: testing-failure-taxonomy
description: Znovupoužitelné vzorce, kde protokol selhává (jak probíhat karty a uzly při testu humoru)
metadata:
  type: project
---

# Taxonomie selhání protokolu — jak testovat

Kalibrace pro roli protocol-humor-tester. Nejde o seznam konkrétních rozbitých
karet (to patří PM / do sdílených git souborů), ale o **jak probíhám** karty,
abych selhání našel dřív než hráč.

## Vzorec 1 — fikce karty tvrdí mechanický fakt → svádí ke změně výsledku (KRITICKÉ)
Karty, jejichž **text tvrdí konkrétní mechanický dopad** (ztráta/zisk beden,
hladký bezproblémový úspěch, hluk, zranění), svádějí model přepsat nebo změkčit
`VÝSLEDEK MECHANIKY`.
- **Jak testovat:** vždy takovou kartu spároj s výsledkem, který její fikci
  ODPORUJE. Např. „hladce projde, nikoho neprohledávají" + *úspěch za cenu
  (zranění)* → model rád zranění zamlčí. „Věnuješ bednu, náklad je lehčí"
  + *úspěch; náklad beze změny* → model rád sníží počet beden.
- **Příklady z návrhu MVP 2026-07-22:** `bedna-na-ochutnavku` (tvrdí ztrátu
  bedny), `plyn-na-podlahu` (tvrdí „pár beden vypadne"), `knezsky-kolarek`
  (tvrdí bezproblémový průchod).

## Vzorec 2 — „bez hodu / uzel vynechán" nemá slot ve formátu → model dopoví úspěch
Formát `VÝSLEDEK MECHANIKY` zná jen úspěch / úspěch za cenu / selhání. Prokletá
karta, která **ruší hod** a nechá postavu uzel vynechat, produkuje stav mimo
formát → slabý model dopoví smyšlený (typicky úspěšný) výsledek = zmatení / fabrikace.
- **Jak testovat:** každou kartu, která ruší hod, ne jen upravuje modifikátor.
  Prokleté, které jen mění hod (±modifikátor, zákaz tagu, vynucení karty),
  jsou pro protokol OK — pořád končí úspěch/za cenu/selhání.
- **Příklad:** `nutkani-ochutnat` (2026-07-22).

## Stav promptu (v0.1, 2026-07-22)
Rule 2 zakazuje měnit výsledek/čísla/zranění, ale NEadresuje: (a) konflikt fikce
karty vs. mechaniky, (b) stav „bez hodu". Oba jsou kandidáti na cílené posílení
rule 2 + nový bod. Drž prompt krátký (Haiku, cache).

## Vlastní zaujatost
Jsem silnější než produkční Haiku. Generuj vždy i **nejhorší** variantu — dobré
varianty maskují riziko, které hráč reálně uvidí.
