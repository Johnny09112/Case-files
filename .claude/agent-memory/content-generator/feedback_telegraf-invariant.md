---
name: telegraf-invariant
description: Telegraf se píše proti psanému QA invariantu (kanon v3 od D51, 2026-07-30) — kde znění bydlí, co v něm zestárlo a které autorské chyby v něm stojí nejvíc
metadata:
  type: feedback
---

**Telegraf nepíšu z citu — píšu ho proti psanému QA invariantu a proti signálu,
který engine DERIVUJE ze slotů.**

## Kde je kanon (ověř před každým kolem, znění se mění často)

- **v3 — ŠKRTACÍ KOLO, D51 (2026-07-30):** úplné znění v
  `technika/telegraf-skrtaci-kolo-2026-07-30.md` §2, určené ke vložení do hlavičky
  `obsah/situace.yaml`. Platí i pro `lecka`/`konfrontace` v `obsah/pronasledovatele.yaml`.
- **Pozor na zpoždění zapečení:** hlavička `obsah/situace.yaml` nese v2, dokud ji
  `game-designer` nepřepíše. Když se rozchází s návrhem, autoritativní je novější
  datované rozhodnutí v `projekt/rozhodnuti.md` — přečti si ho, nehádej.
- Sekce §2/§3/§4/§6 souboru `telegraf-invariant-navrh-2026-07-29.md` jsou **v1
  a nahrazené**; §10–§15 téhož souboru jsou **v2 a nahrazené v3**. Nikdy se jimi neřiď.
- **Derivovaný signál odvozuj ze SLOTŮ, ne z dnešního telegrafu** — pravidla
  v `prototyp/src/engine/resolve.js` (`deriveTelegrafSignal`), chování zbraně
  v `obsah/stitky.yaml` (`chovani_dle_typu`). Signál se NEautoruje, próza mu jen
  musí zůstat věrná. Zapečené telegrafy jsou právě to, co se opravuje.

## Historie znění (aby se nevzkřísilo, co je škrtnuté)

„zmiň VŠECHNY viditelné staty" (do D47) → v2 „(A) POKRYTÍ: každý viditelný slot
má nárok" (D47–D49) → **v3: POKRYTÍ ŠKRTNUTO.** Přežilo jádro: **nárok je sloveso,
ne kulisa** (úředník, který se dívá, obranu neobsazuje), **mlčení o skrytých
slotech** kromě `zbran_skryte`/`improv_skryte` (D47/R1), **zákaz meta-slovníku**
(jména statů ani synonyma „nářadí", „důvtip"), **telegraf neprozrazuje prahy**.

## Co léčí v3 (a co si z toho pamatovat i mimo telegrafy)

**Nemocí nebyla délka, ale POČET VĚCÍ, které si hráč drží v hlavě** před slepým
commitem — `farmar-brod` nesl na 351 znacích šest položek. Cíl v3: **3 položky
(u léček/konfrontací 4), ~320 znaků, strop 400** — kotva + předzvěst + verdikt
zbraně. **Why:** hráč po prvním dohraném runu (playtest 2026-07-29) sám řekl, že
text SMÍ být delší, jen musí nést méně věcí. **How to apply:** uvolněné místo jde
do OBRAZU, nikdy do úspory znaků ani do dalších nároků; když se nevejdu, škrtám
nárok, ne obraz. Tenhle poměr „hustota vs. počet položek" beru jako obecné
pravidlo pro každý text, který hráč čte jednou a nahlas.

Doprovodné mechaniky v3, které si pletu nejsnáz:
- **Kotva se vybírá v pořadí:** KOMBI slot je kotva vždy → jinak nárok, který hráč
  z typu uzlu NEUHODNE (prior: `lokace`/`zatah` = nářadí + improvizace očekávané;
  `npc`/`lecka` = peníze a klid očekávané, informativní je nářadí a útok) → při
  rovnosti nárok, co dává scéně jméno. **Nikdy podle výšky kotvy slotu** — to by
  z čitelnosti udělalo obtížnostní páku.
- **Dovolený druhý nárok:** nejvýš 1 na telegraf, ≤ 5 v celé sadě 19, u
  `lecka`/`konfrontace` nikdy. Použití se zdůvodňuje v reportu.
- **Verdikt zbraně se nesmí zatmavit ani o slovo.** Po škrtu POKRYTÍ už absence
  útok-nároku neznamená nic, takže inferenci „bouchačku necháme doma" nese jen on
  a případný zápor. Bot ho navíc čte s jistotou → brána pro jeho ztrátu nemá měřidlo.

## Autorské chyby v pořadí, kolik stojí

1. **Falešná poptávka (pravidlo B ČISTOTA)** — próza přiřkne posádce nárok, který
   mezi sloty NENÍ. Po škrtu POKRYTÍ nejdražší pravidlo sady: tým committne kartu
   naprázdno a nedozví se proč. V kole v1 jsem ji udělal 2×. **How to apply:**
   u každého telegrafu si zvlášť vypiš, po čem próza volá, a odškrtej to proti
   slotům. Prázdné políčko tabulky je nález, ne opomenutí.
2. **Sdílený skeleton** — v1 nesl „Jedna věc se rozhodne bez vás…" v **17 z 19**
   telegrafů (13× doslova), a to je věta nesoucí informaci. Skryté sloty ohlašuje
   PŘEDMĚT z té konkrétní scény (vidle, lucerna, ručička váhy, prázdné políčko,
   dunící most) a napříč sadou různě. **Strop: žádná fráze ze slovníku nároků víc
   než 2× v sadě** (v1 mělo „vymyslíte až na místě" 10×).
3. **Nejednoznačný markér hranice nároku** — táž konstrukce „A a B" znamenala
   v sadě tři různé věci (KOMBI / jeden slot se dvěma obrazy / dva různé sloty),
   takže pravidlo bylo splněné jen v autorském čtení. KOMBI = „a zároveň" v téže
   klauzuli; dva sloty = oddělené aktérem nebo tečkou, nikdy jen spojkou „a".
4. **Rekvizita, kterou odhalení vyvrátí** — `brody-konfrontace` si v v1 vymyslela
   „závoru s řetězem", která ve scéně není. **Vždy porovnej s polem `text` téže
   situace** (to se nemění, ale próza s ním nesmí kolidovat).
5. **Slovník nároků jsou DEFINICE, ne znění.** Použít ho jako frázovník je přesně
   ta chyba, ze které vznikl strop 2 výskyty.

**Referenční implementace invariantu je `most-prohnila-prkna`** — D49 ji nechalo
bit po bitu netknutou. Když nevím, jak má telegraf vypadat, čtu ji.

**Čitelnost není balanční páka — v obou směrech.** Vágnější próza se nesmí používat
jako dial obtížnosti (D47 §13.2) a stejně tak se škrt nesmí obhajovat tím, že srazí
win-rate: sim prózu nečte a fidelitu aplikuje na role uniformně
(`sim/strategies.js`), takže tenhle argument model neumí unést ani jedním směrem.
Měřidlo je lidské (metrika 6, zakrývací zkouška).

Viz též [[proces-obsahove-davky]] (délky přiznávej jako odhad, měření deleguj)
a [[kalibrace-obsahu]].
