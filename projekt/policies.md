# Pravidla projektové paměti — invarianty (single source)

> Invarianty paměti v gitu pro Důkazní materiál 1930. `CLAUDE.md` sem odkazuje,
> neopakuje je. Osobní/cross-project věci sem NEpatří — ty jdou do osobního vaultu
> (`~/.claude/vault/`, mimo git).

## Integrita

- **Append-only pro rozhodnutí.** `projekt/rozhodnuti.md` je datovaný log — historii
  nemazat. Konflikt → nový záznam s vysvětlením; překonané rozhodnutí označ a odkaž nástupce.
- **Data absolutně** (`YYYY-MM-DD`), ne relativně.
- **Škrtnuté nápady nemaž** — přesuň do historie v patičce s důvodem škrtnutí.
- **Fakta, ne spekulace.**

## Bezpečnost

- **NIKDY** credentials, hesla, tokeny, klíče. Nikdy necommituj rozbitý stav ani tajemství.
- **Neukládej duplicitní pravdu** — co drží jeden autoritativní soubor, jinde jen odkaž.

## Vrstvy a scope (kam co patří)

- **Doménová pravda** → `design-dokument.md`, `prototyp-mvp.md`, `obsah/`, `prompty/`, `playtesty/`.
- **Procesní paměť** → `projekt/stav.md` (živý, přepis v místě) + `projekt/rozhodnuti.md`
  (append-only log). Udržuje `project-manager`.
- **Privátní paměť agentů** → `.claude/agent-memory/<agent>/` — **JEN kalibrace role**,
  ne projektová fakta. Cokoli pro jiného agenta/příští session → do sdílených souborů výše.
- **Osobní / cross-project** → mimo tento repo, do `~/.claude/vault/`.

## Konzistence

- Změna mechaniky v jednom design dokumentu = zkontroluj druhý (skill `consistency-check`).
- Křížové odkazy v patičkách zachovávej.
- Zdroj pravdy je vždy soubor v gitu, ne generovaná stránka.
