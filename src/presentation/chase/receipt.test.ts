import { RECEIPT_HEIGHT, RECEIPT_WIDTH, drawReceipt, type ReceiptContent } from '@/presentation/chase/receipt'
import { stubCanvas2d, stubCanvasWithoutContext } from '@/test-support/presentation/canvas'
import { describe, expect, it } from 'vitest'

const content = (overrides: Partial<ReceiptContent> = {}): ReceiptContent => ({
  brand: 'Only Yes',
  question: 'Quer sair comigo?',
  title: 'Sim de primeira',
  attemptsLabel: 'Nem tentei fugir',
  durationLabel: '3s de resistência',
  footer: 'crie a sua em',
  site: 'yes.vbss.io',
  ...overrides
})

const drawnTexts = (context: ReturnType<typeof stubCanvas2d>): string[] => context.fillText.mock.calls.map((call) => call[0] as string)

describe('drawReceipt', () => {
  it('sizes the canvas to the 4:5 share format', () => {
    stubCanvas2d()
    const canvas = document.createElement('canvas')

    drawReceipt(canvas, content())

    expect(canvas.width).toBe(RECEIPT_WIDTH)
    expect(canvas.height).toBe(RECEIPT_HEIGHT)
    expect([RECEIPT_WIDTH, RECEIPT_HEIGHT]).toEqual([1080, 1350])
  })

  it('does nothing else when the context is unavailable', () => {
    stubCanvasWithoutContext()
    const canvas = document.createElement('canvas')

    expect(() => drawReceipt(canvas, content())).not.toThrow()
    expect(canvas.width).toBe(RECEIPT_WIDTH)
  })

  it('paints the gradient background across the whole canvas', () => {
    const context = stubCanvas2d()

    drawReceipt(document.createElement('canvas'), content())

    expect(context.createLinearGradient).toHaveBeenCalledWith(0, 0, RECEIPT_WIDTH, RECEIPT_HEIGHT)
    expect(context.addColorStop).toHaveBeenCalledWith(0, '#EC4899')
    expect(context.addColorStop).toHaveBeenCalledWith(1, '#7C3AED')
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, RECEIPT_WIDTH, RECEIPT_HEIGHT)
  })

  it('writes the brand, quoted question, title, labels, footer and site', () => {
    const context = stubCanvas2d()

    drawReceipt(document.createElement('canvas'), content())

    const texts = drawnTexts(context)
    expect(texts).toContain('Only Yes')
    expect(texts).toContain('“Quer sair comigo?”')
    expect(texts).toContain('Sim de primeira')
    expect(texts).toContain('Nem tentei fugir · 3s de resistência')
    expect(texts).toContain('crie a sua em')
    expect(texts).toContain('yes.vbss.io')
  })

  it('wraps a long question on several lines without exceeding four', () => {
    const context = stubCanvas2d()
    const question = Array.from({ length: 30 }, (_, i) => `palavra${i}`).join(' ')

    drawReceipt(document.createElement('canvas'), content({ question }))

    const lines = drawnTexts(context).filter((text) => text.includes('palavra'))
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.length).toBeLessThanOrEqual(4)
    lines.forEach((line) => expect(line.length * 10).toBeLessThanOrEqual(900 - 120 + 10))
  })

  it('truncates a question longer than four lines with an ellipsis', () => {
    const context = stubCanvas2d()
    const question = Array.from({ length: 200 }, (_, i) => `palavra${i}`).join(' ')

    drawReceipt(document.createElement('canvas'), content({ question }))

    const lines = drawnTexts(context).filter((text) => text.includes('palavra'))
    expect(lines).toHaveLength(4)
    expect(lines[3].endsWith('…')).toBe(true)
    expect(lines[0].endsWith('…')).toBe(false)
  })

  it('keeps a single word longer than the line on its own line', () => {
    const context = stubCanvas2d()
    const word = 'x'.repeat(120)

    drawReceipt(document.createElement('canvas'), content({ question: word }))

    expect(drawnTexts(context).some((text) => text.includes(word))).toBe(true)
  })

  it('wraps a long title in at most two lines', () => {
    const context = stubCanvas2d()
    const title = Array.from({ length: 40 }, () => 'teimosia').join(' ')

    drawReceipt(document.createElement('canvas'), content({ title }))

    const lines = drawnTexts(context).filter((text) => text.includes('teimosia'))
    expect(lines).toHaveLength(2)
    expect(lines[1].endsWith('…')).toBe(true)
  })

  it('draws the sparkles and the check badge', () => {
    const context = stubCanvas2d()

    drawReceipt(document.createElement('canvas'), content())

    expect(context.arc).toHaveBeenCalledWith(RECEIPT_WIDTH / 2, 150, 64, 0, Math.PI * 2)
    expect(context.fillRect.mock.calls.length).toBeGreaterThanOrEqual(41)
    expect(context.arcTo).toHaveBeenCalledTimes(4)
  })
})
