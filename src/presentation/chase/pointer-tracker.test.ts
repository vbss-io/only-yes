import { PointerTracker } from '@/presentation/chase/pointer-tracker'
import { describe, expect, it } from 'vitest'

describe('PointerTracker', () => {
  it('has no position before the first sample', () => {
    const tracker = new PointerTracker()

    expect(tracker.current()).toBeNull()
    expect(tracker.predict(100, 0)).toBeNull()
  })

  it('reports the latest sample as current', () => {
    const tracker = new PointerTracker()
    tracker.push(1, 2, 0)
    tracker.push(5, 6, 10)

    expect(tracker.current()).toEqual({ x: 5, y: 6 })
  })

  it('has zero velocity with fewer than two fresh samples', () => {
    const tracker = new PointerTracker()
    tracker.push(0, 0, 0)

    expect(tracker.velocity(0)).toEqual({ x: 0, y: 0 })
  })

  it('computes velocity in px per ms from the fresh samples', () => {
    const tracker = new PointerTracker()
    tracker.push(0, 0, 0)
    tracker.push(10, -5, 10)

    expect(tracker.velocity(10)).toEqual({ x: 1, y: -0.5 })
  })

  it('ignores samples older than the freshness window', () => {
    const tracker = new PointerTracker()
    tracker.push(0, 0, 0)
    tracker.push(100, 100, 10)

    expect(tracker.velocity(1000)).toEqual({ x: 0, y: 0 })
  })

  it('has zero velocity when the samples share a timestamp', () => {
    const tracker = new PointerTracker()
    tracker.push(0, 0, 5)
    tracker.push(50, 50, 5)

    expect(tracker.velocity(5)).toEqual({ x: 0, y: 0 })
  })

  it('caps the speed at 6 px per ms in both directions', () => {
    const tracker = new PointerTracker()
    tracker.push(0, 0, 0)
    tracker.push(1000, -1000, 10)

    expect(tracker.velocity(10)).toEqual({ x: 6, y: -6 })
  })

  it('predicts ahead along the velocity', () => {
    const tracker = new PointerTracker()
    tracker.push(0, 0, 0)
    tracker.push(10, 20, 10)

    expect(tracker.predict(100, 10)).toEqual({ x: 110, y: 220 })
  })

  it('keeps only the last eight samples', () => {
    const tracker = new PointerTracker()
    for (let i = 0; i < 20; i++) tracker.push(i, 0, i)

    expect(tracker.velocity(19)).toEqual({ x: 1, y: 0 })
    tracker.clear()
    expect(tracker.current()).toBeNull()
  })
})
