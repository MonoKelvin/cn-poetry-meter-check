/**
 * 基础检测编排：解析 → 识别诗体 → 匹配标准谱 → 职责链检测 → 汇总结果。
 */
import {
  DEFAULT_RHYME_BOOK,
  FORM_LINE_LENGTH,
  FORM_NAMES,
  RHYTHM_POSITIONS,
} from '../../core/constants'
import { MESSAGES } from '../../core/messages'
import { chooseVariant, detectForm } from '../../core/meter-pattern'
import type { MeterPattern } from '../../core/meter-pattern'
import { parsePoem } from '../../core/poem'
import type { ParsedPoem, PoemChar } from '../../core/poem'
import type {
  CharCell,
  CheckOptions,
  CheckResult,
  Issue,
  LineCells,
  PoemFormInfo,
  RhymeBookId,
  Tone,
} from '../../core/types'
import { getRhymeTable } from '../../rhyme/registry'
import type { AnalysisContext } from './context'
import { detectDui, detectNian, detectTi } from './structural'
import { detectGuping, detectSanping } from './forbidden'
import { detectRhyme } from './rhyme'
import { detectPolyphone } from './polyphone'
import { detectUnknownTone } from './coverage'
import { detectAojiu } from './aojiu'

/** 展示用平仄：未录→unknown，仅平→level，仅仄→oblique，否则两可→either。 */
function displayTone(ch: PoemChar): Tone {
  if (ch.info.tones.length === 1 && ch.info.tones[0] === 'unknown') return 'unknown'
  if (ch.canLevel && !ch.canOblique) return 'level'
  if (ch.canOblique && !ch.canLevel) return 'oblique'
  return 'either'
}

function buildCells(parsed: ParsedPoem, pattern?: MeterPattern): LineCells[] {
  return parsed.lines.map((line, i) => ({
    lineIndex: line.index,
    couplet: line.couplet,
    role: line.role,
    cells: line.chars.map((ch, j): CharCell => {
      const mp = pattern?.lines[i]
      return {
        char: ch.char,
        tone: displayTone(ch),
        expected: mp?.tones[j],
        isRhyme: !!mp?.rhyme && j === line.length - 1,
      }
    }),
  }))
}

function finalize(
  form: PoemFormInfo | undefined,
  rhymeBook: RhymeBookId,
  inferred: { label: string } | undefined,
  issues: Issue[],
  lines: LineCells[],
): CheckResult {
  const stats = { errors: 0, warnings: 0, infos: 0 }
  for (const i of issues) {
    if (i.level === 'error') stats.errors++
    else if (i.level === 'warning') stats.warnings++
    else stats.infos++
  }
  return {
    form,
    rhymeBook,
    inferredRhymeGroup: inferred?.label,
    passed: stats.errors === 0,
    issues,
    stats,
    lines,
  }
}

/** 对输入诗作执行基础格律检测。pins 可固定多音字读音用于消歧后复检。 */
export function analyze(
  text: string,
  options: CheckOptions = {},
  pins: Record<string, Tone> = {},
): CheckResult {
  const opts: Required<CheckOptions> = {
    form: options.form ?? 'auto',
    rhymeBook: options.rhymeBook ?? DEFAULT_RHYME_BOOK,
    strictness: options.strictness ?? 'normal',
  }
  const rhyme = getRhymeTable(opts.rhymeBook)
  const parsed = parsePoem(text, rhyme, pins)

  const formId = opts.form === 'auto' ? detectForm(parsed.lineLengths) : opts.form
  if (!formId) {
    return finalize(
      undefined,
      opts.rhymeBook,
      undefined,
      [{ level: 'error', category: 'form', message: MESSAGES.formNotRecognized }],
      buildCells(parsed),
    )
  }

  const lineLength = FORM_LINE_LENGTH[formId]
  const pattern = chooseVariant(parsed, formId)
  const form: PoemFormInfo = {
    id: formId,
    name: FORM_NAMES[formId],
    variant: {
      start: pattern.lines[0].tones[1] === 'level' ? 'level' : 'oblique',
      firstLineRhymes: pattern.lines[0].rhyme,
    },
  }

  const ctx: AnalysisContext = {
    parsed,
    pattern,
    form,
    rhyme,
    options: opts,
    rhythm: RHYTHM_POSITIONS[lineLength],
    lineLength,
    issues: [],
  }

  // 职责链：替 → 对 → 粘 → 押韵 → 孤平 → 三平/三仄 → 拗救(后处理) → 多音字
  detectTi(ctx)
  detectDui(ctx)
  detectNian(ctx)
  detectRhyme(ctx)
  detectGuping(ctx)
  detectSanping(ctx)
  detectAojiu(ctx)
  detectPolyphone(ctx)
  detectUnknownTone(ctx)

  return finalize(form, opts.rhymeBook, ctx.inferred, ctx.issues, buildCells(parsed, pattern))
}
