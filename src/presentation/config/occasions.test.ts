import {
  OCCASIONS,
  OCCASION_PAGE_COPY,
  findOccasionBySlug,
  galleryPath,
  occasionCopy,
  occasionPath,
  relatedOccasions,
  resolveOccasionLang
} from '@/presentation/config/occasions'
import { describe, expect, it } from 'vitest'

describe('occasions config', () => {
  it('finds an occasion by its portuguese slug', () => {
    const match = findOccasionBySlug('pedido-de-namoro')

    expect(match?.lang).toBe('pt')
    expect(match?.occasion.slug.en).toBe('ask-to-date')
  })

  it('finds an occasion by its english slug', () => {
    const match = findOccasionBySlug('ask-to-date')

    expect(match?.lang).toBe('en')
    expect(match?.occasion.slug.pt).toBe('pedido-de-namoro')
  })

  it('finds nothing for an unknown or missing slug', () => {
    expect(findOccasionBySlug('nope')).toBeUndefined()
    expect(findOccasionBySlug(null)).toBeUndefined()
    expect(findOccasionBySlug('')).toBeUndefined()
  })

  it('picks the copy for the language', () => {
    const occasion = OCCASIONS[0]

    expect(occasionCopy(occasion, 'pt')).toBe(occasion.pt)
    expect(occasionCopy(occasion, 'en')).toBe(occasion.en)
  })

  it('builds paths per language', () => {
    const occasion = OCCASIONS[0]

    expect(occasionPath(occasion, 'pt')).toBe(`/modelos/${occasion.slug.pt}`)
    expect(occasionPath(occasion, 'en')).toBe(`/templates/${occasion.slug.en}`)
    expect(galleryPath('pt')).toBe('/modelos')
    expect(galleryPath('en')).toBe('/templates')
  })

  it('lists the next three occasions as related and wraps around the end', () => {
    const first = relatedOccasions(OCCASIONS[0])
    const last = relatedOccasions(OCCASIONS[OCCASIONS.length - 1])

    expect(first).toEqual([OCCASIONS[1], OCCASIONS[2], OCCASIONS[3]])
    expect(last).toEqual([OCCASIONS[0], OCCASIONS[1], OCCASIONS[2]])
  })

  it('resolves english only for en and portuguese for everything else', () => {
    expect(resolveOccasionLang('en')).toBe('en')
    expect(resolveOccasionLang('pt')).toBe('pt')
    expect(resolveOccasionLang('fr')).toBe('pt')
  })

  it('has page copy for both languages', () => {
    expect(OCCASION_PAGE_COPY.pt.useTemplate).toBe('Usar este modelo')
    expect(OCCASION_PAGE_COPY.en.useTemplate).toBe('Use this template')
  })

  it('gives every occasion unique slugs and both copies', () => {
    const pt = OCCASIONS.map((o) => o.slug.pt)
    const en = OCCASIONS.map((o) => o.slug.en)

    expect(new Set(pt).size).toBe(OCCASIONS.length)
    expect(new Set(en).size).toBe(OCCASIONS.length)
    OCCASIONS.forEach((o) => {
      expect(o.pt.faq.length).toBeGreaterThan(0)
      expect(o.en.faq.length).toBeGreaterThan(0)
    })
  })
})
