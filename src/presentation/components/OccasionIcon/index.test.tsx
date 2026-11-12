import { OccasionIcon } from '@/presentation/components/OccasionIcon'
import { OCCASIONS } from '@/presentation/config/occasions'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const iconMarkup = (name: string): string => render(<OccasionIcon name={name} />).container.innerHTML

describe('OccasionIcon', () => {
  it('renders an svg for every icon used by the occasions', () => {
    const names = Array.from(new Set(OCCASIONS.map((occasion) => occasion.icon)))

    names.forEach((name) => {
      expect(iconMarkup(name)).toContain('<svg')
    })
  })

  it('draws a different icon per name', () => {
    expect(iconMarkup('crown')).not.toBe(iconMarkup('heart'))
    expect(iconMarkup('beer')).not.toBe(iconMarkup('confetti'))
  })

  it('falls back to the heart for an unknown name', () => {
    expect(iconMarkup('unknown-icon')).toBe(iconMarkup('heart'))
  })
})
