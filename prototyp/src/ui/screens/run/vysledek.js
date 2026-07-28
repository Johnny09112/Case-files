// @ts-check
/**
 * Výsledek situace: razítko na každém slotu s větou proč, pásmo s learnabilitou
 * („optimální rozdělení TÉHOŽ commitu by dalo…"), důsledky (Žár, kredity,
 * postihy, složení) a nakonec protokol vyklepaný psacím strojem.
 *
 * Tohle je obrazovka, na které stojí metrika 6 (čitelnost, technika/faze-2.1-
 * navrh-2026-07-27.md): hráč tu musí bez nahlédnutí do logu vidět, proč
 * propadl konkrétní slot a proč postoupil šerif. Proto se detail anotace
 * (`a.detail`) vypisuje VIDITELNĚ, ne jen do `title` tooltipu jako na
 * `assign.js`/`okraj.js` — na sdíleném hot-seat displeji se na hover
 * spolehnout nedá.
 *
 * `.hod-radek` je tu STATICKÝ `<div>` (výsledek se neklikne), ne `<button>`
 * jako v `assign.js` — to je přesně případ, na který CSS komentář u
 * `.hod-radek` ve `style.css` odkazuje; obě podoby stejná třída zvládá.
 *
 * Anotace se sem NEPOČÍTAJÍ — přebírají se hotové z vysvětlující vrstvy
 * (jedna definice pro živou hru i pro rozbor po runu, §4.1). Zpětný odkaz
 * (`a.odkaz`) na uzel, kde postih vznikl, je právě ta věc, kterou první
 * lidský playtest postrádal nejvíc — proto je u slotu vidět vždy, když ho
 * anotace nese.
 *
 * Žádná herní logika — jen render snapshotu enginu (architektura §2.4).
 */
import { h } from '../../dom.js';
import { vyklepej } from '../../typewriter.js';
import { MISTO } from '../../vysvetleni.js';
import { EVENT } from '../../../engine/events.js';

/**
 * @param {{S: object, akce: Record<string, any>, anotace: Map<number, object[]>}} ctx
 */
export function pohledVysledku(ctx) {
  const { S, akce, anotace } = ctx;
  const polozka = S.fronta[0];
  const { udalosti, sekce } = polozka;
  const prvni = (/** @type {any} */ u) => (anotace.get(u.seq) ?? [])[0];

  const sloty = udalosti.filter((/** @type {any} */ u) => u.type === EVENT.SLOT_RESOLVED);
  const pasmo = udalosti.find((/** @type {any} */ u) => u.type === EVENT.BAND_RESOLVED);
  const dusledky = udalosti.filter((/** @type {any} */ u) =>
    [EVENT.ZAR_MOVE, EVENT.CREDIT_FLOW, EVENT.PENALTY_ADDED, EVENT.PENALTY_EXPIRED, EVENT.PENALTY_HEALED, EVENT.CHARACTER_FOLDED, EVENT.CHARACTER_RETURNED, EVENT.GAMBLE].includes(u.type)
  );

  const protokol = h('div', { class: 'protokol-list' });
  if (polozka.vyklepano) {
    for (const odstavec of sekce.odstavce) protokol.append(h('p', { class: 'protokol-odstavec' }, odstavec));
  } else {
    polozka.vyklepano = true;
    vyklepej(protokol, sekce.odstavce);
  }

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, 'výsledek — hráč vždy ví proč'),
      h('h1', {}, `List ${sekce.cislo} — ${sekce.titulek}`)
    ),

    h(
      'section',
      { class: 'rozpis-hodu' },
      sloty.map((/** @type {any} */ u) => {
        const a = prvni(u);
        return h(
          'div',
          { class: `hod-radek ${u.zasah ? 'uspech' : 'selhani'}` },
          h(
            'div',
            { class: 'okraj-postava-radka' },
            h('strong', {}, `Slot ${u.slot_index + 1}`),
            h('span', { class: `pasmo-stitek ${u.zasah ? 'uspech' : 'selhani'}` }, a?.razitko ?? (u.zasah ? 'PROŠLO' : 'NEPROŠLO'))
          ),
          a ? h('p', { class: 'hod-vypocet' }, a.veta) : null,
          a?.detail ? h('p', { class: 'napoveda' }, a.detail) : null,
          a?.odkaz
            ? h('p', { class: 'pravidlo' }, `Zdroj: ${a.odkaz.popis}.`)
            : null
        );
      })
    ),

    pasmo
      ? h(
          'section',
          { class: 'formular-blok' },
          h('h2', { class: 'formular-popisek' }, 'Pásmo situace'),
          h('p', {}, prvni(pasmo)?.veta ?? ''),
          h('p', { class: 'napoveda' }, prvni(pasmo)?.detail ?? '')
        )
      : null,

    dusledky.length > 0
      ? h(
          'section',
          { class: 'formular-blok' },
          h('h2', { class: 'formular-popisek' }, 'Důsledky'),
          dusledky.map((/** @type {any} */ u) => {
            const a = prvni(u);
            if (!a) return null;
            return h(
              'p',
              { class: a.misto === MISTO.OKRAJ ? 'napoveda' : 'pravidlo' },
              a.veta,
              a.detail ? h('span', { class: 'napoveda' }, ` ${a.detail}`) : null
            );
          })
        )
      : null,

    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Protokol vyšetřovatele (klik přeskočí klepání)'),
      protokol
    ),

    h(
      'footer',
      { class: 'formular-paticka' },
      h('button', { class: 'tlacitko tlacitko-hlavni', onclick: () => akce.pokracuj() }, 'Pokračovat')
    )
  );
}
