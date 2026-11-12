import { phyllotaxisPosition } from '@/presentation/chase/phyllotaxis'
import { describe, expect, it } from 'vitest'

describe('phyllotaxisPosition', () => {
  const bounds = { width: 800, height: 600 }
  const item = { width: 128, height: 56 }

  it('is deterministic for an index', () => {
    expect(phyllotaxisPosition(3, bounds, item)).toEqual(phyllotaxisPosition(3, bounds, item))
  })

  it('spreads items on different positions', () => {
    const positions = Array.from({ length: 30 }, (_, i) => phyllotaxisPosition(i, bounds, item))
    const unique = new Set(positions.map((p) => `${Math.round(p.x)}:${Math.round(p.y)}`))

    expect(unique.size).toBe(30)
  })

  it('keeps every item inside the bounds with the 4px margin', () => {
    for (let i = 0; i < 400; i++) {
      const p = phyllotaxisPosition(i, bounds, item)
      expect(p.x).toBeGreaterThanOrEqual(4)
      expect(p.y).toBeGreaterThanOrEqual(4)
      expect(p.x).toBeLessThanOrEqual(bounds.width - item.width - 4)
      expect(p.y).toBeLessThanOrEqual(bounds.height - item.height - 4)
    }
  })

  it('moves outward from the center as the index grows', () => {
    const center = { x: bounds.width / 2 - item.width / 2, y: bounds.height / 2 - item.height / 2 }
    const far = phyllotaxisPosition(40, bounds, item)
    const near = phyllotaxisPosition(0, bounds, item)

    expect(Math.hypot(far.x - center.x, far.y - center.y)).toBeGreaterThan(Math.hypot(near.x - center.x, near.y - center.y))
  })
})
