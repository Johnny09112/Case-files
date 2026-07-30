# Separabilita slotů — dvě zamítnuté vazby, jeden důkaz a jedna otevřená hypotéza

> Mandát: **D52 bod 3** (`projekt/rozhodnuti.md`), nález Denisy P0/#1
> (`.claude/game-lead/brief.md`, Poznámky agenta 2026-07-30).
> Autor: game-designer · 2026-07-30 · **NÁVRH KE SCHVÁLENÍ, nic zapečeno.**
> `rules.js` a obsah nedotčeny; obě měření běžela v izolovaných worktree.

## 0. Verdikt napřed

**Mandát zněl „navrhni jednu mezislotovou vazbu". Navrhl jsem dvě, obě jsem
nechal změřit a obě se zamítají — ne kvůli číslům, ale kvůli struktuře.**
Vedlejším produktem je důkaz, který zabíjí **celou rodinu** návrhů typu
„sdílený rozpočet promítnutý do Žáru" (tedy i favorita z Denisina nálezu),
a oprava metriky, na které jsem to původně chtěl měřit — moje první definice
byla tautologie, která by prošla čemukoli.

Co odsud odchází jako použitelné:
1. **Levné analytické sítko**, které příští kandidáty odfiltruje za deset minut
   na papíře místo za dvě hodiny simulace (§3).
2. **Uzavření třetí, záložní cesty** („vazba už v pravidlech je, chybí jen
   čitelnost") — také změřena, také zamítnuta, včetně důvodu, proč je ten
   strop strukturální a ne kalibrační (§6.2).
3. Dvě vedlejší, nevyžádaná zjištění o Žáru a o hustotě obsahu (§7), z nichž
   jedno je potenciální K1 páka.

---

## 1. Diagnóza: co přesně je rozbité

### 1.1 Nález je pravdivý a je doložitelný kódem

Bot hledá rozdělení takto (`prototyp/sim/assign.js:132–139`):

```js
for (const perm of permutace(sloty.length)) {
  let sc = 0;
  for (let i = 0; i < M; i++) sc += scoreFn(karty[i], sloty[perm[i]], i);
```

Cíl je **součet přes sloty** z hodnot závislých jen na dvojici *(karta, slot)* —
lineární přiřazovací úloha (LAP). Existuje pevná tabulka 4×4 a optimum se z ní
spočítá. Jediná vazba je „každou kartu jen jednou", a ta vyrábí aritmetiku,
ne spor: **všechny zásahy jsou stejně hodnotné**, takže kdo počítá rychleji, má
pravdu. To je palivo quarterbackingu, ne obrana proti němu.

### 1.2 Horší, než nález říká: Žár dnes rozdělení vůbec nevidí

`prototyp/src/engine/state.js:582–591` iteruje přes `situ.committed` —
committnutou **sadu**, ne přiřazení. Komentář nad smyčkou přitom říká
„assignované karty". Hlučnost se tedy platí za to, co tým do uzlu poslal, bez
ohledu na to, kam to dal: přes všech 24 permutací je to konstanta. **Jediná
existující druhá osa hry se rozdělovací fáze nedotýká.** (Není to bug s dopadem
na dosavadní kalibraci — chová se to konzistentně. Je to promarněná páka
a **lživý komentář**, který stojí za opravu bez ohledu na osud tohoto návrhu.)

### 1.3 Dva různé defekty — a moje původní teorie, jak je léčit, byla ŠPATNĚ

| Defekt | Co znamená | Co jsem tvrdil | Jak to dopadlo |
|---|---|---|---|
| **A. Skalární cíl** | Výsledek je funkce jediného čísla (zásahy). Dvě rozdělení jsou vždy porovnatelná → není o čem mít **názor**. | „Přidej druhou osu, která se mění s rozdělením." | Platí, ale nestačí — viz C. |
| **B. Separabilní cíl** | Hodnota umístění nezávisí na ostatních slotech → optimum je tabulkové. | „Nelinearita (rozpočet, práh) to zlomí." | **VYVRÁCENO měřením i důkazem.** |

Napsal jsem v první verzi tohoto dokumentu, že *„každá cena tvaru `c(karta,
slot)` nechává úlohu separabilní; vazbu vyrobí teprve nelineární funkce celého
rozdělení (práh, rozpočet, kvórum)"*. Druhá půlka věty je nepravda a měření ji
srazilo hned v prvním kole:

> `nad = max(0, Σ x_ij − B)` je **monotónní transformace jediného váženého
> součtu** per-dvojice. Minimalizovat `max(0, c − B)` = minimalizovat `c`.
> Rozpočet tedy vazbu mezi sloty nepřidává — přidává **plochou oblast**
> (indiferenci mezi 0 a 1 umístěním), tedy *méně* struktury než čistý ceník.

Obecněji — a **v přesně tomto zúženém znění**; širší verze byla v první verzi
dokumentu a design-critic ji vyvrátil (§11):

> **Cena, která je MONOTÓNNÍ funkcí jednoho váženého součtu přes dvojice
> (karta, slot), je sveditelná na ceník.** Práh, rozpočet, kvórum, cap
> i eskalace jsou takové funkce. **Celá rodina „sdílený rozpočet → Žár" je tím
> mrtvá, včetně favorita z Denisina nálezu.**

**Co tvrzení NEpokrývá** (a co jsem původně neoprávněně zahrnul):
- **Nemonotónní funkce součtu.** Skalarizace váženým součtem generuje jen
  **podporované** (na konvexním obalu ležící) Paretovy body; nepodporovaný
  optimální bod nevybere žádné λ (Ehrgott, *Multicriteria Optimization*,
  bikriteriální přiřazovací úloha). Konstrukce existuje — cena rostoucí
  s pásmem umí posadit optimum do `H = 3` tak, že ho žádné pevné λ netrefí.
  Řádek 3 trichotomie (§6) proto padá na **hratelnosti**, ne na struktuře, a
  dokument to původně zaměňoval.
- **Cenu vázanou na vzájemnou polohu karet** (kvadratické členy). „Dvě hlučné
  věci ve dvou skrytých slotech = šerif si všimne" je Žárová osa, a přesto
  není funkcí jednoho součtu. **Empiricky mrtvé je „cena jako funkce zásahů",
  ne „Žár".** Do kanonu smí jít jen tohle užší znění.

### 1.4 Co na to říká kanon

`design-dokument.md` §4.10 problém přiznává: tajné cíle „dávají skrytý důvod
hádat se o konkrétní rozdělení slotu, **zatímco tým optimalizuje globálně**".
Týmová strana je tedy i podle vize optimalizační úloha a hádka je outsourcovaná
na cíle. Denisa má pravdu, že to na pilíř nestačí (2 z 8 cílů nejsou osobní,
`muj-den` je saturovaný, cíl drží vždy jen jeden hráč).

---

## 2. Metrika separability — a proč byla moje první verze tautologie

Předregistroval jsem tři metriky. Jedna z nich byla vadná a **obě nezávislá
měření to našla dřív než já**. Zapisuji to, protože je to cennější než sama
mechanika.

| Metrika | Definice | Stav |
|---|---|---|
| **M1** „je se o čem hádat" | Podíl instancí, kde existuje `H < H*` s `min_cena(H) < min_cena(H*)` — tedy kde **poslední zásah něco stojí**. | ✅ zdravá |
| **M2** „nesveditelnost na ceník" | *(původní)* Existuje λ z mřížky reprodukující pravé optimum? | ❌ **degenerovaná** |
| **M2′** opravená | Existuje **jediné, napříč celým vzorkem pevné** λ, jehož `argmax(H − λN)` je **podmnožinou** množiny pravých optim (konvence *weak*)? `M2′ = 100 % − úspěšnost nejlepšího pevného λ`. | ✅ validovaná |
| **M3** cena naivního postupu | Podíl instancí, kde procházení slotů 0→3 a lokálně nejlepší volba mine optimum. | ✅ zdravá, viz §7 |

**Proč byla M2 tautologie:** pravé optimum jsem definoval **lexikograficky**
(max zásahů, pak min cena) — a to je přesně limita `λ → 0+` téhož ceníku.
Metrika tedy **nemohla** vyjít nenulově pro žádnou mechaniku, ať je jakkoli
nelineární. Naměřeno: λ = 0,25 reprodukovalo optimum ve **100,0 %** instancí
ve všech nastaveních a všech variantách. Kdyby ostatní kritéria prošla, byl
bych „doložil" nesveditelnost číslem, které je nula z definice.

**Dvě opravy, obě vynucené daty:**
1. λ se **nesmí vybírat per instanci** — musí být pevné napříč vzorkem, jinak
   se měří jen to, že existuje *nějaká* cena, ne že ji hráč může znát dopředu.
2. Konvence musí být **weak** („vybere ceník *některé* pravé optimum?"), ne
   *strict* („je množina argmax totožná?"). Kontrolní bod předregistrace tohle
   rozhodl: zamítnutý rozpočtový kandidát dá pod *weak* 0,00 %, ale pod *strict*
   2,9–12,7 % — takže *strict* by propustila i mechaniku, o které analyticky
   víme, že je čistý LAP. **Strict měří jen to, že ceník rozbíjí remízy.**

Pátý předregistrovaný bod druhého kola („kontrola musí dát ≈ 0") tedy udělal
přesně to, co má: **falzifikoval konvenci měření**, ne kandidáta.

---

## 3. Analytické sítko pro další kandidáty (hlavní použitelný výstup)

Než se cokoli měří, musí kandidát projít dvěma otázkami. Obojí je papír, deset
minut, nula tokenů:

- **(a) Je cíl funkcí VÍC než jednoho aditivního součtu přes dvojice
  (karta, slot) — a to i po dosazení reálné ekonomiky pásem?**
  Rozpočty, prahy a capy nad jedním součtem propadají hned tady.
- **(b) Existuje nezanedbatelný podíl instancí, kde tým při realistickém
  směnném kurzu (G ≥ 2 Žáry za zásah) DOBROVOLNĚ obětuje zásah?**
  To je jediná operacionalizace „vazby", kterou ceník nereprodukuje.
  Bez (b) není co měřit.

- **(d) Rozchází se kandidát s `argmax E[H]` i pro REÁLNÝ užitek pásem, ne jen
  pro krajní preferenci?** Doplněno po měření H-1 (§6.2): proti skutečné
  ekonomice pásem se „jistota" a „jackpot" rozcházejí v **0,03–0,07 %**
  instancí, a strop drží i pro absurdní preference. Kdo měří divergenci proti
  umělému cíli (`P(H=4)`, `P(H≥3)`), měří něco, co u stolu nikdo nechce.
  Tohle kolo by se bodem (d) zabilo na papíře.

A jeden **rozpočtový** požadavek, vynucený nálezem §7.1:
- **(c) Kolik Žáru na uzel to sebere nebo přidá?** Každý návrh, který přepisuje
  zdroj Žáru, se měří **nejdřív na Žár/uzel a teprve pak na K1** — jinak se
  daňová sleva čte jako design. Baseline: **0,63 Žáru/uzel u 1p, 0,52 u 4p**
  (přes všechny uzly), resp. **0,77 / 0,59** (jen běžné uzly se 4 kartami).

---

## 4. Kandidát 1 — „RÁMUS" (rozpočet hluku) · ZAMÍTNUT

> Hlučná věc (GANGSTER nebo útok ≥ 4) nasazená do slotu dělá rámus.
> **Jeden rámus na uzel projde, každý další posune šerifa o 2.**

Měřen ve **dvou** definicích hlučného umístění, aby výsledek nestál na jedné
volbě: **V-1a** = hlučná věc ve slotu klíčujícím na útok, **V-1b** = GANGSTER
kdekoli + útok ≥ 4 ve **viditelném** slotu. (V-1b vznikla poté, co jsem
v obsahu našel, že útočný slot je typicky **jeden na situaci** — 15 útočných
slotů na 15 situací —, takže rozpočet 1 by u V-1a nikdy nesevřel.)

### Naměřeno (2 nezávislá měření, každé s vlastním worktree a vlastním harness)

| metrika | baseline | V-1a (útok slot) | V-1b (viditelný slot) | ceník bez rozpočtu |
|---|---|---|---|---|
| **M1** 1p / 4p | 0 / 0 % | 0,5 / 0,4 % | 1,2 / 0,9 % | 21,9 / 19,6 % ·  7,0 / 6,6 %¹ |
| **M2′** (weak) | 0 % | 0 % | 0 % | 0 % |
| aktivační míra | — | 39,9 / 34,6 % | 43,1 / 38,1 % | — |
| „cena maxima" = 0 | — | — | **93–95 %** instancí | — |

¹ dvě měření, dvě definice hlučnosti — čísla se neprůměrují, uvádím obě.

**Strop mechaniky je strukturální, ne kalibrační.** Ve **98,6 %** instancí nelze
vyrobit ani dvě hlučná umístění, takže volný rozpočet 1 spolkne úplně všechno.
Sweep `volnyRozpocet ∈ {0,1,2}` × obě informační hladiny dal **absolutní strop
M1 = 10,6 %** proti gate 30 %.

### Dopad na bránu (2 bloky × 8000 runů/buňka, D31)

| rameno | K1 1p | 2p | 3p | 4p | K6a | K5-D | K2 | medián Žáru |
|---|---|---|---|---|---|---|---|---|
| **A0** baseline | 57,25 | 67,25 | 77,20 | 79,65 | 22,40 | 9,85 | 20,55 | 6 |
| **A2** V-1a + tichý bot | 89,65 | 90,15 | 95,15 | 96,05 | 6,45 | 9,85 | 19,05 | 4 |
| **A2** V-1b + tichý bot | 81,65 | 85,80 | 92,10 | 93,45 | 11,80 | 9,90 | 19,65 | 4 |

Měřidlo sedí (A0 proti publikovaným 57,3 / 67,1 / 77,5 / 79,7), vypínač ověřen
bit-shodou na 1000 runech, bloky spolu souhlasí.

**Rozhodovací páka |K1(tichý) − K1(opatrný)| na 4p = 0,10–0,50 b.** proti gate
3 b. Boti `-tichy` a `-opatrny` dávají v ~99,8 % uzlů **identická přiřazení**.
Volba, kterou vazba měla vytvořit, neexistuje.

**Verdikt: 2/10 a 2/9 předregistrovaných kritérií; oba „kill" body padly.**
Dle vlastního předregistrovaného pravidla se **zamítá, neladí.**

---

## 5. Kandidát 2 — „Rámus se donese, jen když to nevyjde" · ZAMÍTNUT

> Hlučná věc nestojí nic, když uzel dopadne dobře. Když skončí v pásmu
> **S_NÁSLEDKY nebo PRŮŠVIH** (≤2 zásahy), zaplatí tým za každé hlučné
> umístění 2 Žáry. *(`Žár += c·N·[H ≤ 2]` — funkce DVOU součtů, tedy podle
> §1.3 formálně mimo zabitou rodinu.)*

Fikce byla dobrá („když to zvládnete čistě, nikdo se neptá") a útes
`H=2 → H=3` vypadal jako velký dramatický stakes: *„Když to dáme na tři, rámus
nám projde."* Analyticky jsem si ověřil, že žádné pevné λ nereprodukuje optimum
napříč instancemi. **Měření to vyvrátilo.**

| | 1p | 4p |
|---|---|---|
| M1′ (množinová, dle zadání) | 19,15 % | 16,76 % |
| **M1 silná** (pravé optimum má **striktně nižší** H než maxH) | **0,00 %** | **0,00 %** |
| **M2′** (weak, pevné λ) | **0,00 %** | **0,00 %** |
| útes dosažitelný | 35,3 % | 37,2 % |
| aktivace (`hlucnyUtokPrah = 3`) | 74,6 % | 70,2 % |

**Proč to padlo — cena mizí přesně tam, kde leží optimum.** Při `H ≥ 3` je cena
nulová, takže množina optim je totožná s „max H"; při `H ≤ 2` je cena lineární
v jednom součtu, takže zase LAP. Podmíněnost se vypaří v obou režimech.
Pevné **λ ∈ [0,1; 0,75] vybralo pravé optimum ve 100,00 %** z 20 006 instancí,
ve všech osmi kombinacích sweepu. Těch 19 % v M1′ jsou **výhradně urovnané
remízy** mezi stejně dobrými max-H rozděleními — volba `H` se nemění nikdy.

**A nejtvrdší test, který kandidátovi nejvíc fandil:** ex ante (hráč prahy
nezná, vidí kotvu a trend) má cíl tvar `G·E[H] − c·N·P(H ≤ 2)`, kde
`P(H ≤ 2)` je sdružená pravděpodobnost přes všechny čtyři sloty — **skutečně
neaditivní člen.** Spočteno přesně (Poisson-binomická konvoluce): M2′ vychází
**0,00–2,0 %** při realistickém kurzu a maximálně 6,5 % při nehájitelném kurzu
1:1. Vazba, kterou nejistota vytváří, je matematicky reálná, ale **numericky
pod rozlišením rozhodnutí u stolu.**

---

## 6. Co z toho plyne — trichotomie a jediná otevřená cesta

Zamítnuté varianty nebyly dvě náhodné střely. Dohromady vymezují prostor:

| Jak se cena chová vůči zásahům | Příklad | Co se stane |
|---|---|---|
| **nezávislá** na zásazích | RÁMUS (rozpočet, ceník) | funkce jednoho součtu → **ceník** (§1.3) |
| **klesá** s úspěchem | „donese se, když to nevyjde" | cena mizí v optimu → **ceník** (§5) |
| **roste** s úspěchem | „hlasitá výhra přitáhne pozornost" | **strukturálně by fungovala** (nemonotónní, viz §1.3) — padá ale na hratelnosti: pobízí **záměrně selhat** |

**Závěr v opraveném, užším znění (kritik §11 širší verzi vyvrátil): cena, která
je funkcí POČTU ZÁSAHŮ, separabilitu neopraví — ať se zavěsí kamkoli. O ceně
vázané na vzájemnou polohu karet to nic neříká; ta zůstává neprozkoumaná
a projde sítkem §3.** Zbývají dvě strukturálně jiné cesty a ani jedna není
„jedna mezislotová vazba" v duchu mandátu:

### 6.1 N-1 „Krytí" — kvadratická vazba v samotném počítání zásahů

> **Co se dělá potají, platí jen tehdy, když ten vpředu obstojí.**
> Skrytý slot se počítá jako zásah pouze tehdy, když jeho *párový* viditelný
> slot prošel.

Hodnota je `Σ hit_vid + Σ hit_skr · [hit_pár]` — **součin rozhodovacích
proměnných**, tedy kvadratická přiřazovací úloha, kterou LAP z principu
neřeší. Projde sítkem (a): ano, není to funkce jednoho součtu.

**Ale defekt A neřeší** — pořád se maximalizuje jediné číslo (efektivní
zásahy). Dělá úlohu *těžší*, ne *spornější*, a těžší úloha quarterbackingu
pomáhá. Navíc je to zásah do jádra resoluce (`bandFromHits`,
`maxAchievableZasahy`, celý oracle K5), tedy plná rekalibrace, ne knob. Fikce
je přitom výborná a K5 riziko (mrtvé uzly, když viditelné sloty nejdou trefit)
je měřitelné. **Nedoporučuji jako další krok** — cena je řádově vyšší než
cokoli v tomto kole a defekt A zůstává.

### 6.2 H-1 „Vazba už tam je, jen ji nikdo nevidí" — ZMĚŘENO, ZAMÍTNUTO

Pásma (`4 / 3 / 2 / ≤1`) jsou **skoková** funkce zásahů. Pod nejistotou
(prahy jsou skryté) proto **maximalizovat očekávané zásahy NENÍ totéž co
maximalizovat pravděpodobnost pásma** — a „jak rozložit pravděpodobnost přes
čtyři sloty" je z podstaty neaditivní úloha, kterou žádný ceník nereprodukuje.

Hypotéza tedy zněla: **mezislotová vazba v té hře už dnes je, jen ji nevidí ani
bot, ani hráč** — a Denisin nález je pak správně vyslovený, ale špatně
adresovaný: díra v **čitelnosti**, ne v mechanice, s levným lékem v UI.

**Změřeno (2 × 20 000 instancí, přesná Poisson-binomická konvoluce, žádné plné
dávky). Oba kill-body padly, hypotéza se zamítá.**

| # | kritérium (předregistrováno) | práh | naměřeno 1p / 4p | verdikt |
|---|---|---|---|---|
| 1 | divergence argmaxů, přísně (prázdný průnik) | ≥ 20 % | **13,65 / 14,99 %** | ❌ kill |
| 2 | medián velikosti sázky u divergentních | ≥ 5 p. b. | **4,80 / 4,80** | ❌ kill |
| 3 | M2′ pro `P(H ≥ 3)` (pevná per-slot funkce `w`) | ≥ 10 % | 10,69 / 9,92 % | ⚠ na hraně |

**Co ji zabilo, není práh, ale referenční cíl.** Tři předregistrované dvojice
(`E[H]` vs `P(4/4)` vs `P(≥3)`) měřily **krajní** preference, jaké žádná reálná
výplatní struktura nevyrábí. Proti skutečné ekonomice pásem (vzato
z `applyBandConsequences`) se `argmax E[H]` a `argmax E[užitek]` rozcházejí
v **0,03–0,07 %** instancí. A je to strukturální strop, ne kalibrace: i při
absurdním LOOT = 1000 se divergence zastaví na 7,2 %, při katastrofické averzi
(PRŮŠVIH = −1000) na 0,9 %. Důvod: Poisson-binomické rozdělení se s rostoucím
`Σp` posouvá téměř stochasticky dominantně, takže **každá rozumně monotónní
preference maximalizuje totéž přiřazení jako `E[H]`.**

Dvě věci, které z toho měření odcházejí jako cenné:
- **První nenulové M2′ v celé této linii** (~10 % pro `P(H ≥ 3)`). Matematika
  vazby je tedy reálná — „hlavně bez postihu" opravdu není žádná pevná
  monotónní bodová funkce per slot. Jen je ta vazba **vzácná a malá**, a cíl
  `P(H ≥ 3)` sám o sobě cílem týmu není. Není to „skoro máme neseparabilitu".
- **Faktická oprava mé premisy:** gate-ový bot `kompetentni` **nemaximalizuje
  očekávaný průchod** — jede přes součet syrových statů (`assign.js:91,124`);
  `expectedPass` používá jen bot `memorizacni`. A přesto trefí `argmax E[H]`
  v 92–94 % instancí. To je nezávislý doklad, že úloha je ceník: i hrubý
  `Σ stat` je téměř dokonalá náhražka pravděpodobnostního optima.

**Důsledek pro lék:** ukázat hráči šance na pásmo by mu v ~99,95 % uzlů řeklo
totéž, co už mu říká `Σ stat`. Navíc — a to je vážnější námitka kritika (§11) —
kalkulačka šancí koliduje s D51 (z vypsané pravděpodobnosti se zpětně dopočítá
kotva i šum), má změřený precedent D48/D50 (se čtením naplno šla 4p win-rate
na 86,8 %) a **rozdala by hráčům přesně ten nástroj, kvůli kterému si §1.1
stěžuje na quarterbacking.** Lék se tímto stahuje.

---

## 7. Vedlejší zjištění (nevyžádaná, ale důležitá)

### 7.1 „Přesun ceny, ne daň" byl fakticky nepravdivý — a je to poučení, ne detail

Napsal jsem do zadání, že RÁMUS jen přesouvá cenu z commitu na rozdělení.
Realita: dnešní pravidlo účtuje **každou** hlučnou committnutou kartu
bezpodmínečně (0,52–0,63 Žáru/uzel), RÁMUS z toho účtu **zrušil ~98 %**.
Medián Žáru 6 → 4, tým skoro nenarazí na prahy trati, **K1 vylétlo o 24–32
bodů** (1p až na 89,7 %). Pásma běžných uzlů se přitom nezměnila ani o desetinu
procenta — obtížnost uzlu zůstala, změnila se **jen trať**.

Přehlédnout to bylo triviálně snadné, protože ta věta zní jako účetní
neutralita. Odsud pravidlo **(c)** v §3.

### 7.2 K6a 22,4 → 6,45 NENÍ výhra

V jednom rameni K6a „splnilo" gate. Je to artefakt: všechny čtyři počty se
posadily na 90–96 %, takže spread nemá kam růst. **Saturace u stropu, ne
parita.** Zapisuji, aby to někdo příště nevytáhl jako precedens.

### 7.3 Ceník bez rozpočtu je K1 páka — informativně, NEdoporučuji

Sweep ceny za hlučné umístění bez rozpočtu:

| cena | 1p | 2p | 3p | 4p | K6a |
|---|---|---|---|---|---|
| 2 | 55,0 | 64,8 | 73,3 | 75,25 | 20,25 |
| **3** | **47,2** | **60,0** | **68,2** | **70,1** | 22,90 |
| 4 | 43,35 | 57,0 | 64,3 | 66,85 | 23,50 |

Při ceně 3 jsou **poprvé od pádu `prahOffsetDlePoctu` (D38) všechny čtyři počty
uvnitř gate [45, 70]** (4p 70,1 na hraně). **Ale K6a zůstává 22,9** — cena
působí na všechny počty stejně, je to knob **obtížnosti, ne rovnosti**, a se
separabilitou nedělá nic. Uvádím to výhradně proto, že by bylo nepoctivé to
zamlčet: **kalibrace je zavřená (D39) a její znovuotevření je rozhodnutí
uživatele, ne můj default.**

### 7.4 Aktivační strop je obsahový

V 47–65 % instancí neexistuje **žádné** možné hlučné umístění (5/40 věcí je
GANGSTER, útok ≥ 4 má menšina karet). Jakákoli budoucí vazba stavěná na
„hlučnosti" narazí na tuhle hustotu dřív než na cokoli jiného. Snížení
`hlucnyUtokPrah` na 3 zvedne aktivaci na 70–75 % — je to knob, ne obsah.

### 7.5 Přiznaná díra v měřicím panelu: chybí K3 (nález kritika)

§4 i §7.3 reportují K1, K6a, K5-D, K2 a medián Žáru — ale **ne K3**
(*medián uzlu 1. překročení prahu Zátah ∈ {3,4}*), tedy jediný gate, který je
přímou funkcí rychlosti akumulace Žáru. Přitom obě ramena s ním hýbou, a to
**opačně**: RÁMUS srazil medián Žáru 6 → 4 (Zátah přijde později), ceník 3 bez
rozpočtu je proti `rules.js` ztrojnásobení sazby (Zátah přijde dřív,
pravděpodobně už na uzel 2). **Dokud tam K3 — a K5f, jehož mix finálových
střetů závisí na prazích trati — není, je §7.3 nedoložený.** Nemění to verdikt
u kandidátů (ti padli na M1/M2′, tedy před branou), ale znamená to, že
**vedlejší K1 páka ze §7.3 není proměřená a nesmí se tak prezentovat.**

### 7.6 M3 baseline 25–28 % — nepřenositelnost už existuje

Naivní postup „projdi sloty zleva a dej do každého lokálně nejlepší kartu"
mine optimum ve **25–28 %** běžných uzlů. Není pravda, že by dnešní rozdělení
bylo triviální; je pravda, že je **jednokriteriální**. Tohle číslo je zároveň
argument, proč se defekt A a defekt B nesmí zaměňovat — a proč M3 doporučuji
vést dál jako diagnostiku.

---

## 8. Co navrhuji uživateli rozhodnout

1. **Uzavřít rodinu „rozpočet → Žár" jako zamítnutou** (včetně Denisina
   favorita), s odkazem na důkaz v §1.3 a čísla v §4–5. Není to kalibrační
   pád, je to strukturální.
2. **Přijmout sítko §3 jako standard** pro každý další kandidát na mezislotovou
   vazbu (a bod (c) pro každý zásah do zdroje Žáru).
3. **Vzít H-1 (§6.2) jako uzavřenou slepou cestu.** Nález Denisy P0/#1 **není**
   adresovatelný jako díra v čitelnosti; navržený UI lék se stahuje (koliduje
   s D51, má precedent D48/D50 a rozdával by kalkulačku quarterbackovi).
   Pilíř „hádka o rozdělení" tím **dál stojí na tajných cílech** — a to je
   stav, který je potřeba přiznat, ne přelakovat.
4. **N-1 „Krytí" (§6.1) nezadávat teď.** Je to jediná prokazatelně
   nesepararabilní cesta, ale stojí plnou rekalibraci a defekt A neřeší.
   Do backlogu, ne do fronty.
5. **Opravit lživý komentář** ve `state.js:582` („assignované karty" →
   „committnutá sada") bez ohledu na osud návrhu. Malá věc, ale příště na ni
   naletí zase někdo.
6. **Rozhodnout, jestli se mandát D52(3) přeformuluje.** Kritik i benchmark
   míří jedním směrem: hádka nevzniká z **nerozložitelného cíle**, ale
   z **rozcházejících se cílů nebo informace**. Hanabi (nevidíš vlastní ruku),
   The Crew (jeden žeton komunikace), Magic Maze (ticho) — tření je
   z asymetrie. Pandemic má sdílené, plně viditelné optimum a je učebnicovým
   případem alfa hráče. **Úspěšná mezislotová vazba by quarterbacking
   zhoršila, ne zlepšila** — dělá úlohu těžší, a těžší úloha nahrává tomu, kdo
   počítá nejlíp. Jestli se má něco otevřít, je to **osa tajných cílů**
   (dnes 2 z 8 neosobní, `muj-den` saturovaný, jeden cíl na hráče) — ale to
   je rozhodnutí uživatele proti D44, ne můj default.

## 9. Dopad na kanon

**Žádný — nic se nepřijímá, takže se nic nemění.** Kontrola konzistence obou
dokumentů proto hlásí jen dvě věci, které platí *nezávisle* na tomto kole:

- `design-dokument.md` §4.9 a `prototyp-mvp.md` §Žár říkají, že Žár roste za
  „hlučné hraní (zbraně, silně útočné karty)". Oba dokumenty jsou vůči kódu
  **správně**, ale nikde neříkají, že je to vlastnost **commitu**, ne
  rozdělení. Doporučuji do obou doplnit tři slova („za committnuté karty") —
  bez toho čte každý nový člověk tutéž iluzi, kvůli které vzniklo tohle kolo.
- M1, M2′ a M3 doporučuji vést jako **diagnostiku vedle K6b**, ne jako nový
  gate. Bránu kvůli vyvrácené hypotéze nepřepisuji.
- Křížové odkazy v patičkách beze změny. `obsah/*.yaml` nedotčen.

## 10. Otevřené otázky

1. **Je „hádka o rozdělení" vůbec mechanický problém?** Simulace umí ukázat
   jen existenci a dopad rozhodnutí. Že by se lidé přeli, neprokázala ani
   nevyvrátila — a nízké M1 dokazuje jen tolik, že *tyhle dvě mechaniky*
   nepřidávají sdružený trade-off, ne že je dnešní rozdělování nudné.
2. **Kdyby se M1 podařilo dostat na 40 %, byla by to pořád jen hypotéza
   čekající na lidi.** Stojí za to do lidské brány předregistrovat pozorování
   *„podíl uzlů, kde padne aspoň jedna vyslovená námitka k rozdělení"*? Bez
   něj nemáme na tenhle pilíř žádné měřidlo kromě dojmu.
3. **Sólo.** Nález #1 je v sólu neviditelný (jeden vlastník = žádné
   vyjednávání), a sólo je jediná pravidelně testovaná buňka. Cokoli se
   z tohohle kola nakonec udělá, potvrdit se to dá jen sezením se 2–3 lidmi.

---

## 11. Verdikt design-critica

*Prověrka proběhla nad verzí dokumentu před doplněním H-1. Body 1, 3 a 5 jsou
do textu výše zapracované (§1.3, §6, §6.2, §7.5, §8/6); bod 2 měření mezitím
potvrdilo z jiné strany. Verdikt uvádím v původním znění.*

Návrh je poctivější než většina toho, co tímhle projektem prošlo — sám si zabil
dvě mechaniky a jednu vlastní metriku. Přesto ho v předložené podobě
**nedoporučuji přijmout jako celek**: hlavní tvrzení (§1.3 + §6) je formulované
silněji, než co bylo dokázáno, jediná otevřená cesta (§6.2) má tutéž vadu, kvůli
které padla M2, a měřicí panel §4/§7.3 vynechává gate, který obě ramena hýbou
nejvíc.

**KRITICKÉ — důkaz v §1.3 neplatí v rozsahu, v jakém ho §6 používá.** Věta
„optimum leží na Paretově hranici *(zásahy, Σ cena)* a tu generuje rodina
`H − λN`" je u kombinatorické úlohy nepravdivá: skalarizace váženým součtem
generuje **jen podporované** (konvexně obalené) Paretovy body; nepodporované
body žádné λ nevybere (Ehrgott, *Multicriteria Optimization*, bikriteriální
přiřazovací úloha — standardní protipříklad). Konstrukce v tomto rozsahu:
`N*(2)=0, N*(3)=5, N*(4)=6` a pásmová cena rostoucí s úspěchem
(`c(4)=4, c(3)=0,2`) dá optimum v `H=3`, které **nereprodukuje žádné pevné λ**.
To je přesně řádek 3 vlastní trichotomie, odbytý větou „uvnitř každého pásma
zase lineární" — rozhodnutí ale neleží uvnitř pásma, leží **mezi** pásmy. Řádek
3 tedy padá na hratelnosti („pobízí záměrně selhat"), ne na struktuře,
a dokument to zaměňuje.
Horší je overreach v §6: trichotomie má osu „jak se cena chová vůči
**zásahům**" — nemůže tedy říct nic o ceně vázané na **vzájemnou polohu karet**.
„Dvě hlučné věci ve dvou skrytých slotech = šerif si všimne" je Žárová osa, je
kvadratická v rozhodovacích proměnných úplně stejně jako N-1 z §6.1, a projde
sítkem (a). Věta *„druhá osa postavená na Žáru separabilitu neopraví, ať se
zavěsí kamkoli"* je tím vyvrácená. Empiricky mrtvé je **„cena jako funkce
zásahů"**, ne „Žár". Do kanonu se smí zapsat jen to užší znění — širší by
v budoucnu zabilo návrhy, které tenhle důkaz nikdy netestoval.

**KRITICKÉ — H-1 (§6.2) opakuje vadu M2 na jiném místě.** Předregistrované
kritérium měří rozpor `argmax E[H] ≠ argmax P(4/4) ≠ argmax P(≥3)`. Jenže
`E[H] = Σ p_ij` a `log P(4/4) = Σ log p_ij` — **obojí je ceník**, jen s jinou
cenovkou. Kritérium tedy započítá jako „nesveditelnost" rozdíl mezi dvěma
ceníky a při ≥ 20 % projde ze stejného důvodu, z jakého M2 vycházela nula:
špatně zvolená referenční třída. Správný null model není `H − λN`, ale
**`Σ φ(p_ij)` pro libovolné pevné φ**. A tady je to zabijácké: `assign.js:98–107`
počítá `p = hits/(2R+1)` s `R = 2`, takže **p nabývá právě šesti hodnot**
(0; 0,2; …; 1). Jakákoli riziková preference je stlačitelná do
**šestipoložkové tabulky**, kterou lze vyhledat hrubou silou a naučit se ji
nazpaměť. Než se H-1 změří, musí se předregistrovat: *existuje pevné monotónní
φ na šestiprvkové mřížce reprodukující pravý argmax (weak) v ≥ X %?* Bez toho
měření neplatí.
A druhá půlka: navržený lék („ukázat, co která volba dělá se šancemi na pásmo")
**není čitelnost, je to zásah do brány**. (1) Koliduje s D51 — z vypsané
pravděpodobnosti si hráč zpětně dopočte kotvu i šum, což je únik silnější než
původní zobrazení prahu. (2) Precedent D48/D50 je změřený: se čtením naplno šla
4p win-rate na 86,8 %, proto se z toho stalo *Ulehčení* v kolonce Obtížnost.
Kalkulačka šancí udělá totéž a K1 3p/4p, které už breachuje nahoru
(77,5 / 79,7), pošle výš. (3) Nejhorší: §1.1 si stěžuje, že úloha je
spočitatelná, tedy palivo quarterbackingu — a lék hráčům **rozdá kalkulačku**.
To je vnitřní rozpor návrhu, ne detail.

**KRITICKÉ — panel „Dopad na bránu" je neúplný přesně tam, kde to bolí.** §4
i §7.3 reportují K1, K6a, K5-D, K2 a medián Žáru. Chybí **K3** (`medián uzlu
1. překročení prahu Zátah ∈ {3,4}`) — jediný gate, který je přímou funkcí
rychlosti akumulace Žáru. RÁMUS srazil medián Žáru 6 → 4 (K3 se posouvá
pozdě), ceník 3 bez rozpočtu je proti `rules.js` (`zaGangster: 1`,
`zaHlucnyUtok: 1`) **ztrojnásobení sazby** (K3 se posouvá brzy, pravděpodobně
na uzel 2). Obě ramena tedy K3 hýbou opačně a ani jedno ho nemá změřené. Dokud
tam K3 (a K5f, jehož mix finálových střetů závisí na prazích trati) není, je
§7.3 nedoložený.

**VÁŽNÉ — mandát D52(3) je špatně položený a §8 to má říct.** Separabilita není
příčinou chybějící hádky. Hádka vyžaduje **rozcházející se cíle nebo
informaci**, ne nerozložitelný cíl. Dokument to sám vysloví u N-1 („těžší úloha
quarterbackingu pomáhá") a pak to neaplikuje na zadání. Benchmark je
jednoznačný: Hanabi (nevidíš vlastní ruku), The Crew (komunikace na jeden
žeton), Magic Maze (ticho + reálný čas) — tření vzniká z asymetrie, ne z tvaru
optima; Pandemic má sdílené, plně viditelné optimum a je učebnicovým případem
alfa hráče na BGG. „Jedna mezislotová vazba" by při úspěchu quarterbacking
**zhoršila**. Jediné existující zařízení na divergenci ve hře jsou tajné cíle
a ta jsou přiznaně tenká (2 z 8 neosobní, `muj-den` saturovaný, jeden cíl na
hráče). Jestli se má něco otevřít, je to tahle osa — ale to je rozhodnutí
uživatele proti D44, ne default.

**VÁŽNÉ — §7.3 je poctivé v disclaimeru, zavádějící v rámování.** Táž K1 páka
není „ceník bez rozpočtu" (nová mechanika), ale **cena**: `zaHlucnyUtok: 1→2` /
`zaGangster: 1→2` v `rules.js`, nula nového designu, nula dotyku obsahu. Tím
tohle kolo **falzifikuje formulaci D38/D39** „jediná páka bez dotyku obsahu je
proměřená a vyčerpaná" — druhá existuje, jen nefixuje K6a (a nejspíš rozbije
K3). Zápis do záznamu ano; jednání ne, kalibrace je zavřená.

**DROBNÉ — M1 je oracle-vázaná.** Počítá se nad známými prahy, zatímco
rozhodnutí u stolu je pod nejistotou; §5 to obchází ex-ante výpočtem, ale
u kandidáta 1 gatoval oracle. Skutečně rozhodující důkaz v §4 je
**behaviorální**: `|K1(tichý) − K1(opatrný)| = 0,10–0,50 b.` a **99,8 %
identických přiřazení**. Tím se má argumentovat a tuhle divergenci dvou botů
s různou posturou vést jako diagnostiku vedle K6b — M1 nikoli. (Je to potřetí,
co v tomhle projektu selhala předregistrace, ne mechanika; a podruhé, co je
lékem divergence proti nullu.)

Souhlasím bez výhrad se zamítnutím obou kandidátů, se sítkem §3 včetně bodu
(c), s odložením N-1 (defekt A neřeší, cena je plná rekalibrace — to není
alibismus, to je správná cena), s opravou komentáře v `state.js:582`
a s doplněním „za committnuté karty" do §4.9 a MVP.

Tři otázky, které musí padnout dřív než další měření: **(1)** Zapisuje se do
kanonu užší znění („cena jako funkce zásahů je sveditelná na ceník"), nebo trvá
autor na širším, které je vyvrácené pairwise protipříkladem? **(2)** Má se H-1
vůbec měřit, když jeho jediný levný lék porušuje D51 a hýbe K1 — a je někdo
ochoten předregistrovat správný null `Σ φ(p)` nad šestiprvkovou mřížkou dřív,
než čísla dorazí? **(3)** Přeformuluje se nález Denisy P0/#1 z „chybí
mezislotová vazba" na „chybí divergence cílů", a otevírá se tím osa tajných
cílů proti D44 — nebo se pilíř „hádka o rozdělení" přizná jako **nepodložený**
a jde se na lidskou bránu s tím, že ho testuje sezení, ne simulace?

### 11.1 Moje odpověď na tři otázky kritika

1. **Zapisuje se užší znění.** Opraveno v §1.3 a §6 ještě před commitem;
   pairwise cena zůstává výslovně neprozkoumaná, ne mrtvá.
2. **H-1 se změřilo — a kritikova námitka se potvrdila z jiné strany.**
   Správný null (`Σ φ(p)` nad pevnou funkcí) vyšel 100% úspěšný pro `E[H]`
   i pro `P(H=4)`; jediné nenulové M2′ (~10 %) drží `P(H ≥ 3)`, a to není cíl
   týmu. Lék se stahuje ze všech tří důvodů, které kritik uvádí.
   **Kritikova diagnóza „stejná vada jako u M2" byla správná.**
3. **Navrhuji přeformulovat nález, ne pilíř.** Denisa P0/#1 → *„nechybí
   mezislotová vazba, chybí divergence cílů"*. Osu tajných cílů otevřít proti
   D44 může jen uživatel; do té doby se pilíř „hádka o rozdělení" vede jako
   **nepodložený simulací** a testuje ho lidské sezení (§10, otázka 2).

---

*Souvisí: [[../projekt/rozhodnuti|projekt/rozhodnuti.md]] (D38, D39, D51, D52) ·
[[../prototyp-mvp|prototyp-mvp.md]] (K1, K2, K5, K6a, K6b) ·
[[../design-dokument|design-dokument.md]] (§4.3, §4.9, §4.10)*
