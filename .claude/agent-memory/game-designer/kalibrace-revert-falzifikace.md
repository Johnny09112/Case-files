---
name: kalibrace-revert-falzifikace
description: Zavržený směr — revert viditelných kotev běžných uzlů NEspraví K1/K5/K7; engine-kontrafaktuál potvrdil opačný směr. Kde K1 skutečně visí.
metadata:
  type: project
---

# Revert viditelných kotev běžných uzlů = zavržený směr (kalibrace-3, 2026-07-26)

Hypotéza kalibrace-2 „sniž viditelné kotvy běžných uzlů (npc/lokace) 4→3 →
K1 klesne do pásma + uleví K5/K7" byla **falzifikována přímým měřením enginu**
(project-manager, 1200 runů + 2400 kontrafaktuál přes reálný engine).

**Why (co data ukázala):**
- SMĚR: revert win-rate ZVYŠUJE (méně postihů → víc přežití), monotónně.
  Kontrafaktuál: baseline 72.2 % → jen běžné 75.3 → vč. finále 88.7. K1 3p/4p
  už breachuje NAHORU (70.7/70.9), takže každý revert ho zhoršuje.
- K1 nedrží běžné uzly, ale **finále (konfrontace) + akumulace postihů**.
  Lehčí běžný uzel = míň postihů = víc dojetých do finále v kondici = víc výher.
- „Drž improv-4, je řešitelný" je špatně: kotva 4 ± šum 2 s clampem = miss ~40 %
  i s kartou improv-4. Improvizace NENÍ triviální flex, jak jsem tvrdil.
- K5 <5 % je přes běžné kotvy NEDOSAŽITELNÉ: neřešitelnost je ~51 % common /
  ~49 % finále; finále drží floor ~10 %.
- Skutečný top driver neřešitelnosti = **hodnota-slot pod Malonem** (miss 66-72 %):
  padá mechanicky přes D20a run-wide nulování, výše kotvy s tím nic nenadělá.

**How to apply:** K1 3p/4p tlačit dolů výhradně přes finále/Žár/škálování počtem
hráčů, NE přes běžné uzly. Než navrhnu cokoli k win-rate, ověř směr proti enginu —
teoretická úvaha o „vynucených gamblech" (efekt A vs B) mě svedla špatným směrem.

**Druhá instance téhož vzorce (kalibrace-4, 2026-07-27):** navrhl jsem K5 „vyřadit
mechanicky nulované sloty z počtu zásahů" jako lék na Malone → **facilitátor měřením
prokázal, že je to matematický NO-OP** (`(b)==(a)` do desetiny: nulovaný slot je
garantovaná 0, kterou MAX už tak nezapočítává, takže jeho odečtení maximum nesníží).
Nulace bije vrstvu LOOT (`max<4`), NE beznadějnou (`max≤1`). Navíc `<5 %` je
nedosažitelné JAKOUKOLI redefinicí čitatele (min 10,8 % free-pass+common) — driver
je broad struktura kotva 2–4 + šum ±2, ne Malone (76 % beznadějnosti s ním
nesouvisí) ani finále (`max≤1`-rate common ≈ celek).

**Ověřovací povinnost platí OBĚMA směry (2026-07-28, kolo `mozek-operace`):** kritik
označil jako KRITICKÝ nález, že změna tajného cíle / `goalBias` znovuotevírá kalibraci
(K1/K5/K6a). Falzifikoval jsem to jedním pohledem do kódu — gate běží botem, který cíle
ignoruje, takže bias se do gate-metrik nepropíše. **How to apply:** nálezy kritika neber
jako fakt o enginu, dokud je nedoložíš kódem; ale tentýž pohled do kódu obvykle *potvrdí*
jeho zbytek (tam mi našel chybnou pravděpodobnost i prázdný tie-break). Doruč obojí:
co přijímám a co odmítám **s citací místa v kódu**.

**Třetí instance, tentokrát proti KRITIKOVI (škrtací kolo telegrafů, 2026-07-30):**
kritik označil zapečené délky telegrafů D49 („302–379") za **omylem změřené v bajtech**
a odvodil z toho, že sada má proti stropu víc místa, než se myslí. Přeměření
(`playtest-facilitator`, `js-yaml` + `String.length`) ukázalo, že **jsou to znaky
a byly správně** (bajtově je táž sada 336–421). Platná zůstala jen druhá polovina
výtky — invariant jednotku neuváděl. **How to apply:** i „nechutně konkrétní" číslo
od recenzenta je hypotéza, dokud ho někdo se Bashem nepřeměří; a měření je levné
(jeden node skript, 1,5 minuty), takže se to vždycky vyplatí zadat, i když výtka
zní jistě.

**Čtvrtá instance, a znovu proti kritikovi (týž den, 2026-07-30):** kritik navrhl
rameno `memorizacni` (bot znající staty slotů podle id) jako **horní mez hodnoty
prioru** pro telegraf v3. Měření (96 000 runů, 3 bloky): rozdíl *memorizační −
kompetentní* je **+3,9 b. u 1p, ale −3,9 / −8,1 / −9,6 b. u 2p/3p/4p** — striktně
informovanější bot je pro tým HORŠÍ, takže se ta ramena neliší jen informací
(liší se commit-politikou) a mez to není. **How to apply:** než přijmu cizí
rameno/metriku jako „strop", ověř, že se od referenčního ramena liší **jen tou
proměnnou, o které se mluví**. Když striktně lepší vstup dá horší výsledek, měřím
politiku, ne informaci — a nález je o modelu, ne o designu.

**Pátá instance, tentokrát o MÉ VLASTNÍ opravě (škrtací kolo telegrafů, 2026-07-30):**
opravoval jsem třídu chyby „anti-tell o statu, který ve slotech je" a napsal na to
výčtovou kontrolu (vypiš pět statů, najdi, který vylučuji). Kritik doložil, že jsem
opravil **gramatickou formu, ne třídu**: tatáž chyba se ve 4 uzlech vyskytovala jako
**operátor výhradnosti** („jen“, „jedině“, „dokud“, „jinak“), který je gramaticky
NÁROK, takže mou kontrolou projde — autor po pravdě odpoví „nevylučuji žádný stat“.
Dva z těch uzlů jsem do toho stavu uvedl teprve předchozí „opravou“.
**How to apply:** když píšu kontrolní proceduru na nalezenou chybu, formuluj ji
**směrově** („snižuje tato věta ochotu hráče committnout na stat X?“), ne
**formálně** („obsahuje větu typu Y?“). Formální kontrola chytí instance, které jsem
už viděl, a mine ty, které mají týž efekt jinou syntaxí. A: opravuji-li potřetí týž
uzel, je vada ve specifikaci, ne v textu.

**Zobecněné pravidlo:** než navrhnu redefinici metriky jako „lék", **ověř matematiku
proti enginu / požádej facilitátora o kontrafaktuál** — teoretická redefinice může
být no-op nebo mířit na špatný driver. Dvakrát mě teorie (efekt vs. měření) svedla.
Poctivá cesta při doručení: přiznat no-op, předložit VARIANTY s doporučením, odchylku
od doslovného mandátu označit jako rozhodovací bod uživatele, nikdy tiše nepřeklopit.
Viz [[design-era-kalibrace]].
