# Kalibrace-4 — schvalovací balík nového znění simulační brány Fáze 0

> **STAV: SCHVÁLENO UŽIVATELEM 2026-07-27 (D26)** — body 1–8 v plném rozsahu,
> u bodu 1 (K5) zvolena **varianta D** („mříž mrtvých rozhodnutí", s opravou
> operacionalizace dle kritika), bod 8 ratifikován celý (obrana-skryté sloty
> i pool brody.lecka). Zapečení do `prototyp-mvp.md` provede re-měřicí session
> dle části E (podmínky platnosti 0a–0d z verdiktu kritika platí).

*Sestavil: PM (orchestrace: game-designer → playtest-facilitator → design-critic,
plné kolečko). Datum: 2026-07-27. Zdroj čísel: baseline doměření facilitátora na
aktuálním obsahu (1000 runů × 2 pronásledovatelé, seedy 1–1000, bot kompetentni,
dvě nezávislá měření) — repo netknuto, žádná změna obsahu. Navazuje na
[[kalibrace-3-2026-07-26]] a rozhodnutí [[../projekt/rozhodnuti|D22–D25]].*

---

## SCHVALOVACÍ BODY (odpověz např. „schvaluju 1–8" nebo vyjmenuj výjimky)

1. **K5 — volba varianty (bod 1 níže).** Doslovné znění D25a („K5 bez mechanicky
   nulovaných slotů") je **měřením prokázaný no-op** a gate <5 % je nedosažitelný
   žádnou redefinicí čitatele (minimum 10,8 %). Varianty: **A** (práh ~15 %
   strukturálně) / **B** (držet <5 %, dle týmu neprůchodné) / **C** (free-pass +
   ~10–12 %) / **D** (reframe: `max≤1` i po gamblu = skutečné mrtvé rozhodnutí).
   **Doporučení týmu: D — s podmínkou kritika**, že se měří proti *realistické*
   gamble-politice (nejlepší volba ruky, ale náhodný/očekávaný líz), NE proti
   best-case lízu; práh dodá re-měření. Fallback A jen s logikou „stav bez volby
   max ~1× za run" (≈14–15 %), ne s odůvodněním „1/6 je emergentní".
2. **Scope K5/K7 jen na běžné uzly + nová metrika finále K5f (bod 2):** % přežití
   konfrontace **60–80 %** (per počet hráčů × pronásledovatel; dial pro P1)
   + pozitivní gate **≥90 % proher padne ve finále**. S PM korekcí: baseline
   3p Brody = 80,4 % horní hranu **těsně breachuje** (návrh to původně zaokrouhlil
   pryč) a dolní hranu 60 % čti jako „~52 % z K1-floor + rezerva", ne jako přesnou
   derivaci — viz PM syntéza.
3. **K7 reframe (bod 3):** místo agregátního stropu ≤20 % čtyři podmínky —
   `take_vynucený` (est≤1) ≥80 % ∧ **podíl uzlů s vynuceným gamblem ≤15 %** ∧
   **commit-learnabilita ≥12 b.** ∧ EV<0 při est≥3; `take_zvolený` (est=2)
   = diagnostika 30–50 %. **Podmínka kritika (PM přejímá): learnabilita se doměří
   jako PRVNÍ krok kalibrace-4 a K7 se do té doby neprohlašuje za splněnou** —
   bez ní by reframe byl nekryté rozvolnění.
4. **Potvrzení zamítnutí „ceny gamblu"** (zdrojová cena za gamble, cesta zpět
   k ≤20 %): tým i kritik shodně doporučují NEpřidávat (nová mechanika mimo scope
   D25 + spor s vkusem D17/§4.4). Opačné rozhodnutí = vědomá změna vize.
5. **K2 (bod 4):** primární gate = **drift míry PRŮŠVIHŮ uzel 3–4 / 1–2 ≥ 1,3**
   ∧ floor pozdní PRŮŠVIH-rate ≥20 %; poměr počtu postihů → diagnostika.
   **Baseline 1,16 gate NEPLNÍ** — gate se musí v kalibraci-4 vyrobit obsahem
   (D22d směr); nedosažitelnost by se vrátila jako P-rozhodnutí, ne tichá sleva.
6. **K1/K6a (bod 5):** K1 explicitně per-count ∈ [45, 70] % (baseline: 3p/4p
   70,7/70,9 breachují nahoru) ∧ K6a zpřísněno **≤6 b.** (baseline 11,8 NEPLNÍ;
   zavře až P1 dorovnání přes finále/Žár). Jediný bod balíku, který laťku zvedá.
7. **Dělba „kdo vlastní K1" (bod 6):** re-ratifikace D22e — K1 je sdílená metrika
   podle páky (engine: šum/ruce/Žár-parametry; obsah: kotvy/keying/pronásledovatelé/
   postihy/finále). **S tvrdým change-controlem (doplněk kritika, PM přejímá):**
   podmínkou zapečení jakékoli páky hýbající K1 je kontrafaktuální whole-gate
   report (K1∧K5∧K7∧K5f přes `CONTENT_DIR`) doložený v kalibračním reportu
   v `technika/` — kontroluje PM.
8. **Dvě zbývající eskalace z D22f (část D níže):** (a) ratifikace posunu
   obrana-skrytých slotů na „levný naslepo-slot + přeliv pokrytím"; (b) potvrzení
   pool-odchylky brody.lecka (`prilis-na-rane` místo `prach-do-oci` kvůli stropu ≤7).

**Vzít na vědomí (bez schvalovací volby):** body 5–6 znamenají, že brána po
schválení NEBUDE splněná — K2 drift, K1 3p/4p a K6a jsou vstupní zadání
kalibrace-4, ne hotové gaty. To je záměr (poctivá brána), ne vada balíku.

---

## ČÁST A — Návrh game-designera (finalizovaný po doměření baseline)

*Text designera v plném znění; PM korekce k dílčím tvrzením jsou v části C.*

### Bod 1 — K5: neřešitelnost bez mechanicky nulovaných slotů

#### Stará formulace (prototyp-mvp.md, K5)
> **K5** | frekvence vynuceného pásma (oracle na committnutých kartách) |
> **max ≤1/4 (beznadějné) < 5 %** | Vrstvy „max<4/4: 30–50 %" a „max≤2/4: 10–20 %"
> = diagnostika k pozorování, ne gate.

#### ⚠ MĚŘENÍ VYVRÁTILO PŮVODNÍ NÁVRH — čti jako rozhodovací bod, ne hotový lék
Facilitátor doměřil: **doslovné „vyřaď nulované sloty z počtu zásahů" je
matematický NO-OP.** `max_dosaž_soutěž` vychází do desetiny **identicky**
s aktuální metrikou (4p 17,3 % == 17,3 %, všechny počty hráčů). Proč: nulovaný
slot je garantovaná 0, kterou MAX už teď do čitatele nezapočítává, takže jeho
odečtení maximum nesníží. Původní věta návrhu „K5 klesne o významnou část
driveru" byla nepravdivá — designer ji bere zpět.

Nulace bije **vrstvu LOOT** (`max<4/4`: Malone 93,0 %→86,8 % bez nulovaných), NE
vrstvu beznadějnou (`max≤1`). Navíc jen ~14 % situací vůbec má nulovaný slot a jen
~24 % beznadějných ho obsahuje → **76 % beznadějnosti s Malonem nesouvisí.** Scope
na common nepomůže (common 18,8 % ≈ celek 18,4 %; kalibrace-3 „50/50" byl podíl
POČTU propadlých slotů, ne míra `max≤1`). **Skutečný driver K5 = broad struktura
kotva 2–4 + šum ±2** (blind-commit + clamp dává ~40 % miss i pro sedící kartu).

**DŮSLEDEK: P0a tak, jak je doslovně v D25 napsané, měřením padá.** Žádná
redefinice čitatele (vyřazení / free-pass / scope) nedostane K5 pod 5 %: nejnižší
dosažitelná kombinace (free-pass + common, 4p) je **10,8 %** — pořád 2× nad gate.
Odchylka od doslovného znění D25a → rozhoduje uživatel, žádné tiché překlopení.

#### Co z definice zůstává použitelné (strojová čistota, ne lék)
Definice „mechanicky nulovaný slot" je strojově čistá a stojí za zachování jako
**sémantická operacionalizace P2** (viník ≠ tým, je-li slot by-design nemožný):
- `rusi_stat(P)` = stat, který aktivní pronásledovatel run-wide nuluje (schéma
  `rusi: <stat>`, obecné; dnes `malone.rusi = hodnota`, D20a; Brody neruší žádný
  stat → `rusi_stat = ∅`). Design §4.9 „federál bere úplatky = hodnotu z hry".
- Slot je **nulovaný** ⟺ jednostatový na `rusi_stat(P)`, nebo kombi se všemi staty
  ⊆ `{rusi_stat(P)}`. Hrana prah==0 (auto-hit i přes nulaci) v aktuálním obsahu
  NENASTÁVÁ (0 z 2329 nulled slotů u Malona) → free-pass a doslovné čtení se
  u LOOT liší, u `max≤1` ne.

Ale: **jako gate to je no-op.** Použít jen ve **free-pass** čtení (nulovaný slot =
auto-splněný, tým neviníme) — a i tak musí práh nahoru.

#### Rozhodovací VARIANTY (P0, odchylka od doslovného D25a)
Baseline 4p: aktuální/doslovné = **17,3 %**, free-pass = **13,5 %**, free-pass+common
= **10,8 %**. Gate `<5 %` je nedosažitelný žádnou redefinicí čitatele.

- **A — Zvednout práh gate na strukturálně odůvodněnou hodnotu (~15 %).**
  Odůvodnění nezávislé na baseline: `max≤1` v ~1/6 situací je **emergentní
  vlastnost slotového designu s blind-commitem + šum ±2 + clamp**, NE vada
  obsahu — a přesně pro tyto uzly existuje gamble-záchrana (bere se při est≤1
  v 97,5 %). Riziko: 15 % je blízko baseline 17,3 % → aby to nebyl goalpost-hřích,
  práh musí být odvozen z vlastnosti systému, ne z „aby prošlo". *(Viz nález 1b
  kritika v části B — samostatně to neobstojí.)*
- **B — Držet `<5 %` jako aspiraci, srazit broad strukturu obsahem/mechanikou.**
  Poctivě: driver je STRUKTURNÍ (kotva+šum), ne pár špatných uzlů → srazit K5 pod
  5 % by znamenalo buď zúžit šum (±2→±1 — vrátí rozbití K4c, kvůli kterému se
  rozšiřoval), nebo plošně snížit kotvy (kalibrace-3 falzifikovala: K1 špatný
  směr), nebo zvětšit ruce/pokrytí (mění K6a). **Designer nevěří, že B jde bez
  rozbití jiné brány** — uvedena poctivě jako pravděpodobně neprůchodná.
- **C — Free-pass definice + práh ~10–12 %.** Férovější čitatel (neviní tým za
  by-design slot) + práh těsně nad free-pass minimem (10,8 %). Stejné
  goalpost-riziko jako A, o něco menší změkčení.
- **D — reframe K5 na to, co gamble NEzachrání (doporučení designera).**
  Beznadějnost (`max≤1`) je dnes z části adresovaná právě gamblem; měřit „ex-ante
  max≤1" a ignorovat záchranné lano je měření špatné věci. **K5-nové = podíl
  uzlů, kde `max≤1` PŘED gamblem a zároveň i po gamblu** — definice „bez volby"
  (ani commit, ani záchrana nepomůže), nezávisle odůvodnitelná jako „mrtvé
  rozhodnutí". Číselně nižší než 17,3 %; práh vyžaduje jedno re-měření (log dnes
  nenese zbytek ruky). Free-pass definici (viník ≠ tým) přijmout jako součást;
  původní `max≤1` zůstává diagnostika (strukturní tlak, který sytí snowball
  a K2 — feature, ne bug). *(Operacionalizace „po gamblu" — viz KRITICKÝ nález
  1a kritika a PM syntéza: měřit proti realistické gamble-politice, ne best-case.)*

**Doporučení designera:** D, s fallbackem A; B zamítnout. Ať tak či tak: `<5 %`
na `max≤1` je mis-specifikace vůči vlastní resoluční variabilitě systému.

#### PŘIZNÁNÍ ZMĚKČENÍ
A i C i D **změkčují** proti doslovnému `<5 %`. Nezávislé odůvodnění: `<5 %` bylo
nastaveno dřív, než měření ukázalo, že blind-commit + šum ±2 strukturálně plodí
~17 % `max≤1` uzlů, které gamble-záchrana zčásti absorbuje. Gate proti vlastní
zabudované variabilitě systému je vadně specifikovaný. **D nejméně změkčuje**
(měří to, co gate má chytat — mrtvé rozhodnutí — jen přesněji). Co NEustupuje:
princip „hráč nesmí často stát před uzlem, kde nezmůže nic ANI se záchranou" —
ten drží varianta D jako gate.

#### Jak vyhodnotí sim
Report per-situace: (a) `max_dosaž` (stará, diagnostika); (b) flag nulovaných
slotů + free-pass přepočet (audit, ať je změkčení viditelné); (c) pro variantu D
nový výpočet `max≤1` po gamblu (potřebuje zbytek ruky v event-logu — navazuje na
K7 EV-výpočet). Vše navazuje na per-situace/per-slot rozpad v `sim/report.js`
(úkol technical-developera).

### Bod 2 — Scope K5/K7 na běžné uzly + vlastní metrika finále (K5f)

#### Stará formulace
K5 i K7 se počítají přes **všechny** situace runu, včetně finálových střetů
(zatah / léčka / konfrontace). Finále nemá vlastní metriku tvrdosti.

#### Nová formulace
> **K5, K7 se počítají jen nad běžnými uzly** (typ situace `npc` / `lokace`).
> Finálové střety (`zatah` / `lecka` / `konfrontace`) jsou z K5/K7 vyňaty a měří
> se vlastní metrikou **K5f**:
>
> **K5f** | tvrdost finále: **% přežití konfrontace** | **60–80 %** (per počet
> hráčů × pronásledovatel; dial pro P1, viz bod 5) | přežití = run po střetu
> pokračuje / dojede (nekončí NEVYŘEŠENO ve finále).
> **K5f-doplněk (pozitivní):** **≥ 90 % proher padne VE finále** (hra se rozhoduje
> na klimaxu, ne ranou atricí) — baseline 95,4 % 4p ✅.

**Definice K5f:** `přežití_konfrontace` = (runy, které dosáhnou konfrontace
a přežijí) / (runy, které konfrontace dosáhnou). „Přežití" = outcome nevede
k okamžitému konci runu; konfrontace při přežití srazí Žár (design §4.9).

**Naměřený baseline (OBA pronásledovatelé, kompetentni):** přežití konfrontace
1p **68,8** / 2p **76,0** / 3p **78,5** / 4p **78,5** %; per-pronásledovatel
Malone 63,7–76,8, Brody 72,9–80,4. Dojezd do konfrontace ~95–97 %, do jakéhokoli
finále ~99,8 %.

#### Nezávislé designové odůvodnění
Finále je **klimax**. Design §4.9 popisuje konfrontaci jako „okamžitou finální
situaci; přežití Žár srazí" — je z definice stavěná, aby **vynucovala risk**.
K5 („dá se vždy dojít k neprůšvihovému pásmu?") a K7 („dá se gamble vždy
vyhnout?") jsou pro klimax **špatné otázky** — vynucený risk ve finále je záměrné
drama (D25b), ne vada férovosti. Správná otázka pro klimax je „nezabíjí tě moc
často?" → to měří K5f. Finále dál MÁ gate, jen ten, který dává smysl pro klimax.
(Benchmark co-op designu: finální/eskalační fáze se měří mírou přežití, ne mírou
„vyhnul ses risku".)

#### Odvození pásma 60–80 %
- **Horní 80 % = antiklimax (čistě design).** Nad 80 % přežití je klimax bez
  sázky → poruší metriku úspěchu č. 5 (historka z porážky).
- **Dolní 60 % = z K1-floor + faktu „~95 % proher je ve finále".** Když skoro
  všechny prohry padnou v konfrontaci, je přežití konfrontace hlavní filtr K1
  (floor 45 % per-count). *(PM korekce dle kritika: aritmeticky vychází mez
  ~52 %; 60 % čti jako „~52 % + rezerva na variabilitu", tedy konzervativně
  přísnější hranu — viz část C.)*

Baseline leží v pásmu **s výjimkou 3p Brody 80,4 %** (těsný breach horní hrany —
PM korekce, část C). Čtení: tvrdost finále je dnes zhruba v pořádku; problém je
rozpětí K1 napříč počty (bod 5). K5f je hlavní **vnitřní dial P1**: 4p je na
horní hraně (78,5 % → K1 4p 70,9 breach), takže P1 má 4p (a 3p) finále
**PŘITÍŽIT** (přežití k ~65 %), ne ulevit. Pásmo 60–80 na to nechává prostor.

#### PŘIZNÁNÍ ZMĚKČENÍ
**Ano, změkčuje K5 i K7** — vyříznutím finále obě spadnou. Korekce kalibrace-3:
dřívější „finále nese ~50 % neřešitelnosti" byl podíl POČTU propadlých slotů, ne
míra `max≤1` — u K5 vyříznutí skoro nic neudělá (common 18,8 ≈ celek 18,4);
u K7 je efekt větší. **Ale finále se z brány nevypouští** — dostává vlastní tvrdý
gate K5f + pozitivní gate ≥90 %. Kdyby K5f byla jen diagnostika, byl by to únik.

#### Jak vyhodnotí sim
Rozdělit každou metriku common vs. finále (bucket dle typu situace). K5f:
run-level flagy „dosáhl finále / přežil finále" + per-count rozpad. Navazuje na
otevřený úkol technical-developera (`report.js`).

### Bod 3 — K7: vynucený vs. zvolený gamble

#### Stará formulace (prototyp-mvp.md, K7)
> **K7** | gamble: take-rate / kdy / EV | **≤ 20 % / ≥ 80 % při odhadu ≤2/4 /
> EV<0 při ≥3/4** | EV se měří per počet hráčů (líz 1/2 pro 1p/2p/4p, 1/3 pro 3p
> ne-držitele).

**Naměřeno (baseline):** bot bere gamble při est≤1 v **97,5 %**, při est=2
v **97,7 %**, při est≥3 v **0 %** (gambluje deterministicky iff `odhad ≤ 2`).
Podíl UZLŮ: vynucený (est≤1) **9,4–13,1 %**, zvolený (est=2) **39,6–41,8 %**.
Celkový take ~49 % je STRUKTURNÍ → starý strop ≤20 % je z definice referenční
strategie nedosažitelný. Gamble má nízkou EV: Δmax jen +0,07–0,09; realizované
pásmo překoná pre-gamble strop jen ve ~14 % gamblů (realiz. 4p: PRŮŠVIH 33 /
NÁSLEDKY 42 / HLADCE 22 / LOOT 3 %).

#### Nová formulace
> **K7** | gamble: rozliš **vynucený** vs. **zvolený**; gate na frekvenci
> vynucených uzlů + floor na záchranu + learnabilita commitu |
> **(1) `take_vynucený` (est≤1) ≥ 80 %** (záchrana funguje; baseline 97,5 ✅) ∧
> **(2) podíl uzlů s vynuceným gamblem (est≤1) ≤ 15 %** (frekvence stavu „bez
> volby"; baseline 9,4–13,1 ✅) ∧
> **(3) commit-learnabilita ≥ 12 b.** (commit-optimal − commit-random, oba
> s gamble-politikou — hlídá, že zvolený gamble netrivializuje commit;
> **[NEMĚŘENO — doměřit jako první krok kalibrace-4]**) ∧
> **(4) EV<0 při est≥3** (z pozice síly je gamble špatný; baseline take 0 % ✅) |
> **`take_zvolený` (est=2) = diagnostika, pásmo 30–50 %** (baseline ~40 %).
> Vše per počet hráčů, jen běžné uzly (bod 2).

#### Přesná definice obou typů
`odhad` = pásmo, kterého committnuté karty maximálně dosáhnou (best-case
přiřazení, bez gamblu):
- **VYNUCENÝ gamble** — `odhad ≤ 1/4` (pool dojede nanejvýš PRŮŠVIH). Hráč nemá
  co ztratit — gamble je jediná smysluplná záchrana, ne press-your-luck.
- **ZVOLENÝ gamble** — `odhad ≥ 2/4` (pool dojede aspoň S NÁSLEDKY). Hráč
  riskuje, že náhodná karta nahradí dobrou, aby si výsledek vylepšil. Tohle JE
  press-your-luck.

*(Terminologická poznámka kritika: „vynucený gamble" nečíst jako spor s opt-in
principem §4.4 — popisuje committnutou POZICI, ne donucení gamblovat; zvážit
přejmenování na „záchranný" vs. „hedge" gamble při zapékání.)*

#### Nezávislé designové odůvodnění
Starý strop ≤20 % slučoval dvě nesouměřitelná chování. Vynucený gamble není
smysluplné rozhodnutí — penalizovat gatem, že tonoucí sáhne po laně, je obráceně.
Proto: (a) nehlídat take-rate vynuceného (floor ≥80 %, ať lano funguje), ale
**frekvenci stavu „bez volby"** (gate 2; bratranec K5; práh ≤15 % ≈ „nanejvýš
~1× za 7-uzlový run"); (b) zvolený gamble je press-your-luck, ale jeho take-rate
negatovat — est=2 je ~40 % uzlů strukturně a gamble je „levný, málokdy zaplatí"
rerol; hlídat se má jeho **efekt** (trivializace commitu) → gate (3).

**Proč zvolený gamble není únik:** negatuje se jeho frekvence, ale gatuje se
jeho jediný škodlivý dopad (learnabilita ≥12 b.). Signál, že drží už teď: bot
při est≥3 negambluje nikdy (0 %) → silný commit se gamblem nezachraňuje.

#### Learnability-gate (3) — metoda ratifikovaná, číslo doměří re-session
Nebylo změřeno. Metoda: kompetentní bot s gamble-politikou (gambluj iff
odhad ≤ 2); změř win-rate mezeru commit-optimal − commit-random (oba gamblují);
musí zůstat ≥ 12 b. (reuse prahu K4c). Klesne-li pod, gamble snědl rozhodnutí —
pak celý reframe K7 padá a „cena gamblu" se vrací na stůl.

#### ZAMÍTNUTÁ varianta: přidat gamblu cenu
Jediná cesta k původnímu ≤20 % je zdražit gamble (kredit / Žár / bedna), aby
rutinní rerol při est=2 byl −EV. **Tým doporučuje NEdělat:** (a) ratifikovaný
vkus D17 — gamble je záměrně náhodný líz, ne utracení zdroje („spend-to-save"
bylo odmítnuto); (b) D25 zakázal novou mechaniku. Pokud by uživatel přesto chtěl
gamble jako vzácnou desperaci, je to vědomá změna vize §4.4 — proto se předkládá
(schvalovací bod 4), nerozhoduje tým.

#### PŘIZNÁNÍ ZMĚKČENÍ
**Ano, zásadně změkčuje** — starý strop ≤20 % padá; ~40 % zvoleného + ~10 %
vynuceného take se reklasifikuje jako zdravé/strukturní. Největší reframe balíku.
Proč správnější: staré K7 si protiřečilo s vlastní referenční strategií a míchalo
záchranu s hedge. Nová K7 laťku nedrží na frekvenci, ale tam, kde je skutečné
riziko: frekvence bezvýchodnosti (2), funkčnost záchrany (1), commit-learnabilita
(3), EV z pozice síly (4). Diagnostika pro lidský test: gamble zachrání jen
~14 % případů — je low-EV gamble vzrušující, nebo nudná daň? (Sim nerozhodne.)

#### Jak vyhodnotí sim
Report per gamble-příležitost: `odhad` před gamblem → klasifikace; take; Δmax
a realizované pásmo (EV-proxy); per počet hráčů. Frekvence vynucených uzlů =
podíl uzlů s odhadem ≤1. Pro (3) nový běh commit-optimal vs. commit-random.
Přímá EV z logu neodvoditelná (chybí zbytek ruky) → doplnit do event-logu.

### Bod 4 — K2 ko-metrika: drift míry PRŮŠVIHŮ uzel 3–4 vs. 1–2

#### Stará formulace (prototyp-mvp.md, K2)
> **K2** | přírůstek postihů/uzel (lehký 1, těžký 2,3) | uzel 3–4 ≥ **1,3×**
> uzel 1–2 | + korelace info-postih zátěž vs. pásmo (síla smyčky). Hlavní dataviz.

Naměřeno: poměr **počtu** postihů ~1,0–1,1 (plochý, cap 2). Drift **míry
PRŮŠVIHŮ** baseline: **1,07–1,25×** (OBA 4p **1,16**, 1p 1,17; Malone 1,12,
Brody 1,21–1,25). Kalibrace-3 čísla 1,29–1,47× byla S anchor-reverty (které se
nezapekly). Pozdní PRŮŠVIH-rate baseline: **24–26,7 %**.

#### Nová formulace
> **K2** | snowball: **drift míry PRŮŠVIHŮ** uzel 3–4 vs. 1–2 | složený gate:
> `PRŮŠVIH-rate(3–4) / PRŮŠVIH-rate(1–2) ≥ 1,3` (aspirace — **baseline 1,16
> NEPLNÍ**; kalibrace-4 musí vyrobit obsahem) **∧** `PRŮŠVIH-rate(3–4) ≥ 20 %`
> (floor citelnosti; baseline 24–26,7 % ✅) | mechanismus-diagnostika: korelace
> info-postih zátěž vs. pásmo. **Poměr POČTU postihů → jen diagnostika**
> (zastropován capem 2, není signál snowballu).

#### Nezávislé designové odůvodnění
Poměr počtu postihů je strukturálně neschopen ukázat snowball (cap 2 saturuje).
Snowball se u stolu projevuje jako „ke konci se to pere víc" = roste míra
PRŮŠVIHŮ — drift měří výstup snowball smyčky, tedy jev sám. Výměna je měření
správné věci, ne posun brankové tyče.

#### Poctivý gate — 1,3 se DRŽÍ, přestože baseline neplní
Facilitátorův návrh snížit na 1,15 (baseline by těsně prošel) **zamítnut** jako
goalpost-hřích. Poměr ≥1,3 z perceptibility (třetinový nárůst frekvence katastrof
= „ke konci to jde do kytek"); floor ≥20 % z perceptibility (1 z 5 pozdních uzlů)
a jako pojistka proti „plochému, ale absolutně vysokému" profilu. **Poctivé
varování o dosažitelnosti:** kanonický obsah dává 1,16, ani reverty kalibrace-3
nedaly 1,3; zda jde vyrobit pozdním snowballem bez rozbití K1 (u 1p riziko
podtečení 45) není ověřeno → případná nedosažitelnost = další P-rozhodnutí
uživatele, ne tiché snížení.

#### PŘIZNÁNÍ ZMĚKČENÍ / ZTÍŽENÍ
Není změkčení — výměna mrtvé metriky za živou s gatem NAD baseline. Jediný bod,
kde balík vědomě nechává gate nesplněný směrem nahoru.

#### Jak vyhodnotí sim
PRŮŠVIH-rate per uzel-index i po bucketech brzy/pozdě/finále, per počet hráčů;
poměr + floor; korelace postih-load ↔ pásmo. Formalizovat v `report.js`.

### Bod 5 — P1 operacionalizace: obtížnost jednotná napříč 1–4p

#### Stará formulace (K1 + K6a)
> **K1** | % DORUČENO | **45–70 % — FIXOVÁNO** | *(implicitně per-count,
> gate formulován jako jedno pásmo, reference 4p)*
> **K6a** | rozpětí win-rate mezi 1–4p | **≤ 10 b.** | parita obtížnosti.

#### Nová formulace
> **K1** | % DORUČENO, **per počet hráčů** | **každý z 1p/2p/3p/4p ∈ [45, 70] %**
> | baseline 1p 59,1 / 2p 67,4 / 3p 70,7 / 4p 70,9 → **3p/4p breachují nahoru**.
> **K6a** | rozpětí win-rate mezi 1–4p | **≤ 6 b.** (zpřísněno z ≤10; **baseline
> 11,8 b. NEPLNÍ**) | „jednotná obtížnost" = spread pod prahem citelnosti.

#### Nezávislé designové odůvodnění
D25d žádá obtížnost stejnou bez ohledu na počet hráčů: (1) K1 per-count
explicitně — žádný počet nesmí být mimo pásmo, ne jen průměr/reference;
(2) K6a ≤6 b. — spread 10 b. je citelný („ve čtyřech je to easy"), ~6 b. leží
na hraně run-to-run šumu. *(Poznámka kritika: „na hraně šumu" je asertováno,
ne doloženo — re-měřicí session má doložit skutečnou run-to-run varianci.)*

#### Mechanismus — ŽÁDNÁ NOVÁ MECHANIKA
Kořen je co-op škálování (víc rukou = víc pokrytí = snazší běžné uzly). Srovnání
se nedělá zploštěním běžných uzlů (falzifikace kalibrace-3 — K1 špatný směr),
ale vnitřními dialy finále/Žáru per počet hráčů: počet skrytých slotů finále,
severita konfrontačních postihů, tempo Žáru (kotvy finále jsou na stropu 4).
K5f per-count je hlavní dial. Ruka 1p 8→9 (P4) až PO P1 (pořadí z D24).

#### PŘIZNÁNÍ ZMĚKČENÍ
**Žádné — laťka se zvedá.** Protiváha bodů 1–3: balík není plošné uvolnění.

#### Jak vyhodnotí sim
K1 gateováno per 1/2/3/4p; K6a = max − min; K5f per count jako dial-diagnostika.

### Bod 6 — Procesní: re-ratifikace dělby „kdo vlastní K1"

#### Stará formulace (D22e hand-off)
> „Po tomto zapečení drží K1 výhradně engine (viditelné kotvy + šum) — skryté
> sloty a balík se na K1 už neladí."

#### Co se v praxi dělo
Hand-off se porušoval (kalibrace-2 stavěla na obsahové páce kvůli K1) a
kalibrace-3 měřením prokázala, že K1 pohání finále + akumulace postihů (obsah),
ne jen šum/kotvy enginu. Premisa „engine sám vlastní K1" je falzifikovaná.

#### Nová formulace
> **K1 je SDÍLENÁ metrika; vlastnictví podle páky, ne jeden agent:**
> - **Engine:** noise-model (±2), globální win-rate škály, velikosti rukou per
>   počet hráčů, tempo/prahy Žáru jako parametry.
> - **Obsah:** rozložení kotev, keying slotů, vlastnosti pronásledovatelů
>   (`rusi`), severita a rozmístění postihů, severita finále.
> - **Change-control:** změna KTERÉKOLI páky hýbající K1 se měří proti celé bráně
>   současně (K1∧K5∧K7∧K5f) a kontrafaktuálně přes `CONTENT_DIR` PŘED zapečením.
>   **Tvrdá podmínka (doplněk kritika, PM přejímá): podmínkou zapečení je
>   doložený kontrafaktuální whole-gate report v kalibračním reportu
>   `technika/`; kontroluje PM.** Bez artefaktu se nezapéká.

#### Nezávislé designové odůvodnění
Čistý hand-off způsobil škodu (hledání opravy K1 ve špatné páce). Sdílené
vlastnictví podle páky + vynucený kontrafaktuál atribuci nevymazává, ale
vynucuje. Není to o edit-rights (CLAUDE.md dělba trvá: obsah edituje jen
designový tým).

### Shrnovací tabulka

| Bod | Kritérium | Směr | Klíčové číslo / baseline | Stav |
|---|---|---|---|---|
| 1 | K5 | doslovné D25a je NO-OP → varianty A–D | `<5 %` nedosažitelné (min 10,8 %); D = `max≤1` i po gamblu, práh [doměřit] | ⚠ ROZHODNUTÍ UŽIVATELE |
| 2 | K5/K7 scope + K5f | změkčuje K5/K7, přidává gate K5f | přežití konf. **60–80 %** (baseline 63,7–**80,4**; 3p Brody těsný breach) + ≥90 % proher ve finále (95,4 ✅) | návrh hotový |
| 3 | K7 | zásadně změkčuje (reframe) | vynuc. uzly ≤15 % (9–13 ✅) ∧ take_vynuc ≥80 % (97,5 ✅) ∧ learn ≥12 b. [NEMĚŘENO] ∧ EV<0 est≥3 (✅) | podmíněno doměřením (3) |
| 4 | K2 | výměna mrtvé za živou + přísný gate | drift ≥ **1,3** (baseline 1,16 **NEPLNÍ**) ∧ floor ≥20 % (24–27 ✅) | ⚠ musí se vyrobit v kal-4 |
| 5 | K1/K6a (P1) | **ZTĚŽUJE** | K1 per-count ∈[45,70] (3p/4p breach) ∧ K6a ≤ **6 b.** (11,8 **NEPLNÍ**) | ⚠ zavře P1 dorovnání |
| 6 | dělba K1 | proces | sdílená podle páky + povinný kontrafaktuální whole-gate artefakt | návrh hotový |

**Poctivé čtení:** balík není plošné uvolnění. Body 1–3 změkčují (a přiznávají
to), body 4–5 drží gaty NAD baseline. Jediné, co brána po schválení uzná za
splněné dnes, jsou floory K7 (1/2/4) a K5f-doplněk; K5f pásmo s výhradou 3p Brody.

### Trvale otevřené pro LIDSKÝ test (simulace neprokáže)
Napíná konfrontace, nebo prohra ve finále frustruje (K5f)? Je low-EV gamble
vzrušující, nebo nudná daň (zachrání jen ~14 %)? Vytváří ~40 % zvolených gamblů
pocit „musím sázet pořád"? Patří lidské bráně, ne Fázi 0.

---

## ČÁST B — Verdikt design-critica (adversariální prověrka, doslovně)

### (a) Celkové stanovisko: SCHVÁLIT RÁMEC S ÚPRAVAMI — nezapékat nic, dokud se nedoměří tři věci

Balík **není plošné rozvolnění brány maskované jako redefinice.** Disciplína
„PŘIZNÁNÍ ZMĚKČENÍ" u každého bodu je poctivá a z velké části obstojí: body 4
a 5 laťku prokazatelně zvedají nad baseline (a baseline je neplní), takže
obvinění „přepsali jsme bránu, aby prošla" v celku neplatí. Reframe K7 (bod 3)
je nejlépe obhájená změna v celém balíku, protože měření prokázalo, že staré
≤20 % bylo mis-specifikace, ne přísná laťka.

**Ale** balík obsahuje tři místa, kde se laťka snižuje okamžitě, zatímco
kompenzující pojistka je buď neměřená, nebo optimisticky operacionalizovaná.
Proto: schválit znění/definice jako směr kalibrace-4, ale žádnou metriku
neprohlásit za splněnou a nic nezapéct do `prototyp-mvp.md`, dokud:

1. se K5 varianta D nezmění z „best-case gamble" na realistickou (očekávanou)
   gamble-politiku a nedoměří se práh;
2. se nedoměří K7 learnabilita (3) — dokud ji neznáme, je reframe K7 čisté
   rozvolnění bez aktivní pojistky;
3. se nesrovná dvojí měřicí cut (17,3/18,4; přežití 1p 68,8/76,6) a každé
   baseline číslo nedostane label.

### (b) Nálezy per bod

**BOD 1 — KRITICKÉ (1a):** varianta D s „nejlepším gamble-lízem" je optimistické
účetnictví — hráč gamble neřídí (náhodný líz, D17/§4.4), best-case je výsledek,
který hráč nedostane spolehlivě. Beznadějnost se papírově smaže výsledkem mimo
hráčovu kontrolu = „gamble jako deus ex machina". Koncept je správný;
operacionalizace přes best-case je goalpost-adjacentní. → Práh D počítat proti
realistické gamble-politice (nejlepší volba ruky, ale náhodný/očekávaný líz).
Bez této úpravy variantu D neschvalovat jako gate.
**VÁŽNÉ (1b):** varianta A (~15 %) je baseline-kotvená navzdory disclaimeru —
„1/6 je emergentní" je popis baseline (16,7 ≈ 17,3), ne normativní práh. Jediná
nezávislá kotva pro 15 % je „1×/run" logika z bodu 3. Varianta A samostatně =
goalpost move.
**Poznámka:** no-op nález doslovného D25a je poctivě přiznán a doložen —
korektní eskalace, ne skrytý posun.

**BOD 2 — VÁŽNÉ (2a):** dolní hrana 60 % odvozena volněji, než balík tvrdí —
z K1-floor vychází ~52 %, ne 60; těch 8 bodů je nedovozená rezerva a 60 je kulaté
číslo hned pod baseline minimem. Vůči K1-floor je 60 konzervativní (přísnější),
ale odvození je post-hoc racionalizace. → Přiznat jako „~52 % + rezerva", nebo
odvodit z napínavosti klimaxu.
**VÁŽNÉ (2b):** tvrzení „baseline 63,7–80,4 leží uvnitř 60–80" je nepravdivé na
horní hraně — 3p Brody 80,4 > 80. Dle vlastního odůvodnění horní hrany tedy
3p Brody finále už dnes selhává na antiklimaxu (o 0,4 b.). Buď je to breach
(a říct to), nebo je horní hrana volnější (a odvodit ji).
**POZNÁMKA (2c):** gate „≥90 % proher ve finále" je legitimní levná pojistka
proti rané atrici, ale prakticky nezávazná (baseline 95,4 s rezervou) —
neprodávat jako „posílení brány". Scope (vyříznutí finále) přijímám — finále
dostává vlastní tvrdý gate, §4.9 je přímá opora.

**BOD 3 — KRITICKÉ (3a):** jediná tvrdá pojistka proti trivializaci commitu —
learnabilita (3) ≥12 b. — je NEMĚŘENÁ; gaty (1)(2)(4) jsou floory/frekvence,
které baseline plní s rezervou. Starý strop padá hned; náhradní ochrana je slib.
Když (3) vyjde < 12 b., celý reframe padá a vrací se „cena gamblu". → Bod 3
schválit jako definici, ale K7 neprohlašovat za splněnou, dokud (3) neprojde;
doměřit PŘED čímkoli jiným v kalibraci-4.
**POZNÁMKA (3b):** gate (2) ≤15 % a K5 varianta A ~15 % měří skoro totéž
(est vs. oracle — korelované, ne identické); nejsou to dvě nezávislé pojistky.
**Reframe samotný schvaluji** (staré ≤20 % bylo měřením doložená
mis-specifikace; split nekoliduje s §4.4 — opt-in povaha vs. committnutá
pozice). Termín „vynucený gamble" doporučuji přejmenovat (např. „záchranný" vs.
„hedge"), ať nesvádí ke sporu s vizí. Zamítnutí „ceny gamblu" je správné
a správně eskalované jako rozhodnutí uživatele.

**BOD 4 — POZNÁMKA:** není alibi, je to skutečné zpřísnění — jediné místo, kde
balík vědomě nechává gate nad baseline; odmítnutí 1,15 je pravý opak goalpost
move. Kredit za poctivost. Výhrada: dosažitelnost 1,3 není ověřená — je to
aspirace, ne validovaný gate; případná nedosažitelnost se musí vrátit jako
P-rozhodnutí, ne tiché snížení na 1,2. Číselná drobnost: pozdní PRŮŠVIH-rate
napříč N je 24,0–28,3 % (balík uvádí 24–26,7) — floor 20 % projde tak jako tak.

**BOD 5 — POZNÁMKA:** laťku zvedá, souhlas; respektuje falzifikaci kalibrace-3
i zákaz nové mechaniky. Výhrada: K6a ≤6 „na hraně šumu" je asertováno, ne
doloženo (8bodový rozptyl přežití mezi měřicími cuty naznačuje, že šum není
zanedbatelný) — doložit skutečnou run-to-run variancí. Přitížení 4p finále
o ~6 K1 bodů čistě finálem je velký posun s neověřenou dosažitelností (správně
delegováno, neoznačeno jako hotové).

**BOD 6 — POZNÁMKA:** správná oprava reality, ale chyběl tripwire — „stated but
not enforced" vzorec potopil už D22e. → Kontrafaktuální whole-gate report
(K1∧K5∧K7∧K5f) udělat tvrdou, doložitelnou podmínkou každého zapečení. *(PM
přejal do znění bodu 6 a schvalovacího bodu 7.)*

### (c) Je v balíku moving the goalposts?

**Ano, na třech místech — ale ne plošně, a dvě ze tří jsou opravitelné úpravou
operacionalizace, ne stažením ambice:**

1. **Největší — K7 (bod 3):** okamžité stažení tvrdého stropu ≤20 %, pojistka
   jen slíbená. Krytí podmíněné — drží pouze pokud learnabilita doměřením
   projde. Do té doby nekryté rozvolnění.
2. **K5 varianta D:** beznadějnost se maže výsledkem mimo hráčovu kontrolu
   (best-case gamble). Krytí slabé, dokud se best-case nenahradí očekávanou
   gamble-politikou — pak solidní.
3. **K5f dolní hrana 60 % a K5 varianta A 15 %:** kotvení pod/u baseline
   v přestrojení za nezávislou derivaci. Posun malý (u 60 % dokonce
   konzervativní), ale odůvodnění je zpětná racionalizace.

Kde bych řekl „tohle by neprošlo, kdyby čísla vyšla jinak": bod 3 celý (stojí na
neměřené learnabilitě); bod 2 tvrzení „baseline uvnitř" (neprošlo už teď — 3p
Brody 80,4); bod 1 varianta A (projde jen proto, že 15 ≈ baseline 17,3).
**Kde goalpost NENÍ:** body 4 a 5 — balík tam bránu utahuje na metrikách, které
se teprve musí vyrobit.

### (d) Doporučení uživateli u rozhodovacích bodů

1. **K5:** zvol variantu **D s opravou operacionalizace** (realistická
   gamble-politika, ne best-case líz). Variantu A jen jako fallback s „1×/run"
   logikou; samotné „~15 % protože 1/6" neschvaluj. Variantu B zamítni.
2. **Cena gamblu:** nepřidávej — ale podmiň schválení bodu 3 tím, že
   learnabilita se doměří jako první krok kalibrace-4; pokud selže, „cena
   gamblu" se vrací jako vědomá změna vize.
3. **K2 1,3 a K6a ≤6:** schval (poctivá zpřísnění) s vědomím, že nejsou dnes
   splněné a musí se vyrobit; předem odsouhlas, že případná nedosažitelnost je
   budoucí P-rozhodnutí, ne tichý ústup.
4. **Průřezově — nezapékej nic do `prototyp-mvp.md`, dokud:** (i) se nesrovná
   dvojí měřicí cut a baseline čísla nedostanou label; (ii) neproběhne
   consistency-check; (iii) z kontrafaktuálního whole-gate reportu není tvrdá
   podmínka zapečení.

### Tři nejdůležitější nevyřešené otázky
1. Learnabilita zvoleného gamblu (K7 gate 3) — doměřit jako první.
2. Dvojí měřicí cut — proč 8bodový rozptyl přežití 1p (68,8 vs. 76,6) na 2000
   runech? Dokud se nevysvětlí, nelze věřit baseline číslům na desetinu — a K6a
   ≤6 přímo závisí na skutečné run-to-run varianci.
3. K5 varianta D — práh a gamble-politika měření. Bez čísla prázdná krabice;
   s best-case operacionalizací metrika podhodnocující beznaděj.

---

## ČÁST C — Syntéza PM (review a převzaté podmínky)

1. **Verdikt PM: balík předložit ke schválení v tomto znění.** Kritikovy
   KRITICKÉ nálezy nejsou důvod k vrácení — jsou to podmínky, které PM přejímá
   do schvalovacích bodů (1: varianta D s realistickou gamble-politikou;
   3: learnabilita první, K7 do té doby nesplněná; 7: povinný kontrafaktuální
   artefakt u bodu 6). Faktickou chybu návrhu (2b — „baseline uvnitř 60–80")
   PM koriguje přímo v části A a schvalovacím bodě 2: **3p Brody 80,4 % horní
   hranu těsně breachuje**; čtení zůstává stejné (P1 má 3p/4p finále přitížit,
   což breach řeší), ale deklarovat pass, který vlastní čísla nesplňují, se
   nesmí.
2. **Dvojí měřicí cut (integrita čísel):** dvě nezávislá měření facilitátora se
   shodla ve všech ZÁVĚRECH (K5 no-op a nedosažitelnost <5 %; K7 struktura
   iff est≤2; finále rozhoduje run; K2 drift pod 1,3), ale liší se v dílčích
   číslech (K5 17,3 vs. 18,4 %; přežití 1p 68,8 vs. 76,6 — patrně jiná definice
   „přežití konfrontace vs. jakéhokoli finále", ověří re-měření). Balík
   používá autoritativní tabulky `mereni-vysledky.md`. **Žádné schvalované
   PÁSMO na rozdílu cutů nestojí**, ale re-měřicí session musí čísla
   sjednotit formalizovaným `report.js` (ne ad-hoc skriptem) dřív, než se
   cokoli prohlásí za splněné/nesplněné.
3. **Soulad s principy:** mechanika rozhoduje / AI vypráví — netčeno (balík
   nemění žádnou mechaniku, jen metriky a proces; jediné dvě mechanické varianty
   — cena gamblu, zúžení šumu — jsou explicitně zamítnuté/eskalované). Scope
   MVP — netčen. Žádná nová mechanika (mandát D25) — dodrženo. Consistency-check
   design-dokument × prototyp-mvp: nutný až při zapékání (teď se žádný kanonický
   dokument nemění); balík sám mapuje opory v §4.4/§4.9 a kritik kolizi
   vyloučil (split vynucený/zvolený není spor s opt-in principem §4.4).
4. **Poznámka k terminologii:** při zapékání zvážit přejmenování „vynucený /
   zvolený gamble" na „záchranný / hedge gamble" (nález kritika) — rozhodne se
   při zapékání, není to schvalovací bod.

---

## ČÁST D — Dvě zbývající eskalace z D22f (schvalovací bod 8)

**(a) Ratifikace posunu obrana-skrytých slotů (D22f(2)).** D22(b) zapečel u 4
skrytých obrana-kotev snížení 3→2 (most-prohnila-prkna, urednik-razitko,
mesto-houkacky, brody.konfrontace) jako dávkovatelný dial. Tím se fakticky
posunul princip skrytých slotů z „stat skrytého slotu má být odvoditelný
z telegrafu" na **„levný naslepo-slot + přeliv pokrytím"** (hráč slot
nepredikuje, ale nízká kotva 2 znamená, že ho zachrání šíře pokrytí balíku).
Posun je od kalibrace-1 v obsahu zapečený a měřený (kalibrace-2/3 na něm stojí)
— chybí formální ratifikace. Odkaz: `projekt/rozhodnuti.md` D22(b), D22f(2).

**(b) Potvrzení pool-odchylky brody.lecka (D22f(3)).** Content-generator při
zapracování D22(d) použil u brody.lecka postih `prilis-na-rane` místo původně
navrženého `prach-do-oci`, aby držel strop „žádný postih ve >7 poolech" (D20).
PM cap-safe variantu schválil procesně, uživatel zatím ne. Finální maxima poolů:
prach/mlha/zvoneni/prilis 7, otras 6, zebro 6. Odkaz: D22(d), D22f(3).

---

## ČÁST E — Startovací prompt re-měřicí session (spustí uživatel po schválení)

```
Jsi project-manager projektu Důkazní materiál 1930 (monorepo C:\Projekty\Case files).
Uživatel schválil balík nového znění simulační brány Fáze 0 —
technika/kalibrace-4-brana-navrh-2026-07-27.md (schváleno [DATUM], body [ROZSAH],
u K5 varianta [A/C/D]). Proveď kalibraci-4 v tomto pořadí:

0. PODMÍNKY PLATNOSTI (z verdiktu kritika, před vším ostatním):
   (a) technical-developer formalizuje v prototyp/sim/report.js rozpady
   per-situace / per-slot / common-vs-finále, K5 varianty (max_dosaž, free-pass,
   post-gamble dle schválené varianty), K7 vynucený/zvolený + podíl vynucených
   uzlů, K5f přežití konfrontace per count × pronásledovatel, K2 drift
   PRŮŠVIH-rate, K1 per-count, K6a + run-to-run varianci (kvůli prahu ≤6)
   — navazuje na otevřený backlog řádek; testy zelené, golden snapshoty jen
   vědomě. (b) Tím sjednoť dvojí měřicí cut z 2026-07-27 (K5 17,3 vs. 18,4;
   přežití 1p 68,8 vs. 76,6) — kanonický baseline s labely definic.
   (c) Doměř K7 learnabilitu (commit-optimal − commit-random, oba s gamble
   politikou; gate ≥12 b.) — pokud <12, reframe K7 padá a "cena gamblu" se
   vrací uživateli jako P-rozhodnutí; dál nepokračuj bez eskalace.
   (d) U K5 varianty D doměř práh proti REALISTICKÉ gamble-politice (nejlepší
   volba ruky, náhodný/očekávaný líz — NE best-case) a navrhni gate.
1. Zapeč schválené znění do prototyp-mvp.md Fáze 0 (přesně dle balíku a volby
   variant; zvaž přejmenování vynucený/zvolený → záchranný/hedge dle kritika).
   Spusť consistency-check (design-dokument × prototyp-mvp). Aktualizuj
   projekt/rozhodnuti.md (nové D-číslo) a stav.md.
2. P2 obsahová řešitelnost bez hodnota-slotu (content-generator + sim, D25e):
   dopočet pokrytí; kandidáty měř kontrafaktuálně přes CONTENT_DIR před
   zapečením (povinný whole-gate artefakt dle bodu 6).
3. P3 improv_skryte (engine+obsah, D25f; princip „odvoditelnost nebo přeliv",
   D22b; cíl: nadrazi-vypravci).
4. P1 dorovnání obtížnosti 1–4p výhradně přes finále/Žár (skryté sloty finále,
   severita konfrontačních postihů, tempo Žáru; 3p/4p finále přitížit k přežití
   ~65 %; kotvy finále jsou na stropu 4; NE přes běžné uzly — falzifikace
   kalibrace-3). K2 drift ≥1,3 vyrábět pozdním snowballem obsahem (směr D22d),
   hlídat K1 1p floor 45. P4 (ruka 1p 8→9) až PO P1.
5. Re-měření 1000×2 (seedy 1–1000) proti novému znění brány; report
   technika/kalibrace-4-<datum>.md s celou gate-tabulkou (vč. toho, co NEPLNÍ),
   verdikt do rozhodnuti.md + stav.md.

Git: commituj v logických celcích, jeden vykonavatel, testy před commitem.
Obsah se z kódu needituje; kandidáti vždy nejdřív kontrafaktuálně (CONTENT_DIR).
Nedosažitelné gaty (K2 1,3; K6a 6; K5 práh) NIKDY tiše nesnižuj — eskaluj jako
P-rozhodnutí uživatele.
```

---

*Křížové odkazy: [[kalibrace-3-2026-07-26]] (falzifikace léku kotev),
[[../projekt/rozhodnuti|projekt/rozhodnuti.md]] (D22, D24, D25),
[[../prototyp-mvp|prototyp-mvp.md]] (stávající znění brány — NEZMĚNĚNO).
Podklady měření: scratchpad session 2026-07-27 (`mereni-vysledky.md`,
`k4-mereni.mjs`) + paměť role `playtest-facilitator/kalibrace-4-baseline.md`.*
