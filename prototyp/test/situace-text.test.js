// @ts-check
/**
 * Testy čistého modulu textu situace (src/ui/situace-text.js) — rozklad
 * autorského textu se 4 mezerami `{VEC}` a jejich živé plnění.
 *
 * Text je KANON (design §4.3, schéma `obsah/situace.yaml`): próza se čtyřmi
 * mezerami, které se plní názvy zahraných věcí V POŘADÍ SLOTŮ. Ta vazba je
 * invariant obsahu — proto ji hlídá i test nad reálným `obsah/`, ne jen
 * nad syntetickými řetězci.
 */
import { describe, it, expect } from 'vitest';
import { rozlozText, doplnText, textSituace, MEZERA } from '../src/ui/situace-text.js';
import { parseContent } from '../src/content/loader.js';
import { loadRealYaml } from './content.test.js';

const UKAZKA =
  'Kola zapadla doprostřed brodu. {kdo} mu nabídl {VEC} za vytažení, {kdo} držel hlas mírný pomocí {VEC}. Kdyby chlap vyváděl, měl {kdo} po ruce {VEC}.';

/** Situace, kde poslední mezera nemá jednajícího (skrytá role „kdyby"). */
const BEZ_JEDNAJICIHO =
  '{kdo} mu vtiskl do dlaně {VEC} a {kdo} odvedl řeč stranou pomocí {VEC}. Kdyby přituhlo, čekala pod plachtou {VEC}.';

describe('rozlozText — rozklad autorského textu na úseky', () => {
  it('očísluje mezery {VEC} v pořadí výskytu = pořadí slotů', () => {
    const useky = rozlozText(UKAZKA);
    expect(useky.filter((u) => u.typ === 'vec').map((u) => u.slot)).toEqual([0, 1, 2]);
  });

  it('váže {kdo} na slot nejbližší následující mezery', () => {
    const useky = rozlozText(UKAZKA);
    expect(useky.filter((u) => u.typ === 'kdo').map((u) => u.slot)).toEqual([0, 1, 2]);
  });

  it('mezeru bez jednajícího nechá bez {kdo} — jednající se nedomýšlí', () => {
    const useky = rozlozText(BEZ_JEDNAJICIHO);
    expect(useky.filter((u) => u.typ === 'vec').map((u) => u.slot)).toEqual([0, 1, 2]);
    expect(useky.filter((u) => u.typ === 'kdo').map((u) => u.slot)).toEqual([0, 1]);
  });

  it('zachová prózu mimo placeholdery (poskládání zpět dá původní text)', () => {
    const zpet = rozlozText(UKAZKA)
      .map((u) => (u.typ === 'text' ? u.hodnota : u.typ === 'vec' ? '{VEC}' : '{kdo}'))
      .join('');
    expect(zpet).toBe(UKAZKA);
  });

  it('ořízne bílé znaky z YAML folded skaláru', () => {
    const useky = rozlozText('  Prám se odrazil od břehu s {VEC}.\n');
    expect(useky[0]).toEqual({ typ: 'text', hodnota: 'Prám se odrazil od břehu s ' });
    expect(useky.at(-1)).toEqual({ typ: 'text', hodnota: '.' });
  });
});

describe('doplnText — živé plnění mezer', () => {
  it('dosadí názvy věcí do mezer a PŘÍJMENÍ vlastníků do {kdo}', () => {
    const text = doplnText(UKAZKA, {
      veci: { 0: 'Svářečka', 1: 'Placatka', 2: 'Bouchačka' },
      jmena: { 0: 'Vincenc Bartoš', 1: 'Vincenc Bartoš', 2: 'Aloisie Křížová' },
    });
    expect(text).toBe(
      'Kola zapadla doprostřed brodu. Bartoš mu nabídl „Svářečka" za vytažení, Bartoš držel hlas mírný pomocí „Placatka". Kdyby chlap vyváděl, měl Křížová po ruce „Bouchačka".'
    );
  });

  it('nepřiřazený slot nechá mezeru — text nikdy netvrdí věc, která tam není', () => {
    const text = doplnText(UKAZKA, { veci: { 0: 'Svářečka' }, jmena: { 0: 'Vincenc Bartoš' } });
    expect(text).toContain('Bartoš mu nabídl „Svářečka" za vytažení');
    expect(text).toContain(`${MEZERA} držel hlas mírný pomocí ${MEZERA}`);
  });

  it('bez jakéhokoli přiřazení je celý text samá mezera', () => {
    expect(doplnText(UKAZKA, {})).toContain(`${MEZERA} mu nabídl ${MEZERA} za vytažení`);
  });
});

describe('textSituace — dohledání autorského textu podle id', () => {
  const CONTENT = {
    situace: [{ id: 'farmar-brod', text: UKAZKA }],
    pronasledovatele: [
      { id: 'agent-malone', lecka: { text: 'Léčka {VEC}.' }, konfrontace: { text: 'Finále {VEC}.' } },
    ],
  };

  it('najde situaci z poolu', () => {
    expect(textSituace(CONTENT, 'farmar-brod')).toBe(UKAZKA);
  });

  it('najde vložené setkání pronásledovatele (engine mu dává id `<id>-lecka`)', () => {
    expect(textSituace(CONTENT, 'agent-malone-lecka')).toBe('Léčka {VEC}.');
    expect(textSituace(CONTENT, 'agent-malone-konfrontace')).toBe('Finále {VEC}.');
  });

  it('na neznámé id ani na chybějící obsah nepadá — vrací null', () => {
    expect(textSituace(CONTENT, 'neznama')).toBe(null);
    expect(textSituace(undefined, 'farmar-brod')).toBe(null);
  });
});

describe('reálný obsah z obsah/ — invariant 4 mezer', () => {
  const content = parseContent(loadRealYaml());
  /** Všechny slotové situace: pool + vložená setkání pronásledovatelů. */
  const situace = [
    ...content.situace,
    ...content.pronasledovatele.flatMap((/** @type {any} */ p) => [
      { id: `${p.id}-lecka`, text: p.lecka.text },
      { id: `${p.id}-konfrontace`, text: p.konfrontace.text },
    ]),
  ];

  it('má co měřit (celý pool i vložená setkání)', () => {
    expect(situace.length).toBeGreaterThanOrEqual(19);
  });

  it.each(situace.map((s) => [s.id, s.text]))(
    '„%s" má právě 4 mezery očíslované 0–3 v pořadí slotů',
    (_id, text) => {
      const sloty = rozlozText(text).filter((u) => u.typ === 'vec').map((u) => u.slot);
      expect(sloty).toEqual([0, 1, 2, 3]);
    }
  );

  it.each(situace.map((s) => [s.id, s.text]))(
    '„%s" váže každý {kdo} na existující slot',
    (_id, text) => {
      const jednajici = rozlozText(text).filter((u) => u.typ === 'kdo');
      expect(jednajici.length).toBeGreaterThan(0);
      for (const u of jednajici) expect(u.slot).toBeGreaterThanOrEqual(0);
    }
  );
});
