---
name: telegraf-invariant-nalezy
description: Co jsem vytkl telegrafovému invariantu (v1, v2, obsahové kolo D48) a jak to designér/uživatel vyřídil — abych se neopakoval
metadata:
  type: project
---

Telegrafový invariant (`technika/telegraf-invariant-navrh-2026-07-29.md`) prošel
třemi mými koly. Stav nálezů:

**v1 (§8) — 6 blokujících, vyřízeno v v2:**
- K-1 mechanický řádek už v UI je → uživatel rozhodl D47: řádek nativně skrytý,
  D48: viditelný na prvním uzlu prvního runu. **Uzavřeno, neotvírat.**
- K-2 teze „lepší telegraf zavírá K6a" byla obrácená → teze **vyškrtnuta**.
  Přepis je věc fikce a metriky 6, ne balanční lék. Neargumentovat znovu.
- K-3 K4d přeměřeno PM: rezerva u 1p je 18,6 b., ne 0,4. Simulační brána
  na prózu nestačí a **není potřeba** — měřidlo je výhradně lidské.
- V-6 zakrývací zkouška degradována na neleakující formát se srovnávacím
  ramenem proti staré sadě. Problém „projekt nemá čtenáře" **nevyřešen**.
- V-7 délka: navrhoval jsem strop 350; uživatel D48 posunul na **400** (cíl 350,
  rozpočet 670 zn./uzel). Předběžné do stopek na dalším sezení.
- V-8 křížová kontrola s `text` a sloty **vyňaty z rozsahu** obsahového kola.
- V-10 kanál 7 (`rusi`) doplněn, verdikt zbraně přepsán na toleranci → V-10 padl.
- D-13 pevná forma přiznána a formálně rozvolněna.

**Obsahové kolo D48 (19 telegrafů, prověrka 2026-07-29), moje hlavní nálezy:**
- KRITICKÉ: sada nemá stabilní syntaktický markér hranice nároku — táž
  konstrukce „A a B" znamená napříč sadou jednou 1 slot, jednou 2 sloty,
  jednou KOMBI. Míří přímo na pravidlo (A) POKRYTÍ.
- Pravidlo (B) ČISTOTA drží u všech 19 (generátorovo tvrzení obstálo);
  hraniční jen `deputy-hlidka` („přijde řeč na") a `nadrazi-vypravci`
  („list, který nemáte").
- Rozpor v slotech (mimo rozsah kola, ale doložený): „strhnout vůz do
  postranní" = nastroj, „strhnout vůz do pole" = improvizace. Nenaučitelné.
- Dvě poslední věty jsou u 19/19 z uzavřené matice 5 znění (~30 % rozpočtu);
  zakrývací zkouška ten efekt únavy strukturálně nezměří.

Viz [[spoluprace-pm-fakta]].
