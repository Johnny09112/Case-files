---
name: muj-den-kontrafaktual
description: Kolo muj-den (2026-07-28) — řez 50 % prošel všemi předregistrovanými kritérii; podíl neodstranil závislost na počtu hráčů, OBRÁTIL ji; normalizovaná divergence je nové měřidlo osobnosti cíle
metadata:
  type: project
---

# Kolo `muj-den` → podílová metrika (2026-07-28) — PROKÁZÁNO SIMULACÍ

**Why:** dnešní `pocet_slotu_splnil >= 3` breachoval K9 (99,4 / 98,3 / 96,0 %
pro 1p–3p). Designér diagnostikoval vadu v metrice, ne v prahu, a předregistroval
naslepo pásma (`scratchpad/muj-den-navrh.md` v2). Report:
`technika/muj-den-kontrafaktual-2026-07-28.md` + graf `.html`.
**How to apply:** čísla platí pro obsah + engine po D42 (+ měřicí commit tohoto
kola). ~124 000 runů, 4 bloky × 1000 seedů × 4 počty × 2 pronásledovatelé,
verdikt z průměru bloků. Do `obsah/` se nezapisovalo — zapečení je P-rozhodnutí.

## Prokázané nálezy

- **4p baseline dnešního cíle = 91,4 %** (predikce designéra 85–93 % trefena) →
  diagnóza „cíl je automatický i tam, kde má nejmíň slotů" **potvrzena**.
  Zásoba slotů vlastníka: 32,1 / 18,4 / 12,3 / 9,1 (škáluje 3,5×, ne 4×).
- **Průchozí je JEDINÝ řez: 50 %** (`podil_slotu_splnil_pct >= 50 a
  sloty_vlastnika_celkem >= 5`, bez `doruceno`): 43,8 / 61,3 / 66,9 / 67,2 %
  nepodmíněně. Řezy 60/67/75 padají v sólu (17,8 / 6,8 / 1,5 %). Splněna VŠECHNA
  předregistrovaná kritéria vč. toho, které mělo variantu zabít (norm. divergence
  0,86 / 0,93 / 0,94 při prahu 0,7). Rezerva k horní hraně je ale tenká: 2,8 b.
- **HLAVNÍ NÁLEZ — podíl závislost na počtu hráčů neodstranil, OBRÁTIL ji.**
  Průměrný podíl je skoro plochý (47,1 / 51,9 / 54,6 / 55,0 %), ale rozptyl klesá
  jako 1/√n a `n` škáluje 3,5× dolů → práh blízko průměru je **v sólu nejtěžší,
  ve 4p nejlehčí**. Rozpětí přes počty 23,4 b. (dnešní práh 8,0 b., ale ten je
  slepený o strop). Predikce designéra i kritika měly pořadí 1p vs. 4p obráceně.
  **Poučení k opakovanému použití:** u bezrozměrné metriky se ptej nejen „jak
  škáluje střední hodnota", ale „jak škáluje rozptyl" — chvost dělá práh.
- **Guard `>= 5` kouše jen ve 4p a jen v 0,7 % runů** (1,8 % s biasem λ=3).
  Histogram `n` ve 4p: min 3 / p10 6 / med 9 / p90 12.
- **K6b: cíl je živý v 80–89 % rozhodovacích uzlů držitele** (dnes 21,7–57,5 %) →
  práh D4 „>50 %" spuštěn = tempové varování. Ale skutečný konflikt s týmovým
  optimem je jen 7,6–19,6 % uzlů (dnes 1,8–9,1 %); *živý* ≠ *sporný*.
- **`sim/assign.js` se měnit nemá — ověřeno, netvrzeno.** Kvóta commitu je
  exogenní (`Math.min(kvóta, ruka.length)`), takže maximalizace podílu =
  maximalizace počtu; míra konfliktu s týmovým optimem je pro obě znění cíle
  identická (8,5 / 22,6 / 17,4 / 15,5 %).

## Retrakce D42 — normalizovaná divergence

Strop divergence při nezávislosti je `1 − p^m − (1−p)^m`. **Absolutní divergenci
nelze číst bez marginální míry** — doklad: `plny-zasah` raw 2,8 % a `muj-den`
raw 21,1 % řadí ta dvě čísla obráceně, než jaká je jejich struktura (norm. 0,03
vs. 0,73). Od teď je normalizovaná divergence trvalým sloupcem `sim/report.js`.

- **Verdikt D42 o `schovana-bouchacka` DRŽÍ** (norm. 0,77 / 0,91 / 0,93), ale
  **zdůvodnění zapsané v `cile.yaml` je chybné**: „41,8–52,9 %" je min–max
  **přes počty hráčů** při čtení botem `cile` (per počet 26,5 / 46,0 / 53,0),
  ne per-count údaj, a absolutní číslo osobnost nedokazuje. Správné znění je v §4
  reportu (předloženo, nezapsáno).
- **Zamítnutí B/C DRŽÍ a fortiori:** 0,00 / kladný strop = 0,00.
- **Nové:** `kupecke-slovo` (norm. 0,20 / 0,35 / 0,49) a `plny-zasah`
  (0,00 / 0,01 / 0,03) jsou v ZAPEČENÉ sadě týmové cíle; `bez-jizvy` na hraně
  (0,71 / 0,66 / 0,65). `hazarder` má norm. > 1 (záporná korelace verdiktů —
  gamble čerpá z ruky jednoho hráče).

## Technika k opakovanému použití

- **Sweep prahu nad metrikou, která neovlivňuje chování bota, se počítá post-hoc
  z jedné dávky.** Pod `kompetentni` je běh na cílech nezávislý, pod `cile` závisí
  bias jen na `id`. Čtyři cuty za cenu jedné dávky; průchodnost loaderu se ověří
  zvlášť přes `CONTENT_DIR`.
- **Jmenovatel míry splnění = runy, kde cíl NĚKDO DRŽÍ.** V 1p ho drží 1/8 runů —
  na téhle pasti jsem v tomhle kole sám uvízl a čísla vyšla ~8× nižší.
- Nulová regrese se dokazuje rekurzivním diffem `summary.json`, ne „v rámci šumu":
  56 rozdílů / 56 uvnitř bloku `cile`; golden snapshot +3 řádky, 0 smazaných.

Hypotézy, které tohle kolo poslalo lidem, jsou v [[pending-human-hypotheses]].
Předchozí kolo: [[mozek-operace-kontrafaktual]] · brána: [[v3-gate-criteria-draft]].
