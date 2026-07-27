---
name: kalibrace-4-audit
description: Prověrka schvalovacího balíku nové brány Fáze 0 (D25, 2026-07-27) — kalibrace role kritika při hlídání goalpost-shiftu; jak nekřičet vlk tam, kde designer laťku drží
metadata:
  type: project
---

Audit balíku game-designera „nová brána Fáze 0" (mandát D25, 2026-07-27), hlavní úkol = hlídat MOVING THE GOALPOSTS. Verdikt: **schválit rámec s úpravami, nezapékat nic** dokud se nedoměří 3 věci. Sleduj rozhodnutí uživatele.

**Kalibrace mé role (poučení pro příště):**
- **Nejostřejší goalpost-tell = best-case vs. expected accounting.** Bod 1 varianta D („max≤1 i po NEJLEPŠÍM gamblu") započítává nejlepší výsledek náhodného lízu jako záchranu — hráč ale gamble neřídí (D17: vybírá jen ČÍ ruka, karta náhodně). Best-case nad náhodou systematicky podhodnocuje beznaděj. Koncept metriky OK, operacionalizace = deus ex machina. Vždy se ptát: „dostane hráč tenhle výsledek spolehlivě, nebo jen v nejlepším případě?"
- **Nekřič vlk tam, kde je laťka poctivě držená.** Bod 4 (K2 drift 1,3 přes neplnící baseline 1,16, odmítá facilitátorových 1,15) a Bod 5 (K6a ≤10→≤6, K1 per-count; baseline oba NEPLNÍ) = reálné ZPŘÍSNĚNÍ, ne alibi. Přiznat to nahlas, jinak ztrácím věrohodnost u bodů, kde goalpost skutečně je.
- **„Vyříznuté z gate musí mít vlastní gate" — a ten gate musí mít ČÍSLO.** Bod 3 (K7 reframe) je nejobhajitelnější reframe (staré ≤20 % bylo měřením prokázáno jako mis-specifikace: est=2 je ~40 % uzlů strukturně), ALE jediná tvrdá pojistka proti trivializaci commitu = learnabilita ≥12 b. je NEMĚŘENÁ. Loosening je okamžitý, pojistka jen slib. Nepřijmout Bod 3 jako „splněný" dokud (3) neprojde.
- **Dvojí měřicí cut.** Balík míchá cut A (K5 4p 17,3 / přežití 1p 68,8) s cutem B (18,4 / 76,6) bez označení, který je který — 8bodový rozptyl přežití na 2000 runech = metodologický red flag, ne zaokrouhlení. Vždy žádat label (N, pronásledovatel, common/all, definice „přežití") u každého baseline čísla.
- Proceduální watch pokračuje z [[kalibrace-3-audit]]: D22e hand-off „engine vlastní K1" se v praxi porušil; Bod 6 to opravuje sdíleným vlastnictvím + kontrafaktuál-před-zapečením, ale change-control nemá tripwire (kdo kontroluje, jaký artefakt) → doporučeno udělat z kontrafaktuálního whole-gate reportu tvrdou podmínku zapečení.
