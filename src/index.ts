/**
 * cn-poetry-meter-check 门面：对外导出“少而全”的检测 API 与类型。
 */
import { analyze } from './modules/base/analyze'
import { splitLines } from './core/poem'
import type { CheckOptions, CheckResult, Tone } from './core/types'
import { createLlmClient } from './modules/ai/factory'
import type { LlmConfig } from './modules/ai/types'
import { HeuristicDuizhangChecker, LlmDuizhangChecker } from './modules/advanced/duizhang'
import { LlmPolyphoneResolver } from './modules/advanced/polyphone-resolver'
import type { DuizhangChecker, PolyphoneResolver, PolyphoneResolution } from './modules/advanced/types'
import { LlmRecommender, StubRecommender } from './modules/recommend/recommender'
import type { Recommender, RecommendSkillName } from './modules/recommend/types'

/** 一步到位的基础格律检测。 */
export function checkMeter(text: string, options?: CheckOptions): CheckResult {
  return analyze(text, options)
}

/** 可复用的检测器：固定一组选项（韵表、严格度等）后多次检测。 */
export class PoetryChecker {
  constructor(private readonly options: CheckOptions = {}) {}

  check(text: string): CheckResult {
    return analyze(text, this.options)
  }
}

export interface AdvancedCheckerOptions {
  /** 提供后启用 LLM 后端；否则对仗退化为启发式、多音字消歧不可用。 */
  ai?: LlmConfig
  /** 对仗 SKILL 文本（可用 loadSkillText('detect-duizhang') 读取）。 */
  duizhangSkill?: string
  /** 多音字消歧 SKILL 文本（可用 loadSkillText('resolve-polyphone') 读取）。 */
  polyphoneSkill?: string
}

export interface AdvancedChecker {
  duizhang: DuizhangChecker
  polyphone?: PolyphoneResolver
}

/** 构建高级检测器：对仗（启发式/LLM）与多音字消歧（LLM）。 */
export function createAdvancedChecker(options: AdvancedCheckerOptions = {}): AdvancedChecker {
  const client = options.ai ? createLlmClient(options.ai) : undefined
  const duizhang: DuizhangChecker =
    client && options.duizhangSkill
      ? new LlmDuizhangChecker(client, options.duizhangSkill)
      : new HeuristicDuizhangChecker()
  const polyphone =
    client && options.polyphoneSkill ? new LlmPolyphoneResolver(client, options.polyphoneSkill) : undefined
  return { duizhang, polyphone }
}

export interface RecommenderOptions {
  /** 提供后启用 LLM 后端；否则返回桩实现（notImplemented）。 */
  ai?: LlmConfig
  /** 各推荐技能的 SKILL 文本（可用 loadSkillText 读取）。 */
  skills?: Partial<Record<RecommendSkillName, string>>
}

/** 构建推荐器（FR-C1..C6）。未配置 ai 时返回桩实现。 */
export function createRecommender(options: RecommenderOptions = {}): Recommender {
  if (!options.ai) return new StubRecommender()
  return new LlmRecommender(createLlmClient(options.ai), options.skills ?? {})
}

export interface PolyphoneResolutionRecord {
  char: string
  lineIndex: number
  charIndex: number
  resolution: PolyphoneResolution
}

/**
 * 基础检测 + 多音字消歧复检：先基础检测，对多音字歧义处调用 resolver 定音，
 * 固定读音后复检，使歧义提示得以消解、并暴露确定读音下的真实出律。
 */
export async function checkMeterResolved(
  text: string,
  resolver: PolyphoneResolver,
  options?: CheckOptions,
): Promise<{ result: CheckResult; resolutions: PolyphoneResolutionRecord[] }> {
  const base = analyze(text, options)
  const lines = splitLines(text)
  const pins: Record<string, Tone> = {}
  const resolutions: PolyphoneResolutionRecord[] = []
  for (const issue of base.issues) {
    if (issue.category !== 'polyphone' || !issue.position) continue
    const { lineIndex, charIndex, char } = issue.position
    const resolution = await resolver.resolve(char, lines[lineIndex] ?? '', charIndex + 1)
    if (resolution) {
      pins[`${lineIndex}:${charIndex}`] = resolution.chosen.tone
      resolutions.push({ char, lineIndex, charIndex, resolution })
    }
  }
  const result = Object.keys(pins).length > 0 ? analyze(text, options, pins) : base
  return { result, resolutions }
}

export { getRhymeTable, registerRhymeTable } from './rhyme/registry'
export type { RhymeTable } from './rhyme/rhyme-table'
export { buildPattern } from './core/meter-pattern'
export * from './core/types'
export * from './modules/ai'
export * from './modules/advanced'
export * from './modules/recommend'
