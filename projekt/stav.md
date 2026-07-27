# Stav projektu

*Živý dokument. Udržuje `project-manager` — aktualizuj po každém větším kroku.
Poslední aktualizace: 2026-07-27.*

## Aktuální fáze

**v3 kalibrace (2026-07-24).** v2 simulační brána splněna 2026-07-22 a uzavřena
pivotem v3 (D14–D20); v3 engine přestavěn v kódovém repu, diagnostický run-1
(1000×2) proměřen — K1/K6a/K8/co-op inverze prošly, K5/K7/K2 padly (+ hraniční
K4c). **Kalibrace-1 zapracována v design repu (D22):** 45-slot kotva-patch
zapečen + kořenový lék K5/K7/K2 v obsahu. **Míč je u enginu:** reset proxy,
šum, čisté re-měření dle akceptační brány (viz backlog). Lidská brána otevřená.
**Kalibrace-2 doměřena a MONOREPO (D23, 2026-07-26):** kódový repo sloučen sem
jako `prototyp/` (subtree, submodule zrušen, ADR-009) — kalibrační iterace jsou
nově jedna smyčka v jednom repu. **Kalibrace-3 (D24, 2026-07-26): poctivý
negativní výsledek** — lék „snížit viditelné kotvy" měřením vyvrácen (směr K1
opačný, K5/K7 v mandátu nedosažitelné, drivery = Malone-nulované hodnota-sloty
+ finále), nic se nezapeklo. **Mandát kalibrace-4 ROZHODNUT (D25, 2026-07-27):**
K5 bez mechanicky nulovaných slotů, scope K5/K7 na běžné uzly + vlastní metrika
finále, K7/K2 znění v revizi (tým předloží balík ke schválení), obtížnost
jednotná napříč 1–4p, Malone: řešitelnost bez hodnota-slotu. **Balík nového znění brány
SCHVÁLEN (D26, 2026-07-27):** body 1–8, K5 = varianta D („mříž mrtvých
rozhodnutí"), eskalace D22f uzavřeny.
**KALIBRACE-4 PROVEDENA (2026-07-27, D27–D29).** Znění brány zapečeno
(D26 + D28/V1); provedeny P2, P3, P1. **Poprvé od pivotu v3 procházejí K1
per-count i K6a současně** (61,6 / 56,6 / 59,1 / 60,3 %, spread 5,0 b.).
**Brána ale stále NENÍ splněna:** K2 drift 1,18 (gate ≥1,3) a K5 varianta D
11,3 % (gate ≤10 %); obojí s hotovou diagnózou a identifikovaným lékem, nic
se nesnížilo. Report:
[[../technika/kalibrace-4-final-2026-07-27|technika/kalibrace-4-final-2026-07-27.md]].
**Po D30 zapečeno dál (D31):** oprava `deriveTelegrafSignal` o slotovou výjimku
a **varianta C** (`nadrazi-vypravci` — slot pro zbraň; Brody nově plní K5-D
u všech počtů), plus inertní enginová podpora pole `faze`.
**METODICKÝ NÁLEZ (D31): seedy 1–1000 jsou příznivý blok** — verdikt se od teď
bere z průměru přes bloky. Přes 6 bloků: **K5-D 10,58 (0/6 bloků v gate)**,
**K2 drift 1,25 (1/6)**, K6a 4,68 ale 1 blok breachne, K2 floor robustní.
Tagování `faze` pro K2 změřeno a **NEZAPEČENO** — drift jen 1,282 a platí se
za to zhoršením K5-D. Detail: §7
[[../technika/kalibrace-4-final-2026-07-27|reportu]].
**KALIBRACE-4 UZAVŘENA (D33, 2026-07-27).** Kritik doporučil přestat brousit
simulaci (D32) a uživatel rozhodnutí delegoval na PM. Zbývající mezery znamenají
u stolu 1 mrtvý uzel na 34 runů, 1 PRŮŠVIH na 70 a 1 přežití na 135 — hráč by
musel odehrát ~35 hodin, aby si jich všiml. **Dvě přiznaná zvolnění laťky:**
(1) pronásledovatel je PŘÍCHUŤ, ne obtížnost → K5/K5f se gatují přes oba
dohromady, protože si ho hráč nevybírá (losuje se, design §4.9) — tím se K5f
uzavírá poctivě (77,6 %); (2) K2 drift degradován na diagnostiku, floor ≥20 %
zůstává gate — viditelný snowball je Žár a ten funguje, drift měřil neviditelný
mechanismus s r² 1,7 %. **K5 (10,58 % proti ≤10 %) zůstává NESPLNĚNÉ a otevřené**
— váže výhradně Malone a oprava by sáhla na jeho identitu (zákaz D25e).
**Míč: (a) prověrka bota proti veřejným pravidlům, (b) fáze 2.1 vysvětlující
vrstva, (c) fáze 3 LLM + test humoru, (d) LIDSKÁ BRÁNA.**
**(a) PROVĚRKA BOTA HOTOVA (D34, 2026-07-27) — 8 nálezů nad 2000 runy, opravy
zatím NEPROVEDENY.** Nejtvrdší: (N1) `lock_stitek`, `lock_slot_viditelnost`
a `hide_viditelnost` **engine vůbec nevynucuje** → 36,5 % udělených postihů je
mechanicky nic (sonda: 840 + 1716 porušení); (N2) commit slévá role telegrafu do
pytle statů — pokrytí rolí sráží K5-D kandidáty 13,1 → 9,6 % a PRŮŠVIH proxy
15,3 → 11,2 %; (N3) commit nezná run-wide rušený stat, ač je veřejný od startu —
**třetina „Maloneho" přebytku u K5 je bot, ne Malone** (a oprava nesahá na jeho
identitu, tedy neporušuje D25e); (N4) bot nikdy nečte Žár, přitom hlučné hraní
tvoří 58,4 % přírůstku a překračuje 51–61 % všech prahů trati. Chyby jdou na obě
strany (N1/N5 dělají bota silnějším než člověk, N2/N3/N4/N6 slabším), takže
z brány kalibrace-4 se **nedá dovodit ani „byla přísná", ani „byla mírná"**.
Report: [[../technika/proverka-bota-2026-07-27|technika/proverka-bota-2026-07-27.md]].

*Průběh kalibrace-4 (historie):*
[[../technika/kalibrace-4-brana-navrh-2026-07-27|Balík]] byl kanonické zadání.
Re-měřicí session se nejdřív **zastavila na podmínce 0(c) (D27)** — K7
learnabilita 9,1 / 10,3 b. proti gate ≥12 b.; podmínky 0(a), 0(b), 0(d) hotové
(report.js formalizován, dvojí měřicí cut vysvětlen, práh K5-D navržen), K6a
variance doměřena (2sd = 3,22 < 6). Eskalace V1–V4 rozhodnuta uživatelem jako
**V1 (D28)**, čímž se odblokovaly kroky 1–5 mandátu — ty jsou nyní **hotové**
(zapečení znění, P2, P3, P1, re-měření). Verdikt eskalace:
[[../technika/kalibrace-4-2026-07-27|technika/kalibrace-4-2026-07-27.md]].

## Backlog

| Úkol | Vlastník (agent) | Stav |
|---|---|---|
| Technická architektura + plán prototypu (Vite + vanilla JS, psací stroj) | technical-developer | **hotovo** — [[../technika/architektura|technika/architektura.md]] (7 ADR) |
| Review architektury proti principům + adversariální kritika | project-manager (v zastoupení design-critica) | **hotovo 2026-07-22** — principy drží; 3 nálezy (bodování cílů v simulaci, stínová cache na hraně scope, odhad 2–4 týdny těsný) |
| Ověřit konzistenci designu po přidání mechaniky Žár | game-designer / consistency-check | **hotovo** — D1+D2 schváleny uživatelem 2026-07-22, re-check konzistence beze nálezu |
| Zapracovat schválené změny (Žár per uzel, prahy vs. afinity, prokleté od 2. zranění, sémantika Zátahu, čísla jen v prototypu) | game-designer | **hotovo 2026-07-22** — zapracováno a commitnuto (viz [[rozhodnuti]] D1, D2) |
| Rozšířit schéma `obsah/cile.yaml` o mechanicky ověřitelné cíle (pro simulátor) | content-generator + technical-developer | **hotovo 2026-07-22** — D3 schváleno, schéma rozšířeno (`overeni_typ`, `podminka`), 2 vzorové mechanické cíle |
| Naplnit sady obsahu (32 zákl. / 8 prokl. / 4 zoufalé karty, 14+1 uzlů, 8 cílů) | content-generator | **hotovo 2026-07-22** — zapsáno po review kolečku (kritik + humor-tester + game-designer) a schválení D4–D6 |
| Prompt protokolu v0.2 + regresní baterie `prompty/protokol-testy.yaml` (4 case) | protocol-humor-tester | **hotovo 2026-07-22** — vč. nového pole „bedny ztracené tímto hodem" ve formátu vstupu |
| Simulace runů pro balanc (1. běh, 216k runů) | playtest-facilitator | **hotovo 2026-07-22** — brána **NEPROŠLA** (krit. 1: kompetentní hra 90–98 % DORUČENO), náprava jasná; report [[../technika/simulacni-brana-2026-07-22|technika/simulacni-brana-2026-07-22.md]] |
| Iterace čísel dle simulace (D7–D9: 5–7 = zranění, ruka 5, konfrontace → Žár 3, Zátah obě cesty, Útěk rider volba vlastníka, obetni-beranek ≤2, tvrdosti léčky/konfrontace) | project-manager | **hotovo 2026-07-22** — zapracováno, viz [[rozhodnuti]] |
| Přesimulovat (2. běh brány) | playtest-facilitator | **hotovo 2026-07-22** — NEPROŠLA (overcorrection D7: 18–25 % DORUČENO); kalibrační sweep → páka F |
| Zapracovat páku F (prahy 7+/5–6/≤4) + frajer ≤1 zranění (D10) | project-manager | **hotovo 2026-07-22** |
| Přesimulovat (3. běh brány) | playtest-facilitator | **hotovo 2026-07-22** — NEPROŠLA těsně: jádro OK (55/65 % v pásmu, snowball tvar OK), padaly jen cíle cisty-stit/frajer a marginálně tempo Žáru |
| Zapracovat páky G/H/Ž (D11: cisty-stit + doruceno, frajer → kolaps==false, práh Zátahu 4→5) | project-manager | **hotovo 2026-07-22** |
| Přesimulovat (4. běh brány) | playtest-facilitator | **hotovo 2026-07-22 — PROŠLA s výhradami**; brána vyhlášena za splněnou, viz [[rozhodnuti]] a report |
| Založit kódový repozitář | project-manager | **hotovo 2026-07-22** — `C:\Projekty\dukazni-material-prototyp`, submodule `content/`, CLAUDE.md s principy; remote `git@github.com:Johnny09112/dukazni-material-prototyp.git`, pushnuto |
| Prototyp fáze 1: engine + simulátor + testy | kódový repo | **hotovo 2026-07-22** — 95 testů, golden runy, invarianty; první měření odhalilo díru spec. zoufalých → D12 |
| D12: přístup k zoufalým kartám (loot-injury, návrh uživatele) + D13: postavy a fallback šablony | project-manager + agenti | **hotovo 2026-07-22** — viz [[rozhodnuti]]; engine překlápí default, šablony dostávají schválený patch apozice |
| Prototyp fáze 2: hot-seat UI (psací stroj, „Jsem X" cíle, fallbacky jako primární obsah) | kódový repo | **hotovo 2026-07-22** — 127 testů, celý run klikatelný, ověřeno stavitelem i PM v prohlížeči (`npm run dev`); sépiový úřední vzhled, rozpis hodů, export logu JSONL |
| **Fáze 2.1: vysvětlující vrstva pravidel v UI** — nápověda/průvodce, „proč se to stalo" anotace (vynucená karta, zákaz tagu, rider volba, prahy Žáru, postih za zranění) | kódový repo | **nález 1. lidského sezení 2026-07-22** ([[../playtesty/2026-07-22|playtest]]): systém funguje, ale je pro hráče neviditelný — hráč-autor mu nerozuměl |
| Prototyp fáze 3: LLM adaptér (provider NEROZHODNUT — otevřená otázka) | kódový repo | na řadě spolu s 2.1 — cache→provider→timeout→fallback dle ADR-004/007; fallback větev už stojí |
| První lidské sezení (lidská brána): solo/remote run přes `npm run dev`, vyhodnotit metriky + hypotézy (kolaps jako default, tři měřidla) | uživatel + playtest-facilitator | **odblokováno fází 2** — šablona playtestů připravena |
| Jemné doladění obtížnosti po loot-injury (exploit-bot ~74–76 % vs. pásmo 45–70; ladit tvrdosti/Žár, ne resoluční práh) | game-designer + playtest-facilitator | **nahrazeno kalibrací-1 v3** — viz řádek níže |
| **Kalibrace-1 v3: zapéct 45-slot kotva-patch + kořenový lék K5/K7/K2** (gamble vynucený ne zvolený, snowball plochý) | game-designer + content-generator | **hotovo 2026-07-24 (D22)** — patch zapečen (45 slotů +1, pásmo 2–4 drží); lék zapracován: 4 skryté obrana-kotvy 3→2 (dial), 2 telegraf-přepisy npc-pastí, 5 věcí +1 sekundární stat (obrana/nastroj, improvizace netknuta), info-heavy pooly pozdních událostí se stropem ≤7 (D20). Enginová část léku = řádek níže; 3 eskalace na uživatele (viz otevřené otázky) |
| **Pro engine — kalibrace-1 uzavření (signál = tento commit):** (1) reset `rules.kotvaBumpFrakce` 0.8→0; (2) rozšíření šumu pro K4c (model D15 kotva ± šum); (3) derivace telegraf_signal: pozitivně rozlišit „zbraň funguje ve skrytém slotu (stat=utok)" od „zbraň k ničemu" — druhá polovina léku K7 + párová podmínka telegraf-přepisů urednik-vaha/razitko (jinak próza/signál drift); (4) ověřit, že hide_* postih z uzlu N reálně degraduje commit uzlu N+1 (bez toho info-postihy nesnowbalují); (5) zvážit shlukování léček/zátahů/konfrontací do uzlů 3–4+ přes tempo Žáru (K2 cíl ≥1,3); (6) čisté re-měření 1000×2 (seedy 1–1000) dle akceptační brány, POVINNĚ: K1∈[45,70] ∧ K5 odděleně viditelná/skrytá ∧ K7≤20 % současně, per-situace take-rate před/po, K6a v rozpadu dle typu postihu (info-postihy vs. 1p/2p), pozor nadrazi-noc (2 skryté sloty, nejtvrdší offender; skrytých slotů je 20, ne 19) + doladění K8 | kódový repo (technical-developer) | **hotovo 2026-07-24 (kalibrace-2)** — body 1–4 zapracovány, 5 vědomě odloženo; re-měření 1000×2. **K4c OPRAVENO** (+2.4 ≤3). K5/K7 dál breach, K1/K5 coupling z D22(e) POTVRZEN (80 % neřešitelných slotů = viditelné); K1 3p/4p těsně >70, K6a regrese 11.8. Report [[../technika/kalibrace-2-2026-07-24|technika/kalibrace-2-2026-07-24.md]]; míč zpět u obsahu (řádek níže) |
| **Kalibrace-2 lék: snížit viditelné kotvy běžných uzlů** | game-designer + content-generator | **uzavřeno 2026-07-26 (D24) — lék VYVRÁCEN měřením**, nic se nezapeklo; viz řádek kalibrace-3 |
| **Kalibrace-3: selektivní revert kotev 4→3** — návrh 12 slotů (designer) → adversariální prověrka (kritik) → per-slot diagnostika + kontrafaktuální gate-měření 1000×2 přes CONTENT_DIR (facilitátor) | celé kolečko + playtest-facilitator | **hotovo 2026-07-26 (D24) — NEGATIVNÍ VÝSLEDEK**: žádná podmnožina mandátu gate nesplní (K1 špatný směr, K5≥13.6 %, K7≥40.5 % i při maximu); drivery mimo mandát (Malone-nulovaná hodnota, finále ~50 %). Report [[../technika/kalibrace-3-2026-07-26|technika/kalibrace-3-2026-07-26.md]]; mandát kalibrace-4 (P0–P4) eskalován na uživatele |
| Pro technical-developer: do `sim/report.js` doplnit rozpady per-situace / per-slot / common-vs-finále / K5 viditelná-skrytá (v kalibraci-3 počítáno ad-hoc skriptem) | technical-developer | **hotovo 2026-07-27 (D27, podmínka 0a)** — ADR-010, událost `assign_context`, report přestavěn na záznamy; +19 testů (vč. tripwire shody odhadu s botem), 137 zelených. Sjednotilo dvojí měřicí cut |
| **Kalibrace-4 dle mandátu D25:** (1) balík nového znění brány Fáze 0 → schválení uživatelem; (2) obsah: řešitelnost situací bez hodnota-slotu (P2); (3) engine: `improv_skryte` (P3), dorovnání obtížnosti 1–4p přes finále/Žár (P1), ruka 1p až po P1 (P4); (4) re-měření | celé kolečko + technical-developer | **(1) HOTOVO 2026-07-27 — balík předložen:** [[../technika/kalibrace-4-brana-navrh-2026-07-27|technika/kalibrace-4-brana-navrh]] (designer → facilitátor baseline doměření 1000×2 → verdikt kritika „schválit rámec s úpravami"); **SCHVÁLENO uživatelem 2026-07-27 (D26, body 1–8, K5 = varianta D)**. **Kroky 2–4 ZASTAVENY na podmínce 0(c) (D27, 2026-07-27):** K7 learnabilita 9,1 / 10,3 b. proti gate ≥12 b. → dle mandátu eskalace, varianty V1–V4 v [[../technika/kalibrace-4-2026-07-27|technika/kalibrace-4-2026-07-27.md]] §6. Podmínky 0(a)/0(b)/0(d) + K6a variance hotové; `prototyp-mvp.md` i `obsah/` netknuté |
| ~~Další iterace kalibrace (z D29)~~ | — | **uzavřeno D33** — (1) `deriveTelegrafSignal` HOTOVO, (2) varianta C HOTOVO a zapečena, (3) K2 pooly změřeny a **nezapečeny** (drift 1,282, nekupuje gate a zhoršuje K5-D; enginová podpora `faze` zapečena inertní, návrh v `scratchpad/k2-faze-navrh.md`), (4) severita finále — bezpředmětné po D33 (K5f se gatuje pooled) |
| **PROVĚRKA BOTA proti všem veřejným pravidlům** — dvakrát se ukázalo, že měřidlo bylo horší než hra (D30: bot ignoroval verdikt zbraně na obou osách; oprava přinesla víc než dvě kola ladění obsahu). Systematicky projít, co telegraf a `stitky.yaml` hlásí jako VEŘEJNÉ, a ověřit, že to kompetentní bot používá. Levné, a všechna čísla nesená do lidské brány na tom stojí. | technical-developer + PM | **HOTOVO 2026-07-27 (D34) — 8 nálezů, 4 velké**; report [[../technika/proverka-bota-2026-07-27|technika/proverka-bota-2026-07-27.md]]. Opravy NEPROVEDENY (mění všechna čísla brány → rozhodnutí uživatele, viz otevřené otázky) |
| **Opravy z prověrky bota (N1–N8) + jedno re-měření** | technical-developer (+ engine) | **čeká na rozhodnutí uživatele o rozsahu** — N1 (zámkové postihy inertní) je oprava HRY, ne kalibrace; N2/N3/N6 jsou oprava měřidla |
| **Fáze 2.1: vysvětlující vrstva pravidel v UI** — bez ní lidská brána selže na čitelnosti (metrika 6), ne na designu | kódový repo | **na řadě** — nález playtestu 2026-07-22 |
| **Fáze 3: LLM adaptér + test kvality českého humoru** — největší produktové riziko dle CLAUDE.md, simulace ho z principu neotestuje | kódový repo + protocol-humor-tester | **na řadě** — BLOKUJE volba poskytovatele (viz otevřené otázky) |
| Obsahové vady mimo mandát P2 (z D29): viditelný utok-4 slot v NPC je ve 40 % instancí nesplnitelný (`rival-prepad`, `urednik-vaha`, `mesto-ulicka`); kombi `[nastroj, improvizace]` nesplnitelný nad práh 3 (`farmar-stodola`, `most-prohnila-prkna`) | content-generator | otevřeno — nepřibalovat k jiné iteraci, rozmazalo by měření |
| ~~P4: ruka 1p 8→9~~ | — | **ZRUŠENO (D29)** — po P1 je 1p nejvyšší ze všech počtů (61,6 %), zvětšení ruky by rozbilo K6a |
| Volitelná obtížnost při startu runu (easy/normal/hard) | game-designer | **budoucí úkol (D25d)** — neřešit teď; až po lidské bráně |
| **Monorepo (D23): sloučení kódového repa do `prototyp/`** — subtree se zachovanou historií, submodule zrušen, cesty na kořen, ADR-009, otisk verzeObsahu nezávislý na line endings | project-manager | **hotovo 2026-07-26** — 118/118 testů, sim smoke shodný s kalibrací-2, build+lint čisté; GitHub repo prototypu archivovat (viz plán); plán [[../technika/migrace-monorepo-plan-2026-07-26|technika/migrace-monorepo-plan]] |
| Setup pluginů pro kódovou část (`prototyp/`): Superpowers (inženýrská disciplína), frontend-design (až UI — nakrmit estetikou z design dokumentu), security-guidance | uživatel (claude CLI) | po monorepu (D23) se instalují do tohoto repa — dělba platí: Superpowers jen pro práci v `prototyp/`, herně-designovou disciplínu drží naši agenti |
| První měření instrumentovaného enginu: potvrdit win-rate (kompetentní ≤70 %) a hlídat obetni-beranek (94,8 % těsně pod stropem) | playtest-facilitator + technical-developer | **hotovo — run-1 (1000×2)**: K1 v pásmu (59.8–69.2 %), co-op inverze OK (4/4 ~4.8 %); report [[../technika/kalibrace-1-2026-07-24|technika/kalibrace-1-2026-07-24.md]] |
| Fallback šablony protokolu (~20) | content-generator + protocol-humor-tester | čeká (potřeba až pro prototyp, ne pro simulaci) |
| Revize pronásledovatelů (nález kritika „léčky tlačí k Lesti") | game-designer | **uzavřeno 2026-07-22 — beze změn**: Malone→Lest je záměrná protiváha nulovaného Úplatku, Brody otevírá jiné pruhy; výjimka „konfrontace Malonea bez +2" potvrzena jako záměr (komentář v YAML) |
| Pro engine (technical-developer): (a) formalizovat razítko DORUČENO — metrika `doruceno` na něm stojí; (b) strukturovaný vstup protokolu nese pole „bedny ztracené tímto hodem"; (c) ověřit proveditelnost „hlasu z auta" v hot-seat UI; (d) nové metriky cílů `ztracene_bedny_vlastni`, `max_sila_karty` v event logu | technical-developer | poznámky z 2026-07-22 |

## Otevřené otázky (čekají na uživatele)

**Živé — blokují další fáze:**

- **LLM poskytovatel NEROZHODNUT.** Blokuje fázi 3 (adaptér) a tím i test
  kvality českého humoru, což je dle CLAUDE.md největší produktové riziko.
  Volání drž abstrahované (ADR-004/007), levný model třídy Haiku, jedno volání
  na uzel. Konzultace s `operations-economics` k rozpočtu je připravená.
- **Jazyková strategie CZ→EN** — kdy zařadit překlad a test anglických protokolů.
  Obsah vzniká a testuje se česky (rizikovější jazyk pro AI humor), primární
  Steam trh je anglický.
- **K5 zůstává nesplněné** (10,58 % proti ≤10 %, váže výhradně Malone; oprava by
  sáhla na jeho identitu, což zakázalo D25e). Vědomě jde do lidské brány jako
  známý otevřený bod — ne k rozhodnutí teď, ale k připomenutí při Go/No-Go.
  **Pozor: D34 ukazuje, že ~třetina toho přebytku je chyba bota, ne Maloneho.**
- **ROZSAH OPRAV Z PROVĚRKY BOTA (D34) — čeká na uživatele.** Sedm oprav, jedno
  re-měření; po nich **neplatí ani jedno číslo z kalibrace-4**. Proto to není
  rozhodnutí PM: D33 kalibraci vědomě zavřel s tím, že se jde na lidskou bránu.
  Dělící čára: **N1 je oprava HRY** (třetina postihů u stolu nedělá nic — jde do
  lidské brány tak jako tak), N2/N3/N6 jsou oprava MĚŘIDLA (mění jen simulaci).

**Budoucí, neblokující:**

- Volitelná obtížnost při startu runu (easy/normal/hard) — D25d, až po lidské bráně.

**Uzavřeno (detaily v [[rozhodnuti]]):** pivot v3 na slotovou resoluci (D14–D20) ·
mandát kalibrace-4 (D25) · balík znění brány (D26) · eskalace K7 learnability
→ varianta V1 (D28) · P-rozhodnutí K2 a K5-D → uzavření kalibrace (D32, D33) ·
škálování obtížnosti počtem hráčů — **vyřešeno P1** (per-count posun prahů Žáru,
K6a 11,8 → 4,7 b.) · eskalace z D22 (D26).

## Provozní poznámky

- **2026-07-22: tým agentů nebyl v session dosažitelný** (SendMessage „not
  reachable") — role design-critica a game-designera odehrál project-manager
  v zastoupení, s přiznáním v syntéze. Při příští session ověřit dostupnost týmu.
- **2026-07-24: tým dosažitelný** — kalibrace-1 odehrána plným kolečkem
  game-designer → design-critic → content-generator (žádné zastoupení). PM nemá
  Bash — commit/push proveden v zastoupení přes general-purpose agenta.
- **2026-07-26 (kalibrace-3): metodický standard** — kandidátní obsah se před
  zapečením měří kontrafaktuálně přes `CONTENT_DIR` na kopii `obsah/` ve
  scratchpadu; per-slot diagnostika PŘED zapečením zabránila spálené iteraci.
  Testy/commity za PM provádí playtest-facilitator (má Bash).
- **2026-07-27 (balík kalibrace-4):** background agenti se ukončovali bez
  doručených výsledků → spolehlivější jsou synchronní běhy (`run_in_background:
  false`) s výstupem do souboru ve scratchpadu. Vedlejší efekt: měření i
  finalizace běžely 2× nezávisle — závěry se shodly, dílčí čísla se lišila
  (dvojí měřicí cut, viz část C balíku); sjednotí formalizovaný `report.js`.

## „Vyřešíme později" sliby

- Podplácení poldy důkazy z runu (nápad do v2).
- Lajky a statistiky karet (v2).

## Plugin / tooling (pozn. po D23: jeden repo, jedna instalace)

- ~~Zabalení týmu agentů do pluginu ke sdílení mezi repy~~ — **bezpředmětné po
  monorepu (D23)**: agenti i skilly žijí v `.claude/` jednoho repa.
- Nainstalovat plugin **Superpowers** (oficiální marketplace) pro inženýrskou
  disciplínu (clarify→design→plan→code→verify, TDD) — **používat jen pro práci
  v `prototyp/`**. Dělba: Superpowers vlastní *inženýrskou* disciplínu, naši
  agenti *herně-designovou* — ne dvě metodiky na jeden úkol.
- **frontend-design** — použít při stavbě UI prototypu (obrazovka psacího
  stroje, pohled na stůl); nakrmit ho estetikou z design dokumentu
  (Papers Please, sépiová 16barevná paleta), ať nevznikne generický vzhled.
- **security-guidance** — reálná hodnota pro kódovou část (API klíče, vrstva
  LLM volání, obrana proti prompt injection u UGC); přidat mu
  `claude-security-guidance.md`, až se bude stavět LLM adaptér.
- **skill-creator** je fázově neutrální, on-demand (vznikl jím `consistency-check`).
