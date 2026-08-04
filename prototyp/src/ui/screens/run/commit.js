// @ts-check
/**
 * Commit naslepo: telegraf (próza) + ruce hráčů s kvótami.
 *
 * Od D47 je próza JEDINÝ nositel informace v default režimu — mechanický
 * rozbor odvozeného signálu se ukáže jen jako zvolené ulehčení nebo při
 * jednorázovém onboardingu (pravidlo v `ui/telegraf-rozbor.js`).
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
import { stavRozboru, popisSignalu } from '../../telegraf-rozbor.js';

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
  const rozbor = stavRozboru({ ulehceni: S.ulehceni, onboarding: S.onboardingRozbor, otevreno: S.rozborOtevren });
  // D57 komunikace (technika/obsahove-kolo-2p-2026-08-02.md §2 Návrh B): pronásledovatel
  // ruší jeden stat RUN-WIDE (§4.9) — dřív se to na kartě nikde nepoznalo, hráč si
  // sáhl na „hodnota 5" a slot i tak spadl. `st.pronasledovatel.rusi` je stejný
  // datový kanál, který engine používá k rušení (`resolve.js` `statValue`); UI ho
  // jen čte, žádná herní logika (architektura §2.4).
  const rusiStat = st.pronasledovatel?.rusi?.typ === 'stat' ? st.pronasledovatel.rusi.cil : null;
  // Brody zdvojuje Žár za GANGSTER (obsah/pronasledovatele.yaml) — stejná
  // odvozovací logika jako `brodyGangster` ve state.js, jen nad veřejným snapshotem.
  const brodyGangster = st.pronasledovatel?.rusi?.typ === 'stitek' && st.pronasledovatel.rusi.cil === 'GANGSTER';
  const maZbranVRuce = st.postavy.some((/** @type {any} */ p) => p.ruka.some((/** @type {any} */ k) => k.stitek === 'GANGSTER'));

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
      // Mechanický výčet kanálů je od D47 SKRYTÝ: dokud svítil, rušil
      // atmosférickou inference z prózy o řádek níž (nález kritika K-1) a
      // próza nikdy nebyla jediný nositel informace. Ukáže se jen jako
      // zvolené ulehčení (rozklik) nebo jednorázově při onboardingu (D48/2).
      // Smyčka učení tím nemizí: role pojmenuje obrazovka odhalení (assign.js).
      rozbor.prepinac
        ? h(
            'button',
            {
              class: 'tlacitko tlacitko-rozbor',
              'aria-expanded': rozbor.viditelny ? 'true' : 'false',
              onclick: () => akce.prepniRozbor(),
            },
            rozbor.viditelny ? 'Schovat rozbor' : 'Rozkliknout rozbor telegrafu'
          )
        : null,
      rozbor.viditelny
        ? h(
            'p',
            { class: 'telegraf-souhrn' },
            h('span', { class: 'telegraf-souhrn-popisek' }, 'co z toho plyne: '),
            popisSignalu(situace.signal)
          )
        : null,
      rozbor.poznamka
        ? h(
            'p',
            { class: 'napoveda' },
            'Rozbor ukazujeme jen na tomhle prvním úseku, ať víte, co ta slova znamenají. Dál si telegraf čtete sami — a role vám po commitu pojmenuje odhalení. Natrvalo se rozbor zapíná v obtížnosti jako ulehčení.'
          )
        : null,
      poznamkaCestnosti(nevidiTelegraf, 'informační postih na telegraf'),
      maZbranVRuce ? anotaceZbrane() : null
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
              onclick: () => akce.prepniKartu(p.id, k.id),
            },
            h('strong', {}, k.nazev),
            h('span', { class: `karta-meta${maSkryteStaty ? ' skryto-postihem' : ''}` }, statyUzly(k.staty, rusiStat)),
            h('span', { class: 'karta-popis' }, k.text),
            k.stitek ? h('span', { class: 'karta-hlucna' }, zbranKontext(k)) : null
          );
        })
      )
    );
  }

  /**
   * Kontextové razítko na kartě se štítkem (technika/obsahove-kolo-2p-2026-08-02.md
   * §3, „Kontextové razítko" — hlavní nosič pravidla): rozdělené na viditelnostní
   * pravidlo (odvozené ze `situace.signal.zbran_projde`, stejný strojový kanál jako
   * telegraf — žádné nové domýšlení) a hlučnost (Žár), dřív slité do jedné
   * zavádějící nálepky „hlučná" (nález kritika, obsahové kolo §3). Commit je
   * naslepo (D51), takže tohle je situační pravidlo (typ místa), ne konkrétní
   * slot — ten pojmenuje až odhalení (`assign.js`).
   * @param {any} k
   */
  function zbranKontext(k) {
    const signal = situace.signal;
    const nazev = nazevStitku(content, k.stitek);
    const pravidlo = !signal
      ? 'na očích propadne bez ohledu na staty'
      : signal.zbran_projde === 'ano'
        ? 'tady projde i na očích'
        : signal.zbran_slot_vyjimka
          ? 'na očích propadne — mimo jednu roli, co ji přímo vítá'
          : 'na očích propadne; potají rozhoduje stat role';
    const hlucnost = brodyGangster ? '+2 Žár' : '+1 Žár';
    return `${nazev} — ${pravidlo} · ${hlucnost}`;
  }

  /**
   * Statická anotace pravidla zbraně (obsahové kolo §3, varianta D — nahrazuje
   * mé A i B po recenzi kritika): 2 věty, žádný seznam typů míst, protože
   * verdikt zbraně je od D52 zapečený jako 4 doslovné řetězce (kanál 5
   * invariantu) — hráč nepotřebuje taxonomii, potřebuje jeden návyk. Ukazuje se
   * jen když má NĚKDO v ruce věc se štítkem (jinak by byla mrtvá informace).
   */
  function anotaceZbrane() {
    return h(
      'p',
      { class: 'napoveda' },
      'Zbraň se řídí poslední větou telegrafu — ta pro každé místo zvlášť říká, jestli projde na očích. Ve skryté roli se štítek neřeší nikdy; rozhoduje stat té role, a ten nemusí být útok.'
    );
  }
}

/**
 * „útok 3 · obrana 1 · hodnota 4 · improvizace 0 · nástroj 2" jako pole uzlů —
 * ne spojený řetězec — aby šel jeden token přeškrtnout (D57 komunikace,
 * obsahové kolo §2 Návrh B bod 1): pronásledovatel ruší `rusiStat` run-wide
 * (§4.9), takže „hodnota 5" na kartě je od teď vidět jako nulovaná, ne mlčky
 * jako plnohodnotná.
 * @param {Record<string, number>} staty
 * @param {string|null} rusiStat
 */
export function statyUzly(staty, rusiStat = null) {
  const uzly = [];
  Object.entries(staty).forEach(([klic, hodnota], i) => {
    if (i > 0) uzly.push(' · ');
    const text = `${STAT_LABEL[klic] ?? klic} ${hodnota}`;
    uzly.push(
      klic === rusiStat ? h('span', { class: 'stat-zrusen-pronasledovatelem', title: 'pronásledovatel ruší tenhle stat po celý run' }, text) : text
    );
  });
  return uzly;
}

