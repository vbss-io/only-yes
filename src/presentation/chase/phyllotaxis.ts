import { Size, Vec, clampToBounds } from "@/presentation/chase/geometry";

const GOLDEN_ANGLE = (137.5 * Math.PI) / 180;

export const phyllotaxisPosition = (
  index: number,
  bounds: Size,
  itemSize: Size
): Vec => {
  const center = { x: bounds.width / 2, y: bounds.height / 2 };
  const spacing = Math.min(bounds.width, bounds.height) / 7.5;
  const angle = (index + 1) * GOLDEN_ANGLE;
  const radius = spacing * Math.sqrt(index + 1);
  return clampToBounds(
    {
      x: center.x + Math.cos(angle) * radius - itemSize.width / 2,
      y: center.y + Math.sin(angle) * radius - itemSize.height / 2,
    },
    itemSize,
    bounds,
    4
  );
};
