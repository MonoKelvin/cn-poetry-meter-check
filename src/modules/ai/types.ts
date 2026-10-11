/**
 * 通用 AI 模块类型：业务无关的对话客户端契约。
 */
import type { ZodType } from 'zod'

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  /** 请求 JSON 输出（OpenAI 兼容走 response_format: json_object）。 */
  json?: boolean
  timeoutMs?: number
}

export interface ChatResult {
  text: string
  /** 供应商原始响应，便于调试。 */
  raw?: unknown
}

/** 大模型配置。openai-compat 覆盖 Qwen/DeepSeek/Kimi/OpenAI；anthropic 为独立适配。 */
export interface LlmConfig {
  provider: 'openai-compat' | 'anthropic'
  /** 接口基址；openai-compat 必填，anthropic 省略则用默认。 */
  baseUrl?: string
  apiKey: string
  model: string
  temperature?: number
  timeoutMs?: number
}

export interface LlmClient {
  readonly model: string
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>
  /** 请求并解析为经 schema 校验的结构化结果，失败自动重试一次。 */
  chatJson<T>(messages: ChatMessage[], schema: ZodType<T>, options?: ChatOptions): Promise<T>
}
