---
name: v3-gate-criteria-draft
description: Kritéria v3 simulační brány — SCHVÁLENA D19 (2026-07-23), zapsána v prototyp-mvp.md Fáze 0
metadata:
  type: project
---

# v3 simulační brána — SCHVÁLENA (D19, 2026-07-23)

**Why:** pivot na slotovou resoluci (D14–D17) zneplatnil v2 bránu. Kritéria níže jsou
schválená (D19, s verdikty kritika i uživatele) a **zapsaná v `prototyp-mvp.md` Fáze 0
jako tabulka**. Tady drží plný kontext (odůvodnění, jistoty), který se do Fáze 0 nevešel.

**How to apply:** až poběží 1. v3 běh, měř proti tomuhle. Nejdřív ověř, že model v prototypu
odpovídá (commit naslepo, oracle hook, deterministické přeřešení, telegraf derivovaný enginem).

## GATE vs. diagnostika (jak D19 rozhodl)
- **GATE:** K1, K2, K3, K4a, K4b, **K4c** (svázaná s noise-modelem), **K5 jen vrstva „max ≤1/4 <5 %"**,
  **K6a** (rozpětí ≤10 b.), **K6c** (run-agregovaný pasažér), K7, K8, K9.
- **DIAGNOSTIKA (pozorovat, ne blokovat):** K5 vrstvy 30–50 %/10–20 %; **K6b** (konflikt s cílem,
  soft floor „zřetelně >0"); rozpad proher bedny-0 vs. konfrontace (run-1, D19a).

## Klíčové hodnoty (detaily v prototyp Fáze 0)
- K1 45–70 % PROVIZORNÍ → run-1 diagnostický → **pásmo se FIXUJE hned po run-1**. [jistota nízká na hodnotě]
- K2 uzel 3–4 ≥ 1,3× uzel 1–2 + korelace info-postih×pásmo. [nízká-střední]
- K3 medián uzel ∈{3,4}. K4a ≤80 %. K4b stat-rozpětí ≤~10 b.
- **K4c:** kompetentní−random ≥12 b. A memorizační−kompetentní ≤3 b. Pád → nejdřív „oprav šum",
  pak „zahoď design". Memorizační bot zná **stabilní kotvy per situace-ID**; šum **per-instance IID uniform ±1**.
- K5 gate: beznadějné (max≤1/4) <5 %. K6a ≤10 b. K6c žádný pasažér (agregovaně).
- K7 take-rate ≤20 %, ≥80 % při odhadu ≤2/4, EV<0 při ≥3/4. **EV per počet hráčů:** líz 1/2 (1p/2p/4p),
  1/3 (3p ne-držitel) — po commitu 4 karet zbývají 2 resp. 3 karty.
- K8 medián 7–9, <30 % koupí vše, směna i léčení ≥25 % motelů. K9 cíle 5–95 %.

## Model (D19 fixace)
- Kotvy **2–4** (práh 0 zakázán); šum uniform ±1; kombinovaný slot = „oba staty ≥ kotva" (střídmě).
- Sdílený balík ~40 (líz patří lízajícímu); prémiový osobní loadout post-MVP; custom karty sytí truhly.
- **Telegraf:** engine derivuje signál (`trend`, `proti_srsti`, `zbraň_projde`) ze slotů; próza = lidský
  rendering + QA invariant; **fidelita p = sweep knob.**
- Enum postihů: `hide_nazvy` škrtnut; `hide_telegraf` žije (→ commit-fázový bot model);
  lock_stat/lock_slot_viditelnost dodefinovat/škrtnout; zvážit lock_gamble. GANGSTER hustota = sweep.
- **Event-log spec vlastní technical-developer** (nahradí architektura §2.2; jeden log pro gate-metriky,
  `podminka` cílů, `max_achievable_band` z oracle). Counterfactual swing (K6c) = schopnost harness
  (deterministické přeřešení s výměnou karty).

## Botí strategie
Commit: informovaný (telegraf = zašuměný signál kotev, p sweep) / naivní / stat-monokultury /
**commit-fázový pro hide_telegraf** (committne bez trendu — ε-greedy kryje jen PŘIŘAZENÍ, ne commit; nález kritika).
Přiřazení: oracle / kompetentní (zná stat, ne práh) / greedy / random / cíle-driven / memorizační.
Info postih = ε-greedy přiřazení (ε 0,3–0,5); gap informovaný vs. postižený = síla postihu jako −X.
Ekonomika: vždy-léčit / vždy-směnit / hoard(mrtvý, per-run) / adaptivní.

## Pořadí kalibrace
**smoke-test co-op inverze** (má 4p horší dosažitelnou info než 1p? → přeuspořádat referenci) →
kotvy×staty karet (jádro, ref 4p) → postihy (nesou ekonomiku) → Žár → ekonomika →
ruce (parita agency, proti stabilnímu 4p) → gamble+cíle (naposled).

## Bloky před 1. během
Obsah je pořád **v2** (obsah/*.yaml: tagy, síla 1–3) → brána neběží, dokud game-designer nenapíše
v3 obsah (karty s 5 staty, situace s kotvami 2–4) a **nepřepíše 8 cílů z injury-měn na v3 měny**;
a dokud technical-developer nedodá event-log spec + oracle hook + deterministické přeřešení.
