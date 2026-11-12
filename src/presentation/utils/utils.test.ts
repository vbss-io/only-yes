import { htmlToText } from '@/presentation/utils/html-text'
import { isHttpUrl } from '@/presentation/utils/safe-url'
import { describe, expect, it } from 'vitest'

describe('htmlToText', () => {
  it('strips tags and keeps the text', () => {
    expect(htmlToText('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('collapses whitespace and trims', () => {
    expect(htmlToText('<p>  a \n\n  b </p><p>c</p>')).toBe('a b c')
  })

  it('does not run scripts or keep script markup', () => {
    expect(htmlToText('<p>safe</p><img src=x onerror="window.__pwned=1">')).toBe('safe')
    expect((window as unknown as { __pwned?: number }).__pwned).toBeUndefined()
  })

  it('returns an empty string for empty html', () => {
    expect(htmlToText('')).toBe('')
  })
})

describe('isHttpUrl', () => {
  it('accepts http and https', () => {
    expect(isHttpUrl('http://a.com')).toBe(true)
    expect(isHttpUrl('https://a.com/path?x=1')).toBe(true)
  })

  it('rejects other protocols', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('data:text/html,hi')).toBe(false)
    expect(isHttpUrl('ftp://a.com')).toBe(false)
  })

  it('rejects text that is not a url', () => {
    expect(isHttpUrl('not a url')).toBe(false)
    expect(isHttpUrl('')).toBe(false)
  })
})
