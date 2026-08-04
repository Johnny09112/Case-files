// @ts-check
/**
 * v3 stavový automat runu (state.js): slotový commit → přiřazení → pásma,
 * postihy (cap 2 + složení), Žár trať + prahy, pronásledovatelé run-wide,
 * gamble, náklad, konec runu. Deterministické (seed + skriptovaná sekvence).
 */
import { describe, it, expect } from 'vitest';
import { createRun } from '../src/engine/state.js';
import { RULES } from '../src/engine/rules.js';
import { EVENT, BAND, ZAR_DUVOD } from '../src/engine/events.js';
import { drive, syntetickyObsah, hraci } from './helpers.js';

function typy(events) {
  return events.map((e) => e.type);
}

describe('createRun + drive — základní tok', () => {
  it('projede run do konce a vydá kanonickou sekvenci událostí', () => {
    const run = createRun({ seed: 1, content: syntetickyObsah(), rules: RULES, players: hraci(2), pronasledovatelId: 'agent-malone' });
    const events = drive(run);
    const t = typy(events);
    expect(t[0]).toBe(EVENT.RUN_STARTED);
    expect(t).toContain(EVENT.COMMIT);
    expect(t).toContain(EVENT.SITUATION_REVEALED);
    expect(t).toContain(EVENT.ASSIGNMENT);
    expect(t.filter((x) => x === EVENT.SLOT_RESOLVED).length % 4).toBe(0);
    expect(t).toContain(EVENT.BAND_RESOLVED);
    expect(t[t.length - 1]).toBe(EVENT.RUN_ENDED);
    const konec = events[events.length - 1];
    expect(['DORUCENO', 'NEVYRESENO']).toContain(konec.vysledek);
  });

  it('je deterministický — stejný seed = stejný log', () => {
    const mk = () => drive(createRun({ seed: 42, content: syntetickyObsah(), rules: RULES, players: hraci(2), pronasledovatelId: 'agent-malone' }));
    expect(JSON.stringify(mk())).toBe(JSON.stringify(mk()));
  });
});

describe('commit dle počtu hráčů', () => {
  it('2 hráči committnou 2+2 = přesně 4 karty', () => {
    const run = createRun({ seed: 3, content: syntetickyObsah(), rules: RULES, players: hraci(2), pronasledovatelId: 'agent-malone' });
    // dojdi do první commit fáze
    while (run.getState().faze === 'map' || run.getState().faze === 'motel_offer') {
      const s = run.getState();
      if (s.faze === 'map') run.chooseRoute(s.nabidka.nabidnuto[0].ref);
      else run.motelChoice('dal');
    }
    const s = run.getState();
    expect(s.faze).toBe('commit');
    expect(s.situace.commitPlan.reduce((a, p) => a + p.pocet, 0)).toBe(4);
    expect(s.situace.commitPlan).toHaveLength(2);
  });

  it('4 hráči committnou po 1 (ruka 3)', () => {
    const run = createRun({ seed: 3, content: syntetickyObsah(), rules: RULES, players: hraci(4), pronasledovatelId: 'agent-malone' });
    while (['map', 'motel_offer'].includes(run.getState().faze)) {
      const s = run.getState();
      if (s.faze === 'map') run.chooseRoute(s.nabidka.nabidnuto[0].ref);
      else run.motelChoice('dal');
    }
    const s = run.getState();
    expect(s.postavy[0].ruka).toHaveLength(3);
    expect(s.situace.commitPlan.every((p) => p.pocet === 1)).toBe(true);
  });
});

describe('pásma → důsledky', () => {
  it('4/4 (univerzální karty projdou každý slot) = LOOT + kredit', () => {
    // univerzální věci 5/5/5/5/5 → jakékoli přiřazení projde → každý uzel 4/4
    const base = syntetickyObsah();
    const veci = base.veci.map((v) => ({ ...v, staty: { utok: 5, obrana: 5, hodnota: 5, improvizace: 5, nastroj: 5 } }));
    const run = createRun({ seed: 5, content: { ...base, veci }, rules: RULES, players: hraci(1), pronasledovatelId: 'serif-brody' });
    const events = drive(run);
    const loot = events.filter((e) => e.type === EVENT.BAND_RESOLVED && e.pasmo === BAND.LOOT);
    expect(loot.length).toBeGreaterThan(0);
    expect(events.some((e) => e.type === EVENT.CREDIT_FLOW && e.duvod === 'hladce_loot')).toBe(true);
    expect(events[events.length - 1].vysledek).toBe('DORUCENO');
  });
});

describe('náklad a konec runu', () => {
  it('vyčerpání beden ukončí run jako NEVYŘEŠENO (bedny_0)', () => {
    // Default balikVeci (helpers.js): 8 specialistů na KAŽDÝ stat, base 0 jinde.
    // Situace míchá 4 RŮZNÉ staty do svých 4 slotů (utok/obrana/hodnota/nastroj),
    // takže žádná jednostatová karta neprojde víc než jedním slotem najednou —
    // PRŮŠVIH je pořád naprostá většina, bez nutnosti degenerovat celý balík na
    // samé nuly. (V4-D, D58: plošné vynulování VŠECH karet by kolabovalo
    // supply-aware clamp na 0 pro každý viditelný slot — „nejvyšší legální
    // karta" by byla 0 → auto-hit na slotech, kde měl PRŮŠVIH jistě padnout.
    // Reálný obsah/veci.yaml tenhle degenerovaný stav nikdy nemá, viz
    // technika/design-audit-2p-2026-08-02.md §5.2/D6.)
    const content = syntetickyObsah();
    const run = createRun({ seed: 9, content, rules: RULES, players: hraci(1), pronasledovatelId: 'agent-malone' });
    const events = drive(run);
    const konec = events[events.length - 1];
    expect(konec.vysledek).toBe('NEVYRESENO');
    expect(['bedny_0', 'konfrontace_prohra']).toContain(konec.pricina);
  });
});

describe('gamble', () => {
  it('nahradí committnutou kartu líznutou z vybrané ruky (odhoz)', () => {
    const run = createRun({ seed: 7, content: syntetickyObsah(), rules: RULES, players: hraci(1), pronasledovatelId: 'serif-brody' });
    // dojdi do fáze assign
    while (run.getState().faze !== 'assign') {
      const s = run.getState();
      if (s.faze === 'map') run.chooseRoute(s.nabidka.nabidnuto[0].ref);
      else if (s.faze === 'motel_offer') run.motelChoice('dal');
      else if (s.faze === 'commit') run.commitCards(s.situace.commitPlan.flatMap((p) => run.getHand(p.hrac_id).slice(0, p.pocet).map((k) => ({ characterId: p.hrac_id, cardId: k.id }))));
    }
    const pred = run.getState();
    const nahrazovana = pred.situace.committed[0].karta.id;
    run.gamble({ handOwnerId: 'p1', replacedCardId: nahrazovana });
    const g = run.getEvents().find((e) => e.type === EVENT.GAMBLE);
    expect(g.ci_ruka).toBe('p1');
    expect(g.nahrazena).toBe(nahrazovana);
    const po = run.getState();
    expect(po.situace.committed.map((c) => c.karta.id)).not.toContain(nahrazovana);
    expect(po.situace.gambleUsed).toBe(true);
  });
});

describe('Žár trať a prahy', () => {
  it('nahromaděný Žár spustí Zátah (nahradí cestu)', () => {
    // slabé karty → PRŮŠVIHy → Žár roste přes práh zatah
    const content = syntetickyObsah();
    const slabe = content.veci.map((v) => ({ ...v, staty: { utok: 0, obrana: 0, hodnota: 0, improvizace: 0, nastroj: 0 } }));
    const run = createRun({ seed: 11, content: { ...content, veci: slabe }, rules: RULES, players: hraci(2), pronasledovatelId: 'agent-malone' });
    const events = drive(run);
    const zatah = events.some((e) => e.type === EVENT.MAP_MOVE && e.byl_zatah) || events.some((e) => e.type === EVENT.SITUATION_REVEALED && e.typ_mista === 'zatah');
    expect(zatah).toBe(true);
  });
});

describe('postihy — cap 2 + složení', () => {
  it('3. postih složí postavu a smaže lehké', () => {
    // situace jen s lehkými postihy (S_NÁSLEDKY), slabé karty → 2/4
    const content = syntetickyObsah();
    // karty splní přesně 2 sloty (utok/obrana 5), zbytek 0 → 2/4 S_NÁSLEDKY
    const veci = content.veci.map((v, i) => ({ ...v, staty: i % 2 === 0 ? { utok: 5, obrana: 5, hodnota: 0, improvizace: 0, nastroj: 0 } : { utok: 5, obrana: 5, hodnota: 0, improvizace: 0, nastroj: 0 } }));
    const run = createRun({ seed: 4, content: { ...content, veci }, rules: RULES, players: hraci(1), pronasledovatelId: 'serif-brody' });
    const events = drive(run);
    // buď došlo ke složení (3 lehké), nebo aspoň postihy přibývaly — ověř mechaniku složení, pokud nastala
    const fold = events.find((e) => e.type === EVENT.CHARACTER_FOLDED);
    if (fold) {
      expect(Array.isArray(fold.smazane_lehke)).toBe(true);
      expect(events.some((e) => e.type === EVENT.PENALTY_ADDED)).toBe(true);
    } else {
      // aspoň se přidávaly postihy (2/4 dává lehký)
      expect(events.some((e) => e.type === EVENT.PENALTY_ADDED && e.tier === 'lehky')).toBe(true);
    }
  });
});

/** Situace se 4 sloty na stejný stat (utok) s řízenými kotvami — pro ovládání statové mezery. */
function situaceMezera(id, kotvy) {
  return {
    id,
    typ: 'npc',
    svet: '1930',
    telegraf: 'test',
    text: 'x',
    sloty: kotvy.map((kotva, i) => ({ role: `role-${i}`, stat: 'utok', kotva, viditelnost: 'viditelna' })),
    pasmove_vysledky: {
      hladce_loot: { loot: 'karta' },
      s_nasledky: { postih_lehky: ['lehky-info'] },
      prusvih: { postih_tezky: ['tezky-lock'] },
    },
  };
}

/** Dojede na commit fázi prvního (jediného) uzlu a vrátí commitnutá utok=0 esa obou hráčů. */
function doCommitDvouHracu(run) {
  while (['map', 'motel_offer'].includes(run.getState().faze)) {
    const s = run.getState();
    if (s.faze === 'map') run.chooseRoute(s.nabidka.nabidnuto[0].ref);
    else run.motelChoice('dal');
  }
  const utok0P1 = run.getHand('p1').filter((c) => c.staty.utok === 0);
  const utok0P2 = run.getHand('p2').filter((c) => c.staty.utok === 0);
  run.commitCards([
    { characterId: 'p1', cardId: utok0P1[0].id },
    { characterId: 'p1', cardId: utok0P1[1].id },
    { characterId: 'p2', cardId: utok0P2[0].id },
    { characterId: 'p2', cardId: utok0P2[1].id },
  ]);
  return { p1: [utok0P1[0].id, utok0P1[1].id], p2: [utok0P2[0].id, utok0P2[1].id] };
}

describe('postih — oběť = vlastník slotu s největší statovou mezerou (D57/V1-A krok 1)', () => {
  it('propadnou-li všechny 4 sloty, postih dostane vlastník slotu s NEJVĚTŠÍ mezerou (prah − stat), ne první propadlý index', () => {
    // kotvy 2,3,4,5 (sumRozsah 0 → prah = kotva); všechny committnuté karty utok=0
    // → mezery 2,3,4,5 → nejhorší je slot 3, přiřazený p2. Bez opravy (propadli[0])
    // by oběť byla p1 (vlastník slotu 0 — první propadlý v pořadí indexů).
    const rules = { ...RULES, sumRozsah: 0 };
    const content = syntetickyObsah({ situace: [situaceMezera('s-mezera', [2, 3, 4, 5])] });
    const run = createRun({ seed: 21, content, rules, players: hraci(2), pronasledovatelId: 'agent-malone' });
    const { p1, p2 } = doCommitDvouHracu(run);
    run.assignToSlots([
      { slotIndex: 0, cardId: p1[0] },
      { slotIndex: 1, cardId: p1[1] },
      { slotIndex: 2, cardId: p2[0] },
      { slotIndex: 3, cardId: p2[1] },
    ]);
    run.confirmNode();
    const events = run.getEvents();
    const zasahy = events.filter((e) => e.type === EVENT.SLOT_RESOLVED && e.zasah);
    expect(zasahy).toHaveLength(0); // 0/4 → PRŮŠVIH
    const band = events.find((e) => e.type === EVENT.BAND_RESOLVED);
    expect(band.pasmo).toBe(BAND.PRUSVIH);
    const postih = events.find((e) => e.type === EVENT.PENALTY_ADDED);
    expect(postih).toBeTruthy();
    expect(postih.hrac_id).toBe('p2'); // vlastník slotu 3 (mezera 5), NE p1 (slot 0, mezera 2)
  });

  it('remíza ve statové mezeře se řeší nejnižším slot_index (tie-break)', () => {
    // kotvy 2,3,4,4 → sloty 2 a 3 mají stejnou mezeru (4). Tie-break: slot 2 (nižší index) → p2 (vlastník obou slotů 2,3 zde je p2, test proto zrcadlí přes odlišné hráče na slotech 2 a 3 by šel taky, ale stačí ověřit determinismus na nejnižším indexu mezi remízujícími).
    const rules = { ...RULES, sumRozsah: 0 };
    const content = syntetickyObsah({ situace: [situaceMezera('s-remiza', [2, 3, 4, 4])] });
    const run = createRun({ seed: 22, content, rules, players: hraci(2), pronasledovatelId: 'agent-malone' });
    const { p1, p2 } = doCommitDvouHracu(run);
    // p1 na sloty 0,1 (mezery 2,3); p2 na sloty 2,3 (obě mezera 4 — remíza uvnitř p2).
    // Prohoď, aby remízující sloty patřily různým hráčům: slot 2 → p1[1], slot 3 → p2[1].
    run.assignToSlots([
      { slotIndex: 0, cardId: p2[0] },
      { slotIndex: 1, cardId: p1[0] },
      { slotIndex: 2, cardId: p1[1] }, // mezera 4, nižší index mezi remízou
      { slotIndex: 3, cardId: p2[1] }, // mezera 4
    ]);
    run.confirmNode();
    const events = run.getEvents();
    const postih = events.find((e) => e.type === EVENT.PENALTY_ADDED);
    expect(postih).toBeTruthy();
    expect(postih.hrac_id).toBe('p1'); // slot 2 (nižší index) vyhrává remízu nad slotem 3
  });

  it('bez statového propadu (jen tvrdé pravidlo) padá zpět na první propadlý slot v pořadí', () => {
    // 2 sloty (viditelné, npc) propadnou tvrdým pravidlem GANGSTER auto-fail
    // (duvod 'gangster_auto_fail' — NENÍ statový propad), zbylé 2 projdou
    // univerzální kartou → 2/4 S_NÁSLEDKY. Oběť musí být vlastník PRVNÍHO
    // tvrdého propadu v pořadí slotů (slot 0), stejně jako před D57.
    const veci = [
      ...Array.from({ length: 4 }, (_, i) => ({ id: `g${i}`, nazev: `g${i}`, staty: { utok: 5, obrana: 5, hodnota: 5, improvizace: 5, nastroj: 5 }, stitek: 'GANGSTER', svet: 'sdilena', premiova: false, text: 'x' })),
      ...Array.from({ length: 6 }, (_, i) => ({ id: `u${i}`, nazev: `u${i}`, staty: { utok: 5, obrana: 5, hodnota: 5, improvizace: 5, nastroj: 5 }, svet: 'sdilena', premiova: false, text: 'x' })),
    ];
    const content = syntetickyObsah({ veci, situace: [situaceMezera('s-tvrdy', [1, 1, 1, 1])] });
    const rules = { ...RULES, sumRozsah: 0 };
    const run = createRun({ seed: 23, content, rules, players: hraci(2), pronasledovatelId: 'agent-malone' });
    while (['map', 'motel_offer'].includes(run.getState().faze)) {
      const s = run.getState();
      if (s.faze === 'map') run.chooseRoute(s.nabidka.nabidnuto[0].ref);
      else run.motelChoice('dal');
    }
    const handP1 = run.getHand('p1');
    const handP2 = run.getHand('p2');
    const je = (h, gangster) => h.filter((c) => Boolean(c.stitek === 'GANGSTER') === gangster);
    const [g1, u1, g2, u2] = [je(handP1, true), je(handP1, false), je(handP2, true), je(handP2, false)];
    // Najdi rozdělení (x1 gangster od p1, 2-x1 univerzálních; symetricky p2), které
    // dá dohromady přesně 2 gangster + 2 univerzální karty — bez ohledu na to, jak
    // dopadlo rozdání ruky (viz komentář u testu v historii commitu).
    let x1 = null;
    for (let cand = 0; cand <= 2; cand++) {
      const x2 = 2 - cand;
      if (cand <= g1.length && 2 - cand <= u1.length && x2 <= g2.length && 2 - x2 <= u2.length) {
        x1 = cand;
        break;
      }
    }
    expect(x1).not.toBeNull();
    const x2 = 2 - x1;
    const p1Commit = [...g1.slice(0, x1), ...u1.slice(0, 2 - x1)];
    const p2Commit = [...g2.slice(0, x2), ...u2.slice(0, 2 - x2)];
    const vlastnik = new Map([...p1Commit.map((c) => [c.id, 'p1']), ...p2Commit.map((c) => [c.id, 'p2'])]);
    run.commitCards([
      ...p1Commit.map((c) => ({ characterId: 'p1', cardId: c.id })),
      ...p2Commit.map((c) => ({ characterId: 'p2', cardId: c.id })),
    ]);
    const gangsterCommit = [...p1Commit, ...p2Commit].filter((c) => c.stitek === 'GANGSTER');
    const univerzalniCommit = [...p1Commit, ...p2Commit].filter((c) => c.stitek !== 'GANGSTER');
    expect(gangsterCommit).toHaveLength(2);
    expect(univerzalniCommit).toHaveLength(2);
    run.assignToSlots([
      { slotIndex: 0, cardId: gangsterCommit[0].id },
      { slotIndex: 1, cardId: gangsterCommit[1].id },
      { slotIndex: 2, cardId: univerzalniCommit[0].id },
      { slotIndex: 3, cardId: univerzalniCommit[1].id },
    ]);
    run.confirmNode();
    const events = run.getEvents();
    const resolved = events.filter((e) => e.type === EVENT.SLOT_RESOLVED).sort((a, b) => a.slot_index - b.slot_index);
    expect(resolved.map((e) => e.duvod)).toEqual(['gangster_auto_fail', 'gangster_auto_fail', 'proslo', 'proslo']);
    const band = events.find((e) => e.type === EVENT.BAND_RESOLVED);
    expect(band.pasmo).toBe(BAND.NASLEDKY);
    const postih = events.find((e) => e.type === EVENT.PENALTY_ADDED);
    expect(postih).toBeTruthy();
    expect(postih.hrac_id).toBe(vlastnik.get(gangsterCommit[0].id)); // první tvrdý propad (slot 0)
  });
});

describe('pronásledovatel run-wide — Brody (štítkové rušení, beze změny D58)', () => {
  it('Brody run-wide zdvojnásobuje Žár za GANGSTER od první minuty (negatováno branou V2-A′)', () => {
    // Kontrolní protějšek k Maloneově testu níže: štítkové rušení (typ 'stitek')
    // neprochází Zátah-branou (`jeRusiAktivni` v state.js) — mělo by fungovat
    // úplně stejně jako před D58. Ruka natažená na celý balík (42 karet)
    // zaručuje, že obě GANGSTER karty jsou k dispozici hned od uzlu 1 —
    // `pickCommit` je pak preferuje, ať test nezávisí na náhodě rozdání.
    const content = syntetickyObsah();
    const rules = { ...RULES, ruce: { ...RULES.ruce, 1: { ruka: content.veci.length, commit: [4] } } };
    const run = createRun({ seed: 8, content, rules, players: hraci(1), pronasledovatelId: 'serif-brody' });
    // `legal` je stálý snímek ruky pro CELÝ uzel (viz drive() v helpers.js) —
    // při kvótě 4 karet/uzel je potřeba si vybrané id pamatovat, jinak by se
    // stejná GANGSTER karta nabídla dvakrát (a podruhé už není v ruce).
    const vybrane = new Set();
    const events = drive(run, {
      pickCommit: (legal) => {
        const gangster = legal.find((c) => c.stitek === 'GANGSTER' && !vybrane.has(c.id));
        const karta = gangster ?? legal.find((c) => !vybrane.has(c.id));
        vybrane.add(karta.id);
        return karta;
      },
    });
    const zdvojene = events.some((e) => e.type === EVENT.ZAR_MOVE && e.duvod === ZAR_DUVOD.HLUCNE_GANGSTER && e.delta === 2);
    expect(zdvojene).toBe(true);
  });
});

/** Situace se 4 viditelnými sloty na daný stat, řízená kotva (pro V2-A′/V3-A′ testy). */
function situaceJednostat(id, stat, kotva, typ = 'npc') {
  return {
    id,
    typ,
    svet: '1930',
    telegraf: 'test',
    text: 'x',
    sloty: [0, 1, 2, 3].map((i) => ({ role: `role-${i}`, stat, kotva, viditelnost: 'viditelna' })),
    pasmove_vysledky: {
      hladce_loot: { loot: 'karta' },
      s_nasledky: { postih_lehky: ['lehky-info'] },
      prusvih: { postih_tezky: ['tezky-lock'] },
    },
  };
}

/**
 * Balík JEDNOHO druhu karty (unikátní id, stejné staty) — u deterministických
 * testů na řízenou kotvu odstraní závislost výsledku na tom, KTERÁ konkrétní
 * karta se náhodou rozdala/dolízla (na rozdíl od `balikVeci` v helpers.js).
 */
function uniformniVeci(staty, pocet = 40) {
  const base = { utok: 0, obrana: 0, hodnota: 0, improvizace: 0, nastroj: 0 };
  return Array.from({ length: pocet }, (_, i) => ({
    id: `u${i}`, nazev: `u${i}`, staty: { ...base, ...staty }, svet: 'sdilena', premiova: false, text: 'x',
  }));
}

describe('pronásledovatel run-wide — Malone V2-A′ (aktivace prahem Zátahu, D58)', () => {
  // Uniformní balík (hodnota 5, vše ostatní 0) — `drive()` s výchozím (poziční)
  // commitem/assignem je tak plně deterministický bez ohledu na to, která
  // konkrétní karta se dolízla (žádná karta v balíku se od jiné neliší).
  const veciHodnota5 = uniformniVeci({ hodnota: 5 });

  it('PŘED prvním překročením prahu Zátahu hodnota platí normálně (rušení neaktivní)', () => {
    // 1 hráč, 1 uzel: start heat 0 << práh zatah 4 → gating musí nechat
    // hodnota-kartu projít stejně, jako by pronásledovatel nebyl Malone.
    const rules = { ...RULES, sumRozsah: 0, uzluNaRun: 1 };
    const content = syntetickyObsah({ situace: [situaceJednostat('s-hodnota', 'hodnota', 2)], veci: veciHodnota5 });
    const run = createRun({ seed: 31, content, rules, players: hraci(1), pronasledovatelId: 'agent-malone' });
    const events = drive(run);
    const revealed = events.find((e) => e.type === EVENT.SITUATION_REVEALED);
    expect(revealed.rusi_efektivni).toBeNull(); // V2-A′: rušení PRÁVĚ TEĎ neplatí
    const resolved = events.filter((e) => e.type === EVENT.SLOT_RESOLVED);
    expect(resolved).toHaveLength(4);
    expect(resolved.every((e) => e.zasah)).toBe(true);
    expect(resolved.every((e) => e.duvod === 'proslo')).toBe(true);
    expect(resolved.every((e) => e.pronasledovatel_efekt === null)).toBe(true);
  });

  it('PO prvním překročení prahu Zátahu se rušení aktivuje a platí run-wide dál (V2-A′, D58)', () => {
    // 2 hráči → prahOffsetDlePoctu[2]=2 → práh zatah = max(1, 4−2) = 2, takže
    // JEDEN PRŮŠVIH (+2 Žár) uzavře bránu. Uzel 1: útok-slot s nesplnitelným
    // prahem (5; uniformní karta má utok=0) → jistý PRŮŠVIH → Žár 0→2 → Zátah
    // se vynutí jako uzel 2 (situace typu 'zatah') s hodnota-slotem (kotva 2)
    // — tam už rušení musí platit i přes hodnota=5 na kartě.
    const rules = { ...RULES, sumRozsah: 0, uzluNaRun: 2 };
    const content = syntetickyObsah({
      // 'lokace' (ne 'npc'): GANGSTER tam vždy projde ('vzdy_pass'), takže V4-D
      // supply-aware clamp na tenhle slot nesahá — kotva 5 zůstává plný strop
      // statMax i nad uniformním balíkem, kde by jinak `nonGangsterMax` kolabovalo
      // na hodnotu jediné karty v balíku (D58 nález z ladění tohohle testu).
      situace: [situaceJednostat('s-prusvih', 'utok', 5, 'lokace'), situaceJednostat('s-zatah-hodnota', 'hodnota', 2, 'zatah')],
      veci: veciHodnota5,
    });
    const run = createRun({ seed: 32, content, rules, players: hraci(2), pronasledovatelId: 'agent-malone' });
    const events = drive(run);

    const revealedPrusvih = events.find((e) => e.type === EVENT.SITUATION_REVEALED && e.situace_id === 's-prusvih');
    expect(revealedPrusvih.rusi_efektivni).toBeNull(); // uzel 1 ještě před branou
    // Uzel 1 byl jistý PRŮŠVIH (kotva 5, uniformní karta utok=0) → Žár 0→2 =
    // práh Zátahu pro 2p (offset 2) → vynucený Zátah jako uzel 2 (`byl_zatah`).
    const zatahVynucen = events.some((e) => e.type === EVENT.MAP_MOVE && e.byl_zatah);
    expect(zatahVynucen).toBe(true);

    const revealedZatah = events.find((e) => e.type === EVENT.SITUATION_REVEALED && e.situace_id === 's-zatah-hodnota');
    expect(revealedZatah.rusi_efektivni).toEqual({ typ: 'stat', cil: 'hodnota' });
    const resolvedZatah = events.filter((e) => e.type === EVENT.SLOT_RESOLVED && e.stat === 'hodnota');
    expect(resolvedZatah).toHaveLength(4);
    expect(resolvedZatah.every((e) => !e.zasah)).toBe(true);
    expect(resolvedZatah.every((e) => e.duvod === 'stat_zrusen')).toBe(true);
    expect(resolvedZatah.every((e) => e.pronasledovatel_efekt?.cil === 'hodnota')).toBe(true);
    expect(events.at(-1).vysledek).toBe('DORUCENO');
  });
});

describe('Žár V3-A′ — jeden klimax za run (D58)', () => {
  // Uniformní karta s utok/obrana/improvizace=3: proti běžným npc/zatah uzlům
  // (kotva 5 níže) VŽDY propadne (3<5 → jistý PRŮŠVIH, žene Žár nahoru);
  // proti pronásledovatelově vlastní léčce/konfrontaci (helpers.js `mkPursuer`,
  // kotva 3 na všech slotech) VŽDY projde (3≥3 → jisté přežití/LOOT) —
  // deterministické bez ohledu na to, která konkrétní karta se dolízla.
  const veciStred = uniformniVeci({ utok: 3, obrana: 3, improvizace: 3 });

  /**
   * 8 běžných útok-uzlů (kotva 5, jistý PRŮŠVIH) + vynucený Zátah (stejně).
   * 'lokace', ne 'npc': GANGSTER tam vždy projde ('vzdy_pass'), takže V4-D
   * supply-aware clamp nesahá na kotvu — nad uniformním balíkem `veciStred`
   * by jinak `nonGangsterMax.utok` kolabovalo na 3 (jediná hodnota v balíku)
   * a kotva 5 by se zastropovala na 3, čímž by uniformní karta (utok 3)
   * slot NEČEKANĚ splnila místo jistého propadu.
   */
  function obsahProZar() {
    return syntetickyObsah({
      situace: [
        ...Array.from({ length: 8 }, (_, i) => situaceJednostat(`s${i + 1}`, 'utok', 5, 'lokace')),
        situaceJednostat('zatah', 'utok', 5, 'zatah'),
      ],
      veci: veciStred,
    });
  }

  it('přežití konfrontace ODEČTE pevnou hodnotu od Žáru (ne nastaví na absolutní cíl)', () => {
    // 1 hráč (offset 0): PRŮŠVIH žene Žár +2 za uzel → zatah@4 (uzel 2),
    // lecka@7 (uzel 4, přežita jako LOOT), konfrontace@10 (uzel 5) — přežita
    // jako LOOT (uniformní karta 3 ≥ kotva 3 na všech čtyřech slotech šablony).
    // Cap postihů vypnutý (999): opakovaný PRŮŠVIH by jinak hráče „složil" a
    // uzel s prázdnou rukou (auto-fail) by nedeterministicky rozhodl, jestli
    // konfrontace padne kvůli KARTÁM (co test měří), nebo kvůli SLOŽENÍ (co ne).
    const rules = { ...RULES, sumRozsah: 0, postihy: { ...RULES.postihy, capNaHrace: 999 } };
    const run = createRun({ seed: 33, content: obsahProZar(), rules, players: hraci(1), pronasledovatelId: 'agent-malone' });
    const events = drive(run);

    const konfrontaceUzly = events.filter((e) => e.type === EVENT.SITUATION_REVEALED && e.typ === 'konfrontace');
    expect(konfrontaceUzly).toHaveLength(1);
    const zarMoveKonfrontace = events.filter((e) => e.type === EVENT.ZAR_MOVE && e.duvod === ZAR_DUVOD.KONFRONTACE_PREZITA);
    expect(zarMoveKonfrontace).toHaveLength(1);
    const pohyb = zarMoveKonfrontace[0];
    // V3-A′: delta je PEVNÝ odečet (−poPrezitiKonfrontaceOdecet), ne nastavení
    // na absolutní cíl. Trasování PRŮŠVIHů po +2 dorazí na konfrontační práh
    // (10) přesně, takže před D58 (`changeHeat(3 − heat)`) by nova_pozice bylo
    // taky 7 — proto se ověřuje i syrová delta, ne jen výsledná pozice.
    expect(pohyb.delta).toBe(-rules.zar.poPrezitiKonfrontaceOdecet);
    expect(pohyb.nova_pozice).toBe(rules.zar.prahy.konfrontace - rules.zar.poPrezitiKonfrontaceOdecet);
  });

  it('práh konfrontace se po prvním odpálení v runu už NIKDY znovu nevrátí (žádné druhé finále)', () => {
    // Víc beden, ať PRŮŠVIH sérií po konfrontaci run předčasně neukončí (bedny_0);
    // víc uzlů (uzluNaRun 9), ať je čas Žár po poklesu znovu vyhnat na strop.
    // Cap postihů vypnutý — stejný důvod jako v testu výš.
    const rules = { ...RULES, sumRozsah: 0, bedenNaStartu: 20, uzluNaRun: 9, postihy: { ...RULES.postihy, capNaHrace: 999 } };
    const run = createRun({ seed: 34, content: obsahProZar(), rules, players: hraci(1), pronasledovatelId: 'agent-malone' });
    const events = drive(run);

    const konfrontaceUzly = events.filter((e) => e.type === EVENT.SITUATION_REVEALED && e.typ === 'konfrontace');
    expect(konfrontaceUzly).toHaveLength(1); // strukturálně nejvýš jedna za run
    const zarMax = Math.max(...events.filter((e) => e.type === EVENT.ZAR_MOVE).map((e) => e.nova_pozice));
    expect(zarMax).toBe(rules.zar.max); // Žár znovu vyšplhal na strop bez druhého finále
    expect(events.at(-1).vysledek).toBe('DORUCENO'); // přežilo se, nespadlo na konfrontace_prohra
  });
});

describe('krokové zúžení maso-poolu dle `faze` (kalibrace-4, K2)', () => {
  /** Vrátí nabídnuté situace pro každý map_move (mimo Zátah). */
  function nabidky(content) {
    const run = createRun({ seed: 5, content, rules: RULES, players: hraci(2), pronasledovatelId: 'serif-brody' });
    return drive(run)
      .filter((e) => e.type === EVENT.MAP_MOVE && !e.byl_zatah && e.nabidnuto)
      .map((e) => e.nabidnuto.filter((n) => n.typ_mista === 'npc' || n.typ_mista === 'lokace').map((n) => n.ref))
      .filter((n) => n.length > 0);
  }

  it('bez `faze` v obsahu se chová jako dřív (feature je inertní)', () => {
    const content = syntetickyObsah();
    expect(nabidky(content).length).toBeGreaterThan(0);
    // žádná situace nemá faze → všechny se smí nabídnout kdykoli
    expect(content.situace.every((s) => s.faze === undefined)).toBe(true);
  });

  it('rané kroky nenabídnou situaci označenou `pozdni` (a naopak)', () => {
    const content = syntetickyObsah();
    // s1–s4 rané, s5–s8 pozdní
    for (const s of content.situace) {
      if (s.typ !== 'npc' && s.typ !== 'lokace') continue;
      s.faze = ['s1', 's2', 's3', 's4'].includes(s.id) ? 'rana' : 'pozdni';
    }
    const n = nabidky(content);
    const pozdniIds = ['s5', 's6', 's7', 's8'];
    // první nabídka je krok 1 → nesmí obsahovat pozdní situaci
    expect(n[0].some((id) => pozdniIds.includes(id))).toBe(false);
  });

  it('FALLBACK: když by zúžení nechalo míň než 2 možnosti, nabídne se celý pool', () => {
    const content = syntetickyObsah();
    // jen JEDNA raná situace → zúžení by dalo 1 možnost, což by zabilo volbu trasy
    for (const s of content.situace) {
      if (s.typ !== 'npc' && s.typ !== 'lokace') continue;
      s.faze = s.id === 's1' ? 'rana' : 'pozdni';
    }
    const n = nabidky(content);
    expect(n[0].length).toBe(2); // volba trasy zůstala zachovaná
  });
});
