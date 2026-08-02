---
name: prompt-variant-rozhodovani
description: Jak rozhodovat mezi variantami promptu (cílené vs. plošné pravidlo) a jak psát zákazy, které slabý model unese — metoda „frekvence sepnutí triggeru", past podmíněného pravidla a dvě pasti přeširokého zákazu; z kola v0.4 (kreativní mandát, 2026-08-01)
metadata:
  type: project
---

# Rozhodování mezi variantami promptu

Kalibrace role, ne projektová fakta. Vzniklo při volbě „plné B vs. B-lite"
(kreativní mandát, D53 → prompt v0.4). Metody jsou přenosné na jakékoli budoucí
pravidlo, které má znít „dělej X, ale jen když Y".

## 1. MĚŘ FREKVENCI SEPNUTÍ TRIGGERU, NEŽ obhájíš cílené pravidlo

Cílené pravidlo („invence jen u selhaných a nesedících slotů") se intuitivně jeví
jako levnější a bezpečnější než plošné. **Než to přijmeš, spočítej, na kolika
procentech případů ta podmínka reálně sepne** — v reálném logu, ne odhadem.

- U mandátu invence sepnul trigger na **24 z 32 slotů WoZ runu (75 %)**.
- Podmínka platná ve třech čtvrtinách případů **nefiltruje**. Platí se za ni
  tokeny promptu a vyhodnocování větvení, a nedostane se za to skoro nic.
- **Prahové pravidlo, které jsem si z toho odvodil:** pod ~40 % sepnutí je cílené
  pravidlo obhájitelné; nad ~60 % piš plošné pravidlo a reguluj jinou pákou
  (u délky znakový strop, u bezpečnosti samostatný zákaz).

**Past, do které jsem sám spadl:** trigger měl DVĚ půlky („SELHAL **nebo** se věc
k roli zjevně nehodí") a při obhajobě i při kritice se mlčky zúžil na tu první.
Proti zúženému triggeru se cílené pravidlo jeví jako děravé, proti plnému jako
nadbytečné. **Vždy cituj trigger doslovně, než ho začneš hodnotit.**

## 2. PODMÍNĚNÉ PRAVIDLO SE NA SLABÉM MODELU ZHROUTÍ NA „VŽDY" NEBO „NIKDY"

Cílené pravidlo vyžaduje po modelu tři kroky na slot: klasifikovat výsledek,
udělat fuzzy úsudek („zjevně se nehodí"), větvit. Haiku 4.5 to udělá nekonzistentně
a **kolaps do jedné z krajních poloh je pravděpodobnější než dodržení**.

- Nedostaneš cílenou variantu, dostaneš minci mezi plošnou variantou a starým
  chováním — a nevybereš si stranu.
- **Deterministickou půlku triggeru (čitelnou přímo ze vstupu, např. `selhání`
  v poli VÝSLEDEK MECHANIKY) posuzuj odděleně od fuzzy půlky.** Jen fuzzy půlka
  je nespolehlivá; kdyby cílené pravidlo šlo postavit výhradně na strojově
  čitelném poli, argument o kolapsu neplatí.
- **Bezpečnost nekupuje zúžení pole působnosti, ale samostatný zákaz.** Když má
  varianta A i varianta B tutéž pojistku, není „menší plocha" argumentem pro A.

## 3. ČTYŘI PASTI PŘEŠIROKÉHO ZÁKAZU (všechny odhaleny až vlastním psaním ukázek)

Zákaz psaný „ať to radši utáhnu" se stane nedodržitelným a model ho zahodí celý.
Obojí jsem našel až tím, že jsem si podle vlastního pravidla zkusil napsat protokol.

- **„nic nedělá hluk"** zakázalo veškerý diegetický zvuk — pláč, křik, bouchnutí
  dveří. Každá živá scéna pravidlo porušuje. Oprava: zakázat jen hluk, **„který
  by někoho přivolal"** (tj. ten, který by čtenář přečetl jako důvod pohybu Žáru).
- **„nic se nikomu nepředává"** zakázalo, aby NPC přijalo nabídnutý úplatek —
  tedy pointu každého úspěšného hodnota-slotu. Oprava: chránit **jen sledovaná
  čísla a náklad**; rekvizita ze slotu smí změnit majitele, protože je tak jako
  tak utracená.
- **„nevymýšlej věci, které ve vstupu nejsou"** bylo v PŘÍMÉM SPORU s mandátem,
  který vedle toho káže vymyslet, JAK byla věc použita — každá obhajoba pokusu
  potřebuje kulisu (sud na rampě, kapsy kabátu, oje vozu). Nejnebezpečnější
  z trojice: model postavený před rozpor dvou sousedních pravidel ho na slabém
  modelu vyřeší **tím přísnějším**, tedy nevymyslí nic — a nová verze promptu
  tiše zregresuje na starou, aniž kdo pozná proč. Oprava: zakázat jen další
  **věci z výbavy** (zbraň, nástroj, úplatek), kulisu udělat **povinnou**.
- **„nikdo neutrpí újmu na těle"** (v0.4.1, čtvrtý výskyt téhož tvaru) zakázalo
  i strkanici a tahanici — tedy fyzickou akci, ze které rule 5 žije. Vlastní
  vzorový příklad promptu („podezřelý D si při tahanici narazil rameno") by pod
  ním neprošel. Oprava: zakázat **NÁSLEDEK, ne střet** („střet ve scéně být smí,
  jen z něj nikomu nesmí zůstat následek, který ve vstupu není").
  **Čtyřikrát po sobě týž tvar chyby ⇒ ber to jako default, ne jako výjimku:
  první znění nového zákazu bude skoro jistě moc široké.** Napiš ho, pak proti
  němu zkus napsat vzorový příklad, který v promptu už je.
- **Zákaz piš POJMOVĚ, ne výčtem sloves** (nález design-critica, v0.4.1). „zadržen,
  zatčen, spoután, odveden, zavřen" je lexikální seznam a Haiku ho pattern-matchuje:
  „odvedli ho k sepsání" ani „nechali si ho stranou do rána" v něm nejsou. Výčet
  je dobrý jako ILUSTRACE, ale musí za ním stát generalizující klauzule („ani
  jinak neskončí v rukou úřadů nebo mimo posádku"). Táž past platí obráceně
  v baterii — viz [[baterie-falzifikovatelnost]] §2.
- **Obecné poučení:** zákaz formuluj proti tomu, co si hráč **přepočítá**
  (bedny, kredity, Žár, postihy, složení), ne proti jevu ve fikci. Fikce se
  zakazovat nedá, aniž se zabije scéna.
- **Po každém přidání pravidla projdi jeho SOUSEDY a hledej rozpor**, ne jen
  jeho vlastní znění. Dvě pravidla, z nichž každé samo o sobě dává smysl, se
  na slabém modelu sečtou do paralýzy.

## 4. VŽDY NAPIŠ UKÁZKU PODLE VLASTNÍHO NÁVRHU, NEŽ HO ODEVZDÁŠ

Obě pasti výše prošly čtením návrhu bez povšimnutí a padly během první minuty
psaní vzorového protokolu. **Návrh pravidla není hotový, dokud podle něj
nenapíšeš 2–3 výstupy — včetně jednoho záměrně slabého.** Slabá varianta odhalí
zákazy, které jdou obejít; dobrá varianta odhalí zákazy, které jdou dodržet jen
za cenu mrtvého textu.

## 5. ROZPOČET DÉLKY JE NEJDŘÍV OTÁZKA NA EKONOMIKU, PAK AŽ NA VKUS

Než se začne hádat o znakový strop, zjisti, kde je ekonomická hranice — nemusí
tam vůbec být. U v0.4: strop 800 zn./uzel = ~63 % worst-case rozpočtu, praskne
až u ~1 570 zn. **Pásmo 800–1 200 je z ekonomiky volné**, takže spor o délku je
spor o kvalitu a o tempo psacího stroje, ne o peníze.
- Změnil se ale **tvar** nákladu: od kreativního mandátu je výstup ~47 % ceny
  volání (výstupní token je 5× dražší než vstupní). **Každé další uvolnění délky
  je proto 5× citlivější než prodloužení systémového promptu** — a naopak, bát se
  přidat pravidlo do promptu je od teď lakota na špatném místě.

## 6. JEDNOTKA ANALÝZY MUSÍ BÝT JEDNOTKA KONZUMACE

Nejdražší chyba kola v0.4 a přenosná na každé další měření kvality. Obhajoval
jsem B-lite klasifikací **32 slotů** — protože slot je jednotka mechaniky
a nabízí se sám. Hráč ale čte **protokol**, a uživatel při slepém čtení hodnotil
protokoly. Dostal jsem tedy čísla, která odpovídají na jinou otázku, než jaká
byla položena, a použil je jako důkaz.

- **Ptej se před sběrem dat:** je jednotka, kterou počítám, tatáž, kterou vidí
  hráč? Když ne, výsledek neumí potvrdit ani vyvrátit hypotézu o celku (např.
  „protokol je scéna, ne seznam") — tu moje slotová statistika neuměla změřit.
- **Agregace přes uzly runu je druhá polovina téže chyby.** Cílené pravidlo je
  třeba potřeba měřit i podle toho, v kolika **uzlech** vůbec sepne: pásma jsou
  4/4 6,8 % · 3/4 30,7 %, takže v ~37 % uzlů by B-lite spadla zpět na starý suchý
  režim. Nekonzistence napříč runem je horší než kterýkoli režim držený důsledně —
  hráč ji čte jako „AI je nespolehlivá", ne jako „tady nebylo co rozehrávat".
- **Vzorek WoZ byl navíc vychýlený:** sólo run, 6 z 8 uzlů 2/4 nebo horších.
  Na takové sadě je B-lite ≈ plné B, takže slepé čtení rozdíl mezi nimi ani
  nemohlo ukázat. **Vždy zkontroluj, jestli testovací vzorek pokrývá pásma
  v jejich reálné frekvenci** — jinak měřím režim na terénu, kde splývá.
