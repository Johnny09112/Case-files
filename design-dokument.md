# DŮKAZNÍ MATERIÁL 1930 (Case File: 1930)
**Design dokument v3** — slotová resoluce (pivot 2026-07-23, rozhodnutí D14–D17).
Jediný zdroj pravdy pro vizi hry. Konkrétní čísla žijí v
[prototyp-mvp.md](prototyp-mvp.md) — zde jen struktura.

---

## Elevator Pitch

Zkorumpovaný polda sedí u psacího stroje a sepisuje protokol o partě pašeráků,
kteří se pokusili převézt náklad chlastu z Buffala do New Yorku. Jenže hráči
nehážou kostkou — **cpou věci ze svých kapes do situací**. Šerif chce úplatek,
most má díru, rival vytáhl bouchačku: telegrafem se dozvíš, co se blíží, vytáhneš
věci z kufru — a pak teprve stůl uvidí celý text se čtyřmi rolemi a hádá se, **jak
ty čtyři věci rozdělit co nejméně špatně**. Zlaté hodinky jsou skvělý úplatek a
mizerná páčidlo; když ti do rvačky zbydou, protokol si to užije. Pistole vyřeší
konfrontaci a shodí tě u šerifa, protože gangster se zbraní v ruce se neschová.

**Příběhovka s volbou pro 1–4 hráče** (hot-seat / online co-op) s roguelite
strukturou, trvalými následky a estetikou *Papers, Please*. Nemáš dost dobrých
věcí na všechno — komedie i tření vznikají z toho, že **někam se špatná volba
prostě musí dát**. Mechanika rozhodne, AI to sepíše do suchého protokolu — a čím
hůř dopadneš, tím lepší čtení to je. Rok 1930 je **první „svět"**; další (studená
válka, kyberpunk…) přijdou jako DLC nad stejným jádrem. Jeden run ≈ 30 minut.
**Mechanika rozhoduje, AI vypráví.**

---

## 1. Vizuál & UX

Estetika je **finální vize hry**, ne testovací kulisa — MVP běží na placeholderech
(text + rámečky + papír), ale to není její opuštění, jen odklad výroby assetů.

- **Estetika:** hrubší pixel-art / úřední papír v tónu *Papers, Please*. Paleta
  max 16 barev (šedá, hnědá, sepie, černá + krvavě červená pro razítka).
- **Hlavní obrazovka:** stůl vyšetřovatele — lampička, hrnek, popelník, protokol
  v psacím stroji, který v reálném čase **vyklepává** text. Psací stroj maskuje
  latenci AI a vyrábí společný moment čtení nahlas. (Jediný povinný efekt prototypu.)
- **Mapa jako důkaz:** dobová **kreslená mapa Buffalo → New York** ve stylu
  *Slay the Spire* — větvící se cesta uzlů. **Šerif ji křížkuje**: jak roste Žár,
  posouvá se po mapě za týmem a odškrtává, kudy prošel. Mapa *je* měřidlo
  pronásledování — hráč nesleduje číslo, sleduje, jak blízko je klobouk.
- **Okraj spisu:** u jmen hráčů červená razítka a rukou psané poznámky postihů
  („KOWALSKI — prkno po hlavě, vidí jen názvy", „BARTOŠ — mluví v rýmech").

## 2. Distribuce a režimy hry

Klasická distribuce: co instalace, to hráč (žádný Jackbox/browser-join).

- **Hot-seat (1 zařízení):** karty odkryté, hráči sedí u jednoho stolu/PC. Tajné
  jsou jen osobní cíle (hráč si svůj zobrazí na začátku, ostatní se nedívají).
- **Online co-op (Steam):** každý hráč vlastní kopii, networking přes Steam
  Datagram Relay (pro hry na Steamu zdarma).
- **Steam Remote Play Together:** podpora od prvního dne — host vlastní hru,
  kamarádi hrají zdarma přes stream (funguje jako demo a konverzní trychtýř).
- **Časovač je volitelný.** Výchozí režim nechá stůl diskutovat a hádat se — to
  *je* ta hra.
- **Sólo režim je plnohodnotný, ale sekundární** — kabinetní varianta, kde jeden
  mozek řeší celý slate čtyř slotů (blíž puzzle/deckbuilderu), s delší tratí. Dva
  primární zážitkové pilíře — **hádka o rozdělení** a **čtení protokolu nahlas** —
  jsou ze své podstaty stolní; cílová zkušenost je **2–4 hráči u stolu**.

## 3. Game Loop (jeden run ≈ 30 minut)

Run = **cesta po větvící se mapě** (StS graf) z Buffala do New Yorku. Dojedeš
s nákladem = razítko **DORUČENO**. Ztratíš náklad nebo tě dožene šerif = razítko
**NEVYŘEŠENO** a spis (i karty týmu) propadá do důkazního materiálu pro další hráče.

**Typy míst na mapě** (hráč vidí ikonu předem, jako ve StS):

- **NPC interakce** — šerif, farmář, celník, rival. Sociální situace.
- **Zajímavá lokace / překážka** — most, brod, hlídka, sklad. Část nese **event
  „1 ze 3"** (náhodná odbočka příběhu) — ne uzel navíc, jen příchuť.
- **Truhla / loot** — bez resoluce; kredity a/nebo výběr karty.
- **Motel / úkryt** — bez resoluce; za společné kredity léčení postihů a směna karet.

**Průběh jednoho maso-uzlu:**

1. **Telegraf** — polda vyklepe krátký úvod (co se blíží, ne přesně jak). Sděluje
   trend (jaké staty situace nejspíš chce) i kolik rolí půjde „proti srsti".
2. **Commit dle telegrafu** — tým committne **přesně tolik karet, kolik je slotů**
   (viz §4.3), *než* uvidí celý text.
3. **Odhalení textu** — teprve teď se ukáže plný text situace se **4 sloty**
   (rolemi), každý s ikonou viditelnosti (viditelná / skrytá role).
4. **Rozdělení do slotů** — tým rozdělí **všechny** commitnuté karty do slotů co
   nejméně špatně; vlastník každé karty souhlasí. Nic se nevrací, nic nebenchuje.
   Volitelně **gamble-záchrana** (§4.4).
5. **Vyhodnocení** — každý slot: stat karty vs. skrytý práh. Počet zásahů → pásmo.
6. **Odhalení prahů + „proč"** — prahy se ukážou, každá netriviální událost dostane
   krátkou anotaci (§4.11). Hráč vždy ví, proč slot prošel či ne.
7. **Následky** — pásmo rozdá postihy (§4.7), příjem (§4.8) a pohyb Žáru (§4.9).
8. **Protokol** — AI dostane hotový výsledek a zdramatizuje ho do suchého
   policejního zápisu (3–5 vět). Razítko do spisu.

**Konec runu** — protokol se přečte celý nahlas, odhalí se tajné cíle, bodování,
razítko DORUČENO / NEVYŘEŠENO.

## 4. Core mechaniky

### 4.1 Karty = věci s pěti staty
Karta je **věc**, kterou pašerák nosí u sebe, popsaná pěti staty: **útok, obrana,
hodnota, improvizace, nástroj**. Věc je dobrá v něčem a mizerná jinde (zlaté
hodinky = vysoká hodnota, nulový útok) — to vyrábí volbu a komedii. Věci jsou
assety sdílené napříč světy (až na výjimky s polem světové příslušnosti).

### 4.2 Štítky a viditelnost rolí
Nad staty stojí vzácné **štítky** s tvrdým pravidlem, ne jen s číslem — vzor
**GANGSTER** (zbraně): ve **viditelné** roli NPC situace selže bez ohledu na staty
(šerif zbraň uvidí), ve skryté roli nebo v lokaci je naopak eso. Aby štítek nebyl
past, každý slot má při odhalení **ikonu viditelnosti** a telegraf předem
signalizuje, zda je situace typ, kde „zbraň projde".

### 4.3 Sloty a commit: „rozděl čtyři věci co nejméně špatně"
Každá situace má **4 sloty** (stejné texty pro všechny počty hráčů). Tým committne
**přesně 4 karty** = počet slotů, rozdělené dle počtu hráčů (konkrétní rozdělení
a velikosti rukou viz [prototyp-mvp.md](prototyp-mvp.md); u tří hráčů rotuje role
„držitele mapy", žádný stálý velitel). Po odhalení textu se **všechny 4 karty
rozdělí** do slotů — nic se nevrací, nic nebenchuje. Jádro hry není „vyber
nejlepší", ale **„rozděl to, co máš, co nejméně špatně"**: u některého slotu se
špatné volbě občas nevyhneš, a to je záměr — komedie nevyhnutelně špatné volby.
Tím z podstaty nevzniká pasažér (karta každého hráče se hraje) ani prázdný commit.

### 4.4 Gamble = záchrana po odhalení
Když se rozdělení jeví jako ztracené, tým smí jednou za situaci **přidat kartu**:
vybere, čí ruka ji poskytne, ale karta se z ní **líže náhodně** a **povinně
nahradí** jednu commitnutou (nahrazená se odhazuje). Je to opt-in sázka na náhodu
u všech počtů hráčů — záchrana neředí komedii, protože není jistá; riziko si hráč
vybral. Pravděpodobnosti a EV viz [prototyp-mvp.md](prototyp-mvp.md).

### 4.5 Skryté prahy = kotva ± šum (learnabilita)
Většina slotů klíčuje na **jeden stat** se **skrytým prahem**, odhaleným až po
vyhodnocení. Prahy jsou **kotva ± šum**: typ situace má naučitelný trend (NPC
„všimné" → hodnota; překážka „oprava" → nástroj), ale instance kolem kotvy mírně
kolísá — **mistrovství roste, memorizace konkrétních čísel nefunguje**. Výjimky
jsou dvojí: **karetní** (štítky, §4.2) a **slotové** (speciální slot s kombinovaným
prahem přes dva staty, nebo slot citlivý na štítek). Skrytost je *learnabilita*,
ne gotcha — po vyhodnocení se prah vždy ukáže (§4.11).

### 4.6 Pásma výsledku
Výsledek uzlu je **pásmo** podle počtu slotů, které prošly práh (ne procento):
čistý úspěch, úspěch s následky (postih), a průšvih (těžký postih + ztráta + Žár).
Nejvyšší pásmo přidává loot. Pásma drží čitelnost u stolu a dávají AI jasné tóny
protokolu; hranice viz [prototyp-mvp.md](prototyp-mvp.md).

### 4.7 Postihy (trvalé i dočasné následky)
Postih je **situační, komediální, vázaný na fikci** následek špatného rozhodnutí —
netrestá sílu karet číslem, ale **degraduje agency a vyrábí komedii**. Taxonomie:
- **informační** (nejčastější) — degradují viditelnost („vidíš jen názvy věcí, ne
  staty", „tohle kolo nevidíš telegraf");
- **zámkové** — omezují volbu („nesmíš do slotu dát GANGSTER");
- **ztrátové** (střídmě) — berou zdroje (kredity, kartu z ruky).

Postihy mají **dva tiery**: lehké dočasné (samy vyprší) a těžké trvalé (drží do
vyléčení v motelu, §4.8). Aktivní postihy mají **malý cap na hráče + eskalaci**:
po jeho překročení je postava kolo–dvě „složená" (leží v autě, generuje poznámky
do protokolu), pak se vrací. Složení **maže jen lehké postihy** — těžké přetrvávají
a léčí se dál za kredity, aby složení nikdy nebylo levnější než poctivé léčení.
Nahrazují v2 systém zranění + prokletých/zoufalých karet.

### 4.8 Kreditová ekonomika a motel
Kredity jsou **společné** (skupinové rozhodování, kdo se léčí a na čí kartu se
sáhne) a **per-run** (nepřecházejí → žádný hoarding). Utrácejí se v motelu za
**směnu karet** a **léčení těžkých postihů** (léčení je výrazně dražší). Příjem
z truhel a velmi úspěšných situací. Motel je **větvová odbočka** (tým volí úkryt
vs. hnát náklad dál) — dostupný, ale za cenu volby. Konkrétní ceny, příjmy a
rozmístění motelů viz [prototyp-mvp.md](prototyp-mvp.md).

### 4.9 Žár a pronásledovatel (eskalace na mapě)
Každý run má jednoho perzistentního pronásledovatele (**Žár**), který nikdy nestojí
v uzlu — jede za týmem a je **pozicí na značené trati** (křížkující šerif, §1), ne
odosobněným číslem. Roste za průšvihy, hlučné hraní (zbraně, silně útočné karty) a
vybrané výsledky; **každý pohyb nese anotaci proč** (§4.11). Prahy trati (viditelné
předem): **Zátah** (příští uzel nahradí zátah, obě větve přes něj), **léčka**
(mimořádný uzel s pronásledovatelem osobně), **konfrontace** (okamžitá finální
situace; přežití Žár srazí). Pronásledovatel se losuje na začátku runu, je viditelný
od první minuty a **ruší jeden stat/štítek** (federál bere úplatky = hodnotu z hry;
šerif reaguje na hlučnost dvojnásob) — čtvrtina páky je proti finále oslabená,
každý run se hraje jinak. Vypravěčský háček: pronásledovatel je kolega poldy od
stroje, protokol cituje jeho hlášení a oba byrokrati se v spisu tiše nesnášejí.
Konkrétní hodnoty viz [prototyp-mvp.md](prototyp-mvp.md). **Záměrně NE:** perzistence
napříč runy (scope + patent WB na nemesis), soubojový systém s HP, tahy nepřítele.

### 4.10 Tajné osobní cíle (kooperace s třením)
Každý hráč si na začátku lízne tajný cíl vázaný na jeho hru a na obsah protokolu
(„skonči se dvěma postihy a přesto DORUČENO", „ani jednou nedej zbraň do viditelné
role", „polda tě označí za mozek operace"). Dává skrytý důvod hádat se o **konkrétní
rozdělení slotu**, zatímco tým optimalizuje globálně, a vytváří závěrečný reveal
moment. Cíle jsou převážně **mechanicky ověřitelné** (simulace je umí bodovat),
čistě textové jen tam, kde nesou reveal.

### 4.11 Vysvětlující vrstva „proč se to stalo"
**Každá netriviální mechanická událost nese při odhalení krátkou anotaci, proč
nastala** — skryté prahy, vynucení a štítky, pohyby šerifa, postihové řetězce,
plnění tajných cílů (reveal na konci ukáže, které tahy cíl plnily nebo kazily).
Není to tutoriál, ale průběžné diegetické „proč" vetkané do spisu a okraje mapy;
hráč se pravidla učí tím, že vidí jejich dopad. Přímá reakce na nález playtestu,
že hra svá pravidla nevysvětluje.

### 4.12 Vlastnictví postavy
Hráč vlastní své karty a nese následky (postihy). Ostatní radí a navrhují rozdělení,
ale **vlastník karty musí souhlasit**. Řeší quarterbacking a dává postihům
emocionální váhu.

## 5. Profily hráčů a jména

Hráč má **profil s vlastním jménem** a statistikami úspěšnosti, přenosný mezi světy.
**Jména ale nikdy nejdou do promptu:** LLM píše protokol s placeholdery (Podezřelý
A/B, 1. pád), jména se dosazují lokálně až po vygenerování. Tím zůstává cache klíč
přenositelný (globální cache) a prompt injection nemožná (volný text hráče se
k modelu nedostane). Profil se statistikami je čistě klientský stav mimo AI vrstvu.
*(Perzistence profilů napříč runy = meta-progrese, mimo první MVP.)*

## 6. Multi-svět a DLC

**1930 (prohibice)** je první svět. Každý další (Cold War Berlin, Cyberpunk Slums…)
je **DLC nad stejným jádrem** — mění se obsah (situace, věci, štítky, pronásledovatelé,
flavor), ne pravidla. Karty nesou pole světové příslušnosti (většina sdílená,
výjimky per svět). **Host Pass:** DLC stačí vlastnit hostovi lobby.

## 7. Komunitní karty & asynchronní multiplayer

- Po smrti týmu se spis zavře, ale jimi vytvořené karty propadají do globální
  databáze — leží v důkazním materiálu pro další hráče.
- **Omezený skladač karet:** hráči nepíšou volný text (ochrana proti prompt
  injection), skládají kartu z předpřipravených komponent — staty a štítek jsou
  ze skladače, ne z AI (**žádné skryté AI balancování**). „Custom" věc za úspěšný
  průchod jde po **verifikaci** (distribuce statů + moderace) do prémiového fondu.
- **Prémiové karty = meta-progrese:** odemykají se do sbírky pro příští runy, ne
  jako in-run power spike. Nejsou silnější, jsou specializovanější/swingovější
  (mění varianci, ne průměr) — žádný power creep proti snowballu obtížnosti.
- **Moderace:** automatický filtr + report + proces (povinné i kvůli Steam AI
  disclosure). **Cold start:** před launchem ručně naseedovat stovky karet.

## 8. AI architektura & náklady

- **Autorská vrstva (ne AI):** telegraf a text situace s mezerami jsou psané ručně;
  AI je nepíše a **nerozhoduje o výsledku**.
- **AI vrstva:** **jedno LLM volání na uzel** dramatizuje hotový výsledek (pásmo +
  rozdělení karet do slotů + stav postihů) do 3–5 vět suchého protokolu. Levný
  model (třída Haiku), strukturovaný vstup.
- **Cache klíč bez jmen** → globální cache à la Infinite Craft; náklady na hráče
  časem klesají.
- **Fallback šablony** při výpadku / timeoutu — **hra nikdy nečeká na síť**.
- Logovat všechny výstupy (dlouhodobě možnost malého lokálního modelu).
- **Steam AI disclosure (Live-Generated):** modely a guardrails na store page.

## 9. Business model

- **9,99 € pay-to-play** (Steam / Itch.io), žádné předplatné ani tokeny.
- **Start = ~3 příběhy/světy** místo jedné trasy; 4-pack bundle se slevou.
- **Free demo:** jeden pevný sólo run s předgenerovaným obsahem (nulové API náklady).
- **DLC světy 4–5 €** s **Host Passem** (DLC stačí vlastnit hostovi lobby).

## 10. Neporušitelné design principy

- **Mechanika rozhoduje, AI vypráví.** LLM nikdy neurčuje výsledek slotu — dostává
  hotový výsledek a jen ho dramatizuje.
- **Hra nikdy nečeká na síť.** Timeout → fallback šablona.
- **Viditelná pravidla — ve v3 „prahy skryté před, odhalené po" + vysvětlující
  vrstva.** Prahy jsou před commitem skryté (jinak není co objevovat), ale po
  vyhodnocení se vždy ukážou a každá netriviální událost nese anotaci „proč se to
  stalo" (§4.11). Skrytost je learnabilita, ne gotcha.
- **Vlastnictví postavy.** Tým radí a navrhuje rozdělení, vlastník karty souhlasí.
- **Žádný volný text hráčů do AI** — jen omezený skladač karet; jména se dosazují
  post-hoc, nikdy nejdou do promptu.

## 11. Otevřené otázky

- Přesná čísla resolučního systému (viz prototyp — ladit simulací a playtestem).
- Kvalita českého AI humoru — testovat jako první věc.
- **Kognitivní zátěž:** náklad + kredity + Žár + postihy + dva skryté systémy
  (prahy *i* tajné cíle). Kolik jich party u stolu unese? Odlehčení: Žár = trať,
  postihy = poznámky na spisu, oba skryté systémy kryje vysvětlující vrstva.
  Kandidát na škrt zůstává **náklad** (roli „prohry týmu" může převzít Žár).
- **Jazyková/tržní strategie:** obsah vzniká a testuje se česky (rizikovější jazyk
  pro AI humor), primární Steam trh je anglický — rozhodnout „česky ověřit →
  anglicky vydat" a kdy zařadit překlad.

---

*Historie škrtnutých směrů (nenavrhovat znovu):*

- **v1** (2026-07-22) — Jackbox/browser-join režim, tajné karty, AI balancování
  obtížnosti, product placement. Nahrazeno/škrtnuto po kritice a produktové diskusi.
- **v2 → v3 (pivot 2026-07-23, D14–D17)** — škrtnuta **kostková resoluce** a vše na
  ní závislé:
  - *d6 + tagy (Násilí/Lest/Úplatek/Útěk) + ridery + prahy hodů* → náhoda se
    přesunula na **vstup** (co ti přijde do ruky, gamble, šum prahů), resoluce je
    slotová (5 statů vs. skryté prahy). Důvod: víc volby a komedie v mechanice,
    míň frustrace z výstupního hodu.
  - *pevná čtveřice postav (Bartoš/Kowalski/Mazur/Fontana)* → **profily hráčů se
    jmény** (§5); jména se dosazují post-hoc.
  - *zranění + prokleté + zoufalé karty jako systém* → **postihy** (komediální
    taxonomie, §4.7) + **gamble** (§4.4).
  - *tajné cíle vázané jen na obsah protokolu* → cíle vázané na **hru i protokol**,
    převážně mechanicky ověřitelné (§4.10).
  Přežívá: estetika §1, psací stroj, Žár + pronásledovatel (přerámováno na mapu),
  neporušitelné principy, distribuce/online, AI architektura.

*Souvisí: [prototyp-mvp.md](prototyp-mvp.md). Archiv procesu pivotu:
[projekt/navrh-v3.md](projekt/navrh-v3.md).*
