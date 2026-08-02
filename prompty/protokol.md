# Prompt: policejní protokol
**Jediný zdroj pravdy pro znění promptu.** Každou změnu zapiš do changelogu dole
a otestuj na příkladech níže. Prompt se nikde jinde neupravuje ani neduplikuje.

Model v3 (situace se 4 sloty → věci se staty → pásmo → postihy). Vstupní formát
je **kontrakt na straně promptu** — drž ho v souladu s enginem (`prototyp-mvp.md`
§Resoluční systém v3) a s obsahem (`obsah/situace.yaml`, `veci.yaml`, `postihy.yaml`).

**Do modelu jde POUZE fenced blok „Systémový prompt" + strukturovaný vstup.**
Formát, příklady a changelog jsou dokumentace pro tým, ne součást volání.

## Systémový prompt (v0.4.2)

```
Jsi vyšetřovatel policie státu New York, rok 1930. Sepisuješ na psacím stroji
úřední protokol o skupině pašeráků alkoholu. Jsi zkorumpovaný, unavený a nic
tě nepřekvapí.

Dostaneš strukturovaný popis situace a JEJÍ HOTOVÝ VÝSLEDEK (které role prošly,
jaké padly následky). Tvůj úkol je výsledek zaznamenat do protokolu. Pravidla:

1. Nejvýše 900 znaků. Suchá úřední čeština ve třetí osobě, dobová
   stylizace (1930, žádné anachronismy). Piš souvislou prózu bez nadpisů,
   hlaviček, rubrik a odrážek; nikdy nevypisuj rubriky vstupu ani strojový
   výčet následků na konci — následky patří do prózy (bod 7), ne do bloku.
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
   U každého ze čtyř slotů musí být z textu jednoznačně poznat, zda prošel,
   nebo selhal. Toto je nejtvrdší pravidlo protokolu.
4. Co dopíšeš, NESMÍ naznačit změnu žádného ČÍSLA ze vstupu — beden, kreditů,
   Žáru, pozice šerifa, postihů ani složení. Nikdo neodejde se zraněním, nikdo není
   zadržen, zatčen, spoután, odveden ani zavřen a nikdo jinak neskončí v rukou
   úřadů ani mimo posádku; nikdo z posádky také není ztotožněn (jméno, doklad,
   poznávací značka vozu). Jediná újma, kterou protokol zná, jsou vypsané POSTIHY
   a SLOŽENÍ, a to jen v rozsahu, v jakém je NÁSLEDKY uvádějí. Strkanice, tahanice
   či zápas ve scéně BÝT SMÍ — jen z nich nikomu nesmí zůstat následek, který ve
   vstupu není. Žádná bedna se neztrácí, nerozbíjí,
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
   výsledek. Věc ze slotu vždy pojmenuj jejím názvem ze vstupu.
   Sedí-li věc k roli samozřejmě, vystač si s pár slovy a místo nech tomu, co se
   nehodí — tam je pointa. Nevhodně zvolená věc je ZLATO protokolu, ne chyba
   k zamlčení: banán vyleštěný jako pistole v útočné roli, brokovnice tasená
   strážníkovi na očích, kněžský kolárek na pašeráka. Rozehraj ten kontrast
   úředně a vážně. ALE výsledek daného slotu se tím NEMĚNÍ — selhal-li, selhal.
   Nikdy nepiš, PROČ se pokus zdařil nebo nezdařil (prahy jsou skryté).
6. Nevtipkuješ. Humor smí plynout výhradně z kontrastu úředního jazyka
   a absurdity situace. Žádné emoji, hovorovost ani explicitní žertování.
   Neopakuj v jednom protokolu tutéž větnou figuru ani tutéž vazbu.
7. Zmiň relevantní NÁSLEDKY, které padly: vzniklé postihy (jejich fikci, ne
   strojový efekt), složení osoby („leží v autě"), pohyb šerifa/Žáru i s jeho
   důvodem, ztrátu beden, loot. Padla-li ZÁCHRANA, zmiň ji jednou vsuvkou. Je-li
   MAX DOSAŽITELNÉ vyšší než počet zásahů, smíš to jednou zaznamenat — ale
   NEURČUJ, čí to byla chyba a proč. Co nepadlo, nezmiňuj.
8. Nejvýše jednou smíš přidat krátkou osobní poznámku vyšetřovatele v závorce.
   Blíží-li se text stropu, škrtej ROZVÍJENÍ KULISY — nikdy tuto poznámku, nikdy
   položku NÁSLEDKŮ a nikdy jednoznačnost výsledku slotu (bod 3). Zamlčený nebo
   nejasný výsledek není úspora znaků, je to porušení bodu 3.
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
  ≤1/4 PRŮŠVIH. Kredity (**+3 / +2 / 0 / 0**) a Žár plynou z pásma; situace autoruje
  jen pool postihů. **Zdroj pravdy pro tato čísla je `prototyp/src/engine/rules.js`**
  (`kredity.zaHladceLoot`, `kredity.zaHladce`), ne prózový text v `prototyp-mvp.md` —
  ten se po kalibraci-1 rozešel a byl srovnán až ve v0.4.1.
- **Ztráta nákladu NEplyne jen z PRŮŠVIHU.** Bere ji i **ztrátový postih** (`vysypana-bedna`
  je lehký postih v poolech `s_nasledky`, viz `obsah/postihy.yaml` a `situace.yaml`),
  takže bedna smí ubýt v kterémkoli pásmu. Pro protokol z toho ale neplyne žádná
  volnost: náklad se hýbe VÝHRADNĚ tak, jak to říká řádek `bedny:` — v pásmu
  PRŮŠVIH i mimo něj. Bez uvedení v NÁSLEDCÍCH se nehne ani o bednu.
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

Vstup: farmář-brod (npc), 2/4 S NÁSLEDKY, MAX DOSAŽITELNÉ 2/4. ZÁCHRANA: líznut
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
> pomaleji. (Brod je v tomto úseku hlášen opakovaně; o nápravu dosud nikdo nepožádal.)

Proč je dobrý: **mandát rule 5 běží na všech čtyřech slotech, ale rozpočet je
nerovný** — sedící věci dostaly pár slov („odpočítal přesně tolik, kolik farmář
řekl", „bez hnutí ve tváři"), nesedící dostaly celý záměr („jako zálohu za zápřah
a sám se chytil oje"; „aby na něj bylo vidět jen z profilu"). ~645 znaků, 5 vět
(strop 900).
Invence nikde nehne čísly: banán nevystřelil, žádná bedna se nepohnula, Žár zůstal
zticha, nikdo neutrpěl újmu nad rámec zapsaného postihu a nikoho farmář nezadržel.
(To, že farmář zálohu odmítl, je volba scény, ne pravidlo — přijmout ji
také smí, viz hranice u špatného výstupu níže.) Výsledek obou
selhaných slotů zůstal selhání; postih zapsán jako fikce; ZÁCHRANA nesena vsuvkou,
ne vlastní větou; **gap NENÍ zmíněn, protože žádný není** — MAX DOSAŽITELNÉ 2/4 se
rovná dosaženému, a s těmito čtyřmi věcmi nešel nástrojový ani útočný slot obsadit
vůbec (nejvyšší nástroj v ruce je 1, nejvyšší útok 2). Vymyslet tu promarněnou
šanci by bylo porušení rule 7 („co nepadlo, nezmiňuj") i rule 3. Závorka proto
nese **čistě osobní poznámku vyšetřovatele**, ne mechanický soud — přesně to, na co
je rule 8. Pointa, kterou tenhle příklad nese jako jediné místo v dokumentaci:
**MAX spadlo na 2/4 právě tou ZÁCHRANOU** — odhozený „Provaz a kladka" má nástroj 4,
takže před gamblem bylo 3/4 dosažitelné. Gamble tu nejenže nepomohl, on strop uzlu
snížil. Do protokolu z toho ale nesmí jít nic než ta vsuvka: MAX DOSAŽITELNÉ se
počítá až po gamblu a protokol nesrovnává „co bylo předtím".
Dál: nezmíněno, co nepadlo (Žár, bedny, kredity); placeholdery A–D;
jedna závorka; žádný explicitní vtip.

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

- **v0.4.2** (2026-08-02) — **pět cílených zásahů po A/B přeměření brány češtiny**
  (`technika/brana-cestiny-ab-2026-08-02.md`, rameno A: t=0,5, 13 casů, 0/13,
  6 KRITICKÝCH). Teplota 0,5 je zapečená a mimo rozsah tohoto kola — A/B doložilo,
  že sjednotila **jazyk** (tvrdá jazyková vada 13/13 → 2/13), ale nehnula ani
  jedním nálezem, který bránu blokuje. Zbylé vady mají tvar pravidla, ne tvar
  vzorkování; proto se opravují tady. Všech pět zásahů je na straně **vstupu**,
  který se cachuje — cenu volání to nemění a konzultaci s operations-economics
  to nevyžadovalo. Strop 900 znaků zůstává nedotčen.
  (1) **Rule 1: zákaz formátového šumu.** Přibylo „Piš souvislou prózu bez
  nadpisů, hlaviček, rubrik a odrážek; nikdy nevypisuj rubriky vstupu ani souhrn
  následků na konci." Markdown hlavička padla **13/13**, strojový souhrnný blok
  5/13 — a v casu A10 ten blok **přímo vyrobil chybné číslo**: pod korektní prózou
  („Jedna bedna nákladu zůstala na mostě") stálo „Bedny: 4", ačkoli náklad je 5.
  Kořenová příčina je artefakt modelu, ne baterie ani harness; jedna věta proto
  zavírá celou třídu naráz, včetně jednoho KRITICKÉHO nálezu.
  (2) **Rule 5: zákaz vymyšlené PŘÍČINY vytažen na samostatnou závěrečnou větu**
  — „Nikdy nepiš, PROČ se pokus zdařil nebo nezdařil (prahy jsou skryté)."
  Zákaz v promptu byl **už od v0.4**, ale zapuštěný doprostřed nejdelšího odstavce
  jako vedlejší věta („nikdy … PŘÍČINU (prahy jsou skryté, ‚nestačilo to,
  protože…' nepiš)") — a padal v **8/13** casů napříč všemi třemi běhy. Doložený
  vzorec: pravidlo pohřbené uvnitř dlouhého odstavce na Haiku nedrží, i když je
  formulované správně. Zapuštěná klauzule je proto **nahrazena**, ne zdvojena
  (kratší prompt = lépe cachovatelný); důvod „prahy jsou skryté" zůstal jako
  závorka u nové věty. Táž páka je připravená pro rule 4 (zadržení), pokud tenhle
  zásah zabere.
  (3) **Rule 5: „Věc ze slotu vždy pojmenuj jejím názvem ze vstupu."** Věc ze
  slotu zmizela nebo se zaměnila v **5–6/13** casů (A9: 4/4 věcí pryč, A4: „Slzy
  na povel" zmizely). Bez názvu věci hráč nemá jak spárovat protokol s tím, co
  do slotu vložil — je to zároveň požadavek čitelnosti (metrika 6 lidské brány).
  (4) **Rule 1: vypuštěno „3–5 vět", zůstal jen znakový strop 900.** Počet vět je
  **mrtvé pravidlo**: napříč třemi běhy (400 i 800 tokenů, teplota 1,0 i 0,5)
  ho nedodržela **0 ze 39 generací**. Ponechání dělalo baterii nefalzifikovatelnou
  — 13/13 casů „selhávalo" na položce, která nikdy neprojde, a šum přebíjel
  signál (§1 zákona falzifikovatelnosti, viz baterie). Délku drží znakový strop,
  který jediný se ve všech bězích prokázal jako funkční brzda. **Riziko: bez věty
  o počtu vět může délka narůst** — je to vědomě přijaté, 900 zůstává jedinou
  brzdou a příští běh ho měří.
  (5) **Rule 3: pozitivní požadavek na čitelnost výsledku** — „U každého ze čtyř
  slotů musí být z textu jednoznačně poznat, zda prošel, nebo selhal." Cílí na
  zamlčení a změkčení výsledku slotu: A1 „k takovému kroku však nedošlo"
  (selhaný slot vyprávěn jako netestovaný), A12 „avšak k incidentu nedošlo",
  A7 „tato improvizace **částečně uspěla**" (změkčený zásah). **Lexikální zákaz
  obratů („částečně", „k tomu nedošlo") byl zvážen a ZAMÍTNUT** — přeširoký zákaz
  je past doložená ve v0.4 třikrát (hluk, předání věci, vymyšlené věci; pokaždé
  se musel zpětně zužovat). Pozitivní požadavek kryje **obě** strany změkčení
  naráz a je zároveň požadavkem metriky 6 (čitelnost) lidské brány. Umístěn do
  rule 3, ne do rule 5: jde o výsledek, ne o obhajobu pokusu.
  **VĚDOMĚ ODLOŽENO:** zobecnění rule 2 ze „podezřelých" na všechny osoby
  I MÍSTA (nález „statek Novotného v Lipovicích" v A3, vymyšlená jména 3/13).
  Reálný a doložený nález, ale drží se mimo tohle kolo, aby šlo změřit účinek
  pěti zásahů zvlášť — kandidát na v0.4.3.
  **STOP PODMÍNKA PRO 3. BĚH BRÁNY (přesná definice, ať se příště neodvozuje
  znovu z paměti):** příští běh měří **13 casů × 3 generace = 39 generací**.
  Pro každou GENERACI (ne case) vyhodnoť binárně dvě samostatné metriky:
  „formátový šum" = generace obsahuje markdown nadpis, rubriku, odrážku nebo
  strojově vyhlížející blok následků; „vymyšlená příčina" = generace obsahuje
  větu vysvětlující, PROČ se pokus zdařil/nezdařil (nejen že se zdařil/nezdařil).
  **Práh: ≤2 z 39 generací u KAŽDÉ z obou metrik samostatně** (ne dohromady,
  ne na úrovni casů). Padne-li aspoň jedna metrika nad práh, není to otázka
  znění promptu, ale **strop schopnosti modelu** (Haiku 4.5) — správným dalším
  krokem se stává eskalace (jiný model jen na volání protokolu, nebo
  dvouprůchodové generování); to je rozhodnutí operations-economics, ne testéra.
  **Chybějící větev (vědomě nedořešeno v tomhle kole):** projdou-li obě metriky
  práh, ale brána je i tak 0/13 (KRITICKÉ nálezy jinde — rule 3/4 obrácení,
  zadržení, zamlčený následek), stop podmínka mlčí o dalším kroku; rozhodne
  příští hodnotitel podle povahy zbylých nálezů, ne podle týhle podmínky.
  **Design-critic prověrka (2026-08-02) k v0.4.2 před commitem** našla čtyři
  další VÁŽNÉ nálezy nad rámec tohoto zápisu, ponechané jako otevřené otázky
  na designéra/testéra (viz `.claude/agent-memory/design-critic/v042-prompt-audit.md`
  pro plné znění): (a) nová rule-5 věta „Věc ze slotu vždy pojmenuj jejím
  názvem ze vstupu" sedí uprostřed nejdelšího odstavce — přesně tam, odkud
  zásah (2) ze stejného kola utíká se stejným zdůvodněním; (b) rule 3 (bod 5,
  jednoznačnost výsledku) a rule 5 (bod 2, zákaz příčiny) mohou táhnout proti
  sobě — model tlačený k jednoznačnosti bez povoleného „bezpříčinného" jazyka
  selhání může sáhnout po vysvětlení, což by zvedlo právě tu metriku, kterou
  bod (2) má snižovat; měřit obě metriky odděleně po běhu, ne slučovat; (c)
  vzorový „dobrý výstup" v tomto souboru neplní doslovně nové pravidlo (b) —
  „banán" místo „Banánového kanónu", věc „Otrlený výraz" beze jména vůbec —
  hodnotitel potřebuje před během rozhodnout, jestli je to průchod, nebo
  selhání ukázky; (d) přesun zákazu příčiny (2) zahodil i konkrétní protipříklad
  („nestačilo to, protože…"), ne jen pozici — pokud (2) nezabere, nejde snadno
  odlišit „špatná pozice" od „chybějící exemplář".
  Příští běh měřit na **3 generacích na case**, ne na jedné: rozdíl v počtu
  KRITICKÝCH casů se při n=1 nedá odlišit od losu.
- **v0.4.1** (2026-08-02) — **opravné kolo po review fáze 3; pět bodů, žádná nová
  designová volba.** (1) **Kredity srovnány se zapečeným enginem: +3 / +2 / 0 / 0**
  (bylo +2 / +1 / 0). Zdroj pravdy je `prototyp/src/engine/rules.js`
  (`kredity.zaHladceLoot: 3`, `kredity.zaHladce: 2`, viz komentář „kalibrace-1:
  zvednuto, když bump ztenčil ekonomiku"); prompt i `prototyp-mvp.md` ř. 187–188
  citovaly prózu z doby PŘED kalibrací-1. Opraveno na obou místech; do doku
  přibyl explicitní ukazatel na `rules.js`, aby se rozchod neopakoval. Fenced blok
  se tím NEMĚNÍ — čísla kreditů v něm nikdy nebyla, rule 3 je bere ze vstupu.
  (2) **Příklad dobrého výstupu měl nesprávné `MAX DOSAŽITELNÉ 3/4`; přepočteno na
  2/4.** Oracle počítá maximum brute-force přes 4! permutací POSTgamblové ruky
  (`prototyp/src/engine/resolve.js`), a v té ruce (Balík bankovek n0 · Otrlený výraz
  n0 · Zlaté hodinky n1 u0 · Banánový kanón n1 u2) nedosáhne na nástrojový práh 3
  ani na útočný práh 3 žádná věc — dva sloty jsou nedosažitelné, maximum je 2/4.
  Uvedené 3/4 tvrdilo gap, který neexistoval, tedy přesně ten druh vymyšlené
  příčiny, který rule 5 a rule 7 zakazují — vzorový příklad učil chybu, kterou
  baterie jinde trestá. Závěrečná závorka proto místo soudu „tři úlohy byly na
  dosah" nese čistě osobní poznámku (rule 8) a rozbor demonstruje **mlčení
  o neexistujícím gapu** jako pozitivní jev. (3) **„Ztráta nákladu (jen PRŮŠVIH)"
  vyvráceno** — nález D40: bedny bere i ztrátový postih (`vysypana-bedna`, lehký,
  v poolech `s_nasledky`), takže náklad smí ubýt v kterémkoli pásmu. Znění opraveno
  tak, aby přitom NEROZVOLNILO pojistku: bedna se hýbe výhradně podle řádku `bedny:`.
  (4) **Rule 4 rozšířena o újmu na těle a o zadržení.** Dosud kryla čísla, náklad,
  oheň, výstřel a hluk — ale „podezřelý dostal ránu do žeber" ani „strážník ho
  odvedl v poutech" žádné číslo nemění, takže jimi pojistka propouštěla dvě
  nejtěžší vymyšlené újmy. Nově: postihy a složení jsou **jediný zdroj újmy**,
  který protokol zná. Znění bylo hned při psaní zúženo — první verze („nikdo
  neutrpí újmu na těle") zakazovala i strkanici a tahanici, tedy fyzickou akci,
  ze které rule 5 žije, a vlastní vzorový příklad („podezřelý D si při tahanici
  narazil rameno") by pod ní neprošel; čtvrté zúžení téže pojistky ve stejném
  duchu jako tři z v0.4. Zakázán je tedy **následek**, ne střet. (5) **Strop délky 800 → 900 znaků** (rule 1), schváleno PM.
  Ekonomika je v pásmu 800–1 200 lhostejná (konzultace operations-economics
  2026-08-01, viz v0.4), takže rozhoduje kvalita: **závorka vyšetřovatele je
  podpisová figura protokolu a při plném mandátu rule 5 se v sólovém uzlu
  s bohatými následky do 800 znaků nevešla** — obětovala se jako první, protože je
  jediná nepovinná položka. 900 je jediná změna v0.4.1, která zdražuje VÝSTUP
  (~+12 % stropu, tj. ~+6 % ceny volání při ~47% podílu výstupu) — doplňky rule 4
  a rule 8 zdražují jen vstup, a ten se cachuje. Do baterie přidán
  case `solo-bohate-nasledky-strop-delky`, který strop hlídá na nejhorším terénu
  (sólo + čtyři obhajoby + záchrana + gap + těžký postih + bedna + Žár + závorka).
  **Po review design-criticem (2026-08-02) tři doplňky uvnitř téhož mandátu.**
  (a) **Rule 8 nově určuje POŘADÍ ŠKRTÁNÍ** („blíží-li se text stropu, škrtej
  rozvíjení kulisy — nikdy poznámku a nikdy položku NÁSLEDKŮ"). Kritik doložil, že
  bez ní nový case vyžadoval chování, které prompt nikde nežádá — rule 8 zněla
  čistě povolovacím tónem, takže test měřil prioritu, kterou spec neuvádí. Zároveň
  je to **~5× levnější páka na tutéž diagnózu než zvednutí stropu** (vstup se cachuje,
  výstup ne); 900 zůstává, protože ho schválil PM, ale **je otevřenou otázkou, zda
  by po (a) samotná klauzule nestačila** — měřitelné na novém casu. (b) **Rule 4
  rozšířena pojmově, ne výčtem**: k pěti zakázaným slovesům přibylo „ani jinak
  neskončí v rukou úřadů ani mimo posádku" a zákaz ZTOTOŽNĚNÍ (jméno, doklad,
  poznávací značka). Výčet sám byl past na Haiku — „odvedli ho k sepsání" projde
  seznamem pěti sloves; a ztotožnění je třetí třída z v0.4 review, kterou první
  znění v0.4.1 nekrylo, ačkoli má trvalý dopad (protokol JE policejní záznam).
  Odpovídající položka baterie přepsána z lexikální na pojmovou, aby vyhýbavá
  formulace neprošla promptem i testem naráz. (c) Rozbor dobrého příkladu doplněn
  o pointu, že **MAX spadlo na 2/4 právě tou ZÁCHRANOU** (odhozený „Provaz a kladka"
  má nástroj 4 → před gamblem bylo 3/4 dosažitelné); jediné místo v dokumentaci,
  kde se ZÁCHRANA a MAX potkávají.
  **OTEVŘENÉ, NEROZHODNUTO (patří designérovi, ne testérovi):** vztahuje se zákaz
  újmy z rule 4 i na PROTISTRANU (NPC), nebo jen na podezřelé? Odůvodnění
  („postihy a složení jsou jediný zdroj újmy") platí jen pro posádku — postih na
  NPC nikdy nepadne. Dnešní „nikdo" je univerzální, což u PROŠLÉHO útočného slotu
  v konfrontaci nechává rule 5 skoro bez materiálu (bez výstřelu, hluku, zraněného
  i zadrženého). Do rozhodnutí platí univerzální čtení, protože je přísnější.
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
