const emptyRects = (): DOMRectList => {
  const list: DOMRect[] = []
  return Object.assign(list, { item: (index: number) => list[index] ?? null }) as unknown as DOMRectList
}

export const installProseMirrorDomShims = (): void => {
  if (!document.elementFromPoint) document.elementFromPoint = () => null
  if (!Range.prototype.getClientRects) Range.prototype.getClientRects = emptyRects
  if (!Range.prototype.getBoundingClientRect) Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0)
}
