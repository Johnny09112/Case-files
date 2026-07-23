# První hratelný prototyp — definice MVP (v3)
**Cíl: ověřit, že core loop baví 4 lidi u stolu.** Nic víc. Vše ostatní (online,
UGC, Steam, grafika, další světy) je záměrně mimo rozsah.

**Hypotéza k ověření:** „Hráči se hádají o rozdělení karet, smějí se protokolu,
rozumí, proč jim co vyšlo, a chtějí dobrovolně další run." Pokud tohle neplatí,
žádná další vrstva to nezachrání.

**Model:** slotová resoluce v3 (pivot 2026-07-23, rozhodnutí D14–D17 v
`projekt/rozhodnuti.md`). Struktura hry je v [design-dokument.md](design-dokument.md);
tenhle soubor drží **konkrétní čísla MVP řezu** — a **všechna jsou „ladit simulací"**,
dokud je nezafixuje v3 simulační brána.

---

## Fáze 0 — v3 simulační brána (kritéria OTEVŘENÁ)

**Pozor: pivot na slotovou resoluci mění, co simulace vůbec je.** Kritéria v2 brány
(win-rate pásma pro kostkový model, prahy hodů) na v3 neplatí. **Kritéria v3 brány
zatím NEJSOU zafixována — definuje je `playtest-facilitator`** nad novým modelem,
než se čísla zabetonují do prototypu. Teprve pak se běhy měří proti nim.

**Kandidátní osy** (co brána nejspíš pohlídá — finální prahy otevřené):
- **win-rate pásmo DORUČENO** u realistické (cíle-driven) i kompetentní hry (pásmo
  se určí nově — v2 mělo 45–70 %, přenositelnost na slotový model ověřit);
- **snowball**: přírůstek postihů/tlaku roste od ~3. uzlu;
- **první práh Žáru** padá medián uzel 3–4;
- **žádná dominantní strategie** (rozdělovací heuristika ani stat-monokultura);
- **frekvence „nevyhnutelně špatného slotu"** je koření, ne norma (odhad ~1 za
  2–3 situace) — moc často = frustrace, moc zřídka = commit bez tření;
- **vyrovnání agency mezi počty hráčů** (1–4p srovnatelná obtížnost i „hádka");
- **EV gamble** neutrální až mírně záporná (bere se jen v zoufalé situaci).

**Hranice poctivosti:** simulace ověří matematiku a tempo, NE zábavnost, hádku ani
smích — to čeká na lidskou bránu. **Kvalita českého AI humoru** (největší riziko)
se testuje agentem `protocol-humor-tester` nad promptem `prompty/protokol.md`.

## Fáze 1 — Digitální prototyp v0.1

### Technologie
- **Lokální webová aplikace** (single-page, vanilla JS/Vite) — nejrychlejší iterace.
- **Hot-seat only**, jeden počítač, odkryté karty. Tajné cíle: hráč si cíl zobrazí
  kliknutím na začátku (ostatní se nedívají).
- LLM: levný model (třída Haiku), **1 volání na uzel**, strukturovaný vstup
  (situace + výsledek + rozdělení karet + stav postihů), výstup 3–5 vět. **Jména
  nikdy nejdou do promptu** — LLM píše s placeholdery, jména se dosazují lokálně
  po vygenerování. Timeout 10 s → **fallback šablona** (hra nikdy nečeká na síť).
  Logovat vše.
- Grafika: placeholder (text + rámečky + papír). Jediný povinný efekt: **psací
  stroj vyklepává protokol postupně**.

### Resoluční systém v3 (výchozí čísla — VŠE „ladit simulací")

- **Karta = věc s 5 staty:** útok / obrana / hodnota / improvizace / nástroj,
  hodnoty 0–5. Vzácné **štítky** s tvrdým pravidlem (MVP: `GANGSTER` — ve viditelné
  roli NPC situace selže bez ohledu na staty).
- **Sloty:** každá situace má **4 sloty**. Tým committne **přesně 4 karty** dle
  telegrafu, *před* odhalením plného textu.
- **Ruce a rozdělení commitu podle počtu hráčů** (ruce jsou **jediná páka na
  vyrovnání agency**):

  | Hráčů | Ruka | Commit (celkem 4) |
  |---|---|---|
  | 1 | 6 | volí 4 |
  | 2 | 4 každý | 2 + 2 |
  | 3 | 4 každý | 2 + 1 + 1 (2 committne „držitel mapy", role **rotuje po uzlu**) |
  | 4 | 3 každý | 1 + 1 + 1 + 1 |

- **Rozdělení do slotů:** po odhalení textu tým rozdělí **všechny 4** commitnuté
  karty do 4 slotů (vlastník souhlasí). **Nic se nevrací, nic nebenchuje** — jádro
  je „rozděl nejméně špatně".
- **Skryté prahy = kotva ± šum:** většina slotů klíčuje na **1 stat**, práh =
  kotva ± 1 (kotva ≥3 → reálně ≥2 až ≥4). Práh **skrytý před**, **odhalený po**
  vyhodnocení. **Slotové výjimky** (střídmě): kombinovaný práh přes 2 staty, nebo
  slot citlivý na štítek. Každý slot má při odhalení **ikonu viditelnosti**
  (viditelná / skrytá role).
- **Pásma** (počet slotů, které prošly práh):
  - **4/4** … HLADCE + LOOT (úspěch + bonus)
  - **3/4** … HLADCE (čistý úspěch)
  - **2/4** … S NÁSLEDKY (1 lehký postih)
  - **≤1/4** … PRŮŠVIH (těžký postih + ztráta nákladu + Žár)
- **Gamble (záchrana po odhalení):** 1× za situaci, opt-in u všech počtů. Tým
  vybere, **čí ruka** poskytne kartu; ta se líže **náhodně** (při 3 zbývajících
  kartách šance **1/3**) a **povinně nahradí** jednu commitnutou (nahrazená se
  **odhazuje**). EV ≈ neutrální až mírně záporná (bere se jen v zoufalé situaci).
- **Postihy** (nahrazují zranění + prokleté/zoufalé karty):
  - taxonomie **informační / zámkové / ztrátové** (ztrátové střídmě);
  - **2 tiery ~70/30:** lehké dočasné (vyprší po ~2–3 kolech) / těžké trvalé (drží
    do vyléčení v motelu);
  - **cap 2 aktivní na hráče + eskalace:** 3. postih → postava **kolo–dvě „složená"**
    (leží v autě, generuje poznámky), pak se vrací;
  - **složení maže jen LEHKÉ postihy** — těžké přetrvávají a léčí se jen v motelu
    (aby složení nebylo levnější než léčení).
- **Kredity:** společné, **per-run** (nepřecházejí). Ceny v motelu: **směna karty
  = 3**, **léčení těžkého postihu = 6**. Příjmy: **truhla +4–6**, HLADCE+LOOT
  **+2**, HLADCE **+1**. Orientačně: skvělý run ~13, medián ~7–9 (unese ≥2
  ekonomická rozhodnutí), slabý ~4–5.
- **Motel:** **větvová odbočka** (ne pevný uzel) — 2 příležitosti na mapě (mid a
  late); tým volí úkryt (léčení + směna) vs. hnát náklad dál.
- **Mix míst** (páteř ~7 uzlů): **5 maso (NPC+lokace) / 1 truhla**, motel jako
  odbočka. Pravidla: maso ≥ 65–70 %, nikdy dva ne-maso po sobě, truhla uzel 2–3,
  motelová odbočka mid a late. Větvení nesmí dovolit vyroutovat se kolem masa.
  Event „1 ze 3" je v bucketu lokací, ne uzel navíc.
- **Náklad:** tým veze bedny (start ~6, ladit). PRŮŠVIH / ztrátové postihy berou
  náklad; 0 beden = run končí (NEVYŘEŠENO). *(Otevřené: náklad vs. Žár jako
  fail-condition — kandidát na konsolidaci, viz Co ladit.)*
- **Žár (0–10):** týmová stopa pozornosti zákona, **pozice na značené trati**
  (křížkující šerif), ne odosobněné číslo. Roste za PRŮŠVIH uzly, hlučné hraní
  (odvozené ze štítků/statů — `GANGSTER`, vysoký útok, výsledek „incident") a
  vybrané výsledky. **Každý pohyb nese anotaci proč.** Prahy: **Zátah** (nahradí
  příští uzel, obě větve přes něj), **léčka** (vložený uzel s pronásledovatelem),
  **konfrontace** (okamžitá finální situace; přežití Žár srazí). Přesné přírůstky
  a prahy ladit simulací.
- **Pronásledovatel:** losuje se 1 na začátku runu, viditelný od začátku, **ruší
  jeden stat/štítek**. Nemá vlastní tahy — jedná výhradně přes prahy Žáru.
- **Vysvětlující vrstva „proč se to stalo" — POVINNÁ položka.** Každá netriviální
  událost nese při odhalení krátkou anotaci: skrytý práh vs. realita, vynucení a
  štítky, pohyb šerifa, postihové řetězce (vznik/vyprší/léčí), plnění tajných cílů
  (reveal ukáže, které tahy cíl plnily/kazily). Přímá reakce na nález playtestu
  2026-07-22, že hra svá pravidla nevysvětluje.

### Obsah (minimální sada)

| Co | Počet | Poznámka |
|---|---|---|
| Světy | 1 | 1930 (prohibice); multi-svět rámec připraven, obsah ne |
| Situace | 7 typů × 2 varianty = 14 (+1 speciální Zátah) | run ~7 uzlů, mix 5 maso / 1 truhla + motelové odbočky |
| Standardní karty (věci) | ~40 | 5 statů + pár štítků, česky |
| Prémiové karty | 0 | meta-progrese mimo MVP |
| Postihy | ~14 | informační / zámkové / ztrátové, 2 tiery |
| Vysvětlující vrstva | povinná | per-akční anotace (viz výše) |
| Truhla / motel | ano | kredity; motel jako větvová odbočka |
| Tajné cíle | 8 (osekané) | mechanicky ověřitelné převažují; kryté vysvětlující vrstvou |
| Pronásledovatelé | 2 | rušený stat/štítek + léčka + konfrontace |
| Fallback šablony protokolu | ~20 | pro výpadek API |
| Mapa | 1 StS graf, ~7 uzlů | šerif křížkuje, prahy Žáru vyznačené na trati |

### Záměrně MIMO rozsah v3 MVP
Prémiové karty + meta-progrese, custom skladač karet + UGC moderace, perzistence
profilů napříč runy, další světy / DLC obsah, online multiplayer, Remote Play,
Steam, pixel-art (placeholder papír), zvuk, angličtina (testuje se česky — je to
rizikovější jazyk), volitelný časovač, volba obtížnosti.

## Fáze 2 — Playtesty a ladění (průběžně)

Minimálně 5 sezení s různými skupinami (ne pořád stejní kamarádi). Po každém runu
krátký dotazník + pozorování.

**Metriky úspěchu:**
1. Stůl se **před rozdělením karet hádá/radí** aspoň u poloviny uzlů (rozhodnutí
   je skutečné).
2. Protokol se **čte nahlas spontánně** a aspoň občas vyvolá smích.
3. Skupina si **dobrovolně dá 2.–3. run** bez pobízení.
4. Reveal tajných cílů na konci vyvolá reakci („tys to dělal schválně?!").
5. Hráči po hře **převyprávějí konkrétní momenty** — nejsilnější signál, že hra
   generuje historky.
6. **Čitelnost (nová metrika, nález playtestu 2026-07-22):** hráč po uzlu **chápe,
   proč slot prošel/selhal a proč se šerif pohnul**, aniž se musí ptát facilitátora.
   Vysvětlující vrstva funguje, nebo hra zůstává „černá skříňka".

**Co ladit:** velikosti rukou (vyrovnání agency 1–4p), kotva ± šum prahů, hranice
pásem, poměr a trvání postihů, kreditové ceny/příjmy a dostupnost motelu, EV
gamble (1/3), tempo Žáru (první práh ~3.–4. uzel, snowball od ~3. uzlu), frekvence
nevyhnutelně špatného slotu, **náklad vs. Žár jako fail-condition** (možná
konsolidace kvůli kognitivní zátěži), délka a tón protokolů, poměr cache-hitů.

---

*Historie: MVP v2 stál na **kostkové resoluci** (d6 + síla + afinita vs. globální
prahy 7+/5–6/≤4, 4 tagy + ridery, pevná čtveřice postav, zranění → prokleté/zoufalé
karty, náklad 6 beden). v2 simulační brána (kritéria D9, kalibrace D7–D11) byla
2026-07-22 vyhlášena za **SPLNĚNOU** — uzavřená kapitola, detaily v
`technika/simulacni-brana-2026-07-22.md`. Pivotem na slotovou resoluci (D14–D17,
2026-07-23) čísla i model v2 padly; v3 brána začíná znovu s otevřenými kritérii
(Fáze 0). Ještě dřív byla Fáze 0 papírový playtest — přeskočen 2026-07-22, nejsou
lokální hráči; nahrazeno simulací + digitálním/remote testem.*

*Souvisí: [design-dokument.md](design-dokument.md). Archiv procesu pivotu:
[projekt/navrh-v3.md](projekt/navrh-v3.md).*
