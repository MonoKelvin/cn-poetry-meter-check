/** 高级检测模块对外类型契约（实现分级：启发式 / LLM）。 */
import type { Tone } from '../../core/types'

export interface DuizhangIssue {
  /** 问题字位置（从 1 起），整句性问题可省略。 */
  position?: number
  reason: string
}

export interface DuizhangResult {
  /** 是否对仗；null 表示未判定/需人工。 */
  isParallel: boolean | null
  /** 置信度 0~1。 */
  confidence: number
  issues: DuizhangIssue[]
  notes: string[]
}

/** 对仗检测器契约。 */
export interface DuizhangChecker {
  check(chu: string, dui: string, context?: string): Promise<DuizhangResult>
}

export interface PolyphoneCandidate {
  group: string
  tone: Tone
}

export interface PolyphoneResolution {
  char: string
  chosen: PolyphoneCandidate
  confidence: number
  reason: string
}

/** 多音字消歧器契约。 */
export interface PolyphoneResolver {
  resolve(char: string, line: string, position: number): Promise<PolyphoneResolution | null>
}
