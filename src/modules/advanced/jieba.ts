/**
 * 可选的 jieba 分词词性（@node-rs/jieba）。
 * 缺依赖或非 Node 环境时返回 undefined，调用方据此降级为纯平仄启发式。
 */
export interface Seg {
  word: string
  tag: string
}

type Tagger = { tag(text: string): Seg[] }

// undefined=未尝试加载；null=不可用；对象=可用实例
let instance: Tagger | null | undefined

async function getTagger(): Promise<Tagger | null> {
  if (instance !== undefined) return instance
  try {
    const mod = (await import('@node-rs/jieba')) as unknown as {
      Jieba: { withDict(dict: Buffer): Tagger }
    }
    const dictMod = (await import('@node-rs/jieba/dict')) as unknown as { dict: Buffer }
    instance = mod.Jieba.withDict(dictMod.dict)
  } catch {
    instance = null
  }
  return instance
}

/** 对文本做分词+词性标注；不可用时返回 undefined。 */
export async function tagPos(text: string): Promise<Seg[] | undefined> {
  const tagger = await getTagger()
  if (!tagger) return undefined
  try {
    return tagger.tag(text)
  } catch {
    return undefined
  }
}
