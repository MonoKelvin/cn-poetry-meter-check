/**
 * Anthropic Claude 适配：/v1/messages 端点、x-api-key + anthropic-version 头、
 * system 为顶层参数、消息为 content blocks。
 */
import { LLM_BASE_URLS } from '../../core/constants'
import { BaseLlmClient, fetchWithTimeout } from './client'
import type { ChatMessage, ChatOptions, ChatResult, LlmConfig } from './types'

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>
}

export class AnthropicClient extends BaseLlmClient {
  readonly model: string
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly temperature: number
  private readonly timeoutMs: number

  constructor(config: LlmConfig) {
    super()
    this.model = config.model
    this.baseUrl = (config.baseUrl ?? LLM_BASE_URLS.anthropic).replace(/\/+$/, '')
    this.apiKey = config.apiKey
    this.temperature = config.temperature ?? 0.7
    this.timeoutMs = config.timeoutMs ?? 30000
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const system = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n')
    const turns = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }))

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: options.maxTokens ?? 2048,
      messages: turns,
      temperature: options.temperature ?? this.temperature,
    }
    if (system) body.system = system

    const res = await fetchWithTimeout(
      `${this.baseUrl}/v1/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      },
      options.timeoutMs ?? this.timeoutMs,
    )
    if (!res.ok) {
      throw new Error(`LLM 请求失败 ${res.status}: ${await res.text().catch(() => '')}`)
    }
    const data = (await res.json()) as AnthropicResponse
    const text = (data.content ?? [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text ?? '')
      .join('')
    return { text, raw: data }
  }
}
