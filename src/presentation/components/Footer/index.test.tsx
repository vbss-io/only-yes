import { Footer } from '@/presentation/components/Footer'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

describe('Footer', () => {
  it('credits vbss.io after the noun in portuguese', () => {
    const { container } = renderWithProviders(<Footer />, { language: 'pt' })

    expect(container.textContent).toContain('Only Yes. Um projeto vbss.io.')
  })

  it('credits vbss.io before the noun in english', () => {
    const { container } = renderWithProviders(<Footer />, { language: 'en' })

    expect(container.textContent).toContain('Only Yes. A vbss.io project.')
  })

  it('links to vbss.io in a new tab without leaking the opener', () => {
    renderWithProviders(<Footer />)

    const link = screen.getByRole('link', { name: 'vbss.io' })
    expect(link.getAttribute('href')).toBe('https://vbss.io')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('opens the site, github and linkedin from the icon buttons', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const user = userEvent.setup()
    renderWithProviders(<Footer />)

    const [site, github, linkedin] = screen.getAllByRole('button')
    await user.click(site)
    await user.click(github)
    await user.click(linkedin)

    expect(open).toHaveBeenNthCalledWith(1, 'https://vbss.io', '_blank')
    expect(open).toHaveBeenNthCalledWith(2, 'https://github.com/vbss-io', '_blank')
    expect(open).toHaveBeenNthCalledWith(3, 'https://www.linkedin.com/in/vbss-io', '_blank')
  })
})
