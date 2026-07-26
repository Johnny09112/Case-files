# Důkazní materiál 1930 — prototyp v0.1

Kooperativní party hra (1–4 hráči): gangsteři pašují chlast z Buffala do New
Yorku, zkorumpovaný polda o tom píše protokol. **Mechanika rozhoduje, AI vypráví.**

Tento adresář je digitální prototyp (Vite + vanilla JS, hot-seat) uvnitř
monorepa — design, pravidla a herní obsah žijí v kořeni repozitáře
(`../design-dokument.md`, `../prototyp-mvp.md`, `../obsah/`, `../prompty/`).

## Setup

```bash
cd prototyp
npm install
npm test          # Vitest — unit + golden runs + validace obsahu
npm run sim       # headless simulátor (dávky runů, summary)
npm run dev       # hot-seat UI (Vite dev server)
```

Bez API klíče hra běží plně na fallback šablonách. Pro LLM protokoly zkopíruj
`.env.example` → `.env` a doplň klíč (build se nikam nenasazuje, klíč zůstává
lokální — viz architektura ADR-006).

Obsah se čte z kořene monorepa (`../obsah`); pro experimenty lze přesměrovat
proměnnou `CONTENT_DIR` (ADR-005).

## Dokumentace

- `CLAUDE.md` — pravidla práce v tomto adresáři.
- `../technika/architektura.md` — architektura (ADR), struktura, testy.
- `../prototyp-mvp.md` — resoluční systém a definice MVP.
