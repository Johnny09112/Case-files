// @ts-check
/**
 * Přiřazení do slotů na obrazovce `assign.js` — čistá logika bez DOM.
 * `slotyPoGamblu` opravuje bug z playtestu: gamble mazal celé rozdělané
 * přiřazení místo jen mezery s vyměněnou kartou (viz komentář u funkce
 * a `app.js` `akce.gambluj`).
 */
import { describe, it, expect } from 'vitest';
import { aktivniSlotIndex, slotyPoGamblu } from '../src/ui/screens/run/assign.js';

describe('slotyPoGamblu', () => {
  it('zachová přiřazení ostatních karet, uvolní jen mezeru s vyměněnou kartou', () => {
    const sloty = { 0: 'karta-a', 1: 'karta-b', 2: 'karta-c' };
    const po = slotyPoGamblu(sloty, 'karta-b');
    expect(po).toEqual({ 0: 'karta-a', 2: 'karta-c' });
  });

  it('když vyměněná karta nebyla přiřazená do žádné mezery, nic se nemění', () => {
    const sloty = { 0: 'karta-a', 2: 'karta-c' };
    const po = slotyPoGamblu(sloty, 'karta-nepratomna');
    expect(po).toEqual({ 0: 'karta-a', 2: 'karta-c' });
  });

  it('na prázdném přiřazení vrátí prázdné přiřazení', () => {
    expect(slotyPoGamblu({}, 'karta-x')).toEqual({});
  });

  it('nemutuje vstupní objekt (nová mapa, ne úprava na místě)', () => {
    const sloty = { 0: 'karta-a', 1: 'karta-b' };
    const po = slotyPoGamblu(sloty, 'karta-b');
    expect(sloty).toEqual({ 0: 'karta-a', 1: 'karta-b' });
    expect(po).not.toBe(sloty);
  });
});

describe('aktivniSlotIndex po gamblu (regrese bugu z playtestu)', () => {
  const sloty = [
    { slot_index: 0 },
    { slot_index: 1 },
    { slot_index: 2 },
  ];

  it('po gamblu karty NEPŘIŘAZENÉ do mezery zůstane aktivní mezera beze změny a přiřazení ostatních karet drží', () => {
    // Tým rozdělal práci: mezery 0 a 1 jsou hotové, gamblovaná karta nikdy
    // přiřazená nebyla (aktivni = 2, poslední prázdná).
    const assignVyber = { aktivni: null, sloty: { 0: 'karta-a', 1: 'karta-b' } };
    const poGamblu = { aktivni: null, sloty: slotyPoGamblu(assignVyber.sloty, 'karta-nepratomna') };
    expect(poGamblu.sloty).toEqual({ 0: 'karta-a', 1: 'karta-b' });
    expect(aktivniSlotIndex(sloty, poGamblu)).toBe(2);
  });

  it('po gamblu karty PŘIŘAZENÉ do mezery se ta jedna mezera uvolní, zbytek zůstává vyplněný', () => {
    // Mezera 1 měla přiřazenou právě gamblovanou kartu — po gamblu se uvolní
    // a stane se aktivní (první prázdná), mezera 0 zůstává hotová.
    const assignVyber = { aktivni: null, sloty: { 0: 'karta-a', 1: 'karta-b', 2: 'karta-c' } };
    const poGamblu = { aktivni: null, sloty: slotyPoGamblu(assignVyber.sloty, 'karta-b') };
    expect(poGamblu.sloty).toEqual({ 0: 'karta-a', 2: 'karta-c' });
    expect(aktivniSlotIndex(sloty, poGamblu)).toBe(1);
  });
});
