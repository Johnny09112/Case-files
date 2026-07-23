> **PŘEKLOPENO DO KANONU 2026-07-23** — tento soubor je **archiv procesu** pivotu
> na v3 (návrh → kritika → revize D16 → oprava commit modelu D17). **Zdroj pravdy
> je [`design-dokument.md`](../design-dokument.md) + [`prototyp-mvp.md`](../prototyp-mvp.md).**
> Obsah níže se dál neudržuje; slouží k dohledání, *proč* se v3 rozhodlo tak, jak
> se rozhodlo.

---

# DŮKAZNÍ MATERIÁL 1930 — NÁVRH design dokumentu v3
**Pracovní dokument (ke schválení).** Po schválení nahradí `design-dokument.md`
jako v3. Zapracovává pivot na **slotovou resoluci** (rozhodnutí D14/D15,
2026-07-23) a balanční posudek `technika/balanc-posudek-v3-2026-07-23.md`.

> Autor: game-designer. Nic z tohoto souboru není kanonické, dokud ho uživatel
> neschválí a PM ho nepřeklopí do `design-dokument.md` + `prototyp-mvp.md`.
> Čísla jsou **návrhy**; vše označené *(ladit simulací)* čeká na v3 simulační bránu.

---

## Elevator Pitch v3

Zkorumpovaný polda sedí u psacího stroje a sepisuje protokol o partě pašeráků,
kteří se pokusili převézt náklad chlastu z Buffala do New Yorku. Jenže hráči
nehážou kostkou — **cpou věci ze svých kapes do situací**. Šerif chce úplatek,
most má díru, rival vytáhl bouchačku: telegrafem se dozvíš, co se blíží, vytáhneš
věci z kufru — a pak teprve stůl uvidí celý text se čtyřmi rolemi a hádá se, **jak
ty čtyři věci rozdělit co nejméně špatně**. Zlaté hodinky jsou skvělý úplatek a
mizerná páčidlo; když ti do rvačky zbydou, protokol si to užije. Pistole vyřeší
konfrontaci a shodí tě u šerifa, protože gangster se zbraní v ruce se neschová.

**Příběhovka s volbou pro 1–4 hráče.** Nemáš dost dobrých věcí na všechno —
komedie i tření vznikají z toho, že **někam se špatná volba prostě musí dát**.
Mechanika rozhodne, AI to sepíše do suchého protokolu — a čím hůř dopadneš, tím
lepší čtení to je. Rok 1930 je **první „svět"**; další (studená válka, kyberpunk…)
přijdou jako DLC nad stejným jádrem. Jeden run ≈ 30 minut. Mechanika rozhoduje,
AI vypráví.

---

## 1. Vizuál & UX

Estetika **přežívá z v2 beze změny** a je to **finální vize**, ne testovací kulisa
(vizuál současného prototypu je jen placeholder — rozhodnutí uživatele 2026-07-23):

- **Estetika:** hrubší pixel-art / úřední papír v tónu *Papers, Please*. Paleta
  max 16 barev (šedá, hnědá, sepie, černá + krvavě červená pro razítka).
- **Hlavní obrazovka:** stůl vyšetřovatele — lampička, hrnek, popelník, protokol
  v psacím stroji, který v reálném čase **vyklepává** text. Psací stroj maskuje
  latenci AI a vyrábí společný moment čtení nahlas. (Jediný povinný efekt prototypu.)
- **Mapa jako důkaz:** dobová **kreslená mapa Buffalo → New York** ve stylu
  *Slay the Spire* — větvící se cesta uzlů. **Šerif ji křížkuje**: jak roste Žár,
  posouvá se po mapě za tebou a odškrtává, kudy jsi prošel. Mapa *je* měřidlo
  pronásledování — hráč nesleduje číslo, sleduje, jak blízko je klobouk.
- **Okraj spisu:** u jmen hráčů červená razítka a rukou psané poznámky postihů
  („KOWALSKI — prkno po hlavě, vidí jen názvy", „BARTOŠ — mluví v rýmech").

## 2. Distribuce a režimy hry

Beze změny proti v2. Klasická distribuce (co instalace, to hráč), **žádný
Jackbox/browser-join** (škrtnuto).

- **Hot-seat (1 zařízení):** karty odkryté, stůl u jednoho PC. Tajné jsou jen
  osobní cíle (pokud zůstanou — viz §9).
- **Online co-op (Steam):** každý vlastní kopii, networking přes Steam Datagram
  Relay (zdarma).
- **Steam Remote Play Together** od prvního dne (funguje jako demo).
- **Časovač volitelný** — výchozí režim nechá stůl diskutovat, to *je* ta hra.

**Status sólo režimu (D6).** Sólo je **plnohodnotný, ale sekundární** — je to
*kabinetní* varianta: jeden mozek řeší celý slate 4 slotů (blíž puzzle/roguelike
deckbuilderu), s doporučenou **delší tratí** pro hloubku. Dva primární zážitkové
pilíře hry — **hádka o přiřazení** a **čtení protokolu nahlas** — jsou ze své
podstaty stolní; sólo je tedy jiný, tišší požitek, ne cílová zkušenost. Cílová
zkušenost je **2–4 hráči u stolu**. (Free demo z §14 je pevný sólo run.)
*Zábavnost sóla samostatně ověří lidská brána.*

## 3. Core loop (jeden run ≈ 30 minut)

Run = **cesta po větvící se mapě** (StS graf, ~7 uzlů) z Buffala do New Yorku.
Dojedeš s nákladem = **DORUČENO**. Ztratíš náklad nebo tě dožene šerif =
**NEVYŘEŠENO** a tvůj spis (i karty) propadá do důkazního materiálu pro další hráče.

```
[Buffalo] ─►(uzel)─►(uzel)─┬─►(uzel)─► … ─►[New York]
                           └─►(uzel)─►…
        šerif křížkuje ↑ postupuje po mapě za týmem (Žár)
```

**Typy míst na mapě** (hráč vidí ikonu předem, jako ve StS):

- **NPC interakce** — šerif, farmář, celník, rival. Sociální situace, klíčuje
  hlavně *hodnotu / improvizaci / útok*.
- **Zajímavá lokace / překážka** — most, brod, hlídka, sklad. Klíčuje hlavně
  *nástroj / improvizaci / obranu*. Část z nich nese **event „1 ze 3"** (náhodná
  odbočka příběhu) — ne uzel navíc, jen příchuť uvnitř bucketu lokací.
- **Truhla / loot** — bez resoluce. Kredity a/nebo výběr karty do balíku.
- **Motel / úkryt** — bez resoluce. Za společné kredity **léčíš postihy** a měníš
  karty.

**Mix páteře ~7 uzlů: 5 maso / 1 truhla; motel jako větvová odbočka** *(ladit
simulací; detail dostupnosti motelu §7)*. Pravidla mixu: maso (NPC+lokace)
≥ 65–70 %, nikdy dva ne-maso uzly po sobě, truhla dřív (uzel 2–3), **motelová
odbočka mid a late** (uzly 3–4 a 5–6, tým volí u větvení). Větvení **nesmí**
dovolit vyroutovat se kolem masa (červená vlajka balancu).

**Průběh jednoho maso-uzlu** (jádro hry, detail §5):

1. **Telegraf** — polda vyklepe krátký úvod (1–2 věty): co se blíží, ne přesně jak.
2. **Commit dle telegrafu** — tým committne **přesně 4 karty** (dle počtu hráčů,
   §4.3), *než* uvidí celý text. Vybíráš podle telegrafu, co se nejspíš bude hodit.
3. **Odhalení textu** — teprve teď se ukáže plný text situace se **4 sloty** (rolemi),
   každý s ikonou viditelnosti (👁/🕳, §4.2).
4. **Rozdělení do slotů** — stůl rozdělí **všechny 4 commitnuté karty** do 4 slotů
   co nejméně špatně; **vlastník karty souhlasí** (vlastnictví postavy, jednotná
   hra 1–4p). Nic se nevrací. Volitelně **gamble-záchrana** (§4.5).
5. **Vyhodnocení** — každý slot: stat věci vs. **skrytý práh**. Zásahy → pásmo.
6. **Odhalení prahů** — po vyhodnocení se prahy ukážou. Hráč vždy ví, proč slot
   prošel nebo ne (viditelná pravidla — jen *odhalená po*, ne *před*).
7. **Postihy / kredity / loot** — pásmo rozdá následky (§6) a příjem (§7).
8. **Protokol** — AI dostane hotový výsledek + přiřazení a zdramatizuje ho do
   suchého policejního zápisu (3–5 vět). Razítko do spisu.

**Konec runu** — protokol se přečte celý nahlas, odhalí se tajné cíle (pokud jsou),
bodování, razítko **DORUČENO / NEVYŘEŠENO**.

## 4. Karty / slova a ruce

### 4.1 Slovo = věc s 5 staty
Karta je **věc**, kterou pašerák nosí u sebe, popsaná pěti staty (0–5):

| Stat | Zkr. | K čemu táhne |
|---|---|---|
| **Útok** | U | konfrontace, rvačka, zastrašení |
| **Obrana** | O | krytí, přežití nárazu, zajištění |
| **Hodnota** | H | úplatek, obchod, „všimné do dlaně" |
| **Improvizace** | I | šílený nápad, lest, odlákání *(nahrazuje „náhodu" z v2 — vyjadřuje aktivní vynalézavost, ne pasivní los)* |
| **Nástroj** | N | řemeslo, oprava, technická překážka |

Věc je dobrá **v něčem** a mizerná jinde (zlaté hodinky: H 5, U 0) — to vyrábí
volbu a komedii. Věci jsou **assety sdílené napříč světy** (až na výjimky s polem
světové příslušnosti).

### 4.2 Speciální štítky
Nad staty stojí vzácné **štítky** s tvrdým pravidlem, ne jen s číslem. Vzor:
- **GANGSTER** (pistole, brokovnice) — ve **viditelné** roli NPC situace selže bez
  ohledu na staty (šerif zbraň uvidí). V lokaci/překážce nebo ve skryté roli je
  naopak eso. Nutí volit *kdy* zbraň tasit.

**Štítek nesmí být gotcha (B4).** Aby volba „tasit / netasit" byla informovaná,
ne past:
- při odhalení textu má **každý slot ikonu viditelnosti** — 👁 *viditelná role*
  (kolemjdoucí/NPC ji uvidí) vs. 🕳 *skrytá role* (nikdo nekouká);
- **telegraf předem signalizuje**, zda je situace typ, kde „zbraň projde" (odlehlá
  lokace, rvačka) nebo ne (kontrola, dav) — hráč committne GANGSTER se znalostí
  rizika, ne naslepo do trestu.

Štítky jsou **karetní** nosič výjimek z D15 (práh běžně klíčuje na 1 stat; štítek
ho může přebít). Doplňují je **slotové výjimky** (§5.2, D3). Další štítky *(ladit obsahem)*.

### 4.3 Sloty vždy 4; commituj přesně 4 karty, tým je rozdělí (škálování 1–4p)
Každá situace má **4 sloty** — **stejné texty pro všechny počty hráčů** (jednotná
hra, snadná tvorba obsahu). Po telegrafu tým committne **přesně 4 karty** — tolik,
kolik je slotů, ne víc, ne míň. Rozdělení commitu dle počtu hráčů *(velikosti
rukou ladit simulací — jsou jediná páka na vyrovnání agency mezi počty hráčů)*:

| Hráčů | Ruka | Commit (celkem 4) | Poznámka |
|---|---|---|---|
| 1 | 6 | volí **4** ze své ruky | jeden mozek, plná kontrola nad slate |
| 2 | 4 každý | **2 + 2** | |
| 3 | 4 každý | **2 + 1 + 1** | 2 committne **držitel mapy** — role **rotuje po uzlu**, žádný stálý velitel |
| 4 | 3 každý | **1 + 1 + 1 + 1** | |

**Po odhalení textu se všechny 4 commitnuté karty rozdělí do 4 slotů** — tým
přiřazuje, vlastník každé karty souhlasí. **Nic se nevrací, nic nebenchuje.** Jádro
hry není „vyber nejlepší 4 z mnoha", ale **„rozděl 4, které máš, co nejméně
špatně"**: u některého slotu se občas špatné volbě nevyhneš — a to je **záměr**,
komedie nevyhnutelně špatné volby (zlaté hodinky do rvačky, protože nic lepšího
nezbylo). Frekvence takového nevyhnutelně špatného slotu má být **koření, ne norma**
(§16).

Důsledky pro dřívější nálezy kritiky (vyřešené definicí modelu):
- **Pasažér neexistuje** — karta každého hráče se vždy zahraje (4 karty = 4 sloty).
- **„Stakeless commit" neexistuje** — vše commitnuté se hraje, nic se nevrací.
- **Trivializace výběrem odpadá** — commituje se přesně 4, není z čeho vybírat
  navíc, není co optimalizovat do triviality.
- **Velitel zrušen** (past B2/D8) — u 3p rotuje „držitel mapy", agency se točí.

*Vyrovnání agency mezi počty hráčů (páka = velikosti rukou) i frekvence
nevyhnutelně špatného slotu jsou hlavní v3 sim proměnné (§16).*

### 4.4 Dolízání
Na **konci kola** dolízneš zpět na plnou ruku ze standardního balíku svého světa.
(Podíl prémiových karet v dolízání dle úspěšnosti — až mimo MVP, viz §4.6.)

### 4.5 Gamble = záchrana po odhalení (opt-in)
Gamble není commit-fáze, ale **záchrana po odhalení textu**: když se zdá, že
zadání s commitnutými 4 kartami nepůjde splnit, tým smí **přidat 1 kartu**. Není
to čistý zisk — je to **sázka na náhodu**:

1. tým vybere **čí ruka** kartu poskytne (strategická volba — čí zbytek ruky je
   nejnadějnější);
2. karta se z té ruky **líže náhodně** (při 3 zbývajících kartách šance **1/3**, že
   padne ta, kterou sis přál);
3. vytažená karta se **povinně použije** — nahradí jednu z commitnutých karet dle
   volby týmu, **nahrazená se odhazuje** (cena sázky: přišel jsi o kartu z ruky
   i o jednu commitnutou);
4. **max 1× za situaci**, **opt-in u všech počtů hráčů** (nikdy povinná daň).

Proč to funguje *(ladit simulací)*:
- **záchrana neředí komedii** — je náhodná, takže „opravit rozdělení" není jistota;
  riziko je čitelné a hráč si ho vybral (drama, ne trap);
- **EV ≈ neutrální až mírně záporná** s vysokou variancí — bere se, jen když
  commitnuté rozdělení vypadá ztraceně, ne rutinně (kladná → bere se vždy; moc
  záporná → mrtvá volba). Kalibrace EV při šanci 1/3 je sim otázka (§16).

### 4.6 Standardní vs. prémiové karty *(prémiové mimo MVP)*
- **Standardní** (~300 v plné vizi) — sdílené napříč světy, tvoří páteř balíku.
- **Prémiové** (~100) — **meta-progrese**: odemykají se do sbírky pro **příští
  runy**, ne jako in-run power spike. In-run smí přijít jen výjimečně (truhla/event
  1–2× za run). **Nejsou silnější, jsou specializovanější / swingovější** — mění
  **varianci, ne průměr** (žádný power creep, nejde proti pilíři „snowball obtížnosti
  od 3. uzlu"). Řeší riziko rich-get-richer.

### 4.7 Custom karty (mimo MVP)
„Custom" věc za úspěšný průchod → po **verifikaci** (distribuce statů + moderace)
do prémiového fondu. Tvorba **jen přes omezený skladač** (výběr z předpřipravených
komponent a hodnot), **nikdy volný text** — drží zákaz volného textu hráčů do AI
a je to provozně UGC moderace z §5. Staty a štítek jsou ze skladače, ne z AI:
**žádné skryté AI balancování**.

## 5. Situace, sloty a prahy

### 5.1 Text s mezerami (autorský, ne AI)
Situace je **autorský text s mezerami** (Mad Libs), do nichž se po přiřazení
doplní **názvy zahraných věcí**. Tento text je **deterministický** — vzniká hned
po přiřazení a dává okamžitou zpětnou vazbu (žádné čekání na síť). Vzor
(mikroprototyp `experiments/mikroprototyp-sloty-v2.html`):

> „Šerif se nebezpečně blížil k nákladu. **{kdo}** vytáhl z brašny **{VĚC}**, aby
> ho odlákal. **{kdo}** pro jistotu nachystal **{VĚC}** jako všimné."

AI přijde až v kroku 8 (protokol, §12) — dramatizuje **hotový výsledek**, nerozhoduje.

### 5.2 Skryté prahy = kotva ± šum (learnabilita)
Většina slotů klíčuje na **1 stat** a má **skrytý práh**, odhalený až po
vyhodnocení. Prahy jsou **kotva ± šum** (D15):
- **typ situace má naučitelný trend** (NPC „všimné" → hodnota; překážka „oprava"
  → nástroj) — kompetentní hráč po pár runech ví, *co* situace chce;
- **instance kolísá ±1** kolem kotvy (kotva ≥3 → reálně ≥2 až ≥4) — **mistrovství
  roste, memorizace konkrétních čísel nefunguje**, a win-rate pásmo brány zůstává
  smysluplné.

**Slotové výjimky (D3 — vrácené).** D15 mluví o „výjimkách u speciálních slotů";
ať nezůstanou jen na kartách (štítcích), část **speciálních slotů** má výjimku
na straně slotu *(střídmě, ladit obsahem)*:
- **kombinovaný práh** — slot vyžaduje **dva staty** ≥ práh (např. „vylomit a
  přitom hlídat" = nástroj ≥3 **a** obrana ≥2);
- **štítek-citlivý slot** — role, která GANGSTER buď vylučuje (👁 viditelná), nebo
  naopak odměňuje (skrytá přepadovka).
Tím drží D15 doslovně: výjimky jsou **karetní** (štítky, §4.2) **i slotové**.

**Telegraf je sázka, ne dart (D4).** Commit 4 karet padá **před** odhalením plného
textu, takže telegraf musí být informativní: sděluje **trend** (jaké staty situace
nejspíš chce) **a kolik ze 4 slotů půjde „proti srsti"** (nečekané/skryté role).
Např.: *„Sociální kontrola — dvě role poběží jinak, než čekáš."* Tým tak volí 4
karty s odhadem rizika, ne slepě — a případné nevyhnutelně špatné rozdělení po
odhalení je pak záměrné koření (§4.3), ne trest za informační past.
Telegraf a **názvy rolí** napovídají trend; přesné číslo ne. To je motor hádky
u stolu („na šerifa dej hodinky, ne pistoli").

### 5.3 Pásma místo procent
Skóre = počet slotů, které prošly práh (0–4) → **pásmo** *(hranice ladit simulací)*:

| Zásahy | Pásmo | Dopad |
|---|---|---|
| 4/4 | **HLADCE + LOOT** | úspěch + loot/kredit bonus |
| 3/4 | **HLADCE** | čistý úspěch |
| 2/4 | **S NÁSLEDKY** | úspěch za cenu — **1 lehký postih** (§6) |
| ≤1/4 | **PRŮŠVIH** | selhání — **těžký postih + ztráta nákladu + Žár** |

Pásma (ne „73 %") drží čitelnost u party stolu a dávají AI čtyři jasné tóny
protokolu.

### 5.4 Vysvětlující vrstva „proč se to stalo" (first-class, B1)
**Jediný lidský playtest (2026-07-22) padl na tom, že hra svá pravidla
nevysvětluje.** Ve v3 se skrytostí prahů *a* tajných cílů (dva skryté systémy,
D16) riziko roste — proto je vysvětlující vrstva **plnohodnotná položka MVP řezu**
(§15), ne kosmetika. Princip: **každá netriviální mechanická událost nese při
odhalení krátkou anotaci, proč nastala.** Pokrývá:

- **prahy slotů** — po vyhodnocení se u každého slotu ukáže skrytý práh a realita
  („hodnota 2, potřeba ≥3 → slot selhal"), jako v mikroprototypu;
- **vynucení a štítky** — proč GANGSTER selhal (👁 viditelná role), proč slotová
  výjimka chtěla dva staty;
- **pohyby šerifa / Žáru** — každá změna má důvod v textu („+2: hlučná pistole"),
  ne tichý skok (viz §8, D7);
- **postihové řetězce** — proč postih vznikl, kdy vyprší, co ho vyléčí; proč
  „složení" (§6);
- **plnění tajných cílů** — reveal na konci ukáže **u každého cíle**, které
  konkrétní tahy ho plnily nebo kazily (to pokrývá druhý skrytý systém dle D16).

Není to tutoriál na začátku, ale **průběžné diegetické „proč"** vetkané do spisu a
okraje mapy — hráč se pravidla učí tím, že vidí jejich dopad.

## 6. Postihy (nahrazují zranění + prokleté/zoufalé karty)

Postih = **situační, komediální, vázaný na fikci** následek špatného rozhodnutí —
netrestá sílu karet, **degraduje agency a VYRÁBÍ komedii** (na rozdíl od numerické
spirály smrti). Plná **taxonomie** (D15):

- **Informační** (nejčastější) — degradují viditelnost. *„Prkno po hlavě → 3 kola
  vidíš jen názvy věcí, ne staty."* *„Otřes → tohle kolo nevidíš telegraf."*
- **Zámkové** — omezují volbu. *„Zlomená ruka → nesmíš do slotu dát GANGSTER."*
  *„Spoutaný → tvá věc musí do prvního slotu."*
- **Ztrátové** (**střídmě**) — berou zdroje. *„Prostřelené koleno → −1 karta v
  ruce do vyléčení."* Ztráta kreditů/karty.

**Dva tiery ~70/30** *(poměr ladit simulací)*:
- **Lehké dočasné (~70 %)** — samy vyprší po ~2–3 kolech.
- **Těžké trvalé (~30 %)** — drží **do vyléčení v motelu** (§7). Musí být pojistka
  proti „vždy jen šetřit kredity" (viz kreditová ekonomika).

**Cap a eskalace:** max **2 aktivní postihy na hráče**. Třetí → postava je kolo–dvě
**„složená"** (leží v autě, generuje poznámky do protokolu), pak se vrací do hry.

**Složení NIKDY nesmí být levnější než poctivé léčení (oprava B3).** Dřívější
znění „po složení jsou všechny postihy pryč" dělalo z 3. postihu **free cleanse**,
který dominoval placenému léčení (H=6 kreditů) a podkopával kreditovou smyčku.
Oprava: **složení smaže jen LEHKÉ dočasné postihy** (ty by stejně brzy vypršely);
**těžké trvalé postihy složení přetrvávají** a dál se léčí jen v motelu za kredity.
Tím zůstává:
- komediální ventil a strop spirály (nikdo se nezasekne v nehratelném stavu),
- ale **cesta ven z těžkých postihů je pořád jen placená** — složení není zkratka,
  jen bolestivá pauza (tým je kolo–dvě bez hráče). Léčit se vyplatí dřív, než tě to
  složí.

*Vazba na hlas z auta (v2): „složený" hráč může jednou za kolo binárně přispět
spoluhráči — drží ho ve hře a krmí protokol. → **tech backlog** (technical-developer:
proveditelnost „hlasu z auta" ve slotovém hot-seat UI, K2).*

## 7. Ekonomika: společné kredity

Kredity jsou **společné** (skupinové rozhodování — kdo se léčí, na čí kartu se
sáhne) a **per-run** (nepřecházejí mezi runy → žádný hoarding). Startovní čísla
*(ladit simulací; drž vztah H ≈ 2S)*:

| Akce | Cena |
|---|---|
| **Směna karty (S)** v motelu | **3 kredity** |
| **Vyléčení postihu (H)** v motelu | **6 kreditů** |

**Příjem (opravená aritmetika, mandát 1a).** Původní verze slibovala „skvělý run
≈ 12", ale dosažitelné maximum bylo jen ~10 (truhla ≤5 + 5× loot po 1) — cíl
„skvělý run ≈ 4 směny NEBO 2 léčení" (= 12) tak nešel naplnit. Přerovnané zdroje:

| Zdroj | Příjem |
|---|---|
| **Truhla** | **+4–6** |
| Situace **HLADCE + LOOT** (4/4) | **+2** |
| Situace **HLADCE** (3/4) | **+1** |

Kontrola konzistence *(vše ladit simulací)*:
- **Skvělý run** ≈ truhla 6 + 2× LOOT (4) + 3× HLADCE (3) = **~13** → 4 směny (12)
  nebo 2 léčení (12) reálně vyjdou;
- **Medián run** ≈ truhla 5 + 1× LOOT (2) + 2× HLADCE (2) = **~7–9** → **unese aspoň
  2 smysluplná ekonomická rozhodnutí**: buď **2× směna karty** (2×3 = 6, se 1–3
  zbylými), nebo tvrdý **trade-off „léčit (6) vs. dvakrát prohodit balík (6)"** —
  což je samo o sobě rozhodnutí a u horního okraje mediánu (9) po léčení ještě
  zbývá na 1 směnu. (Dřívější příklad „1× léčení + rezerva na směnu" byl chybný:
  na spodku mediánu 7 − 6 = 1 < 3, na směnu by nezbylo — opraveno.) Splňuje mandát
  1c, medián není tenký;
- **Slabý run** ≈ truhla 4 + drobty = **~4–5** → tvrdý výběr jediné akce (napětí).

**Dostupnost motelu (mandát 1b).** Jeden pevný motel na 7 uzlů odporoval vlastnímu
pravidlu „motel nesmí být vzácný". Oprava: **motel je větvová odbočka, ne pevný
slot** — na mapě jsou **2 motelové příležitosti** (typicky odbočka v uzlu 3–4 a
druhá v 5–6), tým se u větvení **rozhoduje**: zajet do úkrytu (léčení + směna, ale
delší/riskantnější cesta), nebo hnát náklad dál. Léčení je tak **dostupné, ale
stojí volbu** — ne vzácnost, ale dilema.

Jen **těžké postihy** stojí za léčení; kdyby léčitelné bylo všechno, směna karet by
umřela — proto tiery postihů (§6) a kreditová ekonomika visí na sobě.

## 8. Žár a pronásledovatel (eskalace na mapě)

**Žár přežívá z v2, přerámovaný na mapu.** Je to run-level eskalace, která dělá
**snowball od ~3. uzlu** (pilíř, který nesmí padnout). Vizuálně to *je* křížkující
šerif (§1), ne odosobněné číslo.

- **Žár roste** za PRŮŠVIH uzly, za **hlučné** věci (GANGSTER / silně útočné hraní)
  a za vybrané výsledky. *(Konkrétní přírůstky a prahy ladit simulací — design drží
  jen strukturu, hodnoty žijí v prototypu.)* „Hlučnost" bez tagů = odvozená ze
  **štítků a statů** (GANGSTER karta, vysoký útok, výsledek „incident") — otázka do
  simulace, jak přesně (§16).
- **Žár je pozice na značené trati, ne číslo (D7).** Na mapě je vyznačená dráha
  šerifa s **viditelnými prahy** (Zátah / léčka / konfrontace jako značky na trati),
  takže tým vidí, jak daleko klobouk je a co ho čeká. **Každý pohyb šerifa nese
  anotaci proč** („+2: hlučná pistole u kontroly") — přímá vazba na vysvětlující
  vrstvu (§5.4). Řeší playtest nález „nikdo nechápal, proč Žár vyskočil 2×".
- **Prahy** (jako v2, na trati viditelné předem):
  - **Zátah** — příští uzel na mapě **nahradí** speciální Zátah (obě větve vedou
    přes něj; beztrestně obejít nejde).
  - **Léčka** — vloží se mimořádný uzel s pronásledovatelem osobně.
  - **Konfrontace** — konec úprku, okamžitá finální situace; přežití Žár srazí, ale
    protokol tým dál vede jako „ozbrojenou a nebezpečnou skupinu".
- **Pronásledovatel** se losuje na začátku runu, je viditelný od první minuty a
  **ruší jeden stat/štítek** (federál Malone bere úplatek = hodnotu z hry; šerif
  Brody na hlučné hraní reaguje dvojnásob…). Čtvrtina „páky" je proti finále
  oslabená → každý run se hraje jinak. Vypravěčský háček (kolega poldy od stroje)
  zůstává.

**Záměrně NE:** perzistence pronásledovatele napříč runy (scope + patent WB na
nemesis), soubojový systém s HP, tahy nepřítele (v 30min hře mrtvý čas).

## 9. Tajné osobní cíle — ZŮSTÁVAJÍ V MVP (osekaná verze)

**Rozhodnutí D16: tajné cíle zůstávají v MVP** (uživatel přehlasoval doporučení
kritika odložit je). Argument pro: reveal na konci je **metrika úspěchu #4**
(„tys to dělal schválně?!") a v slotovém systému získávají cíle novou páku — máš
skrytý důvod hádat se o **konkrétní přiřazení slotu** („dej MOJI pistoli do
útoku"), zatímco tým optimalizuje globálně. To je přesně to tření, které
kooperaci drží živou.

**Osekaná verze pro MVP:**
- cíle přeformulovat ze světa tagů/zranění na **staty, sloty, štítky a postihy**
  (např. „skonči run se 2 postihy a přesto DORUČENO", „ani jednou nedej GANGSTER
  do viditelné role", „buď v protokolu označen za mozek");
- **mechanicky ověřitelné** cíle (simulace je boduje) převažují; **textové** jen
  tam, kde nesou reveal;
- držet je **jednoduché a čitelné** — jedna páka na cíl, žádné vícekrokové řetězce.

**Přijaté riziko (D16):** tajné cíle jsou **druhý skrytý systém** vedle skrytých
prahů. Kompenzuje ho **vysvětlující vrstva (§5.4)**: reveal na konci ukáže u
každého cíle **které konkrétní tahy ho plnily nebo kazily** — hráč nikdy neodejde
se zmatkem „proč jsem to nesplnil". Bez téhle vazby by druhý skrytý systém
reprodukoval playtest nález o neviditelnosti pravidel; s ní je to uspokojivý reveal.
*(Že reveal je uspokojivý, ne matoucí, ověří lidská brána.)*

## 10. Profily hráčů a jména (post-hoc dosazení)

Premisa v3 = **příběhovka s volbou**: hráč má **profil s vlastním jménem** a
statistikami úspěšnosti, přenosný mezi světy. Jméno se ke kartě doplní až **po
přiřazení do slotu**.

**Kritické pravidlo (řeší dvojí kolizi z posudku PM):**
- **Jména NIKDY nejdou do promptu.** LLM píše protokol s **placeholdery**
  (Podezřelý A/B, 1. pád — kontrakt už držíme z v2), jména se **dosazují lokálně
  až po vygenerování**. Tím zůstává:
  - **cache klíč přenositelný** (bez jmen → globální cache à la Infinite Craft platí dál);
  - **prompt injection nemožná** (volný text hráče se k modelu nedostane).
- Profil se statistikami je čistě **klientský stav**, mimo AI vrstvu.

*(Perzistence profilů napříč runy = meta-progrese, mimo MVP — viz §15. V MVP jméno
existuje jen kvůli testu dosazovací mechaniky, statistiky se nepřenášejí.)*

## 11. Multi-svět / DLC rámec

- **1930 (prohibice)** = **první svět**, plně v MVP. Business model §14 přechází z
  „1 hra" na **„~3 příběhy na start + světy jako DLC"**.
- Každý další svět (Cold War Berlin, Cyberpunk Slums…) = **DLC nad stejným jádrem**
  (sloty, staty, postihy, kredity, Žár). Mění se **obsah** (situace, věci, štítky,
  pronásledovatelé, flavor), ne pravidla.
- **Karty nesou pole světové příslušnosti** — většina sdílená, výjimky per svět.
- **Host Pass** z v2 zůstává (DLC stačí vlastnit hostovi lobby).

## 12. AI role & náklady

Beze změny principů z v2, upřesněno pro sloty:

- **Autorská vrstva (ne AI):** telegraf a text situace s mezerami jsou **napsané
  ručně**; AI je nepíše a **nerozhoduje o výsledku**.
- **AI vrstva:** **1 volání na uzel** dramatizuje **hotový výsledek** (pásmo +
  přiřazení věcí do slotů + stav postihů) do 3–5 vět suchého protokolu. Levný model
  (třída Haiku), strukturovaný vstup.
- **Cache klíč bez jmen** → globální cache (věc + typ situace + pásmo + hrubý stav);
  náklady na hráče časem klesají.
- **Fallback šablony** při výpadku / 10 s timeoutu — **hra nikdy nečeká na síť**.
- **Steam AI disclosure (Live-Generated):** modely a guardrails na store page.

## 13. Neporušitelné principy (přežívají beze změny)

- **Mechanika rozhoduje, AI vypráví.** LLM nikdy neurčuje výsledek slotu.
- **Hra nikdy nečeká na síť.** 10 s → fallback.
- **Viditelná pravidla — ve v3 „skrytá před, odhalená po".** Prahy jsou před
  commitem skryté (jinak není co objevovat), ale po vyhodnocení se **vždy ukážou**
  — hráč ví, proč slot prošel či ne. Skrytost je **learnabilita**, ne gotcha.
- **Vlastnictví postavy.** Tým radí a přiřazuje, ale **vlastník věci musí se
  slotem souhlasit.**
- **Žádný volný text hráčů do AI** — jen omezený skladač karet a post-hoc jména.

## 14. Business model (rozšíření v2 §7)

- **9,99 € pay-to-play**, 4-pack bundle (~30 €), free demo (pevný run, nulové API).
- **Start = ~3 příběhy/světy** místo jedné trasy. **DLC světy 4–5 €** s Host Passem.
- ~~Product placement~~ — škrtnuto (zůstává).

## 15. MVP řez v3

**Cíl beze změny:** ověřit, že core loop baví 4 lidi u stolu. Nejmenší řez, který
otestuje **slotovou smyčku + postihy + kredity**:

| Co | Počet v MVP | Poznámka |
|---|---|---|
| Světy | **1** (1930 prohibice) | multi-svět rámec připraven, obsah ne |
| Situace | **7 typů × 2 varianty = 14** (+1 speciální Zátah) | run = ~7 uzlů, mix páteře 5 maso / 1 truhla + motelové odbočky |
| Standardní karty (věci) | **~40** | 5 statů + pár štítků, česky |
| Prémiové karty | **0** | meta-progrese mimo MVP |
| Postihy | **~14** | info / zámek / ztráta, 2 tiery |
| **Vysvětlující vrstva** (§5.4) | **first-class** | per-akční anotace: prahy, vynucení/štítky, pohyby šerifa, postihové řetězce, plnění cílů (B1 — přímý nález playtestu) |
| Truhla / motel | ano | kredity S=3 / H=6, léčení postihů; motel jako větvová odbočka (§7) |
| Pronásledovatelé | **2** | rušený stat/štítek + léčka + konfrontace; Žár jako značená trať |
| Tajné cíle | **8 (osekané)** | zůstávají v MVP dle D16; kryté vysvětlující vrstvou (§9) |
| Fallback šablony | **~20** | pro výpadek API |
| Mapa | **1 StS graf**, ~7 uzlů | šerif křížkuje, prahy Žáru vyznačené na trati |

### Záměrně MIMO rozsah v3 MVP
Multi-svět / DLC obsah, prémiové karty + meta-progrese, **perzistence profilů
napříč runy**, custom skladač karet + UGC moderace, online multiplayer, Remote
Play, Steam, pixel-art (placeholder papír), zvuk, angličtina (testuje se česky),
volitelný časovač, volba obtížnosti.

## 16. Otevřené otázky pro kritika a simulaci

**Meta-otázka brány v3:** jsou prahy **learnable** (kotva ± šum → existuje
kompetentní hra → win-rate pásmo dává smysl)? Kalibrace šumu ±1 rozhoduje, jestli
je v3 skill-hra s pásmem, nebo komediální ruleta bez měřitelné brány.

*Rozhodnuto (už neotevírat): kreditová ekonomika i tajné cíle zůstávají v MVP
(D16); commit je přesně 4 karty, vše se rozdělí, nic nebenchuje (D17, §4.3).*

TOP 3 pro v3 sim (aktualizováno po D17 — commit přesně 4, vše se hraje):
1. **Vyrovnání rukou mezi počty hráčů** — commit je pevný (4 / 2+2 / 2+1+1 / 1×4),
   **jediná páka je velikost ruky** (dnes 6/4/4/4 *ladit simulací*). *Sim: má 1p
   (volí 4 z 6) srovnatelnou agency a obtížnost jako 4p (každý volí 1 ze 3)? Kde
   nastavit ruce, aby víc hráčů neznamenalo systematicky lehčí/těžší hru?*
   (Pasažér ani stakeless commit už z definice modelu nevznikají — §4.3.)
2. **Postihy: poměr tierů 70/30, doba trvání lehkých, hranice must-heal** — na
   nich visí kreditová ekonomika. *Sim: informovaný vs. slepý bot = síla
   info-postihu v měně −X. Ověřit i B3: složení maže jen lehké → není levnější než
   léčení H=6.*
3. **Gamble EV při šanci 1/3** — záchrana líže náhodně (1/3 zásah) a **odhazuje
   nahrazenou kartu**. *Sim: je EV ≈ neutrální až mírně záporná, aby se sázka brala
   jen v zoufalé situaci, ne rutinně? Jak často commit vypadá „ztraceně" natolik,
   že se gamble vyplatí?*

Jádro modelu D17:
4. **Frekvence „nevyhnutelně špatného slotu"** — komedie modelu stojí na tom, že
   občas 4 karty prostě nesednou na 4 sloty. Má to být **koření, ne norma**: odhad
   zdravého pásma **~1 nevyhnutelně špatný slot za 2–3 situace** *(ladit simulací)*.
   *Sim: při jaké distribuci statů karet a prahů slotů to pásmo vychází? Moc často
   = frustrace/„každý slot je zoufalý", moc zřídka = commit je vždy hladký a bez
   tření.*

Ekonomika (po opravě aritmetiky, mandát 1):
5. **Příjmy vs. ceny** — sedí „skvělý ~13 / medián ~7–9 / slabý ~4–5" proti S=3/H=6
   tak, že medián nese ≥2 rozhodnutí a skvělý run ≈ 4 směny / 2 léčení? Kolik
   motelových odboček tým reálně navštíví?
6. **Pásma 4/3/2/≤1** — kde jsou hranice, aby DORUČENO padlo do 45–70 % u
   kompetentní i realistické hry (pilíř z brány).
7. **Žár ve slotovém světě** — přírůstky, prahy, medián prvního prahu uzel 3–4,
   snowball od uzlu 3. Jak přesně definovat „hlučnost" ze štítků/statů (§8)?

Zátěž a struktura:
8. **Kognitivní zátěž měřidel + DVA skryté systémy** — náklad + kredity + Žár +
   postihy + (skryté prahy *a* tajné cíle). Návrh na odlehčení: Žár = trať/šerif,
   postihy = poznámky na spisu → „čísla" jsou jen náklad + kredity; oba skryté
   systémy nese **vysvětlující vrstva §5.4**. Unese to party u stolu? **Klíčová
   otázka lidské brány** (D16 přijal riziko dvou skrytých systémů).
9. **Náklad (bedny) vs. Žár jako fail-condition** — potřebujeme obě prohry, nebo
   jednu? (Návaznost na otázku 8.)

**Strop poctivosti:** nic z výše uvedeného neprokáže **zábavu**. „Skryté prahy
*i* skryté cíle = uspokojivý reveal (díky §5.4), ne frustrující gotcha" je
hypotéza pro **lidskou bránu**, ne pro simulaci — a je to nejtěžší sázka celého v3.

---

*Historie a co se z v2 mění:*

- **v1** = původní koncept (Jackbox režim, tajné karty, AI balancování, product
  placement — vše nahrazeno/škrtnuto 2026-07-22). **Nevzkřísit.**
- **v2** = kostková resoluce (d6 + síla + afinita vs. globální prahy), 4 tagy
  (Násilí/Lest/Úplatek/Útěk) + ridery, pevné 4 postavy, zranění (4 = kolaps),
  prokleté + zoufalé karty, náklad 6 beden. **Přežívá:** estetika §1, psací stroj,
  Žár + pronásledovatel (přerámováno na mapu §8), neporušitelné principy §13,
  online/distribuce §2, AI architektura §12.
- **v3 škrtá / mění** (důvody):
  - **Kostka (d6)** → pryč. Náhoda se přesouvá na **vstup** (co ti přijde do ruky,
    gamble draw, šum prahů ±1), ne na výstup hodu. Menší frustrace, víc volby.
  - **Tagy + ridery (D4)** → pryč, nahrazeno **5 staty**. Textura přechází z riderů
    na staty + štítky + typy situací.
  - **Pevné postavy Bartoš/Kowalski/Mazur/Fontana (D13)** → pryč, nahrazeno
    **jmény hráčů + profily** (§10). Fallback šablony a cache se přizpůsobí
    placeholderům (kontrakt „jméno = příjmení, 1. pád" drží dál).
  - **Zranění → postihy** (§6): komediální taxonomie místo čísla −X k hodu.
  - **Prokleté + zoufalé karty (D12) → postihy + gamble draw**: „zoufalství s
    utrpením" nahrazuje opt-in riziko gamble.
  - **Prahy hodu 7+/5–6/≤4 (D7/D10) → pásma 4/3/2/≤1** ze slotů proti skrytým prahům.
  - **Žár:** struktura zůstává (Zátah/léčka/konfrontace), přírůstky se **předefinují**
    bez tagů; vizualizace = křížkující šerif na mapě.
  - **Náklad:** k přehodnocení proti kreditům a Žáru (otázka 7/8) — v2 ho už označil
    za 1. kandidáta na škrt.
  - **Tajné cíle:** přehodnoceny, nikoli škrtnuty; **D16 je drží v MVP** (§9).
  - **Nově přibývá:** StS mapa + typy míst, kreditová ekonomika + motel, gamble
    draw, multi-svět/DLC rámec, profily hráčů, vysvětlující vrstva (§5.4).

*Revize po kritice (D16, 2026-07-23):* vysvětlující vrstva jako first-class MVP
položka (§5.4, B1), oprava free-cleanse složením (§6, B3), ikony viditelnosti
slotů + telegraf proti srsti (§4.2/§5.2, B4/D4), slotové výjimky vrácené (§5.2,
D3), gamble opt-in (§4.5, D1), Žár jako značená trať s anotací delty (§8, D7),
status sóla (§2, D6), opravená aritmetika příjmů + motel na větvení (§7, mandát 1).
Tajné cíle i kreditová ekonomika **zůstávají v MVP** (D16, přehlasováno proti
doporučení kritika).

*Revize commit modelu (D17, 2026-07-23):* uživatel opravil nepochopení — **poolový
commit z revize D16 zrušen**. Nový model: tým committne **přesně 4 karty**
(4 / 2+2 / 2+1+1 / 1×4, u 3p rotuje „držitel mapy"), po odhalení se **všechny 4
rozdělí** do slotů, **nic se nevrací ani nebenchuje**; jádro = „rozděl nejméně
špatně", nevyhnutelně špatný slot je záměrné koření (§4.3). Gamble přerámován na
**záchranu po odhalení** s náhodným lízem 1/3 a povinnou náhradou karty (§4.5).
Tím z definice mizí pasažér i „stakeless commit"; sim priorita = vyrovnání rukou
mezi počty hráčů + EV gamble při 1/3 + frekvence nevyhnutelně špatného slotu (§16).

*Souvisí: [prototyp-mvp.md](../prototyp-mvp.md), [design-dokument.md](../design-dokument.md)
(v2, dosud kanonický), balanční posudek `technika/balanc-posudek-v3-2026-07-23.md`,
rozhodnutí D14/D15/D16/D17 v `projekt/rozhodnuti.md`, audit kritika (paměť design-critica),
mikroprototyp `experiments/mikroprototyp-sloty-v2.html` (schválený flow).*

**Pozn. ke konzistenci:** tento návrh **neměním** do `design-dokument.md` ani
`prototyp-mvp.md` — oba zůstávají na v2. Skill `consistency-check` se pustí až při
schválení, kdy PM v3 překlopí do obou kanonických souborů (mechanika se mění v
obou zároveň — dle CLAUDE.md).
