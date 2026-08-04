// @ts-check
/**
 * v3 slotová resoluce — čisté funkce (ADR-003). Bez stavu, bez I/O, bez DOM.
 *
 * Mechanika (prototyp-mvp.md §Resoluční systém v3, architektura §2.2 v3):
 * tým committne 4 karty naslepo → odhalí se text + skryté prahy (kotva ± šum)
 * → tým rozdělí 4 karty do 4 slotů → každý slot porovná JEDEN stat (nebo dva
 * u kombi) se skrytým prahem → počet zásahů určí pásmo. GANGSTER štítek a
 * rušení statu pronásledovatelem (run-wide) přebíjejí porovnání. Oracle
 * spočítá `max_achievable` optimálním rozdělením (jádro K5).
 */

import { BAND } from './events.js';

/** Druhy vloženého/běžného setkání. */
export const ENCOUNTER_KINDS = /** @type {const} */ ({
  UZEL: 'uzel',
  ZATAH: 'zatah',
  LECKA: 'lecka',
  KONFRONTACE: 'konfrontace',
});

/**
 * Práh slotu = kotva + šum uniform v {−rozsah … +rozsah} ze seedovaného PRNG,
 * clampnutý do [0, statMax]. Clamp (kalibrace-2 D22) brání beznadějným slotům
 * při širším šumu: kotva 4 + 2 = 6 by nešlo trefit (stat max 5) → zastropováno
 * na 5. Symetricky práh 0 = auto-hit (stat ≥ 0 vždy).
 * @param {number} kotva 2–4
 * @param {ReturnType<import('./rng.js').createRng>} rng
 * @param {typeof import('./rules.js').RULES} rules
 * @returns {number}
 */
export function slotPrah(kotva, rng, rules) {
  const rozsah = rules.sumRozsah;
  const sum = rng.int(2 * rozsah + 1) - rozsah; // {−rozsah … +rozsah}
  return Math.max(0, Math.min(rules.statMax, kotva + sum));
}

/**
 * Nejvyšší hodnota KAŽDÉHO statu mezi věcmi BEZ štítku GANGSTER (V4-D, D58,
 * design-audit-2p-2026-08-02.md §5.2). Počítá se JEDNOU při načtení obsahu
 * (`state.js` `createRun`) — je to legální strop pro viditelné sloty v
 * situacích, kde GANGSTER auto-failuje (`stitky.yaml` `viditelna_role_selze`):
 * taková věc na takovém slotu propadne bez ohledu na staty, takže nesmí
 * zvedat clamp prahu, i když by jinak byla statově nejsilnější v balíku.
 * @param {object[]} veci obsah/veci.yaml (validovaný obsah)
 * @param {readonly string[]} staty rules.staty
 * @returns {Record<string, number>}
 */
export function nonGangsterStatMax(veci, staty) {
  const out = {};
  for (const stat of staty) {
    out[stat] = veci.reduce((m, v) => (v.stitek === 'GANGSTER' ? m : Math.max(m, v.staty?.[stat] ?? 0)), 0);
  }
  return out;
}

/**
 * Supply-aware strop prahu pro JEDEN slot (V4-D). Na viditelném slotu situace,
 * kde GANGSTER auto-failuje, a bez slotové výjimky (`stitek_citlivy: GANGSTER`),
 * se strop neb bere jako `statMax`, ale jako nejvyšší stat dosažitelný LEGÁLNÍ
 * (non-GANGSTER) kartou — jinak mohl práh padnout na hodnotu, kterou neprojde
 * žádná karta ve hře (design-audit-2p-2026-08-02.md §5.1, nález D57).
 * Beze změny (vrací `statMax`), když `nonGangsterMax` není k dispozici — API
 * je zpětně kompatibilní s voláním bez opts (testy, staré snímky).
 * @param {{stat: string|string[], viditelnost: string, stitek_citlivy?: string|null}} slot
 * @param {number} statMax
 * @param {string|undefined} chovani `stitekParams.chovani_dle_typu[typSituace]`
 * @param {Record<string, number>|null} nonGangsterMax
 */
function supplyAwareStatMax(slot, statMax, chovani, nonGangsterMax) {
  if (!nonGangsterMax) return statMax;
  if (slot.viditelnost !== 'viditelna') return statMax;
  if (chovani !== 'viditelna_role_selze') return statMax;
  if (slot.stitek_citlivy === 'GANGSTER') return statMax; // slotová výjimka: zbraň tu vítána
  const staty = Array.isArray(slot.stat) ? slot.stat : [slot.stat];
  return Math.min(statMax, ...staty.map((s) => nonGangsterMax[s] ?? statMax));
}

/**
 * Odhalí sloty situace: dorolí šum ke každé kotvě, dopočítá typ prahu.
 * @param {{sloty: object[], typ?: string}} situace definice situace (obsah)
 * @param {ReturnType<import('./rng.js').createRng>} rng
 * @param {typeof import('./rules.js').RULES} rules
 * @param {{stitekParams?: {chovani_dle_typu: object}|null, nonGangsterMax?: Record<string, number>|null}} [opts]
 *   V4-D (D58): `stitekParams` + `nonGangsterMax` dohromady určují supply-aware
 *   clamp (`supplyAwareStatMax`). Nepovinné — bez nich se clampuje na `statMax`
 *   jako dřív (zpětná kompatibilita volání bez opts).
 * @returns {object[]} odhalené sloty (s `prah`, `sum`, `typ_prahu`)
 */
export function revealSlots(situace, rng, rules, opts = {}) {
  const offset = rules.kotvaOffset ?? 0;
  const frakce = rules.kotvaBumpFrakce ?? 0;
  const { stitekParams = null, nonGangsterMax = null } = opts;
  const chovani = stitekParams?.chovani_dle_typu?.[situace.typ];
  return situace.sloty.map((s, i) => {
    const kombi = Array.isArray(s.stat);
    const sum = rng.int(2 * rules.sumRozsah + 1) - rules.sumRozsah;
    // Efektivní kotva = obsahová kotva + globální posun + stabilní per-slot bump
    // (deterministický dle id situace × index slotu → naučitelný, ne per-instance).
    // Bump míří JEN na snadné VIDITELNÉ sloty (kotva < kotvaMax) — nezvedá už
    // tak tvrdé ani skryté sloty, aby nevznikaly beznadějné situace (K5).
    const bumpatelny = s.viditelnost === 'viditelna' && s.kotva < rules.kotvaMax;
    const bump = bumpatelny && stableUnit(`${situace.id ?? ''}:${i}`) < frakce ? 1 : 0;
    const kotva = Math.max(1, s.kotva + offset + bump);
    const clampMax = supplyAwareStatMax(s, rules.statMax, chovani, nonGangsterMax);
    return {
      slot_index: i,
      role: s.role,
      stat: s.stat,
      kombi,
      kotva,
      sum,
      // Clamp do [0, clampMax] — širší šum (kalibrace-2) nesmí dělat beznadějné
      // sloty (K5); clampMax je supply-aware (V4-D) místo plochého statMax.
      prah: Math.max(0, Math.min(clampMax, kotva + sum)),
      typ_prahu: kombi ? 'kombi_oba' : s.stitek_citlivy ? 'stitek' : 'jednostat',
      viditelnost: s.viditelnost,
      stitek_citlivy: s.stitek_citlivy ?? null,
    };
  });
}

/** Stabilní [0,1) z řetězce (FNV-1a) — pro deterministický per-slot bump. */
function stableUnit(key) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 4294967296;
}

/** Staty relevantní pro slot (jednostat → [stat], kombi → oba). */
function slotStaty(slot) {
  return Array.isArray(slot.stat) ? slot.stat : [slot.stat];
}

/**
 * Hodnota statu věci ve slotu s ohledem na run-wide rušení pronásledovatelem.
 * @param {object} karta @param {string} stat @param {{typ: string, cil: string}|null} rusi
 */
function statValue(karta, stat, rusi) {
  if (rusi && rusi.typ === 'stat' && rusi.cil === stat) return 0;
  return karta.staty[stat] ?? 0;
}

/**
 * Vyhodnotí jeden slot: vrací zásah + anotaci „proč" (vysvětlující vrstva).
 *
 * @param {object} p
 * @param {object} p.karta věc se staty (+ volitelně `stitek`)
 * @param {object} p.slot odhalený slot ({stat, prah, viditelnost, stitek_citlivy?})
 * @param {{typ: string, cil: string}} [p.rusi] rušení pronásledovatele (run-wide)
 * @param {{chovani_dle_typu: object}} [p.stitekParams] parametry štítku GANGSTER (obsah)
 * @param {string} [p.typSituace] npc|lokace|zatah|lecka|konfrontace
 * @param {{stitky?: string[], viditelnosti?: string[]}} [p.zamky] aktivní ZÁMKOVÉ
 *   postihy VLASTNÍKA karty (D34/N1) — `lock_stitek` a `lock_slot_viditelnost`
 * @returns {{zasah: boolean, stat_hodnota: number|number[], duvod: string,
 *   stitek_efekt: string|null, pronasledovatel_efekt: object|null,
 *   postih_efekt: string|null}}
 */
export function resolveSlot({ karta, slot, rusi = null, stitekParams = null, typSituace = null, zamky = null }) {
  // Prázdný slot (žádná committnutá karta — složení) vždy padne.
  if (!karta) {
    return { zasah: false, stat_hodnota: null, duvod: 'neobsazeno', stitek_efekt: null, pronasledovatel_efekt: null, postih_efekt: null };
  }

  // ZÁMKOVÉ POSTIHY (D34/N1) — tvrdé pravidlo nad staty, stejná třída jako štítek.
  // Do 2026-07-27 je engine NEVYNUCOVAL (`assignToSlots` nekontroloval nic), takže
  // třetina udělovaných postihů byla mechanicky no-op — viz technika/proverka-bota.
  // Operacionalizace = AUTO-FAIL, ne zákaz přiřazení: zákaz je u 1p neproveditelný
  // (`lock_slot_viditelnost: skryta` + 4 karty jednoho hráče + skrytý slot = žádné
  // legální rozdělení). Auto-fail je vždy proveditelný, čte se u stolu stejně
  // („co dáš do skryté role, se nepovede") a degraduje AGENCY, ne číslo — což je
  // přesně definice postihu v obsah/postihy.yaml.
  if (zamky) {
    if (karta.stitek && zamky.stitky?.includes(karta.stitek)) {
      return { zasah: false, stat_hodnota: 0, duvod: 'postih_lock_stitek', stitek_efekt: null, pronasledovatel_efekt: null, postih_efekt: 'lock_stitek' };
    }
    if (zamky.viditelnosti?.includes(slot.viditelnost)) {
      return { zasah: false, stat_hodnota: 0, duvod: 'postih_lock_viditelnost', stitek_efekt: null, pronasledovatel_efekt: null, postih_efekt: 'lock_slot_viditelnost' };
    }
  }
  const rusiTohoto =
    rusi && rusi.typ === 'stat' && slotStaty(slot).includes(rusi.cil) ? rusi : null;
  const pronasledovatel_efekt = rusiTohoto ? { typ: rusiTohoto.typ, cil: rusiTohoto.cil } : null;

  // GANGSTER štítek — tvrdé pravidlo nad staty (viz obsah/stitky.yaml).
  const maStitek = karta.stitek === 'GANGSTER';
  const vyjimka = slot.stitek_citlivy === 'GANGSTER';
  if (maStitek && !vyjimka && stitekParams && typSituace) {
    const chovani = stitekParams.chovani_dle_typu?.[typSituace];
    if (chovani === 'viditelna_role_selze' && slot.viditelnost === 'viditelna') {
      return { zasah: false, stat_hodnota: 0, duvod: 'gangster_auto_fail', stitek_efekt: 'auto_fail', pronasledovatel_efekt, postih_efekt: null };
    }
    // 'vzdy_pass' nebo skrytá role → štítek se ignoruje, hodnotí se dle statu.
  }

  if (Array.isArray(slot.stat)) {
    const staty = slot.stat.map((s) => statValue(karta, s, rusi));
    const zasah = staty.every((v) => v >= slot.prah);
    return {
      zasah,
      stat_hodnota: staty,
      duvod: zasah ? 'proslo' : rusiTohoto ? 'stat_zrusen' : 'kombi_neuplny',
      stitek_efekt: null,
      pronasledovatel_efekt,
      postih_efekt: null,
    };
  }

  const hodnota = statValue(karta, slot.stat, rusi);
  const zasah = hodnota >= slot.prah;
  return {
    zasah,
    stat_hodnota: hodnota,
    duvod: zasah ? 'proslo' : rusiTohoto ? 'stat_zrusen' : 'nizky_stat',
    stitek_efekt: null,
    pronasledovatel_efekt,
    postih_efekt: null,
  };
}

/**
 * Pásmo z počtu zásahů (4/4 LOOT, 3/4 HLADCE, 2/4 S_NÁSLEDKY, ≤1/4 PRŮŠVIH).
 * @param {number} zasahy 0–4
 */
export function bandFromHits(zasahy) {
  if (zasahy >= 4) return BAND.LOOT;
  if (zasahy === 3) return BAND.HLADCE;
  if (zasahy === 2) return BAND.NASLEDKY;
  return BAND.PRUSVIH;
}

/**
 * Oracle (jádro K5, ADR-008): nejlepší dosažitelný počet zásahů optimálním
 * rozdělením `karty` (přesně 4) do odhalených `sloty` (přesně 4) — nezávisle
 * na tom, jak rozdělil tým. Brute-force 4! = 24 permutací (levné, deterministické).
 *
 * @param {object[]} karty přesně 4 committnuté věci
 * @param {object[]} sloty přesně 4 odhalené sloty
 * @param {{typ: string, cil: string}} [rusi]
 * @param {{chovani_dle_typu: object}} [stitekParams]
 * @param {string} [typSituace]
 * @param {({stitky?: string[], viditelnosti?: string[]}|null)[]} [zamkyKaret] zámkové
 *   postihy vlastníka KAŽDÉ karty (index sdílený s `karty`); bez nich by oracle
 *   sliboval zásahy, které postih auto-failuje, a padl by invariant „reálné ≤ max".
 * @returns {number} max_achievable_zasahy (0–4)
 */
export function maxAchievableZasahy(karty, sloty, rusi = null, stitekParams = null, typSituace = null, zamkyKaret = null) {
  let max = 0;
  for (const perm of permutace([0, 1, 2, 3])) {
    let zasahy = 0;
    for (let i = 0; i < 4; i++) {
      const r = resolveSlot({ karta: karty[perm[i]], slot: sloty[i], rusi, stitekParams, typSituace, zamky: zamkyKaret?.[perm[i]] ?? null });
      if (r.zasah) zasahy += 1;
    }
    if (zasahy > max) max = zasahy;
    if (max === 4) break;
  }
  return max;
}

/** Všechny permutace malého pole (Heapův algoritmus). */
function permutace(arr) {
  const out = [];
  const a = arr.slice();
  const gen = (n) => {
    if (n === 1) {
      out.push(a.slice());
      return;
    }
    for (let i = 0; i < n; i++) {
      gen(n - 1);
      const j = n % 2 === 0 ? i : 0;
      [a[j], a[n - 1]] = [a[n - 1], a[j]];
    }
  };
  gen(a.length);
  return out;
}

/** Zahrnuje stat slotu (jednostat i kombi) daný stat? */
function slotHasStat(slot, stat) {
  return Array.isArray(slot.stat) ? slot.stat.includes(stat) : slot.stat === stat;
}

/**
 * Derivace pravého telegraf signálu ze slotů (ADR-008) — NE autor. QA invariant:
 * trend VŠECH viditelných statů + počet skrytých („proti srsti") + verdikt zbraně
 * + zda se zbraň vyplatí ve SKRYTÉM slotu (kalibrace-2, D22 bod 3). Neprozrazuje
 * kotvy/prahy.
 *
 * `zbran_skryte` je druhá polovina léku K7: pozitivně rozlišuje „zbraň funguje
 * ve skrytém slotu (nějaký skrytý slot klíčuje na utok — fikce ‚kdyby přituhlo')"
 * od „zbraň naslepo k ničemu". Tím se 10 ponechaných utok-skrytých slotů stává
 * ODVODITELNÝMI (informovaný hráč committne zbraň i bez viditelné poptávky útoku
 * → skrytý slot je pokryt, ne vynucený gamble). Párová podmínka přepisů
 * urednik-vaha/razitko drží sama: jejich skrytý slot je OBRANA → zbran_skryte=false
 * → signál nenavádí ke zbrani (žádný próza/signál drift, D19).
 *
 * @param {object[]} sloty definiční sloty situace (obsah — s `stat`, `viditelnost`)
 * @param {{chovani_dle_typu: object}} stitekParams parametry GANGSTER (obsah)
 * @param {string} typSituace npc|lokace|zatah|lecka|konfrontace
 * @returns {{trend: {slot_index: number, stat: (string|string[])}[],
 *   proti_srsti: number, zbran_projde: 'ano'|'jen_skryte', zbran_skryte: boolean}}
 */
export function deriveTelegrafSignal(sloty, stitekParams, typSituace) {
  const trend = sloty
    .map((s, i) => ({ slot_index: i, stat: s.stat, viditelnost: s.viditelnost }))
    .filter((s) => s.viditelnost === 'viditelna')
    .map(({ slot_index, stat }) => ({ slot_index, stat }));
  const proti_srsti = sloty.filter((s) => s.viditelnost === 'skryta').length;
  const chovani = stitekParams?.chovani_dle_typu?.[typSituace];
  const zbran_projde = chovani === 'vzdy_pass' ? 'ano' : 'jen_skryte';
  const zbran_skryte = sloty.some((s) => s.viditelnost === 'skryta' && slotHasStat(s, 'utok'));
  // P3 (D25f, princip „odvoditelnost nebo přeliv" D22b): tentýž lék jako
  // `zbran_skryte`, jen pro improvizaci. Próza telegrafu skrytou improvizační
  // roli hlásí už dnes („jedna skrytá ho zmate papírem"), ale derivovaný signál
  // ji nenesl — informovaný hráč tedy nemohl na skrytý slot reagovat commitem
  // a slot byl naslepo. Bez této derivace by próza a strojový signál tvrdily
  // každý něco jiného (porušení QA invariantu věrnosti, D19).
  const improv_skryte = sloty.some((s) => s.viditelnost === 'skryta' && slotHasStat(s, 'improvizace'));
  // Slotová VÝJIMKA ze štítku (`stitek_citlivy: GANGSTER`) — role, která zbraň
  // vítá i ve viditelném provedení. `resolveSlot` ji respektuje už dnes, ale
  // `zbran_projde` se odvozoval JEN z typu situace, takže telegraf u takové
  // situace tvrdil „zbraň na očích neprojde", zatímco jeden viditelný slot ji
  // vyžadoval. Próza a strojový signál si protiřečily (QA invariant věrnosti,
  // D19) a bot se výjimce vyhýbal, i když byla jediná cesta slot naplnit.
  const zbran_slot_vyjimka = sloty.some((s) => s.stitek_citlivy === 'GANGSTER');
  return { trend, proti_srsti, zbran_projde, zbran_skryte, improv_skryte, zbran_slot_vyjimka };
}
