---
name: sim-gate-findings
description: Verdikt simulační brány + prokázaná balanční čísla. 1. běh (216k) i 2. běh (240k, po D7-D9).
metadata:
  type: project
---

# Simulační brána — prokázané nálezy

Simulátor ve scratchpadu (Node, seedovaný RNG). Věrná pravidla z prototyp-mvp.md +
obsah/*.yaml. Vyhodnocováno proti zafixovaným kritériím brány (Fáze 0, referenční 4p run).

## 2. BĚH (2026-07-22, po D7–D9, 240 000 runů) — NEPROŠLA (overcorrection)

Matice: 3 počty hráčů (1/2/4) × 10 strategií × 2 pronásledovatelé × 2 větve hlasu, à 2000.

**Celkový verdikt: NEPROŠLA.** D7 (5–7 = reálné zranění na KAŽDÉM hodu) v kombinaci
s tím, že každý hráč hází každý uzel, hru **překlopil z „moc snadné" do „moc těžké"**.

**Why:** P(5–7) je 33–50 % na typický hod; se 4 hráči × ~9 setkání/run (6 uzlů +
Zátah + léčka + konfrontace, které teď padnou skoro každý run) se zranění lavinovitě
kupí → 99 % runů má kolaps, kompetentní hra vyhrává jen ~25 %.

**How to apply:** doporučená náprava má kalibrované číslo (viz páka F níže) — přesimuluj
po volbě páky, než se zafixuje. Verdikt brány zůstává NEPROŠLA do nápravy.

### Prokázaná čísla 2. běhu (jen matematika/tempo, NE zábavnost)
- DORUČENO 4p: greedy 25,3 %, cautious 25,4 %, cíle-driven (realistická) 18,6 %.
  Pásmo brány 45–70 %. → **krit. 1 padá, tentokrát zdola.** Ani nejsnadnější buňka
  (2p greedy 34,5 %) nedosáhne 45 %. Žádná strategie nikde není nad 35 %.
- **Snowball je příliš rychlý / front-loaded.** Přírůstek zranění per uzel (4p cíle):
  2,6 / 4,3 / **5,5 (vrchol uzel 3)** / 2,5 / 0,8 / 0,3 — po uzlu 3 padá, protože hráči
  už kolabují. Design chtěl zhoršení „citelné OD 3. uzlu" (postupné 3→4→5→6), tady je
  vrchol už uzel 3 a pak smrt. → krit. 2 nesplněno v duchu.
- **První práh Žáru padá medián uzel 2** (reachRate 99 %), cíl 3–4. → krit. 3 padá.
  Žár běží moc horko: se 4 hráči selže uzel v ~80 % → +1 Žár skoro pořád.
- Kolaps v **99 % runů** (4p), prům. ~10 hráčo-uzlů stráveno vyřazeně. Nový problém
  přímo z D7 — přesně riziko, na které úkol upozorňoval.
- Cíle: beranek **70 %** (D9 max síla ≤2 opravilo mrtvý cíl z 1. běhu ✓), stit 77 %,
  prsty 81 %, nohy 79 %, modrinu 22 %, kupecke 9 %. **frajer (0 zranění + doručeno)
  = 0,1 %** → padá pod floor 5 % (bez zranění dojet je teď nemožné). mozek = textový,
  simulátor vynechává. → krit. 5 padá kvůli frajerovi.
- Kritérium „žádná strategie >85 %" formálně PROŠLO (max 34,5 %), ale triviálně/špatným
  směrem (vše moc těžké).
- **Rider Útěku (D8) = reálná volba, ne mrtvá:** mono-Útěk 4p rozumná volba 6,1 % >
  vždy-bedna 4,4 % (spálí 3,66 bedny/run) > vždy-zranění 3,9 % (prohloubí kolaps).
  Volba vlastníka smysluplně mění osud. Útěk zůstává jako mono past (max 6 %).
- Kanály ztráty beden (4p cíle): úplatek-dobrovolný 0,83 ≈ útěk-rider 0,82 ≈
  tvrdost-bedna 0,94 — po zracionálnění úplatku vyrovnanější než v 1. běhu.
- Tempo konfrontací: **kolotoč se ZMÍRNIL** — konf 0,97×/run (1. běh 1,5–2,6×), protože
  přežití teď sráží Žár na 3 (bylo 6). Ale konf pořád padá skoro každý run, protože Žár
  je celkově moc horký (fix funguje, ale zdroj Žáru je nezkrocený).
- Zátah **1,24×/run** (1. běh 0,22×) — D8 „nahradí obě cesty" funguje, teď je nevyhnutelný.

### Kalibrovaná páka (sweep 4p greedy/cíle, poslat game-designerovi)
Sweep přes konfigurace ukázal jasného vítěze:
- **Páka F — snížit práh plného úspěchu z 8+ na 7+** (pásmo 7+ úspěch / 5–6 zranění /
  ≤4 selhání): greedy 4p **62,2 %**, cíle **49,3 %**, greedy 2p 64,3 % — VŠE v pásmu
  45–70 %. Zachovává ducha D7 (5–6 pořád bolí zraněním), jen ubere jeden bod, aby plný
  úspěch nebyl vzácný. **Nejčistší jednoznaková náprava.**
- Páka C (posun celého pásma −1: 7+/4−6/≤3): cíle 62,8 %, greedy 74,2 % — greedy mírně
  nad pásmem.
- Páka B (návrat 5–7 = poznámka zdarma): greedy 98,5 %/cíle 93,3 % — potvrzuje 1. běh
  (moc snadné). D7 byl správný směr, jen moc silný.
- Chladnější Žár (prahy 5,8,11) sám o sobě NEpomáhá (29 %) — zabíjí syrové zranění, ne Žár.
- POZOR: i pod pákou F zůstává kolaps ~99 %. Vysoká, ale win-rate je zdravá →
  „zbitý, ale doručil" může být zamýšlený sníh; potřebuje lidský read (viz [[pending-human-hypotheses]]).

## 1. BĚH (2026-07-22, před D7–D9, 216k runů) — NEPROŠLA (moc snadné)
Kompetentní hra 96–98 % DORUČENO, realistická 84–90 % (pásmo 45–70). Nejsilnější páka =
sémantika 5–7; „poznámka zdarma" dělala hru bez tření. Predikce „5–7 = zranění → 72,5 %"
se NEnaplnila (2. běh dal 25 %), protože D7 nešel sám — spolu s ním padly D8 (nevyhnutelný
Zátah, víc tvrdých uzlů) a horký Žár ekonomika, které zranění znásobily. Detaily viz git
historie této poznámky. Cíl beranek tehdy ~1 % (mrtvý), teď 70 % (D9 opravilo).
