/**
 * 对仗检测：启发式（等长 + 节奏点平仄相对，确定且可解释）与 LLM（SKILL 驱动，判语义/工对/合掌）两档。
 */
import { z } from 'zod'
import { RHYTHM_POSITIONS } from '../../core/constants'
import type { Tone } from '../../core/types'
import { getRhymeTable } from '../../rhyme/registry'
import type { RhymeTable } from '../../rhyme/rhyme-table'
import type { LlmClient } from '../ai/types'
import { tagPos } from './jieba'
import type { DuizhangChecker, DuizhangIssue, DuizhangResult } from './types'

function definiteToneOf(ch: string, rhyme: RhymeTable): Tone | undefined {
  const info = rhyme.getToneInfo(ch)
  const canL = info.tones.includes('level') || info.tones.includes('either') || info.tones.includes('unknown')
  const canO = info.tones.includes('oblique') || info.tones.includes('either') || info.tones.includes('unknown')
  if (canL && !canO) return 'level'
  if (canO && !canL) return 'oblique'
  return undefined
}

function rhythmPositions(len: number): readonly number[] {
  if (len === 5 || len === 7) return RHYTHM_POSITIONS[len]
  const out: number[] = []
  for (let i = 1; i < len - 1; i += 2) out.push(i)
  return out
}

/** 启发式对仗检测：校验等长与节奏点平仄相对；词性、语义不作判定。 */
export class HeuristicDuizhangChecker implements DuizhangChecker {
  constructor(private readonly rhyme: RhymeTable = getRhymeTable('pingshui')) {}

  async check(chu: string, dui: string): Promise<DuizhangResult> {
    const notes = ['启发式仅校验等长与节奏点平仄相对；词性、语义层面的工对/合掌需 LLM 判定。']
    const cc = [...chu]
    const dc = [...dui]
    if (cc.length !== dc.length) {
      return {
        isParallel: false,
        confidence: 0.9,
        issues: [{ reason: `出对句字数不等（${cc.length} vs ${dc.length}）。` }],
        notes,
      }
    }
    const issues: DuizhangIssue[] = []
    for (const p of rhythmPositions(cc.length)) {
      const a = definiteToneOf(cc[p], this.rhyme)
      const b = definiteToneOf(dc[p], this.rhyme)
      if (a && b && a === b) {
        issues.push({ position: p + 1, reason: `第 ${p + 1} 字平仄未相对（均为${a === 'level' ? '平' : '仄'}）。` })
      }
    }
    // 可选：jieba 词性/分词数作“建议”级信号（现代汉语分词，古诗未必准，仅参考）。
    const [posChu, posDui] = await Promise.all([tagPos(chu), tagPos(dui)])
    if (posChu && posDui) {
      if (posChu.length === posDui.length) {
        let match = 0
        for (let i = 0; i < posChu.length; i++) if (posChu[i].tag === posDui[i].tag) match++
        notes.push(`分词各 ${posChu.length} 节，词性相符 ${match}/${posChu.length} 位（jieba，仅供参考）`)
      } else {
        notes.push(`分词数不同（出句 ${posChu.length} / 对句 ${posDui.length}），结构或欠工整（仅供参考）`)
      }
    }

    const isParallel = issues.length === 0
    return { isParallel, confidence: isParallel ? 0.6 : 0.75, issues, notes }
  }
}

const LLM_SCHEMA = z.object({
  isParallel: z.boolean(),
  level: z.string().optional(),
  confidence: z.number(),
  issues: z.array(z.object({ position: z.number().optional(), reason: z.string() })).default([]),
  heZhang: z.boolean().optional(),
  comment: z.string().optional(),
})

/** 基于大模型的对仗检测：由 SKILL 驱动，判工对/宽对/合掌等语义层面。 */
export class LlmDuizhangChecker implements DuizhangChecker {
  constructor(
    private readonly client: LlmClient,
    private readonly skill: string,
  ) {}

  async check(chu: string, dui: string, context = ''): Promise<DuizhangResult> {
    const user = `出句：${chu}\n对句：${dui}${context ? `\n全诗：${context}` : ''}`
    const out = await this.client.chatJson(
      [
        { role: 'system', content: this.skill },
        { role: 'user', content: user },
      ],
      LLM_SCHEMA,
    )
    const notes = [out.level, out.comment, out.heZhang ? '疑似合掌' : ''].filter(Boolean) as string[]
    return { isParallel: out.isParallel, confidence: out.confidence, issues: out.issues ?? [], notes }
  }
}
