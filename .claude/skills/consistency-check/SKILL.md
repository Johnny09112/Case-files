---
name: consistency-check
description: Zkontroluje konzistenci mezi design-dokument.md a prototyp-mvp.md v projektu Důkazní materiál 1930 — herní mechaniky a čísla, křížové odkazy v patičkách, terminologii a soulad rozsahu MVP s vizí hry. Použij vždy, když uživatel požádá o kontrolu konzistence dokumentů, zeptá se něco jako "sedí to s prototypem?" / "je to podle designu?" / "nerozjely se nám dokumenty?", nebo po úpravě mechaniky v jednom z dokumentů chce ověřit, že se druhý nerozjel. Skill jen hlásí nálezy, opravy nenavrhuje ani neprovádí sám.
---

## Proč na tom záleží

CLAUDE.md tohoto projektu žádá, aby `design-dokument.md` (vize) a `prototyp-mvp.md`
(MVP) zůstaly konzistentní: „změna mechaniky v jednom = zkontroluj druhý", křížové
odkazy v patičkách zachovávej. Dva oddělené soubory se ale rozjíždí tiše — nikdo
nedostane chybu, když v jednom zůstane starý práh hodu a ve druhém nový. Tenhle
skill dělá tu kontrolu systematicky, místo aby spoléhal na to, že si někdo
nesrovnalost všimne při čtení.

## Postup

1. Přečti celý `design-dokument.md` a celý `prototyp-mvp.md`.
2. Projdi čtyři oblasti níže a zapisuj konkrétní nálezy s odkazem na místo
   v obou souborech.
3. Hlaš jen skutečné nesrovnalosti — ne každý rozdíl je problém. `design-dokument.md`
   popisuje celou vizi, `prototyp-mvp.md` jen fázi 0–2 MVP; něco může být v jednom
   dokumentu explicitně „mimo rozsah" a to je v pořádku, dokud to druhý dokument
   netváří jako už aktivní součást MVP.

### Herní mechaniky a čísla

Porovnej resoluční systém, tagy karet, sílu, prahy hodu, zranění, postihy, náklad,
zoufalé/prokleté karty. `design-dokument.md` by neměl hardcodovat konkrétní čísla,
protože `prototyp-mvp.md` je má „ladit playtestem" — pokud přesto číslo uvádí,
ověř, že souhlasí s aktuální hodnotou v `prototyp-mvp.md`. Číslo se v `prototyp-mvp.md`
může po playtestu změnit; pokud `design-dokument.md` cituje starou hodnotu, je to nález.

### Křížové odkazy v patičkách

Ověř, že patička každého dokumentu odkazuje na ten druhý platným markdown odkazem,
a že historie škrtnutých nápadů (Jackbox, tajné karty, AI balancování, product
placement) se v žádném z dokumentů netvrdí jako aktivní feature bez poznámky,
že jde o škrtnutý nápad.

### Terminologie a názvosloví

Sesbírej klíčové termíny (protokol, uzel, postava, zranění, prokleté karty, zoufalé
karty, tajné cíle, razítko DORUČENO/NEVYŘEŠENO…) a ověř, že se v obou dokumentech
jmenují stejně. Jiné pojmenování stejné věci ztěžuje čtení a bývá signál, že
dokumenty někdo upravoval bez pohledu na ten druhý.

### Rozsah MVP vs. vize

Porovnej sekci „Záměrně MIMO rozsah v0.1" v `prototyp-mvp.md` s obsahem
`design-dokument.md`: cokoliv, co `design-dokument.md` popisuje jako aktivní
součást hry (ne jako budoucí vizi), a přitom to `prototyp-mvp.md` řadí mimo rozsah,
je nesrovnalost — u papírového playtestu by na to mohl narazit hráč, přestože to
nemá být implementováno.

## Formát výstupu

Nálezy seskup podle čtyř oblastí výše. U každého uveď:

- **Kde** — soubor a místo (řádek/sekce) v obou dokumentech.
- **Co** — co konkrétně nesedí.
- **Proč to vadí** — co by se stalo, kdyby to zůstalo (matoucí playtest, rozjetá
  pravidla, slib, který dokument nedrží).

Neopravuj text sám — jen hlas nálezy, rozhodnutí a úprava zůstávají na designérovi.
Pokud nic nenajdeš, řekni to jasně: „beze nálezu" je platný výsledek, ne důvod
hledat problém za každou cenu.
