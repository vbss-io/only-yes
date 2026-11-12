import { vi } from 'vitest'

export interface LayoutBox {
  width: number
  height: number
  buttonWidth?: number
  buttonHeight?: number
  left?: number
  top?: number
}

export interface Layout {
  resize: (box: LayoutBox) => void
}

export const stubLayout = (initial: LayoutBox): Layout => {
  let box = initial
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        left: box.left ?? 0,
        top: box.top ?? 0,
        x: box.left ?? 0,
        y: box.top ?? 0,
        right: (box.left ?? 0) + box.width,
        bottom: (box.top ?? 0) + box.height,
        width: box.width,
        height: box.height,
        toJSON: () => ({})
      }) as DOMRect
  )
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => box.buttonWidth ?? 100)
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => box.buttonHeight ?? 40)
  return {
    resize: (next) => {
      box = next
    }
  }
}

export const stubVisualViewport = (width: number, height: number) => {
  const listeners = new Map<string, Set<() => void>>()
  const viewport = {
    width,
    height,
    addEventListener: vi.fn((type: string, listener: () => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type)?.add(listener)
    }),
    removeEventListener: vi.fn((type: string, listener: () => void) => {
      listeners.get(type)?.delete(listener)
    })
  }
  vi.stubGlobal('visualViewport', viewport)
  return {
    viewport,
    emit: (type: string) => listeners.get(type)?.forEach((listener) => listener()),
    listenerCount: (type: string) => listeners.get(type)?.size ?? 0
  }
}
