export type ColorTokens = {
  id: string;
  name: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceSolid: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  accentDeep: string;
  secondary: string;
  secondarySoft: string;
  white: string;
  muted: string;
  border: string;
  glassBorder: string;
  green: string;
  gradientTop: string;
  gradientMid: string;
  gradientBottom: string;
  shadow: string;
};

/** Modern LUMEXAI charcoal + electric blue/violet (default) */
export const LUMEX_MODERN: ColorTokens = {
  id: 'lumexModern',
  name: 'LUMEXAI Modern',
  background: '#0B0D12',
  backgroundAlt: '#12151C',
  surface: 'rgba(22, 26, 36, 0.88)',
  surfaceSolid: '#161A24',
  accent: '#5B8CFF',
  accentSoft: 'rgba(91, 140, 255, 0.16)',
  accentGlow: 'rgba(124, 92, 255, 0.45)',
  accentDeep: '#3A5FCC',
  secondary: '#A78BFA',
  secondarySoft: 'rgba(167, 139, 250, 0.14)',
  white: '#F4F6FA',
  muted: '#8B93A7',
  border: 'rgba(91, 140, 255, 0.28)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  green: '#34C759',
  gradientTop: 'rgba(91, 140, 255, 0.18)',
  gradientMid: 'rgba(30, 24, 56, 0.35)',
  gradientBottom: '#0B0D12',
  shadow: 'rgba(91, 140, 255, 0.22)',
};

export const COLOR_PALETTES: ColorTokens[] = [
  LUMEX_MODERN,
  {
    id: 'cyan',
    name: 'Electric Cyan',
    background: '#0A0F14',
    backgroundAlt: '#111A22',
    surface: 'rgba(18, 28, 38, 0.88)',
    surfaceSolid: '#121C26',
    accent: '#22D3EE',
    accentSoft: 'rgba(34, 211, 238, 0.14)',
    accentGlow: 'rgba(34, 211, 238, 0.4)',
    accentDeep: '#0E7490',
    secondary: '#67E8F9',
    secondarySoft: 'rgba(103, 232, 249, 0.12)',
    white: '#F0F9FF',
    muted: '#7A90A0',
    border: 'rgba(34, 211, 238, 0.28)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    green: '#34C759',
    gradientTop: 'rgba(34, 211, 238, 0.16)',
    gradientMid: 'rgba(8, 40, 55, 0.35)',
    gradientBottom: '#0A0F14',
    shadow: 'rgba(34, 211, 238, 0.22)',
  },
  {
    id: 'crimson',
    name: 'Crimson Lab',
    background: '#100A0C',
    backgroundAlt: '#1A1014',
    surface: 'rgba(36, 20, 26, 0.88)',
    surfaceSolid: '#1C1216',
    accent: '#FF4D6D',
    accentSoft: 'rgba(255, 77, 109, 0.14)',
    accentGlow: 'rgba(255, 77, 109, 0.4)',
    accentDeep: '#9F1239',
    secondary: '#FB7185',
    secondarySoft: 'rgba(251, 113, 133, 0.12)',
    white: '#FFF5F7',
    muted: '#A89098',
    border: 'rgba(255, 77, 109, 0.28)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    green: '#34C759',
    gradientTop: 'rgba(255, 77, 109, 0.16)',
    gradientMid: 'rgba(60, 16, 28, 0.35)',
    gradientBottom: '#100A0C',
    shadow: 'rgba(255, 77, 109, 0.22)',
  },
  {
    id: 'amber',
    name: 'Amber Core',
    background: '#100E0A',
    backgroundAlt: '#1A1610',
    surface: 'rgba(36, 30, 20, 0.88)',
    surfaceSolid: '#1C1810',
    accent: '#F59E0B',
    accentSoft: 'rgba(245, 158, 11, 0.14)',
    accentGlow: 'rgba(245, 158, 11, 0.38)',
    accentDeep: '#B45309',
    secondary: '#FBBF24',
    secondarySoft: 'rgba(251, 191, 36, 0.12)',
    white: '#FFFBEB',
    muted: '#A89878',
    border: 'rgba(245, 158, 11, 0.28)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    green: '#34C759',
    gradientTop: 'rgba(245, 158, 11, 0.14)',
    gradientMid: 'rgba(55, 40, 10, 0.35)',
    gradientBottom: '#100E0A',
    shadow: 'rgba(245, 158, 11, 0.22)',
  },
  {
    id: 'violet',
    name: 'Violet Signal',
    background: '#0D0B14',
    backgroundAlt: '#161222',
    surface: 'rgba(28, 24, 42, 0.88)',
    surfaceSolid: '#161222',
    accent: '#8B5CF6',
    accentSoft: 'rgba(139, 92, 246, 0.16)',
    accentGlow: 'rgba(139, 92, 246, 0.42)',
    accentDeep: '#6D28D9',
    secondary: '#C4B5FD',
    secondarySoft: 'rgba(196, 181, 253, 0.12)',
    white: '#F8F5FF',
    muted: '#958BA8',
    border: 'rgba(139, 92, 246, 0.28)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    green: '#34C759',
    gradientTop: 'rgba(139, 92, 246, 0.16)',
    gradientMid: 'rgba(40, 24, 70, 0.35)',
    gradientBottom: '#0D0B14',
    shadow: 'rgba(139, 92, 246, 0.22)',
  },
  {
    id: 'lime',
    name: 'Neon Lime',
    background: '#0B100C',
    backgroundAlt: '#121A14',
    surface: 'rgba(22, 32, 24, 0.88)',
    surfaceSolid: '#121A14',
    accent: '#A3E635',
    accentSoft: 'rgba(163, 230, 53, 0.14)',
    accentGlow: 'rgba(163, 230, 53, 0.35)',
    accentDeep: '#65A30D',
    secondary: '#BEF264',
    secondarySoft: 'rgba(190, 242, 100, 0.12)',
    white: '#F7FEE7',
    muted: '#8A9A7A',
    border: 'rgba(163, 230, 53, 0.28)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    green: '#34C759',
    gradientTop: 'rgba(163, 230, 53, 0.12)',
    gradientMid: 'rgba(28, 48, 16, 0.35)',
    gradientBottom: '#0B100C',
    shadow: 'rgba(163, 230, 53, 0.2)',
  },
  {
    id: 'steel',
    name: 'Steel White',
    background: '#0C0E12',
    backgroundAlt: '#151820',
    surface: 'rgba(24, 28, 36, 0.9)',
    surfaceSolid: '#151820',
    accent: '#E5E7EB',
    accentSoft: 'rgba(229, 231, 235, 0.1)',
    accentGlow: 'rgba(229, 231, 235, 0.22)',
    accentDeep: '#6B7280',
    secondary: '#9CA3AF',
    secondarySoft: 'rgba(156, 163, 175, 0.12)',
    white: '#F9FAFB',
    muted: '#9CA3AF',
    border: 'rgba(229, 231, 235, 0.18)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    green: '#34C759',
    gradientTop: 'rgba(180, 190, 205, 0.1)',
    gradientMid: 'rgba(28, 32, 40, 0.4)',
    gradientBottom: '#0C0E12',
    shadow: 'rgba(148, 163, 184, 0.16)',
  },
];

export const colors: ColorTokens = COLOR_PALETTES[0];

export const radii = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
};
