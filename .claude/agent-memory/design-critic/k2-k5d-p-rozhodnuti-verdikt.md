---
name: k2-k5d-p-rozhodnuti-verdikt
description: Verdikt k P-rozhodnutím K2 drift a K5-D po kalibraci-4 (2026-07-27) — doporučeno NEbrousit dál simulaci, jít na lidskou bránu; sleduj rozhodnutí uživatele
metadata:
  type: project
---

Po D31 (nález „seedy 1–1000 jsou příznivý blok") si PM vyžádal verdikt ke dvěma
otevřeným gatům. Můj závěr: **další broušení simulace je špatná investice.**

**Hlavní nálezy (sleduj, jak o nich uživatel rozhodne):**
- **N1 — D25e × uniformní K5-D = nesplnitelná dvojice.** Zákaz oslabit Malona +
  požadavek, aby jeho následek zmizel. Malone/Brody poměr 1,7–1,9× odpovídá
  aritmetickému stínu D20a. Brody po variantě C plní všude → systém prahu umí
  dosáhnout, brání mu jen schválená identita. **D25 P0a měl správný ZÁMĚR
  a špatnou operacionalizaci; D26 varianta D vylila i záměr.**
- **N2 — K2 drift je hladinový agregát kauzální hypotézy** = tatáž vada jako můj
  ≥12 b. z D27. Přímý estimátor (korelace −0,131, r² 1,7 %) je degradovaný na
  diagnostiku. Navíc selekce přeživších drift systematicky snižuje.
- **N3 — všechny tři otevřené položky jsou pod prahem vnímatelnosti.** Přepočet:
  K2 = 1 PRŮŠVIH / 70 runů, K5-D = 1 mrtvý uzel / 34 runů, K5f = 1 run / 128.
  Projekt má konstantu τ=6 b. pro win-rate, ale pro tyhle tři osy žádnou kotvu.
- **N4 — K5-D a K5f jsou jedna otázka se dvěma znaménky: symetrie pronásledovatelů.**
  Malone tvrdší v obou, Brody měkčí v obou; gaty předepisují oběma stejný práh.
  U počtů hráčů projekt paritu VYSLOVIL (K6a); u pronásledovatelů nikdy.
- **N7 — největším hybatelem kalibrace-4 byla oprava BOTA, ne hry** (D30 > P2+P3
  dohromady). Zbývající deficity jsou menší než efekt jedné nalezené botí chyby.
  Doporučeno: systematická prověrka bota proti VŠEM veřejným pravidlům dřív než
  jakýkoli další obsahový krok.
- **`faze` nezapékat** — ne kvůli ceně, ale protože nekupuje nic (2/6 bloků).
  Cena navíc obsahuje nový breach K6a (sd 0,80→1,29 na gate breachujícím 1/6).

**Poučení pro roli:**
- **„Nedosažitelné" vs. „nedosažitelné poctivě" je jiné tvrzení.** K2 1,3 JE
  dosažitelné (obě nádraží jako `rana` → ~1,52); content-generator to odmítl
  z fikčních důvodů. To musí být na stole explicitně, jinak uživatel rozhoduje
  o neexistující trichotomii.
- **Konzistence s [[k7-learnabilita-verdikt]]:** pravidlo „hypotéza o efektu se
  testuje DiD, ne hladinou" jsem aplikoval i na cizí gate (K2) — platí. Ale
  NEaplikoval jsem ho paušálně: PM-ových 10 % u K5-D je hladinový test hladinové
  vlastnosti, tedy správný typ testu. Vada je jinde (uniformita přes asymetrii).
  Neplošné použití vlastního poučení je součást věrohodnosti.
- **Podmínku „doložit run-to-run varianci" vázat na REŽIM MĚŘENÍ, ne na jeden
  gate.** Že u D26 chytila systémovou chybu, bylo štěstí — psal jsem ji pro K6a.

Navazuje na [[kalibrace-4-audit]], [[k7-learnabilita-verdikt]], [[kalibrace-3-audit]].
Výstup: scratchpad `kritik-verdikt-k2-k5d.md` (2026-07-27).
