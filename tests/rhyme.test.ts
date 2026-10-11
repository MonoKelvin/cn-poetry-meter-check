import { describe, it, expect } from 'vitest'
import { pingshui } from '../src/rhyme/pingshui'
import { xinyun } from '../src/rhyme/xinyun'
import { cilin } from '../src/rhyme/cilin'
import { getRhymeTable } from '../src/rhyme/registry'

describe('平水韵', () => {
  const ps = pingshui()

  it('东 为平声，属一东', () => {
    const info = ps.getToneInfo('东')
    expect(info.tones).toContain('level')
    expect(info.groups.some((g) => g.label === '一东')).toBe(true)
  })

  it('长 为多音字（平/仄两可）', () => {
    const info = ps.getToneInfo('长')
    expect(info.isPolyphone).toBe(true)
    expect(info.tones).toContain('level')
    expect(info.tones).toContain('oblique')
  })

  it('入声字 一 归仄', () => {
    expect(ps.getToneInfo('一').tones).toContain('oblique')
  })

  it('同韵判断：东/红 同属一东', () => {
    expect(ps.isSameRhyme('东', '红')).toBe(true)
  })

  it('未收录字返回 unknown', () => {
    expect(ps.getToneInfo('\u0000').tones).toEqual(['unknown'])
  })
})

describe('registry', () => {
  it('tongyun 抛出清晰错误', () => {
    expect(() => getRhymeTable('tongyun')).toThrow(/中华通韵/)
  })

  it('xinyun / cilin 可用', () => {
    expect(xinyun().getToneInfo('天').tones).toContain('level')
    expect(cilin().getToneInfo('东').tones).toContain('level')
  })
})

describe('广韵平仄兜底（生僻/异体字）', () => {
  const ps = pingshui()

  it('平水韵未录但广韵有：仝/邨/峯 判为平', () => {
    for (const c of ['仝', '邨', '峯']) {
      const info = ps.getToneInfo(c)
      expect(info.tones).toContain('level')
      expect(info.tones).not.toContain('unknown')
    }
  })

  it('喆 经广韵判为仄', () => {
    expect(ps.getToneInfo('喆').tones).toContain('oblique')
  })

  it('两表皆无者仍为 unknown', () => {
    expect(ps.getToneInfo('￿').tones).toEqual(['unknown'])
  })
})
