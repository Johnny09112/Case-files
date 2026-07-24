---
name: kalibrace-1-lek-audit
description: Prověrka game-designerova "kořenového léku K5/K7/K2" po kalibraci-1 (2026-07-24) — nálezy a co jde k uživateli; sleduj rozhodnutí
metadata:
  type: project
---

Audit návrhu game-designera „kořenový lék K5/K7/K2" (2026-07-24, PŘED zapracováním do obsahu, pro PM). Verdikt: **neschvalovat jako uzavřený lék, schválit jako vstup do společného re-měření s úpravami.** Sleduj rozhodnutí v `projekt/rozhodnuti.md`.

**Ověřená fakta (přepočítáno z YAML):**
- Skrytých slotů je **20** (designér má pravdu, předávka uvádí 19 — podcenila 2. skrytý slot v nadrazi-noc). Rozpad: 10 útok-skrytých, 8 obrana-skrytých, 1 nástroj (mesto-ulicka), 1 improv (nadrazi-vypravci).
- Balík obrana: obrana≥2 = 19/40 (~48 %), obrana≥3 = 9/40. Aritmetika BODU 2 sedí (obrana≥3 9→12, nástroj≥3 9→11, ≥4 tier a improv/hodnota netknuté).
- **nadrazi-noc = jediná situace se 2 skrytými sloty** (obrana kotva2 + útok kotva3) → 50 % naslepo → nejtvrdší K5/K7 offender, návrh ho skoro nemění.

**Blokující nálezy:**
- **R1 (KRITICKÉ) K1/K5 coupling:** tři současná změkčení (nižší skryté kotvy + pokrytí + signál zbraně) zvedají win-rate; engine drží K1 zvednutím VIDITELNÝCH kotev → to zhoršuje K5 (max≤1/4) na viditelné straně = reprodukce problému. Net nikde nespočítán. Brána MUSÍ měřit K1∈[45,70] ∧ K5-viditelná bez regrese ∧ K7≤20 % SOUČASNĚ, s odděleným K5 reportem viditelná/skrytá.
- **R3: polovina K7 (10 útok-skrytých) NENÍ řešena obsahem** — odsunuta na neexistující enginovou derivaci `zbran_projde = (skrytý slot má stat=útok)` místo dnešního binárního `= (existuje skrytý slot)`. Nereportovat K7 fix z obsahu.
- **R4: D21c pool-balance porušen.** Přepočet: návrh zvedne otras-mozku 6→**8** a mlha-v-hlave 6→**8** (strop D21c = 7). otras-mozku (těžký) se stává nejčastějším postihem = anti-vzor, kvůli kterému se trimoval zlomene-zebro 10→5.
- **1b UNVALIDATED:** teze „všech 8 obrana-skrytých vynucuje gamble" je z first-principles, neměřená per-situaci. Protidůkaz: 3 z 8 (farmar-stodola, urednik-vaha, nadrazi-noc) UŽ DNES leží na kotvě 2 a K7 breachuje 57–63 %. Sim musí doměřit take-rate per-situaci před→po.

**Dobré nálezy designéra (SCHVÁLENO):** identifikace 2 npc-pastí (urednik-vaha, urednik-razitko) — jediné 2 npc s falešným signálem skryté zbraně u obrana-skrytého slotu. Telegraf rewrite „zbraň tu nepomůže" zvyšuje čitelnost, NEZABÍJÍ fikční podpis (úředník = papíry, ne olovo). PODMÍNKA: párovat s opravou enginové derivace, jinak próza/signál drift (D19).

**K uživateli (mění D15–D21):** (1) ko-metrika K2 = změna znění fixované brány K2 → jen doplněk, ne náhrada prahu ≥1,3; (2) opuštění principu „odvoditelný telegraf" u obrana-skrytých (posun na měkký naslepo-slot + coverage) → ratifikace; (3) waiver D21c stropu ≤7 NEBO oprava návrhu.

**Watch (sliby „vyřešíme"):** R2 info-heavy pozdní pooly bijí sólo/2p (info-postih degraduje 100 % info u 1p vs 25 % u 4p) → K6a/K1 sólo riziko, elevovat z „watch" na „měřit před zapečením". Brodyho léčka NENÍ pozdní (run-wide +2 Žár akceleruje jeho práh dřív než Malonův) — logika „léčky=pozdní" u Brodyho neplatí.
