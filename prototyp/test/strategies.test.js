// @ts-check
/**
 * Botí strategie: cíle-driven deviace (D21/4a) a gamble policy K7 (D21/4b).
 */
import { describe, it, expect } from 'vitest';
import { decideAssignment, createStrategy } from '../sim/strategies.js';
import { playRun, PRESETY } from '../sim/run.js';
import { RULES } from '../src/engine/rules.js';
import { EVENT } from '../src/engine/events.js';
import { syntetickyObsah, hraci } from './helpers.js';

function vec(id, staty, stitek) {
  const base = { utok: 0, obrana: 0, hodnota: 0, improvizace: 0, nastroj: 0 };
  return { id, nazev: id, staty: { ...base, ...staty }, ...(stitek ? { stitek } : {}) };
}

const GANGSTER_PARAMS = {
  chovani_dle_typu: { npc: 'viditelna_role_selze', lecka: 'viditelna_role_selze', lokace: 'vzdy_pass', zatah: 'vzdy_pass', konfrontace: 'vzdy_pass' },
  hlucnost_zar: 1,
};

describe('cíle-driven deviace (D21/4a)', () => {
  const sloty = [
    { slot_index: 0, stat: 'utok', kotva: 3, prah: 3, viditelnost: 'viditelna' },
    { slot_index: 1, stat: 'obrana', kotva: 3, prah: 3, viditelnost: 'viditelna' },
    { slot_index: 2, stat: 'hodnota', kotva: 3, prah: 3, viditelnost: 'viditelna' },
    { slot_index: 3, stat: 'nastroj', kotva: 3, prah: 3, viditelnost: 'skryta' },
  ];
  const committed = [
    { hrac_id: 'p1', karta: vec('zbran', { utok: 5 }, 'GANGSTER') },
    { hrac_id: 'p2', karta: vec('stit', { obrana: 5 }) },
    { hrac_id: 'p3', karta: vec('penize', { hodnota: 5 }) },
    { hrac_id: 'p4', karta: vec('naradi', { nastroj: 5 }) },
  ];

  it('kompetentni dá GANGSTER do viditelného útok-slotu, cíle (cista-ruka) NE', () => {
    const komp = decideAssignment({ strat: 'kompetentni', committed, sloty, stitekParams: GANGSTER_PARAMS, typSituace: 'npc' });
    // GANGSTER je karta 0 → kam ji kompetentni dal?
    const kompSlot = sloty[komp[0]];
    expect(kompSlot.viditelnost).toBe('viditelna');

    const cile = decideAssignment({
      strat: 'cile',
      committed,
      sloty,
      stitekParams: GANGSTER_PARAMS,
      typSituace: 'npc',
      goalByHrac: { p1: 'cista-ruka' },
    });
    const cileSlot = sloty[cile[0]];
    expect(cileSlot.viditelnost).toBe('skryta'); // vyhnul se viditelné roli
  });

  it('dve-jizvy tlačí vlastní kartu do slotu, kde spíš propadne', () => {
    const slotyLow = [
      { slot_index: 0, stat: 'utok', kotva: 2, prah: 2, viditelnost: 'viditelna' },
      { slot_index: 1, stat: 'obrana', kotva: 4, prah: 4, viditelnost: 'viditelna' },
    ];
    const c2 = [
      { hrac_id: 'p1', karta: vec('a', { utok: 3, obrana: 3 }) }, // projde útok(k2), propadne obrana(k4)
      { hrac_id: 'p2', karta: vec('b', { utok: 5, obrana: 5 }) },
    ];
    const komp = decideAssignment({ strat: 'kompetentni', committed: c2, sloty: slotyLow });
    const cile = decideAssignment({ strat: 'cile', committed: c2, sloty: slotyLow, goalByHrac: { p1: 'dve-jizvy' } });
    // cíle posune p1 do slotu, kde propadne (obrana k4) — jiné než kompetentni
    expect(JSON.stringify(cile)).not.toBe(JSON.stringify(komp));
  });
});

describe('prověrka bota — veřejná pravidla, která bot dřív ignoroval (D34)', () => {
  it('N1: kompetentní přiřazení se vyhne slotu, kde vlastníkův zámkový postih kartu auto-failuje', () => {
    // lock_slot_viditelnost je slot-specifický, takže vyhnutí je pozorovatelné:
    // p1 je v skrytém slotu mrtvý, i když je tam jinak nejlepší kandidát.
    const dvaSloty = [
      { slot_index: 0, stat: 'utok', kotva: 3, prah: 3, viditelnost: 'viditelna' },
      { slot_index: 1, stat: 'nastroj', kotva: 3, prah: 3, viditelnost: 'skryta' },
    ];
    const committed = [
      { hrac_id: 'p1', karta: vec('klic', { nastroj: 5, utok: 4 }) },
      { hrac_id: 'p2', karta: vec('pest', { utok: 5, nastroj: 4 }) },
    ];
    const bez = decideAssignment({ strat: 'kompetentni', committed, sloty: dvaSloty });
    expect(dvaSloty[bez[0]].viditelnost).toBe('skryta'); // klíč patří do nástroje

    const se = decideAssignment({
      strat: 'kompetentni', committed, sloty: dvaSloty,
      zamkyKaret: [{ stitky: [], viditelnosti: ['skryta'] }, null],
    });
    expect(dvaSloty[se[0]].viditelnost).toBe('viditelna'); // do skryté role nemá cenu ho dávat
  });

  it('N1: hráč se zamčeným štítkem zbraň vůbec NECOMMITTNE', () => {
    const base = syntetickyObsah();
    // Situace volá po útoku a v ruce je jen zbraň a slabší alternativy.
    const situace = base.situace.map((s) => (s.typ === 'lokace' ? {
      ...s,
      sloty: [
        { role: 'a', stat: 'utok', kotva: 3, viditelnost: 'viditelna' },
        { role: 'b', stat: 'utok', kotva: 3, viditelnost: 'viditelna' },
        { role: 'c', stat: 'utok', kotva: 3, viditelnost: 'viditelna' },
        { role: 'd', stat: 'utok', kotva: 3, viditelnost: 'skryta' },
      ],
    } : s));
    const veci = base.veci.map((v, i) => (i % 2 === 0
      ? { ...v, staty: { utok: 5, obrana: 0, hodnota: 0, improvizace: 0, nastroj: 0 }, stitek: 'GANGSTER' }
      : { ...v, staty: { utok: 2, obrana: 2, hodnota: 2, improvizace: 2, nastroj: 2 } }));
    const content = { ...base, situace, veci };
    const komp = createStrategy(PRESETY.kompetentni, 1, RULES, content);
    const stav = {
      zar: 0,
      pronasledovatel: { rusi: null },
      situace: {
        id: situace[0].id, typ: 'lokace', signal: { trend: [{ slot_index: 0, stat: 'utok' }], proti_srsti: 3, zbran_projde: 'ano', zbran_skryte: true, improv_skryte: false, zbran_slot_vyjimka: false },
        commitPlan: [{ hrac_id: 'p1', pocet: 1 }],
      },
      postavy: [{ id: 'p1', ruka: [veci[0], veci[1]], postihy: [{ id: 'ochrnuta-ruka', tier: 'tezky', efekt: { druh: 'lock_stitek', stitek: 'GANGSTER' } }] }],
    };
    let dano = null;
    komp.commit(stav, { getHand: () => stav.postavy[0].ruka, commitCards: (l) => { dano = l; } });
    expect(dano).toHaveLength(1);
    expect(dano[0].cardId).toBe(veci[1].id); // slabší, ale hratelná karta
  });

  it('N1: hide_viditelnost oslepí VLASTNÍKA — nedohlédne na auto-fail zbraně ve viditelné roli', () => {
    const committed = [
      { hrac_id: 'p1', karta: vec('zbran', { utok: 5, nastroj: 1 }, 'GANGSTER') },
      { hrac_id: 'p2', karta: vec('klic', { utok: 3, nastroj: 3 }) },
    ];
    const dvaSloty = [
      { slot_index: 0, stat: 'utok', kotva: 3, prah: 3, viditelnost: 'viditelna' },
      { slot_index: 1, stat: 'nastroj', kotva: 3, prah: 3, viditelnost: 'skryta' },
    ];
    const vidi = decideAssignment({ strat: 'kompetentni', committed, sloty: dvaSloty, stitekParams: GANGSTER_PARAMS, typSituace: 'npc' });
    expect(dvaSloty[vidi[0]].viditelnost).toBe('skryta'); // ví, že na očích zbraň padne

    const slepy = decideAssignment({
      strat: 'kompetentni', committed, sloty: dvaSloty, stitekParams: GANGSTER_PARAMS, typSituace: 'npc',
      slepiNaViditelnost: [true, false],
    });
    expect(dvaSloty[slepy[0]].viditelnost).toBe('viditelna'); // útok 5 vypadá lákavě
  });

  it('N3: commit proti Malonovi nebere kartu vybranou podle nulovaného statu', () => {
    const base = syntetickyObsah();
    // Dvě „role" v telegrafu: hodnota (Malone ji nuluje) a nástroj.
    const situace = base.situace.map((s) => (s.typ === 'npc' || s.typ === 'lokace' ? {
      ...s,
      sloty: [
        { role: 'a', stat: 'hodnota', kotva: 3, viditelnost: 'viditelna' },
        { role: 'b', stat: 'nastroj', kotva: 3, viditelnost: 'viditelna' },
        { role: 'c', stat: 'nastroj', kotva: 3, viditelnost: 'viditelna' },
        { role: 'd', stat: 'obrana', kotva: 3, viditelnost: 'skryta' },
      ],
    } : s));
    const veci = base.veci.map((v, i) => (i % 2 === 0
      ? { ...v, staty: { utok: 0, obrana: 0, hodnota: 5, improvizace: 0, nastroj: 0 } } // jen nulovaná hodnota
      : { ...v, staty: { utok: 0, obrana: 3, hodnota: 0, improvizace: 0, nastroj: 4 } }));
    const events = playRun({ seed: 3, content: { ...base, situace, veci }, players: hraci(1), pronasledovatelId: 'agent-malone', spec: PRESETY.kompetentni });
    const commity = events.filter((e) => e.type === EVENT.COMMIT);
    expect(commity.length).toBeGreaterThan(0);
    // Karty „jen hodnota" jsou proti Malonovi bezcenné — bot je nesmí preferovat.
    const bezcenne = commity.flatMap((e) => e.commit).filter((c) => c.staty.hodnota === 5).length;
    const uzitecne = commity.flatMap((e) => e.commit).filter((c) => c.staty.nastroj === 4).length;
    expect(uzitecne).toBeGreaterThan(bezcenne);
  });
});

describe('gamble policy K7 (D21/4b)', () => {
  it('při 4/4 (univerzální karty) se gamble NEbere', () => {
    const base = syntetickyObsah();
    const veci = base.veci.map((v) => ({ ...v, staty: { utok: 5, obrana: 5, hodnota: 5, improvizace: 5, nastroj: 5 } }));
    const events = playRun({ seed: 1, content: { ...base, veci }, players: hraci(1), pronasledovatelId: 'serif-brody', spec: PRESETY.kompetentni });
    expect(events.some((e) => e.type === EVENT.GAMBLE)).toBe(false);
  });

  it('při odhadu ≤2/4 (slabé karty) gamble aspoň jednou vystřelí', () => {
    const base = syntetickyObsah();
    const veci = base.veci.map((v) => ({ ...v, staty: { utok: 1, obrana: 1, hodnota: 1, improvizace: 1, nastroj: 1 } }));
    const events = playRun({ seed: 2, content: { ...base, veci }, players: hraci(2), pronasledovatelId: 'serif-brody', spec: PRESETY.kompetentni });
    expect(events.some((e) => e.type === EVENT.GAMBLE)).toBe(true);
  });
});
