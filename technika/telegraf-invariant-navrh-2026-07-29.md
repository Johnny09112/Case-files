# Telegraf jako předzvěst — návrh nového QA invariantu

*Návrh `game-designera` z 2026-07-29 podle mandátu D45. **Stav: čeká na
schválení uživatele.** Do `obsah/` se nic nezapsalo — realizace zbylých 16
telegrafů je obsahové kolo AŽ po schválení. Adversariální prověrka:
`design-critic` (viz sekce na konci, doplní PM).*

**Teze:** nález 3 ([[../playtesty/2026-07-29|playtest 2026-07-29]]) není jen
kosmetika fikce. Podle naměřené fidelitní křivky (kalibrace-4 §3.3) je čitelnost
telegrafu **jediná nevyzkoušená páka, která tlačí obě známé odchylky brány
správným směrem** — marginální hodnota dokonalého čtení telegrafu je **+5,1 b.
u 1p a ≈ 0 u 3p/4p**. Zlepšení telegrafu tedy zvedá spodní konec rozpětí (zužuje
K6a, dnes 22,4 b.) a 3p/4p, které breachují nahoru, nechává být. Zhoršení dělá
přesný opak. Návrh je proto stavěný na jednom axiomu: **„atmosférické" nesmí
nikdy znamenat „vágnější".**

---

## 1. Co je ověřeno v kódu (fakta, na kterých návrh stojí)

| Zjištění | Místo | Proč je to load-bearing |
|---|---|---|
| Engine derivuje **6 kanálů**, ne 3: `trend`, `proti_srsti`, `zbran_projde`, `zbran_skryte`, `improv_skryte`, `zbran_slot_vyjimka` | `prototyp/src/engine/resolve.js:260–283` | Dnešní QA invariant v `situace.yaml` jmenuje **jen první tři**. Invariant je zastaralý proti enginu už dnes — próza pak nese poslední tři nahodile. |
| Fidelita `p` se aplikuje **per role**, nezávislým hodem; při chybě si bot domyslí **uniformně náhodný** stat | `prototyp/sim/strategies.js:417–427` | Chybějící obraz u jednoho viditelného slotu ≠ „trochu horší telegraf", ale **p ≈ 0,2 pro ten slot**. Model brány předpokládá stejné `p` napříč sloty i situacemi. |
| `zbran_skryte` a `improv_skryte` mají **vlastní hod fidelitou** | `strategies.js:423, 426` | Smějí být atmosférické, ale musí být přítomné, když je engine hlásí. |
| `zbran_projde` a `zbran_slot_vyjimka` bot čte **s jistotou, fidelita se na ně neaplikuje** — jsou to „veřejná pravidla" | `strategies.js:150–164` | **Pro jejich zamlžení nemá brána měřidlo.** Zatemnění verdiktu zbraně je tichá ztráta, kterou žádný sweep nezachytí. Tady se prózou neexperimentuje. |
| `proti_srsti` (počet skrytých) **do commit-rozhodnutí bota vůbec nevstupuje** | `strategies.js:204–212` | Počet skrytých smí být sdělen obrazem s nižší přesností než trend, aniž se hne brána. Pozor: to je argument o **bráně**, ne o hráči. |
| Simulace řetězec `telegraf` **nikdy nečte** | `grep telegraf prototyp/sim/` → jen `telegraf_derived` a komentáře | **Kontrafaktuál přes `CONTENT_DIR` je u téhle změny no-op.** Jediné měřidlo je lidský test → zpět do simu jako `p`. |

Fidelitní sweep (kalibrace-4 §3.3, win-rate %):

| fidelita `p` | celkem | 1p | 2p | 3p | 4p |
|---|---|---|---|---|---|
| náhodný commit | 57,9 | 52,7 | 57,5 | 61,8 | 59,8 |
| 0,3 | 61,6 | 54,5 | 62,5 | 64,3 | 65,2 |
| 0,5 | 64,5 | 57,4 | 64,3 | 67,7 | 68,5 |
| **0,7 (kanonická)** | **67,0** | **59,1** | 67,4 | 70,7 | 70,9 |
| 1,0 | 68,2 | 64,2 | 67,6 | 69,7 | 71,5 |

Dvě věci, které z toho plynou a nebyly dosud nikde zapsané:

1. **Vázající počet pro K4d je 1p, ne 3p.** Kompetentní − náhodný na kanonickém
   rameni (p = 0,7): 1p **6,4 b.**, 2p 9,9, 3p 8,9, 4p 11,1 — proti τ = 6 b. má
   1p rezervu **0,4 b.** Při p = 0,5 je 1p na **4,7 b. → K4d padá.** (Dokumentace
   cituje 3p 7,9 b., ale to je rameno *optimal* p = 1,0.) Čísla jsou z
   kalibrace-4, po D35 se posunula — přesnou dnešní rezervu ať před obsahovým
   kolem potvrdí `playtest-facilitator`. **První sezení lidské brány bylo sólo,
   tedy přesně na nejcitlivějším počtu.**
2. **Zvýšení fidelity zužuje K6a.** Rozpětí 1p↔4p: p = 0,7 → 11,8 b.;
   p = 1,0 → 7,3 b. Lepší telegraf je páka na K6a, ne jen na fikci.

---

## 2. (A) Nové znění QA invariantu — hotové ke vložení do `obsah/situace.yaml`

Nahrazuje blok `# QA INVARIANT TELEGRAFU (D19 + D6)`. Zároveň nahrazuje řádek
schématu `#   telegraf:  1–2 věty PŘED commitem (viz QA invariant níže)` za
`#   telegraf:  předzvěst před commitem (viz QA invariant níže)`.

```yaml
# QA INVARIANT TELEGRAFU (D19 + D6; přepis 2026-07-29 — nález 3 lidské brány)
#
# Telegraf je PŘEDZVĚST, ne výčet rolí. Je to PRÓZA = lidský rendering signálu,
# který engine DERIVUJE ze slotů (`deriveTelegrafSignal`, prototyp/src/engine/
# resolve.js). Signál se NEautoruje — próza jen musí zůstat věrná; fidelita
# telegrafu `p` je sweep knob brány (prototyp-mvp.md, Předpoklady simu).
# Informaci nese OBRAZ (překážka, člověk, předmět, gesto), ne jméno statu:
# hráč si má nároky odvodit z fikce, což je přesně learnabilita slíbená
# v design-dokument §4.5 („NPC všimné → hodnota, oprava → nástroj“).
#
# --- ZÁKAZ META-SLOVNÍKU (tvrdý, grep-ovatelný) --------------------------------
# V telegrafu se NESMÍ objevit: „role“, „slot“, „viditeln*“, „skryt*“, „stat“,
# „práh“, „kotva“, „nároky“, jména statů (útok / obrana / hodnota / improvizace
# / nástroj ani jejich zjevná synonyma typu „nářadí“, „důvtip“, „šikovné ruce“)
# a číslovky ve spojení s rolemi („tři viditelné…“).
# JEDINÁ VÝJIMKA: slova „na očích“ a „potají / schovaná“ ve verdiktu zbraně —
# to je fikce, ne meta, a verdikt zbraně se drží doslovný (viz kanál 5).
#
# --- ŠEST KANÁLŮ, KTERÉ PRÓZA MUSÍ NÉST ---------------------------------------
# Tolik jich derivuje engine. Méně = tichá ztráta informace, kterou simulace
# NEZMĚŘÍ, protože prózu nečte — a kalibrace (K1, K4d, K5, K5f, K7) se tím
# zneplatní, aniž to kdokoli zaznamená.
#
# 1) TREND — každý VIDITELNÝ slot dostane právě JEDEN konkrétní obraz,
#    a to V POŘADÍ SLOTŮ (a v témže pořadí, v jakém jeho {VEC} stojí v `text`).
#    Ne méně: chybějící obraz znamená, že ten jeden slot hráč čte naslepo, a
#    informační věrnost se rozjede NEROVNOMĚRNĚ napříč situacemi — právě proti
#    tomu stál původní požadavek „zmiň VŠECHNY viditelné staty“. Ten se tímto
#    NERUŠÍ, jen se mění z „vyjmenuj stat“ na „dej slotu vlastní obraz“.
#    Ne víc: dva obrazy na jeden slot svedou tým committnout dvě karty na
#    jednu roli. Obraz musí být předmět, člověk nebo gesto, nikdy abstrakce.
#    Slovník viz STOPY STATŮ níže.
#    KŘÍŽOVÁ KONTROLA: podstatné jméno obrazu se MUSÍ doslova objevit v `text`
#    u odpovídající mezery {VEC} („závora“ v telegrafu → „zvedal závoru {VEC}“).
#    Tím se hráči přes uzly učí mapu fikce na staty a odhalení textu je odměna,
#    ne druhý popis téže scény.
#
# 2) KOMBI SLOT (`stat: [a, b]`) — JEDEN obraz s DVĚMA nároky, výslovně
#    spojenými do JEDNÉ práce („prkna se musí přibít a zároveň podložit něčím,
#    co leží po ruce“). Nikdy jako dvě práce vedle sebe.
#
# 3) POČET SKRYTÝCH (`proti_srsti`) — číslovkou a fikcí, spočítatelně bez slova
#    „skrytá“. Kostra je pevná (číslovka + „až bude pozdě“ / „bez varování“),
#    podstatné jméno je vždy z téhle situace:
#      1 → „Jedno prkno povolí, až bude pozdě couvnout.“
#      2 → „Dvě věci se rozhodnou potmě: jednu poznáte pozdě, u druhé …“
#    Dvě skryté role má v celém obsahu jediná situace (nadrazi-noc) — musí být
#    citelně těžší než jedna, ne jen o číslovku jiná.
#
# 4) SKRYTÝ ÚTOK / SKRYTÁ IMPROVIZACE — tyto dva kanály engine hlásí zvlášť
#    (`zbran_skryte`, `improv_skryte`) a informovaný bot je dostává s fidelitou
#    `p`. Když jsou true, MUSÍ být v próze („kdyby přituhlo, ať je po ruce…“ /
#    „bude se to muset něčím zamluvit“). Když jsou false, próza stat skrytého
#    slotu NEJMENUJE ANI NENAZNAČUJE: skrytá obrana a skrytý nástroj v telegrafu
#    nemají co dělat. (Dnešní prózy je místy prozrazují — farmar-stodola „o pevné
#    nervy“, mesto-ulicka „skulina se najde jen potají“ — a dávají tak člověku
#    víc než botovi. Hra je pak proti kalibraci lehčí, a to tam, kde už je
#    K1 3p/4p nad stropem.)
#
# 5) VERDIKT ZBRANĚ — VŽDY POSLEDNÍ VĚTA, doslovná, z uzavřeného slovníku.
#    Tenhle kanál se NESMÍ zatmavit: bot ho čte s JISTOTOU (fidelita se na něj
#    neaplikuje, sim/strategies.js:150–164), takže pro jeho ztrátu brána nemá
#    měřidlo. Zdroj pravdy je obsah/stitky.yaml `chovani_dle_typu`, ne typ uzlu
#    odhadem. Slovník (varianta se volí podle derivovaného signálu):
#      A) zbran_projde=ano,        zbran_skryte=false
#         → „Zbraň tu nikoho nevyplaší, ani na očích.“
#      B) zbran_projde=ano,        zbran_skryte=true
#         → „Zbraň tu nikoho nevyplaší a schovaná se vyplatí.“
#      C) zbran_projde=jen_skryte, zbran_skryte=true
#         → „Na očích zbraň všechno pokazí; schovaná může být to jediné, co pomůže.“
#      D) zbran_projde=jen_skryte, zbran_skryte=false
#         → „Kdo tu sáhne pod kabát, popudí ho jen víc, a schovaná zbraň nezmůže nic.“
#    Slovesa a obrazy se smějí přizpůsobit situaci; SMYSL a jeho dvě osy
#    (na očích / potají) se měnit nesmí.
#
# 6) SLOTOVÁ VÝJIMKA (`stitek_citlivy: GANGSTER`) — je-li přítomna, připoj
#    k verdiktu dovětek: „…ale jednomu z nich bouchačka pusu zavře.“
#    Bez toho si próza a strojový signál protiřečí (viz resolve.js:276–282).
#
# --- CO SE NESMÍ PROZRADIT ----------------------------------------------------
# Kotvy, prahy, šum, konkrétní čísla, pásma, obsah lootu ani stat skrytého slotu
# nad rámec kanálu 4. Telegraf říká, CO se blíží, nikdy JAK TĚŽKÉ to je.
#
# --- STOPY STATŮ (autorský slovník obrazů; drží věrnost napříč autory) --------
#   útok        tělo v cestě, chlap plivající si do dlaní, zvednutý hlas,
#               výhružka, dav, „kdo je rychlejší“. POZOR: obraz zbraně smí
#               být jen tam, kde je verdikt A nebo B — jinak svádí ke kartě,
#               která ve viditelné roli auto-failne.
#   obrana      někdo se dívá a čeká, ptá se potřetí na totéž, dlouhé stání,
#               mráz, „nedat na sobě znát“.
#   hodnota     otevřená dlaň, blok pokut, sazba, cena, poplatek, chamtivost.
#   improvizace otázka bez odpovědi, jméno, které si musíte vymyslet, historka,
#               list papíru, který má obstát.
#   nástroj     něco rozbitého / zaseklého / zamčeného / těžkého: závora, prkno,
#               zámek, kolo, šroub; řemeslo a pevná ruka.
#
# --- ROZSAH A TEMPO -----------------------------------------------------------
# 3–5 vět, 260–450 znaků (cíl ~380). Nejvýš JEDNA věta bez kanálu — čistá
# atmosféra je koření, ne náplň.
# Rozpočet prózy na uzel: telegraf + `text` ≤ ~750 znaků. (Od fáze 2.2 se
# vykresluje i `text`; telegraf je scéna PŘEDEM, neosobně a v přítomném čase,
# `text` je táž scéna POTOM, v minulém čase a se jmény. Telegraf nikdy
# nepředjímá výsledek.)
# Důvod limitu: telegraf se čte PŘED KAŽDÝM uzlem. 450 znaků ≈ 20 s čtení
# nahlas × 6–7 uzlů ≈ 2,3 min z 30minutového runu. Dnešních ~210 znaků stojí
# ~1,2 min; ten rozdíl je cena za nález 3 a je to strop, ne cíl.
#
# --- PŘEJÍMACÍ KRITÉRIUM (bez něj se telegraf nezapéká) -----------------------
# ZAKRÝVACÍ ZKOUŠKA: čtenář, který situaci nezná, dostane jen telegraf a
# odpoví: (a) které čtyři věci by si vzal a proč — hodnotí se shoda s derivovaným
# `trend` po slotech; (b) kolik věcí se může pokazit navíc; (c) verdikt zbraně.
# Prahy pro CELOU sadu, měřeno na nejhorší situaci, ne na průměru:
#   (a) trefa trendu per slot   ≥ 0,70   (kanonická fidelita brány)
#   (b) počet skrytých          ≥ 0,80
#   (c) verdikt zbraně          = 1,00   (bot ho čte s jistotou; chyba = přepis)
# Telegraf, který v (a) klesne pod 0,70, se přepisuje — ne rozpočtuje.
```

---

## 3. (B) Tři ukázkové přepisy

### B1 · `most-prohnila-prkna` (lokace) — hráčův vlastní příklad

**Starý** (≈ 210 zn., 3 věty):
> Most přes řeku vrže prohnilými prkny a přehrazuje ho stará závora. Tři viditelné role volají po nářadí a šikovnosti (u jedné obojí zároveň); jedna skrytá se pozná, až bude pozdě couvnout. Zbraně se tu nikdo nelekne.

**Nový** (≈ 400 zn., 5 vět):
> Most přes Mohawk stojí bez údržby od války a příjezd k němu drží zrezivělá závora, kterou roky nikdo nezvedl. Prkna za ní jsou prohnilá tak, že je bude třeba přibít a zároveň podložit něčím, co zrovna leží po ruce. Uprostřed zeje díra a cestu kolem ní si vymyslíte až na místě. Nikdo tu není, takže jedno prkno povolí, až bude pozdě couvnout. Zbraň tu nikoho nevyplaší, ani na očích.

| Kanál (derivovaná hodnota) | Kde to v novém textu je |
|---|---|
| trend #1 `nastroj` (Zvednout závoru) | „zrezivělá **závora**, kterou roky nikdo nezvedl" |
| trend #2 `[nastroj, improvizace]` KOMBI (Zpevnit prkna) | „**prkna** … je bude třeba **přibít a zároveň podložit něčím, co zrovna leží po ruce**" — jedna práce, dva nároky |
| trend #3 `improvizace` (Projet dírou) | „**díra** a cestu kolem ní **si vymyslíte až na místě**" |
| `proti_srsti = 1` | „jedno prkno povolí, **až bude pozdě couvnout**" |
| skrytý stat `obrana` | **záměrně nezmíněn** (kanál 4) |
| `zbran_projde = ano`, `zbran_skryte = false` | slovník A |
| křížová kontrola s `text` | závora ✓ / prkna ✓ / díra ✓ |

**Test hráčova nálezu:** „Nikdo tu není" + tři neživé překážky → tým usoudí, že
není koho uplácet ani s kým se prát → **brokovnici nechá doma**, ačkoli by prošla.
Přesně ta inference, kterou si vyžádal.

### B2 · `urednik-vaha` (npc, zbraň na očích neprojde, a přitom má VIDITELNÝ útok-slot)

**Starý** (≈ 268 zn., 3 věty):
> U váhy sedí úředník s knírkem a hromadou předpisů, brát nesmí a sledují ho shora. Tři viditelné role chtějí papíry, správné nářadí a když nezbude, zvýšený hlas; jedna skrytá drží nervy. Papír tu zmůže víc než olovo — na očích úředníka jen popudí, schovaná nezmůže nic.

**Nový** (≈ 435 zn., 5 vět):
> U silniční váhy sedí úředník s knírkem a předpisem na všechno. Bere jen papíry, a ty vaše nesedí: chce to listinu, která obstojí, a razítko, které v knize chybí a nadělá se leda kusem gumy. Když ani to nezabere, zbude zvednout hlas tak, aby ho slyšeli i shora, odkud úředníka hlídají. Jedna věc se rozhodne bez vás a poznáte ji pozdě. Kdo tu sáhne pod kabát, popudí ho jen víc, a schovaná zbraň nezmůže nic.

| Kanál | Kde to v novém textu je |
|---|---|
| trend #1 `improvizace` (Podstrčit papíry) | „**listina, která obstojí**" |
| trend #2 `nastroj` (Doložit razítko) | „**razítko** … **nadělá se leda kusem gumy**" |
| trend #3 `utok` (Zvýšit hlas) | „zbude **zvednout hlas** tak, aby ho slyšeli i shora" — tlak BEZ zbraně (kritické: zbraň by tu auto-failla) |
| `proti_srsti = 1` | „**Jedna věc** se rozhodne bez vás a poznáte ji pozdě." |
| skrytý stat `obrana` | nezmíněn (starý text ho prozrazoval) |
| `zbran_projde = jen_skryte`, `zbran_skryte = false` | slovník D |
| křížová kontrola s `text` | listina/papíry ✓ · razítko ✓ · hlas ✓ |

*Poznámka k rozlišitelnosti:* sloty 1 a 2 jsou obsahově blízké (obojí „papírování").
Rozlišuje je slovník STOP: **historka/list, co má obstát = improvizace** vs.
**kus gumy a pevná ruka = nástroj**. Nejrizikovější položka zakrývací zkoušky
v celé sadě — měřit mezi prvními.

### B3 · `nadrazi-noc` (lokace, netypicky 2 viditelné + 2 skryté)

**Starý** (≈ 186 zn., 3 věty):
> V noci se protahujete kolem hlídače s lucernou k odstavenému vagonu. Dvě viditelné role chtějí důvtip a nářadí; dvě skryté hlídají klid a záložní řešení. Mezi vagony zbraň nikoho nevyplaší.

**Nový** (≈ 430 zn., 5 vět):
> Peekskillské seřaďoviště po půlnoci, řady odstavených vagonů a mezi nimi se pohupuje lucerna nočního hlídače. Projít kolem něj jde jedině tak, že si na místě vymyslíte, kdo jste a co tu pohledáváte. Pak zbývá vagon, jehož dveře drží zámek, co po dobrém nepovolí. Dvě věci se rozhodnou potmě: jednu poznáte, až bude pozdě, a u druhé půjde o to, kdo je rychlejší, kdyby se hlídač probudil. Zbraň tu nikoho nevyplaší a schovaná se vyplatí.

| Kanál | Kde to v novém textu je |
|---|---|
| trend #1 `improvizace` (Proklouznout kolem) | „**si na místě vymyslíte, kdo jste a co tu pohledáváte**" |
| trend #2 `nastroj` (Vypáčit vagon) | „**zámek, co po dobrém nepovolí**" |
| `proti_srsti = 2` | „**Dvě věci** se rozhodnou potmě: **jednu** … a **u druhé** …" |
| skrytý stat `obrana` (slot 3) | nezmíněn — jen důsledek |
| `zbran_skryte = true` (skrytý slot 4 = útok) | „**kdo je rychlejší, kdyby se hlídač probudil**" — povinné |
| `zbran_projde = ano` + `zbran_skryte` | slovník B |
| křížová kontrola s `text` | hlídač/lucerna ✓ · vagon/dveře ✓ |

*Znaky jsou odhad; přesné číslo doplní obsahové kolo z editoru.*

---

## 4. Dělba próza vs. mechanický řádek — a jedna žádost na fázi 2.2

**Nic se z prózy do anotace nepřesouvá.** Všech šest kanálů zůstává v próze;
mění se jen *přesnost*: próza dává obraz, odvozený řádek dává jméno statu.
Řádek `popisSignalu()` (`prototyp/src/ui/screens/run/commit.js:180–193`)
i anotace `TELEGRAF_DERIVED` (`vysvetleni.js:384`) zůstávají **beze změny
znění** — jsou strojově derivované, takže se s prózou nemohou rozejít,
a jsou tím pádem verifikační vrstva („četl jsem to správně?"), přesně ve
smyslu D36 (próza hlavní, čísla vedle).

**Jediná žádost, a je to změna kontraktu UI:** fáze 2.2 §3 připouští, že se
mechanický řádek schová „na rozklik". **To po tomhle přepisu nesmí být default.**
Próza je nově *jediný* nositel jmen statů pro hráče, který obraz nedekóduje;
řádek schovaný za klik degraduje efektivní `p` u přesně těch hráčů, kteří ho
potřebují nejvíc, a K4d má u 1p rezervu 0,4 b. Návrh: **řádek zůstává viditelný,
ale tlumeně a menším písmem pod prózou** (rozklik jen pro `detail`).

---

## 5. Tři rozhodovací body pro uživatele

**R1 — mlčení o statu skrytého slotu (designér doporučuje přijmout).** Invariant
zakazuje naznačovat skrytý stat mimo `zbran_skryte`/`improv_skryte`. Dnešní próza
ho u ~5 situací prozrazuje. **Je to úbytek proti dnešní próze** — a tím formálně
dotyk s okrajovou podmínkou „kvalita commitu nesmí klesnout", proto se hlásí
nahlas. Argumenty pro: (a) bot to nikdy neměl, takže brána se nehne; (b) hráč je
dnes v tomhle kanálu *lepší* než kalibrovaný bot, což hru zlehčuje tam, kde
K1 3p/4p už breachuje nahoru; (c) „proti srsti" má být to, na co se nedá
připravit. **Varianty:** (i) přijmout mlčení; (ii) nechat prózu bohatou
a **rozšířit derivaci** o `skryte_staty`, aby ji bot dostal — čistší, ale sahá na
engine a zesiluje bota (win-rate nahoru); (iii) nechat stav jak je (nerovnoměrné,
měřicí model rozbitý napříč situacemi).

**R2 — délkový limit je zapsán na dvou dalších místech.** `CLAUDE.md` §Stylová
pravidla („telegraf situace 1–2 věty") a schéma v hlavičce `situace.yaml`.
Přijetí invariantu znamená i **edit `CLAUDE.md`**.

**R3 — telegram jako forma (volitelné).** Telegraf psaný jako skutečný dobový
telegram (hlavička odesílatele, sekaný styl, „STOP"). Plus: dobovost zadarmo,
sekanost drží délku, pevná forma = pevné pozice informace = nejlepší ochrana
fidelity. Minus: koliduje s rámcem „polda u stroje" (design §3, krok 1),
a 19× po sobě hrozí únava z gagu. **Designér nedoporučuje do MVP**, ale je to
levná pozdější varianta, kdyby zakrývací zkouška ukázala, že volná próza
informaci drží hůř než formulář.

---

## 6. (C) Rizika a jak je levně zkontrolovat

| # | Riziko | Směr dopadu na bránu | Levná kontrola |
|---|---|---|---|
| **R-1** | **Pokles efektivní fidelity** trendu (obraz je vágnější než jméno statu) | Nejhorší riziko návrhu. p 0,7 → 0,5 stojí ~2,5 b. celkem, a hlavně **láme K4d u 1p** (6,4 → 4,7 b. proti τ = 6). Zároveň rozevírá K6a. | **Zakrývací zkouška** — nutně lidská, engine prózu nečte. 19 telegrafů, 6–8 čtenářů, ~20 min/čtenář, papír, žádný build. Výstup = `p̂` per kanál per situace → dosadit do `sim/learnability.js` (knob `fidelita` už existuje) a do `sim/run.js` pro K1/K6a. |
| **R-2** | **Nerovnoměrná fidelita napříč situacemi** — model brány předpokládá uniformní `p` | Tichá, nikde se neprojeví jako jedno číslo | Gate na **nejhorší situaci**, ne na průměru. Slovník STOP STATŮ jako autorská pojistka. |
| **R-3** | **Zamlžení verdiktu zbraně** | Bot ho čte s jistotou → **brána pro tuhle ztrátu nemá měřidlo** | Uzavřený slovník (kanál 5) + požadavek 100 % v části (c) zkoušky. |
| **R-4** | Próza říká **víc** než signál (R1 výše) | Zlehčuje hru → tlačí K1 3p/4p dál nad strop | Grep na jména statů + test v `prototyp/test/` proti výstupu `deriveTelegrafSignal`. |
| **R-5** | **Délka × tempo**: od 2.2 se na uzlu vykresluje i `text` | Neměří žádné K; měří to metrika tempa lidské brány | Rozpočet ≤ 750 zn. na uzel + „nejvýš 1 věta bez kanálu". Ověřit stopkami na prvním sezení. |
| **R-6** | **Zdvojení scény** telegraf/`text` — reveal ztratí punc | Riziko pro metriku 2 a 5 | Pravidlo POV a času + křížová kontrola podstatných jmen. |
| **R-7** | Mechanický řádek schovaný za rozklik (2.2 §3) | Snižuje `p` u nejzranitelnějších hráčů | Žádost v §4 — řádek viditelný by default. |
| **R-8** | 5 vět atmosféry svádí k vtipkování; telegraf přebije protokol | Metrika 2 (smích nad protokolem) | Humor telegrafu je v suchosti hrozby, pointy patří protokolu. Kontroluje `protocol-humor-tester`. |

**Co kontrolovat NEJDE, a je poctivé to říct:** kontrafaktuál přes `CONTENT_DIR`
je u čistě prózové změny **no-op** — `grep telegraf prototyp/sim/` nevrací jediné
čtení řetězce. Přenosová cesta próza → brána vede **výhradně přes člověka**
a do simu se vrací jako `p`.

### Předregistrovaná kritéria obsahového kola (napsáno naslepo, před měřením)

1. **Primární:** trefa trendu per slot **≥ 0,70** na **nejhorší** z 19 telegrafů
   (ne průměr). Verdikt zbraně **1,00**. Počet skrytých **≥ 0,80**.
2. **Regresní rozpočet:** dosazením naměřeného `p̂` do simu smí K1 klesnout u 1p
   nejvýš o **2 b.** a K4d (kompetentní − náhodný) u **1p** nesmí klesnout pod
   **τ = 6 b.** — tvrdý strop, ne rozpočet. K6a se nesmí zhoršit vůbec.
3. **Pravidlo výběru:** vyhrává znění s **maximin rezervou** ke hranám, ne to
   první, které projde.
4. **Kdy páku nepoužít:** kdyby zakrývací zkouška vyšla pod 0,70 i po druhém
   přepisu, návrh se **neškrtá ani nerozpočtuje** — hlásí se uživateli jako volba
   mezi „zpět k výčtu (fikce prohrála proti měřidlu)" a „telegram jako pevná
   forma" (R3).
5. **Pořadí hodnoty pro večer u stolu:** čitelnost (metrika 6) > historka
   a předzvěst (nález 3) > komfort obtížnostní laťky. Breach laťky se dá přiznat;
   rozbití K4d u 1p ne.

---

## 7. Consistency-check (cílený na kontrakt telegrafu)

Tři nálezy, **všechny předcházejí tomuto návrhu**:

1. **Počet kanálů — oba kanonické dokumenty jsou zastaralé proti enginu.**
   `design-dokument.md:107–108` + §4.2:138–139 = **3 kanály**;
   `prototyp-mvp.md:91–93` = **3 kanály**; QA invariant v `situace.yaml` =
   **3 kanály**. Proti tomu `resolve.js:283` vrací **6** a UI zobrazuje všech 6.
   `zbran_skryte` (D22) i `improv_skryte` (D25f) vznikly jako **léky na K7/P3**
   a jsou to plnohodnotné informační kanály commitu. **Návrh: doplnit výčet
   kanálů v `prototyp-mvp.md:91–93` a `design-dokument.md:107–108` na šest.**
2. **Limit délky žije na třech místech** — `CLAUDE.md`, schéma v `situace.yaml`,
   nově invariant. Bez editu `CLAUDE.md` budou projektová pravidla tvrdit opak.
3. **`design-dokument.md:161` slibuje přesně tenhle přepis** — §4.5 „typ situace
   má naučitelný trend (NPC ‚všimné' → hodnota; překážka ‚oprava' → nástroj)".
   Dokument slibuje odvození trendu **z fikce**, ale telegraf ho dnes vyjmenovává
   jmény statů, čímž learnabilitu obchází.

---

## 8. Adversariální prověrka (`design-critic`, 2026-07-29)

**Verdikt: SCHVÁLIT S ÚPRAVAMI — šest blokujících. §2 (znění ke vložení) se
v předložené podobě vložit nesmí, §4 se jako změna kontraktu zamítá.**

### Kritické nálezy

**K-1 · Mechanický řádek už v UI JE — čímž padá celý fidelitní rámec návrhu.**
§4 prosí fázi 2.2 o něco, co je hotové: `commit.js:103–113` vykresluje pod
telegrafem `.telegraf-souhrn` („co z toho plyne: …") a `popisSignalu()`
(ř. 188–201) vypisuje **všech šest kanálů plnými jmény statů**. CSS je přesně
„menší a tlumený, D36". **Ověřeno PM u zdroje — sedí.** Důsledek je zásadní:
pokud řádek zůstane vidět, próza není jediný nositel informace, efektivní `p`
je ≈ 1,0 bez ohledu na její znění, a celá měřicí nadstavba (zakrývací zkouška,
prahy, regresní rozpočet, rizika R-1 až R-4) měří scénář, který u stolu nikdy
nenastane. Pokud řádek zmizí, §4 padá a změna je čistě obtížnostní.
**Je to P-rozhodnutí uživatele, které musí padnout před vším ostatním.**

**K-2 · Teze v hlavičce míří opačným směrem než změna.** Dnešní telegraf staty
*jmenuje* („volají po nářadí a šikovnosti") — což invariant sám klasifikuje jako
zakázaná synonyma. Dnešní `p` člověka je tedy blízko 1,0 a nahrazení jmen obrazy
ho může jen **snížit**. Není to páka zavírající K6a, je to fikční změna placená
rizikem obtížnosti. Legitimní obchod — ale nemá se prodávat jako balanční lék.

**K-3 · K4d stálo na čísle přeneseném přes dvě kalibrace bez přeměření.**
Nález sám (vázající je 1p na *kompetentním* rameni, ne 3p na *optimal*) je
správný a patří do kanonu — `prototyp-mvp.md:33` cituje 7,9 z cizího ramene.
**Přeměřeno PM (viz §9) — a rezerva není 0,4 b., ale 18,6 b.**

### Vážné nálezy

| # | Co | Co s tím |
|---|---|---|
| V-4 | Slovník STOP STATŮ není disjunktní: `obrana` („někdo se dívá a čeká") je povinný nábytek každé pašerácké scény a kanál 4 ji zakazuje naznačit; `nastroj` × `improvizace` kolidují (v B1 je „díra v mostě" obraz improvizace, ale podle slovníku nástroj) | Přiznat, že obrazová verze je informačně chudší a řádek je pojistka — nebo slovník přepracovat na disjunktní třídy (kritik nevěří, že to u 5 statů a jednoho žánru jde) |
| V-5 | **Všechny tři ukázky porušují vlastní invariant.** B2: „odkud úředníka hlídají" = obraz skryté obrany (kanál 4 zakazuje), „Bere jen papíry" = obraz `hodnota`, která mezi sloty NENÍ (starý telegraf past zavíral, nový ji otevírá); B3: „noční hlídač" = tentýž leak. Křížová kontrola s `text` je u B2/B3 nadsazená — `text` tam podstatné jméno nemá („podstrčil {VEC}", „kolem něj") | Přepsat všechny tři, dokud nejsou čisté = není doloženo, že invariant je splnitelný |
| V-6 | **Zakrývací zkouška je neproveditelná a vychýlená.** Projekt nemá hráče v dojezdu (proto se přeskočila Fáze 0), autor jako čtenář sloužit nemůže. Měřidlo navíc leakuje měřené (odpověď „po slotech" vyžaduje znát počet slotů a 5 statů) a práh 0,70 je kruhový (0,7 nikdy nebyla naměřená lidská hodnota, je to zvolený sweep knob) | Degradovat z gatu na **spouštěč přepisu**: 2 čtenáři asynchronně, otázka „u kterých překážek nevíš, co po tobě chtějí", každý telegraf s neurčeným slotem se přepisuje. Bez prahů a bez dosazování do simu. **Třetí mrtvá litera v řadě po kalibraci-3 a D34 by byla horší než žádné kritérium** |
| V-7 | **Délkový rozpočet je podhodnocený ~o polovinu.** Česká četba nahlas ~850–1000 zn./min → 450 zn. ≈ 27–32 s, ne 20. S `text` a protokolem na každém uzlu vychází **8–10 min hlasitého čtení z 30min runu** (~30 %). Na opakovaných runech je to strukturální tlak na skimování — a skimování sráží právě to `p`, kvůli kterému stojí celá nadstavba | Strop **350 znaků**, cíl ~300. Rozpočet je **na uzel, ne na telegraf**: roste-li telegraf, krátí se `text` |
| V-8 | Křížová kontrola s `text` tiše rozšiřuje obsahové kolo z 19 telegrafů na 19 telegrafů **+ 19 textů** — a protiřečí si s R-6 (mitigací R-6 je odlišit telegraf od textu, mitigací trendu je opakovat v obou stejná jména) | Degradovat na doporučení, nebo přiznat rozsah a nechat schválit zvlášť |
| V-9 | R1 je argumentován o měřidle, ne o hráči. „Bot to nikdy neměl" je tvrzení o simulaci. Breach je u 3p/4p, ale úbytek informace dopadá **plošně včetně 1p** — a sezení, které nález vygenerovalo, bylo sólo a přerušilo se na tom, že hráč hře nerozumí | Předložit uživateli **bez argumentu (a)** a s poznámkou, že dopad je největší u sólo |
| V-10 | **Léčky a konfrontace nesou sedmý kanál, který invariant nepokrývá** — připomínku pravidla `rusi` („Peníze na něj neplatí" = Malone ruší hodnotu run-wide; „u Brodyho přitáhne dvojnásob pozornosti"), kterou bot zohledňuje. Navíc obě konfrontace jsou `vzdy_pass` → slovník by dal variantu A („zbraň nikoho nevyplaší"), jenže tam je viditelný útok-slot s kotvou 4: zbraň není tolerovaná, je **vyžadovaná**. Dnešní próza to říká líp než slovník | Slovník rozšířit o variantu pro `vzdy_pass` + viditelný útok a o kanál 7 — nebo léčky/konfrontace z invariantu vyjmout a řešit zvlášť. „19" nejsou stejné věci |

### Drobné

- **D-11:** „tvrdý, grep-ovatelný zákaz" grepne 12 slov, ale **žádné z porušení
  nalezených v ukázkách** (dozor = obrana, „bere" = hodnota, díra = nástroj)
  grepem neprojde. Navržený test v `prototyp/test/` hlídá levné porušení a drahé
  nezachytí — buď škrtnout, nebo nedávat za mitigaci R-4.
- **D-12:** povinnost „obrazy v pořadí slotů" nemá výnos — commit je naslepo
  a pořadí rolí je pro něj irelevantní; svazuje větnou stavbu 19 telegrafů za nic.
- **D-13:** invariant tiše zavádí pevnou formu, kterou R3 (telegram) odmítl:
  předposlední věta = počet skrytých, poslední = zbraň ze čtyřprvkového slovníku.
  Navíc mapa výběru uzlu verdikt zbraně **už dnes předesílá** (`mapa.js:19–20`).

### Co kritik schvaluje bez výhrad

- **směr** — nález 3 je platný, telegraf má být předzvěst; design §4.5 to slibuje;
- **uvolnění délky** (v jiném čísle) a s tím související edit `CLAUDE.md`;
- **consistency-check §7 bod 1** (3 kanály vs. 6 v kanonu) — ověřeno, sedí,
  a je to **samostatná oprava kanonu**, ať jde vlastním commitem bez ohledu na
  osud invariantu.

---

## 9. Přeměření K4d (PM, 2026-07-29) — blokující podmínka 1 vyřízena

`node sim/learnability.js 1000` (1000 runů × 4 počty × 2 pronásledovatelé,
seedy 1–1000 = známý příznivý blok D31; obě ramena sdílejí seedy, takže rozdíl
je platný i v jednom bloku):

| varianta | celkem | 1p | 2p | 3p | 4p |
|---|---|---|---|---|---|
| kompetentní (fidelita 0,7) | 71,0 | 58,8 | 67,9 | 78,3 | 79,1 |
| optimal (fidelita 1,0) | 77,4 | 62,4 | 75,2 | 85,1 | 86,8 |
| fidelita 0,5 | 66,5 | 54,6 | 63,7 | 73,7 | 73,9 |
| fidelita 0,3 | 64,2 | 53,2 | 62,2 | 68,8 | 72,8 |
| náhodný commit | 49,0 | 40,2 | 45,8 | 53,7 | 56,3 |

**K4d (kompetentní − náhodný), per count: 1p 18,6 · 2p 22,1 · 3p 24,6 · 4p 22,8
proti τ = 6 b.** Rezerva u 1p tedy **není 0,4 b., ale 18,6 b.** Číslo z
kalibrace-4 (6,4 b.) je po opravách bota (D35) mrtvé — náhodné rameno spadlo
u 1p z 52,7 na 40,2, protože starý bot uměl „náhodně" líp, než měl.

**Dva důsledky pro rozhodování:**

1. **Riziko R-1 je řádově menší, než návrh tvrdil.** I propad fidelity 0,7 → 0,3
   nechává K4d u 1p na 13,0 b., tedy víc než dvojnásobek gatu. „Tvrdý strop
   K4d" jako brzda přepisu telegrafu **neplatí**.
2. **Teze návrhu je nejen zeslabená, ale obrácená** (potvrzuje K-2). Marginální
   hodnota dokonalého čtení telegrafu (optimal − kompetentní) je dnes
   **1p 3,6 · 2p 7,3 · 3p 6,8 · 4p 7,7** — tedy nejmenší u sóla a největší
   u 3p/4p. Lepší telegraf by tlačil vzhůru přesně ty počty, které už dnes
   breachují strop (K1 3p/4p), a K6a by **rozevřel**, ne zúžil. Původní tvrzení
   „+5,1 b. u 1p a ≈ 0 u 3p/4p" je z kalibrace-4 a po D35 neplatí.

*Vedlejší nález k zapsání do kanonu (nezávisle na osudu invariantu):
`prototyp-mvp.md:33` cituje jako nejhorší per-count K4d hodnotu **7,9**, což je
číslo z ramene `optimal`, kdežto gate je definován na rameni `kompetentní`.
Opravit na kompetentní rameno s dnešními čísly.*

---

# VERZE 2 (2026-07-29, po prověrce kritika a rozhodnutí D47)

*Sekce §2, §3, §4 a §6 výše jsou tímto nahrazeny. Verze 1 se nemaže — je
doklad, co se změnilo a proč (konvence projektu).*

## 10. Co se změnilo proti v1

1. **Teze vyškrtnuta, ne zeslabena.** Přepis je věc fikce a čitelnosti
   (nález 3, metrika 6), **ne balanční lék** — marginální hodnota čtení je dnes
   největší u 3p/4p, lepší telegraf by K6a rozevíral.
2. **§4 přepsáno na stav po D47.** Žádost o viditelný řádek stažena. Próza je
   v defaultu jediný nositel; učení mapy fikce→stat se přesouvá na obrazovku
   odhalení (`assign.js`), která ho po 2.2 unese.
3. **„Tvrdý strop K4d" z §6 pryč** — rezerva 18,6 b. u 1p, 13,0 b. i při
   p = 0,3. Ukázáno, proč simulační brána na tuhle změnu není potřeba.
4. **Nové jádro invariantu: „nárok je sloveso, ne kulisa."** Řeší V-4 i V-5
   najednou — obrazy disjunktní nikdy nebudou, ale *nároky* ano. Kulisa
   (úředník, hlídač, zámek) je povolená; kanál se obsadí teprve tím, že próza
   přiřkne **posádce práci**.
5. **Nové pravidlo o záporném tvrzení** — stat se smí vyloučit jen tehdy, když
   není v žádném slotu ani skrytém (jinak je to anti-tell, který bot nemá).
6. **Verdikt zbraně přestal být čtyřprvkovým seznamem** a mluví jen
   o **toleranci** místa, ne o užitečnosti — tím padá V-10 u konfrontací
   (`zatah` a `rival-prepad` v1 znění vyvracely).
7. **Kanál 7 (`rusi`) jen pro 4 telegrafy pronásledovatelů**, klasifikovaný
   správně jako připomínka veřejného pravidla, ne fidelitní kanál.
8. **Délka: strop 400 zn.** (D48 — designér navrhl 350, uživatel posunul na
   400 poté, co PM naměřil, že dvě ze tří ukázek 350 přetahují), cíl ~350,
   rozpočet na uzel 670 zn. Číslo je předběžné do stopek na dalším sezení.
9. **Scope creep vypuštěn** — test v `prototyp/test/`, „obrazy v pořadí slotů",
   povinná křížová kontrola s `text`. Obsahové kolo je **19 telegrafů, žádné
   `text`y**.
10. **D-13 přiznáno a rozvolněno** — pevný je jen smysl verdiktu zbraně;
    pozice poslední věty je doporučení a falzifikovatelná hypotéza zkoušky.
11. **Zakrývací zkouška přepsána** na neleakující formát se **srovnávacím
    ramenem proti dnešní sadě** — tím zmizel kruhový práh 0,70.

## 11. §2 v2 — QA invariant ke vložení do `obsah/situace.yaml`

Nahrazuje blok `# QA INVARIANT TELEGRAFU (D19 + D6)` a mění řádek schématu na
`#   telegraf:  předzvěst před commitem, max 400 zn. (viz QA invariant níže)`.
**Strop upraven na 400 zn. rozhodnutím uživatele (D48)** — číslo se potvrdí
stopkami na dalším sezení lidské brány, do té doby je předběžné.
Platí i pro `lecka`/`konfrontace` v `obsah/pronasledovatele.yaml` (tam navíc
kanál 7).

```yaml
# QA INVARIANT TELEGRAFU (D19 + D6; přepis 2026-07-29 — nález 3 lidské brány, D47)
#
# Telegraf je PŘEDZVĚST, ne výčet rolí. Je to PRÓZA = lidský rendering signálu,
# který engine DERIVUJE ze slotů (`deriveTelegrafSignal`, prototyp/src/engine/
# resolve.js). Signál se NEautoruje — próza jen musí zůstat věrná.
# Od D47 je mechanický výčet („co z toho plyne“) v UI NATIVNĚ SKRYTÝ, takže
# v defaultním režimu je tenhle text JEDINÝ nositel informace před commitem.
# Informaci nese OBRAZ (překážka, člověk, předmět, gesto), ne jméno statu:
# hráč si nároky odvozuje z fikce (learnabilita slíbená v design-dokument §4.5).
#
# --- JÁDRO: NÁROK JE SLOVESO, NE KULISA ---------------------------------------
# Scéna smí obsahovat cokoli — úředníka, který se dívá, zámek, blok pokut. Kulisa
# NIC neprozrazuje. Kanál je „obsazen“ teprve tím, že próza přiřkne POSÁDCE práci
# („bude třeba…“, „zbude…“, „jde to jedině tak, že…“). Z toho plynou dvě pravidla,
# ze kterých je odvozeno všechno ostatní:
#   (A) POKRYTÍ  — každý VIDITELNÝ slot má v próze právě jeden nárok.
#   (B) ČISTOTA  — próza nepřiřkne posádce žádný nárok, který není slotem.
# Porušení (B) je dražší než porušení (A): otevírá past (tým committne kartu na
# poptávku, která ve slotech není), kdežto (A) jen zdražuje jeden slot.
# Pořadí nároků je VOLNÉ — commit je naslepo, pořadí rolí je pro něj irelevantní.
#
# --- ZÁPORNÉ TVRZENÍ (povolené, cenné, omezené) --------------------------------
# Stat se smí výslovně VYLOUČIT („peníze si vzít netroufne“, „tady se nikdo nepere“)
# — ale JEN stat, který není v žádném slotu, ani skrytém, a nejvýš jednou za
# telegraf. Bot celý trend zná, takže tím člověk nedostane víc než on. Zákaz
# u skrytých slotů je proto, aby próza neodváděla od toho, co se pokazí.
#
# --- ŠEST KANÁLŮ, KTERÉ PRÓZA MUSÍ NÉST (tolik jich derivuje engine) ----------
# 1) TREND — pravidlo (A) výše. Obraz je předmět, člověk nebo gesto, nikdy
#    abstrakce; jeden slot = jeden nárok, dva obrazy na týž slot svedou tým dát
#    tam dvě karty. Slovník NÁROKŮ níže.
# 2) KOMBI SLOT (`stat: [a, b]`) — JEDEN nárok se dvěma požadavky výslovně
#    spojenými do JEDNÉ práce („přibít a zároveň podložit něčím, co leží po ruce“).
#    Nikdy jako dvě práce vedle sebe.
# 3) POČET SKRYTÝCH (`proti_srsti`) — číslovkou a fikcí, spočítatelně, bez slova
#    „skrytá“ („Jedno prkno povolí, až bude pozdě couvnout.“ / „Dvě věci se
#    rozhodnou potmě…“). Dvě skryté role má jediná situace (nadrazi-noc) — musí
#    být citelně těžší, ne jen o číslovku jiná.
# 4) SKRYTÝ ÚTOK / SKRYTÁ IMPROVIZACE (`zbran_skryte`, `improv_skryte`) — když
#    jsou true, MUSÍ v próze být („kdyby přituhlo, ať je po ruce…“ / „bude se to
#    muset něčím zamluvit“). Jsou to JEDINÉ skryté sloty, o kterých se mluví.
#    O statu jiného skrytého slotu se MLČÍ (D47/R1) — ani kladně, ani záporně.
#    Skrytá obrana a skrytý nástroj v telegrafu nemají co dělat.
# 5) VERDIKT ZBRANĚ — jedna věta, smysl z uzavřené mřížky, doporučeně poslední
#    (viz POZNÁMKA K FORMĚ). Mluví VÝHRADNĚ o toleranci místa, nikdy o tom, jestli
#    se zbraň hodí — to je práce trendu. Zdroj pravdy je obsah/stitky.yaml
#    `chovani_dle_typu`, ne typ uzlu odhadem.
#      zbran_projde=ano,        zbran_skryte=false  → „Zbraň tu nikoho nevyplaší.“
#      zbran_projde=ano,        zbran_skryte=true   → „Zbraň tu nikoho nevyplaší
#                                                     a schovaná se vyplatí.“
#      zbran_projde=jen_skryte, zbran_skryte=true   → „Na očích zbraň všechno
#                                                     pokazí, potají může být to
#                                                     jediné, co pomůže.“
#      zbran_projde=jen_skryte, zbran_skryte=false  → „Sáhnout tu pod kabát
#                                                     jen popudí; a schovaná
#                                                     zbraň nezmůže nic.“
#    Slovesa a obrazy se smějí přizpůsobit situaci; SMYSL a jeho dvě osy
#    (na očích / potají) se měnit nesmí. Ověřeno proti všem 19 situacím.
# 6) SLOTOVÁ VÝJIMKA (`stitek_citlivy: GANGSTER`) — je-li přítomna, dovětek
#    k verdiktu: „…ale jednomu z nich bouchačka pusu zavře.“ Bez toho si próza
#    a strojový signál protiřečí (resolve.js:276–282).
# 7) JEN V `lecka`/`konfrontace`: PŘIPOMÍNKA PRAVIDLA `rusi` daného pronásledovatele
#    („Peníze na něj neplatí.“ / „u Brodyho přitáhne každý výstřel olovo dvojnásob“).
#    NENÍ to sedmý derivovaný kanál — pravidlo je run-wide a viditelné od startu,
#    engine i bot ho aplikují bez ohledu na prózu. Je to připomínka ve chvíli, kdy
#    je nejdražší na ni zapomenout; formuluje se fikcí, nikdy zněním pravidla.
#
# --- CO SE NESMÍ PROZRADIT ----------------------------------------------------
# Kotvy, prahy, šum, konkrétní čísla, pásma, obsah lootu ani stat skrytého slotu
# nad rámec kanálu 4. Telegraf říká, CO se blíží, nikdy JAK TĚŽKÉ to je.
#
# --- ZÁKAZ META-SLOVNÍKU (autorský checklist, ne CI test) ----------------------
# V telegrafu se NESMÍ objevit: „role“, „slot“, „viditeln*“, „skryt*“, „stat“,
# „práh“, „kotva“, „nároky“, jména statů (útok / obrana / hodnota / improvizace /
# nástroj ani zjevná synonyma „nářadí“, „důvtip“, „šikovné ruce“) a číslovky ve
# spojení s rolemi. Výjimka: „na očích“ / „potají“ ve verdiktu zbraně.
# (Grep tohle chytí, ale drahá porušení — falešná poptávka, leak skrytého slotu —
# grepem NEjdou. Proto je to checklist autora a recenzenta, ne strojová brána.)
#
# --- SLOVNÍK NÁROKŮ (klíčem je SLOVESO, podstatné jméno je jen kotva) ----------
#   utok         posádka musí TLAČIT: prorazit, zvýšit hlas, být rychlejší,
#                postavit se, zastrašit gestem. Obraz zbraně smí být použit JEN
#                tam, kde je zbran_projde=ano — jinde svádí ke kartě, co auto-failne.
#   obrana       posádka musí VYDRŽET a nedat znát: ustát nápor, nemrknout,
#                držet nervy, stát a čekat. POZOR: NPC, který se dívá, sám o sobě
#                obranu NEobsazuje (viz JÁDRO) — obsadí ji až demand posádce.
#   hodnota      posádka musí DÁT něco, co má cenu: zaplatit, podmáznout, sazba,
#                poplatek, otevřená dlaň, blok pokut.
#   improvizace  NEEXISTUJE správná věc: musí to jen OBSTÁT. Historka, jméno,
#                list papíru, cesta vymyšlená až na místě, zamluvit to.
#   nastroj      SPRÁVNÁ věc existuje a musí se správně použít: závora, zámek,
#                prkno, kolo, šroub; přibít, vypáčit, spravit, odsunout.
#
# --- KOLIZE A ROZHODOVACÍ PRAVIDLA (slovník NENÍ plně disjunktní) --------------
#   utok × obrana        — kdo jedná první? Posádka tlačí = útok; posádka drží
#                          nápor = obrana. Když věta unese obojí, dopiš „první“
#                          (útok) nebo „vydržet / nedat na sobě“ (obrana).
#   nastroj × improvizace— existuje ve scéně věc, která to řeší? Ano (zámek→páčidlo)
#                          = nástroj. Ne, musí to jen projít jako pravé = improvizace.
#                          Platí-li obojí, patří to do KOMBI slotu, nebo je slot
#                          špatně naautorovaný.
#   hodnota × improvizace— dostane protistrana VĚC (peníze, zboží)? = hodnota.
#                          Jen slova? = improvizace.
#   ZBYTEK, KTERÝ DISJUNKTNÍ NEBUDE: NPC jako kulisa je v pašerácké scéně
#   nevyhnutelné a čtenář si ho může přečíst jako poptávku po obraně. Invariant to
#   NEZAKAZUJE (bez lidí by scény nešly psát) a NEPŘEDSTÍRÁ, že to vyřešil —
#   je to hlavní položka zakrývací zkoušky (§13).
#
# --- POZNÁMKA K FORMĚ (přiznaná, ne skrytá) -----------------------------------
# Invariant fixuje JEDNU věc: smysl verdiktu zbraně z uzavřené množiny. Pozice
# (poslední věta) je DOPORUČENÍ, ne pravidlo — poslední věta se pamatuje nejlíp
# a verdikt je jediný kanál, jehož chybné čtení stojí auto-fail karty. Typové
# pravidlo přitom hráč zná už z mapy (mapa.js:19–20), takže telegraf ho většinou
# potvrzuje a přidává jen výjimku. Je to falzifikovatelná hypotéza: ukáže-li
# zakrývací zkouška, že čtenáři verdikt trefí bez ohledu na pozici, doporučení
# padá. Zbytek telegrafu je volná próza — pevná forma (telegram) byla zamítnuta.
#
# --- ROZSAH A TEMPO -----------------------------------------------------------
# Telegraf: 3–5 vět, STROP 400 znaků, cíl ~350 (D48; předběžné číslo, potvrdí
# se stopkami na dalším sezení lidské brány). Nejvýš JEDNA věta bez kanálu.
# Rozpočet na UZEL: telegraf + `text` ≤ 670 zdrojových znaků. Roste-li telegraf,
# krátí se `text` (plněné mezery ho ještě prodlouží o ~25 %).
# Důvod: česká četba nahlas ~850–1000 zn./min → 400 zn. ≈ 24–28 s, a na uzlu se
# navíc čte `text` i protokol. Bez stropu vychází 8–10 min hlasitého čtení
# z 30minutového runu a hráči začnou skimovat — což sráží přesně tu čitelnost,
# kvůli které se telegraf přepisuje.
# Telegraf je scéna PŘEDEM: neosobně, v přítomném čase, nikdy nepředjímá výsledek.
# `text` je táž scéna POTOM: v minulém čase a se jmény. (Doporučení, ne pravidlo:
# podstatné jméno kotvy z telegrafu se hodí zopakovat i v `text` — tím se hráč učí
# mapu fikce na staty. Nespouští to přepis pole `text`.)
#
# --- PŘEJÍMACÍ KRITÉRIUM ------------------------------------------------------
# Telegraf se nezapéká bez zakrývací zkoušky — protokol, vzorek a rozhodovací
# pravidla viz technika/telegraf-invariant-navrh-2026-07-29.md §13.
```

## 12. §3 v2 — tři ukázkové přepisy

*Sloty ověřeny PM proti `obsah/situace.yaml`; délky změřeny (viz §14).*

### B1 · `most-prohnila-prkna` (lokace; nastroj / KOMBI / improvizace / **skrytá obrana**)

> Příjezd na most přes Mohawk drží zrezivělá závora, kterou roky nikdo nezvedl.
> Prkna za ní jsou prohnilá: bude je třeba přibít a zároveň podložit něčím,
> co leží po ruce. Uprostřed zeje díra a cestu kolem ní si vymyslíte až na
> místě. Jedno prkno povolí, až bude pozdě couvnout. Zbraň tu nikoho nevyplaší.

**Co v něm záměrně NENÍ:** v1 měl „Nikdo tu není" — to je *záporné tvrzení
o obraně*, a obrana tu skrytým slotem JE. Nové pravidlo to zakazuje jako
anti-tell, který bot nemá. Hráčova inference „brokovnici nechat doma" se
neztrácí: nese ji **absence jakéhokoli útok-nároku v trendu** plus verdikt,
který mluví jen o toleranci, ne o užitečnosti.

### B2 · `urednik-vaha` (npc; improvizace / nastroj / **viditelný utok** / skrytá obrana)

> U silniční váhy sedí úředník s předpisem na všechno. Peníze si vzít
> netroufne; chce listinu, která obstojí, a razítko, které v knize chybí
> a nadělá se leda kusem gumy. Když ani to nepomůže, zbude na něj zvýšit hlas.
> Jedna věc se rozhodne bez vás a poznáte ji pozdě. Sáhnout tu pod kabát jen
> popudí, a schovaná zbraň nezmůže nic.

**Opravy proti v1:** vypadlo „odkud úředníka hlídají" (dozor nad úředníkem
implikuje, že posádka musí udržet tvář = leak skryté obrany) a „Bere jen
papíry" (čte se jako poptávka po `hodnota`, která tu není). Nové znění dělá
totéž **záporem**, který je pod novým pravidlem legální — `hodnota` ověřeně
není v žádném slotu.
**Nejcennější telegraf sady:** trend explicitně volá po útoku a verdikt
zároveň zakazuje zbraň. Kdo přečte půlku, committne bouchačku do viditelné
role a dostane auto-fail.

### B3 · `nadrazi-noc` (lokace; improvizace / nastroj viditelné, **skrytá obrana + skrytý útok**)

> Na seřaďovišti v Peekskillu se mezi odstavenými vagony pohupuje lucerna
> nočního hlídače. Projít kolem něj jde jedině tak, že si na místě vymyslíte,
> kdo jste. Pak zbývá vagon, jehož dveře drží zámek, co po dobrém nepovolí.
> Dvě věci se rozhodnou potmě — a u jedné z nich půjde o to, kdo je rychlejší.
> Zbraň tu nikoho nevyplaší a schovaná se vyplatí.

**K výtce „noční hlídač = leak skryté obrany":** hlídač tu není kulisa navíc,
je to **kotva viditelného improvizačního nároku** — bez něj nemá „vymyslet si,
kdo jste" komu. Pod pravidlem JÁDRO to leak není (próza nepřiřkne posádce
práci typu „vydržet a nedat znát"). Je to ale přesně ten zbytkový případ,
o kterém invariant přiznává, že disjunktní není — proto patří do měřeného
vzorku zkoušky.

## 13. §4 a §6 v2 — próza jako jediný nositel, rizika, zakrývací zkouška

### 13.1 Kde se hráč učí mapu fikce → stat, když řádek nevidí

**Ne v telegrafu — na obrazovce odhalení.** `assign.js` od fáze 2.2 vykresluje
prózu situace s klikatelnými mezerami a pod ní tlumený rozpis rolí s plnými
jmény statů, prahem a viditelností, plus anotace kotvy a šumu. Smyčka učení je
tedy *obraz v telegrafu → commit naslepo → odhalení, které obraz pojmenuje*.
To je silnější učení než souběžný překlad v telegrafu (hráč nejdřív hádá, pak
dostane odpověď) a je to přímá odpověď na metriku 6. **Bez téhle vazby by
skrytí řádku bylo neúnosné — s ní je zdravé.**

### 13.2 Měřený důsledek skrytí řádku (a proč se z něj nesmí stát designový cíl)

Skrytí řádku je **jediná páka na K1 3p/4p, kterou sim umí modelovat** (knob
`fidelita` je přesně model „jak dobře hráč přečte předzvěst"). Z dat §9:

| režim | model | 1p | 4p | rozpětí (K6a) |
|---|---|---|---|---|
| řádek zapnutý | fidelita 1,0 | 62,4 | 86,8 | 24,4 |
| řádek skrytý, próza výborná | ~0,7 | 58,8 | 79,1 | 20,3 |
| řádek skrytý, próza průměrná | ~0,5 | 54,6 | 73,9 | 19,3 |

- **„Vysvětlivky zapnuté" nejsou neutrální přístupnost, je to EASY režim**
  a v UI se tak musí jmenovat (u 4p posílá win-rate na 86,8 %). Volitelná
  obtížnost (D25d) je pro to správná kolonka; „nastavení zobrazení" ne.
- **Přepis telegrafu nemá vzhůru kam K1 zhoršit** — efektivní `p` je po skrytí
  řádku shora omezená dneškem, takže riziko je jednostranné (dolů) a dole je
  13 b. rezervy v K4d i při p = 0,3. **Simulační brána na tuhle změnu není
  potřeba, je výhradně lidská.**
- **Zákaz, který z toho plyne:** vágnější próza se **nesmí** používat jako
  balanční páka. Vyměnila by měřenou metriku za neměřitelnou ztrátu
  porozumění — a na porozumění první sezení lidské brány havarovalo.

### 13.3 Rizika

| # | Riziko | Kontrola |
|---|---|---|
| **R-1** | Pokles čitelnosti (obraz je vágnější než jméno statu). Na bránu dopadá jednosměrně dolů; skutečná cena je metrika 6 a zábava u stolu | Zakrývací zkouška §13.4 |
| **R-2** | **Falešná poptávka** (porušení pravidla B) — nejdražší jednotlivá chyba: tým committne kartu naprázdno a nedozví se proč | Vlastní metrika zkoušky, ne jen „trefil trend" |
| **R-3** | Zatemnění verdiktu zbraně — bot ho čte s jistotou, brána pro tu ztrátu měřidlo nemá | Uzavřená mřížka + nulová tolerance drahé chyby |
| **R-4** | Nerovnoměrná čitelnost napříč situacemi | Rozhodovací pravidlo **per telegraf**, ne na průměru sady |
| **R-5** | Délka × tempo | Strop 400 zn. + rozpočet 670 zn./uzel (D48); stopky na dalším sezení potvrdí nebo srazí |
| **R-6** | Zdvojení scény telegraf/`text` | Odlišení POV a času; opakuje se podstatné jméno, ne konstrukce |
| **R-7** | 5 vět svádí k vtipkování, telegraf přebije protokol | Humor telegrafu je v suchosti hrozby; kontroluje `protocol-humor-tester` |
| **R-8** | **Kolize kulisy s obranou** (přiznaný nedisjunktní zbytek) | Hlavní položka vzorku zkoušky; padne-li, je to nález o slovníku, ne o jednom telegrafu |

**Vypuštěno proti v1 (scope creep):** test v `prototyp/test/`, povinnost
„obrazy v pořadí slotů", povinná křížová kontrola s polem `text`. Obsahové
kolo je **19 telegrafů, žádné `text`y**.

### 13.4 Zakrývací zkouška — přepsaný, neleakující protokol

**Vada v1:** otázka „které čtyři věci by sis vzal, hodnoceno po slotech"
prozrazovala počet slotů i jména statů, takže by měřila systematicky výš než
realita; práh 0,70 byl kruhový.

**Co čtenář dostane:** jeden odstavec pravidel (parta pašuje chlast; před
každou překážkou přijde telegraf; pak posádka pošle **čtyři věci** ze svých
kufrů, ještě než uvidí, co se přesně děje). **Nedostane:** jména ani počet
statů, počet nároků, ani slovo „slot"/„role".

**Otázky** (papír, asynchronně, ~20–25 min):
- **Q1 — poptávka, volným textem:** „Vypiš vlastními slovy, co po vás tohle
  místo chce. Jedna odrážka = jedna věc, kterou tam někdo musí umět nebo mít."
  Bez zadaného počtu.
- **Q2 — počet skrytých:** „Kolik věcí se tam podle tebe může pokazit tak, že
  to telegraf neřekl?" Jen číslo.
- **Q3 — zbraň:** „Vzali byste bouchačku? *vytaženou / schovanou / vůbec*."

**Kódování** (dělá autor obsahu, ne autor invariantu, a nezná, kterou verzi
čte): odrážka se mapuje na stat podle slovníku nároků, a **jde-li namapovat na
dva staty, počítá se jako netrefa** (konzervativní). Měří se **pokrytí**
(kolik viditelných slotů má jednoznačnou odrážku), **falešná poptávka**
(odrážky mířící na nárok, který není v žádném slotu), **|odhad − skutečnost|**
u skrytých a **verdikt zbraně** ve třech třídách: shoda / laciná chyba (nechal
doma, kde by prošla) / **drahá chyba** (vzal vytaženou tam, kde propadá).

**Vzorek:** místo 19 × N čtenářů měř **8 telegrafů vybraných na těžké případy**
(KOMBI slot, situace se dvěma skrytými, po jednom pro každý ze čtyř řádků
mřížky zbraně, slotová výjimka `nadrazi-vypravci`, kolize nástroj × improvizace
`urednik-vaha`). Každý telegraf čtou **3 čtenáři v nové verzi a 3 ve staré**;
každý čtenář dostane od jednoho telegrafu jen jednu verzi. 6 čtenářů to pokryje.
Autor nesmí být čtenář. Zbylých 11 projde jen autorský a recenzní checklist.
**Staré rameno je tam schválně** — je to sada, kterou bychom jinak vydali,
takže se srovnává proti reálné alternativě místo proti vymyšlenému číslu.

### 13.5 Přejímací kritérium (předregistrováno, psáno před měřením)

**Spouštěč přepisu, per telegraf:**
1. Slot, který **≥ 2 ze 3** čtenářů nové verze nepojmenovali → přepis.
2. **Falešná poptávka od ≥ 2 ze 3** → přepis (dražší chyba, R-2).
3. Odhad počtu skrytých mimo ±1 u **≥ 2 ze 3** → přepis.

**Brána sady (zapéct / nezapéct):**
4. **Drahá chyba verdiktu zbraně: nula.** Jediné absolutní číslo v kritériu
   a jediné obhájené důsledkem (auto-fail karty), ne volbou. Laciné chyby se
   počítají a hlásí, ale zapečení nebrání.
5. **Nová sada nesmí být proti staré horší** v pokrytí ani ve falešné poptávce,
   a aspoň v jedné z nich musí být lepší — jinak se vrací stará znění
   **položku po položce**, ne celá sada.
6. **Pravidlo výběru:** vyhrává znění s **maximin rezervou** ke spouštěčům 1–3.

**Co se do simu NEdosazuje:** naměřené pokrytí **není** `p̂`. Mapování
„čtenář nepojmenoval nárok" → „bot si domyslí uniformně náhodný stat" není
ověřené a v1 ho sliboval neprávem. Sim se použije jen jako citlivostní
kontrola ve zprávě z kola. **Žádné K se tímhle kolem neotvírá ani nezavírá.**

**Kdy páku nepoužít:** prohraje-li nová sada v bodě 5 i po druhém přepisu,
návrh se neškrtá ani nerozpočtuje — hlásí se uživateli jako volba mezi „zpět
k výčtu nároků jmény (a pak znovu otevřít viditelnost mechanického řádku)"
a „telegram jako pevná forma".

## 14. Ověření v2 (PM, 2026-07-29)

**Sloty ověřeny proti `obsah/situace.yaml` — všechny tři ukázky v2 sedí:**
`most-prohnila-prkna` má skrytou `obrana` (vypuštění „Nikdo tu není" je tedy
správná oprava), `urednik-vaha` nemá `hodnota` v žádném slotu (zápor „Peníze
si vzít netroufne" je legální) a `nadrazi-noc` má skrytý `utok`, takže věta
„kdo je rychlejší" je povinná, ne ozdobná. Verdikty zbraně sedí ve všech třech.

**Délky změřeny a NESEDÍ — dvě ze tří ukázek přetahují vlastní nový strop:**

| ukázka | uvedeno v návrhu | změřeno | proti stropu 350 (návrh) | proti stropu 400 (D48) |
|---|---|---|---|---|
| B1 `most-prohnila-prkna` | ≈ 301 | **336** | ✅ | ✅ |
| B2 `urednik-vaha` | ≈ 330 | **363** | ❌ +13 | ✅ |
| B3 `nadrazi-noc` | ≈ 332 | **385** | ❌ +35 | ✅ |

Tvrzení „je doloženo, že 6 kanálů se do 350 znaků vejde" **doloženo nebylo**
— vejde se jich tam 5 (B1 nemá `zbran_skryte`). Není to fatální, ale je to
**stejná třída chyby jako v1**: uvedená čísla nikdo neověřil. Poučení pro
obsahové kolo: **každý telegraf se měří, ne odhaduje.**

## 15. Rozhodnutí uživatele k v2 (D48, 2026-07-29)

1. **Strop 400 znaků** (ne 350) — cíl ~350, rozpočet na uzel 670 zn. Všechny
   tři ukázky tím projdou beze změny. Číslo je **předběžné**: potvrdí ho, nebo
   srazí, stopky na dalším sezení lidské brány (R-5).
2. **Onboarding: mechanický řádek je viditelný na PRVNÍM uzlu prvního runu**,
   dál už ne. Nesahá to na D47 (řádek zůstává nativně skrytý) — jen se
   onboarding neplatí ztrátou prvního uzlu. Přibírá se k zadání UI přepínače.
3. **Obsahové kolo se OTEVÍRÁ** — 19 telegrafů (15 situací + 4 léčky/
   konfrontace) dle v2 invariantu, pak review kolečko. Druhá prověrka kritika
   před psaním se nekoná (v2 na jeho šest bodů odpovídá).

## 16. Dodatky do §11, které vyplynuly z prvního obsahového kola

*Zapracovat do znění invariantu PŘED vložením do `obsah/situace.yaml`. Všechny
tři vznikly tím, že se invariant poprvé použil na 19 textů — bez nich se totéž
selhání zopakuje při každém dalším obsahovém kole.*

1. **Ke SLOVNÍKU NÁROKŮ:** jeho příklady jsou **definice nároku, ne doporučené
   znění**. První kolo sáhlo po formulaci ze slovníku místo po obrazu ze scény
   — „vymyslíte / rozhodne se až na místě" **10×**, „co obstojí" 5×, „nemrknout
   ani okem / nedat na sobě nic znát" 6×, „dlaň" 4×. Devět z devatenácti
   telegrafů mělo improvizaci i obranu obsazenou stock frází současně.
   **Strop: žádná fráze ze slovníku se v sadě neopakuje víc než 2×.**
2. **K pravidlu (A) POKRYTÍ — markér hranice nároku.** Invariant zakazuje „dva
   obrazy na týž slot" a předepisuje KOMBI jako „jednu práci se dvěma
   požadavky", ale nedefinuje, čím se to od sebe pozná. Doplnit: KOMBI = „a
   zároveň / a přitom" v téže klauzuli · dva různé sloty = oddělené **aktérem
   nebo tečkou** („Někdo… jiný…"), nikdy jen spojkou „a" · jeden slot = jedno
   sloveso, jeden objekt.
3. **K R-7 (§13.3) — provozuschopná dělicí čára místo „humor je v suchosti
   hrozby":** humor telegrafu smí plynout ze **suchého pojmenování hrozivé
   věci** („parta nadšených občanů" = lynčující dav pojmenovaný úředně,
   „úředník s předpisem na všechno"). Nesmí plynout ze **srovnání, pomlčkové
   pointy ani komentáře k NPC** — to je motor protokolu a každý takový vtip
   v telegrafu je smích, který protokol už nevydělá.

**Co se ZATÍM nezapéká do `obsah/`:** znění invariantu se do hlavičky
`obsah/situace.yaml` vkládá **až spolu s přepsanými telegrafy**, v jednom
commitu — aby v repu nevzniklo pravidlo, které 15 sousedních záznamů porušuje.
Týž commit ponese i opravu `CLAUDE.md` (§Stylová pravidla dnes říkají
„telegraf situace 1–2 věty", což bude s invariantem v přímém rozporu).

---

*Zdroje: `obsah/situace.yaml` · `obsah/pronasledovatele.yaml` ·
`prototyp/src/engine/resolve.js:260–283` · `prototyp/sim/strategies.js:150–164,
400–428` · `prototyp/sim/learnability.js` ·
[[kalibrace-4-2026-07-27|technika/kalibrace-4-2026-07-27.md]] §3.3 ·
`prototyp/src/ui/screens/run/commit.js:180–193` ·
[[faze-2.2-navrh-2026-07-29|technika/faze-2.2-navrh-2026-07-29.md]].*
