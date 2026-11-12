import { OCCASIONS, OCCASION_PAGE_COPY, relatedOccasions } from '@/presentation/config/occasions'
import { Occasion } from '@/presentation/pages/Occasion'
import { stubMatchMedia } from '@/test-support/presentation/browser'
import { stubCanvas2d } from '@/test-support/presentation/canvas'
import { stubLayout } from '@/test-support/presentation/layout'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

const first = OCCASIONS[0]

beforeEach(() => {
  stubLayout({ width: 600, height: 400 })
  stubMatchMedia(false)
  stubCanvas2d()
})

describe('Occasion page', () => {
  it('renders the portuguese landing of an occasion', () => {
    const { container } = renderWithProviders(<Occasion />, { route: `/modelos/${first.slug.pt}`, path: '/modelos/:slug' })

    expect(screen.getByRole('heading', { level: 1, name: first.pt.h1 })).toBeTruthy()
    expect(container.querySelector('title')?.textContent).toBe(`Only Yes - ${first.pt.title}`)
    first.pt.intro.forEach((paragraph) => expect(screen.getByText(paragraph)).toBeTruthy())
    expect(screen.getByRole('link', { name: `← ${OCCASION_PAGE_COPY.pt.backToGallery}` }).getAttribute('href')).toBe('/modelos')
  })

  it('renders the english landing for an english slug', () => {
    renderWithProviders(<Occasion />, { route: `/templates/${first.slug.en}`, path: '/templates/:slug' })

    expect(screen.getByRole('heading', { level: 1, name: first.en.h1 })).toBeTruthy()
    expect(screen.getByRole('link', { name: `← ${OCCASION_PAGE_COPY.en.backToGallery}` }).getAttribute('href')).toBe('/templates')
  })

  it('offers the template through the call to action', () => {
    renderWithProviders(<Occasion />, { route: `/modelos/${first.slug.pt}`, path: '/modelos/:slug' })

    expect(screen.getByRole('link', { name: OCCASION_PAGE_COPY.pt.useTemplate }).getAttribute('href')).toBe(
      `/create?template=${first.slug.pt}`
    )
  })

  it('lists the frequently asked questions', () => {
    renderWithProviders(<Occasion />, { route: `/modelos/${first.slug.pt}`, path: '/modelos/:slug' })

    expect(screen.getByRole('heading', { name: OCCASION_PAGE_COPY.pt.faqTitle })).toBeTruthy()
    first.pt.faq.forEach((item) => {
      expect(screen.getByRole('heading', { level: 3, name: item.q })).toBeTruthy()
      expect(screen.getByText(item.a)).toBeTruthy()
    })
  })

  it('links to the three related occasions', () => {
    renderWithProviders(<Occasion />, { route: `/modelos/${first.slug.pt}`, path: '/modelos/:slug' })

    relatedOccasions(first).forEach((related) => {
      const link = screen.getByRole('link', { name: related.pt.label })
      expect(link.getAttribute('href')).toBe(`/modelos/${related.slug.pt}`)
    })
  })

  it('embeds the live demo with the occasion copy and lets the visitor win', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Occasion />, { route: `/modelos/${first.slug.pt}`, path: '/modelos/:slug' })

    expect(screen.getByRole('heading', { name: OCCASION_PAGE_COPY.pt.tryIt })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: first.pt.yesText }))

    expect(screen.getByText(first.pt.answer)).toBeTruthy()
  })

  it('goes back home for an unknown occasion', () => {
    renderWithProviders(<Occasion />, { route: '/modelos/nao-existe', path: '/modelos/:slug' })

    expect(screen.getByText('other-route')).toBeTruthy()
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })
})
