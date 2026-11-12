import { Landing } from '@/presentation/components/Landing'
import { stubMatchMedia } from '@/test-support/presentation/browser'
import { stubCanvas2d } from '@/test-support/presentation/canvas'
import { stubLayout } from '@/test-support/presentation/layout'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

beforeEach(() => {
  stubLayout({ width: 600, height: 400 })
  stubMatchMedia(false)
  stubCanvas2d()
})

describe('Landing', () => {
  it('pitches the product in portuguese', () => {
    renderWithProviders(<Landing />, { language: 'pt' })

    expect(screen.getByText('Grátis e sem precisar de conta')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('A pergunta que só aceita')
    expect(screen.getByText('Leva menos de um minuto.')).toBeTruthy()
  })

  it('links the calls to action to the create page and the template gallery', () => {
    renderWithProviders(<Landing />, { language: 'pt' })

    const create = screen.getAllByRole('link', { name: 'Criar Pergunta' })
    const models = screen.getAllByRole('link', { name: 'Ver modelos prontos' })
    expect(create).toHaveLength(2)
    create.forEach((link) => expect(link.getAttribute('href')).toBe('/create'))
    expect(models).toHaveLength(2)
    models.forEach((link) => expect(link.getAttribute('href')).toBe('/modelos'))
  })

  it('points the gallery link to the english path in english', () => {
    renderWithProviders(<Landing />, { language: 'en' })

    screen.getAllByRole('link', { name: 'See ready-made templates' }).forEach((link) => {
      expect(link.getAttribute('href')).toBe('/templates')
    })
  })

  it('explains the three steps and the three feedback types', () => {
    renderWithProviders(<Landing />, { language: 'pt' })

    ;['Crie Sua Pergunta', 'Compartilhe o link', 'O Não sempre foge', 'Link', 'Youtube'].forEach((title) => {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0)
    })
    expect(screen.getByText('Como funciona')).toBeTruthy()
    expect(screen.getByText('Escolha o que acontece depois do Sim')).toBeTruthy()
  })

  it('lets the visitor try to say no in a live demo and win the yes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Landing />, { language: 'pt' })
    expect(screen.getByText('Está gostando do Only Yes?')).toBeTruthy()

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Não' }))
    await user.click(screen.getByRole('button', { name: 'Sim' }))

    expect(screen.getByText(/Sabia que você ia dizer Sim\./)).toBeTruthy()
    expect(screen.getByText(/O Não fugiu 1x\./)).toBeTruthy()
  })
})
