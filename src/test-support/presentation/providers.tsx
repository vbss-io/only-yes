import translations from '@/presentation/assets/translations.json'
import { DarkModeProvider } from '@/presentation/contexts/dark-mode-context'
import { render, type RenderResult } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter, Route, Routes, type InitialEntry } from 'react-router-dom'
import { TranslatorProvider } from 'vbss-translator'

interface RenderOptions {
  language?: 'pt' | 'en'
  route?: string
  routeState?: unknown
  path?: string
}

const toEntry = (route: string, state: unknown): InitialEntry => {
  const url = new URL(route, 'http://localhost')
  return { pathname: url.pathname, search: url.search, hash: url.hash, state }
}

export const renderWithProviders = (ui: ReactElement, options: RenderOptions = {}): RenderResult => {
  window.localStorage.setItem('language', options.language ?? 'pt')
  const entry = toEntry(options.route ?? '/', options.routeState)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <DarkModeProvider>
      <TranslatorProvider translations={translations} defaultLanguage="pt" persist>
        <MemoryRouter initialEntries={[entry]}>
          {options.path ? (
            <Routes>
              <Route path={options.path} element={children} />
              <Route path="*" element={<div>other-route</div>} />
            </Routes>
          ) : (
            children
          )}
        </MemoryRouter>
      </TranslatorProvider>
    </DarkModeProvider>
  )
  return render(ui, { wrapper })
}
