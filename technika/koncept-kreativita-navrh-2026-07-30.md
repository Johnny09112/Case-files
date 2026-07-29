# Kde bydlí kreativita — konceptový návrh

*Návrh `game-designera` z 2026-07-30 podle mandátu z triáže nejvážnějšího nálezu
projektu ([[../playtesty/2026-07-29|playtesty/2026-07-29.md]], sekce „Druhý
pokus"). **Stav: návrh, ne implementace.** `obsah/`, `prompty/` ani `prototyp/`
tímto kolem nikdo needitoval. Adversariální prověrka `design-critica` je v §8,
odpovědi designéra v §9.*

**Mantinely, které návrh drží:** mechanika rozhoduje · žádný volný text hráčů do
AI · hra nečeká na síť · viditelná pravidla · engine, slotová resoluce a
kalibrace se nezahazují (čísla se v tomto návrhu nemění; kde se jich návrh
dotýká, je to označená hypotéza k proměření).

---

## 1. Diagnóza: hra doručila nevyhnutelnost bez komedie

Hráčův nález není „mechanika je špatná" a není to ani vkusová stížnost. Je to
**nedoručený slib, který stojí černé na bílém ve dvou kanonických dokumentech.**

| Kde | Co dokument slibuje |
|---|---|
| `design-dokument.md` §4.1 | „Věc je dobrá v něčem a mizerná jinde (zlaté hodinky = vysoká hodnota, nulový útok) — **to vyrábí volbu a komedii**." |
| `design-dokument.md` §4.3 | „u některého slotu se špatné volbě občas nevyhneš, a to je záměr — **komedie nevyhnutelně špatné volby**." |
| `prompty/protokol.md` rule 4 | „Nevhodně zvolená věc v roli je **ZLATO protokolu**, ne chyba k zamlčení." |

Prototyp doručil **nevyhnutelnost** (K5 měří, že mrtvých rozhodnutí je pod 10 %,
tedy špatná volba je běžná a vynucená) a **nedoručil komedii**. Nikoli proto, že
by na ni někdo zapomněl, ale protože ji tři nezávislá rozhodnutí systematicky
vytlačila z každého místa, kde mohla vzniknout:

**(a) Sloty jsou pojmenované jako fyzické úkony, ne jako nároky.** „Zvednout
závoru", „Zpevnit prkna", „Doložit razítko", „Vypáčit vagon". Takto pojmenovaná
role **předepisuje třídu předmětu**. Jakákoli jiná věc v ní není odvážná volba,
je to gramatická chyba. „Petrolejovou lampou neopravíš auto" je přesná diagnóza:
role nedovolila obhajobu, tak zbyla pitomost. Kvantifikace v §3.

**(b) Doplnění mezer v `text` je mechanické zřetězení role × věc.** Fáze 2.2
(D46) udělala z prózy situace hlavní prvek — správně — ale mezera se plní
názvem věci v 1. pádě do autorské vazby: *„{kdo} zvedal závoru {VEC}"* →
**„Kowalski zvedal závoru „Petrolejovou lampou"."** To je věta, kterou hráč
vidí jako výsledek svého rozhodnutí. Je to zápis, ne vyprávění, a je to
**první text, který o volbě mluví** — dřív než protokol.

**(c) Fallback protokoly o použití věci mlčet MUSÍ — ale ne kvůli pravidlu,
kvůli chybějícímu placeholderu.** *(Znění opraveno po prověrce, nález K-4 —
původní verze tvrdila, že vinu nese pravidlo N6. Nenese, a skutečná příčina je
tvrdší.)* `src/ui/protocol-fill.js` má jediný, **plochý** placeholder `{veci}`
(`seznamVeci()`), výběr šablony je `(pásmo × postih × bedna)` a na odstavec je
jedna šablona. **Statická šablona nezná identitu věci v konkrétním slotu**,
takže věta „hodinky se zaklínily do pantu" v ní vzniknout nemůže, ať je kvóta
jakákoli. Pravidlo N6 (D40) k tomu jen přidává kvótu na `{veci}` — a mimochodem
k hodnocení věcí přímo vybízí („ať je vyšetřovatel **HODNOTÍ**, ne vyjmenovává").

Podstata nálezu tím ale zůstává: **sezení 2026-07-29 se hrálo v režimu, který
o použití věcí mluvit technicky neumí.** Vrstva, kde měla bydlet
představivost, tam nebyla ani ve formě, ve které by mohla selhat.

### 1.2 Nález nad rámec mandátu: prahy jsou při rozdělování vidět

*Vzniklo při ověřování rizika B-1 v prověrce. Není to součást zadaných čtyř
otázek a nesmí se v nich utopit.*

`assign.js:242` vykresluje u každého slotu `práh ${s.prah}` — a `s.prah` je dle
`resolve.js:67` **finální práh po zašumění** (`kotva + offset + bump + šum`,
clamp do [0, statMax]), ne kotva. Na obrazovce rozdělování tedy hráč vidí
**pravdivé číslo, které o zásahu rozhodne**, plus staty všech svých karet.

Proti tomu kanón na dvou místech tvrdí opak:
`design-dokument.md` §4.5 („skrytým prahem, **odhaleným až po vyhodnocení**")
a §10 („prahy jsou před commitem skryté … ale **po vyhodnocení** se vždy
ukážou") · `prototyp-mvp.md` („Práh **skrytý před**, **odhalený po**
vyhodnocení").

**Proč to může být větší věc než všechny čtyři otázky mandátu:** design označuje
rozdělování za jádro hry („jádro hry není »vyber nejlepší«, ale **»rozděl to, co
máš, co nejméně špatně«**", §4.3) a za zdroj hádky u stolu (metrika 1). Se čtyřmi
kartami, čtyřmi sloty, viditelnými staty **a viditelnými prahy** je optimální
rozdělení **spočitatelné na papíře**. Nezůstává riziko, nezůstává „co si myslíš,
že to chce" — zůstává aritmetika a spor o to, **komu se ztráta připíše**.
To je pořád spor (vlastnictví postavy má váhu), ale je distribuční, ne tvůrčí.

Je to plausibilní, dosud nepojmenovaná a **mechanická** příčina nálezu „všechno,
jen ne zábava" — a jediná v tomto kole, kterou nespraví žádný text. Tři věci
k tomu, poctivě:

1. **Není to tichá odchylka.** §13.1 telegrafního návrhu tento stav popisuje
   („rozpis rolí s plnými jmény statů, prahem a viditelností, plus anotace kotvy
   a šumu") a staví na něm smyčku učení. Prošlo to review fáze 2.1/2.2. Nikdo ale
   nikde nezvážil, **co to udělá s rozhodnutím**, a kanón se neopravil.
2. **Netvrdím, že se to má vrátit.** Bez viditelných prahů padá čitelnost
   (metrika 6), na které první sezení havarovalo poprvé. Existuje střední cesta
   (ukázat **kotvu a rozsah šumu**, tedy „práh je 2–5", a přesné číslo teprve
   po vyhodnocení) — ale je to změna mechaniky, ne textu, a **nepatří do tohoto
   návrhu**. Patří do vlastního kola.
3. **Má to měřitelný důsledek pro bránu, který nikdo nezná.** Pokud botí
   `kompetentní` přiřazení prahy **neví** a odhaduje, má člověk u stolu **víc
   informace než kalibrovaný bot** — a týmové K1 (dnes 77,5 / 79,7 % proti stropu
   70) je pak podhodnocené, ne nadhodnocené. Pokud je bot prahy zná, je kalibrace
   v pořádku a je to čistě designová otázka. **Tohle je jedna otázka pro
   `playtest-facilitatora` a je levná.**

**Zpět k diagnóze (a)–(c) — kontext testovaného vzorku** (nezmenšuje nález, ale
určuje jeho rozsah): matice zážitku má čtyři buňky — {sólo, stůl} × {fallback,
AI}. Otestovala se **{sólo, fallback}**, tedy buňka, ve které nefunguje ani jeden
z obou motorů vyprávění: AI vrstva nestojí a u stolu nikdo nesedí. To není
omluva — sólo je dle designu plnohodnotný režim a fallback je dle hlavičky sady
„PRIMÁRNÍ text, ne nouzovka". Je to ale důvod, proč návrh staví **podlahu bez AI
zvlášť** (§3, §4) a **strop s AI zvlášť** (§2).

**Co diagnóza NEobsahuje:** ani jedna ze tří příčin (a)–(c) neukazuje na
slotovou resoluci, prahy, pásma, Žár ani kalibraci — všechny tři leží ve vrstvě
textu a mandátu vypravěče, a proto se v návrzích §2–§5 nemění jediné číslo.
Nález §1.2 je jiná kategorie: **je mechanický, je mimo mandát a řeší se zvlášť.**

### 1.1 Benchmark: kdo tenhle problém řeší a jak

| Hra | Mechanismus | Co si z toho bereme |
|---|---|---|
| **Funemployed** (Mattel) | Hráč drží **4 absurdní kvalifikační karty** a musí u pohovoru **jednu po druhé obhájit**, proč ho kvalifikují na danou práci. Vyhrává, kdo zaměstnavatele nejlíp přesvědčí. | Struktura je **totožná s naším uzlem** (4 karty do 4 rolí), jen resoluce je lidský soudce. Pointa: **obhajoba je povinná a nahlas.** U nás nesmí rozhodovat (soudce = AI = zakázáno), ale **může být vyžádána** (§2.4). |
| **Wildermyth** | Procedurální vyprávění bez AI: vývojáři **ručně píšou tutéž větu ve variantách pro každý typ osobnosti**; fragmenty se vybírají podle vlastností a historie postav. | Model pro **bohatší fallback**: rozlišení nedělá délka sady, ale **klíčování fragmentů na páry** (u nás: stat × sourodost volby), nikoli na pásmo. |
| **Blades in the Dark** | Hráč deklaruje *přístup* („jak to udělám"), GM z fikce určí *position & effect*; kostka pak řeší jen míru úspěchu. Fikce nikdy neurčuje výsledek, ale určuje **rám**. | Přesná analogie našeho axiomu: **fikce dodává JAK, mechanika ZDA.** Potvrzuje, že hypotéza PM je hratelná, ne jen filozoficky pohodlná. |
| **Dungeon World** (PbtA) | GM move **„ask questions and use the answers"** — GM se ptá hráče „jak to vypadá?" a odpověď kanonizuje. | Zdroj rituálu v §2.4. GM v DnD, na kterého se hráč odvolává, **nevymýšlí za hráče — hráči povoluje.** To je jádro celého návrhu. |

Poslední řádek je nejdůležitější věta téhle diagnózy. Hráč napsal, že by GM
vymyslel lepší výsledek než „petrolejovou lampou neopravíš auto". Ale to, co GM
u stolu skutečně dělá, není hlavně vymýšlení — je to **udělení licence**. Řekne
„dobře, jak to děláš?" a pak to *nechá platit*. Kreativita, která hráči chybí,
je **z velké části jeho vlastní**, jen mu ji hra dnes nedovolí uplatnit, protože
role je pojmenovaná jako úkon, který lampou provést nelze.

Z toho plyne architektura návrhu — **tři vrstvy, kde bydlí kreativita**:

| Vrstva | Kdo tvoří | Funguje bez sítě? | Řeší otázku |
|---|---|---|---|
| **V0 — licence** | hráč u stolu / hráč sám pro sebe | ano | Q2 (sloty), Q3 (věci) |
| **V1 — podlaha** | autorský obsah (`text`, fallbacky) | ano | Q1 (fallback), Q3 |
| **V2 — strop** | AI protokol | ne (→ V1) | Q1 (mandát) |

**Bezpodmínečné jsou V0 a V1.** V2 je podmíněná nálezem WoZ testu
(`technika/woz-test-2026-07-30.md` — k dnešnímu dni v repu neexistuje; návrh na
něj nečeká a nepředjímá jeho výsledek). Pořadí je záměrné: kdyby WoZ dopadl
špatně, V0+V1 stojí samy. Kdyby se dělalo jen V2, projekt vsadí zábavnost na
vrstvu, která ještě nikdy nestála.

---

## 2. Q1 — Mandát AI vrstvy

### 2.1 Co: kontrakt „JAK a PROČ ano, ZDA a KOLIK ne"

Pracovní hypotéza PM se **přijímá a zpřesňuje**. Zpřesnění je nutné, protože
„AI vymyslí JAK" se dá přečíst i jako „AI dovypráví děj", a to už by byla
rozhodovací pravomoc (dovyprávěný děj tvoří fakta, na která se pak hráč odvolává).

**Rozhraní mandátu — tvrdá tabulka do promptu:**

| Otázka | Kdo odpovídá | Poznámka |
|---|---|---|
| **ZDA** slot prošel | mechanika | stat vs. práh; nezměnitelné (dnešní rule 3) |
| **KOLIK** — pásmo, kredity, Žár, bedny | mechanika | nezměnitelné |
| **CO** za postih a **KOMU** | mechanika | AI dostává hotové |
| **JAK** byla věc použita | **AI** | nové: povinná invence u označených slotů |
| **PROČ** to posádka zkusila | **AI** | nové: motiv, výmluva, logika, která to obhájí |
| **JAK TO POLDA POCHOPIL** | **AI** | nové: rám nespolehlivého vypravěče |

**Nosná myšlenka, která celý rozpor rozpouští:** protokol nepíše svědek. Píše ho
**zkorumpovaný, unavený polda, který tam nebyl** a spis dopisuje podle výslechu
a vlastního dojmu. Tím AI nezískává autoritu nad světem — získává **licenci
vymýšlet interpretaci**. Mechanika drží fakta (co prošlo, co padlo, co to
stálo), AI drží **kauzální historku, a smí se v ní mýlit**. Nespolehlivý
vypravěč je jediný typ vypravěče, kterému lze dát invenci bez porušení axiomu.

Vedlejší zisk: rozpouští to i konflikt s rituálem u stolu (§2.4). Když hráč
nahlas řekne „lampou jsem mu signalizoval, že jsme od vodáren" a protokol napíše
něco úplně jiného, **není to chyba — je to pointa** („vyšetřovatel rekonstruoval
průběh takto"). Tenhle rozpor je kandidát na nejsilnější zdroj metriky 5
(převyprávěné momenty) v celé hře.

### 2.2 Co: mechanika musí AI říct, KDE má vymýšlet

Nesmí si to vybrat AI (to by bylo rozhodování o důležitosti). Musí to být
**derivovaný, viditelný signál**, přesně jako `deriveTelegrafSignal`:

```
stat_slotu(slot)  := Array.isArray(slot.stat) ? min přes oba staty : slot.stat
                     # KOMBI slot má `stat` jako POLE (resolve.js:50) — bez tohohle
                     # řádku by indexace vrátila undefined a oba KOMBI sloty sady
                     # („Zaklínit vrata", „Zpevnit prkna") by se nikdy neoznačily.
                     # Přitom jsou obsahově nejkomičtější: chtějí dva staty na
                     # jedné věci. (Nález V-9 prověrky.)
nesourodá volba   := stat_slotu(slot) <= 1
                     („v téhle roli je ta věc k ničemu")
groteskní volba   := nesourodá  AND  max(karta.staty) >= 4
                     („a přitom je v něčem jiném špičková" — zlaté hodinky
                      v nástroj-slotu, brokovnice v hodnota-slotu)
```

Obě jsou čistou funkcí dat, která už v enginu jsou, jsou deterministické a jdou
zobrazit hráči (axiom viditelných pravidel). Do promptu jdou jako jeden řádek:

```
NESOURODÉ: slot 3 („Dostat vůz za závoru" ← „Zlaté hodinky", nástroj 1) — GROTESKNÍ (hodnota 5)
```

A prompt dostane **ukazatel a zákaz**. *(Opraveno po prověrce, nález K-1:
původní verze tvrdila, že dnešní rule 4 je permisivní. Není — zní „**Rozehraj**
ten kontrast úředně a vážně", tedy rozkazovacím způsobem, a vzorový dobrý výstup
v `prompty/protokol.md` přesně tohle dělá. Skutečná delta je jiná a menší:
rule 4 **nemá ukazatel**, který slot je nesourodý, **nemá zákaz** konstrukce
„role pomocí věc" — a hlavně **nikdy neběžela**, protože AI vrstva nestojí.
Z toho plyne tvrdá podmínka: WoZ test musí mít **kontrolní rameno
s neupraveným promptem v0.3**, jinak se přírůstek nedá přiřknout mandátu
místo modelu a projekt zaplatí za změnu, kterou možná nepotřebuje.)*

> U každého slotu označeného jako NESOURODÝ **musíš** uvést, **jak** ta věc
> posloužila nebo se pokusila posloužit — konkrétním, fyzicky představitelným
> způsobem. Nikdy nepiš jen „<role> pomocí <věc>". U GROTESKNÍ volby navíc
> pojmenuj kontrast mezi tím, k čemu ta věc je, a tím, k čemu byla použita.
> Výsledek slotu se tím **nemění**: prošel-li, vymysli, proč to k překvapení
> všech vyšlo; padl-li, vymysli, proč to znělo rozumně a přesto ne.

Zakázaná konstrukce **„<role> pomocí <věc>"** je jádro věci — je to přesně ta
věta, kterou dnes vyrábí mechanické plnění mezer, a bez zákazu ji model
zopakuje.

**Ukázka celého návrhu na třech řádcích** (slot „Zvednout závoru", nástroj,
kotva 3 ← „Zlaté hodinky", nástroj 1, výsledek: selhání):

- **Dnes (`text` fill):** „Kowalski zvedal závoru „Zlatými hodinkami"."
- **Po Q2 (přeznačená role):** „Kowalski se pustil do závory se „Zlatými hodinkami"."
- **Po Q1 (AI protokol):** „Podezřelý C se pokusil o závoru přesvědčit zlatými
  kapesními hodinkami; dle výpovědi je zaklínil do pantu a použil jako páku.
  Panty vydržely, hodinky ne. (Ke škodě na hodinkách vyšetřovatel poznamenává,
  že o ně bylo lépe postaráno než o most.)"

Třetí řádek je to, co hráč čekal od GM. Nevznikl tím, že by AI něco rozhodla —
vznikl tím, že dostala **hotový výsledek plus mandát ho odůvodnit**.

### 2.3 Co: „jak to bylo" (`text` situace) — sahat na něj JEN autorsky

**Návrh: `text` zůstane 100 % mechanický a autorský. Do AI nejde.** Důvody:

1. `design-dokument.md` §8 to zakazuje explicitně („Autorská vrstva (ne AI):
   telegraf a text situace s mezerami jsou psané ručně").
2. Bylo by to **druhé volání na uzel** → dvojnásobek nákladů a druhé místo,
   kde hra může čekat na síť. Změna počtu volání je věc `operations-economics`
   a tento návrh ji nenavrhuje.
3. Není potřeba. `text` má být **scéna, ne vyprávění**. Jeho úkolem je nést
   rozhodnutí (mezery, které hráč plní) a být čitelný. Vyprávění „jak" má jedno
   správné místo, a to je protokol, protože jen tam existuje fallback cesta.

Co se s `text` **udělat musí**: jeho vazby dnes předepisují úkon (§1b), a to je
totéž selhání jako u rolí. Klauzule, které to dělají, jsou **tytéž větné členy,
kterých se týká přeznačení rolí v §3** → je to jeden obsahový průchod, ne dva.
Vazba „<úkon> {VEC}" se mění na „<nárok>, a měl na to {VEC}" / „<nárok> — {VEC}".
Formulace zůstává autorská; jen přestane tvrdit, že se hodinkami zvedá závora.

### 2.4 Co: rituál „a jak to uděláš?" (vrstva V0, nulový kód v enginu)

**Na obrazovce ODHALENÍ VÝSLEDKU** (ne přiřazení — opraveno po prověrce, nález
V-7), u **jednoho** slotu za uzel (toho označeného jako nesourodý; je-li jich
víc, vezme se groteskní, pak první v pořadí), se objeví řádek pro **vlastníka
karty**:

> **„A jak to podle tebe proběhlo?"** — řekni to nahlas. Nikam se to nepíše.

Původní umístění na obrazovku přiřazení bylo špatné: tam je vidět **práh**
(§1.2), takže by hráč obhajoval volbu, o níž **už ví, že propadne** — a mechanika
by ho vzápětí bez komentáře vyvrátila. Po vyhodnocení je rozpor s výsledkem
**fakt, ne předpověď**, a protokol ho může přebít jako pointu (rám nespolehlivého
vypravěče, §2.1). Pořadí u stolu je tedy: výsledek → hráčova verze nahlas →
protokol se svou verzí.

Přesně GM move z Dungeon World a přesně pitch z Funemployed, jen bez soudce.
**Nic nerozhoduje**, nic se nezaznamenává, žádný text hráče nikam neputuje
(axiom o prompt injection je bezpečný z konstrukce — pole neexistuje).
Řeší to vlastnictví postavy (§4.12: mluví vlastník, ne quarterback), krmí to
metriku 1 (hádka/rada) i 5 (převyprávění) a stojí to jeden `<div>`.

**Přiznaná mez:** v sólu je to monolog do prázdné místnosti a **hráč-autor
hraje sólo.** V0 tedy jeho konkrétní sezení nespraví; sólo se opírá o V1 a V2.
Nezastírat to.

### 2.5 Proč

- Vrací představivost tam, kde ji hráč hledal (**vypravěč**), a přitom LLM
  nedostává ani gram rozhodovací pravomoci — dostává **povinnost odůvodnit
  hotový výsledek**.
- Je to **nejmenší možná změna**: rule 4 v `prompty/protokol.md` z povolení na
  povinnost + jeden derivovaný řádek ve vstupu. Prompt už dnes zná banán jako
  příklad; chybí mu příkaz a ukazatel.
- Rozpouští rozpor „AI vypráví" vs. „AI nesmí tvořit fakta" **rámcem nespolehlivého
  vypravěče**, nikoli výjimkou z axiomu.
- Nemění počet ani velikost volání: **1 volání na uzel** zůstává, výstup zůstává
  3–5 vět, vstup roste o ~1 řádek (~60–100 tokenů). Příznaky jsou deterministickou
  funkcí vstupů, které v cache klíči **už jsou** (rozdělení karet do slotů), takže
  **cache-hit rate se neředí** — nevzniká nová dimenze klíče.

### 2.6 Co to stojí

| Položka | Kdo | Rozsah |
|---|---|---|
| Rule 4 z povolení na povinnost + rám nespolehlivého vypravěče + zákaz „<role> pomocí <věc>" | `protocol-humor-tester` (návrh) → uživatel (schválení) | ~15 řádků promptu + changelog v0.4 |
| Derivace `nesourodá` / `groteskní` + řádek do vstupu promptu + zobrazení hráči | `technical-developer` | malá, čistá funkce vedle `deriveTelegrafSignal`; testovatelná |
| **Fragmentová vrstva fallbacků** — per-slot placeholder, výběr nesourodého slotu, nová pole ve schématu (viz §2.7) | `technical-developer` + `prototyp/` | **doplněno po prověrce (K-4)**; dotýká se `protocol-fill.js` a hlavičky sady s pravidly N1–N5 → testy povinně |
| 20–30 fragmentů „obhajoba" na `(stat × výsledek)` | `content-generator` + `protocol-humor-tester` | 2–3 varianty na přihrádku, ne 12–16 celkem |
| Rituál „a jak to uděláš?" | `prototyp/` | jeden řádek UI + pravidlo výběru slotu |

### 2.7 Fallback: je „AI = lepší zážitek" přijatelné?

**Odpověď: ano, ale ne v dnešní podobě — protože dnešní fallback není „AI mínus
šťáva", on je „AI mínus celý produkt".** Axiom říká, že hra nikdy nečeká na síť.
Nikdy neslíbil, že fallback je rovnocenný. Přijatelný rozdíl má ale podlahu, a ta
dnes chybí — a **nechybí kvůli pravidlu, ale kvůli chybějícímu placeholderu**
(§1c, opraveno po prověrce K-4). Zrušení kvóty N6 samo o sobě nevyrobí ani jednu
novou větu o hodinkách.

Návrh podlahy — **Wildermyth model, správně přečtený: mnoho variant na klíč, ne
mnoho klíčů** (opraveno po prověrce; původní verze si vzala opačnou polovinu):

1. **Kódová vrstva, a je nutná** (§2.6 ji původně neobjednal — chyba):
   per-slot placeholdery `{vec_obhajoba}` / `{role_obhajoba}` vedle dnešního
   plochého `{veci}`, výběr nesourodého slotu, fragmentová vrstva
   v `protocol-fill.js` a nová pole ve schématu `fallback-sablony.yaml`
   (hlavička: „nová pole nepřidávat bez úpravy tohoto komentáře"). Bez toho je
   podlaha nedoručitelná deklarovaným mechanismem, ne jen tenká.
2. **20–30 fragmentů = 2–3 varianty na `(stat × zásah/selhání)`.** Deset
   přihrádek × 1–2 varianty (původní návrh 12–16) by dalo nejčastější komické
   události hry — propadlému nástroj-slotu — **jednu nebo dvě věty na celou
   hru**, kdežto dnešní pásmová sada má v jednom pásmu 17 variant. To je táž
   únava, kterou §2.7 vytýká pásmovým šablonám.
   **Fragment musí být podmíněný existencí nesourodého slotu s kartou** —
   pravidlo N2 sady zakazuje připisovat vinu „kusu", protože propadlý slot
   nemusí mít kartu (`duvod: 'neobsazeno'`).
3. **Přiznaná figura poldovy neznalosti** jako poslední záchrana, ale s tvrdým
   limitem výskytu (max 1× za run), protože „průběh nelze rekonstruovat" je vtip
   na jedno použití.
4. **Podlaha nesmí být měřena vkusem.** Kritérium: hráč po uzlu **umí říct, co
   ta věc v té roli dělala.** To se dá zjistit stejným způsobem jako čitelnost
   (metrika 6), ne hlasováním o vtipnosti.

Sekvence, na které trvám: **V0 + V1 se dělají bez ohledu na výsledek WoZ testu.**
Kdyby se pořadí obrátilo, projekt by podruhé vsadil zábavnost na nejnejistější
vrstvu — a tentokrát vědomě.

### 2.8 Co to riskuje

| # | Riziko | Vážnost |
|---|---|---|
| **A-1** | **AI si invencí propašuje fakta** („a přitom jim vypadla bedna"). Dnešní rule 3 to zakazuje, ale povinnost vymýšlet ten tlak zvyšuje. | Vysoká. Mitigace: rule 3 dostane výslovný dodatek „invence se týká VÝHRADNĚ způsobu a motivu; jakýkoli nový následek je porušení" + regresní baterie `prompty/protokol-testy.yaml` dostane case s nesourodým slotem, kde se kontroluje, že se nepřidal následek. |
| **A-2** | **Protokol utratí 3–5 vět na obhajoby a nezbude na verdikt.** Rule 6 už dnes žádá postihy + složení + Žár s důvodem + bedny, a k tomu je otevřený nález, že první věta jde na rekapitulaci telegrafu (backlog, D48). | Vysoká. **Upřesněno po prověrce (V-6): 1 obhajoba povinná, druhá jen v uzlu, kde nepadl žádný postih** (tedy tam, kde rule 6 nemá co hlásit) — podmínka je mechanická, ne vkusová. Navíc do promptu **explicitní „scénu neopakuj, začni tím, co udělali podezřelí"**, čímž se týmž řádkem zavírá i backlog nález D48. Rozpočet se tedy nefinancuje dluhem: obhajoba obsazuje větu, která dnes jde na rekapitulaci. |
| **A-3** | **Nespolehlivý vypravěč sežere čitelnost** (metrika 6) — hráč nepozná, jestli je „hodinky vydržely" fakt, nebo poldova domněnka. | Střední. Mitigace: fakta (zásah/selhání, práh) drží vysvětlující vrstva, která je vedle a je strojová. Protokol se od ní **smí** lišit tónem, nikdy čísly. Kdyby to u stolu skřípalo, je to nález o vrstvě, ne o mandátu. |
| **A-4** | **Rozpor mezi obhajobou hráče (§2.4) a protokolem** hráče naštve, místo aby ho pobavil. | Nízká–střední. Nezjistitelné jinak než u stolu; je to jedna z otázek §7. |
| **A-5** | **Sólo režim zůstane slabý i po opravě**, protože V0 v sólu nefunguje a V1 je textová. | Střední, a týká se to přímo hráče-autora. Mitigace: v sólu má rituál smysl obrátit — nabídnout hráči, aby si obhajobu **přečetl** v protokolu jako odpověď na svou volbu (tedy AI/V1 nesou celou váhu). |

---

## 3. Q2 — Slot-literalismus: klasifikace a princip přepisu

### 3.1 Klasifikace všech 76 slotů (19 situací × 4)

Kritérium: **předepisuje název role třídu předmětu?**

- **O — obhajitelná:** role jmenuje *cíl nebo tlak*; obhájit ji lze čímkoli
  („Zamluvit to", „Ustát nápor", „Kdyby přituhlo", „Něco navíc").
- **P — polodoslovná:** role jmenuje *třídu předmětu*, ale obhajoba jinou věcí
  je legální a často vtipná („Peníze na stůl", „Silniční poplatek").
- **D — doslovná:** role jmenuje *fyzický úkon na konkrétním předmětu scény*;
  jiná věc než z předepsané třídy = pitomost, ne volba („Zvednout závoru",
  „Doložit razítko", „Vypáčit vagon").

**Výsledek: O 52 · P 7 · D 17.** *(Opraveno po prověrce, nález K-3 — první verze
uváděla O 50 / P 8 / D 18 a měla tři chybné řádky ve statech. Kritik přepočítal
nezávisle, jeho čísla jsem ověřil po slotech a jsou správná. Hraniční případ:
„Přesunout z očí" čtu jako P, kritik jako O — na žádném závěru to nemění nic.)*

A rozložení není náhodné — literalismus sedí ve **dvou hnízdech**:

| Stat slotu | Slotů | D (doslovné) | Poznámka |
|---|---|---|---|
| **nástroj** | 14 + 2 KOMBI = **16** | **13** | Hnízdo č. 1. Zapřáhnout a táhnout · Zaklínit vrata (KOMBI) · Schovat bednu do sena · Zvednout závoru · Zpevnit prkna (KOMBI) · Spravit, co třeba · Doložit razítko · Dorazit razítko · Zajet do postranní · Odsunout závoru · Vypáčit vagon · Strhnout do postranní · Objet ho stranou |
| **improvizace** | 18 + 2 KOMBI | **3** | Hnízdo č. 2, a je celé „papírové": Podstrčit papíry · Věrohodný list · Zmást papírem |
| **útok** | **17** | **1** | jen „Tasit včas a první" (sloveso předepisuje zbraň) |
| **obrana** | **17** | **0** | „vydržet a nedat znát" nikdy nepředepisuje předmět |
| **hodnota** | 8 | 0 (ale 7× P) | „Peníze na stůl" · „Silniční poplatek" · „Na přilepšenou" · „Podmáznout / Přimazat / Přilepšit dlaň" · „Zaplatit za vytažení" |

*(Oba KOMBI sloty jsou `[nastroj, improvizace]`, tedy se v tabulce počítají do
obou řádků; 17 + 17 + 8 + 18 + 14 + 2 = 76.)*

Čtyři zjištění, která z tabulky padají sama:

1. **Obhajitelnost není vlastnost formulace, je to z velké části definice statu.**
   Invariant sám říká: `nastroj` = „SPRÁVNÁ věc existuje a musí se správně
   použít", `improvizace` = „NEEXISTUJE správná věc: musí to jen OBSTÁT".
   Nulové D u obrany a 13/16 u nástroje je přesně tenhle rozdíl. **Z toho plyne,
   co se v §3.2 změnit nesmí:** cílově formulovaná nástroj-role přestává být
   nástrojovým nárokem, čímž padá learnabilita §4.5 („překážka »oprava« →
   nástroj"). Rozsah přepisu se proto v §3.2 zmenšuje a definice statů se
   nemění.
2. **Kondicionální rámování je nejsilnější generátor obhajitelnosti — ale je už
   zadané.** Kondicionál „Kdyby…" je v sadě u **8 rolí a všech 8 je skrytých**;
   žádná viditelná role ho nemá. 8/8 bez výjimky je nejčistší učební signál
   v celém obsahu. Obhajitelnost obranných rolí z něj tedy **neplyne** (obranné
   role jsou zákazové imperativy: „Nezvednout hlas", „Ani nemrknout") — plyne ze
   statu. *(Opraveno po prověrce, nález V-5: první verze tvrdila „vzor existuje,
   jen se nepoužil na nástroj", a chtěla kondicionál nasadit na viditelné role.
   To by 8/8 signál zničilo.)*
3. **Nástroj-sloty, které jsou obhajitelné, jsou tři, ne dva** — „Najít skulinu",
   „Najít, kudy ujet" (oba backlog D48 vede jako pravděpodobně špatně otagované)
   **a „Přesunout z očí"**, který v backlogu není. Tvrzení „to není náhoda" tím
   slábne na „to je indicie". Varování ale platí: **udělat nástroj-roli
   obhajitelnou znamená přestat ji poznat jako nástroj.**
4. **Čtyři z třinácti nástrojových D nejsou o třídě předmětu, ale o tom, že
   k nim nesedí žádná věc:** „Zajet do postranní", „Strhnout do postranní",
   „Objet ho stranou" jsou **manévry vozu**. To je jiná porucha (otevřený nález
   D48 o statech, riziko B-3), přeznačením se nespraví a **nesmí se jím zakrýt.**

### 3.2 Co: princip přepisu (nepřepisovat teď, přepsat jedním kolem)

**Pravidlo: role jmenuje PŘEKÁŽKU a REŽIM TLAKU, nikdy nástroj ani jeho třídu.**
Odvozená pravidla — a po prověrce (K-3, V-5) jsou **dvě obecná a dvě tvrdá
strukturní**, ne tři volná:

1. **Sloveso popisuje dopad na scénu, ne pohyb ruky.** „Dostat vůz za závoru"
   ano; „Zvednout závoru" ne. „Přesvědčit ho o tom razítku" ano; „Dorazit
   razítko" ne.
2. **Objekt v roli je překážka, ne řešení.** „Peníze na stůl" → „Něco cenného na
   stůl". „Věrohodný list" → „Doložit, že jste, kdo tvrdíte".
3. **R-A (tvrdé): SKRYTÁ ROLE NIKDY NENÍ DOSLOVNÁ.** Skrytá role není
   v telegrafu, takže se na ni hráč nemůže připravit — doslovnost je tam past bez
   varování. Zároveň je kondicionál („Kdyby…") **vyhrazený skrytým rolím**
   (8/8, viz §3.1/2) a na viditelné se nesmí nasazovat. Dnešní porušení: 2
   („Tasit včas a první", „Zmást papírem").
4. **R-B (tvrdé): nejvýš JEDNA doslovná viditelná role na scénu — a je to ta,
   kterou nese telegraf** (kotva scény, spojka s Q4). Bez ní se rozpadne
   learnabilita §4.5; s víc než jednou se vrací dnešní stav. Dnešní porušení: 5
   scén má 2 doslovné viditelné role.

**Rozsah, který z R-A a R-B plyne — a je výrazně menší než v první verzi:**

| | Role | Proč |
|---|---|---|
| **Přepsat povinně (6)** | Schovat bednu do sena · Zvednout závoru · Podstrčit papíry · Věrohodný list · **Tasit včas a první** · **Zmást papírem** | první čtyři jsou druhá doslovná role ve své scéně (R-B), poslední dvě jsou doslovné skryté role (R-A) |
| **Přepsat doporučeně (7)** | všech 7 hodnota-slotů (P) | „Peníze na stůl" → „Něco cenného na stůl" je jednořádková změna s velkým výnosem: platit lze čímkoli, a je to komické |
| **Zůstává doslovné (11)** | Zapřáhnout a táhnout · Zaklínit vrata · Zpevnit prkna · Spravit, co třeba · Doložit razítko · Dorazit razítko · Odsunout závoru · Vypáčit vagon · Zajet do postranní · Strhnout do postranní · Objet ho stranou | jsou **kotvy svých scén** (R-B). `nastroj` si tím podrží definici „správná věc existuje" a §4.5 learnabilitu. |

Tedy **13 rolí, ne 17** — a **definice statů se nemění, jednotkou změny je
jméno.** Ze zbývajících 11 doslovných jsou tři manévry vozu (§3.1/4); ty čekají
na rozhodnutí o statech v backlogu, nikoli na přeznačení.

**Přejímací test (u stolu za dvě minuty, bez buildu) — KALIBRAČNÍ PĚTICE:**
vezmi pět čistých specialistů sady, jednoho na každý stat — *Dědečkova brokovnice
(útok 5) · Plechová vesta (obrana 5) · Zlaté hodinky (hodnota 5) · Falešný odznak
(improvizace 5) · Svářečka (nástroj 5)* — a ke každému zkus jednou větou obhájit,
jak by v té roli posloužil. *(Opraveno po prověrce, D-3: původní „kvartet" nebyl
maximálně nesourodý a stál na kartě, kterou §4.4 chtěla přemalovat.)*

> **Role projde, když aspoň 3 z 5 dají obhajobu, kterou by GM u stolu nechal
> platit.** Neprojde-li, viník je název role, ne věc.

Kontrolní příklady: *„Zamluvit to"* → 5/5. *„Zvednout závoru"* → 2/5 (svářečka,
brokovnice jako páka; vesta, hodinky, odznak ne). *„Dostat vůz za závoru"* → 5/5.

**Co test dělá a je fér to říct nahlas (D-3):** rozevírá mezeru mezi tím, co
fikce **dovolí**, a tím, co mechanika **odmění** — 3 z 5 obhajob projde u stolu
a přitom 3 z 5 karet mechanicky propadne. To je záměr `design-dokument.md` §4.3
(„komedie nevyhnutelně špatné volby") a bez rámu §2 by to byla jen frustrace;
proto je Q1 (nebo aspoň V1 podlaha, §2.7) **podmínkou**, ne doplňkem. Není to
totéž jako nález 1 z prvního sezení („čtyři alternativní řešení, ne jedna
scéna") — ten byl o soudržnosti scény, tenhle o šíři jedné role.

### 3.3 Proč, co to stojí, co to riskuje

**Proč:** obhajitelná role je jediné místo, kde může licence pro hráčovu
představivost vzniknout **bez jediné mechanické změny**. Výsledek slotu se
nemění (stat vs. práh), mění se jen to, jestli je hráčova volba obhájitelná
nebo je to gramatická chyba. Zároveň je to **předpoklad pro Q1**: bez
obhajitelné role nemá co obhajovat ani AI.

**Co to stojí:**

| Položka | Rozsah | Dopad na měření |
|---|---|---|
| **6 povinných + 7 doporučených názvů rolí** | ~13 slotů v `situace.yaml` + `pronasledovatele.yaml` | **Žádný mechanický.** `role` je jen řetězec v payloadu událostí (`resolve.js:61`, `state.js`) a popisek diagnostiky v `sim/report.js`; žádná větev na něm nestojí. Golden snapshoty se rebasují, mechanika bitově shodná — táž třída změny jako D49. **Plus jedna fixtura:** `test/vysvetleni.test.js:62` má roli „Zaplatit za vytažení" (nález D-4). |
| Tytéž klauzule v poli `text` | ~13 vět v ~10 textech | Žádný (text engine nečte). Pozor: je to **návrat V-8** z telegrafního kola (tam se `text`y ze scope vyňaly) — tady se z něj vyjmout nedají, protože vazba „<úkon> {VEC}" je polovina problému. **Přiznat a nechat schválit rozsah zvlášť** (§7 otázka 4). |
| **Kontrakt „{VEC} smí stát jen v pozici, která snese 1. pád"** | hlavička `situace.yaml` + tytéž texty | **Doplněno po prověrce (D-1).** `assign.js:218` dosazuje `„<název>"` v **1. pádě** do vazeb žádajících 2./7. pád → hráč dnes čte „držel hlas mírný pomocí „Tlustá bible““ a „přesunul náklad z očí do „Páčidlo““. Backlog to vede jako kosmetiku „řešit, pokud to u stolu skřípe" (PM review 2026-07-29) — **u stolu to skřípělo**, takže se to sem přibírá. Bez kontraktu se 19 textů přepíše a chyba zůstane. Vzor kontraktu existuje: `{jmeno}` ve `fallback-sablony.yaml`. |
| Ověření, že se nerozpadla vazba `{kdo}` v nejbližší následující mezeře | kontrakt z D46 | Testy `situace-text.js` to hlídají. |

**Co to riskuje:**

| # | Riziko | Mitigace |
|---|---|---|
| **B-1** | **Ztráta mapy fikce → stat.** Cílově formulovaná role se nedá klasifikovat pohledem; hráč pak neví, který stat slot klíčuje. | **Nehrozí v UI:** obrazovka odhalení (`assign.js`, fáze 2.1/2.2) vypisuje u každého slotu **plné jméno statu, práh a viditelnost**. Role nenese informační zátěž — nese fikci. Riziko by vzniklo jen tehdy, kdyby se rozpis statů schoval, jako se schoval mechanický řádek telegrafu (D50). **To se nesmí stát a patří to do §6.** |
| **B-2** | Learnabilita commit osy (K4d) — hráč se z fikce hůř učí, co scéna chce. | Kryje výjimka „1 doslovná kotva na scénu" (§3.2) a měřená rezerva 18,6 b. u 1p proti τ = 6 (D47/§9 telegrafního návrhu). |
| **B-3** | **Sloty s pohybem vozu** (otevřený nález D48: „strhnout do postranní" = nástroj, „strhnout do pole" = improvizace) se přeznačením **zamaskují, ne vyřeší** — hráč se pořád učí seznam výjimek. | Přeznačení rolí ten nález **neřeší a nesmí ho zakrýt.** Zůstává v backlogu jako otázka statů (měřitelná kontrafaktuálně přes `CONTENT_DIR`), přeznačení se dělá s vědomím, že to je jiná vrstva. |
| **B-4** | **Cílové role rozostří pět statů na jeden** („a proto je všechno improvizace") — a u `nastroj` je to definiční, ne stylistické: invariant říká „správná věc existuje". | **Vyřešeno zmenšením rozsahu (K-3):** 11 nástrojových kotev zůstává doslovných, takže `nastroj` si definici podrží. Přepisuje se jen to, co je druhá doslovná role scény (R-B) nebo doslovná skrytá role (R-A). Slovník nároků invariantu platí i pro role a **stat se nemění, jen jméno.** |

---

## 4. Q3 — Věci: divočejší a víceznačné

### 4.1 Diagnóza sady: sada je katalog nářadí, ne kufr pašeráka

40 věcí je řemeslně dobrých a **funkčně čitelných až moc**. Páčidlo, Svářečka,
Provaz a kladka, Zednická lžíce, Kanystr benzínu, Lopata, Rezervní pneumatika,
Petrolejová lampa — devět nástroj-věcí, z nichž **osm jsou nástroje**. Hráč čte
kartu jako štítek s funkcí, ne jako rekvizitu s možnostmi. Když pak takovou
kartu položí do „nesprávné" role, nevznikne odvaha — vznikne chyba.

Světlé body, které už dnes fungují a jsou vzorem: **Banánový kanón** (bluff
s nízkým reálným útokem — past na naivní commit), **Kněžský kolárek**, **Slzy
na povel**, **Kastrol na hlavě**, **Pytel cementu** („řekneš, komu z něj ušiješ
boty"). Všechny mají společné, že **nejsou tím, čím vypadají** — a přesně to
dělá volbu vtipnou.

### 4.2 Co: tři invarianty nového střihu

1. **PRAVIDLO POCTIVÉ NABÍDKY** *(nahrazuje „pravidlo tří použití" — po prověrce,
   nález K-5; původní znění žádalo tři použití napříč třemi staty, což je proti
   invariantu sady „1–2 dominantní staty (3–5), zbytek nízký (0–2)" **nesplnitelné
   bez lhaní**: třetí inzerované použití by nutně leželo ve statu 0–2, tedy tam,
   kde karta proti kotvám 2–4 propadá. A od fáze 2.2 je text věci **vidět na
   kartě**, tedy je to primární čtecí plocha při commitu — falešná nabídka je
   horší než nudná karta, protože rozhoduje o commitu naslepo.)*
   **Text smí naznačit použití jen ve statech, kde má karta ≥ 3. V nižších statech
   smí naznačit nejvýš pokus, o kterém je zjevné, že nevyjde — a poznámka to
   přizná.** Vzor, který v sadě existuje a je poctivý: **Banánový kanón** (text
   láká na útok, staty dávají improvizaci, `poznamka` to vede jako *past pro
   naivní commit*). Past je legitimní designový prvek s cenou, kterou měří K4b
   a K5. Nepřiznaná lež cenu nemá — má jen hráče.
2. **REKVIZITA, NE NÁSTROJ.** Preferovat věci, které v pašeráckém autě nemají co
   dělat. Absurdní věc udělá ze stat-profilu **překvapení**, kdežto nástroj z něj
   udělá **štítek**. Kontrolní otázka: *„Ptal by se někdo u stolu, proč to vůbec
   vezou?"* Ano = dobrá karta.
3. **POMĚR 2 : 1 (poctivé : divoké).** Komedie potřebuje rovného partnera —
   kdyby bylo divoké všech 40, divokost se znormalizuje a vtip zmizí. Cíl:
   **~14 divokých, ~26 poctivých.** Dnes je divokých ~8.

### 4.3 Co: pět ukázkových karet nového střihu

*Ukázka do reportu. `obsah/` se needitoval. Staty jsou navržené, ne
odsouhlasené — v tomto kole se nic nezapéká (§4.5).*

*Verze po prověrce (K-5 a V-8). První verze inzerovala u tří z pěti karet použití
ve statech ≤ 2 — tedy přesně tu falešnou nabídku, kterou §4.2/1 zakazuje —
a tři z pěti byly improvizace-dominantní, čímž by posílily **nejméně vzácný** stat
sady (18 slotů ze 76) a `hodnota` (8 slotů, jediný stat, který Malone run-wide
nuluje) by nedostala nic.*

```yaml
- id: prazdna-rakev
  nazev: Prázdná rakev
  staty: { utok: 1, obrana: 4, hodnota: 1, improvizace: 3, nastroj: 2 }   # Σ 11
  text: "Sosnová, s víkem na pantech. Nikdo nechce vidět, co je vevnitř — a před vším ostatním se za ní dá schovat."
  # inzeruje jen ≥3: nikdo neprohlíží (improvizace 3) · krytí (obrana 4)

- id: svatebni-dort
  nazev: Svatební dort
  staty: { utok: 0, obrana: 1, hodnota: 3, improvizace: 4, nastroj: 1 }   # Σ 9
  text: "Třípatrový, s cukrovými holubičkami. Vůz, co spěchá na svatbu, nikdo nezdržuje — a do krému se nikdo nehrne."
  # inzeruje jen ≥3: dar (hodnota 3) · legenda (improvizace 4)
  poznamka: "V útočné roli je to katastrofa a je to POINTA (model Banánový kanón, přiznaná past)."

- id: kostelni-kasicka
  nazev: Kostelní kasička
  staty: { utok: 0, obrana: 1, hodnota: 4, improvizace: 3, nastroj: 1 }   # Σ 9
  text: "Plechová kasička plná drobných. Na svaté peníze nikdo nesahá rád — a zvoní, ať s ní zacházíte jak chcete."
  # inzeruje jen ≥3: drobné (hodnota 4) · svatost jako výmluva (improvizace 3)
  poznamka: "Doplněno po prověrce (V-8) místo improvizačního jezevce — hodnota je deficitní strana sady."

- id: zubarske-kleste
  nazev: Zubařské kleště
  staty: { utok: 3, obrana: 0, hodnota: 1, improvizace: 2, nastroj: 4 }   # Σ 10
  text: "Nikelované kleště na šlapací vrtačku. Otevřou cokoli — a chlapi zbrunátní, jen co je uvidí."
  # inzeruje jen ≥3: páčení (nástroj 4) · zastrašení bez zbraně (útok 3, non-GANGSTER)

- id: podepsana-fotografie
  nazev: Podepsaná fotografie
  staty: { utok: 0, obrana: 2, hodnota: 3, improvizace: 4, nastroj: 0 }   # Σ 9
  text: "Snímek, kde vám tiskne ruku někdo velmi důležitý. Retušér si vzal dolar a odvedl poctivou práci."
  # inzeruje jen ≥3: bluff (improvizace 4) · sběratelská cena (hodnota 3)
  # (v první verzi měla obrana 3 → tři dominantní staty, což invariant zakazuje)
```

Všech pět drží limity: název ≤ 3 slova, text ≤ 140 zn., **Σ v pásmu 6–11**
(invariant, ne „9–11" — první verze citovala limit špatně), **právě 1–2 dominantní
staty** a **žádné inzerované použití pod 3**. Žádná reálná osoba ani značka
(„někdo velmi důležitý" to řeší bez jmenování), dobově čisté.

**Škrtnuté tvrzení první verze:** že kleště plní „deficitní potřebu
non-GANGSTER útoku (nález D3)". Nesedí — `veci.yaml` vede „4 non-GANGSTER pro
viditelné útok-sloty" a `reznicky-hak` má u sebe `poznamka: "Reprofil … (D3
kritika)"`, tedy **D3 je vyřízený**. Kleště jsou hezká karta i bez falešného
odůvodnění.

### 4.4 Co: nejlevnější cesta — přemalování se zachováním statů

**Klíčový trik: změna názvu a textu při nedotčených statech je pro simulaci
no-op** (bitově shodná mechanika, jediný rozdíl `verzeObsahu`) — přesně jako
přepis telegrafů v D49. Tím se dá udělat většina práce zdarma.

*Oprava po prověrce (K-5): první verze to demonstrovala na „Petrolejová lampa →
Zubařské kleště". To je špatný příklad — lampa je {0,1,0,2,3}, **Σ 6, v obsahu
vedená jako `poznamka: "Filler (součet 6)"`**, kdežto ukázkové kleště jsou
{3,0,1,2,4}, Σ 10. To není přemalování, to je kolo B s kontrafaktuálem.
A hlubší poučení: **filler se přemalovat na divokou kartu NEDÁ**, protože
divokost je slib a filler nemá čím ho splnit. Přemalovaný filler je nejnebezpečnější
karta v balíku (falešná nabídka na kartě, kterou hráč čte při commitu).*

Doporučená sekvence:

1. **Kolo A — přemalování (0 nových statů):** 10–14 nudných věcí **s poctivým
   profilem** dostane nový název a text nad **nezměněnými staty**. Nulová
   kalibrační cena, nulové riziko, největší poměr efektu k práci. Kandidáti jsou
   karty s dominantou ≥ 4, které jsou dnes jen nářadím: **Zednická lžíce, Provaz
   a kladka, Kanystr benzínu, Rezervní pneumatika, Svářečka, Pytel brambor,
   Kožená zástěra, Rodinné stříbro**. *(Z první verze vyřazeny Petrolejová lampa,
   Gumový váček a Zpěv opilce — všechny tři jsou fillery, Σ 6 / 6 / 5.)*
   Fillery se v kole A **nepřemalovávají**; zůstávají schválně nudné, protože
   plní balanční funkci a jsou poctivé.
2. **Kolo B — nové karty (nové staty):** teprve tady vstupují ukázky z §4.3 a
   **musí projít kontrafaktuálem přes `CONTENT_DIR`** s naslepo předregistrovanými
   pásmy — mění se pokrytí statů, a to sahá na K1, K5 i K4b (dominance
   stat-monokultury). Bez artefaktu se nezapéká (change-control K1).

### 4.5 Co to riskuje

| # | Riziko | Mitigace |
|---|---|---|
| **C-1** | **Změna statů rozbije kalibraci.** Pokrytí („~7–9 dominantních věcí na každý stat") je invariant kvality a K5 (mrtvá rozhodnutí) na něm přímo stojí. | Kolo A vůbec nesahá na staty. Kolo B jen s kontrafaktuálem, podle change-control K1. |
| **C-2** | **Divokost se znormalizuje** a vtip zmizí (všechno je gag). | Poměr 2 : 1 (§4.2). |
| **C-3** | **Rozpad dobovosti do „random vtipné věci".** Prázdná rakev a vycpaný jezevec obstojí; „Živý pštros" už ne. | Kontrolní otázka není „je to vtipné?", ale **„vezl by to pašerák v roce 1930 z nějakého důvodu?"** Ke každé divoké věci musí existovat důvod, proč je v autě. |
| **C-4** | **Přemalování zamlčí, že problém byl v roli, ne ve věci.** Kdyby se udělalo kolo A a nic z §3, „lampou neopravíš auto" se vrátí jako „kleštěmi nezvedneš závoru". | Q2 je **podmínkou** Q3, ne alternativou. Pořadí: role → věci. |

---

## 5. Q4 — Telegrafy: invariant v2 vs. čitelnost

### 5.1 Verdikt: kanály se osekat musí, a je to právě jeden kanál

Nález „telegraf absolutně neříká nic a ještě víc mate" **není selhání exekuce
D49.** Sada z D49 je proti staré měřitelně lepší (0× skeleton, kotvy ze scény,
verdikty ověřené 19/19, délky pod stropem). Je to **selhání specifikace**, a jde
ho spočítat — jen jinou jednotkou, než jakou použila první verze tohoto návrhu:

> `farmar-brod` = **351 znaků** a nese: 4 nároky (3 viditelné + kondicionál)
> + počet skrytých + verdikt zbraně = **šest položek, které si hráč musí držet
> v hlavě naráz**, po jednom přečtení, nahlas, před slepým commitem.

*Oprava po prověrce (V-2 a V-3), a je dvojitá:*

1. **Jednotka délky.** První verze uváděla `farmar-brod` = 396 a
   `most-prohnila-prkna` = 336. Po znacích je to **351** a **302**; rozdíly 45
   a 34 přesně odpovídají počtu diakritických znaků, tedy to byly **UTF-8 bajty**.
   Ta čísla jsou zapečená v D49 („délky 302–379") a **invariant u stropu 400 /
   cíle 350 / rozpočtu 670 jednotku neuvádí.** Je-li sada měřená v bajtech, má
   proti stropu **víc místa, než se myslí** — a je to čtvrtá hádka o délkách
   v tomto projektu. **Doplnit do invariantu „znaky, ne bajty" a sadu jednou
   přeměřit.**
2. **Argument není hustota, je to počet položek.** 351 / 6 = 58,5 znaku na
   položku; návrh v §5.2 dává ~65. Hustota tedy **stoupne**, a tím se první
   verze argumentu (»66 znaků na kanál je hádanka«) vyvrací sama. Skutečná
   proměnná je **kolik věcí si hráč před commitem drží naráz: 6 → 3.** Šest
   položek z textu čteného jednou je nad hranicí, na které lidé udrží obsah bez
   opory; tři ne. **Léčí se počet, ne délka** — a to je zásadní, protože hráč
   sám v prvním sezení řekl, že *text smí být delší* (nález 3).

Žádné další přepisovací kolo to nespraví, protože invariant v2 enumeraci
**přikazuje**: pravidlo *(A) POKRYTÍ — každý VIDITELNÝ slot má v próze právě
jeden nárok.*

Slučitelnost tedy je: **ano, ale jen po zrušení pravidla (A) v dnešní podobě.**
Zbytek invariantu v2 (jádro „nárok je sloveso, ne kulisa", záporné tvrzení,
mřížka verdiktu zbraně, kanál 7, humorná dělicí čára, strop délky) je dobrý a
**zůstává platný** — je to skutečně to, co drží věrnost.

### 5.2 Co: telegraf v3 = „jedna hrozba, jedna předzvěst, jeden verdikt"

Struktura, tři až čtyři věty:

1. **Scéna + JEDEN doslovný nárok** — ten, který je pro místo charakteristický
   (kotva learnability z §3.2; typicky nejvyšší kotva nebo stat, který dává
   scéně jméno).
2. **Předzvěst zvratu** — jedna věta pro dnešní kanál 3 (počet skrytých)
   i kanál 4 (skrytý útok / skrytá improvizace). Číslovka se uvádí **jen
   u `nadrazi-noc`** (jediná situace se dvěma skrytými); jinde stačí, že se
   něco pokazí. *(Poctivě po prověrce, V-4: tohle slití **není zdroj úspory** —
   zapečená sada už ho prakticky všude dělá („Ty vidle se jednou zvednou bez
   varování a rozhodne to, kdo je rychlejší"). Veškerá úspora pochází výhradně
   ze zrušení pravidla (A). **Pro uživatele to znamená, že se hlasuje o JEDNÉ
   změně, ne o dvou.**)*
3. **Verdikt zbraně** — beze změny, z uzavřené mřížky, + dovětek slotové
   výjimky. Tenhle kanál se **nesmí** osekat: bot ho čte s jistotou, brána pro
   jeho ztrátu nemá měřidlo, a jeho chybné čtení stojí auto-fail karty.

Ukázka na hráčově vlastním příkladu (`most-prohnila-prkna`), s kotvou = KOMBI
slot „Zpevnit prkna", tedy s **nejdražším možným nárokem sady**:

> Most přes Mohawk stojí bez údržby od války a řeka pod ním hučí, jako by na
> někoho čekala. Prkna uprostřed se budou muset přibít a zároveň podložit něčím,
> co leží po ruce — vozem se přes ně jinak nepřejede. Něco tady povolí, až bude
> pozdě couvnout. Zbraně se tu nikdo nelekne.

**Změřeno po znacích: 275 zn., 4 věty, 3 položky** (zapečená verze: 302 zn.,
6 položek). Holá varianta bez atmosféry má **194 zn.** — ta je podlaha, ne cíl.

*Opraveno po prověrce (V-1 a V-3):* ukázka první verze měla 210 zn., ale
**nenesla ani jeden nárok** — „závora, kterou roky nikdo nezvedl" je pod
pravidlem „nárok je sloveso, ne kulisa" **čistá kulisa**, takže demonstrace
kotvy kotvu neobsahovala. A cíl se tím vyjasnil: **necílíme na 210 znaků,
cílíme na 3 položky.** Délka zůstává v dnešním rozpočtu (strop 400 zn., cíl
~320) a uvolněné místo jde do obrazu — což je přesně to, co hráč žádal
(„text smí být delší").

**Co se z telegrafu ztratí:** nároky slotů 2–4. Vynoří se **při odhalení textu**,
kde je vedle nich plné jméno statu, práh a viditelnost. Smyčka učení je
*předzvěst → sázka naslepo → odhalení, které pojmenuje* — což je přesně to, co
§13.1 telegrafního návrhu prohlásilo za silnější učení než souběžný překlad.

### 5.3 Proč — a nečekaný balanční zisk

1. **Čitelnost (metrika 6).** Tři informační jednotky na 210 znaků = 70 znaků na
   jednotku, ale bez soutěže o pozornost: hráč má jednu věc, kterou má pochopit,
   ne šest.
2. **Fikce dostane, co jí D47 slíbilo.** „Rozbitý opuštěný most → brokovnici
   nechám doma" je inference z **absence** útok-nároku a z verdiktu, ne
   z dešifrování čtyř poptávek.
3. ~~**Balanc jde správným směrem — a poprvé měřitelně.**~~
   **VYŠKRTNUTO po prověrce (blokující nález K-2).** Bod tvrdil, že osekání
   kanálů srazí K1 3p/4p, protože nižší fidelita snižuje win-rate. Neplatí, a to
   ze tří nezávislých důvodů, které kritik doložil u zdroje: (i) fidelitní
   tabulka z §9 telegrafního návrhu je **1000 runů ze seedů 1–1000, což je známý
   PŘÍZNIVÝ blok (D31)**, a je licencovaná **jen pro rozdíl ramen** (K4d) — K1 je
   hladina a K6a rozpětí hladin, tedy z toho bloku neplatné; navíc `prototyp-mvp.md`
   žádá u K6a povinně 2000 runů/buňka (D39-ii); (ii) model aplikuje `p` **per roli
   uniformně** (`strategies.js:417–420`), kdežto osekání dělá `p = 1` na jedné roli
   a `p ≈ 0` na třech — a protože kotvou je typicky **nejtvrdší** slot scény,
   může cílená jistota u 3p/4p (kde je marginální hodnota čtení největší, 6,8–7,7 b.)
   win-rate naopak **zvednout**; (iii) i kdyby tabulka platila, `p = 0,3` dává 4p
   **72,8 %**, tedy pořád nad stropem 70, a rozpětí 20,3 → 19,6 proti gate ≤ 6 je
   beze změny. Není to potlačení odchylky, je to posun obou konců.
   **Precedens je závazný:** týž typ tvrzení (fikční změna prodaná jako balanční
   lék) se v D47 **vyškrtl, ne zeslabil** — proto se škrtá i tady, se stejným
   znaménkem naopak. Chce-li kdokoli balanční argument vzkřísit, cena je pevná:
   **sweep asymetrické fidelity, povinně PŘED škrtacím kolem, 2000 runů/buňka,
   průměr přes bloky, s předregistrovaným směrem** („čekám, že 4p klesne").
   Padne-li to jinak, je to nález, ne šum. K4d má u 1p rezervu 18,6 b. proti τ = 6
   a i při `p` = 0,3 zůstává na 13,0 b. — **to je jediné, co z těch dat plyne**,
   a znamená to jen, že brána osekání nebrání.
4. **Zakrývací zkouška se stane proveditelnou.** Dnešní zadání (§13.4) měří
   pokrytí 3–4 nároků na 19 telegrafech u 6 čtenářů. Se třemi kanály se ptá na
   „co po vás to místo chce" (jedna odpověď), „pokazí se něco?" a „vzali byste
   bouchačku?" — **méně čtenářů, kratší čtení, jednoznačnější kódování.**

**Toto NENÍ balanční páka a nesmí se tak používat.** §13.2 telegrafního návrhu
zakazuje používat vágnější prózu jako dial obtížnosti a ten zákaz platí:
osekáváme kvůli čitelnosti a fikci, balanční zisk je vedlejší efekt, který se
změří a přizná — ne cíl, kvůli kterému bychom prózu dál zamlžovali.

### 5.4 Co to stojí

| Položka | Rozsah | Poznámka |
|---|---|---|
| Úprava invariantu: pravidlo (A) z „každý viditelný slot" na „jedna kotva scény" + slití kanálů 3+4 | ~15 řádků hlavičky `situace.yaml` | Zbytek v2 zůstává. Není to třetí přepis invariantu, je to **jedno pravidlo**. |
| **ŠKRTACÍ kolo, ne přepisovací** | 19 telegrafů | U většiny stačí **smazat 2–3 klauzule** a nechat nejlepší obraz. Sada z D49 je dobrá surovina — kotvy z scény už v ní jsou. |
| `design-dokument.md` §3 krok 1 + `prototyp-mvp.md` „Předpoklady simu" | 2 řádky | Oba dnes tvrdí, že telegraf sděluje trend **i** počet rolí proti srsti. Po změně to bude nepravda. Viz §6.1 consistency-check. |
| Nové zadání zakrývací zkoušky | ~½ stránky | Zjednoduší se, viz §5.3 bod 4. |
| **Doplnit do invariantu jednotku délky („znaky, ne bajty") + jednou přeměřit sadu** | `game-designer` / PM | **Doplněno po prověrce (V-2).** Strop 400 / cíl 350 / rozpočet 670 jednotku neuvádí a zapečené „302–379" jsou pravděpodobně bajty. Jeden řádek invariantu ušetří čtvrtou hádku o délkách. |
| Sweep asymetrické fidelity | `technical-developer` + `playtest-facilitator` | **Volitelný, pokud se osekání obhajuje jen čitelností — POVINNÝ a před škrtacím kolem, pokud se má tvrdit cokoli o balanci** (K-2). Dnešní model aplikuje `p` na každou roli stejně; realita po osekání je 1 role s `p` = 1 a tři s `p` ≈ 0,2. Malá změna v `sim/strategies.js`, 2000 runů/buňka, přes bloky, předregistrovaný směr. |

### 5.5 Co to riskuje

| # | Riziko | Mitigace |
|---|---|---|
| **D-1** | **Commit se stane náhodným** a s ním zmizí rozhodnutí (K4d). | Měřeno: rezerva 13 b. i při p = 0,3. Sweep asymetrické fidelity to potvrdí nebo vyvrátí **před** škrtacím kolem. |
| **D-2** | **Třetí sáhnutí na telegrafy za dva dny.** Riziko ztráty důvěry v proces a spálené práce D49. | Přiznat rovnou: D49 nebyl zbytečný — dodal kotvy, verdikty a slovník, které škrtací kolo přebírá. Škrtá se **specifikace**, ne texty. A hráčův nález přišel po D49, tedy je to *první* reakce na měření u člověka, ne třetí odhad. |
| **D-3** | **Hráč přijde o pocit informované volby** a commit bude působit jako lotto. | Kotva scény zůstává + typové pravidlo zbraně zná hráč z mapy (`mapa.js:19–20`). Testuje se u stolu, ne v simu. |
| **D-4** | **Zakrývací zkouška zůstane neprovedená** (dnes otevřená položka) a osekání se zapeče znovu naslepo. | Zjednodušené zadání ji dělá levnější — a to je hlavní argument, proč ji tentokrát udělat. |
| **D-5** | **Rozpad rovnováhy s `text`** — v `text` se objeví nároky, které telegraf nezmínil, a hráč to přečte jako podraz. | Tak to má být (odhalení je odměna) — ale musí to být *odhalení*, ne *překvapení bez varování*. Věta „něco tady povolí" je právě to varování. |

---

## 6. Co NEdělat

1. **Nedávat AI ani gram rozhodovací pravomoci.** Ani jako „AI přidá bonus za
   kreativní obhajobu", ani jako „AI navrhne, který slot je zajímavý". Vše, co
   AI určuje, je JAK a PROČ nad hotovým výsledkem. Označení nesourodého slotu
   je **derivace, ne úsudek**.
2. **Nepustit hráčův text do promptu.** Rituál „a jak to uděláš?" je **mluvený
   a nikam se nezapisuje**. Nezakládat pole, nezakládat log. Pole, které
   neexistuje, se nedá injektovat.
3. **Nezavádět hodnocení kreativity** (soudce à la Funemployed, hlasování,
   lajky). Rozbilo by to axiom „mechanika rozhoduje", nefunguje v sólu a
   v kooperaci vyrábí popularitní soutěž místo hádky o rozdělení.
4. **Nezahazovat slotovou resoluci ani kalibraci a neotvírat kalibrační kolo
   kvůli tomuto návrhu.** Kolo A (§4.4) a přeznačení rolí (§3) jsou pro
   simulaci no-op; cokoli, co sahá na staty nebo prahy, jde přes kontrafaktuál
   a change-control K1.
5. **Nepřidávat druhé LLM volání na uzel** (AI generovaný „jak to bylo"). Dvě
   místa, kde hra čeká na síť, dvojnásobek nákladů, a `design-dokument.md` §8
   to zakazuje. Kdyby to někdo chtěl otevřít, patří to nejdřív k
   `operations-economics`.
6. **Nepolírovat telegrafy potřetí.** Škrtat, ne přepisovat. Kdo bude chtít
   „napsat je lépe", narazí na 66 znaků na kanál znovu.
7. **Neřešit slot-literalismus rekvizitami v telegrafu.** Otevřený nález D48:
   tři ze čtyř dodaných rekvizit byly vlastnosti scény, ne překážky. Telegraf
   není místo na obhajobu.
8. **Neschovat rozpis statů na obrazovce odhalení** tak, jak se schoval
   mechanický řádek telegrafu (D50). Přeznačení rolí na cílové formulace
   **předpokládá**, že stat je vidět vedle role. Kdyby se schoval oboje,
   hra ztratí čitelnost úplně.
9. **Nevzkřísit škrtnuté směry:** Jackbox režim, tajné karty, AI balancování
   obtížnosti, product placement (patička `design-dokument.md`).
10. **Nepřipsat nález „hra není zábavná" jedné příčině.** Byly tři (§1), z toho
    dvě mimo AI vrstvu — a k nim přibyla čtvrtá, mechanická a nad rámec mandátu
    (§1.2, viditelné prahy).
11. **Neopravovat §1.2 (viditelné prahy) v tomto kole.** Je to změna mechaniky
    v místě, kde stojí čitelnost (metrika 6, na které první sezení havarovalo
    poprvé). Patří jí vlastní kolo s vlastním měřením, ne přílepek k obsahovému
    kolu o textech. Do té doby se z toho nesmí stát ani argument („vždyť to je
    stejně jen aritmetika"), ani tichá oprava v UI.

---

## 7. Otevřené otázky pro uživatele

**Blokující (bez odpovědi se nedá otevřít žádné kolo):**

1. **Je fallback rovnocenný produkt, nebo přiznaně chudší?** Odpověď určuje, jestli
   se objednává **kódová fragmentová vrstva** (per-slot placeholder + volba slotu
   + 20–30 fragmentů + testy, §2.7), nebo se §2.7 celý ruší a hra bez API klíče se
   přizná jako chudší zážitek. **Střední cesta „12–16 fragmentů zdarma"
   neexistuje** (prověrka K-4). Kontext, který tu odpověď nutí: hráč-autor hraje
   sólo na fallbacích, tedy v jediné dosud otestované buňce — a rituál u stolu (V0)
   mu tam nepomůže vůbec. *Doporučení designéra: objednat kódovou vrstvu. Je malá
   a je to jediná investice, která zlepší **už otestovanou** buňku.*
2. **Sekvence.** Doporučení: **V0 a V1 (Q2 + Q3 kolo A) se otevírají hned,
   nezávisle na WoZ testu**; mandát AI (Q1) se dolaďuje podle jeho nálezu.
   A **WoZ test musí mít kontrolní rameno s neupraveným promptem v0.3** (K-1),
   jinak se nedá říct, jestli za zlepšení může mandát, nebo prostě model.
   Souhlas, nebo čekat na WoZ se vším?
3. **Q4 varianta:** (a) škrtací kolo na 3 položky dle §5.2 · (b) držet invariant
   v2 a nejdřív udělat zakrývací zkoušku (6 čtenářů, otevřená položka D49) ·
   (c) telegram jako pevná forma (R3, dosud dvakrát nedoporučeno).
   Designér doporučuje **(a)**, a to i kdyby se (b) dělalo potom. Pozor: hlasuje
   se o **jedné** změně (zrušení pravidla (A)), ne o dvou (V-4).
   **A s tím související volba: cíl telegrafu je „3 položky na ~320 znacích
   s víc obrazem" (doporučeno — odpovídá hráčovu „text smí být delší"), ne
   „3 položky na 210 znacích".**
4. **Rozsah obsahového kola Q2:** **6 povinných + 7 doporučených rolí**
   (ne 18 — rozsah spadl po prověrce K-3) **+ tytéž klauzule v poli `text`
   + kontrakt „{VEC} jen v pozici snesoucí 1. pád"**. Návrat V-8 se přiznává:
   u telegrafů se `text`y ze scope vyňaly, tady vyjmout nejdou. Schvaluješ
   rozsah včetně `text`?

**Neblokující, ale rozhodnutá se hodí:**

5. **Rituál „a jak to podle tebe proběhlo?"** — pravidlo hry (řádek v UI po
   vyhodnocení u jednoho slotu za uzel), nebo jen doporučení v návodu? Pozor:
   v sólu nefunguje, a hráč-autor hraje sólo.
6. **Kolik věcí přemalovat** v kole A: doporučení 10–14 ze 40 při nedotčených
   statech, **bez fillerů**; nové karty (kolo B) až s kontrafaktuálem.
7. **Derivace `nesourodá` / `groteskní`** — schválit malé zadání pro
   `technical-developera`? Bez ní nemá AI ani fallback jak poznat, kde vymýšlet,
   a nedá se změřit **komediální hustota** (podíl uzlů s ≥1 groteskním slotem;
   simulace to umí, dnes to nikdo nezná). Označená hypotéza: pod ~50 % uzlů je
   komedie vyhládlá — číslo je odhad, který se má **změřit, ne zapéct**.
   Hráči se příznak **nezobrazuje** (prověrka D-2: vypadal by jako pravidlo
   a nedělá nic); nejvýš se objeví v anotaci **po** uzlu.

**Mimo mandát, ale podle designéra nejdůležitější otázka celého kola:**

8. **Prahy jsou při rozdělování vidět (§1.2) — je to záměr?** Kanón na třech
   místech tvrdí „odhalený **po** vyhodnocení", UI ukazuje finální zašuměný práh
   **před** ním. Buď (a) se opraví kanón, protože viditelnost je vědomá cena za
   čitelnost, nebo (b) se rozhodnutí přehodnotí, protože z jádra hry („rozděl
   nejméně špatně") dělá aritmetiku, nebo (c) střední cesta „ukázat kotvu a rozsah
   šumu, přesné číslo po vyhodnocení". **Není to úkol tohoto návrhu** (je to
   mechanika, ne text), ale je to jediná mechanická hypotéza, kterou toto kolo
   vyrobilo — a levná otázka na `playtest-facilitatora` k tomu je: **ví botí
   `kompetentní` přiřazení prahy?** Pokud ne, má člověk víc informace než
   kalibrovaný bot a týmové K1 je podhodnocené.

---

## 8. Adversariální prověrka (`design-critic`, 2026-07-30)

**Verdikt: SCHVÁLIT S ÚPRAVAMI.** *„Směr je správný a lépe odůvodněný než cokoli,
co v tomto projektu na nález u člověka dosud odpovědělo. Ale §5 a §4.2/1 se
v této podobě schválit nedají a §2 nesmí předběhnout svou vlastní kontrolní
podmínku."* Kritik prošel zdroje nezávisle (klasifikaci slotů a délky počítal
sám, ne přepisoval).

### 8.1 Ověření zadaných fakt (a–f)

| # | Tvrzení návrhu | Verdikt kritika |
|---|---|---|
| a | 76 slotů, O 50 / P 8 / D 18, z toho 13 nástroj | **Částečně nepravda** — 76 souhlasí, tři řádky statů špatně, výčty o jeden menší než součty (→ K-3) |
| b | `role` je pro mechaniku jen řetězec, přeznačení = no-op | **Pravda** (`resolve.js:61`, `state.js:285`, `sim/report.js` jen popisky) + jedna fixtura v `test/vysvetleni.test.js:62` |
| c | N6 fallbackům zakazuje vyprávět „jak" | **Nepravda v podstatě** — N6 kvótuje `{veci}` a k hodnocení věcí vybízí; skutečná zeď je jinde a tvrdší (→ K-4) |
| d | `assign.js` ukazuje jméno statu, práh a viditelnost | **Pravda** (`assign.js:242`, `labels.js:8`) → obrana proti B-1 stojí |
| e | ukázkový telegraf = 210 zn. | **Pravda, změřeno správně** — ale dvě další délky v téže sekci jsou měřené jinou jednotkou (→ V-2) |
| f | fidelitní tabulka proti §9 telegrafního návrhu | **Čísla opsána správně, použití neplatné** (→ K-2) |

### 8.2 Kritické (blokující)

- **K-1 · §2 stojí na nepravdivé diagnóze: rule 4 není permisivní a nikdy
  neběžela.** Kanonické znění je rozkazovací („**Rozehraj** ten kontrast úředně
  a vážně") a vzorový dobrý výstup v `prompty/protokol.md` už dnes dělá přesně to,
  co §2.2 prodává jako novinku. „Nikdy nespuštěno" ≠ „permisivní" — sezení bylo
  `{sólo, fallback}`. **Podmínka: WoZ test musí mít kontrolní rameno
  s neupraveným promptem v0.3**, jinak se přírůstek nedá přiřknout mandátu místo
  modelu a projekt zaplatí za změnu, kterou možná nepotřebuje.
- **K-2 · §5.3 „balanční zisk" je neplatný — model neumí modelovat to, co návrh
  navrhuje.** Tři nezávislé důvody: (i) zdroj je 1000 runů z **příznivého bloku
  D31** a je licencovaný **jen pro rozdíl ramen**, kdežto K1 je hladina a K6a
  rozpětí hladin (a K6a chce dle D39-ii 2000 runů/buňka); (ii) sim aplikuje `p`
  **per roli uniformně**, osekání dělá `p = 1` na jedné a `p ≈ 0` na třech — a když
  je kotvou nejtvrdší slot, může to 3p/4p **zvednout**; (iii) i kdyby tabulka
  platila, `p = 0,3` dává 4p 72,8 % (nad stropem 70) a rozpětí 20,3 → 19,6 proti
  gate ≤ 6 je beze změny. *„Je to přesně ta třída tvrzení, kterou D47 vyřadil jako
  K-2, jen s obráceným znaménkem — a ten precedens vede v paměti projektu jako
  vyškrtnutý, ne obrácený."* **Vyškrtnout, ne zmírnit.**
- **K-3 · §3 chce udělat nástroj-roli obhajitelnou a zároveň nechat platit
  invariant, který říká pravý opak.** `nastroj` = „SPRÁVNÁ věc existuje" je
  **definice statu**, ne formulace; 13/16 doslovných u nástroje je právě tenhle
  rozdíl. Navíc: kotvou scény je v drtivé většině scén právě ta nástrojová, takže
  buď se z 13 přepisuje výrazně méně, nebo nástroj ztratí identitu a padá
  learnabilita §4.5. Návrh tu volbu neudělá a přesto žádá schválení rozsahu.
  **Plus přepočet:** správně je útok 17 (ne 19), obrana 17 (ne 16), improvizace 18
  (ne 17), D 17 (ne 18), P 7 (ne 8), O 52; obhajitelné nástroj-sloty jsou tři, ne
  dva, a třetí („Přesunout z očí") v backlogu není → „to není náhoda" padá.
  Klasifikační kritérium se navíc v §3.1 dvakrát mění.
- **K-4 · Podlaha bez AI (§2.7) je nedoručitelná deklarovaným mechanismem — a
  překážkou není N6.** Fragment klíčovaný na stat **o věci neví nic**; aby
  pojmenoval věc, potřebuje **per-slot placeholder**, který neexistuje
  (`protocol-fill.js` má plochý `{veci}`, výběr šablony je `(pásmo × postih ×
  bedna)`, jedna šablona na odstavec). §2.6 z toho neobjednal nic. Druhá vada:
  10 přihrádek × 1–2 varianty = nejčastější komická událost hry (propadlý
  nástroj-slot) dostane **jednu větu na celou hru**, kdežto dnešní pásmová sada má
  v jednom pásmu 17 variant. *„Wildermyth model spočívá na mnoha variantách na
  klíč, ne na mnoha klíčích — návrh si vzal opačnou polovinu."*
- **K-5 · §4.2 rule 1 (PRAVIDLO TŘÍ POUŽITÍ) je v přímém rozporu s invariantem
  sady — a §4.4 ho dokládá vlastním kontrapříkladem.** Invariant: „1–2 dominantní
  staty (3–5), zbytek nízký (0–2)". Tři použití napříč třemi staty tedy nutně
  inzerují stat 0–2, kde karta propadá → **fikce, která lže, a mechanika, která za
  tu lež hráče potrestá**, a to na ploše, kterou hráč od 2.2 čte při commitu.
  Doloženo na vlastních ukázkách návrhu (jezevec: 2 ze 3 použití mechanicky mrtvá;
  kleště: „jsme od doktora" na improvizaci 2 proti kotvám 3–4; fotografie: tři
  dominantní staty; i vzorové Páčidlo má jen dva staty). A §4.4: **lampa je Σ 6
  filler, kleště Σ 10 — to není přemalování, to je kolo B.** Ke všemu §4.4 dává do
  kola A tři fillery, které §4.2 z pravidla vyjímá.

### 8.3 Vážné

| # | Nález |
|---|---|
| **V-1** | Ukázkový telegraf v3 **nenese ani jeden nárok** — „závora, kterou roky nikdo nezvedl" je pod pravidlem „nárok je sloveso, ne kulisa" čistá kulisa. 210 zn. je tedy délka **bez kotvy**; s kotvou úspora ztenčí. Ukázka, která má demonstrovat learnabilitu kotvy, ji nedoručuje — a přesně na tom stojí mitigace B-2. |
| **V-2** | **Délky měřené dvěma pravítky.** `farmar-brod` = 351 zn. (návrh 396), `most-prohnila-prkna` = 302 (návrh 336); rozdíly 45 a 34 = počet diakritických znaků → návrh měřil u zapečených textů **bajty** a u své ukázky **znaky**. Uvnitř §5.1 tak stojí „302–379" i „396" o téže sadě. Invariant u stropu 400 **jednotku neuvádí** → oprava na jeden řádek, která ušetří čtvrtou hádku o délkách. |
| **V-3** | **Diagnóza „hustota" nesouhlasí s vlastním lékem.** 210/3 = 70 zn./položku proti dnešním 58,5 — hustota **stoupne**. Co se změní, je počet věcí v hlavě (6 → 3). A hráč sám řekl, že text **smí být delší**; návrh ho krátí o 30 % a ušetřený rozpočet neutratí. Buď 3 kanály **a delší telegraf s atmosférou**, nebo kratší telegraf — návrh slibuje obojí a doručuje druhé. |
| **V-4** | **Slití kanálů 3+4 není úspora** — zapečená sada to už prakticky všude dělá. Veškerá úspora pochází ze zrušení pravidla (A). Návrh vypadá jako dvě změny, ale je to jedna → uživatel hlasuje o jedné věci. |
| **V-5** | **§3.2 rule 3 (kondicionál) rozbíjí jedinou 100 % čistou učební korelaci v obsahu:** „Kdyby…" je u 8 rolí a **všech 8 je skrytých**. Nasadit ho na viditelné nástroj-sloty ho zničí. Zároveň padá tvrzení „vzor existuje, jen se nepoužil na nástroj" — obhajitelnost obranných rolí je ze **statu**, ne z formulace (obranné role jsou zákazové imperativy). |
| **V-6** | **§2 nemá rozpočet na věty.** 3–5 vět už dnes nese úřední rám, verdikt a rule 6 (postihy, složení, Žár s důvodem, bedny) + jednu závorku; dvě obhajoby = 40 % protokolu a mitigace platí dluhem (rekapitulace telegrafu je otevřený nález D48). Chybí rozhodnutí, **co z rule 6 padne**. |
| **V-7** | **Rituál je umístěný na obrazovku, kde hráč už zná práh** (`assign.js:98`) → obhajuje volbu, o níž ví, že propadne, a mechanika ho vzápětí bez komentáře vyvrátí. A-4 pokrývá jen konflikt hráč × AI, ne hráč × mechanika, který nastane vždy. Lepší místo je **po vyhodnocení**. |
| **V-8** | **Pět nových karet zhoršuje pokrytí statů tam, kde je nejtěsnější:** tři z pěti jsou improvizace-dominantní (improvizace = 18 slotů ze 76, nejméně vzácný stat), kdežto `hodnota` (8 slotů, jediný stat, který Malone run-wide nuluje) nedostane nic. Šlo to vidět bez simulace. Plus: „deficitní non-GANGSTER útok (D3)" nesedí — D3 je vyřízený reprofilem `reznicky-hak`. |
| **V-9** | **Derivace `nesourodá` mlčky přeskočí KOMBI slot** — `slot.stat` je u KOMBI **pole** (`resolve.js:50`), takže indexace vrátí `undefined` a podmínka je vždy false. Postižené 2 sloty jsou obsahově nejkomičtější v sadě. |

### 8.4 Drobné

- **D-1 · Texty mají problém, který §1b nepojmenoval a je zjevnější než
  literalismus: pády.** Vazby žádají 2./7. pád („pomocí {VEC}", „s {VEC}", „do
  {VEC}"), `assign.js:218` dosazuje **1. pád** → „držel hlas mírný pomocí „Tlustá
  bible““, „přesunul náklad z očí do „Páčidlo““. Je to plně dostatečná příčina
  nálezu „texty matoucí" a nejlepší argument PRO to, aby `text`y v rozsahu Q2 byly.
  Patří k tomu kontrakt v hlavičce: **`{VEC}` smí stát jen v pozici, která snese
  1. pád** (vzor: `{jmeno}` ve `fallback-sablony.yaml`).
- **D-2 ·** Zobrazovat hráči `NESOURODÝ / GROTESKNÍ` přetahuje axiom viditelných
  pravidel — je to termín, který vypadá jako pravidlo a nedělá nic (falešná
  afordance + kognitivní zátěž §11). Buď nezobrazovat, nebo až v anotaci po uzlu.
- **D-3 ·** Kalibrační kvartet **není** maximálně nesourodý (pokrývá 4 z 5 statů),
  prochází na 3 ze 4, zatímco mechanicky 3 ze 4 propadnou — test tedy **explicitně
  žádá rozevření mezery mezi tím, co fikce dovolí, a co mechanika odmění**.
  Legitimní sázka, ale má se říct nahlas. A stojí na kartě, kterou §4.4 chce zrušit.
- **D-4 ·** „Žádný dopad" u přeznačení je o jeden test vedle:
  `test/vysvetleni.test.js:62`.
- **D-5 ·** Ze 13 nástrojových D jsou 4 **manévry vozu**, ke kterým nesedí žádná
  věc („Zajet do postranní", „Strhnout do postranní", „Objet ho stranou",
  + „Schovat bednu do sena"). To je jiná porucha (B-3) a tvoří skoro třetinu
  seznamu → rozsah se reálně smrskne, nebo se nález zakryje.

### 8.5 Co kritik schvaluje bez výhrad

1. **§1 jako převod nálezu na doložený nedodržený slib** — tři citace z kanonu
   proti měření K5. *„Nejlepší kus dokumentu."* Včetně přiznání testované buňky
   `{sólo, fallback}` bez použití jako omluvy.
2. **Diagnóza (b)** — plnění mezer je zápis, ne vyprávění, a je to první text
   o volbě (potvrzeno v `assign.js`, rozšířeno o D-1).
3. **Rám nespolehlivého vypravěče.** *„Axiom neporušuje… »Fakta, na která se hráč
   odvolá«, nevznikají — protokol není zdrojem pravdy pro nic, co engine loguje,
   a rozpor se čte jako charakterizace poldy. Metrika 6 tím není ohrožena, protože
   čísla drží vrstva vedle."* Podmínka: dodatek k rule 3 („invence se týká
   VÝHRADNĚ způsobu a motivu") musí být v promptu **dřív** než povinnost v rule 4.
4. **Odmítnutí druhého LLM volání a AI-psaného `text`u** (§2.3, §6/5).
5. **Zákaz volného textu hráče řešený neexistencí pole** — nejlepší možná
   mitigace prompt injection.
6. **Celá §6 „Co NEdělat"** — nic nekříží „Záměrně MIMO rozsah v3 MVP", nic
   nevzkřísí škrtnuté nápady; bod 8 (neschovat rozpis statů) je správně
   identifikovaná past.
7. **Poměr 2 : 1 poctivé : divoké** — správný instinkt, nejlevnější invariant §4.
8. **§5.4 consistency-check** — `design-dokument.md` §3 krok 1 a
   `prototyp-mvp.md` „Předpoklady simu" by po osekání byly nepravdivé; ověřeno
   u zdroje. *„Přesně to hlášení, které se u dvou oddělených dokumentů obvykle
   zapomene."*
9. **Pořadí V0+V1 před V2** — *„jediná část, kde návrh sám sobě přitáhl opasek."*

---

## 9. Odpovědi designéra na prověrku (2026-07-30)

**Všech pět blokujících nálezů přijímám a jsou zapracované v textu výše.** Žádný
jsem neodmítl a u tří z nich je návrh po opravě **věcně jiný, ne jen opatrnější**:
rozsah Q2 spadl z 18 rolí na 13 a získal dvě tvrdá strukturní pravidla, §4.2
dostala poctivé znění místo nesplnitelného, a §5 přišla o balanční argument, který
neměl čím platit.

### 9.1 Co se v návrhu změnilo (audit stopa)

| Nález | Kde | Změna |
|---|---|---|
| **K-1** | §2.2 | „rule 4 je permisivní" → **„chybí ukazatel a zákaz, a hlavně nikdy neběžela"**; přidána tvrdá podmínka **kontrolního ramene WoZ** (i do §7/2) |
| **K-2** | §5.3 bod 3 | **vyškrtnuto** (ne zmírněno), s doložením všech tří důvodů a s pevnou cenou za vzkříšení; §5.4 sweep překlopen na „povinný, chce-li kdo tvrdit balanc" |
| **K-3** | §3.1, §3.2, §3.3 | tabulka statů opravena (17/17/8/18/14+2), součty na **O 52 · P 7 · D 17**; přidána zjištění 1 a 4; rozsah **17 → 6 povinných + 7 doporučených**; dvě nová tvrdá pravidla **R-A** (skrytá role nikdy doslovná) a **R-B** (nejvýš 1 doslovná viditelná na scénu); definice statů se nemění |
| **K-4** | §1c, §2.6, §2.7 | příčina opravena (per-slot placeholder, ne N6); **objednána kódová vrstva**; fragmenty **12–16 → 20–30 (2–3 na přihrádku)**; přidána podmínka N2 (slot nemusí mít kartu) |
| **K-5** | §4.2/1, §4.3, §4.4 | „pravidlo tří použití" → **„pravidlo poctivé nabídky"** (inzerovat jen staty ≥ 3, jinak přiznaná past à la Banánový kanón); všech 5 karet přepsáno; `vycpany-jezevec` vyměněn za `kostelni-kasicka` (hodnota, V-8); §4.4 příklad lampa→kleště **odvolán**, fillery vyřazeny z kola A |
| **V-1, V-2, V-3** | §5.1, §5.2 | jednotka délky (znaky vs. bajty) přiznána a poslána do invariantu; argument překlopen z **hustoty na počet položek (6 → 3)**; nová ukázka **s kotvou, změřená: 275 zn. cílová / 194 zn. podlaha**; cíl přeformulován na „3 položky na ~320 zn.", což je i odpověď na hráčovo „text smí být delší" |
| **V-4** | §5.2 | přiznáno, že slití 3+4 už sada dělá → **hlasuje se o jedné změně** |
| **V-5** | §3.1/2, §3.2 | kondicionál **vyhrazen skrytým rolím** (8/8 signál), z viditelných rolí stažen |
| **V-6** | A-2 | **1 obhajoba povinná, 2. jen když nepadl postih**; k tomu explicitní „scénu neopakuj" do promptu, čímž se zavírá i backlog nález D48 |
| **V-7** | §2.4 | rituál přesunut **z přiřazení na odhalení výsledku**, otázka přeformulována na „jak to podle tebe proběhlo?" |
| **V-8** | §4.3 | karta `hodnota` doplněna, improvizační přebytek odebrán, falešné odůvodnění D3 vyškrtnuto |
| **V-9** | §2.2 | derivace ošetřuje **KOMBI přes `min` obou statů** |
| **D-1** | §3.3 | **kontrakt „{VEC} jen v pozici snesoucí 1. pád"** přibrán do téhož obsahového kola |
| **D-2** | §7/7 | příznak se hráči **nezobrazuje** |
| **D-3** | §3.2 | kvartet → **kalibrační pětice** čistých specialistů; rozevření mezery fikce/mechanika **přiznáno nahlas** |
| **D-4** | §3.3 | fixtura `test/vysvetleni.test.js:62` doplněna do ceny |
| **D-5** | §3.1/4 | manévry vozu **vyňaty** a označeny jako otázka statů (B-3), ne jmen |

### 9.2 Odpovědi na tři otázky, které kritik postavil jako podmínku dalšího kroku

**1. Kterou z pěti statových definic obětuji? Žádnou. Jednotkou změny je jméno.**
`nastroj` = „správná věc existuje" zůstává, a proto **11 nástrojových kotev
zůstává doslovných** — jsou to právě ty role, které nese telegraf a na kterých
stojí learnabilita §4.5. Přepisuje se jen to, co je ve své scéně **druhá**
doslovná viditelná role (R-B) nebo **doslovná skrytá** role (R-A). Kritikova
otázka „u kterých z 19 scén je kotva nástrojová" je v §3.2 vyřízená
vyjmenováním: 11 kotev zůstává, 6 rolí se přepisuje, 7 hodnotových doporučeně.
Přetagování statů (kritikova varianta ii) **nedělám** — je to kontrafaktuál
a change-control K1, tedy jiné kolo, a backlog ho už vede.

**2. Fallback: přiznaně chudší, ALE s objednanou podlahou.** Kódovou vrstvu
doporučuji objednat, protože je malá a je to **jediná investice tohoto kola, která
zlepší už otestovanou buňku** `{sólo, fallback}` — tedy tu, ve které hráč-autor
hraje a ve které V0 nepomůže. Rovnocennost neslibuji a §2.7 to teď říká otevřeně.
Rozhodnutí je v §7 otázce 1 a je uživatelovo, ne moje.

**3. Cíl telegrafu: tři položky na ~320 znacích, ne 210.** Kritik má pravdu, že
původní verze slibovala „delší text s atmosférou" a doručila kratší text.
Opraveno: **léčí se počet položek, délka zůstává v dnešním rozpočtu** a uvolněné
místo jde do obrazu. Ukázka v §5.2 to teď dokládá změřeně (275 zn. s kotvou).

### 9.3 Jedna věc, kterou prověrka vyrobila navíc

Při ověřování rizika B-1 vyšlo najevo, že **`assign.js` ukazuje finální zašuměný
práh už při rozdělování**, tedy před vyhodnocením — proti třem místům v kanonu.
Zapsáno jako **§1.2** a jako **§7 otázka 8**. Je to jediná mechanická hypotéza,
kterou toto kolo vygenerovalo, a podle mého soudu **je vážnější než kterákoli ze
čtyř otázek mandátu**: pokud je jádro hry („rozděl nejméně špatně") hráno
s plnou informací, není to rozhodnutí, ale aritmetika — a žádný text to nespraví.
Do tohoto návrhu to ale nepatří (§6 bod 11) a **kalibraci to neotvírá**; otevírá
to jednu levnou otázku na `playtest-facilitatora` (ví botí `kompetentní`
přiřazení prahy?) a jedno vlastní kolo.

### 9.4 Co zůstává mým nesouhlasem

Nic z blokujících. Jediná dílčí námitka je u **D-3**: kritik čte „test žádá
rozevření mezery mezi tím, co fikce dovolí, a co mechanika odmění" jako skrytý
návrat nálezu 1 z prvního sezení. Ta mezera **je** záměr (`design-dokument.md`
§4.3, „komedie nevyhnutelně špatné volby") a nález 1 byl o něčem jiném —
o soudržnosti scény, ne o šíři jedné role. Přijímám ale požadavek říct to nahlas
a je to v §3.2 doplněno, včetně toho, že bez rámu §2 (nebo aspoň podlahy §2.7)
by z té mezery byla jen frustrace.

---

## 10. Consistency-check `design-dokument.md` × `prototyp-mvp.md`

*Provedeno skillem `consistency-check` (pravidlo CLAUDE.md: každá změna mechaniky
= zkontroluj druhý dokument). Nálezy se **neopravují** tímto návrhem — hlásí se.
První dva **předcházejí** tomuto kolu a jsou v backlogu; poslední tři jsou nové.*

### Herní mechaniky a čísla

1. **Prahy: „odhalený PO vyhodnocení" × UI je ukazuje PŘED ním.** *(Nové, viz
   §1.2.)* `design-dokument.md` §4.5 („skrytým prahem, odhaleným až po
   vyhodnocení") a §10 („po vyhodnocení se vždy ukážou") ·
   `prototyp-mvp.md` §Resoluční systém v3 („Práh **skrytý před**, **odhalený po**
   vyhodnocení") × `assign.js:242` vykresluje `práh ${s.prah}` = finální zašuměný
   práh (`resolve.js:67`) na obrazovce rozdělování. **Oba dokumenty jsou navzájem
   konzistentní a oba se rozešly s postavenou hrou.** Proč to vadí: nejde
   o kosmetiku dokumentace — kanón slibuje skrytou informaci v jádru hry (§4.3),
   a hra ji neskrývá.
2. **Telegraf: 3 kanály × 6 (engine) × 7 (obsah).** *(Otevřený nález D47, stále
   neopravený — a divergence od té doby vzrostla.)* `design-dokument.md` §3 krok 1
   + §4.2 a `prototyp-mvp.md` „Předpoklady simu" (`trend`, `proti_srsti`,
   `zbraň_projde`) × `resolve.js:283` vrací **6** × hlavička `obsah/situace.yaml`
   po D49 popisuje **6 + kanál 7** (`rusi` v léčkách). Proč to vadí: kdo bude
   psát obsah podle kanonického dokumentu, vynechá polovinu informace, kterou
   engine derivuje. Přijetí §5 tuhle opravu **stejně vynutí** (osekání pravidla
   (A) mění, co telegraf slibuje) — ať jde vlastním commitem, jak doporučil D47.
3. **`prototyp-mvp.md:33` cituje K4d „3p jen 7,9 b." z ramene `optimal`,** ač je
   gate definován na rameni `kompetentní` (dnes 18,6 / 22,1 / 24,6 / 22,8 —
   přeměřeno PM v D47). *(Otevřený nález D47, stále v textu.)* Proč to vadí: číslo
   vypadá jako těsný pass a je z něj dovozováno riziko, které neexistuje.

### Terminologie a názvosloví

4. **`design-dokument.md` §4.10 uvádí jako příklad tajného cíle „polda tě označí
   za mozek operace".** *(Nové.)* Cíl `mozek-operace` byl **D42 (2026-07-28)
   škrtnut** jako strukturálně nesplnitelný (prompt drží osoby jako „podezřelý
   A–D", fallback sada smí osobu jmenovat jen jako příjemce postihu) a nahrazen
   `schovana-bouchacka`. Vize tedy inzeruje jako příklad přesně ten typ cíle,
   který obsahová vrstva zamítla. Proč to vadí dvojnásob v tomto kole: byl to
   **jediný čistě textový, „kreativní" cíl v sadě** — a jeho škrt je další
   doklad diagnózy §1 (vrstva vyprávění nedostala nosnost, tak se z ní ubíralo).
   Oprava je jednořádková: nahradit příklad, nebo dopsat, že je to vize
   podmíněná pojmenováním osob v protokolu.

### Rozsah MVP vs. vize

5. **`prototyp-mvp.md` §„Záměrně MIMO rozsah v3 MVP" vede „volbu obtížnosti",
   ale D50 ji do MVP postavil.** *(Nové.)* Přepínač *Ulehčení: rozbor telegrafu na
   rozklik* stojí v nové kolonce **Obtížnost** na setupu (D50, 2026-07-29;
   deklarovaně „rám pro D25d"). Proč to vadí: sekce „Záměrně MIMO rozsah" je
   scope obrana, kterou má Claude dle CLAUDE.md aktivně hájit — jestliže v ní
   zůstane položka, která je už postavená, přestane být tou obranou a nikdo si
   nevšimne dalšího přírůstku. Opravit buď výjimkou („kolonka Obtížnost existuje
   jako rám, obsahuje výhradně přepínač ulehčení telegrafu"), nebo přesunem
   položky mimo seznam.

### Křížové odkazy v patičkách

**Beze nálezu.** Patička `design-dokument.md` odkazuje na `prototyp-mvp.md`
i na archiv pivotu, patička `prototyp-mvp.md` zpět na `design-dokument.md`; oba
odkazy jsou platné. Historie škrtnutých směrů (Jackbox, tajné karty, AI
balancování, product placement) je v patičce `design-dokument.md` a ani jeden
z dokumentů je nikde neuvádí jako aktivní funkci.

---

*Zdroje: [[../playtesty/2026-07-29|playtesty/2026-07-29.md]] ·
`design-dokument.md` §4.1, §4.3, §4.5, §8 · `prototyp-mvp.md` Fáze 0 + Resoluční
systém v3 · `obsah/situace.yaml` (hlavička = invariant telegrafu v2 + 15 situací) ·
`obsah/pronasledovatele.yaml` · `obsah/veci.yaml` · `prompty/protokol.md` v0.3 ·
`prompty/fallback-sablony.yaml` (hlavička, pravidlo N6) ·
[[telegraf-invariant-navrh-2026-07-29|technika/telegraf-invariant-navrh-2026-07-29.md]]
§1, §9, §11, §13 · `prototyp/src/engine/resolve.js:61, 260–283` ·
`prototyp/sim/strategies.js:150–164, 400–428` · `prototyp/sim/learnability.js` ·
[[../projekt/stav|projekt/stav.md]] Aktuální fáze.
Benchmarky: [Funemployed](https://www.ultraboardgames.com/funemployed/game-rules.php) ·
[Wildermyth](https://wildermyth.com/wiki/Story_Inputs_and_Outputs) ·
[Wildermyth — ruční varianty dle osobnosti](https://www.superjumpmagazine.com/wordplayer-wildermyth-lays-bare-the-false-promises-of-ai-storytelling/) ·
Blades in the Dark (position & effect) · Dungeon World (GM move „ask questions
and use the answers").*
