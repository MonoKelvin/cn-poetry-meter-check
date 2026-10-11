/**
 * 覆盖率检测：对所选韵表未收录的字，在要位（节奏点/韵脚）给出“韵书未录”提示，
 * 使覆盖缺口对用户透明（而非静默通融）。
 */
import { describePosition, MESSAGES } from '../../core/messages'
import { type AnalysisContext, makePos } from './context'

export function detectUnknownTone(ctx: AnalysisContext): void {
  const { parsed, rhythm } = ctx
  for (const line of parsed.lines) {
    const positions = new Set<number>([...rhythm, line.length - 1])
    for (const j of positions) {
      const ch = line.chars[j]
      if (!ch) continue
      if (ch.info.tones.length === 1 && ch.info.tones[0] === 'unknown') {
        const pos = makePos(line, j)
        ctx.issues.push({
          level: 'info',
          category: 'pingze',
          position: pos,
          message: `${describePosition(pos)}：${MESSAGES.toneNotFound(ch.char)}`,
        })
      }
    }
  }
}
