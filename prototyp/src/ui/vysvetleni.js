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
import { STAT_LABEL, STAT_LABEL_4, znamenko, BAND_LABEL, KATEGORIE_LABEL } from './labels.js';

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
    /** hrac_id → aktivní trvalé postihy (pro řetězec: kde vznikly). */
    aktivniPostihy: /** @type {Map<string, {postih_id: string, druh: string, seq: number, nodeIndex: number}[]>} */ (new Map()),
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

/** Název statu ve 4. pádě (jednostat i kombi) — pro vazby „chce / ruší / chtělo to". */
function popisStatu4(stat) {
  return Array.isArray(stat) ? stat.map((s) => STAT_LABEL_4[s] ?? s).join(' a ') : (STAT_LABEL_4[stat] ?? stat);
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

function nazevPostihu(k, postihId) {
  return k.ctx.postihy?.[postihId] ?? postihId;
}

/** Popis uzlu pro zpětný odkaz: „uzel 3 — Brod u farmy". */
function popisUzlu(k, nodeIndex) {
  const situaceId = k.situaceUzlu.get(nodeIndex);
  const label = situaceId ? (k.ctx.situace?.[situaceId] ?? situaceId) : null;
  return label ? `uzel ${nodeIndex} — ${label}` : `uzel ${nodeIndex}`;
}

/** Co postih dělá, česky — uzavřený enum efektů (rules.POSTIH_EFEKTY). */
function popisEfektu(efekt) {
  switch (efekt?.druh) {
    case 'hide_staty': return 'vlastník vidí názvy věcí, ne jejich staty';
    case 'hide_telegraf': return 'vlastník nevidí telegraf příští situace — commituje naslepo';
    case 'hide_viditelnost': return 'vlastník nevidí, které role jsou skryté';
    case 'lock_stitek': return `co má štítek ${efekt.stitek}, vlastníkovi ve slotu propadne`;
    case 'lock_slot_viditelnost': return `do ${efekt.viditelnost === 'skryta' ? 'skryté role' : 'viditelné role'} vlastník nic neprosadí`;
    case 'lock_gamble': return 'tým nesmí použít gamble, dokud postih drží';
    case 'ztrata_kreditu': return `týmu ubylo ${efekt.kolik ?? 1} kreditů`;
    case 'ztrata_karty': return `vlastník odhodil ${efekt.kolik ?? 1} věcí z ruky`;
    case 'ztrata_naklad': return `týmu ubyly ${efekt.kolik ?? 1} bedny nákladu`;
    case 'ruka_minus': return `vlastník má o ${efekt.kolik ?? 1} menší ruku`;
    default: return 'efekt neznámý';
  }
}

/**
 * Najde aktivní postih hráče podle druhu efektu (pro zpětný odkaz auto-failu).
 * Cap postihů je 2 a obsah dovoluje mít dva aktivní postihy se STEJNÝM druhem
 * efektu zároveň (např. „nervy-v-hajzlu" + „ochrnutá ruka" oba lock_stitek).
 * Odkazujeme na NEJNOVĚJŠÍ shodu (`findLast`) — u stolu si hráč nejlíp
 * pamatuje postih, který schytal naposledy, ne ten nejstarší.
 */
function najdiPostih(k, hracId, druh) {
  return (k.aktivniPostihy.get(hracId) ?? []).findLast((p) => p.druh === druh) ?? null;
}

/** Odebere postih z knihy (vypršel / vyléčen / smazán složením). */
function odeberPostih(k, hracId, postihId) {
  const seznam = k.aktivniPostihy.get(hracId);
  if (!seznam) return;
  k.aktivniPostihy.set(hracId, seznam.filter((p) => p.postih_id !== postihId));
}

/** Skloňování slova „kolo" podle počtu (čeština: 1 kolo, 2–4 kola, 5 a víc kol). */
function pocetKol(n) {
  if (n === 1) return `${n} kolo`;
  if (n >= 2 && n <= 4) return `${n} kola`;
  return `${n} kol`;
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
        `Chce ${popisStatu4(s.stat)}${s.typ_prahu === 'kombi_oba' ? ' (OBA staty)' : ''}`,
        s.viditelnost === 'skryta' ? 'skrytá role — telegraf ji hlásil jen počtem' : 'viditelná role',
        s.stitek_citlivy ? `výjimka ze štítku: ${s.stitek_citlivy} projde i na očích` : null,
        'Kotva je stálá a naučitelná, šum se dorolí u každé instance zvlášť.',
      ].filter(Boolean).join(' · '),
    }));
  },

  [EVENT.SLOT_RESOLVED]: (e, k) => {
    const zaklad = { misto: MISTO.SLOT, slot_index: e.slot_index, razitko: e.zasah ? 'PROŠLO' : 'NEPROŠLO' };
    if (e.duvod === 'neobsazeno') {
      return [{
        ...zaklad,
        veta: 'Slot nikdo neobsadil — automatický propad.',
        detail: 'Do slotu se nedostala žádná věc: buď je postava složená, nebo měla postihem zmenšenou ruku a committnula míň karet.',
      }];
    }
    const vec = nazevVeci(k, e.karta_id);
    const kdo = `„${vec}" — ${jmenoHrace(k, e.hrac_id)}`;
    switch (e.duvod) {
      case 'proslo':
        return [{ ...zaklad, veta: `${statSHodnotou(e.stat, e.stat_hodnota)} proti prahu ${e.prah}.`, detail: kdo }];
      case 'nizky_stat':
        return [{ ...zaklad, veta: `Chtělo to ${popisStatu4(e.stat)} ${e.prah}, „${vec}" má ${e.stat_hodnota}.`, detail: kdo }];
      case 'kombi_neuplny':
        return [{ ...zaklad, veta: `Kombi slot chce OBA staty nad práh ${e.prah}: „${vec}" má ${statSHodnotou(e.stat, e.stat_hodnota)}.`, detail: kdo }];
      case 'stat_zrusen':
        return [{
          ...zaklad,
          veta: `${k.pronasledovatel ?? 'Pronásledovatel'} ruší ${popisStatu4(e.stat)} — „${vec}" se počítá jako 0 proti prahu ${e.prah}.`,
          detail: `${kdo} · Rušení platí v celém runu, ne jen v tomhle slotu.`,
        }];
      case 'gangster_auto_fail':
        return [{
          ...zaklad,
          veta: `„${vec}" je zbraň ve viditelné roli — padá bez ohledu na staty.`,
          detail: `${kdo} · Telegraf to hlásil předem: zbraň na očích tady neprojde.`,
        }];
      case 'postih_lock_stitek':
      case 'postih_lock_viditelnost': {
        const zdroj = najdiPostih(k, e.hrac_id, e.postih_efekt);
        const nazev = zdroj ? nazevPostihu(k, zdroj.postih_id) : 'Postih';
        const veta = e.duvod === 'postih_lock_stitek'
          ? `${nazev} — zbraň v ruce neudržíš, „${vec}" propadá bez ohledu na staty.`
          : `${nazev} — do ${e.viditelnost === 'skryta' ? 'skryté' : 'viditelné'} role nic neprosadíš, „${vec}" propadá.`;
        return [{
          ...zaklad,
          veta,
          detail: `${kdo} · Zámkový postih je tvrdé pravidlo nad staty, stejná třída jako štítek.`,
          ...(zdroj ? { odkaz: { seq: zdroj.seq, popis: popisUzlu(k, zdroj.nodeIndex) } } : {}),
        }];
      }
      default:
        return [{ ...zaklad, veta: `Slot vyhodnocen (${e.duvod}).`, detail: kdo }];
    }
  },

  [EVENT.PENALTY_ADDED]: (e, k) => {
    // „ihned" postihy se jen provedou a zmizí — do knihy aktivních nepatří.
    if (e.vyprsi_za !== 'ihned') {
      const seznam = k.aktivniPostihy.get(e.hrac_id) ?? [];
      seznam.push({ postih_id: e.postih_id, druh: e.efekt?.druh, seq: e.seq, nodeIndex: e.nodeIndex });
      k.aktivniPostihy.set(e.hrac_id, seznam);
    }
    const trvani = e.tier === 'tezky' ? 'drží do vyléčení v motelu' : e.vyprsi_za === 'ihned' ? 'jednorázově' : `vyprší za ${pocetKol(e.vyprsi_za)}`;
    return [{
      misto: MISTO.SPIS,
      veta: `Za ${BAND_LABEL[e.pricina] ?? e.pricina}: ${jmenoHrace(k, e.hrac_id)} — ${nazevPostihu(k, e.postih_id)} (${e.tier === 'tezky' ? 'těžký' : 'lehký'}, ${KATEGORIE_LABEL[e.kategorie] ?? e.kategorie}).`,
      detail: `${popisEfektu(e.efekt)}; ${trvani}. Aktivních postihů: ${e.aktivnich_po}.`,
    }];
  },

  [EVENT.PENALTY_EXPIRED]: (e, k) => {
    odeberPostih(k, e.hrac_id, e.postih_id);
    return [{ misto: MISTO.SPIS, veta: `Postih „${nazevPostihu(k, e.postih_id)}" (${jmenoHrace(k, e.hrac_id)}) vypršel.` }];
  },

  [EVENT.PENALTY_HEALED]: (e, k) => {
    odeberPostih(k, e.hrac_id, e.postih_id);
    return [{
      misto: MISTO.SPIS,
      veta: `Postih „${nazevPostihu(k, e.postih_id)}" (${jmenoHrace(k, e.hrac_id)}) vyléčen v motelu za ${e.cena} kreditů.`,
      detail: 'Těžké postihy se jinak než v motelu nezbavíš — složení maže jen lehké.',
    }];
  },

  [EVENT.CHARACTER_FOLDED]: (e, k) => {
    for (const id of e.smazane_lehke ?? []) odeberPostih(k, e.hrac_id, id);
    return [{
      misto: MISTO.SPIS,
      veta: `${jmenoHrace(k, e.hrac_id)} se složil — třetí postih se nepřidává, postava kolo–dvě leží.`,
      detail: [
        `Smazáno (lehké): ${(e.smazane_lehke ?? []).map((id) => nazevPostihu(k, id)).join(', ') || 'nic'}`,
        `Zůstává (těžké): ${(e.pretrvavaji_tezke ?? []).map((id) => nazevPostihu(k, id)).join(', ') || 'nic'}`,
        'Složená postava necommituje — její sloty propadnou jako neobsazené.',
      ].join(' · '),
    }];
  },

  [EVENT.CHARACTER_RETURNED]: (e, k) => [{
    misto: MISTO.SPIS,
    veta: `${jmenoHrace(k, e.hrac_id)} se vrací do hry a zase committuje.`,
  }],
};

/**
 * Typy událostí, které vrstva umí přeložit. Testuje se proti `EVENT` — bez
 * toho by tripwire byl slepý u událostí, jejichž handler vrací prázdno.
 */
export const TYPY_S_HANDLEREM = Object.keys(HANDLERS);
