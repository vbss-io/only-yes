import { YourTurn } from '@/presentation/components/YourTurn'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('YourTurn', () => {
  it('invites to create one in portuguese with the three featured templates', () => {
    renderWithProviders(<YourTurn />, { language: 'pt' })

    expect(screen.getByText('Agora é sua vez de conseguir um Sim')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Pedido de namoro' }).getAttribute('href')).toBe('/create?template=pedido-de-namoro')
    expect(screen.getAllByRole('link')).toHaveLength(4)
    expect(screen.getByRole('link', { name: 'Ver todos' }).getAttribute('href')).toBe('/modelos')
  })

  it('links english slugs and the english gallery in english', () => {
    renderWithProviders(<YourTurn />, { language: 'en' })

    expect(screen.getByText('Now it is your turn to get a Yes')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'See all' }).getAttribute('href')).toBe('/templates')
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('/create?template=ask-to-date')
  })
})
