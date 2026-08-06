// @ts-check
/**
 * Okraj spisu — stálý panel vedle listu (design-dokument §4.11 „spis + okraj
 * mapy"). Přebírá se z v2 layoutu; obsah je v3: trať Žáru s posunutými prahy,
 * náklad, kredity, podezřelí s postihy, poslední anotace `misto: 'okraj'`.
 *
 * Žádná herní logika — jen render snapshotu enginu (architektura §2.4).
 *
 * Kontrakt `ctx` nese `content` jen VOLITELNĚ: dokud `obrazovkaRun` (Task 8)
 * nezačne posílat celý ctx včetně validovaného obsahu (`parseContent()`),
 * okraj běží i bez něj. S `content` k dispozici vypisuje u postihů přesný
 * český název (`content.postihy[].nazev`) — bez něj zůstává jen kategorie
 * a tier ze statických map v `labels.js`. Kde popisek z obsahu chybí (ať už
 * proto, že `content` není v ctx, nebo protože v něm postih s daným id není),
 * okraj NEVYPISUJE syrové id z enginu (kebab-case postih_id, `GANGSTER` apod.)
 * — jen bezpečný fallback.
 */
import { h } from '../../dom.js';
import { MISTO } from '../../vysvetleni.js';
import { PRAH_LABEL, PRAH_POPIS, STAT_LABEL, KATEGORIE_LABEL } from '../../labels.js';

/** Kolik posledních okrajových anotací se ukazuje (víc = zahlcení, §9 návrhu). */
const OKRAJ_ANOTACI = 4;

/**
 * Krátký, bezpečný popis postihu bez jeho syrového id. S `content` k dispozici
 * a shodou id vypíše přesný český název (`nazev` z obsah/postihy.yaml) doplněný
 * o tier — hráč tak vidí, který konkrétní postih drží (např. „Prach do očí"
 * místo obecného „informační"). Bez `content`, nebo když v něm postih s daným
 * id není, spadne zpět na kategorii a tier z map v `labels.js`.
 * @param {{id: string, kategorie: string, tier: string}} postih
 * @param {{postihy: {id: string, nazev: string}[]}} [content]
 */
function popisPostihu(postih, content) {
  const nazev = content?.postihy?.find((p) => p.id === postih.id)?.nazev;
  const zaklad = nazev ?? KATEGORIE_LABEL[postih.kategorie] ?? postih.kategorie;
  return postih.tier === 'tezky' ? `${zaklad} (těžký)` : zaklad;
}

/**
 * Co pronásledovatel ruší — jen tolik, kolik lze bez `content` bezpečně
 * přeložit. `rusi.cil` je buď stat (přeložitelný přes `STAT_LABEL`), nebo
 * štítek věci (dnes v obsahu jediný: GANGSTER) — pro ten okraj nemá popisek,
 * takže ho nejmenuje a odkazuje na briefing, kde je celé pravidlo (`pravidlo`
 * z obsah/pronasledovatele.yaml), viz Task 8.
 *
 * D58/V2-A′: statové rušení je vidět od startu (pravidlo je veřejné, D20a),
 * ale FAKTICKY se zapíná až prvním překročením prahu Zátahu — `rusiAktivni`
 * (engine, `state.js` `jeRusiAktivni`) říká, jestli PRÁVĚ TEĎ platí. Bez
 * tohohle rozlišení by okraj tvrdil rušení dřív, než skutečně kouše.
 * @param {{typ: string, cil: string}|null} rusi
 * @param {boolean} [aktivni]
 */
function popisRuseni(rusi, aktivni = false) {
  if (!rusi) return 'neruší nic';
  if (rusi.typ === 'stat') {
    const stav = aktivni ? 'aktivní' : 'zatím neaktivní — čeká na Zátah';
    return `ruší stat ${STAT_LABEL[rusi.cil] ?? rusi.cil} (${stav}) — přesné pravidlo viz briefing`;
  }
  return 'ruší věci se speciálním štítkem — přesné pravidlo viz briefing';
}

/**
 * @param {{S: object, st: object, rules: object, akce: Record<string, any>,
 *   anotace: Map<number, object[]>, content?: {postihy: {id: string, nazev: string}[]}}} ctx
 */
export function okrajSpisu(ctx) {
  const { S, st, rules, akce, anotace, content } = ctx;
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
      h('p', { class: 'napoveda' }, popisRuseni(st.pronasledovatel.rusi, st.pronasledovatel.rusiAktivni))
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
          // Konfrontace se po prvním odpálení v runu už nikdy znovu nenabije
          // (V3-A′, D58, `konfrontaceSpotrebovana` z enginu) — od zátahu/léčky,
          // které dál normálně nabíjí a vybíjí s hladinou Žáru, ji proto na trati
          // odlišujeme zvlášť, ne jen barvou vyplnění pod aktuální hladinou.
          const spotrebovany = jePrah === 'konfrontace' && st.konfrontaceSpotrebovana;
          const titulek = !jePrah
            ? `Žár ${hodnota}`
            : spotrebovany
              ? `práh ${hodnota}: ${PRAH_LABEL[jePrah]} — spotřebováno, tenhle run se už nespustí`
              : `práh ${hodnota}: ${PRAH_LABEL[jePrah]} — ${PRAH_POPIS[jePrah] ?? ''}`;
          return h(
            'div',
            {
              class: `zar-dilek${hodnota <= st.zar ? ' zaplneny' : ''}${jePrah ? ' prah' : ''}${spotrebovany ? ' prah-spotrebovany' : ''}`,
              title: titulek,
            },
            jePrah ? h('span', { class: 'zar-prah-popisek' }, String(hodnota)) : null
          );
        })
      ),
      h(
        'p',
        { class: 'napoveda' },
        `prahy: ${prahy
          .map(([k, p]) => {
            const spotrebovanyPopis = k === 'konfrontace' && st.konfrontaceSpotrebovana ? ' (spotřebováno)' : '';
            return `${p} ${PRAH_LABEL[k] ?? k} — ${PRAH_POPIS[k] ?? ''}${spotrebovanyPopis}`;
          })
          .join(' · ')}`
      ),
      h(
        'p',
        { class: 'napoveda' },
        'Šerif postihy nedává — posílá tvrdší uzly. Postihy padají z výsledků uzlu: 2/4 lehký, ≤1/4 těžký.'
      ),
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
            p.postihy.length === 0 ? 'bez postihů' : p.postihy.map((/** @type {any} */ x) => popisPostihu(x, content)).join(' · ')
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
