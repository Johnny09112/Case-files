---
name: muj-den-v3-audit
description: Audit návrhu V-3 (podil_slotu_splnil) na opravu K9 breache muj-den, 2026-07-28 — diagnóza platí, preregistrace neplatí; divergence-null je znovupoužitelný nástroj
metadata:
  type: project
---

Kritika návrhu game-designera na `muj-den` (99,4 / 98,3 / 96,0 % pro 1p/2p/3p proti
K9 5–95 %). Doporučená varianta V-3 = `podil_slotu_splnil >= 60 a pocet_slotu_splnil >= 3`.
Verdikt: **směr správný, preregistrace neplatná v předložené podobě.**

**Co jsem potvrdil (neopakovat jako námitku):** aritmetika „plochý práh nespraví 1p
bez zabití 4p" JE správná (1p n≈28, p≈0,57 → práh ~12 pro 95 %; 4p max 7). Zásoba
slotů 28/14/9,3/7 sedí proti `rules.js` (`ruce`, `uzluNaRun: 7`). Cena v kódu ~5
řádků sedí; `vysvetleni.js:501` opravdu tiskne splnil/propadl; balík se míchá
z odhazovacího (deck nedojde).

**Hlavní vznesené nálezy (ať se neopakují):**
1. **KRITICKÉ — divergence-null.** Gate D3.3 „divergence ≥ 30 %" je pod vlastním
   nulovým modelem `1 − p^m − (1−p)^m`. Při p≈0,45 je null 49,5 / 74,3 / 86,8 %
   pro 2p/3p/4p → kritérium nemůže selhat. Táž normalizace ukazuje, že dnešní
   `muj-den` je AT/NAD nullem (2p null 3,3 % vs. pozorovaných ≥11) → tvrzení
   „týmový v přestrojení" je vyvráceno; vada je JEN obtížnost. `schovana-bouchacka`
   normalizaci přežívá (ratio 0,8–1,2) → D42 se NEotevírá.
2. **KRITICKÉ — V-3 nemění žádné rozhodnutí.** Jmenovatel je exogenní, takže
   per-uzel je maximalizace podílu identická s maximalizací počtu; `goalBias`
   (assign.js:49–53) je pro `muj-den`/`bez-jizvy`/`kupecke-slovo`/`plny-zasah`
   jedna a táž větev. Jediná skutečná změna chování = insatiabilita (držitel má
   sázku ve všech 7 uzlech) — to je náklad na tempo, ne přínos.
3. Granularita: u modálního n=7 jsou cuty 60/65/70 TÁŽ podmínka (≥5/7); efektivní
   cut je +11 b. proti nominálu. Doporučený grid: {50, 60, 67, 75} (frakce, které
   jdou napsat dobově: půlka / tři z pěti / dvě ze tří / tři ze čtyř).
4. Gamble přepisuje `hrac_id` committnuté karty (`state.js:878`) → nová soukromá
   páka „utrať týmový gamble na moji kartu"; bot ji nemodeluje.
5. `parseValue` (events.js:298) — `podil >= 0.6` projde loaderem a tiše je VŽDY
   pravda (`Number('0.6')` v evalCondition). Návrh tvrdil, že by to selhalo.
6. Guard `>= 3` váže jen ve 4p (v 1p n≥12 vždy) = skrytá per-count klauzule,
   tj. to, za co byla zamítnuta V-2.
7. Dvojí standard: V-1 zabita na PODMÍNĚNÉ míře, V-3 obhajována na NEPODMÍNĚNÉ.

**Konzistenční nálezy mimo kolo:** `prototyp-mvp.md` ř. 141–146 uvádí ruku 1p=6,
2p=4, ale `rules.js` má 8 a 5 (kalibrace-1). `design-dokument.md` §4.10 stále
uvádí „polda tě označí za mozek operace" jako aktivní příklad cíle (škrtnut D42).

**How to apply:** až přijde měření facilitátora, ptej se nejdřív na normalizovanou
divergenci a na podmíněnou míru — bez nich je verdikt neplatný.
Viz [[mozek-operace-audit]], [[kalibrace-4-audit]].
