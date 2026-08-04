---
name: d59-kontrafaktual-balik80
description: Kontrafaktuál balíku 80 karet (D59) — obsah přispívá jen ~6-9% gap-closure K1 3p/4p, ale prokazatelně zhoršuje K6a přes 1p pokles (-4,35b.); kombinace s floor rukou zavírá ~35-39% mezery K1. Verdikt čeká na uživatele.
metadata:
  type: project
---

**Report:** `technika/kontrafaktual-balik80-2026-08-04.md` + dataviz
`technika/kontrafaktual-balik80-2026-08-04-dataviz.html`. Skript
`d59-measure.mjs` (scratchpad, jednorázový, napodobuje `sweep-ruka.js` confirm
mode přes stejné importy — žádná úprava repa). Nic nezapečeno, verdikt jde
uživateli (dvě nezávislá rozhodnutí padají naráz: zapsat balík 80 do
`obsah/veci.yaml` + aktivovat floor páku ruka z [[d58-4-sweep-ruka]]).

**Metoda:** 4 buňky, 2 bloky × 8000 (metodika D31; A jen 1 blok jako replikační
kontrola proti existujícím 2blok číslům). A/D = balík 40 (dnešní ruce / floor
ruce), B/C = balík 80 (dnešní ruce / floor ruce). CONTENT_DIR na scratchpad
kopii obsahu se zaměněným `veci.yaml`.

**Výsledek — K1 celkem/1p/2p/3p/4p:**
- A (b40, ruce dnes, oficiál 2blok): 80,7 / 68,35 / 80,65 / 86,60 / 87,20
- D (b40+floor, D58/4): 77,9 / 68,35 / 78,55 / 81,90 / 82,75
- B (b80, ruce dnes): 78,85 / 64,0 / 80,25 / 85,15 / 86,10
- C (b80+floor): 75,6 / 64,0 / 77,05 / 80,20 / 81,35

**Klíčový nález 1 (aditivita):** efekt páky ruka (D−A) a efekt obsahu (B−A)
se kombinují téměř přesně součtem (odchylka od aditivní predikce ~0,25–0,3 b.,
v pásmu šumu). Obsah sám přidává jen ~1,1–1,45 b. poklesu K1 3p/4p → gap-closure
ke stropu 70: D samo 26–28 %, B samo 6–9 %, C (obojí) 34–39 %. **Pořád zůstává
~10–11 b. nad stropem u 3p/4p** — kombinace nestačí na gate, jen ho o třetinu
přiblíží.

**Klíčový nález 2 (K6a se zhoršuje, prokázáno, ne hypotéza):** balík 80 zvedá
K6a spread o +2,7–3,2 b. (A 19,0–19,4 → B 22,1; D 14,6 → C 17,8). Driver: 1p
klesá o 4,35 b. (68,35→64,0), zatímco 2p/3p/4p klesají jen o 0,4–1,5 b. — a
1p pokles je IDENTICKÝ mezi B a C na desetinu procenta (ruka[1] se pákou
nemění), takže je to čistě obsahový efekt, ne interakce s pákou. Mechanismus:
balík 80 je v průměru „hubenější" (přiznaná odchylka #1 v
`technika/navrh-40-karet-2026-08-04.md`) a sólo hráč nemá týmovou redundanci
(víc rukou), která by ředění kompenzovala — týmové počty jsou vůči dilution
efektu odolnější. **1p zůstává v pásmu [45,70]**, takže nejde o nový
gate-breach, jen o zhoršení SMĚRU K6a metriky, která byla nesplněná už dřív.

**Statické kontroly (splněny beze zbytku):** `nonGangsterStatMax` (V4-D clamp)
identický 40 vs. 80 obsah (nová dávka nepřidává silnější non-GANGSTER kartu
než dnešní strop) — clamp se nemění. Non-GANGSTER útok≥3 poměr zachován
(6→12, přesně 2×).

**K8 caveat:** proxy `kredit_median` (medián zbytkových kreditů, ne plná K8
definice) ukazuje efekt VÝHRADNĚ z páky ruka (A=5,B=5 shoda; D=4,C=4 shoda) —
balík 80 K8-proxy nemění. Plná K8 metrika (nákup vše <30 %, směna/léčení
≥25 % motelů) není v `report.js` hotová — stejná mezera jako K3/K4d/K6c
z [[d58-4-sweep-ruka]].

**Doporučení k reportu:** zapsat balík 80 lze z hlediska mechanického rizika
(žádný dnes splněný gate se tvrdě nerozbíjí), ALE než se zapeče, doporučeno
zvážit levný lék na K6a/1p z návrhu (odchylka #1: +1 na druhý stat u 4–6
fillerů), aby se 1p vrátilo blíž k 68 % beze změny 3p/4p.

**How to apply:** stejná rodina nálezu jako [[d58-4-sweep-ruka]] a
[[kalibrace-5-sweep-prahoffset]] — bezobsahová páka (ruka) je vyčerpaná,
obsahová páka (balík 80) přidává jen malý, ADITIVNÍ příspěvek ke K1 gap-closure
a s sebou nese vlastní, dosud neopravenou vedlejší regresi (K6a/1p). Kdyby se
příště přidávala další obsahová dávka, měřit 1p efekt zvlášť — je citlivější
na „hubenost" balíku než týmové počty.
