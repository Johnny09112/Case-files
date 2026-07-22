# Simulační brána — 1. běh (2026-07-22)

*Vyhodnocení 1. stupně Go/No-Go (playtest-facilitator). 216 000 runů
(3 počty hráčů × 9 strategií × 2 pronásledovatelé × 2 větve hlasu z auta,
à 2000), seedovaný RNG, věrná pravidla z `prototyp-mvp.md` + `obsah/*.yaml`.
Simulátor a surová data žily ve scratchpadu session; engine kódového repa
je reimplementuje (architektura §2 — simulátor je druhý klient enginu).
Hranice poctivosti: měřeno je jen tempo/matematika/balanc, ne zábavnost.*

## Celkový verdikt: NEPROŠLA (kritérium 1), náprava jasná

| # | Kritérium | Verdikt | Jádro |
|---|---|---|---|
| 1 | Nesejde se triviálně ani bez tření | **NEPROŠLA** | kompetentní hra 90–98 % DORUČENO vs. zdravé rozpětí 40–70 % |
| 2 | Snowball citelný od ~3. uzlu | prošla s výhradami | funguje u 4 hráčů / realistické hry; u 1–2 kompetentních plochý |
| 3 | Tempo Žáru | prošla s výhradami | první práh sedí (medián uzel 3); Zátah měkký (~0,22×/run); konfrontace se recykluje 1,5–2,6×/run |
| 4 | Ekonomika beden dělá napětí | prošla s výhradami | napětí jen u 4 hráčů; Útěk rider je dominantní odtok, dobrovolný Úplatek se skoro nehraje |
| 5 | Žádná dominantní strategie | prošla s výhradami | žádný exploit; ale optimum (afinita + drž bedny) je triviální a ~97 % úspěšné |
| 6 | Bodovatelnost cílů | prošla s výhradami | `obetni-beranek` ~1 % = mrtvý cíl; ostatní 17–58 % OK |

## Klíčová čísla

- DORUČENO dle strategie: bedny-šetřící 97,5 %, opatrná 96,8 %, greedy 96,7 %,
  **cíle-driven (realistická) 90,2 %** (u 4 hráčů 84 %), tag-Úplatek 83 %,
  tag-Lest 79 %, tag-Násilí 64 %, tag-Útěk 58 %, náhodná 36 %.
- Kořen krit. 1: (a) není uzlová brána — tým vždy postoupí; (b) hráč má +2 tag
  v ruce ~80 % času → kompetentní selhání skoro nemožné; (c) 6 uzlů atrici nenačerpá.
- **Citlivost sémantiky 5–7 (největší páka):** „jen poznámka" → 88–91 % DORUČENO;
  „reálné zranění" → **72,5 %** (zdravé pásmo).
- Snowball: delta zranění per uzel u 4p cíle-driven 0,50 / 0,67 / **1,27** / 1,80 /
  1,89 / 1,69 — zrychluje přesně od 3. uzlu.
- Žár: první práh medián uzel 3 ✓; Brody práh 7 už kolem uzlu 2–3; přežití
  konfrontace → Žár 6 je těsně pod prahy → kolotoč.
- Bedny: kanály ztrát u 4p — tvrdost 67,8 tis. / Útěk rider 102,7 tis. /
  dobrovolný Úplatek 48,3 tis.; 27 % 4p runů končí 0 beden; mono-Útěk 4p 94 % 0 beden.
- Pronásledovatelé fungují: tag-Násilí proti Brodymu padá na 47 % DORUČENO.
- Hlas z auta: obě větve živé (buff 88 % vs. prokletá 80 % DORUČENO u 4p).
- Škálování počtem hráčů je invertované: víc hráčů = těžší (sdílené bedny);
  1 hráč snadný, ale swingový (15 % náhlý wipe).

## Doporučené páky (seřazeno dle síly; rozhoduje uživatel/game-designer)

1. **Sémantika 5–7 pin-down:** dnes „zranění NEBO poznámka" bez určení, kdo volí.
   Doporučení: 5–7 = reálné zranění (změřeno → 72,5 %), případně volba vlastníka
   „zranění vs. −1 bedna" (nezměřeno). Jediná páka, co sama posune krit. 1.
2. **Zúžit dostupnost +2 tagu:** menší ruka (3 místo 5), část uzlů bez +2,
   nebo posun prahů (9+ / 5–8).
3. **Rozbít konfrontační kolotoč:** přežití → Žár 3–4, nebo léčka/konfrontace
   max 1×/run, nebo konfrontace ukončuje run.
4. **Přitvrdit Zátah:** dnes beztrestně obejitelný druhou cestou.
5. **Útěk rider míň krvavý na bedny** (dominantní odtok, dělá z Útěku past).
6. **`obetni-beranek`:** max síla ≤2, nebo výjimka pro vynucené/zoufalé karty.
7. **Škálování dle počtu hráčů zvážit** (pozor na kognitivní zátěž — design §8).

## Mezery MVP odhalené modelováním (nejsou simulační detail, ale designové díry)

- **Velikost ruky není v MVP definována** (model předpokládal 5; páka č. 2).
- **Sémantika 5–7 nedourčená** (kdo volí zranění vs. poznámku) — páka č. 1.
- **Tvrdosti léčky a konfrontace nedefinovány** (mini-uzly pronásledovatelů mají
  jen úvod + afinity).

## Návrh měřitelných kritérií brány (čeká schválení — mění sdílené pravidlo)

Brána = PROŠLA, když: DORUČENO při realistické i kompetentní hře **45–70 %**
(referenční 4p run); snowball delta roste od uzlu 3; první práh Žáru uzel 3–4;
žádná rozumná strategie >85 %; žádný mechanický cíl <5 % ani >95 %.

## Další krok

Jedna iterace páky č. 1 (+ případně č. 2), přesimulovat, pak stavět prototyp.
Lidská brána (hádka, smích, dobrovolný další run) zůstává nedotčena — simulace
ji neprokáže.

---

*Souvisí: [prototyp-mvp.md](../prototyp-mvp.md), [architektura.md](architektura.md),
[stav.md](../projekt/stav.md).*
