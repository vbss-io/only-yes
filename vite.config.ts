import { fileURLToPath, URL } from "url";
import react from '@vitejs/plugin-react'
import { defineConfig, type PluginOption } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: react() as unknown as PluginOption[],
  resolve: {
    alias: {
      '@api': fileURLToPath(new URL("./api", import.meta.url)),
      '@': fileURLToPath(new URL("./src", import.meta.url)),
    }
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test-support/setup.ts'],
    deps: { optimizer: { client: { enabled: true, include: ['@phosphor-icons/react', 'vbss-translator'] } } },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}', 'api/**/*.ts'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/**/*.test.{ts,tsx}', 'src/test-support/**'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      thresholds: { statements: 90, branches: 80, functions: 90, lines: 90 }
    }
  }
})
