import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const palette = {
  ember: '#FF3C00',
  burnt: '#EC4E02',
  action: '#D92F00',
  coral: '#FF764C',
  peach: '#FFB199',
  canvas: '#FAF6F1',
  white: '#FFFFFF',
  ink: '#0E0E0F',
  charcoal: '#312E2E',
  slate: '#36373B',
  pewter: '#52545A',
  warmGray: '#6B6664',
  stone: '#898C94',
  sand: '#DFDDD8',
  driftwood: '#CBC7C3',
  fog: '#EFEFEF',
  dark: '#1A1919',
  success: '#1E7A4D',
  info: '#1D6FD1',
  warning: '#9A5B00',
  danger: '#B42318',
} as const;

export const semantic = {
  successSoft: '#E8F5EE',
  infoSoft: '#E8F2FF',
  warningSoft: '#FFF3E0',
  dangerSoft: '#FDECEA',
  neutralSoft: '#EFEFEF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
  hero: 40,
  screen: 48,
  empty: 64,
} as const;

export const radii = {
  input: 14,
  card: 20,
  feature: 28,
  sheet: 28,
  pill: 999,
} as const;

export const fonts = {
  display: 'DMSans_500Medium',
  displaySemibold: 'DMSans_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
} as const;

export const typography = {
  display: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.44,
  },
  h1: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.96,
  },
  h2: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.48,
  },
  h3: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  price: {
    fontFamily: fonts.bodySemibold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.18,
    fontVariant: ['tabular-nums'],
  },
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  overline: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  code: {
    fontFamily: fonts.bodySemibold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 3.24,
    fontVariant: ['tabular-nums'],
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export const layout = {
  screenGutter: 20,
  compactGutter: 16,
  maxContentWidth: 560,
  tabBarHeight: 56,
  stickyBarHeight: 72,
  touchTarget: 44,
  buttonHeight: 52,
  inputHeight: 52,
} as const;

export const shadows = {
  sheet: Platform.select<ViewStyle>({
    ios: {
      shadowColor: palette.ink,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),
  toast: Platform.select<ViewStyle>({
    ios: {
      shadowColor: palette.ink,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
} as const;

export type PaletteColor = keyof typeof palette;
export type SemanticColor = keyof typeof semantic;
export type TypographyVariant = keyof typeof typography;
