import { OCCASIONS } from '@/presentation/config/occasions'
import { Occasions } from '@/presentation/pages/Occasions'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Occasions gallery', () => {
  it('lists every occasion in portuguese under /modelos', () => {
    const { container } = renderWithProviders(<Occasions />, { route: '/modelos' })

    expect(screen.getByRole('heading', { name: 'Modelos prontos por ocasião' })).toBeTruthy()
    expect(container.querySelector('title')?.textContent).toBe('Only Yes - Modelos prontos por ocasião')
    expect(screen.getAllByRole('link', { name: 'Usar este modelo' })).toHaveLength(OCCASIONS.length)
    expect(screen.getAllByRole('link', { name: 'Ver modelo' })).toHaveLength(OCCASIONS.length)
    expect(screen.getByText(`“${OCCASIONS[0].pt.question}”`)).toBeTruthy()
  })

  it('links each card to its template and its page in portuguese', () => {
    renderWithProviders(<Occasions />, { route: '/modelos' })

    const first = OCCASIONS[0]
    const use = screen.getAllByRole('link', { name: 'Usar este modelo' })[0]
    const see = screen.getAllByRole('link', { name: 'Ver modelo' })[0]
    expect(use.getAttribute('href')).toBe(`/create?template=${first.slug.pt}`)
    expect(see.getAttribute('href')).toBe(`/modelos/${first.slug.pt}`)
  })

  it('lists the english copy and slugs under /templates', () => {
    renderWithProviders(<Occasions />, { route: '/templates' })

    const first = OCCASIONS[0]
    expect(screen.getByRole('heading', { name: 'Ready-made templates for every occasion' })).toBeTruthy()
    expect(screen.getByText(`“${first.en.question}”`)).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Use this template' })[0].getAttribute('href')).toBe(
      `/create?template=${first.slug.en}`
    )
    expect(screen.getAllByRole('link', { name: 'See template' })[0].getAttribute('href')).toBe(`/templates/${first.slug.en}`)
  })

  it('shows one title per occasion', () => {
    renderWithProviders(<Occasions />, { route: '/modelos' })

    OCCASIONS.forEach((occasion) => {
      expect(screen.getAllByText(occasion.pt.label).length).toBeGreaterThan(0)
    })
  })
})
