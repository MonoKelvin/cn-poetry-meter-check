/**
 * 本地 API 配置加载：支持一个 JSON 文件内配置多套大模型（列表），按名称或默认项选取。
 * 该文件通常含密钥，应加入 .gitignore，禁止提交。
 */
import type { LlmConfig } from './types'

export interface NamedLlmConfig extends LlmConfig {
  name: string
}

export interface LlmConfigFile {
  apis: NamedLlmConfig[]
  /** 默认使用的配置名。 */
  default?: string
}

/** 从 JSON 文件读取大模型配置列表（仅 Node）。默认路径 cpmc.apis.json。 */
export async function loadLlmConfigs(path = 'cpmc.apis.json'): Promise<LlmConfigFile> {
  const { readFile } = await import('node:fs/promises')
  const data = JSON.parse(await readFile(path, 'utf8')) as LlmConfigFile
  if (!Array.isArray(data.apis) || data.apis.length === 0) {
    throw new Error('配置文件格式错误：缺少非空的 apis 数组。')
  }
  return data
}

/** 从配置列表中选取一项（按名称，否则按 default，否则取第一项）。 */
export function pickLlmConfig(file: LlmConfigFile, name?: string): NamedLlmConfig {
  const target = name ?? file.default
  const found = target ? file.apis.find((a) => a.name === target) : file.apis[0]
  if (!found) throw new Error(`未找到 API 配置：${target ?? '(空列表)'}`)
  return found
}
