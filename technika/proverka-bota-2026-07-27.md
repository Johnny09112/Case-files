# Prověrka bota proti veřejným pravidlům (2026-07-27)

*Backlog bod (a) po uzavření kalibrace-4 (D32 bod a, D33). Zadání: systematicky
projít, co telegraf a `obsah/stitky.yaml` hlásí jako VEŘEJNÉ, a ověřit, že to
kompetentní bot používá. Důvod: dvakrát se ukázalo, že měřidlo bylo horší než
hra (naposledy D30 — bot ignoroval verdikt zbraně a oprava přinesla víc než dvě
kola ladění obsahu). Všechna čísla nesená do lidské brány stojí na botovi.*

**Výsledek: 8 nálezů, z toho 4 měřitelně velké. Bot NENÍ kompetentní model hráče
— a chyby jdou na OBĚ strany**, takže se nedají odhadnout od stolu: část dělá
bota hloupějším než člověk (K1/K5 pesimistické), část ho nechává hrát to, co
člověk podle pravidel nesmí (K1 optimistické, postihy podhodnocené).

## Metodika

Diagnostika **nad logem, bez zásahu do enginu i bota** — žádné číslo v tomto
reportu nevzniklo změnou kódu, takže se s ničím dosud zapečeným nepere.

- Dávka: **2000 runů** (250 seedů × 1–4p × oba pronásledovatele), strategie
  `kompetentni` (commit informovaný / assign kompetentní / econ adaptivní /
  gamble), obsah i pravidla ve stavu po D31.
- Kontrafaktuál commitu je **uzlový, stav držíme fixní**: pro každý uzel se
  rekonstruuje ruka v okamžiku commitu (`commit` ∪ `assign_context.ruce`),
  přehraje se jiná commit-heuristika a obě sady se měří proti **týmž odhaleným
  slotům**. Neměří to složené efekty přes run — ale řadí úniky podle síly bez
  re-simulace a bez rizika, že se do měření vloudí jiná změna.
- Skripty jsou v repu, aby čísla šla zopakovat: `prototyp/sim/audit-bot.js`
  (`node sim/audit-bot.js 250`) a `prototyp/sim/audit-postihy.js` (sonda
  vynucování zámkových postihů). Ani jeden nesahá na engine, bota ani obsah;
  `npm test` (140) a `npm run lint` po jejich přidání zůstávají zelené.

**Poctivá výhrada k tabulce commitu:** varianty se porovnávají při fidelitě 1
(bez šumu „hráč přečte telegraf špatně"), aby se izolovalo *pravidlo*, ne šum.
Rekonstrukce B proto trefí skutečný commit bota jen v 52,3 % uzlů — bot s
fidelitou 0,7 hraje **hůř než B**. Skutečná mezera mezi dnešním botem a variantou
C2 je tedy *větší*, než tabulka ukazuje; při re-simulaci se ale zúží, protože
šum fidelity se aplikuje na obě strany.

## Inventura veřejné informace × používá ji bot?

| # | Veřejné pravidlo / informace | Zdroj pravdy | Používá bot? |
|---|---|---|---|
| 1 | `trend` — staty všech VIDITELNÝCH slotů | telegraf (derivace) | částečně — slévá seznam rolí do pytle statů (**N2**) |
| 2 | `proti_srsti` — počet skrytých slotů | telegraf | **ne** (**N2**) |
| 3 | `zbran_projde` — verdikt zbraně dle typu situace | `stitky.yaml` | ano (oprava D30) |
| 4 | `zbran_skryte` — zbraň se vyplatí ve skrytém slotu | telegraf | ano |
| 5 | `improv_skryte` — skrytý improvizační slot | telegraf | ano (P3) |
| 6 | `zbran_slot_vyjimka` — `stitek_citlivy: GANGSTER` | `situace.yaml` | ano (D31, varianta C) |
| 7 | `chovani_dle_typu` — auto-fail zbraně ve viditelné roli | `stitky.yaml` | ano (commit i přiřazení) |
| 8 | `hlucnost_zar` — GANGSTER karta přidá Žár (Brody ×2) | `stitky.yaml` | **ne** (**N4**) |
| 9 | „hlučný útok" — karta s útokem ≥ 4 přidá Žár | `prototyp-mvp.md` §Žár | **ne** (**N4**) |
| 10 | Pozice na trati Žáru + vyznačené prahy | `prototyp-mvp.md` §Žár, §Mapa | **ne** — bot nikdy nečte `state.zar` (**N4**) |
| 11 | `rusi` pronásledovatele — run-wide, viditelné od startu | `pronasledovatele.yaml` | jen při PŘIŘAZENÍ, ne při commitu (**N3**) |
| 12 | Typ nabídnutého místa na mapě (npc/lokace/truhla) | `map_move` | **ne** — losuje (**N7**) |
| 13 | Nabídka motelu (směna 3 kr. / léčení 6 kr.), zajížďka zdarma | `mista.yaml` | částečně (**N8**) |
| 14 | Ikony viditelnosti slotů po odhalení | `situace.yaml` | ano |
| 15 | Vlastní postihy a jejich efekty | `postihy.yaml` | 4 z 7 druhů (**N1**, **N5**) |

## Nálezy (řazeno dle síly)

### N1 — Třetina udělených postihů je mechanicky NIC (engine, ne bot)

`lock_stitek`, `lock_slot_viditelnost` a `hide_viditelnost` jsou v enumu
`POSTIH_EFEKTY`, loader je validuje, obsah je používá — ale **engine je nikde
nevynucuje** (`assignToSlots` nemá žádnou kontrolu postihů) a bot je nerespektuje.

Sonda přes 2000 runů: u hráčů s aktivním zámkovým postihem engine přijal
**840 přiřazení zakázané zbraně** (`lock_stitek`) a **1716 přiřazení do zakázané
viditelnosti slotu** (`lock_slot_viditelnost`). Postihy s inertním efektem tvoří
**36,5 % všech udělených postihů** (3571 z 9785; `prilis-na-rane` 957,
`ochrnuta-ruka` 720, `rozdrcena-noha` 634, `mlha-v-hlave` 727, `nervy-v-hajzlu` 533).

Není to jen chyba měřidla — **je to chyba hry**: kategorie „zámkové postihy",
jeden ze tří pilířů pivotu v3 („postihy místo zranění"), u stolu nedělá nic.

**Dopad na dosavadní závěry:** K6a (severita postihů) a hlavně **K2 drift** se
měřily na systému, kterému chyběla skoro třetina postihové tíhy — a chyběly právě
ty postihy, které mají degradovat ROZHODOVÁNÍ v dalších uzlech, tedy přesně
mechanismus, který K2 drift měří. D33 degradoval K2 na diagnostiku s odůvodněním
„neviditelný mechanismus vysvětluje 1,7 % rozptylu"; toto zjištění tomu odůvodnění
nebere platnost (viditelný snowball je pořád Žár), ale říká, že se ta korelace
měřila na mechanismu z ~29 % nezapojeném.

### N2 — Commit slévá telegraf do pytle statů místo pokrytí rolí

Telegraf jmenuje ROLE („zaplatit, klidné slovo, pár šikovných rukou u postroje;
jedna skrytá"). Bot z nich udělá jeden seznam poptávaných statů a každou kartu
oboduje **součtem přes celou poptávku** — takže klidně committne čtyři karty
silné v témže statu a na ostatní role nezbude nic. Skryté sloty do rozhodování
nevstupují vůbec (`proti_srsti` nikdo nečte), přestože „jedna skrytá čeká na
nejhorší" je pobídka nechat si jednu širokou kartu.

Kontrafaktuál (varianta **C3**: každý viditelný slot dostane svého nejlepšího
kandidáta, zbytek kvóty jde na generalistu — čistě z telegrafu, bez kotev):

| varianta (běžné uzly) | prům. maxAchievable | max≤1 (kandidáti K5-D) | zásahy ≤1 (PRŮŠVIH) |
|---|---|---|---|
| B — dnešní pravidlo | 2,462 | **13,1 %** | **15,3 %** |
| C1 — + zná rušení statu | 2,495 | 11,8 % | 13,8 % |
| C3 — + pokrytí rolí | 2,646 | 9,6 % | 11,2 % |
| C2 — C1 + C3 | 2,652 | **9,3 %** | **10,9 %** |

Je to největší jednotlivý pohyb, jaký kterákoli kalibrace naměřila — a nestojí ho
ani řádka obsahu.

### N3 — Commit nezná rušený stat, přestože je veřejný od startu

`rusi` je run-wide a hráči ho znají od první minuty (Malone: HODNOTA se počítá
jako 0 ve všech hodnota-slotech celého runu). **Přiřazení** to respektuje
(`resolveSlot`), **commit ne**: `commitScore` sčítá syrové staty, takže když
telegraf poptává hodnotu, bot proti Malonovi committne kartu vybranou podle
statu, který je zaručeně nulový. Člověk u stolu tuhle chybu neudělá — je to
první věc, kterou se o Malonovi dozví.

Rozpad B → C2 na běžných uzlech ukazuje, že to sedí přesně tam, kde visí
nesplněné K5:

| konfigurace | max≤1 B | max≤1 C2 | zásahy ≤1 B | zásahy ≤1 C2 |
|---|---|---|---|---|
| 1p/Malone | 16,7 % | 12,6 % | 19,7 % | 14,4 % |
| 2p/Malone | 17,4 % | 12,1 % | 19,9 % | 14,1 % |
| 3p/Malone | 18,0 % | 12,3 % | 20,6 % | 14,1 % |
| 4p/Malone | 15,3 % | 10,9 % | 17,8 % | 11,9 % |
| 1p/Brody | 10,0 % | 7,9 % | 12,1 % | 10,0 % |
| 2p/Brody | 9,1 % | 6,4 % | 10,9 % | 7,9 % |
| 3p/Brody | 8,8 % | 5,6 % | 10,4 % | 6,9 % |
| 4p/Brody | 9,0 % | 6,6 % | 10,8 % | 7,8 % |

Mezera Malone − Brody se zúží z ~7,7 na ~5,0 bodu. **Zhruba třetina „Maloneho"
přebytku, kvůli kterému K5 nesplňuje bránu, není Malone — je to bot.** A oprava
nesahá na Maloneho identitu, tedy nenaráží na zákaz z D25e.

### N4 — Bot nemá žádný model Žáru

Bot ani jednou nečte `state.zar`. Nezná cenu hlučné karty (`hlucnost_zar`),
nezná Brodyho veřejné run-wide zdvojnásobení, neví, kde na trati stojí a jak
daleko je práh. Přitom:

- **58,4 % veškerého přírůstku Žáru** je hlučné hraní (GANGSTER 38,4 % + hlučný
  útok 20,0 %); PRŮŠVIH a S_NÁSLEDKY dohromady jen 41,6 %.
- Práh překročila hlučná karta v **61 % případů u Zátahu, 54,7 % u léčky
  a 51,4 % u konfrontace** — tedy zhruba polovinu veškerého tlaku pronásledovatele
  si tým způsobí rozhodnutím, které nikdy nezvážil.
- U Brodyho je to zhruba dvakrát častěji než u Malonea (např. léčka 1279 vs. 663)
  — přesně jak jeho pravidlo slibuje, jen si toho bot nevšímá.

Kolik z toho je odstranitelné, je ale otázka, na kterou uzlový kontrafaktuál
neumí odpovědět poctivě, takže uvádím obě meze:

- **Horní mez 51,5 %** veškerého Žáru dávky — tolik zaplatily hlučné karty, které
  šlo nahradit tichou kartou z téže ruky **beze ztráty** `maxAchievable`. Počítáno
  se zpětným pohledem na odhalené sloty, takže hráč to takhle vědět nemohl.
- **Dolní mez 2,6 %** — případy rozhodnutelné **už z telegrafu** (útok nikde
  v poptávce, tichá karta stejně dobrá na poptávaných statech).

Skutečná hodnota je mezi tím a leží v pravidle typu „u prahu diskontuj hlučné
karty", které jde změřit **jen re-simulací**. Co je jisté už teď: půlka
mechanismu, na kterém stojí P1 (vyrovnání 1–4p posunem prahů trati!), se plní
rozhodnutím, které bot nedělá vědomě.

### N5 — `hide_staty` se aplikuje na celý tým

Postih říká „**vlastník** vidí názvy věcí, ne jejich staty". Bot testuje
`state.postavy.some(...)` a při zásahu ε-greedy **randomizuje celé přiřazení**,
včetně karet hráčů, kteří vidí normálně. Aktivní je na 11,8 % uzlů (2081 z 17 682),
z toho 1589 u 2–4p. Chyba roste s počtem hráčů → míří přímo do K6a, které se
kalibrací-4 pracně srovnávalo.

### N6 — Gamble nahrazuje nejslabší kartu, ne mrtvou

`weakestCommittedId` = nejnižší součet statů. Správná otázka po odhalení slotů
zní „která karta v nejlepším rozdělení nic neuhraje" — a to je často karta
s vysokým součtem (typicky hodnota 5 proti Malonovi). Z 8106 vyhodnocených
gamblů bot **trefil nejlepší nahrazovanou pozici v 86,5 %**; ve **4,9 % gamblů
minul únik z max≤1 na ≥2** (400 případů). To je přesně ta veličina, kterou K5
varianta D měří.

### N7 — Volba cesty je los

`pickRoute` vybírá náhodně z nabídky. Typ místa je přitom veřejný a mechanicky
významný (u `lokace` zbraň projde všude, u `npc` ve viditelné roli padne).
**32,4 % nabídek** (4055 z 12 532) obsahovalo dva různé typy místa, tj. volbu,
která něco znamená. Bot ji zahazuje — a StS mapa je přitom prodávaná jako
rozhodnutí.

### N8 — Motel: adaptivní bot nikdy nesmění kartu bez těžkého postihu

Zajížďka do motelu **nestojí uzel ani Žár** (`motelChoice('ukryt')` → `leaveMotel`
→ tytéž cesty), je to volná opce. `pickMotelOffer` v režimu `adaptivni` do motelu
zajede jen při těžkém postihu a ≥6 kreditech, takže směnu za 3 kredity —
kterou by uvnitř provedl — si sám zamkne.

### N9 — Hygiena (ne únik): stav posílá botovi `prah` i `sum`

`getState()` vrací odhalené sloty včetně `prah` a `sum`. Dnes to čte jen `oracle`
(záměrná měřicí mez), takže se nic neděje — ale **UI vrstva fáze 2.1 to nesmí
zobrazit**, jinak zmizí celé skryté prahy. Poznámka pro stavbu vysvětlující vrstvy.

## Směr chyb — proč z toho nejde nic uzavřít bez re-měření

| Nález | Bot je proti člověku… | Dopad na dosavadní čísla |
|---|---|---|
| N1 zámkové postihy | **silnější** (hraje, co je zakázané) | K1 optimistické, K6a/K2 podhodnocené |
| N5 hide_staty u 2–4p | silnější i slabší podle počtu | K6a zkreslené |
| N2 pokrytí rolí | **slabší** | K1/K5 pesimistické |
| N3 rušený stat při commitu | **slabší** (hlavně Malone) | K5 pesimistické |
| N6 cíl gamblu | slabší | K5-D pesimistické |
| N4 Žár | slabší (platí Žár zbytečně) | K1 pesimistické, tempo trati zkreslené |
| N7 cesta, N8 motel | slabší | K1 mírně pesimistické |

Chyby se **nevyrušují** — jdou do různých metrik. Proto z auditu neplyne
„brána byla přísná" ani „brána byla mírná", ale „brána měřila jiného hráče,
než jakého slibujeme".

## Návrh dalšího postupu

Oprav je sedm a všechny mění čísla, takže má smysl jedno re-měření, ne sedm.
Pořadí dle poměru přínos/riziko:

1. **N1 (engine, `assignToSlots` + přiřazovací heuristika)** — vynutit
   `lock_stitek` a `lock_slot_viditelnost` jako tvrdé pravidlo a `hide_viditelnost`
   jako informační degradaci. Není to kalibrace, je to **oprava hry**: bez ní
   jde do lidské brány produkt, kde třetina postihů nedělá nic.
2. **N2 + N3 (bot, commit)** — pokrytí rolí + znalost rušeného statu. Největší
   naměřený efekt, nulový dotyk obsahu i Maloneho identity.
3. **N6 (bot, gamble)** — nahrazovat kartu dle přínosu, ne dle součtu statů.
4. **N5 (bot, hide_staty)** — degradovat jen karty postiženého hráče.
5. **N4 (bot, Žár)** — diskont hlučných karet u prahu; jediná oprava, jejíž
   přínos se dá zjistit až re-simulací, a jediná, která může spustit spor
   „nehraje bot najednou opatrněji, než by hrál člověk".
6. **N7, N8** — volba cesty dle typu místa, motel jako volná opce.

**Očekávaný dopad na bránu:** K1 nahoru (PRŮŠVIH proxy 15,3 → 10,9 % na běžných
uzlech je velký pohyb — hrozí prolomení stropu 70 %), K5-D dolů (kandidáti
13,1 → 9,3 %), K6a se posune neznámým směrem, K2 se poprvé změří s plnou
postihovou tíhou. Jinými slovy: **po opravách nebude platit ani jedno číslo
z kalibrace-4** — a to je věc, o které rozhoduje uživatel, ne PM, protože D33
kalibraci vědomě zavřel.

---

*Křížové odkazy: [[kalibrace-4-final-2026-07-27|technika/kalibrace-4-final-2026-07-27.md]]
(čísla, proti kterým se poměřuje) · [[kritik-verdikt-k2-k5d-2026-07-27|technika/kritik-verdikt-k2-k5d]]
(D32, který prověrku zadal) · [[../projekt/rozhodnuti|projekt/rozhodnuti.md]] D30, D33.*
