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
- BLOK-2 **nikdo nevlastní v3 event-log spec** — facilitátorovy log-fieldy, schéma blok 8 (arch §2.2 je v2), a v3 cíle (podminka) tři nezávisle předpokládají jednu spec, žádná ji nedefinuje. → technical-developer musí vydat v3 event-log spec (nahradí v2 §2.2) pokrývající gate-metriky + cíle + max_achievable_band.
- BLOK-3 **náklad-vs-Žár fail-condition** (open) blokuje: ztrata_naklad enum, run_end příčinu, run-1 diagnostiku bedny-0/konfrontace (facilitátor JI PŘEDPOKLÁDÁ), pásmove_vysledky naklad:-1. Nejvyšší páka.
- BLOK-4 **draw/deck model v3 nespecifikován** (sdílený balík 40? reshuffle? komu jde karta do ruky) → sim neumí naplnit ruce; navíc card-counting = neplánovaný skill vektor pro K4c.
- BLOK-5 **mista.yaml (truhla/motel) nenavrženo** → K8 ekonomika neměřitelná, kalibrace ekonomiky blokovaná.
- BLOK-6 **kombinace [a,b] sémantika nepinnutá** („oba≥kotva" specialista-trest vs „součet≥2×kotva" easy-OR) — mění obtížnost každého kombi-slotu; blokuje max_achievable_band (→K5) i autora obsahu.
- Škála kotev: **uniform ±1 na kotvě 1–2 je moc hrubý** (kotva1→práh 0 = auto-pass mrtvý slot; kotva2 = coin-flip), asymetrie boří learnabilitu → K4c může padnout kvůli šumu, ne designu. Zakázat práh 0 / anchor-relativní šum.
- postih enum: **hide_nazvy** = mrtvý tah (žádná volba) — challenge/cut; **lock_stat / lock_slot_viditelnost** nedefinované; **ruka_minus/ztrata_karty** drtí malé ruce (4p hand-3) → reprodukuje B2 co-op inverzi.
- pásmove_vysledky **per-situace = smell** — band→následek STRUKTURA musí být globál (čitelnost §4.6); per-situace jen loot-obsah + penalty-flavor-pool.
- **gamble „1/3" je vnitřně nekonzistentní** — po commitu zbývá v ruce 2 (1p,4p) nebo 3 (3p ne-držitel); draw-pravd. i EV se liší dle počtu hráčů → K7 měřit per-player-count.
- Odpovědi na 4 otázky facilitátora: (1) provizorní pásmo+diagnostika run1 = správně, ale ZAMKNOUT pásmo po run1 před kalibrací pák. (2) K5 tři vrstvy = držet jako DIAGNOSTIKU, gate jen na <5% doomed. (3) K6a gate, K6c gate (ale run-agregovaný passenger, ne per-situace), K6b jen diagnostika (měří autorování cílů, gameable). (4) K4c gate (testuje core promise), ale coupled s noise-modelem + memorizační bot potřebuje stabilní per-situace kotvy.
- GANGSTER strop 10–11 (silnější) + hustota GANGSTER v 40 kartách nedefinovaná → riziko dominantní „vždy commitni bouchačku" (K4b) když Žár čísla (unset) nebijou dost.
