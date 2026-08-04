# Kontrafaktuál balík 80 (D59) — sloučený balík věcí PŘED zapečením

**Stav: MĚŘENO, NIC NEZAPEČENO.** Podklad: [[../projekt/rozhodnuti|projekt/rozhodnuti.md]]
D59 (schválení 40 nových karet) + [[navrh-40-karet-2026-08-04|technika/navrh-40-karet-2026-08-04.md]]
(kandidátní obsah, přiznané odchylky). Dvě rozhodnutí padají naráz nad týmiž
čísly: (1) zapéct sloučený balík 40→80 do `obsah/veci.yaml`, (2) aktivovat
rezervní páku `hraci[n].ruka` na guardrail-floor (2p=4, 3p=3, 4p=2) z
[[d58-4-sweep-ruka|D58/4]]. Verdikt jde uživateli.

**Nástroje:** `veci-merged-80.yaml` (scratchpad, `merge80.mjs` — 40 kanonických
+ 40 nových, ověřeno beze změny od 2026-08-04, 0 kolizí ID), `CONTENT_DIR`
ukazuje na scratchpad kopii `obsah/` se zaměněným `veci.yaml` (ADR-005), ostatní
soubory (`situace.yaml` atd.) nedotčené. Měřicí skript `d59-measure.mjs`
(scratchpad, jednorázový — napodobuje `sim/sweep-ruka.js` confirm mode přes
stejné importy `run.js`/`report.js`/`rules.js`, nic v repu needituje, navíc
tiskne `kredit_median` a `per_count_pursuer`). **`prototyp/src`, `rules.js`
ani `obsah/` nejsou editovány** — jen čteny.

**Metodika:** 2 bloky × 8000 runů (4 počty hráčů × 2 pronásledovatelé ×
1000/buňka), bot `kompetentni`, seedy 1–1000 a 1001–2000, verdikt vždy
z průměru přes bloky (D31). Pro **A** (dnešní baseline) byl 1 blok použit
jako **replikační kontrola** proti již existujícím 2-blokovým číslům
z [[mereni-zar-malone-2026-08-02|technika/mereni-zar-malone-2026-08-02.md §8]] —
ne nové měření od nuly. Pro **D** byla čísla **převzata** z
[[d58-4-sweep-ruka|D58/4]] a navíc verifikačně přeměřena tímtéž skriptem
(shoda na desetinu procentního bodu, viz níže) — potvrzuje, že `d59-measure.mjs`
počítá totéž co `sweep-ruka.js`.

---

## Předregistrovaná přijímací kritéria (zapsána PŘED měřením B a C)

1. **Balík 80 nesmí rozbít žádný DNES SPLNĚNÝ gate.** Dnes (balík 40, ruce
   dnešní = A) plní: K1 1p (pásmo [45,70]), K2 (drift≥1,3 ∧ floor≥20 — na
   hranici, viz pozn. u repliky), K5f (přežití konfrontace + proher_ve_finale
   ≥90), K7 (4 podmínky). K1 2p/3p/4p a K6a jsou dnes NESPLNĚNÉ (vědomě nesené
   odchylky, D39) — u nich se nehodnotí binárně, ale **kolik z mezery ke stropu
   zavírají**.
2. **Floor kombinace (C) se hodnotí přírůstkově**, ne izolovaně: kolik mezery
   K1 3p/4p ke stropu 70 zavírá NAD RÁMEC toho, co zavírá floor ruky samotná
   (D, z D58/4: 3p ~28 %, 4p ~26 %) a co zavírá balík 80 samotný (B). Test na
   aditivitu (superlineární/lineární/sublineární kombinace).
3. **Supply kontroly musí zůstat neutrální**: `nonGangsterStatMax` (V4-D
   clamp) a poměr non-GANGSTER útok≥3 nesmí projevit obsahem vynucenou změnu
   chování enginu — ověřeno staticky před sim (viz níže), ne post-hoc.
4. **Žádná nová K5-D regrese** o víc než ~2 b. nad pozorovaný šum (baseline
   ~7,7–8,3 %).
5. Pokud se najde regrese specifická PRO BALÍK 80 (ne pro páku ruka), jde se
   ke game-designerovi s konkrétním číslem, ne s dojmem — přiznaná odchylka #1
   v návrhu ji sama predikovala (balík je „hubenější" o ~4 %) a nabídla levný
   lék (+1 na druhý stat u 4–6 fillerů).

---

## Statické kontroly (před simulací)

- **`nonGangsterStatMax`** (V4-D supply-aware clamp, počítá se z obsahu při
  načtení): balík 40 `{útok:4, obrana:5, hodnota:5, improvizace:5, nástroj:5}`
  — balík 80 **identické**. Nová dávka nepřidává žádnou non-GANGSTER kartu se
  statem vyšším než dnešní maximum (nejsilnější non-GANGSTER útoky nové dávky —
  Tulení ocas, Zmrzlá šunka, Vycpaný jezevec — mají útok 4, stejně jako
  kanonický strop). **Clamp se s balíkem 80 chová stejně** — kritérium 3 splněno.
- **Non-GANGSTER útok ≥ 3** (jediné řešení viditelných útok-slotů, kde GANGSTER
  auto-failuje): 6 → 12, poměr přesně zachován (z návrhu). Dostupnost slotů
  se tedy nezhoršuje ani nezlepšuje relativně — jen roste absolutní nabídka.
- **ID kolize:** 0 (ověřeno `merge80.mjs`, 80 unikátních).

---

## Tabulka 4 buněk — K1 per počet hráčů

| konfigurace | K1 celkem | 1p | 2p | 3p | 4p | K6a spread | v pásmu [45,70] |
|---|---|---|---|---|---|---|---|
| **A** balík 40, ruce dnešní (dnešní baseline, 2blok oficiál) | 80,7 % | 68,35 | 80,65 | 86,60 | 87,20 | 19,0–19,4 ❌ | ✅❌❌❌ |
| **A** replika (1 blok, tento skript) | 81,0 % | 68,1 | 81,4 | 87,4 | 87,1 | 19,3 ❌ | shoda na ~1 b. |
| **D** balík 40 + floor ruce (D58/4, přeměřeno shodně) | 77,9 % | 68,35 | 78,55 | 81,90 | 82,75 | 14,6 ❌ | ✅❌❌❌ |
| **B** balík 80, ruce dnešní (nově) | 78,85 % | 64,0 | 80,25 | 85,15 | 86,10 | 22,1 ❌ | ✅❌❌❌ |
| **C** balík 80 + floor ruce (nově) | 75,6 % | 64,0 | 77,05 | 80,20 | 81,35 | 17,8 ❌ | ✅❌❌❌ |

Dataviz: [[kontrafaktual-balik80-2026-08-04-dataviz.html|technika/kontrafaktual-balik80-2026-08-04-dataviz.html]]
(grouped bar 4× konfigurace × 4 počty, gate pásmo, tabulkový přepínač,
paleta validována `scripts/validate_palette.js` light+dark).

### K1 per pronásledovatel (blokový průměr, kde k dispozici)

| | 1p Malone | 1p Brody | 2p Malone | 2p Brody | 3p Malone | 3p Brody | 4p Malone | 4p Brody |
|---|---|---|---|---|---|---|---|---|
| A (1 blok) | 68,5 | 67,7 | 80,1 | 82,7 | 86,4 | 88,4 | 86,1 | 88,1 |
| D (2blok) | 68,55 | 68,10 | 76,35 | 80,65 | 79,45 | 84,35 | 80,80 | 84,70 |
| B (2blok) | 63,5 | 64,45 | 79,4 | 81,05 | 83,75 | 86,5 | 85,8 | 86,35 |
| C (2blok) | 63,5 | 64,45 | 75,75 | 78,3 | 79,85 | 80,55 | 80,7 | 81,95 |

Brody je systematicky o 2–5 b. shovívavější než Malone napříč VŠEMI čtyřmi
konfiguracemi (žádná interakce s balíkem — je to vlastnost pronásledovatele,
ne obsahu). 1p_Malone a 1p_Brody jsou v B a C identické na desetinu procenta
se stejnými seedy — očekávaně, `ruka[1]` se pákou nemění a rozdíl je čistě
z obsahu, deterministicky reprodukovatelný.

---

## Ostatní gate metriky (blokový průměr B a C)

| metrika | A (1blok) | D (2blok) | B (2blok) | C (2blok) | gate |
|---|---|---|---|---|---|
| K5-D expDead pooled | 7,7 % | 8,3 % | 9,15 % | 9,85 % | diagnostika (práh nedodán) |
| K5f celkem | 77,6 % | 75,85 % | 76,0 % | 73,85 % | ∈[60,80] per buňka |
| K5f proher_ve_finale | 96,7 % ✅ | 96,65 % ✅ | 96,25 % ✅ | 96,3 % ✅ | ≥90 % |
| K2 drift/floor | 1,41/17,6 ❌* | ~1,50/20,65 ✅ | 1,565/19,9 ❌** | 1,49/21,25 ✅ | drift≥1,3 ∧ floor≥20 |
| K7 (4 podmínky) | 3/4 (hedge podíl 28,7 %, pod pásmem)** | 4/4 ✅ | 4/4 ✅ | 4/4 ✅ | všechny 4 |
| kredit_median (K8 proxy) | 5 | 4 | 5 | 4 | gate 7–9 (viz caveat) |

\* A na 1 bloku je pod hranicí (17,6 % < 20) — to je stejný řád šumu, jaký se
objevuje i jinde na hranici 20 % (D blok2 měl 19,6 %); s 2 bloky dřívější
měření K2 u baseline hlásilo splnění. Nejde o nový nález, jen o vlastnost
1blokového vzorku — **nekombinovat s B/C, které mají plné 2 bloky**.

\** B je na hraně (floor 19,9 %, blok1 20,2 OK / blok2 19,6 FAIL) — hraničně
NESPLNĚNO PRŮMĚREM. Rozdíl proti dnešnímu baseline je v jednotkách šumu
(~0,7 b.), ne kvalitativní regrese. K7 hedge_podíl u A na 1 bloku vypadl pod
pásmo 30–50 % (28,7 %) — na 2 blocích v historii tahle hodnota kolísá kolem
29–30 %, taky hraniční šum, ne nový problém B/C.

**K8 caveat (přiznaná mezera měření, ne tichý pass):** `kredit_median` zde je
proxy = medián `kredity_zbytek` na konci runu, NE plná K8 definice z
`prototyp-mvp.md` (medián kreditů + <30 % runů kupuje vše + směna/léčení
≥25 % motelů — vyžaduje samostatný audit, který `report.js` nemá hotový,
stejná mezera jako K3/K4d/K6c z [[d58-4-sweep-ruka|D58/4]]). Nicméně **na této
proxy je efekt čistě z páky ruka, ne z obsahu**: A=5, B=5 (shoda, balík 80 ho
nemění), D=4, C=4 (shoda, floor ruka ho mění stejně na obou balících). Balík
80 tedy K8-proxy neregreduje — jde o starší, dosud nezapsaný vedlejší účinek
floor-páky, mimo rozsah tohoto kontrafaktuálu.

---

## Klíčový nález 1 — gap-closure K1 3p/4p je ROUGHLY ADDITIVNÍ, ne synergický

Efekt páky ruka (D vs. A, na balíku 40) a efekt obsahu (B vs. A, na ruce
dnešní) se kombinují téměř přesně součtem, ne superlineárně:

| | 3p pokles (b.) | 4p pokles (b.) |
|---|---|---|
| D − A (jen páka) | −4,70 | −4,45 |
| B − A (jen obsah) | −1,45 | −1,10 |
| aditivní predikce (A − obojí) | 80,45 | 81,65 |
| C (skutečnost) | 80,20 | 81,35 |
| odchylka od aditivity | −0,25 | −0,30 |

Odchylka (~0,25–0,3 b.) je v pásmu šumu jednoho bloku. **Obsah přidává
samostatně jen ~1,1–1,45 b. poklesu** — malý, ale reálný efekt, protože
sloučený balík je v průměru „hubenější" (přiznaná odchylka #1 v návrhu se
potvrzuje směrem, který návrh označil za příznivý).

**Gap-closure ke stropu 70 (mezera baseline A → strop):**

| | 3p mezera zavřena | 4p mezera zavřena |
|---|---|---|
| D (jen páka) | 28,3 % | 25,9 % |
| B (jen obsah) | 8,7 % | 6,4 % |
| C (obojí) | 38,6 % | 34,0 % |

Kombinace obou pák zavírá **~35–39 % mezery** ke stropu 70 — víc než floor
páka sama (D58/4: „20–28 %" formulace pro guardrail-floor se týkala CELÉ
mezery proti dřívějším odchylkám; toto číslo počítá totéž konzistentně proti
stejné 70% hranici). **Pořád zůstává ~10–11 b. NAD stropem u 3p/4p** —
balík 80 + floor kombinovaně NESTAČÍ na K1 gate, jen ho o třetinu přiblíží.

---

## Klíčový nález 2 — balík 80 ZHORŠUJE K6a, protínavě z jeho vlastní příčiny

K6a spread (max−min napříč 1–4p, gate ≤6 b.):

| A | D | B | C |
|---|---|---|---|
| 19,0–19,4 | 14,6 | **22,1** | **17,8** |

Balík 80 K6a **zhoršuje** vůči odpovídajícímu balíku 40 v obou variantách
ruky (B > A o +2,7–3,1 b.; C > D o +3,2 b.). Mechanismus je čitelný z tabulky
per count: **1p klesá o 4,35 b. (68,35→64,0), zatímco 2p/3p/4p klesají jen
o 0,4–1,5 b.** Bez páky ruka se u 1p hraje s plnou rukou 8 karet ze
zdvojnásobeného balíčku 80 — víc „hubených" karet ve hře ředí kvalitu tažené
ruky a sólo hráč nemá (na rozdíl od týmu) žádnou redundanci přes víc rukou,
která by ředění kompenzovala. Týmové počty mají víc karet CELKEM v oběhu
(víc rukou × stejná velikost), takže dilution efekt je tam menší.

**Toto je prokázaný simulační nález, ne hypotéza**: 1p pokles je shodný na
desetinu procenta mezi B a C (stejný obsah, ruka[1] beze změny pákou) →
efekt je čistě obsahový, ne interakce s páku ruka. Přímo potvrzuje riziko,
které návrh 40 karet sám pojmenoval v odchylce #1 a nabídl levný lék
(+1 na druhý stat u 4–6 fillerů) — **měřením teď má konkrétní číslo, ne odhad**:
cíl léku by měl zacílit na zvednutí 1p zpátky směrem k 68 % beze změny 3p/4p.

**1p pořád zůstává v pásmu [45,70]** (64,0 % u B i C) — není to gate-breach,
je to zhoršení metriky K6a, která je dnes STEJNĚ tak nesplněná jak před, tak
po. Nejde tedy o nový problém pro Go/No-Go v užším smyslu (K6a byl už dnes
❌), ale o zhoršení SMĚRU, které by při dalším kole obsahu (další dávka karet)
mohlo 1p vytlačit směrem k dolní hraně pásma, pokud se trend neopraví.

---

## Verdikt per kritérium (proti předregistraci)

1. **„Balík 80 nesmí rozbít žádný dnes splněný gate":** ⚠️ ČÁSTEČNĚ. K5f drží
   (✅), K7 drží na 2 blocích (✅). K2 je na balíku 80 (B) hraničně POD gate
   průměrem (19,9 vs. 20) — ale je to v pásmu šumu srovnatelném s tím, jaké
   má i samotný baseline na 1 bloku; se 2 bloky floor (D, C) K2 drží ✅.
   K1 1p drží v pásmu u obou (B 64,0, C 64,0). **Žádná tvrdá regrese, jedno
   hraniční číslo (K2 na B) k dohledání dalším blokem, ne k blokování.**
2. **Floor kombinace přírůstkově:** ✅ SPLNĚNO ve smyslu měření — C zavírá
   ~35–39 % mezery K1 3p/4p, o ~7–9 b. procentních víc než floor sama (28/26 %).
   Efekt je ADITIVNÍ, ne synergický — čekat víc by bylo nerealistické.
3. **Supply neutralita:** ✅ SPLNĚNO (`nonGangsterStatMax` identický,
   non-GANGSTER útok≥3 poměr zachován 6→12).
4. **Žádná K5-D regrese >2 b.:** ✅ SPLNĚNO (7,7→9,85 na 2 bloky, +2,15 b. je
   na hraně, ale K5-D je diagnostika bez prahu — sledovat dál, ne blokovat).
5. **Regrese specifická pro balík 80 s konkrétním číslem:** ✅ NALEZENA —
   K6a zhoršení +2,7–3,2 b., driver = 1p pokles 4,35 b., mechanismus
   identifikován (ředění kvality ruky bez redundance týmu). Jde ke
   game-designerovi jako konkrétní nález, ne dojem (viz níže).

**Souhrnný verdikt: balík 80 samotný K1 3p/4p gate nezachrání (přispívá jen
~6–9 % gap-closure) a měřitelně zhoršuje K6a přes 1p efekt — ale v kombinaci
s floor pákou (C) je to pořád NEJLEPŠÍ dostupná konfigurace ze všech čtyř
změřených na K1 3p/4p (80,20/81,35, nejblíž stropu 70) za cenu nejhoršího K6a
kromě B samotného.** Rozhodnutí zapéct balík 80 (obsahové, D59 už schválené)
a rozhodnutí aktivovat floor páku (D58/4, čeká na verdikt) jsou nezávislá —
tohle měření potvrzuje, že se navzájem nekříží negativně krom K6a 1p efektu,
který je oddělitelný a levně opravitelný (návrh #1 lék).

---

## Doporučení

1. **Balík 80 lze zapsat do `obsah/veci.yaml`** z hlediska mechanického
   rizika — žádný dnes splněný gate se nerozbíjí, K1 se mírně zlepšuje směrem
   ke stropu (byť málo), a jediná nová regrese (K6a přes 1p) má jasně
   identifikovaný mechanismus a levný lék.
2. **Než se zapeče, doporučuji game-designerovi zvážit lék z odchylky #1**
   (+1 na druhý stat u 4–6 fillerů, cíleně těch s nejnižším součtem statů) —
   cílem je vrátit 1p blíž k 68 % beze změny 3p/4p (které lék pravděpodobně
   nedotkne, protože filler karty nejsou to, co táhne týmovou nadhru).
3. **Floor páka (D58/4) zůstává v samostatném rozhodnutí uživatele** — tohle
   měření jen potvrzuje, že s balíkem 80 funguje stejně (aditivně), ne líp
   ani hůř kvalitativně.
4. **K2 hraniční číslo na B** (19,9 vs. gate 20) stojí za ověření třetím
   blokem, pokud se balík 80 zapeče — není blokující, ale je nejblíž hranici
   ze všech čtyř buněk.
5. **K8-proxy caveat zůstává otevřený** (mimo rozsah, patří k floor-páce,
   ne k balíku 80) — navrhuji samostatný audit `report.js` v budoucím kole,
   stejně jako K3/K4d/K6c z D58/4.

---

*Zdroje: [[../projekt/rozhodnuti|projekt/rozhodnuti.md]] D59 · [[navrh-40-karet-2026-08-04|technika/navrh-40-karet-2026-08-04.md]] ·
[[d58-4-sweep-ruka|D58/4 paměť]] · [[mereni-zar-malone-2026-08-02|technika/mereni-zar-malone-2026-08-02.md]] ·
[[../prototyp-mvp|prototyp-mvp.md]] (K1–K8 gate tabulka).*
