import { Home } from '@/presentation/pages/Home'
import { installFakeHttp, type FakeHttp } from '@/test-support/http'
import { stubMatchMedia } from '@/test-support/presentation/browser'
import { stubCanvas2d } from '@/test-support/presentation/canvas'
import { stubLayout } from '@/test-support/presentation/layout'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let http: FakeHttp

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

const robots = (): HTMLMetaElement | null => document.head.querySelector('meta[name="robots"]')

beforeEach(() => {
  http = installFakeHttp()
  stubLayout({ width: 600, height: 400 })
  stubMatchMedia(false)
  stubCanvas2d()
  document.head.innerHTML = ''
})

describe('Home page', () => {
  it('shows the landing and fetches nothing when no question code was given', async () => {
    const { container } = renderWithProviders(<Home />)

    expect(await screen.findByText('Tente dizer Não')).toBeTruthy()
    expect(http.get).not.toHaveBeenCalled()
    expect(container.querySelector('title')?.textContent).toBe('Only Yes ')
    expect(robots()).toBeNull()
  })

  it('loads the question of the code in the route state and shows it', async () => {
    http.get.mockResolvedValue({ status: 200, data: question })
    const { container } = renderWithProviders(<Home />, { routeState: { code: 'abc123' } })

    expect(await screen.findByText('Quer sair comigo?')).toBeTruthy()
    expect(http.get).toHaveBeenCalledWith({ url: 'https://api.test/question', params: { code: 'abc123' } })
    expect(screen.getByRole('button', { name: 'Claro' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Jamais' })).toBeTruthy()
    expect(screen.queryByText('Tente dizer Não')).toBeNull()
    expect(container.querySelector('title')?.textContent).toBe('Only Yes - abc123')
  })

  it('asks search engines not to index a shared question', async () => {
    http.get.mockResolvedValue({ status: 200, data: question })

    renderWithProviders(<Home />, { routeState: { code: 'abc123' } })

    await waitFor(() => expect(robots()?.content).toBe('noindex'))
  })

  it('shows a loader while the question is being fetched', async () => {
    let resolve: (value: unknown) => void = () => undefined
    http.get.mockReturnValue(new Promise((done) => (resolve = done)))
    const { container } = renderWithProviders(<Home />, { routeState: { code: 'abc123' } })

    await waitFor(() => expect(container.querySelector('.loadingContainer')).not.toBeNull())
    expect(screen.queryByText('Tente dizer Não')).toBeNull()
    expect(screen.queryByText('Nenhuma pergunta encontrada.')).toBeNull()
    resolve({ status: 200, data: question })
    expect(await screen.findByText('Quer sair comigo?')).toBeTruthy()
    expect(container.querySelector('.loadingContainer')).toBeNull()
  })

  it('says nothing was found and keeps the landing when the api returns no question', async () => {
    http.get.mockResolvedValue({ status: 404, data: {} })

    renderWithProviders(<Home />, { routeState: { code: 'ghost' } })

    expect(await screen.findByText('Nenhuma pergunta encontrada.')).toBeTruthy()
    expect(screen.getByText('Tente dizer Não')).toBeTruthy()
  })

  it('says nothing was found when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    http.get.mockRejectedValue(new Error('offline'))

    renderWithProviders(<Home />, { routeState: { code: 'abc123' } })

    expect(await screen.findByText('Nenhuma pergunta encontrada.')).toBeTruthy()
  })

  it('shows the not found message in english', async () => {
    http.get.mockResolvedValue({ status: 404, data: {} })

    renderWithProviders(<Home />, { routeState: { code: 'ghost' }, language: 'en' })

    expect(await screen.findByText('No questions found.')).toBeTruthy()
  })
})
