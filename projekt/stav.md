# Stav projektu

*Živý dokument. Udržuje `project-manager` — aktualizuj po každém větším kroku.
Poslední aktualizace: 2026-07-24.*

## Aktuální fáze

**v3 kalibrace (2026-07-24).** v2 simulační brána splněna 2026-07-22 a uzavřena
pivotem v3 (D14–D20); v3 engine přestavěn v kódovém repu, diagnostický run-1
(1000×2) proměřen — K1/K6a/K8/co-op inverze prošly, K5/K7/K2 padly (+ hraniční
K4c). **Kalibrace-1 zapracována v design repu (D22):** 45-slot kotva-patch
zapečen + kořenový lék K5/K7/K2 v obsahu. **Míč je u enginu:** reset proxy,
šum, čisté re-měření dle akceptační brány (viz backlog). Lidská brána otevřená.

## Backlog

| Úkol | Vlastník (agent) | Stav |
|---|---|---|
| Technická architektura + plán prototypu (Vite + vanilla JS, psací stroj) | technical-developer | **hotovo** — [[../technika/architektura|technika/architektura.md]] (7 ADR) |
| Review architektury proti principům + adversariální kritika | project-manager (v zastoupení design-critica) | **hotovo 2026-07-22** — principy drží; 3 nálezy (bodování cílů v simulaci, stínová cache na hraně scope, odhad 2–4 týdny těsný) |
| Ověřit konzistenci designu po přidání mechaniky Žár | game-designer / consistency-check | **hotovo** — D1+D2 schváleny uživatelem 2026-07-22, re-check konzistence beze nálezu |
| Zapracovat schválené změny (Žár per uzel, prahy vs. afinity, prokleté od 2. zranění, sémantika Zátahu, čísla jen v prototypu) | game-designer | **hotovo 2026-07-22** — zapracováno a commitnuto (viz [[rozhodnuti]] D1, D2) |
| Rozšířit schéma `obsah/cile.yaml` o mechanicky ověřitelné cíle (pro simulátor) | content-generator + technical-developer | **hotovo 2026-07-22** — D3 schváleno, schéma rozšířeno (`overeni_typ`, `podminka`), 2 vzorové mechanické cíle |
| Naplnit sady obsahu (32 zákl. / 8 prokl. / 4 zoufalé karty, 14+1 uzlů, 8 cílů) | content-generator | **hotovo 2026-07-22** — zapsáno po review kolečku (kritik + humor-tester + game-designer) a schválení D4–D6 |
| Prompt protokolu v0.2 + regresní baterie `prompty/protokol-testy.yaml` (4 case) | protocol-humor-tester | **hotovo 2026-07-22** — vč. nového pole „bedny ztracené tímto hodem" ve formátu vstupu |
| Simulace runů pro balanc (1. běh, 216k runů) | playtest-facilitator | **hotovo 2026-07-22** — brána **NEPROŠLA** (krit. 1: kompetentní hra 90–98 % DORUČENO), náprava jasná; report [[../technika/simulacni-brana-2026-07-22|technika/simulacni-brana-2026-07-22.md]] |
| Iterace čísel dle simulace (D7–D9: 5–7 = zranění, ruka 5, konfrontace → Žár 3, Zátah obě cesty, Útěk rider volba vlastníka, obetni-beranek ≤2, tvrdosti léčky/konfrontace) | project-manager | **hotovo 2026-07-22** — zapracováno, viz [[rozhodnuti]] |
| Přesimulovat (2. běh brány) | playtest-facilitator | **hotovo 2026-07-22** — NEPROŠLA (overcorrection D7: 18–25 % DORUČENO); kalibrační sweep → páka F |
| Zapracovat páku F (prahy 7+/5–6/≤4) + frajer ≤1 zranění (D10) | project-manager | **hotovo 2026-07-22** |
| Přesimulovat (3. běh brány) | playtest-facilitator | **hotovo 2026-07-22** — NEPROŠLA těsně: jádro OK (55/65 % v pásmu, snowball tvar OK), padaly jen cíle cisty-stit/frajer a marginálně tempo Žáru |
| Zapracovat páky G/H/Ž (D11: cisty-stit + doruceno, frajer → kolaps==false, práh Zátahu 4→5) | project-manager | **hotovo 2026-07-22** |
| Přesimulovat (4. běh brány) | playtest-facilitator | **hotovo 2026-07-22 — PROŠLA s výhradami**; brána vyhlášena za splněnou, viz [[rozhodnuti]] a report |
| Založit kódový repozitář | project-manager | **hotovo 2026-07-22** — `C:\Projekty\dukazni-material-prototyp`, submodule `content/`, CLAUDE.md s principy; remote `git@github.com:Johnny09112/dukazni-material-prototyp.git`, pushnuto |
| Prototyp fáze 1: engine + simulátor + testy | kódový repo | **hotovo 2026-07-22** — 95 testů, golden runy, invarianty; první měření odhalilo díru spec. zoufalých → D12 |
| D12: přístup k zoufalým kartám (loot-injury, návrh uživatele) + D13: postavy a fallback šablony | project-manager + agenti | **hotovo 2026-07-22** — viz [[rozhodnuti]]; engine překlápí default, šablony dostávají schválený patch apozice |
| Prototyp fáze 2: hot-seat UI (psací stroj, „Jsem X" cíle, fallbacky jako primární obsah) | kódový repo | **hotovo 2026-07-22** — 127 testů, celý run klikatelný, ověřeno stavitelem i PM v prohlížeči (`npm run dev`); sépiový úřední vzhled, rozpis hodů, export logu JSONL |
| **Fáze 2.1: vysvětlující vrstva pravidel v UI** — nápověda/průvodce, „proč se to stalo" anotace (vynucená karta, zákaz tagu, rider volba, prahy Žáru, postih za zranění) | kódový repo | **nález 1. lidského sezení 2026-07-22** ([[../playtesty/2026-07-22|playtest]]): systém funguje, ale je pro hráče neviditelný — hráč-autor mu nerozuměl |
| Prototyp fáze 3: LLM adaptér (provider NEROZHODNUT — otevřená otázka) | kódový repo | na řadě spolu s 2.1 — cache→provider→timeout→fallback dle ADR-004/007; fallback větev už stojí |
| První lidské sezení (lidská brána): solo/remote run přes `npm run dev`, vyhodnotit metriky + hypotézy (kolaps jako default, tři měřidla) | uživatel + playtest-facilitator | **odblokováno fází 2** — šablona playtestů připravena |
| Jemné doladění obtížnosti po loot-injury (exploit-bot ~74–76 % vs. pásmo 45–70; ladit tvrdosti/Žár, ne resoluční práh) | game-designer + playtest-facilitator | **nahrazeno kalibrací-1 v3** — viz řádek níže |
| **Kalibrace-1 v3: zapéct 45-slot kotva-patch + kořenový lék K5/K7/K2** (gamble vynucený ne zvolený, snowball plochý) | game-designer + content-generator | **hotovo 2026-07-24 (D22)** — patch zapečen (45 slotů +1, pásmo 2–4 drží); lék zapracován: 4 skryté obrana-kotvy 3→2 (dial), 2 telegraf-přepisy npc-pastí, 5 věcí +1 sekundární stat (obrana/nastroj, improvizace netknuta), info-heavy pooly pozdních událostí se stropem ≤7 (D20). Enginová část léku = řádek níže; 3 eskalace na uživatele (viz otevřené otázky) |
| **Pro engine — kalibrace-1 uzavření (signál = tento commit):** (1) reset `rules.kotvaBumpFrakce` 0.8→0; (2) rozšíření šumu pro K4c (model D15 kotva ± šum); (3) derivace telegraf_signal: pozitivně rozlišit „zbraň funguje ve skrytém slotu (stat=utok)" od „zbraň k ničemu" — druhá polovina léku K7 + párová podmínka telegraf-přepisů urednik-vaha/razitko (jinak próza/signál drift); (4) ověřit, že hide_* postih z uzlu N reálně degraduje commit uzlu N+1 (bez toho info-postihy nesnowbalují); (5) zvážit shlukování léček/zátahů/konfrontací do uzlů 3–4+ přes tempo Žáru (K2 cíl ≥1,3); (6) čisté re-měření 1000×2 (seedy 1–1000) dle akceptační brány, POVINNĚ: K1∈[45,70] ∧ K5 odděleně viditelná/skrytá ∧ K7≤20 % současně, per-situace take-rate před/po, K6a v rozpadu dle typu postihu (info-postihy vs. 1p/2p), pozor nadrazi-noc (2 skryté sloty, nejtvrdší offender; skrytých slotů je 20, ne 19) + doladění K8 | kódový repo (technical-developer) | **hotovo 2026-07-24 (kalibrace-2)** — body 1–4 zapracovány, 5 vědomě odloženo; re-měření 1000×2. **K4c OPRAVENO** (+2.4 ≤3). K5/K7 dál breach, K1/K5 coupling z D22(e) POTVRZEN (80 % neřešitelných slotů = viditelné); K1 3p/4p těsně >70, K6a regrese 11.8. Report [[../technika/kalibrace-2-2026-07-24|technika/kalibrace-2-2026-07-24.md]]; míč zpět u obsahu (řádek níže) |
| **Kalibrace-2 lék: snížit viditelné kotvy běžných uzlů** (npc/lokace kde 45-slot patch zvedl viditelný slot na 4 → zvážit zpět 3) | game-designer + content-generator | **otevřeno — z kalibrace-2 2026-07-24**: jeden tah srazí K1 do pásma *i* uleví K5/K7 (obtížnost ať drží konfrontace/Žár, ne viditelné prahy běžných uzlů); skryté sloty + balík (D22 b/c) NEMĚNIT. K2 metrika a K6a k rozhodnutí — viz [[../technika/kalibrace-2-2026-07-24|report]] + D22f |
| Setup kódového repa: nainstalovat pluginy Superpowers (inženýrská disciplína), frontend-design (až UI — nakrmit estetikou z design dokumentu), security-guidance | uživatel (claude CLI v kódovém repu) | dle backlogu níže — až bude repo na GitHubu |
| První měření instrumentovaného enginu: potvrdit win-rate (kompetentní ≤70 %) a hlídat obetni-beranek (94,8 % těsně pod stropem) | playtest-facilitator + technical-developer | **hotovo — run-1 (1000×2)**: K1 v pásmu (59.8–69.2 %), co-op inverze OK (4/4 ~4.8 %); report [[../technika/kalibrace-1-2026-07-24|technika/kalibrace-1-2026-07-24.md]] |
| Fallback šablony protokolu (~20) | content-generator + protocol-humor-tester | čeká (potřeba až pro prototyp, ne pro simulaci) |
| Revize pronásledovatelů (nález kritika „léčky tlačí k Lesti") | game-designer | **uzavřeno 2026-07-22 — beze změn**: Malone→Lest je záměrná protiváha nulovaného Úplatku, Brody otevírá jiné pruhy; výjimka „konfrontace Malonea bez +2" potvrzena jako záměr (komentář v YAML) |
| Pro engine (technical-developer): (a) formalizovat razítko DORUČENO — metrika `doruceno` na něm stojí; (b) strukturovaný vstup protokolu nese pole „bedny ztracené tímto hodem"; (c) ověřit proveditelnost „hlasu z auta" v hot-seat UI; (d) nové metriky cílů `ztracene_bedny_vlastni`, `max_sila_karty` v event logu | technical-developer | poznámky z 2026-07-22 |

## Otevřené otázky (čekají na uživatele)

- **Eskalace z D22 (kalibrace-1, 2026-07-24):** (1) ko-metrika K2 = drift míry
  PRŮŠVIHŮ uzel3–4 vs. uzel1–2 — přidat do znění brány K2 v `prototyp-mvp.md`?
  (zatím jen diagnostika v reportu enginu, gate ≥1,3× beze změny); (2) ratifikace
  posunu u obrana-skrytých slotů (z „odvoditelný z telegrafu" na „levný
  naslepo-slot + přeliv pokrytím"); (3) potvrzení pool-odchylky brody.lecka
  (prilis-na-rane místo prach-do-oci kvůli stropu ≤7).

- **D14 — Pivot resoluce na „slotový" systém (návrh uživatele 2026-07-22/23):**
  bez kostky; slova s 5 staty přiřazovaná do slotů situací se skrytými prahy
  (odhalovanými po vyhodnocení); AI vypráví, staty rozhodují. PM posudek: silný
  směr (input randomness místo output, komedie v mechanice, hádka u stolu), ale
  3 kolize s principy k vyřešení (AI statování → autorská pipeline s moderací;
  tvorba karet hráči → omezený skladač, ne volný text; skryté prahy → post-hoc
  odhalení). **Mikroprototypy k osahání** (otevřít přímo v prohlížeči):
  `dukazni-material-prototyp/experiments/mikroprototyp-sloty.html` (v1 —
  přiřazování 8 slov) a `…/mikroprototyp-sloty-v2.html` (v2 dle iterace
  uživatele: commit 1 věci ze 4 naslepo dle telegrafu → odhalení Mad Libs
  textu → týmové rozdělení rolí → volitelný slot za utracení druhé věci →
  pásma). PM doporučení k v2: věc se utrácí (loot doplňuje), pásma místo
  procent, text situací = autorský obsah (AI jen dramatizuje výsledek).
  **2026-07-23 rozšířeno o připomínky uživatele** (profily místo pevných jmen,
  multi-svět/DLC, 300+100 karet, gamble draw, komediální/informační postihy,
  mapa StS se společnými kredity) — PM + balanční posudek
  v [[../technika/balanc-posudek-v3-2026-07-23|technika/balanc-posudek-v3]];
  **TOP 3 rozhodnutí + learnabilita prahů UZAVŘENY 2026-07-23 jako D15**
  (commit naslepo / tým přiřazuje / 1 stat s výjimkami; taxonomie postihů
  70/30 s capem 2 + eskalace; prémiové = meta + specializace; prahy kotva ± šum).
  Vizuál/UX současného prototypu je jen testovací — finální UX se ladí
  dodatečně. **PIVOT DOKONÁN 2026-07-23** (kanon v3, D14–D19). **Hotovo
  k 2026-07-23 večer:** kritéria v3 brány K1–K9 zafixována v prototypu
  (Fáze 0), v3 event-log spec + ADR-008 v architektuře, kompletní obsah v3
  (40 věcí / 15 situací / 14 postihů / místa / štítky / pronásledovatelé;
  v2 archivován). **Hotovo navíc:** cile.yaml v3 (8 cílů nad spec
  metrikami), prompt protokolu v0.3 + v3 regresní baterie (top riziko:
  GANGSTER auto-fail s vysokým útokem svádí k zápisu úspěchu), prověrka
  obsahu kritikem + **D20a: Malone nuluje hodnotu RUN-WIDE** (rozhodnutí
  uživatele). **DESIGN REPO JE v3-KOMPLETNÍ (2026-07-23, D14–D20)** —
  opravy obsahu po prověrce hotové a commitnuté (Malone i Brody run-wide,
  GANGSTER strojová mapa v stitky.yaml, hodnota trim + záložní staty,
  pooly vyrovnané, kotvy 19/53/4, telegrafy na plném invariantu).
  **Další kroky (doporučeno: nová session nad kódovým repem):**
  (1) přestavba enginu na slotovou resoluci dle architektura §2.2 v3 +
  ADR-008 + obsah/*.yaml v3; (2) v3 simulátor + diagnostický run-1 →
  fixace K1 pásma → kalibrace dle pořadí Fáze 0; (3) fallback šablony
  přepsat na v3 pásma (fáze 2 UI); (4) konzultace operations-economics
  k promptu v0.3 (delší per-call vstup — rozpočet Haiku); (5) sim
  watchlist: improvizace jako univerzální flex, GANGSTER hustota,
  ruka_minus u 4p, player-count práh cíle muj-den.

*(D1–D9 schváleny a zapracovány 2026-07-22 — viz [[rozhodnuti]].)*

- Škálování obtížnosti počtem hráčů (páka 7) — odloženo, rozhodne se z dat
  2. běhu simulace / lidské brány.
- LLM poskytovatel nerozhodnut (drž volání abstrahované).
- Jazyková strategie CZ→EN (kdy zařadit překlad a test anglických protokolů).

## Provozní poznámky

- **2026-07-22: tým agentů nebyl v session dosažitelný** (SendMessage „not
  reachable") — role design-critica a game-designera odehrál project-manager
  v zastoupení, s přiznáním v syntéze. Při příští session ověřit dostupnost týmu.
- **2026-07-24: tým dosažitelný** — kalibrace-1 odehrána plným kolečkem
  game-designer → design-critic → content-generator (žádné zastoupení). PM nemá
  Bash — commit/push proveden v zastoupení přes general-purpose agenta.

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
