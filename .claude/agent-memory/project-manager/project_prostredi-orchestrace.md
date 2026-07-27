---
name: prostredi-orchestrace
description: Dostupnost týmu agentů a gitu se mezi sessions liší — co ověřit na startu a jaké workaroundy fungují
metadata:
  type: project
---

Dostupnost nástrojů orchestrace se mezi sessions liší — na startu delegačního
úkolu ověř, co reálně funguje, a podle toho plánuj.

**Why:** 2026-07-22 nebyl tým dosažitelný (SendMessage „not reachable") a session
neměla git — role se hrály v zastoupení a commit zůstal jako dluh. 2026-07-24
naopak plné kolečko game-designer → design-critic → content-generator přes
**Agent tool** proběhlo bez problémů a commit šel delegovat. 2026-07-27
background agenti opakovaně „doběhli" bez doručení výsledku (notifikace se
ztrácely nebo chodily s velkým zpožděním) — synchronní re-runy pomohly, ale
vyrobily duplicitní běhy (dvě instance téhož úkolu editovaly týž soubor;
naštěstí konvergovaly).

**How to apply:**
- Agenty spouštěj přes **Agent tool (subagent_type dle jména)**, ne SendMessage
  na jméno bez předchozího spawnu.
- PM **nemá Bash** → commit/push deleguj na `general-purpose` agenta (jmenovitý
  `git add` konkrétních cest, česká zpráva, Co-Authored-By patička). Validace
  YAML: `npx js-yaml` (Python na stroji není).
- Pokud agent nedostupný → odehraj roli v zastoupení a přiznej to v syntéze
  (precedens 2026-07-22, uživatelem akceptováno); commit-dluh vykaž ve stavu.
- Sekvenční kolečko návrh→kritika→implementace pouštěj synchronně
  (run_in_background: false); paralelně jen nezávislé kroky.
- **Background běhy jsou nespolehlivé (2026-07-27):** preferuj synchronní běhy;
  KAŽDÉMU agentovi zadej výstup i do souboru ve scratchpadu (přežije ztracenou
  notifikaci). Před „spusť znovu" zkontroluj artefakty po přerušeném běhu —
  a NIKDY nepouštěj druhou instanci nad týmž souborem, dokud si nejsi jistý,
  že první neběží.
- design-critic si ukládá detailní audity do své paměti
  (`.claude/agent-memory/design-critic/`) — po jeho reportu je čti, shrnutí
  v odpovědi bývá zkrácené.
- Procesní fakta piš vždy do `projekt/stav.md`, ne sem (vrstvená paměť dle
  CLAUDE.md).
