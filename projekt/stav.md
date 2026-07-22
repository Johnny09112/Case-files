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
| Review architektury proti principům + adversariální kritika | project-manager (v zastoupení design-critica) | **hotovo 2026-07-22** — principy drží; 3 nálezy (bodování cílů v simulaci, stínová cache na hraně scope, odhad 2–4 týdny těsný) |
| Ověřit konzistenci designu po přidání mechaniky Žár | game-designer / consistency-check | **hotovo** — D1+D2 schváleny uživatelem 2026-07-22, re-check konzistence beze nálezu |
| Zapracovat schválené změny (Žár per uzel, prahy vs. afinity, prokleté od 2. zranění, sémantika Zátahu, čísla jen v prototypu) | game-designer | **hotovo 2026-07-22** — zapracováno a commitnuto (viz [[rozhodnuti]] D1, D2) |
| Rozšířit schéma `obsah/cile.yaml` o mechanicky ověřitelné cíle (pro simulátor) | content-generator + technical-developer | **hotovo 2026-07-22** — D3 schváleno, schéma rozšířeno (`overeni_typ`, `podminka`), 2 vzorové mechanické cíle |
| Naplnit sady obsahu (32 zákl. / 8 prokl. / 4 zoufalé karty, 14 uzlů, 8 cílů, ~20 fallback) | content-generator | **probíhá** — kritická cesta k simulaci; hotovo: pronásledovatelé 2/2, cíle 3/8 |
| Vyladit prompt protokolu + založit regresní baterii | protocol-humor-tester | čeká (mimo kritickou cestu stavby, běží paralelně) |
| Simulace runů pro balanc (prahy, snowball, bedny) | playtest-facilitator | čeká na obsah (pravidla schválena 2026-07-22) |
| Pro engine: formalizovat razítko DORUČENO (dojezd do NY) — metrika `doruceno` v `cile.yaml` na něm stojí | technical-developer | poznámka z kontroly konzistence 2026-07-22 |

## Otevřené otázky (čekají na uživatele)

*(D1–D3 schváleny a zapracovány 2026-07-22 — viz [[rozhodnuti]].)*

- LLM poskytovatel nerozhodnut (drž volání abstrahované).
- Jazyková strategie CZ→EN (kdy zařadit překlad a test anglických protokolů).

## Provozní poznámky

- **2026-07-22: tým agentů nebyl v session dosažitelný** (SendMessage „not
  reachable") — role design-critica a game-designera odehrál project-manager
  v zastoupení, s přiznáním v syntéze. Při příští session ověřit dostupnost týmu.
- Session bez přístupu ke git nástrojům — změny `projekt/*` čekají na commit
  (konvence „commitni a pushni sám" nešla naplnit).

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
