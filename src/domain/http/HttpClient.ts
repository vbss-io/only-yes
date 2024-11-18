/* eslint-disable  @typescript-eslint/no-explicit-any */

export interface HttpClientGetInput {
  url: string
  params?: any
  headers?: any
  responseType?: string
}

export interface HttpClientPostInput {
  url: string
  body?: any
  params?: any
  headers?: any
}

export interface HttpClient {
  get: ({ url, params, headers, responseType }: HttpClientGetInput) => Promise<any>
  post: ({ url, body, params, headers }: HttpClientPostInput) => Promise<any>
  put: ({ url, body, params, headers }: HttpClientPostInput) => Promise<any>
  patch: ({ url, body, params, headers }: HttpClientPostInput) => Promise<any>
  delete: ({ url, params, headers }: HttpClientGetInput) => Promise<any>
}