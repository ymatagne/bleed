export const LOOP_FX_RATES = {
  BASIC: 0.47,
  PLUS: 0.27,
  POWER: 0.12,
} as const;

export const LOOP_FX_MARKUPS = {
  BASIC: LOOP_FX_RATES.BASIC / 100,
  PLUS: LOOP_FX_RATES.PLUS / 100,
  POWER: LOOP_FX_RATES.POWER / 100,
} as const;
