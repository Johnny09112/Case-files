---
name: pending-human-hypotheses
description: Co simulace neprokáže — hypotézy čekající na lidskou bránu (solo/remote/async)
metadata:
  type: project
---

# Hypotézy čekající na lidskou bránu

**Why:** tvrdý strop poctivosti — simulace ověřila matematiku a tempo, ne zábavu.
Tyto věci nesmí být prohlášeny za prokázané dřív, než na ně sáhnou lidé.

**How to apply:** až poběží prototyp, tohle jsou primární otázky pro solo hot-seat
designéra a remote/async sezení. Každou spáruj se signálem z šablony playtestu.

- Hádají se hráči o karty aspoň u poloviny uzlů? (sim: rozhodnutí JE reálné jen když
  tajný cíl táhne proti optimu — ale jestli to vyvolá diskusi, neví.)
- Čte se protokol nahlas se smíchem? (mimo sim úplně — riziko #1 projektu, český humor.)
- Dá si skupina dobrovolně další run?
- Vyvolá reveal tajných cílů reakci? (sim umí obodovat splnění, ne emoci z odhalení.)
- Převyprávějí hráči konkrétní momenty? (nejsilnější signál historek — nezměřitelné simem.)
- Je „tři měřidla" (zranění/bedny/Žár) na hraně kognitivní zátěže u živého stolu?
  (design §8 otázka; sim to necítí.)
- Baví i to, jaká je obtížnost po nápravě čísel? (1. běh: skoro vždy vyhraje; 2. běh:
  skoro vždy prohraje. Je tření ze snowballu/Žáru „napínavé" nebo jen „hluk"? — jen lidi.)
- **Je „zbitý, ale doručil" napínavé, nebo jen frustrující?** I po D10 (3. běh) drží
  simulace kolaps **~95,7 % runů** (cíle 4p) a ~6 hráčo-uzlů stráveného vyřazení (~20 %
  hráčo-uzlo-času leží někdo v autě). Win-rate je přitom zdravá (55–65 %) → kolaps je
  DEFAULT zážitek, ne edge-case. Sim neví, jestli je to zamýšlený dramatický sníh nebo
  trest. Ptát se po 1. sezení: frustrovalo vyřazení, nebo krmilo historky? (Váže se na
  cíl „samou-modřinu" a mechaniku hlasu z auta.)
- **Kanárek frajer-v-klidu:** cíl byl při injury metrice mechanicky skoro nemožný (1,8 %).
  D11 (páka H) ho **přerámoval na `kolaps == false a doruceno`** → 4. běh 34,0 %, v pásmu.
  ALE původní nález platí dál jako otázka na lidi: **zranění jsou při 4p skoro univerzální**
  (per-postava kolaps ~70 %, run-kolaps 96,3 %). Přerámování cíl zachránilo mechanicky,
  neodpovědělo ale, jestli je hra, kde se každý nutně zřídí, čitelná jako drsná komedie,
  nebo jako nefér. (Souvisí přímo s kolapsem výše — stejný kořen.)

## Nové z kalibrace-4 baseline (2026-07-27, viz [[kalibrace-4-baseline]])

- **Gamble s nízkou EV, brán ve ~40 % uzlů (est=2).** Sim: zlepšení stropu Δmax jen
  0,07; realizované pásmo > pre-strop jen ~14 %. Bot ho bere jako rutinní hedge. →
  Je „líznout záchranu" napínavý moment, nebo nudná daň, kterou hráči jen odklikávají?
  Kdyby to lidi hráli jako otravný rerol, gamble potřebuje cenu (design), ne strop.
- **Konfrontace = klimax, přežití 64–80 % (1p Malone nejtěžší 64 %, 4p Brody 80 %).**
  Sim: reach ~95 %, přežití ploché. → Cítí se finále NAPÍNAVĚ (sázka existuje), nebo
  je 80 % přežití antiklimatické u 4p? Sólo (64 %) je nejtěžší — je to zamýšlené?
- **95–98 % proher padne VE finále, jen 2–5 % dřív.** Sim to čte jako zdravý dramatický
  oblouk (hra se rozhoduje na klimaxu, ne atricí). → Ale cítí se prohra po skoro celém
  runu jako DRAMA, nebo jako „nadarmo jsem hrál celý run"? (Váže se na kolaps-frustraci
  výše — stejná otázka „drsná komedie vs. nefér".)

## Nové z kalibrace-5 (2026-07-27, viz [[kalibrace-5-sweep-prahoffset]])

- **Kandidát A1 `{0,5,6,6}` mění týmovému runu STRUKTURU, ne jen obtížnost:**
  léčka předběhne zátah (pozice 2,6 vs. 3,9), konfrontace je u 3–4p prakticky
  jistá (99,7 %) a **82 % týmových runů má dvě a víc konfrontací** (baseline 28 %);
  přes polovinu uzlů runu je finálový typ. → Čte se to jako **eskalace štvanice**
  („čtyři lidi v autě = od začátku se po vás jde"), nebo jako opakování a šeď?
  Simulace vidí jen, že je to těžší.
- **Je rozdíl K2 driftu 1,28 vs. 1,39 u stolu vůbec rozeznatelný?** Míra PRŮŠVIHŮ
  16,3 % (rané uzly) → 20,9 % (pozdní). Cítí hráč „utahuje se to", nebo jen
  „občas to nevyjde"? Na tomhle stojí, jestli se smí K2 obětovat za K1.
- **Nerozbije obrácené pořadí léčka → zátah vyprávění?**
- **Po A1 citelně klesne splnění cílů** (čistá-ruka 41,8 → 22,6 %, hazardér
  72,5 → 53,7 %). Je to správně (těžší hra), nebo se cíle stanou nedosažitelnými?
  Sim to nerozsoudí — neví, jaká míra splnění je zábavná.

## Nové z kola `mozek-operace` (2026-07-28, viz [[mozek-operace-kontrafaktual]])

- **Vznikne o jediný skrytý slot v uzlu skutečně spor?** Sim doložila, že bot
  s cílem `schovana-bouchacka` tam zbraň dá (+8 až +11 b. proti botu bez biasu),
  a že ~78 % splnění ve 4p přijde zadarmo z týmově optimálního přiřazení.
  Neví ale, jestli se o to dva lidi pohádají — a jestli má cíl dost tření,
  když ho tým často splní sám od sebe.
- **Udělá reveal „já měl schovanou bouchačku" na konci runu něco?** Sim umí
  obodovat splnění, ne reakci.
- **Pochopí hráč, PROČ cíl splnil?** (metrika 6, čitelnost) — cíl se váže na
  přiřazení, ne na výsledek slotu; vysvětlující vrstva to musí unést.
- **Je „nová osa hádky" (odbočit do motelu vs. hnát náklad dál) dobrá?**
  Kandidáti B/C byli odmítnuti kvůli exaktní týmovosti (divergence 0,00 %),
  NE proto, že by ta osa byla špatná. Kdyby lidi po ekonomické ose volali,
  potřebuje **per-hráč atribuci `kredity_utracene_za`**, ne jiný cíl.
- **Je `muj-den` (96–99 % pro 1p–3p) u stolu vnímán jako mrtvý bod zdarma?**
  Breach K9 je prokázán; jestli to hráče ruší, ne. (Návrh nápravy proměřen —
  viz níže.)

## Nové z kola `muj-den` → podíl (2026-07-28, viz [[muj-den-kontrafaktual]])

- **Pochopí a uřídí hráč PODÍL?** Cíl „ať projde půlka tvých věcí" je řiditelný,
  jen když hra během runu ukazuje průběžné „prošlo X / propadlo Y" — dnes se cíl
  zobrazuje jen na startu. Bez toho je to metrika 6 (čitelnost) v přímém ohrožení.
  **Předpoklad zapečení, ne příslušenství.**
- **Je „cíl živý v 85 % uzlů" zajímavější rozhodování, nebo jen delší uzly?**
  Sim: živost vzroste z 21,7–57,5 % na 80–89 % uzlů držitele, ale skutečný konflikt
  s týmovým optimem jen z 1,8–9,1 % na 7,6–19,6 %. Kolik z toho je hádka, neví.
  **Tohle je jediný důvod, proč doporučení končí eskalací na uživatele.**
- **Udělá reveal „byl to můj den" při ~61 % úspěšnosti něco?** Čísla o revealu
  neříkají nic.
- **Je sólo hráč ochoten přijmout, že je pro něj cíl nejtěžší?** Podíl obrací
  obtížnost: 1p 43,8 % vs. 4p 67,2 %. Sim neví, jestli to sólista pocítí jako
  nefér, nebo to vůbec nepozná (nemá s čím srovnávat).

Otevřené číselné páky, které se po lidské zpětné vazbě můžou hnout, jsou v
[[sim-gate-findings]].
