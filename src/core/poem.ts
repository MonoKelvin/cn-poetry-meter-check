/**
 * 诗作解析：将文本切分为句与字，并附带各字的平仄信息。
 */
import { COMMENT_PREFIX, LINE_SEPARATOR } from './constants'
import type { LineRole, Tone, ToneInfo } from './types'
import type { RhymeTable } from '../rhyme/rhyme-table'

export interface PoemChar {
  char: string
  index: number
  info: ToneInfo
  /** 是否可作平声（含两可/未录通融）。 */
  canLevel: boolean
  /** 是否可作仄声（含两可/未录通融）。 */
  canOblique: boolean
}

export interface PoemLine {
  index: number
  /** 出句（奇数句）/ 对句（偶数句）。 */
  role: LineRole
  /** 联序（1 起）。 */
  couplet: number
  chars: PoemChar[]
  length: number
}

export interface ParsedPoem {
  lines: PoemLine[]
  lineLengths: number[]
}

/** 按中文标点与换行切句，忽略以 # 起始的注释行（标题/作者等）。 */
export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .filter((l) => !l.trimStart().startsWith(COMMENT_PREFIX))
    .join('\n')
    .split(LINE_SEPARATOR)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * 解析诗作文本为结构化模型。
 * pins 可按 `${句序}:${字序}`（均 0 起）固定某字平仄（用于多音字消歧后复检）。
 */
export function parsePoem(text: string, rhyme: RhymeTable, pins: Record<string, Tone> = {}): ParsedPoem {
  const rawLines = splitLines(text)
  const lines: PoemLine[] = rawLines.map((lineText, i) => {
    const chars: PoemChar[] = [...lineText].map((char, j) => {
      const info = rhyme.getToneInfo(char)
      let canLevel =
        info.tones.includes('level') || info.tones.includes('either') || info.tones.includes('unknown')
      let canOblique =
        info.tones.includes('oblique') || info.tones.includes('either') || info.tones.includes('unknown')
      const pin = pins[`${i}:${j}`]
      if (pin === 'level') {
        canLevel = true
        canOblique = false
      } else if (pin === 'oblique') {
        canLevel = false
        canOblique = true
      }
      return { char, index: j, info, canLevel, canOblique }
    })
    return {
      index: i,
      role: (i % 2 === 0 ? 'chu' : 'dui') as LineRole,
      couplet: Math.floor(i / 2) + 1,
      chars,
      length: chars.length,
    }
  })
  return { lines, lineLengths: lines.map((l) => l.length) }
}
