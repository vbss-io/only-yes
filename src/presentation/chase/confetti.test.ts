import { burstConfetti } from '@/presentation/chase/confetti'
import { stubMatchMedia } from '@/test-support/presentation/browser'
import { stubAnimationFrames, stubCanvas2d, stubCanvasWithoutContext } from '@/test-support/presentation/canvas'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const canvases = (): NodeListOf<HTMLCanvasElement> => document.body.querySelectorAll('canvas')

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  vi.useRealTimers()
})

describe('burstConfetti', () => {
  it('adds nothing and cleans up when the canvas has no 2d context', () => {
    stubCanvasWithoutContext()
    stubMatchMedia(false)

    burstConfetti(10, 10)

    expect(canvases()).toHaveLength(0)
  })

  it('covers the viewport with a click-through overlay scaled by the pixel ratio', () => {
    const context = stubCanvas2d()
    stubMatchMedia(true)
    vi.stubGlobal('devicePixelRatio', 2)
    vi.useFakeTimers()

    burstConfetti(10, 10)

    const canvas = canvases()[0]
    expect(canvas.style.pointerEvents).toBe('none')
    expect(canvas.style.position).toBe('fixed')
    expect(canvas.width).toBe(window.innerWidth * 2)
    expect(canvas.height).toBe(window.innerHeight * 2)
    expect(context.scale).toHaveBeenCalledWith(2, 2)
  })

  it('caps the pixel ratio at 2', () => {
    const context = stubCanvas2d()
    stubMatchMedia(true)
    vi.stubGlobal('devicePixelRatio', 5)
    vi.useFakeTimers()

    burstConfetti(0, 0)

    expect(context.scale).toHaveBeenCalledWith(2, 2)
  })

  it('falls back to a pixel ratio of 1 when the browser reports none', () => {
    const context = stubCanvas2d()
    stubMatchMedia(true)
    vi.stubGlobal('devicePixelRatio', 0)
    vi.useFakeTimers()

    burstConfetti(0, 0)

    expect(context.scale).toHaveBeenCalledWith(1, 1)
  })

  it('with reduced motion draws one frame of 180 pieces and removes the overlay after 1.2s', () => {
    const context = stubCanvas2d()
    stubMatchMedia(true)
    vi.useFakeTimers()

    burstConfetti(100, 200)

    expect(context.fillRect).toHaveBeenCalledTimes(180)
    expect(canvases()).toHaveLength(1)
    vi.advanceTimersByTime(1199)
    expect(canvases()).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(canvases()).toHaveLength(0)
  })

  it('animates frame after frame and removes the overlay once every piece has faded', () => {
    const context = stubCanvas2d()
    stubMatchMedia(false)
    const frames = stubAnimationFrames()

    burstConfetti(100, 200)

    expect(canvases()).toHaveLength(1)
    expect(frames.pending()).toBe(1)
    const ran = frames.run(40)

    expect(ran).toBeGreaterThan(50)
    expect(context.clearRect).toHaveBeenCalled()
    expect(context.fillRect.mock.calls.length).toBeGreaterThan(180)
    expect(canvases()).toHaveLength(0)
    expect(frames.pending()).toBe(0)
  })

  it('draws every piece with the configured palette', () => {
    const context = stubCanvas2d()
    stubMatchMedia(true)
    vi.useFakeTimers()
    const colors = new Set<unknown>()
    Object.defineProperty(context, 'fillStyle', {
      configurable: true,
      get: () => '',
      set: (value: unknown) => {
        colors.add(value)
      }
    })

    burstConfetti(0, 0)

    expect(colors.size).toBeGreaterThan(1)
    colors.forEach((color) => expect(['#EC4899', '#A855F7', '#F59E0B', '#FDE68A', '#F472B6']).toContain(color))
  })
})
