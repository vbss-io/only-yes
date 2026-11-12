import { listCreatedQuestions, saveCreatedQuestion, type CreatedQuestion } from '@/infra/storage/CreatedQuestions'
import { describe, expect, it, vi } from 'vitest'

const entry = (code: string, overrides: Partial<CreatedQuestion> = {}): CreatedQuestion => ({
  code,
  statsKey: `key-${code}`,
  question: `question ${code}`,
  createdAt: '2026-11-01T10:00:00.000Z',
  ...overrides
})

describe('created questions storage', () => {
  it('lists nothing when storage is empty', () => {
    expect(listCreatedQuestions()).toEqual([])
  })

  it('saves an entry and lists it back', () => {
    saveCreatedQuestion(entry('a'))

    expect(listCreatedQuestions()).toEqual([entry('a')])
  })

  it('puts the newest entry first', () => {
    saveCreatedQuestion(entry('a'))
    saveCreatedQuestion(entry('b'))

    expect(listCreatedQuestions().map((q) => q.code)).toEqual(['b', 'a'])
  })

  it('replaces an entry saved again with the same code and moves it to the front', () => {
    saveCreatedQuestion(entry('a'))
    saveCreatedQuestion(entry('b'))
    saveCreatedQuestion(entry('a', { question: 'edited' }))

    const list = listCreatedQuestions()
    expect(list.map((q) => q.code)).toEqual(['a', 'b'])
    expect(list[0].question).toBe('edited')
  })

  it('keeps only the 20 most recent entries', () => {
    for (let i = 0; i < 25; i++) saveCreatedQuestion(entry(`c${i}`))

    const list = listCreatedQuestions()
    expect(list).toHaveLength(20)
    expect(list[0].code).toBe('c24')
    expect(list[19].code).toBe('c5')
  })

  it('ignores stored data that is not valid json', () => {
    localStorage.setItem('only-yes:created', '{broken')

    expect(listCreatedQuestions()).toEqual([])
  })

  it('ignores stored data that is not a list', () => {
    localStorage.setItem('only-yes:created', JSON.stringify({ code: 'a', statsKey: 'k' }))

    expect(listCreatedQuestions()).toEqual([])
  })

  it('drops malformed entries and keeps valid ones', () => {
    localStorage.setItem(
      'only-yes:created',
      JSON.stringify([entry('ok'), null, 'text', { code: 1, statsKey: 'k' }, { code: 'no-key' }, { code: 'x', statsKey: 2 }])
    )

    expect(listCreatedQuestions().map((q) => q.code)).toEqual(['ok'])
  })

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(listCreatedQuestions()).toEqual([])
    expect(() => saveCreatedQuestion(entry('a'))).not.toThrow()
  })
})
