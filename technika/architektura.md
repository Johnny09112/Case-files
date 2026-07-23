# Technická architektura prototypu v0.1

**Stav:** základ schválen 2026-07-22; **§2.2 přepsán na v3 událostní log +
ADR-008 (2026-07-23)** po pivotu na slotovou resoluci (D14–D19). Tento dokument
je zadání pro samostatný kódový repozitář — sem žádný kód nepatří (viz `CLAUDE.md`).
Změny architektury = nové/aktualizované ADR dole. **Pozn.:** zbytek dokumentu
(vrstvy, cache, ADR-001–007, struktura repa) je stále v2-báze; místa, která v3
přímo láme, nesou značku „v2 — přepsat při přestavbě enginu".

---

## 1. Přehled a cíle

Prototyp v0.1 je **lokální webová aplikace** (single-page, Vite + vanilla JS):
hot-seat na jednom počítači, placeholder grafika, jediný povinný efekt je
**psací stroj vyklepávající protokol**. Cíl: ověřit core loop (lidská brána
Go/No-Go), nic víc.

**Primární řídicí požadavek je ale simulační brána** (viz `CLAUDE.md`, Aktuální
fáze): dřív, než bude cokoli hratelné, musí jít resoluční matematika a tempo
prohnat tisíci simulovaných runů. Z toho plyne hlavní architektonický princip:

> **Herní engine běží od prvního dne headless** — bez UI, bez sítě, bez DOM.
> UI i simulátor jsou jen dva různí klienti téhož enginu.

Druhý řídicí fakt: **resoluční model je po pivotu na v3** (slotová resoluce,
D14–D19) a jeho čísla nejsou zafixovaná (kotvy ± šum, hranice pásem, tempo Žáru —
vše „ladit simulací" dle `prototyp-mvp.md`). Architektura na konkrétních číslech
nesmí záviset — pravidla jsou data + čistá funkce (ADR-003), takže výměna
resolučních pravidel je lokalizovaná do jednoho modulu a simulátor umí porovnat
varianty pravidel proti sobě.

## 2. Architektura čtyř vrstev

```
┌───────────────────────────────────────────────┐
│  UI (hot-seat, psací stroj)   │  Simulátor    │   ← dva klienti
├───────────────────────────────┴───────────────┤
│  Game engine (čistý JS, deterministický,      │
│  seedované RNG, událostní log)                │
├───────────────┬───────────────────────────────┤
│ Content loader│  LLM adaptér (timeout,        │
│ (obsah/*.yaml)│  fallback, cache, logging)    │
└───────────────┴───────────────────────────────┘
```

Závislosti tečou jen dolů: engine nezná UI ani síť; LLM adaptér nezná engine
(dostává hotový strukturovaný výsledek); UI je nejtenčí vrstva.

### 2.1 Content loader

- Načítá `obsah/*.yaml` z design repa (knihovna `js-yaml`), validuje proti
  schématům z komentářů v hlavičkách souborů (tagy, síly 1–3, afinity −2/0/+2,
  tvrdost `bedna|zar|zraneni`, limity délek textů). Chyba validace = srozumitelná
  hláška se souborem a `id` záznamu — obsah ladí neprogramátor, hlášky musí být
  česky a konkrétní.
- Parser je izomorfní: funkce `parseContent(yamlString)` bez I/O; browser ji krmí
  přes Vite import, simulátor (Node) přes `fs`. Jeden validátor pro oba světy.
- **Sdílení mezi repy: git submodule + dev override** (ADR-005). Kódové repo
  pinuje design repo jako submodule (reprodukovatelnost buildů a CI); pro živé
  ladění obsahu lze ve vývoji nastavit `CONTENT_DIR` na lokální checkout design
  repa — neprogramátor uloží YAML, F5 v prototypu, hotovo, žádný sync krok.

### 2.2 Game engine

Čistý JS modul bez závislosti na DOM, síti i hodinách. Deterministický:
**stejný seed + stejná sekvence voleb = bit-přesně stejný run.** Veškerá
náhoda (míchání sdíleného balíku, los pronásledovatele, **šum kotev ±1**,
náhodné líznutí gamblu, nabídka cest) jde z jediného seedovaného PRNG streamu
(mulberry32 nebo ekvivalent — `Math.random` je v enginu zakázán).

**Hranice API enginu:**

- Vstup: `createRun({seed, content, rules, players})` + příkazy hráčů
  (`chooseRoute(routeId)`, `commitCards([{characterId, cardId}])`,
  `assignToSlots([{slotIndex, cardId}])`, `gamble({handOwnerId, replacedCardId,
  slotIndex})`, `motelChoice(...)`, `spendCredits(...)`, `confirmNode()`).
  Nic jiného stav nemění. **Commit padá před `situation_revealed`** (odhalením
  textu a prahů) — proto gamble sází na nejistotu prahů (K7).
- Výstup: aktuální stav (read-only snapshot pro render) + **append-only
  událostní log**. UI i simulátor čtou tentýž log; protokolová pipeline si vstup
  pro LLM skládá z uzlových událostí (`band_resolved` + jeho `slot_resolved` /
  `assignment` / `penalty_*` / `zar_move`), ne z jediné blob-události.

**Formát událostního logu v3** (JSONL-serializovatelný; každá událost má `seq`,
`type`, `nodeIndex` a payload). **Jeden log obsluhuje tři konzumenty** (ADR-008):
**(a) gate-metriky K1–K9** simulační brány, **(b) strojové `podminka` tajných
cílů v3** (nástupce v2 měn zraneni/kolaps/max_sila_karty; viz odvozené metriky
níže), **(c) `max_achievable_band`** = nejlepší dosažitelné pásmo z committnutých
karet (jádro K5). Payload musí být tak granulární, aby všechny tři šly odvodit
bez druhého průchodu enginem.

| Událost | Payload (výběr) | Krmí konzumenta |
|---|---|---|
| `run_started` | seed; verze obsahu; verze pravidel; pronásledovatel (id, `rusi_stat`\|`rusi_stitek`); počet hráčů; ruce per hráč (velikost + karty id); `loadout` per hráč (**MVP `[]`**, post-MVP hook); start beden/Žáru/kreditů; přiřazené cíle per hráč (id) | reprodukce; K4c/K6 baseline; oracle |
| `map_move` | nabídnuto `[{node_ref, typ_mista}]`; `volba`; `typ_mista`; `motel_odbocka` (bool + volba úkryt\|dál); `byl_zatah` (Žár nahradil uzel, obě větve přes něj) | K4 dominantní strategie (nejde vyroutovat kolem masa); diag D19a |
| `telegraf_derived` | `signal_pravy {trend_staty, proti_srsti, zbran_projde}` — **derivuje engine ze slotů**, ne autor; `signal_vyslany` (po fidelitě/postihu „nevidíš telegraf"); `fidelita` p | K7 (commit naslepo); věrnost telegrafu (sweep knob) |
| `commit` | `[{hrac_id, karta_id, staty snapshot (5×0–5), stitky, dobrovolna: bool}]` (**přesně 4**); rozdělení dle hráčů; `drzitel_mapy` (3p, rotuje po uzlu) | K4b stat-monokultura; cíl `commitnute_stitky`; **vstup max_band** |
| `situation_revealed` | `typ_mista`; sloty `[{slot_index, role, klice_na (stat \| [s1,s2] u kombi), kotva (2–4), sum (±1), prah=kotva+šum, typ_prahu (jednostat\|kombi_oba\|stitek), viditelnost (viditelná\|skrytá), stitek_citlivost (např. GANGSTER)}]`; `vyjimky` (které sloty) | **vstup max_band**; oracle; „proč" vrstva |
| `assignment` | `[{slot_index, karta_id, hrac_id}]`; `navrhl` (hrac_id); `souhlasili []` (vlastník souhlasí); `pocet_preskladani` (reassignment_count) | **K6c counterfactual (swing)**; K6b proxy sporu |
| `gamble` | `ci_ruka` (hrac_id); `zbyvajici_v_ruce` (jmenovatel: 2 nebo 3 dle počtu hráčů); `tazena` (karta_id); `nahrazena` (commitnutá → odhoz); `do_slotu` | **K7 EV per počet hráčů**; cíl `gamble_pouzit` |
| `slot_resolved` (×4/uzel) | `slot_index`; `karta_id`; `hrac_id`; `stat_hodnota` (1–2 u kombi); `prah`; `typ_prahu`; `viditelnost`; `stitek_efekt` (GANGSTER ve viditelné roli → auto-fail); `pronasledovatel_efekt` (zrušil stat/štítek); `zasah: bool`; `duvod` (enum anotace) | pásmo; „proč" vrstva; cíl `pocet_slotu_splnil` |
| `band_resolved` | `zasahy` (0–4); `pasmo` (`4/4_HLADCE_LOOT`\|`3/4_HLADCE`\|`2/4_S_NASLEDKY`\|`≤1/4_PRUSVIH`); **`max_achievable_zasahy`** (0–4) + `max_achievable_band` (oracle: optimální rozdělení commitu × odhalené prahy); `gap` (max − real) | **K5** (max<4/4 v 30–50 %, ≤1/4 <5 %); K1; K4c learnabilita |
| `penalty_added` | `hrac_id`; `postih_id`; `kategorie` (informacni\|zamkove\|ztratove); `tier` (lehky_docasny\|tezky_trvaly); `efekt` (enum, dodefinuje obsah — viz ADR-008); `vyprsi_za` (kola \| null u těžkých); `pricina` (uzel/pásmo); `aktivnich_po` (cap 2/hráč) | K2 snowball; cíl `postihy_utrpene` |
| `penalty_expired` | `hrac_id`; `postih_id`; `duvod` (`cas`\|`slozeni` — složení maže **jen lehké**) | K2; cíle |
| `penalty_healed` | `hrac_id`; `postih_id`; `cena` (=6); `uzel` (motel) | K8 (léčení ≥25 % motelů); cíle |
| `character_folded` | `hrac_id`; `kolo_od`/`kolo_do` (kolo–dvě); `smazane_lehke []`; `pretrvavaji_tezke []` | K2 eskalace; cíl `slozeni_krat` |
| `character_returned` | `hrac_id` | — |
| `credit_flow` | `delta`; `duvod` (truhla +4–6 \| hladce_loot +2 \| hladce +1 \| smena −3 \| leceni −6 \| ztratovy_postih −X); `zustatek` | K8 (medián 7–9; <30 % koupí vše; směna/léčení každé ≥25 % motelů) |
| `zar_move` | `delta`; **`duvod` (POVINNÁ anotace)** (prusvih \| hlucne_GANGSTER \| hlucne_utok \| incident \| konfrontace_prezita −…); `nova_pozice` (0–10, pozice šerifa); `prah_prekrocen` (null\|zatah\|lecka\|konfrontace) | **K3** první práh (medián uzel 3–4); K2 snowball; „proč" vrstva |
| `goal_scored` | `hrac_id`; `cil_id`; `overeni_typ` (mechanicky\|textovy); `splnen` (bool \| null u textového); `metriky_snapshot`; `plnily_tahy []` / `kazily_tahy []` | **K9** (cíle 5–95 %); reveal §4.11 |
| `run_ended` | `vysledek` (DORUCENO\|NEVYRESENO); **`pricina`** (`dojezd`\|`bedny_0`\|`konfrontace_prohra`\|`jina`) — **diag D19a**; `pocet_uzlu`; `zbyva_beden`; `konecny_zar`; `kredity_zbytek` | **K1** win-rate + rozpad příčin proher (bedny-0 vs. konfrontace) |

**`max_achievable_band` (jádro K5, ADR-008):** engine (oracle hook) spočítá nad
`commit` × `situation_revealed` (+ pronásledovatelovo rušení statu) **optimální**
rozdělení 4 karet do 4 slotů maximalizující zásahy — **nezávisle na tom, jak tým
rozdělil**. `band_resolved.max_achievable_zasahy < 4` i při optimálním rozdělení
= „nevyhnutelně špatný slot" (K5). `gap = max − real` měří, kolik tým nechal na
stole špatným rozdělením (learnabilita, K4c). Determinismus enginu (ADR-002)
navíc umožní **counterfactual swing** (K6c): přeřešit run s alternativním
přiřazením a porovnat pásmo — Gini swingu = „žádný pasažér".

**`telegraf_signal` derivuje ENGINE ze slotů (ADR-008)** — ne autor. `signal_pravy`
je čistá funkce definice slotů uzlu; autorská próza telegrafu je jen lidský
rendering a musí věrně odpovídat (QA invariant, testuje content-check, ne engine).
Fidelita `p` je v simu **sweep knob**: bot committne proti `signal_vyslany`
(zašuměný o `1−p`), gap `pravy` vs. `vyslany` je měřitelný z logu.

**Odvozené metriky pro cíle (v3 „měny", nástupce v2 zraneni/kolaps/…):** cíle se
bodují přes `podminka` (schéma D3: `overeni_typ` + `podminka`) nad těmito
metrikami, spočtenými z logu při scoringu — nedrží se v události redundantně:

| Metrika (odvozená) | Z událostí | Krmí cíl / K |
|---|---|---|
| `pocet_slotu_splnil` / `_selhal` (per hráč) | assignment + slot_resolved | cíle „slot"; K4c |
| `commitnute_stitky` (vč. GANGSTER do viditelné role) | commit + situation_revealed + slot_resolved | „ani jednou zbraň do viditelné role" |
| `gamble_pouzit` (per hráč / tým) | gamble | „zachráněno gamblem" / „bez sázky" |
| `postihy_utrpene` (počet, tiery, kategorie) | penalty_* | „skonči s 2 postihy a přesto DORUČENO"; K2 |
| `slozeni_krat` | character_folded | cíle |
| `kredity_utracene_za` {leceni, smena} | credit_flow | K8; cíle |
| `pasma_dosazena` (histogram per hráč) | band_resolved + assignment | „HLADCE bez následků"; K5 |
| `bedny_ztracene_vlastni` (atribuce) | band_resolved(PRŮŠVIH) + ztrátový penalty + assignment | analog v2 „kupecké slovo" |
| `doruceno` | run_ended | cíle vázané na výsledek |
| `max_achievable_gap_sum` (tým) | Σ band_resolved.gap | K4c learnabilita |
| `nazev_v_protokolu` (textový, jen člověk) | — | „mozek operace" (reveal) |

> **Historie — v2 událostní log (uzavřeno pivotem D14–D17).** Původní tabulka
> stála na **kostkové resoluci** (`card_played` s tagem/silou, `check_resolved`
> s hodem d6 a afinitou, `injury_added`/`cursed_drawn`/`character_down`,
> `crate_lost`, `heat_changed`/`heat_threshold`, `node_resolved` jako jediný blob
> pro protokol). Model padl s v2 (viz `prototyp-mvp.md` Historie). Detaily
> uzavřené v2 brány: `technika/simulacni-brana-2026-07-22.md`.

**Pravidla jako data + čistá funkce (ADR-003):** všechna resoluční čísla
(kotvy 2–4 + rozsah šumu ±1, hranice pásem, přírůstky a prahy Žáru, počet beden,
cap postihů + eskalace, kreditové ceny/příjmy, pravděpodobnosti gamblu — aktuální
hodnoty vždy v `prototyp-mvp.md`, sem nehardcodovat) žijí v jednom konfiguračním
objektu `rules`;
vyhodnocení je čistá funkce `resolve(state, action, rules, rng)`. Až audit čísla
změní, mění se jeden objekt — a simulátor umí pustit tutéž dávku runů proti
několika variantám `rules` a porovnat je.

### 2.3 LLM adaptér

Poskytovatel je **nerozhodnut** — rozhraní je provider-agnostic (ADR-004):

- Jedno volání na uzel. Vstup = strukturovaný text přesně dle
  `prompty/protokol.md` (UZEL / OSOBY / KARTY / VÝSLEDEK MECHANIKY); systémový
  prompt se bere z téhož souboru, nikde se neduplikuje. Žádný volný text hráčů
  do promptu (ochrana proti prompt injection).
- **LLM nikdy nerozhoduje výsledek** — dostává hotový výsledek mechaniky
  z uzlových událostí (`band_resolved` + jeho `slot_resolved`/`assignment`/
  `penalty_*`/`zar_move`) a jen ho dramatizuje. Adaptér výstup lehce
  validuje (délka, absence měny výsledku se nevaliduje strojově — to hlídá
  regresní baterie protocol-humor-testera).
- **Tvrdý požadavek: hra nikdy nečeká na síť.** `Promise.race(provider, 10 s)`;
  timeout, chyba i nevalidní výstup → **fallback šablona** (výběr podle typu
  uzlu + pásma výsledku z ~20 šablon, doplnění jmen; čistě lokální, synchronní).
  Psací stroj začne klepat okamžitě fallbackem maskovanou latenci — hráč rozdíl
  mezi „ještě generujeme" a „už máme" nevidí.
- **Cílový model: třída Haiku** (aktuálně Claude Haiku 4.5: $1 vstup / $5 výstup
  za MTok). Odhad na volání: ~600–800 tokenů vstup + ~150–200 výstup ≈
  **$0,002/uzel, tj. ~$0,015/run bez cache**. Poznámka z reálií API: minimální
  cachovatelný prefix pro provider-side prompt caching je u Haiku 4.5
  4096 tokenů — náš systémový prompt je řádově kratší, provider cache se tedy
  neuplatní. **Nákladová páka je naše aplikační cache protokolů, ne prompt
  caching poskytovatele.**
- **Logování všeho:** každé volání zapíše JSONL záznam {čas, klíč cache, celý
  prompt, raw odpověď, zdroj (llm/cache/fallback), latence, model}. V prototypu
  IndexedDB/localStorage + tlačítko „Exportovat logy" (JSONL). Logy jsou
  surovina pro ladění promptu i budoucí doladění malého lokálního modelu.

**Klíčování cache** (cíl: maximální hit-rate, náklady na hráče časem klesají):

1. **Exaktní klíč (v0.1):** SHA-256 kanonického JSON vstupu — `{uzel_id,
   seřazené záznamy [postava_id, karta_id, pásmo výsledku, typ následku],
   ztracené bedny, digest trvalých poznámek}`. Kanonizace = seřazené klíče,
   žádné časy, žádné seedy. Hit = identická situace → identický protokol.
2. **Hrubý klíč (příprava na globální cache):** vynechá texty poznámek a
   nahradí je bucketem počtu zranění (0/1/2/3+) na postavu. Ukládá se **jen pro
   „čisté" stavy** (bez trvalých poznámek) — právě ty jsou nejčastější v prvních
   uzlech, kde je i největší objem volání; u stavů s poznámkami by hrubý hit
   riskoval protokol zmiňující následky, které postava nemá.
3. V0.1 se **měří, nerozhoduje**: loguje se hit-rate obou klíčů (hrubý jen
   stínově), globální cache na proxy (mimo v0.1) se pak klíčuje podle dat,
   ne odhadu. Konkrétní čísla hit-rate předat operations-economics.

> **v2 — přepsat při přestavbě enginu:** klíčovací pole nesou v2 měny — „typ
> následku" a hrubý „bucket počtu zranění (0/1/2/3+)" jsou zranění; v3 je
> nahradí **bucket stavu postihů** (např. 0/1/2+ aktivních, tier). Karta v klíči
> už není `tag/síla`, ale `věc se staty (+ štítky)`. Vstupní formát promptu
> (`prompty/protokol.md`, oddíl KARTY / VÝSLEDEK MECHANIKY) drží ještě v2 řez
> (tagy/síly/zranění) — remapovat na sloty/pásma/postihy vlastní humor-tester,
> ne tato architektura.

Pozn.: jména postav jsou fixní čtveřice z obsahu, takže protokoly jsou mezi
stoly přenositelné — to je předpoklad, aby globální cache vůbec dávala smysl.

### 2.4 UI

Nejtenčí možná vrstva: render stavu enginu + odesílání příkazů. Hot-seat,
odkryté karty, tajný cíl přes „Jsem Jan" kliknutí. Jediný povinný efekt je
**psací stroj** (postupné vypisování protokolu, ~30–50 ms/znak s variancí) —
je to nosič zážitku i maska latence LLM. Žádný stavový management framework;
stav drží engine, UI je re-render nad snapshotem. Vše, co vypadá jako herní
logika v UI souboru, je architektonická chyba.

## 3. Simulátor

Headless runner nad enginem (Node, `npm run sim`), pro simulační bránu Go/No-Go
a agenta playtest-facilitator:

- **Strategie hráčů (v3, dle návrhu kritérií playtest-facilitatora):** dvě osy.
  **Commit** proti telegrafu: `informovaný` (čte zašuměný signál kotev, p≈0,7) /
  `naivní` / `stat-monokultura` (detektor K4b). **Přiřazení do slotů:** `oracle`
  (zná prahy — horní mez pro `max_achievable_band`) / `kompetentní` (zná staty,
  ne prahy) / `greedy` / `random` (baseline) / `cíle-driven` / `memorizační`
  (test K4c: memorizační − kompetentní ≤ ~3 b.). **Informační postih** =
  ε-greedy přiřazení (ε 0,3–0,5) — gap informovaný vs. postižený měří sílu
  postihu. **Ekonomika:** vždy-léčit / vždy-směnit / hoard / adaptivní.
  Instrumentace `pocet_preskladani` (reassignment_count) na `assignment`;
  `time_to_decision` je metrika **lidské** brány (engine nemá hodiny — ADR-002),
  v simu ji nahrazuje existence sporu (K6b).
- **Dávky:** tisíce runů na konfiguraci; každá dávka = {verze obsahu, varianta
  `rules`, strategie, rozsah seedů} — plně reprodukovatelná.
- **Co loguje:** (a) kompletní událostní logy všech runů jako JSONL (1 řádek =
  1 událost, soubor na dávku), (b) `summary.json` + čitelný `summary.md`
  s agregacemi: win-rate a rozpad příčin konce (bedny-0 vs. konfrontace — diag
  D19a), distribuce délky runu, **histogram uzlu prvního/druhého/třetího prahu
  Žáru**, **křivka postihů/tlaku po uzlech** (snowball — cíl: citelný od ~3.
  uzlu), **distribuce `max_achievable_zasahy`** (K5) a `gap` (K4c), křivka beden,
  srovnávací tabulka strategií. Playtest-facilitator navazuje na tyto dva
  artefakty, nemusí nic počítat sám.
- Simulátor **nevolá LLM ani fallback šablony** — protokol je pro matematiku
  irelevantní. (Výjimka: cíle vázané na obsah protokolu se v simulaci bodují
  jen mechanicky přes `overeni` heuristiku, nebo se z metrik vynechají —
  poznamenat do reportu.)

## 4. Klíče a produkce

**Prototyp v0.1:** API klíč v lokálním `.env` (gitignore, `.env.example`
v repu), přímé volání z browseru přes Vite (`import.meta.env`). Vědomé omezení:
klíč se dostane do dev bundle — **build prototypu se nikdy nikam nenasazuje**,
běží jen lokálně u vývojáře. Bez klíče hra plně funguje na fallback šablonách.

**Produkční směr (mimo scope v0.1, jen zaznamenáno — ADR-006):**

- **Serverless proxy** (např. Cloudflare Worker): drží API klíč, hostuje
  **globální cache** (klíčování dle 2.3 — proto se hit-rate měří už teď)
  a vynucuje **tichý fair-use strop** (po X runech denně čistě cache/fallback).
- Desktop balení **Tauri** (webview → malý binár, cesta na Steam/Itch).
- Online co-op přes **Steam networking** (SDR) — až po validaci loopu, návrh
  enginu s příkazy + deterministickým logem je na lockstep síťování připravený
  vedlejším efektem, ne záměrem.

Ekonomiku proxy/cache (náklady na hráče, strop fair-use) konzultovat
s operations-economics až nad naměřenými daty z v0.1.

## 5. Pořadí stavby

1. **Engine + simulátor bez UI → simulační brána.** Nejrizikovější a právě
   revidovaná věc jsou resoluční čísla; headless se iterují za minuty a bez
   nákladů. Dokud simulační brána neprojde, UI ani LLM nemá co zobrazovat.
2. **Hot-seat UI s fallback šablonami** — hra plně hratelná bez AI a bez
   klíče. Fallbacky tím dostanou stovky expozic zadarmo (testují se jako
   primární obsah, ne jako zaprášená pojistka) a psací stroj se ladí bez
   latence sítě.
3. **LLM adaptér** — nakonec, protože jeho rozhraní je zafixované
   `prompty/protokol.md` a mechanika na něm nezávisí; do hotové hry se jen
   „zapojí lepší vypravěč". Kvalita humoru se mezitím ladí paralelně
   (protocol-humor-tester), ne na kritické cestě stavby.

## 6. Struktura budoucího kódového repa

```
dukazni-material-prototyp/
├─ content/                  # git submodule → design repo (obsah/, prompty/)
├─ src/
│  ├─ engine/                # čistý JS, zákaz importů z ui/, llm/, DOM, sítě
│  │  ├─ rules.js            # resoluční čísla jako data (ADR-003)
│  │  ├─ resolve.js          # čistá funkce vyhodnocení
│  │  ├─ state.js            # stav runu + příkazy
│  │  ├─ events.js           # typy událostí, event log
│  │  └─ rng.js              # seedovaný PRNG (jediný zdroj náhody)
│  ├─ content/
│  │  └─ loader.js           # js-yaml parse + validace (izomorfní)
│  ├─ llm/
│  │  ├─ adapter.js          # orchestrace: cache → provider → timeout → fallback
│  │  ├─ prompt.js           # skládání vstupu dle prompty/protokol.md
│  │  ├─ cache.js            # exaktní + stínový hrubý klíč
│  │  ├─ log.js              # JSONL logování + export
│  │  └─ providers/
│  │     ├─ fallback.js      # šablony — vždy přítomný provider
│  │     └─ (anthropic.js)   # až po rozhodnutí o poskytovateli
│  ├─ ui/
│  │  ├─ app.js, screens/…
│  │  └─ typewriter.js       # psací stroj
│  └─ main.js
├─ sim/
│  ├─ run.js                 # CLI: dávky runů, výstup logs/ + summary
│  ├─ strategies.js
│  └─ report.js
├─ test/                     # Vitest
├─ logs/                     # gitignored (JSONL dávek simulace)
├─ .env.example
└─ vite.config.js
```

**Testovací strategie (Vitest — nativní k Vite, běží v Node):**

- *Unit testy enginu:* `resolve()` přes všechna pásma (zásahy 0–4 → 4/4…≤1/4 dle
  `rules`), kotva ± šum na jeden stat, **kombi-slot „oba ≥ kotva"**, štítek
  GANGSTER ve viditelné vs. skryté roli, rušení statu/štítku pronásledovatelem,
  přírůstky a prahy Žáru, `max_achievable_band` oracle (vč. „nevyhnutelně
  špatného slotu"), gamble (náhrada + odhoz), postihy (tiery, cap 2, eskalace,
  složení maže jen lehké), léčení v motelu, konec beden.
- *Regresní testy resoluce (golden runs):* fixní seed + skriptovaná sekvence
  voleb → snapshot celého událostního logu. Změna pravidel změní snapshot
  **viditelně a záměrně** — commit message musí říct proč. Přesně tohle chrání
  probíhající revizi čísel před tichými regresemi.
- *Validace obsahu:* test načte reálné `content/obsah/*.yaml` a vynutí schémata
  — rozbitý YAML od content-generatora spadne v testu, ne za běhu hry.
- *LLM adaptér:* testy s mock providerem (timeout, chyba, pomalá odpověď,
  cache hit/miss, fallback výběr). Žádné síťové testy v CI.

**Tooling:** Vite + vanilla JS (ES moduly), Vitest, js-yaml, ESLint (mj. zákaz
`Math.random` v `src/engine/`). Bez frameworku, bez bundlovaných UI knihoven.
TypeScript ne — viz ADR-001; typy dokumentujeme JSDoc anotacemi na hranicích
modulů (engine API, formát událostí, rozhraní provideru), volitelně
`// @ts-check` v editoru, bez kompilačního kroku.

---

## 7. ADR — architektonická rozhodnutí

### ADR-001: Vite + vanilla JS; bez TypeScriptu; herní enginy zamítnuty
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** Fixní zadání (CLAUDE.md): Vite + vanilla JS, hot-seat. Zvažováno:
  TypeScript; Godot/Unity/jiný engine.
- **Rozhodnutí:** Vanilla JS (ES moduly) + Vite. TypeScript se nezavádí; typová
  dokumentace přes JSDoc na hranicích modulů. Godot/Unity zamítnuty pro v0.1.
- **Důvody:** (a) hra je textové UI + trocha stavu — engine by přinesl asset
  pipeline, export a učící křivku bez užitku pro validaci loopu; (b) rozhodnutí
  o enginu je explicitně odloženo až po validaci loopu — nepředbíhat;
  (c) TS by u projektu této velikosti (jeden vývojář, ~2–4 týdny) přidal build
  friction a šum v diffech, zatímco JSDoc + `@ts-check` dá 80 % užitku typů
  zadarmo; deterministický engine se stejně jistí golden-run testy, ne typy.
- **Důsledky:** rychlá iterace; disciplínu hranic modulů musí držet ESLint
  a code review, ne kompilátor. Pokud engine přeroste ~3 tis. řádků nebo
  přibude druhý vývojář, TS se přehodnotí (migrace JSDoc→TS je levná).

### ADR-002: Headless deterministický engine + seedované RNG
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** Simulační brána Go/No-Go vyžaduje tisíce runů před vznikem UI;
  balanc se musí ladit reprodukovatelně.
- **Rozhodnutí:** Engine je čistý JS bez DOM/sítě/hodin; veškerá náhoda z jednoho
  seedovaného PRNG; stejný seed + stejné volby = identický run i událostní log.
  UI a simulátor jsou dva klienti téhož API (příkazy dovnitř, události ven).
- **Důsledky:** simulace, golden-run regresní testy a reprodukce bugů („pošli
  seed") zadarmo; vedlejším efektem je připravenost na lockstep networking.
  Cena: disciplína (zákaz `Math.random`/`Date.now` v enginu, lint pravidlo).

### ADR-003: Resoluční pravidla jako data + čistá funkce
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** Resoluční čísla (Žár per hod vs. per uzel, tvrdost, prahy) jsou
  v revizi po auditu design-critica. Architektura na nich nesmí záviset.
- **Rozhodnutí:** Všechna čísla v jednom `rules` objektu; vyhodnocení je čistá
  funkce `resolve(state, action, rules, rng)`. Žádná konstanta resolučního
  systému mimo tento modul.
- **Důsledky:** výměna pravidel = změna jednoho objektu; simulátor porovnává
  varianty pravidel v jedné dávce (přímo podporuje probíhající audit); golden
  testy verzují pravidla spolu se snapshoty.
- **v3 (pivot D14–D17):** mechanismus (čísla = data, `resolve()` = čistá funkce)
  **platí beze změny**; v2 příklady v Kontextu (Žár per hod, tvrdost, prahy hodu)
  jsou nahrazeny v3 měnami (kotvy 2–4 ± šum, hranice pásem, cap postihů, ceny) —
  viz §2.2. *Značka: v2 příklady přepsat při přestavbě enginu.*

### ADR-004: Provider-agnostic LLM adaptér (timeout → fallback, cache, log)
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** Poskytovatel LLM nerozhodnut; tvrdé požadavky: hra nečeká na síť
  (10 s → fallback), 1 volání na uzel, model třídy Haiku, logovat vše, žádný
  volný text hráčů.
- **Rozhodnutí:** Jedno rozhraní `provider.generate(request)`; orchestraci
  (cache lookup → race s 10s timeoutem → validace → log → fallback) vlastní
  adaptér, ne provider. Fallback provider je vždy přítomný a hra je bez klíče
  plně hratelná. Prompt se skládá výhradně dle `prompty/protokol.md`.
- **Zavrženo:** vendor SDK natvrdo v herním kódu (uzamklo by volbu poskytovatele);
  spoléhání na provider-side prompt caching (u Haiku 4.5 je minimální
  cachovatelný prefix 4096 tokenů — náš prompt je kratší, neuplatní se).
- **Důsledky:** výměna poskytovatele = jeden soubor v `providers/`; nákladová
  optimalizace stojí na aplikační cache (ADR-007); JSONL logy živí ladění
  promptu i budoucí malý lokální model.

### ADR-005: Sdílení obsahu — git submodule + dev override `CONTENT_DIR`
- **Datum:** 2026-07-22 · **Status:** přijato
- **Kontext:** `obsah/*.yaml` a `prompty/protokol.md` mají jediný zdroj pravdy
  v design repu; obsah ladí neprogramátor a potřebuje smyčku „ulož → F5".
- **Rozhodnutí:** Kódové repo vkládá design repo jako **git submodule**
  (`content/`) pinovaný na commit → build i CI jsou reprodukovatelné a je vždy
  dohledatelné, s jakou verzí obsahu simulace běžela (verze obsahu jde i do
  `run_started`). Pro vývoj lze `CONTENT_DIR` přesměrovat na lokální checkout
  design repa → živé ladění bez commitů. Submodule aktualizuje vývojář;
  neprogramátor pracuje jen v design repu.
- **Zavrženo:** *kopie souborů* (drift a druhý zdroj pravdy — přímo porušuje
  CLAUDE.md); *symlink* (na Windows vyžaduje developer mode/oprávnění, není
  verzovaný, CI ho nemá).
- **Důsledky:** jedna mimořádná git operace pro vývojáře; obsahová smyčka pro
  neprogramátora zůstává „ulož a obnov stránku".

### ADR-006: Serverová část, Tauri a Steam odloženy mimo v0.1
- **Datum:** 2026-07-22 · **Status:** přijato (odklad)
- **Kontext:** Produkce potřebuje proxy s klíčem, globální cache, fair-use,
  desktop distribuci a online co-op. Nic z toho neověřuje core loop.
- **Rozhodnutí:** v0.1 = lokální `.env` + přímé volání, build se nenasazuje.
  Směr pro později (nezavazující): serverless proxy (např. Cloudflare Worker)
  s klíčem + globální cache + fair-use stropem; Tauri pro desktop; Steam
  networking (SDR) pro co-op. Konkrétní volby padnou až po lidské bráně a nad
  naměřenými daty (hit-rate cache, náklady/run) s operations-economics.
- **Důsledky:** nulová infrastruktura v prototypu; jediné, co se pro produkci
  dělá už teď, je **měření** (logy, hit-rate) — data pro pozdější rozhodnutí.

### ADR-007: Dvouvrstvé klíčování cache protokolů
- **Datum:** 2026-07-22 · **Status:** přijato (hrubý klíč jen stínově měřený)
- **Kontext:** Globální cache je hlavní nákladová páka („náklady na hráče časem
  klesají"); klíč musí maximalizovat hit-rate bez rizika nekonzistentních
  protokolů (zmínka následku, který postava nemá).
- **Rozhodnutí:** (1) exaktní klíč = hash kanonického JSON celého vstupu —
  bezpečný, v0.1 jediný aktivní; (2) hrubý klíč bez textů poznámek s bucketem
  zranění — ukládá se jen pro čisté stavy (bez trvalých poznámek), kde
  nekonzistence nehrozí a objem volání je největší; v0.1 se počítá jen stínově
  pro měření potenciálu. Rozhodnutí o nasazení hrubého klíče v globální cache
  padne nad naměřeným hit-rate (s operations-economics).
- **Zavrženo:** klíčovat včetně seedů/časů (nulový hit-rate); agresivní hrubý
  klíč pro všechny stavy (riziko protokolů odporujících spisu — porušuje
  viditelná pravidla).
- **Důsledky:** v logu každého volání je obojí klíčování → ekonomika globální
  cache se spočítá z dat, ne z odhadu.
- **v3 (pivot D14–D17):** dvouvrstvý mechanismus **platí**; v2 pole klíče (karta
  `tag/síla`, hrubý „bucket počtu zranění") jsou nahrazeny v3 měnami (karta =
  věc se staty + štítky; bucket **stavu postihů**) — viz značka v §2.3.
  *Přepsat při přestavbě enginu.*

### ADR-008: Událostní log v3 — jeden log, tři konzumenti; telegraf derivuje engine
- **Datum:** 2026-07-23 · **Status:** přijato (vlastní technical-developer dle D19)
- **Kontext:** Pivot na slotovou resoluci (D14–D17) zneplatnil v2 událostní log
  (§2.2). Nález kritika B2: **jeden log musí uspokojit tři konzumenty** —
  (a) gate-metriky K1–K9 v3 brány, (b) strojové `podminka` tajných cílů v3
  (nástupce v2 měn zraneni/kolaps/max_sila_karty), (c) `max_achievable_band`
  (nejlepší dosažitelné pásmo z committnutých karet, jádro K5). Bez granulárního
  logu by se každý konzument musel dopočítávat druhým průchodem enginem.
- **Rozhodnutí:**
  1. **Nová sada událostí (§2.2 v3):** `run_started`, `map_move`,
     `telegraf_derived`, `commit`, `situation_revealed`, `assignment`, `gamble`,
     `slot_resolved` (×4), `band_resolved`, `penalty_added/expired/healed`,
     `character_folded/returned`, `credit_flow`, `zar_move`, `goal_scored`,
     `run_ended`. Zrnitost per slot (ne jediný `node_resolved` blob), protože
     max_band i cíle potřebují stat-vs-práh na úrovni slotu.
  2. **`telegraf_signal` derivuje ENGINE ze slotů, ne autor.** `signal_pravy`
     (trend statů, počet „proti srsti", „zbraň projde") je čistá funkce definice
     slotů uzlu. Autorská próza telegrafu je jen lidský rendering a **musí věrně
     odpovídat derivovanému signálu — QA invariant** (hlídá content-check, ne
     engine). **Fidelita `p`** je v simu **sweep knob**: bot committne proti
     `signal_vyslany` (zašuměný o `1−p`); gap pravý vs. vyslaný je z logu měřitelný.
  3. **`max_achievable_band`** počítá engine (oracle hook) nad `commit` ×
     `situation_revealed` (+ rušení statu pronásledovatelem) jako **optimální**
     rozdělení 4 karet do 4 slotů — nezávisle na skutečném rozdělení týmu.
     Jádro K5 (max<4/4 = nevyhnutelně špatný slot); `gap = max − real` = K4c
     learnabilita. Determinismus (ADR-002) umožní **counterfactual swing** (K6c).
  4. **Model lízání (D19c):** **sdílený standardní balík** (~40, odhaz,
     reshuffle; líznutá věc patří lízajícímu). `run_started.loadout` per hráč je
     v MVP `[]` — **post-MVP hook** pro osobní loadout (prémiové věci do startovní
     ruky, per hráč, neředí sdílený balík). Custom karty ostatních sytí truhly
     přes globální fond — mimo engine, jen poznámka.
  5. **Slotové/prahové invarianty do `rules` + logu:** kombinovaný slot =
     **„oba staty ≥ kotva"** (`typ_prahu: kombi_oba`); **kotvy jen 2–4** (práh 0
     zakázán) + **šum ±1** ze seedovaného PRNG (`prah = kotva + šum`). `efekt`
     postihu je **enum z obsahu** (game-designer dodefinuje/škrtne — D19: hide_nazvy
     škrtnut, lock_stat/lock_slot_viditelnost/lock_gamble otevřené); engine je
     k enumu agnostický, jen ho loguje.
- **Zavrženo:** jediná blob-událost `node_resolved` (v2) — neunese per-slot
  max_band ani cíle; **autorsky psaný telegraf signál** (riziko, že próza slíbí
  jinou informaci než sloty — proto derivace enginem + QA invariant).
- **Důsledky:** protokolová pipeline i simulátor čtou tentýž log; cíle se bodují
  přes odvozené metriky (§2.2), ne přes redundantní pole; instrumentace
  `pocet_preskladani` (K6b) žije na `assignment`. Náklady: log je širší než v2 —
  ale simulátor stejně serializuje vše do JSONL (§3), takže cena je nulová navíc.

---

*Souvisí: [prototyp-mvp.md](../prototyp-mvp.md) (technologie, resoluční systém,
metriky), [design-dokument.md](../design-dokument.md) (§4.2 viditelná pravidla,
§4.5 protivníci, §6 AI architektura & náklady), [prompty/protokol.md](../prompty/protokol.md)
(kanonický prompt), `obsah/*.yaml` (schémata obsahu), `CLAUDE.md` (neporušitelné
principy, dvoustupňové Go/No-Go).*
