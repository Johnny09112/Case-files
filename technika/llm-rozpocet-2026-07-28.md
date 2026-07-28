# Rozpočtový podklad pro rozhodnutí o LLM poskytovateli

*Zpracoval `operations-economics`, 2026-07-28. Podklad pro rozhodnutí uživatele —
blokátor fáze 3 (`projekt/stav.md`, otevřené otázky). Čísla, ne verdikt;
doporučení je v §11.*

**Každé číslo v tomto dokumentu stojí na předpokladu, který je označen `[P-n]`
a shrnut v §1. Když se předpoklad změní, přepočítej — model je
v `projekt/ekonomika/llm-rozpocet-2026-07-28.xlsx`.**

---

## 0. Shrnutí pro netrpělivé

| Zjištění | Číslo |
|---|---|
| Náklad na jedno volání (Haiku 4.5) | **$0,0025** |
| Volání na jeden run (**měřeno**, ne odhadnuto) | **7,56 (1p) až 8,66 (4p)**, medián 8–9, p90 ≈ 11 |
| Náklad na run bez cache (Haiku) | **$0,0195** = €0,018 |
| Čistý příjem z jedné licence po Steamu a DPH | **€5,78 = $6,24** |
| Break-even (Haiku, nulová cache, sólo) | **320 runů ≈ 200 hodin hry** |
| Break-even (Sonnet 5, nulová cache) | **107 runů ≈ 70 hodin** |
| Náklad na *průměrného* hráče populace (Haiku, cache 50 %) | **$0,19 = 3,1 % čistého příjmu** |

**Verdikt: udržitelné u obou modelů.** Rozpočet není blokátor volby modelu —
riziko není v průměru, ale v ocasu distribuce, a ten řeší fair-use strop.

**Ale tři nálezy mění zadání víc než volba poskytovatele:**

1. **Architektura podhodnotila vstup 2×.** `technika/architektura.md` §2.3
   uvádí „~600–800 tokenů vstup"; skutečnost je **~1 470**. Odhad
   $0,002/uzel přesto vyšel skoro správně, protože zároveň podhodnotil,
   jak moc dominuje výstup. (§2)
2. **Cache klíč, jak je dnes specifikovaný, globální cache nikdy nenaplní.**
   Vstupní formát promptu vypéká do každého volání stav runu (`konto 4`,
   `šerif 5/10`, `náklad 6`) a tím zvedá klíčový prostor o ~3 řády. Bez
   bucketování je hit-rate strukturálně <5 % navždy. (§6)
3. **Předgenerování cache dávkovým API stojí ~$250 a koupí teplou cache
   od dne 1.** To je nejlevnější páka v celém dokumentu. (§7)

---

## 1. Předpoklady — všechny na jednom místě

| # | Předpoklad | Hodnota | Zdroj / jistota |
|---|---|---|---|
| **P-1** | Ceník Anthropic 1P API, USD/1M tokenů | Haiku 4.5 `1 / 5`; Sonnet 5 `3 / 15` (zaváděcí `2 / 10` do 2026-08-31); Opus 5 `5 / 25` | **Ověřeno** skill `claude-api`, 2026-07-28. Poskytovatel-specifické. |
| **P-2** | Český tokenizační multiplikátor | **2,5 znaku / token** | **Odhad.** Citlivost v §3. Angličtina ~3,8; čeština je dražší kvůli diakritice a flexi. Ověřit `messages.count_tokens` při stavbě adaptéru. |
| **P-3** | Délka systémového promptu | 1 716 znaků | **Změřeno** v `prompty/protokol.md` (v0.3, ř. 12–38). |
| **P-4** | Délka šablony formátu vstupu | 715 znaků | **Změřeno** (ř. 44–56). |
| **P-5** | Délka per-uzlové instance vstupu | 1 234 znaků | **Změřeno** na reálné instanci `farmar-brod` proti `obsah/*.yaml` a `rules.js` (viz §2). |
| **P-6** | Délka výstupu (protokol 3–5 vět) | 518 znaků | **Změřeno** na kanonické ukázce v `protokol.md`. |
| **P-7** | Volání na run | 7,56 / 8,54 / 8,63 / 8,66 (1p/2p/3p/4p) | **Změřeno** simulátorem, 2 000 runů na počet hráčů, strategie `kompetentni`, seedy 1–1000 × 2 pronásledovatelé. Počítány události `band_resolved`. |
| **P-8** | Podíl zmařených volání (timeout 10 s, chyba, 529) | **3 %** | **Odhad.** Haiku generuje ~200 tokenů za 2–4 s, takže 10s timeout by měl střílet zřídka; 3 % je rezerva na síťový ocas a přetížení. Zmařené volání se **platí celé**. |
| **P-9** | Steam revenue share | 30 % | Standard do $10M obratu. |
| **P-10** | DPH | 21 % (CZ), cena 9,99 € je včetně DPH | Steam v EU uvádí ceny s DPH. Sazba v EU 17–27 % → citlivost ±4 % na čistý příjem. |
| **P-11** | Kurz | 1 EUR = 1,08 USD | **Odhad.** Vliv lineární a malý. |
| **P-12** | Rozdělení runů na hráče | medián 6 · heavy 100 · extrém 500 · populační průměr 19,8 | **Odhad**, žádná data. Kalibrace: 40 % ≤2 runy, 40 % 3–15, 15 % 16–80, 5 % >80 (μ=200). **Nejkřehčí předpoklad celého modelu** — viz §10. |
| **P-13** | Cache hit-rate | **volný parametr**, ne odvozené číslo | Neodhaduju ho; §6 ukazuje křivku a co ho určuje. |
| **P-14** | Fixní infrastruktura (proxy + cache DB) | $50–150 / měsíc | Cloudflare Workers + KV/D1 nebo malá VPS. Pokryto **8 prodanými kopiemi měsíčně**. |
| **P-15** | Free demo | 0 API nákladů | Design §9: pevný sólo run s předgenerovaným obsahem. Ověřeno, riziko nulové. |

---

## 2. Náklad na jedno volání

### 2.1 Skladba promptu

Vstup má **dvě části s naprosto různým ekonomickým chováním** — a v dnešní
dokumentaci se to nikde nerozlišuje:

| část | znaků | tokenů `[P-2]` | mění se? |
|---|---|---:|---|
| systémový prompt `[P-3]` | 1 716 | 686 | ne — identický ve všech voláních |
| šablona formátu vstupu `[P-4]` | 715 | 286 | ne |
| **stabilní prefix celkem** | **2 431** | **972** | **cachovatelný** |
| instance uzlu `[P-5]` | 1 234 | 494 | ano — per uzel |
| **vstup celkem** | **3 665** | **1 466** | |
| výstup `[P-6]` | 518 | **207** | ano |

Instance, na které je to změřeno (situace `farmar-brod`, pásmo 2/4, reálné
staty z `obsah/veci.yaml`, postih z pásmového poolu, Žár a kredity dle
`rules.js`):

```
SITUACE: Farmářův brod (npc) — Kola zapadla doprostřed brodu a na břehu už čeká
farmář s vidlemi. […]
ROZDĚLENÍ: (přesně 4 sloty)
  Zaplatit za vytažení [viditelná]: podezřelý A — „Balík bankovek"
  […]
VÝSLEDEK MECHANIKY: pásmo S NÁSLEDKY 2/4
  Zaplatit za vytažení: zásah (práh 4; „Balík bankovek" mělo hodnota 5)
  […]
NÁSLEDKY:
  postihy: podezřelý C — „Roztřesené ruce" (lehký, nervy na dranc)
  kredity: 0 (pásmo 2/4 nenese příjem);  konto 4
  Žár:     +1 — pásmo S NÁSLEDKY;  šerif o políčko blíž (5/10, práh léčky 7)
  bedny:   ztraceno 0;  náklad 6
```

> **Nález A — architektura podhodnotila vstup o 100 %.**
> `technika/architektura.md` §2.3 odhaduje „~600–800 tokenů vstup + ~150–200
> výstup". Skutečnost: **1 466 vstup / 207 výstup**. Odhad $0,002/uzel přesto
> netrefil vedle jen proto, že se dvě chyby vyrušily. Řádek v architektuře
> je potřeba opravit (návrh v §12).

### 2.2 Cena za volání

| model | vstup $/M | výstup $/M | vstup | výstup | **celkem / volání** |
|---|---:|---:|---:|---:|---:|
| **Claude Haiku 4.5** | 1,00 | 5,00 | $0,001466 | $0,001035 | **$0,002501** |
| **Claude Sonnet 5** (std) | 3,00 | 15,00 | $0,004398 | $0,003105 | **$0,007503** |
| Claude Sonnet 5 (zaváděcí do 2026-08-31) | 2,00 | 10,00 | $0,002932 | $0,002070 | $0,005002 |
| Claude Opus 5 (reference) | 5,00 | 25,00 | $0,007330 | $0,005175 | $0,012505 |
| *třída Gemini Flash-Lite (referenční konkurence)* | *0,10* | *0,40* | *$0,000147* | *$0,000083* | *$0,000230* |

> **Nález B — výstup je 41 % nákladu na volání a prompt caching se ho nikdy
> nedotkne.** Na Haiku připadá $0,001035 z $0,0025 na 207 výstupních tokenů.
> Jediná páka, která maže i výstup, je **aplikační cache protokolů** (hit =
> žádné volání). To potvrzuje ADR-007 jako správnou prioritu — ale z jiného
> důvodu, než uvádí (§5).

---

## 3. Citlivost na českém tokenizeru `[P-2]`

Multiplikátor je jediný nezměřený vstup do ceny volání. Vyčísleno:

| znaků/token | vstup tok. | výstup tok. | Haiku $/volání | odchylka |
|---:|---:|---:|---:|---:|
| 2,2 (pesimisticky) | 1 666 | 236 | $0,002841 | **+13,6 %** |
| **2,5 (základ)** | **1 466** | **207** | **$0,002501** | — |
| 3,0 (optimisticky) | 1 222 | 173 | $0,002085 | **−16,6 %** |

**Závěr: tokenizer o ničem nerozhoduje.** ±15 % na čísle, které je samo o dva
řády pod čistým příjmem. Kdyby čeština vyšla o 40 % dráž než anglický odhad,
break-even se posune z 320 na 274 runů — pořád ~170 hodin hry. Multiplikátor
ověřit při stavbě adaptéru (`messages.count_tokens`), ale **nečekat s
rozhodnutím na něj**.

---

## 4. Náklad na run

`[P-7]` — **klíčová oprava proti dosavadnímu zadání.** V zadání i v CLAUDE.md
se pracuje s „run ≈ 6 uzlů = strop 6 volání". Engine to nedělá:

| | 1p | 2p | 3p | 4p |
|---|---:|---:|---:|---:|
| `pocet_uzlu` v `run_end` | 6,36 | 6,41 | 6,63 | 6,67 |
| **skutečná volání (`band_resolved`)** | **7,56** | **8,54** | **8,63** | **8,66** |
| z toho backbone | 4,50 | 4,83 | 5,03 | 5,07 |
| z toho Zátah | 1,14 | 0,99 | 0,99 | 0,99 |
| z toho léčka | 1,00 | 1,44 | 1,42 | 1,42 |
| z toho konfrontace | 0,92 | 1,29 | 1,19 | 1,19 |
| medián | 8 | 9 | 9 | 9 |
| p90 / max | 11 / 13 | 11 / 15 | 11 / 15 | 11 / 15 |

> **Nález C — `pocet_uzlu` je o ~2 nižší než počet volání.** Vložená setkání
> (léčka + konfrontace) mají vlastní `band_resolved`, ale `completedNodes`
> neposouvají (`state.js` ř. 18–22). Naopak **truhla a motel jsou uzly bez
> situace** a volání negenerují. Kdo bude rozpočet počítat z `pocet_uzlu`,
> podstřelí ho o 30 %.

Náklad na run včetně zmařených volání `[P-8]`, **bez cache**:

| model | 1p ($0,0025 × 7,79) | 4p ($0,0025 × 8,92) |
|---|---:|---:|
| **Haiku 4.5** | **$0,01948** | **$0,02231** |
| Sonnet 5 (std) | $0,05844 | $0,06693 |
| Sonnet 5 (zaváděcí) | $0,03897 | $0,04462 |
| Opus 5 | $0,09741 | $0,11154 |
| *třída Flash-Lite* | *$0,00179* | *$0,00205* |

**Pozor na definici „na hráče" u co-opu.** V hot-seat režimu 4 hráčů hraje
jeden run **jedna zakoupená licence**, ale generuje 8,92 volání místo 7,79.
Hot-seat je tedy ekonomicky **horší** než sólo (+15 % na licenci). Online lobby,
kde každý hráč vlastní kopii, je naopak 4× lepší. Modeluju konzervativně sólo/
hot-seat.

---

## 5. Prompt caching poskytovatele — kde funguje a kde ne

Stabilní prefix je **972 tokenů** (§2.1). Minimální cachovatelný prefix:

| model | minimum | náš prefix 972 | | |
|---|---:|---|---|---|
| Claude Haiku 4.5 | 4 096 | **necachuje se** (tiše, `cache_creation_input_tokens: 0`) | chybí 3 124 tok. | |
| Claude Sonnet 5 | 1 024 | **necachuje se** — chybí **52 tokenů** | | |
| Claude Opus 5 | 512 | cachoval by se | | |

> **Nález D — na Sonnetu 5 nám k funkční prompt cache chybí 52 tokenů.**
> To je jedna věta few-shot příkladu. `prompty/protokol.md` už dva příklady
> obsahuje (dobrý 518 zn. ≈ 207 tok., špatný ≈ 130 tok.) — stačí je přesunout
> **do systémového promptu** místo do dokumentace vedle něj.

Ekonomika po tomto zásahu (prefix ~1 200 tokenů, cache read 0,1×):

| | necachovaný prefix | cachovaný prefix | úspora |
|---|---:|---:|---:|
| Sonnet 5, vstup | 1 694 tok. = $0,005082 | 614 tok. ekv. = $0,001842 | |
| Sonnet 5, **celé volání** | **$0,008187** | **$0,004947** | **−40 %** |

Tím se poměr Haiku : Sonnet 5 zúží z **3,0×** na **2,0×**. Cache write je
1,25× (TTL 5 min) a při souvislém provozu (stejný prefix pro všechny hráče
napříč organizací) se prefix drží teplý prakticky trvale — TTL 5 min je delší
než mezera mezi voláními, jakmile je současně aktivních aspoň pár stolů.

**Na Haiku se to nevyplatí.** Nafouknutí prefixu na 4 096 tokenů znamená napsat
~3 100 tokenů (~7 800 znaků) navíc do každého volání. Při 100% hit-rate to ušetří
562 tokenů = $0,00056/volání (22 % z ceny volání); při každém *miss* to naopak
volání skoro zdvojnásobí. **Doporučení: na Haiku prompt caching neřešit.**
Jediná výjimka — kdyby se prompt rozšiřoval o few-shot příklady *kvůli kvalitě
humoru* a překročil 4 096 přirozeně, pak se caching bere jako vedlejší zisk.

**Batch API (−50 %) pro živé volání použít nelze** (latence až 24 h vs. princip
„hra nikdy nečeká na síť"). Pro offline předgenerování ano — viz §7.

---

## 6. Aplikační cache — hlavní páka, a strukturální problém v jejím klíči

### 6.1 Křivka nákladu

Hit = žádné volání, tedy mizí vstup i výstup. Náklad škáluje lineárně:

`náklad/run = volání × (1 − hit_rate) × (1 + 3 %) × cena_volání`

**Haiku 4.5, sólo run:**

| hit-rate | $/run | €/run | break-even (runů na licenci) |
|---:|---:|---:|---:|
| 0 % | 0,01948 | 0,0180 | **320** |
| 10 % | 0,01753 | 0,0162 | 356 |
| 20 % | 0,01558 | 0,0144 | 401 |
| 30 % | 0,01364 | 0,0126 | 458 |
| 40 % | 0,01169 | 0,0108 | 534 |
| **50 %** | **0,00974** | **0,0090** | **641** |
| 60 % | 0,00779 | 0,0072 | 801 |
| 70 % | 0,00584 | 0,0054 | 1 068 |
| 80 % | 0,00390 | 0,0036 | 1 602 |
| 90 % | 0,00195 | 0,0018 | 3 204 |
| 95 % | 0,00097 | 0,0009 | 6 408 |

**Sonnet 5 (std)** je konstantním násobkem 3,0×: break-even 107 / 214 / 356 /
1 068 runů při 0 / 50 / 70 / 90 % hit-rate. S prompt cachingem dle §5 se to
posune na 2,0× → break-even 160 / 320 / 534 / 1 602.

### 6.2 Kolik hitů je vůbec dosažitelné — a proč to dnešní klíč zabíjí

Klíč dle ADR-007 obsahuje `{uzel_id, seřazené záznamy [postava_id, karta_id,
pásmo, typ následku], ztracené bedny, digest poznámek}`. Vstupní formát
promptu (`protokol.md` §Formát vstupu) navíc nese **konto kreditů, přesnou
pozici šerifa s prahem, počet beden**. Cokoli je v promptu, musí být v klíči —
jinak cache vrátí protokol, který mluví o cizím stavu runu.

Odhad efektivního klíčového prostoru (řádově, per situace):

| faktor | varianta A: dnešní formát | varianta B: bucketovaný |
|---|---:|---:|
| realistická rozdělení 4 věcí do 4 slotů při kompetentní hře | ~500 | ~500 |
| vzorce zásah/selhání (prahy ± šum) | ×3 | ×3 |
| tažený postih z pásmového poolu | ×4 | ×4 |
| permutace podezřelých A–D | ×4 | **×1** (kanonizovat) |
| Žár 0–10 | ×11 | ×3 (bucket) |
| náklad 0–6 | ×7 | **×1** (z promptu pryč) |
| konto kreditů | ×~15 | **×1** (z promptu pryč) |
| **per situace** | **~2,8 × 10⁷** | **~1,8 × 10⁴** |
| **× ~20 typů situací** | **~5,5 × 10⁸** | **~3,6 × 10⁵** |

> **Nález E — varianta A globální cache nikdy nenaplní.** Při 5 500 prodaných
> kopiích × 19,8 runu × 8 volání ≈ **870 000 volání za celou životnost titulu**.
> Proti klíčovému prostoru 5,5 × 10⁸ je to 0,16 % pokrytí — hit-rate zůstane
> pod 5 % navždy a celá „globální cache à la Infinite Craft" z `design-dokument.md`
> §8 je iluze. Proti prostoru 3,6 × 10⁵ je stejný objem **2,4× přesaturovaný**
> a hit-rate se drží v pásmu 60–75 %.

Tři zásahy, které ten rozdíl udělají — a jsou to **úpravy promptu, ne kódu cache**:

1. **Kanonizovat podezřelé.** Protokol se generuje s A–D přiřazenými podle
   pořadí slotů, jména (a mapování na skutečné hráče) se dosazují lokálně.
   Design §5 už to říká pro jména; je potřeba to dotáhnout na *identity*.
   **Zisk 4×, nulová cena.**
2. **Vyhodit z promptu konto kreditů a přesný počet beden.** Protokol je nemá
   proč jmenovat — UI je zobrazuje samo a anotační vrstva 2.1 je vysvětluje.
   **Zisk ~100×.** (Ztráta beden *v tomto uzlu* v promptu zůstat musí, ta je
   dějová; zůstat musí i `ztraceno n`.)
3. **Bucketovat Žár** na 3 stupně (`klid` / `sledují vás` / `v patách`) místo
   `5/10, práh léčky 7`. **Zisk ~4×.** Bonus: dobovému protokolu sluší
   „šerifovy hlídky přituhly" víc než číslo.

**Tohle je jediné rozhodnutí v celém dokumentu, které je nevratné.** Formát
promptu se zafixuje se stavbou adaptéru a každý protokol vygenerovaný do staré
cache je pak mrtvý zápis. Udělat to **před** fází 3, ne po ní.

---

## 7. Předgenerování cache dávkovým API

Batch API má −50 % a latenci až 24 h — pro živé volání nepoužitelné, pro
**naplnění cache před launchem ideální**.

| objem předgenerovaných protokolů | Haiku batch ($0,00125/ks) | Sonnet 5 batch ($0,00375/ks) |
|---:|---:|---:|
| 50 000 | $63 | $188 |
| **200 000** | **$250** | **$750** |
| 1 000 000 | $1 250 | $3 750 |

Při klíčovém prostoru varianty B (3,6 × 10⁵) pokryje **200 000 předgenerovaných
protokolů hlavu distribuce** — tedy ty kombinace, které kompetentní hra
produkuje nejčastěji. Odhadovaný startovní hit-rate: **50–65 % od prvního dne**,
místo 0 %.

**Vedlejší zisky, které jsou možná cennější než ta úspora:**
- Odpadá cold-start (design §7 ho řeší ručním naseedováním karet; totéž platí
  pro protokoly).
- Cache hit = **nulová latence** → psací stroj klepe okamžitě, bez maskování.
- Předgenerovaný obsah lze **projet regresní baterií humor-testera** dřív, než
  ho uvidí hráč. To je jediný způsob, jak kvalitu českého humoru zkontrolovat
  ve velkém — což CLAUDE.md označuje za největší produktové riziko.
- Free demo `[P-15]` může jet z téže databáze.

Cena je řádově **jedna prodaná kopie za každých ~5 000 předgenerovaných
protokolů** (Haiku) nebo ~1 665 (Sonnet 5). Doporučených 200 000 protokolů na
Haiku tedy zaplatí **40 prodaných kopií**.

---

## 8. Break-even proti ceně 9,99 €

### 8.1 Čistý příjem z licence

```
9,99 €  hrubá cena včetně DPH  [P-10]
÷ 1,21  DPH 21 %               → 8,256 €
× 0,70  Steam 30 %  [P-9]      → 5,779 €
× 1,08  kurz  [P-11]           → $6,242
```

**€5,78 = $6,24 na licenci.** (Daň z příjmu, refundy, platební poplatky a
amortizace vývoje mimo rozsah — tohle je provozní ekonomika, ne P&L.)

### 8.2 Kdy hráč prodělá

| model / režim | $/run (h=0) | break-even runů | ≈ hodin hry |
|---|---:|---:|---:|
| Opus 5, všechny uzly | 0,0974 | **64** | ~40 |
| **Sonnet 5 std, všechny uzly** | 0,0584 | **107** | ~70 |
| Sonnet 5 std + prompt cache (§5) | 0,0385 | 162 | ~105 |
| **Haiku 4.5, všechny uzly** | 0,0195 | **320** | ~200 |
| Haiku, jen finálové uzly (§9c) | 0,0079 | **792** | ~500 |
| třída Flash-Lite, všechny uzly | 0,0018 | 3 494 | ~2 200 |
| jen fallbacky | 0 | ∞ | — |

*Přepočet na hodiny: run 8–9 uzlů ≈ 35–40 min `[odhad]`.*

### 8.3 Náklad na hráče podle intenzity `[P-12]`

Haiku, všechny uzly, jako % z čistého příjmu $6,24:

| hráč | runů | h = 0 % | h = 60 % |
|---|---:|---|---|
| medián | 6 | $0,12 (**1,9 %**) | $0,05 (0,7 %) |
| heavy | 100 | $1,95 (**31 %**) | $0,78 (12 %) |
| extrém | 500 | $9,74 (**156 % → ztráta**) | $3,90 (62 %) |
| **populační průměr** | **19,8** | **$0,39 (6,2 %)** | **$0,15 (2,5 %)** |

Sonnet 5 std, tytéž hráči:

| hráč | runů | h = 0 % | h = 60 % |
|---|---:|---|---|
| medián | 6 | $0,35 (5,6 %) | $0,14 (2,2 %) |
| heavy | 100 | $5,84 (**94 %**) | $2,34 (37 %) |
| extrém | 500 | $29,2 (**468 % → ztráta**) | $11,7 (**187 % → ztráta**) |
| populační průměr | 19,8 | $1,16 (18,6 %) | $0,46 (7,4 %) |

> **Nález F — ekonomické riziko není v průměru, je v ocasu.** Populační průměr
> je i na Sonnetu 5 pod 19 % čistého příjmu. Ztrátový je výhradně extrémní
> hráč — 5 % populace, kterou z definice řeší fair-use strop. **Volba modelu
> tedy nerozhoduje o udržitelnosti, rozhoduje o tom, jak brzy musí strop
> zafungovat** (a tím jak viditelný bude).

### 8.4 Fair-use strop — návrh

Strop na *počet runů* je špatná metrika, protože se s dozrávající cache mění,
co si můžeme dovolit. Navrhuju **strop na útratu na licenci**, který se sám
uvolňuje:

> **Strop = $1,50 útraty za API na licenci (24 % čistého příjmu).**
> Po jeho vyčerpání jede hra čistě z cache a fallbacků — což je dle **D40**
> plnohodnotný primární obsah, ne degradace.

Kdy strop zafunguje (= po kolika runech):

| režim | h = 0 % | h = 60 % |
|---|---:|---:|
| Haiku, všechny uzly | 77 runů | 192 runů |
| Haiku, jen finálové | 190 runů | 475 runů |
| Sonnet 5, všechny uzly | **26 runů** | 64 runů |
| Sonnet 5 + prompt cache | 39 runů | 97 runů |
| Sonnet 5, jen finálové | 63 runů | 159 runů |

> **Nález G — Sonnet 5 na všech uzlech je se stropem $1,50 nekompatibilní.**
> Strop by zafungoval po 26–64 runech, tedy u každého trochu zaujatého hráče,
> a byl by tím pádem **viditelný** — což porušuje zadání „tichý fair-use strop".
> Buď zvednout strop na ~$3 (48 % příjmu, agresivní), nebo Sonnet použít jen
> na části uzlů (§9c).

---

## 9. Scénáře

Sólo run `[P-7]`, náklad na licenci při populačním průměru 19,8 runu `[P-12]`,
marže proti čistému příjmu $6,24.

| | volání/run | $/volání | **$/run** | **$/hráč** (h=0) | **$/hráč** (h=60 %) | **marže** (h=60 %) | **break-even** |
|---|---:|---:|---:|---:|---:|---:|---:|
| **(a) plné LLM — Haiku 4.5** | 7,79 | 0,00250 | **0,0195** | 0,386 | 0,154 | **97,5 %** | **320 runů** |
| **(b) plné LLM — Sonnet 5** | 7,79 | 0,00750 | **0,0584** | 1,157 | 0,463 | **92,6 %** | **107 runů** |
| (b′) Sonnet 5 + prompt cache §5 | 7,79 | 0,00495 | 0,0385 | 0,763 | 0,305 | 95,1 % | 162 runů |
| **(c) hybrid — LLM jen na finálových uzlech** (Zátah + léčka + konfrontace = 3,15 volání) | 3,15 | | | | | | |
|  ⤷ Haiku | 3,15 | 0,00250 | **0,0079** | 0,156 | 0,062 | **99,0 %** | **792 runů** |
|  ⤷ Sonnet 5 | 3,15 | 0,00750 | **0,0236** | 0,468 | 0,187 | **97,0 %** | **264 runů** |
| **(d) žádné LLM — jen fallbacky** | 0 | 0 | **0** | 0 | 0 | **100 %** | ∞ |

Fixní infrastruktura `[P-14]` ve variantách (a)–(c): $50–150/měsíc, pokryto
8–24 prodanými kopiemi za měsíc. Ve variantě (d) odpadá i ta (žádná proxy,
žádná cache DB, žádný fair-use strop, žádná Steam AI disclosure jako
Live-Generated).

### 9.1 Co varianta (d) opravdu stojí — a je to obsahové, ne finanční

Fallback sada má **28 šablon**, ale výběr je po `(typ, pásmo)`, takže reálný
pool na jedno vylosování je: `4/4` **3 šablony**, `3/4` **4**, `2/4` **5**,
`≤1/4` **5**. Rozložení pásem v runu při K1 ~57–79 % `[odhad z brány]`:
~1,3 / 3,0 / 3,0 / 1,3 uzlu.

Pravděpodobnost, že hráč **v jednom jediném runu** uvidí tutéž kostru dvakrát:

| pásmo | pool | tahů/run | P(opakování v runu) |
|---|---:|---:|---:|
| 3/4 HLADCE | 4 | 3,0 | **62,5 %** |
| 2/4 S NÁSLEDKY | 5 | 3,0 | **52,0 %** |
| ≤1/4 PRŮŠVIH | 5 | 1,3 | ~13 % |
| 4/4 HLADCE+LOOT | 3 | 1,3 | ~13 % |

**Opakování uvnitř jednoho runu je pravděpodobnější než jeho absence.**
Dosazování `{jmeno}` a názvu situace to změkčí, ale kostra věty se zopakuje.
To není argument proti variantě (d) jako takové — je to argument, že **(d)
vyžaduje buď 3–4× větší fallback sadu (~100 šablon), nebo přiznání, že se
protokoly opakují.** Ekonomicky vyjádřeno: rozšíření sady o 70 šablon stojí
jedno obsahové kolo; předgenerování 200 000 protokolů (§7) stojí $250 a řeší
totéž definitivně.

### 9.2 Kde LLM přidá nejvíc na korunu

Dvě protichůdné logiky, obě obhajitelné:

| logika | kde nasadit | volání/run | proč |
|---|---|---:|---|
| **rozmanitost** | běžné uzly, pásma `3/4` a `2/4` | ~6,0 | tam se fallbacky opakují (62 % / 52 %) |
| **dramaturgie** | Zátah, léčka, konfrontace | 3,15 | tam run vrcholí a hráč to bude vyprávět dál |

Rozmanitostní logika je **2× dražší** a míří na uzly, které hráč zapomene.
Dramaturgická stojí polovinu a míří na moment, který se sdílí na Redditu.
Pro produkt za 9,99 € s marketingovým hookem „AI píše protokol" je
dramaturgická logika lepší investice na dolar — **a dovolí použít dražší
a lepší model** (Sonnet 5 na 3,15 volání stojí $0,0236/run, tedy jen o 21 %
víc než Haiku na všech uzlech).

---

## 10. Co je poskytovatel-specifické a co ne

| poskytovatel-**specifické** (přepočítat při změně) | poskytovatel-**agnostické** (drží vždy) |
|---|---|
| jednotkové ceny `[P-1]` | volání na run: **7,56–8,66** `[P-7]` |
| minimální cachovatelný prefix (4 096 / 1 024 / 512) — §5 | délka promptu ve znacích `[P-3..P-6]` |
| násobky cache read/write (0,1× / 1,25× / 2×) | struktura break-even a čistý příjem €5,78 |
| batch sleva −50 % | klíčový prostor cache a nález E (§6) |
| latence → podíl zmařených volání `[P-8]` | rozdělení pásem a opakování fallbacků (§9.1) |
| tokenizace (± ~20 % mezi poskytovateli) | fair-use strop jako mechanismus |

**U levnějšího konkurenta** (třída Gemini 2.5 Flash-Lite, $0,10/$0,40 za MTok,
ověřeno WebSearch 2026-07-28 — viz zdroje) vyjde volání na **$0,00023**, run
na **$0,0018** a break-even na **3 494 runů**. Tam rozpočet přestává být
kategorií: i extrémní hráč s 500 runy stojí $0,90, tedy 14 % čistého příjmu,
**bez jakékoli cache a bez fair-use stropu.**

Ekonomika tedy říká: *čím levnější model, tím menší role cache i stropu.*
Rozhodnutí se tím celé přesouvá na osu **kvalita českého humoru**, kde
`operations-economics` nemá co říct — to je doména `protocol-humor-tester`.

---

## 11. Doporučení

**Rozpočet žádnou z variant nevylučuje.** Verdikt po scénářích:

| varianta | verdikt |
|---|---|
| (a) Haiku 4.5, všechny uzly | **udržitelné** — break-even 320 runů, populační náklad 2,5–6,2 % příjmu |
| (b) Sonnet 5, všechny uzly | **rizikové** — udržitelné v průměru, ale fair-use strop by zafungoval po 26–64 runech a byl by viditelný (nález G) |
| (b′) Sonnet 5 + prompt cache | **udržitelné** — nález D stojí 52 tokenů a sráží cenu o 40 % |
| **(c) hybrid: Sonnet 5 na 3,15 finálových uzlech** | **udržitelné s rezervou** — $0,0236/run, break-even 264 runů, nejlepší poměr kvalita/dolar |
| (d) jen fallbacky | **udržitelné, ale nemá 100 šablon** — opakování uvnitř runu 52–62 % (§9.1) |

### Doporučená posloupnost

1. **Nejdřív opravit prompt, teprve pak volit poskytovatele.** Tři zásahy z §6
   (kanonizace podezřelých, vyhození konta/beden, bucketování Žáru) mění
   dosažitelný hit-rate z <5 % na 60–75 %. Jsou nevratné ve smyslu, že po
   fixaci formátu je stará cache mrtvá. **Toto je jediná položka, která má
   deadline před rozhodnutím o modelu.**

2. **Rozhodnutí o modelu odložit za blind test, který je levnější než rozhodnutí.**
   Než se řeší Haiku vs. Sonnet, ať `protocol-humor-tester` udělá slepé
   srovnání **fallback vs. Haiku vs. Sonnet 5** na regresní baterii. D40 udělal
   z fallbacků primární obsah; když se v slepém testu nepozná rozdíl mezi
   fallbackem a Haiku, je odpověď (c) nebo (d) a celá debata o poskytovateli
   je akademická. Náklad testu: ~200 volání = **$1,50**.

3. **Doporučená konfigurace závisí na výsledku testu, a ekonomicky dominuje Haiku.**
   Seřazeno podle break-even (vyšší = bezpečnější), tedy podle toho, co
   rozpočet skutečně preferuje:

   | pořadí | konfigurace | break-even | strop $1,50 zafunguje po |
   |---|---|---:|---|
   | 1. | Haiku, **jen finálové uzly** | 792 runů | 190 / 475 runů |
   | 2. | **Haiku, všechny uzly** | 320 runů | 77 / 192 runů |
   | 3. | Sonnet 5, jen finálové uzly | 264 runů | 63 / 159 runů |
   | 4. | Sonnet 5 + prompt cache, všechny uzly | 162 runů | 39 / 97 runů |
   | 5. | Sonnet 5, všechny uzly | 107 runů | 26 / 64 runů |

   - **Projde-li Haiku slepý test → varianta (a), Haiku na všech uzlech.**
     Je to jediná konfigurace, která dá LLM na *každý* uzel a přitom drží
     break-even nad 300 runy. Sonnet na finálových uzlech je proti ní
     **horší v obou metrikách** (264 vs. 320 runů break-even, strop zafunguje
     o 18 % dřív) — nekupuje si víc rozpočtové rezervy, kupuje si kvalitu.
   - **Neprojde-li Haiku a projde Sonnet 5 → varianta (c′), Sonnet jen na
     finálových uzlech.** Je to nejlevnější způsob, jak dostat Sonnet do hry:
     $0,0236/run proti $0,0584 za Sonnet všude, tedy 2,5× levněji. Cenou je,
     že strop zafunguje po 63–159 runech — u zaujatého hráče viditelně.
     Pak buď strop zvednout na ~$3 (48 % čistého příjmu), nebo přijmout,
     že heavy hráč po ~100 runech přejde na cache a fallbacky.
   - **Neprojde-li ani Sonnet 5** — problém není rozpočtový a tento dokument
     na něj neodpovídá.

4. **Předgenerovat 200 000 protokolů dávkovým API před launchem ($250–750).**
   Kupuje teplou cache od dne 1, nulovou latenci, kontrolovatelnou kvalitu
   a řeší i opakování fallbacků z §9.1. Nejlepší poměr přínos/cena v dokumentu.

5. **Fair-use strop implementovat jako útratu, ne jako počet runů** ($1,50 na
   licenci) — sám se uvolňuje, jak cache dozrává, a nepotřebuje přeladit při
   změně modelu nebo ceníku.

### Čísla, která by doporučení otočila

| kdyby se ukázalo | otočí na | co změřit a kde |
|---|---|---|
| **hráči v slepém testu nerozliší fallback od LLM** | **(d)** — a celá otázka poskytovatele padá | regresní baterie `protocol-humor-tester`, ~$1,50 |
| **Haiku 4.5 zvládne český humor stejně jako Sonnet 5** | **(a)** — 3× levnější, strop nikdy nezafunguje | tentýž slepý test |
| **exaktní hit-rate po 100 runech < 10 %** | přepsat klíč dle §6 **před** launchem | ADR-007 už to loguje — stačí vyexportovat z prvních sezení |
| **ocas distribuce je tlustší než 5 % nad 80 runů** `[P-12]` | zpřísnit strop, přehodnotit (b) | první lidská sezení + Steam playtime po launchi |
| **podíl zmařených volání > 10 %** `[P-8]` | prodloužit timeout nebo zvolit rychlejší model | JSONL logy adaptéru (ADR-004) od prvního běhu |
| **medián runu > 12 volání** (delší trať v pozdějším designu) | přepočítat vše — break-even klesne o 30 % | `sim`, kdykoli se změní `uzluNaRun` |
| **kurz nebo DPH se pohne o 10 %** `[P-10, P-11]` | jen přepočet, verdikt nemění | xlsx, list `Předpoklady` |

---

## 12. Návrhy změn sdílených dokumentů (ke schválení, neprovedeno)

1. **`technika/architektura.md` §2.3** — opravit odhad tokenů:
   „~600–800 tokenů vstup + ~150–200 výstup ≈ $0,002/uzel, tj. ~$0,015/run"
   → „**~1 470 tokenů vstup (z toho 972 stabilní prefix) + ~207 výstup ≈
   $0,0025/uzel; run je 7,6–8,7 volání, tedy ~$0,019–0,022 bez cache**
   (změřeno 2026-07-28, `technika/llm-rozpocet-2026-07-28.md`)".
   Doplnit, že `pocet_uzlu` ≠ počet volání (nález C).
2. **`technika/architektura.md` §2.3 / ADR-007** — doplnit, že stabilní prefix
   je 972 tokenů a na Sonnetu 5 mu k prompt cachingu chybí 52 tokenů (nález D);
   na Haiku 4.5 se prompt caching nepoužije.
3. **`prompty/protokol.md` §Formát vstupu** — tři zásahy z §6 (kanonizace
   podezřelých A–D podle pořadí slotů, odstranění `konto` a `náklad n`,
   bucketování Žáru). **Toto je změna promptu → patří `protocol-humor-testerovi`,
   ne mně** — předávám jako zadání s ekonomickým odůvodněním.
4. **`design-dokument.md` §8** — doplnit, že „globální cache à la Infinite
   Craft" je podmíněná bucketovaným klíčem (nález E); bez něj hit-rate <5 %.
5. **`design-dokument.md` §9** — doplnit fair-use strop jako **útratu na
   licenci ($1,50)**, ne počet runů.

---

## 13. Zdroje

- Ceník Anthropic 1P API: skill `claude-api`, ověřeno 2026-07-28.
- Minimální cachovatelný prefix, násobky cache read/write, batch −50 %: tamtéž.
- Konkurenční ceník (třída Flash-Lite), ověřeno WebSearch 2026-07-28:
  [pricepertoken.com — Gemini 2.5 Flash Lite](https://pricepertoken.com/pricing-page/model/google-gemini-2.5-flash-lite) ·
  [pricepertoken.com — srovnání s GPT-5 mini](https://pricepertoken.com/compare/google-gemini-2.5-flash-lite-vs-openai-gpt-5-mini) ·
  [BenchLM.ai — Gemini API pricing, červenec 2026](https://benchlm.ai/google/api-pricing)
- Počty volání na run: vlastní měření simulátorem `prototyp/sim/run.js`,
  2 000 runů/počet hráčů, strategie `kompetentni`, seedy 1–1000 × 2 pronásledovatelé.
- Délky textů: přímé měření `prompty/protokol.md` v0.3 a
  `prompty/fallback-sablony.yaml` (28 šablon, D40).
- Struktura runu a vložených setkání: `prototyp/src/engine/state.js`,
  `prototyp/src/engine/rules.js`.
- Model s živými vzorci: `projekt/ekonomika/llm-rozpocet-2026-07-28.xlsx`
  (12 listů, 424 vzorců, 0 chyb; jediné místo k editaci je list `Predpoklady`).

**Poznámka k přesnosti.** Čísla v tomto textu jsou zaokrouhlená pro čitelnost,
xlsx počítá z nezaokrouhlených hodnot. Rozdíly jsou v posledním platném místě
(break-even Haiku 320 zde vs. 320,5 v modelu — text počítá ze zaokrouhlených
7,79 efektivního volání, model z 7,7868). **Autoritativní je xlsx.**

**Poznámka k prostředí (pro příští session).** Na tomto stroji **není Python,
openpyxl ani LibreOffice** — `scripts/recalc.py` ze skillu `xlsx` tedy nelze
spustit. Model byl postaven a ověřen přes **Excel COM automation z PowerShellu**
(`CalculateFullRebuild()` + sken `SpecialCells(xlCellTypeFormulas, xlErrors)`),
což je funkční ekvivalent. Excel COM je vázaný na cs-CZ: `NumberFormat` bere
jen české kódy (`0,00`), vzorce naopak US syntax.
