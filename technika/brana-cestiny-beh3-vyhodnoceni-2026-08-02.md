# Brána češtiny — 3. běh (prompt v0.4.2), vyhodnocení

**Log:** `prototyp/logs/brana-cestiny-2026-08-02.md` · Haiku 4.5 · t = 0,5 ·
13 casů × **1 generace = 13 generací** · vstup z `buildPromptInput()`
**Předchozí kola:** `brana-cestiny-vyhodnoceni-2026-08-02.md` (1. běh),
`brana-cestiny-ab-2026-08-02.md` (A/B teploty, 2. běh)

## VERDIKT BRÁNY: **NEPROŠLA** (0/13), stop podmínka **PADLA na obou metrikách**

Ale doporučení **není eskalace na dražší model** — viz §4. Tři z pěti zásahů
v0.4.2 mají doložený, levný a nevyzkoušený prompt fix, a jeden zásah je
**měřitelná vlastní regrese**. Eskalovat teď znamená koupit si silnější model,
aby zakryl brzdu délky, kterou jsme si sami odstranili.

---

## 1. Stop podmínka (předregistrováno v changelogu v0.4.2)

Definice počítala **39 generací** (13 casů × 3). Běh dodal **13** (1 na case) —
protokol nebyl dodržen. Jmenovatel je proto 13; práh ≤2/39 = 5,1 % odpovídá
**≤0,67 z 13**, tj. fakticky 0. Uvádím i absolutní práh ≤2, aby se verdikt
nedal zpochybnit volbou přepočtu.

| metrika | naměřeno | práh (absolutní ≤2) | práh (poměrný ≤0,67) | výsledek |
|---|---|---|---|---|
| **formátový šum** — striktně dle znění (markdown nadpis / rubrika / odrážka / strojový blok následků) | **5/13** | ✗ | ✗ | **PADLA** |
| **formátový šum** — dle rule 1 (i „hlaviček") | **13/13** | ✗ | ✗ | **PADLA** |
| **vymyšlená příčina** | **13/13** (12/13 nejstriktněji) | ✗ | ✗ | **PADLA** |

Efekt je tak velký, že **n=1 na buňku ho nevysvětlí** — verdikt na obou metrikách
platí i přes nedodržený protokol. Rozlišení „striktně vs. dle rule 1" verdikt
nemění ani v jednom směru, takže se o něj není třeba přít.

**Vymyšlená příčina je nejtěžší nález celého kola: 8/13 → 13/13.** Zásah (2)
(vytažení zákazu na samostatnou závěrečnou větu rule 5) **nezabral, a ukazuje
opačným směrem.** Při n=1 to nehlásím jako prokázanou regresi, ale jako
„nezlepšilo se, a data ukazují k horšímu".

## 2. Per-case tabulka

Délky měřeny skriptem nad logem, **bez titulkového řádku** (aby se strop neměřil
na formátovém šumu). Medián **1079 zn.**, 11/13 přes strop 900.

| # | case | zn. | vět | šum | příčina | jazyk | nejtěžší nález | verdikt |
|---|---|---|---|---|---|---|---|---|
| 1 | banan-utok-selhal | 986 | 9 | hlavička | ✗ | — | „Vozidlo bylo vytaženo bez dalších komplikací" po selhaném „Zapřáhnout"; banán jako „k incidentu nedošlo" | **KRITICKÉ** |
| 2 | brokovnice-auto-fail-viditelna | 1069 | 9 | **md + strojový blok** | ✗ | „Banánovým kaňonem" | vymyšlená přestřelka a zlomené žebro; strojový souhrn s „postup o 2 pole" | VÁŽNÉ |
| 3 | hladky-pruchod-loot | **897** ✓ | 7 | **md** | ✗ | „v tieni" | „statku Novotného, **okres Brandýs**"; prošlá brokovnice psaná jako „k incidentu nedošlo" | VÁŽNÉ |
| 4 | slozeni-lezi-v-aute | 1079 | 8 | hlavička | ✗ | „lehkou mozkovou poranění" | **„strážníci jej zadrželi"** (rule 4) | **KRITICKÉ** |
| 5 | fikce-veci-vs-mechanika | **852** ✓ | 6 | hlavička | ✗ | „kolárem" | „nezdařil, **neboť předmět nebyl k takovému účelu vhodný**"; „tři ze čtyř prvků schématu" | VÁŽNÉ |
| 6 | invence-selhany-slot | **1236** | 11 | **md** | ✗ | „lampa jej vypadla" | **„byl podezřelý A zadržen"** hned v 1. větě (rule 4) | **KRITICKÉ** |
| 7 | solo-jedna-osoba | 1157 | 9 | hlavička | ✗ | **„koláerkem"**, „podezřelý zmást papírem" | nonword + rozbitá syntax; „o dvě pole" | **KRITICKÉ** (jazyk) |
| 8 | zachrana-vytazena-vec | 1154 | 11 | hlavička | ✗ | „dědkův kabát" | PRAVIDLO RUNU nezapsáno, nahrazeno vymyšlenou příčinou („doklady nejsou v pořádku") | VÁŽNÉ |
| 9 | gap-proti-maximu | 1041 | 9 | hlavička | ✗ | **„výstřel se neminul cíle"** | **popsaný výstřel z banánu** (explicitní nesmí) + věta si protiřečí | **KRITICKÉ** |
| 10 | bez-gapu-neslo-to-lepe | 1091 | 9 | hlavička | ✗ | — | mechanicky **čistý**; padá jen na délce, hlavičce a příčinách | VÁŽNÉ |
| 11 | past-vymysleny-dusledek | 1117 | 9 | hlavička | ✗ | „s pěti bedny" | **„(Hluk byl nezbytný…)" při KLESAJÍCÍM Žáru**; „zůstává **identifikován**" (rule 4) | **KRITICKÉ** |
| 12 | invence-nesmi-opsat-text | 1014 | 7 | **md (bold)** | ✗ | „jménem neuvedeno" | **„Hlídač zůstal v bezvědomí"** — spící hlídač popsán jako sražený | **KRITICKÉ** |
| 13 | solo-bohate-strop-delky | 1095 | 10 | **md** | ✗ | „zamotat hlavu", „kněžského kolárek" | **„Výstřel zaznamenán."** (explicitní nesmí); „pohybem Žáru" | **KRITICKÉ** |

**KRITICKÉ: 7/13** (1, 4, 6, 7, 9, 11, 12, 13 — case 7 kritický jazykem, ne pravidlem)
· předchozí běh 6/13 → **beze zlepšení**. Bez nálezu: **0/13**.

## 3. Osy mimo stop podmínku

**Mechanika — jádro drží potřetí.** Obrácení výsledku **0 z 52 slotů** (třetí běh
v řadě). Past `past-vymysleny-dusledek` obstála v obou směrech: bedna se
neztratila, Žár klesl o sedm. Auto-fail brokovnice i kolárek proti fikci věci
drží. **Princip „mechanika rozhoduje, AI vypráví" na Haiku funguje.**

**Zamlčení/změkčení (třída §I4) — mírné zlepšení, ne vyřešeno: 4/13.** Nová
pozitivní věta rule 3 zabrala částečně; zbývá tvar „k incidentu však nedošlo"
(casy 1, 3) — selhaný i **prošlý** slot vyprávěný jako netestovaný. U casu 1 je
to KRITICKÉ, protože závěrečná věta výsledek fakticky obrací.

**Čeština — REGRESE: ~2/13 → 7/13 tvrdých vad** při **nezměněné teplotě 0,5**
(casy 3, 4, 7, 9, 11, 12, 13). Nonwordy („koláerkem"), slovakismus („v tieni"),
rozbitá syntax („zamotat hlavu", „podezřelý zmást papírem"), rozpadlá shoda
(„lehkou mozkovou poranění", „s pěti bedny"), věta bez významu („výstřel se
neminul cíle"). Cizí písmo nezaznamenáno.

**Strop 900 — nedrží: 11/13 přes, medián 1079 zn.** (A/B rameno A mělo medián
866). Vědomě přijaté riziko zásahu (4) se naplnilo a je větší, než se čekalo:
**+25 % délky**. Věty 6–11, medián 9.

**Jmenování věcí doslovně (zásah 3) — jediný zásah s kladným signálem.** Věc ze
slotu úplně zmizí už jen ve ~3/13 (dřív 5–6/13); casy 6, 10, 12, 13 mají 4/4.
Zbytek selhání se ale **přestěhoval z „chybí" do „zkomolené"** (kaňon, koláerkem,
kolárem, dědkův) — tj. z osy pravidel na osu jazyka (vzorec E1b/I5).

**NOVÝ NÁLEZ — herní slovník v próze: 6/13.** „postup o 2 pole", „o dvě pole",
„o sedm polí", „pohybem Žáru", „tři ze čtyř prvků schématu". **Jednotka „pole"
je deskovkový pojem bez dobového významu** — vyšetřovatel v roce 1930 ho napsat
nemůže. Iluzi protokolu to trhá stejně silně jako markdown hlavička a hráč to
vidí bez znalosti vstupu. Prompt to nikde nezakazuje.

**Rule 4 (zadržení / ztotožnění): 3/13** — „strážníci jej zadrželi", „byl
podezřelý A zadržen", „zůstává identifikován". Beze změny; v0.4.2 na rule 4
vědomě nesáhla.

**Vymyšlená jména a místa: 3/13** — odložený kandidát na v0.4.3 potvrzen a je
horší, než se čekalo: **„okres Brandýs"** je česká správní jednotka ve státě
New York, tedy nález dobovosti, ne jen jména.

**Závorka vyšetřovatele: 13/13** — podpisová figura drží všude, i při 1236 zn.
Pořadí škrtání (rule 8) nebylo testováno, protože se nic neškrtalo.

**Diagnostiky (mrtvá vstupní pole — třetí měření):** `ZÁCHRANA` 0/2 ·
gap proti `MAX DOSAŽITELNÉ` 0/3 · `kredity` 2/13, a **obě zmínky jsou uvnitř
formátového šumu** (strojový blok / „na šesti kredity"). Kredity tedy nejsou
mrtvé, ale jejich jediný projev je ten kanál, který se snažíme zavřít.
`loot` si model nevymyslel 13/13 ✓. **Doporučení: ZÁCHRANU a MAX DOSAŽITELNÉ
ze vstupního formátu vyřadit** — tři nezávislá měření, nula zápisů, platí se
za ně v každém volání.

## 4. Proč NEdoporučuji eskalaci (a co doporučuji místo ní)

Stop podmínka říká: padne-li metrika, jde o **strop schopnosti modelu** a dalším
krokem je eskalace. **Tento závěr z dat neplyne** — tři nálezy mají jinou příčinu
než kapacitu modelu:

1. **Zásah (4) je vlastní regrese, ne strop modelu.** Vypuštění „3–5 vět"
   odstranilo jedinou brzdu, která reálně sepínala, a znakový strop ji nenahradil
   (11/13 přes, +25 % délky). Delší výstup navíc **koreluje se skokem jazykových
   vad 2/13 → 7/13 při nezměněné teplotě** — tj. druhá metrika se zhoršila jako
   vedlejší efekt. Silnější model tohle nevyřeší; brzda chybí.
2. **Rule 3 × rule 5 táhnou proti sobě — potvrzená předpověď.** Design-critic
   to označil před během (nález (b) v changelogu v0.4.2) a data sedí: nová věta
   rule 3 žádá **jednoznačnost výsledku**, rule 5 zakazuje **příčinu**, a prompt
   nikde neukazuje **povolený bezpříčinný tvar**. Nejlevnější způsob, jak být
   jednoznačný, je „pokus selhal, **neboť** X" — proto 13/13. Zásah (2) navíc
   spolu s pozicí zahodil i konkrétní protipříklad (nález (d)), takže model
   nemá vzor. Tohle je **chybějící věta v promptu**, ne strop modelu.
3. **Zásah (1) minul žánrovou intuici modelu.** Markdown syntax klesla 13/13 →
   5/13 (zásah zabral), ale **titulkový řádek přežil 13/13**, protože policejní
   protokol z roku 1930 hlavičku mít má — model plní žánr, ne že by pravidlo
   nechápal. Chybí **pozitivní pokyn, kde má začít**.

**Doporučení: ještě jedno kolo promptu (v0.4.3) s pevně omezeným rozsahem,
běh na n=3 dle původního protokolu, a teprve pak eskalace.** Návrh čtyř zásahů
(všechny na cachovaném vstupu, cenu volání nemění — konzultaci
s operations-economics vyžaduje až případná eskalace):

- **(a) Nahradit brzdu délky, ne vrátit „3–5 vět"** (to je mrtvé, 0/39).
  Navrhuju brzdu, kterou model počítá **po slotech**, ne globálně: „Nejvýše
  jedna věta na každý ze čtyř slotů, nejvýše dvě věty na následky, jedna
  závorka." Je to hypotéza — počitatelnost per-slot je jediný důvod čekat, že
  sepne tam, kde globální počet vět nesepnul. **Musí se změřit, ne zapéct.**
- **(b) Dát modelu povolený bezpříčinný tvar výsledku** + vrátit protipříklad:
  „Výsledek piš holým konstatováním — ‚pokus se nezdařil', ‚záměr vyšel'.
  Nikdy k němu nepřipojuj důvod: ‚nezdařil se, neboť…', ‚bylo to příliš…',
  ‚nestačilo to, protože…'." Míří na 13/13, nejsilnější páka kola.
- **(c) Pozitivní pokyn proti hlavičce:** „Protokol nemá hlavičku ani číslo
  jednací — začni rovnou první větou děje."
- **(d) Zákaz herního slovníku v próze** (nový nález 6/13): „pole", „Žár",
  „pásmo", „slot" jako jednotky; pohyb šerifa popsat dobově.

Odložené a stále živé: rozšíření rule 2 na **místa** (nález „okres Brandýs").
Rule 4 (zadržení) **nechat beze změny** — viz níže.

**Sebeoprava, kterou je třeba nahlásit:** hypotéza „umístění pravidla rozhoduje
stejně jako znění" (moje, z v0.4.2) **se nepotvrdila** — zákaz příčiny se
vytáhl na samostatnou závěrečnou větu a metrika se nezlepšila. Nález je ale
**konfundovaný** kolizí s novou větou rule 3, takže hypotézu nelze ani vyvrátit.
Proto **nedoporučuju aplikovat tutéž páku na rule 4** (zadržení), jak v0.4.2
předpokládala — dokud (b) neoddělí kolizi, nevíme, co pozice dělá.

## 5. Známé vady do lidské brány (kdyby se šlo dál i tak)

Uživatelův dojem („texty OK, dávají relativně smysl") a verdikt 0/13 si
neodporují — **měří jiné věci**. Rozdělení podle toho, co hráč bez znalosti
vstupu vůbec pozná:

**Hráč VIDÍ (blokuje lidskou bránu, metrika 6 čitelnost):**
- herní slovník v próze („o dvě pole", „pohybem Žáru") — 6/13
- titulková hlavička a markdown — 13/13
- tvrdé jazykové vady — 7/13, z toho nonwordy a rozbitá syntax ve 4 casech
- délka: medián 1079 zn. = ~4,5 min psacího stroje na uzel (tempo!)
- „okres Brandýs" — dobová a zeměpisná chyba

**Hráč NEVIDÍ (blokuje princip „mechanika rozhoduje", ne zábavu):**
- vymyšlená příčina 13/13 — pozná se až proti odhalenému prahu
- rule 4 (zadržení, ztotožnění) 3/13
- zamlčený/změkčený výsledek slotu 4/13 — **kromě casu 1**, kde závěrečná
  věta výsledek obrací a hráč to proti své volbě pozná

**Nezablokované, drží potřetí:** obrácení výsledku 0/52 slotů · vymyšlený loot
0/13 · závorka vyšetřovatele 13/13 · postihy a složení zapsány jako fikce.

## 6. Procesní nálezy pro příští běh

1. **Protokol nebyl dodržen** (n=1 místo n=3). U obou stop metrik to nevadí
   (efekt je mimo šum), u srovnání KRITICKÝCH casů 6/13 vs. 7/13 **ano** — ten
   rozdíl je při n=1 los. n=3 zabalit do běhu v0.4.3, ne kupovat zvlášť.
2. **Délku měřit bez titulkového řádku.** Jinak se strop měří na formátovém
   šumu a při jeho odstranění se tiše posune.
3. **Casy 3 a 5 se vešly pod 900** (897, 852) a jsou to zároveň dva ze tří
   nejkratších — potvrzuje, že strop není nedosažitelný, jen nevynucený.
