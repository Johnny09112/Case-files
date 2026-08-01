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
 *
 * **Invariant dat:** `S.fronta[0].udalosti` obsahuje POUZE události jednoho
 * konkrétního uzlu (ten s `nodeIndex` položky). Tato funkce filtruje pouze
 * podle typu; všechny sekce (sloty, pásmo, důsledky) spoléhají na tuto garantii.
 * Pokud volající (viz task 12) předá širší výřez logu, obranná filtrace podle
 * `nodeIndex` zajistí, že cizí Žár, postihy či gamble se do renderu nedostanou.
 */
import { h } from '../../dom.js';
import { vyklepej } from '../../typewriter.js';
import { MISTO } from '../../vysvetleni.js';
import { EVENT } from '../../../engine/events.js';
import { doplnText, textSituace } from '../../situace-text.js';

/**
 * @param {{S: object, content?: object, akce: Record<string, any>,
 *   anotace: Map<number, object[]>}} ctx
 *   - S stav aplikace (S.fronta[0] je položka s `udalosti` z JEDNOHO uzlu
 *     a jeho `nodeIndex`; živý snapshot enginu je tou dobou už o uzel dál)
 *   - content validovaný obsah (autorský text situace + názvy věcí)
 *   - akce callbacky UI
 *   - anotace mapa seq → anotace z vysvětlující vrstvy
 */
export function pohledVysledku(ctx) {
  const { S, content, akce, anotace } = ctx;
  const polozka = S.fronta[0];
  const { udalosti, sekce } = polozka;
  const prvni = (/** @type {any} */ u) => (anotace.get(u.seq) ?? [])[0];

  // Obranná filtrace: propusť jen události uzlu, který se právě zobrazuje.
  // Porovnává se s `polozka.nodeIndex`, NE se `st.nodeIndex` — než hráč
  // výsledek uvidí, engine už nabízí cesty dalšího uzlu, takže živý snapshot
  // ukazuje jinam a filtr proti němu by vyhodil úplně všechno.
  // Události bez nodeIndex propouštíme (tichý filtr, žádná výjimka).
  const jeZTohotoUzlu = (/** @type {any} */ u) => u.nodeIndex === undefined || u.nodeIndex === polozka.nodeIndex;

  const sloty = udalosti.filter((/** @type {any} */ u) => jeZTohotoUzlu(u) && u.type === EVENT.SLOT_RESOLVED);
  const pasmo = udalosti.find((/** @type {any} */ u) => jeZTohotoUzlu(u) && u.type === EVENT.BAND_RESOLVED);
  const dusledky = udalosti.filter((/** @type {any} */ u) =>
    jeZTohotoUzlu(u) && [EVENT.ZAR_MOVE, EVENT.CREDIT_FLOW, EVENT.PENALTY_ADDED, EVENT.PENALTY_EXPIRED, EVENT.PENALTY_HEALED, EVENT.CHARACTER_FOLDED, EVENT.CHARACTER_RETURNED, EVENT.GAMBLE].includes(u.type)
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
      h(
        'h1',
        {},
        `List ${sekce.cislo} — ${sekce.titulek} `,
        // Nenápadný indikátor režimu (fáze 3, ADR-004) — jen informace, odkud
        // pochází text protokolu; nikdy modál ani varování.
        h('span', { class: 'rezim-indikator', title: sekce.zdroj === 'ai' ? 'Protokol napsala AI' : 'Protokol z připravených šablon' }, sekce.zdroj === 'ai' ? 'AI' : 'šablony')
      )
    ),

    prozaSituace(),

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

  /**
   * Finální znění autorského textu situace s doplněnými věcmi a jmény —
   * NAD razítky, aby razítka četla jako verdikt k příběhu, ne jako čtyři
   * nesouvisející testy (fáze 2.2, nález 1. sezení lidské brány).
   *
   * Mezery se plní z událostí `slot_resolved` (co kam nakonec šlo, včetně
   * gamblem vyměněných věcí), ne z assign-výběru UI — po vyhodnocení je
   * pravdou log enginu. Neobsazený slot zůstane mezerou: text nikdy netvrdí
   * věc, kterou tam mechanika nedala.
   */
  function prozaSituace() {
    const odhaleni = udalosti.find((/** @type {any} */ u) => jeZTohotoUzlu(u) && u.type === EVENT.SITUATION_REVEALED);
    const text = odhaleni ? textSituace(content, odhaleni.situace_id) : null;
    if (!text) return null;
    /** @type {Record<number, string>} */ const veci = {};
    /** @type {Record<number, string>} */ const jmena = {};
    for (const u of sloty) {
      if (u.karta_id) veci[u.slot_index] = nazevVeci(u.karta_id);
      if (u.hrac_id) jmena[u.slot_index] = S.jmena?.[u.hrac_id] ?? u.hrac_id;
    }
    return h(
      'section',
      { class: 'uzel-karta situace-blok' },
      h('p', { class: 'formular-popisek' }, 'Jak to nakonec bylo'),
      h('p', { class: 'situace-text' }, doplnText(text, { veci, jmena }))
    );
  }

  /** Český název věci z obsahu — nikdy syrové kebab-case id. */
  function nazevVeci(kartaId) {
    return content?.veci?.find((/** @type {any} */ v) => v.id === kartaId)?.nazev ?? kartaId;
  }
}
