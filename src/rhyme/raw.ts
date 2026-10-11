/**
 * 原始韵表数据（vendored）。
 * 平水韵/词林正韵/中华新韵来自 charlesix59/chinese_word_rhyme（MIT）。
 * 广韵声调表由 LingDong-/cope（ISC）数据整理，仅用于平仄兜底，扩大生僻字覆盖。
 * 以静态方式引入，供打包器内联；类型以本地接口约束，避免暴露庞大字面量类型。
 */
import pingshuiRaw from '../../data/Pingshui_Rhyme.json'
import cilinRaw from '../../data/Cilin_Rhyme.json'
import xinyunRaw from '../../data/Xinyun_Rhyme.json'
import guangyunRaw from '../../data/Guangyun_Tone.json'

/** 平水韵：声部 -> 韵部 -> 字数组。声部如“上平声部/下平声部/上声部/去声部/入声部”。 */
export type PingshuiRaw = Record<string, Record<string, string[]>>
/** 词林正韵：第N部 -> {平声|仄声} -> 字数组。 */
export type CilinRaw = Record<string, Record<string, string[]>>
/** 中华新韵：韵名 -> {平|仄} -> 字数组。 */
export type XinyunRaw = Record<string, Record<string, string[]>>
/** 广韵声调表：字 -> '平'|'仄'|'多'（仅平仄，用于兜底）。 */
export type GuangyunToneRaw = Record<string, string>

export const pingshuiData = pingshuiRaw as unknown as PingshuiRaw
export const cilinData = cilinRaw as unknown as CilinRaw
export const xinyunData = xinyunRaw as unknown as XinyunRaw
export const guangyunData = guangyunRaw as unknown as GuangyunToneRaw
