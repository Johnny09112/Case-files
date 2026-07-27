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

## Fáze 0 — v3 simulační brána (kritéria ZAFIXOVÁNA, D19)

**Pozor: pivot na slotovou resoluci mění, co simulace je.** Motor v2 (per-hráč hod →
zranění) zmizel; snowball v3 je agency-based smyčka (info-postih → horší přiřazení →
horší pásmo → další postih) + Žár + ubývání beden. Referenční běh = **4p**, ale každé
kritérium se reportuje **pro všechny počty 1–4p**. Splnění brány **není Go** — jen
odblokuje stavbu a vstup do lidské brány. Plné odůvodnění a botí detaily drží
`playtest-facilitator` (paměť `v3-gate-criteria-draft`).

| # | Metrika | GATE práh | Pozn. |
|---|---|---|---|
| **K1** | % DORUČENO (cíle-driven i kompetentní bot), **per počet hráčů** | **každý z 1p/2p/3p/4p ∈ [45, 70] % — FIXOVÁNO (D21, per-count explicitně D26)** | Ne průměr, ne reference 4p — **žádný počet nesmí být mimo pásmo**. Baseline 59,1 / 67,4 / 70,7 / 70,9 → **3p a 4p breachují nahoru**. K1 je **sdílená metrika**, vlastnictví dle páky (engine: šum, ruce, parametry Žáru; obsah: kotvy, keying, pronásledovatelé, postihy, finále) — viz change-control pod tabulkou. Náklad zůstává fail-condition (bedny-0 <1 % proher, D21b). |
| **K2** | snowball: **drift míry PRŮŠVIHŮ** uzel 3–4 vs. 1–2 | `PRŮŠVIH-rate(3–4) / PRŮŠVIH-rate(1–2)` **≥ 1,3** ∧ `PRŮŠVIH-rate(3–4)` **≥ 20 %** | **Baseline 1,14× NEPLNÍ** — musí se vyrobit obsahem (D22d), nedosažitelnost = P-rozhodnutí, ne tichá sleva. Poměr POČTU postihů je jen **diagnostika** (cap 2 ho saturuje, snowball ukázat neumí). Ordinál se počítá **bez vložených léček/konfrontací**; varianta „se vším" je diagnostika. Mechanismus-diagnostika: korelace info-postih zátěž vs. pásmo. |
| **K3** | medián uzlu 1. překročení prahu Zátah | **∈ {3,4}** | čísla Žáru resetují (per-pásmo PRŮŠVIH + hlučné karty). |
| **K4a** | max win-rate fixní přiřazovací heuristiky | **≤ 80 %** | |
| **K4b** | dominance stat-monokultury commitu | žádná; rozpětí statů ≤ ~10 b. | kotvy 2–4 nesmí být předvídatelné. |
| **K4c** | learnabilita **přiřazovací osy** | kompetentní − random **≥ 12 b.** A memorizační − kompetentní **≤ 3 b.** | **GATE svázaná s noise-modelem:** pád nejdřív spustí „oprav šum", pak teprve „zahoď design". Memorizační bot memorizuje **stabilní kotvy per situace-ID**; šum je **per-instance IID uniform ±2, clamp do [0, stat-max]** (±1→±2 rozšířeno kalibrací-2 2026-07-24, minimální celé číslo plnící gate). **Pozor (D27):** vázala vždy druhá půlka; první má na této ose ~5× vatu (naměřeno 64,7 b. proti prahu 12) — proto se **nesmí přenášet na jiné osy jako absolutní číslo**. |
| **K4d** | learnabilita **commit osy** (D27/V1) | kompetentní − náhodný **≥ τ** ∧ memorizační − kompetentní **≤ 3 b.** ∧ **monotonie fidelity** (win-rate neklesající v `p`) | **τ = perceptibilní konstanta projektu = 6 b.** — táž, kterou K6a používá jako STROP. Sdílení je záměrné: zjemnit K4d znamená zpřísnit K6a a naopak, takže se práh nedá ohnout, aby prošel. Vše per počet hráčů. Baseline: 9,1 ✅ / −4,8 ✅ / agregátně monotónní ✅ — ale **3p jen 7,9 b.** (1,9 b. nad prahem), není to komfortní pass. „commit-optimal" nemůže znamenat víc než dokonalé čtení telegrafu — commit je naslepo (D15/D17), commit-oracle neexistuje. |
| **K5** | **„mříž mrtvých rozhodnutí"** (varianta D, D26): podíl běžných uzlů, kde `max≤1` platí PŘED gamblem **i po něm** | `expDead` **≤ 10 %** per počet hráčů × pronásledovatel | **Realistická gamble-politika:** hráč řídí volbu ruky i nahrazovanou kartu (max přes obojí), **neřídí líz** (uniformní průměr) — best-case líz je zamítnutý („gamble jako deus ex machina"). Derivace prahu: run má ~5 běžných uzlů → 10 % = **nejvýš 0,5 mrtvého rozhodnutí na run** (anekdota, ne norma). **Baseline 13,1 % NEPLNÍ**; vázající je Malone (14,5–20,9 vs. Brody 6,6–11,8) → hlavní páka je P2. `strictDead` („ani jeden líz nepomůže", baseline 8,0 %) a stará `max≤1` = **diagnostika**; free-pass čtení nulovaných slotů je součást definice (týká se jen `rusi.typ = stat`, tedy Malona — Brodyho štítek-rušení sloty neznemožňuje, jen zvedá Žár). **Nezaměňovat s „nevyhnutelně špatným slotem" (design §4.3), který je ZÁMĚR** — ten měří diagnostická vrstva `max<4`. K5 negatuje jen uzel, kde nepomůže **nic**: ani commit, ani záchrana. |
| **K5f** | tvrdost finále (D26 bod 2) | **% přežití konfrontace ∈ [60, 80] %** per počet hráčů × pronásledovatel ∧ **≥ 90 % proher padne ve finále** | Finále (`zatah`/`lecka`/`konfrontace`) je z K5/K7 **vyňato** — pro klimax jsou „dá se vyhnout risku?" špatné otázky, správná je „nezabíjí tě moc často?". Přežití = run po střetu pokračuje. Baseline: 1p 69,6 · 2p 77,4 · 3p 79,5 · 4p 79,1, proher ve finále 97,2 ✅; **breach 3p Brody 81,6 %**. K5f je hlavní **dial P1** — 3p/4p se má PŘITÍŽIT k ~65 %. |
| **K6a** | rozpětí win-rate mezi 1–4p | **≤ 6 b.** | Zpřísněno z ≤10 (D26 bod 5). **Baseline 11,8 b. NEPLNÍ** — zavře až P1. Práh je **doložen nad šumem**: 8 bloků × 1000 seedů → sd spreadu 1,61 b., **2sd = 3,22 < 6** (D27). |
| **K6c** | run-agregovaný pasažér | žádný hráč pod podlahou příspěvku | swing agregovaný přes run, ne per-situace. |
| **K6b** | konflikt týmové optimum vs. cíl hráče | **diagnostika**, soft floor „zřetelně > 0" | proxy „je se o čem hádat"; sim měří existenci sporu, ne hádku. |
| **K7** | gamble: **záchranný** (odhad ≤1) vs. **hedge** (odhad =2) | **(1)** `take_záchranný` **≥ 80 %** ∧ **(2)** podíl uzlů se záchranným gamblem **≤ 15 %** ∧ **(3′)** `mezera(s gamblem) − mezera(bez gamblu)` **≥ −3 b.** ∧ **(4)** take při odhadu ≥3 **≈ 0 %** | Starý strop ≤20 % padl: bot gambluje deterministicky iff odhad ≤2, takže byl **z definice referenční strategie nedosažitelný** (mis-specifikace, ne přísnost). „Záchranný" popisuje committnutou POZICI, ne donucení gamblovat (§4.4 opt-in drží). **(3′) je DiD, ne hladina** (D27/V1): hlídá, že gamble nestlačí commit-rozhodnutí — hladinovou otázku „nese commit dost?" vlastní **K4d**, ne K7. Baseline: 100 % ✅ · 12,5 % ✅ · −0,2/+1,0 ✅ · 0 % ✅. Diagnostika: podíl uzlů hedge 30–50 % (baseline 40,5 %) — pozor, **to je podíl uzlů, ne take-rate** (ten je ~100 %). EV per počet hráčů (líz 1/2, u 3p ne-držitele 1/3). |
| **K8** | ekonomika | medián **7–9** kreditů; **<30 %** runů si koupí vše; směna i léčení každé **≥25 %** motelů | test tieru must-heal vs. rideable. |
| **K9** | mechanické cíle (per držící hráč) | každý **5–95 %** | v3 cíle čekají na **event-log spec technical-developera** (přepis z injury-měn). |

**Scope metrik (D26 bod 2):** **K5, K7 a K4d se počítají JEN nad běžnými uzly**
(typ `npc` / `lokace`). Finálové střety (`zatah` / `lecka` / `konfrontace`) jsou
z nich vyňaty a měří se **K5f**. K1, K6a, K5f a příčiny proher jsou run-level
(bucket nemají). Každé číslo v reportu nese `definice` — bez toho se dvojí
měřicí cut nedá sjednotit (nález D27: `band_resolved.max_achievable_zasahy` je
**post-gamble**, ne pre-gamble, což byl zdroj rozdílu 17,3 vs. 18,4 %).

**Change-control K1 (D26 bod 6, tvrdá podmínka):** změna KTERÉKOLI páky hýbající
K1 se měří proti **celé bráně současně** (K1 ∧ K5 ∧ K7 ∧ K5f) a **kontrafaktuálně
přes `CONTENT_DIR` PŘED zapečením**. Podmínkou zapečení je doložený
kontrafaktuální whole-gate report v kalibračním reportu v `technika/`;
kontroluje PM. Bez artefaktu se nezapéká. *(Důvod: čistý hand-off „K1 vlastní
jen engine" z D22e byl kalibrací-3 falzifikován — K1 pohání i finále a
akumulace postihů, tedy obsah.)*

**Co brána dnes NEPLNÍ** (stav 2026-07-27, D27 — vstupní zadání kalibrace-4,
ne vada brány): **K2 drift** 1,14 proti ≥1,3 · **K1 3p/4p** 70,7/70,9 proti
stropu 70 · **K6a** 11,8 proti ≤6 · **K5 (D)** 13,1 % proti ≤10 % ·
**K5f 3p Brody** 81,6 % proti stropu 80.

**Předpoklady simu (D19):** commit **naslepo**; **kotvy 2–4** (práh 0 zakázán),
**šum uniform ±2 s clampem do [0, stat-max]** (od kalibrace-2 2026-07-24); kombinovaný slot = „oba staty ≥ kotva" (střídmě). **Telegraf:
signál (`trend`, `proti_srsti`, `zbraň_projde`) derivuje engine ze slotů**, próza je
lidský rendering s QA invariantem věrnosti; **fidelita telegrafu `p` = sweep knob.**
Sdílený standardní balík ~40 (líz patří lízajícímu); prémiový osobní loadout je
post-MVP. **Botí strategie:** commit informovaný/naivní/stat-monokultury (+ **commit-fázový
model pro postih `hide_telegraf`** — bot committne bez trendu; + `nahodny`
a `memorizacni` commit jako **měřicí nástroje** K4d, ne herní strategie); přiřazení
oracle/kompetentní/greedy/random/cíle-driven/memorizační; info-postih = ε-greedy
přiřazení (gap informovaný vs. postižený = síla postihu jako −X); ekonomika
vždy-léčit/vždy-směnit/adaptivní. **Event-log spec vlastní technical-developer**
(nahradí architektura §2.2; jeden log pro gate-metriky, `podminka` cílů i
`max_achievable_band` z oracle).

**Pořadí kalibrace (D19):** *smoke-test co-op inverze* (má 4p horší dosažitelnou
informaci než 1p? → případné přeuspořádání reference) → **kotvy × staty karet** (jádro,
ref 4p) → **postihy** (nesou ekonomiku) → **Žár** → **ekonomika** → **ruce** (parita
agency, proti stabilnímu 4p) → **gamble + cíle** (jemné, naposled).

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
- Grafika: placeholder (text + rámečky + papír), ale **interakční model dle
  design §1 (D18) je závazný už v MVP**: psací stroj = výstup (jedna strana
  protokolu na uzel, pohled očima vyšetřovatele), **zápisník** = veškerý vstup
  (volby lístků, inventář, listování hráči záložkami, přiřazování lístků do
  polí), mapa vyjíždí zespoda. V placeholderu = panely/modály se stejnou
  strukturou. Jediný povinný efekt: **psací stroj vyklepává protokol postupně**.

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
  kotva ± 2 s clampem do [0, stat-max] (kotva 4 → reálně 2 až 5; ±1→±2 rozšířeno
  kalibrací-2 2026-07-24 kvůli K4c). Práh **skrytý před**, **odhalený po**
  vyhodnocení. **Slotové výjimky** (střídmě): kombinovaný práh přes 2 staty, nebo
  slot citlivý na štítek. Každý slot má při odhalení **ikonu viditelnosti**
  (viditelná / skrytá role).
- **Pásma** (počet slotů, které prošly práh):
  - **4/4** … HLADCE + LOOT (úspěch + bonus)
  - **3/4** … HLADCE (čistý úspěch)
  - **2/4** … S NÁSLEDKY (1 lehký postih)
  - **≤1/4** … PRŮŠVIH (těžký postih + ztráta nákladu + Žár)
- **Gamble (záchrana po odhalení):** 1× za situaci, opt-in u všech počtů. Tým
  vybere, **čí ruka** poskytne kartu; ta se líže **náhodně ze zbývajících karet
  vybrané ruky** a **povinně nahradí** jednu commitnutou (nahrazená se
  **odhazuje**). Pravděpodobnost konkrétní karty závisí na počtu zbývajících:
  1p a 4p mají po commitu 2 zbývající (šance 1/2), 2p 2 (1/2), 3p ne-držitel 3
  (1/3) — **EV gamblu se proto měří per počet hráčů** (kritérium K7).
  EV ≈ neutrální až mírně záporná (bere se jen v zoufalé situaci).
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
gamble (per počet hráčů), tempo Žáru (první práh ~3.–4. uzel, snowball od ~3. uzlu), frekvence
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
