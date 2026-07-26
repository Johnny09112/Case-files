---
name: kalibrace-revert-falzifikace
description: Zavržený směr — revert viditelných kotev běžných uzlů NEspraví K1/K5/K7; engine-kontrafaktuál potvrdil opačný směr. Kde K1 skutečně visí.
metadata:
  type: project
---

# Revert viditelných kotev běžných uzlů = zavržený směr (kalibrace-3, 2026-07-26)

Hypotéza kalibrace-2 „sniž viditelné kotvy běžných uzlů (npc/lokace) 4→3 →
K1 klesne do pásma + uleví K5/K7" byla **falzifikována přímým měřením enginu**
(project-manager, 1200 runů + 2400 kontrafaktuál přes reálný engine).

**Why (co data ukázala):**
- SMĚR: revert win-rate ZVYŠUJE (méně postihů → víc přežití), monotónně.
  Kontrafaktuál: baseline 72.2 % → jen běžné 75.3 → vč. finále 88.7. K1 3p/4p
  už breachuje NAHORU (70.7/70.9), takže každý revert ho zhoršuje.
- K1 nedrží běžné uzly, ale **finále (konfrontace) + akumulace postihů**.
  Lehčí běžný uzel = míň postihů = víc dojetých do finále v kondici = víc výher.
- „Drž improv-4, je řešitelný" je špatně: kotva 4 ± šum 2 s clampem = miss ~40 %
  i s kartou improv-4. Improvizace NENÍ triviální flex, jak jsem tvrdil.
- K5 <5 % je přes běžné kotvy NEDOSAŽITELNÉ: neřešitelnost je ~51 % common /
  ~49 % finále; finále drží floor ~10 %.
- Skutečný top driver neřešitelnosti = **hodnota-slot pod Malonem** (miss 66-72 %):
  padá mechanicky přes D20a run-wide nulování, výše kotvy s tím nic nenadělá.

**How to apply:** K1 3p/4p tlačit dolů výhradně přes finále/Žár/škálování počtem
hráčů, NE přes běžné uzly. Než navrhnu cokoli k win-rate, ověř směr proti enginu —
teoretická úvaha o „vynucených gamblech" (efekt A vs B) mě svedla špatným směrem.
Návrh kalibrace-4 (redefinice K5 gate na „bez mechanicky nulovaných slotů" +
scope na běžné uzly; Malone hodnota-slot; co-op škálování obtížnosti) je eskalace
u uživatele. Viz [[design-era-kalibrace]].
