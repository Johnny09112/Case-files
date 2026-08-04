// @ts-check
/**
 * Rozdělení committnutých věcí do odhalených slotů („rozděl 4 karty do 4 slotů
 * co nejméně špatně") + gamble jako jednorázová záchrana.
 *
 * **Prahy tady vidět NEJSOU (D51).** Kanon je „prahy skryté před vyhodnocením,
 * odhalené po" (design-dokument §4.5 a §10) — obrazovka proto ukazuje jen
 * KOTVU a rozpětí šumu (anotace `misto: 'slot'` z vysvětlující vrstvy).
 * Kotva je stálá a naučitelná, takže learnabilita zůstává; finální zašuměný
 * práh by z „rozděl co nejméně špatně" udělal dopočitatelnou aritmetiku
 * a rozcházel by se s botem simulační brány, který prahy při přiřazení nezná.
 * Přesný práh i jeho rozklad patří na obrazovku výsledku (`vysledek.js`).
 *
 * **Hlavní prvek obrazovky je PRÓZA situace** (fáze 2.2, nález 1. sezení lidské
 * brány): autorský text se 4 mezerami je kanon (§4.3). Od rychlé UX úpravy
 * (fáze 2.3) je interakce „aktivní mezera": jedna mezera je vždy aktivní
 * (výchozí = první prázdná), klik na libovolnou mezeru ji aktivuje (i
 * vyplněnou — pro opravu) a klik na committnutou věc ji rovnou přiřadí do
 * aktivní mezery a ukazatel skočí na další prázdnou. Žádný mezikrok
 * „vyber věc, pak klikni na roli" a žádný samostatný technický rozpis rolí —
 * jediný technický údaj k aktivní mezeře nese `tipAktivni()` pod textem.
 *
 * Žádná herní logika — jen render snapshotu enginu (architektura §2.4).
 * `content` je tu ze stejného důvodu jako v `commit.js`: aby se nikdy
 * nevypsalo syrové interní id (situace.id, VELKÝMI id štítku) do textu pro
 * hráče — jen bezpečné fallbacky, když popisek v obsahu chybí.
 */
import { h } from '../../dom.js';
import { MISTO } from '../../vysvetleni.js';
import { STAT_LABEL } from '../../labels.js';
import { kdoNevidi, statyUzly } from './commit.js';
import { rozlozText, textSituace, MEZERA } from '../../situace-text.js';
import { prijmeni } from '../../protocol-fill.js';

/** Anotace odhalení prahů pro tenhle uzel: slot_index → anotace. */
function anotaceSlotu(anotace, nodeIndex, events) {
  const seq = events.find((e) => e.type === 'situation_revealed' && e.nodeIndex === nodeIndex)?.seq;
  const seznam = seq ? (anotace.get(seq) ?? []) : [];
  return new Map(seznam.filter((a) => a.misto === MISTO.SLOT).map((a) => [a.slot_index, a]));
}

/**
 * Index aktivní mezery — sdílené mezi renderem (tady) a `app.js`
 * (`akce.priradVec`), ať se pravidlo „výchozí = první prázdná" nikde
 * nerozejde. Explicitní klik (`akce.aktivujMezeru`) vyhraje, dokud ukazuje na
 * existující slot; jinak první prázdný slot; jinak první slot vůbec (aby tip
 * pod textem měl vždycky co ukázat, i když je hotovo).
 * @param {{slot_index: number}[]} sloty
 * @param {{aktivni: number|null, sloty: Record<number, string>}} assignVyber
 * @returns {number|null}
 */
export function aktivniSlotIndex(sloty, assignVyber) {
  if (assignVyber.aktivni != null && sloty.some((s) => s.slot_index === assignVyber.aktivni)) {
    return assignVyber.aktivni;
  }
  const prazdna = sloty.find((s) => !(s.slot_index in assignVyber.sloty));
  return (prazdna ?? sloty[0])?.slot_index ?? null;
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
 * @param {{S: object, st: object, content?: object, rules?: object,
 *   akce: Record<string, any>, anotace: Map<number, object[]>}} ctx
 */
export function pohledPrirazeni(ctx) {
  const { S, st, content, rules, akce, anotace } = ctx;
  const situace = st.situace;
  const sloty = situace.odhaleno?.sloty ?? [];
  const vysvetlivky = anotaceSlotu(anotace, st.nodeIndex, S.udalosti ?? []);
  const prirazeno = S.assignVyber.sloty;
  const aktivni = aktivniSlotIndex(sloty, S.assignVyber);
  const hotovo = Object.keys(prirazeno).length === situace.committed.length;
  const nevidiViditelnost = kdoNevidi(st, 'hide_viditelnost');
  // D57 komunikace (technika/obsahove-kolo-2p-2026-08-02.md §2 Návrh B bod 1):
  // stejná přeškrtnutá hodnota jako v commit.js — pronásledovatel ruší jeden stat
  // run-wide, karta se tu bez toho tvářila plnohodnotně i po odhalení slotů.
  // D58/V2-A′: gatováno `rusiAktivni`, stejně jako v commit.js — viz komentář tam.
  const rusiStat = st.pronasledovatel?.rusiAktivni && st.pronasledovatel?.rusi?.typ === 'stat' ? st.pronasledovatel.rusi.cil : null;
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
      h('p', { class: 'napoveda' }, 'Podtržená mezera je aktivní — klikni na věc dole, přiřadí se tam a ukazatel skočí na další prázdnou. Klikni na jinou mezeru, chceš-li opravit ji místo další. Vidíš kotvu, ne práh — kotva se opakuje, šum se dorolí a ukáže se až po vyhodnocení.'),
      h('p', { class: 'cestnost' }, 'Propadne-li slot, postih dostane majitel nejhůř propadlé věci — čí karta zůstane statu nejdál, ten ho nese.')
    ),
    nevidiViditelnost.length > 0
      ? h(
          'p',
          { class: 'cestnost' },
          `${nevidiViditelnost.join(', ')} tohle nevidí (které role jsou skryté) — ${nevidiViditelnost.length > 1 ? 'nesmějí' : 'nesmí'} podle toho radit.`
        )
      : null,
    prozaSituace(),
    tipAktivni(),
    h(
      'section',
      { class: 'formular-blok' },
      h('h2', { class: 'formular-popisek' }, 'Committnuté věci'),
      h(
        'div',
        { class: 'ruka' },
        situace.committed.map((/** @type {any} */ c) => {
          const uzPouzita = Object.values(prirazeno).includes(c.karta.id);
          return h(
            'button',
            {
              class: `karta${uzPouzita ? ' neaktivni' : ''}`,
              disabled: uzPouzita,
              onclick: () => akce.priradVec(c.karta.id),
            },
            h('strong', {}, c.karta.nazev),
            h('span', { class: 'karta-meta' }, statyUzly(c.karta.staty, rusiStat)),
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
   * Autorská próza situace s živě plněnými mezerami — hlavní prvek obrazovky
   * i jediné místo, odkud jde mezeru aktivovat (od fáze 2.3 už žádný
   * samostatný technický rozpis rolí neexistuje). Když obsah text nemá
   * (starý/nekompletní obsah), sekce prostě zmizí — přiřazení pak jede jen
   * přes výchozí/aktivní slot bez vizuální zpětné vazby v próze; obsah je
   * od D23 v3-kompletní, takže by k tomu nemělo dojít.
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

  /** Klikatelná mezera {VEC} — plní se názvem přiřazené věci, aktivní se aktivuje kliknutím. */
  function mezera(slotIndex) {
    const karta = veSlotu(slotIndex)?.karta ?? null;
    const trida = ['mezera', karta ? 'mezera-plna' : 'mezera-prazdna', slotIndex === aktivni ? 'mezera-aktivni' : null]
      .filter(Boolean)
      .join(' ');
    return h(
      'button',
      {
        class: trida,
        title: `role ${slotIndex + 1} — klikni pro aktivaci`,
        onclick: () => akce.aktivujMezeru(slotIndex),
      },
      karta ? `„${karta.nazev}"` : MEZERA,
      h('sup', { class: 'mezera-cislo' }, String(slotIndex + 1))
    );
  }

  /**
   * Jediný technický údaj obrazovky — nahrazuje bývalý celý „Rozpis rolí":
   * ukazuje info JEN k právě aktivní mezeře (role, stat, viditelnost, kotva +
   * rozpětí šumu). Práh sem nepatří — D51.
   */
  function tipAktivni() {
    const s = sloty.find((/** @type {any} */ x) => x.slot_index === aktivni);
    if (!s) return null;
    const a = vysvetlivky.get(s.slot_index);
    const sumRozsah = rules?.sumRozsah ?? 2;
    return h(
      'section',
      { class: 'tip-mezera' },
      h('p', { class: 'formular-popisek' }, `aktivní mezera ${s.slot_index + 1}. — ${s.role}`),
      h(
        'p',
        { class: 'napoveda' },
        `${popisStatSlotu(s)} · ${s.viditelnost === 'skryta' ? 'skrytá role' : 'viditelná role'} · kotva ${s.kotva}, šum ±${sumRozsah} — přesný práh až po vyhodnocení`
      ),
      a ? h('p', { class: 'napoveda', title: a.detail ?? '' }, a.veta) : null
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
