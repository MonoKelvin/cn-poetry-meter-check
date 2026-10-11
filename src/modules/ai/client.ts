/**
 * 客户端基础设施：带超时的 fetch、JSON 抽取、以及实现 chatJson 的抽象基类。
 */
import type { ZodType } from 'zod'
import type { ChatMessage, ChatOptions, ChatResult, LlmClient } from './types'

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 30000,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** 从可能含代码围栏或多余文字的文本中抽取首个 JSON 对象/数组串。 */
export function extractJson(text: string): string {
  let s = text.trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence && fence[1]) s = fence[1].trim()
  const firstObj = s.indexOf('{')
  const firstArr = s.indexOf('[')
  let start = -1
  if (firstObj === -1) start = firstArr
  else if (firstArr === -1) start = firstObj
  else start = Math.min(firstObj, firstArr)
  if (start === -1) return s
  const close = s[start] === '{' ? '}' : ']'
  const end = s.lastIndexOf(close)
  return end > start ? s.slice(start, end + 1) : s.slice(start)
}

/** 大模型客户端抽象基类：子类实现 chat，chatJson 在此统一实现（含校验与重试）。 */
export abstract class BaseLlmClient implements LlmClient {
  abstract readonly model: string
  abstract chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>

  async chatJson<T>(messages: ChatMessage[], schema: ZodType<T>, options: ChatOptions = {}): Promise<T> {
    const conversation = [...messages]
    let lastError: unknown
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await this.chat(conversation, { ...options, json: true })
      try {
        return schema.parse(JSON.parse(extractJson(res.text)))
      } catch (error) {
        lastError = error
        conversation.push({ role: 'assistant', content: res.text })
        conversation.push({
          role: 'user',
          content: `上次输出无法解析为符合要求的 JSON（${(error as Error).message}）。请仅输出合法 JSON，不要包含额外文字或解释。`,
        })
      }
    }
    throw new Error(`结构化输出解析失败：${(lastError as Error)?.message ?? String(lastError)}`)
  }
}
