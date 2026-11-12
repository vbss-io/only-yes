import { registerDependencies } from '@/infra/dependency-injection/Register'
import { Registry } from '@/infra/dependency-injection/Registry'
import { AxiosAdapter } from '@/infra/http/HttpClient'
import { describe, expect, it } from 'vitest'

describe('registerDependencies', () => {
  it('provides an axios based http client', () => {
    registerDependencies()

    expect(Registry.getInstance().inject('httpClient')).toBeInstanceOf(AxiosAdapter)
  })
})
