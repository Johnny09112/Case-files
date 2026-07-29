// @ts-check
/**
 * Testy čistého modulu rozboru telegrafu (src/ui/telegraf-rozbor.js).
 *
 * Mechanický řádek „co z toho plyne" je od D47 **nativně skrytý**: próza
 * telegrafu je jediný nositel informace v default režimu. Řádek jde zapnout
 * jako ULEHČENÍ (D48: při dokonalém čtení signálu jde 4p win-rate na 86,8 %,
 * takže je to EASY režim, ne nastavení zobrazení) a navíc se jednorázově
 * ukáže na prvním uzlu prvního runu (onboarding, D48/2).
 *
 * Logika „kdy se co ukáže" je proto pravidlo hry, ne kosmetika — bydlí
 * v čistém modulu a testuje se, ne v těle renderu.
 */
import { describe, it, expect } from 'vitest';
import { stavRozboru, popisSignalu } from '../src/ui/telegraf-rozbor.js';

describe('stavRozboru — kdy je mechanický řádek vidět', () => {
  it('default režim řádek nezobrazí a nenabídne ani rozklik', () => {
    expect(stavRozboru({ ulehceni: false, onboarding: false, otevreno: false }))
      .toEqual({ viditelny: false, prepinac: false, poznamka: false });
  });

  it('se zapnutým ulehčením nabídne rozklik, ale řádek drží zavřený', () => {
    const stav = stavRozboru({ ulehceni: true, onboarding: false, otevreno: false });
    expect(stav.prepinac).toBe(true);
    expect(stav.viditelny).toBe(false);
  });

  it('po rozkliknutí řádek ukáže', () => {
    expect(stavRozboru({ ulehceni: true, onboarding: false, otevreno: true }).viditelny).toBe(true);
  });

  it('onboarding ukáže řádek i bez ulehčení a přizná, že je jednorázový', () => {
    expect(stavRozboru({ ulehceni: false, onboarding: true, otevreno: false }))
      .toEqual({ viditelny: true, prepinac: false, poznamka: true });
  });

  it('se zapnutým ulehčením onboarding jen otevře rozklik — netvrdí, že řádek zmizí', () => {
    const stav = stavRozboru({ ulehceni: true, onboarding: true, otevreno: false });
    expect(stav).toEqual({ viditelny: true, prepinac: true, poznamka: false });
  });

  it('bez argumentů je default skrytý (volající nesmí řádek odemknout opomenutím)', () => {
    expect(stavRozboru().viditelny).toBe(false);
  });
});

describe('popisSignalu — mechanický výčet kanálů telegrafu', () => {
  const ZAKLAD = { trend: [{ stat: 'utok' }, { stat: 'nastroj' }], proti_srsti: 1, zbran_projde: 'ne' };

  it('vypíše viditelné role plnými jmény statů', () => {
    expect(popisSignalu(ZAKLAD)).toContain('viditelné role: útok, nástroj');
  });

  it('vypíše počet skrytých rolí', () => {
    expect(popisSignalu(ZAKLAD)).toContain('skrytých rolí: 1');
  });

  it('kombinovaný slot spojí staty plusem', () => {
    expect(popisSignalu({ ...ZAKLAD, trend: [{ stat: ['nastroj', 'improvizace'] }] }))
      .toContain('viditelné role: nástroj+improvizace');
  });

  it('řekne verdikt zbraně oběma směry', () => {
    expect(popisSignalu(ZAKLAD)).toContain('zbraň na očích neprojde');
    expect(popisSignalu({ ...ZAKLAD, zbran_projde: 'ano' })).toContain('zbraň projde i na očích');
  });

  it('přidá skryté kanály, jen když je engine derivoval', () => {
    expect(popisSignalu(ZAKLAD)).not.toContain('skryté');
    const bohaty = popisSignalu({ ...ZAKLAD, zbran_skryte: true, improv_skryte: true, zbran_slot_vyjimka: true });
    expect(bohaty).toContain('ve skryté roli se zbraň vyplatí');
    expect(bohaty).toContain('skrytá role stojí na improvizaci');
    expect(bohaty).toContain('jedna role zbraň přímo vítá');
  });

  it('bez signálu vrátí prázdný řetězec (ne „undefined")', () => {
    expect(popisSignalu(null)).toBe('');
  });

  it('situace bez viditelné role napíše „žádné", ne prázdno', () => {
    expect(popisSignalu({ trend: [], proti_srsti: 4, zbran_projde: 'ne' })).toContain('viditelné role: žádné');
  });
});
