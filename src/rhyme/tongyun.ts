/**
 * 中华通韵（今音，16 韵部）。依普通话读音（pinyin-pro）映射韵部与平仄：
 * 声调 1/2 → 平，3/4 → 仄（今音无入声）。押韵以 16 韵部为准。
 * 为可选能力：需安装 pinyin-pro；用 createTongyunRhymeTable() 异步构建后注册。
 */
import type { RhymeBookId, RhymeGroup, Tone, ToneInfo } from '../core/types'
import type { RhymeTable } from './rhyme-table'

interface Reading {
  pinyin: string
  final: string
  num: number
}
type PinyinFn = (text: string, opt: Record<string, unknown>) => Reading[]

const STRIP: Record<string, string> = {}
for (const [base, marks] of Object.entries({
  a: 'āáǎà',
  e: 'ēéěè',
  i: 'īíǐì',
  o: 'ōóǒò',
  u: 'ūúǔù',
  ü: 'ǖǘǚǜ',
})) {
  for (const ch of marks) STRIP[ch] = base
}
const strip = (s: string): string => [...s].map((c) => STRIP[c] ?? c).join('')

/** 韵母（去调、ü 记作 v）→ 16 韵部。 */
const FINAL2BU: Record<string, string> = {
  a: '一啊', ia: '一啊', ua: '一啊',
  o: '二喔', uo: '二喔',
  e: '三鹅', ê: '三鹅', ie: '三鹅', ve: '三鹅', ue: '三鹅',
  i: '四衣',
  u: '五乌',
  v: '六迂',
  ai: '七哀', uai: '七哀',
  ei: '八欸', ui: '八欸',
  ao: '九熬', iao: '九熬',
  ou: '十欧', iu: '十欧',
  an: '十一安', ian: '十一安', uan: '十一安', van: '十一安',
  en: '十二恩', in: '十二恩', un: '十二恩', vn: '十二恩',
  ang: '十三昂', iang: '十三昂', uang: '十三昂',
  eng: '十四英', ing: '十四英',
  ong: '十五雍', iong: '十五雍',
  er: '十六儿',
}
/** pinyin-pro 将 y+ü 系（yu/yuan/yue/yun）的 ü 写作 u，需按整音校正。 */
const YU_PATCH: Record<string, string> = { yu: '六迂', yuan: '十一安', yue: '三鹅', yun: '十二恩' }

function readingToBu(fullToneless: string, finalToneless: string): string | undefined {
  if (YU_PATCH[fullToneless]) return YU_PATCH[fullToneless]
  return FINAL2BU[finalToneless.replace(/ü/g, 'v')]
}

class TongyunRhymeTable implements RhymeTable {
  readonly id: RhymeBookId = 'tongyun'
  readonly name = '中华通韵'
  constructor(private readonly py: PinyinFn) {}

  getToneInfo(char: string): ToneInfo {
    let readings: Reading[] = []
    try {
      readings = this.py(char, { multiple: true, type: 'all' })
    } catch {
      readings = []
    }
    const tones = new Set<Tone>()
    const groups: RhymeGroup[] = []
    for (const r of readings) {
      const tone: Tone | undefined =
        r.num === 1 || r.num === 2 ? 'level' : r.num === 3 || r.num === 4 ? 'oblique' : undefined
      if (!tone) continue
      tones.add(tone)
      const bu = readingToBu(strip(r.pinyin), strip(r.final))
      if (bu && !groups.some((g) => g.label === bu)) groups.push({ id: `tongyun:${bu}`, label: bu, tone })
    }
    if (tones.size === 0) return { tones: ['unknown'], groups: [], isPolyphone: false }
    const arr = [...tones]
    const pingze = new Set(arr.filter((t) => t === 'level' || t === 'oblique'))
    return { tones: arr, groups, isPolyphone: pingze.size > 1 }
  }

  getRhymeGroups(char: string): RhymeGroup[] {
    return this.getToneInfo(char).groups
  }

  isSameRhyme(a: string, b: string): boolean {
    const ga = this.getRhymeGroups(a)
    const gb = this.getRhymeGroups(b)
    if (ga.length === 0 || gb.length === 0) return false
    const ids = new Set(ga.map((g) => g.id))
    return gb.some((g) => ids.has(g.id))
  }
}

/** 异步构建中华通韵韵表（需已安装可选依赖 pinyin-pro）。构建后用 registerRhymeTable 注册即可。 */
export async function createTongyunRhymeTable(): Promise<RhymeTable> {
  const mod = (await import('pinyin-pro')) as unknown as { pinyin: PinyinFn }
  return new TongyunRhymeTable(mod.pinyin)
}
