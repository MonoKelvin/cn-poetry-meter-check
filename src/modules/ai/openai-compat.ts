/**
 * OpenAI 兼容客户端：以同一 /chat/completions 形态覆盖 OpenAI、通义千问(兼容模式)、DeepSeek、Kimi。
 * 各家仅 baseUrl + model + apiKey 不同。
 */
import { BaseLlmClient, fetchWithTimeout } from './client'
import type { ChatMessage, ChatOptions, ChatResult, LlmConfig } from './types'

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string } }>
}

export class OpenAICompatClient extends BaseLlmClient {
  readonly model: string
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly temperature: number
  private readonly timeoutMs: number

  constructor(config: LlmConfig) {
    super()
    if (!config.baseUrl) {
      throw new Error('OpenAI 兼容客户端需提供 baseUrl（如各供应商的接口地址）。')
    }
    this.model = config.model
    this.baseUrl = config.baseUrl.replace(/\/+$/, '')
    this.apiKey = config.apiKey
    this.temperature = config.temperature ?? 0.7
    this.timeoutMs = config.timeoutMs ?? 30000
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: options.temperature ?? this.temperature,
    }
    if (options.maxTokens) body.max_tokens = options.maxTokens
    if (options.json) body.response_format = { type: 'json_object' }

    const res = await fetchWithTimeout(
      `${this.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify(body),
      },
      options.timeoutMs ?? this.timeoutMs,
    )
    if (!res.ok) {
      throw new Error(`LLM 请求失败 ${res.status}: ${await res.text().catch(() => '')}`)
    }
    const data = (await res.json()) as OpenAIChatResponse
    return { text: data.choices?.[0]?.message?.content ?? '', raw: data }
  }
}
