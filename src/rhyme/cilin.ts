/** 词林正韵（填词用，19 部，每部分平声/仄声）。 */
import type { Tone } from '../core/types'
import { cilinData } from './raw'
import { addEntry, IndexedRhymeTable, type RhymeIndex } from './rhyme-table'

const TONE_BY_KEY: Record<string, Tone> = { 平声: 'level', 仄声: 'oblique' }

function build(): RhymeIndex {
  const index: RhymeIndex = new Map()
  for (const [bu, sub] of Object.entries(cilinData)) {
    for (const [toneKey, chars] of Object.entries(sub)) {
      const tone = TONE_BY_KEY[toneKey] ?? 'oblique'
      const group = { id: `cilin:${bu}:${toneKey}`, label: `${bu}（${toneKey}）`, tone }
      for (const ch of chars) addEntry(index, ch, tone, group)
    }
  }
  return index
}

let table: IndexedRhymeTable | undefined
export function cilin(): IndexedRhymeTable {
  if (!table) table = new IndexedRhymeTable('cilin', '词林正韵', build())
  return table
}
