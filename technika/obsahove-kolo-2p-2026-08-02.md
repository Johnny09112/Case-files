# Obsahové kolo po 2p sezení lidské brány (2026-08-02)

**Zdroj zadání:** `playtesty/2026-08-02.md`, nálezy 1–3.
**Autor kola:** content-generator. **Recenze:** protocol-humor-tester (fragmenty),
design-critic (role vs. mechanika). Oba opus, synchronně.

Stav po kole:

| bod | téma | stav |
|---|---|---|
| 1 | čeština fragmentů | **ZAPEČENO** — `prompty/fallback-fragmenty.yaml`, všech 42 textů přepsáno |
| 2 | hodnota-role vs. Malone | **NÁVRH** — `obsah/situace.yaml` nedotčen, rozhoduje uživatel |
| 3 | anotace zbraně | **NÁVRH** — znění pro kód, rozhoduje uživatel |

---

## 1. Čeština fragmentů (ZAPEČENO)

### Diagnóza — tři třídy vady, ne sbírka nepovedených vět

1. **Obal `kus` (27 ze 39 vět).** V balíku jsou **nepředmětné věci** (`Slzy na povel`,
   `Zpěv opilce`, `Otrlený výraz`) a věc se do slotu dostává i „špatně" — to je pointa
   hry, takže stat slotu **nezaručuje třídu karty**. „kus „Zpěv opilce"" je vada
   v každém takovém renderu; „kus" navíc v evidenční češtině zní jako dobytek nebo slang.
2. **Nepřirozený slovosled.** OVS inverze v každé druhé větě: „Nabídnut byl k položce X
   kus…", „ač předložen byl…", „Bez okolků vyřízena položka…".
3. **Sémantické vady, které prošly dvěma koly recenze.** „Obstarat položku měl předmět"
   (položku nelze obstarat, a role se stala podmětem — porušení vlastní hlavičky sady),
   „Nápor na úkon „Ustát nápor"" (kolize substantiva se jménem role), „Ke kolonce…
   zůstala prázdná" (visící sloveso bez podmětu), „Věc… nikoli věcná" (kolize obalu
   s adjektivem).

### Co se změnilo

- **Nová soustava obalů.** Věc: `věc` (17×) · `položka` (18×) · `předmět vedený jako`
  (4×). `kus` a **holý** `předmět` zakázány. Role: `úkol` · `úkon` · `bod` · `kolonka`;
  `položka` je nově rezervovaná pro věci, aby nestála v jedné větě dvakrát.
- **Rotace obalů uvnitř kvartetu.** Varianty `-1` a `-2` téhož statu mají různý obal, takže
  uzel se dvěma sloty téhož statu (`rival-prepad`, `mesto-houkacky`) rotuje sám.
  Koncentrace nejčastějšího obalu **69 % → 46 %**.
- **Úřední závěs vrácen ve čtyřech větách** — ale jen tam, kde obal riskuje. Závěs není
  jen registr, je to **hedge**: „předmět „Slzy na povel"" je nepravda, „předmět **vedený
  jako** „Slzy na povel"" je pravda o evidenci (a nejlepší dobový vtip sady).
- Hlavička sady doplněna o revizní blok, pravidlo obalů a **test kolize obsahových
  substantiv** proti `role`/`nazev` v `obsah/*.yaml` (čtením po jedné větě se nenajde).

Beze změny: id, přihrádky, `stat`, počet 42, pravidla 1–10, jediná závorka v sadě.

### Co jsem z recenze NEVZAL a proč

- **Vrácení dobových inverzí (#12, #13, #26, #33).** Testér argumentuje, že po narovnání
  zbyly jen tři registrové kotvy. Souhlasím s diagnózou, odmítám lék: nález u stolu zněl
  doslova „kostrbaté" a právě tyhle věty jsou nejpravděpodobnější příčina. Registr drží
  tři ponechané kotvy („Nedostatečnost nutno přiznat", „nabídku shledávám nízkou",
  „nikoli věcná") + 4 úřední závěsy + formule se „spisem". **Rozhodne až druhé sezení.**
- **Patch na #22** („vrátit Obstarat položku „{role}" měl předmět"). Nález beru (role se
  stala podmětem), patch ne — „obstarat položku" je sémanticky vadné i v originále.
  Napsáno jako „Práci u úkolu „{role}" měla zastat věc „{vec}"; na to byla krátká."
- **Přiřazení obalu podle statu slotu** („improvizace dostane bezpečný obal, útok snese
  `předmět`"). Neplatí: karta se do slotu dostane i špatně, takže `Zpěv opilce` skončí
  i v útok-slotu. Proto je holý `předmět` zakázaný **všude**, ne jen v improvizaci.
- **Poznámku testéra, že `gangster_auto_fail` padá jen na roli „Zatlačit hrubě"**, jsem
  nepoužil — je obrácená. `stitek_citlivy: GANGSTER` je slot, kde zbraň **projde**;
  auto-fail padá na kteroukoli z ~30 viditelných rolí u `npc`/`lecka`.
- Testér si sám opravil vlastní číslo o koncentraci (51 % → skutečných 69 % ve staré sadě),
  takže „vyměnil jsi tik za horší tik" **neplatí** — ale cíl (rozbít opakování) splněný
  nebyl, dokud nepřibyla rotace obalů. Ta je v sadě.

### Zbytek k doměření

Délky jsou **moje ruční odhady** (nemám Bash): nejdelší vychází ~125 znaků po dosazení
nejhorší kombinace, strop testu je 150. Definitivní měření dělá test
`prototyp/test/protocol-fragments.test.js`. **Golden snapshoty fragmentové vrstvy se
tímto kolem vědomě mění.**

---

## 2. NÁVRH: hodnota-role vs. Malone

### Klasifikace všech 8 hodnota-slotů

| uzel | role | kotva | co to fikčně je | úplatek? |
|---|---|---|---|---|
| farmar-brod | Zaplatit za vytažení | 4 | platba farmáři za službu | **ne** |
| deputy-mytnice | Silniční poplatek | 3 | mýto, jehož sazbu si vybírající určuje sám | šedá |
| deputy-hlidka | Na přilepšenou | 3 | úplatek | ano |
| privoz-celnik | Přilepšit do dlaně | 3 | úplatek | ano |
| rival-parley | Peníze na stůl | 4 | platba konkurenčnímu gangu | šedá |
| urednik-razitko | Něco navíc | 3 | úplatek | ano |
| nadrazi-vypravci | Podmáznout dlaň | 3 | úplatek | ano |
| serif-brody / léčka | Přimazat dlaň | 4 | úplatek | ano |

Pod Malonem je **dostupných 7 z 8** (osmý je v Brodyho léčce, která pod Malonem nenastane).
Maloneova vlastní léčka i konfrontace mají hodnota-slotů **nula** — jeho finále se jeho
vlastního pravidla netýká.

### Doporučení: role NEPŘEJMENOVÁVAT

Přejmenování nesundá pozvánku — pozvánkou je **slot**, ne jeho jméno: „Zaplatit za
vytažení" zůstane hodnota-slotem, který je pod Malonem auto-fail. Cena je přitom vysoká:
role visí na větě v poli `text` a často na nárokové větě telegrafu, takže by se **7 z 19
telegrafů vrátilo do přejímky v3** (D51/D52 — sada se třikrát nezapekla, než prošla).

### Návrh A (textový, doporučuji): opravit fikci Maloneova pravidla

Dnešní `pravidlo` **lže**: slibuje „úplatky neplatí", zatímco engine nuluje i mýto, platbu
farmáři a peníze rivalům. `pravidlo` ani `flavor` engine nikdy nečte (jsou to stringy
mimo `rusi: {typ, cil}`), takže je to **simulačně invariantní errata, ne redesign** —
K1–K9 vyjdou stejně. D25e chránil Maloneovu identitu **v kalibraci**, ne větu, která
o té identitě lže.

- `flavor` — **NESAHAT.** „nepije, nekouří a nebere" je celý vtip postavy a mechanismus
  do něj nepatří (můj původní návrh ho přepisoval; kritik to zamítl a má pravdu).
- `pravidlo` → *„Malone nebere — a postaral se, aby po trase nebral nikdo. Jeho lidé
  rozeslali seznam: kdo si od téhle posádky vezme peníze nebo cokoli cenného, má na krku
  federály. Dokud je Malone v patách, počítá se stat HODNOTA u všech věcí jako 0 ve všech
  hodnota-slotech CELÉHO runu — nezabere úplatek, mýto, platba za službu ani peníze na stůl."*

Pozn.: fikce musí být o **seznamu/varování**, ne o značených bankovkách — hodnota-dominantní
karty jsou i `Bedna kanadské` a `Rodinné stříbro`, a značené bankovky nevysvětlí, proč
farmář nevezme bednu whisky.

### Návrh B (UI, bez dotyku obsahu) — podle kritika je to ten hlavní

`pravidlo` se renderuje **jednou za run** (briefing), zatímco rozpor se ozývá u každé
karty a slotu: `commit.js` i `assign.js` ukazují „hodnota 5" bez přeškrtnutí, tip aktivní
mezery neřekne o mrtvém slotu nic a `okraj.js` odkazuje na briefing. Čitelnostní vada
(metrika 6), ne balanční:

1. přeškrtnout `hodnota N` na kartě v `commit.js` i `assign.js`, když je Malone aktivní;
2. razítko u aktivní mezery: „Malone: tenhle slot je ztracený, ať dáš cokoli";
3. (volitelně, a je to zároveň nejlevnější lék na nález 6 „hra podvádí") uvést na
   rozdělení strop uzlu, když je < 4/4.

### Co je rozhodnutí uživatele, ne moje

- **Zůstává run-wide scope (D20a) u stat-rušícího pronásledovatele?** Kritik doložil, že
  problém je tvrdší, než jak ho hlásí texty: hodnota-slot je pod Malonem auto-fail
  s p = 1,0 (práh 0 nemůže padnout), takže **7 ze 14 běžných situací má strop 3/4 a LOOT
  je tam nedosažitelný**. Brody je vyhnutelná daň, Malone odvod bez volby. To je legitimní
  důvod otevřít D25e — ale patří k němu kontrafaktuál, ne přepsaná věta.
- **Podklad, který si vyžádat dřív než rozhodnutí:** K1 a míra PRŮŠVIHŮ **zvlášť per
  pronásledovatel** (dnes se měří průměr přes oba). Jeden běh simulace, nulový dotyk obsahu.
- **Otevřená otázka:** je Malone rozbitý, nebo jen netransparentní napoprvé? Counter-play
  (vyhnout se hodnota-uzlům volbou cesty) existuje, ale je dostupný až po memorizaci poolu;
  sezení mělo jeden run.
- **Nález mimo zadání (kritik):** komentář schématu `pronasledovatele.yaml` tvrdí, že
  `flavor` je „1 věta **pro protokol**" — do promptu ani do fallbacků ale nejde, konzumuje
  ho jen briefing. Buď opravit komentář, nebo pole do promptu doplnit.

---

## 3. NÁVRH: anotace zbraně

### Co se musí vejít do pravdy

`stitky.yaml` `chovani_dle_typu` (npc/lecka = viditelná role auto-fail, skrytá se hodnotí
normálně; lokace/zatah/konfrontace = projde vždy) × viditelnost slotu × slotová výjimka
`stitek_citlivy` × zámkové postihy, které v `resolve.js` běží **před** štítkem a zbraň
shodí i ve skryté roli.

**Dvě pasti, do kterých spadly moje první varianty (obě doložil kritik):**

1. **„Ve skryté roli je zbraň eso" je nepravda v 9 z 19 situací.** Skrytý slot klíčuje na
   útok jen v 10 z 19; jinde je to obrana (7×), nástroj nebo improvizace — a tam mají
   GANGSTER karty 0–3. Anotace, která učí opak, se rozejde se čtvrtou buňkou verdiktu
   telegrafu („Zbraň na očích tu jen popudí a potají nezmůže nic").
2. **Dělicí čára „kde se dá ještě mluvit" je falešná** pro `zatah` (silnice plná chlapů
   s puškami), `konfrontace` (pronásledovatel dva metry před vámi) i pro lokaci
   `nadrazi-noc` (živý hlídač s lucernou). Hráč by ji první léčkou vyvrátil.

### Doporučené znění (varianta D — vznikla z recenze, nahrazuje mé A i B)

Statická anotace u karty se štítkem, 2 věty, žádný seznam typů míst:

> **„Zbraň se řídí poslední větou telegrafu — ta pro každé místo zvlášť říká, jestli projde
> na očích. Ve skryté roli se štítek neřeší nikdy; rozhoduje stat té role, a ten nemusí
> být útok."**

Proč tohle: verdikt zbraně je od D52 zapečený jako **4 doslovné řetězce** (kanál 5
invariantu), takže hráč nepotřebuje taxonomii pěti typů míst — potřebuje jeden návyk.
Znění je stoprocentně pravdivé a nedá se vyvrátit protipříkladem.

### Kontextové razítko (doporučuji jako hlavní nosič, kód ho přebírá)

Zdroj pravdy musí být skutečný stav slotu (`stitky.yaml` + `slot.viditelnost` +
`slot.stitek_citlivy`), **ne typ místa odhadem** — jinak razítko lže na `nadrazi-vypravci`:

- viditelný slot, kde zbraň propadá: „Tahle mezera je na očích — zbraň sem propadne bez
  ohledu na staty."
- skrytý slot: „Tuhle mezeru nikdo nevidí — **štítek se tu neřeší, rozhoduje stat role**."
  (ne „počítá se naplno" — to slibuje úspěch, ne jen povolení)
- místo, kde zbraň projde vždy: „Tady zbraň nikdo neřeší — projde i na očích."
- slotová výjimka: „Tahle role zbraň přímo vítá — projde i na očích."
- u Brodyho dovětek: „a každá zbraň tu stojí dvojnásob pozornosti, i schovaná."

**Razítko patří primárně na kartu v `commit.js`**, ne (jen) k aktivní mezeře: rozhodnutí
„mám bouchačku vůbec vyložit?" padá v commitu naslepo; při rozdělování už hráč jen
minimalizuje škodu. Kritik k tomu přidal: badge „Gangster — hlučná" dnes pojmenovává **Žár**,
ne viditelnost — tedy to slabší ze dvou pravidel a ne to, na které se hráči ptali.
Doporučuje rozdělit na „Gangster — na očích propadne" + „hlučná: +1 Žár (u Brodyho +2)".

Razítko **nekoliduje** s D51 (neukazuje práh ani šum) ani se zákazem meta-slovníku (ten
platí pro prózu telegrafů v `obsah/situace.yaml`, ne pro UI; `assign.js` už dnes píše
„skrytá role · kotva 3, šum ±2").

Pozn. k fragmentům: přihrádka `gangster_auto_fail` nově mluví o „úkolu, který se dělá
**na očích**" — vědomě stejná osa jako telegraf („na očích / potají"), aby protokol učil
totéž pravidlo, ne jeho třetí formulaci.

---

## Křížové odkazy

- Sada fragmentů a její pravidla: `prompty/fallback-fragmenty.yaml` (hlavička, blok
  REVIZE 2026-08-02).
- Nálezy sezení: `playtesty/2026-08-02.md`.
- Dotčené soubory návrhů (needitovány): `obsah/pronasledovatele.yaml` (řádky `pravidlo`
  u `agent-malone`), `prototyp/src/ui/screens/run/commit.js`, `…/assign.js`, `…/okraj.js`.
