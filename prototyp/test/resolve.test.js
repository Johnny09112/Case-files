// @ts-check
/**
 * v3 slotová resoluce — čisté funkce (resolve.js). Bez enginu, bez I/O.
 * Kotva ± šum, jednostat vs. kombi, GANGSTER chování, rušení statu
 * pronásledovatelem, pásmo z počtu zásahů, oracle max_achievable, telegraf.
 */
import { describe, it, expect } from 'vitest';
import { createRng } from '../src/engine/rng.js';
import { RULES } from '../src/engine/rules.js';
import { BAND } from '../src/engine/events.js';
import {
  slotPrah,
  resolveSlot,
  bandFromHits,
  maxAchievableZasahy,
  deriveTelegrafSignal,
  revealSlots,
  nonGangsterStatMax,
} from '../src/engine/resolve.js';

/** Zkratka pro věc s pěti staty. */
function vec(id, staty, stitek) {
  const base = { utok: 0, obrana: 0, hodnota: 0, improvizace: 0, nastroj: 0 };
  return { id, nazev: id, staty: { ...base, ...staty }, ...(stitek ? { stitek } : {}) };
}

const GANGSTER_PARAMS = {
  chovani_dle_typu: {
    npc: 'viditelna_role_selze',
    lecka: 'viditelna_role_selze',
    lokace: 'vzdy_pass',
    zatah: 'vzdy_pass',
    konfrontace: 'vzdy_pass',
  },
  hlucnost_zar: 1,
};

/* ---------- kotva ± šum ---------- */

describe('slotPrah — kotva ± šum', () => {
  const R = RULES.sumRozsah; // kalibrace-2: 2

  it('drží prah v [max(0,kotva−R), min(statMax,kotva+R)] a je deterministický dle seedu', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const prah = slotPrah(3, createRng(seed), RULES);
      expect(prah).toBeGreaterThanOrEqual(Math.max(0, 3 - R));
      expect(prah).toBeLessThanOrEqual(Math.min(RULES.statMax, 3 + R));
    }
    expect(slotPrah(3, createRng(7), RULES)).toBe(slotPrah(3, createRng(7), RULES));
  });

  it('pokryje celý rozsah {−R…+R} tam, kde clamp nezasahuje (kotva 3)', () => {
    const videno = new Set();
    for (let seed = 1; seed <= 400; seed++) videno.add(slotPrah(3, createRng(seed), RULES) - 3);
    const ocekavano = Array.from({ length: 2 * R + 1 }, (_, i) => i - R);
    expect([...videno].sort((a, b) => a - b)).toEqual(ocekavano);
  });

  it('clamp: širší šum nedělá beznadějné sloty — prah ∈ [0, statMax] pro každou kotvu (K5)', () => {
    for (let kotva = RULES.kotvaMin; kotva <= RULES.kotvaMax; kotva++) {
      for (let seed = 1; seed <= 300; seed++) {
        const prah = slotPrah(kotva, createRng(seed), RULES);
        expect(prah).toBeGreaterThanOrEqual(0);
        expect(prah).toBeLessThanOrEqual(RULES.statMax);
      }
    }
    // kotva 4 + 2 = 6 se zastropuje na statMax (5), ne na nedosažitelných 6.
    const maxPrah = Math.max(...Array.from({ length: 300 }, (_, i) => slotPrah(RULES.kotvaMax, createRng(i + 1), RULES)));
    expect(maxPrah).toBe(RULES.statMax);
  });
});

/* ---------- resolveSlot: jednostat ---------- */

describe('resolveSlot — jednostat', () => {
  const slot = { slot_index: 0, stat: 'utok', prah: 3, viditelnost: 'viditelna' };

  it('projde, když stat ≥ prah', () => {
    const r = resolveSlot({ karta: vec('a', { utok: 4 }), slot });
    expect(r.zasah).toBe(true);
    expect(r.stat_hodnota).toBe(4);
    expect(r.duvod).toBe('proslo');
  });

  it('selže, když stat < prah', () => {
    const r = resolveSlot({ karta: vec('a', { utok: 2 }), slot });
    expect(r.zasah).toBe(false);
    expect(r.duvod).toBe('nizky_stat');
  });
});

/* ---------- resolveSlot: kombi „oba ≥ prah" ---------- */

describe('resolveSlot — kombi', () => {
  const slot = { slot_index: 1, stat: ['nastroj', 'improvizace'], prah: 2, viditelnost: 'viditelna', typ_prahu: 'kombi_oba' };

  it('projde, jen když oba staty ≥ prah', () => {
    expect(resolveSlot({ karta: vec('a', { nastroj: 3, improvizace: 2 }), slot }).zasah).toBe(true);
  });

  it('selže, když jeden ze dvou statů nedosáhne', () => {
    const r = resolveSlot({ karta: vec('a', { nastroj: 4, improvizace: 1 }), slot });
    expect(r.zasah).toBe(false);
    expect(r.duvod).toBe('kombi_neuplny');
  });
});

/* ---------- resolveSlot: GANGSTER ---------- */

describe('resolveSlot — GANGSTER štítek', () => {
  it('ve viditelné roli npc AUTO-FAIL bez ohledu na staty', () => {
    const slot = { slot_index: 0, stat: 'utok', prah: 3, viditelnost: 'viditelna' };
    const r = resolveSlot({ karta: vec('bouchacka', { utok: 5 }, 'GANGSTER'), slot, stitekParams: GANGSTER_PARAMS, typSituace: 'npc' });
    expect(r.zasah).toBe(false);
    expect(r.stitek_efekt).toBe('auto_fail');
  });

  it('ve skryté roli npc se štítek ignoruje, hodnotí se dle statu', () => {
    const slot = { slot_index: 3, stat: 'utok', prah: 3, viditelnost: 'skryta' };
    const r = resolveSlot({ karta: vec('bouchacka', { utok: 5 }, 'GANGSTER'), slot, stitekParams: GANGSTER_PARAMS, typSituace: 'npc' });
    expect(r.zasah).toBe(true);
    expect(r.stitek_efekt).toBe(null);
  });

  it('v lokaci (vzdy_pass) projde i ve viditelné roli dle statu', () => {
    const slot = { slot_index: 0, stat: 'utok', prah: 3, viditelnost: 'viditelna' };
    const r = resolveSlot({ karta: vec('bouchacka', { utok: 5 }, 'GANGSTER'), slot, stitekParams: GANGSTER_PARAMS, typSituace: 'lokace' });
    expect(r.zasah).toBe(true);
  });

  it('slotová výjimka stitek_citlivy přebije auto-fail (eso i viditelně)', () => {
    const slot = { slot_index: 0, stat: 'utok', prah: 3, viditelnost: 'viditelna', stitek_citlivy: 'GANGSTER' };
    const r = resolveSlot({ karta: vec('bouchacka', { utok: 5 }, 'GANGSTER'), slot, stitekParams: GANGSTER_PARAMS, typSituace: 'npc' });
    expect(r.zasah).toBe(true);
  });
});

/* ---------- resolveSlot: pronásledovatel ruší stat ---------- */

describe('resolveSlot — pronásledovatel ruší stat run-wide', () => {
  const slot = { slot_index: 0, stat: 'hodnota', prah: 3, viditelnost: 'viditelna' };

  it('Malone: hodnota-stat čte jako 0 → jinak úspěšný slot selže', () => {
    const r = resolveSlot({ karta: vec('prsten', { hodnota: 5 }), slot, rusi: { typ: 'stat', cil: 'hodnota' } });
    expect(r.stat_hodnota).toBe(0);
    expect(r.zasah).toBe(false);
    expect(r.pronasledovatel_efekt).toEqual({ typ: 'stat', cil: 'hodnota' });
  });

  it('rušení jiného cíle slot neovlivní', () => {
    const r = resolveSlot({ karta: vec('prsten', { hodnota: 5 }), slot, rusi: { typ: 'stitek', cil: 'GANGSTER' } });
    expect(r.zasah).toBe(true);
    expect(r.pronasledovatel_efekt).toBe(null);
  });
});

/* ---------- zámkové postihy (D34/N1) ---------- */

describe('resolveSlot — zámkové postihy vlastníka karty', () => {
  const viditelny = { slot_index: 0, stat: 'utok', prah: 2, viditelnost: 'viditelna' };
  const skryty = { slot_index: 1, stat: 'utok', prah: 2, viditelnost: 'skryta' };
  const zbran = vec('bouchacka', { utok: 5 }, 'GANGSTER');

  it('lock_stitek: zamčený štítek auto-failuje bez ohledu na staty', () => {
    const r = resolveSlot({ karta: zbran, slot: skryty, zamky: { stitky: ['GANGSTER'], viditelnosti: [] } });
    expect(r.zasah).toBe(false);
    expect(r.duvod).toBe('postih_lock_stitek');
    expect(r.postih_efekt).toBe('lock_stitek');
  });

  it('lock_stitek se netýká věci bez štítku', () => {
    const r = resolveSlot({ karta: vec('klic', { utok: 5 }), slot: skryty, zamky: { stitky: ['GANGSTER'], viditelnosti: [] } });
    expect(r.zasah).toBe(true);
  });

  it('lock_slot_viditelnost: zamčená viditelnost auto-failuje, druhá projde', () => {
    const zamky = { stitky: [], viditelnosti: ['skryta'] };
    expect(resolveSlot({ karta: vec('klic', { utok: 5 }), slot: skryty, zamky }).duvod).toBe('postih_lock_viditelnost');
    expect(resolveSlot({ karta: vec('klic', { utok: 5 }), slot: viditelny, zamky }).zasah).toBe(true);
  });

  it('bez zámků se chování NEMĚNÍ (postih_efekt je null)', () => {
    const r = resolveSlot({ karta: vec('klic', { utok: 5 }), slot: skryty });
    expect(r.zasah).toBe(true);
    expect(r.postih_efekt).toBe(null);
  });

  it('oracle zámky vidí — nesmí slibovat zásah, který postih auto-failuje', () => {
    const sloty = [
      { slot_index: 0, stat: 'utok', prah: 2, viditelnost: 'viditelna' },
      { slot_index: 1, stat: 'obrana', prah: 2, viditelnost: 'viditelna' },
      { slot_index: 2, stat: 'hodnota', prah: 2, viditelnost: 'viditelna' },
      { slot_index: 3, stat: 'nastroj', prah: 2, viditelnost: 'skryta' },
    ];
    const karty = [zbran, vec('stit', { obrana: 5 }), vec('penize', { hodnota: 5 }), vec('naradi', { nastroj: 5 })];
    expect(maxAchievableZasahy(karty, sloty)).toBe(4);
    const zamky = [{ stitky: ['GANGSTER'], viditelnosti: [] }, null, null, null];
    expect(maxAchievableZasahy(karty, sloty, null, null, null, zamky)).toBe(3);
  });
});

/* ---------- pásmo z počtu zásahů ---------- */

describe('bandFromHits', () => {
  it('mapuje počet zásahů na pásmo', () => {
    expect(bandFromHits(4)).toBe(BAND.LOOT);
    expect(bandFromHits(3)).toBe(BAND.HLADCE);
    expect(bandFromHits(2)).toBe(BAND.NASLEDKY);
    expect(bandFromHits(1)).toBe(BAND.PRUSVIH);
    expect(bandFromHits(0)).toBe(BAND.PRUSVIH);
  });
});

/* ---------- oracle max_achievable ---------- */

describe('maxAchievableZasahy — oracle nad committnutými kartami', () => {
  const sloty = [
    { slot_index: 0, stat: 'utok', prah: 3, viditelnost: 'viditelna' },
    { slot_index: 1, stat: 'obrana', prah: 3, viditelnost: 'viditelna' },
    { slot_index: 2, stat: 'hodnota', prah: 3, viditelnost: 'viditelna' },
    { slot_index: 3, stat: 'nastroj', prah: 3, viditelnost: 'skryta' },
  ];

  it('najde optimální rozdělení (4/4 při ideálních specialistech)', () => {
    const karty = [
      vec('u', { utok: 4 }),
      vec('o', { obrana: 4 }),
      vec('h', { hodnota: 4 }),
      vec('n', { nastroj: 4 }),
    ];
    expect(maxAchievableZasahy(karty, sloty)).toBe(4);
  });

  it('odhalí nevyhnutelně špatný slot (max < 4/4)', () => {
    const karty = [
      vec('u', { utok: 4 }),
      vec('u2', { utok: 4 }),
      vec('u3', { utok: 4 }),
      vec('u4', { utok: 4 }), // nikdo neumí obranu/hodnotu/nástroj
    ];
    expect(maxAchievableZasahy(karty, sloty)).toBe(1); // jen útok-slot jde splnit
  });
});

/* ---------- telegraf derivace ---------- */

describe('deriveTelegrafSignal — engine derivuje ze slotů', () => {
  const sloty = [
    { slot_index: 0, stat: 'hodnota', kotva: 3, viditelnost: 'viditelna' },
    { slot_index: 1, stat: 'obrana', kotva: 2, viditelnost: 'viditelna' },
    { slot_index: 2, stat: 'nastroj', kotva: 2, viditelnost: 'viditelna' },
    { slot_index: 3, stat: 'utok', kotva: 3, viditelnost: 'skryta' },
  ];

  it('vydá trend viditelných statů, počet skrytých a verdikt zbraně (npc = jen skrytě)', () => {
    const sig = deriveTelegrafSignal(sloty, GANGSTER_PARAMS, 'npc');
    expect(sig.trend.map((t) => t.stat)).toEqual(['hodnota', 'obrana', 'nastroj']);
    expect(sig.proti_srsti).toBe(1);
    expect(sig.zbran_projde).toBe('jen_skryte');
  });

  it('neprozradí kotvy/prahy (jen staty)', () => {
    const sig = deriveTelegrafSignal(sloty, GANGSTER_PARAMS, 'npc');
    expect(sig.trend[0]).not.toHaveProperty('kotva');
    expect(sig.trend[0]).not.toHaveProperty('prah');
  });

  it('lokace: zbraň projde i viditelně', () => {
    expect(deriveTelegrafSignal(sloty, GANGSTER_PARAMS, 'lokace').zbran_projde).toBe('ano');
  });

  // Kalibrace-2 (D22 bod 3): pozitivní signál „zbraň se ve skrytém slotu vyplatí".
  it('zbran_skryte = true, když nějaký SKRYTÝ slot klíčuje na utok („kdyby přituhlo")', () => {
    expect(deriveTelegrafSignal(sloty, GANGSTER_PARAMS, 'npc').zbran_skryte).toBe(true);
  });

  it('zbran_skryte = false, když je skrytý slot obrana (párovost urednik-vaha/razitko — próza „papír > olovo")', () => {
    const obranaSkryta = [
      { slot_index: 0, stat: 'improvizace', kotva: 3, viditelnost: 'viditelna' },
      { slot_index: 1, stat: 'nastroj', kotva: 3, viditelnost: 'viditelna' },
      { slot_index: 2, stat: 'utok', kotva: 3, viditelnost: 'viditelna' }, // utok je VIDITELNÝ → nesignalizuje skrytou zbraň
      { slot_index: 3, stat: 'obrana', kotva: 2, viditelnost: 'skryta' },
    ];
    expect(deriveTelegrafSignal(obranaSkryta, GANGSTER_PARAMS, 'npc').zbran_skryte).toBe(false);
  });
});

/* ---------- V4-D supply-aware clamp (D58, design-audit-2p-2026-08-02.md §5.2) ---------- */

describe('nonGangsterStatMax — nejvyšší stat mezi věcmi BEZ GANGSTER', () => {
  it('vynechá GANGSTER věci, i když jsou statově nejsilnější', () => {
    const veci = [
      { id: 'a', staty: { utok: 4, obrana: 1, hodnota: 1, improvizace: 1, nastroj: 1 } },
      { id: 'zbran', staty: { utok: 5, obrana: 0, hodnota: 0, improvizace: 0, nastroj: 0 }, stitek: 'GANGSTER' },
      { id: 'b', staty: { utok: 2, obrana: 3, hodnota: 2, improvizace: 2, nastroj: 2 } },
    ];
    const max = nonGangsterStatMax(veci, RULES.staty);
    expect(max.utok).toBe(4); // ne 5 — jediná útok-5 věc je GANGSTER
    expect(max.obrana).toBe(3);
  });
});

describe('revealSlots — V4-D supply-aware clamp', () => {
  const GANGSTER_PARAMS = {
    chovani_dle_typu: { npc: 'viditelna_role_selze', lecka: 'viditelna_role_selze', lokace: 'vzdy_pass', zatah: 'vzdy_pass', konfrontace: 'vzdy_pass' },
    hlucnost_zar: 1,
  };
  const nonGangsterMax = { utok: 4, obrana: 5, hodnota: 5, improvizace: 5, nastroj: 5 };
  const rules = { ...RULES, sumRozsah: 0 }; // deterministický prah = kotva

  it('viditelný útok-slot v npc situaci (GANGSTER auto-failuje) se clampuje na 4, ne na statMax 5', () => {
    const situace = { id: 'x', typ: 'npc', sloty: [{ role: 'r', stat: 'utok', kotva: 4, viditelnost: 'viditelna' }] };
    const [slot] = revealSlots(situace, createRng(1), rules, { stitekParams: GANGSTER_PARAMS, nonGangsterMax });
    expect(slot.prah).toBe(4); // kotva 4 + šum 0 = 4, clampMax 4 → beze změny; ověřeno níže, že strop skutečně kouše
  });

  it('kotva, která by BEZ supply-aware clampu překročila statMax, se zastropuje na legální strop (4), ne na 5', () => {
    const rulesSum2 = { ...RULES, sumRozsah: 2, kotvaMax: 4 };
    // Deterministický RNG mock: vrátí vždy nejvyšší šum (+2) → kotva 4 + 2 = 6.
    const rngVzdyMax = { int: () => 2 * rulesSum2.sumRozsah, pick: () => null, shuffle: (a) => a };
    const situace = { id: 'x', typ: 'npc', sloty: [{ role: 'r', stat: 'utok', kotva: 4, viditelnost: 'viditelna' }] };
    const [slot] = revealSlots(situace, rngVzdyMax, rulesSum2, { stitekParams: GANGSTER_PARAMS, nonGangsterMax });
    expect(slot.prah).toBe(4); // BEZ V4-D by to bylo 5 (statMax) — s V4-D je strop 4 (legální karta)
  });

  it('skrytý slot, jiný typ situace nebo slotová výjimka GANGSTER nejsou supply-aware dotčené (strop zůstává statMax)', () => {
    const rulesSum2 = { ...RULES, sumRozsah: 2 };
    const rngVzdyMax = { int: () => 2 * rulesSum2.sumRozsah, pick: () => null, shuffle: (a) => a };
    const skryty = { id: 'x', typ: 'npc', sloty: [{ role: 'r', stat: 'utok', kotva: 4, viditelnost: 'skryta' }] };
    const lokace = { id: 'y', typ: 'lokace', sloty: [{ role: 'r', stat: 'utok', kotva: 4, viditelnost: 'viditelna' }] };
    const vyjimka = { id: 'z', typ: 'npc', sloty: [{ role: 'r', stat: 'utok', kotva: 4, viditelnost: 'viditelna', stitek_citlivy: 'GANGSTER' }] };
    for (const situace of [skryty, lokace, vyjimka]) {
      const [slot] = revealSlots(situace, rngVzdyMax, rulesSum2, { stitekParams: GANGSTER_PARAMS, nonGangsterMax });
      expect(slot.prah).toBe(RULES.statMax); // 5 — clamp NEkouše
    }
  });

  it('bez opts (staré volání) se chová přesně jako dřív — statMax, žádná regrese', () => {
    const rulesSum2 = { ...RULES, sumRozsah: 2 };
    const rngVzdyMax = { int: () => 2 * rulesSum2.sumRozsah, pick: () => null, shuffle: (a) => a };
    const situace = { id: 'x', typ: 'npc', sloty: [{ role: 'r', stat: 'utok', kotva: 4, viditelnost: 'viditelna' }] };
    const [slot] = revealSlots(situace, rngVzdyMax, rulesSum2);
    expect(slot.prah).toBe(RULES.statMax);
  });
});
