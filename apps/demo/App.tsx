import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  AuthContainer,
  AuthProvider,
  ForgotPasswordForm,
  LoginForm,
  MagicLinkForm,
  OTPForm,
  ResetPasswordForm,
  SignupForm,
  useAuth,
  type AuthConfig,
} from '@authabase/react'

type AuthTab = 'login' | 'signup' | 'otp' | 'magic-link' | 'forgot-password' | 'reset-password'
type EnabledMethods = NonNullable<AuthConfig['enabledMethods']>
type ConfigPreset = 'all' | 'email-only' | 'social-only' | 'otp-only'
type ThemePreset = 'default' | 'ocean' | 'sunset' | 'forest' | 'midnight' | 'graphite'

interface AuthTheme {
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

interface DemoState {
  useSupabaseCredentials: boolean
  useCustomOtpApi: boolean
  otpApiUrl: string
  otpVerifyApiUrl: string
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

const defaultTheme: AuthTheme = {
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

const themePresets: Record<ThemePreset, AuthTheme> = {
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

const defaultEnabledMethods: EnabledMethods = {
  email: true,
  google: true,
  github: true,
  otp: true,
}

const panelCardClass =
  'w-full rounded-lg border border-[var(--auth-border)] bg-[var(--auth-surface)] p-4 text-[var(--auth-fg)] shadow-sm'
const panelInputClass =
  'rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] px-3 py-2 text-sm text-[var(--auth-fg)] placeholder:text-[var(--auth-muted-fg)]'
const panelToggleClass = 'h-4 w-4 accent-[var(--auth-primary)]'
const panelSectionTitleClass =
  'text-xs font-medium uppercase tracking-[0.16em] text-[var(--auth-muted-fg)]'

function ToggleField({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-md border border-[var(--auth-border)] bg-[color-mix(in_srgb,var(--auth-surface)_92%,var(--auth-border))] px-3 py-2.5 text-sm">
      <input
        type="checkbox"
        className={`${panelToggleClass} mt-0.5`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block leading-5 text-[var(--auth-fg)]">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-4 text-[var(--auth-muted-fg)]">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

function AuthDemo({ demoState }: { demoState: DemoState }) {
  const [tab, setTab] = useState<AuthTab>('login')

  const mockRequestOTP = async (payload: {
    method: 'email' | 'phone'
    email?: string
    phone?: string
  }) => {
    const res = await fetch(demoState.otpApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { message?: string }).message ?? `Request failed: ${res.status}`)
    }
  }

  const mockVerifyOTP = async (payload: {
    method: 'email' | 'phone'
    email?: string
    phone?: string
    token: string
  }) => {
    const verifyUrl = demoState.otpVerifyApiUrl || demoState.otpApiUrl
    const res = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(
        (data as { message?: string }).message ?? `Verification failed: ${res.status}`
      )
    }

    return (await res.json()) as {
      id: string
      email?: string
      phone?: string
      user_metadata?: Record<string, unknown>
    }
  }

  const tabs = useMemo(
    () => [
      {
        id: 'login' as AuthTab,
        label: 'Sign In',
        enabled:
          Boolean(demoState.enabledMethods.email) ||
          Boolean(demoState.enabledMethods.google) ||
          Boolean(demoState.enabledMethods.github),
      },
      {
        id: 'signup' as AuthTab,
        label: 'Sign Up',
        enabled:
          Boolean(demoState.enabledMethods.email) ||
          Boolean(demoState.enabledMethods.google) ||
          Boolean(demoState.enabledMethods.github),
      },
      {
        id: 'otp' as AuthTab,
        label: 'OTP',
        enabled: Boolean(demoState.enabledMethods.otp),
      },
      {
        id: 'magic-link' as AuthTab,
        label: 'Magic Link',
        enabled: Boolean(demoState.enabledMethods.email),
      },
      {
        id: 'forgot-password' as AuthTab,
        label: 'Forgot Password',
        enabled: Boolean(demoState.enabledMethods.email),
      },
      {
        id: 'reset-password' as AuthTab,
        label: 'Reset Password',
        enabled: Boolean(demoState.enabledMethods.email),
      },
    ],
    [demoState.enabledMethods]
  )

  const availableTabs = tabs.filter((item) => item.enabled)

  useEffect(() => {
    if (!availableTabs.find((item) => item.id === tab) && availableTabs.length > 0) {
      setTab(availableTabs[0].id)
    }
  }, [availableTabs, tab])

  return (
    <AuthContainer title="Authentication Demo" subtitle="Try different authentication methods">
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--auth-border)] pb-2">
        {availableTabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`whitespace-nowrap px-4 py-2 font-medium transition-colors ${
              tab === item.id
                ? 'border-b-2 border-[var(--auth-primary)] text-[var(--auth-primary)]'
                : 'text-[var(--auth-muted-fg)] hover:text-[var(--auth-fg)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'login' && (
        <LoginForm
          onSuccess={(user) => alert(`Logged in as ${user.email}`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          showSignupLink={demoState.showSignupLink}
        />
      )}

      {tab === 'signup' && (
        <SignupForm
          onSuccess={(user) => alert(`Account created for ${user.email}`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          showLoginLink={demoState.showLoginLink}
          minPasswordLength={demoState.minPasswordLength}
          copy={{ passwordMismatch: demoState.passwordMismatchText }}
        />
      )}

      {tab === 'otp' && (
        <OTPForm
          onSuccess={(user) =>
            alert(`Logged in with OTP as ${user.email || user.phone || 'verified user'}`)
          }
          onError={(error) => alert(`Error: ${error.message}`)}
          onRequestOTP={demoState.useCustomOtpApi ? mockRequestOTP : undefined}
          onVerifyOTP={demoState.useCustomOtpApi ? mockVerifyOTP : undefined}
          enabledMethods={demoState.otpMethods}
          copy={{
            phoneHint: demoState.otpHintText,
            sendOtpButton: demoState.otpSendText,
          }}
          defaultMethod={
            demoState.otpMethods.phone && !demoState.otpMethods.email ? 'phone' : 'email'
          }
        />
      )}

      {tab === 'magic-link' && (
        <MagicLinkForm
          onSuccess={(email) => alert(`Magic link sent to ${email}. Check your inbox!`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          redirectTo={window.location.origin}
        />
      )}

      {tab === 'forgot-password' && (
        <ForgotPasswordForm
          onSuccess={(email) => alert(`Reset link sent to ${email}. Check your inbox!`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          redirectTo={window.location.origin}
        />
      )}

      {tab === 'reset-password' && (
        <ResetPasswordForm
          onSuccess={(user) => alert(`Password updated for ${user.email || 'your account'}`)}
          onError={(error) => alert(`Error: ${error.message}`)}
          minPasswordLength={demoState.minPasswordLength}
          copy={{ passwordMismatch: demoState.passwordMismatchText }}
        />
      )}
    </AuthContainer>
  )
}

function ProfileDemo({ demoState }: { demoState: DemoState }) {
  const { user, isLoading, error, signOut } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--auth-muted-fg)]">Loading...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="auth-error rounded-md border p-4">
            <p className="text-sm">
              <strong>Demo Mode:</strong> {error.message}
            </p>
            <p className="mt-1 text-xs opacity-90">
              Click on the tabs below to explore the component library.
            </p>
          </div>
        )}
        <AuthDemo demoState={demoState} />
      </div>
    )
  }

  return (
    <AuthContainer title="Profile">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-[var(--auth-muted-fg)]">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--auth-muted-fg)]">User ID</p>
          <p className="font-mono text-sm font-medium">{user.id}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full rounded-md bg-[var(--auth-danger-fg)] px-4 py-2 text-[var(--auth-primary-foreground)] transition-opacity hover:opacity-90"
        >
          Sign Out
        </button>
      </div>
    </AuthContainer>
  )
}

function ThemeControls({
  demoState,
  setDemoState,
}: {
  demoState: DemoState
  setDemoState: React.Dispatch<React.SetStateAction<DemoState>>
}) {
  const activeThemePreset = useMemo<ThemePreset | null>(() => {
    const entry = Object.entries(themePresets).find(
      ([, theme]) => JSON.stringify(theme) === JSON.stringify(demoState.theme)
    )
    return (entry?.[0] as ThemePreset | undefined) ?? null
  }, [demoState.theme])

  const themePresetButtonClass = (preset: ThemePreset) =>
    `rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
      activeThemePreset === preset
        ? 'border-[var(--auth-primary)] bg-[var(--auth-primary)] text-[var(--auth-primary-foreground)]'
        : 'border-[var(--auth-border)] bg-[var(--auth-surface)] text-[var(--auth-fg)] hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]'
    }`

  const setThemeValue = (key: keyof AuthTheme, value: string) => {
    setDemoState((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value,
      },
    }))
  }

  const applyThemePreset = (preset: ThemePreset) => {
    setDemoState((prev) => ({
      ...prev,
      theme: { ...themePresets[preset] },
    }))
  }

  const themeCssSnippet = useMemo(
    () => `:root {
  --auth-bg: ${demoState.theme.background};
  --auth-fg: ${demoState.theme.foreground};
  --auth-primary: ${demoState.theme.primary};
  --auth-primary-foreground: ${demoState.theme.primaryForeground};
  --auth-surface: ${demoState.theme.surface};
  --auth-border: ${demoState.theme.border};
  --auth-muted-fg: ${demoState.theme.mutedForeground};
  --auth-link: ${demoState.theme.link};
  --auth-link-hover: ${demoState.theme.linkHover};
  --auth-danger-bg: ${demoState.theme.dangerBackground};
  --auth-danger-fg: ${demoState.theme.dangerForeground};
  --auth-success-bg: ${demoState.theme.successBackground};
  --auth-success-fg: ${demoState.theme.successForeground};
}`,
    [demoState.theme]
  )

  return (
    <div className={panelCardClass}>
      <h2 className="mb-3 text-sm font-semibold text-[var(--auth-fg)]">Theme Controls</h2>
      <p className="mb-3 text-xs text-[var(--auth-muted-fg)]">
        Change the library&apos;s <span className="font-mono">--auth-*</span> variables live and
        copy the generated CSS into your app.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={themePresetButtonClass('default')}
          onClick={() => applyThemePreset('default')}
        >
          Default Theme
        </button>
        <button
          type="button"
          className={themePresetButtonClass('ocean')}
          onClick={() => applyThemePreset('ocean')}
        >
          Ocean Theme
        </button>
        <button
          type="button"
          className={themePresetButtonClass('sunset')}
          onClick={() => applyThemePreset('sunset')}
        >
          Sunset Theme
        </button>
        <button
          type="button"
          className={themePresetButtonClass('forest')}
          onClick={() => applyThemePreset('forest')}
        >
          Forest Theme
        </button>
        <button
          type="button"
          className={themePresetButtonClass('midnight')}
          onClick={() => applyThemePreset('midnight')}
        >
          Midnight (Dark)
        </button>
        <button
          type="button"
          className={themePresetButtonClass('graphite')}
          onClick={() => applyThemePreset('graphite')}
        >
          Graphite Theme
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeBackground">Background</label>
          <input
            id="themeBackground"
            type="color"
            value={demoState.theme.background}
            onChange={(e) => setThemeValue('background', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeForeground">Foreground</label>
          <input
            id="themeForeground"
            type="color"
            value={demoState.theme.foreground}
            onChange={(e) => setThemeValue('foreground', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themePrimary">Primary</label>
          <input
            id="themePrimary"
            type="color"
            value={demoState.theme.primary}
            onChange={(e) => setThemeValue('primary', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themePrimaryForeground">Primary Foreground</label>
          <input
            id="themePrimaryForeground"
            type="color"
            value={demoState.theme.primaryForeground}
            onChange={(e) => setThemeValue('primaryForeground', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeSurface">Surface</label>
          <input
            id="themeSurface"
            type="color"
            value={demoState.theme.surface}
            onChange={(e) => setThemeValue('surface', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeBorder">Border</label>
          <input
            id="themeBorder"
            type="color"
            value={demoState.theme.border}
            onChange={(e) => setThemeValue('border', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeLink">Link</label>
          <input
            id="themeLink"
            type="color"
            value={demoState.theme.link}
            onChange={(e) => setThemeValue('link', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeMuted">Muted Text</label>
          <input
            id="themeMuted"
            type="color"
            value={demoState.theme.mutedForeground}
            onChange={(e) => setThemeValue('mutedForeground', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeDangerBg">Error Background</label>
          <input
            id="themeDangerBg"
            type="color"
            value={demoState.theme.dangerBackground}
            onChange={(e) => setThemeValue('dangerBackground', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeDangerFg">Error Text</label>
          <input
            id="themeDangerFg"
            type="color"
            value={demoState.theme.dangerForeground}
            onChange={(e) => setThemeValue('dangerForeground', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
          <label htmlFor="themeSuccessBg">Success Background</label>
          <input
            id="themeSuccessBg"
            type="color"
            value={demoState.theme.successBackground}
            onChange={(e) => setThemeValue('successBackground', e.target.value)}
            className="h-10 w-full rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] p-1"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[var(--auth-muted-fg)]">
          Copy This CSS
        </p>
        <pre className="overflow-x-auto rounded-lg border border-[var(--auth-border)] bg-[var(--auth-fg)] p-4 text-xs text-[var(--auth-surface)]">
          <code>{themeCssSnippet}</code>
        </pre>
      </div>
    </div>
  )
}

function DemoControls({
  demoState,
  setDemoState,
}: {
  demoState: DemoState
  setDemoState: React.Dispatch<React.SetStateAction<DemoState>>
}) {
  const setEnabledMethod = (method: keyof EnabledMethods, enabled: boolean) => {
    setDemoState((prev) => ({
      ...prev,
      enabledMethods: {
        ...prev.enabledMethods,
        [method]: enabled,
      },
    }))
  }

  const applyPreset = (preset: ConfigPreset) => {
    setDemoState((prev) => {
      if (preset === 'email-only') {
        return {
          ...prev,
          enabledMethods: {
            email: true,
            google: false,
            github: false,
            otp: false,
          },
          showSignupLink: true,
          showLoginLink: true,
          otpMethods: {
            email: true,
            phone: true,
          },
          minPasswordLength: 8,
          passwordMismatchText: 'Passwords do not match',
          otpHintText: 'Use E.164 format, for example +14155552671',
          otpSendText: 'Send OTP',
        }
      }

      if (preset === 'social-only') {
        return {
          ...prev,
          enabledMethods: {
            email: false,
            google: true,
            github: true,
            otp: false,
          },
          showSignupLink: false,
          showLoginLink: false,
          otpMethods: {
            email: true,
            phone: true,
          },
          minPasswordLength: 8,
          passwordMismatchText: 'Passwords do not match',
          otpHintText: 'Use E.164 format, for example +14155552671',
          otpSendText: 'Send OTP',
        }
      }

      if (preset === 'otp-only') {
        return {
          ...prev,
          enabledMethods: {
            email: false,
            google: false,
            github: false,
            otp: true,
          },
          showSignupLink: false,
          showLoginLink: false,
          otpMethods: {
            email: true,
            phone: true,
          },
          minPasswordLength: 8,
          passwordMismatchText: 'Passwords do not match',
          otpHintText: 'Use E.164 format, for example +14155552671',
          otpSendText: 'Send OTP',
        }
      }

      return {
        ...prev,
        enabledMethods: { ...defaultEnabledMethods },
        showSignupLink: true,
        showLoginLink: true,
        otpMethods: {
          email: true,
          phone: true,
        },
        minPasswordLength: 8,
        passwordMismatchText: 'Passwords do not match',
        otpHintText: 'Use E.164 format, for example +14155552671',
        otpSendText: 'Send OTP',
      }
    })
  }

  const activePreset = useMemo<ConfigPreset>(() => {
    const { email, google, github, otp } = demoState.enabledMethods
    if (email && !google && !github && !otp) return 'email-only'
    if (!email && google && github && !otp) return 'social-only'
    if (!email && !google && !github && otp) return 'otp-only'
    return 'all'
  }, [demoState.enabledMethods])

  const presetButtonClass = (preset: ConfigPreset) =>
    `rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
      activePreset === preset
        ? 'border-[var(--auth-primary)] bg-[var(--auth-primary)] text-[var(--auth-primary-foreground)]'
        : 'border-[var(--auth-border)] bg-[var(--auth-surface)] text-[var(--auth-fg)] hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]'
    }`

  return (
    <div className={panelCardClass}>
      <h2 className="mb-3 text-sm font-semibold text-[var(--auth-fg)]">Demo Controls</h2>
      <p className="mb-3 text-xs text-[var(--auth-muted-fg)]">
        Configure auth methods, copy text, and validation behavior for the preview.
      </p>

      <div className="mb-6">
        <p className={`${panelSectionTitleClass} mb-3`}>Presets</p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
          <button
            type="button"
            className={presetButtonClass('all')}
            onClick={() => applyPreset('all')}
          >
            All Methods
          </button>
          <button
            type="button"
            className={presetButtonClass('email-only')}
            onClick={() => applyPreset('email-only')}
          >
            Email Only
          </button>
          <button
            type="button"
            className={presetButtonClass('social-only')}
            onClick={() => applyPreset('social-only')}
          >
            Social Only
          </button>
          <button
            type="button"
            className={presetButtonClass('otp-only')}
            onClick={() => applyPreset('otp-only')}
          >
            OTP Only
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <p className={`${panelSectionTitleClass} mb-3`}>Integration</p>
          <div className="space-y-2">
            <ToggleField
              checked={demoState.useSupabaseCredentials}
              onChange={(checked) =>
                setDemoState((prev) => ({
                  ...prev,
                  useSupabaseCredentials: checked,
                }))
              }
              label="Use Supabase credentials"
              description="Enable real Supabase auth instead of preview-only mode."
            />
            <ToggleField
              checked={demoState.useCustomOtpApi}
              onChange={(checked) =>
                setDemoState((prev) => ({
                  ...prev,
                  useCustomOtpApi: checked,
                }))
              }
              label="Use external OTP API callbacks"
              description="Route OTP request and verification through custom endpoints."
            />
          </div>
        </section>

        {demoState.useCustomOtpApi && (
          <section>
            <p className={`${panelSectionTitleClass} mb-3`}>OTP Endpoints</p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
                <label htmlFor="otpApiUrl">OTP API URL</label>
                <input
                  id="otpApiUrl"
                  type="url"
                  value={demoState.otpApiUrl}
                  onChange={(e) =>
                    setDemoState((prev) => ({
                      ...prev,
                      otpApiUrl: e.target.value,
                    }))
                  }
                  placeholder="https://your-api.example.com"
                  className={panelInputClass}
                />
              </div>
              <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
                <label htmlFor="otpVerifyApiUrl">OTP Verify API URL</label>
                <input
                  id="otpVerifyApiUrl"
                  type="url"
                  value={demoState.otpVerifyApiUrl}
                  onChange={(e) =>
                    setDemoState((prev) => ({
                      ...prev,
                      otpVerifyApiUrl: e.target.value,
                    }))
                  }
                  placeholder="https://your-api.example.com/verify (optional)"
                  className={panelInputClass}
                />
              </div>
              <p className="text-xs leading-5 text-[var(--auth-muted-fg)]">
                Requests use the OTP API URL. Verification falls back to that URL if the verify
                endpoint is empty.
              </p>
            </div>
          </section>
        )}

        <section>
          <p className={`${panelSectionTitleClass} mb-3`}>Enabled Methods</p>
          <div className="space-y-2">
            <ToggleField
              checked={Boolean(demoState.enabledMethods.email)}
              onChange={(checked) => setEnabledMethod('email', checked)}
              label="Email and password"
            />
            <ToggleField
              checked={Boolean(demoState.enabledMethods.google)}
              onChange={(checked) => setEnabledMethod('google', checked)}
              label="Google OAuth"
            />
            <ToggleField
              checked={Boolean(demoState.enabledMethods.github)}
              onChange={(checked) => setEnabledMethod('github', checked)}
              label="GitHub OAuth"
            />
            <ToggleField
              checked={Boolean(demoState.enabledMethods.otp)}
              onChange={(checked) => setEnabledMethod('otp', checked)}
              label="One-time password"
            />
          </div>
        </section>

        <section>
          <p className={`${panelSectionTitleClass} mb-3`}>OTP Options</p>
          <div className="space-y-2">
            <ToggleField
              checked={demoState.otpMethods.email}
              onChange={(checked) =>
                setDemoState((prev) => ({
                  ...prev,
                  otpMethods: {
                    ...prev.otpMethods,
                    email: checked,
                  },
                }))
              }
              label="Allow email OTP"
            />
            <ToggleField
              checked={demoState.otpMethods.phone}
              onChange={(checked) =>
                setDemoState((prev) => ({
                  ...prev,
                  otpMethods: {
                    ...prev.otpMethods,
                    phone: checked,
                  },
                }))
              }
              label="Allow phone OTP"
            />
          </div>
        </section>

        <section>
          <p className={`${panelSectionTitleClass} mb-3`}>Links</p>
          <div className="space-y-2">
            <ToggleField
              checked={demoState.showSignupLink}
              onChange={(checked) =>
                setDemoState((prev) => ({
                  ...prev,
                  showSignupLink: checked,
                }))
              }
              label="Show sign up link"
            />
            <ToggleField
              checked={demoState.showLoginLink}
              onChange={(checked) =>
                setDemoState((prev) => ({
                  ...prev,
                  showLoginLink: checked,
                }))
              }
              label="Show login link"
            />
          </div>
        </section>

        <section>
          <p className={`${panelSectionTitleClass} mb-3`}>Copy And Validation</p>
          <div className="space-y-4">
            <div className="flex flex-col gap-2 text-sm text-[var(--auth-fg)]">
              <label htmlFor="minPasswordLength">Min Password Length</label>
              <div className="flex items-center gap-3">
                <input
                  id="minPasswordLength"
                  type="range"
                  min={4}
                  max={32}
                  value={demoState.minPasswordLength}
                  onChange={(e) =>
                    setDemoState((prev) => ({
                      ...prev,
                      minPasswordLength: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[var(--auth-primary)]"
                />
                <input
                  type="number"
                  min={4}
                  max={32}
                  value={demoState.minPasswordLength}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (Number.isNaN(value)) return
                    setDemoState((prev) => ({
                      ...prev,
                      minPasswordLength: Math.min(32, Math.max(4, value)),
                    }))
                  }}
                  className="w-16 rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] px-2 py-1 text-xs text-[var(--auth-fg)]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
              <label htmlFor="passwordMismatchText">Password Mismatch Text</label>
              <input
                id="passwordMismatchText"
                type="text"
                value={demoState.passwordMismatchText}
                onChange={(e) =>
                  setDemoState((prev) => ({
                    ...prev,
                    passwordMismatchText: e.target.value,
                  }))
                }
                className={panelInputClass}
              />
            </div>

            <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
              <label htmlFor="otpHintText">OTP Hint Text</label>
              <input
                id="otpHintText"
                type="text"
                value={demoState.otpHintText}
                onChange={(e) =>
                  setDemoState((prev) => ({
                    ...prev,
                    otpHintText: e.target.value,
                  }))
                }
                className={panelInputClass}
              />
            </div>

            <div className="flex flex-col gap-1 text-sm text-[var(--auth-fg)]">
              <label htmlFor="otpSendText">OTP Button Text</label>
              <input
                id="otpSendText"
                type="text"
                value={demoState.otpSendText}
                onChange={(e) =>
                  setDemoState((prev) => ({
                    ...prev,
                    otpSendText: e.target.value,
                  }))
                }
                className={panelInputClass}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="rounded border border-[var(--auth-border)] bg-[var(--auth-surface)] px-3 py-1.5 text-xs font-medium text-[var(--auth-fg)] transition-colors hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
          onClick={() =>
            setDemoState({
              useSupabaseCredentials: false,
              useCustomOtpApi: false,
              otpApiUrl: '',
              otpVerifyApiUrl: '',
              enabledMethods: { ...defaultEnabledMethods },
              otpMethods: {
                email: true,
                phone: true,
              },
              minPasswordLength: 8,
              passwordMismatchText: 'Passwords do not match',
              otpHintText: 'Use E.164 format, for example +14155552671',
              otpSendText: 'Send OTP',
              showSignupLink: true,
              showLoginLink: true,
              theme: { ...defaultTheme },
            })
          }
        >
          Reset Defaults
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [demoState, setDemoState] = useState<DemoState>({
    useSupabaseCredentials: false,
    useCustomOtpApi: false,
    otpApiUrl: '',
    otpVerifyApiUrl: '',
    enabledMethods: { ...defaultEnabledMethods },
    minPasswordLength: 8,
    passwordMismatchText: 'Passwords do not match',
    otpHintText: 'Use E.164 format, for example +14155552671',
    otpSendText: 'Send OTP',
    otpMethods: {
      email: true,
      phone: true,
    },
    showSignupLink: true,
    showLoginLink: true,
    theme: { ...defaultTheme },
  })

  const demoThemeStyle = useMemo(
    () =>
      ({
        '--auth-bg': demoState.theme.background,
        '--auth-fg': demoState.theme.foreground,
        '--auth-primary': demoState.theme.primary,
        '--auth-primary-foreground': demoState.theme.primaryForeground,
        '--auth-surface': demoState.theme.surface,
        '--auth-border': demoState.theme.border,
        '--auth-muted-fg': demoState.theme.mutedForeground,
        '--auth-link': demoState.theme.link,
        '--auth-link-hover': demoState.theme.linkHover,
        '--auth-danger-bg': demoState.theme.dangerBackground,
        '--auth-danger-fg': demoState.theme.dangerForeground,
        '--auth-success-bg': demoState.theme.successBackground,
        '--auth-success-fg': demoState.theme.successForeground,
      }) as CSSProperties,
    [demoState.theme]
  )

  const authConfig: AuthConfig = {
    supabaseUrl: demoState.useSupabaseCredentials ? import.meta.env.VITE_SUPABASE_URL || '' : '',
    supabaseKey: demoState.useSupabaseCredentials ? import.meta.env.VITE_SUPABASE_KEY || '' : '',
    redirectUrl: window.location.origin,
    enabledMethods: demoState.enabledMethods,
    onAuthSuccess: () => {
      // Auth success
    },
    onAuthError: (error) => {
      console.error('Auth error:', error)
    },
  }

  const links = {
    npm: 'https://www.npmjs.com/package/%40authabase/react',
    github: 'https://github.com/jameshschuler/authabase',
    readme: 'https://github.com/jameshschuler/authabase/blob/main/README.md',
    contributing: 'https://github.com/jameshschuler/authabase/blob/main/CONTRIBUTING.md',
    changesets: 'https://github.com/jameshschuler/authabase/blob/main/changeset.md',
  }

  return (
    <div
      className="min-h-screen bg-[var(--auth-bg)] px-4 py-6 text-[var(--auth-fg)] sm:px-6"
      style={demoThemeStyle}
    >
      <div className="w-full space-y-8">
        <header className="rounded-xl border border-[var(--auth-border)] bg-[var(--auth-surface)] px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--auth-muted-fg)]">
                AuthABase
              </p>
              <h1 className="text-lg font-semibold text-[var(--auth-fg)]">@authabase/react Demo</h1>
            </div>
            <nav className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <a
                href={links.npm}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-[var(--auth-border)] px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                npm
              </a>
              <a
                href={links.github}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-[var(--auth-border)] px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                GitHub
              </a>
              <a
                href={links.readme}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-[var(--auth-border)] px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                README
              </a>
              <a
                href={links.contributing}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-[var(--auth-border)] px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                Contributing
              </a>
              <a
                href={links.changesets}
                target="_blank"
                rel="noreferrer"
                className="rounded border border-[var(--auth-border)] px-3 py-1.5 hover:bg-[color-mix(in_srgb,var(--auth-surface)_80%,var(--auth-border))]"
              >
                Changesets
              </a>
            </nav>
          </div>
        </header>

        <section className="rounded-xl border border-[var(--auth-border)] bg-[var(--auth-surface)] px-5 py-8 shadow-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--auth-muted-fg)]">
            React Authentication Component Library
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">@authabase/react</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--auth-muted-fg)] sm:text-base">
            Reusable React authentication components with Supabase integration, shadcn-style UI, and
            configurable auth methods. Use the live controls below to test flows, customize copy,
            and preview themes before integrating.
          </p>
        </section>

        <div className="grid w-full gap-6 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
          <aside className="order-1 xl:sticky xl:top-6 xl:self-start">
            <ThemeControls demoState={demoState} setDemoState={setDemoState} />
          </aside>

          <div className="order-2 min-w-0 xl:col-start-2 xl:justify-self-center xl:w-full">
            <AuthProvider config={authConfig}>
              <ProfileDemo demoState={demoState} />
            </AuthProvider>
          </div>

          <aside className="order-3 xl:sticky xl:top-6 xl:self-start">
            <DemoControls demoState={demoState} setDemoState={setDemoState} />
          </aside>
        </div>

        <footer className="rounded-xl border border-[var(--auth-border)] bg-[var(--auth-surface)] px-5 py-4 text-sm text-[var(--auth-muted-fg)] shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>
              Built with <span className="font-medium text-[var(--auth-fg)]">@authabase/react</span>{' '}
              for production-ready authentication UX.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={links.npm} target="_blank" rel="noreferrer" className="hover:underline">
                npm package
              </a>
              <a href={links.github} target="_blank" rel="noreferrer" className="hover:underline">
                GitHub repo
              </a>
              <a href={links.readme} target="_blank" rel="noreferrer" className="hover:underline">
                README
              </a>
              <a
                href={links.contributing}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Contributing guide
              </a>
              <a
                href={links.changesets}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Changeset log
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
