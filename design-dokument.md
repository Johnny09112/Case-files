# DŮKAZNÍ MATERIÁL 1930 (Case File: 1930)
**Design dokument v2** — zapracovány změny z produktové diskuse (2026-07-22)

---

## Elevator Pitch

Zkorumpovaný polda sedí u psacího stroje a sepisuje protokol o čtyřech gangsterech,
kteří se pokusili převézt náklad chlastu z Buffala do New Yorku. Hráči ten protokol
píšou svými činy — a čím hůř se jim daří, tím lepší čtení to je.

Kooperativní party hra pro 1–4 hráče (hot-seat / online co-op) s roguelike strukturou,
trvalými následky a estetikou Papers, Please. Jeden run = 30 minut. Mechanika rozhoduje,
AI vypráví.

---

## 1. Vizuál & UX

- **Estetika:** hrubší pixel-art v tónu Papers, Please. Paleta max 16 barev (šedá,
  hnědá, sepie, černá + krvavě červená pro razítka).
- **Hlavní obrazovka:** pohled shora na stůl vyšetřovatele — lampička, hrnek, popelník,
  protokol v psacím stroji, na kterém se v reálném čase vypisuje příběh. Psací stroj
  vyklepává text postupně → maskuje latenci AI a vytváří společný moment čtení nahlas.
- **Okraj spisu:** u jmen postav červená razítka a rukou psané poznámky trvalých
  následků („JAN — probodnut vidlemi", „PEPA — mluví v rýmech").

## 2. Distribuce a režimy hry

**Zrušen Jackbox/browser-join režim.** Klasická distribuce: co instalace, to hráč.

- **Hot-seat (1 zařízení):** karty jsou **odkryté**, hráči sedí u jednoho stolu/PC.
  Žádné předávání zařízení kvůli tajnosti — tajné jsou jen osobní cíle (fyzicky:
  každý si svůj cíl přečte na začátku, např. postupným zobrazením, nebo QR/kód).
- **Online co-op (Steam):** každý hráč vlastní kopii. Networking přes Steam Datagram
  Relay (pro hry na Steamu zdarma — žádné vlastní relay servery).
- **Steam Remote Play Together:** podpora od prvního dne. Host vlastní hru, kamarádi
  hrají zdarma přes stream → funguje jako demo a konverzní trychtýř.
- **Časovač je volitelný.** Výchozí režim nechává stůl diskutovat a hádat se — to *je*
  ta hra. Volitelný timer (např. 45 s) pro rozhodné party.

## 3. Game Loop (jeden run ≈ 30 minut)

**6–7 tučných uzlů** na přímočaré mapě Buffalo → New York (historicky autentická
pašerácká trasa kanadského alkoholu — využít v marketingu).

```
[Buffalo] ─► [Uzel 1] ─► [Uzel 2] ─► ... ─► [New York]
                 │
           (Smrt / Kolaps)
                 │
                 ▼
   [Razítko „NEVYŘEŠENO" ➔ karty týmu propadají do globální databáze]
```

Průběh uzlu:

1. **Volba cesty** — tým vybírá další uzel (vždy 2 možnosti, viditelné tagy rizika).
2. **Situace** — polda vyklepe úvod (šablona uzlu + AI kulisy).
3. **Vyložení karet** — každý hráč hraje **1 kartu za svou postavu**, karty jsou
   odkryté, stůl smí radit, ale rozhoduje vlastník postavy.
4. **Vyhodnocení mechanikou** — viditelná pravidla (tagy + hod + postihy) určí
   výsledek. Hráč vždy ví, *proč* uspěl nebo selhal.
5. **Protokol** — AI dostane hotový výsledek a zdramatizuje ho do suchého policejního
   zápisu (3–5 vět). Následky se razítkují do spisu.
6. **Konec runu** — protokol se přečte celý nahlas, odhalí se tajné osobní cíle,
   bodování, razítko (DORUČENO / NEVYŘEŠENO).

## 4. Core mechaniky

### 4.1 Vlastnictví postavy
Každý hráč hraje karty za svou postavu a nese její následky (zranění, prokleté
karty). Ostatní radí, vlastník rozhoduje. Řeší quarterbacking, dává otevřeným kartám
smysl a zraněním emocionální váhu.

### 4.2 Viditelná pravidla (mechanika rozhoduje, AI vypráví)
- Karty mají přiznaný **tag** (Násilí / Lest / Úplatek / Útěk) a **sílu**.
- Uzel má viditelné afinity („farmář s vidlemi: Násilí −2, Úplatek +2").
- Výsledek = hod + síla karty + afinita − postihy za zranění, proti prahu uzlu.
- AI **nikdy nerozhoduje o výsledku** — jen ho převypráví. (Zároveň nákladová
  optimalizace: krátké prompty, cachovatelné výstupy.)

### 4.3 Tajné osobní cíle (kooperace s třením)
Každý hráč si na začátku lízne tajný cíl vázaný na obsah protokolu („v protokolu
musí stát, že jsem utekl první", „musím být 3× zraněn", „polda mě označí za mozek
operace"). Dává důvod hrát „špatnou" kartu schválně a vytváří závěrečný reveal
moment při čtení spisu.

### 4.4 Trvalé následky (snowballing chaos)
- Zranění a poznámky zůstávají do konce runu a vstupují do každého dalšího promptu.
- Zraněný hráč dostává **prokleté karty** (Křeč, Ztráta důstojnosti…) — ruka se
  ke konci hry kazí.
- **Zoufalé karty:** silné karty hratelné jen s 3+ zraněními. Nejzdemolovanější hráč
  není mrtvá váha, ale tikající komediální bomba.

## 5. Komunitní karty & asynchronní multiplayer

- Po smrti týmu se spis zavře, ale jimi vytvořené karty propadají do globální
  databáze — leží v „důkazním materiálu" na poldově stole pro další hráče.
- **Mad Libs editor:** hráči nepíšou volný text pro AI (ochrana proti prompt
  injection), vyplňují šablonu. Tag a síla karty jsou z šablony, ne z AI —
  **žádné skryté AI balancování**.
- **Moderace:** automatický filtr obsahu + report tlačítko + proces (povinné i kvůli
  Steam AI disclosure). Netriviální práce, plánovat explicitně.
- **Cold start:** před launchem ručně naseedovat stovky „mrtvých týmů" a karet.
- Lajky a statistiky karet („Vaše karta potopila X týmů") — v2.

## 6. AI architektura & náklady

- **Jedno LLM volání na uzel** se strukturovaným vstupem (uzel, výsledek mechaniky,
  stav postav a zranění) → výstup 3–5 vět protokolu. Levný model (třída Haiku).
- **Globální cache à la Infinite Craft:** stejná karta + typ uzlu + podobný stav →
  hotový protokol z databáze. LLM se volá jen pro nové kombinace; náklady na hráče
  časem klesají.
- **Fallback šablony** při výpadku API — hra nikdy nesmí čekat na síť.
- **Tichý fair-use strop:** po X runech denně čistě cachovaný obsah.
- Logovat všechny výstupy — dlouhodobě možnost doladit malý lokální model (offline
  režim, API náklad nula).
- **Steam AI disclosure (Live-Generated):** popsat modely a guardrails na store page.

## 7. Business model

- **9,99 € pay-to-play** (Steam / Itch.io). Žádné předplatné, žádné spotřební tokeny.
- **4-pack bundle** se slevou (~30 €).
- **Free demo:** jeden pevný run s předgenerovaným obsahem (nulové API náklady).
- **DLC prostředí 4–5 €** (Cold War Berlin, Cyberpunk Slums…) s **Host Passem** —
  DLC stačí vlastnit hostovi lobby.
- ~~Product placement~~ — škrtnuto.

## 8. Otevřené otázky

- Přesná čísla resolučního systému (viz prototyp — vyladit playtestem).
- Kvalita českého AI humoru — testovat jako první věc.
- Mechanika „podplácení poldy" důkazy nalezenými během runu (nápad do v2: přepsat
  odstavec protokolu).
- Název: „Baffalo" opraveno na **Buffalo**.
- **Jazyková/tržní strategie:** obsah vzniká a testuje se česky (rizikovější
  jazyk pro AI humor), ale primární Steam trh je anglický. Rozhodnout, zda platí
  „česky ověřit → anglicky vydat", a kdy do plánu zařadit překlad a test
  anglických protokolů.

---

*Historie: v1 = původní koncept (Jackbox režim, tajné karty, AI balancování, product
placement — vše nahrazeno/škrtnuto na základě kritiky a diskuse 2026-07-22).
Souvisí: [prototyp-mvp.md](prototyp-mvp.md).*
