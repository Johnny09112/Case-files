# Migrace na monorepo — plán k odsouhlasení

*Návrh, zatím NEPROVEDENO. Autor: PM, 2026-07-26. Rozhodnutí uživatele:
sloučit design repo (`Case files`) a kódový repo (`dukazni-material-prototyp`)
do jednoho repozitáře — tento dokument je prováděcí plán ke schválení.*

## Cíl

Jeden repozitář `C:\Projekty\Case files`:

```
Case files/
├── design-dokument.md, prototyp-mvp.md, obsah/, prompty/, projekt/,
│   technika/, playtesty/          … beze změny (kanon zůstává v kořeni)
└── prototyp/                      … celý dosavadní kódový repo
    ├── CLAUDE.md (upravený), src/, sim/, test/, experiments/,
    │   package.json, vite.config.js, …
    └── (submodule content/ ZRUŠEN — engine čte ../obsah přímo)
```

Motivace (z diskuse 2026-07-26): jedna kalibrační iterace dnes = 2 commity,
2 sessions, ruční pin submodulu a předávkové markdowny. V monorepu je to jedna
smyčka v jedné session; jedno SHA = stav kódu i obsahu (reprodukovatelnost
měření se zlepší, pinování odpadá).

## Kroky provedení

### 1. Import historie kódového repa (subtree, historie se zachová)
- Předpoklad: oba pracovní stromy čisté, obojí pushnuté (záloha = GitHub).
- `git subtree add --prefix=prototyp <lokální cesta k prototypu> main`
  — vznikne merge commit, `git log` historii kódového repa zachová (22 commitů).

### 2. Zrušení submodulu content/
- `git rm prototyp/content` + smazat `prototyp/.gitmodules`.
- Tím zaniká i backlog-poznámka „pin content na …" — pinování už není potřeba.

### 3. Úprava cest v kódu (content/ → ../, tj. kořen monorepa)
- `sim/run.js`: default `contentDir` = `path.join(REPO_ROOT, '..')`
  (override `CONTENT_DIR` z ADR-005 zůstává).
- `test/content.test.js`: `../content/obsah` → `../../obsah`.
- `src/ui/app.js`: raw importy `../../content/obsah/*.yaml` →
  `../../../obsah/*.yaml` (a `prompty/fallback-sablony.yaml` obdobně).
- `vite.config.js`: přidat `server.fs.allow` na kořen monorepa (dev server
  jinak nepustí importy nad svůj root).
- `eslint.config.js`: z ignores vypustit `content/**`.
- Komentáře v `src/main.js` a jinde odkazující na `content/…` přepsat.

### 4. Sloučení konfigurace a dokumentace
- `prototyp/CLAUDE.md`: cesty `content/…` → `../…`; princip 5 přeformulovat
  ze „read-only submodule" na konvenci: **„obsah/ v kořeni edituje jen designový
  tým; kód ho pouze čte"** (hlídají agenti + review, strukturální zámek padá vědomě).
- Kořenový `CLAUDE.md` (Case files): sekce „Co tento repozitář je" — už ne
  „pouze design dokumenty"; popsat `prototyp/` a dělbu konvencí (docs česky,
  kód anglicky; testy před commitem platí pro `prototyp/`).
- `.claude/launch.json` z kódového repa přenést/sloučit do kořenového `.claude/`
  (dev server musí startovat v `prototyp/` — ověřit při provedení; fallback
  `npm --prefix prototyp run dev`). `settings.local.json` se nepřenáší (lokální).
- `.gitignore`: `prototyp/.gitignore` cestuje s podstromem a funguje beze změny
  (node_modules, dist, logs, .env, Vault/).
- `technika/architektura.md`: nový **ADR-009 (monorepo)** + revize ADR-005
  (načítání obsahu z kořene místo submodulu).
- `projekt/stav.md` + `projekt/rozhodnuti.md`: rozhodnutí **D23 (monorepo)**,
  úprava řádků odkazujících „kódový repo".

### 5. Verifikace (před finálním commitem)
- `cd prototyp && npm install` (node_modules se nemigrují).
- `npm test` → **118/118 zeleně**. Golden snapshoty by měly sedět beze změny
  (obsah v kořeni == stav, na který byl submodule pinnut po kalibraci-2);
  pokud ne, STOP a zjistit proč — ne slepě přegenerovat.
- `npm run sim` smoke-run (pár seedů) — čísla shodná s kalibrací-2.
- `npm run dev` + otevřít v prohlížeči — UI naběhne, run je klikatelný.
- `npx eslint .` bez chyb.

### 6. Dokončení
- Commit(y) v logických celcích (import podstromu / cesty+konfigurace / docs),
  push `Case files`.
- Starý GitHub repo `dukazni-material-prototyp`: **archivovat** (read-only),
  do jeho README poznámka „sloučeno do Case files 2026-07-26". Nemazat.
- Lokální `C:\Projekty\dukazni-material-prototyp` ponechat pár dní jako
  pojistku, smazat až po ověření kalibrace-3.

## Rollback

Do kroku 6 se nic nemaže ani nepřepisuje mimo `Case files`: starý repo zůstává
nedotčen lokálně i na GitHubu. Návrat = `git reset` před subtree-merge commit.
Po kroku 6 je rollbackem prostě revert commitů — obsah i kód jsou pořád v gitu.

## Rizika a jak jsou ošetřená

| Riziko | Ošetření |
|---|---|
| Vite odmítne raw importy nad svým rootem | `server.fs.allow` (krok 3), ověřeno v kroku 5 |
| Golden testy po odpojení submodulu nesedí | krok 5 = STOP a diagnóza, ne přegenerování |
| Ztráta strukturálního zámku „kód needituje obsah" | konvence v obou CLAUDE.md + hlídání agenty (stejný režim jako ostatní principy) |
| Obsidian vault uvidí kódové soubory | kosmetické — Obsidian ne-md soubory nezobrazuje ve grafu; případně vyloučit `prototyp/` v nastavení vaultu |
| Launch config (dev server) v podadresáři | ověření v kroku 4, fallback `npm --prefix` |

## Co se NEMĚNÍ

- Obsah `obsah/*.yaml`, pravidla enginu, výsledky kalibrace-2 — migrace je
  čistě strukturální, žádná změna chování.
- Kalibrace-3 (lék z kalibrace-2: snížení viditelných kotev) se spustí **až po
  migraci**, už v jednom repu a jedné smyčce.

## Volby k odsouhlasení uživatelem

1. **Název podadresáře:** `prototyp/` (doporučeno) — nebo jiný?
2. **GitHub repo prototypu:** archivovat (doporučeno) vs. ponechat aktivní.
3. **Historie:** subtree merge se zachováním historie (doporučeno) vs. čistý
   import bez historie (plošší log, ale ztráta 22 commitů).

Odhad: jedna session. Po schválení provede PM/technical-developer dle tohoto plánu.
