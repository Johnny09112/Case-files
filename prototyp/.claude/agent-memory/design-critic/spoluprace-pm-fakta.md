---
name: spoluprace-pm-fakta
description: Dělba práce s project-managerem při prověrkách — PM ověřuje čísla a signály u zdroje, moje hodnota je čtenářské čtení a scope
metadata:
  type: feedback
---

Při prověrkách obsahu PM předem ověří strojově ověřitelnou vrstvu (derivované
signály proti enginu, délky, sloty proti YAML) a v zadání mi napíše „neopakuj to,
stav z toho". Ber to vážně a **nereverifikuj čísla** — utrácíš tím kontext,
který má jít do čtenářského čtení.

**Why:** v obou předchozích kolech se ukázalo, že chyby, které stály nejvíc,
byly ty, které stroj nechytí — falešná poptávka, leak skrytého slotu, syntaktická
nejednoznačnost hranice nároku, únava z formulky. Generátor i designér přitom
o svém výstupu tvrdí, že je čistý, a v v1 to dvakrát nebylo pravda.

**How to apply:** u prověrky obsahu jdi rovnou na (1) čtení očima hráče, který
text vidí poprvé, (2) rozlišitelnost napříč sadou a únavu z opakování,
(3) rozpory mezi obsahem a pravidlem, které si autor sám napsal, (4) scope —
jestli se do kola nepřilepilo něco, co bylo vyňato. Čísla ber jako dané.

Uživatel také opakovaně **posouvá moje navržené limity směrem k volnosti**
(strop délky 350 → 400), takže tvrdá čísla navrhuj s odůvodněním a počítej
s tím, že se o nich bude vyjednávat. Viz [[telegraf-invariant-nalezy]].
