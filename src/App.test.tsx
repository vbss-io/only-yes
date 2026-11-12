import { OCCASIONS } from '@/presentation/config/occasions'
import { stubMatchMedia } from '@/test-support/presentation/browser'
import { stubCanvas2d } from '@/test-support/presentation/canvas'
import { stubLayout } from '@/test-support/presentation/layout'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const COLD_IMPORT = 15000

const question = {
  id: 'id-1',
  code: 'abc123',
  question: '<p>Quer sair comigo?</p>',
  yesText: 'Claro',
  noText: 'Jamais',
  answerType: 'text',
  answer: '<p>Eba!</p>',
  createdAt: '2026-11-01T10:00:00Z',
  updatedAt: '2026-11-01T10:00:00Z'
}

const start = async (path: string, language: 'pt' | 'en' = 'pt') => {
  window.localStorage.setItem('language', language)
  window.history.replaceState(null, '', path)
  vi.resetModules()
  const { default: App } = await import('@/App')
  return render(<App />)
}

beforeEach(() => {
  stubLayout({ width: 600, height: 400 })
  stubMatchMedia(false)
  stubCanvas2d()
  vi.spyOn(axios, 'get').mockResolvedValue({ status: 404, data: {} })
  vi.spyOn(axios, 'post').mockResolvedValue({ status: 201, data: {} })
})

describe('App routes', () => {
  it('shows the landing at the root inside the shared header and footer', async () => {
    await start('/')

    expect(await screen.findByText('Tente dizer Não')).toBeTruthy()
    expect(screen.getByText('Only Yes', { selector: 'span' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'vbss.io' })).toBeTruthy()
  }, COLD_IMPORT)

  it('shows the create page at /create', async () => {
    await start('/create')

    expect(await screen.findByRole('heading', { name: 'Crie Sua Pergunta' })).toBeTruthy()
  }, COLD_IMPORT)

  it('shows the portuguese gallery at /modelos', async () => {
    await start('/modelos')

    expect(await screen.findByRole('heading', { name: 'Modelos prontos por ocasião' })).toBeTruthy()
  }, COLD_IMPORT)

  it('shows the english gallery at /templates', async () => {
    await start('/templates', 'en')

    expect(await screen.findByRole('heading', { name: 'Ready-made templates for every occasion' })).toBeTruthy()
  }, COLD_IMPORT)

  it('shows an occasion at /modelos/:slug', async () => {
    const occasion = OCCASIONS[0]

    await start(`/modelos/${occasion.slug.pt}`)

    expect(await screen.findByRole('heading', { level: 1, name: occasion.pt.h1 })).toBeTruthy()
  }, COLD_IMPORT)

  it('shows an occasion at /templates/:slug', async () => {
    const occasion = OCCASIONS[0]

    await start(`/templates/${occasion.slug.en}`, 'en')

    expect(await screen.findByRole('heading', { level: 1, name: occasion.en.h1 })).toBeTruthy()
  }, COLD_IMPORT)

  it('falls back to the landing for an unknown occasion', async () => {
    await start('/modelos/nao-existe')

    expect(await screen.findByText('Tente dizer Não')).toBeTruthy()
  }, COLD_IMPORT)

  it('loads the stats of /stats/:code with the secret from the hash', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({
      status: 200,
      data: {
        question: { code: 'abc123', question: '<p>Quer sair?</p>', createdAt: '2026-11-01T10:00:00Z' },
        stats: { answersCount: 2, totalNoAttempts: 3, maxNoAttempts: 2, totalDurationMs: 4000 },
        answers: []
      }
    })

    await start('/stats/abc123#secret')

    expect(await screen.findByText('Sims conquistados')).toBeTruthy()
    expect(axios.get).toHaveBeenCalledWith('https://api.test/stats', {
      params: { code: 'abc123' },
      headers: { 'x-stats-key': 'secret' }
    })
  }, COLD_IMPORT)

  it('opens a shared short link as the question to answer', async () => {
    vi.spyOn(axios, 'get').mockResolvedValue({ status: 200, data: question })

    await start('/abc123')

    expect(await screen.findByText('Quer sair comigo?')).toBeTruthy()
    expect(axios.get).toHaveBeenCalledWith('https://api.test/question', { params: { code: 'abc123' }, headers: {} })
    expect(screen.getByRole('button', { name: 'Claro' })).toBeTruthy()
  }, COLD_IMPORT)

  it('says nothing was found for a short link that does not exist', async () => {
    await start('/ghost')

    expect(await screen.findByText('Nenhuma pergunta encontrada.')).toBeTruthy()
  }, COLD_IMPORT)
})

describe('App shell', () => {
  it('switches to dark mode from the header and remembers it', async () => {
    const user = userEvent.setup()
    await start('/')

    await user.click(await screen.findByRole('switch'))

    await waitFor(() => expect(localStorage.getItem('darkMode')).toBe('true'))
  }, COLD_IMPORT)

  it('follows the stored language', async () => {
    await start('/', 'en')

    expect(await screen.findByText('Try saying No')).toBeTruthy()
  }, COLD_IMPORT)
})
