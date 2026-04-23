export const colors = {
  bg: '#05060f',
  bgDeep: '#020309',
  panel: 'rgba(14, 22, 48, 0.78)',
  panelSolid: '#0a1028',
  panelBorder: '#2a4b8a',
  panelBorderGlow: '#6ea8ff',

  cyan: '#5ee1ff',
  cyanSoft: '#89e8ff',
  cyanDim: '#2b7aa0',
  blue: '#3c7cff',
  blueDeep: '#1b3a80',
  violet: '#8a5cff',
  magenta: '#ff6bd6',

  text: '#e9f3ff',
  textDim: '#8fa7c9',
  textFaint: '#4f6a90',

  success: '#5ee1b1',
  danger: '#ff5a78',
  gold: '#ffd96a',

  overlay: 'rgba(3, 6, 18, 0.88)',
} as const;

export const rankColors: Record<string, string> = {
  E: '#7a8da8',
  D: '#5ee1b1',
  C: '#5ee1ff',
  B: '#8a5cff',
  A: '#ff6bd6',
  S: '#ffd96a',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
} as const;

export const fonts = {
  mono: 'Menlo',
} as const;

export const typography = {
  hud: { fontFamily: fonts.mono, letterSpacing: 2, textTransform: 'uppercase' as const },
};
