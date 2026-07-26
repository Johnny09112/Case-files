# CLAUDE.md — Důkazní materiál 1930: prototyp v0.1

Kódová část monorepa (adresář `prototyp/`). **Zadání a zdroj pravdy žije
v kořeni repozitáře** (design vrstva):

- `../technika/architektura.md` — **závazná architektura (ADR)**. Změna
  architektury = nové/aktualizované ADR tam, ne tichá odchylka tady.
- `../prototyp-mvp.md` — resoluční systém (aktuální čísla pravidel).
- `../obsah/*.yaml` — herní obsah (věci, situace, cíle, pronásledovatelé).
- `../prompty/protokol.md` — kanonický prompt protokolu +
  `protokol-testy.yaml` (regresní baterie).

## Neporušitelné principy (z design vrstvy, vynucované i zde)

1. **Mechanika rozhoduje, AI vypráví.** LLM dostává hotový výsledek
   (`node_resolved`) a jen ho dramatizuje. Kód, který dává LLM rozhodovací
   pravomoc, je chyba.
2. **Engine je headless a deterministický** (ADR-002): žádný DOM, síť ani
   hodiny v `src/engine/`; veškerá náhoda z jediného seedovaného PRNG.
   `Math.random` a `Date.now` jsou v enginu zakázané (hlídá ESLint).
3. **Pravidla jako data** (ADR-003): všechna resoluční čísla jen
   v `src/engine/rules.js`; hodnoty se přebírají z `../prototyp-mvp.md`.
   Konstanta resolučního systému kdekoli jinde = chyba.
4. **Hra nikdy nečeká na síť** (ADR-004): 10 s timeout → fallback šablona.
   Bez API klíče je hra plně hratelná.
5. **Obsah se z kódu NEEDITUJE.** `../obsah/` a `../prompty/` edituje výhradně
   designový tým (content-generator po review kolečku); kód je pouze čte.
   Po zrušení submodulu je to konvence, ne strukturální zámek — hlídá ji
   review a agenti. Kopie obsahu do `prototyp/` = chyba.
6. **Žádný volný text hráčů do LLM** (prompt injection).

## Konvence

- **Kód anglicky** (identifikátory, komentáře), **dokumentace a commit zprávy
  česky**. Herní texty jsou v obsahu (česky), kód je nevlastní.
- JSDoc anotace na hranicích modulů (engine API, události, provider), volitelně
  `// @ts-check`. TypeScript ne (ADR-001).
- **Testy (Vitest) musí projít před každým commitem, který mění `prototyp/`
  nebo `../obsah/`.** Golden-run snapshoty se mění jen vědomě — commit message
  říká proč.
- Commity jdou do společné historie monorepa (konvence kořenového CLAUDE.md:
  commitni a pushni sám, logické celky, česky). Nikdy necommituj rozbitý stav,
  `.env` ani klíče.
- Windows prostředí; skripty spouštěj přes npm (`cd prototyp && npm …`,
  případně `npm --prefix prototyp …`), ne přes bash-only nástroje.
- **Kontrakt `{jmeno}` (fáze 2, UI/LLM vrstva):** do fallback šablon
  (`../prompty/fallback-sablony.yaml`) i promptů se dosazuje **příjmení**
  postavy (poslední slovo pole `jmeno` z `../obsah/postavy.yaml`) —
  AI protokoly i fallbacky pak drží stejný registr („podezřelý Bartoš").

## Struktura a pořadí stavby

Dle `../technika/architektura.md` §6 (struktura) a §5 (pořadí):
1. **Engine + simulátor** (headless, `npm run sim`) — měření proti kritériím
   v3 brány K1–K9 (viz `../prototyp-mvp.md` Fáze 0 a kalibrační reporty
   v `../technika/`).
2. **Hot-seat UI s fallback šablonami** — hratelné bez klíče; psací stroj.
   (v2 UI je dočasně odpojené — fáze 2.1 ho přestaví na sloty, viz
   `src/main.js`.)
3. **LLM adaptér** — provider-agnostic, až nakonec.

## Stav a paměť

Procesní stav projektu (backlog, rozhodnutí) žije v `../projekt/stav.md`
a `../projekt/rozhodnuti.md` — tady se nevede druhá kopie. Technická
rozhodnutí prototypu = ADR v `../technika/architektura.md`.
