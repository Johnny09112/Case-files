---
name: reference-ekonomicky-model
description: Kde žije nákladový model LLM a co je v něm autoritativní — čísla nikdy neodhaduj znovu, čti odsud
metadata:
  type: reference
---

Nákladový model provozu LLM žije ve dvou souborech v gitu (ne v této paměti —
projektová fakta patří do repa, viz `CLAUDE.md` §Paměť):

- `technika/llm-rozpocet-2026-07-28.md` — rozpočtový podklad pro volbu
  poskytovatele: předpoklady P-1..P-15, náklad na volání/run/hráče, cache
  křivka, break-even, scénáře (a)–(d), fair-use strop, doporučení.
- `projekt/ekonomika/llm-rozpocet-2026-07-28.xlsx` — **autoritativní čísla**
  (živé vzorce, 12 listů). Jediné místo k editaci je list `Predpoklady`;
  všechno ostatní na něj odkazuje. Text v .md je zaokrouhlený pro čitelnost.

**Než začneš cokoli počítat znovu:** otevři xlsx a změň páku na listu
`Predpoklady` (hit-rate, znaků/token, volání na run, ceník, cena licence).
Přepočítat model je vždy levnější než postavit nový.

Tři věci, které se v projektu opakovaně počítaly špatně a stojí za ověření
u každé nové úvahy:

1. **`pocet_uzlu` z `run_end` NENÍ počet LLM volání** — je o ~2 nižší.
   Vložená setkání (léčka/konfrontace) mají `band_resolved`, ale
   `completedNodes` neposouvají; truhla a motel jsou naopak uzly bez situace.
   Volání se počítají jako události `band_resolved`.
2. **Ceník je poskytovatel-specifický**, stejně jako minimální cachovatelný
   prefix a násobky cache. Volání na run, délky promptu a struktura break-even
   jsou agnostické. Rozdělení je v §10 reportu.
3. **Riziko není v průměru, je v ocasu distribuce runů na hráče** — populační
   průměr je udržitelný i na drahém modelu; ztrátový je extrémní hráč.
   Předpoklad P-12 (rozdělení runů) je nejkřehčí vstup celého modelu a nemá
   žádná data — první lidská sezení a Steam playtime ho mají nahradit.

Viz [[kalibrace-mereni-ne-odhad]].
