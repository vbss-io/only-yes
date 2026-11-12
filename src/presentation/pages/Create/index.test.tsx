import { OCCASIONS } from '@/presentation/config/occasions'
import { Create } from '@/presentation/pages/Create'
import { installFakeHttp, type FakeHttp } from '@/test-support/http'
import { stubClipboard } from '@/test-support/presentation/browser'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let http: FakeHttp
let user: ReturnType<typeof userEvent.setup>

let current: 'pt' | 'en' = 'pt'

const open = (route = '/create', language: 'pt' | 'en' = 'pt') => {
  current = language
  return renderWithProviders(<Create />, { route, language })
}

const editors = (container: HTMLElement): HTMLElement[] => Array.from(container.querySelectorAll<HTMLElement>('.ProseMirror'))

const waitForEditors = async (container: HTMLElement, count: number): Promise<HTMLElement[]> => {
  await waitFor(() => expect(editors(container)).toHaveLength(count))
  return editors(container)
}

const typeInto = async (editor: HTMLElement, text: string): Promise<void> => {
  await user.click(editor)
  await user.keyboard(text)
}

const responses = (): HTMLInputElement[] =>
  (current === 'pt'
    ? [screen.getByLabelText('Resposta Positiva:'), screen.getByLabelText('Resposta Negativa:')]
    : [screen.getByLabelText('Positive Response:'), screen.getByLabelText('Negative Response:')]) as HTMLInputElement[]

const submit = async (): Promise<void> => {
  await user.click(screen.getByRole('button', { name: current === 'pt' ? 'Criar Pergunta' : 'Create Question' }))
}

const posted = (): Record<string, unknown> => http.post.mock.calls[0][0].body as Record<string, unknown>

const fillTextQuestion = async (container: HTMLElement): Promise<void> => {
  const [question, answer] = await waitForEditors(container, 2)
  await typeInto(question, 'Quer sair comigo?')
  await typeInto(answer, 'Eba!')
}

beforeEach(() => {
  http = installFakeHttp()
  user = userEvent.setup()
})

describe('Create page defaults', () => {
  it('starts with the portuguese yes and no answers and the text feedback type', async () => {
    const { container } = open()

    await waitForEditors(container, 2)
    expect(container.querySelector('title')?.textContent).toBe('Only Yes - Create')
    expect(screen.getByRole('heading', { name: 'Crie Sua Pergunta' })).toBeTruthy()
    expect(responses().map((input) => input.value)).toEqual(['Sim', 'Não'])
    expect((screen.getByLabelText('Tipo do Feedback:') as HTMLSelectElement).value).toBe('text')
  })

  it('starts with the english answers in english', async () => {
    const { container } = open('/create', 'en')

    await waitForEditors(container, 2)
    expect(responses().map((input) => input.value)).toEqual(['Yes', 'No'])
    expect(screen.getByRole('heading', { name: 'Create Your Question' })).toBeTruthy()
  })

  it('offers text, link and youtube as feedback types', () => {
    open()

    const options = within(screen.getByLabelText('Tipo do Feedback:')).getAllByRole('option') as HTMLOptionElement[]
    expect(options.map((option) => option.value)).toEqual(['', 'text', 'link', 'video'])
  })
})

describe('Create page templates', () => {
  const template = OCCASIONS[0]

  it('prefills everything from a portuguese template', async () => {
    const { container } = open(`/create?template=${template.slug.pt}`)

    const [question, answer] = await waitForEditors(container, 2)
    await waitFor(() => expect(question.textContent).toBe(template.pt.question))
    expect(answer.textContent).toBe(template.pt.answer)
    expect(responses().map((input) => input.value)).toEqual([template.pt.yesText, template.pt.noText])
  })

  it('prefills from an english template slug in english', async () => {
    const { container } = open(`/create?template=${template.slug.en}`, 'en')

    const [question] = await waitForEditors(container, 2)
    await waitFor(() => expect(question.textContent).toBe(template.en.question))
    expect(responses().map((input) => input.value)).toEqual([template.en.yesText, template.en.noText])
  })

  it('creates the question straight from a template', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'tpl1', statsKey: 'sk' } })
    const { container } = open(`/create?template=${template.slug.pt}`)
    await waitForEditors(container, 2)

    await submit()

    await screen.findByText('Link público pra compartilhar')
    expect(posted()).toEqual({
      question: `<p>${template.pt.question}</p>`,
      yesText: template.pt.yesText,
      noText: template.pt.noText,
      answerType: 'text',
      answer: `<p>${template.pt.answer}</p>`
    })
  })

  it('ignores an unknown template', async () => {
    const { container } = open('/create?template=nao-existe')

    const [question] = await waitForEditors(container, 2)
    expect(question.textContent).toBe('')
    expect(responses().map((input) => input.value)).toEqual(['Sim', 'Não'])
  })
})

describe('Create page validation', () => {
  it('asks for the question and the feedback when submitting empty', async () => {
    const { container } = open()
    await waitForEditors(container, 2)

    await submit()

    expect(await screen.findByText('A Pergunta é obrigatória.')).toBeTruthy()
    expect(screen.getByText('O Feedback é obrigatório.')).toBeTruthy()
    expect(http.post).not.toHaveBeenCalled()
  })

  it('shows the validation in english', async () => {
    const { container } = open('/create', 'en')
    await waitForEditors(container, 2)

    await submit()

    expect(await screen.findByText('The Question is required.')).toBeTruthy()
    expect(screen.getByText('The Feedback is required.')).toBeTruthy()
  })

  it('accepts a very short question because the html wrapper counts toward the minimum', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'abc123', statsKey: 'secret' } })
    const { container } = open()
    const [question, answer] = await waitForEditors(container, 2)
    await typeInto(question, 'Oi')
    await typeInto(answer, 'Eba!')

    await submit()

    await screen.findByText('Link público pra compartilhar')
    expect(posted().question).toBe('<p>Oi</p>')
  })

  it('rejects a question that was emptied again', async () => {
    const { container } = open()
    const [question, answer] = await waitForEditors(container, 2)
    await typeInto(question, 'Quer sair?')
    await user.keyboard('{Control>}a{/Control}{Backspace}')
    await typeInto(answer, 'Eba!')

    await submit()

    expect(await screen.findByText('A Pergunta é obrigatória.')).toBeTruthy()
    expect(http.post).not.toHaveBeenCalled()
  })

  it('limits both answers to 15 characters', async () => {
    const { container } = open()
    await fillTextQuestion(container)
    await user.clear(responses()[0])
    await user.type(responses()[0], 'x'.repeat(16))
    await user.clear(responses()[1])
    await user.type(responses()[1], 'y'.repeat(16))

    await submit()

    expect(await screen.findByText('A Reposta Positiva deve ter até 15 caracteres.')).toBeTruthy()
    expect(screen.getByText('A Reposta Negativa deve ter até 15 caracteres.')).toBeTruthy()
    expect(http.post).not.toHaveBeenCalled()
  })

  it('requires both answers', async () => {
    const { container } = open()
    await fillTextQuestion(container)
    await user.clear(responses()[0])
    await user.clear(responses()[1])

    await submit()

    expect(await screen.findByText('A Reposta Positiva é obrigatória.')).toBeTruthy()
    expect(screen.getByText('A Reposta Negativa é obrigatória.')).toBeTruthy()
  })
})

describe('Create page submit', () => {
  it('creates the question and shows the links to share it', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'abc123', statsKey: 'secret' } })
    const { container } = open()
    await fillTextQuestion(container)

    await submit()

    expect(await screen.findByText('Link público pra compartilhar')).toBeTruthy()
    expect(http.post).toHaveBeenCalledTimes(1)
    expect(http.post.mock.calls[0][0].url).toBe('https://api.test/question')
    expect(posted()).toEqual({
      question: '<p>Quer sair comigo?</p>',
      yesText: 'Sim',
      noText: 'Não',
      answerType: 'text',
      answer: '<p>Eba!</p>'
    })
    const inputs = screen.getAllByRole('textbox').filter((el) => el.tagName === 'INPUT') as HTMLInputElement[]
    const values = inputs.map((input) => input.value)
    expect(values).toContain(`${window.location.origin}/abc123`)
    expect(values).toContain(`${window.location.origin}/stats/abc123#secret`)
  })

  it('remembers the created question in this browser', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'abc123', statsKey: 'secret' } })
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-10T12:00:00.000Z'))
    const { container } = open()
    await fillTextQuestion(container)

    await submit()

    await screen.findByText('Link público pra compartilhar')
    vi.useRealTimers()
    expect(JSON.parse(localStorage.getItem('only-yes:created') ?? '[]')).toEqual([
      { code: 'abc123', statsKey: 'secret', question: 'Quer sair comigo?', createdAt: '2026-11-10T12:00:00.000Z' }
    ])
  })

  it('shares only the public link when the api gives no stats key', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'abc123' } })
    const { container } = open()
    await fillTextQuestion(container)

    await submit()

    await screen.findByText('Link público pra compartilhar')
    expect(screen.queryByText('Link secreto: acompanhe as respostas')).toBeNull()
    expect(localStorage.getItem('only-yes:created')).toBeNull()
  })

  it('lets the creator copy the public link', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'abc123', statsKey: 'secret' } })
    const { container } = open()
    await fillTextQuestion(container)
    await submit()
    await screen.findByText('Link público pra compartilhar')
    const writeText = stubClipboard()

    const copy = screen.getAllByRole('button').filter((button) => button.querySelector('svg') && button.getAttribute('type') !== 'submit')
    await user.click(copy[copy.length - 2])

    expect(writeText).toHaveBeenCalled()
  })

  it('shows an error when the api answers without a code', async () => {
    http.post.mockResolvedValue({ status: 500, data: {} })
    const { container } = open()
    await fillTextQuestion(container)

    await submit()

    expect(await screen.findByText('* Erro ao criar a pergunta. Tente novamente.')).toBeTruthy()
    expect(screen.queryByText('Link público pra compartilhar')).toBeNull()
  })

  it('shows an error when the request fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    http.post.mockRejectedValue(new Error('offline'))
    const { container } = open('/create', 'en')
    await fillTextQuestion(container)

    await submit()

    expect(await screen.findByText('* Error creating the question. Please try again.')).toBeTruthy()
  })

  it('clears the previous error and result when submitting again', async () => {
    http.post.mockResolvedValueOnce({ status: 500, data: {} })
    http.post.mockResolvedValueOnce({ status: 201, data: { code: 'abc123', statsKey: 'secret' } })
    const { container } = open()
    await fillTextQuestion(container)
    await submit()
    await screen.findByText('* Erro ao criar a pergunta. Tente novamente.')

    await user.click(screen.getByRole('button', { name: 'Criar Pergunta' }))

    expect(await screen.findByText('Link público pra compartilhar')).toBeTruthy()
    expect(screen.queryByText('* Erro ao criar a pergunta. Tente novamente.')).toBeNull()
  })

  it('shows a loader and locks the feedback type while creating', async () => {
    let resolve: (value: unknown) => void = () => undefined
    http.post.mockReturnValue(new Promise((done) => (resolve = done)))
    const { container } = open()
    await fillTextQuestion(container)

    await submit()

    await waitFor(() => expect(container.querySelector('.loadingContainer')).not.toBeNull())
    expect((screen.getByLabelText('Tipo do Feedback:') as HTMLSelectElement).disabled).toBe(true)
    resolve({ status: 201, data: { code: 'abc123', statsKey: 'secret' } })
    await screen.findByText('Link público pra compartilhar')
    expect((screen.getByLabelText('Tipo do Feedback:') as HTMLSelectElement).disabled).toBe(false)
  })
})

describe('Create page link feedback', () => {
  const chooseLink = async (container: HTMLElement): Promise<HTMLInputElement> => {
    await waitForEditors(container, 2)
    await user.selectOptions(screen.getByLabelText('Tipo do Feedback:'), 'link')
    return screen.getByPlaceholderText('Digite um Link https') as HTMLInputElement
  }

  it('swaps the feedback editor for a link field', async () => {
    const { container } = open()

    const input = await chooseLink(container)

    expect(input).toBeTruthy()
    expect(editors(container)).toHaveLength(1)
    expect(screen.getByText('Link do Feedback:')).toBeTruthy()
  })

  it('always keeps the https prefix on what is typed', async () => {
    const { container } = open()
    const input = await chooseLink(container)

    await user.type(input, 'example.com')
    expect(input.value).toBe('https://example.com')
    fireEvent.change(input, { target: { value: 'https://other.io' } })

    expect(input.value).toBe('https://other.io')
  })

  it('disables the test button until there is a link and then opens it safely', async () => {
    const open_ = vi.spyOn(window, 'open').mockImplementation(() => null)
    const { container } = open()
    const input = await chooseLink(container)
    const test = screen.getByRole('button', { name: 'Testar' }) as HTMLButtonElement
    expect(test.disabled).toBe(true)

    await user.type(input, 'example.com')
    await user.click(test)

    expect(test.disabled).toBe(false)
    expect(open_).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer')
  })

  it('creates a link question', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'lnk1', statsKey: 'sk' } })
    const { container } = open()
    const [question] = await waitForEditors(container, 2)
    await typeInto(question, 'Quer sair comigo?')
    const input = await chooseLink(container)
    await user.type(input, 'example.com')

    await submit()

    await screen.findByText('Link público pra compartilhar')
    expect(posted().answer).toBe('https://example.com')
    expect(posted().answerType).toBe('link')
  })

  it('forgets the previous feedback when the type changes', async () => {
    const { container } = open()
    const [, answer] = await waitForEditors(container, 2)
    await typeInto(answer, 'texto antigo')

    await chooseLink(container)
    await user.selectOptions(screen.getByLabelText('Tipo do Feedback:'), 'text')

    const fresh = await waitForEditors(container, 2)
    expect(fresh[1].textContent).toBe('')
  })
})

describe('Create page youtube feedback', () => {
  it('previews the video once a youtube link is typed', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
    const { container } = open()
    await waitForEditors(container, 2)
    await user.selectOptions(screen.getByLabelText('Tipo do Feedback:'), 'video')
    expect(screen.getByText('Link do Youtube:')).toBeTruthy()
    expect(container.querySelector('iframe')).toBeNull()

    await user.type(screen.getByPlaceholderText('Digite um Link do Youtube'), 'youtube.com/watch?v=dQw4w9WgXcQ')

    await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull())
    expect(container.querySelector('iframe')?.getAttribute('src')).toContain('dQw4w9WgXcQ')
  })

  it('creates a video question', async () => {
    http.post.mockResolvedValue({ status: 201, data: { code: 'vid1', statsKey: 'sk' } })
    const { container } = open()
    const [question] = await waitForEditors(container, 2)
    await typeInto(question, 'Quer sair comigo?')
    await user.selectOptions(screen.getByLabelText('Tipo do Feedback:'), 'video')
    await user.type(screen.getByPlaceholderText('Digite um Link do Youtube'), 'youtube.com/watch?v=dQw4w9WgXcQ')

    await submit()

    await screen.findByText('Link público pra compartilhar')
    expect(posted().answerType).toBe('video')
    expect(posted().answer).toBe('https://youtube.com/watch?v=dQw4w9WgXcQ')
  })
})
