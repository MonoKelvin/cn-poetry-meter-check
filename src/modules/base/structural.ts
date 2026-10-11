/**
 * 句内与谋篇结构检测：失替（句内）、失对（联内）、失粘（联间）。
 */
import { describePosition, MESSAGES } from '../../core/messages'
import { type AnalysisContext, definiteTone, makePos } from './context'

/** 失替：同一句相邻节奏点平仄须交替。 */
export function detectTi(ctx: AnalysisContext): void {
  const rp = ctx.rhythm
  for (const line of ctx.parsed.lines) {
    for (let k = 1; k < rp.length; k++) {
      const a = line.chars[rp[k - 1]]
      const b = line.chars[rp[k]]
      if (!a || !b) continue
      const ta = definiteTone(a)
      const tb = definiteTone(b)
      if (ta && tb && ta === tb) {
        const pos = makePos(line, rp[k])
        ctx.issues.push({ level: 'error', category: 'ti', position: pos, message: MESSAGES.shiti(describePosition(pos)) })
      }
    }
  }
}

/** 失对：同一联出句与对句对应节奏点平仄须相反。 */
export function detectDui(ctx: AnalysisContext): void {
  const rp = ctx.rhythm
  const lines = ctx.parsed.lines
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const chu = lines[i]
    const dui = lines[i + 1]
    if (!chu || !dui) continue
    for (const p of rp) {
      const a = chu.chars[p]
      const b = dui.chars[p]
      if (!a || !b) continue
      const ta = definiteTone(a)
      const tb = definiteTone(b)
      if (ta && tb && ta === tb) {
        const pos = makePos(dui, p)
        ctx.issues.push({ level: 'error', category: 'dui', position: pos, message: MESSAGES.shidui(describePosition(pos)) })
      }
    }
  }
}

/** 失粘：后联出句第二字平仄须与前联对句第二字相同。 */
export function detectNian(ctx: AnalysisContext): void {
  const lines = ctx.parsed.lines
  for (let i = 2; i < lines.length; i += 2) {
    const cur = lines[i]
    const prevDui = lines[i - 1]
    if (!cur || !prevDui) continue
    const a = cur.chars[1]
    const b = prevDui.chars[1]
    if (!a || !b) continue
    const ta = definiteTone(a)
    const tb = definiteTone(b)
    if (ta && tb && ta !== tb) {
      const pos = makePos(cur, 1)
      ctx.issues.push({ level: 'error', category: 'nian', position: pos, message: MESSAGES.shinian(describePosition(pos)) })
    }
  }
}
