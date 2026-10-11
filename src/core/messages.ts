/**
 * 面向用户的中文文案集中管理：平仄标签、位置描述与各类问题模板。
 */
import type { IssuePosition, Tone } from './types'

export const TONE_LABEL: Record<Tone, string> = {
  level: '平',
  oblique: '仄',
  either: '中',
  unknown: '未录',
}

const COUPLET_NAMES = ['首联', '颔联', '颈联', '尾联']

/** 生成“颔联对句第3字“长””式的位置描述。 */
export function describePosition(pos: IssuePosition): string {
  const couplet = COUPLET_NAMES[pos.couplet - 1] ?? `第${pos.couplet}联`
  const role = pos.role === 'chu' ? '出句' : '对句'
  return `${couplet}${role}第${pos.charIndex + 1}字“${pos.char}”`
}

export const MESSAGES = {
  formNotRecognized:
    '无法识别为近体诗：需为 4 句（绝句）或 8 句（律诗），每句 5 或 7 字且各句等长。',
  formLineLength: (lineNo: number, len: number, expected: number) =>
    `第 ${lineNo} 句为 ${len} 字，与标准 ${expected} 字不符。`,
  toneNotFound: (char: string) => `“${char}”未被所选韵表收录，平仄暂按通融处理。`,
  shiti: (where: string) => `${where} 失替：本句节奏点（二四六字）平仄未交替。`,
  shidui: (where: string) => `${where} 失对：与出句对应节奏点平仄未相反。`,
  shinian: (where: string) => `${where} 失粘：与上一联对句第二字平仄未相粘。`,
  baijiao: (where: string) => `${where} 白脚：出句句末应为仄声。`,
  guping: (where: string) => `${where} 犯孤平：平收句中除韵脚外仅余一个平声。`,
  sanping: (where: string) => `${where} 三平调（三平尾）：句末三字连平，为近体大忌。`,
  sanze: (where: string) => `${where} 三仄尾：句末三字连仄，视为瑕疵。`,
  rhymeMismatch: (where: string, group: string) =>
    `${where} 落韵：韵脚与全诗所押“${group}”不属同一韵部。`,
  rhymeDuplicate: (where: string) => `${where} 重韵：同一字重复用作韵脚。`,
  rhymeShouldRhyme: (where: string) => `${where} 当入韵而未入韵（句末应为平声韵脚）。`,
  aojiu: (where: string) => `${where} 已拗救：属正常补救，不计为出律。`,
  polyphone: (char: string, detail: string) => `多音字“${char}”：${detail}`,
} as const
