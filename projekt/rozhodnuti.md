# Log rozhodnutí

*Append-only. Nové rozhodnutí přidávej nahoru s datem a důvodem. Nemaž — když se
rozhodnutí přehodnotí, přidej nový záznam, který na starý odkazuje.*

*Archivační strop: když log přesáhne ~200 řádků, přesuň nejstarší záznamy (nechej
aktuální a předchozí fázi) do `projekt/archiv/rozhodnuti-archiv.md` a nahoře nech
ukazatel na archiv.*

**Archiv:** uzavřená v2 fáze (2026-07-22, D1–D13 + založení týmu, konvencí a
architektury) je v [[archiv/rozhodnuti-archiv|projekt/archiv/rozhodnuti-archiv.md]]
(přesunuto 2026-07-24).

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
