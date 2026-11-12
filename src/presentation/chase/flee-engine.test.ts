import { FleeEngine } from '@/presentation/chase/flee-engine'
import type { Size } from '@/presentation/chase/geometry'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SIZE: Size = { width: 100, height: 50 }
let bounds: Size

const createEngine = (fleeRadius?: number): FleeEngine =>
  new FleeEngine({ bounds: () => bounds, size: () => SIZE, fleeRadius })

const settle = (engine: FleeEngine, steps = 300, now = 10_000): void => {
  for (let i = 0; i < steps; i++) engine.step({ dtMs: 16, pointer: null, predicted: null, now })
}

beforeEach(() => {
  bounds = { width: 800, height: 600 }
  vi.spyOn(Math, 'random').mockReturnValue(0.9)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('FleeEngine state', () => {
  it('starts at the origin without having fled', () => {
    const engine = createEngine()

    expect(engine.position()).toEqual({ x: 0, y: 0 })
    expect(engine.hasFled()).toBe(false)
  })

  it('moves to a position and stops fleeing', () => {
    const engine = createEngine()
    engine.threaten({ x: 0, y: 0 }, 1000)

    engine.moveTo({ x: 40, y: 30 })

    expect(engine.position()).toEqual({ x: 40, y: 30 })
    expect(engine.hasFled()).toBe(false)
  })

  it('returns a copy of the position', () => {
    const engine = createEngine()
    engine.reset({ x: 5, y: 6 })

    engine.position().x = 999

    expect(engine.position()).toEqual({ x: 5, y: 6 })
  })

  it('reset clears the dodge cooldown so the next threat dodges at once', () => {
    const engine = createEngine()
    expect(engine.threaten({ x: 0, y: 0 }, 1000)).toBe(true)
    expect(engine.threaten({ x: 0, y: 0 }, 1010)).toBe(false)

    engine.reset({ x: 0, y: 0 })

    expect(engine.threaten({ x: 0, y: 0 }, 1020)).toBe(true)
  })
})

describe('FleeEngine threat handling', () => {
  it('flees on a threat and marks itself as fled', () => {
    const engine = createEngine()

    expect(engine.threaten({ x: 50, y: 25 }, 1000)).toBe(true)
    expect(engine.hasFled()).toBe(true)
  })

  it('ignores a second threat inside the 220ms cooldown and accepts it after', () => {
    const engine = createEngine()
    engine.threaten({ x: 0, y: 0 }, 1000)

    expect(engine.threaten({ x: 0, y: 0 }, 1219)).toBe(false)
    expect(engine.threaten({ x: 0, y: 0 }, 1220)).toBe(true)
  })

  it('picks the candidate farthest from the threat', () => {
    let call = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      const index = call++
      return index < 2 || index >= 4 ? 0 : 0.9
    })
    const engine = createEngine()
    engine.threaten({ x: 10, y: 10 }, 1000)

    settle(engine)

    const position = engine.position()
    expect(position.x).toBeCloseTo(630, 0)
    expect(position.y).toBeCloseTo(495, 0)
  })

  it('flees again to a new target away from the new threat after the cooldown', () => {
    const engine = createEngine()
    engine.threaten({ x: 0, y: 0 }, 1000)
    settle(engine)
    vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(engine.threaten({ x: 640, y: 500 }, 5000)).toBe(true)
    settle(engine, 400, 6000)

    expect(engine.position().x).toBeCloseTo(8, 0)
    expect(engine.position().y).toBeCloseTo(8, 0)
  })

  it('moves toward the chosen target and settles on it', () => {
    const engine = createEngine()
    engine.reset({ x: 0, y: 0 })
    engine.threaten({ x: 0, y: 0 }, 1000)
    const first = engine.step({ dtMs: 16, pointer: null, predicted: null, now: 1016 })

    expect(first.frame.x).toBeGreaterThan(0)
    expect(first.frame.y).toBeGreaterThan(0)
    settle(engine)

    expect(engine.position().x).toBeCloseTo(630, 0)
    expect(engine.position().y).toBeCloseTo(495, 0)
  })

  it('keeps the target inside the bounds when the area shrinks', () => {
    const engine = createEngine()
    engine.threaten({ x: 0, y: 0 }, 1000)
    bounds = { width: 400, height: 300 }

    settle(engine)

    expect(engine.position().x).toBeLessThanOrEqual(400 - SIZE.width)
    expect(engine.position().y).toBeLessThanOrEqual(300 - SIZE.height)
  })
})

describe('FleeEngine step', () => {
  it('stays put and does not dodge before it has ever fled', () => {
    const engine = createEngine()
    engine.reset({ x: 200, y: 200 })

    const result = engine.step({ dtMs: 16, pointer: { x: 900, y: 900 }, predicted: null, now: 0 })

    expect(result.dodged).toBe(false)
    expect(result.frame).toEqual({ x: 200, y: 200, rotation: 0, scaleX: 1, scaleY: 1 })
  })

  it('dodges when the pointer is inside the flee radius of the center', () => {
    const engine = createEngine()
    engine.reset({ x: 200, y: 200 })

    const result = engine.step({ dtMs: 16, pointer: { x: 250, y: 225 }, predicted: null, now: 1000 })

    expect(result.dodged).toBe(true)
    expect(engine.hasFled()).toBe(true)
  })

  it('does not dodge when the pointer is outside the flee radius', () => {
    const engine = createEngine()
    engine.reset({ x: 200, y: 200 })

    const result = engine.step({ dtMs: 16, pointer: { x: 250 + 111, y: 225 }, predicted: null, now: 1000 })

    expect(result.dodged).toBe(false)
  })

  it('honors a custom flee radius', () => {
    const engine = createEngine(20)
    engine.reset({ x: 200, y: 200 })

    expect(engine.step({ dtMs: 16, pointer: { x: 250 + 40, y: 225 }, predicted: null, now: 1000 }).dodged).toBe(false)
    expect(engine.step({ dtMs: 16, pointer: { x: 250 + 10, y: 225 }, predicted: null, now: 2000 }).dodged).toBe(true)
  })

  it('dodges when only the predicted pointer is close', () => {
    const engine = createEngine()
    engine.reset({ x: 200, y: 200 })

    const result = engine.step({
      dtMs: 16,
      pointer: { x: 250 + 300, y: 225 },
      predicted: { x: 250 + 30, y: 225 },
      now: 1000
    })

    expect(result.dodged).toBe(true)
  })

  it('does not dodge when both the pointer and the prediction are far', () => {
    const engine = createEngine()
    engine.reset({ x: 200, y: 200 })

    const result = engine.step({
      dtMs: 16,
      pointer: { x: 700, y: 500 },
      predicted: { x: 650, y: 500 },
      now: 1000
    })

    expect(result.dodged).toBe(false)
  })

  it('does not dodge without a pointer even when a prediction is close', () => {
    const engine = createEngine()
    engine.reset({ x: 200, y: 200 })

    const result = engine.step({ dtMs: 16, pointer: null, predicted: { x: 250, y: 225 }, now: 1000 })

    expect(result.dodged).toBe(false)
  })

  it('rate limits dodges across steps', () => {
    const engine = createEngine()
    engine.reset({ x: 200, y: 200 })
    const near = { x: 250, y: 225 }

    const first = engine.step({ dtMs: 16, pointer: near, predicted: null, now: 1000 })
    const second = engine.step({ dtMs: 16, pointer: engine.position(), predicted: null, now: 1100 })

    expect(first.dodged).toBe(true)
    expect(second.dodged).toBe(false)
  })

  it('caps a long frame to 32ms so a stall does not teleport the button', () => {
    const long = createEngine()
    const short = createEngine()
    long.threaten({ x: 0, y: 0 }, 1000)
    short.threaten({ x: 0, y: 0 }, 1000)

    const a = long.step({ dtMs: 5000, pointer: null, predicted: null, now: 2000 })
    const b = short.step({ dtMs: 32, pointer: null, predicted: null, now: 2000 })

    expect(a.frame).toEqual(b.frame)
  })

  it('treats a negative frame time as zero', () => {
    const engine = createEngine()
    engine.threaten({ x: 0, y: 0 }, 1000)

    const result = engine.step({ dtMs: -50, pointer: null, predicted: null, now: 2000 })

    expect(result.frame.x).toBe(0)
    expect(result.frame.y).toBe(0)
  })

  it('tilts in the direction of travel', () => {
    const engine = createEngine()
    engine.threaten({ x: 0, y: 0 }, 1000)

    const result = engine.step({ dtMs: 32, pointer: null, predicted: null, now: 1100 })
    const later = engine.step({ dtMs: 32, pointer: null, predicted: null, now: 1200 })

    expect(result.frame.rotation).toBeGreaterThan(0)
    expect(Math.abs(later.frame.rotation)).toBeLessThanOrEqual(14)
  })
})

describe('FleeEngine wall collisions', () => {
  const runUntilFast = (engine: FleeEngine): void => {
    engine.threaten({ x: 0, y: 0 }, 1000)
    for (let i = 0; i < 6; i++) engine.step({ dtMs: 16, pointer: null, predicted: null, now: 1000 })
  }

  it('squashes horizontally when it hits a side wall fast', () => {
    const engine = createEngine()
    runUntilFast(engine)
    bounds = { width: 100 + 20, height: 600 }

    const result = engine.step({ dtMs: 16, pointer: null, predicted: null, now: 1000 })

    expect(result.frame.x).toBeLessThanOrEqual(20)
    expect(result.frame.scaleX).toBeLessThan(1)
    expect(result.frame.scaleY).toBeGreaterThan(1)
  })

  it('squashes vertically when it hits the floor fast', () => {
    const engine = createEngine()
    runUntilFast(engine)
    bounds = { width: 800, height: 50 + 20 }

    const result = engine.step({ dtMs: 16, pointer: null, predicted: null, now: 1000 })

    expect(result.frame.y).toBeLessThanOrEqual(20)
    expect(result.frame.scaleX).toBeGreaterThan(1)
    expect(result.frame.scaleY).toBeLessThan(1)
  })

  it('recovers its shape after the squash duration', () => {
    const engine = createEngine()
    runUntilFast(engine)
    bounds = { width: 100 + 20, height: 600 }
    engine.step({ dtMs: 16, pointer: null, predicted: null, now: 1000 })

    let frame = engine.step({ dtMs: 32, pointer: null, predicted: null, now: 1000 }).frame
    for (let i = 0; i < 6; i++) frame = engine.step({ dtMs: 32, pointer: null, predicted: null, now: 1000 }).frame

    expect(frame.scaleX).toBe(1)
    expect(frame.scaleY).toBe(1)
  })

  it('does not squash when it touches a wall slowly', () => {
    const engine = createEngine()
    engine.reset({ x: 700, y: 0 })
    engine.threaten({ x: 0, y: 0 }, 1000)
    bounds = { width: 790, height: 600 }

    const result = engine.step({ dtMs: 1, pointer: null, predicted: null, now: 1000 })

    expect(result.frame.scaleX).toBe(1)
    expect(result.frame.scaleY).toBe(1)
  })
})
