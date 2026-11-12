import { ChaseDemo } from '@/presentation/components/ChaseDemo'
import { stubMatchMedia } from '@/test-support/presentation/browser'
import { stubAnimationFrames, stubCanvas2d, stubClock, type AnimationFrames, type Clock } from '@/test-support/presentation/canvas'
import { stubLayout, stubVisualViewport, type Layout } from '@/test-support/presentation/layout'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let clock: Clock
let frames: AnimationFrames
let layout: Layout

const demo = (language: 'pt' | 'en' = 'pt') =>
  renderWithProviders(
    <ChaseDemo question="Gosta?" yesText="Sim" noText="Nao" result="Eu sabia!" dodgeSuffix="Fugiu" />,
    { language }
  )

const noButton = (): HTMLElement => screen.getByRole('button', { name: 'Nao' })
const yesButtons = (): HTMLElement[] => screen.getAllByRole('button', { name: 'Sim' })

const dodge = (times: number): void => {
  for (let i = 0; i < times; i++) {
    clock.now += 300
    fireEvent.pointerEnter(noButton())
  }
}

const movePointer = (clientX: number, clientY: number): void => {
  fireEvent.pointerMove(window, { clientX, clientY })
}

const translate = (element: HTMLElement): { x: number; y: number } => {
  const match = /translate3d\((-?[\d.]+)px, (-?[\d.]+)px/.exec(element.style.transform)
  if (!match) throw new Error(`no translate in "${element.style.transform}"`)
  return { x: Number(match[1]), y: Number(match[2]) }
}

const scaleOf = (element: HTMLElement): number => Number(/scale\(([\d.]+),/.exec(element.style.transform)?.[1])

beforeEach(() => {
  clock = stubClock(1000)
  frames = stubAnimationFrames(clock)
  layout = stubLayout({ width: 600, height: 400 })
  stubMatchMedia(false)
  stubCanvas2d()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ChaseDemo basics', () => {
  it('shows the question with the yes and no buttons and nothing else', () => {
    demo()

    expect(screen.getByText('Gosta?')).toBeTruthy()
    expect(yesButtons()).toHaveLength(1)
    expect(noButton().style.transform).toBe('')
    expect(screen.queryByText('Tenta de novo')).toBeNull()
  })

  it.each([
    ['pointer enter', (el: HTMLElement) => fireEvent.pointerEnter(el)],
    ['pointer down', (el: HTMLElement) => fireEvent.pointerDown(el)],
    ['click', (el: HTMLElement) => fireEvent.click(el)]
  ])('makes the no button flee on %s', (_label, trigger) => {
    demo()

    trigger(noButton())
    act(() => {
      frames.run(16, 1)
    })

    expect(noButton().style.transform).toContain('translate3d(')
  })

  it('glides the no button to the spot it picked and settles there', () => {
    demo()
    fireEvent.pointerEnter(noButton())

    act(() => {
      frames.run(16, 120)
    })

    const position = translate(noButton())
    expect(position.x).toBeCloseTo(250, 0)
    expect(position.y).toBeCloseTo(180, 0)
    expect(scaleOf(noButton())).toBeCloseTo(1)
  })

  it('counts a single dodge when threats arrive inside the cooldown', () => {
    const user = userEvent.setup()
    demo()

    fireEvent.pointerEnter(noButton())
    fireEvent.pointerDown(noButton())
    fireEvent.click(noButton())
    return user.click(yesButtons()[0]).then(() => {
      expect(screen.getByText(/Fugiu 1x\./)).toBeTruthy()
    })
  })

  it('counts another dodge once the cooldown has passed', async () => {
    const user = userEvent.setup()
    demo()

    dodge(3)
    await user.click(yesButtons()[0])

    expect(screen.getByText(/Fugiu 3x\./)).toBeTruthy()
  })

  it('celebrates the yes with the result and no dodge note when it never fled', async () => {
    const user = userEvent.setup()
    demo()

    await user.click(yesButtons()[0])

    expect(screen.getByText('Eu sabia!')).toBeTruthy()
    expect(screen.queryByText(/Fugiu/)).toBeNull()
    expect(screen.queryByText('Gosta?')).toBeNull()
    expect(document.body.querySelectorAll('canvas').length).toBeGreaterThan(0)
  })

  it('stops the animation loop once the yes is clicked', async () => {
    const user = userEvent.setup()
    demo()
    dodge(1)

    await user.click(yesButtons()[0])

    expect(frames.pending()).toBe(0)
  })
})

describe('ChaseDemo escalation', () => {
  it.each([
    [5, 'Tenta de novo'],
    [6, 'Quase!'],
    [7, 'Aqui não'],
    [8, 'Tá lento hoje?'],
    [9, 'Desiste logo']
  ])('taunts with the matching line after %i dodges', (dodges, taunt) => {
    demo()

    dodge(dodges)

    expect(screen.getByText(taunt)).toBeTruthy()
  })

  it('does not taunt before the fifth dodge', () => {
    demo()

    dodge(4)

    expect(screen.queryByText('Tenta de novo')).toBeNull()
  })

  it('taunts in english', () => {
    demo('en')

    dodge(5)

    expect(screen.getByText('Try again')).toBeTruthy()
  })

  it('shrinks the no button as the chase goes on', () => {
    demo()

    dodge(5)
    act(() => {
      frames.run(16, 120)
    })
    const atFive = scaleOf(noButton())
    dodge(4)
    act(() => {
      frames.run(16, 120)
    })

    expect(atFive).toBeCloseTo(0.9)
    expect(scaleOf(noButton())).toBeCloseTo(0.6)
  })

  it('stops taunting and spawns yes clones in act three', () => {
    demo()

    dodge(10)

    expect(screen.queryByText('Tenta de novo')).toBeNull()
    expect(yesButtons()).toHaveLength(1 + 5)
  })

  it('keeps spawning one clone every 200ms until the area is full', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    demo()
    dodge(10)

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(yesButtons()).toHaveLength(1 + 6)
    act(() => {
      vi.advanceTimersByTime(200 * 100)
    })

    expect(yesButtons()).toHaveLength(1 + 39)
  })

  it('does not spawn clones when the area has no size', () => {
    layout.resize({ width: 0, height: 0 })
    demo()

    dodge(10)

    expect(yesButtons()).toHaveLength(1)
  })

  it('accepts the yes from a clone and counts the dodges', async () => {
    const user = userEvent.setup()
    demo()
    dodge(10)

    await user.click(yesButtons()[3])

    expect(screen.getByText('Eu sabia!')).toBeTruthy()
    expect(screen.getByText(/Fugiu 10x\./)).toBeTruthy()
    expect(screen.queryAllByRole('button', { name: 'Sim' })).toHaveLength(0)
  })

  it('makes the clones drift toward the pointer', () => {
    demo()
    dodge(10)
    movePointer(500, 300)
    act(() => {
      frames.run(32, 1)
    })
    const clone = yesButtons()[1]
    const start = translate(clone)

    act(() => {
      frames.run(32, 100)
    })

    const end = translate(clone)
    const before = Math.hypot(500 - start.x - 64, 300 - start.y - 28)
    const after = Math.hypot(500 - end.x - 64, 300 - end.y - 28)
    expect(after).toBeLessThan(before)
  })

  it('leaves clones still when the pointer is right on them', () => {
    demo()
    dodge(10)
    act(() => {
      frames.run(32, 1)
    })
    const clone = yesButtons()[1]
    const start = translate(clone)
    movePointer(start.x + 64, start.y + 28)

    act(() => {
      frames.run(32, 10)
    })

    expect(translate(clone)).toEqual(start)
  })

  it('places the clones without moving them when nothing tracks the pointer', () => {
    demo()
    dodge(10)

    act(() => {
      frames.run(32, 20)
    })

    const first = translate(yesButtons()[1])
    act(() => {
      frames.run(32, 20)
    })
    expect(translate(yesButtons()[1])).toEqual(first)
  })
})

describe('ChaseDemo pointer tracking', () => {
  it('dodges again on its own when the pointer comes close to the settled button', async () => {
    const user = userEvent.setup()
    demo()
    dodge(1)
    act(() => {
      frames.run(16, 120)
    })
    movePointer(300, 200)
    clock.now += 500

    act(() => {
      frames.run(16, 1)
    })
    await user.click(yesButtons()[0])

    expect(screen.getByText(/Fugiu 2x\./)).toBeTruthy()
  })

  it('does not dodge while the pointer stays far away', async () => {
    const user = userEvent.setup()
    demo()
    dodge(1)
    act(() => {
      frames.run(16, 120)
    })
    movePointer(590, 390)
    clock.now += 500

    act(() => {
      frames.run(16, 5)
    })
    await user.click(yesButtons()[0])

    expect(screen.getByText(/Fugiu 1x\./)).toBeTruthy()
  })

  it('reads pointer positions relative to the card', async () => {
    layout.resize({ width: 600, height: 400, left: 50, top: 30 })
    const user = userEvent.setup()
    demo()
    dodge(1)
    act(() => {
      frames.run(16, 120)
    })
    movePointer(410, 300)
    clock.now += 500

    act(() => {
      frames.run(16, 1)
    })
    await user.click(yesButtons()[0])

    expect(screen.getByText(/Fugiu 2x\./)).toBeTruthy()
  })

  it('trembles when the pointer hovers near after the fifth dodge', () => {
    demo()
    dodge(5)
    act(() => {
      frames.run(16, 120)
    })
    movePointer(250, 180)
    act(() => {
      frames.run(16, 1)
    })
    const first = translate(noButton())

    act(() => {
      frames.run(16, 1)
    })

    const second = translate(noButton())
    expect(Math.hypot(second.x - first.x, second.y - first.y)).toBeGreaterThan(0.05)
  })

  it('stays steady when the pointer is far away', () => {
    demo()
    dodge(5)
    act(() => {
      frames.run(16, 120)
    })
    movePointer(595, 395)
    act(() => {
      frames.run(16, 1)
    })
    const first = translate(noButton())

    act(() => {
      frames.run(16, 1)
    })

    const second = translate(noButton())
    expect(Math.hypot(second.x - first.x, second.y - first.y)).toBeLessThan(0.001)
  })

  it('keeps the taunt bubble near the button', () => {
    demo()
    dodge(5)

    act(() => {
      frames.run(16, 120)
    })

    const bubble = screen.getByText('Tenta de novo')
    expect(bubble.style.opacity).toBe('1')
    expect(bubble.style.transform).toContain('translate3d(')
  })

  it('moves the settled button back inside a card that shrank', () => {
    demo()
    dodge(1)
    act(() => {
      frames.run(16, 120)
    })
    layout.resize({ width: 300, height: 200 })

    fireEvent(window, new Event('resize'))
    act(() => {
      frames.run(16, 200)
    })

    expect(translate(noButton()).x).toBeLessThanOrEqual(192.5)
    expect(translate(noButton()).y).toBeLessThanOrEqual(152.5)
  })

  it('refreshes the card box on scroll too', () => {
    demo()
    dodge(1)
    act(() => {
      frames.run(16, 120)
    })
    layout.resize({ width: 300, height: 200 })

    fireEvent.scroll(window)
    act(() => {
      frames.run(16, 200)
    })

    expect(translate(noButton()).x).toBeLessThanOrEqual(192.5)
  })

  it('listens to the visual viewport too and stops listening on unmount', () => {
    const viewport = stubVisualViewport(1024, 768)
    const { unmount } = demo()
    expect(viewport.listenerCount('resize')).toBe(1)

    unmount()

    expect(viewport.listenerCount('resize')).toBe(0)
  })
})

describe('ChaseDemo reduced motion', () => {
  beforeEach(() => {
    stubMatchMedia(true)
  })

  it('teleports the button instead of gliding it', () => {
    demo()

    fireEvent.pointerEnter(noButton())

    expect(noButton().style.transform).toBe('translate3d(250px, 180px, 0)')
    expect(noButton().style.transition).toBe('opacity 0.2s')
    act(() => {
      frames.run(16, 20)
    })
    expect(noButton().style.transform).toBe('translate3d(250px, 180px, 0)')
  })

  it('teleports again on every later dodge', () => {
    demo()
    fireEvent.pointerEnter(noButton())
    vi.spyOn(Math, 'random').mockReturnValue(0)

    clock.now += 300
    fireEvent.pointerEnter(noButton())

    expect(noButton().style.transform).toBe('translate3d(8px, 8px, 0)')
  })

  it('never taunts', () => {
    demo()

    dodge(7)

    expect(screen.queryByText('Quase!')).toBeNull()
    expect(screen.queryByText('Tenta de novo')).toBeNull()
  })

  it('keeps clones where they were placed', () => {
    demo()
    dodge(10)
    act(() => {
      frames.run(32, 5)
    })
    const clone = yesButtons()[1]
    const start = translate(clone)
    movePointer(500, 300)

    act(() => {
      frames.run(32, 30)
    })

    expect(translate(clone)).toEqual(start)
  })
})
