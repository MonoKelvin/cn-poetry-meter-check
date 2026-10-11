import { describe, it, expect, beforeAll } from 'vitest'
import { createTongyunRhymeTable } from '../src/rhyme/tongyun'
import type { RhymeTable } from '../src/rhyme/rhyme-table'

describe('中华通韵（今音, pinyin-pro）', () => {
  let t: RhymeTable
  beforeAll(async () => {
    t = await createTongyunRhymeTable()
  })

  it('平仄依今音声调（1/2 平，3/4 仄）', () => {
    expect(t.getToneInfo('天').tones).toContain('level') // tiān
    expect(t.getToneInfo('月').tones).toContain('oblique') // yuè
  })

  it('同韵部判断', () => {
    expect(t.isSameRhyme('天', '年')).toBe(true) // ian → 十一安
    expect(t.isSameRhyme('东', '中')).toBe(true) // ong → 十五雍
    expect(t.isSameRhyme('鱼', '居')).toBe(true) // ü → 六迂
  })

  it('通韵细分：东(雍) 与 风(英) 不同部', () => {
    expect(t.isSameRhyme('东', '风')).toBe(false) // ong vs eng
  })

  it('韵部标签正确', () => {
    expect(t.getRhymeGroups('天').some((g) => g.label === '十一安')).toBe(true)
    expect(t.getRhymeGroups('鱼').some((g) => g.label === '六迂')).toBe(true)
  })

  it('ü 系与复合韵母映射', () => {
    expect(t.isSameRhyme('月', '叶')).toBe(true) // üe(yue) / ie → 三鹅
    expect(t.isSameRhyme('云', '春')).toBe(true) // ün(yun) / un → 十二恩
    expect(t.isSameRhyme('规', '飞')).toBe(true) // ui / ei → 八欸
    expect(t.getRhymeGroups('元').some((g) => g.label === '十一安')).toBe(true) // üan(yuan) → 安
  })
})
