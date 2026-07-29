---
name: kalibrace-obsahu
description: Jádro řemesla obsahu po pivotu v3 — věci s 5 staty, komedie ze špatného slotu, supply/demand proti slotům, postihy, kotvy; plus varování, že moje vlastní definice role je v2-zastaralá
metadata:
  type: feedback
---

**NEJDŘÍV: moje definice agenta (popis role) je ZASTARALÁ — popisuje v2 model.**
Mluví o kartách s tagem (nasili/lest/uplatek/utek), síle 1–3, prokletých a zoufalých
kartách a cílech 32/8/4/14/8. **Tenhle model je od pivotu v3 (D14–D19, 2026-07-23)
mrtvý** i s celou v2 kalibrací (tagová textura, Lest-specifika, prokleté karty).
**Why:** kostkovou resoluci nahradila slotová (commit věcí naslepo do 4 mezer,
skryté prahy, postihy místo zranění). **How to apply:** kanon je vždy
`prototyp-mvp.md` v3 + `design-dokument.md` v3 + schémata v `obsah/*.yaml`; když
zadání zní v2 slovníkem, přelož si ho do v3 a řekni to nahlas, neplň ho doslova.

## Trvalé principy (přežily pivot)

1. **Flavor nesmí slibovat mechaniku, kterou pravidla neznají** (princip „viditelná
   pravidla"). **Why:** kritik to označil jako blokující (B3). **How to apply:**
   u každé položky ověř, že popsaný důsledek odpovídá tomu, co engine skutečně dělá.
2. **Obsah musí fungovat sólo a bez AI.** Sólo hráč committuje všechny 4 karty sám —
   každou podmínku testuj na 1p i 4p, jinak si nevšimneš, že v sólu je nesplnitelná
   nebo jednostranně vynutitelná (= skrytá sebe-sabotáž).

## Věci (v3 slotový model)

- **Komedie plyne z VĚCI VE ŠPATNÉM SLOTU**, ne z pointy. Navrhuj věci s 1–2 silnými
  staty a zbytkem mizerným → někam se špatná volba MUSÍ dát. Vlajkové vtipy:
  banánový kanón (vysoká improvizace, vypadá jako útok — past), zlaté hodinky (eso
  úplatku, jinde k ničemu), brokovnice GANGSTER (eso ve skryté roli, sebevražda
  ve viditelné roli NPC).
- **Supply/demand balancuj proti SLOTŮM, ne proti počtu věcí.** Neoversupplyuj jeden
  stat (hodnota 8/40 vs. demand 8/76 → trim na 6).
- **Mono-use specialisté** (jeden stat 5, zbytek ≤1) jsou v ruce 3 (4p) mrtvé karty →
  dej jim záložní stat 2, odůvodněný fikcí (hodinky improv „oslnit leskem", svazek
  bankovek obrana „zastaví kudlu").
- **Hlídej NON-GANGSTER útok supply** pro viditelné útok-sloty (zbraň tam auto-fail).
  Bez pár čistě-útočných non-gangster věcí jsou visible útok-sloty neřešitelné.
- **improvizace = univerzální flex** (nejvyšší demand i supply) — NEŘEŠIT obsahem,
  je to sim watchlist (K4b/K5 „když nevíš, hraj improv").

## Situace, postihy, pronásledovatelé

- **Efekty postihů STROJOVĚ (enum), ne prózou** — text postihu je komediální fikce,
  efekt je `{ druh: hide_staty | lock_stitek | ... }`. Ztrátové (`ruka_minus`,
  `ztrata_karty`) přiděluj střídmě kvůli malým rukám ve 4p.
- **Postih-pooly drž vyrovnané** (~5–6 výskytů na postih). Nenech 2 generické
  dominovat 9×, ani 1 těžký v 10 poolech. Těžké tematizuj: lock-GANGSTER postih
  patří na násilné/gun-relevantní uzly, ne na úředníka.
- **Kotva variety:** nedávej 78 % kotva3 — obtížnost se slévá a ±1 šum přebije volbu.
  Míchej 2–4 (cíl ~25 % kotva2, ~5 % kotva4).
- **Pronásledovatel musí KOUSAT:** rušení statu/štítku, který se v jeho uzlech ani
  finále nevyskytuje, je no-op. Řeš run-wide rozsahem (D20a) nebo ruš
  fight-relevantní stat.

Telegrafy mají vlastní tvrdý QA invariant → [[telegraf-invariant]].
Procesní pravidla dávek (fikce vs. číslo, patičky, měření) → [[proces-obsahove-davky]].
