---
name: v042-prompt-audit
description: Prověrka promptu v0.4.2 (2026-08-02) před 3. během brány češtiny — verdikt PROJDE S VÝHRADOU, 1 blokující nález mimo protokol.md
metadata:
  type: project
---

# Prompt v0.4.2 — prověrka pěti zásahů (2026-08-02)

Verdikt: **PROJDE S VÝHRADOU.** Fenced blok implementuje všech pět zásahů věrně
podle `technika/brana-cestiny-ab-2026-08-02.md` §6; vady jsou v okolí, ne v textu.

**Why:** kolo mělo změřit účinek pěti zásahů odděleně; nálezy níž rozhodují,
zda 3. běh vůbec bude interpretovatelný.

**How to apply:** než se rozhodne o v0.4.3 nebo o eskalaci na jiný model,
ověř, jestli tyhle body padly — jinak se bude eskalovat na základě šumu.

## Nálezy (pořadí = závažnost)

1. **KRITICKÉ — „3–5 vět" přežilo v baterii a ve specu hodnotitele.**
   `prompty/protokol-testy.yaml` ř. 167, 271, 426, 748, 819 (`musi`) + 826
   (`nesmi: překročit … ani 5 vět`); `.claude/agents/protocol-humor-tester.md`
   ř. 50 („Délka — 3–5 vět"). Zásah (4) je tím **no-op** a baterie nově žádá
   chování, které prompt neukládá = táž vada §1 falzifikovatelnosti, kterou
   report vytkl u kreditů. Blokující **před 3. během**, ne před commitem.
2. **VÁŽNÉ — zásah (3) pohřben doprostřed rule 5**, tedy do pozice, ze které
   zásah (2) v témž kole utíká („pravidlo pohřbené uvnitř dlouhého odstavce
   na Haiku nedrží"). Kolo si protiřečí. První hypotéza, pokud (3) selže.
3. **VÁŽNÉ — rule 1 „ani souhrn následků na konci"** je přeširoký zákaz
   v kolizi s rule 7 a rule 8 („zamlčený následek = porušení bodu 3").
   4. instance doložené pasti. Riziko: růst už tak KRITICKÉ třídy (A8, A13).
4. **VÁŽNÉ — zásahy (2) a (5) táhnou proti sobě** a oba metriky stop podmínky
   leží na téže ose: (5) žádá jednoznačné pass/fail u 4 slotů, (2) zakazuje
   říct proč. Doložený reflex modelu = vysvětlit (8/13). Konfundováno.
5. **VÁŽNÉ — stop podmínka není použitelná bez dohledávání:** „≤ ~2/13"
   + „zhruba" = pohyblivé branky; při n=3/case není definován jmenovatel;
   „formátový šum" nerozlišuje hlavičku (13/13) od strojového bloku (5/13,
   A10 KRITICKÉ); chybí větev „metriky prošly, brána pořád 0/13".
6. **VÁŽNÉ — zásah (3) vs. vzorový příklad:** gold example nepojmenovává
   „Otrlený výraz" vůbec a „Banánový kanón" zkracuje na „banán". Pravidlo je
   přísnější než vlastní etalon (precedent: oprava MAX 3/4 → 2/4 ve v0.4.1).
7. **DROBNÉ — zásah (2) není jen přesun:** konkrétní protipříklad
   („nestačilo to, protože…" nepiš) **zmizel**. Changelog to tvrdí jako
   přesun. Dvě změny v jedné proměnné.
8. **DROBNÉ — rule 8 neškrtací pořadí nerozšířeno** o novou položku rule 3.
   Týž argument, kterým kritik prosadil pořadí ve v0.4.1.
9. **DROBNÉ — konzistence:** „3–5 vět" dál v `CLAUDE.md` ř. 80 (křížový odkaz
   na protokol.md je nově nepravdivý), `design-dokument.md` ř. 126 a 284,
   `prototyp-mvp.md` ř. 129.

## Ověřeno jako NEproblém
- `extractSystemPrompt` matchuje `/^##\s*Systémový prompt/m` — verze v nadpisu
  je mimo fenced blok, do modelu nejde, parser se o ni neopírá.
- Prompt se nikde neduplikuje (`src/llm/prompt.js` čte protokol.md přes `?raw`,
  `sim/brana-cestiny.js` přes `fs` a týž parser). Doc-only edit **není** no-op.
- Cache LLM vrstvy zatím neexistuje → změna promptu nic neinvaliduje.
- Changelog drží styl v0.4/v0.4.1 (headline, číslované body, doslovné citace,
  důkaz, zamítnutá alternativa, odložená položka).

Souvisí: [[prompt-v04-audit]], [[v04-prompt-audit]]
