// @ts-check
/**
 * Vysvětlující vrstva (fáze 2.1, technika/faze-2.1-navrh-2026-07-27.md §4.1).
 *
 * ČISTÁ funkce nad událostním logem enginu: bez DOM, bez herní logiky, bez
 * náhody. Vrstva NENÍ nová data — engine „proč" už loguje (prah, stat_hodnota,
 * duvod, stitek_efekt, postih_efekt, gap, prah_prekrocen); tohle je jeho
 * překlad do češtiny. Do enginu se české věty NEPŘIDÁVAJÍ: znečistily by
 * golden snapshoty a JSONL, ze kterých měří simulace (ADR-002).
 *
 * Fold, ne per-událost mapper: průchod drží účetní knihu (postih → uzel původu,
 * gamble → jak dopadl), bez které nejde udělat řetězec přes uzly — přesně to,
 * co playtestu 2026-07-22 chybělo nejvíc.
 *
 * Volá se nad PREFIXEM logu při hře i nad CELÝM logem po runu — jedna definice.
 */
import { EVENT } from '../engine/events.js';
import { STAT_LABEL, znamenko } from './labels.js';

/** Kam anotace v UI patří (slot situace / okraj mapy / list spisu). */
export const MISTO = /** @type {const} */ ({ SLOT: 'slot', OKRAJ: 'okraj', SPIS: 'spis' });

/**
 * @typedef {object} Anotace
 * @property {'slot'|'okraj'|'spis'} misto
 * @property {string} veta hlavní „proč" — jedna věta, úřední tón
 * @property {string} [detail] rozšíření na rozkliknutí (čísla, kontext)
 * @property {{seq: number, popis: string}} [odkaz] zpětný ukazatel na událost původu
 * @property {number} [slot_index] u misto='slot': ke kterému slotu anotace patří
 * @property {string} [razitko] krátké razítko pro render (PROŠLO / NEPROŠLO / …)
 */

/**
 * @typedef {object} VysvetliCtx
 * @property {Record<string,string>} [jmena] hrac_id → celé jméno
 * @property {Record<string,string>} [postihy] postih_id → název
 * @property {Record<string,string>} [veci] karta_id → název věci
 * @property {Record<string,string>} [situace] situace_id → lidský label
 * @property {Record<string,string>} [pronasledovatele] id → název
 * @property {Record<string,{text: string}>} [cile] cil_id → definice cíle
 */

/**
 * Přeloží událostní log do anotací indexovaných podle `seq`.
 * @param {object[]} events log enginu (celý, nebo prefix při živé hře)
 * @param {VysvetliCtx} [ctx] české labely k id z obsahu
 * @returns {Map<number, Anotace[]>}
 */
export function vysvetli(events, ctx = {}) {
  /** @type {Map<number, Anotace[]>} */
  const out = new Map();
  const kniha = novaKniha(ctx, events, out);
  for (const e of events) {
    const handler = HANDLERS[e.type];
    const anotace = handler ? handler(e, kniha) : [neznama(e)];
    if (anotace.length > 0) out.set(e.seq, anotace);
  }
  return out;
}

/** Účetní kniha foldu — kontext, který jedna událost sama o sobě nemá. */
function novaKniha(ctx, events, out) {
  return {
    ctx,
    events,
    out,
    /** Název pronásledovatele + co ruší (z run_started). */
    pronasledovatel: /** @type {string|null} */ (null),
    rusi: /** @type {{typ: string, cil: string}|null} */ (null),
    /** nodeIndex → situace_id (pro popis odkazů). */
    situaceUzlu: /** @type {Map<number, string>} */ (new Map()),
  };
}

/** Tripwire: engine vydal typ, který vrstva nezná (§7 test 2). */
function neznama(e) {
  return {
    misto: MISTO.SPIS,
    veta: `Do spisu přibyla neznámá událost „${e.type}" — vysvětlující vrstva ji neumí přeložit.`,
    detail: 'Vrstva se rozešla s enginem: doplň handler v src/ui/vysvetleni.js (katalog §5 návrhu fáze 2.1).',
  };
}

/** Název statu (jednostat i kombi) — „nástroj" / „nástroj + improvizace". */
function popisStatu(stat) {
  return Array.isArray(stat) ? stat.map((s) => STAT_LABEL[s] ?? s).join(' + ') : (STAT_LABEL[stat] ?? stat);
}

/** „stat hodnota" pro jednostat i kombi: „nástroj 4" / „nástroj 4, improvizace 2". */
function statSHodnotou(stat, hodnota) {
  if (Array.isArray(stat)) {
    return stat.map((s, i) => `${STAT_LABEL[s] ?? s} ${Array.isArray(hodnota) ? hodnota[i] : '?'}`).join(', ');
  }
  return `${STAT_LABEL[stat] ?? stat} ${hodnota ?? '?'}`;
}

function nazevVeci(k, kartaId) {
  return k.ctx.veci?.[kartaId] ?? kartaId ?? 'neobsazeno';
}

function jmenoHrace(k, hracId) {
  return k.ctx.jmena?.[hracId] ?? hracId ?? 'nikdo';
}

/**
 * Handlery per typ události. Prázdné pole = událost vědomě BEZ anotace
 * (§5 návrhu) — musí tu ale být, aby nespadla do `neznama`.
 * @type {Record<string, (e: object, k: ReturnType<typeof novaKniha>) => Anotace[]>}
 */
const HANDLERS = {
  // run_started anotaci nenese (vysvětluje ho setup obrazovka), ale zakládá
  // knihu: jméno pronásledovatele a co ruší potřebují pozdější anotace slotů.
  [EVENT.RUN_STARTED]: (e, k) => {
    k.pronasledovatel = k.ctx.pronasledovatele?.[e.pronasledovatel] ?? e.pronasledovatel;
    k.rusi = e.rusi ?? null;
    return [];
  },
  // Akt hráče; učení nese telegraf_derived před ním.
  [EVENT.COMMIT]: () => [],
  // Akt hráče; dopad vysvětluje slot_resolved.
  [EVENT.ASSIGNMENT]: () => [],
  // Čistě měřicí událost (ADR-010) — anotaci nenese.
  [EVENT.ASSIGN_CONTEXT]: () => [],

  // JÁDRO UČENÍ: práh se rozepisuje na stálou (naučitelnou) kotvu a per-instance šum.
  [EVENT.SITUATION_REVEALED]: (e, k) => {
    k.situaceUzlu.set(e.nodeIndex, e.situace_id);
    return e.sloty.map((s) => ({
      misto: MISTO.SLOT,
      slot_index: s.slot_index,
      veta: `${s.role}: práh ${s.prah} = kotva ${s.kotva} ${s.sum === 0 ? 'bez šumu' : znamenko(s.sum)}.`,
      detail: [
        `Chce ${popisStatu(s.stat)}${s.typ_prahu === 'kombi_oba' ? ' (OBA staty)' : ''}`,
        s.viditelnost === 'skryta' ? 'skrytá role — telegraf ji hlásil jen počtem' : 'viditelná role',
        s.stitek_citlivy ? `výjimka ze štítku: ${s.stitek_citlivy} projde i na očích` : null,
        'Kotva je stálá a naučitelná, šum se dorolí u každé instance zvlášť.',
      ].filter(Boolean).join(' · '),
    }));
  },

  [EVENT.SLOT_RESOLVED]: (e, k) => {
    const vec = nazevVeci(k, e.karta_id);
    const zaklad = { misto: MISTO.SLOT, slot_index: e.slot_index, razitko: e.zasah ? 'PROŠLO' : 'NEPROŠLO' };
    const kdo = `„${vec}" — ${jmenoHrace(k, e.hrac_id)}`;
    switch (e.duvod) {
      case 'proslo':
        return [{ ...zaklad, veta: `${statSHodnotou(e.stat, e.stat_hodnota)} proti prahu ${e.prah}.`, detail: kdo }];
      case 'nizky_stat':
        return [{ ...zaklad, veta: `Chtělo to ${popisStatu(e.stat)} ${e.prah}, „${vec}" má ${e.stat_hodnota}.`, detail: kdo }];
      case 'kombi_neuplny':
        return [{ ...zaklad, veta: `Kombi slot chce OBA staty nad práh ${e.prah}: „${vec}" má ${statSHodnotou(e.stat, e.stat_hodnota)}.`, detail: kdo }];
      case 'stat_zrusen':
        return [{
          ...zaklad,
          veta: `${k.pronasledovatel ?? 'Pronásledovatel'} ruší ${popisStatu(e.stat)} — „${vec}" se počítá jako 0 proti prahu ${e.prah}.`,
          detail: `${kdo} · Rušení platí v celém runu, ne jen v tomhle slotu.`,
        }];
      case 'gangster_auto_fail':
        return [{
          ...zaklad,
          veta: `„${vec}" je zbraň ve viditelné roli — padá bez ohledu na staty.`,
          detail: `${kdo} · Telegraf to hlásil předem: zbraň na očích tady neprojde.`,
        }];
      case 'neobsazeno':
        return [{
          ...zaklad,
          veta: 'Slot nikdo neobsadil — složená postava necommituje.',
          detail: 'Co se nedostane do slotu, propadá automaticky.',
        }];
      default:
        return [{ ...zaklad, veta: `Slot vyhodnocen (${e.duvod}).`, detail: kdo }];
    }
  },
};

/**
 * Typy událostí, které vrstva umí přeložit. Testuje se proti `EVENT` — bez
 * toho by tripwire byl slepý u událostí, jejichž handler vrací prázdno.
 */
export const TYPY_S_HANDLEREM = Object.keys(HANDLERS);
