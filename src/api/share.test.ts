import handler from '@api/share'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Query = Record<string, string | string[] | undefined>

interface Sent {
  statusCode: number | undefined
  headers: Record<string, string>
  body: string | undefined
}

const call = async (query: Query): Promise<Sent> => {
  const sent: Sent = { statusCode: undefined, headers: {}, body: undefined }
  const res = {
    status(code: number) {
      sent.statusCode = code
      return res
    },
    setHeader(name: string, value: string) {
      sent.headers[name] = value
      return res
    },
    send(body: string) {
      sent.body = body
      return res
    }
  }
  await handler({ query }, res)
  return sent
}

const answerWith = (question: unknown, ok = true) => vi.fn().mockResolvedValue({ ok, json: async () => ({ question }) })

const meta = (body: string | undefined, property: string): string => {
  const match = body?.match(new RegExp(`<meta (?:property|name)="${property}" content="([^"]*)"`))
  return match ? match[1] : ''
}

const DEFAULT_TITLE = 'Only Yes \u2014 The question that only accepts Yes'

beforeEach(() => {
  vi.stubGlobal('fetch', answerWith('<p>Quer sair comigo?</p>'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('share handler response', () => {
  it('answers 200 html with the cache headers', async () => {
    const sent = await call({ code: 'abc12' })

    expect(sent.statusCode).toBe(200)
    expect(sent.headers['Content-Type']).toBe('text/html; charset=utf-8')
    expect(sent.headers['Cache-Control']).toBe('public, max-age=300, s-maxage=3600')
    expect(sent.body?.startsWith('<!DOCTYPE html>')).toBe(true)
  })

  it('builds the preview from the stored question', async () => {
    const fetcher = answerWith('<p>Quer sair <strong>comigo</strong>?</p>')
    vi.stubGlobal('fetch', fetcher)

    const sent = await call({ code: 'abc12' })

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][0]).toBe('https://svc-mini.vbss.io/v1/only-yes/question?code=abc12')
    expect(meta(sent.body, 'og:title')).toBe('“Quer sair comigo ?” \u2014 Only Yes')
    expect(meta(sent.body, 'twitter:title')).toBe('“Quer sair comigo ?” \u2014 Only Yes')
    expect(meta(sent.body, 'og:url')).toBe('https://www.yes.vbss.io/abc12')
    expect(meta(sent.body, 'og:image')).toBe('https://www.yes.vbss.io/og-image.png')
    expect(meta(sent.body, 'twitter:card')).toBe('summary_large_image')
    expect(sent.body).toContain('<meta http-equiv="refresh" content="0;url=https://www.yes.vbss.io/abc12" />')
    expect(sent.body).toContain('<a href="https://www.yes.vbss.io/abc12">')
  })

  it('uses the first code when the query carries several', async () => {
    const fetcher = answerWith('<p>Oi</p>')
    vi.stubGlobal('fetch', fetcher)

    const sent = await call({ code: ['abc12', 'zzzzz'] })

    expect(fetcher.mock.calls[0][0]).toContain('code=abc12')
    expect(meta(sent.body, 'og:url')).toBe('https://www.yes.vbss.io/abc12')
  })
})

describe('share handler without a usable code', () => {
  it.each([
    ['missing', {}],
    ['empty', { code: '' }],
    ['too short', { code: 'abcd' }],
    ['too long', { code: 'abcdef' }],
    ['with symbols', { code: 'ab-12' }],
    ['an empty list', { code: [] }]
  ])('shows the default preview for a %s code without calling the api', async (_label, query) => {
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)

    const sent = await call(query as Query)

    expect(fetcher).not.toHaveBeenCalled()
    expect(sent.statusCode).toBe(200)
    expect(meta(sent.body, 'og:title')).toBe(DEFAULT_TITLE)
    expect(meta(sent.body, 'og:url')).toBe('https://www.yes.vbss.io/')
  })
})

describe('share handler when the question cannot be read', () => {
  it('falls back to the default title when the api answers an error', async () => {
    vi.stubGlobal('fetch', answerWith('<p>x</p>', false))

    const sent = await call({ code: 'abc12' })

    expect(meta(sent.body, 'og:title')).toBe(DEFAULT_TITLE)
    expect(meta(sent.body, 'og:url')).toBe('https://www.yes.vbss.io/abc12')
  })

  it('falls back to the default title when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const sent = await call({ code: 'abc12' })

    expect(sent.statusCode).toBe(200)
    expect(meta(sent.body, 'og:title')).toBe(DEFAULT_TITLE)
  })

  it('falls back to the default title when the body is not json', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => Promise.reject(new SyntaxError('bad')) })
    )

    const sent = await call({ code: 'abc12' })

    expect(meta(sent.body, 'og:title')).toBe(DEFAULT_TITLE)
  })

  it.each([
    ['no question field', undefined],
    ['an empty question', '<p></p>'],
    ['a markup only question', '<p><br></p>']
  ])('falls back to the default title for %s', async (_label, question) => {
    vi.stubGlobal('fetch', answerWith(question))

    const sent = await call({ code: 'abc12' })

    expect(meta(sent.body, 'og:title')).toBe(DEFAULT_TITLE)
  })

  it('gives up after 3 seconds', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener('abort', () => reject(new Error('aborted')))
          })
      )
    )

    const pending = call({ code: 'abc12' })
    await vi.advanceTimersByTimeAsync(3000)
    const sent = await pending

    expect(meta(sent.body, 'og:title')).toBe(DEFAULT_TITLE)
  })

  it('does not abort a request that answers in time', async () => {
    vi.useFakeTimers()
    const signals: AbortSignal[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: { signal: AbortSignal }) => {
        signals.push(init.signal)
        return Promise.resolve({ ok: true, json: async () => ({ question: '<p>Oi</p>' }) })
      })
    )

    const sent = await call({ code: 'abc12' })
    await vi.advanceTimersByTimeAsync(5000)

    expect(signals[0].aborted).toBe(false)
    expect(meta(sent.body, 'og:title')).toBe('“Oi” \u2014 Only Yes')
  })
})

describe('share handler title text', () => {
  it('truncates a long question to 90 characters with an ellipsis', async () => {
    vi.stubGlobal('fetch', answerWith(`<p>${'a'.repeat(200)}</p>`))

    const sent = await call({ code: 'abc12' })

    expect(meta(sent.body, 'og:title')).toBe(`“${'a'.repeat(89)}…” \u2014 Only Yes`)
  })

  it('keeps a question of exactly 90 characters whole', async () => {
    vi.stubGlobal('fetch', answerWith(`<p>${'b'.repeat(90)}</p>`))

    const sent = await call({ code: 'abc12' })

    expect(meta(sent.body, 'og:title')).toBe(`“${'b'.repeat(90)}” \u2014 Only Yes`)
  })

  it('collapses whitespace and non breaking spaces', async () => {
    vi.stubGlobal('fetch', answerWith('<p>  Quer&nbsp;&nbsp;sair \n\n comigo  </p>'))

    const sent = await call({ code: 'abc12' })

    expect(meta(sent.body, 'og:title')).toBe('“Quer sair comigo” \u2014 Only Yes')
  })

  it('shows quotes and ampersands of the question escaped in the markup', async () => {
    vi.stubGlobal('fetch', answerWith('<p>Tom &amp; Jerry dizem "oi" e it&#39;s ok</p>'))

    const sent = await call({ code: 'abc12' })

    expect(meta(sent.body, 'og:title')).toBe('“Tom &amp; Jerry dizem &quot;oi&quot; e it&#39;s ok” \u2014 Only Yes')
    expect(sent.body).toContain('<title>“Tom &amp; Jerry dizem &quot;oi&quot; e it&#39;s ok” \u2014 Only Yes</title>')
  })

  it('never lets question markup reach the page as html', async () => {
    vi.stubGlobal('fetch', answerWith('<p>"><img src=x onerror=alert(1)></p>'))

    const sent = await call({ code: 'abc12' })

    expect(sent.body).not.toContain('<img')
    expect(meta(sent.body, 'og:title')).toBe('“&quot;&gt;” \u2014 Only Yes')
  })

  it('escapes decoded angle brackets of the question', async () => {
    vi.stubGlobal('fetch', answerWith('<p>1 &lt;script&gt; 2</p>'))

    const sent = await call({ code: 'abc12' })

    expect(sent.body).not.toContain('<script>')
    expect(meta(sent.body, 'og:title')).toBe('“1 &lt;script&gt; 2” \u2014 Only Yes')
  })
})
