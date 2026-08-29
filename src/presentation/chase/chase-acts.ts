export interface ActState {
  act: 1 | 2 | 3;
  scale: number;
  tauntIndex: number | null;
  tremor: boolean;
}

const ACT_TWO_AT = 5;
const ACT_THREE_AT = 10;
const MIN_SCALE = 0.6;
const SCALE_STEP = 0.1;

export const TAUNT_COUNT = 5;

export const computeActState = (dodges: number): ActState => {
  if (dodges < ACT_TWO_AT) {
    return { act: 1, scale: 1, tauntIndex: null, tremor: false };
  }
  const scale = Math.max(MIN_SCALE, 1 - SCALE_STEP * (dodges - (ACT_TWO_AT - 1)));
  if (dodges < ACT_THREE_AT) {
    return {
      act: 2,
      scale,
      tauntIndex: (dodges - ACT_TWO_AT) % TAUNT_COUNT,
      tremor: true,
    };
  }
  return { act: 3, scale: MIN_SCALE, tauntIndex: null, tremor: true };
};
