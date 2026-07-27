# Log rozhodnutí

*Append-only. Nové rozhodnutí přidávej nahoru s datem a důvodem. Nemaž — když se
rozhodnutí přehodnotí, přidej nový záznam, který na starý odkazuje.*

*Archivační strop: když log přesáhne ~200 řádků, přesuň nejstarší záznamy (nechej
aktuální a předchozí fázi) do `projekt/archiv/rozhodnuti-archiv.md` a nahoře nech
ukazatel na archiv.*

**Archiv:** uzavřená v2 fáze (2026-07-22, D1–D13 + založení týmu, konvencí a
architektury) je v [[archiv/rozhodnuti-archiv|projekt/archiv/rozhodnuti-archiv.md]]
(přesunuto 2026-07-24).

## 2026-07-27

- **D28 schváleno — V1: K7 se rozděluje na DiD-pojistku a novou K4d; znění brány
  ZAPEČENO do `prototyp-mvp.md`.** Uživatel po eskalaci D27 zvolil variantu V1.
  Konkrétně: (a) **K7 (3′)** = `mezera(s gamblem) − mezera(bez gamblu) ≥ −3 b.`
  per počet hráčů — tedy **rozdíl rozdílů**, ne hladina; hlídá přesně to, kvůli
  čemu pojistka vznikla („gamble nesmí stlačit commit-rozhodnutí"), baseline
  −0,2 / +1,0 ✅. (b) Nová **K4d** (learnabilita commit osy, patří k rodině K4,
  ne pod gamble): `kompetentní − náhodný ≥ τ` ∧ `memorizační − kompetentní ≤ 3 b.`
  ∧ **monotonie fidelity**. (c) **τ = perceptibilní konstanta projektu = 6 b.**,
  **sdílená s K6a**, kde slouží jako STROP — zjemnit K4d tedy znamená zpřísnit
  K6a a naopak, takže se práh nedá ohnout, aby prošel. Baseline K4d: 9,1 ✅ /
  −4,8 ✅ / monotonie ✅, ale **3p jen 7,9 b.** (1,9 b. nad prahem) — není to
  komfortní pass a 3p zůstává na watchlistu. Starý gate „≥12 b." se tímto ruší
  jako mis-specifikovaný (viz D27e), **ne jako sleva**: nahrazuje ho pojistka,
  která měří hypotézu, a floor odvozený z konstanty s opačným směrem.
  **Zapečeno současně** (D26 v plném rozsahu + D28): K1 per-count, K2 drift,
  K4c s varováním o přenositelnosti prahu, K5 = varianta D s prahem
  **expDead ≤ 10 %** (derivace: ~5 běžných uzlů na run → „nejvýš 0,5 mrtvého
  rozhodnutí na run"; baseline 13,1 % NEPLNÍ), K5f, K6a ≤6 b. (doloženo nad
  šumem), scope K5/K7/K4d jen na běžné uzly, change-control K1 s povinným
  kontrafaktuálním whole-gate artefaktem. Consistency-check proběhl:
  mechaniky/čísla/odkazy/rozsah **beze nálezu**; dva drobné terminologické
  nálezy („hedge" je anglicismus bez protějšku v design-dokumentu; K5 se dala
  splést s „nevyhnutelně špatným slotem" dle §4.3 — druhý opraven přímo
  v zapékaném textu). **Brána je nyní poctivě NESPLNĚNÁ v 5 bodech** (K2 drift
  1,14 · K1 3p/4p · K6a 11,8 · K5-D 13,1 % · K5f 3p Brody 81,6) — to je vstupní
  zadání kroků P2/P3/P1, ne vada brány.

- **D27 (ZJIŠTĚNÍ, ne rozhodnutí) — podmínka platnosti 0(c) kalibrace-4 NEPROŠLA;
  kalibrace zastavena a eskalována uživateli.** Mandát re-měřicí session zněl:
  „gate ≥12 b.; pokud <12, reframe K7 padá a ‚cena gamblu' se vrací uživateli
  jako P-rozhodnutí; dál nepokračuj bez eskalace." **Naměřeno 9,1 b.**
  (kompetentní commit) / **10,3 b.** (optimální commit, fidelita 1,0), obojí
  s gamble-politikou, 8000 runů na variantu. Kroky 1–5 mandátu (zapečení znění,
  P2, P3, P1, re-měření) proto **NEZAČALY**; `prototyp-mvp.md` i `obsah/` jsou
  netknuté. Gate se **tiše nesnížil** a K7 se neprohlašuje za splněnou.
  Doprovodná zjištění, která mění výklad: (a) obava, kvůli které gate vznikl
  („gamble trivializuje commit"), je **vyvrácena** — DiD ≈ 0 (−0,2 / +1,0 b.);
  (b) „cena gamblu" je jako lék **aritmeticky vyloučená** — i v limitu nekonečně
  drahého gamblu (běh bez gamblu) je mezera 8,1–10,5 b., pořád pod 12;
  (c) commit-osa **nedegeneruje** na lookup tabulku (memorizační commit je
  o 4,8 b. HORŠÍ než čtení telegrafu — analog vázající půlky K4c prochází);
  (d) strop ~10,3 b. **není bug bota** — sweep fidelity telegrafu je agregátně
  monotónní (61,6 → 64,5 → 67,0 → 68,2), přínos dokonalého čtení je +5,1 b.
  u 1p a ≈0 u 2–4p (**saturace pokrytím** — designový nález na watchlist lidské
  brány); (e) design-critic označil **vlastní** podmínku ≥12 b. za
  mis-specifikovanou: práh je import z K4c, kde nikdy nevázal (naměřeno 64,7 b.
  proti prahu 12), a vázající půlka K4c (`memorizační − kompetentní ≤3 b.`) se
  přitom zahodila; navíc se testovala HLADINA, ač hypotéza byla o rozdílu
  rozdílů. Varianty k rozhodnutí (V1–V4, doporučení V1 = rozdělit na K7 (3′)
  DiD ≥ −3 b. a novou K4d s prahem odvozeným z perceptibilní konstanty τ) jsou
  v [[../technika/kalibrace-4-2026-07-27|technika/kalibrace-4-2026-07-27.md]] §6.
  **Míč u uživatele.**

- **Hotovo bez blokace (podmínky 0a, 0b, 0d + doměření):**
  (a) `sim/report.js` **formalizován** (ADR-010, nová událost `assign_context`,
  137 testů; rozpady per-situace/per-slot/common-vs-finále, K5 tři varianty,
  K7 klasifikace, K5f, K2 drift, K1 per-count, K6a variance; každé číslo nese
  `definice`). (b) **Dvojí měřicí cut vysvětlen:** K5 17,3 vs. 18,4 = post- vs.
  pre-gamble čtení `max_achievable_zasahy` (engine ho počítá až nad commitem
  PO gamblu — kdo ho četl jako pre-gamble, měřil něco jiného, než tvrdil);
  K5f 68,8 odpovídá kanonickému 1p 69,6, ale **76,6 se nepodařilo zreprodukovat**
  žádnou legitimní definicí při 1p (nejblíž je 2p 77,4 — pravděpodobná záměna
  počtu hráčů v ad-hoc skriptu; hypotéza, ne důkaz). (d) **K5 varianta D
  změřena:** `expDead` 13,1 % (Malone 14,5–20,9 vs. Brody 6,6–11,8), návrh
  prahu **≤10 %** odvozený z délky runu („nejvýš 0,5 mrtvého rozhodnutí na run"),
  baseline ho NEPLNÍ a vázající je Malone → hlavní páka je P2. Navíc:
  **K6a run-to-run variance** 8 bloků × 1000 seedů → sd spreadu 1,61 b.,
  **2sd = 3,22 < 6**, takže práh K6a ≤6 b. je nad šumem (podmínka kritika
  splněna). Kanonický baseline: K1 1p 59,1 / 2p 67,4 / 3p 70,7 / 4p 70,9,
  K6a 11,8, K2 drift 1,14, K5f 3p Brody 81,6 (breach horní hrany).

- **D26 schváleno — balík nového znění simulační brány Fáze 0 (body 1–8,
  K5 = varianta D).** Uživatel schválil
  [[../technika/kalibrace-4-brana-navrh-2026-07-27|technika/kalibrace-4-brana-navrh-2026-07-27.md]]
  v plném rozsahu: (1) **K5 varianta D** — „mříž mrtvých rozhodnutí": podíl
  uzlů, kde `max≤1` platí PŘED gamblem i PO gamblu (realistická gamble-politika,
  ne best-case; práh doměří re-měřicí session); free-pass definice nulovaných
  slotů součástí, stará metrika `max≤1` zůstává diagnostika. Kontext: doslovné
  P0a z D25 je měřením no-op a gate <5 % nedosažitelný žádnou redefinicí —
  D26 tímto v bodě K5 nahrazuje D25a. (2) scope K5/K7 na běžné uzly + **K5f**
  přežití konfrontace 60–80 % per count × pronásledovatel ∧ ≥90 % proher ve
  finále; (3) **K7 reframe** (take_vynucený ≥80 % ∧ podíl vynucených uzlů
  ≤15 % ∧ learnabilita ≥12 b. ∧ EV<0 při est≥3; zvolený take 30–50 % jen
  diagnostika) — PODMÍNĚNO doměřením learnability jako prvním krokem, při
  <12 b. reframe padá a „cena gamblu" se vrací jako P-rozhodnutí;
  (4) potvrzeno zamítnutí „ceny gamblu" (vize §4.4); (5) **K2 = drift
  PRŮŠVIH-rate ≥1,3 ∧ floor pozdní ≥20 %** (baseline 1,16 neplní — zpřísnění,
  snowball se musí vyrobit; ratifikuje D22f(1)); (6) **K1 per-count ∈[45,70]
  ∧ K6a ≤6 b.** (zpřísnění, operacionalizace P1/D25d); (7) dělba K1 podle
  páky + povinný kontrafaktuální whole-gate artefakt před každým zapečením
  (nahrazuje D22e „výhradně engine"); (8) ratifikace zbytku D22f: obrana-skryté
  sloty = „levný naslepo-slot + přeliv pokrytím" (potvrzeno falzifikací
  kalibrace-3), pool-odchylka brody.lecka (prilis-na-rane) potvrzena.
  Verdikt kritika (schválit rámec, nic nezapékat před doměřením learnability,
  prahu K5-D a sjednocením měřicích cutů) je součástí schválení — podmínky
  platnosti 0a–0d v části E balíku. *Provedení kalibrace-4 = samostatná
  re-měřicí session (prompt v části E).*

- **D25 schváleno — mandát kalibrace-4 (rozhodnutí uživatele, P0–P2 + P1).**
  Odpovědi na eskalaci z D24 (vždy doporučená varianta týmu):
  (a) **P0a — K5 bez mechanicky nulovaných slotů:** hodnota-sloty nulované
  Malonem (D20a) se do K5 nepočítají — jsou záměrnou strategickou překážkou
  známou od startu runu, ne vadou obsahu.
  (b) **P0b — scope K5/K7 jen na běžné uzly:** finálové střety (zátah, léčka,
  konfrontace) dostanou vlastní metriku tvrdosti (např. % přežití konfrontace) —
  vynucený risk ve finále je klimax, ne vada. Návrh metriky předloží tým.
  (c) **P0c — strop K7 ≤ 20 % v revizi:** tým předloží novou definici s čísly
  (vynucené vs. zvolené gambly / strop odvozený z chování botů) ke schválení.
  Spolu s ní se předloží JEDNÍM balíkem i nové znění brány Fáze 0
  v `prototyp-mvp.md` vč. K2 ko-metriky „drift míry PRŮŠVIHŮ" (D22f(1),
  měřením kalibrace-3 podpořeno: 1.29–1.47×) — do schválení balíku platí
  stávající znění a nové metriky jsou diagnostika.
  (d) **P1 — obtížnost stejná bez ohledu na počet hráčů:** cíl = srovnat
  K1 napříč 1–4p (dnes 4p znatelně snazší — víc rukou, víc pokrytí). Interní
  dorovnání (tempo Žáru, severity postihů konfrontace, skryté sloty finále)
  je delegovaná kalibrace. **Budoucí úkol (backlog, teď neřešit):** volitelná
  obtížnost při startu runu.
  (e) **P2 — Malone: řešitelnost bez hodnota-slotu:** Malone dál nuluje hodnotu
  run-wide (identita, D20a potvrzeno), ale obsah zaručí, že každá situace jde
  slušně zvládnout i bez hodnota-slotu; dopočet pokrytí = delegovaná kalibrace
  (content-generator + sim). Zamítnuté alternativy: oslabení na −2 (rozmělňuje
  identitu), prohazování statů slotů (řeší symptom).
  (f) P3 (`improv_skryte`) a P4 (ruka 1p 8→9, až po P1) delegovány dle D24.
  *Kalibrace-4 je tímto odblokovaná.*

## 2026-07-26

- **D24 — kalibrace-3: NEZAPÉKAT, lék „snížit viditelné kotvy" měřením
  vyvrácen** *(rozhodnutí týmu v delegaci uživatele — plné kolečko
  game-designer → design-critic → playtest-facilitator)*. Hypotéza kalibrace-2
  („revert viditelných kotev běžných uzlů srazí K1 do pásma i uleví K5/K7")
  falzifikována kontrafaktuálním měřením přes `CONTENT_DIR` (1000×2, seedy
  1–1000, kopie obsahu ve scratchpadu — repo netknuto): (a) **SMĚR** — revert
  win-rate zvyšuje; návrh 12 slotů dal K1 3p/4p 72.5/72.9 (baseline 70.7/70.9),
  mandátové maximum 23 slotů 74.5/73.6, K4a oracle 80.4 (>80); (b) **DOSAH** —
  ani maximum nedá K5/K7 do brány (K5 ≥ 13.6 % vs. gate <5 %, K7 ≥ 40.5 % vs.
  ≤20 %) → žádná podmnožina mandátu gate nesplní; (c) **DRIVER** — per-slot
  atribuce: top drivery jsou hodnota-sloty kotvy 3 mechanicky nulované Malonem
  (oracle-miss 66–72 %, D20a) a finále (~50 % neřešitelnosti), obojí mimo
  mandát; premisa „viditelný improv-4 je řešitelný flex" vyvrácena (rovnocenný
  driver, miss 53–57 %). **Žádný revert se nezapéká, obsahové kotvy beze
  změny.** Vedlejší zisky: K2 ko-metrika drift PRŮŠVIH-rate uzel1–2→3–4 měřitelně
  roste (1.29–1.47×) — podporuje eskalaci D22f(1); K6a 7.5 u maxima potvrzuje,
  že rozpětí 1–4p je funkcí obtížnosti běžných uzlů. **Eskalace mandátu
  kalibrace-4 na uživatele (P0–P4, NEROZHODNUTO):** P0 redefinice K5/K7
  (bez mechanicky nulovaných slotů; scope common vs. finále; revize stropu K7),
  P1 K1 3p/4p přes finále/Žár + otázka škálování obtížnosti počtem hráčů,
  P2 hodnota-sloty pod Malonem, P3 signál `improv_skryte` (delegovatelné),
  P4 ruka 1p 8→9 až po P1 (delegovatelné). Detaily a čísla:
  [[../technika/kalibrace-3-2026-07-26|technika/kalibrace-3-2026-07-26.md]].
  Doprovodně (nález consistency-check): sync šumu ±1→±2 v `prototyp-mvp.md`
  a komentáři `obsah/situace.yaml` dle kalibrace-2 (žádná nová mechanika);
  golden snapshoty obnoveny kvůli změně otisku verzeObsahu.
- **D23 schváleno — monorepo: kódový repo sloučen do design repa jako
  `prototyp/`.** Rozhodnutí uživatele (plán
  [[../technika/migrace-monorepo-plan-2026-07-26|technika/migrace-monorepo-plan-2026-07-26.md]]
  schválen vč. doporučených voleb: podadresář `prototyp/`, GitHub repo
  prototypu archivovat, subtree se zachováním historie). Důvod: dvourepová
  režie (předávky, pin submodulu, dvě sessions na kalibrační iteraci) převážila
  přínos; jedno SHA = stav kódu i obsahu. Provedení: subtree merge (22 commitů
  historie zachováno), submodule `content/` zrušen, engine čte `obsah/` z kořene
  (`CONTENT_DIR` override zůstává), architektura **ADR-009** (+ ADR-005
  překonáno). Princip „obsah se z kódu needituje" je nově konvence (CLAUDE.md +
  review), ne strukturální zámek. Verifikace: 118/118 testů, sim smoke shodný
  s kalibrací-2, vite build + eslint čisté, dev server běží. Jediná kódová
  změna nad rámec cest: otisk `verzeObsahu` normalizuje CRLF→LF (otisk dřív
  závisel na line-ending konfiguraci checkoutu — golden snapshoty se lišily
  jen v otisku, mechanika bajt po bajtu shodná; snapshoty vědomě obnoveny).

## 2026-07-24

- **D22 — kořenový lék K5/K7/K2 po kalibraci-1** *(rozhodnutí týmu v delegaci
  uživatele — zapracování kalibrace-1; sporné body eskalovány, viz (f))*.
  Kontext: předávka enginu [[../technika/kalibrace-1-2026-07-24|technika/kalibrace-1-2026-07-24.md]],
  návrh game-designera, adversariální prověrka design-critica.
  (a) **45-slot kotva-patch zapečen** přesně dle předávky (`situace.yaml` 14
  situací + `pronasledovatele.yaml` malone.lecka / brody.lecka /
  brody.konfrontace): 45 viditelných slotů +1, všechny výsledné kotvy v pásmu
  2–4, skryté a už-tvrdé sloty nedotčeny. Komentář schématu KOMBI slotu upraven
  („nízká kotva 2–3" — farmar-stodola kombi jde patchem na 3).
  (b) **K7 skryté sloty — princip „odvoditelnost, nebo přeliv":** 10 utok-skrytých
  slotů PONECHÁNO (fikční podpis „kdyby přituhlo"; odvoditelné z verdiktu zbraně —
  druhá polovina léku je enginová derivace signálu, viz stav.md). 4 skryté
  obrana-kotvy sníženy 3→2 (most-prohnila-prkna, urednik-razitko, mesto-houkacky,
  brody.konfrontace) jako **dávkovatelný dial** — engine smí část vrátit, kdyby
  K1 podteklo; `zatah` záměrně zůstává 3 (leží v uzlech 3–4, drží K2);
  urednik-vaha už na 2 byla. 2 npc-pasti (urednik-vaha, urednik-razitko): verdikt
  zbraně v telegrafu implikoval skrytou zbraň, ale skrytý slot je obrana →
  přepsáno na „papír tu zmůže víc než olovo" (žádná implikace tasení) —
  nejcennější nález návrhu dle kritika; **podmíněno párovou opravou enginové
  derivace signálu**, jinak vzniká próza/signál drift (D19).
  (c) **K5 pokrytí balíku — 5 věcí +1 sekundární stat, žádná improvizace:**
  obrana 2→3 u rezervni-pneu, mosazny-boxer, knezsky-kolarek; nastroj 2→3
  u reznicky-hak, dedkuv-kabat. Pokrytí ≥3: obrana 9→12, nastroj 9→11,
  improvizace 13 NETKNUTA (watchlist D14 „univerzální flex"), hodnota 6 NETKNUTA
  (D21c: Malone strop 3/4 = záměr), tier ≥4 netknut (žádný power creep).
  (d) **K2 pozdní rampa obsahem:** pozdní události (Žár-spouštěné) naloženy
  informačními/zámkovými postihy, které degradují příští přiřazení (snowball
  smyčka), místo jednorázových ztrát: malone.lecka `[mlha-v-hlave,
  zvoneni-v-usich, prilis-na-rane]` + prusvih `otras-mozku`; brody.lecka (dřív
  čistě ztrátová = nesnowbalovala) `[mlha-v-hlave, prilis-na-rane,
  vysypana-bedna]`; zatah `[zvoneni-v-usich, prach-do-oci, prilis-na-rane]`;
  výměnou deputy-mytnice prusvih otras-mozku→zlomene-zebro (info-tezky se
  přesouvá z běžného poolu do pozdního). **Strop „žádný postih >7 poolů" (D20)
  DRŽEN** — původní čísla designera by šla na 8 (otras-mozku, mlha-v-hlave,
  po opravě i prach-do-oci), zapracována cap-safe varianta vč. odchylky
  content-generatora u brody.lecka (prilis-na-rane místo prach-do-oci), PM
  schválil. Finální maxima: prach/mlha/zvoneni/prilis 7, otras 6, zebro 6.
  Taxonomie 70/30 a cap 2 (D15) beze změny.
  (e) **Verdikt kritika přijat: tohle NENÍ uzavřený lék, ale vstup do společného
  re-měření.** KRITICKÉ riziko K1/K5 coupling: tři současná změkčení zvednou
  win-rate → engine drží K1 zvedáním VIDITELNÝCH kotev → K5 breach se reprodukuje
  na viditelné straně. Proto akceptační brána MUSÍ měřit K1∈[45,70] ∧ K5
  (odděleně viditelná/skrytá) ∧ K7≤20 % SOUČASNĚ; + per-situace take-rate
  před/po (teze „obrana-skryté vynucují gamble" je neověřená — 3 z 8 už na kotvě
  2 byly a K7 stejně breachoval); + K6a v rozpadu dle typu postihu (info-postihy
  degradují u 1p/2p větší podíl informace než u 4p). **Hand-off:** po tomto
  zapečení drží K1 výhradně engine (viditelné kotvy + šum) — skryté sloty a balík
  se na K1 už neladí. Oprava čísla z předávky: skrytých slotů je **20**, ne 19
  (nadrazi-noc má dva — a zůstává nejtvrdší K5/K7 offender, 50 % naslepo).
  (f) **Eskalace k uživateli (NEPROVEDENO, čeká na potvrzení):** (1) ko-metrika
  K2 = drift míry PRŮŠVIHŮ uzel3–4 vs. uzel1–2 — cap 2 zastropovává počet
  postihů, počet nemusí být pravý signál snowballu; šlo by o změnu znění fixované
  brány K2 v `prototyp-mvp.md` → zatím jen jako DIAGNOSTIKA v reportu enginu,
  gate ≥1,3× beze změny. (2) Ratifikace posunu u obrana-skrytých slotů: z „stat
  skrytého slotu má být odvoditelný z telegrafu" na „levný naslepo-slot + přeliv
  pokrytím". (3) Potvrzení pool-odchylky brody.lecka (b/d výše).
- **Oprava poškozeného textu logu:** hlavička záznamu D20 (2026-07-23) byla
  dřívějším editem slepena s koncem D21 („…K1. — pronásledovatelé run-wide…");
  při archivaci obnovena na zjevný původní tvar „**D20 schváleno — …**". Obsah
  rozhodnutí nezměněn.

## 2026-07-23

- **D21 schváleno — fixace K1 a verdikty po diagnostickém run-1 (2000 runů,
  přestavěný v3 engine).** (a) **K1 pásmo FIXOVÁNO: 45–70 %** DORUČENO
  (kompetentní i cíle-driven, 4p reference) — kontinuita v2 struktury, run-1
  baseline 84,5–88 % → kalibrace stahuje. (b) **Náklad zůstává fail-condition,
  revize po kalibraci** — bedny-0 je dnes <1 % proher kompetentní hry, ale při
  stažení do pásma PRŮŠVIHů přibude; finální verdikt konsolidace až nad
  kalibrovanými čísly. (c) **Malone strop 3/4 v hodnota-situacích = záměr**
  (vědomá cena „úplatky neplatí" — nedosáhneš na LOOT, ne beznadějnost; K5
  breach jde za kotvami, spraví kalibrace). (d) Upřesnění K4a: měří
  implementovatelné heuristiky, oracle (vševědoucí strop) do ní nepatří.
  (e) Bot-artefakty k opravě v simu: cíle-bot se neodchyluje za cíli (čísla
  identická s kompetentním), gamble se nikdy nebere (K7 + cíl hazarder
  neměřitelné) — opravit před kalibrací. Run-1 pozitiva: parita 1–4p ≤3,6 b.,
  learnabilita 83 b., memorizace −5,3, první Zátah uzel 4. Kalibrační cíle:
  K2 snowball (0,96/1,14 → ≥1,3), K5 beznadějné (11,7/5,7 % → <5 %), K1.
- **D20 schváleno — pronásledovatelé run-wide + opravy obsahu dle prověrky.**
  (a) **Malone nuluje hodnotu RUN-WIDE** (rozhodnutí uživatele) — dokud je
  aktivním pronásledovatelem, všechny hodnota-sloty čtou hodnotu věci jako 0;
  původní znění bylo no-op (jeho uzly hodnota-slot nemají). (b) **Brody
  run-wide analogicky** (GANGSTER +2 Žár celý run) — PM přijetí: odpovídá
  design §4.9 („reaguje na hlučnost dvojnásob") i v2 precedentu; uživatel má
  veto. (c) Opravy dle auditu: GANGSTER chování per typ situace strojově
  v stitky.yaml (npc/lecka = viditelná role selže; lokace/zatah/konfrontace =
  pass), hodnota supply trim 8→6 + záložní staty u h5 specialistů, postihové
  pooly vyrovnány (zlomene-zebro 10→5, žádný postih >7 poolů), kotvy 19×2 /
  53×3 / 4×4, všech 19 telegrafů sjednoceno na plný QA invariant (trend všech
  viditelných statů + počet skrytých + zbraň-verdikt). Vše zvalidováno js-yaml.
- **D19 schváleno — kritéria v3 brány, finalizace schémat a model lízání.**
  (a) **Náklad i Žár zůstávají obě fail-conditions v MVP** — diagnostika 1. běhu
  (rozpad příčin proher bedny-0 vs. konfrontace) rozhodne o případné konsolidaci
  nad daty. (b) **Kombinovaný slot = „oba staty ≥ kotva"** (fikce: potřebuješ
  nářadí I důvtip), používat střídmě s nízkou kotvou; **kotvy jen 2–4** (práh 0
  zakázán — žádný auto-pass slot ani coin-flip na spodku). (c) **Model lízání:
  sdílený standardní balík** (~40, odhaz, reshuffle; líznutá věc patří lízajícímu);
  **meta-progres = osobní loadout** (hráč si ze své sbírky bere ~2 prémiové věci
  do startovní ruky — per hráč, neředí se sdíleným balíkem; post-MVP); **custom
  karty ostatních sytí truhly** přes globální fond. Řeší námitku „stačí jeden
  progresnutý hráč". (d) **Zbytek balíku schválen dle doporučení kritika:**
  metodologie brány (provizorní pásmo K1 + diagnostický run-1, pásmo se fixuje
  po run-1; kalibrace jádro→postihy→Žár→ekonomika→ruce→gamble/cíle + smoke-test
  co-op inverze na startu), verdikty K4c gate (svázaná s noise-modelem),
  K5 gate jen „<5 % beznadějných", K6a+K6c-run gate / K6b diagnostika;
  **telegraf_signal derivuje engine ze slotů** (próza = lidský rendering, QA
  invariant věrnosti; fidelita telegrafu = sweep knob brány); **v3 event-log spec
  vlastní technical-developer** (nahradí §2.2, jeden log pro gate-metriky,
  podminky cílů i max_achievable_band); enum postihů: škrtnut hide_nazvy,
  lock_stat/lock_slot_viditelnost dodefinovat nebo škrtnout, kontrola asymetrie
  malých rukou, zvážit lock_gamble; GANGSTER hustota = sweep parametr; gamble
  pravděpodobnost per počet hráčů (kanonické „1/3" platí jen pro 3p ne-držitele,
  jinde 1/2 — opravit v kanonu); mista.yaml dopracovat; event „1 ze 3" sim-inertní.
- **D18 schváleno — UX vize v3 (interakční model závazný, grafika otevřená).**
  Pohled očima vyšetřovatele: střed ~60 % = papír ve stroji (jen texty; strana
  na uzel + úvod + závěr s razítkem), klávesnice pod hranou obrazovky. Veškerá
  interakce v **zápisníku vyšetřovatele** (pop-up zespoda, ruční písmo): vlevo
  profil hráče (jméno z profilu reálného hráče — i na okraji spisu), kondice,
  postihy, bedny, polaroid lokace; vpravo telegraf + 4 lístky zabavených věcí
  (výběr = štítek EVIDENCE, prémiové s hvězdičkou). Hot-seat = barevné záložky
  se jmény (max 10 znaků); přiřazování = lístky × nedoplněná pole; online =
  hlasování 20 s/pole, poslední bez hlasování. Složka EVIDENCE animací založí
  lístky, stroj cvaká výsledek; loot lístky do zápisníku (grafika loot momentu
  otevřená). Mapa = otrhaný papír zespoda, křížek volby, dramatický nápis
  lokace na černé; šerif na trati = Žár. Meta-progrese konsolidována do §5
  design dokumentu (statistiky profilu, odemykání prémiových, custom skladač,
  odemykání světů).
- **D17 schváleno — finální commit model (oprava nepochopení; ruší poolový commit
  z revize).** Tým commituje po telegrafu **přesně 4 karty** (= počet slotů;
  1p volí 4, 2p po 2, 3p 2+1+1 s rotujícím držitelem mapy, 4p po 1) a po
  odhalení textu se VŠECHNY rozdělí do slotů — nic se nevrací, jádro hry je
  **„rozděl co nejméně špatně"**; nevyhnutelně špatná volba u některého slotu
  je záměrná komedie, ne chyba. **Gamble** = záchrana po odhalení: 1× za
  situaci tým vybere ČÍ ruka a lízne z ní NÁHODNĚ (1/3); vytažená karta se
  povinně použije náhradou za commitnutou (ta se odhazuje). Důsledky: pasažér
  neexistuje z definice, stakeless commit neexistuje, trivializace poolu
  odpadá. Sim priority: vyrovnání velikostí rukou mezi počty hráčů, EV gamble,
  frekvence „nevyhnutelně špatného slotu" (koření, ne norma). **Pivot v3
  uživatelem schválen** („zbytek schvaluji") — po zapracování D17 se v3 klopí
  do kanonu (design-dokument + prototyp-mvp současně + consistency-check).
- **D16 schváleno — rozsah MVP v3 a škálování počtu hráčů (po kritice návrhu).**
  (1) **Kreditová ekonomika ZŮSTÁVÁ v MVP** (uživatel přehlasoval doporučení
  kritika oddělit ji do 2. přírůstku) — podmíněno opravami: aritmetika příjmů
  konzistentní, free-cleanse složením nesmí být levnější než léčení, dostupnost
  motelu nesmí odporovat pravidlu „motel nesmí být vzácný". (2) **Tajné cíle
  ZŮSTÁVAJÍ v MVP** (uživatel přehlasoval pevné doporučení kritika odložit) —
  přijaté riziko: druhý skrytý systém přes skryté prahy; vysvětlující vrstva
  (B1) je musí pokrývat také. (3) **Škálování 1–4p: srovnat páku i hádku** —
  víc hráčů nesmí znamenat horší informaci ani tenčí hádku o přiřazení; přesná
  čísla rukou/commitů doladí simulace. Craft-opravy kritiky (vysvětlující
  vrstva jako first-class položka MVP, oprava free-cleanse, ikony viditelnosti
  slotů + telegraf proti-srsti, gamble u 3p bez povinné daně, anotace delty
  Žáru) zadány designérovi bez dalšího schvalování. *Kontext: audit v paměti
  design-critica, návrh projekt/navrh-v3.md.*
- **D15 schváleno — mantinely v3 (slotová resoluce): TOP 3 rozhodnutí + learnabilita
  prahů.** (1) Commit: **naslepo dle telegrafu** (stejný režim pro všechny počty
  hráčů), **tým přiřazuje karty do slotů volně** (vlastník karty musí souhlasit —
  drží vlastnictví postavy i jednotnou hru 1–4p), prahy klíčují na **1 stat
  s výjimkami** u speciálních slotů. (2) Postihy: **plná taxonomie**
  informační/zámkové/ztrátové (ztrátové střídmě), **dva tiery ~70/30** (lehké
  dočasné samy vyprší; těžké trvalé do vyléčení v motelu), **cap 2 aktivní na
  hráče + eskalace** (třetí = postava „složená" kolo–dvě, pak očištěná).
  (3) Prémiové karty: **meta-progrese** (odemykání do sbírky pro příští runy;
  in-run jen výjimečně truhla/event 1–2×), **specializace + výrazný efekt místo
  vyšší síly** (mění varianci, ne průměr — žádný power creep). Prahy jsou
  **kotva ± šum** (typ situace má naučitelný trend, instance ±1 — mistrovství
  roste, memorizace nefunguje, win-rate pásmo brány zůstává smysluplné).
  *Kontext: balanční posudek `technika/balanc-posudek-v3-2026-07-23.md`.
  Samotný pivot na v3 se stvrzuje až schválením design dokumentu v3.*

*(Starší záznamy — 2026-07-22, v2 fáze — viz archiv v hlavičce.)*
