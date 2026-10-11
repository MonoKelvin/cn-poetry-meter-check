/**
 * 全局常量：诗体元数据、节奏点、分隔符、默认配置与供应商预设。
 * 统一在此管理，避免散落的魔法值。
 */
import type { PoemFormId, RhymeBookId } from './types'

/** 诗体显示名。 */
export const FORM_NAMES: Record<PoemFormId, string> = {
  wujue: '五言绝句',
  wulv: '五言律诗',
  qijue: '七言绝句',
  qilv: '七言律诗',
}

/** 每句字数。 */
export const FORM_LINE_LENGTH: Record<PoemFormId, 5 | 7> = {
  wujue: 5,
  wulv: 5,
  qijue: 7,
  qilv: 7,
}

/** 句数。 */
export const FORM_LINE_COUNT: Record<PoemFormId, 4 | 8> = {
  wujue: 4,
  wulv: 8,
  qijue: 4,
  qilv: 8,
}

/** 韵表显示名。 */
export const RHYME_BOOK_NAMES: Record<RhymeBookId, string> = {
  pingshui: '平水韵',
  cilin: '词林正韵',
  xinyun: '中华新韵',
  tongyun: '中华通韵',
}

/** 默认韵表。 */
export const DEFAULT_RHYME_BOOK: RhymeBookId = 'pingshui'

/**
 * 节奏点字序（0 起）：五言为第 2、4 字，七言为第 2、4、6 字。
 * 平仄于节奏点处最为吃紧（“二四六分明”）。
 */
export const RHYTHM_POSITIONS: Record<5 | 7, readonly number[]> = {
  5: [1, 3],
  7: [1, 3, 5],
}

/** 切句分隔：中文标点与换行。 */
export const LINE_SEPARATOR = /[。，、？！；：,.?!;:\n\r]+/

/** 注释行前缀（标题/作者/注解），切句时忽略。 */
export const COMMENT_PREFIX = '#'

/** 常用大模型供应商 baseUrl 预设。 */
export const LLM_BASE_URLS = {
  openai: 'https://api.openai.com/v1',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  deepseek: 'https://api.deepseek.com',
  kimi: 'https://api.moonshot.cn/v1',
  anthropic: 'https://api.anthropic.com',
} as const
