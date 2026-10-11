import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRecommender } from '../src/index'
import { LlmRecommender } from '../src/modules/recommend/recommender'
import type { LlmClient } from '../src/modules/ai/types'

afterEach(() => vi.restoreAllMocks())

describe('推荐器', () => {
  it('未配置 ai 返回桩实现 notImplemented', async () => {
    const rec = createRecommender()
    const r = await rec.composePoem({ theme: '秋' })
    expect(r.notImplemented).toBe(true)
    expect(r.recommendations).toHaveLength(0)
  })

  it('缺对应 SKILL 的方法返回 notImplemented', async () => {
    const fakeClient = { model: 'm', chat: vi.fn(), chatJson: vi.fn() } as unknown as LlmClient
    const rec = new LlmRecommender(fakeClient, {})
    const r = await rec.fixMeter('白日依山尽')
    expect(r.notImplemented).toBe(true)
  })

  it('提供 SKILL 时调用 chatJson 并返回结构化推荐', async () => {
    const chatJson = vi.fn(async () => ({ recommendations: [{ text: '一行白鹭上青天', reason: '工对' }] }))
    const fakeClient = { model: 'm', chat: vi.fn(), chatJson } as unknown as LlmClient
    const rec = new LlmRecommender(fakeClient, { 'recommend-duizhang': 'SKILL 文本' })
    const r = await rec.fixDuizhang('两个黄鹂鸣翠柳', '几只小鸟在树上')
    expect(chatJson).toHaveBeenCalledOnce()
    expect(r.recommendations[0]?.text).toBe('一行白鹭上青天')
  })
})
