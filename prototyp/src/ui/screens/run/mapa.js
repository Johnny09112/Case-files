// @ts-check
/**
 * Volba cesty (StS páteř). Typ místa je VEŘEJNÁ informace (D34/N7) — hráč před
 * commitem ví, jestli tam projde zbraň. Telegraf se ukáže až po volbě (fáze
 * commit); mapa ho neprozrazuje.
 */
import { h } from '../../dom.js';
import { TYP_MISTA_LABEL } from '../../labels.js';

/** Co typ místa znamená pro zbraň — plyne z obsah/stitky.yaml chovani_dle_typu. */
function pravidloTypu(content, typ) {
  const chovani = content.stitky.find((/** @type {any} */ s) => s.id === 'GANGSTER')?.parametry?.chovani_dle_typu?.[typ];
  if (chovani === 'vzdy_pass') return 'zbraň tu projde i na očích';
  if (chovani === 'viditelna_role_selze') return 'zbraň ve viditelné roli tu propadne';
  return 'bez resoluce — jen nález';
}

/**
 * Čitelný název cesty pro kartu volby. `npc`/`lokace`/`zatah` odkazují na
 * `obsah/situace.yaml`, kde má každý záznam pole `nazev` (od 2026-07-28) —
 * to je bezpečné ukázat předem, na rozdíl od `telegraf`/`text` (spoiler
 * slotů, ukazuje se až po commitu). `truhla` odkazuje na `obsah/mista.yaml`,
 * jehož schéma `nazev` nemá, takže tam padáme na český popisek typu místa.
 * Syrové kebab-case id je jen krajní fallback, který by hráč neměl nikdy vidět.
 * @param {{situace: {id: string, nazev?: string}[]}} content
 * @param {{ref: string, typ_mista: string}} volba
 */
function nazevCesty(content, volba) {
  const situace = content.situace.find((/** @type {any} */ s) => s.id === volba.ref);
  if (situace?.nazev) return situace.nazev;
  const label = TYP_MISTA_LABEL[volba.typ_mista];
  if (label) return label.charAt(0).toUpperCase() + label.slice(1);
  return volba.ref;
}

/** @param {{st: object, content: object, rules: object, akce: Record<string, any>}} ctx */
export function pohledMapy(ctx) {
  const { st, content, rules, akce } = ctx;
  const zatah = Boolean(st.nabidka?.zatah);

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, `úsek ${st.dokoncenoUzlu + 1} z ${rules.uzluNaRun}`),
      h('h1', {}, zatah ? 'Zátah! Jiná cesta není' : 'Volba cesty'),
      h('p', { class: 'napoveda' }, zatah
        ? `Žár dosáhl prahu — ${st.pronasledovatel.nazev} přehradil obě cesty.`
        : 'Typ místa je vidět předem a rozhoduje o zbrani. Stůl se radí, kliká kdokoli.')
    ),
    h(
      'div',
      { class: 'mrizka-cest' },
      st.nabidka.nabidnuto.map((/** @type {any} */ volba) => {
        const misto = content.mista.find((/** @type {any} */ m) => m.id === volba.ref);
        return h(
          'button',
          { class: `uzel-karta${zatah ? ' zatah' : ''}`, onclick: () => akce.zvolCestu(volba.ref) },
          zatah ? h('span', { class: 'razitko' }, 'zátah') : null,
          h('h2', {}, nazevCesty(content, volba)),
          h('p', { class: 'napoveda' }, `typ: ${TYP_MISTA_LABEL[volba.typ_mista] ?? volba.typ_mista}`),
          misto ? h('p', { class: 'uzel-uvod' }, misto.text) : null,
          h('p', { class: 'pravidlo' }, pravidloTypu(content, volba.typ_mista))
        );
      })
    )
  );
}
