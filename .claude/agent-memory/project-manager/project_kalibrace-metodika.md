---
name: kalibrace-metodika
description: Kontrafaktuální měření přes CONTENT_DIR před zapečením + lekce z falzifikace kalibrace-3
metadata:
  type: project
---

Kandidátní obsahové změny se NEzapékají do `obsah/` před ověřením: kopie obsahu
do scratchpadu + `CONTENT_DIR` override → plné gate-měření na kandidátu, repo
netknuté. Per-slot diagnostika PŘED zapečením (facilitátor umí importovat engine
ad-hoc skriptem) odhalí špatné premisy návrhu levně.

**Why:** Kalibrace-3 (2026-07-26, D24) — návrh designera prošel kritikou, ale
diagnostika vyvrátila všechny tři premisy (směr K1, dosažitelnost K5/K7,
identita driverů). Bez kontrafaktuálu by se spálila obsahová iterace + revert
revertu. Pozor na směrové předpoklady z předchozích reportů: „revert kotev
sníží K1" z kalibrace-2 byla chybná atribuce.

**How to apply:** Každá další kalibrace: (1) návrh → kritika → (2) levná
diagnostika premis na SOUČASNÉM obsahu → (3) kontrafaktuální gate-měření přes
CONTENT_DIR → (4) teprve pak zapékat. Negativní výsledek je platný výstup —
vyhlásit, nezapékat, eskalovat nový mandát. Testy/commity za PM dělá
playtest-facilitator (má Bash). Viz [[prostredi-orchestrace]].
