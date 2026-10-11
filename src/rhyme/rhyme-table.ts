/**
 * 韵表抽象：统一提供“字 -> 平仄 / 韵部”查询，是押韵与平仄判定的共同数据源。
 */
import type { RhymeBookId, RhymeGroup, Tone, ToneInfo } from '../core/types'

export interface RhymeTable {
  readonly id: RhymeBookId
  readonly name: string
  /** 查询一个字的平仄与韵部信息。 */
  getToneInfo(char: string): ToneInfo
  /** 查询一个字可归属的韵部。 */
  getRhymeGroups(char: string): RhymeGroup[]
  /** 两字是否可押同一韵（共享任一韵部）。 */
  isSameRhyme(a: string, b: string): boolean
}

export interface RhymeIndexEntry {
  tones: Set<Tone>
  groups: RhymeGroup[]
}
export type RhymeIndex = Map<string, RhymeIndexEntry>

/** 以预建倒排索引实现的通用韵表，子类只需构建索引。 */
export class IndexedRhymeTable implements RhymeTable {
  constructor(
    readonly id: RhymeBookId,
    readonly name: string,
    private readonly index: RhymeIndex,
    /**
     * 平仄增补：合并额外平仄来源（如广韵），补齐主表缺失/不全的读音并扩大生僻字覆盖。
     * 仅影响平仄（押韵分部始终以主表为准）；若某字实为多音，由此纠正为“两可”，避免误判出律。
     */
    private readonly toneAugment?: (char: string) => Tone[] | undefined,
  ) {}

  getToneInfo(char: string): ToneInfo {
    const e = this.index.get(char)
    const tones = new Set<Tone>(e ? e.tones : [])
    const aug = this.toneAugment?.(char)
    if (aug) for (const t of aug) tones.add(t)
    if (tones.size === 0) return { tones: ['unknown'], groups: [], isPolyphone: false }
    const arr = [...tones]
    const pingze = new Set(arr.filter((t) => t === 'level' || t === 'oblique'))
    return { tones: arr, groups: e ? e.groups : [], isPolyphone: pingze.size > 1 }
  }

  getRhymeGroups(char: string): RhymeGroup[] {
    return this.index.get(char)?.groups ?? []
  }

  isSameRhyme(a: string, b: string): boolean {
    const ga = this.getRhymeGroups(a)
    const gb = this.getRhymeGroups(b)
    if (ga.length === 0 || gb.length === 0) return false
    const ids = new Set(ga.map((g) => g.id))
    return gb.some((g) => ids.has(g.id))
  }
}

/** 向索引登记某字的平仄与所属韵部。 */
export function addEntry(
  index: RhymeIndex,
  char: string,
  tone: Tone,
  group: RhymeGroup,
): void {
  let e = index.get(char)
  if (!e) {
    e = { tones: new Set(), groups: [] }
    index.set(char, e)
  }
  e.tones.add(tone)
  if (!e.groups.some((g) => g.id === group.id)) e.groups.push(group)
}
