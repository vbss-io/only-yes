import { Receipt } from '@/presentation/components/Receipt'
import { clearShare, stubShare } from '@/test-support/presentation/browser'
import { stubCanvas2d } from '@/test-support/presentation/canvas'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const openReceipt = async (user: ReturnType<typeof userEvent.setup>): Promise<void> => {
  await user.click(await screen.findByRole('button', { name: 'Ver recibo do Sim' }))
}

beforeEach(() => {
  clearShare()
})

describe('Receipt', () => {
  it('draws the receipt image and shows it in a dialog with its title', async () => {
    stubCanvas2d()
    const user = userEvent.setup()
    renderWithProviders(<Receipt question="Quer sair?" noAttempts={0} durationMs={3000} />)

    await openReceipt(user)

    expect(await screen.findByText('Seu recibo do Sim')).toBeTruthy()
    const image = screen.getByAltText('Recibo do Sim') as HTMLImageElement
    expect(image.getAttribute('src')).toBe('data:image/png;base64,FAKE')
  })

  it('writes the localized receipt copy onto the canvas', () => {
    const context = stubCanvas2d()
    renderWithProviders(<Receipt question="Quer sair?" noAttempts={0} durationMs={3000} />)

    const texts = context.fillText.mock.calls.map((call) => call[0])
    expect(texts).toContain('“Quer sair?”')
    expect(texts).toContain('Sim de primeira')
    expect(texts).toContain('Nem tentei fugir · 3s de resistência')
    expect(texts).toContain('crie a sua em')
    expect(texts).toContain('yes.vbss.io')
  })

  it('writes the english copy in english', () => {
    const context = stubCanvas2d()
    renderWithProviders(<Receipt question="Dinner?" noAttempts={3} durationMs={7400} />, { language: 'en' })

    const texts = context.fillText.mock.calls.map((call) => call[0])
    expect(texts).toContain('Symbolic resistance')
    expect(texts).toContain('Tried to escape 3x · 7s of resistance')
    expect(texts).toContain('create yours at')
  })

  it.each([
    [0, 'Sim de primeira'],
    [1, 'Resistência simbólica'],
    [4, 'Resistência simbólica'],
    [5, 'Lutou mas caiu'],
    [14, 'Lutou mas caiu'],
    [15, 'Teimosia certificada'],
    [29, 'Teimosia certificada'],
    [30, 'Recorde de fuga'],
    [400, 'Recorde de fuga']
  ])('titles %i attempts as "%s"', (attempts, title) => {
    const context = stubCanvas2d()
    renderWithProviders(<Receipt question="q" noAttempts={attempts} durationMs={1000} />)

    expect(context.fillText.mock.calls.map((call) => call[0])).toContain(title)
  })

  it('shows at least one second of resistance', () => {
    const context = stubCanvas2d()
    renderWithProviders(<Receipt question="q" noAttempts={2} durationMs={120} />)

    expect(context.fillText.mock.calls.map((call) => call[0])).toContain('Tentei fugir 2x · 1s de resistência')
  })

  it('redraws when the attempts change', () => {
    const context = stubCanvas2d()
    const { rerender } = renderWithProviders(<Receipt question="q" noAttempts={0} durationMs={1000} />)

    rerender(<Receipt question="q" noAttempts={20} durationMs={1000} />)

    expect(context.fillText.mock.calls.map((call) => call[0])).toContain('Teimosia certificada')
  })

  it('downloads the image as a png', async () => {
    stubCanvas2d()
    const clicked: HTMLAnchorElement[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this)
    })
    const user = userEvent.setup()
    renderWithProviders(<Receipt question="q" noAttempts={0} durationMs={1000} />)

    await openReceipt(user)
    await user.click(await screen.findByRole('button', { name: 'Baixar' }))

    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe('only-yes-receipt.png')
    expect(clicked[0].href).toBe('data:image/png;base64,FAKE')
  })

  it('offers no share button when the browser cannot share', async () => {
    stubCanvas2d()
    const user = userEvent.setup()
    renderWithProviders(<Receipt question="q" noAttempts={0} durationMs={1000} />)

    await openReceipt(user)

    expect(await screen.findByRole('button', { name: 'Baixar' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Compartilhar' })).toBeNull()
  })

  describe('sharing', () => {
    const stubFetch = () => {
      const fetchMock = vi.fn().mockResolvedValue({ blob: () => Promise.resolve(new Blob(['png'], { type: 'image/png' })) })
      vi.stubGlobal('fetch', fetchMock)
      return fetchMock
    }

    it('shares the image file and the site link', async () => {
      stubCanvas2d()
      const fetchMock = stubFetch()
      const share = stubShare()
      const user = userEvent.setup()
      renderWithProviders(<Receipt question="q" noAttempts={0} durationMs={1000} />)

      await openReceipt(user)
      await user.click(await screen.findByRole('button', { name: 'Compartilhar' }))

      expect(fetchMock).toHaveBeenCalledWith('data:image/png;base64,FAKE')
      expect(share).toHaveBeenCalledTimes(1)
      const payload = share.mock.calls[0][0] as { files: File[]; url: string }
      expect(payload.url).toBe('https://www.yes.vbss.io')
      expect(payload.files).toHaveLength(1)
      expect(payload.files[0].name).toBe('only-yes-receipt.png')
      expect(payload.files[0].type).toBe('image/png')
    })

    it('shares the file when the browser confirms it can share it', async () => {
      stubCanvas2d()
      stubFetch()
      const share = stubShare()
      const canShare = vi.fn().mockReturnValue(true)
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: canShare })
      const user = userEvent.setup()
      renderWithProviders(<Receipt question="q" noAttempts={0} durationMs={1000} />)

      await openReceipt(user)
      await user.click(await screen.findByRole('button', { name: 'Compartilhar' }))

      expect(canShare).toHaveBeenCalledTimes(1)
      expect((share.mock.calls[0][0] as { files: File[] }).files).toHaveLength(1)
    })

    it('shares only the link when the browser cannot share files', async () => {
      stubCanvas2d()
      stubFetch()
      const share = stubShare()
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: vi.fn().mockReturnValue(false) })
      const user = userEvent.setup()
      renderWithProviders(<Receipt question="q" noAttempts={0} durationMs={1000} />)

      await openReceipt(user)
      await user.click(await screen.findByRole('button', { name: 'Compartilhar' }))

      expect(share).toHaveBeenCalledTimes(1)
      expect(share).toHaveBeenCalledWith({ url: 'https://www.yes.vbss.io' })
    })

    it('ignores a failure while sharing', async () => {
      stubCanvas2d()
      const fetchMock = vi.fn().mockRejectedValue(new Error('offline'))
      vi.stubGlobal('fetch', fetchMock)
      const share = stubShare()
      const user = userEvent.setup()
      renderWithProviders(<Receipt question="q" noAttempts={0} durationMs={1000} />)

      await openReceipt(user)
      await user.click(await screen.findByRole('button', { name: 'Compartilhar' }))

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(share).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'Compartilhar' })).toBeTruthy()
    })
  })
})
