---
name: kalibrace-obsahu
description: Co designér+kritik vyžadovali při zápisu MVP sady karet/uzlů/cílů — trvalé principy pro příští generování
metadata:
  type: feedback
---

Kalibrace z první plné sady obsahu MVP (schváleno 2026-07-22, po auditu design-critic).

**Pravidla, která platí i příště:**

1. **Flavor karty nesmí slibovat mechaniku, kterou pravidla neznají** (princip
   „viditelná pravidla"). Např. „bedny vypadnou", „náklad zůstane na břehu" jsou
   OK jen proto, že je teď kryjí ridery tagů. Když píšu nový efekt do textu, musí
   mít oporu v resolučním systému, jinak „text lže".
   **Why:** kritik to označil jako blokující (B3). **How to apply:** u každé karty
   si ověř, že popsaný důsledek odpovídá rideru jejího tagu z prototyp-mvp.md.

2. **U Lesti míchej aktivní klam s pasivním převlekem.** Humor Lesti konverguje na
   jednu pointu „převlek/nikdo nekontroluje" (kolárek, konve, rakev, mašle) — max
   ~2 pasivní, zbytek aktivní klam (hraná role, přípitek, kázání).
   **Why:** kritik K1 + tón. **How to apply:** při 8 kartách tagu hlídej, ať se
   neopakuje jedna šablona vtipu víc než 2×.

3. **Tagová textura je MECHANICKÁ (ridery), ne jen vypravěčská.** Násilí = síla za
   Žár (nejvyšší síly, všechny hlučné); Úplatek = odhoď 1 bednu → povýš selhání na
   5–7; Útěk = selhání ztratí bednu místo zranění; Lest = nekrytá variance (žádný
   rider). Distribuce sil a hlučnost tomu musí sloužit.
   **How to apply:** Násilí drž silově nahoře (víc 3, víc hlučných); Lest naopak
   nesmí být současně nejvíc favorizovaná (+2) a nejmíň postihovaná (−2) na uzlech.

4. **Textové cíle jen tam, kde nesou reveal.** Zbytek = mechanické proxy nad
   metrikami event logu. Nový cíl nesmí odměňovat sebe-vyřazení ani čistou pasivitu
   a nesmí duplikovat podmínku jiného cíle.
   **Why:** kritik D3/D4/D5; simulační brána umí bodovat jen mechanické.

5. **Prokleté karty musí fungovat sólo a bez AI** — žádné „vynecháš uzel/nehodíš
   si". Řeš přes modifikátor hodu (±X, hlučná), ne přes změnu struktury tahu.

---

**POZOR — pivot v3 (2026-07-23, D14–D19):** body 1–5 výše vznikly pro v2 KOSTKOVÝ
model (tagy Násilí/Lest/Úplatek/Útěk, síla 1–3, ridery, afinity). **Tahle mechanika
je MRTVÁ.** Trvá z nich jen TÓN (suchý dobový humor, kontrast úřední řeči a absurdity)
a princip „flavor nesmí slibovat mechaniku, kterou pravidla neznají". v2 tag-textura
(bod 3) a Lest-specifika (bod 2) už neplatí.

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
