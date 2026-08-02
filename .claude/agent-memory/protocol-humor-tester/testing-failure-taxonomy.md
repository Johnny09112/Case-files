---
name: testing-failure-taxonomy
description: Znovupoužitelné vzorce, kde protokol, fallback šablony i telegrafy selhávají tónově, a jak je probíhat při testu humoru (kalibrace role, trvalá); vč. „vysvětlujícího ocásku", mřížky verdiktu zbraně, dobových reálií trasy, §H = prvního produkčního měření na Haiku 4.5 (0/13) a §I = A/B teploty jako třídiče nálezů jazyk × pravidla
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

## B5′ — ZÁKON NAPŘÍČ FORMÁTY: „po jedné dobré, poskládané formulář"
B5 se 2026-07-29 zopakoval na **telegrafech** (jiný formát, jiný autor, tentýž
tvar selhání). Ber to jako obecný zákon, ne jako vlastnost fallbacků: **jakmile
existuje autorský slovník / invariant se vzorovými formulacemi, autor sáhne po
formulaci ze slovníku místo po obrazu z konkrétní scény.** Slovník míněný jako
disambiguace se v praxi použije jako frázovník.
- **Vždy testuj SADU, ne položky.** Vytáhni si frekvenční seznam sdílených frází
  napříč celou sadou dřív, než začneš číst jednotlivé kusy.
- **Počítej, kolik z nich hráč uvidí v jednom runu** (u telegrafů 6–7 z 19), ne
  kolikrát se fráze vyskytne v repu. To je metrika, která bolí.

## B5″ — EXPOZIČNÍ MATEMATIKA: pool se musí škálovat s počtem TAHŮ, ne s počtem uzlů
Třetí výskyt B5, tentokrát na **fragmentové vrstvě fallbacku** (D54(1), 2026-07-30).
Sada 32 fragmentů vypadá bohatě, ale v jednom runu se z ní losuje **36×** (4 sloty
× 9 uzlů), zatímco pásmová vrstva losuje 9×. Stejný rozpočet při 4× expozici =
refrén zaručeně.
- **Vždy spočítej `losování za run ÷ velikost použitelného poolu`.** Ne velikost
  souboru — velikost poolu, který pro daný stav REÁLNĚ kandiduje.
- **Ředění stat-klíčovaných variant:** pool = `stat-klíčované ∪ obecné`. Když je
  1 stat varianta proti 3 obecným, obecné vyhrají 3:1 a stat varianty se
  nevylosují skoro nikdy. Změřeno: 14 z 32 fragmentů se v celém runu použilo,
  **18 nikdy**, a 3 nejčastější nesly 44 % vět (jeden 6×/run).
- **Anti-repeat okno na jeden uzel nestačí.** `pouzite` bylo per-node, takže tři
  po sobě jdoucí uzly skončily identickou závěrečnou větou — přesně „registrová
  kotva na konci odstavce" z B5, jen o formát vedle. Okno musí být ≥ 2 uzly.

### B5‴ — MANÝRA VYNUCENÁ KONTRAKTEM PLACEHOLDERU (nový poddruh)
Když kontrakt káže placeholder obalovat úřední vazbou (protože engine neskloňuje),
**tik není autorova volba, ale důsledek schématu**. U fragmentů vyšlo
„vedený / zapsaný jako" **6× na 4 věty** jednoho odstavce, ~45× za run.
- **Lék:** holá citace v uvozovkách („kus „{vec}“", „položka „{role}“") je stejně
  bezpečná jako obal — uvozovaný řetězec se neskloňuje tak jako tak. Škrt obalu
  u poloviny variant tik půlí a nic nerozbije.
- **Poučení:** u každého nového placeholderového kontraktu se ptej, kolikrát
  vyjde jeho povinná vazba v jednom odstavci, ne jestli je gramaticky bezpečná.

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

## E. Tón telegrafů (trvalá role — riziko R-7 invariantu 2026-07-29)
Telegraf = suchá hrozba PŘED uzlem, protokol = pointa PO uzlu. Moje práce je
hlídat, aby si telegraf nebral protokolu jeho nástroj.
- **Dělicí čára, která funguje:** humor telegrafu = *suché pojmenování hrozivé
  věci* (Malone si beze spěchu nasazuje brýle; šerif si sundává klobouk; „parta
  nadšených občanů"). Humor protokolu = *úřední jazyk aplikovaný na absurdní
  volbu hráče*. Když telegraf sáhne po ironickém označení nebo po srovnávacím
  gagu s pomlčkou, ukradl protokolu mechanismus, ne jen hlasitost.
- **Kontroluj překryv úvodní věty telegrafu s úvodní větou protokolu** — protokol
  má 3–5 vět a rekapitulace scény mu sežere první z nich.
- **Registrové úlety, které se opakují:** minulý čas v úvodní větě (telegraf má
  být scéna PŘEDEM), rozkazovací způsob (telegraf nesmí velet), přeskakování mezi
  neosobním „někdo musí" a oslovením „vy" uvnitř jednoho textu.
- **Past metafor:** obraz z herní mechaniky („poslední karta" ve hře s kartami)
  čte se jako mrknutí na hráče přes čtvrtou stěnu. Hledej je cíleně.

### E1 — KONKRÉTNÍ TVAR PŘEKROČENÍ ČÁRY: „vysvětlující ocásek" (2026-07-30)
Všech 5 nálezů v přepsané sadě mělo **týž tvar**: konkrétní obraz, který si vystačí,
+ čárka/pomlčka + **narátorův verdikt nad tím obrazem**. („leští si odznak o rukáv,
*jako by měl do večera čas*"; „most stojí nad vodou *už jen ze zvyku*"; „tři chlapi,
*kteří se nebaví*"; „*nikdo z nich nikam nespěchá*"; „*může vytrhnout trn*".)
- **Operační test:** škrtni druhou polovinu věty. Když obraz pořád hrozí, ocásek byl
  vtip a patří protokolu. Když obraz zmizí, byl to fakt a zůstává.
- **Rozdíl fakt vs. figura:** „závora, kterou roky nikdo nezvedl" = fakt s implikací
  (dovolené). „most stojí ze zvyku" = personifikace (protokolův motor).
- **Bonus:** škrt ocásků uvolní ~90 znaků → slouží mandátu „víc obrazu", nejde proti němu.
- **Opakující se figura sady:** „beze spěchu / nespěchá / do večera čas / beze slova"
  4–5× v 19 (nad stropem 2×). Podceňovaný poddruh — je to *evaluační* register,
  tj. půjčený protokolu, ne jen fráze. Hlídej ho v každém dalším kole.
- **Skeleton v syntaxi nároku:** mould „jde to *jen/jedině* tak, že…" 6× v 19.
  Frekvenční seznam veď i podle **syntaxe**, ne jen podle slov — bohatá slovní
  zásoba skeleton maskuje (viz B5).
- **Slabší forma ocásku = KONCESIVNÍ SPOJKA** („na stole je plno, *ačkoli* nikdo
  nepije"). Oba členy jsou fakty, takže operační test je propustí — ale spojka
  vysloví rozpor ZA čtenáře. Nahraď „a"; inference se vrátí stolu a věta zkrátí.
- **Generický zesilovač místo obrazu** (nová podtřída, 2026-07-30): „bez varování /
  bez ohlášení / ve špatnou chvíli" 3× v 19. Je to legální (nese informaci
  „pokazí se to"), ale je to *přenosné na kterýkoli obraz* — proto se to množí.
  Test: dá se to příslovce beze změny přesadit do jiného telegrafu? Pak není ze scény.

### E1b — Skeleton se po opravě PŘESTĚHUJE, nezmizí (2026-07-30)
D49 měla „a poznáte to pozdě" 8×/19. Škrt číslovky a rozvolnění pozice ten výskyt
zrušily — a v témž kanálu vyrostl **nový mould „[dál / pak / od té chvíle] to
bude/jde o X" 6×/19**, ze toho 3× doslova o „rychlosti". Příčina je B5′: invariant
dal kanálu 3+4 JEDNU vzorovou formulaci pro `zbran_skryte=true`, a ten signál má
10 z 19 uzlů → autor sáhl po slovníku 6×.
- **Po každé opravě jednotvárnosti udělej frekvenční seznam ZNOVU na tomtéž kanálu.**
  Opravená figura je pryč; hledá se její nástupce, ne její návrat.
- **Lék patří do invariantu, ne do textů:** kde má jeden signál >5 uzlů, musí
  vzorových formulací být 3–4 různých TYPŮ obrazu, jinak je jedna z nich frázovník.

### E2 — Uvolněné místo teče do úvodní scény = jediné, co se překrývá s protokolem
Když se rozpočet zvětší, autor prodlouží **úvodní scénický obrázek** (u D51 se
zdvojnásobil: 64 → 125 zn.). To je nejhorší volba: protokol i `text` scénu rekapitulují
znovu, takže hráč ji slyší 3×. Správný cíl uvolněného místa je **věta nároku
a předzvěst** — ty protokol nekryje. Kontroluj to jako první.

### E3 — Rozpad mřížky verdiktu zbraně (empirický test, dělej ho vždy)
2026-07-30: 4 semantické buňky verdiktu byly v sadě 19 renderovány **~11 různými
zněními**, a rozptyl byl **nejvyšší přesně v obou buňkách, které se liší jen tím,
jestli skrytá zbraň pomáhá** (`jen_skryte`+true 5 znění / 8 uzlů; `jen_skryte`+false
3 znění). Posluchač je pak rozlišuje na **poslední třech slovech** — a chyba stojí
auto-fail karty.
- **Test:** vždy sestav tabulku buňka → uzel → doslovné znění. Rozpad se nedá najít
  čtením po jednom, jen tabulkou.
- **Můj doporučený verdikt (2026-07-30):** znění dělat **normativní, ne příkladné** —
  4 pevné řetězce + definovaná appendovací místa (slotová výjimka, `rusi` u Brodyho).
  „Slovesa a obrazy se smějí přizpůsobit situaci" je ta věta invariantu, která rozpad
  vyrobila. Repetice v pevné **koncové pozici** čte se jako refrén telegrafního
  úředníka, ne jako chudoba — pozice + znění musí být konzistentní obojí.
- Hlídej i **lexikální register** kanálu: sada míchá „zbraň" / „bouchačka" /
  „železo" / „pod kabátem" — v jediném kanálu, který má být rozpoznatelný na dvě slova.

### E4 — Dobové reálie trasy Buffalo → New York (ověřeno, needitovat znovu)
- **V pořádku:** Mohawk, Poughkeepsie, Peekskill, Yonkers, Batavia, Syracuse, Oneida,
  Cohoes leží na trase a v roce 1930 existují. Silniční mýtná bouda v Hudson Highlands
  je doložená (Bear Mountain Bridge Road Toll House, 1924). Kořalka v šálcích je
  doložená praxe speakeasy (šálek jako maskování při razii). „Vysolit", „bouchačka",
  obušky strážníků, blok pokut, nákladní list — vše dobové.
- **Silniční most u Poughkeepsie:** Mid-Hudson Bridge otevřen **1930-08-25** →
  obhajitelné, ale těsné (platí jen pro druhou polovinu roku). Nepřipomínkovat, ledaže
  by se hra datovala na jaro.
- **Přívoz na Hudsonu 1930 = PÁRA, ne motor.** Trajekty byly parní; dieselové konverze
  až od ~1935. Česky proto **„stroj"**, nikdy „motor" (motor implikuje spalovací).
- **„Celnice v Albany" je institucionální chyba.** Domácí trasa Buffalo → NYC neřeší
  celnici; celní přístav je **Buffalo** (Peace Bridge 1927), a albanská celnice-budova
  byla teprve financována 1930. Papírové razítkovací scény patří na „úřadovnu".
- **„Pátá silnice" je nejednoznačná** — NY Route 5 (Buffalo → Albany, od 1924) je
  geograficky správná, ale česky se to čte jako Fifth Avenue. Používej „pětka".

### E5 — Dvě procesní kontroly, které se dělají POSLEDNÍ (a hledají chyby v páru)
1. **Rozpočet VĚT, ne jen znaků.** 2026-07-30: finální sada telegrafů měla 19/19
   přesně **5 vět = na stropu**. Znaková rezerva byla přitom pohodlná (~335 ze 400),
   takže „místo je" mate. Důsledek: **žádná oprava už nesmí rozdělit souvětí na dvě
   věty** — každý čtivostní nález se musí řešit PŘEPISEM. Počítej věty dřív, než
   navrhneš „rozdělit na dvě".
2. **Invariant × sada se rozejdou právě na PEVNÝCH zněních.** Tam, kde invariant
   fixuje doslovný řetězec, autor cestou opraví jeho vadu (u D51: append slotové
   výjimky měl v invariantu „bouchačka", což porušovalo jeho vlastní pravidlo
   „vždy zbraň"; sada napsala správně „zbraň"). Sada je pak lepší než spec —
   a kdo zapeče obojí, dostane v příštím kole „opravu" sady zpátky na vadu.
   **Vždy diffuj normativní řetězce spec × sada a nahlas, KTERÝ ze dvou se opravuje.**

## F. Fragmentová vrstva fallbacku (per-slot věty, D54(1) — 2026-07-30)
Nový formát: jedna věta na slot, klíčovaná `slot_resolved.duvod` × volitelně stat,
čtyři za sebou pod pásmovým odstavcem. B5′ na něm platí beze zbytku a přidává
tři vlastní vzorce.

### F1 — POOL EATS THE SPECIFICS: stat-klíčované fragmenty se losují nejmíň
Pool slotu = fragmenty na jeho stat ∪ VŠECHNY obecné. Při 1 stat-variantě a 3
obecných má stat-varianta ~25 % šanci → v reálném runu vyšlo 5 stat vět z 32.
**Obecné jsou generické z definice** (musí sednout na všech pět statů), takže se
nejvíc losují právě věty, které o roli řeknou nejmíň — tedy přesně proti
kritériu podlahy §2.7 („hráč umí říct, co ta věc v té roli dělala“).
- **Test:** spočítej rozložení skutečně vylosovaných id v golden runu, ne poměr
  v souboru. 32 vět z 32 fragmentů čerpalo jen **14 různých**, top jeden 6×.
- Lék je poměr v přihrádce (víc stat-variant), ne víc obecných.

### F2 — DVOJITÝ ZÁVĚS „X vedený/zapsaný jako Y“ = formulářový rytmus
Kontrakt placeholderů (nesklonitelné {vec}/{role} → povinný úřední obal) tlačí
každou větu do tvaru *dva citované štítky spojené závěsem*. Ve 4/4 uzlu vyšlo
**7 závěsů na čtyři věty**. Jednotlivě to projde, po čtyřech je to vyplněný spis.
- **Lék uvnitř kontraktu:** nejvýš JEDEN závěs na větu — druhý štítek nést holou
  vazbou („k položce „{role}““, „u položky „{role}““), která je taky legální.
- Hlídej i to, aby se nesrovnaly na jedno sloveso: samé „zapsaný jako“ je jen
  jiná monotonie než samé „vedený jako“. Drž poměr ~1:1.

### F3 — FIGURA „vyšetřovatelovo pokrčení rameny“ (obchází pravidlo o závorce)
„což zaznamenávám bez dalšího“ / „spis to konstatuje bez údivu“ / „spis raději
nerozvádí“ / „prázdné místo se hodnotí samo“ — meta-komentář úředníka k vlastnímu
zápisu. Sada dodržela literu pravidla „max 1 závorka“ a přitom **14 z 32 vět
runu končilo touto figurou bez závorek**. Závorka je jen jeden její nosič; počítej
figuru, ne interpunkci.

### F4 — ŠUM FALZIFIKUJE KAUZÁLNÍ TVRZENÍ O SELHÁNÍ
Práh je `kotva + offset + bump + šum`, takže slot propadne i kartou, která na
kotvu stačila. Věta „selhal, **a nikoli nešťastnou náhodou**“ je proto v části
případů nepravdivá — a hráč si to ověří, protože vysvětlující vrstva mu odhalený
práh ukáže. Poddruh B3 (tvrzení, které mechanika negarantuje), specifický pro
per-slot vrstvu: **fragment smí popsat ZPŮSOB, nikdy PŘÍČINU selhání.**

### F5 — ŠEV: pásmová šablona se „nevědomostí“ chlubí větu před tím, než ji fragment vyvrátí
Pásmové šablony psané PŘED fragmenty hedžují („ať už tím, že je zastal nevhodný
kus, nebo tím, že je nezastal nikdo“; „zda ztroskotaly pro nezpůsobilost, nebo
pro nepřítomnost, **spis neuvádí**“ — `fb-v3-nasledky-1`, `fb-v3-prusvih-5`,
`fb-v3-prusvih-2`). Fragmentový odstavec o centimetr níž odpoví přesně to.
U „spis neuvádí“ je to **přímý rozpor dvou sousedních odstavců**, ne jen šev.
- **Vždy projdi pásmové šablony na formulace typu „spis neuvádí / nezaznamenává /
  se nedozvím“**, jakmile pod ně přibude podrobnější vrstva. Oprava patří do sady
  šablon, ne do fragmentů (viz E5/2 — nahlas říct, KTERÝ ze dvou se opravuje).
- Totéž pro počítací otvírák („N ze čtyř“): počet je teď derivovatelný ze čtyř vět.

### F6 — Procesní: golden run pokryje jen přihrádky, které v NĚM padly
Sada měla 3 varianty `neobsazeno` popsané jako nejrizikovější (padají 2–3× v jednom
odstavci), a golden run je **nepokryl ani jednou** — složená postava přišla až
v posledním uzlu se situací. **Před verdiktem si vypiš, které přihrádky snapshot
netestoval**, a žádej druhou fixturu (složení uprostřed runu), jinak se posuzuje
text, který nikdo neviděl poskládaný.

## G. VLASTNÍ DOKUMENTACE PROMPTU JE TAKY TESTOVANÝ OBSAH (2026-08-02, kolo v0.4.1)
Dosud jsem probíhal karty, šablony, telegrafy a výstupy modelu. Kolo v0.4.1 ukázalo
třetí zdroj chyb: **prompt sám a jeho vzorové příklady**. Dvě z pěti oprav byly
chyby, které tam ležely od v0.3/v0.4 a nikdo je nečetl jako obsah.

### G1 — VZOROVÝ PŘÍKLAD MŮŽE UČIT PŘESNĚ TU CHYBU, KTEROU BATERIE TRESTÁ
Příklad „dobrého výstupu" tvrdil `MAX DOSAŽITELNÉ 3/4` při dosažených 2/4 — ale ze
statů čtyř věcí v ruce vycházejí 2/4 (nástrojový i útočný slot byly s tou rukou
nedosažitelné). Vzor tedy demonstroval **vymyšlený gap**, tj. vymyšlenou příčinu,
kterou rule 5 i rule 7 zakazují a kterou baterie jinde označuje za KRITICKÉ.
- **Test, který dělej vždy:** každé ČÍSLO ve vzorovém příkladu přepočítej proti
  `obsah/*.yaml` a enginu. Tón vzoru se čte snadno, čísla ve vzoru nikdo nekontroluje.
- **Konkrétně u MAX DOSAŽITELNÉ:** oracle je brute-force přes 4! permutací
  **POSTgamblové** ruky (`resolve.js` `maxAchievableZasahy`, volaný po `gamble()`
  přepsání `situ.committed`). Nejrychlejší kontrola: pro každý slot najdi maximum
  příslušného statu napříč rukou; slot s max < práh je nedosažitelný **žádnou**
  permutací, a MAX ≤ počtu zbylých slotů.
- **Vedlejší pointa, kterou to odkrylo:** gamble smí MAX SNÍŽIT (odhozený „Provaz
  a kladka" měl nástroj 4 → před gamblem bylo 3/4). Záchrana není jednosměrně dobrá.

### G2 — ZAPEČENÝ ENGINE > PRÓZA V DESIGN DOKUMENTU (a próza zestárne tiše)
Prompt i `prototyp-mvp.md` uváděly kredity +2/+1; `rules.js` má +3/+2 od kalibrace-1.
Rozchod přežil dvě verze promptu a celé kolo obsahu.
- **Než v promptu ocituješ číslo, ověř ho v `prototyp/src/engine/rules.js`.**
  Dokumenty popisují záměr, `rules.js` popisuje, co se stane.
- **Když číslo opravíš, hledej JEHO ODVOZENINY** — u kreditů to byly orientační
  součty runu („skvělý ~13, medián ~7–9"), které kritik navíc našel jako gate
  kritérium K8. Oprava vstupu bez přeměření výstupu vyrobí druhý rozpor.
- **Můj vlastní záznam měl pravdu dřív než prompt** (sekce D, „bedny se neztrácejí
  jen v PRŮŠVIHU", doloženo 2026-07-27; do promptu se to dostalo až 2026-08-02).
  Poučení: **nález doložený v mé paměti, který se neprojevil ve sdíleném souboru,
  není hotový.** Po každém doložení se ptej, který soubor ho má nést.

## H. PRVNÍ PRODUKČNÍ MĚŘENÍ (brána češtiny, Haiku 4.5, 2026-08-02) — 0/13
Do 2026-08-02 byl celý prompt testován jen mnou (silnějším modelem). První reálné
výstupy Haiku 4.5 na v0.4.1 změnily pořadí rizik. Vyhodnocení:
`technika/brana-cestiny-vyhodnoceni-2026-08-02.md`.

### H1 — MOJE PREDIKCE BYLA VYVRÁCENA: čeština padá dřív než refrén
Predikoval jsem, že „refrén invencí spadne dřív než čeština". **Refrén 1/13, tvrdá
jazyková vada 13/13.** Nefunkční morfologie (nonwords: `hlídkouní`, `chybřeba`,
`mozitý`, `neprávil`), **cyrilice uvnitř českého slova** (`импровизацe`), anglické
slovo (`Subsequently`), slovakismy (`bedňa`, `ĺ`), rozpad shody a pádu.
- **Poučení o vlastní zaujatosti:** neuměl jsem si představit *tento* druh selhání,
  protože ho nikdy nevyrobím. Zaujatost není jen „píšu líp" — je to **slepota vůči
  třídám chyb, které silný model nedělá vůbec.** U každé predikce se ptej, jestli
  ji nestavím jen na chybách, které umím napodobit.
- **Podezřelý č. 1 není prompt, ale `temperature`.** `anthropic.js` neposílá teplotu
  → SDK default 1.0. Vynalézavá morfologie + průnik příbuzného písma je podpis vysoké
  teploty na flektivním jazyce. **Než sáhneš na prompt, žádej A/B na 0.4–0.6.**

### H2 — NEJDŘÍV OVĚŘ INFRASTRUKTURU, JINAK MĚŘÍŠ ŠUM
8 z 13 výstupů bylo **useknuto uprostřed slova**: `MAX_TOKENS = 400`
(`providers/anthropic.js`) ≈ 850–1000 zn. češtiny, z toho 50–120 sežere markdown
hlavička. Tím padlo měření stropu 900, závorky, pořadí škrtání i úplnosti NÁSLEDKŮ —
nešlo odlišit „model přetáhl" od „API uřízlo". Navíc `adapter.js` `jeValidni()`
nekontroluje `stop_reason` → useknutý fragment je „validní" a fallback nesepne.
- **Před každou bránou si projdi celou cestu volání** (max_tokens, temperature,
  validace odpovědi), ne jen prompt. Jeden konfigurační řádek umí zneplatnit celé kolo.
- **Rozsah ve VĚTÁCH je proti useknutí odolný, ve znacích ne.** Když je výstup
  useknutý, počítej věty — 13/13 přes 5 vět byl jediný použitelný délkový signál.

### H3 — CO DRŽELO: jádro rule 3 obstálo na produkčním modelu
**Ani jeden z 52 slotů nebyl obrácen na opačný výsledek.** Auto-fail brokovnice držel
i s důvodem, kolárek držel proti fikci věci, bedna v `past-vymysleny-dusledek` se
neztratila. Sólo klauzule 2/2. **„Mechanika rozhoduje, AI vypráví" na Haiku funguje** —
selhává vrstva nad tím (jazyk, rozsah, kulisa). Tohle si pamatuj jako baseline:
příští regresi měř proti „52/52 slotů drží", ne proti dojmu.

### H4 — POŘADÍ FREKVENCE PORUŠENÍ (baseline pro příští kolo)
1. jazyková vada 13/13 · 2. přes 5 vět 13/13 · 3. formátový šum (nadpisy) 13/13 ·
4. **vymyšlená PŘÍČINA selhání 8/13** (A4 — nejčastější porušení pravidla) ·
5. věc ze slotu zmizí/zamění se 6/13 · 6. strojový slovník v próze 4/13 ·
7. vymyšlené jméno 3/13 · 8. vymyšlený mechanický důsledek (A3) 3/13 · 9. refrén 1/13.
- **A4 je jednořádková věta uvnitř nejdelšího odstavce promptu a Haiku ji nedrží.**
  Obecně: **zákaz schovaný uprostřed dlouhého pravidla se na slabém modelu ztrácí** —
  rozhoduje pozice, ne jen znění. Totéž potkalo rule 4 (zadržení, `slozeni-lezi-v-aute`:
  složený „převezen v motorizovaném voze na dalšem šetření") — pojmové znění z v0.4.1
  bylo správné a přesto nestačilo.
- **Nová podtřída A3:** model vrátí strukturu vstupu na výstup (blok „NÁSLEDKY: Žár
  posádky: −7"). Hlídej ji — je to nejnápadnější porušení iluze protokolu.

### H5 — MRTVÁ VSTUPNÍ POLE POTVRZENA V PRAXI (n=1, ale jednosměrně)
`ZÁCHRANA` zmíněna **0 ze 4** casů, kde padla. Gap proti `MAX DOSAŽITELNÉ`
zaznamenán **0 ze 4**. Přesně to, kvůli čemu byla diagnostická položka psaná
([[baterie-falzifikovatelnost]] §3). **Než se za pole platí další kolo, proměř je
na 5 generacích.**

## I. A/B TEPLOTY (2026-08-02, 2. běh brány) — dvě vrstvy se čistě oddělily
Rameno A t=0,5 × rameno B t=1,0, táž baterie, `MAX_TOKENS` 800.
Vyhodnocení: `technika/brana-cestiny-ab-2026-08-02.md`.

### I1 — HYPOTÉZA TEPLOTY POTVRZENA, ALE JEN NA JAZYKU
Tvrdá jazyková vada (nonword / cizí písmo / věta bez významu) **13/13 → 2/13**;
cizí písmo z ramene A zmizelo; medián délky 956 → 866 zn. **Beze změny zůstalo
všechno ostatní:** počet vět 13/13 přes strop, formátový šum 13/13, vymyšlená
příčina 8/13, mizející věc 5/13, jména 3/13, KRITICKÉ casy 6 vs 6.
- **Zákon, který si z toho odnes:** teplota je páka na *vzorkování slov*, ne na
  *dodržování pravidel*. Když nález přežije změnu teploty v nezměněné frekvenci,
  je to vada promptu — a naopak. **Používej A/B teploty jako TŘÍDIČ nálezů**, ne
  jen jako opravu: rozdělí seznam na „jazyk" a „pravidla" levněji než cokoli jiného.
- Nižší teplota **není monotónní zlepšení**: dva casy zregresovaly (popsaný výstřel
  tam, kde v 1. běhu nebyl; chybné číslo beden ve strojovém bloku). Nehlas „lepší",
  hlas „lepší v ose X, horší v ose Y".
- **0,5 zapéct, dál neměřit.** Zbylé vady nemají teplotní tvar; níž jít ohrožuje D53.

### I2 — MRTVÉ PRAVIDLO: „3–5 vět" má 0 dodržení ze 39 generací
Tři běhy (400 tok./t=1,0 · 800/t=1,0 · 800/t=0,5), ani jednou. Haiku věty nepočítá;
délku drží výhradně znakový strop. **Pravidlo, které za tři nezávislé konfigurace
nikdy nesepnulo, není přísné — je mrtvé**, a v baterii dělá 13/13 „selhání" na
položce, která nemůže projít ([[baterie-falzifikovatelnost]] §1).

### I3 — FORMÁTOVÝ ŠUM VYRÁBÍ ČÍSELNÉ CHYBY (povýšeno z kosmetiky na KRITICKÉ)
Model přidává markdown hlavičku (13/13) a strojový souhrn následků (5/13). V jednom
casu ten souhrn tvrdil **„Bedny: 4"**, ačkoli próza nad ním měla ztrátu správně
(náklad 5). **Formátový šum není jen daň z rozpočtu — je to druhý, nekontrolovaný
kanál pro čísla.** Hlídej ho jako zdroj rule-3 vad, ne jako estetiku.

### I4 — TŘÍDA „ZAMLČENÍ" JE ČASTĚJŠÍ NEŽ TŘÍDA „OBRÁCENÍ"
52/52 slotů drží výsledek podruhé — obrácení se nestalo ani jednou za dva běhy.
Zato **změkčení a zamlčení** je běžné: „k takovému kroku však nedošlo" (selhání
vyprávěné jako netestované), „částečně uspěla" (změkčený zásah), složení zamlčené
a nahrazené vymyšleným postihem. **Kontroluj proto ne „je výsledek obrácený?", ale
„pozná hráč u každého slotu, jestli prošel?"** — první otázka projde, druhá padne.
Lék je pozitivní požadavek na jednoznačnost, ne lexikální zákaz obratů (past
přeširokého zákazu, [[prompt-variant-rozhodovani]]).

### I5 — TŘÍDA SE PO OPRAVĚ PŘESTĚHUJE (E1b platí i na promptu)
Rule 4 „zadržení" držela v casu, kde v 1. běhu padla — a padla v jiném („byl
zadržen podezřelý A"). Slovo „zadržen" je přitom ve výčtu pravidla **obsaženo**.
**Rozšiřovat výčet dál nemá smysl; rozhoduje pozice pravidla, ne jeho úplnost.**

## Stav promptu — ZDE SE NEUDRŽUJE (ověř v `prompty/protokol.md`, changelog)
Snapshoty verzí odsud odstraněny 2026-08-02: zestárnou tiše a jeden z nich už lhal
(„v0.4 stále NEOTESTOVÁN na produkčním modelu" — mezitím proběhly dva běhy brány,
viz §H a §I). **Zdroj pravdy je changelog v `prompty/protokol.md`**; verzi mandátu
poznáš z rule 5, strop z rule 1, výčet následků z rule 7. Sem patří jen to, co
v promptu NENÍ:
- **OTEVŘENÁ otázka pro designéra (od v0.4.1, stále otevřená):** platí zákaz újmy
  z rule 4 i na PROTISTRANU (NPC)? Dnešní „nikdo" je univerzální a u prošlého
  útočného slotu v konfrontaci nechává rule 5 skoro bez materiálu.
- Rozhodovací metodika pro varianty pravidel: [[prompt-variant-rozhodovani]].
- Jak psát baterii, aby uměla selhat: [[baterie-falzifikovatelnost]].

## A3–A5, C1 — třídy chyb otevřené kreativním mandátem (zapsáno v kole v0.4)
Dodatky k sekcím A a C výše — dřív omylem zařazené pod dobový snapshot promptu,
takže se špatně hledaly. Platí dál bez ohledu na verzi promptu.

### A3 — VYMYŠLENÝ MECHANICKÝ DŮSLEDEK (nová KRITICKÁ třída, otevřená mandátem v0.4)
Od chvíle, kdy prompt modelu **káže vymýšlet**, přibyla třída chyby, kterou v0.3
neměla jak vyrobit: invence, jejíž důsledek si čtenář **dopočítá proti číslu, které
ve vstupu nebylo**. Není to změna výsledku (ta je A1), je to nový fakt, který
výsledku odporuje.
- Doložené tvary: „chlapi si bednu vzali" (náklad beze změny), „vypálil ránu do
  vzduchu" (Žár 0, nebo dokonce klesající), „bedna se roztříštila", „rána se
  rozlehla údolím".
- **Jak testovat:** postav uzel, kde je invence maximálně svůdná ke kroku, který
  hýbe číslem — bedna v útočné roli s nezměněným nákladem; zbraň, která prošla,
  při KLESAJÍCÍM Žáru (konfrontace). Case `past-vymysleny-dusledek`.
- **Hlídej směr, ne jen existenci:** nejzrádnější je konfrontace, kde Žár klesá —
  model má naučeno, že zbraň = pozornost, a napíše růst.

### A4 — VYMYŠLENÁ PŘÍČINA SELHÁNÍ (poddruh F4, od v0.4 povinně hlídaný)
„nestačilo to, protože ráže byla malá", „nemělo to sílu", „byl na to moc slabý".
Model **udrží výsledek a vymyslí si k němu důvod** — proto se to nechytí kontrolou
na změnu výsledku a musí se hlídat zvlášť. Práh je `kotva + offset + bump + šum`,
takže kauzální tvrzení je v části případů nepravdivé a hráč si to ověří odhaleným
prahem. Rule 5 v0.4 to zakazuje explicitně („nikdy PŘÍČINU").
- **Nejčastější konkrétní tvar:** `PRAVIDLO RUNU` (hodnota = 0) → model napíše
  „neměl dost peněz" místo „na téhle trase peníze neplatí". Je to příčina
  i posun významu zároveň a je to důvod, proč pole existuje.

### A5 — NÁHRADNÍ OZNAČENÍ V SÓLU se stane refrénem, opačné selhání je horší
Rule 2 nabízí dvě náhrady („jmenovaný", „týž") na ~4 potřebné reference. Model
dostal rotaci a bude ji opakovat **v každém protokolu runu** — B5′ vynucený přímo
zněním pravidla. Doloženo vlastní generací 2026-08-01, ne odhad.
- **Opačné a horší selhání:** „jeden z podezřelých… druhý…" — ze čtyř slotů jedné
  osoby udělá dva lidi. KRITICKÉ, a sólo je dle D40(b) default cesta prvního
  sezení lidské brány, ne edge case.
- **Rozpor v projektu, hlídej ho:** D40(b) zvolil pro fallbacky **neutrální psaní**
  („úlohy, vůz, náklad") místo zájmenné rotace. AI větev a fallback větev tak řeší
  týž problém jinou technikou — ve složeném spisu skončí vedle sebe v jiném registru.

### C1 — PROCESNÍ: „baterie zelená, produkce spadne"
Baterie je **ručně psaný snapshot**, ne výstup `buildPromptInput()`. Doloženo
2026-08-01: produkce posílá jiný vstup než baterie — záporný Žár jako `+-7`
se „šerif beze změny", postihovou fikci useknutou na první větě a ve 2. osobě,
`PRAVIDLO RUNU` až za NÁSLEDKY, `loot` vždy prázdný i v pásmu HLADCE+LOOT.
- **Před každou akceptační bránou ověř, že vstupy baterie vznikly z kódu, který
  se reálně volá.** Jinak měřím kvalitu promptu, který se nikdy nepošle — a to je
  přesně to, na čem má stát brána češtiny dle D55.
- **Nález se 2026-08-02 zopakoval mou vlastní rukou** (a to jsem ho měl zapsaný):
  do nového casu jsem napsal dva ruční řádky `důvod:`, jenže `prompt.js` dopisuje
  `důvod:` **jen u `gangster_auto_fail`** — zrušený stat jde do modelu jako
  „mělo hodnota 0" bez vysvětlení. KRITICKÁ položka casu („nesmí napsat, že
  nestačily peníze") se tak testuje na vlídnějším vstupu, než jaký hra generuje.
  **Pravidlo: každý řádek vstupu, který píšu ručně, si najdi v `buildPromptInput()`.
  Co tam nevzniká, do baterie nepatří — nebo tam patří s poznámkou, že je to
  optimistický vstup.**

## Vlastní zaujatost
Jsem silnější než produkční Haiku. U promptu generuj vždy i **nejhorší** variantu.
U fallbacků (fixní text) zaujatost nehrozí — tam je past opačná: text čtu izolovaně
a přehlédnu, že poskládaný spis je formulář (viz B5).
