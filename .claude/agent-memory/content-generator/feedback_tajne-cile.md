---
name: tajne-cile-mechanicke
description: Tajné cíle musí být mechanické a mít divergenci verdiktu mezi hráči; textové cíle jsou strukturálně mrtvé, protože prompt nenese jména (nálezy 2026-07-28)
metadata:
  type: feedback
---

## Cíl bez DIVERGENCE VERDIKTU je týmový cíl v přestrojení

Nález kontrafaktuálu 2026-07-28 (~290k runů). Můj instinkt „nová osa rozhodování"
mě svedl ke kandidátům nad `kredity_utracene_za` (odbočka do motelu, handl u silnice).
Oba PADLY na pásmech a měly **0,00 % divergenci** ve ~150k runech: `events.js`
u kreditů nefiltruje `hrac_id`, takže je to metrika TÝMOVÁ. Cíl se stejným verdiktem
u všech hráčů nedává důvod hádat se o přiřazení (design §4.10) = mrtvý cíl.
**How to apply:** než navrhnu cíl, ověřím v `events.js`, že metrika je opravdu
per-postava, a do zadání měření vždy přidám divergenci jako kritérium vedle míry
splnění. Vítězný `schovana-bouchacka` má 41,8–52,9 %.

- **Práh vol z měření, ne od oka:** `>= 2` u téhož cíle spadl na 4,9 % ve 4p (pod
  K9 floor). Ostřejší podmínka se v co-opu škáluje mnohem hůř, než vypadá.
- **Pásma si nech předregistrovat naslepo a výhradu facilitátora nes do `poznamka`.**
  I schválený cíl bývá „dobrý, ne skvělý" (u `schovana-bouchacka` přijde ve 4p
  ~78 % splnění zadarmo z týmově optimálního přiřazení). Zapsat to je levnější
  než to příští session znovu měřit.
- Nový cíl nesmí odměňovat sebe-vyřazení ani čistou pasivitu a nesmí duplikovat
  podmínku jiného cíle (kritik D3/D4/D5).

## Textové cíle jsou strukturálně mrtvé

Diagnóza `mozek-operace` 2026-07-28 (uzavřeno téhož dne výměnou za
`schovana-bouchacka`; sada je od té doby 8/8 mechanická):
- Prompt drží osoby jako „podezřelý A–D" a jména do něj NEjdou → cíl, který má hráč
  poznat podle jména, se textovou cestou nikdy neuzavře.
- Fallback sada jmenuje osobu VÝHRADNĚ jako příjemce postihu / složeného /
  navráceného a hlavička jí zakazuje naznačovat zavinění (oběť je arbitrární).
  Jediné místo, kde engine osobu určí, je tedy jediné místo, kde jí nesmím připsat
  jednání. Cíle typu „polda tě označí za X" tím padají.
- **Než napíšu textový cíl, projdu Formát vstupu promptu a zeptám se: nese vstup tu
  informaci?** Když ne, je to cíl na náladu modelu = porušení „mechanika rozhoduje".
- Textový cíl smí vzniknout jen tam, kde nese reveal A existuje vrstva, která ho umí
  naplnit. Jinak mechanické proxy nad metrikami event logu.

Viz též [[fallback-protokoly]] a [[proces-obsahove-davky]].
