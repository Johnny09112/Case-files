---
name: kalibrace-obsahu
description: Co designér+kritik vyžadovali při zápisu MVP sady karet/uzlů/cílů — trvalé principy pro příští generování
metadata:
  type: feedback
---

**Trvalé principy (přežily pivot v2→v3; zbytek v2 kalibrace — tagová textura,
Lest-specifika, prokleté karty — je MRTVÝ spolu s kostkovým modelem, D14–D19):**

1. **Flavor nesmí slibovat mechaniku, kterou pravidla neznají** (princip „viditelná
   pravidla"). Když píšu nový efekt do textu, musí mít oporu v resolučním systému,
   jinak „text lže".
   **Why:** kritik to označil jako blokující (B3). **How to apply:** u každé položky
   si ověř, že popsaný důsledek odpovídá tomu, co engine skutečně dělá.

2. **Textové cíle jen tam, kde nesou reveal — a jen když EXISTUJE vrstva, která je
   umí naplnit.** Zbytek = mechanické proxy nad metrikami event logu. Nový cíl nesmí
   odměňovat sebe-vyřazení ani čistou pasivitu a nesmí duplikovat podmínku jiného cíle.
   **Why:** kritik D3/D4/D5; simulační brána umí bodovat jen mechanické.

3. **Obsah musí fungovat sólo a bez AI.** Sólo hráč committuje všechny 4 karty sám —
   každou podmínku cíle testuj na 1p i 4p, jinak si nevšimneš, že v sólu je
   nesplnitelná nebo naopak jednostranně vynutitelná (= skrytá sebe-sabotáž).

**v3 kalibrace (slotový model, věci s 5 staty vs. skryté prahy):**
- **Komedie plyne z VĚCI VE ŠPATNÉM SLOTU**, ne z pointy. Design věcí tak, aby měly
  1–2 silné staty a zbytek mizerný → někam se špatná volba MUSÍ dát. Vlajkové vtipy:
  banánový kanón (vysoká improvizace, vypadá jako útok — past), zlaté hodinky (eso
  úplatku, k ničemu jinde), brokovnice GANGSTER (eso ve skryté roli, sebevražda ve
  viditelné roli NPC). Tyhle „vtip je v umístění" táhnou humor protokolu.
- **Telegraf = próza věrně renderující DERIVOVATELNÝ signál** (trend statů, počet
  proti-srst slotů, zbraň projde/neprojde). Nikdy neprozrazuje prahy. Signál
  neautorovat — engine ho derivuje; próza jen zůstává věrná (QA invariant D19).
- **Efekty postihů STROJOVĚ (enum), ne próza** — text postihu je komediální fikce,
  ale efekt je `{ druh: hide_staty | lock_stitek | ... }`. Ztrátové (ruka_minus,
  ztrata_karty) přiděluj střídmě kvůli malým rukám 4p.
**v3 nálezy design-critica (audit obsahu 2026-07-23) — pro příští dávky pre-emptivně:**
- **Supply/demand balancuj proti SLOTŮM, ne jen počtu.** Neoversupplyuj jeden stat
  (hodnota 8/40 vs. demand 8/76 → trim na 6). Mono-use specialisté (jeden stat 5,
  zbytek ≤1) jsou v ruce 3 (4p) mrtvé karty → dej jim záložní stat 2 (fikčně:
  hodinky improv „oslnit leskem", bankovky obrana „svazek zastaví kudlu").
- **Hlídej NON-GANGSTER útok supply** pro VIDITELNÉ útok-sloty (zbraň tam auto-fail).
  Pár čistě-útok non-gangster věcí musí existovat, jinak jsou visible útok-sloty
  neřešitelné.
- **Telegraf: jmenuj VŠECHNY viditelné staty** (ne 2 ze 3) — nevyrovnaná info-věrnost
  confounduje sim fidelity knob. + počet skrytých + zbraň-verdikt. Nic víc/míň.
- **Postih-pooly drž vyrovnané (~5–6 výskytů/postih).** Nenech 2 generické (drobna,
  narazene) dominovat 9×, ani 1 těžký (zlomene-zebro) v 10 poolech. Tematizuj těžké:
  lock-GANGSTER postih → násilné/gun-relevantní uzly, ne na úředníka.
- **Kotva variety:** nedávej 78 % kotva3 — obtížnost se slévá, ±1 šum přebije volbu.
  Míchej 2–4 (cíl ~25 % kotva2, ~5 % kotva4).
- **Pronásledovatel musí KOUSAT:** rušení statu/štítku, který se v jeho uzlech ani
  finále nevyskytuje, je no-op (Malone null-hodnota v uzlech bez hodnota-slotu).
  Řeš run-wide rozsahem (D20a) nebo ruš fight-relevantní stat.
- **improvizace = univerzální flex** (nejvyšší demand i supply) NEŘEŠIT obsahem —
  je to sim watchlist (K4b/K5 „když nevíš, hraj improv").

**Fallback šablony protokolu (kolo 2026-07-27, návrh — kalibrace řemesla, ne fakta):**
- **Pásmo je TÝMOVÉ přes 4 sloty** → šablona pásma nesmí ukázat prstem na jednoho
  viníka. `{jmeno}` jen tam, kde engine osobu skutečně určil (postih, složení, návrat).
- **Do protokolu jde `nazev` postihu, ne jeho `text`** — texty postihů jsou psané
  ve 2. osobě („saháš pomaleji“) a protokol je 3. osoba, úřední.
- **Engine neskloňuje** → `{jmeno}` používat výhradně nesklonně („podezřelý {jmeno}“).
- **Pojistná varianta bez `podminka`** v každém početním pásmu: jinak neošetřená
  kombinace propadne do `NOUZOVY_ZAZNAM` a v protokolu je vidět díra.
- Registr v2 (úřední obal „v úseku vedeném jako“, „stav nákladu:“, jedna závorka
  vyšetřovatele na konci) **zachovávat i po pivotu** — fallbacky a živé LLM protokoly
  mají mluvit stejným jazykem. Ale texty psát znovu, nepřeklápět.
- **Pojistná varianta (bez `podminka`) musí být pravdivá v CELÉM pásmu, ne jen
  dosaditelná.** Hraje přesně ve stavech, které nikdo jiný nepokrývá — tam, kde je
  svět nejdivnější. Nejdražší chyba prověrky 2026-07-27.
- **Když je nepravdivé sloveso, neškrtej podmět.** Týmový postih („Drobná pokuta“)
  nelze psát jako „podezřelý X si odnesl“, ale jmenovat ho lze — engine osobu eviduje.
  Lék měř podle choroby; škrtnout jméno z celého pásma je předražené.
- **Registrová kotva se opakováním mění v tik.** Když se táž věta („stav nákladu:
  {naklad}“) objeví v každém odstavci, spis se čte jako opakovaně vyplněný formulář.
  Lék je změna POŘADÍ informace u 1–2 variant pásma, ne bohatší slovník.
- **Přepisy od testéra/kritika kontrolovat na věcnost, ne jen přebírat** — v prověrce
  2026-07-27 měl jeho přepis „jediná zdařilá úloha“ tam, kde pásmo znamená ≤1 (i nula).
- **Věcnou poctivost ověřuj ve TŘECH osách, ne jedné.** Sémantika události (co znamená)
  je jen první; dvě další chytily kritické nálezy, které dvě předchozí role minuly:
  **časování** (kdy se událost loguje vůči svému důsledku — složení se v 50 % vrací
  v témže uzlu, `band_resolved` se loguje před ztrátou bedny) a **počet hráčů**
  (ukázkové runy se skládají na 4p, ale sólo je pravděpodobnější sezení). Navíc:
  **text nesmí slibovat budoucnost** — run může skončit právě tímhle uzlem.
- **Redundanci měř vůči CELÉ obrazovce, ne uvnitř sady.** Když vedle textu běží
  vysvětlující vrstva a próza situace, je protokol třetí převyprávění téhož a hráč
  ho přestane číst. Lék jsou kvóty (výčet věcí a otvírák počtem nejvýš u poloviny
  variant) a posun od reportu ke **komentáři a verdiktu**.

**Cíl (a jakýkoli obsah) vázaný na TEXT protokolu je splnitelný jen tak, jak daleko
sahá kontrakt promptu a fallback sady** (diagnóza `mozek-operace`, 2026-07-28):
- Prompt osoby drží jako „podezřelý A–D" a jména do něj NEjdou → cíl, který má hráč
  poznat podle jména, se textovou cestou nikdy neuzavře.
- Fallback sada jmenuje osobu (`{jmeno}`) VÝHRADNĚ jako příjemce postihu / složeného /
  navráceného, a hlavička jí zakazuje naznačovat zavinění (oběť je arbitrární).
  Jediné místo, kde engine osobu určí, je tedy jediné místo, kde jí nesmím připsat
  jednání. Cíle typu „polda tě označí za X" jsou proto strukturálně mrtvé.
- **Než napíšu textový cíl, projdu Formát vstupu promptu a zeptám se: nese vstup tu
  informaci?** Když ne, je to cíl na náladu modelu = porušení „mechanika rozhoduje".
- Náhradu hledej v METRIKÁCH, které ještě žádný cíl nedrží, a preferuj tu, co otevírá
  NOVOU osu rozhodování (např. mapová odbočka do motelu — všech 7 stávajících cílů
  míří jen na přiřazení slotu).

**Když obsah dostane za úkol dotlačit metriku brány (K1–K9) — fikce má přednost
před číslem.** Zadání typu „chybí 0,03 driftu, přiřaď situacím fázi" se řeší
fikční logikou; položku, kterou by fikce a číslo táhly proti sobě, nechávám
**bez přiřazení**, nikdy ji neohnu. Kontrolní test návrhu: zůstaly v něm položky,
které jdou proti číslu? Když ne, je to setříděná tabulka s dolepenou historkou.
Do výstupu explicitně napsat, kde jsem si mohl pomoct a neudělal to.
**Why:** designér to formuloval jako tvrdé omezení („nechci tabulku seřazenou
dle PRŮŠVIH-rate s dolepenou historkou") a negativní doporučení označil za
plnohodnotný výstup. **How to apply:** u každé kalibrační dávky obsahu; odhad
dopadu na metriku dávej jako pásmo s tlumiči, ne jako bodové číslo, a napiš,
že je to návrh k měření (měří se kontrafaktuálně přes `CONTENT_DIR`).
