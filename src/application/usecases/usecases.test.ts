import { CreateQuestion } from '@/application/usecases/CreateQuestion'
import { GetQuestion } from '@/application/usecases/GetQuestion'
import { GetQuestionStats } from '@/application/usecases/GetQuestionStats'
import { RecordAnswer } from '@/application/usecases/RecordAnswer'
import { installFakeHttp, type FakeHttp } from '@/test-support/http'
import { beforeEach, describe, expect, it } from 'vitest'

let http: FakeHttp

beforeEach(() => {
  http = installFakeHttp()
})

describe('CreateQuestion', () => {
  it('posts the question to the api and returns the created code and stats key', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'abc', statsKey: 'secret' } })
    const input = { question: '<p>Marry me?</p>', yesText: 'Yes', noText: 'No', answerType: 'text', answer: '<p>yay</p>' }

    const output = await new CreateQuestion().execute(input)

    expect(output).toEqual({ code: 'abc', statsKey: 'secret' })
    expect(http.post).toHaveBeenCalledWith({ url: 'https://api.test/question', body: input })
  })

  it('propagates a failing request', async () => {
    http.post.mockRejectedValue(new Error('offline'))

    await expect(
      new CreateQuestion().execute({ question: 'q', yesText: 'y', noText: 'n', answerType: 'text', answer: 'a' })
    ).rejects.toThrow()
  })
})

describe('GetQuestion', () => {
  it('gets the question by code', async () => {
    const question = { id: '1', code: 'abc', question: 'q' }
    http.get.mockResolvedValue({ status: 200, data: question })

    const output = await new GetQuestion().execute({ code: 'abc' })

    expect(output).toBe(question)
    expect(http.get).toHaveBeenCalledWith({ url: 'https://api.test/question', params: { code: 'abc' } })
  })
})

describe('GetQuestionStats', () => {
  it('sends the code as query and the secret key as header and returns status with data', async () => {
    const data = { question: { code: 'abc' }, stats: {}, answers: [] }
    http.get.mockResolvedValue({ status: 200, data })

    const output = await new GetQuestionStats().execute({ code: 'abc', key: 'secret' })

    expect(output).toEqual({ status: 200, data })
    expect(http.get).toHaveBeenCalledWith({
      url: 'https://api.test/stats',
      params: { code: 'abc' },
      headers: { 'x-stats-key': 'secret' }
    })
  })

  it('exposes a non success status instead of throwing', async () => {
    http.get.mockResolvedValue({ status: 403, data: { message: 'no' } })

    const output = await new GetQuestionStats().execute({ code: 'abc', key: 'bad' })

    expect(output.status).toBe(403)
  })
})

describe('RecordAnswer', () => {
  it('posts the answer record and resolves with nothing', async () => {
    http.post.mockResolvedValue({ status: 201, data: { ignored: true } })
    const input = { code: 'abc', noAttempts: 4, durationMs: 9000, yesVariant: 'clone' as const }

    const output = await new RecordAnswer().execute(input)

    expect(output).toBeUndefined()
    expect(http.post).toHaveBeenCalledWith({ url: 'https://api.test/answer', body: input })
  })
})
