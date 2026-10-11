import { describe, it, expect } from 'vitest'
import { HeuristicDuizhangChecker } from '../src/modules/advanced/duizhang'

const checker = new HeuristicDuizhangChecker()

describe('启发式对仗检测', () => {
  it('《绝句》颔联工对平仄相对', async () => {
    const r = await checker.check('两个黄鹂鸣翠柳', '一行白鹭上青天')
    expect(r.isParallel).toBe(true)
    expect(r.issues).toHaveLength(0)
  })

  it('字数不等判为不对仗', async () => {
    const r = await checker.check('白日依山尽', '黄河入海流长')
    expect(r.isParallel).toBe(false)
    expect(r.issues[0]?.reason).toMatch(/字数不等/)
  })

  it('节奏点平仄未相对则报问题', async () => {
    // 两句节奏点同为平/仄，应至少报一处未相对
    const r = await checker.check('春风花草香', '清江水自流')
    expect(r.issues.length).toBeGreaterThan(0)
  })

  it('接入 jieba 时给出分词/词性建议（注释）', async () => {
    const r = await checker.check('两个黄鹂鸣翠柳', '一行白鹭上青天')
    expect(r.notes.some((n) => n.includes('分词'))).toBe(true)
  })
})
