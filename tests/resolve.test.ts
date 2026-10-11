import { describe, it, expect } from 'vitest'
import { checkMeter, checkMeterResolved } from '../src/index'
import type { PolyphoneResolver } from '../src/index'

const POEM = '红豆生南国，春来发几枝。愿君多采撷，此物最相思。'

// 仅对“相”定音为平，其余返回 null（避免引入不实读音）。
const resolver: PolyphoneResolver = {
  async resolve(char) {
    if (char === '相') return { char, chosen: { group: '七阳', tone: 'level' }, confidence: 0.95, reason: 'test' }
    return null
  },
}

describe('多音字消歧复检', () => {
  it('消歧后相应多音字提示减少，且仍合律', async () => {
    const base = checkMeter(POEM)
    const polyBase = base.issues.filter((i) => i.category === 'polyphone').length
    expect(polyBase).toBeGreaterThan(0)
    expect(base.issues.some((i) => i.category === 'polyphone' && i.position?.char === '相')).toBe(true)

    const { result, resolutions } = await checkMeterResolved(POEM, resolver)
    expect(resolutions.some((r) => r.char === '相')).toBe(true)
    expect(result.issues.some((i) => i.category === 'polyphone' && i.position?.char === '相')).toBe(false)
    expect(result.issues.filter((i) => i.category === 'polyphone').length).toBeLessThan(polyBase)
    expect(result.stats.errors).toBe(0)
  })
})
