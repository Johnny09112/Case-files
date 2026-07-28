// @ts-check
/**
 * Okraj spisu — stálý panel vedle listu (design-dokument §4.11 „spis + okraj
 * mapy"). Přebírá se z v2 layoutu; obsah je v3: trať Žáru s posunutými prahy,
 * náklad, kredity, podezřelí s postihy, poslední anotace `misto: 'okraj'`.
 *
 * Žádná herní logika — jen render snapshotu enginu (architektura §2.4).
 *
 * Kontrakt `ctx` v tomto tasku NEnese `content` (viz Task 8, kde ho `obrazovkaRun`
 * doplňuje) — okraj proto nemá k dispozici popisky odvozené z obsahu (přesný
 * název postihu, přesné znění pravidla pronásledovatele). Kde takový popisek
 * chybí, okraj NEVYPISUJE syrové id z enginu (kebab-case postih_id, `GANGSTER`
 * apod.) — ukazuje jen to, co lze bezpečně přeložit ze statických map
 * v `labels.js` (kategorie/tier postihu, jméno statu).
 */
import { h } from '../../dom.js';
import { MISTO } from '../../vysvetleni.js';
import { PRAH_LABEL, STAT_LABEL, KATEGORIE_LABEL } from '../../labels.js';

/** Kolik posledních okrajových anotací se ukazuje (víc = zahlcení, §9 návrhu). */
const OKRAJ_ANOTACI = 4;

/**
 * Krátký, bezpečný popis postihu bez jeho syrového id — přesný název (`nazev`
 * z obsah/postihy.yaml) tenhle modul nemá k dispozici (ctx nenese `content`),
 * takže ukazuje jen kategorii a tier, obojí z existujících map v `labels.js`.
 * @param {{kategorie: string, tier: string}} postih
 */
function popisPostihu(postih) {
  const kategorie = KATEGORIE_LABEL[postih.kategorie] ?? postih.kategorie;
  return postih.tier === 'tezky' ? `${kategorie} (těžký)` : kategorie;
}

/**
 * Co pronásledovatel ruší — jen tolik, kolik lze bez `content` bezpečně
 * přeložit. `rusi.cil` je buď stat (přeložitelný přes `STAT_LABEL`), nebo
 * štítek věci (dnes v obsahu jediný: GANGSTER) — pro ten okraj nemá popisek,
 * takže ho nejmenuje a odkazuje na briefing, kde je celé pravidlo (`pravidlo`
 * z obsah/pronasledovatele.yaml), viz Task 8.
 * @param {{typ: string, cil: string}|null} rusi
 */
function popisRuseni(rusi) {
  if (!rusi) return 'neruší nic';
  if (rusi.typ === 'stat') return `ruší stat ${STAT_LABEL[rusi.cil] ?? rusi.cil} — přesné pravidlo viz briefing`;
  return 'ruší věci se speciálním štítkem — přesné pravidlo viz briefing';
}

/**
 * @param {{S: object, st: object, rules: object, akce: Record<string, any>,
 *   anotace: Map<number, object[]>}} ctx
 */
export function okrajSpisu(ctx) {
  const { S, st, rules, akce, anotace } = ctx;
  // P1 (rules.zar.prahOffsetDlePoctu): prahy trati se per počet hráčů posouvají
  // dolů. Kdyby okraj kreslil základní prahy, hráč by viděl jinou trať, než na
  // které stojí (a metrika 6 by padla přesně na tomhle).
  const offset = rules.zar.prahOffsetDlePoctu?.[st.postavy.length] ?? 0;
  const prahy = Object.entries(rules.zar.prahy).map(([nazev, base]) => [nazev, Math.max(1, base - offset)]);
  const prahU = (/** @type {number} */ n) => prahy.find(([, p]) => p === n)?.[0];

  return h(
    'aside',
    { class: 'okraj' },
    h('p', { class: 'formular-popisek' }, 'Okraj spisu'),
    h('p', { class: 'okraj-seed' }, `spisová značka ${S.seed}`),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, 'Pronásledovatel'),
      h('strong', {}, st.pronasledovatel.nazev),
      h('p', { class: 'napoveda' }, popisRuseni(st.pronasledovatel.rusi))
    ),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, `Žár ${st.zar} / ${rules.zar.max}`),
      h(
        'div',
        { class: 'zar-draha' },
        Array.from({ length: rules.zar.max }, (_, i) => {
          const hodnota = i + 1;
          const jePrah = prahU(hodnota);
          return h(
            'div',
            {
              class: `zar-dilek${hodnota <= st.zar ? ' zaplneny' : ''}${jePrah ? ' prah' : ''}`,
              title: jePrah ? `práh ${hodnota}: ${PRAH_LABEL[jePrah] ?? jePrah}` : `Žár ${hodnota}`,
            },
            jePrah ? h('span', { class: 'zar-prah-popisek' }, String(hodnota)) : null
          );
        })
      ),
      h('p', { class: 'napoveda' }, `prahy: ${prahy.map(([k, p]) => `${p} ${PRAH_LABEL[k] ?? k}`).join(' · ')}`),
      offset > 0
        ? h('p', { class: 'napoveda' }, `Ve ${st.postavy.length} lidech je trať o ${offset} kratší — víc lidí v autě, víc hluku.`)
        : null
    ),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, `Náklad ${st.zbyvaBeden} / ${rules.bedenNaStartu}`),
      h(
        'div',
        { class: 'bedny-rada' },
        Array.from({ length: rules.bedenNaStartu }, (_, i) =>
          h('span', { class: `bedna${i < st.zbyvaBeden ? '' : ' ztracena'}` }, '▮')
        )
      ),
      h('p', { class: 'napoveda' }, `kredity: ${st.kredity}`)
    ),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, 'Podezřelí'),
      st.postavy.map((/** @type {any} */ p) =>
        h(
          'div',
          { class: `okraj-postava${p.slozena ? ' vyrazena' : ''}` },
          h(
            'div',
            { class: 'okraj-postava-radka' },
            h('strong', {}, p.jmeno),
            p.slozena ? h('span', { class: 'razitko razitko-male' }, `složen (${p.kolDoNavratu})`) : null,
            st.drzitelMapy === p.id ? h('span', { class: 'razitko razitko-male' }, 'mapa') : null
          ),
          h(
            'p',
            { class: 'napoveda' },
            p.postihy.length === 0 ? 'bez postihů' : p.postihy.map((/** @type {any} */ x) => popisPostihu(x)).join(' · ')
          )
        )
      )
    ),

    h(
      'section',
      { class: 'okraj-blok' },
      h('h3', { class: 'formular-popisek' }, `Trasa: uzel ${Math.min(st.dokoncenoUzlu + 1, rules.uzluNaRun)} / ${rules.uzluNaRun}`),
      posledniAnotace(anotace).map((/** @type {any} */ a) => h('p', { class: 'napoveda', title: a.detail ?? '' }, a.veta))
    ),

    h('button', { class: 'tlacitko okraj-export', onclick: () => akce.exportLog() }, 'Exportovat log (JSONL)')
  );
}

/** Posledních pár anotací patřících na okraj (Žár, kredity, mapa). */
function posledniAnotace(anotace) {
  const vse = [...anotace.values()].flat().filter((a) => a.misto === MISTO.OKRAJ);
  return vse.slice(-OKRAJ_ANOTACI);
}
