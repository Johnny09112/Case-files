---
name: preregistrace-kriterii
description: Pracovní režim kalibrace — designér píše kritéria přijetí naslepo PŘED měřením facilitátora, včetně regresního rozpočtu a pořadí hodnoty kritérií
metadata:
  type: feedback
---

Při každém kalibračním kole, kde měří playtest-facilitator a já rozhoduji o zapečení,
**napiš kritéria přijetí předem a naslepo** (poprvé takto zadáno u sweepu
`zar.prahOffsetDlePoctu`, D37, 2026-07-27): guardraily kandidáta, primární podmínky,
**regresní rozpočet** (kolik zhoršení jinde je ještě přijatelná cena) a **pravidlo
výběru** (maximin rezerva ke hranám gate, ne „první, co projde").

**Why:** projekt má historii, kdy se výsledek dal vyložit zpětně podle toho, co
zrovna vyšlo; a dvakrát mě svedla teorie proti měření (viz
[[kalibrace-revert-falzifikace]]). Předregistrace odděluje designový úsudek od
racionalizace čísel.

**How to apply:**
- Vždy předem předregistruj i **pořadí hodnoty kritérií pro večer u stolu** — u téhle
  hry: mrtvá rozhodnutí (K5) > tvrdost finále (K5f) > tvar trati/tempo > obtížnostní
  laťka (K1/K6a). Breach laťky se dá přiznat do lidské brány (precedent D33/K5);
  rozbití kritéria, které se právě poprvé podařilo splnit, ne.
- Vždy předem napiš i **„kdy páku nepoužít"** a jaké alternativy předložit uživateli
  (rozhodnutí je jeho, ne kalibrační detail).
- Robustnost ber blokově (D31): mean + kolik bloků z 6 je v gate; nežádej přísnější
  laťku, než jaká už jednou prošla.
- Struktura enginu dává tvrdé stropy pák — dohledej je v kódu (clampy, reset hodnoty),
  ne odhadem; „za touhle hodnotou je to jiná hra" musí být doložené mechanikou.
