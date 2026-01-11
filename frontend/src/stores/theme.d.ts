export interface ThemeColors {
  primary: string
  secondary: string
  tertiary: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  borderPrimary: string
  borderSecondary: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ChartTheme {
  backgroundColor: string
  textColor: string
  gridColor: string
  tooltipBg: string
  tooltipText: string
  axisColor: string
}

export interface ThemeStore {
  isDarkMode: import('vue').Ref<boolean>
  isSystemPreference: import('vue').Ref<boolean>
  systemPrefersDark: import('vue').Ref<boolean>
  isHighContrast: import('vue').Ref<boolean>
  prefersReducedMotion: import('vue').Ref<boolean>
  currentTheme: import('vue').ComputedRef<'dark' | 'light'>
  themeIcon: import('vue').ComputedRef<string>
  themeName: import('vue').ComputedRef<string>
  initializeTheme: () => void
  toggleTheme: () => void
  setTheme: (theme: 'dark' | 'light') => void
  useSystemPreference: () => void
  resetToSystem: () => void
  getThemeClasses: (lightClasses: string, darkClasses: string) => string
  getThemeColors: () => ThemeColors
  getChartTheme: () => ChartTheme
  toggleHighContrast: () => void
  initializeHighContrast: () => void
  initializeMotionPreference: () => void
}

export declare const useThemeStore: () => ThemeStore

export interface ThemeComposable extends ThemeStore {
  isDark: import('vue').ComputedRef<boolean>
  isLight: import('vue').ComputedRef<boolean>
  bgClass: import('vue').ComputedRef<string>
  textClass: import('vue').ComputedRef<string>
  borderClass: import('vue').ComputedRef<string>
  cardClass: import('vue').ComputedRef<string>
  inputClass: import('vue').ComputedRef<string>
}

export declare const useTheme: () => ThemeComposable