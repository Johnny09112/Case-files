---
name: v3-audit
description: Které nálezy jsem vznesl v auditu navrh-v3.md (2026-07-23) — ať se příště neopakuji; sleduj, jak designér rozhodl
metadata:
  type: project
---

Audit `projekt/navrh-v3.md` (slotová resoluce) proveden 2026-07-23 pro PM. Verdikt: **vrátit k dopracování**, ne blokovat pivot.

Vznesené blokující nálezy (sleduj rozhodnutí v `projekt/rozhodnuti.md`):
- **B1** — MVP řez §15 neobsahuje vysvětlující vrstvu pravidel; playtest 2026-07-22 (jediná lidská data) padl přesně na neviditelnosti systému.
- **B2** — ruce 6/4/3/3: 4p má horší commit-info než solo (1 ze 3 naslepo vs 4 ze 6 + volné přiřazení) → hra může být tím těžší, čím víc hráčů (invertuje co-op); „hádka" tenká na obou koncích (1p žádná, 4p jen permutace 4 karet/4 slotů).
- **B3** — „složená = free cleanse": 3. postih smaže VŠE → dominuje placenému léčení (H=6), podkopává kreditovou smyčku.
- **B4** — GANGSTER štítek gotcha, pokud viditelnost role slotu není mechanicky označena před přiřazením.

Odpovědi na 2 otázky designera: (3a) tajné cíle **ODLOŽIT z MVP** (pevné doporučení). (3b) Žár bez čísla **funguje jako pozice na značené trati**, ALE jen když je delta čitelná — jinak reprodukuje playtest nález „proč rostl Žár 2×".

Klíčová aritmetická díra: „skvělý run ≈ 12 kreditů" je nedosažitelný (max ~10: truhla ≤5 + 5× loot bonus).

D15 provedeno věrně až na jednu odchylku: „výjimky u speciálních slotů" přesunuty ze SLOTU na KARTU (štítky) — slot-side výjimky (multi-stat práh) fakticky vypadly.

**Ověřovací kolo 2026-07-23 (revidovaný navrh-v3 po D16).** Všech 8 B/D nálezů UZAVŘENO nebo ČÁSTEČNĚ:
- UZAVŘENO: B1 (§5.4 first-class), B3 (složení maže jen lehké, edge 2L+1T drží, žádná kreditová arbitráž), B4 (ikony 👁/🕳 + telegraf), D1, D3, D4, D7, motel-dostupnost (§7 větvová odbočka).
- ČÁSTEČNĚ: D16-aritmetika/medián — příklad „1× léčení + rezerva na směnu" neplatí na spodku mediánu (7−6=1 < směna 3); ≥2 rozhodnutí drží jen přes 2× směnu. Drobná oprava §7.
- NOVÝ prvek **poolový commit** (§4.3, nebyl v 1. auditu): 3 DŮLEŽITÉ nálezy — (1) pool 8→4 u 4p hrozí trivializací (horní horn B2), strukturální podlaha poolu = 8, úzké sladké místo; (2) pasažér u 4p (hráč může mít 0 zahraných karet, „rotace spotlightu" = naděje ne mechanika); (3) commit beznákladový (nepoužité se vrací) → „sázka naslepo" mechanicky prázdná, pitch přeprodává — sim to NEchytne. Anti-QB u poolu 8 se opírá o tajné cíle, ne o owner-consent.
- Verdikt pro PM: **připraveno po dořešení** — NEfreezovat pool čísla do kanonu před sim bránou; rozhodnout „je commit sázka?"; opravit medián-příklad §7. Riziko trivializace/pasažér = sim priorita 0.

**Audit obsahových schémat v3 + v3 gate-kritéria (2026-07-23, pro PM, NIC neupraveno).** Vznesené nálezy:
- BLOK-1 **telegraf bez strojových metadat** — boti facilitátora čtou telegraf jako „zašuměný signál kotev p~0,7", ale situace-schéma má telegraf JEN prózou. Commit-bot je bez toho neimplementovatelný → sim nespustí commit fázi. Doporučení: telegraf_signal {trend:[staty], proti_srsti:n, zbran_projde:bool} **DERIVOVAT enginem ze slotů** (ne autorovat zvlášť → drift), próza = lidský rendering téhož, fidelita = 1 sim knob.
- BLOK-2 **nikdo nevlastní v3 event-log spec** — facilitátorovy log-fieldy, schéma blok 8 (arch §2.2 je v2), a v3 cíle (podminka) tři nezávisle předpokládají jednu spec, žádná ji nedefinuje.
- BLOK-3 **náklad-vs-Žár fail-condition** (open) blokuje: ztrata_naklad enum, run_end příčinu, run-1 diagnostiku bedny-0/konfrontace.
- BLOK-4 **draw/deck model v3 nespecifikován**; BLOK-5 **mista.yaml (truhla/motel) nenavrženo**; BLOK-6 **kombinace [a,b] sémantika nepinnutá**.

**Cílená prověrka OBSAHU v3 (2026-07-23, commit 8ee3a53, pro PM, NIC neupraveno).** Supply/demand tabulace 40 věcí × 76 slotů:
- **BLOKUJÍCÍ: Malone (null hodnota) je mechanicky INERTNÍ.** Jeho léčka i konfrontace mají 0 hodnota-slotů (improv/obrana/nastroj/utok). „Hodnota=0" tedy neovlivní ŽÁDNÝ slot → signature dělá doslova nic. Navíc hodnota je JEDINÝ stat, který se NIKDY nevyskytuje v konfrontaci/skrytém fight slotu → i „oslabení finále" selhává; Malone ubírá nejnepodstatnější stat. Brody (+2 Žár GANGSTER) má naopak zuby v léčce (GANGSTER je fight-relevantní). Asymetrie: jeden ze dvou chaserů je no-op. → designerská otázka: Malone run-wide (8 bribe slotů čte 0) NEBO ať ruší fight-relevantní stat.
- **BLOKUJÍCÍ (engine spec): GANGSTER rule nepokrývá typ zatah/lecka/konfrontace strojově.** stitky.yaml má jen npc-fail + lokace-ok + skrytá-ok. Chování pro zatah (telegraf tvrdí „zbraň na očích přiostří" = jako lokace), lecka (komentář: „jako npc") a konfrontace (komentář: „neplatí") žije jen v próze/komentářích, ne v machine polích → engine nederivuje deterministicky.
- **DŮLEŽITÉ: hodnota oversupply.** 8 dominantních hodnota věcí (20 % balíku) vs demand 8/76 slotů (11 %); extrémní specialisté (hodinky/prsten/bankovek h5, ostatní staty ≤1) jsou mono-use → v ruce 3 (4p) hrozí 1–2 podmíněně mrtvé karty. Trim 8→6 nebo dát specialistům fallback stat.
- **DŮLEŽITÉ: improv je univerzální flex.** demand 24 % (nejvyšší) I supply nejvyšší (improv≥3 = 13 karet; improv≥2 = 24 karet = 60 % balíku, sink sekundární stat). Riziko „když nevíš, hraj improv" = nudně dominantní strategie (K4b/K5).
- **DŮLEŽITÉ: postih pooly nevyvážené.** lehké: drobna-pokuta 9 poolů, narazene-rameno 9, vs nervy-v-hajzlu 2, vysypana-bedna 3 (~4,5× rozdíl → monotónní zážitek, dva nejgeneričtější dominují). těžké: zlomene-zebro 10/19 poolů (a je to ruka_minus1 do_vyleceni → drtí 4p hand-3, reprodukuje B2), ochrnuta-ruka jen 2/19. Všech 14 dosažitelných, všech 10 enum druhů pokryto.
- **DŮLEŽITÉ: telegraf fidelita nevyrovnaná.** Namátkou 5: žádný neprozrazuje prahy, hidden-count a zbraň-rule sedí. ALE trend často jmenuje 2 témata pro 3 viditelné staty (farmar-brod tají nástroj, rival-prepad tají improv, malone-lecka tají nástroj), zatímco mesto-ulicka vyjmenuje všechny 4 → nerovná informační věrnost confounduje sim fidelity knob (BLOK-1).
- KOSMETICKÉ: 78 % slotů je kotva3 (15× kotva2, 2× kotva4) → plochá, samey obtížnost, ±1 šum dominuje nad volbou karty mimo specialisty; ochrnuta-ruka tematicky divná z mýtného/úředníka; konfrontace kotva4 útok se opírá o weapon supply 5/40 → swingy finále.
- POTVRZENO OK: combi [a,b]=„jedna věc, oba staty ≥ kotva" pinnuto (řeší staré BLOK-6), 9 dual-karet plní 2 combi sloty; filler ≤6 jen ~3 věci (7,5 %); enum coverage 10/10; počty sedí (40/14/2/15/2+2).
