# Stav projektu

*Živý dokument. Udržuje `project-manager` — aktualizuj po každém větším kroku.
Poslední aktualizace: 2026-08-02.*

## Aktuální fáze

**v3 kalibrace (2026-07-24).** v2 simulační brána splněna 2026-07-22 a uzavřena
pivotem v3 (D14–D20); v3 engine přestavěn v kódovém repu, diagnostický run-1
(1000×2) proměřen — K1/K6a/K8/co-op inverze prošly, K5/K7/K2 padly (+ hraniční
K4c). **Kalibrace-1 zapracována v design repu (D22):** 45-slot kotva-patch
zapečen + kořenový lék K5/K7/K2 v obsahu. **Míč je u enginu:** reset proxy,
šum, čisté re-měření dle akceptační brány (viz backlog). Lidská brána otevřená.
**Kalibrace-2 doměřena a MONOREPO (D23, 2026-07-26):** kódový repo sloučen sem
jako `prototyp/` (subtree, submodule zrušen, ADR-009) — kalibrační iterace jsou
nově jedna smyčka v jednom repu. **Kalibrace-3 (D24, 2026-07-26): poctivý
negativní výsledek** — lék „snížit viditelné kotvy" měřením vyvrácen (směr K1
opačný, K5/K7 v mandátu nedosažitelné, drivery = Malone-nulované hodnota-sloty
+ finále), nic se nezapeklo. **Mandát kalibrace-4 ROZHODNUT (D25, 2026-07-27):**
K5 bez mechanicky nulovaných slotů, scope K5/K7 na běžné uzly + vlastní metrika
finále, K7/K2 znění v revizi (tým předloží balík ke schválení), obtížnost
jednotná napříč 1–4p, Malone: řešitelnost bez hodnota-slotu. **Balík nového znění brány
SCHVÁLEN (D26, 2026-07-27):** body 1–8, K5 = varianta D („mříž mrtvých
rozhodnutí"), eskalace D22f uzavřeny.
**KALIBRACE-4 PROVEDENA (2026-07-27, D27–D29).** Znění brány zapečeno
(D26 + D28/V1); provedeny P2, P3, P1. **Poprvé od pivotu v3 procházejí K1
per-count i K6a současně** (61,6 / 56,6 / 59,1 / 60,3 %, spread 5,0 b.).
**Brána ale stále NENÍ splněna:** K2 drift 1,18 (gate ≥1,3) a K5 varianta D
11,3 % (gate ≤10 %); obojí s hotovou diagnózou a identifikovaným lékem, nic
se nesnížilo. Report:
[[../technika/kalibrace-4-final-2026-07-27|technika/kalibrace-4-final-2026-07-27.md]].
**Po D30 zapečeno dál (D31):** oprava `deriveTelegrafSignal` o slotovou výjimku
a **varianta C** (`nadrazi-vypravci` — slot pro zbraň; Brody nově plní K5-D
u všech počtů), plus inertní enginová podpora pole `faze`.
**METODICKÝ NÁLEZ (D31): seedy 1–1000 jsou příznivý blok** — verdikt se od teď
bere z průměru přes bloky. Přes 6 bloků: **K5-D 10,58 (0/6 bloků v gate)**,
**K2 drift 1,25 (1/6)**, K6a 4,68 ale 1 blok breachne, K2 floor robustní.
Tagování `faze` pro K2 změřeno a **NEZAPEČENO** — drift jen 1,282 a platí se
za to zhoršením K5-D. Detail: §7
[[../technika/kalibrace-4-final-2026-07-27|reportu]].
**KALIBRACE-4 UZAVŘENA (D33, 2026-07-27).** Kritik doporučil přestat brousit
simulaci (D32) a uživatel rozhodnutí delegoval na PM. Zbývající mezery znamenají
u stolu 1 mrtvý uzel na 34 runů, 1 PRŮŠVIH na 70 a 1 přežití na 135 — hráč by
musel odehrát ~35 hodin, aby si jich všiml. **Dvě přiznaná zvolnění laťky:**
(1) pronásledovatel je PŘÍCHUŤ, ne obtížnost → K5/K5f se gatují přes oba
dohromady, protože si ho hráč nevybírá (losuje se, design §4.9) — tím se K5f
uzavírá poctivě (77,6 %); (2) K2 drift degradován na diagnostiku, floor ≥20 %
zůstává gate — viditelný snowball je Žár a ten funguje, drift měřil neviditelný
mechanismus s r² 1,7 %. **K5 (10,58 % proti ≤10 %) zůstává NESPLNĚNÉ a otevřené**
— váže výhradně Malone a oprava by sáhla na jeho identitu (zákaz D25e).
**Míč: (a) prověrka bota proti veřejným pravidlům, (b) fáze 2.1 vysvětlující
vrstva, (c) fáze 3 LLM + test humoru, (d) LIDSKÁ BRÁNA.**
**(a) PROVĚRKA BOTA HOTOVA (D34, 2026-07-27) — 8 nálezů nad 2000 runy, opravy
zatím NEPROVEDENY.** Nejtvrdší: (N1) `lock_stitek`, `lock_slot_viditelnost`
a `hide_viditelnost` **engine vůbec nevynucuje** → 36,5 % udělených postihů je
mechanicky nic (sonda: 840 + 1716 porušení); (N2) commit slévá role telegrafu do
pytle statů — pokrytí rolí sráží K5-D kandidáty 13,1 → 9,6 % a PRŮŠVIH proxy
15,3 → 11,2 %; (N3) commit nezná run-wide rušený stat, ač je veřejný od startu —
**třetina „Maloneho" přebytku u K5 je bot, ne Malone** (a oprava nesahá na jeho
identitu, tedy neporušuje D25e); (N4) bot nikdy nečte Žár, přitom hlučné hraní
tvoří 58,4 % přírůstku a překračuje 51–61 % všech prahů trati. Chyby jdou na obě
strany (N1/N5 dělají bota silnějším než člověk, N2/N3/N4/N6 slabším), takže
z brány kalibrace-4 se **nedá dovodit ani „byla přísná", ani „byla mírná"**.
Report: [[../technika/proverka-bota-2026-07-27|technika/proverka-bota-2026-07-27.md]].
**OPRAVY ZAPRACOVÁNY A BRÁNA PŘEMĚŘENA (D35, 2026-07-27)** — uživatel zvolil
„vše + jedno re-měření". 6 bloků × 8000 runů, verdikt z průměru (D31):
**K5 varianta D 10,58 → 9,72 % = POPRVÉ SPLNĚNO** (6/6 bloků, bez dotyku
Maloneho identity) a **K2 drift 1,25 → 1,39** (potvrzuje, že se dřív měřil
mechanismus z ~29 % nezapojený). Zato **K1 3p/4p breachne strop 70 %**
(57,3 / 67,1 / 77,5 / 79,7 %) a **K6a spread 4,7 → 22,4 b.** Příčina není nová
vada obsahu, ale **co-op škálování, které starý bot neuměl vybrat** — nový commit
volí nejlepší kartu na roli napříč týmem, takže 4p vybírá ze 12 karet a 1p z 8;
P1 kompenzoval jen prahy trati, ne obtížnost běžných uzlů. **P1 nebyl špatně
spočítaný, byl spočítaný na špatném hráči.** Úprava neprovedena — je to další
kalibrační kolo (viz backlog a otevřené otázky).
**FÁZE 2.1 SCHVÁLENA PO PM REVIEW (D36, 2026-07-27):** návrh
[[../technika/faze-2.1-navrh-2026-07-27|technika/faze-2.1-navrh-2026-07-27.md]]
prošel review (fakta ověřena proti enginu, 2 nálezy zapracovány — události bez
anotace, pásma kolaps/hlas-z-auta), otázky §10 rozhodnuty uživatelem (hot-seat
hide = varianta b). Souběžně **schválen sweep `prahOffsetDlePoctu` (D37)** na
K1 3p/4p + K6a. Další krok 2.1: implementační plán a stavba v `prototyp/`.
**SWEEP PROVEDEN (D38, 2026-07-27) — páka je vyčerpaná, nic nezapečeno.**
Jediný kandidát v pásmu `{1:0, 2:5, 3:6, 4:6}` sice K1 spraví (57,3 / 57,0 /
51,7 / 54,7, 6/6 bloků) a K6a srazí 22,4 → 6,03 b., ale **K2 drift 1,39 → 1,28
(6/6 → 2/6) nově padá** a K6a je *na* gate, ne pod ním (3/6 bloků). Navíc leží
na offsetech 5–6, tedy uvnitř pásma, které designér **naslepo předregistroval
jako „jiná hra"** (prahy `max(1, base − offset)` + `poPrezitiKonfrontace = 3`
⇒ od offsetu 4 clamp slévá rozestupy a prahy ≤3 přestanou reármovat) —
a facilitátor tentýž mechanismus nezávisle naměřil (od offsetu 7 se obtížnost
otočí). Podle předregistrovaného regresního rozpočtu **zapečení nedoporučeno**.
Report: [[../technika/kalibrace-5-sweep-prahoffset-2026-07-27|technika/kalibrace-5-sweep-prahoffset-2026-07-27.md]].
**ROZHODNUTO D39 (PM, delegováno uživatelem): varianta (a)** — breach K1 3p/4p
(77,5 / 79,7 % proti stropu 70) + K6a (22,4 b.) jde do lidské brány jako známá,
vyčíslená odchylka; A1 nezapečen (porušuje blind předregistraci a kupuje K1 za
K2 drift). `hraci[n].ruka` = záložní páka, aktivuje se jen po nálezu lidské
brány. **Kalibrace je ZAVŘENÁ; kritická cesta = 2.1 → 3 → lidská brána.**
**OBSAHOVÉ KOLO 2.1 ZAPEČENO (D40, 2026-07-28):** v3 fallback sada **28 šablon**
v `prompty/fallback-sablony.yaml` (v2 do `obsah/archiv-v2/`), po kole
generátor → humor-testér → kritik („zapéct s výhradami", 7 nálezů opraveno).
Obě povinná rozhodnutí §8 padla: `kolaps` přepsán na v3 sémantiku a doplněn
o nové pásmo **`navrat`**; **`hlas_z_auta` zamítnut** — engine událost nemá,
UI-only varianta by tvořila výsledek mimo engine. Uživatel rozhodl tři nálezy:
N1 se opravuje v textu (ne `slozeniKolMin` — kalibrovaná čísla se nerozbíjejí),
N3 neutrálním psaním (sólo run), a **`nazev` se doplňuje** do 15 situací + 4
léček/konfrontací. Vedlejší zisk: `vysvetleni.js` si `nazev` vzala sama —
anotace mapy nově jmenuje místo. 231 testů zelených, lint čistý.
**FÁZE 2.1 HOTOVA A PŘIJATA (D41, 2026-07-28):** stavba na větvi `faze-2.1`
dokončena (vč. `protocol-fill.js` na v3 — task 6), PM review potvrdilo §11:
231/231 testů + lint nezávislým během, smoke test celé smyčky v prohlížeči
(commit → přiřazení → výsledek s anotacemi, protokol klepe, konzole čistá).
Sloučeno do `main` (možnost 1, bez PR), větev smazána.
**KOLO `mozek-operace` UZAVŘENO (D42, 2026-07-28) — cíl škrtnut, sada je nově
8/8 mechanická.** Diagnóza (designer + generátor nezávisle) našla obě poloviny:
0 % ve sweepu D38 byl artefakt měřidla (textový cíl → `splnen: null`, a přesto
ve jmenovateli K9), ale pod tím **skutečná strukturální nesplnitelnost** —
prompt drží osoby jako „podezřelý A–D" a fallback sada smí osobu jmenovat
výhradně jako příjemce postihu, ne jako jednajícího. Náhrada rozhodnuta
**měřením, ne vkusem** (agenti se rozešli): ~290k runů přes `CONTENT_DIR`,
naslepo předregistrovaná pásma. **`schovana-bouchacka` prošel** (81,5 / 30,0 %
incidenčně, 89,5 / 35,7 % s biasem, divergence 41,8–52,9 % = cíl je skutečně
osobní); kandidáti na kreditech padli — `kredity_utracene_za` je počítána
týmově, takže dávala **nulovou divergenci mezi hráči** = týmový cíl
v přestrojení. Regrese doložena bitově (jediný rozdíl `verzeObsahu`),
233 testů zelených. **Vedlejší nález, který si žádá rozhodnutí: `muj-den`
breachuje K9** (nepodmíněně 96–99 % pro 1p–3p) — hygiena reportu ho odkryla
pod dosavadním falešným breachem. Report:
[[../technika/mozek-operace-kontrafaktual-2026-07-28|technika/mozek-operace-kontrafaktual-2026-07-28.md]].
**KOLO `muj-den` ZMĚŘENO (D43, 2026-07-28) — kandidát prošel, ZAPEČENÍ ČEKÁ
NA UŽIVATELE.** Diagnóza: vada je v metrice, ne v prahu — zásoba slotů na hráče
je 32,1 / 18,4 / 12,3 / 9,1, takže žádný plochý počítací práh nesedne všem
počtům. Kandidát **V-3 `podil_slotu_splnil_pct >= 50 a sloty_vlastnika_celkem
>= 5`** prošel jako jediný ze čtyř řezů, a to **všemi** předregistrovanými
kritérii (norm. divergence 0,86/0,93/0,94, guard-kill ≤ 0,7 %, regrese nulová).
**Nezapečeno kvůli dvěma podmínkám mimo dosah simulace:** K6b tempo (cíl je
nově živý v 80–89 % uzlů proti 21,7–57,5 % dnes) a **UI ukazatel „prošlo X /
propadlo Y", bez kterého je podíl neřiditelný** (metrika 6). Fallbacky:
A = škrtnout a otevřít kolo na `o-vlasek`, B = nést breach do lidské brány.
**OPRAVENO ZPĚTNĚ V D42:** zdůvodnění osobnosti přes absolutní divergenci
neplatilo (strop je funkcí marginální míry, saturovaný cíl nemůže divergovat);
verdikt o `schovana-bouchacka` po normalizaci **stojí**, poznámka v obsahu
opravena. Report:
[[../technika/muj-den-kontrafaktual-2026-07-28|technika/muj-den-kontrafaktual-2026-07-28.md]].
**UZAVŘENO ROZHODNUTÍM UŽIVATELE (D44): varianta B — `muj-den` se NEZAPÉKÁ**
a jde do lidské brány jako **druhá vyčíslená odchylka** vedle K1 3p/4p + K6a
(D39). V-3 je proměřený a připravený k zapečení, pokud si ho brána vyžádá;
UI ukazatel „prošlo X / propadlo Y" se do té doby nestaví. Nález „2 z 8 cílů
nejsou osobní" se nese do brány taktéž. **Ladění cílů se zastavuje** — tři kola
za sebou byla hranice návratnosti a otázka „dělá reveal tajných cílů u stolu
vůbec něco?" je mimo dosah simulace.
**KRITICKÁ CESTA JE VOLNÁ. Míč: fáze 3 (blokuje volba LLM poskytovatele)
a LIDSKÁ BRÁNA (odblokována 2.1).**
**PRVNÍ SEZENÍ LIDSKÉ BRÁNY PŘERUŠENO NA FIKCI (D45, 2026-07-29):** hráč se
zastavil o tři nálezy, balanc neřešil. Dva jsou **nedodaný kanon** — text
situace se 4 mezerami `{VEC}` (jádro §4.3, autorsky hotové v `obsah/`) se v UI
vůbec nevykresluje a popis věci je jen v hoveru → **fáze 2.2**, zadání
[[../technika/faze-2.2-navrh-2026-07-29|technika/faze-2.2-navrh-2026-07-29.md]].
Třetí je designová změna (telegraf atmosféricky, ne polopatě) → **mandát
game-designera**, schvaluje uživatel. Brána pokračuje po 2.2.
**FÁZE 2.2 HOTOVA (D46, 2026-07-29):** próza situace je nově hlavní prvek
přiřazení (mezery klikatelné, plní se živě názvem věci i příjmením vlastníka)
i výsledku (finální znění nad razítky, plněné z `slot_resolved`), popisy věcí
jsou vidět bez hoveru a mechanický souhrn telegrafu ustoupil próze. Nový čistý
modul `prototyp/src/ui/situace-text.js`, engine netknutý. Zapečen kontrakt
**`{kdo}` = vlastník karty v nejbližší NÁSLEDUJÍCÍ mezeře** (dvě situace mají
jen 3 `{kdo}` — skrytá „kdyby" role jednajícího nemá). 295 testů zelených, lint
čistý, celý run projitý v prohlížeči vč. léčky a konfrontace, konzole bez chyb.
**Míč: lidská brána (pokračování sezení) + mandát telegrafu.**
**KOLO TELEGRAFU: SMĚR SCHVÁLEN, INVARIANT NA REVIZI (D47, 2026-07-29).**
Designer → kritik (oba Opus), návrh + prověrka v
[[../technika/telegraf-invariant-navrh-2026-07-29|technika/telegraf-invariant-navrh-2026-07-29.md]];
`obsah/` netknutý. **Dva obraty:** (a) kritikův nález K-1 — mechanický výčet
všech 6 kanálů plnými jmény statů **už v UI je** (`commit.js:103–113`), takže
próza nikdy nebyla jediný nositel informace; (b) PM přeměřil K4d
(`sim/learnability.js`): rezerva u 1p **není 0,4 b., ale 18,6 b.** (τ = 6) —
kalibrace-4 číslo je po D35 mrtvé. Riziko přepisu je řádově menší, **zato se
obrátila teze návrhu**: marginální hodnota čtení telegrafu je dnes nejmenší
u sóla (3,6 b.) a největší u 3p/4p (6,8–7,7) → lepší telegraf by K6a
**rozevřel**, ne zúžil. Přepis je věc fikce, **ne balanční lék**.
**Uživatel rozhodl:** (1) mechanický řádek **nativně skrytý**, v nastavení hry
zapínatelný rozklik, výhledově prvek obtížnosti (→ změna proti čerstvé 2.2,
nová položka pro `prototyp/`; próza se tím stává jediným nositelem informace);
(2) **R1 = mlčet** o statu skrytého slotu; (3) **zakrývací zkouška zůstává
jako gate** (6+ čtenářů), ale její zadání se přepisuje — leakuje počet slotů
i jména statů a práh 0,70 je kruhový. Znění invariantu jde na revizi
(6 blokujících kritika).
**INVARIANT v2 SCHVÁLEN, OBSAHOVÉ KOLO OTEVŘENO (D48, 2026-07-29).** Revize
odpověděla na všech 6 blokujících; jádro v2 je **„nárok je sloveso, ne kulisa"**
(kulisa neprozrazuje nic, kanál obsadí až práce přiřknutá posádce) + pravidlo
záporného tvrzení + verdikt zbraně jako mřížka o **toleranci** místa, ne
o užitečnosti (staré znění by v konfrontacích tvrdilo opak toho, co scéna chce)
+ kanál 7 (`rusi`) jen pro léčky. Uživatel rozhodl: **strop 400 zn.** (předběžný,
potvrdí stopky), **řádek viditelný na prvním uzlu prvního runu** (onboarding),
**obsahové kolo se otevírá** bez druhé prověrky. PM ověřil sloty všech ukázek
(sedí) a změřil délky (336 / 363 / 385 — uváděné odhady zase neseděly).
**OBSAHOVÉ KOLO ZAPEČENO (D49, 2026-07-29):** nový invariant + **19 přepsaných
telegrafů** jsou v `obsah/`, `CLAUDE.md` opraven („1–2 věty" → 3–5 vět / 400 zn.).
Kolečko generátor → kritik → humor-testér → opravné kolo. Blokující nálezy byly
o čtenáři, ne o mechanice: konstrukce „A a B" znamenala tři různé věci, skeleton
„Jedna věc se rozhodne bez vás…" nesl 17 z 19 telegrafů, `brody-konfrontace` si
vymyslela rekvizitu, kterou by odhalení vyvrátilo. Po opravě: skeleton **0×**,
„vymyslíte až na místě" 10× → 1×. **Ověřeno PM měřením:** derivovaný signál sedí
u 19/19 (verdikty zbraně, 10× skrytý útok, 1× skrytá improvizace, slotová
výjimka, dva skryté u `nadrazi-noc`), délky 302–379 (strop 400), **295/295 testů
zelených**, golden snapshoty rebasovány — jediný rozdíl je `verzeObsahu`,
mechanika shodná. Uživatel rozhodl **zapéct teď a zakrývací zkoušku nechat jako
otevřenou položku** (řádek invariantu to přiznává, aby nevznikla mrtvá litera).
**Míč: (a) UI přepínač řádku + onboarding, (b) zakrývací zkouška se 6 čtenáři,
(c) lidská brána, (d) fáze 3 LLM.**
**NEZÁVISLÉ PM REVIEW OBOU PROUDŮ (2026-07-29, Fable):** 2.2 i telegrafy
**přijaty** — 295/295 + lint vlastním během, smoke test v prohlížeči: scéna
s číslovanými mezerami se plní živě (příjmení + věc), výsledek nese finální
znění, popisy věcí viditelné, telegrafy uzlů 1–2 čtou jako předzvěst bez
skeletonu. **Potvrzeno, že (a) je jediný blokátor sezení lidské brány** —
řádek „CO Z TOHO PLYNE" dnes svítí na každém uzlu, takže by sezení testovalo
EASY režim, ne přepis telegrafů.
**BLOKÁTOR ODSTRANĚN (D50, 2026-07-29):** mechanický řádek je skrytý, próza je
v default režimu jediný nositel informace. Přepínač *Ulehčení: rozbor telegrafu
na rozklik* stojí v nové kolonce **Obtížnost** na setupu (rám pro D25d), řádek
se navíc jednorázově ukáže na prvním uzlu — onboarding se ale spotřebuje **za
relaci, ne za run**, a rozklik se resetuje **s každým commitem** (jinak by
ulehčení splynulo se starým „svítí pořád"). Pravidlo je čistý modul
`prototyp/src/ui/telegraf-rozbor.js` s 13 testy; 308/308 zelených, lint čistý,
všech pět cest projito v prohlížeči, konzole bez chyb.
**Míč: (a) lidská brána — sezení může začít, (b) zakrývací zkouška se 6 čtenáři,
(c) fáze 3 LLM.**
**PRVNÍ DOHRANÝ RUN LIDSKÉ BRÁNY (2026-07-29): „všechno, jen ne zábava" —
NEJVÁŽNĚJŠÍ NÁLEZ PROJEKTU.** Po rozboru s hráčem-autorem NE proti mechanice:
(1) texty nezáživné/matoucí (telegraf = hádanka o 6 kanálech — riziko odložené
zakrývací zkoušky se naplnilo), (2) **vytratila se představivost** — karty měly
být slovník a AI měla jako GM v DnD kreativně interpretovat, JAK se věc použije;
stat-na-stat čtení udělalo z absurdní volby doslovnou pitomost bez obhajoby;
(3) věci „tematické až moc, ale nudné". Světlý bod: atmosféra telegrafu jako
směr. **Kontext: sólo + fallbacky + viditelný řádek = dva ze tří pilířů zábavy
netestovány; AI vrstva (největší riziko dle CLAUDE.md) nikdy nestála.**
Detail: [[../playtesty/2026-07-29|playtesty/2026-07-29.md]]. **Triáž PM čeká na
souhlas uživatele:** (a) Wizard-of-Oz test protokolů ve 2 režimech (kanonický
vs. kreativní interpretace) — rozhodující; (b) konceptové kolo „kde bydlí
kreativita" (mandát AI vrstvy, slot-literalismus, divočejší věci) + telegrafy;
engine/kalibrace se nezahazují, dokud nepromluvi (a).
**OBĚ KOLA TRIÁŽE DOBĚHLA (2026-07-30):** (a) **WoZ test** —
[[../technika/woz-test-2026-07-30|technika/woz-test-2026-07-30.md]], 8 uzlů
ve 2 režimech naslepo (klíč na konci), doporučení testéra „B-lite" (invence jen
u selhaných/nesedících slotů + 3 pojistky do promptu + per-slot vstupy ZÁCHRANA
a MAX DOSAŽITELNÉ); **čeká na slepé čtení uživatele — rozhodující data-point.**
(b) **Konceptové kolo** —
[[../technika/koncept-kreativita-navrh-2026-07-30|technika/koncept-kreativita-navrh-2026-07-30.md]]
(vč. prověrky kritika §8 a consistency-checku §10): rám „nespolehlivého
vypravěče" (AI smí JAK/PROČ a smí se mýlit v kauzalitě, mechanika drží
ZDA/KOLIK), slot-literalismus 76 slotů klasifikován (6 povinných + 7
doporučených přepisů; skrytá role nikdy doslovná, max 1 doslovná viditelná na
scénu), telegraf: škrtnout kanál POKRYTÍ. **Nález nad mandát POTVRZEN PM
v kódu, kanonu i botovi: `assign.js:243` ukazuje finální zašuměné prahy už při
rozdělování** (kanon: „prahy skryté před, odhalené po", design ř. 165/295; bot
je při přiřazení nezná) — jádro „rozděl co nejméně špatně" se hraje jako
aritmetika. Vada vznikla v katalogu §5 návrhu 2.1 (D36, prošlo PM review).
**Rozhodnutí uživatele: oprava úniku prahů · telegraf škrtací kolo vs.
zakrývací zkouška · fallback rovnocenný vs. přiznaně chudší · verdikt WoZ.**
**D51 EXEKUCE (2026-07-30):** (1) **Únik prahů OPRAVEN** (`b59b08e`) — assign
ukazuje jen kotvu/šum, rozklad až s razítkem; 3 úniky ucpány, 316/316 testů,
engine 0 diff, zámek v testech. (2) **Škrtací kolo telegrafů: invariant v3
hotov (POKRYTÍ škrtnuto, 3 položky, pravidlo 1b pro finále), 19 telegrafů
přepsáno, ale sada NEZAPEČENA** — kolo našlo 2 nová porušení ČISTOTY
(`privoz-celnik` anti-tell, `urednik-vaha` trojité pokrytí) a předregistrace
zakazuje zapéct; znění v reportu
[[../technika/telegraf-skrtaci-kolo-2026-07-30|technika/telegraf-skrtaci-kolo-2026-07-30.md]],
dokončovací kolo = diff dvou vět + re-review. **BLOKÁTOR zapékacího commitu
(žádost kritika): spolu se sadou se MUSÍ zapsat oprava kanonu o kanálech
telegrafu** — „připraveno, nezapsáno" už dvakrát selhalo. Vedlejší: sim měřidlo
pro sázku v3 neexistuje (bot se znalostí slotů je pro tým horší než bot čtoucí
telegraf — ramena se liší cílením, ne informací) → brána je čistě lidská;
stray `prototyp/.claude/agent-memory/` na úklid (backlog). Consistency opravy
z D51/3 zapsány (mozek-operace §4.10, obtížnost v MVP, jednotka délky =
znaky, výtka „bajty" vyvrácena měřením).
**SMĚROVÝ TEST 15/19 A LIMIT ÚČTU (D52, 2026-07-30):** 5. průchod zastavil
zapečení dle předregistrace (4 věty s operátory výhradnosti, report §5.5)
a účet narazil na měsíční limit útraty — agentní kola dočasně selhávají.
**Fronta po zvednutí limitu (D52):** (1) krátké kolo telegrafů — oprava 4 vět
→ směrový test → zapečení (sada + invariant + kanon jedním commitem);
(2) kolo separability slotů (Denisa P0/#1) — návrh mezislotové vazby
+ kontrafaktuál + kritik, schvaluje uživatel. Hranice A = urgence (rozhodne
zakrývací zkouška). **U uživatele dál: slepé čtení WoZ testu + zvednutí
limitu.** Nový agent `denisa` (game-dev-lead) onboardována, 5 nálezů
v `.claude/game-lead/brief.md`.
**LIMIT OBNOVEN, WoZ ROZHODNUT (D53–D54, 2026-07-30):** kreativní interpretace
vyhrává (mandát AI vrstvy pro fázi 3; čeština = kritérium volby poskytovatele,
testovat baterií per kandidát). Fallback = fragmentová vrstva (D54).
**TELEGRAFY v3 ZAPEČENY (2026-07-30, `5c8e548`):** kontrolní průchod 19/19,
4 věty opraveny (u `nadrazi-vypravci` oprava navíc zrušila vnitřní rozpor
s nositelem `improv_skryte`), v témže commitu invariant do hlavičky
`obsah/situace.yaml` + oprava kanonu odkládaná od D47 (design §3, MVP 6 kanálů,
mrtvé K4d číslo nahrazeno). 316/316 testů, golden jen `verzeObsahu`,
délky ⌀ 316,6 / max 352. Čtyřkolová sága uzavřena.
**FRAGMENTOVÝ FALLBACK HOTOV A PŘIJAT PM (2026-07-30, D54(1)):** kód `94125a2`
+ opravy po review `739c4b2` + 42 fragmentů po dvou recenzích `68abef2`;
PM nezávisle: 375/375 testů, lint čistý, tón drží. Fallback nově říká, která
věc v které roli co udělala.
**SEPARABILITA DOMĚŘENA (2026-07-30, `5a312ae`) — POCTIVÝ NEGATIVNÍ VÝSLEDEK
se strukturálním nálezem:** tři vazby (RÁMUS ×2 definice, podmíněný rámus, H-1)
padly na předregistrovaných kill-kritériích (RÁMUS mj. zrušil 98 % daně za
hlučné hraní a vystřelil K1 o 24–32 b.). Hlavní zjištění: **cena monotónní ve
váženém součtu přes dvojice (karta, slot) je vždy sveditelná na ceník** → celá
rodina „sdílený rozpočet → Žár" je mrtvá; cena vázaná na vzájemnou polohu karet
zůstává neprozkoumaná. Kritik: zapracováno, souhlasí se zamítnutím. Vedlejší
nález pro záznam (nejednat, D39 drží): cena 3 bez rozpočtu by dostala K1 všech
počtů do gate — K3 neměřeno. **OTEVŘENÁ OTÁZKA PRO UŽIVATELE: přeformulovat
Denisa P0/#1 z „chybí mezislotová vazba" na „chybí divergence cílů"** —
úspěšná vazba by quarterbacking spíš zhoršila (Hanabi/The Crew vs. Pandemic);
volba: otevřít osu tajných cílů (proti D44), nebo pilíř „hádka" nechat jako
simulací nepodložený na sezení 2–3 hráčů. Drobné doplňky (§4.9/MVP znění Žáru
u commitu, komentář `state.js:582`) do backlogu.
**Fronta:** fáze 3 (prompt s kreativním mandátem + volba poskytovatele přes
test češtiny) → sezení 2–3 hráčů. **Po lidské bráně:** kombinatorický skladač
karet + šíře situací (D54/2). Backlog z telegrafového kola: zakrývací zkouška
(od D49), `urednik-razitko` (celnice na domácí trase, sahá na `nazev`),
úklid stray `prototyp/.claude/agent-memory/`.

### Co jde do lidské brány jako známé, vyčíslené odchylky

| # | Odchylka | Čísla | Rozhodnuto |
|---|---|---|---|
| 1 | K1 kompetentní hra 3p/4p nad stropem 70 % | 77,5 / 79,7 % | D39 |
| 2 | K6a spread napříč počty hráčů | 22,4 b. (gate ≤6) | D39 |
| 3 | K9 — cíl `muj-den` je saturovaný | 99,4 / 98,3 / 96,0 / 91,4 % (gate 5–95) | D44 |
| 4 | Dva z osmi cílů nejsou osobní (norm. divergence < 0,7) | `plny-zasah` 0,00–0,03 · `kupecke-slovo` 0,20–0,49 | D44 |

Záložní páky, které se aktivují **jen** na nález lidské brány: `hraci[n].ruka`
(pro #1/#2, D39) · kandidát V-3 pro #3 (proměřený, D43).

*Průběh kalibrace-4 (historie):*
[[../technika/kalibrace-4-brana-navrh-2026-07-27|Balík]] byl kanonické zadání.
Re-měřicí session se nejdřív **zastavila na podmínce 0(c) (D27)** — K7
learnabilita 9,1 / 10,3 b. proti gate ≥12 b.; podmínky 0(a), 0(b), 0(d) hotové
(report.js formalizován, dvojí měřicí cut vysvětlen, práh K5-D navržen), K6a
variance doměřena (2sd = 3,22 < 6). Eskalace V1–V4 rozhodnuta uživatelem jako
**V1 (D28)**, čímž se odblokovaly kroky 1–5 mandátu — ty jsou nyní **hotové**
(zapečení znění, P2, P3, P1, re-měření). Verdikt eskalace:
[[../technika/kalibrace-4-2026-07-27|technika/kalibrace-4-2026-07-27.md]].

## Backlog

| Úkol | Vlastník (agent) | Stav |
|---|---|---|
| Technická architektura + plán prototypu (Vite + vanilla JS, psací stroj) | technical-developer | **hotovo** — [[../technika/architektura|technika/architektura.md]] (7 ADR) |
| Review architektury proti principům + adversariální kritika | project-manager (v zastoupení design-critica) | **hotovo 2026-07-22** — principy drží; 3 nálezy (bodování cílů v simulaci, stínová cache na hraně scope, odhad 2–4 týdny těsný) |
| Ověřit konzistenci designu po přidání mechaniky Žár | game-designer / consistency-check | **hotovo** — D1+D2 schváleny uživatelem 2026-07-22, re-check konzistence beze nálezu |
| Zapracovat schválené změny (Žár per uzel, prahy vs. afinity, prokleté od 2. zranění, sémantika Zátahu, čísla jen v prototypu) | game-designer | **hotovo 2026-07-22** — zapracováno a commitnuto (viz [[rozhodnuti]] D1, D2) |
| Rozšířit schéma `obsah/cile.yaml` o mechanicky ověřitelné cíle (pro simulátor) | content-generator + technical-developer | **hotovo 2026-07-22** — D3 schváleno, schéma rozšířeno (`overeni_typ`, `podminka`), 2 vzorové mechanické cíle |
| Naplnit sady obsahu (32 zákl. / 8 prokl. / 4 zoufalé karty, 14+1 uzlů, 8 cílů) | content-generator | **hotovo 2026-07-22** — zapsáno po review kolečku (kritik + humor-tester + game-designer) a schválení D4–D6 |
| Prompt protokolu v0.2 + regresní baterie `prompty/protokol-testy.yaml` (4 case) | protocol-humor-tester | **hotovo 2026-07-22** — vč. nového pole „bedny ztracené tímto hodem" ve formátu vstupu |
| Simulace runů pro balanc (1. běh, 216k runů) | playtest-facilitator | **hotovo 2026-07-22** — brána **NEPROŠLA** (krit. 1: kompetentní hra 90–98 % DORUČENO), náprava jasná; report [[../technika/simulacni-brana-2026-07-22|technika/simulacni-brana-2026-07-22.md]] |
| Iterace čísel dle simulace (D7–D9: 5–7 = zranění, ruka 5, konfrontace → Žár 3, Zátah obě cesty, Útěk rider volba vlastníka, obetni-beranek ≤2, tvrdosti léčky/konfrontace) | project-manager | **hotovo 2026-07-22** — zapracováno, viz [[rozhodnuti]] |
| Přesimulovat (2. běh brány) | playtest-facilitator | **hotovo 2026-07-22** — NEPROŠLA (overcorrection D7: 18–25 % DORUČENO); kalibrační sweep → páka F |
| Zapracovat páku F (prahy 7+/5–6/≤4) + frajer ≤1 zranění (D10) | project-manager | **hotovo 2026-07-22** |
| Přesimulovat (3. běh brány) | playtest-facilitator | **hotovo 2026-07-22** — NEPROŠLA těsně: jádro OK (55/65 % v pásmu, snowball tvar OK), padaly jen cíle cisty-stit/frajer a marginálně tempo Žáru |
| Zapracovat páky G/H/Ž (D11: cisty-stit + doruceno, frajer → kolaps==false, práh Zátahu 4→5) | project-manager | **hotovo 2026-07-22** |
| Přesimulovat (4. běh brány) | playtest-facilitator | **hotovo 2026-07-22 — PROŠLA s výhradami**; brána vyhlášena za splněnou, viz [[rozhodnuti]] a report |
| Založit kódový repozitář | project-manager | **hotovo 2026-07-22** — `C:\Projekty\dukazni-material-prototyp`, submodule `content/`, CLAUDE.md s principy; remote `git@github.com:Johnny09112/dukazni-material-prototyp.git`, pushnuto |
| Prototyp fáze 1: engine + simulátor + testy | kódový repo | **hotovo 2026-07-22** — 95 testů, golden runy, invarianty; první měření odhalilo díru spec. zoufalých → D12 |
| D12: přístup k zoufalým kartám (loot-injury, návrh uživatele) + D13: postavy a fallback šablony | project-manager + agenti | **hotovo 2026-07-22** — viz [[rozhodnuti]]; engine překlápí default, šablony dostávají schválený patch apozice |
| Prototyp fáze 2: hot-seat UI (psací stroj, „Jsem X" cíle, fallbacky jako primární obsah) | kódový repo | **hotovo 2026-07-22** — 127 testů, celý run klikatelný, ověřeno stavitelem i PM v prohlížeči (`npm run dev`); sépiový úřední vzhled, rozpis hodů, export logu JSONL |
| **Fáze 2.1: vysvětlující vrstva pravidel v UI** — nápověda/průvodce, „proč se to stalo" anotace (vynucená karta, zákaz tagu, rider volba, prahy Žáru, postih za zranění) | kódový repo | **nález 1. lidského sezení 2026-07-22** ([[../playtesty/2026-07-22|playtest]]): systém funguje, ale je pro hráče neviditelný — hráč-autor mu nerozuměl |
| Prototyp fáze 3: LLM adaptér (provider NEROZHODNUT — otevřená otázka) | kódový repo | na řadě spolu s 2.1 — cache→provider→timeout→fallback dle ADR-004/007; fallback větev už stojí |
| První lidské sezení (lidská brána): solo/remote run přes `npm run dev`, vyhodnotit metriky + hypotézy (kolaps jako default, tři měřidla) | uživatel + playtest-facilitator | **PŘERUŠENO 2026-07-29 (D45)** — tři nálezy fikce (text situace chybí v UI, popisy v hoveru, telegraf polopatě), metriky nevyplněny, do Go/No-Go se nepočítá; pokračuje po fázi 2.2 |
| **Fáze 2.2: text situace + viditelné popisy do UI** — nedodaný kanon §4.3 z nálezů D45 | kódový repo (Opus) | **HOTOVO 2026-07-29 (D46)** — všechny 3 body zadání [[../technika/faze-2.2-navrh-2026-07-29|technika/faze-2.2-navrh-2026-07-29.md]]; modul `situace-text.js` + 60 nových testů (295 celkem), lint čistý, smoke test celého runu v prohlížeči. Engine netknutý |
| **Telegraf: atmosférická předzvěst místo mechanického výčtu** — nový QA invariant telegrafu + limity délky, se zachováním fidelity signálu pro bota (K7) | game-designer + design-critic, schvaluje uživatel | **SMĚR SCHVÁLEN, INVARIANT NA REVIZI (D47)** — kolo designer→kritik proběhlo, [[../technika/telegraf-invariant-navrh-2026-07-29|návrh + prověrka]]; 3 P-otázky rozhodnuty. Zbývá: revize znění dle 6 blokujících kritika (3 čisté ukázky, strop 350 zn., disjunktní slovník obrazů, 7. kanál `rusi` + varianta verdiktu pro konfrontace, scope creep ven) + přepis zadání zakrývací zkoušky. Teprve pak obsahové kolo 15+4 |
| **Mechanický řádek „co z toho plyne" nativně skrýt + přepínač v nastavení hry** (rozklik na vyžádání; výhledově prvek obtížnosti, váže na D25d) | kódový repo (Opus) | **HOTOVO 2026-07-29 (D50)** — řádek nativně skrytý; přepínač *Ulehčení: rozbor telegrafu na rozklik* v nové kolonce **Obtížnost** na setupu (rám pro D25d, jmenuje se jako ulehčení, ne jako zobrazení); onboarding na prvním uzlu **prvního runu relace**; rozklik se resetuje s každým commitem. Nový čistý modul `prototyp/src/ui/telegraf-rozbor.js` (+13 testů, 308 celkem), lint čistý, pět cest ověřeno v prohlížeči |
| **Sloty s pohybem vozu: `nastroj` vs. `improvizace`** — „strhnout vůz do postranní" = `nastroj` (`zatah`, `mesto-houkacky`), ale „strhnout do pole" = `improvizace` (`malone-konfrontace`); dále `mesto-ulicka` „Najít skulinu", `brody-konfrontace` „Najít, kudy ujet", `malone-lecka` „Objet ho stranou" — všechny `nastroj`, ač slovník invariantu řadí „cestu vymyšlenou až na místě" k improvizaci | game-designer + content-generator | **otevřeno (nález obsahového kola D48, potvrzen kritikem)** — táž fikce, opačný stat, žádné pravidlo mezi tím: hráč se místo mapy učí seznam výjimek. Sloty jsou z kola D48 vyňaté (V-8), ale **tohle by kontrafaktuál přes `CONTENT_DIR` změřit uměl** (sim staty čte, prózu ne). Neřešit rekvizitami v telegrafu — tři ze čtyř dodaných jsou vlastnosti scény, ne překážky |
| **Protokol utrácí první větu na rekapitulaci telegrafu** — ukázka dobrého protokolu v `prompty/protokol.md` začíná první větou telegrafu `farmar-brod` v minulém čase; s bohatšími telegrafy to zesílí a z 3–5 vět zbudou na vtip 2–4 | protocol-humor-tester + content-generator | **otevřeno (nález humor-testéra D48)** — vada styku telegrafu a promptu, ne jednoho z nich. Buď pravidlo do promptu („scénu neopakuj, začni tím, co udělali podezřelí"), nebo se přizná, že protokol má fakticky 2–4 věty |
| **Obsahové kolo: přepis 19 telegrafů** (15 situací + 4 léčky/konfrontace) dle v2 invariantu; zapéká se spolu se zněním invariantu do hlavičky `situace.yaml` + oprava `CLAUDE.md` („1–2 věty") | content-generator → protocol-humor-tester → design-critic | **HOTOVO A ZAPEČENO 2026-07-29 (D49)** — 19 telegrafů + invariant v `obsah/`, `CLAUDE.md` opraven. Signál ověřen 19/19 proti enginu, délky 302–379, 295/295 testů, golden rebase jen na `verzeObsahu` |
| **Zakrývací zkouška telegrafů** — 6 čtenářů, 8 vybraných telegrafů, každý čte novou i starou verzi jiného telegrafu (srovnávací rameno); protokol a rozhodovací pravidla [[../technika/telegraf-invariant-navrh-2026-07-29\|§13.4–13.5 návrhu]] | uživatel + playtest-facilitator | **OTEVŘENO (D49)** — zapečení proběhlo bez ní vědomě, invariant to v hlavičce přiznává. Měří to, co simulace neumí (sim prózu nečte). Spouštěč přepisu je per telegraf, ne na průměru sady |
| **Oprava kanonu: telegraf má 6 kanálů, ne 3** — `design-dokument.md:107–108` a `prototyp-mvp.md:91–93` neznají `zbran_skryte` (D22) ani `improv_skryte` (D25f), ač je engine derivuje a UI zobrazuje. Plus `prototyp-mvp.md:33` cituje K4d 7,9 z ramene `optimal`, ač gate stojí na rameni `kompetentní` (dnes 18,6 / 22,1 / 24,6 / 22,8) | game-designer / PM | **otevřeno (nález D47)** — nezávislé na osudu invariantu, ať jde vlastním commitem |
| Jemné doladění obtížnosti po loot-injury (exploit-bot ~74–76 % vs. pásmo 45–70; ladit tvrdosti/Žár, ne resoluční práh) | game-designer + playtest-facilitator | **nahrazeno kalibrací-1 v3** — viz řádek níže |
| **Kalibrace-1 v3: zapéct 45-slot kotva-patch + kořenový lék K5/K7/K2** (gamble vynucený ne zvolený, snowball plochý) | game-designer + content-generator | **hotovo 2026-07-24 (D22)** — patch zapečen (45 slotů +1, pásmo 2–4 drží); lék zapracován: 4 skryté obrana-kotvy 3→2 (dial), 2 telegraf-přepisy npc-pastí, 5 věcí +1 sekundární stat (obrana/nastroj, improvizace netknuta), info-heavy pooly pozdních událostí se stropem ≤7 (D20). Enginová část léku = řádek níže; 3 eskalace na uživatele (viz otevřené otázky) |
| **Pro engine — kalibrace-1 uzavření (signál = tento commit):** (1) reset `rules.kotvaBumpFrakce` 0.8→0; (2) rozšíření šumu pro K4c (model D15 kotva ± šum); (3) derivace telegraf_signal: pozitivně rozlišit „zbraň funguje ve skrytém slotu (stat=utok)" od „zbraň k ničemu" — druhá polovina léku K7 + párová podmínka telegraf-přepisů urednik-vaha/razitko (jinak próza/signál drift); (4) ověřit, že hide_* postih z uzlu N reálně degraduje commit uzlu N+1 (bez toho info-postihy nesnowbalují); (5) zvážit shlukování léček/zátahů/konfrontací do uzlů 3–4+ přes tempo Žáru (K2 cíl ≥1,3); (6) čisté re-měření 1000×2 (seedy 1–1000) dle akceptační brány, POVINNĚ: K1∈[45,70] ∧ K5 odděleně viditelná/skrytá ∧ K7≤20 % současně, per-situace take-rate před/po, K6a v rozpadu dle typu postihu (info-postihy vs. 1p/2p), pozor nadrazi-noc (2 skryté sloty, nejtvrdší offender; skrytých slotů je 20, ne 19) + doladění K8 | kódový repo (technical-developer) | **hotovo 2026-07-24 (kalibrace-2)** — body 1–4 zapracovány, 5 vědomě odloženo; re-měření 1000×2. **K4c OPRAVENO** (+2.4 ≤3). K5/K7 dál breach, K1/K5 coupling z D22(e) POTVRZEN (80 % neřešitelných slotů = viditelné); K1 3p/4p těsně >70, K6a regrese 11.8. Report [[../technika/kalibrace-2-2026-07-24|technika/kalibrace-2-2026-07-24.md]]; míč zpět u obsahu (řádek níže) |
| **Kalibrace-2 lék: snížit viditelné kotvy běžných uzlů** | game-designer + content-generator | **uzavřeno 2026-07-26 (D24) — lék VYVRÁCEN měřením**, nic se nezapeklo; viz řádek kalibrace-3 |
| **Kalibrace-3: selektivní revert kotev 4→3** — návrh 12 slotů (designer) → adversariální prověrka (kritik) → per-slot diagnostika + kontrafaktuální gate-měření 1000×2 přes CONTENT_DIR (facilitátor) | celé kolečko + playtest-facilitator | **hotovo 2026-07-26 (D24) — NEGATIVNÍ VÝSLEDEK**: žádná podmnožina mandátu gate nesplní (K1 špatný směr, K5≥13.6 %, K7≥40.5 % i při maximu); drivery mimo mandát (Malone-nulovaná hodnota, finále ~50 %). Report [[../technika/kalibrace-3-2026-07-26|technika/kalibrace-3-2026-07-26.md]]; mandát kalibrace-4 (P0–P4) eskalován na uživatele |
| Pro technical-developer: do `sim/report.js` doplnit rozpady per-situace / per-slot / common-vs-finále / K5 viditelná-skrytá (v kalibraci-3 počítáno ad-hoc skriptem) | technical-developer | **hotovo 2026-07-27 (D27, podmínka 0a)** — ADR-010, událost `assign_context`, report přestavěn na záznamy; +19 testů (vč. tripwire shody odhadu s botem), 137 zelených. Sjednotilo dvojí měřicí cut |
| **Kalibrace-4 dle mandátu D25:** (1) balík nového znění brány Fáze 0 → schválení uživatelem; (2) obsah: řešitelnost situací bez hodnota-slotu (P2); (3) engine: `improv_skryte` (P3), dorovnání obtížnosti 1–4p přes finále/Žár (P1), ruka 1p až po P1 (P4); (4) re-měření | celé kolečko + technical-developer | **(1) HOTOVO 2026-07-27 — balík předložen:** [[../technika/kalibrace-4-brana-navrh-2026-07-27|technika/kalibrace-4-brana-navrh]] (designer → facilitátor baseline doměření 1000×2 → verdikt kritika „schválit rámec s úpravami"); **SCHVÁLENO uživatelem 2026-07-27 (D26, body 1–8, K5 = varianta D)**. **Kroky 2–4 ZASTAVENY na podmínce 0(c) (D27, 2026-07-27):** K7 learnabilita 9,1 / 10,3 b. proti gate ≥12 b. → dle mandátu eskalace, varianty V1–V4 v [[../technika/kalibrace-4-2026-07-27|technika/kalibrace-4-2026-07-27.md]] §6. Podmínky 0(a)/0(b)/0(d) + K6a variance hotové; `prototyp-mvp.md` i `obsah/` netknuté |
| ~~Další iterace kalibrace (z D29)~~ | — | **uzavřeno D33** — (1) `deriveTelegrafSignal` HOTOVO, (2) varianta C HOTOVO a zapečena, (3) K2 pooly změřeny a **nezapečeny** (drift 1,282, nekupuje gate a zhoršuje K5-D; enginová podpora `faze` zapečena inertní, návrh v `scratchpad/k2-faze-navrh.md`), (4) severita finále — bezpředmětné po D33 (K5f se gatuje pooled) |
| **PROVĚRKA BOTA proti všem veřejným pravidlům** — dvakrát se ukázalo, že měřidlo bylo horší než hra (D30: bot ignoroval verdikt zbraně na obou osách; oprava přinesla víc než dvě kola ladění obsahu). Systematicky projít, co telegraf a `stitky.yaml` hlásí jako VEŘEJNÉ, a ověřit, že to kompetentní bot používá. Levné, a všechna čísla nesená do lidské brány na tom stojí. | technical-developer + PM | **HOTOVO 2026-07-27 (D34) — 8 nálezů, 4 velké**; report [[../technika/proverka-bota-2026-07-27|technika/proverka-bota-2026-07-27.md]]. Opravy NEPROVEDENY (mění všechna čísla brány → rozhodnutí uživatele, viz otevřené otázky) |
| **Opravy z prověrky bota (N1–N8) + jedno re-měření** | technical-developer (+ engine) | **HOTOVO 2026-07-27 (D35)** — uživatel zvolil „vše + jedno re-měření"; 149 testů zelených, 6 bloků × 8000 runů. **K5 poprvé splněno (9,72 %), K2 drift 1,39** — a **K1 3p/4p + K6a nově breachnou** (co-op škálování se poprvé opravdu hraje) |
| **Přeladit `prahOffsetDlePoctu` (K1 3p/4p + K6a)** — jediná páka bez dotyku obsahu; sweep je levný | game-designer + playtest-facilitator | **HOTOVO 2026-07-27 (D38) — páka VYČERPÁNA, nic nezapečeno.** Průchozí kandidát existuje (`{1:0,2:5,3:6,4:6}`: K1 6/6, K6a 6,03), ale platí se jím K2 drift (1,28, 2/6) a leží v režimu, který předregistrace předem zakázala (clamp prahů). Report [[../technika/kalibrace-5-sweep-prahoffset-2026-07-27|technika/kalibrace-5-sweep-prahoffset]]; **uzavřeno D39 = varianta (a)**, breach jde do lidské brány jako známá odchylka |
| Mrtvá volba: cíl `mozek-operace` má 0 % splnění ve všech variantách včetně baseline (vedlejší nález D38) | content-generator + game-designer + playtest-facilitator | **HOTOVO 2026-07-28 (D42)** — cíl byl strukturálně nesplnitelný (nejen slabý), škrtnut do patičky `cile.yaml` s poučením; nahrazen `schovana-bouchacka` (`GANGSTER_skryta >= 1 a doruceno`, 2 b.) vybraným kontrafaktuálem ~290k runů proti naslepo předregistrovaným pásmům. Sada je nově **8/8 mechanická**. Report [[../technika/mozek-operace-kontrafaktual-2026-07-28\|technika/mozek-operace-kontrafaktual-2026-07-28.md]] |
| **`muj-den` breachuje K9** — nepodmíněně 99,4 / 98,3 / 96,0 / 91,4 % pro 1p–4p (gate 5–95 %). Odkryto hygienou reportu v D42 | game-designer + playtest-facilitator | **ZMĚŘENO 2026-07-28 (D43), ZAPEČENÍ ČEKÁ NA UŽIVATELE.** Vada je v metrice (sloty škálují 3,5× mezi 1p a 4p), ne v prahu. Kandidát V-3 `podil_slotu_splnil_pct >= 50 a sloty_vlastnika_celkem >= 5` prošel jako jediný ze 4 řezů, všemi předregistrovanými kritérii. **Blokují dvě podmínky mimo dosah simulace:** K6b tempo (živý v 80–89 % uzlů) a UI ukazatel „prošlo X / propadlo Y". Fallbacky A (škrt + `o-vlasek`) / B (nést do brány). Report [[../technika/muj-den-kontrafaktual-2026-07-28\|technika/muj-den-kontrafaktual-2026-07-28.md]] |
| **Předpoklad zapečení V-3: UI ukazatel „prošlo X / propadlo Y" u tajného cíle** — bez něj je podíl neřiditelný (metrika 6, čitelnost) | technical-developer | **BEZPŘEDMĚTNÉ po D44** — V-3 se nezapéká. Aktivuje se jen tehdy, vyžádá-li si lidská brána zapečení V-3 |
| **Dva z osmi cílů nejsou osobní** — po zavedení normalizované divergence (D43) mají `plny-zasah` 0,00/0,01/0,03 a `kupecke-slovo` 0,20/0,35/0,49 proti prahu ≥ 0,7, `bez-jizvy` je na hraně (0,71/0,66/0,65) | game-designer | **NESE SE DO LIDSKÉ BRÁNY (D44)** jako odchylka #4 — neřeší se čtvrtým kalibračním kolem. Kritérium, kterým se měřili kandidáti, nikdo neaplikoval na zapečenou sadu; jestli to vadí, řekne reveal u stolu, ne simulace |
| `kredity_utracene_za` engine počítá **týmově** (`events.js:175-178` nefiltruje `hrac_id`), ač ji `technika/architektura.md` §2.2 ř. 141 vede jako per-hráč metriku | technical-developer | otevřeno — v D42 **neopraveno záměrně** (je to nález, ne úklid). Dokud platí, nelze na kreditech postavit osobní cíl; oprava by otevřela ekonomickou osu hádky, po které nikdo zatím nevolal |
| **Fáze 2.1: vysvětlující vrstva pravidel v UI** — bez ní lidská brána selže na čitelnosti (metrika 6), ne na designu | kódový repo | **HOTOVO A PŘIJATO 2026-07-28 (D41)** — návrh D36 → plán (12 tasků TDD) → stavba na větvi `faze-2.1` → PM review (231 testů + lint nezávisle, smoke test celé smyčky v prohlížeči, §11 splněno) → merge do `main`. Spec: [[../technika/faze-2.1-navrh-2026-07-27|technika/faze-2.1-navrh-2026-07-27.md]] |
| **v3 fallback šablony protokolu (~20)** — součást 2.1, běží paralelně s UI | content-generator + protocol-humor-tester + design-critic | **HOTOVO A ZAPEČENO 2026-07-28 (D40)** — 28 šablon v `prompty/fallback-sablony.yaml`, v2 sada v `obsah/archiv-v2/`; `kolaps` přepsán na v3 sémantiku + nové pásmo `navrat`, `hlas_z_auta` zamítnut (engine událost nemá). Situace dostaly pole `nazev` (15 + 4 u pronásledovatelů) — anotace mapy nově jmenuje místo. 231 testů zelených, 4 golden snapshoty rebasovány (otisk obsahu + jméno místa) |
| ~~Zbytek fáze 2.1 po zapečení sady: protocol-fill.js na v3~~ | — | **ZASTARALÉ — hotovo v tasku 6 stavby** (modul i test čtou živou v3 sadu); zbyl jen řádek níže |
| Drobný úklid: `opravUvozovkySablon()` v `protocol-fill.js` — workaround v2 uvozovek, nad v3 sadou (validní YAML) je no-op; smazat i s poznámkou v testu | kódový repo (Opus) | **hotovo 2026-07-29** — přibaleno k fázi 2.2 (D46); no-op nad živou sadou nejdřív ověřen, pak smazáno z modulu, `app.js` i testu (s poznámkou proč) |
| **Fáze 3: LLM adaptér + test kvality českého humoru** — největší produktové riziko dle CLAUDE.md, simulace ho z principu neotestuje | kódový repo + protocol-humor-tester | **na řadě** — BLOKUJE volba poskytovatele (viz otevřené otázky) |
| Obsahové vady mimo mandát P2 (z D29): viditelný utok-4 slot v NPC je ve 40 % instancí nesplnitelný (`rival-prepad`, `urednik-vaha`, `mesto-ulicka`); kombi `[nastroj, improvizace]` nesplnitelný nad práh 3 (`farmar-stodola`, `most-prohnila-prkna`) | content-generator | otevřeno — nepřibalovat k jiné iteraci, rozmazalo by měření |
| ~~P4: ruka 1p 8→9~~ | — | **ZRUŠENO (D29)** — po P1 je 1p nejvyšší ze všech počtů (61,6 %), zvětšení ruky by rozbilo K6a |
| Kosmetika textu situace (z PM review 2026-07-29, NEHLÁSIT znovu jako nález): (1) `{VEC}` se plní 1. pádem v uvozovkách i uvnitř vazeb („pomocí „Kněžský kolárek"") — vědomý kontrakt neskloňování, obhajitelné, ale sledovat u stolu; (2) sólo run opakuje totéž příjmení ve všech 4 mezerách `{kdo}` | kódový repo + game-designer | otevřeno — kosmetika, řešit až po lidské bráně, pokud to u stolu skřípe |
| Volitelná obtížnost při startu runu (easy/normal/hard) | game-designer | **budoucí úkol (D25d)** — neřešit teď; až po lidské bráně |
| **Monorepo (D23): sloučení kódového repa do `prototyp/`** — subtree se zachovanou historií, submodule zrušen, cesty na kořen, ADR-009, otisk verzeObsahu nezávislý na line endings | project-manager | **hotovo 2026-07-26** — 118/118 testů, sim smoke shodný s kalibrací-2, build+lint čisté; GitHub repo prototypu archivovat (viz plán); plán [[../technika/migrace-monorepo-plan-2026-07-26|technika/migrace-monorepo-plan]] |
| Setup pluginů pro kódovou část (`prototyp/`): Superpowers (inženýrská disciplína), frontend-design (až UI — nakrmit estetikou z design dokumentu), security-guidance | uživatel (claude CLI) | po monorepu (D23) se instalují do tohoto repa — dělba platí: Superpowers jen pro práci v `prototyp/`, herně-designovou disciplínu drží naši agenti |
| První měření instrumentovaného enginu: potvrdit win-rate (kompetentní ≤70 %) a hlídat obetni-beranek (94,8 % těsně pod stropem) | playtest-facilitator + technical-developer | **hotovo — run-1 (1000×2)**: K1 v pásmu (59.8–69.2 %), co-op inverze OK (4/4 ~4.8 %); report [[../technika/kalibrace-1-2026-07-24|technika/kalibrace-1-2026-07-24.md]] |
| ~~Fallback šablony protokolu (~20)~~ | — | **přesunuto nahoru** — je to blokující závislost fáze 2.1, ne odložitelná položka (zjištěno 2026-07-27 při návrhu 2.1) |
| Revize pronásledovatelů (nález kritika „léčky tlačí k Lesti") | game-designer | **uzavřeno 2026-07-22 — beze změn**: Malone→Lest je záměrná protiváha nulovaného Úplatku, Brody otevírá jiné pruhy; výjimka „konfrontace Malonea bez +2" potvrzena jako záměr (komentář v YAML) |
| Pro engine (technical-developer): (a) formalizovat razítko DORUČENO — metrika `doruceno` na něm stojí; (b) strukturovaný vstup protokolu nese pole „bedny ztracené tímto hodem"; (c) ověřit proveditelnost „hlasu z auta" v hot-seat UI; (d) nové metriky cílů `ztracene_bedny_vlastni`, `max_sila_karty` v event logu | technical-developer | poznámky z 2026-07-22 |

## Otevřené otázky (čekají na uživatele)

**Živé — blokují další fáze:**

- ~~LLM poskytovatel NEROZHODNUT~~ — **ROZHODNUTO D55 (2026-07-30): Anthropic
  Claude Haiku 4.5** (nájem, ne svatba; podklad technika/llm-ekonomika;
  test češtiny = akceptační brána uvnitř fáze 3; cena se přehodnotí po lidské
  bráně). **FÁZE 3 POSTAVENA (2026-08-02, `52de198`+`f54784d`+`1c7a371`):**
  adaptér dle ADR-004/007 (cache → Haiku 4.5 → 10s timeout → fragmentový
  fallback; neblokující UI, hra bez klíče plně hratelná; 445 testů) + **prompt
  v0.4 s PLNÝM kreativním mandátem B** — B-lite zamítnuto po adversariálním
  kole (trigger nefiltruje: platí v 75 % slotů a jeho fuzzy půlka je na Haiku
  nerozhodnutelná; bezpečnost nese pojistka o číslech, ne zúžení mandátu).
  Opraveny 2 vady cestou (YAML baterie, znaménko Žáru). **Opravné kolo v0.4.1
  HOTOVO (`57730e3`, kritik „zapéct s výhradami", vše zapracováno):** kredity
  dle rules.js (+3/+2, opraven i prototyp-mvp), příklad MAX přepočten (2/4),
  ztráta nákladu dle D40, rule 4 pojmově (zranění/zadržení/ztotožnění), strop
  900 + pořadí škrtání; PM nezávisle: 445/445. Otevřené drobnosti do backlogu:
  rule 4 vs. NPC (do rozhodnutí platí přísnější čtení), K8 kaveát „medián
  7–9 kreditů" možná z éry +2/+1 (game-designer ověří provenienci), Žár ve
  2 starších casech baterie, `prompt.js` posílá `duvod` jen u auto-failu.
  **Uživatel: `VITE_ANTHROPIC_API_KEY` do `prototyp/.env.local` a spustit
  `npm run test:cestina`** (brána měří ručně psané vstupy baterie = test
  kvality promptu; integrace vstupů z enginu = backlog po bráně). Backlog:
  engine neloguje líznutou loot kartu (`drawCard()` bez události).
  **BRÁNA ČEŠTINY 1. BĚH (2026-08-02): NEPROŠLA 0/13 — ale jádro drží.**
  Klíč vložen, 13 reálných výstupů Haiku 4.5; **0/52 slotů obráceno**
  („mechanika rozhoduje" na Haiku platí, vč. auto-failů). Tři příčiny pádu,
  dvě technické: (1) `MAX_TOKENS=400` uřízlo 8/13 výstupů uprostřed slova
  a adaptér nekontroluje `stop_reason` → fragment prošel jako validní (proti
  ADR-004); (2) čeština 13/13 tvrdých vad (cyrilice, anglicismy, nonwords) —
  hlavní podezřelý nenastavená `temperature` (default 1.0), první krok A/B
  0,5 vs 1,0, ne přepis promptu; (3) baterie potřetí doložena jako vlídnější
  než produkční vstup. Vyhodnocení:
  [[../technika/brana-cestiny-vyhodnoceni-2026-08-02|technika/brana-cestiny-vyhodnoceni-2026-08-02.md]]
  (`0e31a19`). Testérova predikce (refrén invencí) se nepotvrdila — přiznáno.
  Technické opravy hotové (`e77f16e`: max_tokens 800, stop_reason → fallback,
  temperature 0,5 default + CLI; 464 testů). Vedle toho oprava z 1. běhu:
  `npm run test:cestina` načítá `.env.local` + hermetizace 2 testů (`5309712`).
  **A/B PŘEMĚŘENO UŽIVATELEM (2026-08-02, oba běhy na jeho klíči), verdikt
  testéra (`8a2063d`,
  [[../technika/brana-cestiny-ab-2026-08-02|technika/brana-cestiny-ab-2026-08-02.md]]):
  rameno A (0,5) NEPROŠLO 0/13, ale vrstvy se čistě oddělily** — teplotní
  hypotéza POTVRZENA pro jazyk (tvrdé vady 13/13 → 2/13, cizí písmo 0,
  useknutí 0/13 po opravě max_tokens), **mechanika drží podruhé (0/52 flipů)**;
  zbylé blokátory jsou tvarem promptu (věty přes strop 13/13, formátový šum
  13/13, vymyšlená příčina 8/13, mizející věci 5/13, nová třída
  zamlčení/změkčení). Eskalace na jiný model NEdoporučena — Haiku češtinu umí.
  **Běží opravné kolo:** teplota 0,5 zapečena; baterie na vstupy
  z `buildPromptInput()` (potřetí doloženo, že ruční vstup je vlídnější než
  produkce) + oprava strojového souhrnu beden; pak prompt v0.4.2 (5 cílených
  zásahů) s review; stop podmínka 3. běhu: formátový šum a vymyšlená příčina
  ≤ ~2/13.
- **Jazyková strategie CZ→EN** — kdy zařadit překlad a test anglických protokolů.
  Obsah vzniká a testuje se česky (rizikovější jazyk pro AI humor), primární
  Steam trh je anglický.
- ~~K5 zůstává nesplněné~~ — **VYŘEŠENO D35** (9,72 %, 6/6 bloků), bez dotyku
  Maloneho identity. ~Třetina přebytku byla chyba bota, ne Maloneho.
- ~~K1 (3p/4p) a K6a~~ — **UZAVŘENO D39 (2026-07-27, PM v delegaci):** varianta
  (a) — breach jde do lidské brány jako známá, vyčíslená odchylka (K1 3p/4p
  77,5 / 79,7 %, K6a 22,4 b.; 1p/2p v pásmu). A1 nezapečen (blind předregistrace
  + cena K2). Záložní páka `hraci[n].ruka` se aktivuje jen po nálezu lidské brány.

**Budoucí, neblokující:**

- Volitelná obtížnost při startu runu (easy/normal/hard) — D25d, až po lidské bráně.

**Uzavřeno (detaily v [[rozhodnuti]]):** pivot v3 na slotovou resoluci (D14–D20) ·
mandát kalibrace-4 (D25) · balík znění brány (D26) · eskalace K7 learnability
→ varianta V1 (D28) · P-rozhodnutí K2 a K5-D → uzavření kalibrace (D32, D33) ·
škálování obtížnosti počtem hráčů — **vyřešeno P1** (per-count posun prahů Žáru,
K6a 11,8 → 4,7 b.) · eskalace z D22 (D26).

## Provozní poznámky

- **2026-07-22: tým agentů nebyl v session dosažitelný** (SendMessage „not
  reachable") — role design-critica a game-designera odehrál project-manager
  v zastoupení, s přiznáním v syntéze. Při příští session ověřit dostupnost týmu.
- **2026-07-24: tým dosažitelný** — kalibrace-1 odehrána plným kolečkem
  game-designer → design-critic → content-generator (žádné zastoupení). PM nemá
  Bash — commit/push proveden v zastoupení přes general-purpose agenta.
- **2026-07-26 (kalibrace-3): metodický standard** — kandidátní obsah se před
  zapečením měří kontrafaktuálně přes `CONTENT_DIR` na kopii `obsah/` ve
  scratchpadu; per-slot diagnostika PŘED zapečením zabránila spálené iteraci.
  Testy/commity za PM provádí playtest-facilitator (má Bash).
- **2026-07-27 (balík kalibrace-4):** background agenti se ukončovali bez
  doručených výsledků → spolehlivější jsou synchronní běhy (`run_in_background:
  false`) s výstupem do souboru ve scratchpadu. Vedlejší efekt: měření i
  finalizace běžely 2× nezávisle — závěry se shodly, dílčí čísla se lišila
  (dvojí měřicí cut, viz část C balíku); sjednotí formalizovaný `report.js`.

## „Vyřešíme později" sliby

- Podplácení poldy důkazy z runu (nápad do v2).
- Lajky a statistiky karet (v2).

## Plugin / tooling (pozn. po D23: jeden repo, jedna instalace)

- ~~Zabalení týmu agentů do pluginu ke sdílení mezi repy~~ — **bezpředmětné po
  monorepu (D23)**: agenti i skilly žijí v `.claude/` jednoho repa.
- Nainstalovat plugin **Superpowers** (oficiální marketplace) pro inženýrskou
  disciplínu (clarify→design→plan→code→verify, TDD) — **používat jen pro práci
  v `prototyp/`**. Dělba: Superpowers vlastní *inženýrskou* disciplínu, naši
  agenti *herně-designovou* — ne dvě metodiky na jeden úkol.
- **frontend-design** — použít při stavbě UI prototypu (obrazovka psacího
  stroje, pohled na stůl); nakrmit ho estetikou z design dokumentu
  (Papers Please, sépiová 16barevná paleta), ať nevznikne generický vzhled.
- **security-guidance** — reálná hodnota pro kódovou část (API klíče, vrstva
  LLM volání, obrana proti prompt injection u UGC); přidat mu
  `claude-security-guidance.md`, až se bude stavět LLM adaptér.
- **skill-creator** je fázově neutrální, on-demand (vznikl jím `consistency-check`).
