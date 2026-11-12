import { Header } from '@/presentation/components/Header'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

describe('Header', () => {
  it('links the brand to the home page', () => {
    renderWithProviders(<Header />)

    expect(screen.getByText('Only Yes').closest('a')?.getAttribute('href')).toBe('/')
  })

  it('links to the portuguese gallery and the create page in portuguese', () => {
    renderWithProviders(<Header />, { language: 'pt' })

    expect(screen.getByRole('link', { name: 'Modelos' }).getAttribute('href')).toBe('/modelos')
    expect(screen.getByText('Criar Pergunta').closest('a')?.getAttribute('href')).toBe('/create')
    expect(screen.getByText('Criar').closest('a')?.getAttribute('href')).toBe('/create')
  })

  it('links to the english gallery with english labels', () => {
    renderWithProviders(<Header />, { language: 'en' })

    expect(screen.getByRole('link', { name: 'Templates' }).getAttribute('href')).toBe('/templates')
    expect(screen.getByText('Create Question').closest('a')?.getAttribute('href')).toBe('/create')
  })

  it('toggles dark mode and persists it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)
    const toggle = screen.getByRole('switch')
    expect(toggle.getAttribute('aria-checked')).toBe('false')

    await user.click(toggle)

    expect(toggle.getAttribute('aria-checked')).toBe('true')
    expect(localStorage.getItem('darkMode')).toBe('true')
    await user.click(toggle)
    expect(localStorage.getItem('darkMode')).toBe('false')
  })

  it('switches the language from the flag menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />, { language: 'pt' })
    expect(screen.getByText('Criar Pergunta')).toBeTruthy()

    await user.click(screen.getAllByRole('button')[0])
    const options = await screen.findAllByRole('menuitem')
    await user.click(options[0].querySelector('svg') as SVGElement)

    expect(await screen.findByText('Create Question')).toBeTruthy()
  })
})
