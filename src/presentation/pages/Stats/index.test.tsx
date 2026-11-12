import type { QuestionStats } from '@/domain/models/QuestionStats'
import { saveCreatedQuestion } from '@/infra/storage/CreatedQuestions'
import { Stats } from '@/presentation/pages/Stats'
import { installFakeHttp, type FakeHttp } from '@/test-support/http'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const NOW = new Date('2026-11-10T12:00:00.000Z')
let http: FakeHttp

const minutesAgo = (minutes: number): string => new Date(NOW.getTime() - minutes * 60000).toISOString()

const stats = (overrides: Partial<QuestionStats> = {}): QuestionStats => ({
  question: { code: 'abc123', question: '<p>Quer <strong>sair</strong> comigo?</p>', createdAt: minutesAgo(180) },
  stats: { answersCount: 3, totalNoAttempts: 12, maxNoAttempts: 7, totalDurationMs: 9000 },
  answers: [
    { noAttempts: 0, durationMs: 5000, yesVariant: 'original', answeredAt: minutesAgo(0.2) },
    { noAttempts: 4, durationMs: 12000, yesVariant: 'clone', answeredAt: minutesAgo(5) },
    { noAttempts: 8, durationMs: 400, yesVariant: 'original', answeredAt: minutesAgo(60 * 30) }
  ],
  ...overrides
})

const open = (route = '/stats/abc123#secret', language: 'pt' | 'en' = 'pt') =>
  renderWithProviders(<Stats />, { route, path: '/stats/:code', language })

const robots = (): HTMLMetaElement | null => document.head.querySelector('meta[name="robots"]')

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  http = installFakeHttp()
  document.head.innerHTML = ''
})

afterEach(() => {
  vi.useRealTimers()
})

describe('Stats page request', () => {
  it('sends the code and the secret key from the url hash', async () => {
    http.get.mockResolvedValue({ status: 200, data: stats() })

    open('/stats/abc123#secret')

    await screen.findByText('Sims conquistados')
    expect(http.get).toHaveBeenCalledWith({
      url: 'https://api.test/stats',
      params: { code: 'abc123' },
      headers: { 'x-stats-key': 'secret' }
    })
  })

  it('keeps itself out of search engines', async () => {
    http.get.mockResolvedValue({ status: 200, data: stats() })

    open()

    await waitFor(() => expect(robots()?.content).toBe('noindex'))
  })

  it('shows a loader before the answer arrives', async () => {
    let resolve: (value: unknown) => void = () => undefined
    http.get.mockReturnValue(new Promise((done) => (resolve = done)))
    const { container } = open()

    expect(container.querySelector('.loadingContainer')).not.toBeNull()
    resolve({ status: 200, data: stats() })
    await screen.findByText('Sims conquistados')
    expect(container.querySelector('.loadingContainer')).toBeNull()
  })

  it('refuses without calling the api when the link has no secret key', async () => {
    open('/stats/abc123')

    expect(await screen.findByText(/Stats indisponíveis/)).toBeTruthy()
    expect(http.get).not.toHaveBeenCalled()
  })

  it.each([
    [403, /Stats indisponíveis/],
    [404, /Nenhuma pergunta encontrada\./],
    [500, /Erro ao carregar\. Tente novamente\./]
  ])('explains a %i answer', async (status, message) => {
    http.get.mockResolvedValue({ status, data: {} })

    open()

    expect(await screen.findByText(message)).toBeTruthy()
    expect(screen.queryByText('Sims conquistados')).toBeNull()
  })

  it('reports a failed request as a loading error', async () => {
    http.get.mockRejectedValue(new Error('offline'))

    open()

    expect(await screen.findByText('Erro ao carregar. Tente novamente.')).toBeTruthy()
  })

  it('reloads the numbers from the refresh button', async () => {
    http.get.mockResolvedValueOnce({ status: 200, data: stats() })
    const user = userEvent.setup()
    open()
    await screen.findByText('Sims conquistados')
    http.get.mockResolvedValueOnce({
      status: 200,
      data: stats({ stats: { answersCount: 9, totalNoAttempts: 1, maxNoAttempts: 1, totalDurationMs: 9000 } })
    })

    await user.click(screen.getByRole('button'))

    expect(await screen.findByText('9')).toBeTruthy()
    expect(http.get).toHaveBeenCalledTimes(2)
  })
})

describe('Stats page content', () => {
  it('shows the question as plain text with its public link and age', async () => {
    http.get.mockResolvedValue({ status: 200, data: stats() })

    open()

    expect(await screen.findByText('Quer sair comigo?')).toBeTruthy()
    const link = screen.getByRole('link', { name: 'yes.vbss.io/abc123' })
    expect(link.getAttribute('href')).toBe('/abc123')
    expect(screen.getByText(/criada 3h/)).toBeTruthy()
  })

  it('shows the four tiles', async () => {
    http.get.mockResolvedValue({ status: 200, data: stats() })

    open()

    const tile = async (label: string): Promise<HTMLElement> => (await screen.findByText(label)).parentElement as HTMLElement
    expect(within(await tile('Sims conquistados')).getByText('3')).toBeTruthy()
    expect(within(await tile('Recorde de fugas')).getByText('7')).toBeTruthy()
    expect(within(await tile('Tempo médio até o Sim')).getByText('3s')).toBeTruthy()
    expect(within(await tile('Nãos bem-sucedidos')).getByText('0 (0.000%)')).toBeTruthy()
  })

  it('shows a dash as average time when nobody answered and invites to share', async () => {
    http.get.mockResolvedValue({
      status: 200,
      data: stats({ stats: { answersCount: 0, totalNoAttempts: 0, maxNoAttempts: 0, totalDurationMs: 0 }, answers: [] })
    })

    open()

    const tile = (await screen.findByText('Tempo médio até o Sim')).parentElement as HTMLElement
    expect(within(tile).getByText('\u2014')).toBeTruthy()
    expect(screen.getByText('Ninguém respondeu ainda. Compartilhe o link!')).toBeTruthy()
  })

  it('lists the latest answers with attempts, clone, duration and age', async () => {
    http.get.mockResolvedValue({ status: 200, data: stats() })

    open()

    expect(await screen.findByText('disse Sim de primeira · 5s')).toBeTruthy()
    expect(screen.getByText('fugiu 4x antes do Sim · clicou num clone · 12s')).toBeTruthy()
    expect(screen.getByText('fugiu 8x antes do Sim · 1s')).toBeTruthy()
    expect(screen.getByText('agora')).toBeTruthy()
    expect(screen.getByText('5min')).toBeTruthy()
    expect(screen.getByText('1d')).toBeTruthy()
  })

  it('lists at most the 20 latest answers', async () => {
    const answers = Array.from({ length: 25 }, (_, i) => ({
      noAttempts: i + 1,
      durationMs: 2000,
      yesVariant: 'original' as const,
      answeredAt: minutesAgo(i)
    }))
    http.get.mockResolvedValue({ status: 200, data: stats({ answers }) })

    open()

    await screen.findByText('fugiu 1x antes do Sim · 2s')
    expect(screen.getByText('fugiu 20x antes do Sim · 2s')).toBeTruthy()
    expect(screen.queryByText('fugiu 21x antes do Sim · 2s')).toBeNull()
  })

  it('writes the page in english', async () => {
    http.get.mockResolvedValue({ status: 200, data: stats() })

    open('/stats/abc123#secret', 'en')

    expect(await screen.findByText('Yeses earned')).toBeTruthy()
    expect(screen.getByText('said Yes right away · 5s')).toBeTruthy()
    expect(screen.getByText('Latest answers')).toBeTruthy()
  })
})

describe('Stats page my questions', () => {
  it('lists the questions created in this browser with their secret links', async () => {
    saveCreatedQuestion({ code: 'old1', statsKey: 'k1', question: 'Primeira?', createdAt: minutesAgo(90) })
    saveCreatedQuestion({ code: 'new2', statsKey: 'k2', question: '', createdAt: minutesAgo(0) })
    http.get.mockResolvedValue({ status: 200, data: stats() })

    open()

    expect(await screen.findByText('Minhas perguntas')).toBeTruthy()
    const first = screen.getByRole('link', { name: /Primeira\?/ })
    expect(first.getAttribute('href')).toBe('/stats/old1#k1')
    expect(within(first).getByText('1h')).toBeTruthy()
    const second = screen.getByRole('link', { name: /new2/ })
    expect(second.getAttribute('href')).toBe('/stats/new2#k2')
  })

  it('shows the list even when the stats cannot be loaded', async () => {
    saveCreatedQuestion({ code: 'old1', statsKey: 'k1', question: 'Primeira?', createdAt: minutesAgo(10) })
    http.get.mockResolvedValue({ status: 403, data: {} })

    open()

    expect(await screen.findByText(/Stats indisponíveis/)).toBeTruthy()
    expect(screen.getByText('Minhas perguntas')).toBeTruthy()
  })

  it('hides the list when nothing was created here', async () => {
    http.get.mockResolvedValue({ status: 200, data: stats() })

    open()

    await screen.findByText('Sims conquistados')
    expect(screen.queryByText('Minhas perguntas')).toBeNull()
  })
})
