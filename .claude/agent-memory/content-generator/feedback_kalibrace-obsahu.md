---
name: kalibrace-obsahu
description: Co designér+kritik vyžadovali při zápisu MVP sady karet/uzlů/cílů — trvalé principy pro příští generování
metadata:
  type: feedback
---

Kalibrace z první plné sady obsahu MVP (schváleno 2026-07-22, po auditu design-critic).

**Pravidla, která platí i příště:**

1. **Flavor karty nesmí slibovat mechaniku, kterou pravidla neznají** (princip
   „viditelná pravidla"). Např. „bedny vypadnou", „náklad zůstane na břehu" jsou
   OK jen proto, že je teď kryjí ridery tagů. Když píšu nový efekt do textu, musí
   mít oporu v resolučním systému, jinak „text lže".
   **Why:** kritik to označil jako blokující (B3). **How to apply:** u každé karty
   si ověř, že popsaný důsledek odpovídá rideru jejího tagu z prototyp-mvp.md.

2. **U Lesti míchej aktivní klam s pasivním převlekem.** Humor Lesti konverguje na
   jednu pointu „převlek/nikdo nekontroluje" (kolárek, konve, rakev, mašle) — max
   ~2 pasivní, zbytek aktivní klam (hraná role, přípitek, kázání).
   **Why:** kritik K1 + tón. **How to apply:** při 8 kartách tagu hlídej, ať se
   neopakuje jedna šablona vtipu víc než 2×.

3. **Tagová textura je MECHANICKÁ (ridery), ne jen vypravěčská.** Násilí = síla za
   Žár (nejvyšší síly, všechny hlučné); Úplatek = odhoď 1 bednu → povýš selhání na
   5–7; Útěk = selhání ztratí bednu místo zranění; Lest = nekrytá variance (žádný
   rider). Distribuce sil a hlučnost tomu musí sloužit.
   **How to apply:** Násilí drž silově nahoře (víc 3, víc hlučných); Lest naopak
   nesmí být současně nejvíc favorizovaná (+2) a nejmíň postihovaná (−2) na uzlech.

4. **Textové cíle jen tam, kde nesou reveal.** Zbytek = mechanické proxy nad
   metrikami event logu. Nový cíl nesmí odměňovat sebe-vyřazení ani čistou pasivitu
   a nesmí duplikovat podmínku jiného cíle.
   **Why:** kritik D3/D4/D5; simulační brána umí bodovat jen mechanické.

5. **Prokleté karty musí fungovat sólo a bez AI** — žádné „vynecháš uzel/nehodíš
   si". Řeš přes modifikátor hodu (±X, hlučná), ne přes změnu struktury tahu.
