---
name: mozek-operace-kontrafaktual
description: Kolo D39(iv) — kontrafaktuál náhrad za mrtvý cíl mozek-operace; A schovana-bouchacka vyhrála, B/C exaktně týmové (divergence 0,00 %), práh >=2 zamítnut měřením (2026-07-28)
metadata:
  type: project
---

# Kontrafaktuál `mozek-operace` (2026-07-28) — PROKÁZÁNO SIMULACÍ

**Why:** mandát D39(iv), malé kolo před lidskou bránou. Report:
`technika/mozek-operace-kontrafaktual-2026-07-28.md`. Do `obsah/` se nezapisovalo —
kandidáti žili jen ve scratchpadu přes `CONTENT_DIR`.
**How to apply:** čísla platí pro obsah + engine ve stavu po D41. ~290 000 runů,
4 bloky × 1000 seedů × 4 počty × 2 pronásledovatelé, verdikt z průměru bloků.

## Prokázané nálezy

- **Brána je vůči sadě cílů invariantní — DOLOŽENO, ne tvrzeno.** `summary.json`
  přes `CONTENT_DIR` na base/A/B/C se liší **jen v `verzeObsahu` (hash)**; nula
  rozdílů ve všech gate metrikách. Důvod: gate běží botem `kompetentni`,
  `goalBias` je jen ve strategii `cile`. **Technika k opakovanému použití:**
  u aditivních změn neměř „v rámci šumu", ale rekurzivní diff `summary.json`
  na identických seedech — bitová shoda je levnější a silnější důkaz.
- **Vítěz: `schovana-bouchacka`** (`commitnute_stitky.GANGSTER_skryta >= 1 a doruceno`,
  2 b.). Podm. doručením: incidenční 81,5/54,8/38,2/30,0 (1–4p), s kanonickým
  biasem λ=3 89,5/63,2/47,3/**35,7**. Obě předregistrovaná pásma (1p 80±10,
  4p 35±12) trefena. Páka držitele +8 až +11 b. — reálná, ale **~78 % splnění ve
  4p přijde zadarmo** z týmově optimálního přiřazení.
- **Předregistrovaná ladicí páka `>= 2` je nepoužitelná** — proměřena: 4p
  nepodmíněně 4,9 % → **pod K9 floor**. Kdyby se muselo utahovat, jiná páka
  (např. „slot musel projít"), ne práh počtu.
- **`kredity_utracene_za` dělá z cíle týmový cíl v přestrojení — exaktně.**
  Divergence verdiktu mezi hráči: kandidáti B `noc-v-motelu` a C `handl-u-silnice`
  **0,00 %** (`events.js` v `deriveGoalMetrics` nefiltruje `hrac_id` u
  `credit_flow`). Zamítnutí B/C **drží i po normalizaci** (0,00 / kladný strop).
  ⚠ **ČÁSTEČNĚ RETRAHOVÁNO 2026-07-28** (viz [[muj-den-kontrafaktual]]): čísla
  „A 41,8–52,9 %" a „referenční pásmo osobních cílů" jsou min–max **přes počty
  hráčů** a jako důkaz osobnosti neplatí — absolutní divergence je funkce
  marginální míry (strop `1 − p^m − (1−p)^m`). Používej **normalizovanou**
  divergenci ze `sim/report.js`. Verdikt o A drží (norm. 0,77 / 0,91 / 0,93).
  **Vedlejší: `plny-zasah` je s norm. 0,00–0,03 exaktně týmový cíl.**
- **Hygiena měřidla odkryla pod falešným breachem skutečný:** `muj-den` je
  nepodmíněně 99,4 / 98,3 / 96,0 % pro 1p/2p/3p (+ 91,4 % ve 4p, doměřeno
  2026-07-28) → **breach K9 (5–95 %)**, dosud maskovaný agregátem přes počty
  (D39 hlásil 95,4). Řešeno samostatným kolem → [[muj-den-kontrafaktual]];
  poznámka SIM-TUNE o **per-count prahu** byla naopak designérem zamítnuta
  (per-count práh = text cíle závislý na sestavě).
- **B je los, ne rozhodnutí:** směna se povede v 88–92 % doručených runů, takže
  vzácnost B (13–26 % podm.) je celá `P(těžký postih ∧ 6 kreditů v motelu)`.
  Bot `adaptivni` už dnes utrácí maximálně → incidenční číslo je zároveň STROP;
  u ekonomických cílů nejde bias doplnit, `goalBias` sahá jen na přiřazení slotů.

## Diagnostika bota (ne obsahu)

`goalBias` u `dve-jizvy` je v 1p sebedestruktivní — držitel shazuje sloty, run
nedojede, nepodmíněné splnění 0,6 %. Zkresluje čtení strategie `cile` v sólu.

Hypotézy, které tohle kolo poslalo lidem, jsou v [[pending-human-hypotheses]].
Kontext brány: [[v3-gate-criteria-draft]], předchozí kolo [[kalibrace-5-sweep-prahoffset]].
