/**
 * 核心类型定义。
 * 这些类型构成库对外契约与内部数据模型的基础，供检测、推荐与 AI 各模块共用。
 */

/** 字的平仄属性。either 表示多音/两可，unknown 表示所选韵表未收录。 */
export type Tone = 'level' | 'oblique' | 'either' | 'unknown'

/** 支持的近体诗体。 */
export type PoemFormId = 'wujue' | 'wulv' | 'qijue' | 'qilv'

/** 韵表标识。 */
export type RhymeBookId = 'pingshui' | 'cilin' | 'xinyun' | 'tongyun'

/** 句在联中的角色：出句（上句）/ 对句（下句）。 */
export type LineRole = 'chu' | 'dui'

/** 诗体变体：起式（首句第二字平仄）与首句是否入韵。 */
export interface FormVariant {
  /** 首句第二字的平仄，'level' 为平起，'oblique' 为仄起。 */
  start: 'level' | 'oblique'
  /** 首句是否入韵（句末为平声韵脚）。 */
  firstLineRhymes: boolean
}

/** 一个韵部的引用：其标识、显示名与所属平仄。 */
export interface RhymeGroup {
  /** 韵部唯一标识，如 'pingshui:一东'。 */
  id: string
  /** 韵部显示名，如 '一东'。 */
  label: string
  /** 该韵部的平仄（平声韵部为 level，上/去/入为 oblique）。 */
  tone: Tone
}

/** 单字在某韵表中的声韵信息。 */
export interface ToneInfo {
  /** 该字可能的平仄取值（多音字可有多个）。 */
  tones: Tone[]
  /** 该字可归属的韵部。 */
  groups: RhymeGroup[]
  /** 是否为影响平仄判定的多音字（存在不止一种平仄）。 */
  isPolyphone: boolean
}

/** 问题级别。 */
export type IssueLevel = 'error' | 'warning' | 'info'

/** 问题类别。 */
export type IssueCategory =
  | 'form' // 诗体
  | 'pingze' // 平仄（句脚等）
  | 'ti' // 失替
  | 'dui' // 失对（平仄）
  | 'nian' // 失粘
  | 'rhyme' // 押韵
  | 'guping' // 孤平
  | 'sanping' // 三平调
  | 'sanze' // 三仄尾
  | 'aojiu' // 拗救
  | 'polyphone' // 多音字
  | 'duizhang' // 对仗（高级）

/** 问题在诗中的定位。 */
export interface IssuePosition {
  /** 句序（0 起）。 */
  lineIndex: number
  /** 联序（1 起）。 */
  couplet: number
  /** 出句/对句。 */
  role: LineRole
  /** 字序（0 起）。 */
  charIndex: number
  /** 对应的字。 */
  char: string
}

/** 一条检测结论。 */
export interface Issue {
  level: IssueLevel
  category: IssueCategory
  position?: IssuePosition
  /** 面向用户的中文描述。 */
  message: string
  /** 可选的修改建议。 */
  suggestion?: string
  /** 附加数据，如多音字各读音。 */
  meta?: Record<string, unknown>
}

/** 识别到的诗体信息。 */
export interface PoemFormInfo {
  id: PoemFormId
  name: string
  variant: FormVariant
}

/** 逐字平仄单元（供可视化/示例页展示）。 */
export interface CharCell {
  char: string
  /** 实际平仄：两可为 either，未录为 unknown。 */
  tone: Tone
  /** 标准谱该位要求（无法识别诗体时缺省）。 */
  expected?: Tone
  /** 是否为韵脚。 */
  isRhyme?: boolean
}

/** 逐句的逐字单元。 */
export interface LineCells {
  lineIndex: number
  couplet: number
  role: LineRole
  cells: CharCell[]
}

/** 检测选项。 */
export interface CheckOptions {
  /** 指定诗体，'auto' 为自动识别（默认）。 */
  form?: PoemFormId | 'auto'
  /** 韵表，默认 'pingshui'。 */
  rhymeBook?: RhymeBookId
  /** 严格度，影响孤平（启功说）、三仄尾等判定。默认 'normal'。 */
  strictness?: 'strict' | 'normal' | 'loose'
}

/** 检测总结果。 */
export interface CheckResult {
  form?: PoemFormInfo
  rhymeBook: RhymeBookId
  /** 推断出的全诗韵部标识。 */
  inferredRhymeGroup?: string
  /** 是否无 error 级问题。 */
  passed: boolean
  issues: Issue[]
  stats: { errors: number; warnings: number; infos: number }
  /** 逐句逐字平仄（供展示），无法识别诗体时无 expected。 */
  lines?: LineCells[]
}
