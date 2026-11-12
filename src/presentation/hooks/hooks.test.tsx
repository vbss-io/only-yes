import { darkTheme, theme } from '@/presentation/config/stitches.config'
import { DarkModeProvider } from '@/presentation/contexts/dark-mode-context'
import { useDarkMode } from '@/presentation/hooks/use-dark-mode'
import { useNoIndex } from '@/presentation/hooks/use-no-index'
import { act, render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

const robots = (): HTMLMetaElement[] => Array.from(document.head.querySelectorAll<HTMLMetaElement>('meta[name="robots"]'))

beforeEach(() => {
  document.head.innerHTML = ''
  document.documentElement.className = ''
})

describe('useNoIndex', () => {
  it('adds a robots noindex meta while active', () => {
    renderHook(() => useNoIndex(true))

    expect(robots()).toHaveLength(1)
    expect(robots()[0].content).toBe('noindex')
  })

  it('adds nothing when inactive', () => {
    renderHook(() => useNoIndex(false))

    expect(robots()).toHaveLength(0)
  })

  it('removes the meta on unmount', () => {
    const { unmount } = renderHook(() => useNoIndex(true))

    unmount()

    expect(robots()).toHaveLength(0)
  })

  it('follows the flag when it changes', () => {
    const { rerender } = renderHook(({ active }) => useNoIndex(active), { initialProps: { active: false } })

    rerender({ active: true })
    expect(robots()).toHaveLength(1)
    rerender({ active: false })
    expect(robots()).toHaveLength(0)
  })
})

describe('dark mode', () => {
  const wrapper = ({ children }: { children: ReactNode }) => <DarkModeProvider>{children}</DarkModeProvider>

  it('starts in light mode with the default theme class', () => {
    const { result } = renderHook(() => useDarkMode(), { wrapper })

    expect(result.current.darkMode).toBe(false)
    expect(document.documentElement.classList.contains(String(theme))).toBe(true)
    expect(document.documentElement.classList.contains(String(darkTheme))).toBe(false)
    expect(localStorage.getItem('darkMode')).toBe('false')
  })

  it('restores dark mode from storage', () => {
    localStorage.setItem('darkMode', 'true')

    const { result } = renderHook(() => useDarkMode(), { wrapper })

    expect(result.current.darkMode).toBe(true)
    expect(document.documentElement.classList.contains(String(darkTheme))).toBe(true)
    expect(document.documentElement.classList.contains(String(theme))).toBe(false)
  })

  it('swaps the theme class and persists when toggled', () => {
    const { result } = renderHook(() => useDarkMode(), { wrapper })

    act(() => result.current.setDarkMode(true))

    expect(result.current.darkMode).toBe(true)
    expect(document.documentElement.classList.contains(String(darkTheme))).toBe(true)
    expect(document.documentElement.classList.contains(String(theme))).toBe(false)
    expect(localStorage.getItem('darkMode')).toBe('true')
    act(() => result.current.setDarkMode(false))
    expect(document.documentElement.classList.contains(String(theme))).toBe(true)
    expect(document.documentElement.classList.contains(String(darkTheme))).toBe(false)
  })

  it('renders its children', () => {
    const { getByText } = render(<DarkModeProvider>child</DarkModeProvider>)

    expect(getByText('child')).toBeTruthy()
  })
})
