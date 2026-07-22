# První hratelný prototyp — definice MVP
**Cíl: ověřit, že core loop baví 4 lidi u stolu.** Nic víc. Vše ostatní (online,
UGC, Steam, grafika) je záměrně mimo rozsah.

**Hypotéza k ověření:** „Hráči se hádají o karty, smějí se protokolu a chtějí
dobrovolně další run." Pokud tohle neplatí, žádná další vrstva to nezachrání.

---

## Fáze 0 — Simulace a digitální validace (papírový playtest přeskočen)

**Rozhodnutí 2026-07-22:** papírový playtest se přeskakuje — nejsou lokální hráči
v dojezdu, jde se rovnou na prototyp. Pojistku, kterou měl papír (de-risk designu
před kódem), nahrazuje simulace + první digitální/remote sezení. Původní znění
papírové fáze je v historii v patičce; k papíru se lze vrátit, až budou hráči.

- **Simulace runů** (agent `playtest-facilitator`) — odehrává runy proti resolučnímu
  systému a hledá balanční a tempové problémy (prahy, snowball od ~3. uzlu,
  ekonomika beden, mrtvé volby, dominantní strategie) dřív, než se čísla zabetonují
  do prototypu.
- **Hranice poctivosti:** simulace ověří matematiku a tempo, NE zábavnost, hádku
  ani smích nad protokolem — to čeká na lidskou bránu.
- **Kvalita českého AI humoru** (největší riziko) se testuje agentem
  `protocol-humor-tester` nad promptem `prompty/protokol.md`, ne až u stolu.

**Go/No-Go (dvoustupňové):**
1. *Simulační brána* — měřitelná kritéria (fixována 2026-07-22, referenční
   4hráčový run; brána = PROŠLA, když platí všechna):
   - DORUČENO při realistické (cíle-driven) i kompetentní hře **45–70 %**;
   - snowball: přírůstek zranění per uzel roste od **3. uzlu**;
   - první práh Žáru padá medián **uzel 3–4**;
   - žádná rozumná strategie nemá DORUČENO **>85 %**;
   - žádný mechanický cíl není splňován **<5 % ani >95 %**.
2. *Lidská brána* (po prototypu, solo/remote/async dle Fáze 2) — hráči se hádají
   o karty, čtou protokol nahlas se smíchem, dají si dobrovolně další run. Bez
   tohoto žádná další vrstva hru nezachrání. Simulace tohle neprokáže.

## Fáze 1 — Digitální prototyp v0.1 (odhad 2–4 týdny)

### Technologie
- **Lokální webová aplikace** (single-page, vanilla JS/Vite) — nejrychlejší iterace.
  Rozhodnutí o enginu (Godot apod.) až po validaci loopu.
- **Hot-seat only**, jeden počítač, odkryté karty. Tajné cíle: hráč si cíl zobrazí
  kliknutím „Jsem Jan" na začátku (ostatní se nedívají).
- LLM: levný model (třída Haiku), **1 volání na uzel**, strukturovaný vstup
  (uzel + výsledek mechaniky + stav postav), výstup 3–5 vět. Timeout 10 s →
  **fallback šablona** (hra nikdy nečeká na síť). Logovat všechny prompty a výstupy.
- Grafika: placeholder (text + rámečky). Jediný povinný efekt: **psací stroj
  vyklepává protokol postupně** — je to nosič zážitku i maska latence.

### Resoluční systém (výchozí čísla, ladit playtestem)

- **Karta:** tag (Násilí / Lest / Úplatek / Útěk) + síla 1–3.
- **Ruka:** 5 karet; po každém uzlu si hráč dolízne zpět na 5.
- **Uzel:** afinity k tagům (−2 / 0 / +2), viditelné hráčům předem.
- **Hod postavy:** d6 + síla karty + afinita − počet zranění postavy (max −3).
  - **8+** … úspěch
  - **5–7** … úspěch za cenu — **reálné zranění** (+ poznámka do spisu).
    Žádná „poznámka zdarma": cena musí bolet, jinak je hra bez tření
    (změřeno simulací 2026-07-22).
  - **≤4** … selhání + zranění + tvrdost uzlu
- **Tagová textura (ridery)** — mechanická realizace textury z design dokumentu
  §4.5; každý tag řeší selhání jinak:
  - **Násilí — síla za Žár:** karty Násilí mají nejvyšší síly v sadě a **všechny
    jsou hlučné** (`hlucna`, +1 Žár za zahrání). Žádná jiná úleva.
  - **Úplatek — jistota za zdroje:** skončil-li hod selháním (≤4), smí hráč
    **odhodit 1 týmovou bednu a povýšit výsledek na „úspěch za cenu" (5–7)**.
    Dobrovolné; platí se, jen když to zachrání.
  - **Útěk — bezpečí za bedny:** při selhání (≤4) s kartou Útěk **volí vlastník**:
    utrpí zranění, NEBO tým ztratí 1 bednu (nemá-li tým už žádnou, zranění proběhne
    normálně). Tvrdost uzlu se uplatní i tak.
  - **Lest — nekrytá variance:** žádný rider. Lest neplatí Žár ani bedny, ale
    nemá žádnou ochranu — selhání dopadá plnou vahou.
- **Tvrdost uzlu:** co navíc stojí selhání u tohoto protivníka: `bedna`
  (−1 bedna), `zar` (+2 Žár), `zraneni` (druhé zranění).
- **Náklad:** tým veze 6 beden. 0 beden = run končí (razítko NEVYŘEŠENO).
- **Žár (0–10):** týmová stopa pozornosti zákona, viditelná na okraji spisu.
  **+1 za uzel, v němž tým aspoň jednou selhal** (počítá se **max 1× za uzel**,
  nezávisle na počtu hodů/hráčů — práh nemá škálovat s velikostí party),
  **+1 za každou zahranou hlučnou kartu** (`hlucna`, per karta), **+2** za vybrané
  výsledky uzlů. Pozn.: tvrdost `zar` (+2, viz výše) se přičítá **za každé
  selhání** — to je záměrně per hod, na rozdíl od základního +1 za uzel. Prahy:
  **4** = příští volba cesty vede přes **Zátah — nahradí obě nabízené cesty**
  (tým to vidí předem; beztrestně obejít nejde), **7** = vložený uzel léčky
  pronásledovatele, **10** = okamžitá finální konfrontace; přežití → **Žár klesá
  na 3** (finále se nesmí recyklovat každé dva uzly — změřeno simulací).
- **Pronásledovatel:** losuje se 1 na začátku runu, viditelný od začátku, ruší
  jeden tag (viz `obsah/pronasledovatele.yaml`). Nemá vlastní tahy — jedná
  výhradně přes prahy Žáru.
- **Kolaps postavy:** 4. zranění = postava vyřazena (dál jen „leží v autě" a
  generuje poznámky v protokolu). Všichni vyřazeni = konec runu.
  **Hlas z auta:** vyřazený hráč v každém dalším uzlu jednou binárně volí —
  buď dá jednomu spoluhráči **+1 k hodu**, nebo mu **lízne prokletou kartu**.
  (Drobné rozhodnutí drží hráče ve hře a krmí protokol.)
- **Zranění** = zápis do spisu (krmí AI prompt) + od 2. zranění líže hráč
  prokleté karty do ruky.
- **Zoufalé karty ignorují postih za zranění** (hod = d6 + síla + afinita) —
  zdemolovaný hráč s nimi hraje naplno, ne jako mrzák.
- **Priorita prokletých karet:** zákaz tagu má přednost před vynucením
  (např. „Zbrklost" = zahraj nejvyšší sílu **mezi povolenými** kartami).
- **Zátah (práh Žáru):** speciální **vkládaný** uzel — při dosažení prahu vede
  příští volba cesty přes něj (nahradí obě nabízené cesty); není součástí běžné
  nabídky 14 uzlů. Obsahově jeden generický Zátah-uzel v `obsah/uzly.yaml`
  (označen jako speciální), flavor dobarví pronásledovatel přes AI kulisy.

### Obsah (minimální sada)

| Co | Počet | Poznámka |
|---|---|---|
| Postavy | 4 | jen jméno + portrét-placeholder + 1 věta flavoru |
| Šablony uzlů | 7 typů × 2 varianty = 14 (+1 speciální Zátah) | run = 6 uzlů, vždy volba ze 2 |
| Základní karty | 32 (8 na tag) | síly 1–3, česky |
| Prokleté karty | 8 | Křeč, Ztráta důstojnosti… |
| Zoufalé karty | 4 | hratelné jen s 3+ zraněními |
| Tajné cíle | 8 | bodované na konci; převážně mechanicky ověřitelné (simulační brána), textové jen kde nese reveal |
| Pronásledovatelé | 2 | pravidlová karta: rušený tag + léčka + konfrontace |
| Fallback šablony protokolu | ~20 | pro výpadek API |

### Záměrně MIMO rozsah v0.1
Online multiplayer, Remote Play, UGC/Mad Libs editor, asynchronní databáze karet,
Steam, DLC, pixel-art, zvuk, angličtina (testuje se česky — je to rizikovější
jazyk), volitelný časovač, volba obtížnosti.

## Fáze 2 — Playtesty a ladění (průběžně)

Minimálně 5 sezení s různými skupinami (ne pořád stejní kamarádi). Po každém runu
krátký dotazník + pozorování.

**Metriky úspěchu:**
1. Stůl se **před vyložením karty hádá/radí** aspoň u poloviny uzlů (známka, že
   rozhodnutí je skutečné).
2. Protokol se **čte nahlas spontánně** a aspoň občas vyvolá smích.
3. Skupina si **dobrovolně dá 2.–3. run** bez pobízení.
4. Reveal tajných cílů na konci vyvolá reakci („tys to dělal schválně?!").
5. Hráči po hře **převyprávějí konkrétní momenty** („jak Pepa s vidlemi…") —
   nejsilnější signál, že hra generuje historky.

**Co ladit:** prahy hodů (8+/5–7/≤4), tempo přibývání zranění (snowball má být
citelný od ~3. uzlu), tempo Žáru (první práh má padnout kolem 3.–4. uzlu),
délka a tón protokolů, poměr cache-hitů (logovat od začátku).

---

*Historie: Fáze 0 byla původně **papírový playtest** (1 večer, před jakýmkoli kódem):
karty na kartičkách, mapa na papíře, d6, jeden člověk dělá poldu a výsledek nechá
zdramatizovat LLM v druhém okně, 3–4 hráči, 2 runy; Go/No-Go „pokud stůl nebaví ani
s živým člověkem jako poldou, zpět k designu". Přeskočeno 2026-07-22 — nejsou lokální
hráči v dojezdu; nahrazeno simulací + digitálním/remote testem (viz aktuální Fáze 0).
K papíru se lze vrátit, až budou hráči.*

*Souvisí: [design-dokument.md](design-dokument.md).*
