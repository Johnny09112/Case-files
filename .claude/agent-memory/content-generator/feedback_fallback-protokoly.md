---
name: fallback-protokoly
description: Řemeslo fallback šablon protokolu — týmové vs. osobní pásmo, pojistné varianty, registr v2, redundance vůči celé obrazovce (kalibrace z prověrky 2026-07-27)
metadata:
  type: feedback
---

Kalibrace řemesla, ne fakta o obsahu (fakta jsou v `prompty/protokol.md` a v sadě
šablon). Vzniklo v kole 2026-07-27 a v prověrce 2026-07-28.

## Věcná poctivost

- **Pásmo je TÝMOVÉ přes 4 sloty** → šablona pásma nesmí ukázat prstem na jednoho
  viníka. `{jmeno}` patří jen tam, kde engine osobu skutečně určil (postih, složení,
  návrat).
- **Když je nepravdivé sloveso, neškrtej podmět.** Týmový postih nelze psát jako
  „podezřelý X si odnesl", ale jmenovat ho lze. Lék měř podle choroby; škrtnout jméno
  z celého pásma je předražené.
- **Pojistná varianta (bez `podminka`) musí být PRAVDIVÁ v celém pásmu, ne jen
  dosaditelná.** Hraje přesně ve stavech, které nikdo jiný nepokrývá — tam, kde je
  svět nejdivnější. Nejdražší chyba prověrky 2026-07-27. A musí být v každém početním
  pásmu, jinak kombinace propadne do `NOUZOVY_ZAZNAM` a v protokolu je vidět díra.
- **Věcnou poctivost ověřuj ve TŘECH osách, ne jedné:** (1) sémantika události,
  (2) **časování** — kdy se událost loguje vůči svému důsledku (složení se v 50 %
  vrací v témže uzlu; `band_resolved` se loguje před ztrátou bedny), (3) **počet
  hráčů** — ukázkové runy si skládám na 4p, ale sólo je pravděpodobnější sezení.
  Osy 2 a 3 chytily nálezy, které dvě předchozí role minuly.
- **Text nesmí slibovat budoucnost** — run může skončit právě tímhle uzlem.
- Přepisy od testéra/kritika neber jako hotové → [[proces-obsahove-davky]].

## Registr a řemeslo

- **Do protokolu jde `nazev` postihu, ne jeho `text`** — texty postihů jsou ve
  2. osobě („saháš pomaleji"), protokol je 3. osoba, úřední.
- **Engine neskloňuje** → `{jmeno}` používej výhradně nesklonně („podezřelý {jmeno}").
- **Registr v2** (úřední obal „v úseku vedeném jako", „stav nákladu:", jedna závorka
  vyšetřovatele na konci) **zachovávej i po pivotu** — fallbacky a živé LLM protokoly
  mají mluvit stejným jazykem. Texty ale piš znovu, nepřeklápěj.
- **Registrová kotva se opakováním mění v tik.** Když táž věta stojí v každém
  odstavci, spis se čte jako opakovaně vyplněný formulář. Lék je změna POŘADÍ
  informace u 1–2 variant pásma, ne bohatší slovník.
- **Redundanci měř vůči CELÉ obrazovce, ne uvnitř sady.** Vedle protokolu běží
  vysvětlující vrstva a próza situace — protokol je pak třetí převyprávění téhož
  a hráč ho přestane číst. Lék: kvóty (výčet věcí a otvírák počtem nejvýš u poloviny
  variant) a posun od reportu ke **komentáři a verdiktu**.

Viz též [[tajne-cile-mechanicke]] (co prompt o osobách vůbec nese).
