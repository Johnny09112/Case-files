---
name: telegraf-invariant
description: Telegraf se řídí tvrdým QA invariantem (v2 od D48) — kde je jeho kanon, co v mé staré kalibraci zestárlo a jakou chybu v něm autor dělá nejdráž
metadata:
  type: feedback
---

**Telegraf nepíšu z citu — píšu ho proti psanému QA invariantu a proti signálu,
který engine DERIVUJE ze slotů.**

- **Kanon invariantu (v2, schválen D48 2026-07-29):**
  `technika/telegraf-invariant-navrh-2026-07-29.md` §10–§15; po zapečení má znění
  žít v hlavičce `obsah/situace.yaml`. Sekce §2/§3/§4/§6 téhož souboru jsou v1
  a jsou **nahrazené** — nikdy se jimi neřiď.
- **Derivovaný signál si odvozuj ze SLOTŮ, ne z dnešního telegrafu** — pravidla
  v `prototyp/src/engine/resolve.js` (`deriveTelegrafSignal`), chování zbraně
  v `obsah/stitky.yaml` (`chovani_dle_typu`), ne odhadem podle typu uzlu.
  Dnešní telegrafy jsou právě to, co se opravuje, a některé lžou.

## Co v mé staré kalibraci ZESTÁRLO (nepoužívej)

Pravidlo „telegraf jmenuje VŠECHNY viditelné staty + počet skrytých + verdikt zbraně,
nic víc/míň" (audit kritika 2026-07-23) **už neplatí.** Nahradily ho:
- **jádro „nárok je sloveso, ne kulisa"** — kulisa (úředník, hlídač, zámek)
  neprozrazuje nic; kanál se obsadí teprve tím, že próza přiřkne POSÁDCE práci;
- **mlčení o skrytých slotech** (D47/R1) — mluví se jen o `zbran_skryte`
  a `improv_skryte`, jinak o statu skrytého slotu ani slovo, ani kladně, ani záporně;
- **zákaz meta-slovníku** — žádná jména statů ani jejich synonyma („nářadí",
  „důvtip", „šikovné ruce"), žádné „role/slot/práh", žádné číslovky u rolí.
Přežilo jen jádro: **telegraf nikdy neprozrazuje prahy a signál se neautoruje.**

## Nejdražší autorská chyba: falešná poptávka (pravidlo B)

Próza přiřkne posádce nárok, který mezi sloty NENÍ → tým committne kartu naprázdno
a nedozví se proč (riziko R-2 v invariantu). **V kole v1 jsem ji udělal dvakrát.**
**How to apply:** u každého telegrafu si zvlášť vypiš, po čem próza volá, a odškrtej
to proti slotům — pokrytí (každý viditelný slot právě jeden nárok) i čistotu
(žádný nárok navíc). Prázdné políčko kontrolní tabulky je nález, ne opomenutí.

**Vágnější próza NENÍ balanční páka** — vyměnila by měřenou metriku za neměřitelnou
ztrátu porozumění, a na porozumění havarovalo první sezení lidské brány (2026-07-29).

Viz též [[proces-obsahove-davky]] (měř, neodhaduj) a [[kalibrace-obsahu]].
