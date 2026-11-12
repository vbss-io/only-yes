import { BackColor } from '@/presentation/components/Editor/Extensions/BackColor'
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TextStyle } from '@tiptap/extension-text-style'
import { afterEach, describe, expect, it } from 'vitest'

let editor: Editor | undefined

const create = (content: string): Editor => {
  const instance = new Editor({ extensions: [Document, Paragraph, Text, TextStyle, BackColor], content })
  editor = instance
  return instance
}

afterEach(() => {
  editor?.destroy()
})

describe('BackColor extension', () => {
  it('sets a background color on the selection', () => {
    const instance = create('<p>hello</p>')

    instance.chain().selectAll().setBackColor('#ffcc00').run()

    expect(instance.getHTML()).toContain('background-color: rgb(255, 204, 0)')
    expect(instance.getAttributes('textStyle').backgroundColor).toBe('#ffcc00')
  })

  it('removes the background color and the empty span', () => {
    const instance = create('<p>hello</p>')
    instance.chain().selectAll().setBackColor('#ffcc00').run()

    instance.chain().selectAll().unsetBackColor().run()

    expect(instance.getHTML()).toBe('<p>hello</p>')
  })

  it('reads a background color from existing html', () => {
    const instance = create('<p><span style="background-color: rgb(1, 2, 3)">hello</span></p>')

    expect(instance.getHTML()).toContain('background-color: rgb(1, 2, 3)')
    instance.commands.selectAll()
    expect(instance.getAttributes('textStyle').backgroundColor).toBe('rgb(1, 2, 3)')
  })

  it('renders no style for a mark without a background color', () => {
    const instance = create('<p><span style="color: red">hello</span></p>')

    expect(instance.getHTML()).not.toContain('background-color')
  })
})
