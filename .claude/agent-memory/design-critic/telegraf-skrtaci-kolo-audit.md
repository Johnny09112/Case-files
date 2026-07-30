---
name: telegraf-skrtaci-kolo-audit
description: Prověrka specifikace škrtacího kola telegrafů (v3 invariant, D51, 2026-07-30) — verdikt SCHVÁLIT S ÚPRAVAMI, 3 blokující; ověřená fakta o prioru, kotvách a kódu
metadata:
  type: project
---

Prověřeno 2026-07-30: `technika/telegraf-skrtaci-kolo-2026-07-30.md` (game-designer,
mandát D51 bod 2). Verdikt: **SCHVÁLIT S ÚPRAVAMI** — směr (škrt POKRYTÍ) drží,
tři blokující jsou dopisky do hlavičky, ne přepis.

**Why:** obsahové kolo běželo souběžně, takže dvě z blokujících (povinný zápor
u zbraně, výjimka pro konfrontace) mění, co má generátor napsat — ne co se má
potom opravit.

**How to apply:** tohle jsou ověřená fakta, neměř je znovu:

1. **Typový prior je aritmeticky správný** (přepočítáno slot po slotu, 15/15
   řádků): lokace/zatah 5 scén — nastroj 5/5, improvizace 5/5, utok 1/5,
   hodnota 0/5, obrana 0/5 · npc/lecka 12 — improvizace 9/12, hodnota 8/12,
   obrana 8/12, nastroj 7/12, utok 4/12 · konfrontace 2 — utok 2/2,
   improvizace 2/2, obrana 1/2, nastroj 1/2, hodnota 0/2. Na rozdíl od
   konceptového kola tady designér nepočítal špatně.
2. **Prior je nenaučitelný pro 5 z 19.** `lecka`/`konfrontace` NIKDY nestojí
   v běžném uzlu (`obsah/pronasledovatele.yaml` ř. 2) → hráč u nich nedostane
   kartu s `TYP_MISTA_LABEL` z `mapa.js`; `commit.js` typ nezobrazuje vůbec.
   `zatah` má n=1 (a to „utok 1/5" JE ten zátah — sebereferenční),
   `konfrontace` n=2 a nejvýš jedna za run, navíc finále.
3. **Útok se dá legálně ZAPŘÍT jen ve 4 z 19** (stat v žádném slotu):
   `farmar-stodola`, `most-prohnila-prkna`, `mesto-houkacky`, `urednik-razitko`.
   První tři jsou `zbran_projde=ano` → přesně scény, kde „zbraň nikoho nevyplaší"
   svádí ke mrtvému commitu brokovnice. To je bezplatná mitigace (zápor se
   nepočítá do položek), kterou invariant nechává jen jako *dovolenou*.
4. **Rozpočet položek:** povinné minimum 15×3 + 4×4 (pronásledovatelé nesou
   kanál 7) = 61; kvóta druhého nároku 5 → 66 → průměr sady 3,47, ne 3.
5. **Bot čte s jistotou** verdikt zbraně i `zbran_slot_vyjimka`
   (`sim/strategies.js:150–164`), ale `zbran_skryte`/`improv_skryte` škáluje
   fidelitou (ř. 423, 426). Fidelita na viditelný trend je per-roli uniformní
   (ř. 417–420) — K-2 precedent tedy platí.
6. **Sim JEDNU polovinu v3 měřit umí:** rameno `memorizacni`
   (`strategies.js:413–416`) je limitní případ dokonalého prioru a jeho rozdíl
   proti `kompetentni` byl postavený právě na otázku „nedegeneruje commit osa
   na lookup tabulku". v3 tam tlačí záměrně → tvrzení „model to neumí ani
   jedním směrem" je přestřelené.
7. **Délky §4.1 jsou správné** (ověřeno ručním přepočtem `most-prohnila-prkna`
   ≈ 302 zn.). Moje výtka V-2 z konceptového kola byla z poloviny mylná —
   zapečená sada D49 byla měřená ve znacích a správně. Poučení: u délek měř
   dřív, než tvrdím, že se měřilo špatně.

**Mechanická brána A/B na finální sadě §3.5 (2026-07-30, poslední kolo D51):**
aplikován SMĚROVÝ TEST + ZÁKAZ VÝHRADNOSTI na každou větu všech 19.
**Výsledek 15/19 → zapečení se zastavuje** (pravidlo bylo 19/19 = zapéct).
Neprošly: `deputy-hlidka` („nebo se dál nepojede"), `nadrazi-vypravci` (append
„je tady jediné, co zabere"), `zatah` („dokud to nepovolí"), `malone-lecka`
(„od té chvíle je řeč zbytečná" proti improvizaci = kotva uzlu).
Konvence, kterou jsem při tom zavedl a je třeba ji držet i příště: **normativní
verdikt zbraně a appendy kanálu 7 se A/B testem nehodnotí** (jsou to pevné
řetězce věrné signálu, „jen popudí" tam není porušení) a **B se vztahuje jen na
věty nároku** — „jen/jedinkrát" v kulise neporušuje nic. Route-images
(„poslední mezera se zavírá") jsem pustil jako obraz tlaku, ne devalvaci statu.

**Blokující nálezy (a jak s nimi designér naložil — DOPLNIT po rozhodnutí):**
B-1 pravidlo 2 maže útok-nárok v obou konfrontacích, kde `zbran_projde=ano`
a viditelný útok-slot má kotvu 4, a druhý nárok je tam zakázaný → znovu se
otevírá díra, kterou D48 zavřelo přepisem verdiktu na toleranci. · B-2 „nesu
inferenci verdiktem a záporem" je slib, který invariant nikomu neukládá
(zápor je dobrovolný) → povinný zápor u 3 scén z bodu 3. · B-3 přejímka v3
nemá definici (D49 procedura „položku po položce proti trendu" ztratila smysl)
→ 5bodový checklist do hlavičky.

**Hlídat (slib, který už dvakrát nedodržel sám sebe):** oprava kanonu
`design-dokument.md` §3 krok 1 + `prototyp-mvp.md` Předpoklady simu je
„připravená, nezapsaná" od D47 §7/1, přes konceptové kolo §10/2, sem. Patří do
`projekt/stav.md` jako blokátor zapečení, ne do pracovního souboru.

Souvisí: [[telegraf-invariant-audit]], [[kalibrace-4-audit]].
