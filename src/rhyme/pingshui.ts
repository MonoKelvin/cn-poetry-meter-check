/**
 * 平水韵（默认韵表，中古音，入声归仄）。
 * 平仄判定在平水韵未收录时，以广韵声调表兜底，扩大生僻字覆盖；押韵分部仍以平水韵为准。
 */
import type { Tone } from '../core/types'
import { guangyunData, pingshuiData } from './raw'
import { addEntry, IndexedRhymeTable, type RhymeIndex } from './rhyme-table'

/** 声部 -> 平仄：上平/下平为平，上/去/入为仄。 */
const SECTION_TONE: Record<string, Tone> = {
  上平声部: 'level',
  下平声部: 'level',
  上声部: 'oblique',
  去声部: 'oblique',
  入声部: 'oblique',
}

function build(): RhymeIndex {
  const index: RhymeIndex = new Map()
  for (const [section, rhymes] of Object.entries(pingshuiData)) {
    const tone = SECTION_TONE[section] ?? 'oblique'
    for (const [rhymeName, chars] of Object.entries(rhymes)) {
      const group = { id: `pingshui:${rhymeName}`, label: rhymeName, tone }
      for (const ch of chars) addEntry(index, ch, tone, group)
    }
  }
  return index
}

/** 广韵声调兜底：'平'→平，'仄'→仄，'多'→两可。 */
function guangyunFallback(char: string): Tone[] | undefined {
  const v = guangyunData[char]
  if (v === '平') return ['level']
  if (v === '仄') return ['oblique']
  if (v === '多') return ['level', 'oblique']
  return undefined
}

let table: IndexedRhymeTable | undefined
/** 获取平水韵韵表（惰性构建索引，含广韵平仄兜底）。 */
export function pingshui(): IndexedRhymeTable {
  if (!table) table = new IndexedRhymeTable('pingshui', '平水韵', build(), guangyunFallback)
  return table
}
