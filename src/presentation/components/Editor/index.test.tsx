import { Editor } from '@/presentation/components/Editor'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const prose = (container: HTMLElement): HTMLElement => {
  const element = container.querySelector<HTMLElement>('.ProseMirror')
  if (!element) throw new Error('editor not mounted')
  return element
}

describe('Editor view mode', () => {
  it('renders the content read only without the toolbar', async () => {
    const { container } = renderWithProviders(<Editor content="<p>Hello <strong>world</strong></p>" viewMode />)

    await waitFor(() => expect(prose(container).textContent).toBe('Hello world'))
    expect(prose(container).getAttribute('contenteditable')).toBe('false')
    expect(prose(container).querySelector('strong')?.textContent).toBe('world')
    expect(container.querySelectorAll('button')).toHaveLength(0)
  })

  it('renders nothing editable when no content is given', async () => {
    const { container } = renderWithProviders(<Editor viewMode />)

    await waitFor(() => expect(prose(container)).toBeTruthy())
    expect(prose(container).textContent).toBe('')
  })

  it('does not call back when the content changes in view mode', async () => {
    const setContent = vi.fn()
    const { container } = renderWithProviders(<Editor content="<p>a</p>" setContent={setContent} viewMode />)
    await waitFor(() => expect(prose(container).textContent).toBe('a'))

    await userEvent.setup().type(prose(container), 'b')

    expect(setContent).not.toHaveBeenCalled()
  })

  it('embeds a youtube video sized to the container', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
    const { container } = renderWithProviders(<Editor videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" viewMode />)

    await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull())
    const iframe = container.querySelector('iframe') as HTMLIFrameElement
    expect(iframe.getAttribute('src')).toContain('youtube.com/embed/dQw4w9WgXcQ')
    expect(iframe.getAttribute('width')).toBe('570')
    expect(Number(iframe.getAttribute('height'))).toBeCloseTo((600 * 360) / 542, 0)
    expect(container.querySelector('.editorVideo')).not.toBeNull()
  })

  it('shows no video for a link that is not a youtube url', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(600)
    const { container } = renderWithProviders(<Editor videoUrl="https://example.com/not-a-video" viewMode />)

    await waitFor(() => expect(prose(container)).toBeTruthy())
    expect(container.querySelector('iframe')).toBeNull()
  })
})

describe('Editor edit mode', () => {
  it('shows the label, the toolbar and the error', async () => {
    const { container } = renderWithProviders(<Editor label="Pergunta:" error="A Pergunta é obrigatória." />)

    await waitFor(() => expect(prose(container)).toBeTruthy())
    expect(screen.getByText('Pergunta:')).toBeTruthy()
    expect(screen.getByText('A Pergunta é obrigatória.')).toBeTruthy()
    expect(container.querySelectorAll('button').length).toBeGreaterThan(10)
    expect(prose(container).getAttribute('contenteditable')).toBe('true')
  })

  it('shows the placeholder while empty', async () => {
    const { container } = renderWithProviders(<Editor placeholder="Digite a Pergunta" />)

    await waitFor(() => expect(container.querySelector('[data-placeholder]')?.getAttribute('data-placeholder')).toBe('Digite a Pergunta'))
  })

  it('reports the html of what the user types', async () => {
    const setContent = vi.fn()
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Editor content="" setContent={setContent} />)
    await waitFor(() => expect(prose(container)).toBeTruthy())

    await user.click(prose(container))
    await user.keyboard('Oi')

    await waitFor(() => expect(setContent).toHaveBeenLastCalledWith('<p>Oi</p>'))
  })

  it('does not fail when typing without a content callback', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Editor content="" />)
    await waitFor(() => expect(prose(container)).toBeTruthy())

    await user.click(prose(container))
    await user.keyboard('Oi')

    await waitFor(() => expect(prose(container).textContent).toBe('Oi'))
  })

  it('starts from the given html', async () => {
    const { container } = renderWithProviders(<Editor content="<h2>Title</h2><p>Body</p>" setContent={vi.fn()} />)

    await waitFor(() => expect(prose(container).querySelector('h2')?.textContent).toBe('Title'))
    act(() => undefined)
    expect(prose(container).querySelector('p')?.textContent).toBe('Body')
  })
})

describe('Editor keeps the plain feature set of the previous editor', () => {
  it('drops links and underline from loaded html and keeps the text', async () => {
    const { container } = renderWithProviders(
      <Editor content='<p>see <a href="https://example.com">the link</a> and <u>under</u> line</p>' viewMode />
    )

    await waitFor(() => expect(prose(container).textContent).toBe('see the link and under line'))
    expect(prose(container).querySelector('a')).toBeNull()
    expect(prose(container).querySelector('u')).toBeNull()
  })

  it('drops links and underline from pasted html', async () => {
    const setContent = vi.fn()
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Editor content="" setContent={setContent} />)
    await waitFor(() => expect(prose(container)).toBeTruthy())
    await user.click(prose(container))

    const html = '<p>go <a href="https://example.com">there</a> <u>now</u></p>'
    fireEvent.paste(prose(container), {
      clipboardData: { types: ['text/html'], getData: (type: string) => (type === 'text/html' ? html : '') },
    })

    await waitFor(() => expect(setContent).toHaveBeenCalled())
    const stored = setContent.mock.calls.at(-1)?.[0] as string
    expect(stored).toContain('go there now')
    expect(stored).not.toContain('<a')
    expect(stored).not.toContain('<u')
  })

  it('does nothing on Ctrl+U', async () => {
    const setContent = vi.fn()
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Editor content="" setContent={setContent} />)
    await waitFor(() => expect(prose(container)).toBeTruthy())
    await user.click(prose(container))

    await user.keyboard('{Control>}u{/Control}plain')

    await waitFor(() => expect(setContent).toHaveBeenLastCalledWith('<p>plain</p>'))
    expect(prose(container).querySelector('u')).toBeNull()
  })

  it('keeps a typed url as plain text', async () => {
    const setContent = vi.fn()
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Editor content="" setContent={setContent} />)
    await waitFor(() => expect(prose(container)).toBeTruthy())
    await user.click(prose(container))

    await user.keyboard('visit https://example.com now')

    await waitFor(() => expect(setContent).toHaveBeenLastCalledWith('<p>visit https://example.com now</p>'))
    expect(prose(container).querySelector('a')).toBeNull()
  })

  it('does not append an empty paragraph after a heading', async () => {
    const setContent = vi.fn()
    const user = userEvent.setup()
    const { container } = renderWithProviders(<Editor content="<h2>Title</h2>" setContent={setContent} />)
    await waitFor(() => expect(prose(container).querySelector('h2')).not.toBeNull())
    await user.click(prose(container))
    await user.keyboard('!')

    await waitFor(() => expect(setContent).toHaveBeenCalled())
    expect(setContent.mock.calls.at(-1)?.[0]).toMatch(/^<h2>[^<]*<\/h2>$/)
  })
})
