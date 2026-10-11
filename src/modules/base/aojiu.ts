/**
 * 拗救与常见变格识别（后处理）：
 * - 特拗（平平仄平仄 / 仄仄平平仄平仄）：公认变格，消除其诱发的失替/失对。
 * - 本句自救（孤平救）：发出“已拗救”提示。
 * - 对句相救（出句大拗由对句救）：消除出句大拗诱发的失替/失对，并提示已拗救。
 */
import { describePosition } from '../../core/messages'
import type { Issue } from '../../core/types'
import { type AnalysisContext, definiteTone, makePos } from './context'

function suppress(
  ctx: AnalysisContext,
  lineIndex: number,
  charIndex: number,
  categories: Issue['category'][],
): void {
  ctx.issues = ctx.issues.filter(
    (iss) =>
      !(
        !!iss.position &&
        iss.position.lineIndex === lineIndex &&
        iss.position.charIndex === charIndex &&
        categories.includes(iss.category)
      ),
  )
}

export function detectAojiu(ctx: AnalysisContext): void {
  const lines = ctx.parsed.lines
  const len = ctx.lineLength
  const daaoPos = len === 7 ? 5 : 3 // 出句大拗位：第6/第4字（标准为平）
  const duiJiuPos = len === 7 ? 4 : 2 // 对句相救位：第5/第3字（标准为仄）
  const benAaoPos = len === 7 ? 2 : 0 // 本句孤平位：第3/第1字
  const benJiuPos = len === 7 ? 4 : 2 // 本句自救位：第5/第3字

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const mp = ctx.pattern.lines[i]
    if (!line || !mp) continue
    const n = line.length

    // 特拗：仄收句句末三字为“仄平仄”（平平仄平仄 / 仄仄平平仄平仄），公认变格
    if (!mp.rhyme) {
      const a = definiteTone(line.chars[n - 3])
      const b = definiteTone(line.chars[n - 2])
      const c = definiteTone(line.chars[n - 1])
      if (a === 'oblique' && b === 'level' && c === 'oblique') {
        suppress(ctx, line.index, n - 2, ['ti', 'pingze'])
        const dui = lines[i + 1]
        if (dui) suppress(ctx, dui.index, n - 2, ['dui'])
        ctx.issues.push({
          level: 'info',
          category: 'aojiu',
          position: makePos(line, n - 2),
          message: `${describePosition(makePos(line, n - 2))}为“特拗”（平平仄平仄）变格，合律。`,
        })
        continue
      }
    }

    // 本句自救（孤平救）：B 型韵句拗位用仄、救位可平
    if (mp.rhyme && mp.tones[n - 2] === 'oblique') {
      const aao = line.chars[benAaoPos]
      const jiu = line.chars[benJiuPos]
      if (aao && jiu && definiteTone(aao) === 'oblique' && jiu.canLevel) {
        ctx.issues.push({
          level: 'info',
          category: 'aojiu',
          position: makePos(line, benJiuPos),
          message: `${describePosition(makePos(line, benAaoPos))}拗，${describePosition(makePos(line, benJiuPos))}本句自救，已合律。`,
        })
      }
    }

    // 对句相救：出句大拗（该平用仄）由对句救位（该仄而可平）相救
    if (i % 2 === 0) {
      const dui = lines[i + 1]
      if (!dui) continue
      const chuCh = line.chars[daaoPos]
      const duiCh = dui.chars[duiJiuPos]
      if (chuCh && duiCh && mp.tones[daaoPos] === 'level' && definiteTone(chuCh) === 'oblique' && duiCh.canLevel) {
        suppress(ctx, line.index, daaoPos, ['ti', 'pingze'])
        suppress(ctx, dui.index, daaoPos, ['dui'])
        ctx.issues.push({
          level: 'info',
          category: 'aojiu',
          position: makePos(dui, duiJiuPos),
          message: `${describePosition(makePos(line, daaoPos))}为拗，由${describePosition(makePos(dui, duiJiuPos))}对句相救，已合律。`,
        })
      }
    }
  }
}
