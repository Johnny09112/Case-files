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
| Ověřit konzistenci designu po přidání mechaniky Žár | game-designer / consistency-check | **kontrola hotová 2026-07-22** — 4 nálezy + návrh „Žár per uzel"; **čeká schválení uživatelem** |
| Zapracovat schválené změny (Žár per uzel, prahy vs. afinity, prokleté od 2. zranění, sémantika Zátahu, čísla jen v prototypu) | game-designer | blokováno schválením uživatele |
| Rozšířit schéma `obsah/cile.yaml` o mechanicky ověřitelné cíle (pro simulátor) | content-generator + technical-developer | návrh — čeká schválení (změna schématu) |
| Naplnit sady obsahu (32 zákl. / 8 prokl. / 4 zoufalé karty, 14 uzlů, 8 cílů, ~20 fallback) | content-generator | čeká — **další na řadě po schválení Žáru** (kritická cesta k simulaci) |
| Vyladit prompt protokolu + založit regresní baterii | protocol-humor-tester | čeká (mimo kritickou cestu stavby, běží paralelně) |
| Simulace runů pro balanc (prahy, snowball, bedny) | playtest-facilitator | čeká na obsah + schválená pravidla |

## Otevřené otázky (čekají na uživatele)

- **D1 — Žár per hod vs. per uzel (doporučení: per uzel).** Návrh: základní +1 za
  selhání se počítá max 1× za uzel (aspoň jedno selhání v uzlu = +1); hlučné karty
  +1 za kartu a výsledkové +2 beze změny; tvrdost `zar` (+2) zůstává per selhání.
  Důvod: per hod škáluje tempo Žáru s počtem hráčů (solo max +1/uzel, 4 hráči až
  +4/uzel) — u 4 hráčů by práh 10 padal téměř každý run; per uzel dává práh 4
  ~3.–4. uzel dle cíle a tempo nezávisí na počtu hráčů.
- **D2 — Nálezy konzistence** (kontrola 2026-07-22, čeká rozhodnutí):
  1. `design-dokument.md` §4.2 „proti prahu uzlu" vs. globální prahy 8+/5–7/≤4
     v `prototyp-mvp.md` (obtížnost dělají afinity+tvrdost) → sjednotit na globální.
  2. Prokleté karty: design §4.4 implikuje od 1. zranění, prototyp říká od 2. →
     potvrdit „od 2." a zpřesnit design.
  3. Zátah při Žáru 4: design „jedna ze dvou cest JE Zátah" (nahrazuje) vs.
     prototyp „přibude" (přidává) → doporučení: nahrazuje (jinak ho hráči prostě
     ignorují); důležité i pro simulátor (`route_offered`).
  4. Design dokument duplikuje čísla Žáru (+1/+1/+2, prahy 4/7/10), ač jeho §8
     říká, že čísla žijí v prototypu → čísla z §4.5 nahradit odkazem.
- **D3 — Schéma tajných cílů:** `overeni` je volná próza — simulátor je neumí
  bodovat (architektura §3 s tím počítá). Návrh: rozlišit cíle mechanicky
  ověřitelné (z event logu: „3× zraněn") a textové (jen lidská brána), textové ze
  simulačních metrik vyřadit s poznámkou v reportu. Vyžaduje úpravu schématu YAML.
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
