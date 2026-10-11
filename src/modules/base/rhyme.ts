/**
 * 押韵检测：推断主韵部，校验韵脚同部、当押未押、落韵、重韵，并检查白脚当仄。
 */
import { describePosition, MESSAGES } from '../../core/messages'
import { type AnalysisContext, definiteTone, makePos } from './context'

export function detectRhyme(ctx: AnalysisContext): void {
  const { parsed, pattern } = ctx
  const lines = parsed.lines

  // 白脚：非韵脚句的句末应为仄声
  lines.forEach((line, i) => {
    const last = line.chars[line.length - 1]
    if (!last || pattern.lines[i]?.rhyme) return
    if (definiteTone(last) === 'level') {
      const pos = makePos(line, line.length - 1)
      ctx.issues.push({ level: 'warning', category: 'pingze', position: pos, message: MESSAGES.baijiao(describePosition(pos)) })
    }
  })

  // 收集韵脚行
  const rhymeIdx: number[] = []
  lines.forEach((_, i) => {
    if (pattern.lines[i]?.rhyme) rhymeIdx.push(i)
  })

  // 推断主韵部：取各韵脚字的平声韵部众数
  const count = new Map<string, { label: string; n: number }>()
  for (const i of rhymeIdx) {
    const last = lines[i]?.chars[(lines[i] as { length: number }).length - 1]
    if (!last) continue
    for (const g of last.info.groups) {
      if (g.tone !== 'level') continue
      const e = count.get(g.id) ?? { label: g.label, n: 0 }
      e.n++
      count.set(g.id, e)
    }
  }
  let mainId: string | undefined
  let mainLabel = ''
  let best = 0
  for (const [id, e] of count) {
    if (e.n > best) {
      best = e.n
      mainId = id
      mainLabel = e.label
    }
  }
  if (mainId) ctx.inferred = { id: mainId, label: mainLabel }

  // 逐一校验韵脚
  const used = new Set<string>()
  for (const i of rhymeIdx) {
    const line = lines[i]
    if (!line) continue
    const last = line.chars[line.length - 1]
    if (!last) continue
    const pos = makePos(line, line.length - 1)
    if (definiteTone(last) === 'oblique') {
      ctx.issues.push({ level: 'error', category: 'rhyme', position: pos, message: MESSAGES.rhymeShouldRhyme(describePosition(pos)) })
      continue
    }
    if (mainId && !last.info.groups.some((g) => g.id === mainId)) {
      // 首句可借邻韵（孤雁出群格），从宽作警告；其余为落韵错误
      const level = i === 0 ? 'warning' : 'error'
      ctx.issues.push({ level, category: 'rhyme', position: pos, message: MESSAGES.rhymeMismatch(describePosition(pos), mainLabel) })
    }
    if (used.has(last.char)) {
      ctx.issues.push({ level: 'warning', category: 'rhyme', position: pos, message: MESSAGES.rhymeDuplicate(describePosition(pos)) })
    }
    used.add(last.char)
  }
}
