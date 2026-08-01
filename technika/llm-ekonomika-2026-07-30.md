# LLM ekonomika — srovnání poskytovatelů (2026-07-30)

*Podklad pro fázi 3 (blokátor kritické cesty, `projekt/stav.md`; D53/D54 —
verdikt WoZ testu žádá kreativní interpretaci a čeština jako kritérium volby
poskytovatele, testovat baterií per kandidát). Doplňuje
`technika/llm-rozpocet-2026-07-28.md` (tam je plná break-even/scénářová
analýza pro Anthropic) o **srovnání s konkurencí**. Anthropic ověřen skillem
`claude-api`; ostatní WebSearch/WebFetch 2026-07-30, zdroje v §7. Číslo bez
předpokladu je k ničemu — každý předpoklad je označen a jde přepočítat.*

## 0. Shrnutí pro netrpělivé

| Zjištění | Číslo |
|---|---|
| Nejlevnější volání | **Groq Llama 3.1 8B**, $0,000245/volání |
| Nejdražší volání (mezi kandidáty) | **Claude Haiku 4.5**, $0,00575/volání |
| Rozptyl mezi nejlevnějším a nejdražším | **23,5×** |
| Rozpočet je udržitelný u **všech** kandidátů | i nejdražší (Haiku) drží populační průměr pod 17 % marže |
| Co skutečně rozhoduje | **kvalita české kreativní interpretace**, ne cena (D53) |

**Verdikt: cena není blokátor u žádného kandidáta.** Rozdíl 23,5× mezi
nejlevnějším a nejdražším je v absolutních číslech zanedbatelný proti marži
€5,78 (§8 předchozího reportu). Tenhle dokument tedy nerozhoduje o penězích —
zúží pole na 2–3 kandidáty, které stojí za to poslat do testu češtiny.

## 1. Předpoklad promptu — a proč je jiný než v předchozím reportu

Zadání této úlohy žádá počítat s **9 uzlů × (3k cached vstup + 1,5k necached +
~250 výstup)**. To je **~3× víc** než měřených 972 (prefix) + 494 (per-uzel) +
207 (výstup) tokenů v `technika/llm-rozpocet-2026-07-28.md`. Nepovažuju to za
chybu zadání — je to pravděpodobně **předběžná rezerva na prompt po D53/D54**
(WoZ verdikt „B-lite": 3 pojistky + per-slot vstupy ZÁCHRANA a MAX DOSAŽITELNÉ,
viz `technika/woz-test-2026-07-30.md`), který ještě nikdo neměřil. Používám
proto zadanou strukturu jako **konzervativní horní odhad**, ne jako opravu
staršího měření — a označuju to jako klíčovou neznámou v §6. **9 uzlů** je
taky horní hranice (měřený medián je 8–9, p90 11), takže čísla v tomto
dokumentu jsou záměrně worst-case, ne průměr.

| # | Předpoklad | Hodnota | Zdroj |
|---|---|---|---|
| Q-1 | Vstup na uzel | 3 000 cache + 1 500 necache tokenů | zadání úlohy — **neměřeno** |
| Q-2 | Výstup na uzel | 250 tokenů | zadání úlohy — **neměřeno** |
| Q-3 | Uzlů na run | 9 | zadání úlohy (horní hranice; medián 8–9 dle `llm-rozpocet-2026-07-28.md` P-7) |
| Q-4 | Volání na run | 9 | # z Q-3 (uzel = volání zde, zjednodušeně) |
| Q-5 | Hráč-večer | 3 runy = 27 volání | dle zadání |
| Q-6 | Čistý příjem z licence | $6,24 = €5,78 | **převzato** z `llm-rozpocet-2026-07-28.md` §8.1, neodvozuji znovu |
| Q-7 | Populační průměr | 19,8 runu/hráč | **převzato** tamtéž P-12 (nejkřehčí předpoklad modelu, žádná data) |

## 2. Ceník — vstup / výstup / cache (ověřeno 2026-07-30)

| Poskytovatel | Model | Vstup $/M | Výstup $/M | Cache vstup $/M | Cache mechanismus | Batch sleva |
|---|---|---:|---:|---:|---|---:|
| **Anthropic** | Claude Haiku 4.5 | 1,00 | 5,00 | 0,10 | auto, min **4 096 tok.** — náš prefix 3 000 tok. **nesplní** | −50 % |
| **OpenAI** | GPT-5-mini | 0,25 | 2,00 | 0,025 | auto, min ~1 024 tok. (nepotvrzeno oficiální dokumentací) — 3 000 tok. by mělo projít | −50 % |
| **Google** | Gemini 2.5 Flash-Lite | 0,10 | 0,40 | 0,01 | **manuální** (`CachedContent`), + storage $1/M tok./h — jiná mechanika než u ostatních | −50 % |
| Groq (host.) | Llama 3.1 8B Instant | 0,05 | 0,08 | ~0,025 (−50 %) | nepotvrzeno, min prefix neznámý | −50 % |
| Groq (host.) | Llama 3.3 70B Versatile | 0,59 | 0,79 | ~0,40 (−50 %) | totéž | −50 % |
| Together AI | Mistral Small | 0,20 | 0,60 | nepotvrzeno | nejisté | nejisté |

Pro srovnání — Sonnet 5 (referenční „lepší" Anthropic model, z předchozího
reportu): 3,00 / 15,00, cache min 1 024 tok. (3 000 by prošlo).

## 3. Náklad na volání / run / hráče-večer (Q-1–Q-5, worst-case)

Bez cache (plná cena vstupu 4 500 tok. + výstupu 250 tok.):

| Poskytovatel / model | $/volání | $/run (9 vol.) | $/hráč-večer (27 vol.) |
|---|---:|---:|---:|
| Claude Haiku 4.5 | 0,005750 | **0,05175** | **0,15525** |
| Groq Llama 3.3 70B | 0,002853 | 0,02567 | 0,07702 |
| GPT-5-mini | 0,001625 | 0,01463 | 0,04388 |
| Together Mistral Small | 0,001050 | 0,00945 | 0,02835 |
| Gemini 2.5 Flash-Lite | 0,000550 | 0,00495 | 0,01485 |
| Groq Llama 3.1 8B | 0,000245 | 0,00221 | 0,00662 |

S cache (tam, kde 3 000 tok. prefix pravděpodobně splní minimum — u Haiku
**ne**, viz §2):

| Poskytovatel / model | $/volání s cache | $/run | úspora proti bez cache |
|---|---:|---:|---:|
| GPT-5-mini | 0,000950 | 0,00855 | −42 % |
| Gemini 2.5 Flash-Lite | 0,000280 | 0,00252 | −49 % (+ storage ~$0,70/měs. při nepřetržitém provozu) |
| Groq Llama 3.1 8B | 0,000170 | 0,00153 | −31 % |
| Claude Haiku 4.5 | *nemění se* | 0,05175 | **0 %** — prefix pod minimem |

## 4. Break-even a škálování na 1000 hráčů/měsíc

Break-even = kolik runů/večerů spotřebuje jedna licence ($6,24 marže), bez cache:

| Model | break-even runů | ≈ večerů |
|---|---:|---:|
| Claude Haiku 4.5 | 120,6 | 40,2 |
| Groq Llama 3.3 70B | 243,1 | 81,0 |
| GPT-5-mini | 426,7 | 142,2 |
| Together Mistral Small | 660,3 | 220,1 |
| Gemini 2.5 Flash-Lite | 1 260,6 | 420,2 |
| Groq Llama 3.1 8B | 2 829,9 | 943,3 |

**1000 nových licencí/měsíc** (jednorázová cena, žádné předplatné — jde tedy
o kohortu nových kupujících, ne recurring uživatele), populační průměr 19,8
runu/hráč (Q-7): 19 800 runů/měsíc, marže v pool $6 240/měsíc.

| Model | náklad/měsíc | % z marže |
|---|---:|---:|
| Claude Haiku 4.5 | $1 024,7 | **16,4 %** |
| Groq Llama 3.3 70B | $508,3 | 8,1 % |
| GPT-5-mini | $289,6 | 4,6 % |
| Together Mistral Small | $187,1 | 3,0 % |
| Gemini 2.5 Flash-Lite | $98,0 | 1,6 % |
| Groq Llama 3.1 8B | $43,7 | 0,7 % |

> **Nález — pod zadaným (worst-case) promptem stoupá podíl Haiku na marži
> z 6,2 % (měřeno, `llm-rozpocet-2026-07-28.md` §8.3) na 16,4 %.** Pořád
> udržitelné, ale rozdíl je téměř 3× jen kvůli velikosti promptu — potvrzuje,
> že **skutečná velikost D53/D54 promptu je nejcitlivější neznámé číslo**
> celého rozpočtu (víc než volba poskytovatele). Extrémní hráč (500 runů,
> P-12) by u Haiku a tohoto promptu stál $25,90 = 415 % marže → **ztráta bez
> fair-use stropu je hlubší než v předchozím měření (156 %)**. Strop $1,50/
> licenci z §8.4 předchozího reportu zůstává v platnosti a je při větším
> promptu ještě naléhavější — zafunguje po ~29 runech Haiku (dřív 77).

## 5. Kvalitativní poznámky

| Poskytovatel | EU data residency | Structured output | Rate limity (indie) | Min. závazek |
|---|---|---|---|---|
| Anthropic | `inference_geo` (US/EU) na 1P API — **ověřit pro Haiku 4.5 při stavbě adaptéru**, GA zatím jen na novějších modelech | ✅ podporováno na Haiku 4.5 (`output_config.format`) | tier dle historie útraty, start skromný | žádný, pay-as-you-go |
| OpenAI | EU residency oficiálně jen pro Enterprise/Business tier — **nejisté pro běžný API klíč** | ✅ zralé, `json_schema` strict mode | Tier 1 (nový účet) skromný, škáluje s útratou | žádný |
| Google Gemini | Developer API (`ai.google.dev`) routuje globálně; garantovaná EU rezidence jen přes Vertex AI (GCP region pinning) = víc infrastruktury | ✅ `response_schema` / JSON mode | free tier přísné kvóty (RPM/RPD), placený tier OK | žádný na Developer API; Vertex vyžaduje GCP účet |
| Groq | **US-only, žádná EU nabídka nalezena** — gap pro GDPR | JSON mode + tool calling (OpenAI-kompatibilní) | historicky přísný free tier, přesná čísla neověřena | žádný, ale karta/prepay pro vyšší limity |
| Together AI | Serverless default US infra; region pinning jen u dedicated endpointů (placené navíc) | JSON mode u části modelů (OpenAI-kompatibilní) | pay-as-you-go serverless bez zvláštního omezení nalezeného | žádný na serverless; dedicated = měsíční závazek |

**Mistral Small** je jediný kandidát s **evropským původem modelu**
(Mistral AI, Francie) — nekryje to automaticky hosting region (Together
serverless je US), ale je to jediný kandidát, kde „evropský AI" jako
marketingový/PR argument (Steam AI disclosure, GDPR citlivost) sedí i na
úrovni tvůrce modelu, ne jen hostitele.

## 6. Doporučení — finalisté do testu češtiny

**1. Claude Haiku 4.5** — baseline. Jediný kandidát s hotovým měřeným
   rozpočtovým modelem (`llm-rozpocet-2026-07-28.md`), `structured_outputs`
   podporováno, nejdražší z šestice, ale i tak udržitelný (16,4 % marže na
   populačním průměru). Testovat, aby bylo srovnání proti zbytku poctivé —
   „nejdražší" nemusí znamenat „nejlepší česky", a naopak.

**2. Gemini 2.5 Flash-Lite** — nejlepší cena/výkon mezi velkými labs
   (0,55 ¢/run, 9× levnější než Haiku), structured output zralý. Riziko:
   manuální cache (jiná inženýrská práce než u ostatních) a nejistá EU
   rezidence na Developer API. Kvalita češtiny u Google modelů v tomto
   projektu **nikdy netestována** — musí do baterie.

**3. Together AI — Mistral Small** — jediný kandidát s evropským modelem,
   rozumná cena (9,45 ¢/run — uprostřed pole), nejmenší vendor lock-in
   (open-weight, dá se přenést k jinému hostiteli). Riziko: nejméně ověřená
   ekonomika cache, hosting stále US.

**Zamítnuto z finálové trojky, ne z testu úplně:** Groq Llama 3.1 8B je
nejlevnější o řád, ale 8B parametrů je konkrétní riziko proti **mandátu D53
„kreativní interpretace"** — je to nejmenší model v celém srovnání a
kreativní interpretace karet je přesně úkol, na kterém malé modely selhávají
nejčastěji. Pokud `protocol-humor-tester` dělá baterii, ať Llama 8B **projde
jako kontrolní dno** (ukáže, jak vypadá selhání), ne jako kandidát na
nasazení. Groq Llama 3.3 70B je zajímavý střed (81 večerů break-even, US-only
hosting), ale bez EU argumentu a bez cenové výhody nad GPT-5-mini nepřidává
do trojice nic nového.

## 7. Co NEVÍME bez testu

1. **Skutečná velikost D53/D54 promptu** (§1) — čísla v tomto dokumentu jsou
   3× nad posledním měřením a nikdo je neověřil na finálním znění promptu.
   **Priorita č. 1** — než cokoli jiného, přeměřit stejným postupem jako
   `llm-rozpocet-2026-07-28.md` §2, jakmile `protocol-humor-tester` zafixuje
   „B-lite" prompt.
2. **Kvalita české kreativní interpretace per kandidát** — jediná metrika,
   kterou D53 určil jako rozhodující, a tento dokument ji neřeší (mimo
   mandát `operations-economics`). Test: `protocol-humor-tester`, regresní
   baterie (5 kandidátů, nutná verze v §6 finalisté).
3. **Minimální cachovatelný prefix u OpenAI, Google, Groq, Together** —
   ověřeno jen u Anthropicu (skill `claude-api`). Ostatní čísla v §2 jsou
   z agregátorů/blogů, ne z primární dokumentace (WebFetch na
   `platform.openai.com` a `pricepertoken.com` vrátil 403) — **ověřit přímo
   `messages.count_tokens`-ekvivalentem dané platformy při stavbě adaptéru**.
4. **EU data residency u OpenAI a Groq** — nejasné/chybějící, může být
   právní blokátor bez ohledu na cenu (Steam AI disclosure + GDPR).
5. **Skutečné rate limity pro nový/malý účet** — u žádného poskytovatele
   nebyla ověřena přesná čísla pro „indie" tier; jen kvalitativní dojem
   z dokumentace.

## 8. Zdroje

- Anthropic: skill `claude-api` (cache ceník `shared/prompt-caching.md`,
  ceník modelů `shared/models.md`), ověřeno 2026-07-30.
- OpenAI: [developers.openai.com/api/docs/pricing](https://developers.openai.com/api/docs/pricing) (WebFetch 2026-07-30).
- Google Gemini: [ai.google.dev/gemini-api/docs/pricing](https://ai.google.dev/gemini-api/docs/pricing) (WebFetch 2026-07-30).
- Groq: [groq.com/pricing](https://groq.com/pricing) (WebFetch 2026-07-30).
- Together AI: agregováno z WebSearch 2026-07-30 —
  [CloudZero — Together AI Pricing 2026](https://www.cloudzero.com/blog/together-ai-pricing/) ·
  [eesel AI — Together AI pricing guide](https://www.eesel.ai/blog/together-ai-pricing) —
  **nepotvrzeno primárním zdrojem, ověřit před rozhodnutím.**
- Marže na licenci ($6,24), populační průměr (19,8 runu) a měřená struktura
  promptu (972/494/207 tok.): převzato z `technika/llm-rozpocet-2026-07-28.md`,
  neodvozováno znovu.

---
*Necommitováno — vrací se `project-manager` k review. Model v xlsx
(`projekt/ekonomika/llm-rozpocet-2026-07-28.xlsx`) tento dokument nerozšiřuje;
až se D53/D54 prompt zafixuje a přeměří, obě čísla (§1 tady i xlsx) je potřeba
sladit v jednom kole.*
