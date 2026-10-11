/** 推荐器实现：LLM 后端（SKILL 驱动）与桩实现。 */
import { z } from 'zod'
import { FORM_NAMES } from '../../core/constants'
import type { LlmClient } from '../ai/types'
import type { ComposeSpec, RecommendResult, Recommender, RecommendSkillName } from './types'

const REC_SCHEMA = z.object({
  recommendations: z.array(z.object({ text: z.string(), reason: z.string() })).default([]),
})

export class LlmRecommender implements Recommender {
  constructor(
    private readonly client: LlmClient,
    private readonly skills: Partial<Record<RecommendSkillName, string>> = {},
  ) {}

  private async run(name: RecommendSkillName, user: string): Promise<RecommendResult> {
    const skill = this.skills[name]
    if (!skill) return { recommendations: [], notImplemented: true }
    const out = await this.client.chatJson(
      [
        { role: 'system', content: skill },
        { role: 'user', content: user },
      ],
      REC_SCHEMA,
      { maxTokens: 2048 },
    )
    return { recommendations: out.recommendations ?? [] }
  }

  fixMeter(poem: string, note = ''): Promise<RecommendResult> {
    return this.run('recommend-fix-meter', `诗作：\n${poem}${note ? `\n已知问题：${note}` : ''}`)
  }

  fixDuizhang(chu: string, dui: string): Promise<RecommendResult> {
    return this.run('recommend-duizhang', `出句：${chu}\n对句：${dui}`)
  }

  composePoem(spec: ComposeSpec): Promise<RecommendResult> {
    const parts = [
      spec.title ? `题目：${spec.title}` : '',
      spec.form ? `体裁：${FORM_NAMES[spec.form]}` : '',
      spec.theme ? `题材：${spec.theme}` : '',
      spec.rhyme ? `用韵：${spec.rhyme}` : '',
      spec.requirement ? `要求：${spec.requirement}` : '',
    ].filter(Boolean)
    return this.run('compose-poem', parts.join('\n') || '请创作一首近体诗。')
  }

  completeLine(line: string, role: 'chu' | 'dui', context = ''): Promise<RecommendResult> {
    const which = role === 'chu' ? '为以下出句补对句' : '为以下对句补出句'
    return this.run('complete-line', `${which}：${line}${context ? `\n全诗：${context}` : ''}`)
  }

  fillChar(poem: string): Promise<RecommendResult> {
    return this.run('fill-char', `诗作（以〇或＿表示待填字）：\n${poem}`)
  }

  recommendEye(poem: string): Promise<RecommendResult> {
    return this.run('recommend-eye', `诗作：\n${poem}`)
  }
}

/** 桩实现：未配置 LLM 时所有方法返回“未实现”。 */
export class StubRecommender implements Recommender {
  private ni(): Promise<RecommendResult> {
    return Promise.resolve({ recommendations: [], notImplemented: true })
  }
  fixMeter(): Promise<RecommendResult> {
    return this.ni()
  }
  fixDuizhang(): Promise<RecommendResult> {
    return this.ni()
  }
  composePoem(): Promise<RecommendResult> {
    return this.ni()
  }
  completeLine(): Promise<RecommendResult> {
    return this.ni()
  }
  fillChar(): Promise<RecommendResult> {
    return this.ni()
  }
  recommendEye(): Promise<RecommendResult> {
    return this.ni()
  }
}
