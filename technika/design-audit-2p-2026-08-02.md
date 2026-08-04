# Designový audit po prvním 2p sezení lidské brány

> Mandát: nálezy sezení [[../playtesty/2026-08-02|playtesty/2026-08-02.md]] (triáž PM),
> návaznost na [[separabilita-navrh-2026-07-30|technika/separabilita-navrh-2026-07-30.md]]
> a Denisu P0/#1. Autor: game-designer · 2026-08-03 ·
> **NÁVRH KE SCHVÁLENÍ. `rules.js` ani `obsah/` se nedotkly.** Předregistrace §6
> napsaná naslepo před čísly; prověrka kritika (§9) proběhla taktéž před nimi
> a **dva ze čtyř favoritů zabila**. Měření pak zabilo je i potřetí a našlo
> nález, který nikdo nehledal. Škrtnuté verze nechávám viditelné, ať se nevrací.

## 0. Verdikt napřed

Čtyři nálezy sezení jsou **dva** problémy a **dvě komunikační vady** tvářící se
jako mechanické:

| Mandát | Co to ve skutečnosti je | Kde to bydlí |
|---|---|---|
| **1. hádka** | Výsledek uzlu je **skalár** a tým, který ho maximalizuje, nemá o čem hlasovat. Hra ale už v kanonu má vektorovou osu — **kdo to odnese** (§4.7 + §4.12) — a ani engine, ani UI ji nehrají. | nedodržený kanon, ne nová mechanika |
| **2. Malone** | Run-wide zákaz statu je plochý debuff bez rozhodnutí — a **texty rolí mu odporují**, protože jsou sdílené přes oba pronásledovatele. | **kdy** rušení platí (ne kde) |
| **3. Žár** | Trať není eskalace, ale **resetovací smyčka**: prahy se po poklesu Žáru znovu nabíjejí. | přenabíjení prahů, ne hladina |
| **4. prahy** | **Práh 6 v enginu neexistuje** (`resolve.js:67` clampuje na 5). Hra ale naslibuje rozsah do 6 a pak vypíše nepravdivý rozklad. Skutečná vada je práh **5**. | vysvětlující vrstva + supply-aware clamp |

Nejdůležitější věta kola: **hráč se v mandátu 4 spletl v čísle a měl pravdu ve
věci.** Práh 6 nepadl. Padl práh 5 na slotu, kterým **neprojde žádná ze 40 karet
ve hře** — a to se od podvodu nedá odlišit.

**Nález navíc:** baseline měření ukázalo, že **K3 neplní u 2p/3p/4p** (medián
uzlu prvního Zátahu = 2 proti gate {3,4}). Je to **třetí neplněné kritérium
brány** vedle K1 3p/4p a K6a a dosud se o něm nevědělo (§6.1).

---

## 1. Společná diagnóza

Hráčova věta je přesná: *„přeli jsme se jen občas, než se zajela mechanika; pak
už jen přečíst stat a vybrat nejlepší kartu."* Není to nuda z opakování obsahu,
je to **konvergence k algoritmu** — separabilitní kolo ji popsalo formálně
(lineární přiřazovací úloha, ceník 4×4) a u stolu se potvrdila za dva uzly.

Co z toho kola platí a neopakuje se: „přidej mezislotovou vazbu" je vyvrácená
cesta a rodina „sdílený rozpočet → Žár" je mrtvá. Poslední čistá cesta odtamtud
(„vzájemná poloha karet") je tu **záměrně nepoužitá**: řeší defekt B
(separabilitu), zatímco u stolu se ukázal defekt A — **skalarita**. Rozdíl mezi
nimi je jádro dokumentu. Hádka nevzniká z nerozložitelné úlohy, ale z toho, že
**dva lidé chtějí jinou věc** — a jediné místo, kde se dnes zájmy hráčů reálně
rozcházejí, hra nezobrazuje.

**Benchmark.** *Hanabi / The Crew / Magic Maze* vyrábějí tření z asymetrie
(skrytá ruka, jeden komunikační žeton, ticho); všechny tři ale chtějí skryté
ruce nebo omezenou komunikaci, což je u **sdílené obrazovky** (hot-seat
i Remote Play Together) drahé. *Pandemic* má sdílené, plně viditelné optimum
a je učebnicovým alfa hráčem — náš dnešek. Naopak *Robinson Crusoe* má sdílený
cíl i plnou informaci a hádá se pořád, protože dopady jsou **osobní**: kdo se
nenají, kdo si vezme zranění
([recenze](https://coopboardgames.com/cooperative-board-game-reviews/robinson-crusoe-board-game-review/)).
Nejlevnější dostupná divergence pro sdílenou obrazovku není skrytá informace,
je to **osobní následek**.

---

## 2. Mandát 1 — HÁDKA

### 2.1 Diagnóza

`applyBandConsequences` (`state.js:609–626`) vezme `propadli[0]` — **vlastníka
prvního propadlého slotu v pořadí indexů** — a dá mu postih. Osobní následek
tedy **už existuje**, jenže jeho příjemce určuje **pořadí slotů v YAML**, ne
rozhodnutí hráčů, a UI to **nikde neříká**. Kanon přitom slibuje obojí: §4.12
*„Hráč vlastní své karty a nese následky (postihy). Ostatní radí a navrhují
rozdělení, ale **vlastník karty musí souhlasit**."* **Není to chybějící
mechanika, je to nezahraný kanon.**

### 2.2 V1-A „Kdo to schytá" (favorit) — dva oddělené kroky

**Krok 1 (měřitelný teď):**
1. **Oběť = vlastník propadlého slotu s největší mezerou** (`prah −
   stat_hodnota`) **mezi statovými propady**. Propady z tvrdého pravidla
   (GANGSTER auto-fail, zámkový postih) jdou na řadu, až když statový propad
   není — jinak by obětí byl deterministicky ten, komu D17 vnutil zbraň do
   viditelné role (nález kritika). Tie-break nejnižší index, a podíl těch remíz
   se **měří** (A4): v nich se pravidlo vrací k dnešní arbitrárnosti.
2. **UI to říká PŘED rozdělením** — u slotu jméno vlastníka karty a řádek
   „postih dostane majitel nejhůř propadlé věci".

**Krok 2 (samostatné rozhodnutí): souhlas vlastníka = VETO.** Kritik má pravdu,
že „jen omezení, kdo smí táhnout" je no-op — množina dosažitelných rozdělení se
nezmění. Buď je souhlas **veto** (vlastník smí umístění odmítnout, poslední
slovo má rotující držitel mapy), a pak je to mechanika, kterou je nutné
modelovat v botovi a měřit proti celé bráně, **nebo se nedělá vůbec**. Do tohoto
kola jsem ho nepustil: botí politika vyjednávání neexistuje a vyrobit ji naslepo
znamená měřit vlastní fantazii.

Proč to vyrobí hádku: výplata přestane být skalár. Dvě rozdělení se stejným H
už nejsou zaměnitelná — liší se v tom, kdo bude příští uzel hrát s postihem.
A hráč s kartou ve slotu s prahem 5 dostane větu, kterou u stolu vysloví:
*„tam ji nedávám, to schytám já."*

### 2.3 Cena a rizika

- **Neopravuje separabilitu H** — a nemá: léčí defekt A, ne B.
- **V sólu je neviditelná** (jeden vlastník = žádné vyjednávání), a sólo je
  jediná pravidelně testovaná buňka (Denisa #5). **Mandát 1 se z domácího
  testování nedá ověřit** — přiznaná díra.
- **Obětní beránek** by byl modální výstup, ne okrajové riziko (kritik): slabá
  ruka nese oběť uzel za uzlem → cap 2 → složení → hráč sedí kolo–dvě mimo hru.
  Původní A3 (rozptyl počtu postihů) to nezachytí, protože cap 2 rozptyl srazí;
  **A3 se proto přepsalo na složení** (§6).
- **Počet postihů se nemění, jen adresát** → doloženo, že se brána nehne (§6.1).

### 2.4 Zamítnuté varianty

- **V1-B „Ruka na ruby"** (skryté ruce při commitu) — míří na totéž přes
  informaci a je to **jediná známá páka na breach K1 3p/4p** (D35: co-op výběr
  4 z 12). Cena: sdílená obrazovka → čestnostní pravidlo. Záložní páka;
  překrývá se s aktivací `hraci[n].ruka` (D39) = rozhodnutí uživatele.
- **V1-C rotace / výměna karet** — podnět „kdyby se víc točily karty" je
  pravdivý, ale je to **pestrost, ne tření**: výměna bez divergentních zájmů je
  míchání. Patří k Denise #4 / D54(2).
- **V1-D divergence tajných cílů (proti D44)** — smím navrhnout otevření
  a navrhuji ho **neotevřít**: sezení nechalo **metriku 4 (reveal cílů)
  nevyplněnou** a D44 zastavil ladění cílů právě s odůvodněním „až to lidi
  řeknou". Neřekli. **Podmínka: příští sezení metriku 4 vyplní.**

---

## 3. Mandát 2 — MALONE

### 3.1 Diagnóza

`pronasledovatele.yaml:37`: *„počítá se stat HODNOTA jako 0 ve VŠECH
hodnota-slotech CELÉHO runu … Úplatky na něj ani na nikoho po trase neplatí."*
(1) **Plochý debuff** — žádné rozhodnutí, jen odečet. (2) **Zabíjí ~6 ze 40
věcí** na celý run; **7 z 15 situací má hodnota-slot**, takže skoro každý druhý
běžný uzel má jeden slot předem propadlý — a hráč do něj stejně **musí** něco
dát (D17). (3) **Texty rolí odporují pravidlu** („Na přilepšenou", „Peníze na
stůl", „Podmáznout dlaň") a nejdou opravit bez zásahu do pravidla: role jsou
v běžných situacích, které se hrají s **oběma** pronásledovateli.

### 3.2 ~~V2-A zúžení na Maloneovy vlastní uzly~~ — ZABITO DVAKRÁT

Kritik doložil, že **v žádném z uzlů, kam se rušení zužuje, hodnota-slot není**
(léčka: improvizace/obrana/nástroj/útok · konfrontace: útok/obrana/improvizace
/útok · `zatah`: útok/nástroj/improvizace/obrana). Zúžení by pravidlo nevyplo,
ale **smazalo**. Měření to potvrdilo doslova: uzly s ≥1 nulovaným slotem
**22–24 % → 0,00 %**, a ta „úleva" přesto stála K1 **+2,55 až +5,00 b.**
a prolomila **K2 floor (20,95 → 18,35** proti gate ≥20). Táž vada zabíjí
i variantu „překlopit hodnota-slot na improvizaci u jeho uzlů" — překlápí
prázdnou množinu. **Obojí se nevrací.**

### 3.3 Opravené varianty

**V2-A′ „Malone dotahuje" (nový favorit, nezměřeno).** Rušení hodnoty se zapne
teprve **po prvním překročení prahu Zátahu**; do té doby berou hlídky peníze.
Tři důvody: (a) **je to kanon** — `prototyp-mvp.md:209–210` říká, že
pronásledovatel *„nemá vlastní tahy — jedná výhradně přes prahy Žáru"*, a dnešní
run-wide rušení je jediné místo, kde jedná mimo trať; (b) **vyrábí dvě
rozhodnutí** — utratit drahé úplatky brzy, dokud platí, a hlídat Žár i kvůli
měně, ne jen kvůli šerifovi; plochý debuff se mění v **hodiny**; (c) **skutečně
zabírá**, na rozdíl od V2-A — běžné uzly s hodnota-slotem přicházejí po Zátahu
dál. Pozor: baseline K3 = 2 u týmů (§6.1), takže se u nich Malone zapne dřív,
než se čekalo — per-count efekt se musí změřit.

**V2-D „neúplatný, ne slepý" (druhá volba).** Rušení není nula, ale **strop**:
hodnota se u Malonea počítá nejvýš jako 2. Nízké prahy projdou, vysoké ne;
hodnota-karty přestanou být mrtvé papíry. Fikce drží („lesk zlata federála
zdrží, koupit ho nejde"). Cena: nová varianta pole `rusi` (`typ: stat_cap`).

**V2-C držet + opravit komunikaci** — škrtnutá čísla hodnoty na kartách
a slotech. Nulové riziko, ale nález neřeší: hráč nepsal, že tomu nerozumí,
psal, že to **není zábava**. Fallback.

**K5 / D25e:** D25e chránil identitu před **kalibrací**; tohle je lidský nález
(precedens D39). U V2-A′ ani V2-D se identita neruší — mění se **kdy**, resp.
**jak tvrdě**. Riziko je na K1, na K2 floor (doloženo u V2-A) a na symetrii
pronásledovatelů, kterou projekt nikdy nevyslovil (D33) — proto se kritéria B
měří i **per pronásledovatel**.

---

## 4. Mandát 3 — TEMPO ŽÁRU

### 4.1 Diagnóza

| Stížnost hráče | Mechanismus | Doloženo (§6.1) |
|---|---|---|
| „skoky ±7 jsou moc velké" | `poPrezitiKonfrontace: 3` srazí Žár z 8–10 na 3 | poklesů o ≥3: **1,00 na run** (2p–4p) |
| „dopad zásahu ve 3./5./8. kole je stejný" | přírůstky jsou konstantní (+1/+2), trať nemá eskalaci | — |
| „4–5× za run uteče problém z lopaty" | prahy se po poklesu Žáru **znovu nabíjejí** → smyčka, ne oblouk | **35 % 2p runů má 2+ konfrontace**; 1,31 konfrontace a 1,47 léčky na run |

Prototyp-mvp slibuje „snowball citelný od ~3. uzlu". Trať místo snowballu dělá
**pilu** — a největší číslo systému hráč nezvolil, nezaplatil a nemohl ovlivnit.
Navíc **Zátah přichází druhý uzel** (K3 = 2 u týmů), takže eskalace nemá kde
začít.

**Dvě pasti, obě doložené.** (1) **D38:** „míň polí" se **nesmí** implementovat
jako komprese prahů — při prazích ≤3 předběhne léčka zátah a 82 % týmových runů
má ≥2 konfrontace; D39 to zamítl. (2) **Moje původní `poPrezitiKonfrontace:
3 → 6` byla táž chyba jinou cestou.** Kritik ji odvodil z kódu (prahy se
přenabíjejí jen při poklesu **pod** ně, takže při týmových prazích 2/5/8 by se
léčka už nikdy nenabila) a měření to potvrdilo: **runů s 2+ konfrontacemi
25,6 / 48,3 / 45,0 / 44,2 %**, léček u týmů **1,47 → 0,92**, K1 1p **−7,05 b.**,
K6a **21,65 → 25,85**. **Stahuje se.**

### 4.2 Opravená varianta

**V3-A′ „jeden klimax za run" (favorit, nezměřeno).** Nemění se hladina, mění se
**přenabíjení**: práh konfrontace se po přežití **nepřenabíjí vůbec** a Žár
klesne o **−3** (ne na 3). Léčka a Zátah se přenabíjejí dál, takže tlak
nezmizí — jen nehrozí druhé finále. Fikce: federál se jednou splete, podruhé
ne; ulice po vás jdou dál. Proti C1 nemá jeho failure mode: nedrží Žár u prahu,
takže léčky nevypíná.

**V3-B eskalace přírůstku** (PRŮŠVIH +2 dole, +3 nad polovinou trati) —
**změřeno a bezpečné**, ale drobné: K1 −1 b., K6a beze změny, 2+ konfrontace
15,3 / 39,6 / 34,2 / 34,3 %. Dodá „pozdní zásah bolí víc", reset neopraví.

**V3-C jen komunikace** — u pohybu šerifa dopsat „ještě 2 pole k Zátahu";
vysvětlující vrstva to dnes umí jen zpětně. **Povinné bez ohledu na A/B.**

**Benchmark:** kde „někdo v zádech" opravdu drtí, stopa nejde zpátky — Pandemic
(značka Ohnisek se nikdy nevrací,
[pravidla](https://officialgamerules.org/game-rules/pandemic/)) a Burgle Bros
(stealth žetony se neobnovují,
[recenze](https://coopboardgames.com/cooperative-board-game-reviews/burgle-bros-review/)).

---

## 5. Mandát 4 — NEŘEŠITELNÉ PRAHY

### 5.1 Diagnóza: spletl se v čísle, měl pravdu ve věci

Práh 6 **nemůže padnout** — `resolve.js:67` (`Math.min(statMax, kotva + sum)`),
clamp je tam od D22 jako ochrana K5. Odkud tedy „padl 6"?
1. **Anotace při odhalení** (`vysvetleni.js:367`) hlásí *„kotva 4, šum ±2 —
   přesný práh až po vyhodnocení."* Hráč si spočítá rozsah 2–6, o stropu se
   nedozví.
2. **Rozklad po vyhodnocení** (`vysvetleni.js:262`) vypíše *„Práh 5 = kotva 4
   +2."* **Aritmeticky nepravdivá věta — u 8,85 % všech slotů** (§6.1). Tak se
   rodí „hra podvádí".
3. **Skutečná vada je supply.** Stat 5 má ze 40 věcí: útok **2** (obě GANGSTER),
   obrana **1**, hodnota **3**, improvizace **1**, nástroj **1**. Naměřeno:
   práh 5 padne na **26 %** slotů a u **72–82 %** z nich neprojde **žádná karta
   v celém týmu**.

**Nejtvrdší doklad je analytický.** `rival-prepad`, `mesto-ulicka`
a `urednik-vaha` (všechny `npc`) mají **viditelný útok-slot s kotvou 4**;
u `urednik-vaha` si o něj telegraf výslovně řekne („Zvýšit na něj hlas … bude
muset někdo z posádky"). Šum ±2 → práh 5 padne ve **41,15 %** jejich výskytů
(měřeno) a nejvyšší útok mezi **non-GANGSTER** věcmi je **4**, přičemž obě
útok-5 věci jsou GANGSTER a ve viditelné roli `npc` auto-failují. **Ve 100,0 %
těch případů nemá tým jedinou legální kartu** — ani gamblem, ani dokonalou hrou.

**Vztah k zapečenému kanonu (nález kritika).** Hlavička `obsah/situace.yaml`
(pravidlo 1b/2, D51/D52) tenhle slot **vědomě autorizuje**: *„viditelný
útok-slot u npc obslouží ~4 karty ze 40 … Je to přiznaná SÁZKA."* Tu sázku
**neruším** — je uzavřená na **kotvě** a ≈4 karty ze 40 je tvrdé, ale hratelné.
Sázka ale mlčky předpokládá práh ≈ kotva; při šumu +1/+2 se z „tvrdé" stává
„nemožné" a to autor sázky neschvaloval. Rozdíl mezi **tvrdý** a **nemožný** je
celý tenhle mandát. Střet s D17 je proto zdánlivý: D17 mluví o slotu, kde je
volba **špatná**, tady jde o slot, kde **žádná volba neexistuje**.

### 5.2 Varianty

**V4-C komunikace (favorit, část 1 — bez rizika).** (1) anotace odhalení řekne
strop: *„kotva 4, šum ±2 — výš než 5 práh nejde"*; (2) rozklad pojmenuje clamp:
*„Práh 5 = kotva 4 +2, zastropováno na 5"*.

**V4-D „supply-aware clamp" (favorit, část 2).** Práh se neclampuje na
`statMax`, ale na **nejvyšší stat dosažitelný kartou, která je v tom slotu
legální** — u viditelných slotů v situacích, kde GANGSTER auto-failuje, se
z množiny vyloučí GANGSTER věci. Pro viditelný útok-slot v `npc` je strop **4**.
Počítá se jednou při načtení obsahu, nemění ani jednu kartu, nedělá power creep
a **zachovává přiznanou sázku** (slot dál obslouží ~4 karty ze 40, jen přestane
být neprůchozí).

**~~Obsahová podlaha „≥3 non-GANGSTER věci se statem 5 na každý stat"~~ —
STAŽENO.** Kritik má pravdu: znamenalo by povýšit **9 ze 40 karet** na maximální
stat (22,5 % balíku) ve chvíli, kdy K1 3p/4p breachuje **nahoru**, a sáhlo by
na K4b. Špatný nástroj na správný nález.

**V4-B asymetrický šum** (`šum ∈ {−2 … +1}` tam, kde by clamp zabral) — pojistka,
kdyby se V4-D ukázalo jako moc drahé. **V4-A clamp na 4 globálně** se
nedoporučuje: zlehčí hru špatným směrem a D17 přijde o horní patro.

---

## 6. Předregistrace kritérií

Napsáno **naslepo před měřením**. ⟳ = opraveno po prověrce kritika (tedy pořád
před čísly); původní znění nechávám kvůli poctivosti.

| # | Kritérium | Práh / kill | Předpověď |
|---|---|---|---|
| **A1** ⟳ | ~~volná identita oběti mezi max-H rozděleními~~ → **ex ante**: podíl uzlů, kde se `argmax_i P(oběť = i)` liší mezi rozděleními se stejným `E[H]` | ≥ 40 % · **< 20 % = kill** | 40–60 % |
| **A1b** ⟳ | **kladná cena**: podíl uzlů, kde rozdělení s `E[H] − 1` striktně snižuje `P(oběť = já)` pro hráče s ≥1 postihem | „zřetelně > 0" | 10–20 % |
| **A2** | regrese: \|ΔK1\| per count · K2 floor · K6a | ≤ 3 b. · ≥ 20 % · +2 b. | ΔK1 do 1 b. |
| **A3** ⟳ | ~~rozptyl postihů~~ → **runů s ≥1 složeným hráčem** a **uzlů strávených složením** | nárůst ≤ 3 p. b. | +1 až +3 p. b. |
| **A4** ⟳ | podíl výběrů oběti rozhodnutých tie-breakem | diagnostika; > 50 % = pořád arbitrární | 25–40 % |
| **B1–B4** | K5-D a K5f **per pronásledovatel i pooled** · K1 3p/4p · podíl **Maloneových** uzlů s nulovaným slotem | K5-D ≤ 10 % · K1 ≤ +3 b., **> +5 = kill** · pokles < 1/3 | K1 +2 až +4 b. |
| **C1** | K3 (medián uzlu 1. Zátahu) | ∈ {3, 4} | beze změny |
| **C2** ⟳ | **konfrontací na run, obě ramena, per počet** | medián 1 ∧ 2+ konfrontace **≤ 15 %**, **> 30 % = kill** | baseline 25–40 % |
| **C2b** ⟳ | runů s ≥1 léčkou | nesmí klesnout o > 10 p. b. | — |
| **C3** | K1 per count · K5f | K1 ≥ 45 všude · K5f ∈ [60, 80] | K1 −2 až −5 b. |
| **D1–D5** | práh 5 · clamp · nepokryté prah-5 sloty (commit / tým) · viditelné útok-sloty | diagnostika | 20–25 % · ~8 % · > 80 % · 1p 50–70 % · ~100 % |
| **D6** ⟳ | **V4-D**: ΔK1 · K5-D · podíl dotčených slotů | \|ΔK1\| ≤ 2 b. · K5-D ≤ 10 % | dotčeno < 3 % slotů |

**Kdy páku nepoužít:** A1 < 20 % nebo A1b ≈ 0 → V1-A je kosmetika a hádka nemá
kde bydlet jinde než v D44 (rozhodnutí uživatele **po** sezení s metrikou 4) ·
A3 nad prahem → V1-A se nezapéká („jeden hráč sedí mimo hru" je horší večer než
„nikdo se nehádá") · B nad kill → V2-A′ jen s kompenzací, a ta je další kolo ·
C2 > 30 % nebo C2b < −10 p. b. → V3-A′ se nezapéká (byla by to táž strukturální
změna, kterou D39 zamítl) · D6 mimo → zbývá jen komunikační část V4-C ·
**nesejde-li se baseline** s publikovanými čísly, neplatí nic z dokumentu.

### 6.1 Naměřeno

Bot `kompetentni`, **2 disjunktní bloky × 8000 runů** (2000/buňka, D39-ii),
izolovaný worktree. **Baseline sedí** (K1 57,65 / 66,90 / 77,60 / 79,30 ·
K6a 21,65 · K5-D 9,65 · K5f 76,7 · K2 floor 20,95 · medián Žáru 6).

| # | Předpověď | Naměřeno | Verdikt |
|---|---|---|---|
| **D1** práh 5 | 20–25 % | **26,10 %** | mírně podstřeleno |
| **D2** clamp = vypsaná nepravda | ~8 % | **8,85 %** (34 % prah-5 slotů) | trefa |
| **D3** neprojde nic z commitu | > 80 % | **82–85 %** | trefa |
| **D4** neprojde nic v týmu | 1p 50–70 % | **1p 81,80 · 4p 71,75 %** | **výrazně podstřeleno** |
| **D5** viditelný útok-slot `npc`/`lecka` | ~100 % | **41,15 %** má práh 5, z toho **100,0 %** bez legální karty | konstrukční důkaz potvrzen |
| **A1** | 40–60 % | **71,5 / 73,4 / 77,9 %**; jen uzly, kde postih padne: **93,9 / 96,2 / 100,0 %** | prošlo — s výhradou 1 níže |
| **A2** | ΔK1 do 1 b. | ΔK1 **0 / −0,05 / −0,85 / +0,20**; K2, K6a, K5-D, K5f, Žár beze změny | **prošlo, změna je zdarma** |
| **A3** | +0,1–0,3 | 1,65→1,64 · 2,05→2,03 · 2,14→2,17 | bez nárůstu |
| **B** V2-A | K1 +2–4 b. | K1 **+5,00 / +3,80 / +3,60 / +2,55** · **K2 floor 18,35** (pod gate) · nulované sloty 22–24 % → **0,00 %** | **kill** |
| **C1** 3→6 | K1 −2 až −5 | **K1 1p −7,05** · **K6a 25,85** · 2+ konfrontace **25,6 / 48,3 / 45,0 / 44,2 %** · léček u týmů 1,47 → **0,92** | **kill** |
| **C2** eskalace | — | K1 −1 b. · K6a beze změny · 2+ konfrontace 15,3 / 39,6 / 34,2 / 34,3 % | prochází, efekt drobný |

**Baseline diagnostika, kterou nikdo neměřil:** K3 medián **3 / 2 / 2 / 2**
(gate {3,4} → **breach u 2p/3p/4p**) · konfrontací na run 0,92 / 1,31 / 1,20 /
1,20 · **runů s 2+ konfrontacemi 10,5 / 35,0 / 29,1 / 29,2 %** · léček na run
1,00 / 1,47 / 1,42 / 1,43 · poklesů Žáru o ≥3 rovná **1,00 na run** u týmů.
Hráčovo „4–5× za run uteče problém z lopaty" je tím doložené.

**Tři výhrady k vlastním číslům:**
1. **A1 změřilo definici, kterou kritik zabil** (zadání odešlo před prověrkou).
   71–100 % tedy dokládá jen to, že **identita oběti je dnes prakticky vždy
   volná a rozhoduje o ní pořadí slotů v YAML** — což je samo o sobě nález.
   **Nedokládá, že se o ni lidé budou přít.** A1′ a A1b zůstávají nezměřené
   a jsou podmínkou kroku 2.
2. **A3 nic neukázalo, ani ukázat nemohlo.** Doprovodná čísla (4p: nejvíc
   postižený 2,28 postihu na run, nejméně 0,17) vypadají alarmivě, ale při ~4,4
   postizích mezi 4 hráči to zhruba odpovídá i **náhodnému** rozdělení.
   Systematický beránek se nedokládá — a moje změna žádný nevyrábí.
3. **Pod rameny neběžely K4c/K4d, K7, K8, K9** — o learnabilitě, gamblu
   a ekonomice se z tohoto kola nesmí tvrdit nic. **V2-A′ a V3-A′ jsou
   nezměřené**, obě vznikly až po prověrce.

### 6.1.1 Dodatek — přeměření finální definice v produkčním kódu (D57, 2026-08-03)

V1-A krok 1 přistálo v enginu (`state.js` `vyberObet` + `statovaMezera`, viz
commit) přesně dle §2.2: oběť = vlastník propadlého slotu s NEJVĚTŠÍ statovou
mezerou (`prah − stat_hodnota`, u kombi slotu horší ze dvou statů) mezi
**statovými** propady (`nizky_stat` / `stat_zrusen` / `kombi_neuplny`); bez
statového propadu padá zpět na první tvrdý propad v pořadí slotů (`gangster_
auto_fail` / zámkový postih) — přesně dřívější `propadli[0]` chování, teď jako
fallback, ne default. Tie-break nejnižší `slot_index`. Pokryto TDD (3 nové
testy v `state.test.js`: největší mezera vyhrává, remíza řeší nejnižší index,
fallback na tvrdý propad beze statu).

**Přeměření:** bot `kompetentni`, **2 disjunktní bloky × 8000 runů (2000/buňka
= 1000 seedů/pronásledovatel × 2 pronásledovatelé, D39-ii metodika)**, seedy
1–1000 a 1001–2000, přes finalizovaný produkční engine (ne worktree-preview
jako u A2 výše).

| # | Baseline (§6.1, bez V1-A) | Naměřeno teď (V1-A krok 1, mean přes 2 bloky) | Δ | Horní mez |
|---|---|---|---|---|
| K1 1p | 57,65 | 57,65 | **0,00** | ≤0,85 |
| K1 2p | 66,90 | 66,65 | **−0,25** | ≤0,85 |
| K1 3p | 77,60 | 76,85 | **−0,75** | ≤0,85 |
| K1 4p | 79,30 | 79,90 | **+0,60** | ≤0,85 |
| K6a spread | 21,65 | 22,25 | +0,60 | diagnostika (blok-šum 2sd ≈2,1, viz `variance.md`) |
| K2 pozdní PRŮŠVIH-rate (floor) | 20,95 | 20,90 | −0,05 | beze změny |
| K5 varianta D (expDead) | 9,65 | 9,65 | **0,00** | beze změny |
| K5f přežití konfrontace (pooled) | 76,70 | 77,15 | +0,45 | beze změny |
| medián Žáru | 6 | 6 | 0 | beze změny |

**Verdikt: PROŠLO.** Žádná metrika nepřekročila deklarovanou horní mez
(ΔK1 ≤0,85 b.); K2/K5/K5f se pohnuly jen v rozsahu, který blok-to-blok šum sám
vyrábí (K6a mezi vlastními dvěma bloky kolísá o 2,1 b., viz tabulka výše —
+0,60 na K6a je uvnitř toho pásma, ne signál). Profil ΔK1 (0,00 / −0,25 / −0,75
/ +0,60) sedí se směrem i řádem preview měření z A2 (0 / −0,05 / −0,85 / +0,20)
— stejný závěr, dvě nezávislá měření: **změna je zdarma**. K5-D vyšlo dokonce
bit-přesně stejné (9,65 = 9,65). STOP podmínka (ΔK1 >1 b. nebo pohyb K2/K5/K6a)
se **nenastala** — engine i UI část (assign obrazovka: „postih dostane majitel
nejhůř propadlé věci" před rozdělováním) se commitují.

---

## 7. Co navrhuji uživateli rozhodnout

1. **V4-C (komunikace) — hned, bez měření.** Opravuje aritmeticky nepravdivý
   rozklad u 8,85 % slotů.
2. **V1-A krok 1 — doložená nulová regrese** (A2 prošlo přes celou bránu).
   Kupuje se čitelnost a osobní stakes **zadarmo**. Krok 2 (veto) je samostatné
   rozhodnutí podmíněné A1′/A1b a lidským sezením.
3. **V4-D (supply-aware clamp)** — podmíněno D6 (nezměřeno).
4. **V3-A′ + V3-C** — jeden klimax za run + dopředná anotace. **Musí se
   změřit**; C1 ukázalo, jak snadno se tu trefí vedle.
5. **V2-A′** — Malone se zapíná prahem Zátahu. **Musí se změřit**; V2-A je po
   měření mrtvé a D25e se otevírá jen pro tuhle variantu.
6. **Rozhodnout, co s K3.** Breachuje v baseline u 2p/3p/4p a `prototyp-mvp.md`
   to nevede jako známý stav: buď čtvrtá vyčíslená odchylka do lidské brány
   (precedens D39), nebo špatně specifikovaný gate — mlčet o něm nejde.
7. **Neotevírat D44**, dokud sezení nevyplní metriku 4. **Nevzkřísit** rodinu
   „rozpočet → Žár", výměnu karet jako lék na hádku, obsahovou podlahu se statem
   5, ani zúžení Malonea na jeho vlastní uzly.

## 8. Dopad na kanon a consistency-check

Kdyby se přijalo: `design-dokument.md` §4.7 (jak se vybírá příjemce postihu),
§4.9 (**kdy** pronásledovatel ruší) · `prototyp-mvp.md` §Žár (přenabíjení prahů)
a §Skryté prahy (strop prahu = nejvyšší **dosažitelný** stat). **Nezávisle na
osudu návrhu** patří do tabulky brány stav **K3** (dnes bez naměřené hodnoty,
reálně 3 / 2 / 2 / 2).

### 8.1 Nálezy consistency-check (dnešní stav; kritik je ověřil v souborech, N1–N6 platí)

| # | Kde | Co nesedí | Proč to vadí |
|---|---|---|---|
| **N1** VÁŽNÉ | `prototyp-mvp.md:150–155` × `rules.js:62–67` | MVP hlásí ruce **6/4/4/3**, engine jede **8/5/4/3**, ač CLAUDE.md i hlavička `rules.js` říkají, že čísla se přebírají z MVP | ruce jsou „jediná páka na vyrovnání agency" a záložní páka D39. Kdo ji půjde aktivovat podle MVP, ladí od špatné baseline. |
| **N2** VÁŽNÉ | `prototyp-mvp.md:171–177` (důsledek N1) | „1p a 4p mají po commitu 2 zbývající (1/2), 2p 2 (1/2)" — reálně **1p 4 (1/4)**, **2p 3 (1/3)** | EV gamblu je gate **K7** měřený per počet hráčů; dokument popisuje jiný gamble, než jaký gate měří, a sólo je vedle dvojnásobně. |
| **N3** | `design-dokument.md` §4.7 × `prototyp-mvp.md` Postihy | ani jeden neříká, **kdo** postih dostane; engine (`state.js:610`) bere vlastníka **prvního** propadlého slotu | hráč to zažije každý druhý uzel a §4.12 mu slibuje, že následky nese vlastník. |
| **N4** | `design-dokument.md` §4.9 × `prototyp-mvp.md` Pronásledovatel | obojí „ruší jeden stat/štítek" bez **rozsahu**; `pronasledovatele.yaml:37` z toho dělá run-wide — což odporuje větě „jedná výhradně přes prahy Žáru" o dva řádky vedle | je to celý mandát 2; rozsah patří do obou dokumentů, ne jen do YAMLu. |
| **N5** drobné | `design-dokument.md:204` × `prototyp-mvp.md:203–204` | „Žár roste za hlučné hraní" neříká, že se platí za **committnutou sadu**, ne za rozdělení (`state.js:583`) | nález padl už v separabilitě §9 a je pořád otevřený. |
| **N6** drobné | `prototyp-mvp.md:160–162` × `design-dokument.md` §4.5 | MVP clamp má, vize mluví o „mírném kolísání kolem kotvy" — kolísání ale **není symetrické** (kotva 4 → 2 až 5) | z té asymetrie vznikl celý mandát 4. |

*Křížové odkazy v patičkách jsou v pořádku; škrtnuté nápady (Jackbox, tajné
karty, AI balancování, product placement) nikde nefigurují jako aktivní;
terminologie je napříč dokumenty jednotná.*

## 9. Verdikt design-critica

*Prověrka proběhla nad verzí před opravami a záměrně před čísly. Plné znění je
v historii session; body, které text výše přejal, jsou označené.*

**„Nejlepší diagnóza, jakou tenhle projekt zatím vyprodukoval (§1, §5.1),
a zároveň dva favority, kteří v předložené podobě nedělají nic, a jeden, který
mění strukturu runu jinak, než si autor myslí."**

| Závažnost | Nález | Stav |
|---|---|---|
| KRITICKÉ | **V2-A není zúžení Malonea, je to jeho smazání** — v uzlech, kam se rušení zužuje, hodnota-slot neexistuje; B3/B4 by vyšly „bezpečně", ač je páka vypnutá | přijato (§3.2), měření potvrdilo číslem **0,00 %** |
| KRITICKÉ | **A1 je počítadlo remíz nad orákulem, počtvrté táž vada** — měří velikost množiny remíz (a remízu lze urovnat losem), běží na botovi bez preference o oběti; hádku vyrábí až **kladná cena** | přijato (A1 ex ante + A1b); staré znění se přesto změřilo, viz výhrada 1 v §6.1 |
| KRITICKÉ | **`poPrezitiKonfrontace: 3 → 6` přepíná chování prahů, ne hladinu** (přenabíjení jen při poklesu pod práh → týmu by se léčka nenabila nikdy); K3 to nevidí, C2 byla jen baseline | přijato (§4), měření potvrdilo všechny tři predikce |
| KRITICKÉ | **mandát 4 nemohl selhat a přitom hýbal balíkem nejvíc** — obsahová podlaha = 9 ze 40 karet na maximální stat, bez jediného předregistrovaného prahu | přijato — podlaha stažena, nahrazena V4-D, přidáno D6 |
| VÁŽNÉ | **souhlas vlastníka je no-op** (nemění množinu rozdělení) — buď veto, nebo ceremonie | přijato, §2.2 rozděleno na krok 1 a samostatné rozhodnutí |
| VÁŽNÉ | **obětní beránek je modální výstup, ne riziko**, a A3 ho nevidí, protože cap 2 srazí rozptyl | přijato, A3 přepsáno na složení |
| VÁŽNÉ | **§5.1 podceňuje vlastní důkaz** (třetí uzel `urednik-vaha`) **a mlčky reverzuje zapečenou „přiznanou SÁZKU"** | přijato — uzel doplněn, vztah k sázce vysloven |
| DROBNÉ | tie-break podle indexu vrací arbitrárnost · B3 neměla jmenovatel · mandát 1 se z domácího sóla neověří | → A4 · opraveno · přiznáno v §2.3 |

**Souhlasí bez výhrad:** diagnóza §1 · zamítnutí V1-C · neotevírání D44 · zákaz
komprese trati · V3-C · V4-C body 1–2 · consistency-check N1–N6.

**Otázky kritika a moje odpovědi:** (1) *Je zamýšlený výstup „Malone =
flavor-only"?* Ne — proto V2-A′ mění **kdy**, ne **kde**. (2) *Je souhlas
vlastníka veto, nebo UI omezení?* Veto, a proto se v tomto kole **nedělá**: bez
botí politiky vyjednávání by se měřila fantazie. (3) *Reverzuje se přiznaná
sázka?* Ne. Je uzavřená na kotvě; V4-D odděluje „tvrdý slot" od „neprůchozí
slot" a nemění kartu ani telegraf.

---

*Souvisí: [[../playtesty/2026-08-02|playtesty/2026-08-02.md]] ·
[[separabilita-navrh-2026-07-30|technika/separabilita-navrh-2026-07-30.md]] ·
[[../projekt/rozhodnuti|projekt/rozhodnuti.md]] (D17, D25e, D38, D39, D44, D52) ·
[[../prototyp-mvp|prototyp-mvp.md]] (K1, K2, K3, K5, K5f, K6a, K7) ·
[[../design-dokument|design-dokument.md]] (§4.3, §4.7, §4.9, §4.12)*
