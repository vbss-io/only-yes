import { Share } from '@/presentation/components/Share'
import { clearShare, stubClipboard, stubShare } from '@/test-support/presentation/browser'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  clearShare()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('Share', () => {
  it('shows only the public link when there is no stats key', () => {
    renderWithProviders(<Share code="abc" />)

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    expect(inputs).toHaveLength(1)
    expect(inputs[0].value).toBe(`${window.location.origin}/abc`)
    expect(screen.queryByText('Link secreto: acompanhe as respostas')).toBeNull()
  })

  it('shows the secret stats link with its hint when a key exists', () => {
    renderWithProviders(<Share code="abc" statsKey="k3y" />)

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    expect(inputs).toHaveLength(2)
    expect(inputs[1].value).toBe(`${window.location.origin}/stats/abc#k3y`)
    expect(screen.getByText('Link secreto: acompanhe as respostas')).toBeTruthy()
    expect(screen.getByText('Guarde este link — sem ele não dá pra recuperar os stats.')).toBeTruthy()
  })

  it('copies the public link and confirms in the field', async () => {
    const user = userEvent.setup()
    const writeText = stubClipboard()
    renderWithProviders(<Share code="abc" statsKey="k3y" />)

    await user.click(screen.getAllByRole('button')[0])

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/abc`)
    expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe('Copiado!')
    expect((screen.getAllByRole('textbox')[1] as HTMLInputElement).value).toContain('/stats/abc#k3y')
  })

  it('copies the stats link and confirms only that field', async () => {
    const user = userEvent.setup()
    const writeText = stubClipboard()
    renderWithProviders(<Share code="abc" statsKey="k3y" />, { language: 'en' })

    await user.click(screen.getAllByRole('button')[1])

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/stats/abc#k3y`)
    expect((screen.getAllByRole('textbox')[1] as HTMLInputElement).value).toBe('Copied!')
    expect((screen.getAllByRole('textbox')[0] as HTMLInputElement).value).toBe(`${window.location.origin}/abc`)
  })

  it('hides the native share button when the browser cannot share', () => {
    renderWithProviders(<Share code="abc" />)

    expect(screen.queryByText('Compartilhar')).toBeNull()
  })

  it('shares the public link natively', async () => {
    const share = stubShare()
    const user = userEvent.setup()
    renderWithProviders(<Share code="abc" />)

    await user.click(screen.getByText('Compartilhar'))

    expect(share).toHaveBeenCalledWith({
      title: 'Only Yes',
      text: 'Tenho uma pergunta importante pra você…',
      url: `${window.location.origin}/abc`
    })
  })

  it('keeps working when the user dismisses the native share sheet', async () => {
    const share = stubShare(() => Promise.reject(new DOMException('dismissed', 'AbortError')))
    const user = userEvent.setup()
    renderWithProviders(<Share code="abc" />)

    await user.click(screen.getByText('Compartilhar'))

    expect(share).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Compartilhar')).toBeTruthy()
  })
})
