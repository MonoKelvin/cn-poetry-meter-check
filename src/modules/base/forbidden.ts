/**
 * 禁忌检测：孤平（仅平脚 B 型韵句）、三平调（大忌）、三仄尾（瑕疵）。
 */
import { describePosition, MESSAGES } from '../../core/messages'
import { type AnalysisContext, definiteTone, makePos } from './context'

/** 孤平：平脚“…仄平”型韵句除韵脚外仅余一个（可）平声（王力说）。 */
export function detectGuping(ctx: AnalysisContext): void {
  ctx.pattern.lines.forEach((mp, i) => {
    if (!mp.rhyme) return // 仅韵句
    const n = mp.tones.length
    if (mp.tones[n - 2] !== 'oblique') return // 排除“…平平”收尾的 D 型（仄仄仄平平）
    const line = ctx.parsed.lines[i]
    if (!line) return
    let levels = 0
    for (let j = 0; j < n - 1; j++) {
      const ch = line.chars[j]
      if (ch && ch.canLevel) levels++
    }
    if (levels <= 1) {
      const pos = makePos(line, 0)
      ctx.issues.push({ level: 'error', category: 'guping', position: pos, message: MESSAGES.guping(describePosition(pos)) })
    }
  })
}

/** 三平调（句末三连平，大忌）与三仄尾（句末三连仄，瑕疵）。 */
export function detectSanping(ctx: AnalysisContext): void {
  for (const line of ctx.parsed.lines) {
    const n = line.length
    if (n < 3) continue
    const last3 = [line.chars[n - 3], line.chars[n - 2], line.chars[n - 1]]
    if (last3.every((c) => !!c && definiteTone(c) === 'level')) {
      const pos = makePos(line, n - 1)
      ctx.issues.push({ level: 'error', category: 'sanping', position: pos, message: MESSAGES.sanping(describePosition(pos)) })
    } else if (last3.every((c) => !!c && definiteTone(c) === 'oblique')) {
      const pos = makePos(line, n - 1)
      ctx.issues.push({
        level: ctx.options.strictness === 'loose' ? 'info' : 'warning',
        category: 'sanze',
        position: pos,
        message: MESSAGES.sanze(describePosition(pos)),
      })
    }
  }
}
