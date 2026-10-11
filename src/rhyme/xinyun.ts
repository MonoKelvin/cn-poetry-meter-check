/** 中华新韵（今音，14 韵，每韵分平/仄）。 */
import type { Tone } from '../core/types'
import { xinyunData } from './raw'
import { addEntry, IndexedRhymeTable, type RhymeIndex } from './rhyme-table'

const TONE_BY_KEY: Record<string, Tone> = { 平: 'level', 仄: 'oblique' }

function build(): RhymeIndex {
  const index: RhymeIndex = new Map()
  for (const [yun, sub] of Object.entries(xinyunData)) {
    for (const [toneKey, chars] of Object.entries(sub)) {
      const tone = TONE_BY_KEY[toneKey] ?? 'oblique'
      const group = { id: `xinyun:${yun}:${toneKey}`, label: `${yun}（${toneKey}）`, tone }
      for (const ch of chars) addEntry(index, ch, tone, group)
    }
  }
  return index
}

let table: IndexedRhymeTable | undefined
export function xinyun(): IndexedRhymeTable {
  if (!table) table = new IndexedRhymeTable('xinyun', '中华新韵', build())
  return table
}
