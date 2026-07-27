# Verdikt kritika — K2 drift a K5-D jako P-rozhodnutí

*design-critic, 2026-07-27. Podklad: `technika/kalibrace-4-final-2026-07-27.md` §6–7,
`projekt/rozhodnuti.md` D25–D31, `prototyp-mvp.md` Fáze 0 (zapečené znění).*

---

## 0. K oběma přiznáním

Přiznání č. 1 (jeden blok seedů) je vážnější, než jak je v D31 formulované. Nejde
jen o to, že verdikty byly optimistické — jde o to, že **čtyři kalibrace se řídily
podle signálu, jehož run-to-run rozptyl je u tenkých gatů srovnatelný s laděnou
veličinou.** U K2 je sd bloků 0,040 a chybějící vzdálenost ke gate 0,050. To znamená,
že rozdíl mezi „splněno" a „nesplněno" u K2 je **1,2 směrodatné odchylky** — brána
v tomhle bodě nemá rozlišovací schopnost, kterou předstírá. To není detail metodiky,
to je nález o samotném gate (viz N2).

Přiznání č. 2 přijímám bez zásluhy. Podmínka „doložit run-to-run varianci" byla
napsaná pro K6a proto, že tam byl breach největší — že chytila systémovou chybu,
je štěstí, ne prozíravost. Poučení je opačné, než jak zní: **podmínka neměla být
vázaná na jeden gate, ale na režim měření.** Beru to jako svou chybu ve specifikaci,
stejně jako ≥12 b. v D27.

---

## N1 — KRITICKÉ: D25e a uniformní práh K5-D jsou nesplnitelná dvojice omezení

**Problém.** D25e zakazuje oslabit Malona i prohazovat staty slotů. Malonova
identita (D20a) nuluje `hodnota` run-wide, tedy v každém uzlu s hodnota-slotem
snižuje strop dosažitelných zásahů ze 4 na 3. K5-D pak měří „uzly, kde nedosáhnu
víc než 1 zásah" a aplikuje na ně **jeden práh napříč oběma pronásledovateli**.
Mandát tedy současně (a) zakazuje sáhnout na příčinu a (b) požaduje, aby následek
zmizel. Žádná posloupnost obsahových kroků tuhle dvojici nesplní.

**Zásah.** Proveditelnost MVP. Pátá iterace obsahu za sebou bude kupovat desetiny
a narazí na týž strop — přesně to se stalo (5 kotev, varianta C, `improv_skryte`,
oprava bota: každá „pomohla o desetiny").

**Důkaz.** Poměr Malone/Brody je 10,9/5,6 až 16,6/9,6, tedy **1,7–1,9×**. Malone
odebírá jeden ze čtyř dosažitelných zásahů v ~7 z 15 situací. To není odchylka
obsahu, kterou lze doladit — to je **aritmetický stín D20a** a řádově sedí.
Druhý důkaz je nepřímý, ale silnější: **Brody po variantě C plní K5-D u všech
počtů.** Systém tedy prokazatelně umí prahu dosáhnout; nedosahuje ho výhradně tam,
kde mu v tom brání schválená identita postavy.

**Návrh řešení.** Uživatel na tuhle otázku **už jednou odpověděl** — D25 P0a:
„hodnota-sloty nulované Malonem se do K5 nepočítají, jsou to záměrné strategické
překážky známé od startu runu, ne vady obsahu." D26 tuhle odpověď zrušil, ale
z důvodu, který se týkal **operacionalizace, ne záměru** (doslovné vyloučení slotu
bylo měřením no-op, protože K5 klasifikuje *uzel*, ne slot — vyloučení slotu
nevrátí odebraný dosažitelný zásah). **Varianta D vylila se špatnou operacionalizací
i platný záměr.** Správný krok není znovu otevírat P0a, ale operacionalizovat ho
poctivě: práh K5-D **per pronásledovatel**, protože „beznadějný uzel" znamená pod
Malonem něco jiného než pod Brodym — pod Malonem je to ohlášené omezení, se kterým
hráč od první minuty počítá při commitu, pod Brodym je to přepadení. To je přesně
rozdíl, který D25 P0a pojmenoval.

**Varování k číslu.** Nepřijímejte per-pronásledovatelský práh odvozený ze status
quo (≤18 % by legalizovalo 16,6 a bylo by to goalpost-shift v čisté formě). Číslo
pro Malona musí vyjít z otázky „kolik beznaděje navíc je jeho identita hodná",
ne z toho, co je naměřeno. Viz N3 pro doporučenou jednotku.

---

## N2 — KRITICKÉ: K2 drift je hladinový test kauzální hypotézy — tatáž vada, kterou jsem přiznal u ≥12 b.

**Problém.** K2 tvrdí, že měří snowball: „info-postih → horší přiřazení → horší
pásmo → další postih." To je hypotéza o **efektu uvnitř runu**. K2 ji ale testuje
**agregovaným poměrem hladin** napříč všemi runy: PRŮŠVIH-rate(3–4) / PRŮŠVIH-rate(1–2).
Přímý estimátor téhož efektu — korelace „aktivní info-postihy × zásahy", −0,131 —
je v bráně vedený jako **diagnostika**.

To je přesně chyba, kterou jsem v D27 přiznal u vlastního prahu ≥12 b.: *hypotéza
o efektu se testuje rozdílem rozdílů, ne hladinou.* Uložil jsem si to jako poučení
pro roli. Konzistence mě zavazuje aplikovat to i na K2, i když jsem to číslo tehdy
obhajoval.

**Zásah.** Srozumitelnost a proveditelnost. Brána ladí veličinu, která snowball
měří jen zprostředkovaně a je zatížená selekcí: runy, které dojdou do uzlů 3–4,
jsou v průměru ty zdravější (ty rozbité skončily dřív). **Přežití vzorku drift
systematicky snižuje** — 1,250 tedy pravděpodobně podhodnocuje skutečný
uvnitř-runový snowball. Brána trestá obsah za statistický artefakt.

**Důkaz — a to je ta část, která rozhoduje.** Dosaďme čísla brány. Floor: pozdní
PRŮŠVIH-rate 23,25 %. Při driftu 1,250 je raná 18,60 %; při driftu 1,300 je raná
17,88 %. Měřené okno jsou 2 rané a 2 pozdní uzly. Očekávaný počet PRŮŠVIHŮ v runu
se tedy mezi „nesplněno" a „splněno" liší o **0,014**, tj. **jeden PRŮŠVIH navíc
zhruba na 70 runů**. Kdybyste místo toho přitížili pozdním uzlům, vyjde to nastejno
(~0,019/run). **Celá vzdálenost mezi propadem a průchodem K2 je pod rozlišovací
schopností kteréhokoli stolu.** Zároveň je pod rozlišovací schopností vlastního
měření (gap 0,050 při sd 0,040).

**Odpověď na otázku „je 1,3 odvozené, nebo aspirace, která se zabydlela".**
Je to aspirace — baseline 1,16 plus zaokrouhlené zpřísnění. To ale samo o sobě
není diskvalifikující; gate smí být aspirační, když měří „existuje vůbec ta věc,
kterou design slibuje". Diskvalifikující je, že **v tomhle rozlišení neměří ani
existenci, ani neexistenci**. Rozdíl 1,25 vs. 1,30 není rozdíl mezi „snowball je"
a „snowball není" — obojí je „snowball je zanedbatelný".

**Nejtvrdší věta tohohle auditu:** korelace −0,131 (r² ≈ 1,7 %) je poctivé měření
mechanismu a říká, že **snowball v3 prakticky neexistuje**. Drift 1,25 vs. 1,30
je debata o tom, jak tuhle skutečnost zaokrouhlit.

**Návrh řešení (v rámci scope).** Dvě varianty, obě levné:

1. **Přeformulovat K2 na podmíněný kontrast**, který měří to, co design slibuje:
   `PRŮŠVIH-rate(pozdní | ≥1 aktivní info-postih) − PRŮŠVIH-rate(pozdní | 0 postihů)`,
   spárováno uvnitř runu. Floor ≥20 % (jediný robustní pass, 6/6) zůstává jako
   samostatná podmínka „pozdní uzly mají zuby". Práh nového kontrastu odvoďte
   z vnímatelnosti (viz N3), ne z baseline. **Riziko, které musíte přijmout předem:
   tenhle test snowball nejspíš vyvrátí.** To je ale informace, kterou chcete mít
   před stavbou, ne po ní.
2. **Přestat snowball měřit statisticky a udělat ho viditelným.** Viz N5.

---

## N3 — KRITICKÉ: všechny tři otevřené položky jsou specifikované pod prahem vnímatelnosti

**Problém.** Projekt už jednu konstantu vnímatelnosti má a používá ji obousměrně:
**τ = 6 b.** (K4d floor / K6a strop, D28). Tři otevřené položky žádnou takovou
kotvu nemají a jsou vynucované v rozlišení, které stůl nevidí:

| položka | vzdálenost ke gate | přepočet na zážitek |
|---|---|---|
| K2 drift | 0,050 | 1 PRŮŠVIH navíc / ~70 runů |
| K5-D | 0,583 p. b. | 1 mrtvý uzel navíc / ~34 runů (5 uzlů/run) |
| K5f Brody | 0,78 p. b. | 1 přeživší run navíc / ~128 runů |

**Zásah.** Tempo projektu. Čtyři kalibrace se spotřebovaly na tři veličiny, jejichž
celková naměřená odchylka od brány dohromady nezmění ani jeden odehraný večer.

**Důkaz.** Rozdíl proti K1 nebo K6a je řádový: K1 breach byl 70,9 vs. strop 70 na
škále, kde 5 b. win-rate je rozdíl mezi „hra se dá vyhrát" a „hra se dá vyhrát
skoro vždycky"; K6a breach 11,8 vs. 6 je rozdíl, který sólo hráč pozná okamžitě.
Ty gaty bylo správné hájit. Tyhle tři jsou jiná kategorie.

**Návrh řešení.** Přepsat všechny tři na **run-level jednotku**, ve které je hráč
prožívá, a práh odvodit z ní:
- K5-D: **„podíl runů s alespoň jedním beznadějným uzlem"** místo podílu uzlů.
  Při 10 %/uzel a 5 uzlech je to ~40 % runů; při Malonových 16,6 % je to ~60 %.
  Tohle jsou čísla, ke kterým designér umí zaujmout stanovisko („chci, aby každý
  druhý run s Malonem obsahoval moment, kdy nejde nic?"). K desetinám procenta
  na uzel stanovisko zaujmout nejde.
- K2: viz N2, práh podmíněného kontrastu v procentních bodech PRŮŠVIH-rate, ne
  v poměru.
- K5f: pásmo v celých bodech s deklarovanou tolerancí ≥1 b. (viz N4).

---

## N4 — VÁŽNÉ: K5-D a K5f jsou jedna nezodpovězená otázka se dvěma znaménky

**Problém.** Malone: víc mrtvých uzlů (10,9–16,6 vs. 5,6–9,6) **a** tvrdší finále
(přežití 66,5–79,5, vždy pod stropem). Brody: míň mrtvých uzlů **a** měkčí finále
(80,55–80,78, systematicky nad stropem). Oba pronásledovatelé jsou **konzistentně
asymetričtí v obou směrech**. Oba gaty přitom předepisují **stejný práh oběma**.
Oba breache jsou tedy jeden a týž jev: designová asymetrie prosakující skrz
symetrickou bránu.

**Zásah.** Srozumitelnost brány. Dokud není zodpovězeno „mají být pronásledovatelé
srovnatelně těžcí, nebo je Malone hard mode?", nelze ani jeden z těch dvou gatů
správně specifikovat — a tým bude donekonečna ladit obsah proti nevyslovenému
předpokladu parity.

**Důkaz.** Projekt už jednou stejnou chybu udělal a opravil: K1 se měřilo agregátně,
dokud D26 nezavedl per-count — a **současně** se zavedla K6a jako explicitní
požadavek parity mezi počty hráčů. Tj. u počtů hráčů projekt paritu **vyslovil**
a pak ji vynucoval. U pronásledovatelů žádné takové rozhodnutí neexistuje, ale
brána se chová, jako by existovalo.

**Návrh řešení.** Vyžaduje rozhodnutí designéra. Správná otázka:
**„Je volba pronásledovatele volbou obtížnosti, nebo volbou příchuti?"**
- Příchuť (parita) → potřebujete K6a-analog pro pronásledovatele a pak je
  Malonova identita v konfliktu s D25e; něco z toho padne.
- Obtížnost (Malone = hard) → K5-D i K5f dostanou per-pronásledovatelská pásma
  a **oba dnešní breache zmizí jako správně naměřená vlastnost designu.**

Nezaměňovat s tichou slevou: tohle není snížení prahu, je to přiznání, že se
dosud měřily dvě různé hry jedním metrem.

---

## N5 — VÁŽNÉ: snowball se nevyrábí statistikou, ale viditelností — a hra na to má axiom

**Problém.** I kdyby K2 prošla na 1,52, hráč u stolu snowball **nepozná**, protože
se projevuje jen jako posun v distribuci výsledků. Rozdíl 18,6 % → 23,3 % je
nepozorovatelný v jednom runu, a hra se hraje po jednom runu.

**Důkaz z existující hry.** *Pandemic* (Matt Leacock) má nejcitovanější kooperativní
snowball v žánru a **nedělá ho distribucí**. Dělá ho třemi viditelnými komponentami:
posuvník míry nákazy (2→2→3→3→4), návrat infikovaných měst na vrch balíčku po
Epidemii, a řetězové ohnisko. Eskalace je **oznámená a odečitatelná z desky**;
statistika je až důsledek. Kdyby Pandemic měřil snowball driftem výskytu ohnisek,
laboval by taky desetiny — a hráči by přesto nic necítili.

Tohle je zároveň **v souladu s neporušitelným principem projektu „viditelná
pravidla"**: hráč má vždycky vědět, proč uspěl nebo selhal. Snowball, který se dá
prokázat jen agregací přes 6000 runů, ten princip tiše porušuje.

**Návrh řešení (v rámci scope, obsah + UI, ne nová mechanika).** Snowball, který
už v systému je (info-postihy, Žár), zviditelnit: pozdní uzly mají hlásit, že jsou
pozdní. Žár už roste a už má prahy — hráč ale nemá jediný ukazatel, který by mu
řekl „tohle je uzel 4, tady se chybuje dráž". To je práce pro lidskou bránu
a metriku 6 (čitelnost), ne pro další kalibraci.

---

## N6 — DROBNÉ: `faze` — ne, ale ze silnějšího důvodu, než se uvádí

Souhlasím s nezapečením, **odmítám ale odůvodnění „není to výhodný obchod".**
Obchod se neposuzuje, protože **nic nekupuje**: 1,282 při gate 1,3 je pořád
nesplněno (2/6 bloků). Za lék, který nemocného nevyléčí, je jakákoli cena záporná.
Navíc cena je horší, než jak je popsaná: sd K6a 0,80 → 1,29 na gate, který už dnes
breachuje 1 blok ze 6 s maximem 6,4 — zdvojnásobení rozptylu z toho udělá třetí
otevřený gate. Obchod tedy nezní „+0,032 za −0,28", ale **„nula za −0,28 a jeden
nový breach"**.

**Hlídám slib.** Content-generator odmítl variantu s oběma nádražími jako `rana`
(drift ~1,52) s odůvodněním, že text situace ani jeden konec trasy neusazuje.
Toho rozhodnutí se držte. **Zároveň to znamená, že tvrzení „1,3 je nedosažitelné"
je nepravdivé** — dosažitelné je, jen ne poctivě. To je pro P-rozhodnutí zásadní
rozdíl a musí být na stole explicitně: volíte mezi (i) fikcí, kterou obsahový lead
označil za dolepenou k číslu, (ii) změnou estimátoru/prahu, (iii) přiznáním, že
snowball je slabý, a rozhodnutím, co s ním.

---

## N7 — VÁŽNÉ: největším hybatelem kalibrace-4 byla oprava měřicího přístroje, ne hry

**Problém.** Oprava jedné botí heuristiky (D30) posunula K2 drift 1,18→1,26,
K5 expDead 11,3→10,7, K6a 5,0→3,4 a odstranila 70 % `gangster_auto_fail`.
To je **víc než P2 + P3 dohromady**, a nebyla to změna hry — byla to oprava
nástroje. Bot přitom ignoroval pravidlo, které `stitky.yaml` vede jako **veřejné**
a telegraf hlásí doslova.

**Zásah.** Důvěryhodnost všech zbývajících čísel. Zbývající deficity (0,05 a 0,58)
jsou menší než efekt jediné nalezené botí chyby. Nikdo přitom bota nepodrobil
systematické prověrce proti seznamu veřejně oznámených pravidel — chyba se našla
náhodou při rozpadu propadů per-slot.

**Návrh řešení.** **Než se udělá jediný další obsahový krok:** projít všechna
veřejná pravidla (`stitky.yaml`, signály `deriveTelegrafSignal`, telegrafní verdikty)
a pro každé doložit, že je referenční bot respektuje na obou osách (commit i
přiřazení). Je to hodiny práce, ne iterace, a je to jediná páka s doloženým
historickým výnosem větším než celý zbývající deficit. Pokud existuje druhá chyba
téže třídy, **oba otevřené gaty se můžou zavřít zadarmo** — a pokud neexistuje,
získáte právo tvrdit, že měříte hru.

---

## N8 — VÁŽNÉ: čitelnost (metrika 6) je otevřená od 2026-07-22 a čtyři kalibrace se jí nedotkly

**Problém.** Nález prvního playtestu — „hra musí vysvětlovat, proč se to stalo" —
je součástí lidské brány od 22. 7. Od té doby proběhly čtyři kalibrace, žádná
z nich na něj nesáhla, protože simulace ho neumí změřit. Stejně tak kvalita
českého humoru, kterou CLAUDE.md označuje za **největší produktové riziko**.

**Zásah.** Zábavnost. Riziko projektu se nepřesouvá tam, kde se pracuje — pracuje
se na tom, co je měřitelné.

**Důkaz z existující praxe.** Mega Crit (*Slay the Spire*, GDC 2019, „Metrics Driven
Design and Balance") postavili metrický server ještě v prototypu — ale **měřili
rozhodnutí skutečných hráčů**, ne agentů, a Giovannetti v té přednášce explicitně
varuje, že metriky snadno klamou, když se nečtou opatrně. Hra šla do Early Accessu
nevyváženáa vyladila se na lidských datech. Analogie sedí: **vaše brána měří bota,
a D30 ukázalo, jak snadno bot měří sám sebe.**

---

## Odpovědi na pět položených otázek

**1. Je K2 drift ≥1,3 správný gate?** Ne — ale ne proto, že je moc přísný. Je to
hladinový agregát kauzální hypotézy (N2), zatížený selekcí přeživších, s gapem
1,2 sd a rozlišením 1 PRŮŠVIH na 70 runů. Číslo 1,3 je aspirace odvozená z baseline
a jiné poctivě odvoditelné číslo **na téhle metrice neexistuje**, protože metrika
nemá vazbu na nic, co hráč vnímá. Zbývající neprozkoumaná páka **není** — `faze`
byla poslední fikčně poctivá a nestačí. Odvoditelné číslo dostanete až po změně
estimátoru na podmíněný kontrast (N2, varianta 1), kde se práh odvodí od
vnímatelného rozdílu v procentních bodech.

**2. Je K5-D ≤10 % správný práh?** Práh je obhajitelnější než 1,3 — je nativní
a měří hladinovou vlastnost hladinovým testem, což je správně. **Vadný je systém?
Ne. Vadný je práh? Taky ne. Vadné je, že je jeden pro dva různé pronásledovatele**
(N1, N4), za současného zákazu sáhnout na příčinu rozdílu (D25e). Ano — K5-D má být
per-pronásledovatel s různým pásmem, ale až poté, co padne rozhodnutí z N4;
jinak je to sleva, ne oprava. A jednotka má být run-level, ne per-uzel (N3).

**3. Stojí obchod `faze` za to?** Ne, a důvod je silnější, než se uvádí: nekupuje
nic (2/6 bloků = nesplněno) a platí se za to novým breachem K6a (N6).

**4. K5f Brodyho přestřel.** Honit obsahem ne — 0,78 p. b. je jeden run ze 128
a zásah do severity Brodyho finále tlačí K1 a K6a, tedy dva gaty, které konečně
drží. Pásmo [60, 80] je pro pronásledovatele, který neruší stat, špatně
specifikované ze stejného důvodu jako K5-D (N4): předpokládá paritu, kterou nikdo
nerozhodl. Ponechat jako **designovou poznámku pro lidskou bránu** („působí Brody
jako ta lehčí volba?"), ne jako gate breach.

**5. Průřezově: je další broušení simulace správná investice?** **Ne.** Bez
zmírňování: čtyři kalibrace, 7/9 gatů s velkou marží, a zbývající dva mají
dohromady dopad menší než jedna nalezená chyba bota (N7) a menší, než co stůl
za večer pozná (N3). Zbytkové riziko projektu je jinde a je pojmenované v jeho
vlastním CLAUDE.md: **kvalita českého humoru a čitelnost.** Obojí je od 22. 7.
neošetřené (N8). Doporučené pořadí: (a) prověrka bota proti veřejným pravidlům
— hodiny, doložený výnos; (b) rozhodnutí z N4 (symetrie pronásledovatelů), které
zavírá K5-D i K5f bez jediné změny obsahu; (c) rozhodnutí o K2 podle trichotomie
z N6; (d) **jít na lidskou bránu.** Simulace svou práci odvedla — dál už jen
zjemňuje čísla, která nikdo neuvidí.

---

## Tři nevyřešené otázky, na které musí designér odpovědět

1. **Je volba pronásledovatele volbou obtížnosti, nebo volbou příchuti?**
   Odpověď zavírá K5-D i K5f. Bez ní se oba gaty nedají specifikovat a D25e
   („neoslabovat Malona") je s uniformním prahem K5-D v přímém rozporu.

2. **Má být snowball v3 vůbec statistický?** Korelace −0,131 říká, že mechanismus
   je zanedbatelný. Buď se K2 přeformuluje na podmíněný kontrast a přijme se
   riziko, že snowball vyvrátí, nebo se snowball udělá viditelným (po vzoru
   posuvníku míry nákazy v Pandemicu) a K2 se stane diagnostikou. Třetí možnost —
   ladit poměr dál — je ladění pod prahem vnímatelnosti.

3. **Co musí být splněno, aby se šlo na lidskou bránu?** Dnes to zní „všech 9
   gatů". Pokud to platí i pro gaty, jejichž vzdálenost od prahu je 1/70 runu,
   pak brána nepustí ven hru, která je hotová — a největší riziko projektu
   (humor, čitelnost) zůstane neotestované další čtyři kalibrace. Odpovědi
   „snížíme laťku" se bránit; odpovědi „laťka platí, ale tyhle dva body přechází
   do watchlistu lidské brány s doloženým důvodem" ne.

---

*Zdroje benchmarků:*
[Pandemic — komponenty a eskalace (Z-Man / Wikipedia)](https://en.wikipedia.org/wiki/Pandemic_(board_game)) ·
[Slay the Spire: Metrics Driven Design and Balance, GDC 2019 (GDC Vault)](https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics) ·
[How Slay the Spire's devs use data to balance their roguelike deck-builder (Game Developer)](https://www.gamedeveloper.com/design/how-i-slay-the-spire-i-s-devs-use-data-to-balance-their-roguelike-deck-builder)
