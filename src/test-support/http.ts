import type { HttpClient } from '@/domain/http/HttpClient'
import { Registry } from '@/infra/dependency-injection/Registry'
import { vi, type Mock } from 'vitest'

export interface FakeHttp extends HttpClient {
  get: Mock
  post: Mock
  put: Mock
  patch: Mock
  delete: Mock
}

export const installFakeHttp = (): FakeHttp => {
  const http: FakeHttp = {
    get: vi.fn().mockResolvedValue({ status: 200, data: {} }),
    post: vi.fn().mockResolvedValue({ status: 200, data: {} }),
    put: vi.fn().mockResolvedValue({ status: 200, data: {} }),
    patch: vi.fn().mockResolvedValue({ status: 200, data: {} }),
    delete: vi.fn().mockResolvedValue({ status: 200, data: {} })
  }
  Registry.getInstance().provide('httpClient', http)
  return http
}
