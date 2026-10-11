import { describe, it, expect, vi, afterEach } from 'vitest'
import { z } from 'zod'
import { createLlmClient } from '../src/modules/ai/factory'
import { extractJson } from '../src/modules/ai/client'
import { renderSkill } from '../src/modules/ai/skill-loader'

function mockFetch(payload: unknown, ok = true, status = 200) {
  return vi.fn(async () =>
    new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } }),
  ) as unknown as typeof fetch
}

afterEach(() => vi.restoreAllMocks())

describe('extractJson', () => {
  it('剥离代码围栏', () => {
    expect(extractJson('说明：\n```json\n{"a":1}\n```')).toBe('{"a":1}')
  })
  it('截取裸 JSON', () => {
    expect(extractJson('前言 {"a":1} 后记')).toBe('{"a":1}')
  })
})

describe('renderSkill', () => {
  it('注入变量', () => {
    expect(renderSkill('出句：{{chu}}；对句：{{dui}}', { chu: '两个黄鹂', dui: '一行白鹭' })).toBe(
      '出句：两个黄鹂；对句：一行白鹭',
    )
  })
})

describe('OpenAICompatClient', () => {
  it('chat 解析 choices 内容', async () => {
    globalThis.fetch = mockFetch({ choices: [{ message: { content: '你好' } }] })
    const client = createLlmClient({ provider: 'openai-compat', baseUrl: 'https://api.example.com/v1', apiKey: 'k', model: 'm' })
    const r = await client.chat([{ role: 'user', content: 'hi' }])
    expect(r.text).toBe('你好')
  })

  it('chatJson 校验并返回结构化结果', async () => {
    globalThis.fetch = mockFetch({ choices: [{ message: { content: '```json\n{"isParallel":true}\n```' } }] })
    const client = createLlmClient({ provider: 'openai-compat', baseUrl: 'https://api.example.com/v1', apiKey: 'k', model: 'm' })
    const schema = z.object({ isParallel: z.boolean() })
    const r = await client.chatJson([{ role: 'user', content: 'q' }], schema)
    expect(r.isParallel).toBe(true)
  })

  it('缺少 baseUrl 抛错', () => {
    expect(() => createLlmClient({ provider: 'openai-compat', apiKey: 'k', model: 'm' })).toThrow(/baseUrl/)
  })
})

describe('AnthropicClient', () => {
  it('chat 解析 content blocks', async () => {
    globalThis.fetch = mockFetch({ content: [{ type: 'text', text: '安' }, { type: 'text', text: '好' }] })
    const client = createLlmClient({ provider: 'anthropic', apiKey: 'k', model: 'claude' })
    const r = await client.chat([
      { role: 'system', content: '你是专家' },
      { role: 'user', content: 'hi' },
    ])
    expect(r.text).toBe('安好')
  })
})
