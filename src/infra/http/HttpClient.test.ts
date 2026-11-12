import { AxiosAdapter } from '@/infra/http/HttpClient'
import axios from 'axios'
import { describe, expect, it, vi } from 'vitest'

describe('AxiosAdapter', () => {
  it('accepts every http status so callers can branch on it', () => {
    expect(axios.defaults.validateStatus?.(500)).toBe(true)
    expect(axios.defaults.validateStatus?.(404)).toBe(true)
  })

  it('gets with default empty params and headers and returns data and status', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: { a: 1 }, status: 200 })

    const result = await new AxiosAdapter().get({ url: 'https://api.test/x' })

    expect(result).toEqual({ data: { a: 1 }, status: 200 })
    expect(get).toHaveBeenCalledWith('https://api.test/x', { params: {}, headers: {} })
  })

  it('gets forwarding params, headers and responseType', async () => {
    const get = vi.spyOn(axios, 'get').mockResolvedValue({ data: 'blob', status: 200 })

    await new AxiosAdapter().get({
      url: 'https://api.test/x',
      params: { code: 'abc' },
      headers: { 'x-key': 'k' },
      responseType: 'blob'
    })

    expect(get).toHaveBeenCalledWith('https://api.test/x', {
      params: { code: 'abc' },
      headers: { 'x-key': 'k' },
      responseType: 'blob'
    })
  })

  it('posts the body with params and headers', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { code: 'c1' }, status: 201 })

    const result = await new AxiosAdapter().post({
      url: 'https://api.test/q',
      body: { question: 'q' },
      params: { a: 1 },
      headers: { h: '1' }
    })

    expect(result).toEqual({ data: { code: 'c1' }, status: 201 })
    expect(post).toHaveBeenCalledWith('https://api.test/q', { question: 'q' }, { params: { a: 1 }, headers: { h: '1' } })
  })

  it('posts an empty body, params and headers by default', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: null, status: 204 })

    await new AxiosAdapter().post({ url: 'https://api.test/q' })

    expect(post).toHaveBeenCalledWith('https://api.test/q', {}, { params: {}, headers: {} })
  })

  it('puts and patches forwarding body, params and headers', async () => {
    const put = vi.spyOn(axios, 'put').mockResolvedValue({ data: 'p', status: 200 })
    const patch = vi.spyOn(axios, 'patch').mockResolvedValue({ data: 'pa', status: 202 })
    const adapter = new AxiosAdapter()

    expect(await adapter.put({ url: 'https://api.test/u', body: { b: 1 }, params: { p: 1 }, headers: { h: 1 } })).toEqual({
      data: 'p',
      status: 200
    })
    expect(await adapter.patch({ url: 'https://api.test/u', body: { c: 2 }, params: { z: 1 }, headers: { h: 'x' } })).toEqual({
      data: 'pa',
      status: 202
    })
    expect(put).toHaveBeenCalledWith('https://api.test/u', { b: 1 }, { params: { p: 1 }, headers: { h: 1 } })
    expect(patch).toHaveBeenCalledWith('https://api.test/u', { c: 2 }, { params: { z: 1 }, headers: { h: 'x' } })
  })

  it('puts and patches with defaults when only the url is given', async () => {
    const put = vi.spyOn(axios, 'put').mockResolvedValue({ data: 1, status: 200 })
    const patch = vi.spyOn(axios, 'patch').mockResolvedValue({ data: 2, status: 200 })
    const adapter = new AxiosAdapter()

    await adapter.put({ url: 'https://api.test/a' })
    await adapter.patch({ url: 'https://api.test/b' })

    expect(put).toHaveBeenCalledWith('https://api.test/a', {}, { params: {}, headers: {} })
    expect(patch).toHaveBeenCalledWith('https://api.test/b', {}, { params: {}, headers: {} })
  })

  it('deletes with params and headers and returns data and status', async () => {
    const del = vi.spyOn(axios, 'delete').mockResolvedValue({ data: null, status: 204 })
    const adapter = new AxiosAdapter()

    expect(await adapter.delete({ url: 'https://api.test/d', params: { id: 1 }, headers: { h: 'v' } })).toEqual({
      data: null,
      status: 204
    })
    await adapter.delete({ url: 'https://api.test/e' })

    expect(del).toHaveBeenNthCalledWith(1, 'https://api.test/d', { params: { id: 1 }, headers: { h: 'v' } })
    expect(del).toHaveBeenNthCalledWith(2, 'https://api.test/e', { params: {}, headers: {} })
  })

  it('propagates network errors to the caller', async () => {
    vi.spyOn(axios, 'get').mockRejectedValue(new Error('offline'))

    await expect(new AxiosAdapter().get({ url: 'https://api.test/x' })).rejects.toThrow()
  })
})
