export interface Vec {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Vec, Size {}

export const distance = (a: Vec, b: Vec): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const clampToBounds = (
  position: Vec,
  size: Size,
  bounds: Size,
  margin = 0
): Vec => ({
  x: clamp(position.x, margin, Math.max(margin, bounds.width - size.width - margin)),
  y: clamp(position.y, margin, Math.max(margin, bounds.height - size.height - margin)),
});

export const rectCenter = (rect: Rect): Vec => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});
