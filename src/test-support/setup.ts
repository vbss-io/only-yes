import { cleanup } from '@testing-library/react'
import { installProseMirrorDomShims } from '@/test-support/presentation/prosemirror'
import { afterEach, vi } from 'vitest'

installProseMirrorDomShims()

vi.stubEnv('VITE_ONLY_YES_API', 'https://api.test')

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
  window.history.replaceState(null, '', '/')
})
