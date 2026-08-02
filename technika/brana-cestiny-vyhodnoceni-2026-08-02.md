# Akceptační brána češtiny — vyhodnocení (D55 / fáze 3)

Vstup: `prototyp/logs/brana-cestiny-2026-08-02.md` (13 casů, Haiku 4.5, prompt v0.4.1).
Hodnotitel: protocol-humor-tester, 2026-08-02. Jedna generace na case (n=1).

## VERDIKT BRÁNY: **NEPROŠLA — ESKALOVAT**

**0 z 13 casů prošlo.** Ale dvě ze tří příčin **nejsou v promptu**, takže „opravit prompt"
by byl špatný závěr:

1. **`MAX_TOKENS = 400`** (`prototyp/src/llm/providers/anthropic.js:23`) usekl **8 z 13**
   výstupů uprostřed slova. Česky je ~2–2,5 zn./token → 400 tokenů ≈ 850–1000 znaků,
   z nichž model 50–120 utratí za markdown hlavičku. **Dokud tohle platí, je měření
   stropu, závorky a úplnosti NÁSLEDKŮ neplatné** — nelze odlišit „model přetáhl 900"
   od „API ho uřízlo". Druhá polovina téže vady: `adapter.js` `jeValidni()` hlídá jen
   délku 20–2000 zn. a **necheckuje `stop_reason === 'max_tokens'`**, takže useknutý
   fragment je „validní" a hráč ho uvidí; fallback nesepne.
2. **Kvalita češtiny** (výhrada D53 z WoZ) je horší, než čemu se dá čelit promptem —
   viz §Vzorec 1. Nejde o styl, jde o nefunkční morfologii a průnik cizího písma.
3. Teprve třetí v pořadí jsou skutečné vady promptu (§Vzorec 3–6).

**Moje predikce („refrén invencí spadne dřív než čeština") byla VYVRÁCENA.** Refrén se
vyskytl 1×; hrubá jazyková vada je ve **13/13** výstupů.

### Co naopak DRŽELO (a je to nejdůležitější zjištění)
**Rule 3 v jádru nebyla porušena ani jednou: žádný z 52 slotů nebyl obrácen na opačný
výsledek.** Auto-fail brokovnice (case 2) držel i s důvodem, kněžský kolárek (case 5)
držel proti fikci věci, banán nikde „nevystřelil do úspěchu", bedna v case 11 se
neztratila. Princip „mechanika rozhoduje, AI vypráví" **na produkčním modelu obstál.**
Sólo klauzule (rule 2) držela 2/2, case 13 učebnicově. Selhává vrstva NAD tím.

---

## METODICKÁ VÝHRADA: baterie testovala vlídnější vstup, než hra posílá

Ověřeno proti `prototyp/src/llm/prompt.js` — **potřetí týž nález (C1 v mé paměti):**

| pole | baterie (ručně) | produkce (`buildPromptInput`) |
|---|---|---|
| `PRAVIDLO RUNU` | `hodnota se počítá jako 0 (agent Malone nebere úplatky)` | `pronásledovatel po celý run ruší stat „hodnota“` (ř. 194) |
| `důvod:` u slotu | ručně u 6 slotů (zrušená hodnota, slotová výjimka, zbraň v lokaci…) | **jen u `gangster_auto_fail`** (ř. 238) |

Dopad: KRITICKÉ položky „nesmí napsat, že nestačily peníze" (case 7, 8, 13) **prošly na
vstupu, který hra negeneruje**. Produkce pošle holé „mělo hodnota 0" bez vysvětlení →
tyto tři passy **nejsou důkazem**. Zároveň produkční znění tlačí do prózy strojová slova
(„stat", „pronásledovatel"), což už teď vyrábí věty typu case 8.
**Před dalším kolem musí `vstup` v baterii vzniknout z `buildPromptInput()`, ne rukou.**

---

## Souhrnná tabulka

Zn. = odhad délky včetně hlavičky. „⊘" = useknuto API.

| # | case | zn. | vět | rule 3 jádro | verdikt | hlavní příčina |
|---|---|---|---|---|---|---|
| 1 | banan-utok-selhal | ≈910 | 8 | ✓ | **SELHAL** | vymyšlené rozuzlení „vozidlo vyproštěno" |
| 2 | brokovnice-auto-fail | ≈960 ⊘ | 5 | ✓ | **SELHAL** | chybí Žár/šerif; `bedňa`, `neuspokojiĺ` |
| 3 | hladky-pruchod-loot | ≈1010 | 9 | ✓ | **SELHAL** | loot obrácen; chybí kredity; jméno NPC |
| 4 | slozeni-lezi-v-aute | ≈950 ⊘ | 7 | ✓ | **SELHAL** | **složený odvezen k šetření (rule 4)** |
| 5 | fikce-veci-vs-mechanika | ≈880 ⊘ | 7 | ✓ | **SELHAL** | „dvě ze čtyř" místo 3/4; chybí kredity |
| 6 | invence-selhany-slot | ≈900 ⊘ | 6 | ✓ | **SELHAL** | role obrácena; vymyšlená příčina |
| 7 | solo-jedna-osoba | ≈1050 ⊘ | 4 | ✓ | **SELHAL** | Malone vsazen do cizí scény; ⊘ Žár |
| 8 | zachrana-vec-k-nicemu | ≈980 ⊘ | 7 | ✓ | **SELHAL** | vymyšlené jméno vyšetřovatele |
| 9 | gap-proti-maximu | ≈870 | 6 | ✓ | **SELHAL** | **„zachovat část nákladu"**; chybí Žár |
| 10 | bez-gapu-neslo-to-lepe | ≈880 ⊘ | 6 | ✓ | **SELHAL** | **cyrilice**; chybí ztráta bedny |
| 11 | past-vymysleny-dusledek | ≈960 | 6 | ✓ | **SELHAL** | **dva vymyšlené výstřely**; `Subsequently` |
| 12 | invence-neopsat-text | ≈895 | 8 | ✓ | **SELHAL** | chybí kredity; refrén „čímž"; jméno |
| 13 | solo-strop-delky | ≈930 ⊘ | 8 | ✓ | **SELHAL** | **aritmetika beden**; žádná závorka |

---

## Per case

**1 · banan-utok-selhal — SELHAL (KRITICKÉ).**
„Vozidlo bylo následně vyprostěno civilními prostředky." — slot „Zapřáhnout" SELHAL a
protokol si dvě věty po sobě odporuje („vozidlo zůstalo uvízlé" → „vyproštěno").
Vymyšlené rozuzlení uzlu = rule 3/4. Banán: „vztyčování zbrane se nekonalo" — selhání
změkčeno na „nedošlo na to". Čeština: `přestoupil s vidlicemi`, `zbrane`, `[neznámo]`
(nevyplněný placeholder). 8 vět.

**2 · brokovnice-auto-fail-viditelna — SELHAL.**
Jádro drží: „zbraň byla v průběhu escalace patrná stojícím oponentům" — auto-fail
zapsán i s důvodem. Ale `musí: pohyb šerifa/Žáru s důvodem` **chybí** (uřízlo se před
ním). „přišlo posádky na ztrátě jedno bedňa alkoholu" — slovakismus + rozbitý rod;
`neuspokojiĺ` obsahuje znak `ĺ`; `escalace`, `nálož v příslušné skupině`, `bez formátu`.

**3 · hladky-pruchod-loot-brokovnice-v-lokaci — SELHAL.**
Loot **obrácen**: „Petrolejová lampa byla přitom ponechána v lokalitě" — posádka věc
získala, protokol tvrdí, že ji nechala. `musí: +3 kredity` **chybí**. Podezřelému D
model podstrčil lampu místo Dědečkovy brokovnice — brokovnice ve výstupu **není vůbec**.
Vymyšlené jméno „Charles Statkář". `hlídkouní psy`, `přimíval`. 9 vět, závěr
„(Všechno hladce, jak se patří.)" je hovorové.

**4 · slozeni-lezi-v-aute — SELHAL (KRITICKÉ, rule 4).**
„podezřelý C … byl **převezen v motorizovaném voze na dalšem šetření**." Složení
(„leží v autě", ve voze posádky) přepsáno na **odvezení k výslechu** — přesně ta pojmová
třída, kvůli které se rule 4 ve v0.4.1 rozšiřovala. Rozšíření na Haiku nedrží.
Navíc „(lehký mozitý postih)" — strojový termín v próze (rule 7) + nonword. Slot
„Najít skulinu": „bez vhodného nářadí a bez znalosti místní geometrie" = vymyšlená
příčina (rule 5); věc „Slzy na povel" vypadla.

**5 · fikce-veci-vs-mechanika — SELHAL.**
Jádro drží pěkně: kolárek „úředník si jej všiml a potvrdil, že věc není k použití".
Ale „Celkový výsledek: **dvě ze čtyř** strategií se ujaly bezezbytku" — mechanika říká
3/4. Číselné zkreslení výsledku = rule 3. `+2 kredity` chybí. „Podezřelý B **měl si
opatřit** vlastní kolky" — vyšetřovatel viní posádku, ač gap = 0.

**6 · invence-selhany-slot-nesedici-vec — SELHAL.**
Role „Zapřít totožnost" přepsána na útok: „pokusil se jej zbavit vědomí petrolejovou
lampou". Není to obrácený výsledek, ale hráč nemůže poznat, o co se pokoušel — přímý
zásah do čitelnosti (metrika 6). „avšak proti Malonovu odhadu nedostačovalo" =
vymyšlená příčina. Žár uříznut na „Šerif se posunul na okraj". `nenechte vyvést z míry`
(2. os. rozkazovací uvnitř úředního zápisu), `servicování`, `zámachu`, `chybřeba`.

**7 · solo-jedna-osoba-ctyri-sloty — SELHAL.**
Sólo drží (jedna osoba, nikdy „jeden… druhý…"), ale „podezřelý A" **4×** místo ≤2.
„služby této povahy však **agent Malone** v daném případě odmítl" — NPC uzlu je
výpravčí v Syracuse; Malone se do scény dostal z parentheze v `PRAVIDLO RUNU`
(vada baterie, viz výhrada výše). Kněžský kolárek přepsán na „falešný průkaz identity".
Žár uříznut. `vymáhavě`, `závodní závoru`, `hovězího výstrojního vývaru`.

**8 · zachrana-vytazena-vec-k-nicemu — SELHAL.**
„**Vyšetřovatel zpravodajství Harlow Casson**" — vymyšlené jméno (rule 2). ZÁCHRANA
nezmíněna vůbec. Peníze: „Bankovky odmítl (hodnota porušuje jeho principy)" —
KRITICKÉ „nestačily peníze" se **nestalo** ✓, ale strojové slovo „hodnota" prosáklo do
prózy. Žár uříznut na „znásobil a pos". `předložil v tašce péči papírové obaly`.

**9 · gap-proti-maximu — SELHAL (KRITICKÉ).**
„Skupině se podařilo **zachovat část nákladu**" — hráč to přečte jako ztrátu beden,
náklad je beze změny 6 (rule 4, třída A3). Druhá vada: „**výstřel** či prudký manévr jej
patrně zasáhl do sluchu" — zakázaný vymyšlený výstřel z banánu. **Všechny čtyři věci
z výstupu zmizely** (banán, svářečka, sekáček, pytel cementu) → mandát rule 5 nesplněn
ani jednou. Žár +2 nezmíněn. `chybřeba odhad síly motoráže`, „Hlídkové vozy zablokují"
(budoucí čas v minulém vyprávění), formulářové `Dne ___________19____`.

**10 · bez-gapu-neslo-to-lepe — SELHAL.**
„prostřednictvím **импровизацe**" — **cyrilice uprostřed českého slova.** Samo o sobě
stačí na zamítnutí brány. Ztráta 1 bedny **nezmíněna**. Tři selhání ze tří mají
vymyšlenou příčinu („nedostatečně pevnou na celkový váhu", „překvapivé křehkosti
materiálu", „věroučné četbě se … nedostává váhy"). Pozitivně: nevinilo posádku ✓,
výstřel z pistole nepopsalo ✓. `paniki`, `na celkový váhu`.

**11 · past-vymysleny-dusledek — SELHAL (KRITICKÉ ×2).**
Headline past **obstála**: bedna kanadské se neztratila, nerozbila ani nikomu nepředala ✓.
Zato dvakrát vymyšlený výstřel: „**projektil prošel bezpečnostní linii**" a „**vzdálenější
střelba** nepřinesla požadovaný účinek" — při Žáru **klesajícím o sedm**. Přesně směr,
který jsem označil za nejzrádnější. Dále: „(lehký postih; **Subsequently** ovlivňuje
manipulaci s předměty)" — anglické slovo + strojový termín; a připojený strojový blok
„**NÁSLEDKY:** Žár posádky: −7" — model vrátil strukturu vstupu na výstup. Tři závorkové
útvary proti rule 8 (max 1).

**12 · invence-nesmi-opsat-text-veci — SELHAL (nejblíž průchodu).**
Mandát invence tu funguje: kastrol dostal kontrast („nasadil kastrol přes hlavu jako
ochranu, měl-li by se hlídač prudce probudit"), provaz/lopata/páčidlo dostaly ZÁMĚR, ne
parafrázi ✓. Hlídač zůstal spát ✓, žádný hluk ✓, nic se nepohnulo ✓. Padá na: **+3
kredity chybí**; 8 vět; „čímž zajistil" / „čímž umožnil" = táž vazba ve dvou slotech
(rule 6, vzorec B5′ — jediný výskyt refrénu v celé bateri); a závorka je nesrozumitelná
— „(Kdyby to byla některá z těch nelegálních dodávek od **Salandra**, zajímavé, že si ho
sám **neprávil**.)": vymyšlené jméno + nonword.

**13 · solo-bohate-nasledky-strop-delky — SELHAL (KRITICKÉ).**
„**Ze čtyř beden** nákladu se podařilo zabezpečit jednu; **zbývajících pět** zůstalo
v rukou pos[ádky]" — náklad je 5 a čísla si odporují ve větě samé. Hráč si to přepočítá.
`musí: uzavřít závorkou` — **žádná závorka není**, ale příčinou je uříznutí + rozvláčnost,
ne strop; nové znění rule 8 (pořadí škrtání) se tím **neotestovalo**. Sólo naopak
vzorové: „podezřelý A" 2×, dál „Nejprve / Následně / Poté / Když" ✓. Peníze: „úplatek
zlatých hodinek, jenž agent odmítl" — bez „nestačilo" ✓. `koláreču`, `prrámu`,
„břehové infrastruktury" (moderní administrativní registr). 8 vět.

---

## Vzorce napříč 13 výstupy

**1 · Čeština — 13/13 obsahuje tvrdou vadu. Toto je hlavní nález brány.**
- *Cizí písmo a jazyk:* `импровизацe` (10), `Subsequently` (11), `neuspokojiĺ` (2), `bedňa` (2).
- *Neexistující slova:* hlídkouní, přimíval, vymáhavě, chybřeba, motoráže, mozitý,
  rozchvácení, servicování, zámachu, neprávil, koláreču, výstrojního, nárážka.
- *Rozpadlá shoda a pád:* „na celkový váhu", „jedno bedňa", „na dalšem šetření",
  „v slepé ulici", „v spánku", „o průrazu".
- *Zlom osoby a času:* „nenechte vyvést z míry" (rozkaz ve 3. os. zápisu),
  „Hlídkové vozy zablokují" (budoucí čas).
- *Věty bez významu:* „přestoupil s vidlicemi", „udržet nálož v příslušné skupině",
  „tiskářské čáry si vynutily důvěru", „bez formátu, který by útočníky zastavil".

**Diagnóza:** tohle není styl, který se doladí promptem. Je to profil malého modelu
generujícího češtinu **při `temperature` = 1.0** (SDK default — `anthropic.js` posílá
jen `model`, `max_tokens`, `system`, `messages`, teplotu nenastavuje). Vynalézavá
morfologie, průnik příbuzného písma a cizích tokenů jsou učebnicový podpis vysoké
teploty na jazyce s bohatou flexí. **První pokus musí být `temperature`, ne prompt.**

**2 · Useknutí — 8/13.** Viz verdikt. Vedlejší efekt: chybějící NÁSLEDKY v casech 2, 6,
7, 8 nejsou nutně neposlušnost modelu — jsou to položky, na které nedošlo.

**3 · Vymyšlená příčina selhání (A4) — 8/13.** Nejčastější porušení pravidla v celé
sadě. „nikdy PŘÍČINU" v rule 5 je jediná věta uvnitř dlouhého odstavce a Haiku ji
nedrží. Vyžaduje samostatné, krátké pravidlo.

**4 · Věc ze slotu zmizí nebo se zamění — 6/13** (case 9 všechny čtyři). Rule 5 káže
dopsat ZPŮSOB a ZÁMĚR, ale nikde neříká, že **věc musí být pojmenována**. Model
si ji dosadí podle role. Dopad je na čitelnost (metrika 6 lidské brány), ne na čísla.

**5 · Formátový šum — 13/13.** Markdown nadpis, u 9 z nich i blok Věc/Datum/Oddělení,
u case 11 strojový blok NÁSLEDKY. Prompt hlavičky nikde nežádá ani nezakazuje. Stojí
50–120 tokenů z rozpočtu 400 a nese halucinovaná čísla spisů a nevyplněné placeholdery
(`[datum]`, `[neznámo]`, `Dne ___________19____`).

**6 · Rozsah — 13/13 přes 5 vět** (4–9, medián 7). Znakový strop je porušen ve ~8/13,
ale kvůli useknutí neměřitelně. **Věty jsou porušené jednoznačně a nezávisle na
useknutí** — to je použitelný signál: model počet vět zcela ignoruje.

**7 · Strojový slovník v próze — 4/13**: „lehký postih" (4, 11), „hodnota" (8),
„Žár posádky: −7" (11). Rule 7 to zakazuje jednou vedlejší větou.

**8 · Vymyšlená jména — 3/13**: Charles Statkář (NPC), Harlow Casson (vyšetřovatel),
Salandro. Rule 2 zakazuje jména, ale je uvozena větou o označování **podezřelých** —
model to čte jako omezení na posádku.

**9 · Mrtvá vstupní pole.** `ZÁCHRANA` zmíněna **0 ze 4** casů, kde padla (6, 8, 10, 13).
`MAX DOSAŽITELNÉ` gap zaznamenán **0 ze 4** (2, 7, 9, 13). Při n=1 to není důkaz, ale
je to přesně ta diagnostika, kvůli které byla položka do `gap-proti-maximu` psaná.
**Před dalším kolem promptu obě pole proměř na 5 generacích** — pokud zůstane 0/5,
platíme je v každém volání zbytečně.

**10 · Vada baterie, ne modelu: kredity.** Casy 3, 5, 12 vyžadují zápis kreditů —
model je vynechal 3/3. Jenže **rule 7 kredity ve výčtu následků nemá** (postihy,
složení, Žár/šerif, bedny, loot). Baterie tedy žádá chování, které prompt neukládá =
§1 mého zákona falzifikovatelnosti. **Buď kredity do rule 7, nebo položky z baterie ven.**

---

## Návrhy oprav (NEAPLIKOVÁNO — prompt needituji)

**Pořadí je závazné: 1–2 před jakoukoli změnou promptu, jinak se měří šum.**

1. **`MAX_TOKENS` 400 → ~700** a v `adapter.js` odmítnout odpověď se
   `stop_reason === 'max_tokens'` jako nevalidní → fallback. *(technical-developer)*
2. **`temperature: 0.4–0.6`** do `anthropic.js`. Jednořádková změna, nulový dopad na
   cenu, a je to nejpravděpodobnější příčina §Vzorec 1. **Změřit A/B na téže baterii.**
   *(technical-developer + já)*
3. **Baterie: `vstup` generovat z `buildPromptInput()`**, ne ručně (§Metodická výhrada).
4. Teprve pak prompt, čtyři cílené věty:
   - **rule 1:** doplnit „Piš souvislou prózu bez nadpisů, hlaviček a odrážek; nikdy
     nevypisuj rubriky vstupu." *(řeší Vzorec 5, uvolní ~15 % rozpočtu tokenů)*
   - **rule 5:** vytáhnout zákaz příčiny na samostatnou větu na konec pravidla:
     „Nikdy nepiš, PROČ se pokus nezdařil." *(Vzorec 3, 8/13)*
   - **rule 5:** doplnit „Věc ze slotu vždy pojmenuj jejím názvem ze vstupu."
     *(Vzorec 4)*
   - **rule 2:** zobecnit ze „podezřelých" na všechny osoby: „Žádnou osobu — podezřelé,
     úředníky, svědky ani sebe — nepojmenovávej vlastním jménem." *(Vzorec 8)*
5. **Otevřená otázka na designéra, nově doložená:** rule 4 v0.4.1 (zadržení/odvedení)
   **na Haiku neudržela** (case 4). Pojmové znění je správně, ale samo nestačí —
   je to kandidát na vlastní krátké pravidlo, ne na větu uvnitř nejdelšího odstavce.
6. **Ekonomika:** body 1–2 mění tvar nákladu (delší výstup = dražší token). Než se
   `MAX_TOKENS` zvedne natrvalo, ať to přepočte operations-economics proti stropu z v0.4.

## Co brána NEZMĚŘILA (a nesmí se to vydávat za změřené)
Strop 900 zn., pořadí škrtání v rule 8, závorka vyšetřovatele, úplnost NÁSLEDKŮ,
odolnost KRITICKÝCH položek o penězích. Vše je pod useknutím nebo pod vadným vstupem.
**Tyto části baterie zůstávají po tomto kole neotestované.**
