# Test absurdních karet — 2026-08-02

Simulace budoucí tvorby obsahu uživatelem (kontext: D54(2) kombinatorický
skladač obsahu, `projekt/rozhodnuti.md`). Cíl: ověřit, jak si AI vrstva
(Haiku 4.5, prompt v0.4.2) poradí, když se do hry vloží záměrně hloupé věci —
šest karet zadaných uživatelem: **kuřecí stehýnko, bramborová placka, tulení
ocas, krevetka, důchodcovská hůl, prasečí bičík**.

**Metodika:** sandbox `obsah/` (mimo git, `scratchpad/obsah-absurd/`), NE
kanonický obsah repozitáře — `obsah/` v repu nebyl editován, jen čten
(potvrzeno `git status` před a po testu beze změny). Šest z osmi karet
známé sólo ruky pro seed 1 (`technika/woz-run-2026-07-30.jsonl`, hráč
Bartoš) bylo v sandboxu nahrazeno absurdními kartami při zachování stejné
pozice v `veci.yaml` (stejná RNG cesta při líznutí, stejný seed → hráč
dostane doslova tytéž karty, jen s jinými staty/texty). Krátký sim běh
(`CONTENT_DIR=sandbox`, `--seed 1 --players 1 --events`) potvrdil, že
`run_started` ruka pro seed 1 skutečně obsahuje všech šest absurdních karet
(viz níže). Celý sólo run pak byl odehrán strategií `kompetentni` (stejný
preset jako v3 brána) a pro **všech 8 resolučních uzlů** vygenerován
protokol REÁLNÝM Anthropic adaptérem — přesně cestou `sim/brana-cestiny.js`
(`buildPromptInput()` → `SYSTEM_PROMPT` z `prompty/protokol.md` v0.4.2 →
`createAnthropicProvider()`, model `claude-haiku-4-5-20251001`, teplota
0,5 default). Žádný kód ani obsah v repozitáři nebyl změněn; testy
`prototyp/` nebyly dotčeny (sandbox běžel mimo `CONTENT_DIR` default).

## Návrh karet a zdůvodnění

Šest z osmi karet počáteční ruky (seed 1, hráč Bartoš) bylo nahrazeno —
ponechány `Dědečkova brokovnice` a `Plechová vesta` jako kontrastní klasika
vedle absurdit. Staty jsou navržené tak, aby **zachovaly dominantní stat
nahrazované karty** (distribuce balíku se tím prakticky nemění, run zůstává
řešitelný týmž seedem) a zároveň měly komediální mechanickou logiku:

| Nahrazená karta (orig.) | Absurdní karta | Staty (utok/obr/hod/imp/nástr) | Zdůvodnění profilu |
|---|---|---|---|
| Kněžský kolárek (imp 4) | **Prasečí bičík** | 1 / 2 / 0 / **4** / 0 | Groteskní bluf-zbraň — švihne, ale respekt nebudí; improvizace jako u kolárku. |
| Bedna kanadské (hod 4) | **Krevetka** | 0 / 0 / **4** / 2 / 0 | Vzácná dovezená delikatesa jako úplatek — hodnota z exotičnosti, ne z objemu. |
| Kanystr benzínu (nástr 4) | **Bramborová placka** | 0 / 1 / 0 / 2 / **3** | Mastnota jako improvizovaný lubrikant na panty/zámky — nástroj snížen na 3 (méně věrohodné než benzín). |
| Provaz a kladka (nástr 4) | **Důchodcovská hůl** | 1 / **3** / 0 / 1 / **3** | Hůl jako pákový nástroj i opora při obraně — dvoustatová obrana/nástroj dle zadání uživatele. |
| Lopata (utok 3/nástr 4) | **Tulení ocas** | **4** / 2 / 0 / 1 / 0 | Těžký mokrý cep jako tupá zbraň; nástrojová složka lopaty (kopání) absurditě nesedí, proto padla ve prospěch útoku. |
| Hovězí vývar (imp 4) | **Kuřecí stehýnko** | 0 / 1 / 1 / **4** / 0 | Jídlo jako klidný, nenápadný rekvizit pro bluf/lhaní — stejná improvizační role jako vývar. |

Texty (≤140 znaků, dobová stylizace, suchý humor) — viz aktuální znění
v sandboxu; do kanonického `obsah/veci.yaml` NEJDOU bez schválení
designového týmu.

Ověření ruky (sim, seed 1, sandbox):

```
RUN_STARTED ruka: praseci-bicik, dedeckova-brokovnice, krevetka,
  bramborova-placka, duchodcovska-hul, plechova-vesta, tuleni-ocas,
  kureci-stehynko
```

Všech 6 absurdních karet potvrzeno v ruce. ✔

## Průběh runu a protokoly (8 resolučních uzlů)

Run dojel do cíle (`DORUCENO`, 7 uzlů mapy + start, 4 bedny doručeny,
Žár 6/8 na konci, 2 kredity). Mechanicky **řešitelný** — žádný pád enginu,
žádná nekonečná smyčka, žádný neplatný stav.

---

### Uzel 1 — Překladiště v Syracuse (npc)

**Absurdní věci v roli:** Důchodcovská hůl (Odsunout závoru, viditelná),
Kuřecí stehýnko (Podmáznout dlaň, viditelná), Prasečí bičík (Zmást papírem,
skrytá). + klasika: Dědečkova brokovnice (Zatlačit hrubě).

**Mechanický výsledek:** S NÁSLEDKY 2/4 (MAX 2/4). Zásah: Zatlačit hrubě
(brokovnice, útok 5≥5), Zmást papírem (prasečí bičík, improv 4≥1). Selhání:
Odsunout závoru (hůl, nástroj 3<5), Podmáznout dlaň (stehýnko, hodnota 0<5 —
`PRAVIDLO RUNU` na uzlu ruší hodnotu). Postih: Naražené rameno (lehký). Žár
+2 (tasená zbraň + S NÁSLEDKY).

**Vygenerovaný protokol** (1021 znaků):

> Protokol č. 1847/30
>
> Dne 15. září 1930 byla zaznamenána incident na překladišti v Syracuse.
> Podezřelý A se pokusil prosadit neoprávněný přístup k vagonovému nákladu.
> Nejprve se jej snažil fyzicky odsunout od vagonu, přičemž tasil tzv.
> Dědečkovu brokovnici a hrubou silou jej zatlačil proti veřejím. Výpravčí
> se bránil, avšak podezřelý jej překvapil a dosáhl svého cíle — výpravčí
> ustoupil. Následně se pokusil pohnout závoru vozu pomocí důchodcovské
> hole, kterou měl po ruce, avšak závora byla příliš těžká a pokus selhal.
> Třetím způsobem se snažil podezřelý A ovlivnit výpravčího úplatkem
> v podobě kuřecího stehýnka, které vytáhl ze svého kabátu; výpravčí jej
> však odmítl. Nakonec podezřelý A pokusil zmást situaci rozvinutým
> prasečím bičíkem, kterým papír vytrhl z výpravčího ruky. Při fyzickém
> střetu si podezřelý A narazil rameno o veřeje vozu. Tasená brokovnice
> přivolala pozornost okolí a zvýšila ostražitost místních úřadů — šerif
> postoupil o dvě pole blíž. (Výpravčí se ukázal být tvrdší ořech, než se
> očekávalo.)

---

### Uzel 2 — Odstavený vagon v Peekskillu (lokace)

**Absurdní věci v roli:** Tulení ocas (Kdyby se probudil, skrytá). +
klasika: Kastrol na hlavě, Páčidlo, Plechová vesta.

**Mechanický výsledek:** HLADCE+LOOT 4/4 (MAX 4/4). Všechny 4 sloty zásah,
vč. Tulení ocas (útok 4≥2). Kredity +3, Žár +1.

**Vygenerovaný protokol** (1186 znaků):

> Protokol č. 1847-B, New York Police Department, Peekskill, 14. března
> 1930.
>
> Dne uvedeného data byla provedena kontrola odstavených vagonů na
> železniční nádraží v Peekskillu. Podezřelý A byl zastižen v průběhu
> nelegálního vstupu do uzavřeného vozu. Při příchodu hlídače se podezřelý
> pokusil projít mezi vozidly a překonat hlídkový obvod, přičemž si nasadil
> kastrol na hlavu jako improvizovanou ochranu hlavy — pokus se zdařil.
> Následně se podezřelý pokusil vykopat zámek vozu pomocí páčidla, jímž
> disponoval; zámek ustoupil bez zvláštního odporu. V okamžiku, kdy se
> hlídač přiblížil, se podezřelý ztuhl v hlubokém stínu mezi vagony, přičemž
> se spolehl na plechovou vestu jako na prostředek k zmírnění viditelnosti —
> skrytí se podařilo. Když hlídač procházel v blízkosti, podezřelý se náhle
> vzepřel a zaútočil pomocí tulení ocasu, kterým disponoval; útok hlídače
> zaskočil a ten se stáhl. Hlídač následně vykřikl na posilu, čímž byl
> signalizován pohyb šerifa směrem k lokalitě. Podezřelý A se z místa
> vzdálit podařilo. Náklad šesti beden zůstal v autě nedotčen. Výnos
> z operace činí tři kredity. (Kastrol na hlavě — věc z repertoáru, která se
> v tomto kontextu osvědčila překvapivě dobře.)

---

### Uzel 4 — Zátaras u Verony (npc)

**Absurdní věci v roli:** žádné (Medvědí kožich, Otrlený výraz, Konev na
mléko, Ukradený samopal — vše původní obsah; sandboxové karty zůstaly
v ruce nevyužity na tomto uzlu).

**Mechanický výsledek:** HLADCE 3/4 (MAX 3/4). Kredity +2, Žár +1.

**Vygenerovaný protokol** (957 znaků, jen pro úplnost běhu — bez absurdních
karet, orientační bod srovnání proti běžnému obsahu):

> PROTOKOL VYŠETŘOVÁNÍ č. 847/30 […] (Rivalové si evidentně neuvědomili,
> s kým si počínají.)

*(plné znění viz `protokoly-vysledky.json` v poznámkách níže — vynecháno
pro stručnost, nenese absurdní obsah).*

---

### Uzel 5 — Zátah na páté silnici (zatah)

**Absurdní věci v roli:** **žádná se do slotu nedostala** — `Bramborová
placka` byla v tomto uzlu **gamblnuta pryč** (`ZÁCHRANA: líznuto „Řeznický
hák" místo „Bramborová placka"`) ještě před rozdělením do slotů. Absurdní
karta tedy v tomto uzlu existuje jen jako oběť gamblu, ne jako herec scény.

**Mechanický výsledek:** S NÁSLEDKY 2/4 (MAX 2/4). Postih: Prach do očí
(lehký). Žár +3.

**Vygenerovaný protokol** (1181 znaků):

> PROTOKOL ZÁTAHU NA PÁTÉ SILNICI, Č. j. 1930/05/PD […] Při proražení
> blokády však zvířený prach ze silnice vehnal podezřelému A slzy do očí […]
> (Operace trvala déle, než bylo žádoucí.)

**Pozorování:** protokol **nezmiňuje ZÁCHRANU vůbec** (rule 7: „Padla-li
ZÁCHRANA, zmiň ji jednou vsuvkou.") — komediální moment (bramborová placka
vyměněná za řeznický hák uprostřed zátahu) se ztratil úplně. Není to
specifikum absurdních karet, ale právě u nich je ztráta citelnější, protože
gamblovaná karta byla jediná šance, jak se „Bramborová placka" v tomto běhu
vůbec objevila ve hře.

---

### Uzel 6 — Most u Poughkeepsie (lecka)

**Absurdní věci v roli:** žádné (Svářečka, Pytel cementu, Banánový kanón,
Mosazný boxer — původní obsah).

**Mechanický výsledek:** PRŮŠVIH 0/4 (MAX 2/4). Postih: Otřes mozku (těžký).
Ztraceno 1 bedna. Žár +3.

*(protokol vynechán z výpisu — nenese absurdní obsah, viz JSON pro plné
znění).*

---

### Uzel 7 — Kolona na albanské poštovní silnici (konfrontace)

**Absurdní věci v roli:** žádné (Zednická lžíce, Rezervní pneumatika,
Schovaná pistole, Uříznutá hlaveň).

**Mechanický výsledek:** HLADCE 3/4 (MAX 3/4). Kredity −7 (léčení, směna).
Žár −7 (přežitá konfrontace, ústup šerifa).

**Pozorování mimo téma absurdních karet, ale relevantní pro kvalitu
promptu:** tento protokol **otevírá doslovným markdown nadpisem**
`# PROTOKOL VYŠETŘOVÁNÍ č. 1847-B` — přesně třída chyby, kterou v0.4.2
rule 1 měla zavřít („Piš souvislou prózu bez nadpisů, hlaviček, rubrik
a odrážek"). Viz souhrn níže.

---

### Uzel 8 — Mýtnice za Batavií (npc)

**Absurdní věci v roli:** žádné (Petrolejová lampa, Slzy na povel, Balík
bankovek, Dámský revolver).

**Mechanický výsledek:** HLADCE 3/4 (MAX 3/4). Kredity +2, Žár +1.

---

### Uzel 9 — Zátah na páté silnici (zatah)

**Absurdní věci v roli:** žádné (Zlaté hodinky, Gumový váček, Falešný
odznak, Dědkův kabát). `ZÁCHRANA` na tomto uzlu vyměnila „Starý kompas" za
„Gumový váček" — žádná absurdní karta v tom nefiguruje. **`Krevetka` se do
hry v tomto konkrétním běhu nikdy nedostala** — zůstala v ruce od začátku
do konce (RNG artefakt tohoto seedu a strategie, ne chyba promptu ani
enginu).

**Mechanický výsledek:** PRŮŠVIH 1/4 (MAX 2/4). Postih: Otřes mozku (těžký).
Ztraceno 1 bedna. Žár +2.

---

## Tabulka karet (staty a finální texty)

| Karta | Útok | Obrana | Hodnota | Improv. | Nástroj | Text |
|---|---|---|---|---|---|---|
| Kuřecí stehýnko | 0 | 1 | 1 | 4 | 0 | Upečené stehýnko zabalené v novinách. Žvýkáš je s takovým klidem, že ti nikdo nevěří, že lžeš. |
| Prasečí bičík | 1 | 2 | 0 | 4 | 0 | Stažený ocásek z uzenářství, tuhý jak bič. V ruce budí spíš smích než respekt, švihne ale pořádně. |
| Krevetka | 0 | 0 | 4 | 2 | 0 | Chlazená krevetka až z pobřeží, vzácnost jak z jiného světa. Gurmán za ni zapomene na odznak. |
| Bramborová placka | 0 | 1 | 0 | 2 | 3 | Mastná placka rovnou z pánve. Nejlíp ze všeho promaže tuhé panty — a ruce má po ní kluzké i majitel. |
| Tulení ocas | 4 | 2 | 0 | 1 | 0 | Tuhý ocas z lovu na tuleně, těžký jak mokrý provaz. Švihne s duchem, a než ho někdo pozná, je pozdě. |
| Důchodcovská hůl | 1 | 3 | 0 | 1 | 3 | Sukovitá hůl po dědečkovi, okovaná na špičce. Nese váhu starého muže i váhu přesvědčení. |

## Pozorování — zvládá AI obhajobu absurdit?

**Ano, kvalitativně velmi dobře — pokud věc do slotu vůbec dorazí.** Model
drží suchý úřední tón i u vyloženě groteskních rekvizit: kuřecí stehýnko
podávané jako úplatek, prasečí bičík vytrhávající papír z ruky, tulení
ocas jako útočná zbraň — všechno psáno vážně, bez vtipkování, přesně dle
rule 5/6. Nejlepší ukázka je uzel 1 (tři absurdní věci ve třech různých
rolích v jednom protokolu vedle klasické brokovnice) — kontrast funguje
a čtenář si okamžitě spojí věc s dějem.

**Kde to skřípe — dva systematické nálezy, oba nad rámec „je to vtipné":**

1. **Znakový strop 900 (rule 1) padl 8/8 (100 %).** Rozsah 957–1262 znaků,
   průměr ~1138 (+26 % nad stropem). Tohle NENÍ specifikum jen absurdních
   karet samo o sobě, ale absurdní ruka ho spolehlivě vyvolává: čtyři sloty
   vyžadující plný mandát rule 5 (žádná věc „sedí" samozřejmě k roli, každá
   potřebuje rozepsaný záměr) natáhnou text nad limit mnohem spolehlivěji
   než běžná ruka, kde 1–2 věci „sedí" a dostanou jen pár slov. Uzel 1 (tři
   absurdní věci ze čtyř) i uzel 2 (jedna absurdní, ale nejnesourodější
   role — „Kdyby se probudil" s tulením ocasem) patří k nejdelším. **Baterie
   `protokol-testy.yaml`, která v0.4.2 zapékala, tenhle režim (3–4 nesedící
   věci najednou) zjevně nekryje dost přísně** — je to reálný nález pro
   protocol-humor-testera, ne jen kuriozita tohoto testu.
2. **Hlavička (rule 1, „bez nadpisů, hlaviček") se vrátila 8/8.** Všech
   osm protokolů otevírá řádkem ve stylu „PROTOKOL Č. X/1930" nebo
   „Protokol č. X, [místo], [datum]" — a uzel 7 dokonce doslovným markdown
   `#`. V0.4.2 changelog referuje 13/13→2/13 na regresní baterii; tady je
   to zpátky na 8/8. Buď je to šum jednoho běhu (n=1 na case), nebo se
   „hlavička ve stylu policejního razítka" liší od „markdown nadpisu",
   který rule 1 zakazuje doslovně, a model tuhle mezeru systematicky
   využívá — v obou případech je to nález k doměření, ne k igno­rování.
3. **Rule 5 „nikdy nepiš PROČ" má trhliny přesně tam, kde věc očividně
   nesedí** — což je jádro tématu absurdních karet. Několik selhaných
   slotů dostalo vysvětlenou příčinu navíc k ději: „závora byla příliš
   těžká" (uzel 1, důchodcovská hůl), „jeho nervózní chování a vyhýbavé
   odpovědi jej prozradily" (uzel 6), „nástroj se ukázal nedostatečný"
   (uzel 7), „lampa byla příliš zašlá" (uzel 8). Mechanicky jde o skryté
   prahy, ale absurdní/nesedící věc model zjevně láká vysvětlit ČÍM SI
   TO ZDŮVODNIT — přesně ta libost, kterou rule 5 bod 2 zakazuje. Fungovalo
   to lépe tam, kde selhání dostalo jen holé „pokus… selhal" bez zdůvodnění
   (uzel 5, uzel 9).
4. **Sólo klauzule (rule 2, max 2× „podezřelý A")** drží nespolehlivě:
   uzel 4 ji dodržel učebnicově (2× „podezřelý A" + „jmenovaný" + „týž
   podezřelý"), uzel 1 a uzel 7 ji překročily (3× „podezřelý A"). Nesouvisí
   s absurditou karet, ale je vidět ve stejné dávce.
5. **Gamblovaná absurdní karta zmizí beze stopy** (uzel 5: Bramborová
   placka vyměněná pryč, ZÁCHRANA nezmíněna vůbec) — u komediálního obsahu
   je tahle ztráta citelnější než u běžné karty, protože gamble byl jediná
   šance věc do hry vůbec dostat.
6. **RNG artefakt, ne chyba:** Krevetka se v tomto konkrétním seedu do
   žádného slotu nedostala (zůstala v ruce). Se stejným seedem a jinou
   strategií/pronásledovatelem by pravděpodobně padla — nejde usuzovat na
   kvalitu karty z jednoho běhu.

**Celkový závěr:** model absurditu obhajuje řemeslně dobře na úrovni věty
(přesně řemeslo, které rule 5/6 chtějí), ale absurdní ruka je zároveň
efektivní **stresový test** na dvě křehčí místa promptu (délka, vymyšlená
příčina), která běžná regresní baterie zjevně nevzorkuje se stejnou
intenzitou. Doporučení pro protocol-humor-testera: přidat do
`protokol-testy.yaml` case s 3–4 záměrně nesedícími věcmi najednou
(ne jen 1–2, jak dělá dosavadní baterie) — přesně tenhle test to omylem
vyrobil a našel dvě reálné trhliny.

---

*Poznámka: plná data (structured `vstup` i `text` pro všech 8 uzlů, JSON)
vznikla ve scratchpad sandboxu mimo repozitář a nejsou commitnutá — tento
dokument je jejich kompletní shrnutí. Sandbox `obsah/` ani žádný soubor
pod `obsah/` nebo `prototyp/` v repozitáři nebyl změněn.*
