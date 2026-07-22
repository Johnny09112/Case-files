---
name: prostredi-orchestrace
description: Omezení prostředí PM session — dostupnost týmu agentů a git nástrojů se liší mezi sessions, vždy ověřit na startu
metadata:
  type: project
---

Dostupnost nástrojů orchestrace se mezi sessions liší: 2026-07-22 nebyl tým
agentů dosažitelný přes SendMessage („No agent named … is reachable") a session
neměla Bash/git nástroje, takže konvence „commitni a pushni sám" nešla naplnit.

**Why:** PM systémový prompt předpokládá delegaci na 9 agentů a CLAUDE.md
předpokládá auto-commit; když nástroje chybí, je nutné role odehrát v zastoupení
a přiznat to v syntéze, a commit vykázat jako nesplněný dluh v `projekt/stav.md`.

**How to apply:** Na začátku session s delegačním úkolem si ověř dosažitelnost
agentů prvním malým SendMessage; při nedostupnosti pracuj v zastoupení (kritika,
design) a označ to tak ve stavu i syntéze. Procesní fakta piš vždy do
`projekt/stav.md`, ne sem (vrstvená paměť dle CLAUDE.md).
