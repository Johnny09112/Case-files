---
name: kalibrace-mereni-ne-odhad
description: Kalibrace role — v tomhle projektu se vstupy měří delegací na agenta s Bash, ne odhadují; a jak tu jde postavit xlsx
metadata:
  type: feedback
---

**Pravidlo: každý vstup, který jde v tomhle repu změřit, změř — i když to
znamená delegovat agentovi s Bash.** Sám nemám Bash (Read/Grep/Glob/Write/
Edit/Agent/Web*), takže simulátor ani skripty nespustím přímo.

**Why:** dvakrát se ukázalo, že odhad byl vedle o desítky procent, zatímco
měření trvalo jednu delegaci. `technika/architektura.md` §2.3 odhadovala
600–800 vstupních tokenů — skutečnost 1 470 (2×). Zadání i `CLAUDE.md`
pracovaly s „run ≈ 6 uzlů = 6 volání" — engine dělá 7,6–8,7. Projekt má na
tohle vlastní precedens: prověrka bota (D34) ukázala, že měřidlo bylo horší
než hra, a přinesla víc než dvě kola ladění obsahu.

**How to apply:**
- Počty uzlů/volání, délky textů, rozdělení pásem → `general-purpose` agent
  se zadáním „změř a reportuj, nic needituj". Simulátor:
  `cd prototyp && npm run sim -- --runs N --players 1,2,3,4`; volání se
  počítají jako události `band_resolved` (import `playRun()` z
  `prototyp/sim/run.js` je spolehlivější než parsování reportu).
- Běhy pouštěj **synchronně** (`run_in_background: false`) — provozní
  poznámka z `projekt/stav.md`: background agenti se tu ukončovali bez
  doručených výsledků.
- Co změřit nejde (tokenizační multiplikátor, rozdělení runů na hráče),
  označ jako odhad a **vyčísli citlivost** — u tokenizeru vyšla ±15 %, tedy
  nerozhodná, a to je samo o sobě užitečný výsledek.
- Nech si výsledky protiúčtovat: agent, který stavěl xlsx z reportu, našel
  v reportu dvě reálné chyby. Stavba modelu je zároveň kontrola textu.

**Prostředí (gotcha, ověřeno 2026-07-28):** na tomhle stroji **není Python,
openpyxl ani LibreOffice**, takže `scripts/recalc.py` ze skillu `xlsx`
nefunguje. Je tu **Microsoft Excel 16.0** → xlsx se staví přes Excel COM
z PowerShellu a verifikuje `CalculateFullRebuild()` + sken
`SpecialCells(xlCellTypeFormulas, xlErrors)`. Excel COM je vázaný na cs-CZ:
`NumberFormat` bere jen české kódy (`0,00`), vzorce naopak US syntax.

Viz [[reference-ekonomicky-model]].
