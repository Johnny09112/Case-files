// @ts-check
/**
 * Obrazovka runu v3: společný rám (okraj spisu | list) a přepínač fáze
 * (mapa → motel → commit → assign → výsledek). Žádná herní logika —
 * jen render snapshotu enginu a odesílání příkazů (architektura §2.4).
 */
import { h } from '../../dom.js';
import { okrajSpisu } from './okraj.js';
import { pohledMapy } from './mapa.js';
import { pohledMotelu } from './motel.js';
import { pohledCommitu } from './commit.js';
import { pohledPrirazeni } from './assign.js';
import { pohledVysledku } from './vysledek.js';

/**
 * @param {{S: object, st: object, content: object, rules: object,
 *   akce: Record<string, any>, anotace: Map<number, object[]>}} ctx
 */
export function obrazovkaRun(ctx) {
  const { S, st } = ctx;
  let obsah;

  if (S.briefing) obsah = pohledBriefing(ctx);
  else if (S.fronta.length > 0) obsah = pohledVysledku(ctx);
  else if (st.faze === 'map') obsah = pohledMapy(ctx);
  else if (st.faze === 'motel_offer' || st.faze === 'motel') obsah = pohledMotelu(ctx);
  else if (st.faze === 'commit') obsah = pohledCommitu(ctx);
  else if (st.faze === 'assign' || st.faze === 'confirm') obsah = pohledPrirazeni(ctx);
  else obsah = h('p', { class: 'napoveda' }, `Fáze „${st.faze}" nemá obrazovku — to je chyba UI, ne hry.`);

  return h('div', { class: 'plocha' }, okrajSpisu(ctx), h('main', { class: 'list' }, obsah));
}

/* ================= briefing ================= */

/** Los pronásledovatele + tajné cíle („Jsem X" — ostatní se nedívají). */
function pohledBriefing(ctx) {
  const { S, st, content, akce } = ctx;
  const pronasledovatel = content.pronasledovatele.find((/** @type {any} */ p) => p.id === st.pronasledovatel.id);

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, 'Spis otevřen'),
      h('h1', {}, 'Los pronásledovatele')
    ),
    h(
      'section',
      { class: 'uzel-karta pronasledovatel-karta' },
      h('span', { class: 'razitko' }, 'v patách'),
      h('h2', {}, pronasledovatel.nazev),
      h('p', { class: 'uzel-uvod' }, pronasledovatel.flavor),
      h('p', { class: 'pravidlo' }, pronasledovatel.rusi.pravidlo)
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Tajné cíle — ostatní se nedívají'),
      h(
        'div',
        { class: 'radka-voleb' },
        st.postavy.map((/** @type {any} */ p) =>
          h(
            'button',
            { class: `tlacitko${S.odkrytyCil === p.id ? ' aktivni' : ''}`, onclick: () => akce.odkryjCil(p.id) },
            S.odkrytyCil === p.id ? `Schovat (${p.jmeno})` : `Jsem ${p.jmeno}`
          )
        )
      ),
      S.odkrytyCil
        ? (() => {
            const p = st.postavy.find((/** @type {any} */ x) => x.id === S.odkrytyCil);
            return h(
              'div',
              { class: 'cil-karta' },
              h('p', { class: 'formular-popisek' }, `tajný cíl — ${p.jmeno}${p.cil ? ` (${p.cil.body} b.)` : ''}`),
              h('p', {}, p.cil ? p.cil.text : 'Cíl nebyl přidělen (došly karty cílů).'),
              p.cil ? h('p', { class: 'napoveda' }, p.cil.overeni) : null
            );
          })()
        : h('p', { class: 'napoveda' }, 'Každý si svůj cíl prohlédne sám a zase ho schová.')
    ),
    h(
      'footer',
      { class: 'formular-paticka' },
      h('button', { class: 'tlacitko tlacitko-hlavni', onclick: () => akce.vyraz() }, 'Vyrazit na trasu')
    )
  );
}
