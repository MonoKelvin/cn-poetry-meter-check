/**
 * 多音字检测：仅在节奏点与韵脚等要位，对平仄两可的字给出歧义提示。
 */
import { describePosition, MESSAGES, TONE_LABEL } from '../../core/messages'
import { type AnalysisContext, makePos } from './context'

export function detectPolyphone(ctx: AnalysisContext): void {
  const { parsed, pattern, rhythm } = ctx
  parsed.lines.forEach((line, i) => {
    const mp = pattern.lines[i]
    if (!mp) return
    const positions = new Set<number>([...rhythm, line.length - 1])
    for (const j of positions) {
      const ch = line.chars[j]
      // 仅对“仍然两可”的多音字告警；已被定音（pins）的字视为消歧，不再提示。
      if (!ch || !ch.info.isPolyphone || !(ch.canLevel && ch.canOblique)) continue
      const want = mp.tones[j]
      if (!want) continue
      const other = want === 'level' ? 'oblique' : 'level'
      const groupsText = ch.info.groups.map((g) => `${g.label}（${TONE_LABEL[g.tone]}）`).join('、')
      const pos = makePos(line, j)
      ctx.issues.push({
        level: 'info',
        category: 'polyphone',
        position: pos,
        message: MESSAGES.polyphone(
          ch.char,
          `${describePosition(pos)}此处当${TONE_LABEL[want]}；该字可读 ${groupsText}，若取${TONE_LABEL[other]}则出律，请依诗意确认。`,
        ),
        meta: { groups: ch.info.groups, expected: want },
      })
    }
  })
}
