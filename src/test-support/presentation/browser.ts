import { vi } from 'vitest'

export const stubMatchMedia = (matches = false): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true
    }))
  )
}

export const stubClipboard = (): ReturnType<typeof vi.fn> => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  return writeText
}

export const stubShare = (impl: (data: ShareData) => Promise<void> = () => Promise.resolve()): ReturnType<typeof vi.fn> => {
  const share = vi.fn(impl)
  Object.defineProperty(navigator, 'share', { configurable: true, writable: true, value: share })
  return share
}

export const clearShare = (): void => {
  Reflect.deleteProperty(navigator, 'share')
  Reflect.deleteProperty(navigator, 'canShare')
}
