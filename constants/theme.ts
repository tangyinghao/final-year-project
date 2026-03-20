import { Platform } from 'react-native';

const colorScale = {
  white: '#FFFFFF',
  black: '#000000',
  brandPrimary: '#1B1C62',
  brandDanger: '#D71440',
  textSecondary: '#666666',
  textMuted: '#8E8E93',
  textStrongSecondary: '#4A4A4A',
  borderDefault: '#E5E5EA',
  surfaceMuted: '#F6F6F6',
  surfaceAlt: '#F2F2F7',
  surfaceInfo: '#EBF4FE',
  surfaceFeatured: '#DFF0FF',
  borderInfo: '#D0E6FC',
  iconDisabled: '#C7C7CC',
  success: '#24A148',
  successSurface: '#E6F9EC',
  warning: '#F57C00',
  warningSurface: '#FFF3E0',
  error: '#F87171',
  accentSaved: '#FFD700',
  overlayScrim: 'rgba(0,0,0,0.5)',
  overlayOnBrandSubtle: 'rgba(255,255,255,0.1)',
} as const;

export const Theme = {
  colors: {
    brand: {
      primary: colorScale.brandPrimary,
      danger: colorScale.brandDanger,
    },
    text: {
      primary: colorScale.black,
      secondary: colorScale.textSecondary,
      muted: colorScale.textMuted,
      strongSecondary: colorScale.textStrongSecondary,
      inverse: colorScale.white,
    },
    border: {
      default: colorScale.borderDefault,
      info: colorScale.borderInfo,
    },
    surface: {
      base: colorScale.white,
      muted: colorScale.surfaceMuted,
      alt: colorScale.surfaceAlt,
      info: colorScale.surfaceInfo,
      featured: colorScale.surfaceFeatured,
      success: colorScale.successSurface,
      warning: colorScale.warningSurface,
    },
    icon: {
      primary: colorScale.brandPrimary,
      muted: colorScale.textMuted,
      disabled: colorScale.iconDisabled,
      inverse: colorScale.white,
    },
    status: {
      success: colorScale.success,
      warning: colorScale.warning,
      error: colorScale.error,
    },
    overlay: {
      scrim: colorScale.overlayScrim,
      onBrandSubtle: colorScale.overlayOnBrandSubtle,
    },
    accent: {
      saved: colorScale.accentSaved,
    },
    input: {
      placeholder: colorScale.textMuted,
      authPlaceholder: colorScale.textMuted,
    },
  },
} as const;

export const Colors = {
  light: {
    text: Theme.colors.text.primary,
    background: Theme.colors.surface.base,
    tint: Theme.colors.brand.primary,
    icon: Theme.colors.icon.muted,
    tabIconDefault: Theme.colors.icon.muted,
    tabIconSelected: Theme.colors.icon.primary,
  },
  dark: {
    text: Theme.colors.text.primary,
    background: Theme.colors.surface.base,
    tint: Theme.colors.brand.primary,
    icon: Theme.colors.icon.muted,
    tabIconDefault: Theme.colors.icon.muted,
    tabIconSelected: Theme.colors.icon.primary,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
