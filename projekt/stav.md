# Stav projektu

*Živý dokument. Udržuje `project-manager` — aktualizuj po každém větším kroku.
Poslední aktualizace: 2026-07-22.*

## Aktuální fáze

Papír přeskočen (viz [[rozhodnuti]]). Běží **simulace + příprava prototypu**.
Go/No-Go je dvoustupňové (simulační brána → lidská brána) — detail v
[[../prototyp-mvp|prototyp-mvp.md]] a `CLAUDE.md`.

## Backlog

| Úkol | Vlastník (agent) | Stav |
|---|---|---|
| Technická architektura + plán prototypu (Vite + vanilla JS, psací stroj) | technical-developer | **hotovo** — [[../technika/architektura|technika/architektura.md]] (7 ADR) |
| Naplnit sady obsahu (32 zákl. / 8 prokl. / 4 zoufalé karty, 14 uzlů, 8 cílů, ~20 fallback) | content-generator | čeká |
| Vyladit prompt protokolu + založit regresní baterii | protocol-humor-tester | čeká |
| Simulace runů pro balanc (prahy, snowball, bedny) | playtest-facilitator | čeká |
| Ověřit konzistenci designu po přidání mechaniky Žár | game-designer / consistency-check | čeká |

## Otevřené otázky (čekají na uživatele)

- LLM poskytovatel nerozhodnut (drž volání abstrahované).
- Jazyková strategie CZ→EN (kdy zařadit překlad a test anglických protokolů).
- Mechanika **Žáru / pronásledovatele** — nově přidána do `prototyp-mvp.md`;
  doladit a ověřit soulad s design dokumentem.

## „Vyřešíme později" sliby

- Podplácení poldy důkazy z runu (nápad do v2).
- Lajky a statistiky karet (v2).

## Až vznikne kódový repozitář (plugin / tooling)

- Zvážit **zabalení týmu agentů + skillu `consistency-check` do pluginu**, ať se
  sdílí mezi tímto design repem a kódovým repem (GitHub repo může být i zdroj
  marketplace). Až se agenti ustálí — teď je předčasné.
- Nainstalovat tam plugin **Superpowers** (oficiální marketplace) pro inženýrskou
  disciplínu (clarify→design→plan→code→verify, TDD). Dělba: Superpowers vlastní
  *inženýrskou* disciplínu, naši agenti *herně-designovou* — ne dvě metodiky na
  jeden úkol.
- Do tohoto design repa Superpowers **NEinstalovat** (kód-skilly by ležely ladem
  a překrývaly by naši disciplínu).
- **frontend-design** — použít v kódovém repu při stavbě UI prototypu (obrazovka
  psacího stroje, pohled na stůl); nakrmit ho estetikou z design dokumentu
  (Papers Please, sépiová 16barevná paleta), ať nevznikne generický vzhled.
- **security-guidance** — reálná hodnota v kódovém repu (API klíče, Supabase/SQL,
  edge funkce, vrstva LLM volání, obrana proti prompt injection u UGC); tam mu
  přidat `claude-security-guidance.md`. V tomto design repu jen prohlíží markdown
  za cenu LLM volání → zvážit vypnutí (`ENABLE_CODE_SECURITY_REVIEW=0`) zde.
- **skill-creator** je fázově neutrální, on-demand (vznikl jím `consistency-check`).
