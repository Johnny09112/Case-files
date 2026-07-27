---
name: k7-learnabilita-verdikt
description: Doměření K7 gate (3) commit-learnabilita 2026-07-27 — gate 12 b. neprošel (9,1/10,3), ale sám gate byl mis-specifikovaný; můj vlastní nález, přiznaná chyba a náhradní znění
metadata:
  type: project
---

Doměření podmínky, kterou jsem sám postavil v balíku kalibrace-4 (bod 3, gate (3)
commit-learnabilita ≥12 b.). Výsledek 2026-07-27: **9,1 b. (kompetentní−náhodný)
/ 10,3 b. (optimální−náhodný), gate NEPROŠEL**, ale hypotéza „gamble trivializuje
commit" byla měřením **vyvrácena** (DiD −0,2 / +1,0 b.).

**Můj verdikt:** reframe K7 NEPADÁ, „cena gamblu" se NEVRACÍ. Gate byl mis-specifikovaný
dvakrát — a to je moje chyba, přijal jsem číslo bez kontroly, co na domácí ose měří.

**Poučení pro roli (klíčové, opakuj):**
- **Než převezmu práh z jiné metriky, zjistím jeho headroom na domácí ose.**
  K4c „kompetentní − random ≥ 12 b." má reálnou hodnotu **64,7–68,7 b.** — 12 je tam
  vata (18 % naměřené hodnoty), nikdy to nevázalo. Vázala DRUHÁ půlka K4c
  (memorizační − kompetentní ≤ 3, spadla na +4,1 → rozšíření šumu ±1→±2).
  Balík naimportoval **nevázající půlku K4c a vázající zahodil**.
- **Hypotéza o EFEKTU se testuje rozdílem rozdílů, ne hladinou.** „Gamble sní
  rozhodnutí" = DiD (mezera s gamblem − bez gamblu). Hladinový test může spadnout
  z důvodů, které s gamblem nesouvisí — a spadl. Gate na DiD má práh ~0, ne 12.
- **Bez memorizačního ramene není learnabilita změřená.** Commit-osa žádné nemá.
  15 situací + telegraf → tabulka; hrozí, že 9 b. je memorovatelnost, ne dovednost.
- **Nemonotonie = bug-smell v botu, ne vlastnost hry.** 3p: kompetentní (fidelita 0,7)
  70,7 > „optimální" (1,0) 69,7. Strop 10,3 b. může být strop BOTA, ne hry.
- **3p je opakovaně problémový count** (K1 70,7 breach, K5f Brody 80,4 breach,
  learnabilita 7,9 nejnižší). Sleduj jako vzorec, ne tři nezávislé nálezy.

Navazuje na [[kalibrace-4-audit]] (kde jsem gate postavil) a [[kalibrace-3-audit]].
