import { Loading } from '@/presentation/components/Loading'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Loading', () => {
  it('renders the spinner inside the loading container', () => {
    const { container } = render(<Loading />)

    const root = container.querySelector('.loadingContainer')
    expect(root).not.toBeNull()
    expect(root?.children).toHaveLength(1)
  })
})
