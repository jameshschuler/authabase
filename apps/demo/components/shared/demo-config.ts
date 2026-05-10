import type { AuthConfig } from '@authabase/react'

export type AuthTab =
  | 'login'
  | 'signup'
  | 'otp'
  | 'magic-link'
  | 'forgot-password'
  | 'reset-password'
export type EnabledMethods = NonNullable<AuthConfig['enabledMethods']>
export type ConfigPreset = 'all' | 'email-only' | 'social-only' | 'otp-only'
export type ThemePreset = 'default' | 'ocean' | 'sunset' | 'forest' | 'midnight' | 'graphite'

export interface AuthTheme {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  surface: string
  border: string
  mutedForeground: string
  link: string
  linkHover: string
  dangerBackground: string
  dangerForeground: string
  successBackground: string
  successForeground: string
}

export interface DemoState {
  useSupabaseCredentials: boolean
  useCustomOtpApi: boolean
  useCookieSessionHydration: boolean
  otpApiUrl: string
  otpVerifyApiUrl: string
  currentUserApiUrl: string
  enabledMethods: EnabledMethods
  minPasswordLength: number
  passwordMismatchText: string
  otpHintText: string
  otpSendText: string
  otpMethods: {
    email: boolean
    phone: boolean
  }
  showSignupLink: boolean
  showLoginLink: boolean
  theme: AuthTheme
}

export interface ApiCallResponse {
  timestamp: string
  method: string
  url: string
  status: number
  ok: boolean
  body: unknown
}

export interface ApiResponsesState {
  requestOtp: ApiCallResponse | null
  verifyOtp: ApiCallResponse | null
  currentUser: ApiCallResponse | null
}

export const defaultTheme: AuthTheme = {
  background: '#f8fafc',
  foreground: '#171717',
  primary: '#171717',
  primaryForeground: '#ffffff',
  surface: '#ffffff',
  border: '#e5e7eb',
  mutedForeground: '#737373',
  link: '#171717',
  linkHover: '#000000',
  dangerBackground: '#fef2f2',
  dangerForeground: '#dc2626',
  successBackground: '#f0fdf4',
  successForeground: '#166534',
}

export const themePresets: Record<ThemePreset, AuthTheme> = {
  default: defaultTheme,
  ocean: {
    background: '#f0fdfa',
    foreground: '#0f172a',
    primary: '#0f766e',
    primaryForeground: '#f0fdfa',
    surface: '#f8fafc',
    border: '#99f6e4',
    mutedForeground: '#475569',
    link: '#0f766e',
    linkHover: '#115e59',
    dangerBackground: '#fef2f2',
    dangerForeground: '#b91c1c',
    successBackground: '#ecfeff',
    successForeground: '#155e75',
  },
  sunset: {
    background: '#fff7ed',
    foreground: '#431407',
    primary: '#c2410c',
    primaryForeground: '#fff7ed',
    surface: '#fffbeb',
    border: '#fdba74',
    mutedForeground: '#7c2d12',
    link: '#c2410c',
    linkHover: '#9a3412',
    dangerBackground: '#fff1f2',
    dangerForeground: '#be123c',
    successBackground: '#f0fdf4',
    successForeground: '#166534',
  },
  forest: {
    background: '#f0fdf4',
    foreground: '#052e16',
    primary: '#166534',
    primaryForeground: '#ecfdf5',
    surface: '#ffffff',
    border: '#86efac',
    mutedForeground: '#166534',
    link: '#166534',
    linkHover: '#14532d',
    dangerBackground: '#fef2f2',
    dangerForeground: '#b91c1c',
    successBackground: '#dcfce7',
    successForeground: '#166534',
  },
  midnight: {
    background: '#020617',
    foreground: '#e2e8f0',
    primary: '#38bdf8',
    primaryForeground: '#082f49',
    surface: '#0f172a',
    border: '#334155',
    mutedForeground: '#94a3b8',
    link: '#7dd3fc',
    linkHover: '#bae6fd',
    dangerBackground: '#3f1d2e',
    dangerForeground: '#fda4af',
    successBackground: '#062e2d',
    successForeground: '#5eead4',
  },
  graphite: {
    background: '#f3f4f6',
    foreground: '#111827',
    primary: '#111827',
    primaryForeground: '#f9fafb',
    surface: '#ffffff',
    border: '#d1d5db',
    mutedForeground: '#6b7280',
    link: '#1f2937',
    linkHover: '#111827',
    dangerBackground: '#fef2f2',
    dangerForeground: '#dc2626',
    successBackground: '#f0fdf4',
    successForeground: '#15803d',
  },
}

const demoEnv = import.meta.env
export const demoEnvDefaults = {
  otpApiUrl: demoEnv.VITE_DEMO_OTP_API_URL ?? '',
  otpVerifyApiUrl: demoEnv.VITE_DEMO_OTP_VERIFY_API_URL ?? '',
  currentUserApiUrl: demoEnv.VITE_DEMO_CURRENT_USER_API_URL ?? '',
}
export const defaultUseCookieSessionHydration = Boolean(demoEnvDefaults.currentUserApiUrl)

export const defaultEnabledMethods: EnabledMethods = {
  email: true,
  google: true,
  github: true,
  otp: true,
}

export const defaultOtpMethods = {
  email: true,
  phone: true,
} as const

export const defaultDemoCopy = {
  minPasswordLength: 8,
  passwordMismatchText: 'Passwords do not match',
  otpHintText: 'Use E.164 format, for example +14155552671',
  otpSendText: 'Send OTP',
} as const

export function createDefaultDemoState(): DemoState {
  return {
    useSupabaseCredentials: false,
    useCustomOtpApi: false,
    useCookieSessionHydration: defaultUseCookieSessionHydration,
    otpApiUrl: demoEnvDefaults.otpApiUrl,
    otpVerifyApiUrl: demoEnvDefaults.otpVerifyApiUrl,
    currentUserApiUrl: demoEnvDefaults.currentUserApiUrl,
    enabledMethods: { ...defaultEnabledMethods },
    minPasswordLength: defaultDemoCopy.minPasswordLength,
    passwordMismatchText: defaultDemoCopy.passwordMismatchText,
    otpHintText: defaultDemoCopy.otpHintText,
    otpSendText: defaultDemoCopy.otpSendText,
    otpMethods: { ...defaultOtpMethods },
    showSignupLink: true,
    showLoginLink: true,
    theme: { ...defaultTheme },
  }
}

export const panelCardClass =
  'w-full rounded-lg border border-[var(--auth-border)] bg-[var(--auth-surface)] p-4 text-[var(--auth-fg)] shadow-sm'
export const panelInputClass =
  'rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] px-3 py-2 text-sm text-[var(--auth-fg)] placeholder:text-[var(--auth-muted-fg)]'
export const panelToggleClass = 'h-4 w-4 accent-[var(--auth-primary)]'
export const panelSectionTitleClass =
  'text-xs font-medium uppercase tracking-[0.16em] text-[var(--auth-muted-fg)]'
