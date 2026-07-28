// @ts-check
/**
 * Commit naslepo: telegraf (próza) + odvozený signál, ruce hráčů s kvótami.
 * Tým committne přesně tolik karet, kolik říká `commitPlan`, a teprve pak se
 * odhalí sloty — v tom je celé napětí v3 resoluce.
 *
 * Informační postihy (hide_telegraf / hide_staty / hide_viditelnost) se v
 * hot-seatu řeší variantou (b) dle §10.1 návrhu: informace se ZOBRAZÍ
 * přeškrtnutá s poznámkou, kdo podle ní nesmí radit. Čestnostní pravidlo,
 * ne mechanický zámek — drží fikci stejně jako tajné cíle.
 *
 * Žádná herní logika — jen render snapshotu enginu (architektura §2.4).
 * `content` (výstup `parseContent()`) je tu proto, aby se nikdy nevypisoval
 * syrový interní kód (kebab-case id postihu, VELKÝMI id štítku) — jen bezpečné
 * fallbacky, když popisek v obsahu chybí.
 */
import { h } from '../../dom.js';
import { STAT_LABEL, KATEGORIE_LABEL } from '../../labels.js';

/** Jména postav, které mají aktivní postih daného druhu. */
export function kdoNevidi(st, druh) {
  return st.postavy
    .filter((/** @type {any} */ p) => p.postihy.some((/** @type {any} */ x) => x.efekt?.druh === druh))
    .map((/** @type {any} */ p) => p.jmeno);
}

/** Čestnostní poznámka varianty (b) — nebo nic, když postih nikdo nemá. */
function poznamkaCestnosti(jmena, co) {
  if (jmena.length === 0) return null;
  return h('p', { class: 'cestnost' }, `${jmena.join(', ')} tohle nevidí (${co}) — ${jmena.length > 1 ? 'nesmějí' : 'nesmí'} podle toho radit.`);
}

/**
 * Český název situace z obsahu (od 2026-07-28 má `obsah/situace.yaml` pole
 * `nazev`) — fallback na syrové id, jen když v obsahu chybí (starý/nekompletní
 * obsah, ne běžný stav).
 *
 * Vložená setkání (léčka/konfrontace) nejsou v poolu `situace.yaml`, ale
 * u pronásledovatele — engine jim dává id `${pronasledovatel.id}-lecka` /
 * `-konfrontace` (`state.js` `startSituation`). Bez druhé větve by nadpis
 * obrazovky pro ně padal na syrové id (např. „serif-brody-konfrontace").
 * @param {{postihy?: any[], situace?: {id: string, nazev?: string}[], stitky?: any[],
 *   pronasledovatele?: {id: string, lecka?: {nazev?: string}, konfrontace?: {nazev?: string}}[]}} [content]
 * @param {{id: string}} situace
 */
function nazevSituace(content, situace) {
  const zPoolu = content?.situace?.find((/** @type {any} */ s) => s.id === situace.id)?.nazev;
  if (zPoolu) return zPoolu;
  for (const p of content?.pronasledovatele ?? []) {
    if (situace.id === `${p.id}-lecka`) return p.lecka?.nazev ?? situace.id;
    if (situace.id === `${p.id}-konfrontace`) return p.konfrontace?.nazev ?? situace.id;
  }
  return situace.id;
}

/**
 * Bezpečný český popis postihu — nikdy nevypisuje syrové kebab-case id.
 * S `content` k dispozici vypíše přesný název (`obsah/postihy.yaml` `nazev`),
 * bez něj (nebo když v něm postih s daným id není) spadne na kategorii
 * z `labels.js`. Stejný vzorec jako `okraj.js`.
 * @param {{id: string, tier: string, kategorie: string}} postih
 * @param {{postihy?: {id: string, nazev: string}[]}} [content]
 */
function popisPostihu(postih, content) {
  const nazev = content?.postihy?.find((/** @type {any} */ p) => p.id === postih.id)?.nazev;
  const zaklad = nazev ?? KATEGORIE_LABEL[postih.kategorie] ?? 'postih';
  return postih.tier === 'tezky' ? `${zaklad} (těžký)` : zaklad;
}

/**
 * Český název štítku věci (`obsah/stitky.yaml` `nazev`) — nikdy nevrací
 * syrové VELKÝMI id (GANGSTER apod.). Bez `content`, nebo když v něm štítek
 * s daným id není, padá na obecné slovo, ne na id.
 * @param {{stitky?: {id: string, nazev: string}[]}} [content]
 * @param {string} stitekId
 */
function nazevStitku(content, stitekId) {
  return content?.stitky?.find((/** @type {any} */ s) => s.id === stitekId)?.nazev ?? 'štítek';
}

/** @param {{S: object, st: object, content?: object, akce: Record<string, any>}} ctx */
export function pohledCommitu(ctx) {
  const { S, st, content, akce } = ctx;
  const situace = st.situace;
  const kvota = new Map(situace.commitPlan.map((/** @type {any} */ p) => [p.hrac_id, p.pocet]));
  const vybrano = (/** @type {string} */ id) => S.commitVyber[id] ?? [];
  const hotovo = situace.commitPlan.every((/** @type {any} */ p) => vybrano(p.hrac_id).length === p.pocet);
  const nevidiTelegraf = kdoNevidi(st, 'hide_telegraf');
  const nevidiStaty = kdoNevidi(st, 'hide_staty');

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, `úsek ${st.dokoncenoUzlu + 1} · commit naslepo`),
      h('h1', {}, nazevSituace(content, situace))
    ),
    h(
      'section',
      { class: 'uzel-karta' },
      h('p', { class: 'formular-popisek' }, 'Telegraf — jediné, co víte předem'),
      h('p', { class: 'uzel-uvod' }, situace.telegraf),
      h('p', { class: 'pravidlo' }, popisSignalu(situace.signal)),
      poznamkaCestnosti(nevidiTelegraf, 'informační postih na telegraf')
    ),
    h(
      'section',
      { class: 'postavy-tah' },
      st.postavy.map((/** @type {any} */ p) => panelPostavy(p)),
      poznamkaCestnosti(nevidiStaty, 'informační postih na staty')
    ),
    h(
      'footer',
      { class: 'formular-paticka' },
      h(
        'button',
        { class: 'tlacitko tlacitko-hlavni', disabled: !hotovo, onclick: () => akce.commitni() },
        'Committnout naslepo'
      ),
      hotovo ? null : h('p', { class: 'napoveda' }, 'Každý vyloží přesně tolik věcí, kolik má v kvótě. Vlastník kliká sám.')
    )
  );

  /** @param {any} p */
  function panelPostavy(p) {
    const potreba = kvota.get(p.id) ?? 0;
    const maSkryteStaty = p.postihy.some((/** @type {any} */ x) => x.efekt?.druh === 'hide_staty');
    if (p.slozena) {
      return h(
        'div',
        { class: 'panel-postavy vyrazena' },
        h('h3', {}, p.jmeno, ' ', h('span', { class: 'razitko razitko-male' }, 'složen')),
        h('p', { class: 'napoveda' }, `necommittuje, vrací se za ${p.kolDoNavratu} · sloty jsou týmové — propadne stejný počet slotů jako neobsazené, ne jeho`)
      );
    }
    return h(
      'div',
      { class: `panel-postavy${vybrano(p.id).length === potreba ? ' zahrano' : ''}` },
      h(
        'div',
        { class: 'okraj-postava-radka' },
        h('h3', {}, p.jmeno),
        h('span', { class: 'napoveda' }, `kvóta ${vybrano(p.id).length} / ${potreba} · v ruce ${p.ruka.length}`)
      ),
      p.postihy.length > 0
        ? h('p', { class: 'napoveda' }, `postihy: ${p.postihy.map((/** @type {any} */ x) => popisPostihu(x, content)).join(' · ')}`)
        : null,
      h(
        'div',
        { class: 'ruka' },
        p.ruka.map((/** @type {any} */ k) => {
          const jeVybrana = vybrano(p.id).includes(k.id);
          const plno = vybrano(p.id).length >= potreba && !jeVybrana;
          return h(
            'button',
            {
              class: `karta${jeVybrana ? ' zoufala' : ''}${plno ? ' neaktivni' : ''}`,
              disabled: plno,
              title: k.text,
              onclick: () => akce.prepniKartu(p.id, k.id),
            },
            h('strong', {}, k.nazev),
            h('span', { class: `karta-meta${maSkryteStaty ? ' skryto-postihem' : ''}` }, popisStatu(k.staty)),
            k.stitek ? h('span', { class: 'karta-hlucna' }, `${nazevStitku(content, k.stitek)} — hlučná`) : null
          );
        })
      )
    );
  }
}

/** „útok 3 · obrana 1 · hodnota 4 · improvizace 0 · nástroj 2" */
function popisStatu(staty) {
  return Object.entries(staty).map(([klic, hodnota]) => `${STAT_LABEL[klic] ?? klic} ${hodnota}`).join(' · ');
}

/** Odvozený signál telegrafu do jedné věty (engine ho derivuje ze slotů). */
function popisSignalu(signal) {
  if (!signal) return '';
  const staty = (signal.trend ?? []).map((/** @type {any} */ t) =>
    Array.isArray(t.stat) ? t.stat.map((/** @type {string} */ s) => STAT_LABEL[s] ?? s).join('+') : (STAT_LABEL[t.stat] ?? t.stat)
  );
  return [
    `viditelné role: ${staty.join(', ') || 'žádné'}`,
    `skrytých rolí: ${signal.proti_srsti}`,
    signal.zbran_projde === 'ano' ? 'zbraň projde i na očích' : 'zbraň na očích neprojde',
    signal.zbran_skryte ? 've skryté roli se zbraň vyplatí' : null,
    signal.improv_skryte ? 'skrytá role stojí na improvizaci' : null,
    signal.zbran_slot_vyjimka ? 'jedna role zbraň přímo vítá' : null,
  ].filter(Boolean).join(' · ');
}
