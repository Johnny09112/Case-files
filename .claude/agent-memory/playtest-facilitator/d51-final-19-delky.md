---
name: d51-final-19-delky
description: Měření délek finální sady 19 telegrafů D51, 4. průchod po re-review (§3.5) — průměr 317,8 zn., nad předregistrovanou hranicí 315, nic přes 400/670; 1 nekonzistence verdiktu C nalezena
metadata:
  type: project
---

# D51 dokončovací kolo — délky finální sady 19 telegrafů (4. průchod)

**Why:** `game-designer` zadal přeměření po re-review (D51, mandát
`technika/telegraf-skrtaci-kolo-2026-07-30.md` §3.5/§3.6). Čtvrtý průchod
(zákaz výhradnosti + směrový test, viz §3.6) přepsal část próz a designér
předem zapsal rozhodovací pravidlo: **vyjde-li průměr pod 315 zn., sada se
nezapéká** (§3.6, poslední odstavec — gate, ne popis). K okamžiku měření
(2026-07-30) `obsah/*.yaml` **stále nese starou sadu (D49)** — text telegrafu
vytažen ručně z blockquotů §3.5, pole `text` (4-slotová próza) načteno
z aktuálních YAML, protože se v tomto kole nemění.

**How to apply:** čísla platí pro sadu, která **čeká na zapečení** (oba
recenzenti dali „ZAPÉCT PO OPRAVÁCH", výsledná verze po zapracování nálezů
je opět nerecenzovaná — §3.6, §5.3). Před dalším měřením ověř, jestli mezitím
proběhlo zapečení — pak už čti přímo z YAML, ne z reportu. Skript scratch:
`d51-final-19-v4.mjs` (jednorázový, hardcoded 19 telegrafů + js-yaml načtení
`text` polí, nezapisuje nikam) — nahrazuje `d51-final-19.mjs` z 3. průchodu,
který měřil sadu PŘED re-review.

**Oprava vlastní chyby z minula:** předchozí verze tohoto záznamu tvrdila, že
měřená sada „ještě nese dvě nová porušení ČISTOTY" — designér v report §6.4
správně upozornil, že to platilo pro §3.4 (mezistav), ne pro §3.5, kterou jsem
tehdy měřil (§3.5 tabulka vyjmenovává porušení, která už byla opravená).
Zapsáno na opravu.

## Prokázáno měřením (ne simulací — je to čistě délka řetězců)

19 telegrafů, `String.length` nad naparsovaným řetězcem (code points).

- **Rozsah:** min 284 (`mesto-ulicka`), max 351 (`nadrazi-vypravci`), průměr
  **317,79 zn.**
- **Nad předregistrovanou hranicí 315 zn. → sada podle designérova vlastního
  gatu SMÍ jít k zapečení** (co do délky; zapečení čeká navíc na cílenou
  kontrolu směrovým testem, kterou designér navrhl jako další krok, §3.6).
- Pokles proti 3. průchodu (319,5 → 317,79, −1,7 zn.) je citelně menší, než
  design-critic odhadoval (~300–310) — re-review ubralo obraz v některých
  uzlech, ale zároveň vrátilo chráněné obrazy (kávové šálky, proud pod koly)
  a prodloužilo jiné (`nadrazi-vypravci` 345→351, `urednik-vaha` 358→341).
  Čistý efekt na průměr je malý; jednotlivé uzly se ale citelně přeskupily —
  `urednik-vaha` už není nejdelší (bylo 358, teď 341), nejdelší je nově
  `nadrazi-vypravci` (351, rezerva do 400 = 49 zn.).
- **Žádný telegraf nepřekračuje 400 zn.**, **žádný uzel nepřekračuje 670 zn.**
  (nejtěsnější součet: `nadrazi-vypravci` 575, `malone-lecka` 577).

## Vedlejší nález (mimo zadané měření, nahlásit dál — needitovat)

**`malone-lecka` (#16) nese starou formulaci verdiktu C** — „potají může být
to jediné, co pomůže." místo zkráceného „potají může rozhodnout.", které
report §3.5 uvádí jako nové jednotné znění buňky C po re-review (a které
skutečně nesou ostatních 7 výskytů C: `farmar-brod`, `deputy-mytnice`,
`deputy-hlidka`, `privoz-celnik`, `rival-prepad`, `rival-parley`,
`brody-lecka`). To je v přímém rozporu s vlastním tvrzením reportu „C 8× →
1 doslovné znění na buňku" (§3.5, tabulka) — fakticky je C teď 7×+1×. Zvedá to
i délku `malone-lecka` (350 zn., druhý nejdelší v sadě) o cca 13 zn. proti
tomu, co by měl se sjednoceným zněním. Nejde o věc, kterou má facilitátor
opravovat — hlásím pro `game-designer`/`design-critic` do dalšího kola
(směrový test + jednotnost verdiktů).

## Co z toho neplyne

Měření nehodnotí kvalitu, čitelnost ani zábavnost próz — jen délku. Průchod
hranicí 315 neznamená automatické zapečení; designér sám navrhl ještě jednu
mechanickou kontrolu (směrový test) před zapečením a report §3.6 uvádí i další
otevřené body (adjudikace skeletonu nároku, amendment předregistrace u léček).

Odkazy: [[d51-prior-sweep-memorizacni]] (jiný nález ze stejného D51 kola).
