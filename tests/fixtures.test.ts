import { describe, it, expect } from 'vitest'
import { checkMeter } from '../src/index'
import type { PoemFormId } from '../src/core/types'

// 经典近体诗（均为平声韵、公认合律），断言无 error 级问题。
const CANON: { title: string; form: PoemFormId; text: string }[] = [
  {
    title: '出塞（王昌龄）',
    form: 'qijue',
    text: '秦时明月汉时关，万里长征人未还。但使龙城飞将在，不教胡马度阴山。',
  },
  {
    title: '泊秦淮（杜牧）',
    form: 'qijue',
    text: '烟笼寒水月笼沙，夜泊秦淮近酒家。商女不知亡国恨，隔江犹唱后庭花。',
  },
  {
    title: '登高（杜甫）',
    form: 'qilv',
    text: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
  },
  {
    title: '山居秋暝（王维）',
    form: 'wulv',
    text: '空山新雨后，天气晚来秋。明月松间照，清泉石上流。竹喧归浣女，莲动下渔舟。随意春芳歇，王孙自可留。',
  },
  {
    title: '春望（杜甫）',
    form: 'wulv',
    text: '国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。烽火连三月，家书抵万金。白头搔更短，浑欲不胜簪。',
  },
]

describe('经典近体诗回归', () => {
  for (const poem of CANON) {
    it(`${poem.title} 合律`, () => {
      const r = checkMeter(poem.text)
      expect(r.form?.id).toBe(poem.form)
      if (r.stats.errors > 0) {
        // 便于定位：打印 error 级问题
        console.log(poem.title, r.issues.filter((i) => i.level === 'error').map((i) => i.message))
      }
      expect(r.stats.errors).toBe(0)
    })
  }
})
