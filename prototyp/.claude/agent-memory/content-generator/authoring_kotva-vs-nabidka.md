---
name: authoring-kotva-vs-nabidka
description: Autorské pravidlo — než dám slotu kotvu 4, ověř, kolik věcí v balíčku má ten stat na 5 (clamp zdvojuje práh 5) a zda je slot pro GANGSTER průchozí.
metadata:
  type: feedback
---

Kotvu 4 nedávej slotu, dokud nespočítáš nabídku balíčku na **statu 5** pro ten slot.

**Why:** práh = `clamp(kotva + šum{−2..+2}, 0, 5)`. U kotvy 4 se hodnota 6 clampne na 5,
takže rozdělení je {2,3,4,**5,5**} → **40 % instancí vyžaduje stat 5**. Balíček má
typicky 1 nositele na úrovni 5 na stat (a u útoku jsou obě pětky GANGSTER, které ve
viditelné roli npc situace auto-failují → nabídka 0). Kotva 4 na řídkém statu proto
není „těžký slot", ale **hod mincí o mrtvý slot** — a K5 („mříž mrtvých rozhodnutí")
to trestá. Naměřeno při P2/D25e 2026-07-27: `nadrazi-vypravci` má jedinou kotvu 4
(utok, viditelná, npc) a `max≤1` 47 % — o 15 bodů horší než situace stejného tvaru
s kotvou 4 na hustěji pokrytém statu.

**How to apply:** při psaní nové situace nebo úpravě kotvy si projeď `obsah/veci.yaml`:
- kolik věcí má daný stat ≥5 a ≥4 (a z toho kolik **non-GANGSTER**, pokud je slot
  `viditelna` a typ situace je `npc`/`lecka` — viz `obsah/stitky.yaml`);
- u KOMBI slotů `[stat, stat]` počítej věci, které mají **oba** staty ≥ práh —
  tam bývá nabídka nad práh 3 nulová.
Když nabídka na úrovni 5 je 0–1, buď dej kotvu 3, nebo doplň druhého nositele na 5
(součtově neutrálním přesunem uvnitř karty, ne power creepem), nebo — u utoku
v npc — použij slotovou výjimku `stitek_citlivy: GANGSTER`.

**Pozor u té výjimky:** `deriveTelegrafSignal` (`prototyp/src/engine/resolve.js`)
odvozuje verdikt zbraně jen z typu situace a slotové `stitek_citlivy` ignoruje —
bez opravy v enginu by próza telegrafu lhala. Ověř stav kódu, než ji navrhneš.

Souvisí: [[kalibrace-tonu]]
