---
name: baterie-falzifikovatelnost
description: Jak psát regresní baterii protokolů, aby uměla selhat — zákony o testu bez opory v promptu (a jeho default léku: DIAGNOSTIKA + `nesmi` v tom směru, který prompt vynucuje), tautologické položce, mrtvém vstupním poli, mrtvém pravidle (0 dodržení ze 39 generací), stropu zvoleném ex post, průchodu v jednom rameni A/B jako losu a o ověřování ručně psaných polí `udalosti` proti enumu enginu
metadata:
  type: project
---

# Baterie musí umět SELHAT

Kalibrace role. Vzniklo z review kola v0.4.1 (design-critic, 2026-08-02), kde tři
ze čtyř nálezů nebyly o promptu, ale o tom, že **testy měřily něco jiného, než
tvrdily**. Baterie, která projde vždycky, není pojistka — je to rituál.

Základní otázka u každé nové položky `musi`/`nesmi`:
**„jaký konkrétní výstup tuhle položku PORUŠÍ?"** Když si ho neumím vymyslet,
položka nic neměří.

## 1. TEST NESMÍ ŽÁDAT CHOVÁNÍ, KTERÉ PROMPT NIKDE NEUKLÁDÁ

Napsal jsem `musi: uzavřít závorkou osobní poznámky — podpisová figura se NESMÍ
obětovat jako první`. Jenže rule 8 zněla čistě povolovacím tónem („nejvýše jednou
**smíš** přidat") a o pořadí škrtání mlčela. Test tedy měřil prioritu, kterou spec
neuvádí — a až model při 890 znacích závorku zase obětuje, vypadá to jako argument
pro zvednutí stropu na 1000, ačkoli je to jen chybějící věta v promptu.

- **Před každou položkou `musi` najdi větu v promptu, která ji vynucuje.** Když
  neexistuje, máš dvě legitimní cesty: doplnit ji do promptu, nebo položku zmírnit.
  Třetí cesta (nechat test měřit přání) je nejhorší, protože se nálezy z něj čtou
  jako selhání modelu.
- **Vedlejší ekonomický efekt:** doplnění věty do promptu je vstup (cachuje se),
  zvednutí stropu je výstup (5× dražší token). Když se diagnóza dá řešit oběma,
  **klauzule v promptu je ~5× levnější než uvolnění délky** — a v mém kole to
  nebylo zvažováno, dokud na to kritik neukázal.

### 1b. LÉK NA POLOŽKU BEZ OPORY NENÍ ŠKRT, ALE OTOČENÍ SMĚRU (2026-08-02, kolo D55b)
Když `musi` nemá oporu v promptu, nabízejí se dvě cesty — doplnit prompt, nebo
položku smazat. **Existuje třetí, skoro vždy lepší:** rozložit ji na dvojici
1. **DIAGNOSTIKA** (neblokující míra přes generace) — měří dál, ale neblokuje
   verdikt a nevyrábí falešná „selhání modelu";
2. **`nesmi` v tom směru, který prompt VYNUCUJE.**
U kreditů to vyšlo přesně: rule 7 zápis kreditů neukládá (→ `musi` je neopřené),
ale rule 4 zakazuje změnit jakékoli ČÍSLO ze vstupu (→ „uvést jiný přírůstek nebo
stav kreditů, než jaký nese vstup" je plně opřené a falzifikovatelné). Škrt by
pole umlčel úplně; tenhle tvar zachová obojí — měření i pojistku.
- **Obecně: u každého vstupního pole existují dva směry** („zapiš ho" × „nezkresli
  ho"). Prompt skoro vždy vynucuje jen ten druhý. **Testuj ten, který vynucuje.**
- Týž vzorec už dřív posloužil na `loot` a `MAX DOSAŽITELNÉ` — od D55b je to
  **default postup**, ne improvizace: `musi` bez opory → DIAGNOSTIKA + obrácené `nesmi`.
- **Do baterie zapiš i podmínku návratu** („doplní-li se kredity do rule 7, překlopí
  se DIAGNOSTIKY zpět na `musi`"), jinak se po změně promptu na zeslabení zapomene.

## 2. POLOŽKA `nesmi` OPSANÁ Z PRAVIDLA JE TAUTOLOGIE

Rule 4 zakazovala „zadržen, zatčen, spoután, odveden, zavřen" — a moje `nesmi`
položka zněla „tvrdit zadržení, spoutání či odvedení", tedy **týmiž slovy**.
Vyhýbavá formulace („odvedli ho k sepsání") projde promptem i testem naráz, protože
obojí hlídá stejný lexikální seznam.

- **Píš `nesmi` o STAVU, ne o slovech:** „naznačit, že podezřelý skončil v rukou
  úřadů nebo přestal být s posádkou" místo výčtu sloves.
- **Sebekontrola:** kdyby model použil úplně jinou slovní zásobu než prompt,
  chytila by ho ta položka? Když ne, testuju shodu řetězců, ne chování.
- Zrcadlově platí totéž pro prompt (viz [[prompt-variant-rozhodovani]] §3):
  výčet ilustruje, generalizace vynucuje. **Baterie a prompt nesmí sdílet TUTÉŽ
  slabinu** — jinak nemám dvě nezávislé kontroly, ale jednu ve dvou kopiích.

## 3. HLÍDÁŠ-LI VSTUPNÍ POLE JEN V JEDNOM SMĚRU, MŮŽE BÝT MRTVÉ

`MAX DOSAŽITELNÉ` mělo v baterii čtyři zmínky — a všechny byly zákazy opačného
tvrzení („nesmí tvrdit, že to lépe nešlo"). **Žádný case nevyžadoval, aby model
gap zaznamenal.** Model, který ten řádek ignoruje ve 100 % generací, projde 10/10.
Přitom se za něj platí v každém volání, oracle ho počítá brute-force a celá klauzule
rule 7 na něm stojí.

- **U každého pole vstupního formátu se ptej: existuje test, který PADNE, když model
  pole ignoruje?** Když ne, pole je nefalzifikovatelné a nevím, jestli za něj platím
  zbytečně.
- **Řešení nemusí být blokující kritérium** — u jevu, který prompt povoluje („smíš
  to jednou zaznamenat"), je správný tvar **diagnostická položka přes víc generací**
  („zaznamená-li ho 0 z 5, je pole mrtvé"), ne `musi`.
- Táž kontrola patří na `ZÁCHRANA`, `PRAVIDLO RUNU` a `důvod:` — každé pole, které
  bylo do formátu přidáno kvůli jednomu beatu.

## 4. STROP ZVOLENÝ EX POST Z JEDNOHO VZORKU NEUMÍ ROZLIŠIT DVĚ PŘÍČINY

Doložil jsem potřebu stropu 900 jednou referenční generací o 818 znacích — tedy
91 % nového stropu, vybraného z téhož vzorku. Takový důkaz neumí odlišit
**„prompt je moc těsný"** od **„model je upovídaný"**, a přitom se podle toho
rozhoduje, jestli se příště hýbe promptem, nebo číslem.

- **Dělej z délkového kritéria MÍRU přes generace, ne jedno číslo:** např.
  „≥4 z 5 generací ≤ strop **A** 5 z 5 se všemi následky a se závorkou".
  Padne-li první podmínka a druhá drží → upovídaný model. Padne-li druhá → těsný strop.
- **Zvednutí stropu je tiché povolení rozvláčnosti na casech, které vatu hlídají.**
  Uzly 4/4 bez následků dostaly stejných +100 znaků jako sólo uzel s plnými
  následky, ačkoli mají striktně méně co hlásit. Zvažuj **case-specifický nižší
  strop** na těch, které existují právě kvůli vatě.
- **Strop v promptu nic nevynucuje v runtime** (`adapter.js` `MAX_DELKA = 2000`).
  Je to instrukce modelu, ne validace — takže „projde baterií" ≠ „hráč to neuvidí".

## 4b. ZÁKON č. 1 SE POTVRDIL NA VLASTNÍ BATERII (brána češtiny, 2026-08-02)
Tři casy (`hladky-pruchod-loot`, `fikce-veci-vs-mechanika`, `invence-nesmi-opsat-text`)
vyžadují zápis změny kreditů. Model je vynechal 3/3 — a **rule 7 kredity ve výčtu
následků vůbec nemá** (postihy, složení, Žár/šerif, bedny, loot). Tři „selhání modelu"
byla ve skutečnosti moje položka bez opory v promptu, přesně §1.
- **Než z nálezu uděláš selhání modelu, dohledej větu promptu, která to ukládá.**
  Při vyhodnocování brány to platí dvojnásob: nález bez opory zkresluje verdikt
  směrem k „prompt je v pořádku, model je slabý".

## 4c. VSTUP BATERIE MUSÍ VZNIKNOUT Z `buildPromptInput()` — potřetí týž nález
Ověřeno proti `prototyp/src/llm/prompt.js`: baterie píše
`PRAVIDLO RUNU: hodnota se počítá jako 0 (agent Malone nebere úplatky)`, produkce
`pronásledovatel po celý run ruší stat „hodnota“` (ř. 194); `důvod:` píšu ručně
u šesti slotů, produkce ho dopisuje **jen u `gangster_auto_fail`** (ř. 238).
- Důsledek na bráně: KRITICKÉ položky o penězích (3 casy) **prošly na vstupu, který
  hra negeneruje** → nejsou důkazem. Zároveň parenteze se jménem vsadila Malonea do
  dvou scén, kde není — artefakt mého vstupu vypadal jako vada modelu.
- **Pravidlo: ručně psaný vstup smí do baterie jen s poznámkou „optimistický vstup".
  Jinak generuj.** (Viz [[testing-failure-taxonomy]] C1 — zapsáno 2026-08-01
  a přesto zopakováno 2026-08-02.)

### 4c′. PŘEVOD NA `udalosti` NEODSTRANÍ RUČNÍ FIKCI — jen ji schová do POLÍ
Po převodu baterie na `ctx`+`udalosti` (D55) vypadá vstup jako produkční, protože
prochází `buildPromptInput()`. Jenže **hodnoty polí pořád píše ruka** a nikdo je
neověřuje proti enumu enginu. Doloženo D55b: case `solo-jedna-osoba-ctyri-sloty`
nese `duvod: slotova_vyjimka`, ale `resolve.js` emituje výhradně
`proslo | nizky_stat | kombi_neuplny | stat_zrusen | gangster_auto_fail`.
Neprojevilo se to, protože `buildPromptInput()` větví jen na `gangster_auto_fail` —
**vada byla neviditelná právě proto, že to pole nikdo nečte.**
- **Ke každému ručně psanému poli `udalosti` najdi producenta v enginu** (`events.js`,
  `resolve.js`), ne jen konzumenta v `buildPromptInput()`. Pole, které konzument
  ignoruje, je nejnáchylnější na tichou fikci.
- **Odděl „mechanismus neexistuje" od „řetězec nesedí".** Tady byl mechanismus
  reálný (`slot.stitek_citlivy === 'GANGSTER'` štítek obchází), špatná byla jen
  nálepka — verdikt „kosmetické", ne „scénář je vymyšlený". Ověř to, než to nahlásíš.
- **Druhá polovina téhož:** čísla v `udalosti` ověř proti `rules.js`. D55b našlo
  Žár nesedící s `zaPrusvih: 2` / `zaSNasledky: 1` u šesti casů. Baterie tím
  netrpí (`ocekavani` se svými `udalosti` souhlasí), ale scénář neodpovídá hře —
  a to je nález pro vlastníka enginu, ne pro obsahové kolo. **Nahlas, neopravuj.**

## 4d. PRAVIDLO, KTERÉ NESEPNULO ZA TŘI KONFIGURACE, JE MRTVÉ (2026-08-02)
„3–5 vět" (rule 1) nedodržel model **ani jednou ze 39 generací** napříč třemi
nezávislými konfiguracemi (400 tok./t=1,0 · 800/t=1,0 · 800/t=0,5). Položka
`3–5 vět` je proto v pěti casech garantované selhání — a garantovaně selhávající
položka je zrcadlový obraz §1: **stejně nefalzifikovatelná jako položka, která
projde vždycky.** Nese nulovou informaci a zároveň zkresluje verdikt k „model je
slabý".
- **Test:** existuje generace, ve které tahle položka PROŠLA? Když ne přes tři
  konfigurace, je to kandidát na škrt v promptu i v baterii, ne na přísnější znění.
- **Pozor na záměnu s §3:** mrtvé *vstupní pole* model ignoruje (0 zmínek);
  mrtvé *pravidlo* model porušuje (0 dodržení). Diagnóza je opačná, lék podobný.

## 4e. DRUHÉ RAMENO A/B JE PROTIDŮKAZ K „PROŠLO" V PRVNÍM
Tři KRITICKÉ položky o penězích „prošly" v ramenu t=0,5 — a v ramenu t=1,0 na témž
vstupu model napsal „podezřelý nedisponuje finančními prostředky", tedy přesně
zakázané tvrzení. **Průchod v jednom rameni při n=1 není vlastnost pojistky, je to
los.** Když máš dvě ramena, čti je jako jeden vzorek o dvou generacích: položka,
která padne v kterémkoli z nich, je nespolehlivá, ne „většinou v pořádku".

## 4f. DÉLKU MĚŘ BEZ TITULKOVÉHO ŘÁDKU (3. běh, 2026-08-02)
Model přidává hlavičku („PROTOKOL VYŠETŘOVÁNÍ č. 1847") ve 13/13 generací.
Když se strop měří na celém výstupu, **měří se zčásti formátový šum** — a až
se hlavička podaří odstranit, strop se tiše posune a bude vypadat, že se text
zkrátil. Rozdíl je 20–35 zn., tj. u hraničních casů rozhoduje.
- **Vždy uveď obě čísla** (`delka_cela`, `delka_bez_titulku`) a kritérium
  vyhodnocuj proti druhému.
- Totéž platí pro počet vět: titulek není věta.

## 4g. MRTVÁ VSTUPNÍ POLE — TŘETÍ MĚŘENÍ, VERDIKT UZAVŘEN
`ZÁCHRANA` 0/2 · gap proti `MAX DOSAŽITELNÉ` 0/3 · napříč třemi běhy nula zápisů.
§3 žádala „proměř na 5 generacích, než se za pole platí další kolo" — proměřeno,
**doporučení je vyřadit je ze vstupního formátu**. `kredity` 2/13, ale **obě
zmínky uvnitř formátového šumu** (strojový blok) — pole není mrtvé, jen jeho
jediný projev je kanál, který se snažíme zavřít.
- **Nový poddruh:** pole, které se projeví JEN v porušení jiného pravidla, je
  horší než mrtvé — vypadá živě a přitom táhne k vadě. Rozlišuj „0 zmínek"
  od „zmínky jen ve vadném tvaru".

## 4h. n=1 ROZHODUJE JEN O VELKÝCH EFEKTECH; U MALÝCH JE TO LOS
3. běh dodal 13 generací místo předregistrovaných 39 (1 na case místo 3).
- **Metriky s velkým efektem** (13/13, 5/13 proti prahu ≤2) **verdikt unesou** —
  vzorkovací šum je nevysvětlí. Řekni to explicitně, ať se protokolární vada
  nezneužije k zpochybnění verdiktu.
- **Srovnání malých rozdílů neunese nic** (KRITICKÉ casy 6/13 vs. 7/13 = los,
  §4e). U takového čísla piš „beze změny", ne „zhoršilo se o jeden".
- **Nekupuj opakování jen kvůli protokolu.** Přeměřit v0.4.2 na n=3 jen proto,
  že podmínka žádala 39 generací, je platba za potvrzení výsledku, který je už
  jednoznačný. n=3 zabal do PŘÍŠTÍHO kola promptu.

## 5. PROCESNÍ: OPRAVA V YAML BATERII JE NÁCHYLNÁ NA SMAZANÝ KLÍČ
Při vkládání položky mezi `musi:` a `nesmi:` jsem si jedním Edit voláním smazal
řádek `nesmi:` i s první položkou (obojí bylo v `old_string`). YAML zůstal validní,
jen se tři zákazy tiše přesunuly pod `musi`. **Po každé editaci uvnitř `ocekavani`
si přečti okolí a zkontroluj, že oba klíče existují** — chyba tohoto typu baterii
nerozbije hlučně, ale obrátí smysl položek.
