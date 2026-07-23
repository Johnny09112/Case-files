# Balanční posudek návrhu v3 (slotová resoluce) — 2026-07-23

*Posudek playtest-facilitatora „od stolu" (bez simulace) nad připomínkami
uživatele k v3 + PM syntéza. Nic z toho není rozhodnuto — podklad pro
design dokument v3. Vizuál/UX současného prototypu je jen testovací
(rozhodnutí uživatele 2026-07-23); finální UX se ladí dodatečně.*

## Připomínky uživatele (2026-07-23, shrnutí)

1. **Jména hráčů místo pevných postav** — profil s vlastním jménem a statistikami
   úspěšnosti, přenosný mezi „světy"; premisa hry = „příběhovka s volbou",
   ~3 příběhy na start, další DLC. Karty (assety) sdílené napříč světy až na
   výjimky. Dlouhodobě ~300 standardních + 100 prémiových karet; „custom" karta
   za úspěšný průchod po verifikaci do prémiového fondu. Jméno se doplňuje ke
   kartě až po přiřazení do slotu.
2. **Gamble draw místo „druhé věci do volitelného slotu"** — utracení druhé věci
   ředí komedii záchranou; místo toho možnost jednou líznout náhodnou kartu
   z balíku (risk).
3. **Sloty vždy 4** (stejné texty pro všechny počty hráčů); ruce: 1p 6→volí 4,
   2p 4+4→volí 2+2, 3p velitel 2 + ostatní 1 (velitel nespecifikován; alt. ruka 3),
   4p volí 1 (zvážit ruku 3). Dolízání na konci kola; podíl prémiových karet
   v dolízání dle úspěšnosti.
4. **Komediální postihy s reálným dopadem** místo generických zranění — situační,
   vázané na fikci (např. „prkno po hlavě → 3 kola nevidíš staty karet, jen
   názvy"); některé trvalé.
5. **Mapa à la Slay the Spire** kreslená na dobové mapě (šerif křížkuje postup);
   typy míst: NPC interakce / zajímavá lokace (situace či event 1 ze 3) /
   truhla-loot / motel-úkryt. **Kredity společné a vzácné** (skvělý run ≈ 4 směny
   karet NEBO 2 léčení postihů — skupinové rozhodování).

## PM posudek (kolize s principy + řešení)

- **Vlastní jména = dvojí kolize:** (a) fixní jména byla předpoklad přenositelné
  globální cache protokolů (architektura §2.3); (b) volný text hráčů do AI je
  zakázán (prompt injection). **Řešení, které zachrání obojí: jména do promptu
  nikdy nejdou** — LLM píše protokol s placeholdery (Podezřelý A/B, 1. pád —
  kontrakt už držíme), jména se dosazují lokálně až po vygenerování. Cache klíč
  bez jmen zůstává přenositelný, injection nemožná, profil se stats OK.
- **Multi-svět/DLC** je konzistentní s design dokumentem §7 (DLC prostředí už
  tam je). Karty potřebují pole světové příslušnosti (výjimky per svět).
- **300+100 karet:** autorská pipeline (content-generator + moderace + simulační
  ověření distribucí statů) to unese, ale je to jiná liga než 32 karet —
  a „custom po verifikaci" = UGC moderace z §5 jako provozní proces.
- **Gamble draw:** souhlas s odůvodněním (záchrana ředí komedii); opt-in náhoda
  je dramaturgicky správný druh (hráč si ji vybral).
- **Komediální/informační postihy:** nejsilnější nápad balíku — trestá kvalitu
  rozhodování, ne sílu karet, a VYRÁBÍ komedii místo aby ji ubíral. Nahrazuje
  prokleté karty.
- **Mapa + kredity:** koherentní roguelite smyčka, křížkující šerif je perfektní
  diegetický rámec — ale je to celá hra, ne MVP. v3 potřebuje definovaný MVP řez.

## Balanční posudek (playtest-facilitator, od stolu)

**Rámující nález: v3 mění, co simulace vůbec je.** Tři nefixované proměnné
(commit naslepo vs. po odhalení; vlastnictví slotu; na co klíčuje práh) hýbou
win-rate každá o desítky bodů — dokud nejsou dané, sim je šum, ne balanc.

**a) Ruce/commit:** nasazený výkon je invariant (vždy 4 sloty), liší se kvalita
výběru a kdo optimalizuje. Sólista optimalizuje globálně jedním mozkem, 4p
lokálně a izolovaně — který efekt převáží, závisí na commit režimu. Doporučení:
**srovnat režim informace (všichni naslepo, nebo všichni po odhalení), ne počet
karet.** Velitel u 3p není balanční nutnost — řešit rotací, nebo elegantněji:
**4. slot u 3p = vždy gamble-draw slot** (velitel zmizí, vznikne týmová sázka).

**b) Gamble draw:** musí mít EV ≈ neutrální až mírně záporné s vysokou variancí
(kladné → bere se vždy; moc záporné → mrtvá volba). Doporučení: líže se ze
standardního balíku s ~20–30 % net-záporných karet, **tažená karta se povinně
použije** (jinak to není sázka), bez ceny a capu — přirozený strop je, že smí
plnit jen slot, který jinak nepokryješ (self-balancing). Riziko musí být
čitelné (drama), ne skryté (trap).

**c) Informační postihy:** neplodí numerickou spirálu smrti (nesnižují sílu
karet) — degradují agency/komedii, to je feature. Rizika: stack víc info/zámků
na jednoho hráče → pasažér; homogenní ruka → postih zadarmo. Simulace: bot bez
informace = ε-greedy (ε≈0,3–0,5), bracket proti random; **rozdíl win-rate
informovaný vs. slepý bot = síla postihu v téže měně jako −X.**

**d) Kredity (cíl „skvělý run ≈ 4 směny NEBO 2 léčení"):** H ≈ 2S; startovní
čísla S=3, H=6, skvělý run ~12 kreditů, medián ~5–6 (= reálné dilema „léčit
Pepu vs. 2 směny"). Příjem: truhla 3–5, velmi úspěšná situace +1. Degenerace:
hoarding (→ kredity per-run, nepřecházejí), vždy-léčit (→ **tiering postihů
must-heal vs. rideable** — bez něj směna umře), mistiming (motel nesmí být
vzácný).

**e) Mix míst (run 6–8 uzlů):** maso (NPC+lokace) ≥ 65–70 %, truhla+motel ≤ 30 %,
nikdy dva ne-maso uzly po sobě. 7 uzlů = 5/1/1. Truhla dřív (uzel 2–3), motel
střed-pozdě (4–6). Event „1 ze 3" v bucketu lokací, ne uzel navíc. Červená
vlajka větvení: cesta se nesmí dát vyroutovat kolem masa.

**f) Prémiové karty = riziko rich-get-richer,** které jde PROTI pilíři „snowball
obtížnosti od 3. uzlu". Doporučení: **prémiové jako meta-progrese (odemykání pro
příští run), ne in-run power spike**; pokud in-run, pak prémiové ≠ silnější, ale
specializovanější/swingovější (mění varianci, ne průměr).

**g) TOP 3 rozhodnutí před stavbou v3 simu:**
1. **Commit mechanika** (naslepo vs. po odhalení) + vlastnictví slotu + klíčování
   prahu (1 stat vs. kombinace).
2. **Taxonomie postihů** (info/zámek/ztráta) + tiery závažnosti (must-heal vs.
   rideable) — na ní visí celá kreditová ekonomika.
3. **Sémantika prémiových karet** (raw síla vs. specializace; in-run vs. meta).

**+ meta-otázka definující samotnou bránu v3:** jsou prahy learnable (konzistentní
per typ situace → existuje kompetentní hra → win-rate pásmo dává smysl), nebo
náhodné (víc komedie, míň skillu → pásmo jako metrika ztrácí smysl)?

**Strop poctivosti:** nic z toho neprokazuje zábavu — „skryté prahy = uspokojivý
reveal, ne gotcha" je hypotéza pro lidskou bránu.

---

*Souvisí: [stav.md](../projekt/stav.md) (D14), mikroprototypy v kódovém repu
(`experiments/mikroprototyp-sloty*.html`), [design-dokument.md](../design-dokument.md).*
