import { describe, it, expect } from 'vitest'
import { buildPattern, chooseVariant, detectForm } from '../src/core/meter-pattern'
import { parsePoem } from '../src/core/poem'
import { pingshui } from '../src/rhyme/pingshui'
import type { MeterPattern } from '../src/core/meter-pattern'
import type { Tone } from '../src/core/types'

const CODE: Record<Tone, string> = { level: '1', oblique: '2', either: '0', unknown: '?' }
const toStr = (p: MeterPattern) => p.lines.map((l) => l.tones.map((t) => CODE[t]).join('')).join(',')

describe('格律谱生成', () => {
  it('五绝平起首句不入韵（对照 cope: 11122,22213,22112,11223，韵脚平声计 1）', () => {
    const p = buildPattern('wujue', { start: 'level', firstLineRhymes: false })
    expect(toStr(p)).toBe('11122,22211,22112,11221')
    expect(p.lines.map((l) => l.rhyme)).toEqual([false, true, false, true])
  })

  it('五律平起首句不入韵 = C D A B C D A B', () => {
    const p = buildPattern('wulv', { start: 'level', firstLineRhymes: false })
    expect(toStr(p)).toBe('11122,22211,22112,11221,11122,22211,22112,11221')
  })

  it('七绝仄起首句不入韵', () => {
    const p = buildPattern('qijue', { start: 'oblique', firstLineRhymes: false })
    expect(toStr(p)).toBe('1122112,2211221,2211122,1122211')
  })

  it('detectForm 识别诗体', () => {
    expect(detectForm([5, 5, 5, 5])).toBe('wujue')
    expect(detectForm([7, 7, 7, 7, 7, 7, 7, 7])).toBe('qilv')
    expect(detectForm([5, 5, 5])).toBeNull()
    expect(detectForm([5, 7, 5, 5])).toBeNull()
  })

  it('chooseVariant 对《登鹳雀楼》选出仄起不入韵谱', () => {
    // 白日依山尽，黄河入海流。欲穷千里目，更上一层楼。(五绝 仄起首句不入韵)
    const parsed = parsePoem('白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', pingshui())
    const p = chooseVariant(parsed, 'wujue')
    expect(toStr(p)).toBe('22112,11221,11122,22211')
  })
})
