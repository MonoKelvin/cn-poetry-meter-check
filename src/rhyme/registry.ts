/** 韵表注册与选择：支持内置韵表与运行时自定义注册。 */
import type { RhymeBookId } from '../core/types'
import type { RhymeTable } from './rhyme-table'
import { pingshui } from './pingshui'
import { cilin } from './cilin'
import { xinyun } from './xinyun'

const factories: Record<RhymeBookId, (() => RhymeTable) | null> = {
  pingshui,
  cilin,
  xinyun,
  tongyun: null, // 中华通韵数据待补充
}

const custom = new Map<string, RhymeTable>()

/** 按标识获取韵表；未提供数据者抛出清晰错误。 */
export function getRhymeTable(id: RhymeBookId): RhymeTable {
  const c = custom.get(id)
  if (c) return c
  const factory = factories[id]
  if (!factory) {
    if (id === 'tongyun') {
      throw new Error(
        '中华通韵依今音，需可选依赖 pinyin-pro；请先 registerRhymeTable(await createTongyunRhymeTable()) 再使用，或改用 pingshui / xinyun / cilin。',
      )
    }
    throw new Error(`未知韵表：${id}`)
  }
  return factory()
}

/** 注册或覆盖一个韵表实现（可用于补充中华通韵）。 */
export function registerRhymeTable(table: RhymeTable): void {
  custom.set(table.id, table)
}
