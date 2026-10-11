/**
 * 格律谱生成：由四个基本律句句型，依“对（联内相反）/ 粘（联间相同）”推导整诗标准平仄谱。
 * 不写死 16 个谱串，而由规则生成。
 */
import { FORM_LINE_COUNT, FORM_LINE_LENGTH, RHYTHM_POSITIONS } from './constants'
import type { FormVariant, PoemFormId, Tone } from './types'
import type { ParsedPoem } from './poem'

type Label = 'A' | 'B' | 'C' | 'D'

/** 五言四基本句型。 */
const BASE5: Record<Label, Tone[]> = {
  A: ['oblique', 'oblique', 'level', 'level', 'oblique'], // 仄仄平平仄 仄起仄收
  B: ['level', 'level', 'oblique', 'oblique', 'level'], // 平平仄仄平 平起平收(韵)
  C: ['level', 'level', 'level', 'oblique', 'oblique'], // 平平平仄仄 平起仄收
  D: ['oblique', 'oblique', 'oblique', 'level', 'level'], // 仄仄仄平平 仄起平收(韵)
}
/** 对：出句 -> 对句（联内节奏点相反、对句平收）。 */
const DUI: Record<Label, Label> = { A: 'B', B: 'D', C: 'D', D: 'B' }
/** 粘：对句 -> 下一出句（第二字相粘、出句仄收）。 */
const NIAN: Partial<Record<Label, Label>> = { B: 'C', D: 'A' }

function firstLabel(v: FormVariant): Label {
  if (v.start === 'level') return v.firstLineRhymes ? 'B' : 'C'
  return v.firstLineRhymes ? 'D' : 'A'
}

function toSeven(base5: Tone[]): Tone[] {
  const prefix: Tone = base5[0] === 'level' ? 'oblique' : 'level'
  return [prefix, prefix, ...base5]
}

export interface MeterLine {
  tones: Tone[]
  /** 该句句末是否为韵脚。 */
  rhyme: boolean
}
export interface MeterPattern {
  formId: PoemFormId
  variant: FormVariant
  lines: MeterLine[]
}

/** 由诗体与变体生成标准平仄谱。 */
export function buildPattern(formId: PoemFormId, variant: FormVariant): MeterPattern {
  const count = FORM_LINE_COUNT[formId]
  const len = FORM_LINE_LENGTH[formId]
  const labels: Label[] = [firstLabel(variant)]
  for (let i = 1; i < count; i++) {
    const prev = labels[i - 1]
    labels[i] = i % 2 === 1 ? DUI[prev] : (NIAN[prev] ?? prev)
  }
  const lines: MeterLine[] = labels.map((lab, i) => ({
    tones: len === 7 ? toSeven(BASE5[lab]) : BASE5[lab].slice(),
    rhyme: i % 2 === 1 || (i === 0 && variant.firstLineRhymes),
  }))
  return { formId, variant, lines }
}

/** 据各句字数与句数识别诗体；不符返回 null。 */
export function detectForm(lineLengths: number[]): PoemFormId | null {
  const n = lineLengths.length
  const len = lineLengths[0]
  if (len === undefined || !lineLengths.every((l) => l === len)) return null
  if (len === 5 && n === 4) return 'wujue'
  if (len === 5 && n === 8) return 'wulv'
  if (len === 7 && n === 4) return 'qijue'
  if (len === 7 && n === 8) return 'qilv'
  return null
}

/** 在四种变体中选取与实际最契合者（兼容多音字/未录字的通融）。 */
export function chooseVariant(parsed: ParsedPoem, formId: PoemFormId): MeterPattern {
  const len = FORM_LINE_LENGTH[formId]
  const positions = RHYTHM_POSITIONS[len]
  const combos: FormVariant[] = [
    { start: 'level', firstLineRhymes: false },
    { start: 'level', firstLineRhymes: true },
    { start: 'oblique', firstLineRhymes: false },
    { start: 'oblique', firstLineRhymes: true },
  ]
  let best: { score: number; pattern: MeterPattern } | undefined
  for (const v of combos) {
    const pattern = buildPattern(formId, v)
    let score = 0
    for (let i = 0; i < pattern.lines.length; i++) {
      const line = parsed.lines[i]
      if (!line) continue
      const checkPos = [...positions, line.length - 1]
      for (const p of checkPos) {
        const want = pattern.lines[i].tones[p]
        const ch = line.chars[p]
        if (!ch || !want) continue
        if ((want === 'level' && ch.canLevel) || (want === 'oblique' && ch.canOblique)) score++
      }
    }
    if (!best || score > best.score) best = { score, pattern }
  }
  return best!.pattern
}
