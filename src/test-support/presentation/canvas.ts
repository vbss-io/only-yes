import { vi, type Mock } from 'vitest'

export interface FakeContext2d {
  save: Mock
  restore: Mock
  translate: Mock
  rotate: Mock
  scale: Mock
  fillRect: Mock
  clearRect: Mock
  fillText: Mock
  beginPath: Mock
  closePath: Mock
  arc: Mock
  arcTo: Mock
  moveTo: Mock
  lineTo: Mock
  fill: Mock
  stroke: Mock
  measureText: Mock
  createLinearGradient: Mock
  addColorStop: Mock
  fillStyle: unknown
  globalAlpha: number
  font: string
}

export const CHAR_WIDTH = 10

export const stubCanvas2d = (): FakeContext2d => {
  const addColorStop = vi.fn()
  const context: FakeContext2d = {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * CHAR_WIDTH })),
    createLinearGradient: vi.fn(() => ({ addColorStop })),
    addColorStop,
    fillStyle: '',
    globalAlpha: 1,
    font: ''
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,FAKE')
  return context
}

export const stubCanvasWithoutContext = (): void => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
}

export interface Clock {
  now: number
}

export const stubClock = (start = 1000): Clock => {
  const clock: Clock = { now: start }
  vi.spyOn(performance, 'now').mockImplementation(() => clock.now)
  return clock
}

export interface AnimationFrames {
  pending: () => number
  run: (stepMs: number, maxFrames?: number) => number
}

export const stubAnimationFrames = (clock: Clock = { now: performance.now() }): AnimationFrames => {
  let queue: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    queue.push(callback)
    return queue.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => {
    queue = []
  })
  return {
    pending: () => queue.length,
    run: (stepMs, maxFrames = 1000) => {
      let frames = 0
      while (queue.length > 0 && frames < maxFrames) {
        const batch = queue
        queue = []
        clock.now += stepMs
        batch.forEach((callback) => callback(clock.now))
        frames += 1
      }
      return frames
    }
  }
}
