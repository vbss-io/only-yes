import { Editor } from '@/presentation/components/Editor'
import { renderWithProviders } from '@/test-support/presentation/providers'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

type User = ReturnType<typeof userEvent.setup>

const TOOLBAR = {
  undo: 0,
  redo: 1,
  bold: 2,
  italic: 3,
  strike: 4,
  highlight: 5,
  heading1: 8,
  alignLeft: 9,
  alignCenter: 10,
  alignRight: 11,
  heading2: 12,
  heading3: 13,
  bulletList: 14,
  orderedList: 15,
  blockquote: 16,
  clear: 18
} as const

const mount = async (content = '<p>hello</p>') => {
  const setContent = vi.fn()
  const user = userEvent.setup()
  const view = renderWithProviders(<Editor content={content} setContent={setContent} />)
  const prose = await waitFor(() => {
    const element = view.container.querySelector<HTMLElement>('.ProseMirror')
    if (!element) throw new Error('editor not mounted')
    return element
  })
  const buttons = (): HTMLButtonElement[] => Array.from(view.container.querySelectorAll<HTMLButtonElement>('button[type="button"]'))
  const html = (): string => setContent.mock.calls[setContent.mock.calls.length - 1]?.[0] as string
  const selectAll = async (): Promise<void> => {
    prose.focus()
    await user.keyboard('{Control>}a{/Control}')
  }
  const press = async (name: keyof typeof TOOLBAR): Promise<void> => {
    await user.click(buttons()[TOOLBAR[name]])
  }
  return { ...view, user, prose, buttons, html, selectAll, press, setContent }
}

const expectHtml = async (html: () => string, matcher: RegExp): Promise<void> => {
  await waitFor(() => expect(html()).toMatch(matcher))
}

describe('Editor toolbar formatting', () => {
  it.each([
    ['bold', /<strong>hello<\/strong>/],
    ['italic', /<em>hello<\/em>/],
    ['strike', /<s>hello<\/s>/],
    ['highlight', /<mark>hello<\/mark>/],
    ['heading1', /<h1>hello<\/h1>/],
    ['heading2', /<h2>hello<\/h2>/],
    ['heading3', /<h3>hello<\/h3>/],
    ['bulletList', /<ul><li><p>hello<\/p><\/li><\/ul>/],
    ['orderedList', /<ol><li><p>hello<\/p><\/li><\/ol>/],
    ['blockquote', /<blockquote><p>hello<\/p><\/blockquote>/]
  ] as const)('applies %s to the selection', async (name, expected) => {
    const editor = await mount()

    await editor.selectAll()
    await editor.press(name)

    await expectHtml(editor.html, expected)
  })

  it.each([
    ['alignCenter', /text-align: center/],
    ['alignRight', /text-align: right/]
  ] as const)('aligns the paragraph with %s', async (name, expected) => {
    const editor = await mount()

    await editor.selectAll()
    await editor.press(name)

    await expectHtml(editor.html, expected)
  })

  it('aligns back to the left', async () => {
    const editor = await mount('<p style="text-align: center">hello</p>')

    await editor.selectAll()
    await editor.press('alignLeft')

    await expectHtml(editor.html, /text-align: left/)
  })

  it('toggles a format off when pressed again', async () => {
    const editor = await mount()
    await editor.selectAll()

    await editor.press('bold')
    await expectHtml(editor.html, /<strong>/)
    await editor.press('bold')

    await expectHtml(editor.html, /^<p>hello<\/p>$/)
  })

  it('clears all formatting with the eraser button', async () => {
    const editor = await mount('<p><strong><em>hello</em></strong></p>')
    await editor.selectAll()

    await editor.press('clear')

    await expectHtml(editor.html, /^<p>hello<\/p>$/)
  })

  it('applies a text color from the color picker', async () => {
    const editor = await mount()
    await editor.selectAll()
    const inputs = editor.container.querySelectorAll<HTMLInputElement>('input[type="color"]')

    fireEvent.change(inputs[0], { target: { value: '#ff0000' } })

    await expectHtml(editor.html, /color: rgb\(255, 0, 0\)/)
  })

  it('applies a background color from the color picker', async () => {
    const editor = await mount()
    await editor.selectAll()
    const inputs = editor.container.querySelectorAll<HTMLInputElement>('input[type="color"]')

    fireEvent.change(inputs[1], { target: { value: '#00ff00' } })

    await expectHtml(editor.html, /background-color: rgb\(0, 255, 0\)/)
  })

  it('marks the toolbar button of the active format', async () => {
    const editor = await mount()
    const idle = editor.buttons()[TOOLBAR.bold].className
    await editor.selectAll()

    await editor.press('bold')

    await waitFor(() => expect(editor.buttons()[TOOLBAR.bold].className).not.toBe(idle))
    await editor.press('bold')
    await waitFor(() => expect(editor.buttons()[TOOLBAR.bold].className).toBe(idle))
  })

  it('carries the picked color on the brush button', async () => {
    const editor = await mount()
    await editor.selectAll()
    const inputs = editor.container.querySelectorAll<HTMLInputElement>('input[type="color"]')

    fireEvent.change(inputs[0], { target: { value: '#ff0000' } })

    await waitFor(() => expect(editor.buttons()[6].style.getPropertyValue('--color')).not.toBe(''))
  })
})

describe('Editor toolbar history', () => {
  it('undoes and redoes a change', async () => {
    const editor = await mount()
    await editor.selectAll()
    await editor.press('bold')
    await expectHtml(editor.html, /<strong>/)

    await editor.press('undo')
    await expectHtml(editor.html, /^<p>hello<\/p>$/)
    await editor.press('redo')

    await expectHtml(editor.html, /<strong>hello<\/strong>/)
  })
})

describe('Editor image dialog', () => {
  const submitButton = (dialog: HTMLElement): HTMLButtonElement => {
    let node = within(dialog).getByRole('textbox').parentElement
    while (node && !node.querySelector('button')) node = node.parentElement
    const button = node?.querySelector('button')
    if (!button) throw new Error('submit button missing')
    return button
  }

  const openDialog = async (editor: Awaited<ReturnType<typeof mount>>, user: User) => {
    const trigger = editor.container.querySelector<HTMLElement>('button[aria-haspopup="dialog"]')
    if (!trigger) throw new Error('image trigger missing')
    await user.click(trigger)
    return screen.findByRole('dialog')
  }

  it('opens a dialog asking for the image url', async () => {
    const editor = await mount()

    const dialog = await openDialog(editor, editor.user)

    expect(within(dialog).getByText('Adicionar Imagem')).toBeTruthy()
    expect(within(dialog).getByText('Insira uma URL válida para a imagem')).toBeTruthy()
  })

  it('inserts the image and closes the dialog', async () => {
    const editor = await mount()
    const dialog = await openDialog(editor, editor.user)

    await editor.user.type(within(dialog).getByRole('textbox'), 'https://img.test/a.png')
    await editor.user.click(submitButton(dialog))

    await expectHtml(editor.html, /<img src="https:\/\/img\.test\/a\.png"/)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('inserts nothing when the url is empty', async () => {
    const editor = await mount()
    const dialog = await openDialog(editor, editor.user)

    await editor.user.click(submitButton(dialog))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(editor.html ?? '').not.toContain('<img')
  })
})
