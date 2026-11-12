import { TAUNT_COUNT, computeActState } from '@/presentation/chase/chase-acts'
import { describe, expect, it } from 'vitest'

describe('computeActState', () => {
  it('stays calm in act one before five dodges', () => {
    for (const dodges of [0, 1, 4]) {
      expect(computeActState(dodges)).toEqual({ act: 1, scale: 1, tauntIndex: null, tremor: false })
    }
  })

  it('shrinks and taunts in act two', () => {
    const state = computeActState(5)

    expect(state.act).toBe(2)
    expect(state.scale).toBeCloseTo(0.9)
    expect(state.tauntIndex).toBe(0)
    expect(state.tremor).toBe(true)
  })

  it('cycles the taunts through the five lines', () => {
    expect(TAUNT_COUNT).toBe(5)
    expect([5, 6, 7, 8, 9].map((d) => computeActState(d).tauntIndex)).toEqual([0, 1, 2, 3, 4])
  })

  it('never shrinks below the minimum scale', () => {
    expect(computeActState(9).scale).toBeGreaterThanOrEqual(0.6)
    expect(computeActState(9).scale).toBeCloseTo(0.6)
  })

  it('goes quiet but tiny and trembling in act three', () => {
    expect(computeActState(10)).toEqual({ act: 3, scale: 0.6, tauntIndex: null, tremor: true })
    expect(computeActState(500).act).toBe(3)
  })
})
