// @ts-check
/**
 * Rozdělení committnutých věcí do odhalených slotů („rozděl 4 karty do 4 slotů
 * co nejméně špatně") + gamble jako jednorázová záchrana.
 *
 * Prahy jsou tady poprvé vidět — a rovnou s vysvětlením, z čeho vznikly
 * (anotace `misto: 'slot'` z vysvětlující vrstvy). Tohle je místo, kde se hráč
 * učí, že kotva je stálá a šum ne.
 *
 * **Hlavní prvek obrazovky je PRÓZA situace** (fáze 2.2, nález 1. sezení lidské
 * brány): autorský text se 4 mezerami je kanon (§4.3) a slotové řádky bez něj
 * čtou jako čtyři nesouvisející testy. Mezery jsou klikatelné — přiřazení jde
 * jak z textu, tak z technického rozpisu pod ním; rozpis je vizuálně podřízený.
 *
 * Žádná herní logika — jen render snapshotu enginu (architektura §2.4).
 * `content` je tu ze stejného důvodu jako v `commit.js`: aby se nikdy
 * nevypsalo syrové interní id (situace.id, VELKÝMI id štítku) do textu pro
 * hráče — jen bezpečné fallbacky, když popisek v obsahu chybí.
 */
import { h } from '../../dom.js';
import { MISTO } from '../../vysvetleni.js';
import { STAT_LABEL } from '../../labels.js';
import { kdoNevidi } from './commit.js';
import { rozlozText, textSituace, MEZERA } from '../../situace-text.js';
import { prijmeni } from '../../protocol-fill.js';

/** Anotace odhalení prahů pro tenhle uzel: slot_index → anotace. */
function anotaceSlotu(anotace, nodeIndex, events) {
  const seq = events.find((e) => e.type === 'situation_revealed' && e.nodeIndex === nodeIndex)?.seq;
  const seznam = seq ? (anotace.get(seq) ?? []) : [];
  return new Map(seznam.filter((a) => a.misto === MISTO.SLOT).map((a) => [a.slot_index, a]));
}

/**
 * Český název situace z obsahu (`obsah/situace.yaml` pole `nazev`) — fallback
 * na syrové id jen když v obsahu chybí. Stejný vzorec jako `nazevSituace`
 * v `commit.js` a `popisPostihu` v `okraj.js`: každá obrazovka si drží
 * vlastní bezpečný převod, ať o `content` nikdy nezávisí na jiném souboru.
 *
 * Vložená setkání (léčka/konfrontace) nejsou v poolu `situace.yaml`, ale
 * u pronásledovatele — engine jim dává id `${pronasledovatel.id}-lecka` /
 * `-konfrontace` (`state.js` `startSituation`). Bez druhé větve by nadpis
 * obrazovky pro ně padal na syrové id (např. „serif-brody-konfrontace").
 * @param {{situace?: {id: string, nazev?: string}[],
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
 * Český název štítku věci (`obsah/stitky.yaml` `nazev`) — nikdy nevrací
 * syrové VELKÝMI id (GANGSTER apod.). Stejný vzorec jako `commit.js`.
 * @param {{stitky?: {id: string, nazev: string}[]}} [content]
 * @param {string} stitekId
 */
function nazevStitku(content, stitekId) {
  return content?.stitky?.find((/** @type {any} */ s) => s.id === stitekId)?.nazev ?? 'štítek';
}

/**
 * @param {{S: object, st: object, content?: object, akce: Record<string, any>,
 *   anotace: Map<number, object[]>}} ctx
 */
export function pohledPrirazeni(ctx) {
  const { S, st, content, akce, anotace } = ctx;
  const situace = st.situace;
  const sloty = situace.odhaleno?.sloty ?? [];
  const vysvetlivky = anotaceSlotu(anotace, st.nodeIndex, S.udalosti ?? []);
  const prirazeno = S.assignVyber.sloty;
  const vybranaKarta = S.assignVyber.karta;
  const hotovo = Object.keys(prirazeno).length === situace.committed.length;
  const nevidiViditelnost = kdoNevidi(st, 'hide_viditelnost');
  // Ruce, ze kterých lze táhnout naslepo — jen ty neprázdné (D19b: „čí ruka
  // poskytne kartu" a „kterou committnutou nahradí" jsou DVĚ nezávislé volby
  // týmu, viz prototyp-mvp.md §Resoluční systém v3; hráč nemusí gamblovat
  // vlastní kartou za vlastní kartu).
  const rukyKGamblu = st.postavy.filter((/** @type {any} */ p) => p.ruka.length > 0);
  const gambleLze = !situace.gambleUsed
    && rukyKGamblu.length > 0
    && !st.postavy.some((/** @type {any} */ p) => p.postihy.some((/** @type {any} */ x) => x.efekt?.druh === 'lock_gamble'));

  return h(
    'div',
    {},
    h(
      'header',
      { class: 'spis-hlavicka' },
      h('p', { class: 'formular-popisek' }, 'odhaleno — teď se dělí'),
      h('h1', {}, nazevSituace(content, situace)),
      h('p', { class: 'napoveda' }, 'Klikni na věc, pak na mezeru v textu (nebo na roli v rozpisu). Práh je vidět; kotva se opakuje, šum ne.')
    ),
    nevidiViditelnost.length > 0
      ? h(
          'p',
          { class: 'cestnost' },
          `${nevidiViditelnost.join(', ')} tohle nevidí (které role jsou skryté) — ${nevidiViditelnost.length > 1 ? 'nesmějí' : 'nesmí'} podle toho radit.`
        )
      : null,
    prozaSituace(),
    h(
      'section',
      { class: 'rozpis-hodu rozpis-tlumeny' },
      h('h2', { class: 'formular-popisek' }, 'Rozpis rolí — co která mezera měří'),
      sloty.map((/** @type {any} */ s) => radekSlotu(s))
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Committnuté věci'),
      h(
        'div',
        { class: 'ruka' },
        situace.committed.map((/** @type {any} */ c) => {
          const uzPouzita = Object.values(prirazeno).includes(c.karta.id);
          const vybrana = vybranaKarta === c.karta.id;
          return h(
            'button',
            {
              class: `karta${vybrana ? ' zoufala' : ''}${uzPouzita ? ' neaktivni' : ''}`,
              disabled: uzPouzita,
              onclick: () => akce.vyberKartu(c.karta.id),
            },
            h('strong', {}, c.karta.nazev),
            h('span', { class: 'karta-meta' }, Object.entries(c.karta.staty).map(([k, v]) => `${STAT_LABEL[k] ?? k} ${v}`).join(' · ')),
            h('span', { class: 'karta-popis' }, c.karta.text),
            c.karta.stitek ? h('span', { class: 'karta-hlucna' }, `${nazevStitku(content, c.karta.stitek)} — hlučná`) : null
          );
        })
      )
    ),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Gamble — jednou za situaci'),
      situace.gambleUsed
        ? h('p', { class: 'napoveda' }, 'Sázka už v téhle situaci padla.')
        : !gambleLze
          ? h('p', { class: 'napoveda' }, 'Sázka není k dispozici (prázdné ruce nebo zámkový postih).')
          : h(
              'div',
              {},
              h(
                'p',
                { class: 'napoveda' },
                'Tým vybere, kterou committnutou věc obětuje a čí ruka za ni dá slepý tah — nová věc může být horší.'
              ),
              situace.committed.map((/** @type {any} */ c) => gambleRadek(c))
            )
    ),
    h(
      'footer',
      { class: 'formular-paticka' },
      h('button', { class: 'tlacitko tlacitko-hlavni', disabled: !hotovo, onclick: () => akce.vyhodnot() }, 'Rozdělit a vyhodnotit'),
      hotovo ? null : h('p', { class: 'napoveda' }, 'Každá committnutá věc musí do nějaké role.')
    )
  );

  /** Committnutá věc přiřazená do slotu (`{hrac_id, karta}`), nebo null. */
  function veSlotu(slotIndex) {
    const kartaId = prirazeno[slotIndex];
    return situace.committed.find((/** @type {any} */ c) => c.karta.id === kartaId) ?? null;
  }

  /**
   * Autorská próza situace s živě plněnými mezerami — hlavní prvek obrazovky.
   * Mezera je tlačítko se stejným chováním jako řádek rozpisu (přiřadit /
   * zrušit), takže hráč nemusí překládat „slot 3" na „…pomocí ___".
   * Když obsah text nemá (starý/nekompletní obsah), sekce prostě zmizí —
   * rozpis rolí zůstává funkční.
   */
  function prozaSituace() {
    const text = textSituace(content, situace.id);
    if (!text) return null;
    return h(
      'section',
      { class: 'uzel-karta situace-blok' },
      h('p', { class: 'formular-popisek' }, 'Co se právě děje'),
      h(
        'p',
        { class: 'situace-text' },
        rozlozText(text).map((u) => {
          if (u.typ === 'text') return u.hodnota;
          if (u.typ === 'kdo') return jednajici(u.slot);
          return mezera(u.slot);
        })
      )
    );
  }

  /** Jednající u mezery — příjmení vlastníka přiřazené věci, jinak mezera. */
  function jednajici(slotIndex) {
    const c = veSlotu(slotIndex);
    return c
      ? h('span', { class: 'jednajici' }, prijmeni(jmenoHrace(st, c.hrac_id)))
      : h('span', { class: 'jednajici mezera-prazdna' }, MEZERA);
  }

  /** Klikatelná mezera {VEC} — plní se názvem přiřazené věci. */
  function mezera(slotIndex) {
    const s = sloty.find((/** @type {any} */ x) => x.slot_index === slotIndex);
    const karta = veSlotu(slotIndex)?.karta ?? null;
    return h(
      'button',
      {
        class: `mezera${karta ? ' mezera-plna' : ' mezera-prazdna'}`,
        disabled: !karta && !vybranaKarta,
        title: s ? `role ${slotIndex + 1}: ${s.role} — ${popisStatSlotu(s)}, práh ${s.prah}` : '',
        onclick: () => (karta ? akce.zrusPrirazeni(slotIndex) : akce.prirad(slotIndex)),
      },
      karta ? `„${karta.nazev}"` : MEZERA,
      h('sup', { class: 'mezera-cislo' }, String(slotIndex + 1))
    );
  }

  /** @param {any} s odhalený slot */
  function radekSlotu(s) {
    const karta = veSlotu(s.slot_index)?.karta ?? null;
    const a = vysvetlivky.get(s.slot_index);
    // Prázdný slot bez vybrané věci nemá co přiřadit — tlačítko na to nesmí
    // vést k nelegálnímu příkazu (`prirad` bez karty). Zrušit přiřazení jde
    // vždy, tam se nic neblokuje.
    const nejdeKliknout = !karta && !vybranaKarta;
    return h(
      'button',
      {
        class: 'hod-radek',
        disabled: nejdeKliknout,
        onclick: () => (karta ? akce.zrusPrirazeni(s.slot_index) : akce.prirad(s.slot_index)),
      },
      h(
        'div',
        { class: 'okraj-postava-radka' },
        h('strong', {}, `${s.slot_index + 1}. ${s.role}`),
        h('span', { class: 'napoveda' }, `${popisStatSlotu(s)} · práh ${s.prah} · ${s.viditelnost === 'skryta' ? 'skrytá role' : 'viditelná role'}`)
      ),
      a ? h('p', { class: 'napoveda', title: a.detail ?? '' }, a.veta) : null,
      h('p', { class: 'hod-vypocet' }, karta ? `→ „${karta.nazev}"` : '→ (prázdné, klikni pro přiřazení vybrané věci)')
    );
  }

  /**
   * Řádek gamblu za jednu committnutou věc — nabídne slepý tah z KAŽDÉ
   * neprázdné ruky (nejen z ruky vlastníka nahrazované karty, viz `rukyKGamblu`
   * výše). `akce.gambluj(hracId, kartaId)` odpovídá enginovému
   * `gamble({handOwnerId, replacedCardId})` (`state.js`): první parametr je
   * ruka, odkud se táhne, druhý committnutá věc, která se zahodí — nezávislé
   * volby, i když se v UI zobrazí spolu jako jedna volba na tlačítko.
   * @param {any} c committnutá věc (`{hrac_id, karta}`)
   */
  function gambleRadek(c) {
    return h(
      'div',
      { class: 'radka-voleb' },
      h('span', { class: 'napoveda' }, `„${c.karta.nazev}" (${jmenoHrace(st, c.hrac_id)}) za slepý tah z ruky:`),
      rukyKGamblu.map((/** @type {any} */ p) =>
        h(
          'button',
          { class: 'tlacitko tlacitko-varovne', onclick: () => akce.gambluj(p.id, c.karta.id) },
          `${p.jmeno} (${p.ruka.length})`
        )
      )
    );
  }
}

function popisStatSlotu(s) {
  return Array.isArray(s.stat)
    ? `${s.stat.map((x) => STAT_LABEL[x] ?? x).join(' + ')} (OBA)`
    : (STAT_LABEL[s.stat] ?? s.stat);
}

function jmenoHrace(st, id) {
  return st.postavy.find((/** @type {any} */ p) => p.id === id)?.jmeno ?? id;
}
