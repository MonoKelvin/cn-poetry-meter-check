import { describe, it, expect } from 'vitest'
import { checkMeter } from '../src/index'

describe('checkMeter 集成', () => {
  it('《登鹳雀楼》合律（五绝仄起首句不入韵）', () => {
    const r = checkMeter('白日依山尽，黄河入海流。欲穷千里目，更上一层楼。')
    expect(r.form?.id).toBe('wujue')
    expect(r.form?.variant.start).toBe('oblique')
    expect(r.form?.variant.firstLineRhymes).toBe(false)
    expect(r.stats.errors).toBe(0)
    expect(r.passed).toBe(true)
  })

  it('《相思》合律（五绝）', () => {
    const r = checkMeter('红豆生南国，春来发几枝。愿君多采撷，此物最相思。')
    expect(r.form?.id).toBe('wujue')
    expect(r.stats.errors).toBe(0)
  })

  it('七律《闻官军收河南河北》识别为七律', () => {
    const poem =
      '剑外忽传收蓟北，初闻涕泪满衣裳。却看妻子愁何在，漫卷诗书喜欲狂。白日放歌须纵酒，青春作伴好还乡。即从巴峡穿巫峡，便下襄阳向洛阳。'
    const r = checkMeter(poem)
    expect(r.form?.id).toBe('qilv')
  })

  it('非近体（三句）报诗体错误', () => {
    const r = checkMeter('床前明月光，疑是地上霜，举头望明月。')
    expect(r.passed).toBe(false)
    expect(r.issues.some((i) => i.category === 'form')).toBe(true)
  })

  it('落韵：末句换韵触发押韵错误', () => {
    const r = checkMeter('白日依山尽，黄河入海流。欲穷千里目，更上一层烟。')
    expect(r.issues.some((i) => i.category === 'rhyme')).toBe(true)
  })

  it('《草》前四句不因大拗/多音字而误报失替失对', () => {
    const r = checkMeter('离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。')
    expect(r.form?.id).toBe('wujue')
    expect(r.stats.errors).toBe(0)
    expect(r.issues.some((i) => i.level === 'error' && (i.category === 'ti' || i.category === 'dui'))).toBe(false)
  })

  it('特拗（宿建德江·移舟泊烟渚）判为合律变格', () => {
    const r = checkMeter('移舟泊烟渚，日暮客愁新。野旷天低树，江清月近人。')
    expect(r.form?.id).toBe('wujue')
    expect(r.stats.errors).toBe(0)
  })

  it('《静夜思》为古绝，近体检测应报出律（失替/孤平/失粘等）', () => {
    const r = checkMeter('床前明月光，疑是地上霜。举头望明月，低头思故乡。')
    expect(r.passed).toBe(false)
    expect(
      r.issues.some(
        (i) => i.level === 'error' && (i.category === 'ti' || i.category === 'guping' || i.category === 'nian'),
      ),
    ).toBe(true)
  })

  it('中华新韵亦可检测《登鹳雀楼》', () => {
    const r = checkMeter('白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', { rhymeBook: 'xinyun' })
    expect(r.form?.id).toBe('wujue')
  })

  it('输出逐字平仄单元（供展示）', () => {
    const r = checkMeter('白日依山尽，黄河入海流。欲穷千里目，更上一层楼。')
    expect(r.lines).toHaveLength(4)
    expect(r.lines?.[0]?.cells).toHaveLength(5)
    const first = r.lines?.[0]?.cells[0]
    expect(first?.char).toBe('白')
    expect(['level', 'oblique', 'either', 'unknown']).toContain(first?.tone)
    expect(first?.expected).toBeDefined()
    expect(r.lines?.[1]?.cells[4]?.isRhyme).toBe(true)
  })
})
