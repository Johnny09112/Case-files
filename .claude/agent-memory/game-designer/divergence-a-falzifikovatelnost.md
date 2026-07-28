---
name: divergence-a-falzifikovatelnost
description: Divergenci verdiktu mezi hráči čti vždy normalizovaně k marginální míře; a v předregistraci musí existovat kritérium, které fakticky může selhat
metadata:
  type: feedback
---

Dvě metodické chyby, které mi kritik doložil v kole `muj-den` (2026-07-28), obě
opakovatelné napříč koly kalibrace cílů:

**1. Absolutní divergence verdiktu mezi hráči je bezcenná bez marginální míry.**
Strop při nezávislosti je `1 − p^m − (1−p)^m` (p = míra splnění, m = počet hráčů).
Při p = 0,98 je strop rozdílného verdiktu **3,4 %**, při p = 0,45 je ~87 %.
Tvrdil jsem, že `muj-den` s 11–29 % je „skoro týmový cíl" — ve skutečnosti ležel
**na nullu** (3p null 11,5, 4p 25,2), tedy je strukturálně osobní, jen saturovaný.
**Why:** saturovaný cíl nemůže divergovat, i kdyby byl dokonale osobní; a naopak
pásmo „osobních cílů 41,8–52,9 %" z D42 není samo o sobě důkazem osobnosti.
**How to apply:** vždy žádej `raw / null` z marginálu téhož běhu **plus** absolutní
číslo (normalizace měří strukturu, absolutní číslo měří, jestli u stolu vůbec
nastane rozdílný verdikt — gate potřebuje obojí). Referenční čísla z D42 se musí
přepočítat, než se použijí jako baseline.

**2. Předregistrace, ve které nemůže žádné kritérium selhat, není předregistrace.**
Napsal jsem pásma širší než polovina povoleného prostoru a jediné odmítavé kritérium
pod jeho vlastním nullem. **How to apply:** ke každé předregistraci připoj větu
„tohle konkrétní měření variantu zabije, a takhle je to pravděpodobné" — a ověř, že
to kritérium nemá triviálně splnitelný strop. Viz [[preregistrace-kriterii]].

**3. Vedlejší, ale drží:** když varianta ve skutečnosti nemění chování bota
(tatáž větev `goalBias`), prodávej ji jako **re-kalibraci obtížnosti**, ne jako
„novou osu tření". Kritik to pozná z kódu dřív, než dočte odůvodnění.
Viz [[kalibrace-revert-falzifikace]].
