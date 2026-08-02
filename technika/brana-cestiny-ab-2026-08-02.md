# Brána češtiny — A/B přeměření po technických opravách (D55)

Vstupy: `prototyp/logs/brana-cestiny-2026-08-02-t05.md` (rameno **A**, t=0,5)
a `prototyp/logs/brana-cestiny-2026-08-02.md` (rameno **B**, t=1,0). Model
`claude-haiku-4-5-20251001`, prompt v0.4.1, 13 casů, **jedna generace na case**.
Navazuje na `brana-cestiny-vyhodnoceni-2026-08-02.md` (1. běh, NEPROŠLA 0/13).
Hodnotitel: protocol-humor-tester, 2026-08-02. Délky a cizí znaky měřeny strojově.

## VERDIKT RAMENE A: **NEPROŠLA** — 0/13, šest casů nese KRITICKÝ nález
## VERDIKT HYPOTÉZY TEPLOTY: **POTVRZENA — ale jen pro jazykovou vrstvu**

Teplota byla správný první krok a zabrala přesně tam, kde měla. **Neposunula ani
jeden z nálezů, které bránu blokují teď.** Obě vrstvy se tím čistě oddělily.

---

## 1 · Ověření oprav (bod 1 návrhů z 1. běhu)

**Useknutí ZMIZELO: 0/13 v obou ramenech.** Žádný výstup nekončí uprostřed slova;
dvě strojová `true` z detektoru jsou artefakty (poslední řádek je strojový souhrn,
resp. markdown `_` na konci závorky). `MAX_TOKENS` 400 → 800 stačí i pro nejdelší
výstup ramene B (1 229 zn. prózy). Kontrola `stop_reason === 'max_tokens'`
v `adapter.js` je na místě, ale **`sim/brana-cestiny.js` volá provider přímo,
adaptér obchází** — kdyby se výstup příště usekl, v logu se to zase pozná jen
z textu. Neblokující, ale zapsat.

Teplota se propisuje: hlavičky logů říkají 0,5 a 1, `--temperature=` funguje.

## 2 · Kvantifikace

| metrika | 1. běh (t=1,0, 400 tok.) | rameno B (t=1,0) | rameno A (t=0,5) |
|---|---|---|---|
| casů prošlo | 0/13 | **0/13** | **0/13** |
| casů s KRITICKÝM nálezem | 6/13 | 6/13 | **6/13** |
| obrácení slotu na opačný výsledek | 0/52 | 0/52 | **0/52** |
| **tvrdá jazyková vada** (nonword, cizí písmo, věta bez významu) | 13/13 | **13/13** | **2/13** |
| cizí písmo / cizí token | 4 (`импровизацe`, `Subsequently`, `ĺ`, `bedňa`) | 3 (`украшением`, `zvýšenéActivity`, `nequestionovala`) | **1** (`battering ram`) |
| medián délky prózy | neměřitelné (useknuto) | 956 zn. | **866 zn.** |
| maximum délky prózy | neměřitelné | 1 229 zn. | **956 zn.** |
| přes 5 vět | 13/13 | 11/13 | **13/13** |
| markdown hlavička / strojový blok | 13/13 | 13/13 | **13/13** |
| vymyšlená příčina selhání | 8/13 | ~9/13 | **8/13** |
| věc ze slotu zmizí nebo se zamění | 6/13 | ~10/13 | **5/13** |
| vymyšlená jména | 3/13 | 3/13 | **3/13** |

**Co teplota koupila:** tvrdá čeština 13/13 → 2/13 (jediné jisté selhání je
anglicismus `battering ram` v A9, druhé sporné `přestoj` v A13); cizí písmo z ramene
A zmizelo úplně; medián i maximum délky spadly o ~10, resp. 22 %. Při 13 vzorcích
je pokles 13/13 → 2/13 mimo rozsah šumu.

**Co teplota nekoupila (čísla se nehnula):** počet vět, formátový šum, vymyšlená
příčina, mizející věci, vymyšlená jména, počet KRITICKÝCH casů. Tyhle vady jsou
tvarem pravidla, ne tvarem vzorkování.

**Doporučení k teplotě: 0,5 ZAPÉCT a dál ji neměřit.** Níž nechoď — A5, A10 a A12
ukazují, že kreativní mandát na 0,5 pořád funguje (D53), a zbylé vady nemají
teplotní tvar. Rameno B je horší ve všech měřených osách; nemá důvod se k němu vracet.

---

## 3 · Per case, rameno A

`zn.` = próza bez hlaviček a strojových bloků / celý výstup. K = KRITICKÉ.

| # | case | zn. | vět | jádro rule 3 | verdikt | hlavní příčina |
|---|---|---|---|---|---|---|
| A1 | banan-utok-selhal | 887/977 | 6 | ✓ | **SELHAL K** | selhání banánu zamlčeno; jméno „Henry Cobb" |
| A2 | brokovnice-auto-fail | 902/1102 | 10 | ✓ | **SELHAL** | závorka přisuzuje vinu; strojový blok; 10 vět |
| A3 | hladky-pruchod-loot | 798/832 | 6 | ✓ | **SELHAL** | „statek Novotného v Lipovicích" — jméno + reálie |
| A4 | slozeni-lezi-v-aute | 654/800 | 7 | ✓ | **SELHAL** | vymyšlená příčina; věc „Slzy na povel" zmizela |
| A5 | fikce-veci-vs-mechanika | 906/986 | 6 | ✓ | **SELHAL** | refrén „čímž"; 906 zn.; jinak nejlepší výstup baterie |
| A6 | invence-selhany-slot | 683/1526 | 7 | ✓ | **SELHAL K** | **„zadržen"** (rule 4); přílepek „ROZVEDENÍ SLOTŮ" |
| A7 | solo-jedna-osoba | 887/1040 | 7 | ✓ | **SELHAL K** | zásah změkčen na **„částečně uspěla"**; „podezřelý A" 4× |
| A8 | zachrana-vec-k-nicemu | 793/875 | 8 | ✓ | **SELHAL K** | **složení zamlčeno**, místo něj vymyšlený postih |
| A9 | gap-proti-maximu | 866/933 | 7 | ✓ | **SELHAL** | `battering ram`; „řídící centrum"; 4/4 věcí zmizelo |
| A10 | bez-gapu-neslo-to-lepe | 892/1113 | 9 | ✓ | **SELHAL K** | strojový blok tvrdí **„Bedny: 4"** (náklad je 5) |
| A11 | past-vymysleny-dusledek | 810/1034 | 8 | ✓ | **SELHAL** | vymyšlená příčina 2×; strojový blok; **obě pasti drží** |
| A12 | invence-neopsat-text | 759/853 | 6 | ✓ | **SELHAL** | „nástrojová přiměřenost" = příčina; „náklad vykraden" |
| A13 | solo-strop-delky | **956**/993 | 8 | ✓ | **SELHAL K×2** | **popsán výstřel**; **ztráta bedny zamlčena** |

### Citace u KRITICKÝCH nálezů

**A1** — „měl v záloze banánový kanón, aby … zasáhl; **k takovému kroku však
nedošlo**." Slot „Kdyby začal vyvádět" SELHAL; protokol ho vypráví jako netestovaný.
Selhání není obráceno, ale je zamlčeno — hráč nemá jak poznat, že se pokus nepovedl.
Táž figura v A12 („avšak k incidentu nedošlo") a v B1.

**A6** — „byl na mostě u Poughkeepsie **zadržen** podezřelý A". Přesně třída, kvůli
které se rule 4 ve v0.4.1 rozšiřovala. V 1. běhu padla na case 4 („převezen
k dalšímu šetření"), tam teď drží — **třída se nevytratila, jen se přestěhovala.**
Rozšíření rule 4 na Haiku pořád nedrží.

**A7** — „tato improvizace **částečně uspěla** a zmátla výpravčího". „Zmást papírem"
je zásah. Změkčení zásahu je táž třída jako změkčení selhání.

**A8** — „podezřelý A utrpěl při následném zmatku **lehký otřes mozku**." Žádný postih
nepadl; padlo SLOŽENÍ (leží v autě), a to v protokolu **není vůbec**. Model vyměnil
zapsaný následek za vymyšlený. Hráč se nedozví, že mu vypadl člověk.

**A10** — strojový blok pod textem: „**Bedny:** 4". Náklad je 5. V próze je přitom
ztráta zapsána správně („Jedna bedna nákladu zůstala na mostě"). **Formátový šum
zde přímo vyrobil chybné číslo** — to je nejsilnější argument pro opravu 1a níže.

**A13** — „podezřelý A tasil skrytě nošenou brokovnici. **Zbraň vybuchla, střela
zasáhla jeho vlastní ruku**." Explicitně zakázaný výstřel (Žár roste z tasení).
A dál: „**Náklad byl částečně zajištěn**" — ztráta 1 bedny zamlčena a nahrazena
formulací, která zní jako zabavení nákladu úřady (vymyšlený důsledek).
Case je zároveň jediný, kde je závorka povinná: **závorka JE** ✓ — proti 1. běhu
zlepšení. Ale 956 zn. > 900 **a zároveň** vypadl následek: model neobětoval délku
za úplnost, ztratil obojí. **To je odpověď na otázku „prompt, nebo číslo": není to
těsný strop, je to neschopnost prioritizovat.** Se stropem nehýbat.

---

## 4 · Co se proti 1. běhu zlepšilo (a co se rozbilo)

**Zlepšení:**
- Useknutí 8/13 → 0/13.
- Aritmetika beden opravena (A6 „Jedna bedna … zbývajících pět" ✓; v 1. běhu
  „ze čtyř beden … zbývajících pět").
- A11: v 1. běhu **dva vymyšlené výstřely** při klesajícím Žáru → teď **žádný**,
  a bedna kanadské se neztratila ani nepředala. Nejkritičtější nový case obstál
  v obou svých pastech.
- A3: loot v 1. běhu obrácen („lampa ponechána v lokalitě") → teď správně.
- A4: rule 4 („odvedení k šetření") drží.
- A13: závorka vyšetřovatele se vrátila (nové pořadí škrtání v rule 8 + tokeny).
- Cyrilice z ramene A pryč.

**Regrese proti 1. běhu:**
- A13 popsal výstřel — v 1. běhu tento case výstřel neměl.
- A10 vyrobil chybné číslo beden ve strojovém bloku — v 1. běhu tento case chybné
  číslo neměl.

Nižší teplota tedy **není monotónní zlepšení**; sjednotila jazyk, ne dodržování pravidel.

---

## 5 · Co brána POTŘETÍ neměří (metodické výhrady, neopraveno)

1. **Vstup baterie je pořád psaný rukou.** `sim/brana-cestiny.js` bere `test.vstup`
   z YAML; produkce staví vstup přes `buildPromptInput()`. Baterie posílá
   `PRAVIDLO RUNU: hodnota se počítá jako 0 (agent Malone nebere úplatky)` a u šesti
   slotů `důvod: …`; produkce pošle holé „mělo hodnota 5". **Tři KRITICKÉ položky
   o penězích (A7, A8, A13) proto opět nejsou důkazem** — a rameno B dodalo
   protipříklad: B7 na témž vstupu napsal „**podezřelý nedisponuje finančními
   prostředky**". Ta pojistka je křehčí, než jak vypadá v ramenu A.
2. **Kredity: baterie žádá chování, které prompt neukládá.** A3, A5, A12 vyžadují
   zápis kreditů; rule 7 kredity ve výčtu následků nemá. 3/13 položek je šum,
   dokud se to nesrovná (§1 zákona falzifikovatelnosti). Nezapočítal jsem je.
3. **`popis` casu `solo-jedna-osoba-ctyri-sloty` si odporuje s jeho `vstup`em** —
   popis tvrdí „brokovnice ve viditelné roli u NPC = auto-fail", vstup říká
   `Zatlačit hrubě: zásah (… důvod: slotová výjimka)`. Dokumentační vada mojí
   baterie; svede příštího hodnotitele.
4. **Mrtvá vstupní pole — potvrzeno podruhé, teď už průkazně.**
   `ZÁCHRANA` zmíněna **0 ze 3** casů ramene A, kde padla (A8, A10, A13) a 0 ze 3
   v ramenu B; napříč oběma běhy **0 ze 7**. `MAX DOSAŽITELNÉ` gap zaznamenán
   **0 ze 4** v ramenu A, napříč běhy **0 z 8**. Obě pole platíme v každém volání
   a oracle je počítá.

---

## 6 · Seřazené návrhy (prompt NEEDITOVÁN)

**Nula: opravit baterii dřív, než se hne promptem** (mé, levné, blokuje měření)
- kredity → buď do výčtu v rule 7, nebo tři položky z baterie ven;
- `vstup` generovat z `buildPromptInput()`;
- srovnat `popis` × `vstup` u `solo-jedna-osoba-ctyri-sloty`.

**Jedna: prompt v0.4.2 — pět zásahů, čtyři z nich navržené už po 1. běhu
a neaplikované.** Všechny jsou na straně vstupu (cachuje se), cenu volání nemění;
konzultaci s operations-economics to proto nevyžaduje — strop 900 se nedotýká.

| # | pravidlo | zásah | cílí na |
|---|---|---|---|
| a | rule 1 | + „Piš souvislou prózu bez nadpisů, hlaviček, rubrik a odrážek; nikdy nevypisuj rubriky vstupu ani souhrn následků na konci." | 13/13 hlavička, 5/13 strojový blok, **A10 KRITICKÉ** |
| b | rule 5 | zákaz příčiny vytáhnout na samostatnou závěrečnou větu: „Nikdy nepiš, PROČ se pokus zdařil nebo nezdařil." | 8/13 |
| c | rule 5 | + „Věc ze slotu vždy pojmenuj jejím názvem ze vstupu." | 5/13 |
| d | rule 2 | zobecnit ze „podezřelých" na všechny osoby I MÍSTA: „Žádnou osobu ani obec nepojmenovávej vlastním jménem." | 3/13 + „Lipovice" |
| e | rule 1 | **vypustit „3–5 vět"**, ponechat jen strop 900 znaků | 39 generací ve třech během, **0× dodrženo** |

K (e): počet vět je mrtvé pravidlo — Haiku ho neumí počítat a nedodrželo ho ani
jednou při 400, 800 tokenech, teplotě 1,0 i 0,5. Drží ho jen znakový strop.
Ponechání dělá baterii nefalzifikovatelnou (13/13 „selže" na položce, která
nikdy neprojde). **Riziko: bez věty o větách může délka narůst** — proto (e)
zapékat až po přeměření, ne naslepo.

**Zvažoval jsem a NEnavrhuji** lexikální zákaz obratů typu „částečně" /
„k tomu nedošlo" (A1, A7, A12). Přeširoký zákaz je past doložená ve v0.4 třikrát.
Místo něj **pozitivní požadavek do rule 3**: „U každého ze čtyř slotů musí být
z textu jednoznačně poznat, zda prošel, nebo selhal." Kryje obě změkčení a je to
zároveň požadavek metriky 6 (čitelnost) lidské brány.

**Dvě: eskalace na jiný model — ZATÍM NE.**
Rameno A doložilo, že Haiku 4.5 na 0,5 **umí** použitelnou češtinu (A5 je suchý,
dobový, jádro rule 3 vzorové, závorka sedí). Co teď padá, je dodržování pravidel,
a to jsme se ještě nepokusili koupit pěti větami, které leží navržené od 1. běhu.
Eskalovat teď by znamenalo platit modelem za práci, kterou neudělal prompt.
**Stop podmínka: pokud po v0.4.2 nespadne formátový šum a vymyšlená příčina pod
~2/13, je to strop schopnosti modelu** a eskalace (Haiku → Sonnet jen na volání
protokolu, nebo dvouprůchodové generování) se stává správným krokem — a tehdy je
to rozhodnutí operations-economics, ne moje.

**Tři: příští běh měřit na 3 generacích na case, ne na jedné.** Rozdíl mezi A a B
na jazyce je při n=1 průkazný (13/13 → 2/13), rozdíl v počtu KRITICKÝCH casů (6 vs 6)
není. Bez opakování se nedá odlišit oprava od losu.

## 7 · Pro designéra / PM (není moje rozhodnutí)

1. **`ZÁCHRANA` a `MAX DOSAŽITELNÉ` jsou po dvou bězích 0/7 a 0/8.** Buď dostanou
   v promptu vlastní krátkou větu, nebo ať se z formátu vstupu vypustí — dnes je
   platíme v každém volání a neplyne z nich nic. Rozhodnutí patří designu (jsou to
   nejdramatičtější beaty uzlu), přeměření mně.
2. **Rule 4 (zadržení / odvedení) nedrží na Haiku ani po rozšíření ve v0.4.1**
   (1. běh case 4, teď A6). Je to kandidát na vlastní krátké pravidlo, ne na větu
   uvnitř nejdelšího odstavce. Rozšiřovat výčtem dál nemá smysl — „zadržen"
   ve výčtu **je**, a model ho stejně napsal.
3. **Otevřená otázka z changelogu v0.4.1 (újma na NPC) zůstává otevřená** a A11
   ukazuje, proč na ní záleží: prošlý útočný slot v konfrontaci má bez výstřelu,
   hluku, zraněného i zadrženého skoro nulový materiál pro rule 5.
