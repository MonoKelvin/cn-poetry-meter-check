/**
 * 检测上下文与通用辅助：所有基础检测器共享此上下文并向 issues 追加结论。
 */
import type { CheckOptions, Issue, IssuePosition, PoemFormInfo, Tone } from '../../core/types'
import type { ParsedPoem, PoemChar, PoemLine } from '../../core/poem'
import type { MeterPattern } from '../../core/meter-pattern'
import type { RhymeTable } from '../../rhyme/rhyme-table'

export interface AnalysisContext {
  parsed: ParsedPoem
  pattern: MeterPattern
  form: PoemFormInfo
  rhyme: RhymeTable
  options: Required<CheckOptions>
  /** 节奏点字序（五言 [1,3]，七言 [1,3,5]）。 */
  rhythm: readonly number[]
  /** 每句字数。 */
  lineLength: number
  /** 推断出的主韵部。 */
  inferred?: { id: string; label: string }
  issues: Issue[]
}

/** 检测器：读取上下文并向 ctx.issues 追加（或调整）结论。 */
export type Detector = (ctx: AnalysisContext) => void

export function makePos(line: PoemLine, charIndex: number): IssuePosition {
  const ch = line.chars[charIndex]
  return {
    lineIndex: line.index,
    couplet: line.couplet,
    role: line.role,
    charIndex,
    char: ch ? ch.char : '',
  }
}

/** 确定平仄：仅平→level，仅仄→oblique，两可/未录→undefined（通融，不据以判错）。 */
export function definiteTone(ch: PoemChar): Tone | undefined {
  if (ch.canLevel && !ch.canOblique) return 'level'
  if (ch.canOblique && !ch.canLevel) return 'oblique'
  return undefined
}
