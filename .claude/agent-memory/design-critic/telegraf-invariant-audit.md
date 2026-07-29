---
name: telegraf-invariant-audit
description: Adversariální prověrka návrhu telegraf-invariant-2026-07-29 (nález 3 lidské brány) — 11 nálezů, verdikt „schválit směr, zamítnout §2 znění", 6 blokujících podmínek
metadata:
  type: project
---

Prověřeno 2026-07-29: `technika/telegraf-invariant-navrh-2026-07-29.md`
(game-designer, mandát D45). Verdikt kritika: **schválit směr a uvolnění délky,
zamítnout §2 znění invariantu k vložení a §4 jako změnu kontraktu.**

**Why:** návrh je stavěný na kvantitativním rámci, který ukazuje opačným směrem,
než je změna, a na čísle, které nikdo po D35 nepřeměřil.

**How to apply:** při dalším kole telegrafů / při jakémkoli sporu o fidelitu
telegrafu sáhni po těchto ověřených faktech, ať se neopakuje kolo dokola:

1. **Mechanický řádek JE už v kódu** — `prototyp/src/ui/screens/run/commit.js:104–113`
   (`popisSignalu`, class `.telegraf-souhrn`, popisek „co z toho plyne"), tlumeně
   pod prózou, výslovně dle D36 + nález 3. §4 návrhu žádá něco, co je hotové.
   Důsledek: efektivní `p` člověka je dnes ≈ 1,0, ne 0,7 → jakýkoli přepis
   telegrafu z „jména statů" na „obrazy" může `p` jen SNÍŽIT. Teze návrhu
   („čitelnost je páka, co zavírá K6a") platí pro opačný směr; jeho vlastní R-1
   to říká správně.
2. **K4d je stale číslo.** 9,1 b. / 3p 7,9 je z kalibrace-4 (PŘED D35). Přeneseno
   beze změny do `kalibrace-4-final` a do `prototyp-mvp.md` STAV BRÁNY. Random
   rameno se po D35 nikdy neměřilo. Per-count kanonické rameno (kompetentní 0,7
   − náhodný): 1p 6,4 · 2p 9,9 · 3p 8,9 · 4p 11,1 — dokumentace cituje 7,9, což
   je rameno *optimal* (p=1,0). Vázající počet je 1p, ne 3p. Po D35 kleslo 1p
   kompetentní 59,1 → 57,3, takže **K4d u 1p může být dnes už pod τ = 6 b.**
   Přeměření = `node sim/learnability.js`, jeden běh.
3. **STOPY STATŮ nejsou partice.** „někdo se dívá a čeká" (obrana) je zároveň
   povinný atmosférický nábytek (hlídač, dozor shora); „něco rozbitého" (nástroj)
   vs. „vymyslíš to na místě" (improvizace) rozlišuje sloveso, ne obraz. Všechny
   3 ukázkové přepisy v §3 porušují vlastní kanál 4 nebo křížovou kontrolu.
4. **Křížová kontrola „podstatné jméno z telegrafu musí být v `text` u {VEC}"**
   dnes neplatí u prvních slotů `urednik-vaha` („podstrčil {VEC}", bez jména)
   ani `nadrazi-noc` („kolem něj"). Přijetí pravidla = editace i `text` polí,
   tedy víc než 19 telegrafů.
5. **Pronásledovatelé nesou 7. kanál** — připomínku `rusi` („Peníze na něj
   neplatí", „u Brodyho dvojnásob"), kterou uzavřený slovník verdiktu zbraně
   nepokrývá; u konfrontací (`vzdy_pass`, 3 viditelné sloty vč. útoku) by
   varianta A byla informační ÚBYTEK proti dnešku.
6. **Zakrývací zkouška 19×6–8 čtenářů je neproveditelná** (projekt nemá hráče
   v dojezdu — proto se přeskočila Fáze 0); navíc měřidlo leakuje měřené
   (aby čtenář odpověděl „po slotech", musí vědět, kolik slotů a že staty jsou
   5) → `p̂` vychýlené nahoru. Riziko třetí mrtvé litery po kalibraci-3 a D34.

Otevřené P-rozhodnutí, které z toho vzešlo: **je mechanický řádek viditelný,
nebo ne?** Nelze mít současně „próza je jediný nositel jmen statů" (a tedy
fidelitní riziko) a „řádek zůstává viditelný". Na tom stojí, jestli je zakrývací
zkouška vůbec k něčemu.

Souvisí: [[kalibrace-4-audit]], [[k7-learnabilita-verdikt]], [[muj-den-v3-audit]].
