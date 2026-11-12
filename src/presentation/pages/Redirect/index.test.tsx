import { Redirect } from '@/presentation/pages/Redirect'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

const Probe = () => {
  const location = useLocation()
  const state = location.state as { code?: string } | null
  return <div>{`home:${location.pathname}:${state?.code ?? 'none'}`}</div>
}

describe('Redirect page', () => {
  it('sends a short link to the home page carrying the question code', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/:code" element={<Redirect />} />
        <Route path="/" element={<Probe />} />
      </Routes>,
      { route: '/abc123' }
    )

    expect(await screen.findByText('home:/:abc123')).toBeTruthy()
  })

  it('navigates to the root with the last path segment as the code', async () => {
    renderWithProviders(
      <>
        <Redirect />
        <Probe />
      </>,
      { route: '/some/path/xyz789' }
    )

    expect(await screen.findByText('home:/:xyz789')).toBeTruthy()
  })

  it('shows a loader while redirecting', () => {
    const { container } = renderWithProviders(<Redirect />, { route: '/abc123' })

    expect(container.querySelector('title')?.textContent).toBe('Only Yes')
    expect(container.querySelector('.loadingContainer')).not.toBeNull()
  })
})
