/** 推荐模块对外类型契约（LLM 后端；内部可桩实现）。 */
import type { PoemFormId } from '../../core/types'

export interface Recommendation {
  /** 推荐的诗句 / 字 / 方案文本。 */
  text: string
  /** 推荐理由。 */
  reason: string
}

export interface RecommendResult {
  recommendations: Recommendation[]
  /** 内部未实现（未配置 LLM 或缺 SKILL）时为 true。 */
  notImplemented?: boolean
}

export interface ComposeSpec {
  title?: string
  form?: PoemFormId
  theme?: string
  /** 用韵要求，如 "平水韵 一东" 或 "中华新韵 十四姑"。 */
  rhyme?: string
  requirement?: string
}

export type RecommendSkillName =
  | 'recommend-fix-meter'
  | 'recommend-duizhang'
  | 'compose-poem'
  | 'complete-line'
  | 'fill-char'
  | 'recommend-eye'

/** 推荐器契约，对应原始需求推荐算法六项（FR-C1..C6）。 */
export interface Recommender {
  /** FR-C1 出律补救：给出改平仄/换字且保证押韵的方案。 */
  fixMeter(poem: string, note?: string): Promise<RecommendResult>
  /** FR-C2 对仗替换：对不对仗处给出合理对仗替换。 */
  fixDuizhang(chu: string, dui: string): Promise<RecommendResult>
  /** FR-C3 自动成诗：按题目/体裁/题材/用韵创作。 */
  composePoem(spec: ComposeSpec): Promise<RecommendResult>
  /** FR-C4 补句：据出句补对句，或据对句补出句。 */
  completeLine(line: string, role: 'chu' | 'dui', context?: string): Promise<RecommendResult>
  /** FR-C5 自动填字：对含空位的诗作推荐填字。 */
  fillChar(poem: string): Promise<RecommendResult>
  /** FR-C6 字眼推荐：五言第三字、七言第五字须“响”。 */
  recommendEye(poem: string): Promise<RecommendResult>
}
