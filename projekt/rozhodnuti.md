# Log rozhodnutí

*Append-only. Nové rozhodnutí přidávej nahoru s datem a důvodem. Nemaž — když se
rozhodnutí přehodnotí, přidej nový záznam, který na starý odkazuje.*

*Archivační strop: když log přesáhne ~200 řádků, přesuň nejstarší záznamy (nechej
aktuální a předchozí fázi) do `projekt/archiv/rozhodnuti-archiv.md` a nahoře nech
ukazatel na archiv.*

**Archiv:** uzavřená v2 fáze (2026-07-22, D1–D13 + založení týmu, konvencí a
architektury) je v [[archiv/rozhodnuti-archiv|projekt/archiv/rozhodnuti-archiv.md]]
(přesunuto 2026-07-24).

## 2026-07-30

- **D53 (ROZHODNUTÍ UŽIVATELE) — verdikt WoZ testu: kreativní interpretace
  („AI jako GM") vyhrává; mandát AI vrstvy pro fázi 3 potvrzen.** Uživatel po
  slepém čtení (technika/woz-test-2026-07-30.md): rozšířené verze s kreativní
  interpretací „výrazně lepší" — „to bylo částečně to, co mě trápilo, nyní je
  to lepší." Výhrada: model má občas problém s češtinou a významem slov →
  (a) dolaďování promptem, (b) **kvalita češtiny se stává explicitním
  kritériem volby LLM poskytovatele** (testovat baterií humor-testéra per
  kandidát, ne rozhodovat od stolu). Poznámka do prompt-kola fáze 3: testér
  doporučil B-lite (invence jen u selhaných/nesedících slotů), uživatel četl
  plné B jako výrazně lepší — rozhodne se v prompt-kole s oběma data-pointy.
  Největší produktová sázka projektu je tímto poprvé podložená pozitivním
  lidským testem.
- **D52 (ROZHODNUTÍ UŽIVATELE) — dokončení telegrafů agentním kolem po zvednutí
  limitu (ne PM v zastoupení); hranice A = urgence; kolo separability se otevírá.**
  Kontext: směrový test dal 15/19 (report §5.5) a předregistrované pravidlo
  zastavilo zapečení; současně účet narazil na měsíční limit útraty, takže
  agentní kola dočasně selhávají. (1) **Telegrafy:** 4 neprošlé věty
  (`deputy-hlidka`, `nadrazi-vypravci`, `zatah`, `malone-lecka` — operátory
  výhradnosti) opraví krátké agentní kolo (designer opraví, kritik znovu pustí
  směrový test, pak zapečení dle blokátoru: sada + invariant + oprava kanonu
  v jednom commitu) **až po zvednutí limitu** — uživatel odmítl PM zastoupení,
  procesní čistota má přednost před rychlostí. (2) **Hraniční otázka figury
  „cesta ven se zavírá":** drží se kritikova interpretace (urgence, texty
  procházejí); přísnost hranice rozhodnou data zakrývací zkoušky, ne
  interpretační spor. (3) **Separabilita slotů (Denisa P0/#1):** kolo se
  otevírá po zvednutí limitu, ve frontě ZA telegrafy — mandát: game-designer
  navrhne jednu mezislotovou vazbu (favorit sdílený rozpočet → Žár),
  kontrafaktuální měření, prověrka kritika, schvaluje uživatel. Změna mechaniky
  → před případnou další kalibrací, ne po ní.
- **D51 (ROZHODNUTÍ UŽIVATELE) — únik prahů se opravuje dle kanonu, telegrafy
  jdou do škrtacího kola, fallback se rozhodne po WoZ čtení.** Podklad:
  konceptové kolo [[../technika/koncept-kreativita-navrh-2026-07-30|technika/koncept-kreativita-navrh-2026-07-30.md]]
  + PM verifikace úniku (assign.js:243 vs. design ř. 165/295 vs. bot).
  (1) **Prahy:** při rozdělování jen kotva/trend, přesný práh až s razítkem při
  vyhodnocení — řádek katalogu §5 návrhu 2.1 (situation_revealed s rozkladem
  prahu) se TÍMTO MĚNÍ (D51 přebíjí D36 v tomto bodě; vada prošla PM review,
  přiznáno). (2) **Telegrafy:** škrtací kolo hned — revize invariantu (škrt
  kanálu POKRYTÍ, cíl „3 položky na ~320 znacích s víc obrazem") → přepis →
  zakrývací zkouška až na výsledku. (3) **Fallback (rovnocenný vs. přiznaně
  chudší):** odloženo do slepého čtení WoZ testu uživatelem. Poznámky:
  kontrolní rameno WoZ už existuje (režim A = kanonický prompt, týž model);
  otázka „zná bot prahy při přiřazení?" zodpovězena PM (nezná — jen oracle),
  takže oprava úniku hru a měření srovnává, ne rozjíždí. Drobné consistency
  nálezy (mozek-operace v §4.10, obtížnost v MVP, jednotka délky telegrafu)
  se přibalují do škrtacího kola.

## 2026-07-29

- **D50 — UI: mechanický řádek telegrafu skryt, ulehčení a onboarding
  postaveny (zadání D47 + D48 splněno).** Řádek „co z toho plyne" už na commit
  obrazovce nesvítí; próza telegrafu je v default režimu jediný nositel
  informace, jak D47 rozhodlo. Pravidlo „kdy je řádek vidět" bydlí v novém
  čistém modulu `prototyp/src/ui/telegraf-rozbor.js` (13 testů), ne v těle
  renderu — je to pravidlo hry, ne kosmetika. Přepínač stojí na obrazovce
  setupu v **nové kolonce „Obtížnost"** a jmenuje se *Ulehčení: rozbor
  telegrafu na rozklik*, ne „zobrazení" (D48: se čtením naplno jde 4p win-rate
  na 86,8 %); kolonka je současně prázdný rám pro volitelnou obtížnost D25d.
  **Dva implementační kontrakty, které zadání nechalo otevřené a stavitel je
  rozhodl:** (1) **onboarding se spotřebuje jednou za relaci, ne za run** —
  kdo si dá druhý run, telegraf už číst umí a nedostane EASY první uzel
  zadarmo (žádná perzistence do `localStorage`: skrytý stav napříč sezeními by
  facilitátora playtestu mátl víc, než pomohl); (2) **rozklik se resetuje
  s každým commitem** — kdyby zůstal otevřený, ulehčení by splynulo se starým
  „řádek svítí pořád" a přepínač by nebyl přepínač, ale vypínač. Při zapnutém
  ulehčení onboarding jen otevře rozklik a **poznámku „vidíte to naposledy"
  nevydá** (lhala by — řádek zůstává k dispozici). Ověřeno v prohlížeči na
  všech pěti cestách, 308/308 testů, lint čistý. **Tím padá jediný blokátor
  sezení lidské brány** (PM review 2026-07-29: dokud řádek svítil na každém
  uzlu, sezení by testovalo EASY režim, ne přepis telegrafů z D49).

- **D49 — OBSAHOVÉ KOLO TELEGRAFŮ ZAPEČENO: nový invariant + 19 přepsaných
  telegrafů v `obsah/`.** Kolečko generátor → design-critic → protocol-humor-tester
  → opravné kolo → ověření PM. **Oba recenzenti se shodli:** sada je jasné
  zlepšení, ale první verze se zapéct nesměla — ne kvůli mechanice, ale kvůli
  čtenáři. Blokující byly: (1) táž konstrukce „A a B" znamenala v sadě tři různé
  věci (KOMBI slot / jeden slot se dvěma obrazy / dva různé sloty), takže
  pravidlo POKRYTÍ bylo splněné jen v autorském čtení; (2) skeleton „Jedna věc
  se rozhodne bez vás…" nesl **17 z 19** telegrafů, z toho 13× doslova celá věta
  — a je to věta nesoucí informaci o skrytých slotech; (3) `brody-konfrontace`
  si vymyslela „závoru s řetězem", která ve scéně není, takže odhalení by obraz
  **vyvrátilo**, ne potvrdilo. **Po opravném kole:** skeleton 17× → **0×**
  (skryté sloty ohlašují vidle, lucerna, ručička váhy, prázdné políčko,
  rozsvícené okno, zhasínající lampa, otočený reflektor, kámen z davu, dunící
  most), „vymyslíte až na místě" 10× → 1×, „dlaň" a „nemrknout" → 0×.
  **Ověření PM (ne důvěra):** derivovaný signál porovnán položku po položce pro
  všech 19 — verdikty zbraně, 10× skrytý útok, 1× skrytá improvizace, 1× slotová
  výjimka, `nadrazi-noc` se dvěma skrytými; **19/19 sedí**. Délky změřeny:
  max 379, min 302, průměr 338, **žádný přes strop 400**. Zákazaný meta-slovník
  se nevyskytuje. Testy **295/295 zelených**, lint čistý; golden snapshoty
  rebasovány — **jediný rozdíl v obou runech je `verzeObsahu`** (59f1ea48 →
  432cbc42), mechanika bit po bitu shodná.
  **Rozhodnutí uživatele:** (1) **zapéct teď, zakrývací zkouška až potom** —
  řádek invariantu se přeformuloval na to, co se opravdu stalo („zapečeno po
  autorském a recenzním checklistu; zakrývací zkouška je otevřená položka"),
  aby v hlavičce obsahu nevznikla mrtvá litera, kterou čte každý další autor;
  (2) **sloty s pohybem vozu do backlogu**, neopravovat teď — míchat je do
  zapečení telegrafů by rozmazalo, co se měří (precedent D42).
  **Zapečeno i:** dodatky invariantu z review (slovník nároků jsou **definice,
  ne znění** + strop 2 výskyty fráze v sadě · markér hranice nároku · dělicí
  čára humoru proti protokolu) a oprava `CLAUDE.md` §Stylová pravidla
  („1–2 věty" → 3–5 vět / max 400 zn.).
  **Rozhodnuto proti doporučení humor-testéra, na základě měření:** navrhoval
  sjednotit Brodyho připomínku na „každý výstřel přitáhne olovo dvojnásob".
  `pronasledovatele.yaml` ale říká `typ: stitek, cil: GANGSTER` — zdvojený Žár
  za každou gangsterskou kartu **včetně té ve skrytém slotu, kde se nestřílí**.
  „Výstřel" pravidlo zužuje, „olovo" ho překládá na zranění místo stopy.
  Sjednoceno opačně, na **„pozornost"**.
  **Generátor přiznal dva vlastní overreache** (obojí přijato): sáhl na
  schválenou ukázku `urednik-vaha`, protože porušovala nové pravidlo hranice
  nároku (past i „kusem gumy" zůstaly netknuté), a **odmítl tři ze sedmi
  návrhů humor-testéra** — „dveře ve zdi" by pojmenovaly skrytý nástrojový slot,
  „postraněk" a „údaj v knize" by nesly týž předmět jako viditelný nárok.
  V obou případech měl pravdu. `most-prohnila-prkna` zůstal **bit po bitu
  netknutý** jako referenční implementace invariantu.
- **D48 (ROZHODNUTÍ UŽIVATELE) — invariant telegrafu v2 schválen, obsahové kolo
  19 telegrafů OTEVŘENO.** Revize designéra po D47 odpověděla na všech šest
  blokujících nálezů kritika; verze 2 je v §10–§15
  [[../technika/telegraf-invariant-navrh-2026-07-29|technika/telegraf-invariant-navrh-2026-07-29.md]].
  **Podstata v2:** nové jádro **„nárok je sloveso, ne kulisa"** — scéna smí
  obsahovat úředníka, hlídače i zámek, kulisa neprozrazuje nic; kanál se obsadí
  teprve tím, že próza přiřkne POSÁDCE práci. Tím se rozpadá spor o leaky
  a nedisjunktní slovník obrazů (V-4/V-5) najednou. Doplněno pravidlo
  **záporného tvrzení** (stat lze vyloučit jen když není v žádném slotu ani
  skrytém — jinak anti-tell, který bot nemá) a **verdikt zbraně přepsán na
  mřížku o TOLERANCI místa, ne o užitečnosti** (staré znění by v konfrontacích,
  které jsou `vzdy_pass` s viditelným útok-slotem kotva 4, tvrdilo pravý opak
  toho, co scéna chce). Kanál 7 (`rusi`) přidán jen pro 4 telegrafy
  pronásledovatelů a klasifikován jako připomínka veřejného pravidla, ne
  fidelitní kanál. Scope creep vypuštěn (test v `prototyp/test/`, „obrazy
  v pořadí slotů", přepis 19 polí `text`).
  **PM ověřil:** sloty všech tří ukázek sedí (`most-prohnila-prkna` má skrytou
  `obrana` → vypuštění „Nikdo tu není" je správná oprava; `urednik-vaha` nemá
  `hodnota` v žádném slotu → zápor je legální; `nadrazi-noc` má skrytý `utok`
  → věta „kdo je rychlejší" je povinná). **Délky ale neseděly znovu:** změřeno
  336 / 363 / 385 zn. proti uváděným ~301 / ~330 / ~332 — tvrzení „6 kanálů se
  do 350 zn. vejde" doloženo nebylo. Poučení do kola: **každý telegraf se měří,
  ne odhaduje.**
  **Rozhodnutí uživatele:** (1) **strop 400 zn.** (ne 350), cíl ~350, rozpočet
  na uzel 670 zn. — předběžné číslo, potvrdí ho stopky na dalším sezení;
  (2) **onboarding: mechanický řádek viditelný na PRVNÍM uzlu prvního runu**,
  dál ne (nesahá na D47, přibírá se k zadání UI přepínače); (3) **obsahové kolo
  se otevírá**, druhá prověrka kritika před psaním se nekoná.
  **Nezapéká se zvlášť:** znění invariantu jde do hlavičky `obsah/situace.yaml`
  **až spolu s přepsanými telegrafy v jednom commitu** (jinak by v repu stálo
  pravidlo, které 15 sousedních záznamů porušuje); týž commit ponese opravu
  `CLAUDE.md` §Stylová pravidla („telegraf situace 1–2 věty").
  **Vedlejší nález s dopadem na UI:** při dokonalém čtení telegrafu (= řádek
  zapnutý) jde 4p win-rate na **86,8 %**. „Vysvětlivky zapnuté" tedy nejsou
  neutrální přístupnost, ale **EASY režim**, a tak se mají v UI jmenovat
  (kolonka volitelné obtížnosti, D25d). Zároveň z toho plyne, že přepis
  telegrafu **nemá K1 kam zhoršit směrem nahoru** — efektivní fidelita je po
  skrytí řádku shora omezená dneškem, takže brána na tuhle změnu je čistě
  lidská, ne simulační.
- **D47 (ROZHODNUTÍ UŽIVATELE) — telegraf: směr schválen, tři P-otázky
  rozhodnuty; invariant jde na revizi, obsahové kolo se ještě neotevírá.**
  Kolo mandátu D45 proběhlo (game-designer → design-critic, oba Opus), návrh
  i prověrka jsou v
  [[../technika/telegraf-invariant-navrh-2026-07-29|technika/telegraf-invariant-navrh-2026-07-29.md]].
  Do `obsah/` se nesáhlo.
  **Co kolo obrátilo naruby:** (a) kritikův nález K-1 — mechanický výčet všech
  6 kanálů plnými jmény statů **už v UI pod telegrafem je** (`commit.js:103–113`,
  `popisSignalu()`), takže próza nikdy nebyla jediný nositel informace a
  atmosférická inference byla vždy zrušena o řádek níž; (b) PM přeměřil K4d
  (`sim/learnability.js`, 1000×4×2): rezerva u 1p **není 0,4 b., ale 18,6 b.**
  proti τ = 6 — číslo z kalibrace-4 je po opravách bota (D35) mrtvé, náhodné
  rameno spadlo u 1p z 52,7 na 40,2. **Riziko přepisu je řádově menší, než
  návrh tvrdil, ZATO se obrátila jeho teze:** marginální hodnota dokonalého
  čtení telegrafu je dnes nejmenší u sóla (3,6 b.) a největší u 3p/4p
  (6,8–7,7), takže lepší telegraf by K6a **rozevřel**, ne zúžil. Přepis
  telegrafu je věc fikce a zábavnosti, **ne balanční lék** — a nesmí se tak
  prodávat.
  **Rozhodnutí uživatele:**
  (1) **Mechanický řádek „co z toho plyne" se nativně SKRÝVÁ**, ale v rozhraní
  nastavení hry půjde zapnout možnost si ho rozkliknout; výhledově je to
  kandidát na prvek odlišení obtížnosti (váže se na D25d volitelnou obtížnost).
  Důsledek: **próza se stává jediným nositelem informace v default režimu**,
  takže kritikovy fidelitní výhrady jsou živé a naměřená rezerva K4d 18,6 b.
  je to, co ten krok dělá únosným. Je to **změna proti čerstvě hotové 2.2**
  (D46 řádek jen vizuálně podřídila próze) → nová položka pro `prototyp/`.
  (2) **R1 = mlčet** — telegraf nadále nepojmenovává stat skrytého slotu nad
  rámec toho, co derivuje engine (`zbran_skryte`, `improv_skryte`); dnešní
  prozrazení u ~5 situací se v přepisu odstraní. Přiznaný úbytek proti dnešku,
  dopadá i na sólo.
  (3) **Zakrývací zkouška ZŮSTÁVÁ jako gate** (uživatel má 6+ naivních
  čtenářů) — ale její zadání se musí přepsat: v předložené podobě čtenáři
  leakuje počet slotů i jména statů (měřila by systematicky výš než realita)
  a práh 0,70 je kruhový (nikdy to nebyla naměřená lidská hodnota, jen zvolený
  sweep knob).
  **Nezapečeno, na revizi u designéra:** znění invariantu §2 (kritik má 6
  blokujících — všechny tři ukázky porušují vlastní invariant, slovník STOP
  STATŮ není disjunktní, délka podhodnocená ~o polovinu → strop 350 zn.,
  léčky/konfrontace nesou sedmý kanál `rusi` + konfrontace potřebují pátou
  variantu verdiktu zbraně, a scope creep ven: test v `prototyp/test/`,
  „obrazy v pořadí slotů", rozšíření na pole `text`).
  **Samostatně, nezávisle na osudu invariantu:** `design-dokument.md:107–108`
  a `prototyp-mvp.md:91–93` vedou telegraf jako **3 kanály**, engine jich
  derivuje **6** (`zbran_skryte` z D22, `improv_skryte` z D25f) — oprava
  kanonu. A `prototyp-mvp.md:33` cituje jako nejhorší per-count K4d **7,9**,
  což je číslo z ramene `optimal`, ač gate stojí na rameni `kompetentní`.
- **D46 — fáze 2.2 postavena a hotová; zapečen kontrakt `{kdo}` → nejbližší
  následující mezera.** Zadání
  [[../technika/faze-2.2-navrh-2026-07-29|technika/faze-2.2-navrh-2026-07-29.md]]
  splněno ve všech třech bodech (próza s živě plněnými mezerami na přiřazení
  i výsledku, popisy věcí bez hoveru, mechanický souhrn telegrafu podřízený
  próze). Nový čistý modul `prototyp/src/ui/situace-text.js` (obdoba
  `protocol-fill.js`, bez DOM a bez herní logiky) — **engine se nedotkl**,
  text se dohledává z obsahu, mezery na výsledku se plní z událostí
  `slot_resolved`, ne z UI výběru. **Rozhodnutí, které si žádá zápis:**
  autorský text NEMÁ vždy 4 `{kdo}` — `deputy-mytnice` a `privoz-celnik` mají
  jen 3, protože skrytá „kdyby" role nemá jednajícího. Kontrakt je proto
  **`{kdo}` = vlastník karty v NEJBLIŽŠÍ NÁSLEDUJÍCÍ mezeře**, ne „i-tý {kdo}
  patří i-tému slotu"; `{kdo}` bez mezery za sebou se zahodí (jednající se
  nedomýšlí). Autoři textů tím dostávají volnost mezery bez jednajícího
  nechat. Invariant „právě 4 mezery, indexy 0–3 v pořadí slotů" hlídá test nad
  reálným `obsah/` u všech 19 situací (pool + léčky/konfrontace). 295 testů
  zelených, lint čistý, celý run projitý v prohlížeči (2p, seed 7, vč. léčky
  a konfrontace) bez chyby konzole. Přibalen dluh z backlogu:
  `opravUvozovkySablon()` smazán (nad v3 sadou prokazatelně no-op).
- **D45 (triáž PM) — nálezy prvního sezení lidské brány: dva jsou nedodaný
  kanon (→ fáze 2.2), jeden designová změna (→ kolo designera).** Sezení
  ([[../playtesty/2026-07-29|playtest]]) se přerušilo na fikci, balanc se
  neřešil. (1) **Text situace se 4 mezerami `{VEC}` + `{kdo}` se v UI vůbec
  nevykresluje** — jádro designu §4.3 („rozděl karty do mezer jednoho
  příběhu") je autorsky hotové v `obsah/situace.yaml`, ale hráč vidí jen
  technická jména slotů vedle sebe, což čte jako čtyři alternativní řešení.
  (2) Popis věci jen v hoveru. Obojí = **fáze 2.2**, zadání
  [[../technika/faze-2.2-navrh-2026-07-29|technika/faze-2.2-navrh-2026-07-29.md]]
  (Opus, `prototyp/`). (3) **Telegraf mluví mechanicky polopatě** — hráč chce
  atmosférickou předzvěst, delší text; sahá na QA invariant telegrafu a limity
  délky → **mandát pro game-designera** (návrh nového invariantu se zachováním
  fidelity derivovaného signálu pro bota/K7; kritik prověří; schvaluje
  uživatel). Mechanický souhrn pod telegrafem se už ve 2.2 jen vizuálně
  podřizuje próze (D36 „próza hlavní"). Lidská brána pokračuje po 2.2 —
  metriky sezení zůstávají nevyplněné, sezení se nepočítá do Go/No-Go.

## 2026-07-28

- **D44 (ROZHODNUTÍ UŽIVATELE) — varianta B: `muj-den` se NEZAPÉKÁ a jde do
  lidské brány jako známá odchylka. Ladění cílů se zastavuje.** Uživatel zvolil
  z variant předložených po D43 (B / zapéct V-3 / A škrt + `o-vlasek` / kolo nad
  celou sadou). **Důsledky:** (1) `muj-den` zůstává v zapečené podobě
  `pocet_slotu_splnil >= 3` a jeho **K9 breach (99,4 / 98,3 / 96,0 / 91,4 %)
  se nese do lidské brány jako druhá vyčíslená odchylka** vedle K1 3p/4p + K6a
  z D39 (precedent D33/K5). (2) Kandidát **V-3 se nezapéká, ale nezahazuje** —
  je proměřený, prošel všemi předregistrovanými kritérii a leží v D43 + reportu
  připravený k zapečení, pokud ho lidská brána vyžádá. (3) **UI ukazatel
  „prošlo X / propadlo Y" se nestaví** — byl předpokladem V-3, je tedy
  bezpředmětný, dokud se V-3 nezapeče. (4) Nález „2 z 8 cílů nejsou osobní"
  (`plny-zasah`, `kupecke-slovo`; `bez-jizvy` na hraně) **se nese do brány
  taktéž** — neřeší se čtvrtým kalibračním kolem.
  **Zdůvodnění (PM doporučení, uživatel přijal):** blokující předpoklad V-3 je
  čitelnost (metrika 6) a **čitelnost je právě to, co má lidská brána změřit** —
  stavět UI na cíli, který se po bráně může přepsat, je práce na špatném konci.
  Zároveň je celá třída těchto nálezů (saturace, neosobnost, mrtvý reveal)
  odpovědí na jedinou otázku, kterou simulace z principu nedá: **dělá reveal
  tajných cílů u stolu vůbec něco?** Až to čtyři lidé řeknou, bude jasné, jestli
  se sada ladí, nebo přestavuje. Tři kola ladění cílů za sebou (D42, D43 + tento
  návrh) byla hranice návratnosti.
  **Kritická cesta je tím volná: fáze 3 (blokuje volba LLM poskytovatele)
  a LIDSKÁ BRÁNA.**
- **D43 (kolo `muj-den`, schváleno uživatelem) — kandidát V-3 PROŠEL měřením,
  ZAPEČENÍ ESKALOVÁNO NA UŽIVATELE; a OPRAVA ZDŮVODNĚNÍ v D42.**
  Kolo `game-designer` (návrh + předregistrace naslepo) → `playtest-facilitator`
  (kontrafaktuál, ~124k runů). Commit měřicí části `a7b1e32`, report
  [[../technika/muj-den-kontrafaktual-2026-07-28|technika/muj-den-kontrafaktual-2026-07-28.md]].
  **Diagnóza:** vada je v METRICE, ne v prahu. Zásoba slotů na hráče je
  32,1 / 18,4 / 12,3 / 9,1 (1p–4p), takže aby 1p spadl pod 95 %, musel by práh
  ležet kolem 12–14 — ve 4p je ale maximum ~9. **Žádný plochý počítací práh
  nesedne všem počtům**, což je tentýž tvar jako proměřené zamítnutí `>= 2`
  u `schovana-bouchacka`, jen dokazatelný předem. Per-count práh (enginová
  práce, precedent drahé páky D38) i konjunkt `a doruceno` designér **zamítl**:
  `doruceno` sice srazí nepodmíněnou míru, ale podmíněně nechá 96–99 %, tj.
  vyrobí horší „bod za výhru" než zamítnutý kandidát C z D42.
  **Kandidát V-3:** `podil_slotu_splnil_pct >= 50 a sloty_vlastnika_celkem >= 5`,
  bez `doruceno`. Ze čtyř sweepovaných řezů (50/60/67/75) prošel **jediný, a to
  všemi** předregistrovanými kritérii: nepodmíněně v pásmu u všech čtyř počtů,
  podmíněně 68–76 %, λ=3 čtení ≤ 80 %, normalizovaná divergence 0,86 / 0,93 /
  0,94 (práh ≥ 0,7), guard-kill ≤ 0,7 %. 4p baseline dnešního `muj-den` = 91,4 %,
  uvnitř predikce 85–93 % → **diagnóza potvrzena**. Regrese nulová (mimo blok
  `cile` a `verzeObsahu` nula rozdílů, K9 zbylých sedmi cílů bit po bitu
  totožná); golden snapshot 3 vložené řádky, všechny `nahrazena_hrac_id`.
  **Korekce mechanismu (facilitátor vůči designérovi):** podíl závislost na
  počtu hráčů neodstranil, **obrátil ji** — průměrný podíl je téměř plochý
  (47,1 / 51,9 / 54,6 / 55,0 %), ale rozptyl klesá jako 1/√n, takže práh blízko
  průměru je v sólu nejtěžší a ve 4p nejlehčí. Predikce designéra i kritika měly
  pořadí 1p↔4p obráceně. Věta „vada je v metrice" platí ve svém důsledku,
  ne v mechanismu.
  **PROČ SE NEZAPEKLO (dvě podmínky, obě mimo dosah simulace):** (1) **K6b
  tempo** — cíl je nově živý v 80–89 % uzlů (dnes 21,7–57,5 %); skutečný konflikt
  s týmovým optimem roste jen z 1,8–9,1 na 7,6–19,6 % uzlů, ale *živý ≠ sporný*
  a jestli je to hádka nebo zdržení, simulace nezjistí. (2) **UI ukazatel
  „prošlo X / propadlo Y" je předpoklad zapečení, ne příslušenství** — cíl se
  dnes hráči ukazuje jen na startu, podíl by byl neřiditelný (metrika 6,
  čitelnost, tedy přesně to, na čem má lidská brána stát). Fallbacky
  předregistrované designérem: **A** škrtnout `muj-den` a otevřít kolo na
  `o-vlasek`, **B** nést breach do lidské brány jako známou odchylku (precedent
  D33/K5).
  **OPRAVA D42 (retrakce, doložená):** zdůvodnění „divergence 41,8–52,9 % =
  cíl je osobní", které jsem zapsal do `cile.yaml` i do D42, **NEPLATÍ**. Strop
  divergence při nezávislosti je `1 − p^m − (1−p)^m`, takže je funkcí marginální
  míry — **saturovaný cíl nemůže divergovat** a absolutní číslo samo osobnost
  nedokazuje; navíc to bylo min–max přes počty, ne per počet. **Verdikt o
  `schovana-bouchacka` po normalizaci STOJÍ** (0,77 / 0,91 / 0,93 stropu, nad
  prahem 0,7) a **zamítnutí B/C stojí a fortiori** (0,00 / kladný strop = 0,00).
  Poznámka v `obsah/cile.yaml` opravena na doložené znění. Důkaz, že na
  absolutním čísle nešlo stavět: `plny-zasah` raw 2,8 % vs. `muj-den` raw 21,1 %
  — po normalizaci (0,03 vs. 0,73) je pořadí **obrácené**.
  **Nález, který přesahuje toto kolo:** kritérium „normalizovaná divergence
  ≥ 0,7", kterým jsme měřili kandidáta, **nikdo neaplikoval na zapečenou sadu** —
  a po aplikaci jsou `plny-zasah` (0,00/0,01/0,03) a `kupecke-slovo`
  (0,20/0,35/0,49) **týmové cíle**, `bez-jizvy` na hraně (0,71/0,66/0,65).
  Tj. z osmi „tajných osobních cílů" jsou dva prokazatelně neosobní.
  Doprovodně opraven **potvrzený bug parseru** (`parseValue` nechával `0.6`
  řetězcem → `evalCondition` přes `Number()` → `podminka: "cokoli >= 0.6"`
  procházela loaderem i testy a byla **vždy pravda**); divergence má nově
  **trvalý sloupec v `sim/report.js`** (dosud se v repu vůbec neměřila).
- **D42 (kolo `mozek-operace` dle D39(iv), ROZHODNUTÍ PM z měření) — cíl
  ŠKRTNUT a nahrazen `schovana-bouchacka`; sada cílů je nově 8/8 mechanická.**
  Kolo `game-designer` + `content-generator` (diagnóza, nezávisle) →
  `playtest-facilitator` (kontrafaktuál přes `CONTENT_DIR`).
  **Diagnóza — obě poloviny, v tomto pořadí:** (1) 0 % ve sweepu D38 bylo
  **artefaktem měřidla** — `events.js:342` vrací textovému cíli
  `splnen: null, body: 0`, a `report.js` ho přesto nechával ve jmenovateli K9
  (falešný breach); (2) pod tím ale byla **skutečná strukturální
  nesplnitelnost**: `prompty/protokol.md:21-22,68` drží osoby jako „podezřelý
  A–D" (jména do promptu nejdou), `:23-27,35-36` zakazuje modelu vymyslet, co
  nepadlo z mechaniky, a v 28 v3 fallback šablonách je `{jmeno}` v 9 šablonách
  **výhradně jako příjemce postihu** — hlavička `fallback-sablony.yaml:17-22`
  osobě naznačit zavinění výslovně zakazuje. Jediné místo, kde engine osobu
  určí, je zároveň jediné, kde jí nesmí připsat jednání. Cíl by navíc po fázi 3
  udělal arbitrem 3 bodů **náladu LLM** = porušení „mechanika rozhoduje".
  **Rozhodnuto měřením, ne vkusem:** agenti se rozešli v náhradě, tak se
  proměřili všichni tři kandidáti (~290k runů, průměr přes 4 bloky, D31) proti
  **naslepo předregistrovaným** pásmům (1p 70–90 %, 4p 23–47 % podmíněně
  doručením; > 92 % u obou = škrt bez náhrady).
  **A `schovana-bouchacka` prošel** (81,5 / 30,0 % incidenčně, 89,5 / 35,7 %
  s biasem — v pásmu v obou čteních), **B `noc-v-motelu` (13,0 / 25,0) i
  C `handl-u-silnice` (87,5 / 90,9) padly** a navíc mají **exaktně nulovou
  divergenci verdiktu mezi hráči** (0,00 % ve ~150k runech), protože
  `events.js:175-178` nefiltruje `hrac_id` → `kredity_utracene_za` je týmová
  metrika a B/C jsou týmové cíle v přestrojení za osobní (§4.10 chce důvod
  hádat se o KONKRÉTNÍ přiřazení). A má divergenci 41,8–52,9 %, tj. v pásmu
  skutečně osobních cílů. Práh `>= 2` proměřen a zamítnut (4p 4,9 %, pod K9
  floor). **Regresní rozpočet dodržen nulově a doložen bitově** — `summary.json`
  přes base/A/B/C se liší jediným klíčem `verzeObsahu`; K1/K2/K5/K5D/K5f/K6a/
  K6c/K7/K8 beze změny. Enginová část (metrika `commitnute_stitky.GANGSTER_skryta`
  + hygiena K9 v reportu) je aditivní, 233 testů zelených, commit `6e422dd`.
  **Poctivá výhrada zapsaná do obsahu:** ve 4p přijde ~78 % splnění A zadarmo
  z týmově optimálního přiřazení, vlastní páka držitele je +8 až +11 b. — cíl
  je dobrý, ne skvělý. Report:
  [[../technika/mozek-operace-kontrafaktual-2026-07-28|technika/mozek-operace-kontrafaktual-2026-07-28.md]].
  **Tři nálezy MIMO mandát tohoto kola** (nepřibaleny, jdou do backlogu /
  na uživatele): (i) hygiena měřidla odkryla pod falešným breachem **skutečný
  breach K9 u `muj-den`** — nepodmíněně 99,4 / 98,3 / 96,0 % pro 1p/2p/3p,
  dosud maskovaný agregátem přes počty; (ii) `plny-zasah` je s ~1 % divergence
  už dnes prakticky týmový cíl; (iii) `kredity_utracene_za` je počítána týmově,
  ač ji `technika/architektura.md` §2.2 ř. 141 vede jako per-hráč metriku —
  **neopraveno záměrně**, je to nález, ne úklid.
- **D41 (PM review + ROZHODNUTÍ PM) — fáze 2.1 PŘIJATA a sloučena do `main`;
  kritérium hotovo §11 ověřeno včetně smoke testu v prohlížeči.** Stavba
  proběhla na větvi `faze-2.1` (TDD po 12 taskech, review opravy po každém).
  PM ověřil nezávisle: **231/231 testů zelených + lint čistý (vlastní běh)**;
  `protocol-fill.js` čte živou v3 sadu (ne archiv) a `app.js` ji importuje;
  **smoke test v prohlížeči** (sólo, seed 42): setup → los pronásledovatele →
  mapa (jmenuje místo, pravidlo typu místa nelže) → commit (telegraf + odvozená
  anotace rolí) → přiřazení (rozpad prahu „práh 2 = kotva 4 −2", skrytá role
  značená, gamble nabízen) → výsledek (razítka s důvody vč. propadu
  „chtělo to improvizaci 2, má 0", learnabilita „optimální rozdělení TÉHOŽ
  commitu by dalo 4/4", Žár s důvodem „hlučné násilí", protokol z v3 šablony
  klepe psacím strojem). Konzole bez chyb. **Volba integrace: možnost 1 —
  merge do `main` lokálně + push, bez PR** (konvence repa je trunk na `main`,
  PR proces tu neexistuje); větev po merge smazána. Dva zastaralé řádky
  stavu z D40 opraveny (protocol-fill v3 byl mezitím hotov — task 6).
  **Zbylý drobný úklid (nová položka backlogu):** `opravUvozovkySablon()`
  v `protocol-fill.js` — workaround v2 uvozovek; v3 sada je validní YAML,
  funkce je no-op a smí zaniknout i s poznámkou v testu.
- **D40 (obsahové kolo + 3 ROZHODNUTÍ uživatele) — v3 fallback sada ZAPEČENA
  (28 šablon) a situace dostaly pole `nazev`.** Kolo `content-generator` →
  `protocol-humor-tester` → `design-critic` dle §8 návrhu fáze 2.1 (zadání D36).
  Kritik: „zapéct s výhradami" — 7 nálezů, po opravách zapečeno; matice
  `pásmo × podminka` projeta proti enginu, **žádná kombinace nepadá do
  `NOUZOVY_ZAZNAM`**. Sada: 4/4 = 3 · 3/4 = 4 · 2/4 = 5 · ≤1/4 = 5 · zatah 2 ·
  lecka 1 · konfrontace 1 · kolaps 2 · **navrat 1** · finále 2+2. v2 sada
  archivována do `obsah/archiv-v2/fallback-sablony-v2.yaml` (nesmazána).
  **Obě povinná rozhodnutí ze zadání §8:** (1) **`kolaps` v sadě, ale psaný
  znovu** — v3 sémantika je 3. postih, ne zranění (lehké postihy opadnou, těžké
  zůstanou); k tomu **přibylo pásmo `navrat`** (`character_returned`), protože
  bez něj by spis implicitně tvrdil trvalé vyřazení, které mechanika nedala.
  (2) **`hlas_z_auta` NEJDE do v3 sady** — engine takovou událost nemá
  (`EVENT` ji nezná, v2 ji plnilo UI přes `extra.hlasy`), text tvrdil „vliv na
  výsledek vzat na vědomí" a UI-only varianta by výsledek tvořila mimo engine,
  tedy nová mechanika, ne text. Zůstává v archivu s v2; obživne, jen když se
  mechanika postaví (tech backlog `navrh-v3.md` ř. 337).
  **Tři rozhodnutí uživatele k nálezům kritika:** (a) **N1** (`slozeniKolMin: 1`
  + tick na konci téže situace → v ~50 % se postava vrací ve stejném uzlu) se
  opravuje **v textu, ne v enginu** — kalibrovaná čísla brány po D35/D39 se kvůli
  fikci nerozbíjejí; šablony `kolaps`/`navrat` proto nesmí tvrdit uplynulý čas
  a musí dávat smysl jako dva sousední odstavce. (b) **N3** (sólo run vede jednu
  postavu, ale 17 šablon mluvilo o „podezřelých") se řeší **neutrálním psaním**
  (úlohy, role, vůz, náklad), ne novým klíčem `podminka` — první sezení lidské
  brány bude podle playtestu 2026-07-22 zase sólo. (c) **arbitráž (b) kritika:
  `nazev` se DOPLŇUJE** — 15 situací + 4 léčky/konfrontace pronásledovatelů;
  bez něj by protokol sázel do úředního spisu kebab-case id. Vedlejší efekt
  ověřen měřením: `vysvetleni.js` si `nazev` vzala sama, anotace mapy nově zní
  „Cesta zvolena: Překladiště v Syracuse (člověk)" místo „Cesta zvolena: člověk".
  **Zamítnuto kritikem:** rozšíření kontraktu na `{veci_zasah}`/`{veci_selhani}`
  (třetí opakování téže informace vedle `situace.text` a vysvětlující vrstvy →
  backlog fáze 3); strop 28 šablon platí, opravy se dělají přepisem.
  **Vedlejší nález — zadání kola se mýlilo:** tvrdilo, že bedny se ztrácejí jen
  v PRŮŠVIHU; testér doložil opak (ztrátové postihy, `prototyp-mvp.md` ř. 168,
  `state.js` 382–384, `vysypana-bedna` v poolech `s_nasledky`). Hlavička sady
  nese doklad a explicitní zákaz škrtat `fb-v3-nasledky-4`.
  *Kontext: verdikt kritika a průvodky ve scratchpadu session; kanonické zadání
  [[../technika/faze-2.1-navrh-2026-07-27|technika/faze-2.1-navrh-2026-07-27.md]] §8.*

## 2026-07-27

- **D39 (ROZHODNUTÍ PM, delegováno uživatelem) — výsledek sweepu přijat,
  varianta (a): breach K1 3p/4p + K6a jde do lidské brány jako známá, vyčíslená
  odchylka; nic se nezapéká, kalibrace se znovu neotevírá.** Podklad: D38
  + [[../technika/kalibrace-5-sweep-prahoffset-2026-07-27|report kalibrace-5]].
  Důvody: (1) **předregistrace musí vázat** — jediný průchozí kandidát A1
  `{0,5,6,6}` leží v pásmu, které designér naslepo označil za „jinou hru"
  (clamp prahů ≤3 = jednorázové události), a tempová diagnostika to potvrzuje
  (léčka předběhne zátah, 82 % týmových runů ≥2 konfrontace proti 28 %);
  zapéct A1 by znamenalo přepsat blind předregistraci post-hoc, přesně to, čemu
  má bránit. (2) **A1 kupuje K1 za K2 drift** (1,39 → 1,28; 6/6 → 2/6) —
  kritérium poprvé splněné v D35; mechanismus doložen (tvrdost se stěhuje
  dopředu, K2 měří růst dozadu) a přes tuhle páku jsou K1 a K2 v přímém rozporu
  — to je designová volba, ne kalibrační, a sim ji nerozsoudí (§7 reportu).
  (3) **Týmové K1 je proxy z bota** (D34: chyby na obě strany) a lidská brána
  ho stejně přeměří; „týmová hra snazší, než jsme chtěli" je u koop party hry
  méně nebezpečná odchylka než opačná. Precedent D33/K5. (4) Kritická cesta je
  2.1 → 3 → lidská brána (humor = největší produktové riziko); další kolo by ji
  zdržovalo kvůli proxy metrice. **Nesouhlas s doporučením facilitátora (A1)
  přiznán a zdůvodněn body 1–2**; jeho protiargument (K1 je o obtížnosti, K2
  o pocitu) padá na tom, že A1 mění strukturu runu natolik, že by lidská brána
  testovala jinou hru, než je navržená (stupňování ke konci je záměr).
  **Doprovodná ustanovení:** (i) `hraci[n].ruka` (8/5/4/3) se zapisuje jako
  **identifikovaná záložní páka** — aktivuje se JEN pokud lidská brána potvrdí
  „týmová hra nudně snadná"; teď se neměří. (ii) Metodická poznámka z reportu
  přijata: K6a gate ≤6 b. je při dávce 1000/buňka pod rozlišením měřidla —
  případné budoucí měření K6a povinně na 2000/buňka; znění gate se nemění
  (žádné další kolo se nechystá). (iii) Známá odchylka nesená do lidské brány,
  doslovně: K1 3p/4p **77,5 / 79,7 %** (strop 70), K6a spread **22,4 b.**
  (gate ≤6); 1p/2p v pásmu. (iv) `mozek-operace` (0 % splnění, mrtvá volba —
  vedlejší nález D38) se řeší samostatným malým obsahovým kolem PŘED lidskou
  bránou — hráč s nesplnitelným tajným cílem by kazil metriku hádky i reveal.
- **D38 (NÁLEZ, ne rozhodnutí) — sweep `prahOffsetDlePoctu` proveden: K1 se
  koupit DÁ, ale jen za cenu K2 a v režimu, který předregistrace předem
  označila za „jiná hra". Páka je vyčerpaná; volba dalšího kroku je na
  uživateli.** Zadání D37 provedeno plným kolečkem (game-designer předregistroval
  kritéria naslepo, playtest-facilitator souběžně měřil; metodika D31, 6 bloků
  × 8000 runů, verdikt z průměru). `rules.js` NEZMĚNĚN, nic nezapečeno.
  Report: [[../technika/kalibrace-5-sweep-prahoffset-2026-07-27|technika/kalibrace-5-sweep-prahoffset-2026-07-27.md]].
  **Jediný kandidát v pásmu je `{1:0, 2:5, 3:6, 4:6}`:** K1 57,3 / 57,0 / 51,7 /
  54,7 (6/6 bloků čistých, breach spraven), K6a 22,4 → 6,03 b. — ale to je *na*
  gate ≤6, ne pod ním (3/6 bloků; při dvojnásobné dávce 5,08 a 5/6, rozdíl je
  šum měřidla). **Cena: K2 drift 1,39 → 1,28 (6/6 → 2/6) — kritérium, které
  D35 poprvé rozsvítil zeleně, nově padá.** Mechanismus doložen: pozdní
  PRŮŠVIH-rate se nehnula (20,6 → 20,9 %), zvedla se raná (14,8 → 16,3 %) —
  kratší trať tahá tvrdost dopředu, a K2 měří, že má růst dozadu. K5-D zůstává
  9,73 (ale 5/6 místo 6/6), K5f přežití breachne 7 z 8 buněk místo 6, K7/K8
  beze změny.
  **Klíčové: dvě nezávislé cesty došly ke stejnému strukturálnímu stropu.**
  Designér *bez znalosti čísel* předregistroval guardrail „offset ≤ 3, nad tím
  je to jiná hra" — protože prahy jsou `max(1, base − offset)` a
  `poPrezitiKonfrontace = 3`, takže od offsetu 4 clamp slévá rozestupy a prahy
  ≤3 přestanou po finále reármovat. Facilitátor tentýž mechanismus *naměřil*:
  monotonie neplatí, offset 4 mírně zlehčí a od offsetu 7 se obtížnost otočí.
  **Doporučený kandidát leží na offsetech 5–6, tedy uvnitř zakázaného pásma** —
  a K6a (3/6) i K2 padají i proti předregistrovanému pravidlu „≥5/6 bloků".
  Podle předem daného regresního rozpočtu (pořadí hodnoty K5 > K5f > tvar trati
  > K1/K6a) tedy **zapečení nedoporučeno**. Vedlejší nález mimo sweep: cíl
  `mozek-operace` má 0 % splnění ve všech variantách včetně baseline — mrtvá
  volba, nezávislá na této páce.
  **Eskalace na uživatele — tři cesty (detail v §4 předregistrace a §9 reportu):**
  (a) přiznat breach K1 3p/4p do lidské brány jako známou, vyčíslenou odchylku
  (precedent D33/K5) a jít dál na 2.1/3; (b) nový mandát na přímou páku driveru
  `hraci[n].ruka` (dnes 8/5/4/3) — pořád engine, ne obsah, ale bije K4d/K6c;
  (c) jít do lidské brány beze změny s tím, že „snazší, než jsme chtěli" je
  u co-op party hry méně škodlivé než „nudné". **PM doporučuje (a)** — páka je
  vyčerpaná, další kolo je přesně to, co D33 vědomě zavřel, a týmová K1 je
  proxy z bota, kterou lidská brána stejně přeměří.
- **D37 (ROZHODNUTÍ uživatele) — kalibrační kolo K1/K6a schváleno: sweep
  `prahOffsetDlePoctu` souběžně s fází 2.1.** Řeší breach z D35 (K1 3p/4p
  77,5/79,7 % nad stropem 70; K6a spread 22,4 b.) — týmová hra je po opravě
  bota příliš snadná, protože co-op výběr karet napříč týmem se poprvé opravdu
  hraje. Jediná páka bez dotyku obsahu; UI fáze 2.1 na kalibraci nestojí,
  neblokují se navzájem. Vlastník: game-designer + playtest-facilitator.
  Alternativa „vzít breach jako známou odchylku do lidské brány" zamítnuta —
  sweep je levný a lidská brána má dostat čísla důvěryhodná i pro 3–4 hráče.
- **D36 (PM review Fable + ROZHODNUTÍ uživatele) — návrh fáze 2.1 SCHVÁLEN
  s výhradami; hot-seat informační postihy = varianta (b).** Review ověřilo
  faktické kotvy návrhu proti enginu a kanonu (EVENT enum, pásma, v2 soubory,
  v3 slovesa — vše sedí) a potvrdilo architekturu (čistá funkce nad logem dle
  ADR-002/008, fold s účetní knihou pro řetězce přes uzly). Dva nálezy,
  zapracovány do návrhu: (1) katalog §5 pokrýval 14 z 18 událostí enumu, ač §7
  vyžaduje plné pokrytí — doplněna explicitní množina „vědomě bez anotace"
  (`run_started`, `commit`, `assignment`, `assign_context`); (2) zadání v3
  fallback šablon (§8) mlčelo o v2 pásmech `kolaps` a `hlas-z-auta` — kolaps
  povinně do v3 sady, hlas-z-auta rozhodne obsahové kolo explicitně.
  Uživatel k §10.1 zvolil **(b) přeškrtnutí + čestnostní pravidlo** („Kowalski
  tohle nevidí — nesmí podle toho radit"); (a) trestá nesprávné hráče,
  (c) by měnilo pravidla oproti kalibrovaným číslům. §10.2 dle doporučení:
  anotace vše hned, škrty až podle tempa sezení. Stavba 2.1 odblokována —
  další krok: implementační plán v `prototyp/` (Superpowers disciplína).
- **D35 (ROZHODNUTÍ uživatele + provedení) — opravy N1–N8 zapracovány, brána
  přeměřena: dvě kritéria poprvé splněna, dvě rozbita v opačném směru.**
  Uživatel z variant zvolil **„vše + jedno re-měření"**. Zapracováno všech osm
  nálezů D34 (detail a rozpad v [[../technika/proverka-bota-2026-07-27|reportu]],
  část II), +9 testů (149 zelených), golden snapshoty vědomě přepsány.
  **Operacionalizace N1 = AUTO-FAIL, ne zákaz přiřazení:** zákaz je u 1p
  neproveditelný (`lock_slot_viditelnost: skryta` + 4 karty jednoho hráče +
  skrytý slot = žádné legální rozdělení), auto-fail je vždy proveditelný, čte se
  u stolu stejně a degraduje agency, ne číslo. Nový důvod `postih_lock_*` + pole
  `postih_efekt` pro vysvětlující vrstvu; zámky nese oracle i `assign_context`,
  jinak by padl invariant „reálné ≤ max" a tripwire ADR-010.
  **Re-měření (6 bloků × 8000 runů, verdikt z průměru dle D31):**
  **K5 varianta D 10,58 → 9,72 % (6/6 bloků v gate) — POPRVÉ SPLNĚNO**, a to
  bez dotyku Maloneho identity (D25e drží). **K2 drift 1,25 → 1,39** (6/6 ≥1,3),
  což potvrzuje hypotézu D34/N1, že se dřív měřil mechanismus z ~29 % nezapojený;
  floor ≥20 % prochází v 5/6 blocích (jeden 19,9 %). Naopak **K1 per-count
  57,3 / 67,1 / 77,5 / 79,7 % → 3p a 4p breachnou strop 70 % v 6/6 blocích**
  a **K6a spread 4,7 → 22,4 b.** (gate ≤6).
  **Diagnóza obratu:** není to nová vada obsahu, ale co-op škálování, které starý
  bot neuměl vybrat. Starý commit vybíral každý hráč zvlášť plochým součtem;
  nový vybírá nejlepšího kandidáta na roli napříč týmem, takže 4p vybírá 4 karty
  z 12, kdežto 1p z 8. PRŮŠVIH na běžných uzlech klesá monotónně s počtem hráčů
  (1p 25,4 % → 4p 19,0 % u Malonea) a **P1 na obtížnost běžných uzlů záměrně
  nesahá** — kompenzoval jen prahy trati. **P1 nebyl špatně spočítaný, byl
  spočítaný na špatném hráči.**
  **Úprava NEPROVEDENA:** nabízí se jediná páka bez dotyku obsahu — přeladit
  `prahOffsetDlePoctu` ({1:0, 2:2, 3:2, 4:2}) — ale je to další kalibrační kolo,
  tedy přesně to, co D33 vědomě zavřel. Rozhodnutí je uživatelovo, ne PM.

- **D34 (NÁLEZ, ne rozhodnutí) — prověrka bota proti veřejným pravidlům: bot není
  kompetentní model hráče; 8 nálezů, 4 měřitelně velké.** Backlog bod (a) z D32/D33
  proveden nad 2000 runy (250 seedů × 1–4p × oba pronásledovatele) čistě
  diagnosticky — **engine ani bot se neměnily**, žádné číslo v reportu nevzniklo
  zásahem do kódu. Report: [[../technika/proverka-bota-2026-07-27|technika/proverka-bota-2026-07-27.md]].
  **(N1) Engine nevynucuje tři druhy postihů** (`lock_stitek`,
  `lock_slot_viditelnost`, `hide_viditelnost`) — jsou v enumu, loader je validuje,
  obsah je uděluje, ale `assignToSlots` nemá žádnou kontrolu. Sonda: 840 přiřazení
  zakázané zbraně a 1716 přiřazení do zakázané viditelnosti. **36,5 % všech
  udělených postihů je mechanicky nic.** Není to chyba měřidla, ale hry: kategorie
  „zámkové postihy" — jeden ze tří pilířů pivotu v3 — u stolu nedělá nic.
  **(N2) Commit slévá role telegrafu do pytle statů** místo pokrytí jednotlivých
  slotů; kontrafaktuál sráží kandidáty K5-D 13,1 → 9,6 % a PRŮŠVIH proxy
  15,3 → 11,2 % bez jediné řádky obsahu. **(N3) Commit nezná run-wide rušený stat**
  (přiřazení ho zná), ač je veřejný od startu runu → proti Malonovi bot committuje
  karty vybrané podle statu, který je zaručeně 0. Rozpad per-konfigurace: mezera
  Malone − Brody se opravou zúží z ~7,7 na ~5,0 b., tedy **~třetina přebytku,
  kvůli kterému K5 nesplňuje bránu, není Malone, ale bot** — a oprava nesahá na
  jeho identitu (zákaz D25e platí dál). **(N4) Bot nemá model Žáru:** nikdy nečte
  `state.zar`, nezná cenu hlučné karty ani Brodyho veřejné ×2; přitom hlučné hraní
  je 58,4 % přírůstku Žáru a překročilo 61 % prahů Zátahu / 54,7 % léček / 51,4 %
  konfrontací. Kolik je odstranitelné, uzlový kontrafaktuál neumí — meze 2,6 %
  (jen z telegrafu) až 51,5 % (se zpětným pohledem); rozhodne až re-simulace.
  Dále: N5 `hide_staty` randomizuje celý tým místo postiženého hráče (11,8 % uzlů,
  míří do K6a), N6 gamble nahrazuje nejslabší kartu místo mrtvé (minul únik
  z max≤1 na ≥2 ve 4,9 % gamblů), N7 volba cesty je los (32,4 % nabídek má dva
  různé typy místa), N8 motel je volná opce, kterou si adaptivní bot zamyká,
  N9 hygiena — `getState()` posílá `prah`/`sum`, což UI fáze 2.1 nesmí zobrazit.
  **Klíčový závěr:** chyby jdou na OBĚ strany (N1/N5 dělají bota silnějším než
  člověk hrající dle pravidel, N2/N3/N4/N6/N7/N8 slabším) a **nevyrušují se** —
  jdou do různých metrik. Z kalibrace-4 tedy neplyne „brána byla přísná" ani
  „mírná", nýbrž **„brána měřila jiného hráče, než jakého slibujeme"**.
  **Opravy vědomě NEPROVEDENY** — všech sedm mění čísla, po nich neplatí ani jedno
  číslo kalibrace-4, a D33 kalibraci zavřel vědomě. Rozsah je proto rozhodnutí
  uživatele (viz otevřené otázky ve [[stav]]), s dělící čárou: **N1 je oprava HRY**
  (do lidské brány jde tak jako tak), N2/N3/N6 jsou oprava MĚŘIDLA.

- **D33 (ROZHODNUTÍ PM v delegaci uživatele) — kalibrace-4 se UZAVÍRÁ, jde se na
  lidskou bránu; dvě přiznaná zvolnění laťky.** Uživatel delegoval rozhodnutí na
  PM („nechávám to na tobě") a zároveň vytkl, že se ladí dokola. Výtka je
  oprávněná a odpověď je měřením: za kalibraci-4 se K6a posunulo 11,8 → 4,7 b.,
  K1 z breache u 3p/4p do pásma u všech počtů, K5-D 13,1 → 10,6 %, K2 1,14 → 1,25.
  Pohyb tedy byl velký — a právě proto jsme za bodem výnosnosti.
  **(1) Kalibrace se ukončuje.** Simulace ověřila, co ověřit umí (matematika,
  tempo). Zbývající mezery znamenají u stolu 1 mrtvý uzel na 34 runů, 1 PRŮŠVIH
  na 70 runů a 1 přežití na 135 runů — aby hráč rozdíl u K2 zaznamenal, musel by
  odehrát ~35 hodin. Přitom největší produktové riziko dle CLAUDE.md (kvalita
  českého humoru) není otestované ani jednou.
  **(2) ZVOLNĚNÍ: pronásledovatel je PŘÍCHUŤ, ne obtížnost → K5-D i K5f se gatují
  přes oba dohromady, ne per-pronásledovatel.** Odůvodnění, které z toho nedělá
  slevu: hráč si pronásledovatele **nevybírá**, losuje se na začátku runu
  (design §4.9), takže co fakticky zažívá, je směs obou. Gatovat per-pronásledovatel
  je over-specifikace vlastnosti, která není hráči přístupná. Tím se **K5f uzavírá
  poctivě** (pooled 77,6 %, uvnitř pásma [60,80]) — odpověď na kritikovu otázku N4.
  K5-D pooled 10,58 % tím splněné NENÍ a nezakrývá se (viz bod 4).
  **(3) ZVOLNĚNÍ: K2 drift přestává být gate a stává se diagnostikou; floor
  ≥20 % gate zůstává.** Odůvodnění: viditelný snowball téhle hry je **Žár**
  (šerif na trati) a ten funguje. K2 drift měří DRUHÝ, neviditelný snowball
  (info-postih → horší přiřazení), který hra hráči nikdy neslibuje a který
  vysvětluje 1,7 % rozptylu (r², korelace −0,131). Gatovat na něm jde proti
  axiomu „viditelná pravidla". Kritik nezávisle došel k témuž (D32 bod 1:
  hladinový agregát kauzální hypotézy bez rozlišovací schopnosti — 1,2 sd).
  **Poctivě přiznáno: 1,3 NENÍ nedosažitelné** — dosažitelné je ohnutím fikce
  (obě nádraží jako `rana` → ~1,52); tuhle cestu tým odmítl a odmítá ji i PM.
  **(4) K5-D zůstává NESPLNĚNÉ a viditelně otevřené.** Chybí 0,6 b. a váže
  výhradně Malone. Opravit to znamená sáhnout na jeho identitu, což zakázalo
  D25e — tedy nesplnitelná dvojice omezení (nález kritika). Nepřepisuje se práh
  ani se nevyhlašuje splnění; jde do lidské brány jako známý otevřený bod.
  **Pořadí dál:** (a) prověrka bota proti všem veřejným pravidlům (levné, dvakrát
  se ukázalo, že měřidlo bylo horší než hra), (b) fáze 2.1 vysvětlující vrstva,
  (c) fáze 3 LLM + test humoru, (d) lidská brána.
  Přehled pro uživatele publikován jako HTML artefakt.

- **D32 (VERDIKT KRITIKA k P-rozhodnutím K2 a K5-D) — doporučení: přestat brousit
  simulaci.** Plné znění: `scratchpad/kritik-verdikt-k2-k5d.md`, shrnutí zde.
  **(1) K2 ≥1,3 je vadný gate — ale ne přísností.** Je to hladinový agregát
  kauzální hypotézy, zatímco přímý estimátor mechanismu (korelace info-postihy ×
  zásahy = −0,131, r² 1,7 %) byl degradován na diagnostiku — tedy **táž chyba,
  kterou kritik přiznal u vlastního prahu ≥12 b. (D27)**, a konzistence ho k
  tomu zavazuje. Navíc gate nemá rozlišovací schopnost, kterou předstírá:
  **rozdíl mezi driftem 1,25 a 1,30 je 0,014 PRŮŠVIHU na run, tedy 1 na ~70 runů**
  (ověřeno PM aritmeticky), a mezera 0,050 při sd 0,040 je 1,2 sd. Jiné poctivě
  odvoditelné číslo na téhle metrice neexistuje — až po výměně estimátoru za
  **podmíněný kontrast** (pozdní PRŮŠVIH | ≥1 aktivní postih vs. | 0 postihů,
  párováno uvnitř runu). Kritik předem přiznává riziko: ten test snowball
  nejspíš vyvrátí.
  **(2) K5-D ≤10 % — práh obhajitelný, systém v pořádku, vadná je UNIFORMITA.**
  D25e zakazuje sáhnout na Malona a K5-D zároveň žádá, aby jeho následek zmizel
  — **nesplnitelná dvojice omezení**; proto pět léků za sebou koupilo jen
  desetiny. Poměr Malone/Brody 1,7–1,9× je aritmetický stín D20a, ne vada
  obsahu; Brody po variantě C plní všude, takže systém prahu dosáhnout umí.
  PM derivaci z délky runu kritik **neoznačuje** za stejnou chybu jako své ≥12 b.
  (nativní osa, hladinový test hladinové vlastnosti). Per-pronásledovatel ano,
  ale **až po rozhodnutí o symetrii pronásledovatelů**, jinak je to sleva — a
  v run-level jednotce („podíl runů s ≥1 beznadějným uzlem"), ne po desetinách.
  **(3) `faze` zamítnuto** — nekupuje nic (2/6 bloků = nesplněno), takže je
  jakákoli cena záporná. **Ale „1,3 je nedosažitelné" je NEPRAVDA:** dosažitelné
  je (obě nádraží `rana` → ~1,52), jen ne poctivě — to musí být na stole
  explicitně, ne skryté.
  **(4) K5f Brody: pásmo je špatně specifikované.** 0,78 p. b. = 1 run ze 135.
  Malone je tvrdší v obou osách, Brody měkčí v obou, a gaty předepisují oběma
  totéž. **K5-D a K5f jsou jedna nezodpovězená otázka se dvěma znaménky:**
  paritu napříč počty hráčů projekt vyslovil (K6a), napříč pronásledovateli
  NIKDY — a brána se chová, jako by ji vyslovil.
  **(5) Další broušení simulace je špatná investice, bez zmírňování.** Zbývající
  tři deficity dohromady nezmění ani jeden odehraný večer (**1/70, 1/34, 1/135
  runů** — ověřeno), zatímco největším hybatelem celé kalibrace-4 byla **oprava
  měřicího přístroje** (D30 > P2+P3 dohromady) a bot nebyl systematicky prověřen
  proti veřejným pravidlům. Doporučené pořadí: (a) prověrka bota proti VŠEM
  veřejným pravidlům (hodiny práce, doložený výnos, může oba gaty zavřít
  zadarmo); (b) rozhodnutí o symetrii pronásledovatelů; (c) rozhodnutí o K2;
  (d) lidská brána. Čitelnost (metrika 6) je otevřená od 2026-07-22 a humor —
  dle CLAUDE.md největší produktové riziko — je netestovaný.
  **Tři otázky na uživatele:** je volba pronásledovatele volbou OBTÍŽNOSTI, nebo
  PŘÍCHUTI? Má být snowball vůbec statistický, nebo viditelný (Pandemic ho dělá
  posuvníkem míry nákazy, ne distribucí — a „viditelná pravidla" je axiom
  projektu)? Co musí platit, aby se šlo na lidskou bránu, a smí gate se
  vzdáleností 1/70 runu ještě blokovat?

- **D31 (ZJIŠTĚNÍ) — seedy 1–1000 jsou příznivý blok; část dosavadních verdiktů
  byla bloková, ne systémová. Dva gaty se vracejí jako P-rozhodnutí.**
  Zapečeno: oprava `deriveTelegrafSignal` o slotovou výjimku (`zbran_slot_vyjimka`,
  chováním neutrální) a **varianta C** — „Zatlačit hrubě" u `nadrazi-vypravci`
  je `stitek_citlivy: GANGSTER`; slot byl matematicky nesplnitelný (kotva 3 chce
  ve 20 % instancí `utok ≥5` a non-GANGSTER pětka v balíčku neexistuje) i fikčně
  obrácený. Nabídka se otevřela bez poklesu jediného prahu, cena je vestavěná
  v Žáru; `nadrazi-vypravci` 29,4 → 22,1 %, **Brody nově plní K5-D u všech
  počtů**. Dále zapečena inertní enginová podpora pole `faze` (krokové zúžení
  maso-poolu, povinný fallback + validace v loaderu).
  **METODICKÝ NÁLEZ:** celá kalibrace se měřila na jednom bloku seedů a ten je
  systematicky příznivější než průměr. Přes 6 disjunktních bloků:
  **K5-D mean 10,58 — neprošlo ani v jednom bloku** (hlášené „10,4, chybí 0,4"
  bylo blokové štěstí); **K2 drift mean 1,25** (1/6 bloků); **K6a mean 4,68, ale
  1 blok ze 6 breachne** (max 6,4); K2 floor 23,25 je jediný robustní pass
  mezi tenkými gaty. **Od teď se verdikt bere z průměru přes bloky.**
  **K2 přes `faze` ZMĚŘENO A NEZAPEČENO:** fikčně poctivé tagování
  (7 raná / 4 pozdní / 3 bez fáze, gradient venkov → město, který v obsahu
  prokazatelně je) posune drift jen na 1,282 (2/6 bloků) a **platí se za to
  zhoršením K5-D na 10,87** — za tu cenu to není výhodný obchod. Content-generator
  přitom odmítl snadný zisk (obě nádraží jako `rana` → drift ~1,52), protože je
  text na žádný konec trasy neusazuje; ten kompromis je k dispozici jako
  uživatelská volba, ne jako tichý krok týmu.
  **K5f breach NENÍ šum a je Brodyho:** 4p Brody mean 80,78 (5/6 bloků nad
  stropem), 3p 80,55 (4/6); všechny Malone konfigurace pod stropem. Brody neruší
  žádný stat → tým jde do konfrontace s plným pokrytím. Páka je severita
  Brodyho konfrontace v obsahu.
  Detail: §7 [[../technika/kalibrace-4-final-2026-07-27|reportu kalibrace-4]].
  **Míč u uživatele: K2 a K5-D jako P-rozhodnutí (D26 bod 5 to předjímá).**

- **D30 (rozhodnutí uživatele + provedeno) — opravena commit i assign heuristika
  kompetentního bota o veřejné pravidlo štítku GANGSTER.** Z nabídnutých cest
  („botí oprava + přeměření" / „dotáhnout bránu bez ní" / „paralelně lidská
  brána" / „přehodnotit prahy") uživatel zvolil **botí opravu jako první krok**.
  PM zároveň opravil vlastní chybu v §5 reportu, kde byla tahle položka až
  čtvrtá: zbraně přidávají +1/+2 Žár, takže oprava mění tempo Žáru → K1 → a tím
  i offsety z P1; jakákoli obsahová práce udělaná dřív by se musela přeměřit.
  **Nález:** bot ignoroval verdikt zbraně na OBOU osách (commit i přiřazení),
  ačkoli telegraf ho hlásí doslova a `stitky.yaml` ho vede jako veřejné pravidlo
  — gate tedy neměřil hru, ale botovu chybu. **Naměřeno:** gangster_auto_fail
  9497 → 2858 propadů (−70 %; zbytek jsou slepí hráči, což je správně);
  K1 per count 64,6 / 61,2 / 63,7 / 64,6 (breach žádný); K6a 5,0 → **3,4 b.**;
  **K2 drift 1,18 → 1,26 bez jediného zásahu do obsahu** (snowball konečně
  funguje jak navržen: kompetentní hráč v raných uzlech nechybuje, v pozdních ho
  `hide_telegraf` oslepí); K5 expDead 11,3 → **10,7 %**. P1 offsety `{0,2,2,2}`
  přeověřeny sweepem nad opraveným botem — zůstávají optimální, re-tune netřeba.
  **Cena:** K5f se mírně zhoršila (2 marginální breache 80,5–80,6 proti stropu
  80), protože lepší bot přežívá finále častěji; Žár-offsety to neopraví,
  páka je severita finále v obsahu. `greedy` zůstal naivní schválně — je to
  detektor K4a, ne model kompetence. Detail: §6
  [[../technika/kalibrace-4-final-2026-07-27|reportu kalibrace-4]].

- **D29 (VÝSLEDEK kalibrace-4) — 7 z 9 gatů splněno, brána Fáze 0 stále
  NESPLNĚNA; nic se nesnížilo.** *(Čísla D29 překonána opravou bota v D30 —
  identita otevřených gatů se nezměnila, jen se přiblížily.)* Provedeny kroky P2, P3, P1 mandátu D25/D26;
  re-měření 1000×2×4 (8000 runů) proti zapečenému znění. Report:
  [[../technika/kalibrace-4-final-2026-07-27|technika/kalibrace-4-final-2026-07-27.md]].
  **NOVĚ SPLNĚNO:** (a) **K1 per-count** — 61,6 / 56,6 / 59,1 / 60,3 %,
  breach žádný (bylo 3p 70,7 a 4p 70,9); (b) **K6a spread 11,8 → 5,0 b.**,
  a pass není artefakt jednoho bloku — 6 disjunktních bloků dává mean 4,35,
  sd 0,43, max 5,0. Obojí zařídilo **P1**: nová per-count páka
  `zar.prahOffsetDlePoctu` (sólo plná trať, tým zkrácená o 2) — jediná páka,
  která nesahá na obtížnost běžných uzlů (falzifikace kalibrace-3). Zamítnuta
  měřením alternativa „násobič tempa Žáru": přírůstky jsou 1–2, takže krok je
  skok o 100 % (K1 4p 75,5 → 45,6 bez ničeho mezi tím).
  **P4 (ruka 1p 8→9) ZRUŠENO jako bezpředmětné** — 1p je po P1 nejvyšší ze všech
  počtů (61,6 %), zvětšení ruky by rozbilo K6a.
  **ZŮSTÁVÁ NESPLNĚNO (vstup další iterace, ne sleva):** K2 drift **1,18**
  proti ≥1,3 a K5 varianta D **11,3 %** proti ≤10 %; marginálně K5f
  4p Brody 80,1 (0,1 b. nad stropem, uvnitř šumu).
  **Diagnózy hotové:** (1) K2 — PRŮŠVIH-rate se mezi situacemi liší 3,8×
  (10,1–38,6 %), ale situace se losují rovnoměrně; krokově podmíněné pooly
  (tvrdé pozdě, měkké brzy) by drift zvedly bez sáhnutí na kotvy — směr D22d,
  vyžaduje engine + `mista.yaml`, neprovedeno. (2) K5-D — vázající je **výhradně
  Malone** (11,5–17,8 % vs. Brody 5,8–10,3 %, který gate u 2p/3p/4p plní);
  další lék je varianta C (`stitek_citlivy: GANGSTER` na „Zatlačit hrubě"),
  blokovaná tím, že `deriveTelegrafSignal` slotové `stitek_citlivy` ignoruje.
  **Nálezy mimo mandát:** viditelný utok-4 slot v NPC je ve 40 % instancí
  nesplnitelný (non-GANGSTER `utok ≥5` = 0 karet ze 40) — týká se `rival-prepad`,
  `urednik-vaha`, `mesto-ulicka`, což jsou zároveň nejtvrdší situace ve hře;
  kombi `[nastroj, improvizace]` je nesplnitelný nad práh 3; a **kompetentní bot
  ignoruje `zbran_projde`** (107 z 204 propadů útočného slotu v `nadrazi-vypravci`
  je `gangster_auto_fail`) — bot je tam hloupější než kompetentní člověk, takže
  K5/K1 jsou o tuhle chybu pesimistické. Oprava = změna referenční strategie
  → re-baseline všeho, tedy rozhodnutí, ne údržba.

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
