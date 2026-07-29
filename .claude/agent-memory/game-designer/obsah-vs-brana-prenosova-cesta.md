---
name: obsah-vs-brana-prenosova-cesta
description: Než navrhnu změnu obsahu/prózy, zjisti v kódu, JESTLI a JAK ji simulace konzumuje — próza se do brány přenáší jen přes derivovaný signál a lidskou fidelitu
metadata:
  type: feedback
---

**Před každým návrhem změny obsahu si v kódu dohledej přenosovou cestu do brány:**
který strojový derivát z toho obsahu vzniká (`deriveTelegrafSignal` a spol.), který
bot ho čte, a **s jakou modelovanou spolehlivostí**. Teprve pak vím, co změna
zneplatní a co je no-op.

**Why:** próza (telegraf, `text`, popisy věcí) se v simulaci **nečte vůbec** — bot
konzumuje jen derivovaný signál. Z toho plyne dvojí past:
- Kontrafaktuál přes `CONTENT_DIR` u čistě prózové změny je **no-op**; „změřili jsme
  to enginem" je u prózy falešné ujištění. Jediné měřidlo je **lidský test**, jehož
  výsledek se do simu vrací jako **fidelita `p`** (sweep knob, `sim/learnability.js`).
- Kanály se liší modelovanou spolehlivostí: část je škálovaná fidelitou, část bot
  čte **s jistotou** (veřejná pravidla). Zamlžení kanálu, který se čte s jistotou, je
  ztráta, pro kterou brána **nemá měřidlo** — zneplatní kalibraci tiše.

**Fidelita je OBOUSTRANNÝ rozpočet, ne „čím víc informace, tím líp".** Míň informace
láme learnabilitu (K4d) a rozevírá K6a; víc informace zlehčuje hru tam, kde už je
příliš snadná. Vždy si nejdřív najdi, **který počet hráčů je vázající** — bývá to
jiný než referenční 4p.

**How to apply:** u obsahového kola vždy doruč (a) předregistrovaná kritéria přijetí
včetně toho, jak se měří na lidech, (b) explicitní seznam kanálů a jejich
spolehlivosti, (c) přiznání, kde próza dnes říká **víc** než signál — to je rovněž
odchylka, jen v opačném směru. Viz [[kalibrace-revert-falzifikace]] (ověřovací
povinnost oběma směry) a [[preregistrace-kriterii]].
