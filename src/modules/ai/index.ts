/** 通用 AI 模块对外导出。 */
export * from './types'
export { createLlmClient } from './factory'
export { OpenAICompatClient } from './openai-compat'
export { AnthropicClient } from './anthropic'
export { renderSkill, loadSkillText, type SkillVars, type LoadSkillOptions } from './skill-loader'
export { loadLlmConfigs, pickLlmConfig, type NamedLlmConfig, type LlmConfigFile } from './config'
export { extractJson } from './client'
