---
name: testing-failure-taxonomy
description: Znovupoužitelné vzorce, kde protokol i fallback šablony selhávají, a jak je probíhat při testu humoru (kalibrace role, trvalá); snapshot promptu v0.3
metadata:
  type: project
---

# Taxonomie selhání protokolu — jak testovat

Kalibrace pro roli protocol-humor-tester. Nejde o seznam konkrétních rozbitých
karet/šablon (to patří PM a do sdílených git souborů), ale o **jak probíhám**
obsah, abych selhání našel dřív než hráč. Metodika je trvalá; stav promptu dole
je snapshot — před použitím ověř proti changelogu v `prompty/protokol.md`.

## A. Vzorce u LLM protokolu

### A1 — fikce věci/karty tvrdí mechanický fakt → svádí ke změně výsledku (KRITICKÉ)
Věci, jejichž **text tvrdí konkrétní mechanický dopad** (ztráta/zisk beden, hladký
průchod, hluk), svádějí model přepsat nebo změkčit `VÝSLEDEK MECHANIKY`.
- **Jak testovat:** vždy takovou věc spároj s výsledkem, který její fikci
  ODPORUJE („projde bez povšimnutí“ + postih; „náklad se odlehčí“ + náklad beze změny).
- **Stav promptu:** v0.3 rule 3 dává prioritu VÝSLEDKU MECHANIKY nad textem věci
  a rozšiřuje ji na sloty/postihy/Žár; rule 4 legalizuje komedii špatné volby, ale
  zakazuje měnit výsledek slotu. Otestuj, zda to slabý Haiku reálně drží.

### A2 — stav mimo formát → model dopoví smyšlený (typicky úspěšný) výsledek
Cokoli, co vyprodukuje stav, pro který `VÝSLEDEK MECHANIKY` nemá slot, slabý model
dopoví. Ve v3 formát zná jen čtyři pásma, takže hlídej **každou novou mechaniku,
která pásmo obchází** (uzel bez vyhodnocení, přeskočený slot, vnější vliv).

## B. Vzorce u fallback šablon (fixní text, bez modelu — ADR-004 = primární text bez klíče)

**Posuzuj je stejně přísně jako výstup LLM.** Slabá šablona je vidět v nejhorší moment.

### B1 — „pojistná“ varianta bez `podminka` musí být pravdivá v CELÉM pásmu (KRITICKÉ)
Varianta bez `podminka` se přidává proto, aby žádná kombinace stavu nespadla do
`NOUZOVY_ZAZNAM`. Autoři pak hlídají jen **placeholdery** a zapomenou, že varianta
je kandidát i ve stavech, kde její **tvrzení** neplatí — takže lže právě tam, kde
je jediným kandidátem. Odhaleno 2026-07-27 (`fb-v3-nasledky-5`, `fb-v3-prusvih-5`:
„Následky byly zaneseny do listů zúčastněných osob“ ve stavu `postih: ne`).
- **Test:** u každé šablony bez `podminka` projdi VŠECHNY stavy jejího pásma
  a ptej se, co v nich mechanika negarantuje.
- **Zdroj pravdy je engine, ne dokument:** postih v pásmu není garantovaný, když
  `obet == null` (slot bez vlastníka), a v PRŮŠVIHU navíc **fold a `penalty_added`
  se vylučují** (při dosaženém capu `addPenalty` volá `foldCharacter` a vrací se
  před logem) — takže pojistka je *de facto* povinný společník odstavce `kolaps`.

### B2 — `{jmeno}` jen v NOMINATIVNÍ apozici; šikmý pád = rozbitá shoda
Engine dosazuje příjmení v 1. pádě a **neskloňuje**. „na podezřelého {jmeno}“ →
„na podezřelého Bartoš“. Jediná bezpečná vazba je nominativní podmět
„podezřelý {jmeno}“; potřebuje-li věta jiný pád, přestav větu.
- Odhaleno 2× (2026-07-22 `fb-selhani-1/-4/-5`; 2026-07-27 `fb-v3-kolaps-2`).
- **Podruhé to bylo horší: chybný tvar byl posvěcený v hlavičce souboru jako
  kontrakt.** Vždy čti i schéma/komentář, ne jen texty — chyba v komentáři se
  propíše do dalších kol.
- Otevřené: „podezřelý {jmeno}“ předpokládá mužský rod (ženská postava → „podezřelý
  Kovářová“).

### B3 — šablona tvrdí TRVÁNÍ nebo DOPROVODNÝ FAKT, který mechanika negarantuje
Tři poddruhy, všechny viděné:
- **trvání:** „do dalšího úseku vstupuje s tímto omezením“ neplatí pro postihy
  s `trvani: ihned` (aplikují se a nejdou do fronty).
- **mazání/existence:** „lehčí následky opadly, těžší zůstaly“ — `smazane_lehke`
  může být prázdné pole.
- **popření události:** „hlídka měla jiné starosti“ popírá růst Žáru, který ve v3
  roste i mimo PRŮŠVIH (2/4 pásmo + hlučné karty v kterémkoli pásmu).
- **Test:** každé tvrzení ve tvaru „X se stalo / X se nestalo / X potrvá“ dohledej
  v enginu. Pokud to není v události, ze které se odstavec plní, nesmí to v textu být.

### B4 — apozice `{uzel}` a mrtvý slovník předchozí verze
- „v místě zvaném {uzel}“ sedí jen na místopis; uzly jsou mix místopisu a dějů →
  používej úřední label („v úseku vedeném jako {uzel}“, „v hlášení vedeném jako {uzel}“).
- **Mitigace „placeholder používá jen menšina šablon“ prověřuj po pásmech, ne
  globálně** — 2026-07-27 platila pro pásma, ale úvodní odstavce na něm stály 3/3.
- Hlídej slovník zrušené verze (v3: „zranění“ místo „postih“, „hod“ místo „pásmo“,
  „umírající / kdo přežil“ — složená postava se vrací, nikdo neumírá).

### B5 — sada projde po jedné, ale poskládaný spis je vyplněný formulář (řemeslo)
Nejsilnější nález 2026-07-27 a **nejde ho najít čtením šablon jednotlivě.**
- **Vždy sestav 2–3 poskládané runy** v reálném pořadí odstavců a čti je vcelku.
- Co hledat: (1) **stejné pořadí informace** ve všech variantách pásma — bohatá
  slovní zásoba to maskuje, rytmus ne; (2) **registrová kotva na konci každého
  odstavce** (u v3 „stav nákladu: N“ v 17/17 pásmových šablon, přičemž číslo se
  většinou nemění); (3) **kupení závorkových poznámek** — pravidlo „max 1 na
  odstavec“ je splněné, a přesto jich vyjdou 4 za sebou; (4) **dvojí pojmenování
  uzlu** v sousedních odstavcích (úvod + pásmo).
- **Lék není víc slov, ale jiné pořadí informace** v 1–2 variantách pásma
  (vést výpovědí svědka, vést inventurou škody) + škrtnout kotvu z poloviny variant.

## C. Jak testovat placeholdery proti kódu
Vždy tabulka placeholder → událost enginu, která ho plní. Konkrétní pasti:
- Placeholder **bez producenta** (`{veci}` neměl kód, formát je nový kontrakt).
- Placeholder **bez zdroje v obsahu** (`{uzel}`: `obsah/situace.yaml` nemá `nazev`).
- **Zastaralá hodnota:** `band_resolved` se loguje PŘED aplikací postihu, takže
  `zbyva_beden` nezahrnuje ztrátu z `ztrata_naklad` → text by tvrdil aritmetiku,
  kterou si hráč přepočítá. Hledej pořadí `log.append` vs. `apply*`.
- `podminka` klíče musí sedět na `sedi()` v `protocol-fill.js` (v3: `postih`/`bedna`,
  `zraneni` zaniká).

## D. Doložené fakty o mechanice v3 (ověřeno v kódu 2026-07-27, ne hádáno)
- **Bedny se NEztrácejí jen v PRŮŠVIHU.** `prototyp-mvp.md` ř. 168 („PRŮŠVIH /
  ztrátové postihy berou náklad“) + `state.js` `applyImmediate → loseCrates`.
  Lehký postih `vysypana-bedna` je v poolech `s_nasledky` čtyř situací → `bedna: ano`
  v pásmu 2/4 je legitimní. Zadání kola tvrdilo opak; **arbitráž vyhrál obsah.**
- Loot ve 4/4 autorují všechny situace i všechny léčky/konfrontace, a `drawCard()`
  při prázdném balíku zamíchá odhazovací hromádku → zmínka o kusu navíc je bezpečná.
- Kvóta commitu se za složenou postavu **nepřerozděluje** (`seatQuota` je pevná per
  sedadlo) → „nikdo za něj úlohy nepřevezme“ je pravdivé.
- Složená postava nemá žádný mechanický kanál → „hlas z auta“ by nebyl oživený text,
  ale nová mechanika. Do archivu, dokud nebude v `EVENT`.

## Stav promptu (snapshot: v0.3, 2026-07-23)
v0.3 = remap na v3 (SITUACE/ROZDĚLENÍ/VÝSLEDEK MECHANIKY/NÁSLEDKY, placeholdery
„podezřelý A–D“ místo jmen, rule 4 o komedii špatné volby). **Stále NEOTESTOVÁN na
produkčním modelu** — největší produktové riziko je tím pádem neměřené. Drž prompt
krátký (Haiku, cache); při ladění cíli na jedno pravidlo, nepřepisuj celek.

## Vlastní zaujatost
Jsem silnější než produkční Haiku. U promptu generuj vždy i **nejhorší** variantu.
U fallbacků (fixní text) zaujatost nehrozí — tam je past opačná: text čtu izolovaně
a přehlédnu, že poskládaný spis je formulář (viz B5).
