# Fáze 2.2 — text situace do UI + viditelné popisy (zadání, 2026-07-29)

*Zadání PM z triáže nálezů prvního sezení lidské brány
([[../playtesty/2026-07-29|playtesty/2026-07-29.md]]). Body 1–2 nejsou nový
design — je to kanon (design §4.3, `obsah/situace.yaml`), který fáze 2.1
nedodala do UI. Bod 3 je drobná prezentační změna navazující na D36
(„próza hlavní, čísla vedle"). Exekuce: Opus v `prototyp/`, Superpowers.*

## 1. Text situace se 4 mezerami do přiřazení a výsledku (hlavní bod)

`obsah/situace.yaml` má u každé situace pole `text:` — max ~5 vět prózy
s přesně 4 mezerami `{VEC}` (plní se názvy zahraných věcí **v pořadí slotů**)
a volně `{kdo}` (jméno — kontrakt příjmení jako u `{jmeno}`; u týmu vlastník
karty v daném slotu, průběžně dle přiřazení). Dnes se nevykresluje nikde
(`grep -r "{VEC}" src/` = 0). Cíl:

- **Obrazovka přiřazení (`assign.js`):** po odhalení zobrazit text situace
  jako hlavní prvek; mezery `{VEC}` renderovat jako doplnitelná místa, která se
  živě plní názvy přiřazených věcí („Podezřelý Bartoš zkusil zatlouct plaňku
  pomocí ___" → „…pomocí Svářečky"). Technická jména slotů (role · stat · práh
  · viditelnost + anotace kotvy) zůstávají, ale **vizuálně podřízená textu**
  (řádek pod mezerou / na rozklik), ne jako samostatné krabice bez kontextu.
- **Obrazovka výsledku (`vysledek.js`):** finální znění textu s doplněnými
  věcmi a jmény NAD razítky slotů — razítka pak čtou jako verdikt k příběhu,
  ne jako čtyři nesouvisející testy.
- Plnění mezer je čistá funkce (obdoba `protocol-fill`) — testovatelná bez DOM;
  pořadí mezer = pořadí slotů (invariant schématu, hlídat testem).
- Engine se nemění (text je autorský obsah, ADR-002/003 netknuté).

## 2. Popis věci viditelně na kartě

`karta.text` (≤140 znaků, autorský) je dnes jen v `title` (hover) —
`commit.js:161`, `assign.js:120`. Zobrazit ho přímo na kartě (menším písmem
pod staty) na commitu i přiřazení. Hover fallback smazat.

## 3. Mechanický souhrn telegrafu jako sekundární řádek

Řádek „viditelné role: … · skrytých rolí: N · zbraň …" (anotace
`telegraf_derived`) nechat, ale vizuálně ustoupit próze telegrafu (menší/
tlumený, případně rozklik „co z toho plyne") — dle D36 je próza hlavní.
**Znění prózy telegrafu se v tomto zadání NEMĚNÍ** — to je bod kola
game-designera (viz playtest, nález 3) a schvaluje ho uživatel.

## Kritérium hotovo

- Přiřazení i výsledek vykreslují text situace; mezery se plní živě; test
  pokrytí „každá situace má právě 4 mezery a plní se v pořadí slotů" zelený.
- Popisy věcí viditelné bez hoveru.
- 231+ testů zelených, lint čistý; smoke test v prohlížeči (PM).

---

*Souvisí: [[faze-2.1-navrh-2026-07-27|technika/faze-2.1-navrh-2026-07-27.md]] ·
design-dokument §4.3 (text se 4 sloty) · `obsah/situace.yaml` (schéma `text:`).*
