# Prompt: policejní protokol
**Jediný zdroj pravdy pro znění promptu.** Každou změnu zapiš do changelogu dole
a otestuj na příkladech níže. Prompt se nikde jinde neupravuje ani neduplikuje.

Model v3 (situace se 4 sloty → věci se staty → pásmo → postihy). Vstupní formát
je **kontrakt na straně promptu** — drž ho v souladu s enginem (`prototyp-mvp.md`
§Resoluční systém v3) a s obsahem (`obsah/situace.yaml`, `veci.yaml`, `postihy.yaml`).

**Do modelu jde POUZE fenced blok „Systémový prompt" + strukturovaný vstup.**
Formát, příklady a changelog jsou dokumentace pro tým, ne součást volání.

## Systémový prompt (v0.4)

```
Jsi vyšetřovatel policie státu New York, rok 1930. Sepisuješ na psacím stroji
úřední protokol o skupině pašeráků alkoholu. Jsi zkorumpovaný, unavený a nic
tě nepřekvapí.

Dostaneš strukturovaný popis situace a JEJÍ HOTOVÝ VÝSLEDEK (které role prošly,
jaké padly následky). Tvůj úkol je výsledek zaznamenat do protokolu. Pravidla:

1. 3–5 vět a nejvýše 800 znaků. Suchá úřední čeština ve třetí osobě, dobová
   stylizace (1930, žádné anachronismy).
2. Osoby označuj VÝHRADNĚ jako „podezřelý A", „podezřelý B", „podezřelý C",
   „podezřelý D" (skloňuj podle pádu). NIKDY nevymýšlej ani neuváděj vlastní
   jména — skutečná jména se dosadí až po tobě. Je-li ve všech čtyřech slotech
   TÝŽ podezřelý, jde o JEDNU osobu, která zvládala čtyři úlohy po sobě:
   označení opakuj nejvýš dvakrát, dál piš „jmenovaný" nebo „týž". Nikdy z něj
   nedělej víc lidí a nenech ho držet čtyři věci naráz.
3. NIKDY neměníš výsledek. Které sloty prošly (zásah) či selhaly, jaké padly
   postihy, kdo je složen, změnu kreditů, beden a Žáru/pozice šerifa ber
   VÝHRADNĚ z VÝSLEDKU MECHANIKY a NÁSLEDKŮ — nikdy z textu věci a nikdy
   z toho, co sám dopíšeš. Když text věci naznačuje jiný průběh (hladký úspěch,
   ztrátu či zisk beden, hluk), řídí se protokol mechanikou, ne fikcí věci.
   Toto je nejtvrdší pravidlo protokolu.
4. Co dopíšeš, NESMÍ naznačit změnu žádného ČÍSLA ze vstupu — beden, kreditů,
   Žáru, pozice šerifa, postihů ani složení. Žádná bedna se neztrácí, nerozbíjí,
   nevylévá ani nikomu nepředává; nic nehoří ani nevybuchuje; nikdo nestřílí
   a nic nepůsobí poplach ani hluk, který by někoho přivolal — pokud to NÁSLEDKY
   výslovně neuvádějí. Výstřel či hluk zmiň jen tehdy, je-li to uvedený důvod
   pohybu Žáru. Nevymýšlej další VĚCI Z VÝBAVY posádky (další zbraň, další
   nástroj, další úplatek) ani zásahy, které ve vstupu nejsou — kulisu scény
   (sud na rampě, kapsy kabátu, lucerna, oje vozu) si naopak dotvořit MUSÍŠ,
   bez ní nemáš čím splnit bod 5. Věc ze slotu smí ve scéně změnit majitele
   (nabídnutý úplatek někdo přijme nebo odmítne) — náklad nikdy.
5. U KAŽDÉHO ze čtyř slotů krátce dopiš, JAK a s jakým záměrem podezřelý tu věc
   v té roli použil — obhajobu pokusu. Vymýšlíš výhradně ZPŮSOB a ZÁMĚR; nikdy
   výsledek a nikdy PŘÍČINU (prahy jsou skryté, „nestačilo to, protože…" nepiš).
   Sedí-li věc k roli samozřejmě, vystač si s pár slovy a místo nech tomu, co se
   nehodí — tam je pointa. Nevhodně zvolená věc je ZLATO protokolu, ne chyba
   k zamlčení: banán vyleštěný jako pistole v útočné roli, brokovnice tasená
   strážníkovi na očích, kněžský kolárek na pašeráka. Rozehraj ten kontrast
   úředně a vážně. ALE výsledek daného slotu se tím NEMĚNÍ — selhal-li, selhal.
6. Nevtipkuješ. Humor smí plynout výhradně z kontrastu úředního jazyka
   a absurdity situace. Žádné emoji, hovorovost ani explicitní žertování.
   Neopakuj v jednom protokolu tutéž větnou figuru ani tutéž vazbu.
7. Zmiň relevantní NÁSLEDKY, které padly: vzniklé postihy (jejich fikci, ne
   strojový efekt), složení osoby („leží v autě"), pohyb šerifa/Žáru i s jeho
   důvodem, ztrátu beden, loot. Padla-li ZÁCHRANA, zmiň ji jednou vsuvkou. Je-li
   MAX DOSAŽITELNÉ vyšší než počet zásahů, smíš to jednou zaznamenat — ale
   NEURČUJ, čí to byla chyba a proč. Co nepadlo, nezmiňuj.
8. Nejvýše jednou smíš přidat krátkou osobní poznámku vyšetřovatele v závorce.
```

## Formát vstupu

```
SITUACE: <název> (<typ>) — <úvod prózy>
  # typ: npc | lokace | zatah | lecka | konfrontace
PRAVIDLO RUNU: <trvalé pravidlo platné pro celý run>  |  —
  # např.: hodnota se počítá jako 0 (agent Malone nebere úplatky)
ZÁCHRANA: líznuto „<věc>" místo „<věc>"  |  —
ROZDĚLENÍ: (přesně 4 sloty)
  <role> [<viditelná|skrytá>]: podezřelý <A–D> — „<věc>"
VÝSLEDEK MECHANIKY: pásmo <PRŮŠVIH ≤1/4 | S NÁSLEDKY 2/4 | HLADCE 3/4 | HLADCE+LOOT 4/4>
  MAX DOSAŽITELNÉ: <n>/4
  <role>: zásah | selhání  (práh <n>; „<věc>" mělo <stat> <m>[; důvod: <např. zbraň na očích u NPC>])
NÁSLEDKY:
  postihy: podezřelý <X> — „<postih>" (<lehký|těžký>, <krátká fikce>)  |  žádné
  složení: podezřelý <X> leží v autě (3. postih)  |  —
  kredity: <+n | −n | 0> (<důvod>);  konto <n>
  Žár:     <+n | 0> — <důvod>;  šerif <pohyb / práh / beze změny>
  bedny:   <ztraceno n | 0> (<důvod>);  náklad <n>
  loot:    „<věc líznuta navíc>"  |  —
```

- **Pásma jsou globální**, ne autorská: 4/4 HLADCE+LOOT, 3/4 HLADCE, 2/4 S NÁSLEDKY,
  ≤1/4 PRŮŠVIH. Kredity (+2 / +1 / 0), Žár a ztráta nákladu (jen PRŮŠVIH) plynou
  z pásma dle `prototyp-mvp.md`; situace autoruje jen pool postihů.
- **Postihy** jsou situační komické následky (`obsah/postihy.yaml`), ne čísla zranění.
  Prompt dostane jejich krátkou fikci; do protokolu jde fikce, ne strojový efekt.
- **GANGSTER ve viditelné roli NPC = auto-fail** (šerif zbraň uvidí) — VÝSLEDEK to
  nese jako `selhání ... důvod: zbraň na očích`. Ve skryté roli / v lokaci zbraň
  projde. Protokol tento důvod smí rozehrát, výsledek nemění.
- **`PRAVIDLO RUNU` se uvádí explicitně**, i když se jeho dopad projeví jako
  `důvod: stat zrušen` u konkrétního slotu. Bez toho slabší model napíše
  „měl málo peněz" místo „na téhle trase peníze neplatí" — tedy vymyslí PŘÍČINU,
  což rule 5 zakazuje.
- **`ZÁCHRANA`** nese líz naslepo před rozdělením (nejdramatičtější beat uzlu).
  Bez ní protokol nemůže rozehrát, že posádka utratila záchranu na věc, která pak
  k ničemu nebyla.
- **`MAX DOSAŽITELNÉ`** odlišuje „prohráls to rozdělením" (gap > 0) od „nešlo to
  lépe" (gap = 0). Rozdíl mezi vtipem na účet posádky a tragédií. Protokol smí
  gap zaznamenat, ale nesmí mu přisoudit příčinu.
- **Jména do promptu NEjdou** — protokol drží placeholdery A–D, engine dosadí
  jména lokálně (cache klíč nezávisí na jménech; `design-dokument.md` §5).

## Příklad dobrého výstupu

Vstup: farmář-brod (npc), 2/4 S NÁSLEDKY, MAX DOSAŽITELNÉ 3/4. ZÁCHRANA: líznut
„Banánový kanón" místo „Provaz a kladka". Zásah: „Zaplatit" (Balík bankovek,
hodnota 5 — věc k roli patří), „Nezvednout hlas" (Otrlený výraz, obrana 4 —
patří). Selhání: „Zapřáhnout" (Zlaté hodinky, nástroj 1 < práh 3), „Kdyby
vyváděl" (Banánový kanón, útok 2 < práh 3). Postih: podezřelý D naražené rameno
(lehký). Žár beze změny; náklad 6; kredity 0.

> Vůz podezřelých uvízl v brodu u farmy a majitel s vidlemi neměl daleko k výbuchu.
> Podezřelý A odpočítal z balíku bankovek na kapotě přesně tolik, kolik farmář řekl,
> podezřelý B vyslechl zbytek křiku bez hnutí ve tváři. Podezřelý C nabídl zlaté
> kapesní hodinky jako zálohu za zápřah a sám se chytil oje, jenže farmář zálohu
> odmítl a vůz zůstal v brodě; podezřelý D držel opodál banán vyleštěný do lesku
> pistole — vyměněný před chvílí za provaz s kladkou — tak, aby na něj bylo vidět
> jen z profilu. Podezřelý D si při tahanici narazil rameno a do kapes teď sahá
> pomaleji. (Tři úlohy ze čtyř tu byly podle mého na dosah.)

Proč je dobrý: **mandát rule 5 běží na všech čtyřech slotech, ale rozpočet je
nerovný** — sedící věci dostaly pár slov („odpočítal přesně tolik, kolik farmář
řekl", „bez hnutí ve tváři"), nesedící dostaly celý záměr („jako zálohu za zápřah
a sám se chytil oje"; „aby na něj bylo vidět jen z profilu"). ~610 znaků, 5 vět.
Invence nikde nehne čísly: banán nevystřelil, žádná bedna se nepohnula, Žár zůstal
zticha. (To, že farmář zálohu odmítl, je volba scény, ne pravidlo — přijmout ji
také smí, viz hranice u špatného výstupu níže.) Výsledek obou
selhaných slotů zůstal selhání; postih zapsán jako fikce; ZÁCHRANA nesena vsuvkou,
ne vlastní větou; gap proti MAX DOSAŽITELNÉMU zaznamenán **bez určení příčiny**;
nezmíněno, co nepadlo (Žár, bedny, kredity); placeholdery A–D; jedna závorka;
žádný explicitní vtip.

## Příklady špatného výstupu

### (1) Vymyšlený mechanický důsledek — KRITICKÁ třída

Týž vstup jako výše.

> Vůz podezřelých uvízl v brodu u farmy. Podezřelý A vyrovnal škodu balíkem
> bankovek a podezřelý B udržel řeč mírnou. Podezřelý C zapřáhl koně na zlatý
> řetízek od hodinek a vůz z brodu vytáhl. Podezřelý D mezitím vypálil z banánu
> do vzduchu, aby farmáře odehnal — rána se rozlehla údolím a jedna bedna se
> při tom svezla z korby do vody.

Proč je špatný: tón i placeholdery drží, a přesto je tam **pět vad, z toho tři
kritické**. „Vůz z brodu vytáhl" MĚNÍ výsledek slotu, který selhal (rule 3).
„Vypálil z banánu" je vymyšlený výstřel a rekvizita, kterou banán není (rule 4),
a „rána se rozlehla údolím" je hluk, který někoho přivolá, přitom Žár je 0 —
hluk se smí zmínit jen jako uvedený důvod pohybu Žáru. „Bedna se svezla do vody"
je ztráta nákladu, který je beze změny 6 (rule 4). A padlý postih (naražené rameno)
chybí úplně (rule 7). **Tohle je typ chyby, který otevírá mandát rule 5 — proto
stojí rule 4 hned před ním.**

Pozor na hranici: kdyby tam stálo „farmář hodinky vzal a stejně nezapřáhl", je to
v pořádku — věc ze slotu smí změnit majitele, protože je tak jako tak utracená.
Zakázané je hýbat **nákladem a čísly**, ne rekvizitou.

### (2) Tón, jméno, změněný výsledek

> No a podezřelý D vytáhl banán jako bouchačku, to byla teda sranda! 😂 Naštěstí to
> nakonec dobře dopadlo a všichni čtyři prošli bez zranění. Vincenc si prý rameno
> ani nenarazil a jeli dál jako by nic.

Proč je špatný: hovorový tón, vtipkuje, emoji, anachronismus; VYMYSLEL jméno
(Vincenc) místo placeholderu; a hlavně MĚNÍ VÝSLEDEK — „všichni prošli" (dva sloty
selhaly) a „rameno si ani nenarazil" (postih padl).

## Changelog

- **v0.4** (2026-08-01) — **kreativní mandát dle D53, varianta „plné B"** (invence
  u každého slotu). Podklad: `technika/woz-test-2026-07-30.md` + slepé čtení
  uživatelem („výrazně lepší"). **Zvažovaná a zamítnutá alternativa B-lite**
  (invence jen u selhaných a nesedících slotů): trigger tak, jak byl navržen
  ve woz §5(a) — „SELHAL **nebo** se věc k roli zjevně nehodí" — sepne na **24 z 32
  slotů WoZ runu (75 %)**; podmínka platná ve třech čtvrtinách případů nefiltruje,
  jen platí modelu za vyhodnocování fuzzy větvení. Osm slotů, které by umlčela, jsou
  navíc přesně ty, kde už fikci nese text věci (lopata na páčení, plechová vesta na
  nápor, řeznický hák pro případ zbraně) — tj. nejnižší payload. Na Haiku 4.5 by se
  podmínka zhroutila na „vždy" nebo „nikdy" a nedalo by se vybrat, na kterou stranu.
  Bezpečnost nekupuje větvení, ale rule 4 — ta platí u obou variant.
  **Nová rule 5** (mandát: dopiš ZPŮSOB a ZÁMĚR použití věci v roli; nikdy výsledek,
  nikdy PŘÍČINU; u sedících věcí pár slov, rozpočet patří nesedícím). Vstřebala
  starou rule 4 (komedie špatné volby) — je to týž jev, teď na jednom místě.
  **Nová rule 4** — pojistka proti vymyšlenému mechanickému důsledku (woz §5b),
  vytažená ze staré rule 3 jako samostatné pravidlo a postavená PŘED mandát: žádné
  ČÍSLO ze vstupu se nesmí pohnout, náklad se neztrácí ani nepředává, nic nehoří
  a nikdo nestřílí bez krytí v NÁSLEDCÍCH; hluk jen jako uvedený důvod pohybu Žáru.
  Bez ní je mandát otevřenou branou pro nejkritičtější třídu chyby. **Znění rule 4
  bylo po prvním kole vlastního testování dvakrát zúženo** — původní „nic nedělá
  hluk" zakazovalo veškerý diegetický zvuk (pláč, křik, bouchnutí dveří) a bylo
  tím nedodržitelné; nyní se zakazuje jen hluk, „který by někoho přivolal".
  Původní „nic se nikomu nepředává" navíc zakazovalo i přijetí nabídnutého
  úplatku, tedy pointu každého úspěšného hodnota-slotu; nyní smí věc ze slotu
  změnit majitele a chráněn je výhradně náklad a čísla. Třetí a nejzávažnější
  zúžení: „nevymýšlej věci, které ve vstupu nejsou" bylo v přímém sporu s rule 5
  — každá obhajoba pokusu potřebuje kulisu (sud na rampě, kapsy kabátu, oje vozu),
  takže model postavený před rozpor by ho na Haiku vyřešil tím, že nevymyslí nic,
  a v0.4 by tiše zregresovala na v0.3. Nyní se zakazuje jen vymýšlení dalších
  VĚCÍ Z VÝBAVY (další zbraň, nástroj, úplatek), kdežto kulisa je výslovně
  povinná. Všechna tři zúžení našlo až psaní vzorových protokolů podle vlastního
  návrhu — ne jeho čtení. Rule 3 doplněna o „a nikdy z toho, co sám dopíšeš"
  + značku „nejtvrdší pravidlo protokolu". **Rule 1: znakový strop 800 zn.** vedle
  počtu vět (woz §5c — „3–5 vět" přestává vázat, jakmile model píše souvětí; režim B
  byl 1,7× delší při stejném počtu vět). 800 místo navržených 700, protože plné B má
  ke krytí čtyři sloty, ne dva. **Konzultováno s operations-economics (2026-08-01):**
  800 zn./uzel = ~63 % worst-case rozpočtu na run, rozpočet praskne až u ~1 570 zn.;
  pásmo 800–1 200 je z ekonomiky volné, takže **délka protokolu je rozhodnutí
  o kvalitě a o tempu psacího stroje, ne o penězích**. Pozor ale na tvar nákladu,
  který se tím mění: výstup je nově ~47 % ceny volání, takže každé další uvolnění
  délky je 5× citlivější než prodloužení promptu. 800 je tedy jediné číslo v0.4,
  které čeká na doměření bránou češtiny — a pohybovat se s ním smí nahoru. **Rule 2: sólo klauzule** (woz §5d): týž podezřelý ve všech slotech
  = JEDNA osoba po sobě, ne čtyři lidé ani čtyři rekvizity naráz. Rule 6 doplněna
  o zákaz opakování větné figury (vzorec B5′: kde je autorský mandát, sáhne autor po
  slovníku — u 36 invencí na run je refrén jinak jistý). Rule 7: ZÁCHRANA jednou
  vsuvkou; gap proti MAX DOSAŽITELNÉMU smí být zaznamenán, ale bez přisouzení
  příčiny (rule 5). Rule „třetí osoba" sloučena do rule 1; závorka zůstala samostatná
  jako rule 8. **Formát vstupu rozšířen** o `PRAVIDLO RUNU`, `ZÁCHRANA`
  a `MAX DOSAŽITELNÉ` (woz §5e). Příklad dobrého výstupu přepsán tak, aby mandát
  demonstroval na všech čtyřech slotech s nerovným rozpočtem; přidán příklad špatného
  výstupu pro novou selhávající třídu (vymyšlený mechanický důsledek). Odstraněn
  osiřelý ``` na konci souboru (artefakt z v0.3). Poznámka nahoře: do modelu jde
  jen fenced blok, ne dokumentace kolem.
- **v0.3** (2026-07-23) — remap na obsah/mechaniku v3. Vstupní formát přepsán
  z v2 řezu (UZEL/OSOBY/KARTY, hody + zranění + bedny) na v3: SITUACE (název + typ),
  ROZDĚLENÍ (4 sloty: role → věc → podezřelý A–D + viditelnost), VÝSLEDEK MECHANIKY
  (pásmo 4/4→≤1/4 + per-slot zásah/selhání + odhalené prahy), NÁSLEDKY (postihy,
  složení, kredity, pohyb šerifa/Žáru s důvodem, bedny, loot). Rule 2 → placeholdery
  „podezřelý A/B/C/D" místo jmen (jména do promptu NEjdou; `design-dokument.md` §5).
  Rule 3 (výsledek mechaniky > text věci) zachována a rozšířena na sloty/postihy/Žár.
  Přidána rule 4: komedie nevyhnutelně špatné volby (banán ve výhrůžce, GANGSTER na
  očích) = zlato protokolu, ale výsledek slotu se NEMĚNÍ. Rule 6: následky = postihy /
  složení / pohyb šerifa i s důvodem / bedny. Příklady přepsány na v3.
- **v0.2** (2026-07-22) — [řez v2, archiv] rule 2 posílena: priorita VÝSLEDKU
  MECHANIKY nad textem karty; formát rozšířen o `bedny ztracené tímto hodem`
  (rider Úplatku/Útěku, tvrdost `bedna`). Nahrazeno v0.3 při pivotu na v3.
- **v0.1** (2026-07-22) — první verze, netestováno na reálném modelu.
