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
most má díru, rival vytáhl bouchačku: telegrafem se dozvíš, co se blíží, naslepo
vytáhneš věc z kufru — a pak teprve stůl uvidí celý text situace a hádá se, kdo
kterou roli vezme. Zlaté hodinky jsou skvělý úplatek a mizerná páčidlo. Pistole
vyřeší rvačku a shodí tě u šerifa, protože gangster se zbraní v ruce se neschová.

**Příběhovka s volbou pro 1–4 hráče.** Slova a věci sázíš do situací, mechanika
rozhodne, AI to sepíše do suchého protokolu — a čím hůř dopadneš, tím lepší čtení
to je. Rok 1930 je **první „svět"**; další (studená válka, kyberpunk…) přijdou
jako DLC nad stejným jádrem. Jeden run ≈ 30 minut. Mechanika rozhoduje, AI vypráví.

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

**Mix na ~7 uzlů: 5 maso / 1 truhla / 1 motel** *(ladit simulací)*. Pravidla mixu:
maso (NPC+lokace) ≥ 65–70 %, nikdy dva ne-maso uzly po sobě, truhla dřív (uzel
2–3), motel střed-pozdě (uzel 4–6). Větvení **nesmí** dovolit vyroutovat se kolem
masa (červená vlajka balancu).

**Průběh jednoho maso-uzlu** (jádro hry, detail §5):

1. **Telegraf** — polda vyklepe krátký úvod (1–2 věty): co se blíží, ne přesně jak.
2. **Commit naslepo** — každý hráč vytáhne z ruky věc(i) do slotů (viz §4), *než*
   uvidí celý text. Sázíš podle telegrafu.
3. **Odhalení textu** — teprve teď se ukáže plný text situace se **4 sloty** (rolemi).
4. **Týmové přiřazení** — stůl volně rozdělí zahrané věci do slotů; **vlastník
   věci musí souhlasit** (drží vlastnictví postavy i jednotnou hru 1–4p).
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

Štítky jsou hlavní nosič „výjimek u speciálních slotů" z D15 (práh běžně klíčuje
na 1 stat; štítek ho může přebít). Další štítky *(ladit obsahem)*.

### 4.3 Sloty vždy 4, ruce dle počtu hráčů
Každá situace má **4 sloty** — **stejné texty pro všechny počty hráčů** (jednotná
hra, snadná tvorba obsahu). Liší se jen, kolik věcí kdo naslepo cpe *(všechna
čísla ladit simulací)*:

| Hráčů | Ruka | Commit naslepo | 4. slot |
|---|---|---|---|
| 1 | 6 | volí **4** (jeden mozek, globální optimalizace) | z committnutých |
| 2 | 4 každý | **2 + 2** | z committnutých |
| 3 | 3 každý | **1 + 1 + 1** | **gamble-draw slot** (týmová sázka, §4.5) |
| 4 | 3 každý | **1 + 1 + 1 + 1** | z committnutých |

Ruka > commit, aby byl commit naslepo skutečná volba. **Velitel u 3p zrušen**
(balanční past): 4. slot je místo něj vždy gamble-draw — z asymetrie počtu vzniká
týmová sázka, ne pseudo-4. hráč.

*Pozn. pro simulaci: 1p optimalizuje 4 sloty jedním mozkem, 4p lokálně a naslepo
po jedné + koordinuje přiřazením. Který efekt převáží, je klíčová v3 sim proměnná
— režim informace (všichni naslepo) je sjednocen záměrně, aby se srovnával.*

### 4.4 Dolízání
Na **konci kola** dolízneš zpět na plnou ruku ze standardního balíku svého světa.
(Podíl prémiových karet v dolízání dle úspěšnosti — až mimo MVP, viz §4.6.)

### 4.5 Gamble draw (opt-in riziko)
Nahrazuje v2 „utracení druhé věci do volitelného slotu" — ta záchrana **ředila
komedii**. Místo ní: jednou lze **líznout náhodnou kartu z balíku** a **povinně ji
použít** do slotu, který jinak nepokryješ.

Pravidla EV *(ladit simulací)*:
- líže se ze **standardního balíku**, kde ~20–30 % karet je pro daný slot **net-záporných**;
- **EV ≈ neutrální až mírně záporná** s vysokou variancí (kladná → bere se vždy;
  moc záporná → mrtvá volba);
- **tažená karta se povinně použije** (jinak to není sázka), bez ceny a bez capu —
  přirozený strop je, že smí plnit jen jinak nepokrytý slot (self-balancing);
- **riziko musí být čitelné** (drama „tohle je sázka"), ne skryté (trap).

U **3 hráčů** je 4. slot vždy gamble-draw — struktura, ne volba.

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
Každý slot klíčuje na **1 stat** a má **skrytý práh**, odhalený až po vyhodnocení.
Prahy jsou **kotva ± šum** (D15):
- **typ situace má naučitelný trend** (NPC „všimné" → hodnota; překážka „oprava"
  → nástroj) — kompetentní hráč po pár runech ví, *co* situace chce;
- **instance kolísá ±1** kolem kotvy (kotva ≥3 → reálně ≥2 až ≥4) — **mistrovství
  roste, memorizace konkrétních čísel nefunguje**, a win-rate pásmo brány zůstává
  smysluplné.

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
**„složená"** (leží v autě, generuje poznámky do protokolu), pak **očištěná**
(všechny postihy pryč, zpět do hry). Je to komediální ventil i tvrdý strop spirály
— nikdo se nezasekne v nehratelném stavu.

*Vazba na hlas z auta (v2): „složený" hráč může jednou za kolo binárně přispět
spoluhráči — drží ho ve hře a krmí protokol. (Proveditelnost v hot-seat UI ověří
technical-developer.)*

## 7. Ekonomika: společné kredity

Kredity jsou **společné** (skupinové rozhodování — kdo se léčí, na čí kartu se
sáhne) a **per-run** (nepřecházejí mezi runy → žádný hoarding). Startovní čísla
*(ladit simulací; drž vztah H ≈ 2S)*:

| Akce | Cena |
|---|---|
| **Směna karty (S)** v motelu | **3 kredity** |
| **Vyléčení postihu (H)** v motelu | **6 kreditů** |

Příjem: **truhla +3–5**, velmi úspěšná situace (HLADCE+LOOT) **+1**. Skvělý run
≈ **12** kreditů, medián ≈ **5–6** → reálné dilema „léčit Kowalského, nebo 2×
prohodit balík". **Motel nesmí být vzácný** (jinak mistiming zabije léčení jako
volbu). Jen **těžké postihy** stojí za léčení; kdyby léčitelné bylo všechno, směna
karet by umřela — proto tiery postihů (§6) a kreditová ekonomika visí na sobě.

## 8. Žár a pronásledovatel (eskalace na mapě)

**Žár přežívá z v2, přerámovaný na mapu.** Je to run-level eskalace, která dělá
**snowball od ~3. uzlu** (pilíř, který nesmí padnout). Vizuálně to *je* křížkující
šerif (§1), ne odosobněné číslo.

- **Žár roste** za PRŮŠVIH uzly, za **hlučné** věci (GANGSTER / silně útočné hraní)
  a za vybrané výsledky. *(Konkrétní přírůstky a prahy ladit simulací — design drží
  jen strukturu, hodnoty žijí v prototypu.)*
- **Prahy** (jako v2, na mapě viditelné předem):
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

## 9. Tajné osobní cíle — PŘEHODNOCENO

**Návrh: zachovat, ale osekat a přesunout na hranu MVP.** Argument pro: reveal na
konci je **metrika úspěchu #4** („tys to dělal schválně?!") a v slotovém systému
získávají cíle novou páku — máš skrytý důvod hádat se o **konkrétní přiřazení
slotu** („dej MOJI pistoli do útoku"), zatímco tým optimalizuje globálně. To je
přesně to tření, které kooperaci drží živou.

Adaptace na v3:
- cíle přeformulovat ze světa tagů/zranění na **staty, sloty, štítky a postihy**
  (např. „skonči run se 2 postihy a přesto DORUČENO", „ani jednou nedej GANGSTER
  do viditelné role", „buď v protokolu označen za mozek");
- **mechanicky ověřitelné** cíle (simulace je boduje) převažují; **textové** jen
  tam, kde nesou reveal.

**Riziko / otázka pro kritika:** systém v3 je už teď bohatý (sloty, postihy,
kredity, gamble, Žár). Tajné cíle můžou být **jedna vrstva navíc přes rozpočet
kognitivní zátěže party**. Proto je vedu jako **první kandidát na odklad z MVP**,
pokud se loop u lidské brány ukáže jako plný i bez nich. *(Rozhodne kritik +
lidská brána.)*

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
| Situace | **7 typů × 2 varianty = 14** (+1 speciální Zátah) | run = ~7 uzlů, mix 5/1/1 |
| Standardní karty (věci) | **~40** | 5 statů + pár štítků, česky |
| Prémiové karty | **0** | meta-progrese mimo MVP |
| Postihy | **~14** | info / zámek / ztráta, 2 tiery |
| Truhla / motel | ano | kredity S=3 / H=6, léčení postihů |
| Pronásledovatelé | **2** | rušený stat/štítek + léčka + konfrontace |
| Tajné cíle | **8, nebo odloženo** | rozhodne kritik (viz §9) |
| Fallback šablony | **~20** | pro výpadek API |
| Mapa | **1 StS graf**, ~7 uzlů | šerif křížkuje |

### Záměrně MIMO rozsah v3 MVP
Multi-svět / DLC obsah, prémiové karty + meta-progrese, **perzistence profilů
napříč runy**, custom skladač karet + UGC moderace, online multiplayer, Remote
Play, Steam, pixel-art (placeholder papír), zvuk, angličtina (testuje se česky),
volitelný časovač, volba obtížnosti.

## 16. Otevřené otázky pro kritika a simulaci

**Meta-otázka brány v3:** jsou prahy **learnable** (kotva ± šum → existuje
kompetentní hra → win-rate pásmo dává smysl)? Kalibrace šumu ±1 rozhoduje, jestli
je v3 skill-hra s pásmem, nebo komediální ruleta bez měřitelné brány.

TOP 3 před stavbou v3 simu (z posudku):
1. **Commit + přiřazení + klíčování prahu** — čísla ruk (6/4/3/3), režim naslepo
   pro všechny, práh na 1 stat s výjimkami štítků. *Sim: srovnat 1p globální vs.
   4p lokální optimalizaci — o desítky bodů win-rate.*
2. **Postihy: poměr tierů 70/30, doba trvání lehkých, hranice must-heal** — na
   nich visí kreditová ekonomika (S=3/H=6). *Sim: informovaný vs. slepý bot =
   síla info-postihu v měně −X.*
3. **Gamble draw EV** — % net-záporných karet (návrh 20–30), aby EV ≈ 0.
   *Sim: bere se sázka vždy / nikdy / jen když nepokryješ slot?*

Další:
4. **Pásma 4/3/2/≤1** — kde jsou hranice, aby DORUČENO padlo do 45–70 % u
   kompetentní i realistické hry (pilíř z brány).
5. **Žár ve slotovém světě** — přírůstky, prahy, medián prvního prahu uzel 3–4,
   snowball od uzlu 3. Jak „hlučnost" definovat bez tagů (přes štítky/staty)?
6. **Kognitivní zátěž měřidel** — náklad + kredity + Žár + postihy. Kolik jich
   party u stolu unese? (v2 už bedny označil za 1. kandidáta na škrt.) **Návrh:
   Žár = mapa/šerif, ne číslo; postihy = poznámky na spisu; zbývají náklad +
   kredity jako jediná dvě „čísla".** Ověřit u lidské brány.
7. **Tajné cíle in/out MVP** (§9) — vrstva navíc, nebo motor hádky o sloty?
8. **Náklad (bedny) vs. Žár jako fail-condition** — potřebujeme obě prohry, nebo
   jednu? (Návaznost na otázku 6.)

**Strop poctivosti:** nic z výše uvedeného neprokáže **zábavu**. „Skrytý práh =
uspokojivý reveal, ne frustrující gotcha" je hypotéza pro **lidskou bránu**, ne
pro simulaci.

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
  - **Náklad:** k přehodnocení proti kreditům a Žáru (otázka 6/8) — v2 ho už označil
    za 1. kandidáta na škrt.
  - **Tajné cíle:** přehodnoceny, nikoli škrtnuty (§9).
  - **Nově přibývá:** StS mapa + typy míst, kreditová ekonomika + motel, gamble
    draw, multi-svět/DLC rámec, profily hráčů.

*Souvisí: [prototyp-mvp.md](../prototyp-mvp.md), [design-dokument.md](../design-dokument.md)
(v2, dosud kanonický), balanční posudek `technika/balanc-posudek-v3-2026-07-23.md`,
rozhodnutí D14/D15 v `projekt/rozhodnuti.md`, mikroprototyp
`experiments/mikroprototyp-sloty-v2.html` (schválený flow).*

**Pozn. ke konzistenci:** tento návrh **neměním** do `design-dokument.md` ani
`prototyp-mvp.md` — oba zůstávají na v2. Skill `consistency-check` se pustí až při
schválení, kdy PM v3 překlopí do obou kanonických souborů (mechanika se mění v
obou zároveň — dle CLAUDE.md).
