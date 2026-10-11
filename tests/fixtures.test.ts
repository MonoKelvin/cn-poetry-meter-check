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
  {
    title: '芙蓉楼送辛渐（王昌龄，七绝首句入韵）',
    form: 'qijue',
    text: '寒雨连江夜入吴，平明送客楚山孤。洛阳亲友如相问，一片冰心在玉壶。',
  },
  {
    title: '蜀相（杜甫，七律首句入韵）',
    form: 'qilv',
    text: '丞相祠堂何处寻，锦官城外柏森森。映阶碧草自春色，隔叶黄鹂空好音。三顾频烦天下计，两朝开济老臣心。出师未捷身先死，长使英雄泪满襟。',
  },
  {
    title: '旅夜书怀（杜甫，五律仄起不入韵）',
    form: 'wulv',
    text: '细草微风岸，危樯独夜舟。星垂平野阔，月涌大江流。名岂文章著，官应老病休。飘飘何所似，天地一沙鸥。',
  },
  {
    title: '早发白帝城（李白，七绝首句入韵）',
    form: 'qijue',
    text: '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。',
  },
  {
    title: '次北固山下（王湾，五律）',
    form: 'wulv',
    text: '客路青山外，行舟绿水前。潮平两岸阔，风正一帆悬。海日生残夜，江春入旧年。乡书何处达，归雁洛阳边。',
  },
  {
    title: '送杜少府之任蜀州（王勃，五律）',
    form: 'wulv',
    text: '城阙辅三秦，风烟望五津。与君离别意，同是宦游人。海内存知己，天涯若比邻。无为在歧路，儿女共沾巾。',
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

describe('仄韵古绝应判为不合近体（押韵报错）', () => {
  it('《江雪》仄韵五绝', () => {
    const r = checkMeter('千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。')
    expect(r.issues.some((i) => i.category === 'rhyme')).toBe(true)
  })

  it('《鹿柴》仄韵五绝', () => {
    const r = checkMeter('空山不见人，但闻人语响。返景入深林，复照青苔上。')
    expect(r.issues.some((i) => i.category === 'rhyme')).toBe(true)
  })
})
