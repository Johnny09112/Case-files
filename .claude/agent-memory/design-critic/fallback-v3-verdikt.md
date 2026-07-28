---
name: fallback-v3-verdikt
description: Verdikt k v3 fallback šablonám protokolu (2026-07-27) — zapéct s výhradami, 7 oprav, arbitráže (a)-(e), 2 otevřená rozhodnutí designéra
metadata:
  type: project
---

Kolo content-generator → protocol-humor-tester → kritik, fáze 2.1 (2026-07-27).
Verdikt: **zapéct s výhradami, 7 oprav**, strop 28 šablon (§8 chtěl ~20;
testérovo „doporučeno 32" jsem zamítl — problém není nedostatek variant).

**Why:** bez API klíče jsou fallbacky jediný text hry (ADR-004) a fáze 2.1
existuje kvůli metrice 6 (čitelnost) lidské brány.

**Nálezy, které vznesly jen já (obě předchozí role je minuly):**
- **N1 KRIT** — `slozeniKolMin: 1` + tick na konci téže situace → 50 % složení
  vrátí postavu ve **stejném uzlu**; kolaps/navrat šablony tvrdí uplynulý čas,
  který nenastal. Otevřeno pro designéra: engine, nebo text.
- **N2 KRIT** — šablony viní „kus", ale `duvod: 'neobsazeno'` znamená prázdný
  slot; `ui/vysvetleni.js` u téhož slotu píše „Slot nikdo neobsadil" → dva
  prvky jedné obrazovky dávají neslučitelné příčiny.
- **N3 VÁŽNÉ** — sólo run: 17 šablon mluví o „podezřelých" v množném čísle;
  sólo + složení → prázdný commitPlan → auto-PRŮŠVIH a `prusvih-5` (jediný
  kandidát) tvrdí pokus, který se nekonal. Otevřeno pro designéra.
- **N6 VÁŽNÉ** — redundance NENÍ uvnitř sady, ale vůči obrazovce: `situace.yaml`
  `text:` už mapuje věc→roli, `vysvetleni.js` dává čísla; protokol je třetí
  převyprávění. 12/17 s `{veci}`, 11/17 otvírá počítáním do čtyř.

**Arbitráže:** (a) jméno v 2/4 ZŮSTÁVÁ (autor) · (b) doplnit `nazev` TEĎ —
loader neznámé klíče neodmítá, autorův důvod pro odklad neplatil · (c)
`{veci_zasah/selhani}` ZAMÍTNUTO jako scope creep (duplikuje vysvetleni.js) ·
(d) ženský rod = neproblém, 4 muži + fixní sada · (e) razítko DORUČENO = kánon
design-dokumentu, fallback kolo ho neotvírá.

**How to apply:** až se sada zapeče, ověř, že N1 a N3 rozhodnutí padla a jsou
zapsaná — jsou to sliby „vyřešíme později", které jinak zapadnou. Metodicky:
u obsahu vždy prověřuj **časování událostí a počet hráčů**, ne jen jejich
sémantiku — tam měly obě předchozí role slepé místo. Viz [[kalibrace-4-audit]].
