---
name: v3-audit
description: Které nálezy jsem vznesl v auditu navrh-v3.md (2026-07-23) — ať se příště neopakuji; sleduj, jak designér rozhodl
metadata:
  type: project
---

Audit `projekt/navrh-v3.md` (slotová resoluce) proveden 2026-07-23 pro PM. Verdikt: **vrátit k dopracování**, ne blokovat pivot.

Vznesené blokující nálezy (sleduj rozhodnutí v `projekt/rozhodnuti.md`):
- **B1** — MVP řez §15 neobsahuje vysvětlující vrstvu pravidel; playtest 2026-07-22 (jediná lidská data) padl přesně na neviditelnosti systému.
- **B2** — ruce 6/4/3/3: 4p má horší commit-info než solo (1 ze 3 naslepo vs 4 ze 6 + volné přiřazení) → hra může být tím těžší, čím víc hráčů (invertuje co-op); „hádka" tenká na obou koncích (1p žádná, 4p jen permutace 4 karet/4 slotů).
- **B3** — „složená = free cleanse": 3. postih smaže VŠE → dominuje placenému léčení (H=6), podkopává kreditovou smyčku.
- **B4** — GANGSTER štítek gotcha, pokud viditelnost role slotu není mechanicky označena před přiřazením.

Odpovědi na 2 otázky designera: (3a) tajné cíle **ODLOŽIT z MVP** (pevné doporučení). (3b) Žár bez čísla **funguje jako pozice na značené trati**, ALE jen když je delta čitelná — jinak reprodukuje playtest nález „proč rostl Žár 2×".

Klíčová aritmetická díra: „skvělý run ≈ 12 kreditů" je nedosažitelný (max ~10: truhla ≤5 + 5× loot bonus).

D15 provedeno věrně až na jednu odchylku: „výjimky u speciálních slotů" přesunuty ze SLOTU na KARTU (štítky) — slot-side výjimky (multi-stat práh) fakticky vypadly.

**Ověřovací kolo 2026-07-23 (revidovaný navrh-v3 po D16).** Všech 8 B/D nálezů UZAVŘENO nebo ČÁSTEČNĚ:
- UZAVŘENO: B1 (§5.4 first-class), B3 (složení maže jen lehké, edge 2L+1T drží, žádná kreditová arbitráž), B4 (ikony 👁/🕳 + telegraf), D1, D3, D4, D7, motel-dostupnost (§7 větvová odbočka).
- ČÁSTEČNĚ: D16-aritmetika/medián — příklad „1× léčení + rezerva na směnu" neplatí na spodku mediánu (7−6=1 < směna 3); ≥2 rozhodnutí drží jen přes 2× směnu. Drobná oprava §7.
- NOVÝ prvek **poolový commit** (§4.3, nebyl v 1. auditu): 3 DŮLEŽITÉ nálezy — (1) pool 8→4 u 4p hrozí trivializací (horní horn B2), strukturální podlaha poolu = 8, úzké sladké místo; (2) pasažér u 4p (hráč může mít 0 zahraných karet, „rotace spotlightu" = naděje ne mechanika); (3) commit beznákladový (nepoužité se vrací) → „sázka naslepo" mechanicky prázdná, pitch přeprodává — sim to NEchytne. Anti-QB u poolu 8 se opírá o tajné cíle, ne o owner-consent.
- Verdikt pro PM: **připraveno po dořešení** — NEfreezovat pool čísla do kanonu před sim bránou; rozhodnout „je commit sázka?"; opravit medián-příklad §7. Riziko trivializace/pasažér = sim priorita 0.
