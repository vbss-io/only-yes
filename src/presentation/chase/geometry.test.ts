import { clamp, clampToBounds, distance, rectCenter } from '@/presentation/chase/geometry'
import { describe, expect, it } from 'vitest'

describe('geometry', () => {
  it('measures the distance between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })

  it('clamps a value inside the interval', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('keeps a box inside the bounds honoring the margin', () => {
    const size = { width: 100, height: 50 }
    const bounds = { width: 400, height: 300 }

    expect(clampToBounds({ x: -20, y: -20 }, size, bounds, 8)).toEqual({ x: 8, y: 8 })
    expect(clampToBounds({ x: 999, y: 999 }, size, bounds, 8)).toEqual({ x: 292, y: 242 })
    expect(clampToBounds({ x: 50, y: 60 }, size, bounds)).toEqual({ x: 50, y: 60 })
  })

  it('pins to the margin when the box is bigger than the bounds', () => {
    expect(clampToBounds({ x: 30, y: 30 }, { width: 500, height: 500 }, { width: 100, height: 100 }, 4)).toEqual({ x: 4, y: 4 })
  })

  it('finds the center of a rect', () => {
    expect(rectCenter({ x: 10, y: 20, width: 100, height: 40 })).toEqual({ x: 60, y: 40 })
  })
})
