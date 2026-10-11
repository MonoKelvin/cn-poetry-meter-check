/**
 * 客户端工厂：按 provider 返回实现。新增供应商通常只需配置 baseUrl + model + apiKey。
 */
import { OpenAICompatClient } from './openai-compat'
import { AnthropicClient } from './anthropic'
import type { LlmClient, LlmConfig } from './types'

export function createLlmClient(config: LlmConfig): LlmClient {
  return config.provider === 'anthropic'
    ? new AnthropicClient(config)
    : new OpenAICompatClient(config)
}
