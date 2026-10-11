/**
 * SKILL 装载：模板变量注入；Node 环境下从 skills/<name>/SKILL.md 读取。
 */
export type SkillVars = Record<string, string>

/** 用 {{var}} 占位渲染技能文本。 */
export function renderSkill(template: string, vars: SkillVars = {}): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '')
}

export interface LoadSkillOptions {
  /** skills 根目录，默认 `${process.cwd()}/skills`。 */
  skillsDir?: string
}

/**
 * 从 skills/<name>/SKILL.md 读取技能文本（仅 Node）。
 * 浏览器环境请直接向检测器提供技能文本。
 */
export async function loadSkillText(name: string, options: LoadSkillOptions = {}): Promise<string> {
  const { readFile } = await import('node:fs/promises')
  const path = await import('node:path')
  const dir = options.skillsDir ?? path.join(process.cwd(), 'skills')
  return readFile(path.join(dir, name, 'SKILL.md'), 'utf8')
}
