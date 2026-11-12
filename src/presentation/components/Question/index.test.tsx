import type { Question as QuestionModel } from '@/domain/models/Question'
import { Question } from '@/presentation/components/Question'
import { installFakeHttp, type FakeHttp } from '@/test-support/http'
import { stubMatchMedia } from '@/test-support/presentation/browser'
import { stubAnimationFrames, stubCanvas2d, stubClock, type AnimationFrames, type Clock } from '@/test-support/presentation/canvas'
import { stubLayout, stubVisualViewport } from '@/test-support/presentation/layout'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let clock: Clock
let frames: AnimationFrames
let http: FakeHttp

const build = (overrides: Partial<QuestionModel> = {}): QuestionModel => ({
  id: 'id-1',
  code: 'abc123',
  question: '<p>Quer sair comigo?</p>',
  yesText: 'Claro',
  noText: 'Jamais',
  answerType: 'text',
  answer: '<p>Eba, combinado!</p>',
  createdAt: new Date('2026-11-01T10:00:00Z'),
  updatedAt: new Date('2026-11-01T10:00:00Z'),
  ...overrides
})

const mount = (question: QuestionModel = build(), language: 'pt' | 'en' = 'pt') =>
  renderWithProviders(<Question question={question} />, { language })

const noButton = (): HTMLElement => screen.getByRole('button', { name: 'Jamais' })
const yesButtons = (): HTMLElement[] => screen.getAllByRole('button', { name: 'Claro' })

const dodge = (times: number): void => {
  for (let i = 0; i < times; i++) {
    clock.now += 300
    fireEvent.pointerEnter(noButton())
  }
}

const body = (): Record<string, unknown> => http.post.mock.calls[0][0].body as Record<string, unknown>

beforeEach(() => {
  clock = stubClock(1000)
  frames = stubAnimationFrames(clock)
  stubLayout({ width: 1024, height: 768 })
  stubMatchMedia(false)
  stubCanvas2d()
  http = installFakeHttp()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

describe('Question before the yes', () => {
  it('shows the rich question and both answers', async () => {
    mount()

    expect(await screen.findByText('Quer sair comigo?')).toBeTruthy()
    expect(yesButtons()).toHaveLength(1)
    expect(noButton()).toBeTruthy()
  })

  it('makes the no button flee in the whole viewport', () => {
    mount()

    fireEvent.pointerEnter(noButton())
    act(() => {
      frames.run(16, 120)
    })

    expect(noButton().style.transform).toContain('translate3d(')
  })

  it('taunts in portuguese then in english', () => {
    const view = mount()
    dodge(5)
    expect(screen.getByText('Tenta de novo')).toBeTruthy()
    view.unmount()

    mount(build(), 'en')
    dodge(5)

    expect(screen.getByText('Try again')).toBeTruthy()
  })

  it('spawns clone yes buttons after ten dodges', () => {
    mount()

    dodge(10)

    expect(yesButtons()).toHaveLength(1 + 5)
  })

  it('sizes the clone swarm to the visual viewport when there is one', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    stubVisualViewport(500, 400)
    mount()
    dodge(10)

    act(() => {
      vi.advanceTimersByTime(200 * 100)
    })

    expect(yesButtons()).toHaveLength(1 + 33)
    vi.useRealTimers()
  })
})

describe('Question after the yes', () => {
  it('records the answer with the attempts, the time and the original variant', async () => {
    const user = userEvent.setup()
    mount()
    dodge(3)
    clock.now += 4200

    await user.click(yesButtons()[0])

    expect(http.post).toHaveBeenCalledTimes(1)
    expect(http.post.mock.calls[0][0].url).toBe('https://api.test/answer')
    expect(body()).toEqual({ code: 'abc123', noAttempts: 3, durationMs: 4200 + 900, yesVariant: 'original' })
  })

  it('records a clone click as the clone variant', async () => {
    const user = userEvent.setup()
    mount()
    dodge(10)

    await user.click(yesButtons()[2])

    expect(body().yesVariant).toBe('clone')
    expect(body().noAttempts).toBe(10)
  })

  it('caps the attempts at 500 and the duration at 30 minutes', async () => {
    const user = userEvent.setup()
    mount()
    dodge(501)
    clock.now += 5_000_000

    await user.click(yesButtons()[0])

    expect(body().noAttempts).toBe(500)
    expect(body().durationMs).toBe(1_800_000)
  }, 15000)

  it('still shows the answer when recording fails', async () => {
    http.post.mockRejectedValue(new Error('offline'))
    const user = userEvent.setup()
    mount()

    await user.click(yesButtons()[0])

    expect(await screen.findByText('Eba, combinado!')).toBeTruthy()
    expect(screen.queryByText('Quer sair comigo?')).toBeNull()
  })

  it('bursts confetti from the click', async () => {
    const user = userEvent.setup()
    mount()

    await user.click(yesButtons()[0])

    expect(document.body.querySelectorAll('canvas').length).toBeGreaterThan(0)
  })

  it('shows the text answer with the receipt and the invitation to create one', async () => {
    const user = userEvent.setup()
    mount()
    dodge(2)

    await user.click(yesButtons()[0])

    expect(await screen.findByText('Eba, combinado!')).toBeTruthy()
    expect(await screen.findByRole('button', { name: 'Ver recibo do Sim' })).toBeTruthy()
    expect(screen.getByText('Agora é sua vez de conseguir um Sim')).toBeTruthy()
  })

  it('draws the receipt from the plain text of the question', async () => {
    const context = stubCanvas2d()
    const user = userEvent.setup()
    mount(build({ question: '<p>Quer <strong>sair</strong>   comigo?</p>' }))
    dodge(2)

    await user.click(yesButtons()[0])

    await waitFor(() => expect(context.fillText.mock.calls.map((call) => call[0])).toContain('“Quer sair comigo?”'))
  })

  it('plays the youtube answer with the receipt', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
    const user = userEvent.setup()
    const { container } = mount(build({ answerType: 'video', answer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }))

    await user.click(yesButtons()[0])

    await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull())
    expect(await screen.findByRole('button', { name: 'Ver recibo do Sim' })).toBeTruthy()
  })

  it('opens a link answer in a new tab and shows it without receipt', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()
    mount(build({ answerType: 'link', answer: 'https://example.com/page' }))

    await user.click(yesButtons()[0])

    expect(open).toHaveBeenCalledWith('https://example.com/page', '_blank', 'noopener,noreferrer')
    expect(screen.getByRole('heading', { name: 'Redirecionando' })).toBeTruthy()
    const link = screen.getByRole('link', { name: 'https://example.com/page' })
    expect(link.getAttribute('href')).toBe('https://example.com/page')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.queryByRole('button', { name: 'Ver recibo do Sim' })).toBeNull()
    expect(screen.queryByText('Agora é sua vez de conseguir um Sim')).toBeNull()
  })

  it('never opens or links an unsafe link answer', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()
    mount(build({ answerType: 'link', answer: 'javascript:alert(1)' }))

    await user.click(yesButtons()[0])

    expect(open).not.toHaveBeenCalled()
    expect(screen.getByText('javascript:alert(1)')).toBeTruthy()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('does not open a window for non link answers', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()
    mount()

    await user.click(yesButtons()[0])

    expect(open).not.toHaveBeenCalled()
  })

  it('stops chasing once confirmed', async () => {
    const user = userEvent.setup()
    mount()
    dodge(1)

    await user.click(yesButtons()[0])

    expect(frames.pending()).toBe(0)
  })
})
