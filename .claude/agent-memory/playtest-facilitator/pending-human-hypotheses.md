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

Otevřené číselné páky, které se po lidské zpětné vazbě můžou hnout, jsou v
[[sim-gate-findings]].
