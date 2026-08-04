---
name: kalibrace-obsahu
description: Jádro řemesla obsahu po pivotu v3 — věci s 5 staty, komedie ze špatného slotu, supply/demand proti slotům, postihy, kotvy; plus varování, že moje vlastní definice role je v2-zastaralá
metadata:
  type: feedback
---

**NEJDŘÍV: moje definice agenta (popis role) je ZASTARALÁ — popisuje v2 model.**
Mluví o kartách s tagem (nasili/lest/uplatek/utek), síle 1–3, prokletých a zoufalých
kartách a cílech 32/8/4/14/8. **Tenhle model je od pivotu v3 (D14–D19, 2026-07-23)
mrtvý** i s celou v2 kalibrací (tagová textura, Lest-specifika, prokleté karty).
**Why:** kostkovou resoluci nahradila slotová (commit věcí naslepo do 4 mezer,
skryté prahy, postihy místo zranění). **How to apply:** kanon je vždy
`prototyp-mvp.md` v3 + `design-dokument.md` v3 + schémata v `obsah/*.yaml`; když
zadání zní v2 slovníkem, přelož si ho do v3 a řekni to nahlas, neplň ho doslova.

## Trvalé principy (přežily pivot)

1. **Flavor nesmí slibovat mechaniku, kterou pravidla neznají** (princip „viditelná
   pravidla"). **Why:** kritik to označil jako blokující (B3). **How to apply:**
   u každé položky ověř, že popsaný důsledek odpovídá tomu, co engine skutečně dělá.
2. **Obsah musí fungovat sólo a bez AI.** Sólo hráč committuje všechny 4 karty sám —
   každou podmínku testuj na 1p i 4p, jinak si nevšimneš, že v sólu je nesplnitelná
   nebo jednostranně vynutitelná (= skrytá sebe-sabotáž).

## Věci (v3 slotový model)

- **Komedie plyne z VĚCI VE ŠPATNÉM SLOTU**, ne z pointy. Navrhuj věci s 1–2 silnými
  staty a zbytkem mizerným → někam se špatná volba MUSÍ dát. Vlajkové vtipy:
  banánový kanón (vysoká improvizace, vypadá jako útok — past), zlaté hodinky (eso
  úplatku, jinde k ničemu), brokovnice GANGSTER (eso ve skryté roli, sebevražda
  ve viditelné roli NPC).
- **Supply/demand balancuj proti SLOTŮM, ne proti počtu věcí.** Neoversupplyuj jeden
  stat (hodnota 8/40 vs. demand 8/76 → trim na 6).
- **Mono-use specialisté** (jeden stat 5, zbytek ≤1) jsou v ruce 3 (4p) mrtvé karty →
  dej jim záložní stat 2, odůvodněný fikcí (hodinky improv „oslnit leskem", svazek
  bankovek obrana „zastaví kudlu").
- **Hlídej NON-GANGSTER útok supply** pro viditelné útok-sloty (zbraň tam auto-fail).
  Bez pár čistě-útočných non-gangster věcí jsou visible útok-sloty neřešitelné.
- **improvizace = univerzální flex** (nejvyšší demand i supply) — NEŘEŠIT obsahem,
  je to sim watchlist (K4b/K5 „když nevíš, hraj improv").

## Situace, postihy, pronásledovatelé

- **Efekty postihů STROJOVĚ (enum), ne prózou** — text postihu je komediální fikce,
  efekt je `{ druh: hide_staty | lock_stitek | ... }`. Ztrátové (`ruka_minus`,
  `ztrata_karty`) přiděluj střídmě kvůli malým rukám ve 4p.
- **Postih-pooly drž vyrovnané** (~5–6 výskytů na postih). Nenech 2 generické
  dominovat 9×, ani 1 těžký v 10 poolech. Těžké tematizuj: lock-GANGSTER postih
  patří na násilné/gun-relevantní uzly, ne na úředníka.
- **Kotva variety:** nedávej 78 % kotva3 — obtížnost se slévá a ±1 šum přebije volbu.
  Míchej 2–4 (cíl ~25 % kotva2, ~5 % kotva4).
- **Pronásledovatel musí KOUSAT:** rušení statu/štítku, který se v jeho uzlech ani
  finále nevyskytuje, je no-op. Řeš run-wide rozsahem (D20a) nebo ruš
  fight-relevantní stat.
- **FIKCE PRAVIDLA MUSÍ UNÉST ROZSAH, KTERÝ JÍ DALA MECHANIKA** (nález 2p sezení
  2026-08-02, opraveno D57 / 2026-08-03). Doložený případ: Maloneovo `pravidlo`
  slibovalo „úplatky neplatí", ale engine nuluje hodnotu i u mýta, platby farmáři
  za vytažení vozu a peněz konkurenčnímu gangu. Hráč to u stolu četl jako **rozbité
  role** („texty vybízejí k úplatku, který je zakázaný"), ačkoli vada byla v jediné
  větě pravidla. **How to apply:** když si stěžují na obsah kolem run-wide efektu,
  nejdřív ověř, jestli fikce efektu pokrývá VŠECHNY sloty, na které dopadá —
  přejmenovávat role je nejdražší a nejmíň účinný lék. Osvědčená stavba pravidla:
  napřed **fikční důvod efektu**, teprve pak rozsah dopadu.
- **Textová errata jdou ZA každou engine změnou, která hne rozsahem efektu.**
  Malone se opravoval dvakrát v šesti dnech: D57 rozšířil fikci na celý rozsah,
  **D58 (2026-08-04, V2-A′)** rozsah samotný zúžil — statové rušení se aktivuje až
  prvním překročením **prahu Zátahu** a pak platí do konce runu (jednosměrně, pokles
  Žáru ho nevrací). **Why:** `pravidlo` je to, podle čeho hráč plánuje tah, takže
  nepřesnost tu není kosmetika. **How to apply:** (1) terminologii ber z enginu
  a `prototyp-mvp.md` (`práh Zátahu`, ne opis), ne z vlastní parafráze zadání;
  (2) **zkontroluj i HLAVIČKOVÝ komentář souboru** — schéma popisuje rozsah taky
  (`rusi` = run-wide od startu) a po změně jedné položky si s ní začne odporovat.
  Výjimky patří k popisu pole, ne do položky. Dělba dál platí: vtip do `flavor`,
  mechanismus do `pravidla`.
- **`pravidlo` a `flavor` pronásledovatele engine NIKDY nečte** (bere jen
  `rusi: {typ, cil}`), takže jejich oprava je **simulačně invariantní errata, ne
  redesign** — i pod zámkem typu D25e. Tenhle argument prošel až k rozhodnutí
  (D57 zapsalo „K1–K9 se nemění"), takže ho u textových vad run-wide efektů používej
  rovnou. Dělba: vtip patří do `flavor` (renderuje se na briefingu), mechanismus
  do `pravidla`. Mechanismus ve `flavor` zabije pointu — kritik to v kole 2026-08-02
  zamítl a designér zámek na `flavor` potvrdil i v zadání errata.
## `text` VĚCI JE VSTUP PROMPTU, ne jen flavor (dávka 40 karet, 2026-08-04)

Humor-testér z review kandidátní dávky odvodil vlastní třídu vad (§K jeho
taxonomie) — **text karty jde do modelu doslova**, takže se jeho vady propíšou do
protokolu, aniž porušily jediné pravidlo promptu. Šest testů, kterými každý nový
`text` proženu DŘÍV, než ho dám designérovi:
1. **Nepojmenovávej vlastní komiku.** „Budí spíš smích než respekt“, „zblízka
   trapas“ = verdikt nad obrazem uvnitř karty; kanonická sada to nedělá ani jednou.
   Škrtni druhou půlku věty a ptej se, jestli obraz stojí sám.
2. **Žádný meta-komentář o zápise** („v zápise se popisuje jen těžko“) — je to návod
   na pokrčení rameny vyšetřovatele, které se jinde počítá jako vada.
3. **Přečti text, jako by ten slot SELHAL. Co pak lže, je vada karty.** Kvalitativní
   nárok model unese, **kvantifikovaný si vyrenderuje jako číslo** („do pěti mil“,
   „zabere dvě místa“); nejhorší je nárok na hodnotu, kterou hra sleduje (Žár, bedny).
4. **Předmět, ne herec.** Živé zvíře/osoba v balíku má vlastní vůli → model dopoví
   repliku, jméno a důsledek. (Papoušek padl; vycpaný jezevec projde.)
5. **Nejhorší abstraktum je TĚLESNÝ STAV.** `položka „Slzy na povel“` projde (výkon
   lze podat), `položka „Hluchota po dědovi“` ne. Abstraktní karty ber jako kvótu
   (kanon 3/40 ≈ 7,5 %) a měř je slovesem „použil / předložil“, ne vtipností.
6. **Duplicita se měří na RÁMU a na RUCE.** Tříčlenný stupňovaný výčet („semele maso,
   drát i důkazy“) mi vyjel v 5–6 z 9 nástrojových karet, kanon ho má 4×. Metrika,
   která bolí, je „kolik jich hráč uvidí v jedné ruce (8 karet)“, ne podíl v souboru.
   Druhá osa je **shluk zdroje** — 6 karet z lázní/léčebny, které na trase
   Buffalo → NYC nejsou. To není vada textu, ale zdroje, a je moje.

**Dobové reálie unesou absurditu líp než vymyšlený nesmysl** (ověřeno webem v téže
dávce): hroznová cihla s výstrahou „nenechat kvasit“, recept na léčivou whisky,
mešní víno s farní pečitou výjimkou, kravské boty s dřevěnými kopyty, dutá hůl-placatka,
hadice z pivovaru na slabé pivo. Absurdita je doložitelná, takže obstojí i v úředním
zápise — a designér tenhle směr žádal po 2p sezení („málo karet, opakují se“).

- **Nikdy neuč hráče, KAM věc patří — jen kde propadne.** „Ve skryté roli je zbraň
  eso" je nepravda v 9 z 19 situací (skrytý slot klíčuje na útok jen v 10). Pravdivé
  je „ve skryté roli se štítek neřeší, rozhoduje stat té role".

Telegrafy mají vlastní tvrdý QA invariant → [[telegraf-invariant]].
Procesní pravidla dávek (fikce vs. číslo, patičky, měření) → [[proces-obsahove-davky]].
