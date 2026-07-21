# První hratelný prototyp — definice MVP
**Cíl: ověřit, že core loop baví 4 lidi u stolu.** Nic víc. Vše ostatní (online,
UGC, Steam, grafika) je záměrně mimo rozsah.

**Hypotéza k ověření:** „Hráči se hádají o karty, smějí se protokolu a chtějí
dobrovolně další run." Pokud tohle neplatí, žádná další vrstva to nezachrání.

---

## Fáze 0 — Papírový playtest (1 večer, před jakýmkoli kódem)

- Karty ručně na papíře / kartičkách, mapa na papíře, kostka d6.
- Jeden člověk dělá poldu: hází mechaniku podle pravidel níže a výsledek nechá
  zdramatizovat LLM v druhém okně (Claude/GPT) — prompt: „Suchý policejní protokol,
  3–5 vět, česky, výsledek: …".
- 3–4 hráči, 2 kompletní runy.
- **Go/No-Go:** pokud stůl nebaví ani s živým člověkem jako poldou, zpět k designu.
  Zároveň první test kvality českého AI humoru — největší produktové riziko.

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
- **Uzel:** afinity k tagům (−2 / 0 / +2), viditelné hráčům předem.
- **Hod postavy:** d6 + síla karty + afinita − počet zranění postavy (max −3).
  - **8+** … úspěch
  - **5–7** … úspěch za cenu (zranění nebo poznámka do spisu)
  - **≤4** … selhání + zranění + ztráta nákladu
- **Náklad:** tým veze 6 beden. Každé selhání = −1 bedna. 0 beden = run končí
  (razítko NEVYŘEŠENO).
- **Kolaps postavy:** 4. zranění = postava vyřazena (dál jen „leží v autě" a
  generuje poznámky v protokolu). Všichni vyřazeni = konec runu.
- **Zranění** = zápis do spisu (krmí AI prompt) + od 2. zranění líže hráč
  prokleté karty do ruky.

### Obsah (minimální sada)

| Co | Počet | Poznámka |
|---|---|---|
| Postavy | 4 | jen jméno + portrét-placeholder + 1 věta flavoru |
| Šablony uzlů | 7 typů × 2 varianty = 14 | run = 6 uzlů, vždy volba ze 2 |
| Základní karty | 32 (8 na tag) | síly 1–3, česky |
| Prokleté karty | 8 | Křeč, Ztráta důstojnosti… |
| Zoufalé karty | 4 | hratelné jen s 3+ zraněními |
| Tajné cíle | 8 | vázané na obsah protokolu, bodované na konci |
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
citelný od ~3. uzlu), délka a tón protokolů, poměr cache-hitů (logovat od začátku).

---

*Souvisí: [design-dokument.md](design-dokument.md).*
