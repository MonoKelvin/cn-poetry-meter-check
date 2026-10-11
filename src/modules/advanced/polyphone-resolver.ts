/** 多音字消歧：以大模型（SKILL 驱动）在上下文中确定读音与平仄。 */
import { z } from 'zod'
import type { Tone } from '../../core/types'
import type { LlmClient } from '../ai/types'
import type { PolyphoneResolution, PolyphoneResolver } from './types'

const SCHEMA = z.object({
  char: z.string(),
  chosen: z.object({ group: z.string(), tone: z.string() }),
  confidence: z.number(),
  reason: z.string(),
})

function toTone(label: string): Tone {
  if (label.includes('平')) return 'level'
  if (label.includes('仄') || label.includes('上') || label.includes('去') || label.includes('入')) return 'oblique'
  return 'unknown'
}

export class LlmPolyphoneResolver implements PolyphoneResolver {
  constructor(
    private readonly client: LlmClient,
    private readonly skill: string,
  ) {}

  async resolve(char: string, line: string, position: number): Promise<PolyphoneResolution | null> {
    const user = `char=${char}；line=${line}；position=${position}`
    try {
      const out = await this.client.chatJson(
        [
          { role: 'system', content: this.skill },
          { role: 'user', content: user },
        ],
        SCHEMA,
      )
      return {
        char: out.char,
        chosen: { group: out.chosen.group, tone: toTone(out.chosen.tone) },
        confidence: out.confidence,
        reason: out.reason,
      }
    } catch {
      return null
    }
  }
}
