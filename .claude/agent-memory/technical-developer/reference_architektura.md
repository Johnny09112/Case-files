---
name: reference-architektura
description: Technická architektura a ADR (001–008) prototypu žijí v technika/architektura.md (ne projekt/tech/)
metadata:
  type: reference
---

Technický dokument prototypu včetně ADR-001 až **ADR-008** je v
`technika/architektura.md` (základ 2026-07-22, schváleno uživatelem přes
project-managera). Nové ADR přidávat tam, ne zakládat nové soubory.
Pozn.: zadání od project-managera určilo cestu `technika/`, přestože instrukce
role zmiňuje `projekt/tech/` — platí `technika/`.

**Stav v3 (2026-07-23):** §2.2 přepsán na **v3 událostní log** + **ADR-008**
(pivot D14–D19). Klíčové invarianty toho logu (drž je i příště):
- **Jeden log, tři konzumenti** — gate K1–K9, strojové `podminka` cílů,
  `max_achievable_band` (oracle nad committem × odhalenými prahy = jádro K5).
- **`telegraf_signal` derivuje engine ze slotů, ne autor** (próza = rendering,
  QA invariant věrnosti); fidelita `p` = sweep knob simu.
- Zbytek dokumentu je stále **v2-báze**; místa, která v3 láme, nesou značku
  „v2 — přepsat při přestavbě enginu" (§2.2 rules-příklady, §2.3 cache-klíč
  zranění→postih, §3 strategie, §6 testy, ADR-003/007). Kompletní přepis enginu
  na v3 (ADR-001,003,007 tělo, resolve() bez d6/afinit) je otevřený tech dluh.
