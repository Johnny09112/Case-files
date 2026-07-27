# Fáze 2.1 — hot-seat UI na slotech + vysvětlující vrstva (návrh, 2026-07-27)

*Vznikl brainstormingem s uživatelem 2026-07-27 po uzavření prověrky bota
(D34/D35). **SCHVÁLENO po PM review 2026-07-27 (D36)** — dva nálezy review
zapracovány (§5 události bez anotace, §8 pásma kolaps/hlas-z-auta), otázky §10
rozhodnuty. **Nic z toho není implementované** — tenhle dokument je zadání,
ne popis stavu.*

*Umístění: `technika/` dle konvence projektu (stav.md odkazuje sem), ne
`docs/superpowers/specs/` — nezakládám druhý strom dokumentace.*

## 1. Proč to děláme

Nález prvního lidského sezení ([[../playtesty/2026-07-22|playtest 2026-07-22]]):
run vygeneroval učebnicovou smrtelnou spirálu — vynucená hlučná karta → skok
Žáru → zákaz tagu → kolaps → léčka → konec — a **hráč ji neviděl**. Doslovně:
*„soubojový systém je buď primitivní, nebo netuším"*, přičemž systém fungoval
přesně dle pravidel. UI čísla ukazovalo, ale neučilo souvislosti.

Bez téhle vrstvy lidská brána selže na **metrice 6 (čitelnost)**, ne na designu —
a to je nejdražší možný způsob, jak selhat, protože z něj neplyne žádné poučení
o hře samotné.

Zároveň je hot-seat UI po pivotu v3 **odpojené** (`src/main.js`): v2 obrazovka
uzlu stojí na kostkové resoluci. Bez přestavby není co hrát.

## 2. Rozhodnutí, která už padla

Nepředělávat, jsou schválená:

| Rozhodnutí | Zdroj |
|---|---|
| Není to tutoriál, ale **průběžné diegetické „proč" vetkané do spisu a okraje mapy**; hráč se pravidla učí tím, že vidí jejich dopad | design-dokument §4.11 |
| Vysvětlující vrstva je **POVINNÁ položka MVP**, ne nice-to-have | prototyp-mvp.md §Obsah |
| Anotace nese *skrytý práh vs. realita, vynucení a štítky, pohyb šerifa, postihové řetězce, plnění tajných cílů* | prototyp-mvp.md, design §4.11 |
| **Jeden průchod**: slotová smyčka a anotace se staví společně | uživatel 2026-07-27 |
| **Čísla i próza, próza jako hlavní** — razítko + věta důvodu, čísla stat vs. práh vedle | uživatel 2026-07-27 |
| **v3 fallback šablony vznikají paralelně** jako součást 2.1 | uživatel 2026-07-27 |

## 3. Rozsah

**Uvnitř:**
1. Přestavba obrazovky uzlu na slotovou smyčku v3 (mapa → motel → commit →
   odhalení → gamble → přiřazení → výsledek).
2. Vysvětlující vrstva jako čistá funkce nad událostním logem.
3. Přepis `protocol-fill.js` na v3 + **obsahové kolo: ~20 v3 fallback šablon**
   (vlastní designový tým, viz §8).
4. Úklid mrtvého v2 kódu, který se nahradí.

**Záměrně mimo** (nezvětšovat, jsou to jiné fáze):
- LLM adaptér a živé protokoly — fáze 3, blokuje nerozhodnutý poskytovatel.
- Profily hráčů, meta-progrese, zvuk, pixel-art, angličtina — mimo MVP.
- Přeladění `prahOffsetDlePoctu` (K1 3p/4p, K6a z D35) — kalibrace poběží
  souběžně, UI na ní nestojí.

## 4. Architektura

### 4.1 Vysvětlující vrstva = fold přes log

Klíčové zjištění: **vrstva není nová data.** Engine už dnes loguje kompletní
„proč" — `slot_resolved` nese `prah`, `stat_hodnota`, `duvod`, `stitek_efekt`,
`pronasledovatel_efekt` a nově `postih_efekt` (D35); `zar_move` nese povinný
`duvod` a `prah_prekrocen`; `band_resolved` nese `max_achievable_zasahy` a `gap`;
`situation_revealed` nese `kotva` + `sum` + `prah`. Vrstva je **překlad logu do
češtiny**, ne mechanika.

```
src/ui/vysvetleni.js        ČISTÁ funkce, bez DOM
  vysvetli(events) → Map<seq, Anotace[]>
  Anotace = { misto: 'slot'|'okraj'|'spis', veta: string, detail?: string,
              odkaz?: {seq: number, popis: string} }

  Pole se jmenuje `misto`, ne `kotva` — „kotva" je v tomhle projektu herní
  pojem (stálá část prahu slotu) a druhý význam by se pletl v každém review.
```

- **Fold, ne per-událost mapper.** Průchod celým logem drží malou účetní knihu
  (postih → uzel původu, práh → kdo ho překročil, cíl → tahy, které ho plnily).
  Bez ní nejde udělat to, co playtest chyběl nejvíc: **řetězec přes uzly.**
  `odkaz` je zpětný ukazatel („Rozdrcená noha z uzlu 3 — Statkářova stodola").
- Volá se nad **prefixem** logu při hře i nad **celým** logem po runu, stejná
  funkce. Žádná duplicitní definice pro live a pro rozbor.
- Engine zůstává jazykově neutrální (ADR-002). Do `slot_resolved` se české věty
  nepřidávají — znečistily by golden snapshoty a JSONL, ze kterých měří simulace.

*Zamítnuté varianty:* anotace přímo v render kódu (netestovatelné bez DOM, tři
místa k opravě při změně pravidla) · anotace generované enginem (viz výše).

### 4.2 Obrazovka uzlu rozpadlá po fázích

v2 `screens/run.js` má 572 řádků a dělá všechno; v3 má fází víc. Proto:

```
src/ui/screens/run/
  index.js      přepínač fáze + společný rám (plocha | okraj)
  okraj.js      pronásledovatel, trať Žáru s prahy, náklad, podezřelí, trasa
  mapa.js       nabídka cest (typ místa je veřejný — viz D34/N7)
  motel.js      léčení / směna / dál
  commit.js     telegraf + ruce + kvóty, commit naslepo
  assign.js     odhalené sloty, gamble, rozdělení karet
  vysledek.js   razítka slotů, pásmo, důsledky, anotace
```

`okraj.js` a `style.css` (`plocha`/`okraj`, `zar-draha`, `zar-prah-popisek`,
razítka) se přebírají z v2 — layout „spis + okraj mapy" už §4.11 naplňuje a
nevymýšlí se znovu.

### 4.3 Co z v2 přežívá a co se maže

| Soubor | Osud |
|---|---|
| `ui/style.css`, `ui/typewriter.js`, `ui/dom.js`, `ui/labels.js` | **zůstává** (sépiový vzhled, psací stroj, helpery) |
| `ui/app.js` | **přepis příkazů** na v3 slovesa (`commitCards`, `gamble`, `assignToSlots`, `confirmNode`, `motelChoice`, `spendCredits`, `leaveMotel`) + v3 obsah místo `archiv-v2/`; skořápka (řízení obrazovek, sync logu, export JSONL) zůstává |
| `ui/screens/setup.js`, `ui/screens/end.js` | **zůstává**, drobné úpravy (v3 cíle, reveal `plnily_tahy`) |
| `ui/screens/run.js` (572 ř.) | **maže se**, nahrazuje `screens/run/` |
| `ui/protocol-fill.js` (v2: `zraneni`, `hod`, `tvrdost`) | **přepis na v3** (pásma 4/4–≤1/4, postihy) |
| `prompty/fallback-sablony.yaml` (22 v2 šablon) | **nový v3 obsah**, v2 do archivu |

Mrtvý v2 kód se nenechává ležet — testy k němu (`protocol-fill.test.js`, 32
případů) se přepisují spolu s modulem.

## 5. Katalog anotací

Minimální sada, kterou musí `vysvetli()` pokrýt. Věty jsou ilustrativní, finální
znění patří do kódu vrstvy (úřední tón dle `prompty/protokol.md`).

| Událost | Místo | Anotace |
|---|---|---|
| `telegraf_derived` | spis | „Telegraf slibuje tři viditelné role (hodnota, obrana, nástroj) a jednu skrytou. Zbraň na očích neprojde." + kdo ho nevidí (`nevidi`) |
| `situation_revealed` | slot | **jádro učení:** „Práh 4 = kotva 3 + šum +1." Kotva je stálá a naučitelná, šum ±2 per instance |
| `slot_resolved` `proslo` | slot | razítko PROŠLO + „nástroj 4 proti prahu 3" |
| `slot_resolved` `nizky_stat` | slot | NEPROŠLO + „chtělo to nástroj 4, švára má 3" |
| `slot_resolved` `kombi_neuplny` | slot | „kombi slot chce OBA staty nad práh; nástroj 4 stačí, improvizace 2 ne" |
| `slot_resolved` `stat_zrusen` | slot | „Malone je neúplatný — hodnota se počítá jako 0 v celém runu" |
| `slot_resolved` `gangster_auto_fail` | slot | „zbraň ve viditelné roli u NPC padne bez ohledu na staty" |
| `slot_resolved` `postih_lock_stitek` | slot | „Ochrnutá ruka (uzel 3) — zbraň neudržíš" + `odkaz` |
| `slot_resolved` `postih_lock_viditelnost` | slot | „Rozdrcená noha (uzel 3) — do skryté role nic nezahraješ" + `odkaz` |
| `slot_resolved` `neobsazeno` | slot | „nikdo slot neobsadil (postava složená) → automatický propad" |
| `band_resolved` | spis | pásmo + **learnabilita**: „Optimální rozdělení TÉHOŽ commitu by dalo 3/4 — jeden zásah zůstal na stole" (`gap`) |
| `zar_move` | okraj | „Šerif postoupil o 2 — zbraň v akci, u Brodyho se počítá dvojnásob." Při `prah_prekrocen`: „…a překročil práh Zátahu" |
| `penalty_added` | spis | „Za PRŮŠVIH: Rozdrcená noha (těžký, zámkový) — do vyléčení nic do skryté role." Zapisuje do knihy původ |
| `penalty_expired` / `penalty_healed` | spis | „Naražené rameno vypršelo" / „vyléčeno v motelu za 6 kreditů" |
| `character_folded` / `_returned` | spis | „třetí postih = složení; lehké se mažou, těžké zůstávají" |
| `gamble` | spis | „Sázka: místo Šváry přišel Klíč. Odhad před sázkou 1/4." |
| `credit_flow` | okraj | důvod pohybu kreditů |
| `map_move` | okraj | „lokace — zbraň tu projde i na očích" (veřejné pravidlo typu místa) |
| `goal_scored` | spis | reveal: které tahy cíl plnily a které kazily |
| `run_ended` | spis | příčina konce (dojezd / bedny 0 / prohraná konfrontace) |

**Invariant pokrytí:** každý typ události, který engine umí vydat, musí mít
handler. Hlídá to test (§7) — přesně tahle díra by jinak vznikla u `postih_efekt`,
který do enginu přibyl dnes (D35) a ve starším katalogu by prostě chyběl.

**Události vědomě BEZ anotace** (z PM review 2026-07-27 — enum má 18 typů,
katalog výše 14; zbylé čtyři musí mít v `vysvetli()` explicitní prázdný handler,
ne propad do „neznámá"):

| Událost | Proč bez anotace |
|---|---|
| `run_started` | setup obrazovka, není co vysvětlovat |
| `commit` | akt hráče; učení nese `telegraf_derived` před ním |
| `assignment` | akt hráče; dopad vysvětluje `slot_resolved` |
| `assign_context` | čistě měřicí událost (ADR-010); fold ji čte jako vstup do účetní knihy (odhad pro `gamble`), sama anotaci nenese |

## 6. Tok dat

```
engine (headless, deterministický)
  └─ getEvents() ──► vysvetli(events) ──► Map<seq, Anotace[]>
                                            │
  └─ getState() ──► screens/run/* ◄─────────┘   (render, žádná logika navíc)
                         │
                         └─ protocol-fill v3 ──► spis (psací stroj)
```

UI nedrží herní stav — jen prezentaci (jaká obrazovka, co už bylo vyklepáno,
který cíl je odkrytý). Beze změny proti v2 skořápce.

## 7. Testy

Bez `jsdom`/`happy-dom` — nová devDependency se nezavádí, protože logika je
v čistých modulech a renderer zůstává tenký:

1. **Jednotkové nad `vysvetleni.js`** — syntetické logy, jedna anotace na případ
   z katalogu §5 (včetně obou `postih_lock_*` a `stat_zrusen`).
2. **Pokrytí enumu** — test projde `EVENT` a tvrdí, že žádná událost nespadne do
   „neznámá". Tripwire proti tichému rozjetí enginu a vrstvy.
3. **Golden anotace** — snapshot anotací nad reálným runem pevného seedu.
   Zachytí drift mezi pravidlem a jeho vysvětlením stejně, jako golden runy
   chytají drift enginu.
4. **Řetězec přes uzly** — test, že `odkaz` u zámkového auto-failu ukazuje na
   uzel, kde postih vznikl. To je ta věc, kterou playtest postrádal.
5. **`protocol-fill` v3** — přepis stávajících 32 případů na v3 pásma.

Renderer se netestuje automaticky; ověřuje se ručně v prohlížeči (`npm run dev`)
jako u fáze 2.

## 8. Obsahová závislost — zadání pro designový tým

Kód ji needituje (CLAUDE.md: obsah edituje výhradně designový tým). Souběžné
kolo `content-generator` → `protocol-humor-tester` → `design-critic`:

- **~20 v3 fallback šablon** do `prompty/fallback-sablony.yaml`; v2 sada do
  `obsah/archiv-v2/` (neškrtat, archivovat).
- Pásma nově: `4/4_HLADCE_LOOT`, `3/4_HLADCE`, `2/4_S_NASLEDKY`, `≤1/4_PRUSVIH`
  + `zatah`, `lecka`, `konfrontace`, `finale_doruceno`, `finale_nevyreseno`.
  Vysokofrekvenční pásma (3/4 a 2/4, dohromady ~72 % uzlů dle D35) ≥4 varianty.
- Placeholdery: `{jmeno}` (příjmení, kontrakt z `prototyp/CLAUDE.md`), `{uzel}`,
  `{veci}` (čtyři věci ve slotech — **ne jedna karta jako ve v2**), `{postih}`,
  `{bedny}`, `{naklad}`. `podminka`: `postih: ano|ne`, `bedna: ano|ne`.
- **Z PM review 2026-07-27:** v2 sada měla navíc pásma `kolaps` a `hlas-z-auta`,
  která výčet výše nezmiňoval. `kolaps` (= `character_folded`) ve v3 existuje
  → šablona **musí být** i ve v3 sadě. `hlas-z-auta` závisí na proveditelnosti
  v hot-seat UI (poznámka stav.md pro engine, bod c) — obsahové kolo rozhodne
  a rozhodnutí zapíše, ticho není přípustná odpověď.
- Tvrdý zákaz beze změny: šablona nesmí tvrdit nic, co mechanika nedala.

## 9. Rizika a odpovědi na ně

| Riziko | Odpověď |
|---|---|
| **Zahlcení textem** — anotace u každé události je hodně čtení na 30minutový run se 4 hráči | Jedna věta na kotvu, čísla ve stálém sloupci, `detail` jen na rozkliknutí. Tempo měří první sezení; když bude vrstva ukecaná, škrtá se, ne přidává |
| **Informační postihy v hot-seatu nejdou schovat** — `hide_telegraf` a `hide_staty` říkají „vlastník nevidí", ale u jedné obrazovky vidí celý stůl | **Rozhodnuto: varianta (b) přeškrtnutí + čestnost, viz §10** |
| Přestavba je největší kus UI práce zatím | Rozpad po fázích (§4.2) umožní stavět a ověřovat po částech |
| Vrstva se rozejde s enginem | Testy 2 a 3 z §7 |

## 10. Otevřené otázky — ROZHODNUTO (PM review + uživatel, 2026-07-27, D36)

1. **Informační postihy v hot-seatu — ROZHODNUTO: varianta (b).**
   `hide_telegraf` / `hide_staty` / `hide_viditelnost` degradují informaci
   *vlastníka*, ale hot-seat má jednu obrazovku pro všechny. Uživatel zvolil:
   informace se zobrazí **přeškrtnutá s poznámkou** „Kowalski tohle nevidí —
   nesmí podle toho radit" (čestnostní pravidlo, drží fikci; kooperativní hra
   u stolu na čestnosti stojí i jinde — tajné cíle). Zamítnuté varianty:
   (a) schovat všem — trestá nesprávné hráče; (c) překlopit na mechanický
   efekt — měnil by pravidla oproti kalibrovaným číslům brány. `commit.js`
   odblokován.
2. **Kdy zapnout anotace naplno — ROZHODNUTO: vše hned** (§4.11 říká
   „průběžné"); případné škrty se odvodí z tempa prvního sezení — ladit hustotu
   textu od stolu, bez dat, je hádání.

## 11. Kritérium hotovo

- Celý v3 run je odklikatelný v prohlížeči, 1–4 hráči, bez pádů.
- Každá událost z §5 nese anotaci; test pokrytí enumu je zelený.
- Hráč, který hru nezná, dokáže po runu bez nahlédnutí do logu odpovědět, **proč
  propadl konkrétní slot a proč postoupil šerif** — to je metrika 6 lidské brány.
- Testy zelené, lint čistý, run jde exportovat jako JSONL (surovina playtestů).

---

*Souvisí: [[proverka-bota-2026-07-27|technika/proverka-bota-2026-07-27.md]] (D34/D35 —
`postih_efekt`, který vrstva vysvětluje) · [[architektura|technika/architektura.md]] §2.4
(událostní log jako kontrakt) · [[../playtesty/2026-07-22|playtesty/2026-07-22.md]] (nález,
který tuhle fázi vyvolal).*
