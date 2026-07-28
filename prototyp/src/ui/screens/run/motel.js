// @ts-check
/**
 * Motel: binární odbočka (ukryt/dál) a služby (léčení těžkého postihu, směna
 * věci). Ceny se berou ze snapshotu (`st.motel.sluzby`) — zrcadlí obsah, ne
 * konstanty v UI (ADR-003).
 */
import { h } from '../../dom.js';
import { KATEGORIE_LABEL } from '../../labels.js';

/**
 * Bezpečný český popis postihu k léčení — nikdy nevypisuje syrové kebab-case
 * id (`postih.id`), jen název z obsahu, nebo aspoň kategorii z `labels.js`.
 * @param {{id: string, kategorie: string}} postih
 * @param {{postihy: {id: string, nazev: string}[]}} content
 */
function nazevPostihu(postih, content) {
  const nazev = content.postihy?.find((/** @type {any} */ p) => p.id === postih.id)?.nazev;
  return nazev ?? KATEGORIE_LABEL[postih.kategorie] ?? 'postih';
}

/** @param {{st: object, content: object, akce: Record<string, any>}} ctx */
export function pohledMotelu(ctx) {
  const { st, content, akce } = ctx;

  if (st.faze === 'motel_offer') {
    const misto = content.mista.find((/** @type {any} */ m) => m.id === st.motelNabidka.motel);
    return h(
      'div',
      {},
      h(
        'header',
        { class: 'spis-hlavicka' },
        h('p', { class: 'formular-popisek' }, 'odbočka'),
        h('h1', {}, 'Motel u cesty')
      ),
      h('section', { class: 'uzel-karta' }, h('p', { class: 'uzel-uvod' }, misto?.text ?? '')),
      h('p', { class: 'napoveda' }, 'Zajet znamená utratit kredity za léčení nebo směnu. Hnát dál znamená nechat si je.'),
      h(
        'footer',
        { class: 'formular-paticka radka-voleb' },
        h('button', { class: 'tlacitko tlacitko-hlavni', onclick: () => akce.motelVolba('ukryt') }, 'Zajet do motelu'),
        h('button', { class: 'tlacitko', onclick: () => akce.motelVolba('dal') }, 'Hnát náklad dál')
      )
    );
  }

  const sluzby = st.motel?.sluzby ?? {};
  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, `kredity: ${st.kredity}`),
      h('h1', {}, 'V motelu')
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, `Léčení těžkého postihu — ${sluzby.leceni_tezkeho} kreditů`),
      st.postavy.flatMap((/** @type {any} */ p) =>
        p.postihy.filter((/** @type {any} */ x) => x.tier === 'tezky').map((/** @type {any} */ x) =>
          h(
            'div',
            { class: 'radka-voleb' },
            h(
              'button',
              {
                class: 'tlacitko',
                disabled: st.kredity < sluzby.leceni_tezkeho,
                onclick: () => akce.zaplat({ sluzba: 'leceni', hracId: p.id, postihId: x.id }),
              },
              `Vyléčit: ${p.jmeno} — ${nazevPostihu(x, content)}`
            ),
            h('span', { class: 'napoveda' }, 'těžký postih jinak drží do konce runu')
          )
        )
      ),
      st.postavy.every((/** @type {any} */ p) => p.postihy.every((/** @type {any} */ x) => x.tier !== 'tezky'))
        ? h('p', { class: 'napoveda' }, 'Žádný těžký postih k léčení.')
        : null
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, `Směna věci — ${sluzby.smena_karty} kreditů`),
      st.postavy.filter((/** @type {any} */ p) => !p.slozena).map((/** @type {any} */ p) =>
        h(
          'div',
          { class: 'panel-postavy' },
          h('h3', {}, p.jmeno),
          h(
            'div',
            { class: 'ruka' },
            p.ruka.map((/** @type {any} */ k) =>
              h(
                'button',
                {
                  class: 'karta',
                  disabled: st.kredity < sluzby.smena_karty,
                  onclick: () => akce.zaplat({ sluzba: 'smena', hracId: p.id, kartaId: k.id }),
                },
                h('strong', {}, k.nazev),
                h('span', { class: 'karta-meta' }, 'vyměnit za líznutou')
              )
            )
          )
        )
      )
    ),
    h(
      'footer',
      { class: 'formular-paticka' },
      h('button', { class: 'tlacitko tlacitko-hlavni', onclick: () => akce.opustMotel() }, 'Vyrazit dál')
    )
  );
}
